import { test, expect } from "@playwright/test";

test.describe("Health check e catálogo de livros", () => {
  test("GET /health responde ok", async ({ request }) => {
    const resposta = await request.get("/health");
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    expect(corpo.status).toBe("ok");
  });

  test("GET /api/v1/livros retorna uma lista", async ({ request }) => {
    const resposta = await request.get("/api/v1/livros");
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    expect(Array.isArray(corpo)).toBe(true);
  });
});

test.describe("Fluxo funcional de cliente", () => {
  const payload = {
    nome: "Cliente Teste Playwright",
    genero: "Não informado",
    data_nascimento: "2000-01-01",
    cpf: "111.222.333-44",
    telefone_tipo: "Celular",
    telefone_ddd: "11",
    telefone_numero: "999999999",
    email: "cliente.playwright@nexo.com",
    senha: "SenhaForte#123",
  };

  test("cadastro -> login -> consulta do próprio perfil", async ({ request }) => {
    const respostaCadastro = await request.post("/api/v1/clientes", { data: payload });
    expect([201, 409]).toContain(respostaCadastro.status());

    const respostaLogin = await request.post("/api/v1/auth/cliente/login", {
      data: { email: payload.email, senha: payload.senha },
    });
    expect(respostaLogin.status()).toBe(200);
    const { access_token } = await respostaLogin.json();

    const respostaPerfil = await request.get("/api/v1/clientes/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(respostaPerfil.status()).toBe(200);
    const perfil = await respostaPerfil.json();
    expect(perfil.email).toBe(payload.email);
  });
});
