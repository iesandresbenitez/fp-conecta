import test from "node:test";
import assert from "node:assert/strict";
import { createSupabasePrincipalResolver } from "../src/authorization-store.js";

test("resolver is absent when server-only Supabase credentials are missing", () => {
  assert.equal(createSupabasePrincipalResolver({ url: "https://db.example.test" }), undefined);
  assert.equal(createSupabasePrincipalResolver({
    url: "http://db.example.test",
    serviceRoleKey: "test-only"
  }), undefined);
});

test("resolver loads account status and current tutor scope from trusted storage", async () => {
  const responses = [
    [{ id: "user-1", status: "active" }],
    [{ role: "tutor", cycle_id: "cycle-7" }],
    [],
    []
  ];
  const requested: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    requested.push(String(input));
    const body = responses.shift();
    if (!body) throw new Error("Unexpected request");
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };

  const resolve = createSupabasePrincipalResolver({
    url: "https://db.example.test",
    serviceRoleKey: "test-only-not-a-real-key",
    fetcher
  });
  assert.ok(resolve);
  const principal = await resolve("identity-subject-1");

  assert.deepEqual(principal, {
    accountId: "user-1",
    status: "active",
    roles: [{ role: "tutor", cycleId: "cycle-7" }]
  });
  assert.equal(requested.length, 4);
  assert.ok(requested[0]!.includes("identity_subject=eq.identity-subject-1"));
});

test("resolver rejects unknown or ambiguous account rows and propagates storage failures", async () => {
  const makeResolver = (body: unknown, status = 200) => createSupabasePrincipalResolver({
    url: "https://db.example.test",
    serviceRoleKey: "test-only-not-a-real-key",
    fetcher: async () => new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" }
    })
  })!;

  assert.equal(await makeResolver([])("missing-subject"), null);
  await assert.rejects(
    () => makeResolver([], 500)("identity-subject"),
    /Authorization store request failed/
  );
});

test("resolver refuses accounts without a recognized role or active student link", async () => {
  const responses = [
    [{ id: "user-2", status: "active" }],
    [],
    [],
    []
  ];
  const resolve = createSupabasePrincipalResolver({
    url: "https://db.example.test",
    serviceRoleKey: "test-only-not-a-real-key",
    fetcher: async () => new Response(JSON.stringify(responses.shift() ?? []), {
      status: 200,
      headers: { "content-type": "application/json" }
    })
  });
  assert.ok(resolve);
  assert.equal(await resolve("identity-subject-2"), null);
});
