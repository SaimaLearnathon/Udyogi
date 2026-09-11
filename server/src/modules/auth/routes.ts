import type { FastifyInstance } from "fastify";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (_request, reply) => {
    return reply.code(501).send({ message: "রেজিস্ট্রেশন এখনো টেমপ্লেট অবস্থায় আছে" });
  });

  app.post("/auth/login", async (_request, reply) => {
    return reply.code(501).send({ message: "লগইন এখনো টেমপ্লেট অবস্থায় আছে" });
  });

  app.post("/auth/logout", async () => ({ ok: true }));

  app.get("/profile", async (_request, reply) => {
    return reply.code(501).send({ message: "প্রোফাইল API এখনো টেমপ্লেট অবস্থায় আছে" });
  });

  app.patch("/profile", async (_request, reply) => {
    return reply.code(501).send({ message: "প্রোফাইল আপডেট এখনো টেমপ্লেট অবস্থায় আছে" });
  });
}
