import { test, expect } from "@playwright/test";
import { novoComprador, totalCarrinho } from "./compra-ui.helpers.js";

test.describe.configure({ mode: "serial" });

const fmt = (n) => "R$ " + n.toFixed(2).replace(".", ",");

async function login(page, email, senha) {
  await page.goto("/login");
  await page.fill("input[type=email]", email);
  await page.fill("input[type=password]", senha);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/home/, { timeout: 15000 });
}

async function adicionarLivro(page, titulo) {
  await page.goto("/home");
  await page.waitForSelector("[data-testid^='card-livro-']", { timeout: 15000 });
  await page.fill("[data-testid='buscar-livros']", titulo);
  await page.waitForTimeout(600);
  const btn = page.getByTestId(/^adicionar-/).first();
  await btn.waitFor({ state: "visible", timeout: 5000 });
  await btn.click();
  await page.waitForTimeout(600);
  await page.fill("[data-testid='buscar-livros']", "");
}

test.describe("Compra pela tela — Criacao de Pedido (RF0031 a RF0038 / RN0031 a RN0036)", () => {
  let A, livros;

  test("00 setup: comprador, livros e login", async ({ page }) => {
    A = await novoComprador();
    const r = await page.request.get("http://127.0.0.1:8010/api/v1/livros?ativo=true");
    expect(r.status()).toBe(200);
    livros = (await r.json())
      .filter((l) => l.ativo && l.quantidade_estoque >= 5)
      .sort((a, b) => Number(b.valor_venda) - Number(a.valor_venda));
    expect(livros.length).toBeGreaterThanOrEqual(2);
    await login(page, A.email, A.senha);
    await expect(page.locator("text=Explorar")).toBeVisible();
  });

  test("01 carrinho: adicionar dois livros, alterar qtd, remover e re-adicionar (RF0031/RF0032)", async ({ page }) => {
    const [l1, l2] = livros;
    await login(page, A.email, A.senha);
    await adicionarLivro(page, l1.titulo);
    await adicionarLivro(page, l1.titulo);
    await adicionarLivro(page, l2.titulo);
    await page.goto("/carrinho");
    await expect(page.getByTestId("btn-finalizar")).toBeVisible();

    const cardL1 = page.getByTestId(/^item-carrinho-/).filter({ hasText: l1.titulo }).first();
    await cardL1.getByTestId(/^qtd-mais-/).click();
    await page.waitForTimeout(1000);
    await expect(cardL1.getByTestId(/^qtd-valor-/)).toHaveText("3");

    const cardL2 = page.getByTestId(/^item-carrinho-/).filter({ hasText: l2.titulo }).first();
    await cardL2.getByTestId(/^remover-/).click();
    await page.waitForTimeout(500);
    await adicionarLivro(page, l2.titulo);
    await page.goto("/carrinho");
    await expect(page.getByTestId(/^item-carrinho-/)).toHaveCount(2);

    const t = await totalCarrinho(A.token);
    await expect(page.getByTestId("subtotal")).toContainText(fmt(t.sub));
    await expect(page.getByTestId("frete")).toContainText(fmt(t.frete));
  });

  test("02 compra com endereco e cartao cadastrados + frete (RF0033/RF0034/RF0035/RF0036)", async ({ page }) => {
    await login(page, A.email, A.senha);
    await adicionarLivro(page, livros[0].titulo);
    await adicionarLivro(page, livros[1].titulo);
    await page.goto("/carrinho");
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await page.getByTestId(`endereco-${A.idEndereco}`).click();
    await page.waitForTimeout(500);

    const btnFrete = page.getByRole("button", { name: "Calcular Frete" });
    if (await btnFrete.isVisible().catch(() => false)) {
      await btnFrete.click();
      await page.waitForTimeout(800);
    }

    const c = await totalCarrinho(A.token);
    await page.getByTestId(`chip-cartao-${A.idCartao}`).click();
    await page.waitForTimeout(300);
    await page.getByTestId(`cartao-valor-${A.idCartao}`).fill(String(c.total));
    await page.waitForTimeout(500);
    await expect(page.getByTestId("pagamento-status")).toContainText("completo");

    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
  });
test("03 novo endereco e novo cartao durante a compra (RF0035/RN0023/RN0024/RN0025)", async ({ page }) => {
    const B = await novoComprador();
    await login(page, B.email, B.senha);
    await adicionarLivro(page, livros[0].titulo);
    await page.goto("/carrinho");
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });

    // Novo endereço pelo modal
    await page.getByTestId("novo-endereco").click();
    await page.fill("input[name='nome_identificador']", "Trabalho");
    await page.fill("input[name='logradouro']", "Av. Faria Lima");
    await page.fill("input[name='numero']", "1500");
    await page.fill("input[name='bairro']", "Itaim Bibi");
    await page.fill("input[name='cep']", "04538-132");
    await page.fill("input[name='cidade']", "Sao Paulo");
    await page.fill("input[name='estado']", "SP");
    await page.click("button:has-text('Salvar')");
    await page.waitForTimeout(500);

    // Novo cartão pelo modal
    await page.getByTestId("novo-cartao").click();
    await page.waitForSelector("select[name='id_bandeira']", { timeout: 5000 });
    await page.selectOption("select[name='id_bandeira']", { index: 0 });
    await page.fill("input[name='numero_cartao']", "4111111111111111");
    await page.fill("input[name='nome_impresso']", "Comprador UI");
    await page.fill("input[name='codigo_seguranca']", "789");
    await page.locator("button[type='submit']:has-text('Salvar')").click();
    await page.waitForTimeout(1000);

    // Paga com o novo cartão
    const c = await totalCarrinho(B.token);
    const el = page.locator("[data-testid^='cartao-valor-']").last();
    await el.waitFor({ state: "visible", timeout: 5000 });
    const attr = await el.getAttribute("data-testid");
    const idCartao = Number(attr.replace("cartao-valor-", ""));
    await page.getByTestId(`cartao-valor-${idCartao}`).fill(String(c.total));
    await page.waitForTimeout(500);
    await expect(page.getByTestId("pagamento-status")).toContainText("completo");

    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
  });

  test("04 dois cartoes, valor minimo R$ 10,00 por cartao (RN0034)", async ({ page }) => {
    const C = await novoComprador();
    await login(page, C.email, C.senha);
    await adicionarLivro(page, livros[0].titulo);
    await adicionarLivro(page, livros[1].titulo);
    await page.goto("/carrinho");
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await page.getByTestId(`endereco-${C.idEndereco}`).click();
    await page.waitForTimeout(500);

    const btnFrete = page.getByRole("button", { name: "Calcular Frete" });
    if (await btnFrete.isVisible().catch(() => false)) {
      await btnFrete.click();
      await page.waitForTimeout(800);
    }

    const c = await totalCarrinho(C.token);
    await page.getByTestId(`chip-cartao-${C.idCartao}`).click();
    await page.getByTestId(`chip-cartao-${C.idCartao2}`).click();
    await page.waitForTimeout(300);

    await page.getByTestId(`cartao-valor-${C.idCartao}`).fill("10");
    await page.getByTestId(`cartao-valor-${C.idCartao2}`).fill(String(c.total - 10));
    await page.waitForTimeout(500);
    await expect(page.getByTestId("pagamento-status")).toContainText("completo");

    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
  });

  test("05 cartao abaixo de R$ 10,00 com cupom cobrindo a maior parte (RN0035)", async ({ page }) => {
    const D = await novoComprador();
    await login(page, D.email, D.senha);
    const barato = livros[livros.length - 1];
    await adicionarLivro(page, barato.titulo);
    await page.goto("/carrinho");
    await page.getByTestId("cupom-input").fill("TESTETROCA");
    await page.getByTestId("cupom-aplicar").click();
    await page.waitForTimeout(500);
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await page.getByTestId(`endereco-${D.idEndereco}`).click();
    await page.waitForTimeout(500);

    const btnFrete = page.getByRole("button", { name: "Calcular Frete" });
    if (await btnFrete.isVisible().catch(() => false)) {
      await btnFrete.click();
      await page.waitForTimeout(800);
    }

    const c = await totalCarrinho(D.token);
    await page.getByTestId(`chip-cartao-${D.idCartao}`).click();
    await page.waitForTimeout(300);
    await page.getByTestId(`cartao-valor-${D.idCartao}`).fill(String(c.total));
    await page.waitForTimeout(500);

    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("codigo-pedido")).toBeVisible({ timeout: 15000 });
  });

  test("06 cupom de troca e promocional - apenas um promocional por compra (RN0033)", async ({ page }) => {
    const E = await novoComprador();
    await login(page, E.email, E.senha);
    await adicionarLivro(page, livros[0].titulo);
    await page.goto("/carrinho");
    await page.getByTestId("btn-finalizar").click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await page.getByRole("radio", { name: /TESTE - 15% de desconto/i }).check();
    await page.waitForTimeout(200);
    const r = page.getByRole("radio", { name: /PRIMEIRACOMPRA - 20% de desconto/i });
    await r.check();
    await page.waitForTimeout(200);
    await page.getByTestId(`endereco-${E.idEndereco}`).click();
    await page.waitForTimeout(500);

    const btnFrete = page.getByRole("button", { name: "Calcular Frete" });
    if (await btnFrete.isVisible().catch(() => false)) {
      await btnFrete.click();
      await page.waitForTimeout(800);
    }

    const c = await totalCarrinho(E.token);
    await page.getByTestId(`chip-cartao-${E.idCartao}`).click();
    await page.getByTestId(`cartao-valor-${E.idCartao}`).fill(String(c.total));
    await page.waitForTimeout(300);
    await page.getByTestId("confirmar-pedido").click();
    await expect(page.getByTestId("mensagem-checkout")).toBeVisible({ timeout: 5000 });
  });

  test("07 pedido finalizado aparece na tela de confirmacao", async ({ page }) => {
    await login(page, A.email, A.senha);
    await page.goto("/pedidos");
    await page.waitForTimeout(1500);
    await expect(page.locator("body")).toContainText("PED-");
  });
  });