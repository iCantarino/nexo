import { app } from "./app.js";
import { env } from "./config/env.js";
import { testConnection } from "./config/database.js";
import "./models/index.js"; // garante que as associações são registradas

async function bootstrap() {
  try {
    await testConnection();
    console.log("Conexão com o MySQL estabelecida com sucesso.");
  } catch (err) {
    console.error("Falha ao conectar ao banco de dados:", err.message);
    process.exit(1);
  }

  app.listen(env.app.port, () => {
    console.log(`Nexo API rodando em http://localhost:${env.app.port} (ambiente: ${env.app.nodeEnv})`);
  });
}

bootstrap();
