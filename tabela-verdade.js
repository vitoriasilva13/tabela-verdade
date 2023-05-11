let campoExpressao = null;

//#region Regex
const RegexApenasProposicoes = /([A-Z])(?=.*\1)|[^A-Z]/g;
const RegexNegacaoProposicoes = /(\~[A-Z])/g;
const RegexApenasOperadores = /([∨→↔⊕^~])(?=.*\1)|[^∨→↔⊕^~]/g;
const RegexEntreParenteses = /(?<!~)\((.*?)\)/g; //não precedidos de negação
const RegexNegacoesParenteses = /~\(([^)]+)\)/g;
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

//#region Ações de botões exceto resultado
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
  let indexChave = 0;
  let campoValorChaves = campoExpressao.value;
  const campoValor = campoExpressao.value;
  const apenasProposicoes = campoValor.replace(RegexApenasProposicoes, "");
  const proposicoes = apenasProposicoes.split("");
  const tabelaVerdade = [];
  const qtdeProposicoes = apenasProposicoes.length;
  const qtdeLinhas = Math.pow(2, parseFloat(qtdeProposicoes));

  //Adiciona proposições
  proposicoes.forEach((proposicao, index) => {
    tabelaVerdade.push({
      alias: proposicao,
      valor: proposicao,
      resultado: geraVFProposicao(index, qtdeLinhas, qtdeProposicoes),
    });
  });

  //Se há negação de preposição, adiciona a negação na tabela
  if (campoValor.match(RegexNegacaoProposicoes)) {
    campoValor.match(RegexNegacaoProposicoes).forEach((negacao) => {
      tabelaVerdade.push({
        alias: "[" + indexChave + "]",
        valor: negacao,
        resultado: geraVFProposicaoNegada(negacao, tabelaVerdade),
      });
      campoValorChaves = campoValorChaves.replace(
        negacao,
        "[" + indexChave + "]"
      );
      indexChave++;
    });
  }

  //Verifica se há expressões entre parênteses negados na expressão
  if (campoValorChaves.match(RegexNegacoesParenteses)) {
    campoValorChaves.match(RegexNegacoesParenteses).forEach((negacao) => {
      tabelaVerdade.push({
        alias: "[" + indexChave + "]",
        valor: negacao.substring(1),
        resultado: [],
      });
      campoValorChaves = campoValorChaves.replace(
        negacao.substring(1),
        "[" + indexChave + "]"
      );
      tabelaVerdade.push({
        alias: "[" + (indexChave + 1) + "]",
        valor: negacao,
        resultado: [],
      });
      campoValorChaves = campoValorChaves.replace(
        "~[" + indexChave + "]",
        "[" + (indexChave + 1) + "]"
      );
      indexChave += 2;
    });
  }

  //Verifica se há expressões entre parênteses na expressão
  if (campoValorChaves.match(RegexEntreParenteses)) {
    campoValorChaves.match(RegexEntreParenteses).forEach((expressao) => {
      tabelaVerdade.push({
        alias: "[" + indexChave + "]",
        valor: expressao,
        resultado: [],
      });
      campoValorChaves = campoValorChaves.replace(
        expressao,
        "[" + indexChave + "]"
      );
      indexChave++;
    });
  }

  const operadores = ["^", "∨", "→", "↔", "⊕"];
  operadores.forEach((operador) => {
    while (campoValorChaves.includes(operador)) {
      for (let i = 0; i < campoValorChaves.length; i++) {
        if (campoValorChaves[i] === operador) {
          let substringChecaColchete = campoValorChaves.substring(i - 1, i + 2);
          let valor;
          let tipo = 0;
          if (
            substringChecaColchete.includes("]") &&
            substringChecaColchete.includes("[")
          ) {
            valor = campoValorChaves.substring(i - 3, i + 4);
            tipo = 2;
          } else if (substringChecaColchete.includes("]")) {
            valor = campoValorChaves.substring(i - 3, i + 2);
            tipo = 1;
          } else if (substringChecaColchete.includes("[")) {
            valor = campoValorChaves.substring(i - 1, i + 4);
            tipo = 3;
          } else {
            valor = campoValorChaves.substring(i - 1, i + 2);
          }
          tabelaVerdade.push({
            alias: "[" + indexChave + "]",
            valor: valor,
            resultado: geraResultado(valor, operador, tipo, tabelaVerdade),
          });
          campoValorChaves = campoValorChaves.replace(
            valor,
            "[" + indexChave + "]"
          );
          indexChave++;
        }
      }
    }
  });

  if (campoValorChaves.length > 3) {
    tabelaVerdade.push({
      alias: "[" + indexChave + "]",
      valor: campoValorChaves,
      resultado: [],
    });
  }

  document.getElementById("titulo-resultado").innerHTML = campoValor;
  document.getElementById("card-resultado").classList.remove("d-none");

  // montando a head da tabela usando a info valor do array tabela verdade
  var inner_head = "";
  for (let i = 0; i < tabelaVerdade.length; i++) {
    inner_head +=
      "<th>" +
      (tabelaVerdade[i].valor.length > 1
        ? tabelaVerdade[i].alias + "</br>"
        : "") +
      tabelaVerdade[i].valor +
      "</th>";
  }

  var inner_body = "";
  for (let i = 0; i < qtdeLinhas; i++) {
    inner_body += "<tr>";
    for (var j = 0; j < tabelaVerdade.length; j++) {
      inner_body +=
        "<td>" + (tabelaVerdade[j]?.resultado[i] ? "V" : "F") + "</td>";
    }
    inner_body += "</tr>";
  }

  document.querySelectorAll("thead")[0].innerHTML =
    "<tr>" + inner_head + "</tr>";
  document.querySelectorAll("tbody")[0].innerHTML = inner_body;

  console.log(tabelaVerdade);
  console.log(campoValorChaves);
}

function geraVFProposicao(index, totalLinhas, totalColunas) {
  let resultados = [];
  for (let i = 0; i < totalLinhas; i++) {
    resultados.push(
      i % 2 ** (totalColunas - index) < 2 ** (totalColunas - index) / 2
        ? true
        : false
    );
  }
  return resultados;
}

function geraVFProposicaoNegada(negacao, tabelaVerdade) {
  let resultados = [];
  tabelaVerdade
    .find((coluna) => coluna.valor === negacao.replace(/[~()]/g, ""))
    .resultado.forEach((resultado) => {
      resultados.push(!resultado);
    });
  return resultados;
}

function geraResultado(subExpressao, operador, tipo, tabelaVerdade) {
  let resultados = [];

  switch (tipo) {
    case 1:
      break;
    case 2:
      var valores = subExpressao.match(/\[\d+\]/g);
      var proposicao1 = tabelaVerdade.find(
        (proposicao1) => proposicao1.alias === valores[0]
      );
      var proposicao2 = tabelaVerdade.find(
        (proposicao2) => proposicao2.alias === valores[1]
      );
      proposicao1.resultado.forEach((resultado, i) => {
        resultados.push(resultado && proposicao2.resultado[i]);
      });
      break;
    case 3:
      break;
    default:
      var proposicao1 = tabelaVerdade.find(
        (proposicao1) => proposicao1.alias === subExpressao[0]
      );
      var proposicao2 = tabelaVerdade.find(
        (proposicao2) => proposicao2.alias === subExpressao[2]
      );
      proposicao1.resultado.forEach((resultado, i) => {
        resultados.push(resultado && proposicao2.resultado[i]);
      });
      break;
  }

  return resultados;
}
