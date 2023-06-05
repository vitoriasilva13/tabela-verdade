# :date: Gerador de Tabela Verdade
Um gerador de tabela verdade feito com Javascript, HTML e CSS. Acesse em: https://vitoriasilva13.github.io/tabela-verdade/

## :wrench: Ajustes e Melhorias
Novos recursos, correção de bugs e otimizações de desempenho estão em planejamento. O projeto está em constante melhoria.

## :bookmark_tabs: Uso
1. Informe a expressão lógica desejada.
2. Clique no botão RES.
3. Uma tabela com o resultado será gerada e mostrada abaixo da área de inserção de expressão lógica.

## Função ``geraVFProposicao()``

Levando em consideração a forma de se dar valor para proposições de uma expressão lógica e montar uma tabela verdade, onde sabemos que, por exemplo, uma expressão com 3 proposições terá 8 linhas e seus valores terão que se intercalar no padrão:
- Proposição 1 = 8/2
- Proposição 2 = 8/4
- Proposição 3 = 8/8

Foi criada a seguinte função para dar estes valores iniciais às proposições:

```javascript
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
```
Analisando ``i % 2 ** (totalColunas - contadorChave) < 2 ** (totalColunas - contadorChave) / 2 ? true : false``
Para uma expressão A∨B:
- totalLinhas = 2² = 4
- totalColunas = 2 (quantidade de proposições)
- contadorChave = A=0 e B=1 (ordem em que são analisadas as proposições para serem inseridas no array final da tabela verdade)

Para A:
- x = ``2**(totalColunas - contadorChave)`` sendo o mesmo que ``2**(2 - 0)`` => ``4``
- y = ``2**(totalColunas - contadorChave)/2`` sendo o mesmo que ``2**(2 - 0)/2`` => ``2``

<table>
  <tr>
    <th>i</th>
    <th>i % 4 (i % x)</th>
    <th>i % 4 < 2 (i % x < y)</th>
    <th>resultado</th>
  </tr>
  <tr>
    <td>0</td>
    <td>0</td>
    <td>0 < 2</td>
    <td>true</td>
  </tr>
  <tr>
    <td>1</td>
    <td>1</td>
    <td>1 < 2</td>
    <td>true</td>
  </tr>
  <tr>
    <td>2</td>
    <td>2</td>
    <td>2 < 2</td>
    <td>false</td>
  </tr>
  <tr>
    <td>3</td>
    <td>3</td>
    <td>3 < 2</td>
    <td>false</td>
  </tr>
</table>

Para B:
- x = ``2**(totalColunas - contadorChave)`` sendo o mesmo que ``2**(2 - 1)`` => ``2``
- y = ``2**(totalColunas - contadorChave)/2`` sendo o mesmo que ``2**(2 - 1)/2`` => ``1``

<table>
  <tr>
    <th>i</th>
    <th>i % 2 (i % x)</th>
    <th>i % 2 < 1 (i % x < y)</th>
    <th>resultado</th>
  </tr>
  <tr>
    <td>0</td>
    <td>0</td>
    <td>0 < 1</td>
    <td>true</td>
  </tr>
  <tr>
    <td>1</td>
    <td>1</td>
    <td>1 < 1</td>
    <td>false</td>
  </tr>
  <tr>
    <td>2</td>
    <td>0</td>
    <td>0 < 1</td>
    <td>true</td>
  </tr>
  <tr>
    <td>3</td>
    <td>1</td>
    <td>1 < 1</td>
    <td>false</td>
  </tr>
</table>

Logo, para a expressão A∨B que criará as duas primeiras colunas da tabela verdade percorrendo 2 vezes ``i % 2 ** (totalColunas - contadorChave) < 2 ** (totalColunas - contadorChave) / 2 ? true : false``, teremos como resultado da função os seguintes dados:

<table>
  <tr>
    <th>A</th>
    <th>B</th>
  </tr>
  <tr>
    <td>true</td>
    <td>true</td>
  </tr>
  <tr>
    <td>true</td>
    <td>false</td>
  </tr>
  <tr>
    <td>false</td>
    <td>true</td>
  </tr>
  <tr>
    <td>false</td>
    <td>false</td>
  </tr>
</table>
