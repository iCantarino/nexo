import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./modules/auth/auth.routes.js";
import clientesRoutes from "./modules/clientes/clientes.routes.js";
import funcionariosRoutes from "./modules/funcionarios/funcionarios.routes.js";
import enderecosRoutes from "./modules/enderecos/enderecos.routes.js";
import cartoesRoutes from "./modules/cartoes/cartoes.routes.js";
import livrosRoutes from "./modules/livros/livros.routes.js";
import estoqueRoutes from "./modules/estoque/estoque.routes.js";
import carrinhoRoutes from "./modules/carrinho/carrinho.routes.js";
import pedidosRoutes from "./modules/pedidos/pedidos.routes.js";
import cuponsRoutes from "./modules/cupons/cupons.routes.js";
import trocasRoutes from "./modules/trocas/trocas.routes.js";
import avaliacoesRoutes from "./modules/avaliacoes/avaliacoes.routes.js";
import chatbotRoutes from "./modules/chatbot/chatbot.routes.js";
import analiseRoutes from "./modules/analise/analise.routes.js";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(express.json());
if (env.app.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", ambiente: env.app.nodeEnv });
});

const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/clientes", clientesRoutes);
apiRouter.use("/funcionarios", funcionariosRoutes);
apiRouter.use("/enderecos", enderecosRoutes);
apiRouter.use("/cartoes", cartoesRoutes);
apiRouter.use("/livros", livrosRoutes);
apiRouter.use("/livros/:idLivro/avaliacoes", avaliacoesRoutes);
apiRouter.use("/estoque", estoqueRoutes);
apiRouter.use("/carrinho", carrinhoRoutes);
apiRouter.use("/pedidos", pedidosRoutes);
apiRouter.use("/cupons", cuponsRoutes);
apiRouter.use("/trocas", trocasRoutes);
apiRouter.use("/chatbot", chatbotRoutes);
apiRouter.use("/analise", analiseRoutes);

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

