/* ============================================================
   VICOM LOCAÇÕES — Rastreamento de eventos (analytics)
   Eventos só são registrados por ação real do usuário.
   Nenhum dado pessoal é enviado: apenas nomes de eventos e
   parâmetros anônimos (categoria, equipamento, termo de busca).
   ============================================================ */
(function () {
  "use strict";

  function rastrear(nome, parametros) {
    var params = parametros || {};

    /* Google Analytics 4 (quando o ID estiver configurado) */
    if (window.VICOM_CONFIG && window.VICOM_CONFIG.gaId && typeof window.gtag === "function") {
      window.gtag("event", nome, params);
    }

    /* Camada de dados para qualquer ferramenta futura */
    window.dataLayer = window.dataLayer || [];
    params.evento = nome;
    window.dataLayer.push(params);

    /* Evento interno para integrações próprias */
    try {
      document.dispatchEvent(new CustomEvent("vicom:evento", { detail: { evento: nome, params: params } }));
    } catch (e) { /* navegadores muito antigos */ }

    if (window.console && console.debug) {
      console.debug("[analytics]", nome, params);
    }
  }

  window.rastrear = rastrear;
})();
