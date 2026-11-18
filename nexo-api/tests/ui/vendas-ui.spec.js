import { test, expect } from "@playwright/test";
import { r2, comBanco, expirarBloqueio, definirEstoque, emitirCupom, novoComprador, totalCarrinho, estoqueDe } from "./vendas-ui.helpers.js";

test.describe.configure({ mode: "serial" });
const ADMIN = { email: "admin@nexo.com", senha: "admin123" };
const BASE = "http://127.0.0.1:8011/api/v1";

async function loginCliente(page, email, senha) {
  await page.goto("/login");
  await page.evaluate(() => { localStorage.removeItem("token"); localStorage.removeItem("user"); });
  await page.goto("/login");
  await page.waitForSelector("input[type=email]", { timeout: 10000 });
  await page.fill("input[type=email]", email);
  await page.fill("input[type=password]", senha);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/home/, { timeout: 15000 });
}
async function logout(page) {
  await page.goto("/login");
  await page.evaluate(() => { localStorage.removeItem("token"); localStorage.removeItem("user"); });
  await page.goto("/login");
  await page.waitForSelector("input[type=email]", { timeout: 10000 });
}
async function loginAdmin(page) {
  await page.goto("/login");
  await page.evaluate(() => { localStorage.removeItem("token"); localStorage.removeItem("user"); });
  await page.goto("/login");
  await page.waitForSelector("input[type=email]", { timeout: 10000 });
  await page.fill("input[type=email]", ADMIN.email);
  await page.fill("input[type=password]", ADMIN.senha);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin-dashboard/, { timeout: 15000 });
}
async function adicionarLivro(page, titulo) {
  await page.goto("/home");
  await page.waitForSelector("[data-testid^='card-livro-']", { timeout: 15000 });
  await page.fill("[data-testid='buscar-livros']", titulo);
  await page.waitForTimeout(600);
  await page.getByTestId(/^adicionar-/).first().click();
  await page.waitForTimeout(600);
  await page.fill("[data-testid='buscar-livros']", "");
}
async function checkoutComCartao(page, B, valorCartao) {
  await page.goto("/carrinho");
  await page.getByTestId("btn-finalizar").click();
  await page.waitForURL(/\/checkout/, { timeout: 10000 });
  await page.getByTestId("endereco-" + B.idEndereco).click();
  await page.waitForTimeout(500);
  var btn = page.getByRole("button", { name: "Calcular Frete" });
  if (await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForTimeout(800); }
  await page.getByTestId("chip-cartao-" + B.idCartao).click();
  await page.waitForTimeout(300);
  await page.getByTestId("cartao-valor-" + B.idCartao).fill(String(valorCartao));
  await page.waitForTimeout(500);
  await page.getByTestId("confirmar-pedido").click();
  await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
  var c = await page.getByTestId("codigo-pedido").textContent();
  return c.replace("C\u00f3digo: ", "").trim();
}
async function checkoutComDoisCartoes(page, B, valor1, valor2) {
  await page.goto("/carrinho");
  await page.getByTestId("btn-finalizar").click();
  await page.waitForURL(/\/checkout/, { timeout: 10000 });
  await page.getByTestId("endereco-" + B.idEndereco).click();
  await page.waitForTimeout(500);
  var btn = page.getByRole("button", { name: "Calcular Frete" });
  if (await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForTimeout(800); }
  await page.getByTestId("chip-cartao-" + B.idCartao).click();
  await page.getByTestId("chip-cartao-" + B.idCartao2).click();
  await page.waitForTimeout(300);
  await page.getByTestId("cartao-valor-" + B.idCartao).fill(String(valor1));
  await page.getByTestId("cartao-valor-" + B.idCartao2).fill(String(valor2));
  await page.waitForTimeout(500);
  await page.getByTestId("confirmar-pedido").click();
}
async function adminToken(request) {
  var r = await request.post(BASE + "/auth/funcionario/login", { data: ADMIN });
  expect(r.status()).toBe(200);
  return (await r.json()).access_token;
}

