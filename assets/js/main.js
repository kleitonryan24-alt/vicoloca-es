/* ============================================================
   VICOM LOCAÇÕES — Comportamento comum a todas as páginas
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Menu mobile ---------- */
  var botaoMenu = document.querySelector("[data-botao-menu]");
  var nav = document.querySelector("[data-nav]");

  if (botaoMenu && nav) {
    function alternarMenu(abrir) {
      nav.setAttribute("data-aberto", abrir ? "true" : "false");
      botaoMenu.setAttribute("aria-expanded", abrir ? "true" : "false");
      botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    }

    botaoMenu.addEventListener("click", function () {
      alternarMenu(nav.getAttribute("data-aberto") !== "true");
    });

    nav.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) alternarMenu(false);
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && nav.getAttribute("data-aberto") === "true") {
        alternarMenu(false);
        botaoMenu.focus();
      }
    });
  }

  /* ---------- Ano do rodapé ---------- */
  document.querySelectorAll(".ano-atual").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Links de WhatsApp: mensagem contextual + rastreamento ---------- */
  document.querySelectorAll("a[data-whatsapp]").forEach(function (link) {
    var contexto = link.getAttribute("data-whatsapp");
    var mensagem = window.VICOM_CONFIG.mensagemPadrao;

    if (contexto === "equipamento" && link.getAttribute("data-equipamento")) {
      mensagem =
        "Olá! Acessei o site da VICOM LOCAÇÕES e gostaria de solicitar um orçamento para locação de: " +
        link.getAttribute("data-equipamento") + ".";
    } else if (contexto === "duvida") {
      mensagem = "Olá! Acessei o site da VICOM LOCAÇÕES e gostaria de tirar uma dúvida sobre a locação de equipamentos.";
    }

    link.setAttribute("href", window.montarLinkWhatsApp(mensagem));
    link.setAttribute("rel", "noopener");
    link.addEventListener("click", function () {
      if (window.rastrear) window.rastrear("click_whatsapp", { contexto: contexto || "geral" });
    });
  });
})();
