document.addEventListener("DOMContentLoaded", () => {
    const tabela = gerarTabelaVerdade("A && B || !C && D");
    document.getElementsByTagName("div")[0].innerHTML = tabela;
})


function gerarTabelaVerdade(expressao) {
    const variaveis = obterVariaveis(expressao);
    const valoresVariaveis = gerarValoresVariaveis(variaveis);
    const resultadoExpressao = avaliarExpressao(expressao, variaveis);
    
    let tabela = "<table><thead><tr>";
    for (let i = 0; i < variaveis.length; i++) {
      tabela += "<th>" + variaveis[i] + "</th>";
    }
    tabela += "<th>Resultado</th></tr></thead><tbody>";
    
    for (let i = 0; i < valoresVariaveis.length; i++) {
      tabela += "<tr>";
      for (let j = 0; j < valoresVariaveis[i].length; j++) {
        tabela += "<td>" + valoresVariaveis[i][j] + "</td>";
      }
      tabela += "<td>" + resultadoExpressao[i] + "</td>";
      tabela += "</tr>";
    }
    
    tabela += "</tbody></table>";
    
    return tabela;
  }
  
  function obterVariaveis(expressao) {
    const variaveis = expressao.match(/[a-zA-Z]/g);
    return [...new Set(variaveis)];
  }
  
  function gerarValoresVariaveis(variaveis) {
    const totalLinhas = Math.pow(2, variaveis.length);
    let valoresVariaveis = [];
    
    for (let i = 0; i < totalLinhas; i++) {
      const valores = [];
      let binario = i.toString(2);
      
      while (binario.length < variaveis.length) {
        binario = "0" + binario;
      }
      
      for (let j = 0; j < binario.length; j++) {
        valores.push(parseInt(binario[j]));
      }
      
      valoresVariaveis.push(valores);
    }
    
    return valoresVariaveis;
  }
  
  function avaliarExpressao(expressao, variaveis) {
    const valoresVariaveis = gerarValoresVariaveis(variaveis);
    let resultadoExpressao = [];
    
    for (let i = 0; i < valoresVariaveis.length; i++) {
      const substituicoes = {};
      for (let j = 0; j < variaveis.length; j++) {
        substituicoes[variaveis[j]] = valoresVariaveis[i][j];
      }
      
      const resultado = eval(expressao.replace(/[a-zA-Z]/g, m => substituicoes[m]));
      resultadoExpressao.push(resultado);
    }
    
    return resultadoExpressao;
  }
  