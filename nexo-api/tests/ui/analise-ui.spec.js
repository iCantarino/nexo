import { test, expect } from "@playwright/test";

/**
 * Tela de análise de vendas (RF0055, RNF0043). Usa a massa de seed (nexo-design/bdd/seeds):
 *   2025-01..06 — Filosofia: 100, 50, 0, 200, 0, 0 | Ciência: 0, 120, 80, 0, 0, 0 (somente ENTREGUE)
 * Execução: npx playwright test -c playwright-analise-ui.config.js
 */
const ADMIN = { email: "admin@nexo.com", senha: "admin123" };

async function loginAdmin(page) {
  await page.goto("/login");
  await page.fill("input[type=email]", ADMIN.email);
  await page.fill("input[type=password]", ADMIN.senha);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin-dashboard/, { timeout: 15000 });
}

const marcar = (page, nome) => page.getByLabel(nome, { exact: true }).check();

test.describe("UI — gráfico de linhas de vendas por categoria", () => {
  test("administrador compara categorias, vê o gráfico de linhas e altera o período", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin-analise");
    await expect(page.getByTestId("analise-vendas")).toBeVisible();

    await page.getByTestId("data-inicio").fill("2025-01-01");
    await page.getByTestId("data-fim").fill("2025-06-30");
    await marcar(page, "Filosofia");
    await marcar(page, "Ciência");

    const t0 = Date.now();
    await page.getByTestId("consultar").click();
    await expect(page.getByTestId("grafico-linhas")).toBeVisible();
    await expect(page.locator(".recharts-line")).toHaveCount(2); // uma linha por categoria (RNF0043)
    expect(Date.now() - t0).toBeLessThan(1000 + 1500); // consulta (≤ 1 s) + renderização

    const linhas = page.getByTestId("tabela-valores").locator("tbody tr");
    await expect(linhas).toHaveCount(6); // seis meses, inclusive os sem venda
    const jan = await linhas.nth(0).innerText();
    const fev = await linhas.nth(1).innerText();
    // Colunas em ordem alfabética: Ciência, Filosofia.
    expect(jan.replace(/\s/g, " ")).toMatch(/01\/2025\s+R\$\s?0,00\s+R\$\s?100,00/);
    expect(fev.replace(/\s/g, " ")).toMatch(/02\/2025\s+R\$\s?120,00\s+R\$\s?50,00/);

    // Alterar a data de fim gera um novo resultado.
    await page.getByTestId("data-fim").fill("2025-03-31");
    await page.getByTestId("consultar").click();
    await expect(linhas).toHaveCount(3);
  });

  test("exige ao menos uma categoria e período coerente", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin-analise");
    await page.getByTestId("consultar").click();
    await expect(page.getByTestId("erro-analise")).toContainText("categoria");

    await marcar(page, "Arte");
    await page.getByTestId("data-inicio").fill("2025-06-01");
    await page.getByTestId("data-fim").fill("2025-01-01");
    await page.getByTestId("consultar").click();
    await expect(page.getByTestId("erro-analise")).toContainText("anterior");
  });

  test("usuário sem sessão de administrador não acessa a tela", async ({ page }) => {
    await page.goto("/admin-analise");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("analise-vendas")).toHaveCount(0);
  });
});