test.describe("UC Vendas Eletronicas", function() {
  var livros = [];
  var estoqueOriginal = new Map();
  var clienteTroca;

  test("00 setup", async ({ page }) => {
    var r = await page.request.get(BASE + "/livros?ativo=true");
    expect(r.status()).toBe(200);
    var ativos = (await r.json()).filter(function(l) { return l.ativo; });
    expect(ativos.length).toBeGreaterThan(1);
    for (var l of ativos) {
      estoqueOriginal.set(l.id_livro, l.quantidade_estoque);
      await definirEstoque(l.id_livro, Math.max(l.quantidade_estoque, 200));
    }
    livros = ativos.sort(function(a, b) { return Number(b.valor_venda) - Number(a.valor_venda); });
  });

  test.afterAll(async function() {
    for (var [idLivro, qtd] of estoqueOriginal) await definirEstoque(idLivro, qtd);
    await comBanco(function(c) { return c.query("DELETE ic FROM item_carrinho ic JOIN carrinho ca ON ca.id_carrinho = ic.id_carrinho JOIN cliente cl ON cl.id_cliente = ca.id_cliente WHERE cl.email LIKE 'vendasui.%@nexo.com'"); });
  });

  test("01 compra aprovada 1 cartao", async ({ page }) => {
    var B = await novoComprador();
    var livro = livros[0];
    var antes = await estoqueDe(livro.id_livro);
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livro.titulo);
    await adicionarLivro(page, livro.titulo);
    var c = await totalCarrinho(B.token);
    await checkoutComCartao(page, B, c.total);
    await expect(page.getByTestId("status-pedido")).toContainText(/Aprovad|APROVADA/i);
    expect(await estoqueDe(livro.id_livro)).toBe(antes - 2);
  });

  test("02 dois cartoes < R$10 bloqueado", async ({ page }) => {
    var B = await novoComprador();
    var livro = livros[0];
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livro.titulo);
    await adicionarLivro(page, livro.titulo);
    await adicionarLivro(page, livro.titulo);
    var c = await totalCarrinho(B.token);
    await checkoutComDoisCartoes(page, B, 5, r2(c.total - 5));
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toContainText(/10,00|minimo/i);
    await page.goto("/checkout");
    await page.waitForTimeout(500);
    await page.getByTestId("endereco-" + B.idEndereco).click();
    await page.waitForTimeout(500);
    var btn = page.getByRole("button", { name: "Calcular Frete" });
    if (await btn.isVisible().catch(function() { return false; })) { await btn.click(); await page.waitForTimeout(800); }
    await page.getByTestId("chip-cartao-" + B.idCartao).click();
    await page.getByTestId("chip-cartao-" + B.idCartao2).click();
    await page.waitForTimeout(300);
    await page.getByTestId("cartao-valor-" + B.idCartao).fill("10");
    await page.getByTestId("cartao-valor-" + B.idCartao2).fill(String(r2(c.total - 10)));
    await page.waitForTimeout(500);
    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("status-pedido")).toContainText(/Aprovad|APROVADA/i);
  });

  test("03 cupom promocional + cartao < R$10", async ({ page }) => {
    var B = await novoComprador();
    var livro = livros[0];
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livro.titulo);
    await adicionarLivro(page, livro.titulo);
    var c = await totalCarrinho(B.token);
    var valorCupom = r2(c.total - 5);
    var promo = await emitirCupom(B.idCliente, "PROMOCIONAL", valorCupom);
    await page.goto("/carrinho");
    await page.getByTestId("cupom-input").fill(promo);
    await page.getByTestId("cupom-aplicar").click();
    await page.waitForTimeout(500);
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await page.getByTestId("endereco-" + B.idEndereco).click();
    await page.waitForTimeout(500);
    var btn = page.getByRole("button", { name: "Calcular Frete" });
    if (await btn.isVisible().catch(function() { return false; })) { await btn.click(); await page.waitForTimeout(800); }
    await page.getByTestId("chip-cartao-" + B.idCartao).click();
    await page.waitForTimeout(300);
    await page.getByTestId("cartao-valor-" + B.idCartao).fill(String(r2(c.total - valorCupom)));
    await page.waitForTimeout(500);
    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("status-pedido")).toContainText(/Aprovad|APROVADA/i);
  });

