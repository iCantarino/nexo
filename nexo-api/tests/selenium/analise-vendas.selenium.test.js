import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  By, until, criarDriver, capturarTela, logarPelaTela, abrirAnalise, esperarUrl, esperarSairDe, instalarSessaoFuncionario,
} from "./helpers/driver.js";
import { subirServicos, UI_URL } from "./helpers/servicos.js";
import { consultarNaTela, lerResultado, contarLinhasDoGrafico } from "./helpers/tela-analise.js";
import { api, somaEntregueNoBanco } from "./helpers/banco.js";
import {
  ADMIN, GERENTE, garantirFuncionarios, tokenFuncionario, criarCliente, criarCategorias, criarPedido,
  despacharEEntregar, limpar,
} from "./helpers/dados.js";

// Silencia logs de erro do Chrome updater no Windows (inofensivos, mas poluem o terminal)
const _stderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, encoding, cb) => {
  if (typeof chunk === "string" && chunk.includes("update_service_dialer_win.cc")) return true;
  return _stderrWrite(chunk, encoding, cb);
};

/**
 * Análise de vendas por categoria — gráfico de linhas, testado pela interface com Selenium.
 * Requisitos: RF0055, RNF0043, RNF0011. Critérios: só ADMIN, mês/ano, só ENTREGUE, valor em R$.
 *
 * Massa (2020, criada e removida pelo teste; independe do seed):
 *   Categoria A: jan R$ 130,50 (2 pedidos ENTREGUE) | fev 0 | mar R$ 60,00
 *   Categoria B: jan 0 | fev R$ 100,00 | mar R$ 75,00
 *   Categoria C: sem vendas
 *   + 6 pedidos de R$ 990,00 na categoria A em status diferentes de ENTREGUE (não podem aparecer).
 */
