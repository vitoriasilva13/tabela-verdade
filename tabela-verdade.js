let campoExpressao = null;
let campoExpressaoValorParaResultado = null;
let contadorChave = 0;
let tabelaVerdade = [];

//#region Regex
const RegexApenasProposicoes = /([A-Z])(?=.*\1)|[^A-Z]/g;
const RegexNegacaoProposicoes = /~\[\d+\]/g;
const RegexAlias = /\[\d+\]/g;
const RegexApenasOperadores = /([∨→↔⊕^])(?=.*\1)|[^∨→↔⊕^]/g;
const RegexEntreParenteses = /(?<!~)\((.*?)\)/g; //não precedidos de negação
const RegexNegacoesParenteses = /~\(([^)]+)\)/g;
const RegexParentesesInterno = /\(([^()]*)\)/;
//#endregion

document.addEventListener("DOMContentLoaded", () => {
  campoExpressao = document.getElementById("expressao");

  //#region AddEvents
  document
    .querySelectorAll("button.parametro")
    .forEach((element) =>
      element.addEventListener("click", AdicionaPreposicao)
    );
  document
    .querySelectorAll("button.condicao")
    .forEach((element) =>
      element.addEventListener("click", AdicionaOperadores)
    );
  document
    .querySelectorAll("button.parenteses")
    .forEach((element) =>
      element.addEventListener("click", AdicionaParenteses)
    );
  //#endregion
});

//#region Ações Tecladas
function AdicionaPreposicao() {
  campoExpressao.value += this.innerHTML;
}

function AdicionaOperadores() {
  campoExpressao.value += this.innerHTML;
}

function AdicionaParenteses() {
  campoExpressao.value += this.innerHTML;
}

function Limpar() {
  campoExpressao.value = "";
}

function Deletar() {
  campoExpressao.value = campoExpressao.value.slice(0, -1);
}
//#endregion

function GeraTabelaVerdade() {
  campoExpressaoValorParaResultado = campoExpressao.value;

  const proposicoesLista = campoExpressaoValorParaResultado
    .replace(RegexApenasProposicoes, "")
    .split("");
  const qtdeProposicoes = proposicoesLista.length;
  const qtdeLinhasTabela = Math.pow(2, parseFloat(qtdeProposicoes));

  //#region Adiciona Proposicoes
  proposicoesLista.forEach((proposicao) => {
    adicionaNaTabelaVerdade(proposicao);
    geraVFProposicao(qtdeLinhasTabela, qtdeProposicoes);
    substituiCampoExpressaoValor(proposicao);
  });
  //#endregion

  verificaValoresNegados();

  while (campoExpressaoValorParaResultado.match(RegexParentesesInterno)) {
    let valorTemporario = campoExpressaoValorParaResultado.match(
      RegexParentesesInterno
    )[0];
    percorreExpressaoGeraResultado(valorTemporario);
    verificaValoresNegados();
  }
  percorreExpressaoGeraResultado(campoExpressaoValorParaResultado);

  //#region Monta Tabela
  substituiAlias();

  let inner_head = "";
  let inner_body = "";
  let tamanhoTabelaVerdade = tabelaVerdade.length;
  let mostrarAlias = document.getElementById("checkboxAlias").checked;

  document.getElementById("titulo-resultado").innerHTML = campoExpressao.value;
  document.getElementById("card-resultado").classList.remove("d-none");

  for (let i = 0; i < tamanhoTabelaVerdade; i++) {
    if (mostrarAlias) {
      inner_head +=
        "<th>" +
        tabelaVerdade[i].alias +
        "</br>" +
        tabelaVerdade[i].valor +
        "</th>";
    } else {
      inner_head += "<th>" + tabelaVerdade[i].display + "</th>";
    }
  }

  for (let i = 0; i < qtdeLinhasTabela; i++) {
    inner_body += "<tr>";
    for (let j = 0; j < tamanhoTabelaVerdade; j++) {
      inner_body +=
        "<td>" + (tabelaVerdade[j]?.resultado[i] ? "V" : "F") + "</td>";
    }
    inner_body += "</tr>";
  }

  document.querySelectorAll("thead")[0].innerHTML =
    "<tr>" + inner_head + "</tr>";
  document.querySelectorAll("tbody")[0].innerHTML = inner_body;
  //#endregion

  //#region Reseta index e tabela
  tabelaVerdade = [];
  contadorChave = 0;
  //#endregion
}