test("04 cupons troca > compra", async ({ page }) => {
    var B = await novoComprador();
    var livro = livros[0];
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livro.titulo);
    await adicionarLivro(page, livro.titulo);
    var c = await totalCarrinho(B.token);
    var cupom = await emitirCupom(B.idCliente, "TROCA", r2(c.total * 1.2));
    await page.goto("/carrinho");
    await page.waitForTimeout(500);
    await page.getByTestId("dropdown-cupom-troca").click();
    await page.waitForTimeout(300);
    await page.getByTestId("troca-item-" + cupom).click();
    await page.waitForTimeout(500);
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await page.getByTestId("endereco-" + B.idEndereco).click();
    await page.waitForTimeout(500);
    var btn = page.getByRole("button", { name: "Calcular Frete" });
    if (await btn.isVisible().catch(function() { return false; })) { await btn.click(); await page.waitForTimeout(800); }
    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("status-pedido")).toContainText(/Aprovad|APROVADA/i);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("cupons-troca")).toContainText(/TROCO-/i);
  });

  test("05 compra REPROVADA", async ({ page }) => {
    var B = await novoComprador();
    var livro = livros[0];
    var antes = await estoqueDe(livro.id_livro);
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livro.titulo);
    await adicionarLivro(page, livro.titulo);
    var recusado = await fetch(BASE + "/cartoes", { method: "POST", headers: { Authorization: "Bearer " + B.token, "Content-Type": "application/json" }, body: JSON.stringify({ id_bandeira: 1, numero_cartao: "4000000000000000", nome_impresso: "Recusado", codigo_seguranca: "123" }) }).then(function(r) { return r.json(); });
    var c = await totalCarrinho(B.token);
    await page.goto("/carrinho");
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await page.getByTestId("endereco-" + B.idEndereco).click();
    await page.waitForTimeout(500);
    var btn = page.getByRole("button", { name: "Calcular Frete" });
    if (await btn.isVisible().catch(function() { return false; })) { await btn.click(); await page.waitForTimeout(800); }
    await page.getByTestId("chip-cartao-" + recusado.id_cartao).click();
    await page.waitForTimeout(300);
    await page.getByTestId("cartao-valor-" + recusado.id_cartao).fill(String(c.total));
    await page.waitForTimeout(500);
    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("status-pedido")).toContainText("REPROVADA");
    expect(await estoqueDe(livro.id_livro)).toBe(antes);
  });

  test("06 expiracao bloqueio", async ({ page }) => {
    var B = await novoComprador();
    var livroA = livros[0];
    var livroB = livros[1 % livros.length];
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livroA.titulo);
    await adicionarLivro(page, livroB.titulo);
    await page.goto("/carrinho");
    await page.waitForTimeout(800);
    await expect(page.getByTestId("btn-finalizar")).toBeEnabled();
    var cr = await fetch(BASE + "/carrinho", { headers: { Authorization: "Bearer " + B.token } });
    var ativos = (await cr.json()).itens.filter(function(i) { return !i.removido_por_expiracao; });
    await expirarBloqueio(ativos[0].id_item_carrinho);
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("btn-finalizar")).toBeDisabled();
    var btnR = page.getByText(/Adicionar novamente/i);
    if (await btnR.isVisible().catch(function() { return false; })) { await btnR.click(); await page.waitForTimeout(1000); }
    await expect(page.getByTestId("btn-finalizar")).toBeEnabled();
  });

test("07 admin despachar entregar", async ({ page, request }) => {
    var B = await novoComprador();
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livros[0].titulo);
    var c = await totalCarrinho(B.token);
    await checkoutComCartao(page, B, c.total);
    await expect(page.getByTestId("status-pedido")).toContainText(/Aprovad|APROVADA/i);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    var card = page.getByTestId(/^pedido-/).first();
    await expect(card).toBeVisible({ timeout: 5000 });
    var idMatch = (await card.getAttribute("data-testid")).match(/pedido-(\d+)/);
    var idPedido = Number(idMatch[1]);
    var token = await adminToken(request);
    await request.patch(BASE + "/pedidos/" + idPedido + "/despachar", { headers: { Authorization: "Bearer " + token } });
    await request.patch(BASE + "/pedidos/" + idPedido + "/confirmar-entrega", { headers: { Authorization: "Bearer " + token } });
    await loginAdmin(page);
    await page.goto("/admin-pedidos");
    await page.waitForTimeout(1000);
    await page.getByTestId("filtro-status").selectOption("ENTREGUE");
    await page.waitForTimeout(800);
    await expect(page.getByTestId("admin-pedido-" + idPedido)).toBeVisible({ timeout: 5000 });
    await loginCliente(page, B.email, B.senha);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    await expect(page.getByTestId(/^pedido-/).first()).toContainText("ENTREGUE");
  });

  test("08 troca nao ENTREGUE bloqueada", async ({ page }) => {
    var B = await novoComprador();
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livros[0].titulo);
    var c = await totalCarrinho(B.token);
    await checkoutComCartao(page, B, c.total);
    await expect(page.getByTestId("status-pedido")).toContainText(/Aprovad|APROVADA/i);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    await expect(page.getByTestId(/^pedido-/).first().getByText("Solicitar troca")).toHaveCount(0);
  });

  test("09 troca item e compra inteira", async ({ page, request }) => {
    var B = await novoComprador();
    await loginCliente(page, B.email, B.senha);
    await adicionarLivro(page, livros[0].titulo);
    await adicionarLivro(page, livros[0].titulo);
    await adicionarLivro(page, livros[1 % livros.length].titulo);
    var c = await totalCarrinho(B.token);
    await checkoutComCartao(page, B, c.total);
    await expect(page.getByTestId("status-pedido")).toContainText(/Aprovad|APROVADA/i);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    var card = page.getByTestId(/^pedido-/).first();
    await expect(card).toBeVisible({ timeout: 5000 });
    var idMatch = (await card.getAttribute("data-testid")).match(/pedido-(\d+)/);
    var idPedido = Number(idMatch[1]);
    var token = await adminToken(request);
    await request.patch(BASE + "/pedidos/" + idPedido + "/despachar", { headers: { Authorization: "Bearer " + token } });
    await request.patch(BASE + "/pedidos/" + idPedido + "/confirmar-entrega", { headers: { Authorization: "Bearer " + token } });
    await loginCliente(page, B.email, B.senha);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    await page.getByTestId("pedido-" + idPedido).getByText("Solicitar troca").click();
    await page.waitForTimeout(500);
    await expect(page.getByTestId("form-troca")).toBeVisible();
    await page.getByTestId("form-troca").locator("textarea").fill("Troca da compra inteira");
    await page.getByTestId("form-troca").getByText("Trocar a compra inteira").click();
    await page.waitForTimeout(1500);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("pedido-" + idPedido)).toContainText(/EM TROCA|TROCA|aguardando/i);
    clienteTroca = B;
  });

