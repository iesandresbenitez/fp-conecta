import type { Principal, AppRole, AccountStatus } from "./authorization.js";

type SupabaseStoreConfig = {
  url?: string;
  serviceRoleKey?: string;
  fetcher?: typeof fetch;
};

type Row = Record<string, unknown>;

function isRecord(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRows(value: unknown): Row[] {
  if (!Array.isArray(value) || !value.every(isRecord)) {
    throw new Error("Authorization store returned an invalid response");
  }
  return value;
}

/**
 * Resolves current authorization from Supabase's server-only REST API.
 * Requires a service-role key held only by the backend runtime. Never expose
 * this resolver or its key to browser code. Missing configuration and lookup
 * failures are handled fail-closed by the API.
 */
export function createSupabasePrincipalResolver(config: SupabaseStoreConfig = {
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}): ((subject: string) => Promise<Principal | null>) | undefined {
  const baseUrl = config.url?.replace(/\/+$/, "");
  const key = config.serviceRoleKey;
  if (!baseUrl || !key) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") return undefined;

  const fetcher = config.fetcher ?? fetch;

  async function select(table: string, query: Record<string, string>): Promise<Row[]> {
    const url = new URL(`${baseUrl}/rest/v1/${table}`);
    for (const [name, value] of Object.entries(query)) url.searchParams.set(name, value);
    const response = await fetcher(url, {
      method: "GET",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        accept: "application/json"
      },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error(`Authorization store request failed (${response.status})`);
    return asRows(await response.json());
  }

  return async (subject: string): Promise<Principal | null> => {
    if (!subject || subject.length > 512) return null;

    const users = await select("app_users", {
      select: "id,status",
      identity_subject: `eq.${subject}`,
      limit: "2"
    });
    if (users.length !== 1) return null;

    const user = users[0]!;
    if (typeof user.id !== "string" || typeof user.status !== "string") {
      throw new Error("Authorization store returned an invalid account");
    }
    const status = user.status as AccountStatus;
    if (!["pending", "active", "suspended", "disabled"].includes(status)) {
      throw new Error("Authorization store returned an unknown account status");
    }

    const userId = user.id;
    const [roleRows, linkRows, membershipRows] = await Promise.all([
      select("user_roles", {
        select: "role,cycle_id",
        user_id: `eq.${userId}`
      }),
      select("student_account_links", {
        select: "student_id",
        user_id: `eq.${userId}`,
        status: "eq.active",
        limit: "2"
      }),
      select("company_members", {
        select: "company_id",
        user_id: `eq.${userId}`
      })
    ]);

    if (linkRows.length > 1) throw new Error("Account has multiple active student links");

    const roles: Principal["roles"][number][] = [];
    for (const row of roleRows) {
      if (row.role === "admin_fp") {
        roles.push({ role: "admin_fp" });
      } else if (row.role === "tutor" && typeof row.cycle_id === "string") {
        roles.push({ role: "tutor", cycleId: row.cycle_id });
      } else if (row.role !== "company_user") {
        throw new Error("Authorization store returned an invalid role");
      }
    }

    // A company account is scoped only to validated companies; a membership
    // alone is not enough to grant access to a suspended or rejected company.
    for (const membership of membershipRows) {
      if (typeof membership.company_id !== "string") {
        throw new Error("Authorization store returned an invalid company membership");
      }
      const companies = await select("companies", {
        select: "id,status",
        id: `eq.${membership.company_id}`,
        limit: "2"
      });
      if (companies.length > 1) throw new Error("Duplicate company identifiers");
      if (companies.length === 1 && companies[0]!.status === "validated") {
        roles.push({ role: "company_user", companyId: membership.company_id });
      }
    }

    const studentId = linkRows.length === 1 && typeof linkRows[0]!.student_id === "string"
      ? linkRows[0]!.student_id
      : undefined;

    // Student access requires an active, center-created account link. A user
    // without any recognized role or student link is not an application user.
    if (roles.length === 0 && !studentId) return null;

    return {
      accountId: userId,
      status,
      roles,
      ...(studentId ? { studentId } : {})
    };
  };
}
