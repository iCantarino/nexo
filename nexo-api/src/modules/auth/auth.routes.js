import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { createAccessToken, verifyPassword } from "../../utils/security.js";
import { Cliente, Funcionario } from "../../models/index.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

router.post(
  "/cliente/login",
  asyncHandler(async (req, res) => {
    const { email, senha } = loginSchema.parse(req.body);
    const cliente = await Cliente.findOne({ where: { email } });
    if (!cliente || !cliente.ativo || !(await verifyPassword(senha, cliente.senha_hash))) {
      throw new HttpError(401, "Credenciais inválidas.");
    }
    const token = createAccessToken(cliente.id_cliente, { tipo: "cliente" });
    res.json({ access_token: token, token_type: "bearer", perfil: "CLIENTE", nome: cliente.nome });
  })
);

router.post(
  "/funcionario/login",
  asyncHandler(async (req, res) => {
    const { email, senha } = loginSchema.parse(req.body);
    const funcionario = await Funcionario.findOne({ where: { email } });
    if (!funcionario || !funcionario.ativo || !(await verifyPassword(senha, funcionario.senha_hash))) {
      throw new HttpError(401, "Credenciais inválidas.");
    }
    const token = createAccessToken(funcionario.id_funcionario, { tipo: "funcionario" });
    res.json({ access_token: token, token_type: "bearer", perfil: funcionario.perfil, nome: funcionario.nome });
  })
);

export default router;
