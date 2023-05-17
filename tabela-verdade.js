let campoExpressao = null;
let contadorChave = 0;
let tabelaVerdade = [];

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
  let campoValorChaves = campoExpressao.value;
  const proposicoesLista = campoExpressao.value
    .replace(RegexApenasProposicoes, "")
    .split("");
  const qtdeProposicoes = proposicoesLista.length;
  const qtdeLinhasTabela = Math.pow(2, parseFloat(qtdeProposicoes));

  //Adiciona proposições
  proposicoesLista.forEach((proposicao, index) => {
    tabelaVerdade.push({
      alias: "[" + contadorChave + "]",
      valor: proposicao,
      resultado: geraVFProposicao(index, qtdeLinhasTabela, qtdeProposicoes),
    });
    campoValorChaves = campoValorChaves
      .split(proposicao)
      .join("[" + contadorChave + "]");
    contadorChave++;
  });

  //Se há negação de preposição, adiciona a negação na tabela
  if (campoValorChaves.match(RegexNegacaoProposicoes)) {
    campoValorChaves.match(RegexNegacaoProposicoes).forEach((negacao) => {
      tabelaVerdade.push({
        alias: "[" + contadorChave + "]",
        valor: negacao,
        resultado: geraVFProposicaoNegada(negacao, tabelaVerdade),
      });
      campoValorChaves = campoValorChaves
        .split(negacao)
        .join("[" + contadorChave + "]");
      contadorChave++;
    });
  }

  //Verifica se há expressões entre parênteses negados na expressão
  if (campoValorChaves.match(RegexNegacoesParenteses)) {
    campoValorChaves.match(RegexNegacoesParenteses).forEach((negacao) => {
      tabelaVerdade.push({
        alias: "[" + contadorChave + "]",
        valor: negacao.substring(1),
        resultado: geraResultado(
          negacao,
          negacao.replace(RegexApenasOperadores, ""),
          tabelaVerdade
        ),
      });
      campoValorChaves = campoValorChaves.replace(
        negacao.substring(1),
        "[" + contadorChave + "]"
      );
      tabelaVerdade.push({
        alias: "[" + (contadorChave + 1) + "]",
        valor: negacao,
        resultado: geraVFProposicaoNegada(
          "[" + contadorChave + "]",
          tabelaVerdade
        ),
      });
      campoValorChaves = campoValorChaves.replace(
        "~[" + contadorChave + "]",
        "[" + (contadorChave + 1) + "]"
      );
      contadorChave += 2;
    });
  }

  //Verifica se há expressões entre parênteses na expressão
  if (campoValorChaves.match(RegexEntreParenteses)) {
    campoValorChaves.match(RegexEntreParenteses).forEach((expressao) => {
      tabelaVerdade.push({
        alias: "[" + contadorChave + "]",
        valor: expressao,
        resultado: geraResultado(
          expressao,
          expressao.replace(RegexApenasOperadores, ""),
          tabelaVerdade
        ),
      });
      campoValorChaves = campoValorChaves.replace(
        expressao,
        "[" + contadorChave + "]"
      );
      contadorChave++;
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
            alias: "[" + contadorChave + "]",
            valor: expressao,
            resultado: geraResultado(expressao, operador, tabelaVerdade),
          });
          campoValorChaves = campoValorChaves.replace(
            expressao,
            "[" + contadorChave + "]"
          );
          contadorChave++;
        }
      }
    }
  });

  substituiAlias(tabelaVerdade);

  //#region Monta Tabela
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

  console.log(tabelaVerdade);
  console.log(campoValorChaves);

  //#region Reseta index e tabela
  tabelaVerdade = [];
  contadorChave = 0;
  //#endregion
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

function substituiAlias(tabelaVerdade) {
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
