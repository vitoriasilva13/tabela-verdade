document.addEventListener("DOMContentLoaded", () => {
  fetch("assets/tab-content/calculadora.html")
    .then(function (response) {
      return response.text();
    })
    .then(function (body) {
      document.getElementById("pills-main").innerHTML = body;
      Inicio(); //Instancia botões em tabela-verdade.js
    });
  fetch("assets/tab-content/info.html")
    .then(function (response) {
      return response.text();
    })
    .then(function (body) {
      document.getElementById("pills-info").innerHTML = body;
    });

  fetch("assets/tab-content/config.html")
    .then(function (response) {
      return response.text();
    })
    .then(function (body) {
      document.getElementById("pills-config").innerHTML = body;
    });

  fetch("assets/tab-content/hist.html")
    .then(function (response) {
      return response.text();
    })
    .then(function (body) {
      document.getElementById("pills-hist").innerHTML = body;
    });

  var splashScreen = document.getElementsByClassName("splash")[0];
  setDelay(1500).then(() => (splashScreen.style.opacity = "0"));
  setDelay(6000).then(() => splashScreen.remove());
});

function setDelay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
