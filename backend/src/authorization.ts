export type AppRole = "admin_fp" | "tutor" | "company_user";

export type AccountStatus = "pending" | "active" | "suspended" | "disabled";

export type Principal = {
  accountId: string;
  status: AccountStatus;
  roles: ReadonlyArray<{
    role: AppRole;
    cycleId?: string;
    companyId?: string;
  }>;
  studentId?: string;
};

export type ResourceScope = {
  kind: "student" | "cycle" | "company" | "assignment" | "document" | "audit";
  studentId?: string;
  cycleId?: string;
  companyId?: string;
  archived?: boolean;
  operation: "read" | "create" | "update" | "delete" | "export" | "archive" | "admin";
  justifiedReason?: string;
};

export type AuthorizationDecision =
  | { allowed: true; reason: "authorized" }
  | {
      allowed: false;
      reason:
        | "invalid_context"
        | "account_not_active"
        | "no_matching_role"
        | "scope_mismatch"
        | "archived_record_restricted"
        | "justification_required"
        | "operation_restricted";
    };

/**
 * Pure, fail-closed policy helper. Call only after the server has loaded the
 * current account, roles, cycle/company memberships and resource from trusted
 * storage. Never construct Principal or ResourceScope from client-supplied
 * authorization claims. This helper does not itself query the database.
 */
export function authorize(principal: Principal | null, resource: ResourceScope | null): AuthorizationDecision {
  if (!principal || !resource || !principal.accountId || !Array.isArray(principal.roles)) {
    return { allowed: false, reason: "invalid_context" };
  }

  if (principal.status !== "active") {
    return { allowed: false, reason: "account_not_active" };
  }

  const roles = principal.roles;
  const isAdmin = roles.some((item) => item.role === "admin_fp");
  const tutorRoles = roles.filter((item) => item.role === "tutor");
  const companyRoles = roles.filter((item) => item.role === "company_user");
  const isStudent = Boolean(principal.studentId);

  // Resource identifiers must come from a server-side lookup. Missing scope
  // is not a wildcard, including for administrative operations.
  if (
    (resource.kind === "student" && !resource.studentId) ||
    (resource.kind === "cycle" && !resource.cycleId) ||
    (resource.kind === "company" && !resource.companyId)
  ) {
    return { allowed: false, reason: "invalid_context" };
  }

  if (resource.kind === "audit") {
    return isAdmin && resource.operation === "read"
      ? { allowed: true, reason: "authorized" }
      : { allowed: false, reason: "operation_restricted" };
  }

  if (resource.operation === "delete") {
    return { allowed: false, reason: "operation_restricted" };
  }

  // These resource classes need dedicated, data-backed policies before use.
  // Even administrators are denied until those policies are implemented.
  if (resource.kind === "document" || resource.kind === "assignment") {
    return { allowed: false, reason: "no_matching_role" };
  }

  if (resource.archived) {
    if (resource.operation !== "read") {
      return { allowed: false, reason: "archived_record_restricted" };
    }
    if (isAdmin && ["student", "cycle", "company"].includes(resource.kind)) {
    return { allowed: true, reason: "authorized" };
  }
    if (tutorRoles.length > 0) {
      if (!resource.cycleId || !tutorRoles.some((role) => role.cycleId === resource.cycleId)) {
        return { allowed: false, reason: "scope_mismatch" };
      }
      if (!resource.justifiedReason?.trim()) {
        return { allowed: false, reason: "justification_required" };
      }
      return { allowed: true, reason: "authorized" };
    }
    return { allowed: false, reason: "archived_record_restricted" };
  }

  if (isAdmin) return { allowed: true, reason: "authorized" };

  if (resource.kind === "student" || resource.studentId) {
    if (isStudent && principal.studentId && principal.studentId === resource.studentId && resource.operation === "read") {
      return { allowed: true, reason: "authorized" };
    }
    if (
      tutorRoles.some((role) => Boolean(resource.cycleId) && role.cycleId === resource.cycleId) &&
      (resource.operation === "read" || resource.operation === "create" || resource.operation === "update")
    ) {
      return { allowed: true, reason: "authorized" };
    }
    return { allowed: false, reason: "scope_mismatch" };
  }

  if (resource.kind === "company" || resource.companyId) {
    if (
      companyRoles.some((role) => Boolean(resource.companyId) && role.companyId === resource.companyId) &&
      (resource.operation === "read" || resource.operation === "create" || resource.operation === "update")
    ) {
      return { allowed: true, reason: "authorized" };
    }
    return { allowed: false, reason: "scope_mismatch" };
  }

  // The policy remains deny-by-default for resource types whose fine-grained
  // rules have not been explicitly implemented.
  return { allowed: false, reason: "no_matching_role" };
}
