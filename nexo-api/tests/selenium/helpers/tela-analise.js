import { By, until, pausar } from "./driver.js";

/** Preenche input[type=date] de forma independente do locale, avisando o React. */
async function preencherData(driver, testId, valor) {
  const el = await driver.findElement(By.css(`[data-testid="${testId}"]`));
  await pausar(driver);
  await driver.executeScript(
    `const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
     set.call(arguments[0], arguments[1]);
     arguments[0].dispatchEvent(new Event('input', { bubbles: true }));`,
    el,
    valor
  );
}

const contarRequisicoes = (driver) =>
  driver.executeScript(
    "return performance.getEntriesByType('resource').filter(e => e.name.includes('/analise/vendas-por-categoria')).length"
  );

/**
 * Informa período e categorias, clica em Consultar e espera a resposta ser renderizada.
 * `idsCategorias`: ids a marcar (os demais ficam desmarcados).
 * Devolve a duração, em ms, da chamada HTTP à API (medida pelo navegador).
 */
export async function consultarNaTela(driver, { inicio, fim, idsCategorias }) {
  await driver.wait(until.elementLocated(By.css('[data-testid="analise-vendas"]')), 15000);
  await pausar(driver);
  await driver.wait(until.elementLocated(By.css('input[data-testid^="categoria-"]')), 15000);
  await pausar(driver);
  await preencherData(driver, "data-inicio", inicio);
  await pausar(driver);
  await preencherData(driver, "data-fim", fim);
  await pausar(driver);
  for (const caixa of await driver.findElements(By.css('input[data-testid^="categoria-"]'))) {
    const id = Number((await caixa.getAttribute("data-testid")).replace("categoria-", ""));
    if ((await caixa.isSelected()) !== idsCategorias.includes(id)) {
      await pausar(driver);
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", caixa);
      await caixa.click();
    }
  }
  await pausar(driver);
  const antes = await contarRequisicoes(driver);
  const botao = await driver.findElement(By.css('[data-testid="consultar"]'));
  await pausar(driver);
  await botao.click();
  await driver.wait(async () => {
    const respondeu = (await contarRequisicoes(driver)) > antes;
    return respondeu && (await botao.isEnabled()) && (await botao.getText()) === "Consultar";
  }, 15000);
  await pausar(driver);
  return driver.executeScript(
    `const e = performance.getEntriesByType('resource').filter(x => x.name.includes('/analise/vendas-por-categoria')).pop();
     return e ? e.duration : null;`
  );
}

const paraNumero = (texto) => Number(texto.replace(/[^\d,-]/g, "").replace(",", "."));

/** Lê a tabela exibida junto do gráfico: { meses: ['01/2020'], series: { Categoria: [valores em R$] } }. */
export async function lerResultado(driver) {
  const tabela = await driver.wait(until.elementLocated(By.css('[data-testid="tabela-valores"]')), 10000);
  const nomes = await Promise.all((await tabela.findElements(By.css("thead th"))).map((th) => th.getText()));
  const meses = [];
  const series = Object.fromEntries(nomes.slice(1).map((n) => [n, []]));
  for (const linha of await tabela.findElements(By.css("tbody tr"))) {
    const celulas = await Promise.all((await linha.findElements(By.css("td"))).map((td) => td.getText()));
    meses.push(celulas[0]);
    celulas.slice(1).forEach((c, i) => series[nomes[i + 1]].push(paraNumero(c)));
  }
  return { meses, series };
}

export const contarLinhasDoGrafico = async (driver) => (await driver.findElements(By.css(".recharts-line"))).length;
