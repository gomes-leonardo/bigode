import { app } from "./app";
import { env } from "./infra/env/env";

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`🚀 Bigode ta rodando no http://localhost:${env.PORT}!`);
  })
  .catch((error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `❌ Porta ${env.PORT} já está em uso. Encerre o processo que está usando essa porta ou use outra porta.`,
      );
      console.error(
        `💡 Dica: Execute 'lsof -i :${env.PORT}' para ver qual processo está usando a porta.`,
      );
      process.exit(1);
    } else {
      console.error("❌ Erro ao iniciar o servidor:", error);
      process.exit(1);
    }
  });