test("10 fluxo troca autorizacao notificacao recebimento cupom", async ({ page, request }) => {
    expect(clienteTroca).toBeTruthy();
    var livroTrocado = livros[0];
    var estoqueAntes = await estoqueDe(livroTrocado.id_livro);
    var token = await adminToken(request);
    var trocasResp = await request.get(BASE + "/trocas/admin/pendentes", { headers: { Authorization: "Bearer " + token } });
    expect(trocasResp.status()).toBe(200);
    var troca = (await trocasResp.json())[0];
    expect(troca).toBeTruthy();
    await request.patch(BASE + "/trocas/" + troca.id_troca + "/autorizar", { headers: { Authorization: "Bearer " + token } });
    await loginCliente(page, clienteTroca.email, clienteTroca.senha);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("notificacao")).toBeVisible({ timeout: 5000 });
    await request.patch(BASE + "/trocas/" + troca.id_troca + "/receber", { headers: { Authorization: "Bearer " + token } });
    expect(await estoqueDe(livroTrocado.id_livro)).toBeGreaterThan(estoqueAntes);
    await page.goto("/pedidos");
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("cupons-troca")).toContainText(/TROCA-/i);
    var ct = await page.getByTestId("cupons-troca").textContent();
    var m = ct.match(/(TROCA-\w+)/i);
    if (m) { clienteTroca.codigoCupomTroca = m[1]; }
  });

  test("11 cupom troca usado nova compra", async ({ page }) => {
    expect(clienteTroca.codigoCupomTroca).toBeTruthy();
    await loginCliente(page, clienteTroca.email, clienteTroca.senha);
    await adicionarLivro(page, livros[0].titulo);
    await page.goto("/carrinho");
    await page.waitForTimeout(500);
    await page.getByTestId("dropdown-cupom-troca").click();
    await page.waitForTimeout(300);
    await page.getByTestId("troca-item-" + clienteTroca.codigoCupomTroca).click();
    await page.waitForTimeout(500);
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await page.getByTestId("endereco-" + clienteTroca.idEndereco).click();
    await page.waitForTimeout(500);
    var btn = page.getByRole("button", { name: "Calcular Frete" });
    if (await btn.isVisible().catch(function() { return false; })) { await btn.click(); await page.waitForTimeout(800); }
    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("status-pedido")).toContainText(/Aprovad|APROVADA/i);
    var cr = await fetch(BASE + "/cupons/meus", { headers: { Authorization: "Bearer " + clienteTroca.token } });
    expect((await cr.json()).find(function(x) { return x.codigo_cupom === clienteTroca.codigoCupomTroca; }).utilizado).toBe(true);
    await adicionarLivro(page, livros[0].titulo);
    await page.goto("/carrinho");
    await page.waitForTimeout(500);
    await page.getByTestId("dropdown-cupom-troca").click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId("troca-item-" + clienteTroca.codigoCupomTroca)).toHaveCount(0);
  });
});