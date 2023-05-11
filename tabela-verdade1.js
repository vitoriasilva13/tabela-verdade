let campoExpressao = null;
let campoExpressaoApenasParametros = null;

document.addEventListener("DOMContentLoaded", () => {
  campoExpressao = document.getElementById("expressao");

  //Adição separada para que seja possível futuras validações
  document
    .querySelectorAll("button.parametro")
    .forEach((element) =>
      element.addEventListener("click", AdicionaPreposicao)
    );
  document
    .querySelectorAll("button.condicao")
    .forEach((element) => element.addEventListener("click", AdicionaOperador));
  document
    .querySelectorAll("button.parenteses")
    .forEach((element) =>
      element.addEventListener("click", AdicionaParenteses)
    );
});

//#region Ações de botões exceto resultado
function AdicionaPreposicao() {
  campoExpressao.value += this.innerHTML;
}

function AdicionaOperador() {
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
//#endregion Ações de botões exceto resultado

function GeraTabelaVerdade() {
  const tabelaVerdade = [];
  const conectivos = ["^", "∨", "⊕", "↔", "→"];
  campoExpressaoApenasParametros = campoExpressao.value.replace(
    /([A-Z])(?=.*\1)|[^A-Z]/g,
    ""
  );
  campoExpressaoApenasConectivos = campoExpressao.value.replace(
    /([∨→↔⊕^~])(?=.*\1)|[^∨→↔⊕^~]/g,
    ""
  );

  //Validando e adicionando informações de parâmetros
  var parametros = campoExpressaoApenasParametros.split("");
  var qtdeColunas = campoExpressaoApenasParametros.length;
  var qtdeLinhas = Math.pow(2, parseFloat(qtdeColunas));
  parametros.forEach((p, i) => {
    tabelaVerdade.push(GeraValores(p, i, qtdeLinhas, qtdeColunas));
  });

  const negacoesRegex = /(\~[A-Z])/g; //regex pega apenas parâmetros precedidos de negação
  const negacoesParentesesRegex = /~\(([^)]+)\)/g; //regex pega parametros dentro de parênteses que são precedidos de ~

  const negacoesMatchesParametros = campoExpressao.value.match(negacoesRegex);
  if (negacoesMatchesParametros) {
    negacoesMatchesParametros.forEach((negacao) => {
      GeraInversaoValores(negacao, tabelaVerdade);
    });
  }

  const negacoesMatchesNegacoes = campoExpressao.value.match(
    negacoesParentesesRegex
  );
  if (negacoesMatchesNegacoes) {
    negacoesMatchesNegacoes.forEach((negacao) => {
      const subExpressao = negacao.replace(/[~()]/g, "");
      GeraResultado(subExpressao, tabelaVerdade);
      GeraInversaoValores(negacao, tabelaVerdade);
    });
  }

  var x = campoExpressao.value.replace(/([A-Za-z])(?=.*\1)|[^a-zA-Z]/g, "");
  var y = campoExpressao.value.replace(/([∨→↔⊕^~])(?=.*\1)|[^∨→↔⊕^~]/g, "");
  var inner_head = "";
  var inner_body = "";
  var total_colunas = x.length + y.length;

  for (let i = 0; i < tabelaVerdade.length; i++) {
    inner_head += "<th>" + tabelaVerdade[i].proposicao + "</th>";
  }

  for (var j = 0; j < qtdeLinhas; j++) {
    inner_body += "<tr>";
    for (var i = 0; i < total_colunas; i++) {
      inner_body +=
        "<td>" + (tabelaVerdade[i].valores[j] ? "V" : "F") + "</td>";
    }
    inner_body += "</tr>";
  }

  document.querySelectorAll("thead")[0].innerHTML =
    "<tr>" + inner_head + "</tr>";
  document.querySelectorAll("tbody")[0].innerHTML = inner_body;
}

function GeraValores(elemento, index, totalLinhas, totalColunas) {
  const parametro = {
    proposicao: elemento,
    valores: [],
  };
  for (let i = 0; i < totalLinhas; i++) {
    parametro.valores.push(
      i % 2 ** (totalColunas - index) < 2 ** (totalColunas - index) / 2
        ? true
        : false
    );
  }
  return parametro;
}

function GeraInversaoValores(negacao, tabelaVerdade) {
  const parametro = {
    proposicao: negacao,
    valores: [],
  };
  tabelaVerdade
    .find((t) => t.proposicao === negacao.replace(/[~()]/g, ""))
    .valores.forEach((v) => {
      parametro.valores.push(!v);
    });
  tabelaVerdade.push(parametro);
}

function GeraResultado(expressao, tabelaVerdade) {
  const parametro = {
    proposicao: expressao,
    valores: [],
  };
  var y = expressao.replace(/([∨→↔⊕^])(?=.*\1)|[^∨→↔⊕^]/g, "");
  var x = expressao.replace(/([A-Za-z])(?=.*\1)|[^a-zA-Z]/g, "");
  var teste1 = tabelaVerdade.find((t) => t.proposicao === x[0]);
  var teste2 = tabelaVerdade.find((t) => t.proposicao === x[1]);
  switch (y) {
    case "^":
      for (let i = 0; i < teste1.valores.length; i++) {
        parametro.valores.push(teste1.valores[i] && teste2.valores[i]);
      }
      break;
    case "∨":
      for (let i = 0; i < teste1.valores.length; i++) {
        parametro.valores.push(teste1.valores[i] || teste2.valores[i]);
      }
      break;
    case "⊕":
      for (let i = 0; i < teste1.valores.length; i++) {
        parametro.valores.push(
          !(
            (teste1.valores[i] && teste2.valores[i]) ||
            (!teste1.valores[i] && !teste2.valores[i])
          )
        );
      }
      break;
    case "→":
      for (let i = 0; i < teste1.valores.length; i++) {
        parametro.valores.push(
          !(teste1.valores[i] == true && teste2.valores[i] == false)
        );
      }
      break;
    case "↔":
      for (let i = 0; i < teste1.valores.length; i++) {
        parametro.valores.push(
          (teste1.valores[i] && teste2.valores[i]) ||
            (!teste1.valores[i] && !teste2.valores[i])
        );
      }
      break;
    default:
      break;
  }
  tabelaVerdade.push(parametro);
}
