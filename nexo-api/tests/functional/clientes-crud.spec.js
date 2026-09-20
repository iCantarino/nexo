import { test, expect } from "@playwright/test";

test.describe.configure({ mode: 'serial' });
test.describe("CRUD Cliente - RF0021 a RF0028 / RN0021 a RN0028", () => {
  const uid = Date.now();
  const email = "cliente." + uid + "@nexo.com";
  const cpf = String(100+(uid%899)).padStart(3,"0") + "." + String(100+(uid%899)).padStart(3,"0") + "." + String(100+(uid%899)).padStart(3,"0") + "-" + String(10+(uid%89)).padStart(2,"0");
  const payload = { nome: "Cliente Teste", genero: "Masculino", data_nascimento: "1990-05-15", cpf: cpf, telefone_tipo: "Celular", telefone_ddd: "11", telefone_numero: "987654321", email: email, senha: "SenhaForte#123" };
  let token = "";
  let idCliente = 0;

  test("01 criar", async ({ request }) => {
    const r = await request.post("/api/v1/clientes", { data: payload });
    expect(r.status()).toBe(201);
    const c = await r.json(); idCliente = c.id_cliente;
  });
  test("02 email duplicado", async ({ request }) => {
    const r = await request.post("/api/v1/clientes", { data: payload });
    expect(r.status()).toBe(409);
  });
  test("03 campos obrigatorios", async ({ request }) => {
    const r = await request.post("/api/v1/clientes", { data: { email: "x@x.com" } });
    expect(r.status()).toBe(400);
  });
  test("04 senha fraca", async ({ request }) => {
    const r = await request.post("/api/v1/clientes", { data: { ...payload, email: "f."+uid+"@x.com", senha: "123" } });
    expect(r.status()).toBe(400);
  });
  test("05 login perfil", async ({ request }) => {
    const l = await request.post("/api/v1/auth/cliente/login", { data: { email, senha: payload.senha } });
    expect(l.status()).toBe(200);
    token = (await l.json()).access_token;
    const p = await request.get("/api/v1/clientes/me", { headers: { Authorization: "Bearer "+token } });
    expect(p.status()).toBe(200);
    expect((await p.json()).email).toBe(email);
  });
  test("06 admin consulta", async ({ request }) => {
    const a = await request.post("/api/v1/auth/funcionario/login", { data: { email: "admin@nexo.com", senha: "admin123" } });
    const t = (await a.json()).access_token;
    const q = await request.get("/api/v1/clientes?email="+email, { headers: { Authorization: "Bearer "+t } });
    expect(q.status()).toBe(200);
    expect((await q.json()).length).toBeGreaterThanOrEqual(1);
  });
  test("07 altera perfil", async ({ request }) => {
    const r = await request.patch("/api/v1/clientes/me", { headers: { Authorization: "Bearer "+token }, data: { nome: "Editado" } });
    expect(r.status()).toBe(200);
    expect((await r.json()).nome).toBe("Editado");
  });
  test("08 admin altera", async ({ request }) => {
    const a = await request.post("/api/v1/auth/funcionario/login", { data: { email: "admin@nexo.com", senha: "admin123" } });
    const t = (await a.json()).access_token;
    const r = await request.patch("/api/v1/clientes/"+idCliente, { headers: { Authorization: "Bearer "+t }, data: { nome: "Admin" } });
    expect(r.status()).toBe(200);
  });
  test("09 altera senha", async ({ request }) => {
    const r = await request.patch("/api/v1/clientes/me/senha", { headers: { Authorization: "Bearer "+token }, data: { senha_atual: "SenhaForte#123", nova_senha: "NovaForte#456" } });
    expect(r.status()).toBe(204);
    const l = await request.post("/api/v1/auth/cliente/login", { data: { email, senha: "NovaForte#456" } });
    expect(l.status()).toBe(200);
  });
  test("10 inativa", async ({ request }) => {
    const a = await request.post("/api/v1/auth/funcionario/login", { data: { email: "admin@nexo.com", senha: "admin123" } });
    const t = (await a.json()).access_token;
    const r = await request.patch("/api/v1/clientes/"+idCliente+"/inativar", { headers: { Authorization: "Bearer "+t } });
    expect(r.status()).toBe(204);
  });
  test("11 inativado nao loga", async ({ request }) => {
    const l = await request.post("/api/v1/auth/cliente/login", { data: { email, senha: "NovaForte#456" } });
    expect(l.status()).toBe(401);
  });
  test("12 reativa", async ({ request }) => {
    const a = await request.post("/api/v1/auth/funcionario/login", { data: { email: "admin@nexo.com", senha: "admin123" } });
    const t = (await a.json()).access_token;
    const r = await request.patch("/api/v1/clientes/"+idCliente+"/ativar", { headers: { Authorization: "Bearer "+t } });
    expect(r.status()).toBe(204);
  });
  test("13 exclui", async ({ request }) => {
    const a = await request.post("/api/v1/auth/funcionario/login", { data: { email: "admin@nexo.com", senha: "admin123" } });
    const t = (await a.json()).access_token;
    const r = await request.delete("/api/v1/clientes/"+idCliente, { headers: { Authorization: "Bearer "+t } });
    expect(r.status()).toBe(204);
  });
});
