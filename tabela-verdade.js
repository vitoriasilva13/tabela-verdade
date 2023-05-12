let campoExpressao = null;

//#region Regex
const RegexApenasProposicoes = /([A-Z])(?=.*\1)|[^A-Z]/g;
const RegexNegacaoProposicoes = /~\[\d+\]/g;
const RegexApenasOperadores = /([∨→↔⊕^])(?=.*\1)|[^∨→↔⊕^]/g;
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
      alias: "[" + indexChave + "]",
      valor: proposicao,
      resultado: geraVFProposicao(index, qtdeLinhas, qtdeProposicoes),
    });
    campoValorChaves = campoValorChaves
      .split(proposicao)
      .join("[" + indexChave + "]");
    indexChave++;
  });

  //Se há negação de preposição, adiciona a negação na tabela
  if (campoValorChaves.match(RegexNegacaoProposicoes)) {
    campoValorChaves.match(RegexNegacaoProposicoes).forEach((negacao) => {
      tabelaVerdade.push({
        alias: "[" + indexChave + "]",
        valor: negacao,
        resultado: geraVFProposicaoNegada(negacao, tabelaVerdade),
      });
      campoValorChaves = campoValorChaves
        .split(negacao)
        .join("[" + indexChave + "]");
      indexChave++;
    });
  }

  //Verifica se há expressões entre parênteses negados na expressão
  if (campoValorChaves.match(RegexNegacoesParenteses)) {
    campoValorChaves.match(RegexNegacoesParenteses).forEach((negacao) => {
      tabelaVerdade.push({
        alias: "[" + indexChave + "]",
        valor: negacao.substring(1),
        resultado: geraResultado(
          negacao,
          negacao.replace(RegexApenasOperadores, ""),
          tabelaVerdade
        ),
      });
      campoValorChaves = campoValorChaves.replace(
        negacao.substring(1),
        "[" + indexChave + "]"
      );
      tabelaVerdade.push({
        alias: "[" + (indexChave + 1) + "]",
        valor: negacao,
        resultado: geraVFProposicaoNegada(
          "[" + indexChave + "]",
          tabelaVerdade
        ),
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
        resultado: geraResultado(
          expressao,
          expressao.replace(RegexApenasOperadores, ""),
          tabelaVerdade
        ),
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
          const anterior = campoValorChaves
            .slice(0, i)
            .match(/\[([^\[\]]*)\](?!.*\[[^\[\]]*\])/g);
          const proximo = campoValorChaves.slice(i).match(/\[([^\[\]]*)\]/g)[0];
          const expressao = anterior + operador + proximo;
          tabelaVerdade.push({
            alias: "[" + indexChave + "]",
            valor: expressao,
            resultado: geraResultado(expressao, operador, tabelaVerdade),
          });
          campoValorChaves = campoValorChaves.replace(
            expressao,
            "[" + indexChave + "]"
          );
          indexChave++;
        }
      }
    }
  });

  document.getElementById("titulo-resultado").innerHTML = campoValor;
  document.getElementById("card-resultado").classList.remove("d-none");

  replaceAlias(tabelaVerdade);

  // montando a head da tabela usando a info valor do array tabela verdade
  var inner_head = "";
  var mostrarAlias = document.getElementById("checkboxAlias").checked;
  if (mostrarAlias) {
    for (let i = 0; i < tabelaVerdade.length; i++) {
      inner_head +=
        "<th>" +
        tabelaVerdade[i].alias +
        "</br>" +
        tabelaVerdade[i].valor +
        "</th>";
    }
  } else {
    for (let i = 0; i < tabelaVerdade.length; i++) {
      inner_head += "<th>" + tabelaVerdade[i].display + "</th>";
    }
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
    .find((coluna) => coluna.alias === negacao.replace(/[~()]/g, ""))
    .resultado.forEach((resultado) => {
      resultados.push(!resultado);
    });
  return resultados;
}

function geraResultado(subExpressao, operador, tabelaVerdade) {
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

  return resultados;
}

function replaceAlias(tabelaVerdade) {
  tabelaVerdade.forEach((expressao, i) => {
    var display = expressao.valor;
    if (display.includes("[")) {
      var valores = display.match(/\[\d+\]/g);
      valores.forEach((valor) => {
        let proposicoes = tabelaVerdade.find(
          (proposicao) => proposicao.alias === valor
        );
        display = display.replace(valor, proposicoes.display);
      });
    }
    expressao.display = display;
  });
}
