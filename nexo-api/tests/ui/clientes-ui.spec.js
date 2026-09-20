import { test, expect } from "@playwright/test";

const ADMIN = { email: "admin@nexo.com", senha: "admin123" };
const CLIENTE = {
  nome: "Joao Visual Test",
  email: "joao." + Date.now() + "@visual.com",
  cpf: String(100+(Date.now()%899)).padStart(3,"0") + "." + String(100+(Date.now()%899)).padStart(3,"0") + "." + String(100+(Date.now()%899)).padStart(3,"0") + "-" + String(10+(Date.now()%89)).padStart(2,"0"),
  telefone: "(11) 98888-7777",
  nascimento: "1990-05-15",
  senha: "Senha123#",
  novaSenha: "NovaSenha#456",
};

test.describe("CRUD Completo - Frontend UI", () => {

  test("Ciclo completo", async ({ page }) => {
    test.setTimeout(180000);

    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("input[type=email]", ADMIN.email);
    await page.fill("input[type=password]", ADMIN.senha);
    await page.click("button[type=submit]");
    await page.waitForURL(/\/admin-dashboard/, { timeout: 15000 });
    await expect(page.locator("text=Painel de Controle")).toBeVisible();

    await page.click("a[href=\"/admin-usuarios\"]");
    await page.waitForURL(/\/admin-usuarios/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    await expect(page.locator("text=Gestão de Usuários")).toBeVisible({ timeout: 8000 });

    await page.click("text=+ Cadastrar Novo Usuário");
    await page.waitForTimeout(500);

    await page.fill("input[placeholder=\"Nome completo\"]", CLIENTE.nome);
    await page.fill("input[type=email]", CLIENTE.email);
    await page.fill("input[placeholder=\"000.000.000-00\"]", CLIENTE.cpf);
    await page.fill("input[placeholder=\"(11) 98888-0000\"]", CLIENTE.telefone);
    await page.locator(":text-is('Cliente')").last().click();
    await page.locator("input[type=date]").last().fill(CLIENTE.nascimento);
    await page.locator("input[type=password]").last().fill(CLIENTE.senha);

    await page.click("text=Salvar Usuário");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=" + CLIENTE.nome).first()).toBeVisible({ timeout: 8000 });

    const row = page.locator("text=" + CLIENTE.nome).first().locator("xpath=..");

    await row.locator("[title=Editar]").click();
    await page.waitForTimeout(500);
    await page.locator("input[type=password]").last().fill(CLIENTE.novaSenha);
    await page.click("text=Salvar Usuário");
    await page.waitForTimeout(800);

    page.once("dialog", (dialog) => dialog.accept());   // antes de Inativar
    await row.locator("[title=Inativar]").click();
    await page.waitForTimeout(1000);

    await row.locator("[title=Ativar]").click();
    await page.waitForTimeout(1000);

    page.once("dialog", (dialog) => dialog.accept());   // antes de Excluir
    await row.locator("[title=Excluir]").click();
    await page.waitForTimeout(1000);

    await expect(page.locator("text=" + CLIENTE.nome)).not.toBeVisible({ timeout: 5000 });
  });

});
