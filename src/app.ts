import Fastify from "fastify";

export const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return { status: "operational" };
});
