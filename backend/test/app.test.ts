import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../dist/app.js";

test("live health endpoint is available without identity provider configuration", async (t) => {
  const app = buildApp({ logLevel: "silent" });
  t.after(async () => app.close());

  const response = await app.inject({ method: "GET", url: "/health/live" });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
});

test("readiness and identity endpoint fail closed when identity provider is not configured", async (t) => {
  const app = buildApp({ logLevel: "silent" });
  t.after(async () => app.close());

  const readiness = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(readiness.statusCode, 503);
  assert.deepEqual(readiness.json(), {
    status: "not_ready",
    reason: "identity_provider_not_configured"
  });

  const identity = await app.inject({ method: "GET", url: "/api/v1/me" });
  assert.equal(identity.statusCode, 503);
  assert.deepEqual(identity.json(), { error: "identity_provider_not_configured" });
});

test("configured identity provider stays unready until trusted authorization lookup exists", async (t) => {
  const app = buildApp({
    issuer: "https://identity.example.test/",
    audience: "fp-conecta-test",
    jwksUrl: "https://identity.example.test/.well-known/jwks.json",
    logLevel: "silent"
  });
  t.after(async () => app.close());

  const readiness = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(readiness.statusCode, 503);
  assert.deepEqual(readiness.json(), {
    status: "not_ready",
    reason: "authorization_store_not_configured"
  });

  const missing = await app.inject({ method: "GET", url: "/api/v1/me" });
  assert.equal(missing.statusCode, 401);
  assert.deepEqual(missing.json(), { error: "unauthorized" });

  const malformed = await app.inject({
    method: "GET",
    url: "/api/v1/me",
    headers: { authorization: "Bearer not-a-jwt" }
  });
  assert.equal(malformed.statusCode, 401);
  assert.deepEqual(malformed.json(), { error: "unauthorized" });
});

test("invalid remote JWKS URL leaves the API unready", async (t) => {
  const app = buildApp({
    issuer: "https://identity.example.test/",
    audience: "fp-conecta-test",
    jwksUrl: "http://jwks.example.test/keys",
    logLevel: "silent"
  });
  t.after(async () => app.close());

  const readiness = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(readiness.statusCode, 503);
});
