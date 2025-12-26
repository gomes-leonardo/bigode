import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return {
    status: "operational",
    product: "BIGODE MVP",
    timestamp: new Date().toISOString(),
  };
});

const start = async () => {
  try {
    await app.listen({ port: 3333, host: "0.0.0.0" });
    console.log("🚀 BIGODE Server running on http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
