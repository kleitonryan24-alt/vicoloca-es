/* ============================================================
   VICOM LOCAÇÕES — Formulário de orçamento
   Validação no navegador + envio da solicitação via WhatsApp.
   A confirmação só é exibida após a abertura do atendimento.
   ============================================================ */
(function () {
  "use strict";

  var formulario = document.querySelector("[data-formulario-orcamento]");
  if (!formulario) return;

  var painelSucesso = document.querySelector("[data-sucesso]");
  var painelFormulario = document.querySelector("[data-painel-formulario]");
  var botaoEnviar = formulario.querySelector("[data-enviar]");
  var campoEquipamento = formulario.querySelector("#equipamento");
  var campoTelefone = formulario.querySelector("#telefone");
  var campoQuantidade = formulario.querySelector("#quantidade");
  var campoPeriodo = formulario.querySelector("#periodo");
  var campoNome = formulario.querySelector("#nome");
  var campoCidade = formulario.querySelector("#cidade");
  var campoEmail = formulario.querySelector("#email");
  var campoDuracao = formulario.querySelector("#duracao");
  var campoObservacoes = formulario.querySelector("#observacoes");
  var campoAceite = formulario.querySelector("#aceite");
  var elementoMensagem = document.querySelector("[data-mensagem-gerada]");
  var botaoCopiar = document.querySelector("[data-copiar]");
  var avisoStatus = document.querySelector("[data-status-envio]");

  var enviando = false;
  var iniciado = false;
  var mensagemMontada = "";

  /* ---------- Preenche o select de equipamentos ---------- */
  function escapar(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function preencherEquipamentos() {
    if (!campoEquipamento || !window.VICOM_CATALOGO) return;
    var dados = window.VICOM_CATALOGO;
    var html = '<option value="">Selecione...</option>';

    dados.categorias.forEach(function (cat) {
      var itens = dados.equipamentos.filter(function (eq) { return eq.categoria === cat.slug; });
      if (!itens.length) return;
      html += '<optgroup label="' + escapar(cat.nome) + '">';
      itens.forEach(function (eq) {
        html += '<option value="' + escapar(eq.slug) + '">' + escapar(eq.nome) + "</option>";
      });
      html += "</optgroup>";
    });

    html += '<option value="outro">Outro equipamento / ainda não sei</option>';
    campoEquipamento.innerHTML = html;

    /* Pré-seleção vinda da página do equipamento ou da categoria */
    var params = new URL(window.location.href).searchParams;
    var equipamento = params.get("equipamento");
    var categoria = params.get("categoria");
    if (equipamento) {
      var opcao = campoEquipamento.querySelector('option[value="' + equipamento.replace(/"/g, "") + '"]');
      if (opcao) campoEquipamento.value = opcao.value;
    } else if (categoria) {
      dados.categorias.forEach(function (cat) {
        if (cat.slug === categoria) {
          campoEquipamento.innerHTML =
            '<optgroup label="' + escapar(cat.nome) + '">' +
            '<option value="' + escapar(cat.slug) + '">Locação de ' + escapar(cat.nome.toLowerCase()) + ' (especificar)</option>' +
            "</optgroup>" + campoEquipamento.innerHTML;
        }
      });
    }
  }

  /* ---------- Máscara de telefone ---------- */
  function formatarTelefone(valor) {
    var digitos = String(valor || "").replace(/\D/g, "").slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 6) return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2);
    if (digitos.length <= 10) return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 6) + "-" + digitos.slice(6);
    return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 7) + "-" + digitos.slice(7);
  }

  if (campoTelefone) {
    campoTelefone.addEventListener("input", function () {
      campoTelefone.value = formatarTelefone(campoTelefone.value);
    });
  }

  /* ---------- Validação ---------- */
  function definirErro(campo, mensagem) {
    var erro = formulario.querySelector('[data-erro-for="' + campo.id + '"]');
    if (mensagem) {
      campo.setAttribute("aria-invalid", "true");
      if (erro) erro.textContent = mensagem;
    } else {
      campo.removeAttribute("aria-invalid");
      if (erro) erro.textContent = "";
    }
    return !mensagem;
  }

  function validar() {
    var primeiroInvalido = null;

    var nomeOk = definirErro(campoNome,
      campoNome.value.trim().length >= 3 ? "" : "Informe seu nome completo.");
    if (!nomeOk && !primeiroInvalido) primeiroInvalido = campoNome;

    var digitos = campoTelefone.value.replace(/\D/g, "");
    var telefoneOk = definirErro(campoTelefone,
      digitos.length >= 10 && digitos.length <= 11 ? "" : "Informe um telefone válido com DDD, ex.: (98) 99999-9999.");
    if (!telefoneOk && !primeiroInvalido) primeiroInvalido = campoTelefone;

    var equipOk = definirErro(campoEquipamento,
      campoEquipamento.value ? "" : "Selecione o equipamento ou categoria de interesse.");
    if (!equipOk && !primeiroInvalido) primeiroInvalido = campoEquipamento;

    var cidadeOk = definirErro(campoCidade,
      campoCidade.value.trim().length >= 2 ? "" : "Informe a cidade da obra.");
    if (!cidadeOk && !primeiroInvalido) primeiroInvalido = campoCidade;

    var periodoOk = definirErro(campoPeriodo,
      campoPeriodo.value.trim().length >= 3 ? "" : "Informe a data ou o período desejado, ex.: 10/11 a 20/11.");
    if (!periodoOk && !primeiroInvalido) primeiroInvalido = campoPeriodo;

    var emailDigitado = campoEmail && campoEmail.value.trim();
    var emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailDigitado || "");
    var emailOk = definirErro(campoEmail,
      !emailDigitado || emailValido ? "" : "Informe um e-mail válido ou deixe o campo em branco.");
    if (!emailOk && !primeiroInvalido) primeiroInvalido = campoEmail;

    var aceiteErro = formulario.querySelector('[data-erro-for="aceite"]');
    if (!campoAceite.checked) {
      campoAceite.setAttribute("aria-invalid", "true");
      if (aceiteErro) aceiteErro.textContent = "É necessário aceitar o aviso de privacidade para enviar a solicitação.";
      if (!primeiroInvalido) primeiroInvalido = campoAceite;
    } else {
      campoAceite.removeAttribute("aria-invalid");
      if (aceiteErro) aceiteErro.textContent = "";
    }

    return primeiroInvalido;
  }

  /* ---------- Montagem da mensagem ---------- */
  function montarMensagem() {
    var nomeEquipamento = "";
    if (campoEquipamento.value === "outro") {
      nomeEquipamento = "Outro equipamento (ver com a equipe)";
    } else if (campoEquipamento.value) {
      var opcao = campoEquipamento.options[campoEquipamento.selectedIndex];
      nomeEquipamento = opcao ? opcao.text : campoEquipamento.value;
    }

    var linhas = [
      "Solicitação de orçamento — VICOM LOCAÇÕES",
      "",
      "Equipamento: " + nomeEquipamento,
      "Quantidade: " + (campoQuantidade && campoQuantidade.value ? campoQuantidade.value : "não informada"),
      "Período desejado: " + campoPeriodo.value.trim(),
      "Duração estimada: " + (campoDuracao && campoDuracao.value.trim() ? campoDuracao.value.trim() : "não informada"),
      "Cidade da obra: " + campoCidade.value.trim(),
      "",
      "Nome: " + campoNome.value.trim(),
      "Telefone: " + campoTelefone.value,
      "E-mail: " + (campoEmail && campoEmail.value.trim() ? campoEmail.value.trim() : "não informado")
    ];

    if (campoObservacoes && campoObservacoes.value.trim()) {
      linhas.push("Observações: " + campoObservacoes.value.trim());
    }

    return linhas.join("\n");
  }

  /* ---------- Eventos de foco (início do preenchimento) ---------- */
  formulario.addEventListener("focusin", function () {
    if (!iniciado) {
      iniciado = true;
      if (window.rastrear) window.rastrear("start_quote", {});
    }
  });

  /* ---------- Envio ---------- */
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (enviando) return;

    /* Proteção simples contra bots: campo oculto preenchido por robôs */
    var armadilha = formulario.querySelector("[data-armadilha]");
    if (armadilha && armadilha.value) return;

    var primeiroInvalido = validar();
    if (primeiroInvalido) {
      if (avisoStatus) avisoStatus.textContent = "Revise os campos destacados para continuar.";
      primeiroInvalido.focus();
      return;
    }

    if (avisoStatus) avisoStatus.textContent = "";
    enviando = true;
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Preparando atendimento...";

    mensagemMontada = montarMensagem();
    var link = window.montarLinkWhatsApp(mensagemMontada);
    var janela = window.open(link, "_blank", "noopener");

    var linkSucesso = document.querySelector("[data-whatsapp-sucesso]");
    if (linkSucesso) linkSucesso.setAttribute("href", link);

    if (window.rastrear) window.rastrear("submit_quote", {});

    if (elementoMensagem) elementoMensagem.textContent = mensagemMontada;
    if (painelFormulario) painelFormulario.hidden = true;
    if (painelSucesso) {
      painelSucesso.setAttribute("data-visivel", "true");
      painelSucesso.setAttribute("tabindex", "-1");
      painelSucesso.focus();
    }

    if (window.rastrear) window.rastrear("quote_success", { canal: "whatsapp" });

    /* Bloqueio contra envio duplicado acidental */
    window.setTimeout(function () {
      enviando = false;
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = "Enviar solicitação pelo WhatsApp";
    }, 8000);

    /* Caso o navegador bloqueie a nova aba, oferece o link explícito */
    if (!janela) {
      var avisoBloqueio = document.querySelector("[data-aviso-bloqueio]");
      if (avisoBloqueio) avisoBloqueio.hidden = false;
    }
  });

  /* ---------- Copiar mensagem ---------- */
  if (botaoCopiar) {
    botaoCopiar.addEventListener("click", function () {
      function confirmar() {
        botaoCopiar.textContent = "Mensagem copiada!";
        window.setTimeout(function () { botaoCopiar.textContent = "Copiar mensagem"; }, 2500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mensagemMontada).then(confirmar, function () {
          window.prompt("Copie a mensagem abaixo:", mensagemMontada);
        });
      } else {
        window.prompt("Copie a mensagem abaixo:", mensagemMontada);
      }
    });
  }

  /* ---------- Refazer a solicitação ---------- */
  var botaoRefazer = document.querySelector("[data-refazer]");
  if (botaoRefazer) {
    botaoRefazer.addEventListener("click", function (evento) {
      evento.preventDefault();
      if (painelSucesso) painelSucesso.setAttribute("data-visivel", "false");
      if (painelFormulario) painelFormulario.hidden = false;
      if (campoNome) {
        campoNome.focus();
        campoNome.scrollIntoView({ block: "center" });
      }
    });
  }

  preencherEquipamentos();
})();
