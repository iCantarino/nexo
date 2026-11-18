import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { UI_URL } from "./servicos.js";

export { By, until };
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Milissegundos de pausa entre ações visíveis (slow-mo, padrão 2000 = 2s). */
export const DELAY = Number(process.env.SELENIUM_DELAY) || 2000;

/** Pausa opcional entre ações visuais para acompanhar o teste. */
export async function pausar(driver, ms = DELAY) {
  if (ms > 0) await driver.sleep(ms);
}

/** Chrome via Selenium Manager (baixa o driver compatível). HEADLESS=false mostra o navegador. */
export async function criarDriver() {
  const opcoes = new chrome.Options();
  if (process.env.HEADLESS !== "false") opcoes.addArguments("--headless=new");
  opcoes.addArguments("--window-size=1366,1000", "--disable-gpu", "--no-sandbox", "--lang=pt-BR");
  const driver = await new Builder().forBrowser("chrome").setChromeOptions(opcoes).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30000 });
  return driver;
}

export async function capturarTela(driver, nome) {
  const dir = path.resolve(__dirname, "..", "screenshots");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${nome}.png`), await driver.takeScreenshot(), "base64");
}

/** Login pela tela (cliente ou funcionário) e espera sair de /login. */
export async function logarPelaTela(driver, email, senha) {
  await driver.get(`${UI_URL}/login`);
  await pausar(driver);
  await driver.executeScript("localStorage.clear()");
  await driver.navigate().refresh();
  await pausar(driver);
  const campoEmail = await driver.wait(until.elementLocated(By.css("input[type=email]")), 10000);
  await pausar(driver);
  await campoEmail.sendKeys(email);
  await pausar(driver);
  await driver.findElement(By.css("input[type=password]")).sendKeys(senha);
  await pausar(driver);
  await driver.findElement(By.css("button[type=submit]")).click();
  await driver.wait(async () => !(await driver.getCurrentUrl()).includes("/login"), 15000);
  await pausar(driver);
}

/**
 * Instala no navegador a sessão de um funcionário já autenticado na API (mesmo formato do AuthContext).
 * Usado para perfis sem tela própria de entrada, como GERENTE_VENDAS, que o app devolve ao /login após o login.
 */
export async function instalarSessaoFuncionario(driver, { token, perfil, nome, email }) {
  await driver.get(`${UI_URL}/login`);
  await driver.executeScript(
    "localStorage.clear(); localStorage.setItem('token', arguments[0]); localStorage.setItem('user', JSON.stringify(arguments[1]));",
    token,
    { id: 0, tipo: "funcionario", perfil, email, nome }
  );
}

/** Espera a SPA sair da rota informada (redirecionamento de rota protegida). */
export async function esperarSairDe(driver, trecho, ms = 10000) {
  await driver.wait(async () => !(await driver.getCurrentUrl()).includes(trecho), ms);
}

/** Abre a rota da análise e espera a navegação (a SPA pode redirecionar). */
export async function abrirAnalise(driver) {
  await driver.get(`${UI_URL}/admin-analise`);
}

export async function esperarUrl(driver, trecho, ms = 10000) {
  await driver.wait(async () => (await driver.getCurrentUrl()).includes(trecho), ms);
}
