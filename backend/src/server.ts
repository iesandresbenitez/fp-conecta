import { buildApp } from "./app.js";
import { createSupabasePrincipalResolver } from "./authorization-store.js";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "3001");
const app = buildApp({
  issuer: process.env.AUTH_ISSUER,
  audience: process.env.AUTH_AUDIENCE,
  jwksUrl: process.env.AUTH_JWKS_URL,
  logLevel: process.env.LOG_LEVEL ?? "info",
  resolvePrincipal: createSupabasePrincipalResolver()
});

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