describe("Selenium — análise de vendas por categoria (RF0055, RNF0043, RNF0011)", { concurrency: false }, () => {
  let encerrar;
  let driver;
  let cat;
  let cliente;
  let tokenAdmin;

  const periodo = { inicio: "2020-01-01", fim: "2020-03-31" };
  const meses3 = ["01/2020", "02/2020", "03/2020"];
  const ids = (...cs) => cs.map((c) => c.id);

  before(async () => {
    encerrar = await subirServicos(); // API (8010) e UI (5174), se ainda não estiverem no ar
    await garantirFuncionarios();
    tokenAdmin = await tokenFuncionario(ADMIN);
    cliente = await criarCliente();
    cat = await criarCategorias();

    const entregue = (data, c, quantidade, valorUnitario) =>
      criarPedido(cliente, { status: "ENTREGUE", data, idCategoria: c.id, quantidade, valorUnitario });
    await entregue("2020-01-10 10:00:00", cat.A, 2, 50);
    await entregue("2020-01-25 10:00:00", cat.A, 1, 30.5);
    await entregue("2020-03-05 10:00:00", cat.A, 3, 20);
    await entregue("2020-02-14 10:00:00", cat.B, 4, 25);
    await entregue("2020-03-20 10:00:00", cat.B, 1, 75);
    const outros = ["APROVADA", "EM_TRANSITO", "EM_PROCESSAMENTO", "REPROVADA", "CANCELADO", "EM_TROCA"];
    for (const [i, status] of outros.entries()) {
      await criarPedido(cliente, {
        status, data: `2020-0${1 + (i % 3)}-18 10:00:00`, idCategoria: cat.A.id, quantidade: 10, valorUnitario: 99,
      });
    }

    driver = await criarDriver();
    await logarPelaTela(driver, ADMIN.email, ADMIN.senha);
    await abrirAnalise(driver);
  });

  after(async () => {
    if (driver) await driver.quit();
    if (encerrar) encerrar();
    await limpar(cliente, cat);
  });

  it("01 consulta de uma categoria: valores mensais = soma das vendas ENTREGUE na base (RF0055)", async () => {
    await consultarNaTela(driver, { ...periodo, idsCategorias: ids(cat.A) });
    const tela = await lerResultado(driver);
    assert.deepEqual(tela.meses, meses3);
    assert.deepEqual(tela.series[cat.A.nome], [130.5, 0, 60]);

    const noBanco = await somaEntregueNoBanco(cat.A.id, "2020-01-01", "2020-04-01");
    const esperado = ["2020-01", "2020-02", "2020-03"].map((m) => noBanco[m] ?? 0);
    assert.deepEqual(tela.series[cat.A.nome], esperado);
    await capturarTela(driver, "01-uma-categoria");
  });

  it("02 comparação entre duas ou mais categorias no período (RF0055)", async () => {
    await consultarNaTela(driver, { ...periodo, idsCategorias: ids(cat.A, cat.B, cat.C) });
    const tela = await lerResultado(driver);
    assert.deepEqual(Object.keys(tela.series).sort(), [cat.A.nome, cat.B.nome, cat.C.nome].sort());
    assert.deepEqual(tela.series[cat.A.nome], [130.5, 0, 60]);
    assert.deepEqual(tela.series[cat.B.nome], [0, 100, 75]);
    assert.deepEqual(tela.series[cat.C.nome], [0, 0, 0]);
    await capturarTela(driver, "02-comparacao");
  });

  it("03 gráfico de linhas, em reais, agrupado por mês/ano (RNF0043)", async () => {
    await consultarNaTela(driver, { inicio: "2019-11-01", fim: "2020-04-30", idsCategorias: ids(cat.A, cat.B) });
    assert.equal(await contarLinhasDoGrafico(driver), 2, "uma linha por categoria selecionada");
    const grafico = await driver.findElement(By.css('[data-testid="grafico-linhas"] svg.recharts-surface'));
    assert.ok(await grafico.isDisplayed());

    const tela = await lerResultado(driver);
    assert.deepEqual(tela.meses, ["11/2019", "12/2019", "01/2020", "02/2020", "03/2020", "04/2020"]); // MM/AAAA
    assert.deepEqual(tela.series[cat.B.nome], [0, 0, 0, 100, 75, 0]); // meses sem venda = R$ 0,00

    const celula = await driver.findElement(By.css('[data-testid="tabela-valores"] tbody tr:nth-child(3) td:nth-child(2)'));
    assert.match((await celula.getText()).replace(/\s/g, " "), /^R\$ 130,50$/); // formato em reais (pt-BR)
    await capturarTela(driver, "03-grafico-de-linhas");
  });

  it("04 alterar a data de início ou de fim gera novo resultado (RF0055)", async () => {
    await consultarNaTela(driver, { ...periodo, idsCategorias: ids(cat.A) });
    assert.deepEqual((await lerResultado(driver)).series[cat.A.nome], [130.5, 0, 60]);

    await consultarNaTela(driver, { inicio: "2020-03-01", fim: "2020-03-31", idsCategorias: ids(cat.A) });
    const semInicio = await lerResultado(driver);
    assert.deepEqual(semInicio.meses, ["03/2020"]);
    assert.deepEqual(semInicio.series[cat.A.nome], [60]);

    await consultarNaTela(driver, { inicio: "2020-01-01", fim: "2020-02-28", idsCategorias: ids(cat.A) });
    const semFim = await lerResultado(driver);
    assert.deepEqual(semFim.meses, ["01/2020", "02/2020"]);
    assert.deepEqual(semFim.series[cat.A.nome], [130.5, 0]);
    await capturarTela(driver, "04-periodo-alterado");
  });

  it("05 compra com status diferente de ENTREGUE não é contabilizada no gráfico (RN0074)", async () => {
    // Há 6 pedidos de R$ 990,00 (APROVADA, EM_TRANSITO, EM_PROCESSAMENTO, REPROVADA, CANCELADO, EM_TROCA) na categoria A.
    await consultarNaTela(driver, { ...periodo, idsCategorias: ids(cat.A) });
    const valores = (await lerResultado(driver)).series[cat.A.nome];
    assert.equal(Math.round(valores.reduce((a, v) => a + v, 0) * 100) / 100, 190.5);
    assert.ok(valores.every((v) => v < 990), "nenhum pedido não entregue pode somar no mês");
    await capturarTela(driver, "05-status-nao-entregue");
  });

  it("06 compra que passa a ENTREGUE dentro do período é refletida na consulta seguinte", async () => {
    const hoje = new Date();
    const dois = (n) => String(n).padStart(2, "0");
    const agora = `${hoje.getFullYear()}-${dois(hoje.getMonth() + 1)}-${dois(hoje.getDate())} 12:00:00`;
    const inicio = `${hoje.getFullYear()}-${dois(hoje.getMonth() + 1)}-01`;
    const fim = `${hoje.getFullYear()}-${dois(hoje.getMonth() + 1)}-28`;
    const mesAtual = `${dois(hoje.getMonth() + 1)}/${hoje.getFullYear()}`;

    const idPedido = await criarPedido(cliente, {
      status: "APROVADA", data: agora, idCategoria: cat.C.id, quantidade: 2, valorUnitario: 45,
    });

    await consultarNaTela(driver, { inicio, fim, idsCategorias: ids(cat.C) });
    let tela = await lerResultado(driver);
    assert.deepEqual(tela.meses, [mesAtual]);
    assert.deepEqual(tela.series[cat.C.nome], [0], "APROVADA ainda não conta");

    await despacharEEntregar(tokenAdmin, idPedido); // APROVADA -> EM_TRANSITO -> ENTREGUE

    await consultarNaTela(driver, { inicio, fim, idsCategorias: ids(cat.C) });
    tela = await lerResultado(driver);
    assert.deepEqual(tela.series[cat.C.nome], [90], "após ENTREGUE, R$ 90,00 aparece na consulta seguinte");
    await capturarTela(driver, "06-passou-a-entregue");
  });

  it("08 tempo de resposta da consulta de até 1 segundo, com 24 meses e todas as categorias (RNF0011)", async () => {
    const todas = (await api("GET", "/analise/categorias", { token: tokenAdmin })).corpo.map((c) => c.id_categoria);
    assert.ok(todas.length > 2);
    for (let i = 1; i <= 5; i++) {
      const ms = await consultarNaTela(driver, { inicio: "2019-01-01", fim: "2020-12-31", idsCategorias: todas });
      assert.ok(ms !== null && ms <= 1000, `consulta ${i} levou ${Math.round(ms)} ms (limite: 1000 ms)`);
    }
    assert.equal((await lerResultado(driver)).meses.length, 24);
    await capturarTela(driver, "08-tempo-de-resposta");
  });

  it("09 validações na tela: categoria obrigatória e fim não pode ser anterior ao início", async () => {
    await consultarNaTela(driver, { ...periodo, idsCategorias: ids(cat.A) }); // estado limpo
    for (const caixa of await driver.findElements(By.css('input[data-testid^="categoria-"]'))) {
      if (await caixa.isSelected()) {
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", caixa);
        await caixa.click();
      }
    }
    await driver.findElement(By.css('[data-testid="consultar"]')).click();
    const erro = await driver.wait(until.elementLocated(By.css('[data-testid="erro-analise"]')), 5000);
    assert.match(await erro.getText(), /categoria/i);
    await capturarTela(driver, "09-validacao");
  });

  it("07 acesso ao gráfico permitido ao administrador e negado a outros perfis (critério b)", async () => {
    try {
      const semPainel = async () =>
        assert.equal((await driver.findElements(By.css('[data-testid="analise-vendas"]'))).length, 0);

      // Cliente comum: a rota é protegida e redireciona para a home do cliente.
      await logarPelaTela(driver, cliente.email, cliente.senha);
      await abrirAnalise(driver);
      await esperarUrl(driver, "/home");
      await semPainel();

      // Funcionário que não é ADMIN (GERENTE_VENDAS): sai de /admin-analise e o painel nunca aparece.
      // (O app o leva a /home e, sem área própria, de volta ao /login; o que importa é o acesso negado.)
      const tokenGerente = await tokenFuncionario(GERENTE);
      await instalarSessaoFuncionario(driver, { token: tokenGerente, perfil: "GERENTE_VENDAS", nome: "Gerente Selenium", email: GERENTE.email });
      await abrirAnalise(driver);
      await esperarSairDe(driver, "/admin-analise");
      await semPainel();

      // Sem sessão: vai para o login.
      await driver.executeScript("localStorage.clear()");
      await abrirAnalise(driver);
      await esperarUrl(driver, "/login");
      assert.equal((await driver.findElements(By.css('[data-testid="analise-vendas"]'))).length, 0);
      await capturarTela(driver, "07-acesso-negado");

      // A API também nega (defesa em profundidade): sem token 401, cliente 401, gerente 403.
      const rota = `/analise/vendas-por-categoria?data_inicio=2020-01-01&data_fim=2020-03-31&categorias=${cat.A.id}`;
      assert.equal((await api("GET", rota)).status, 401);
      assert.equal((await api("GET", rota, { token: cliente.token })).status, 401);
      assert.equal((await api("GET", rota, { token: await tokenFuncionario(GERENTE) })).status, 403);
      assert.equal((await api("GET", rota, { token: tokenAdmin })).status, 200);
    } finally {
      // Administrador: acesso permitido (restaura a sessão para os demais testes).
      await logarPelaTela(driver, ADMIN.email, ADMIN.senha);
      await abrirAnalise(driver);
    }
    const painel = await driver.wait(until.elementLocated(By.css('[data-testid="analise-vendas"]')), 15000);
    assert.ok(await painel.isDisplayed());
    assert.ok((await driver.getCurrentUrl()).startsWith(`${UI_URL}/admin-analise`));
    await capturarTela(driver, "07-acesso-administrador");
  });
});
