import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAuthRoutes } from "./modules/auth/routes.js";
import { registerHealthRoutes } from "./modules/health/routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(registerHealthRoutes, { prefix: "/api" });
  app.register(registerAuthRoutes, { prefix: "/api" });

  return app;
}
