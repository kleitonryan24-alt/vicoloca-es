/* ============================================================
   VICOM LOCAÇÕES — Configuração central do site
   Ajuste os valores abaixo quando houver dados definitivos.
   ============================================================ */
window.VICOM_CONFIG = {
  /* Número comercial no WhatsApp (formato internacional, com 55) */
  whatsapp: "5598988544736",
  telefoneExibicao: "(98) 98854-4736",

  /* Mensagem inicial padrão do WhatsApp */
  mensagemPadrao:
    "Olá! Acessei o site da VICOM LOCAÇÕES e gostaria de solicitar um orçamento para locação de equipamentos.",

  /* ID de medição (Google Analytics 4). Deixe vazio para desativar. */
  gaId: ""
};

/* Monta o link oficial wa.me com mensagem pré-preenchida. */
window.montarLinkWhatsApp = function (mensagem) {
  var texto = (mensagem || window.VICOM_CONFIG.mensagemPadrao).trim();
  return "https://wa.me/" + window.VICOM_CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
};