function geraResultado(subExpressao, operador) {
  let resultados = [];
  let valores = subExpressao.match(/\[\d+\]/g);
  let proposicao1 = tabelaVerdade.find(
    (proposicao1) => proposicao1.alias === valores[0]
  );
  let proposicao2 = tabelaVerdade.find(
    (proposicao2) => proposicao2.alias === valores[1]
  );
  proposicao1.resultado.forEach((resultado, i) => {
    switch (operador) {
      case "^":
        resultados.push(resultado && proposicao2.resultado[i]);
        break;
      case "∨":
        resultados.push(resultado || proposicao2.resultado[i]);
        break;
      case "⊕":
        resultados.push(
          !(
            (resultado && proposicao2.resultado[i]) ||
            (!resultado && !proposicao2.resultado[i])
          )
        );
        break;
      case "→":
        resultados.push(
          !(resultado == true && proposicao2.resultado[i] == false)
        );
        break;
      case "↔":
        resultados.push(
          (resultado && proposicao2.resultado[i]) ||
            (!resultado && !proposicao2.resultado[i])
        );
        break;
    }
  });
  tabelaVerdade[contadorChave].resultado = resultados;
}

/**
 * Adiciona valor informado na tabelaVerdade
 * @param {string} valor
 */
function adicionaNaTabelaVerdade(valor) {
  tabelaVerdade.push({
    alias: "[" + contadorChave + "]",
    valor: valor,
  });
}

/**
 * Gera valores V ou F iniciais
 * para as proposições da expressão.
 * @param {int} totalLinhas
 * @param {int} totalColunas
 */
function geraVFProposicao(totalLinhas, totalColunas) {
  let resultados = [];
  for (let i = 0; i < totalLinhas; i++) {
    resultados.push(
      i % 2 ** (totalColunas - contadorChave) <
        2 ** (totalColunas - contadorChave) / 2
        ? true
        : false
    );
  }
  tabelaVerdade[contadorChave].resultado = resultados;
}

/**
 * Substitui valor da preposição ou expressão
 * na string campoExpressaoValorParaResultado
 * pelo valor do alias gerado (contadorChave)
 * e incrementa +1 ao contador.
 * @param {string} valor
 */
function substituiCampoExpressaoValor(valor) {
  campoExpressaoValorParaResultado = campoExpressaoValorParaResultado
    .split(valor)
    .join("[" + contadorChave + "]");
  contadorChave++;
}

/**
 * Verifica se há valores negados na expressão.
 * Se houver, adiciona na tabelaVerdade com o resultado.
 */
function verificaValoresNegados() {
  if (campoExpressaoValorParaResultado.match(RegexNegacaoProposicoes)) {
    campoExpressaoValorParaResultado
      .match(RegexNegacaoProposicoes)
      .forEach((negacao) => {
        adicionaNaTabelaVerdade(negacao);
        inverteVFExistente(negacao);
        substituiCampoExpressaoValor(negacao);
      });
  }
}

/**
 * Inverte resultado da proposição ou expressão
 * @param {string} negacao
 */
function inverteVFExistente(negacao) {
  let resultados = [];
  tabelaVerdade
    .find((coluna) => coluna.alias === negacao.replace(/[~()]/g, ""))
    .resultado.forEach((resultado) => {
      resultados.push(!resultado);
    });
  tabelaVerdade[contadorChave].resultado = resultados;
}

function percorreExpressaoGeraResultado(expressaoValor) {
  const operadores = ["^", "∨", "→", "↔", "⊕"];
  operadores.forEach((operador) => {
    while (expressaoValor.includes(operador)) {
      for (let i = 0; i < expressaoValor.length; i++) {
        if (expressaoValor[i] === operador) {
          const anterior = expressaoValor
            .slice(0, i)
            .match(/\[([^\[\]]*)\](?!.*\[[^\[\]]*\])/g);
          const proximo = expressaoValor.slice(i).match(/\[([^\[\]]*)\]/g)[0];
          const expressao = anterior + operador + proximo;

          if (
            expressaoValor.length == expressao.length + 2 &&
            expressaoValor.includes("(")
          ) {
            adicionaNaTabelaVerdade("(" + expressao + ")");
            geraResultado("(" + expressao + ")", operador);
            substituiCampoExpressaoValor("(" + expressao + ")");
            expressaoValor = expressaoValor
              .split("(" + expressao + ")")
              .join("[" + (contadorChave - 1) + "]");
          } else {
            adicionaNaTabelaVerdade(expressao);
            geraResultado(expressao, operador);
            expressaoValor = expressaoValor
              .split(expressao)
              .join("[" + contadorChave + "]");
            substituiCampoExpressaoValor(expressao);
          }
        }
      }
    }
  });
}

/**
 * Substitui alias da header da tabela pelos seus
 * respectivos valores de display informados no processo
 * de gerar toda a tabelaVerdade
 */
function substituiAlias() {
  tabelaVerdade.forEach((coluna) => {
    var display = coluna.valor;
    if (display.includes("[")) {
      var valores = display.match(RegexAlias);
      valores.forEach((valor) => {
        let proposicoes = tabelaVerdade.find(
          (proposicao) => proposicao.alias === valor
        );
        display = display.split(valor).join(proposicoes.display);
      });
    }
    coluna.display = display;
  });
}
