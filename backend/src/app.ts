import Fastify from "fastify";
import type { Principal } from "./authorization.js";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export type ApiConfig = {
  issuer?: string | undefined;
  audience?: string | undefined;
  jwksUrl?: string | undefined;
  logLevel?: string | undefined;
  resolvePrincipal?: ((subject: string) => Promise<Principal | null>) | undefined;
};

type VerifiedIdentity = {
  subject: string;
  issuer: string;
  claims: JWTPayload;
};

export function buildApp(config: ApiConfig = {
  issuer: process.env.AUTH_ISSUER,
  audience: process.env.AUTH_AUDIENCE,
  jwksUrl: process.env.AUTH_JWKS_URL,
  logLevel: process.env.LOG_LEVEL ?? "info"
}) {
  const { issuer, audience, jwksUrl, resolvePrincipal } = config;
  const app = Fastify({
    logger: config.logLevel === "silent" ? false : { level: config.logLevel ?? "info" },
    bodyLimit: 1024 * 1024,
    trustProxy: false
  });

  let remoteJwks: ReturnType<typeof createRemoteJWKSet> | undefined;
  if (issuer && audience && jwksUrl) {
    try {
      const parsed = new URL(jwksUrl);
      if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
        throw new Error("AUTH_JWKS_URL must use HTTPS outside localhost");
      }
      remoteJwks = createRemoteJWKSet(parsed);
    } catch (error) {
      app.log.error({ error }, "Invalid identity provider configuration");
    }
  }

  async function verifyBearer(header: string | undefined): Promise<VerifiedIdentity | null> {
    if (!issuer || !audience || !remoteJwks || !header?.startsWith("Bearer ")) return null;
    const token = header.slice("Bearer ".length).trim();
    if (!token) return null;

    const { payload } = await jwtVerify(token, remoteJwks, {
      issuer,
      audience,
      algorithms: ["RS256", "ES256"]
    });

    if (typeof payload.sub !== "string" || payload.sub.length === 0) return null;
    return { subject: payload.sub, issuer, claims: payload };
  }

  app.get("/health/live", async () => ({ status: "ok" }));

  app.get("/health/ready", async (_request, reply) => {
    if (!issuer || !audience || !remoteJwks) {
      return reply.code(503).send({
        status: "not_ready",
        reason: "identity_provider_not_configured"
      });
    }
    return { status: "ready" };
  });

  app.get("/api/v1/me", async (request, reply) => {
    if (!issuer || !audience || !remoteJwks) {
      return reply.code(503).send({ error: "identity_provider_not_configured" });
    }

    try {
      const identity = await verifyBearer(request.headers.authorization);
      if (!identity) return reply.code(401).send({ error: "unauthorized" });

      // Do not expose raw identity claims to the browser. Role/scope lookup and
      // authorization are intentionally not implemented yet; no business data
      // endpoints should be added until that layer exists.
      return { authenticated: true, subject: identity.subject };
    } catch {
      return reply.code(401).send({ error: "unauthorized" });
    }
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, requestId: request.id }, "Request failed");
    return reply.code(500).send({ error: "internal_server_error", requestId: request.id });
  });

  return app;
}
