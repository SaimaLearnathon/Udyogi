import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAuthRoutes } from "./modules/auth/routes.js";
import { registerConsultantRoutes } from "./modules/consultant/routes.js";
import { registerHealthRoutes } from "./modules/health/routes.js";
import { registerThesisRoutes } from "./modules/thesis/routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(registerHealthRoutes, { prefix: "/api" });
  app.register(registerAuthRoutes, { prefix: "/api" });
  app.register(registerConsultantRoutes, { prefix: "/api" });
  app.register(registerThesisRoutes, { prefix: "/api" });

  return app;
}
