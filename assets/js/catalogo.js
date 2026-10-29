/* ============================================================
   VICOM LOCAÇÕES — Catálogo de equipamentos
   Consome os dados gerados em assets/js/catalogo-data.js
   Estados: carregando, erro, vazio e com resultados.
   ============================================================ */
(function () {
  "use strict";

  var corpo = document.body;
  var ehPaginaCatalogo = corpo.getAttribute("data-pagina") === "equipamentos";

  function escapar(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function encontrarCategoria(categorias, slug) {
    for (var i = 0; i < categorias.length; i++) {
      if (categorias[i].slug === slug) return categorias[i];
    }
    return null;
  }

  function montarCard(equipamento, categoria) {
    return (
      '<article class="card-equipamento">' +
        "<figure>" +
          '<img src="' + escapar(equipamento.imagem) + '" alt="' + escapar(equipamento.imagemAlt) + '" loading="lazy" width="640" height="480">' +
          '<figcaption><span class="etiqueta-categoria">' + escapar(categoria ? categoria.nome : "") + "</span></figcaption>" +
        "</figure>" +
        '<div class="card-corpo">' +
          "<h3><a href=\"equipamentos/" + escapar(equipamento.slug) + '/">' + escapar(equipamento.nome) + "</a></h3>" +
          '<p class="card-descricao">' + escapar(equipamento.resumo) + "</p>" +
          '<div class="card-acoes">' +
            '<a class="botao botao--contorno" href="equipamentos/' + escapar(equipamento.slug) + '/">Ver detalhes</a>' +
            '<a class="botao botao--whatsapp" data-whatsapp="equipamento" data-equipamento="' + escapar(equipamento.nome) + '" href="#">Orçar no WhatsApp</a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function conectarWhatsApp(escopo) {
    (escopo || document).querySelectorAll("a[data-whatsapp]").forEach(function (link) {
      if (link.getAttribute("href") && link.getAttribute("href") !== "#") return;
      var contexto = link.getAttribute("data-whatsapp");
      var nome = link.getAttribute("data-equipamento");
      var mensagem = window.VICOM_CONFIG.mensagemPadrao;
      if (contexto === "equipamento" && nome) {
        mensagem =
          "Olá! Acessei o site da VICOM LOCAÇÕES e gostaria de solicitar um orçamento para locação de: " + nome + ".";
      }
      link.setAttribute("href", window.montarLinkWhatsApp(mensagem));
      link.setAttribute("rel", "noopener");
      link.addEventListener("click", function () {
        if (window.rastrear) window.rastrear("click_whatsapp", { contexto: contexto || "geral" });
      });
    });
  }

  /* ---------- Página inicial: categorias e destaques ---------- */
  function iniciarInicio() {
    var alvoCategorias = document.querySelector("[data-categorias-inicio]");
    var alvoDestaques = document.querySelector("[data-destaques]");
    if (!alvoCategorias && !alvoDestaques) return;

    var dados = window.VICOM_CATALOGO;
    if (!dados || !dados.categorias) {
      if (alvoCategorias) alvoCategorias.innerHTML =
        '<div class="estado-vazio"><h3>Catálogo temporariamente indisponível</h3>' +
        '<p>Não foi possível carregar os equipamentos agora. Tente recarregar a página ou fale conosco pelo WhatsApp.</p></div>';
      return;
    }

    if (alvoCategorias) {
      alvoCategorias.innerHTML = dados.categorias.map(function (cat) {
        return (
          '<a class="card-categoria" href="equipamentos.html?categoria=' + escapar(cat.slug) + '">' +
            "<figure>" +
              '<img src="' + escapar(cat.imagem) + '" alt="' + escapar(cat.imagemAlt) + '" loading="lazy" width="640" height="480">' +
            "</figure>" +
            '<div class="card-corpo">' +
              "<h3>" + escapar(cat.nome) + "</h3>" +
              '<p class="card-descricao">' + escapar(cat.descricao) + "</p>" +
              '<span class="card-cta">Ver equipamentos →</span>' +
            "</div>" +
          "</a>"
        );
      }).join("");
    }

    if (alvoDestaques) {
      var destaques = (dados.equipamentos || []).filter(function (eq) { return eq.destaque; }).slice(0, 4);
      alvoDestaques.innerHTML = destaques.map(function (eq) {
        return montarCard(eq, encontrarCategoria(dados.categorias, eq.categoria));
      }).join("");
      conectarWhatsApp(alvoDestaques);
    }

    if (window.rastrear) window.rastrear("view_home", {});
  }

  /* ---------- Página do catálogo: busca e filtros ---------- */
  function iniciarCatalogo() {
    if (!ehPaginaCatalogo) return;

    var alvoResultados = document.querySelector("[data-resultados]");
    var alvoContagem = document.querySelector("[data-contagem]");
    var alvoChips = document.querySelector("[data-filtros]");
    var campoBusca = document.querySelector("[data-busca]");
    var botaoLimpar = document.querySelector("[data-limpar]");
    var avisoLimpar = document.querySelector("[data-aviso-limpar]");

    var estado = { termo: "", categoria: "" };

    function mostrarCarregando() {
      if (alvoResultados) {
        alvoResultados.innerHTML =
          '<div class="estado-carregando" aria-hidden="true">' +
          '<div class="esqueleto"></div><div class="esqueleto"></div><div class="esqueleto"></div>' +
          "</div>";
      }
    }

    function atualizarURL() {
      var url = new URL(window.location.href);
      if (estado.categoria) url.searchParams.set("categoria", estado.categoria);
      else url.searchParams.delete("categoria");
      window.history.replaceState({}, "", url);
    }

    function renderizar() {
      var dados = window.VICOM_CATALOGO;
      if (!dados) {
        alvoResultados.innerHTML =
          '<div class="estado-vazio"><h3>Falha ao carregar o catálogo</h3>' +
          "<p>Ocorreu um erro temporário. Recarregue a página ou solicite atendimento pelo WhatsApp.</p>" +
          '<p class="mt-2"><a class="botao botao--whatsapp" data-whatsapp="geral" href="#">Falar no WhatsApp</a></p></div>';
        conectarWhatsApp(alvoResultados);
        return;
      }

      var termo = estado.termo.trim().toLowerCase();
      var filtrados = dados.equipamentos.filter(function (eq) {
        var okCategoria = !estado.categoria || eq.categoria === estado.categoria;
        var okTermo =
          !termo ||
          eq.nome.toLowerCase().indexOf(termo) !== -1 ||
          eq.resumo.toLowerCase().indexOf(termo) !== -1 ||
          (eq.aplicacoes || []).join(" ").toLowerCase().indexOf(termo) !== -1;
        return okCategoria && okTermo;
      });

      if (alvoContagem) {
        alvoContagem.textContent = filtrados.length === 1
          ? "1 equipamento encontrado"
          : filtrados.length + " equipamentos encontrados";
      }

      if (botaoLimpar) {
        var temFiltro = !!(estado.categoria || estado.termo.trim());
        botaoLimpar.disabled = !temFiltro;
      }

      if (!filtrados.length) {
        alvoResultados.innerHTML =
          '<div class="estado-vazio"><h3>Nenhum equipamento encontrado</h3>' +
          "<p>Não encontramos resultados para a sua busca. Tente outro termo, remova os filtros ou fale com nossa equipe para verificar outras opções.</p>" +
          '<p class="mt-2"><a class="botao botao--contorno" data-limpar-inline href="#">Limpar filtros</a> ' +
          '<a class="botao botao--whatsapp" data-whatsapp="geral" href="#">Falar no WhatsApp</a></p></div>';
        var limparInline = alvoResultados.querySelector("[data-limpar-inline]");
        if (limparInline) limparInline.addEventListener("click", function (e) { e.preventDefault(); limparTudo(); });
        conectarWhatsApp(alvoResultados);
        return;
      }

      alvoResultados.innerHTML = '<div class="grade-equipamentos">' + filtrados.map(function (eq) {
        return montarCard(eq, encontrarCategoria(dados.categorias, eq.categoria));
      }).join("") + "</div>";
      conectarWhatsApp(alvoResultados);
    }

    function limparTudo() {
      estado.termo = "";
      estado.categoria = "";
      if (campoBusca) campoBusca.value = "";
      marcarChips();
      atualizarURL();
      renderizar();
      if (avisoLimpar) {
        avisoLimpar.textContent = "Filtros limpos.";
        window.setTimeout(function () { avisoLimpar.textContent = ""; }, 2500);
      }
    }

    function marcarChips() {
      if (!alvoChips) return;
      alvoChips.querySelectorAll(".filtro-chip").forEach(function (chip) {
        chip.setAttribute("aria-pressed", chip.getAttribute("data-categoria") === estado.categoria ? "true" : "false");
      });
    }

    var dados = window.VICOM_CATALOGO;

    mostrarCarregando();

    if (!dados || !dados.equipamentos) {
      renderizar();
      return;
    }

    /* Chips de categoria */
    if (alvoChips) {
      var todos = { slug: "", nome: "Todos" };
      var listaChips = [todos].concat(dados.categorias);
      alvoChips.innerHTML = listaChips.map(function (cat) {
        return '<button type="button" class="filtro-chip" data-categoria="' + escapar(cat.slug) + '" aria-pressed="false">' + escapar(cat.nome) + "</button>";
      }).join("");

      alvoChips.addEventListener("click", function (evento) {
        var chip = evento.target.closest(".filtro-chip");
        if (!chip) return;
        estado.categoria = chip.getAttribute("data-categoria");
        marcarChips();
        atualizarURL();
        renderizar();
        if (window.rastrear) {
          window.rastrear("filter_category", { categoria: estado.categoria || "todas" });
        }
      });
    }

    /* Busca com atraso para não rastrear cada tecla */
    if (campoBusca) {
      var temporizador = null;
      campoBusca.addEventListener("input", function () {
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(function () {
          estado.termo = campoBusca.value;
          renderizar();
          if (window.rastrear && estado.termo.trim().length >= 2) {
            window.rastrear("search_equipment", { termo: estado.termo.trim().toLowerCase() });
          }
        }, 350);
      });
    }

    if (botaoLimpar) {
      botaoLimpar.addEventListener("click", function (evento) {
        evento.preventDefault();
        limparTudo();
      });
    }

    /* Categoria vinda da URL (link da página inicial) */
    var categoriaURL = new URL(window.location.href).searchParams.get("categoria");
    if (categoriaURL && encontrarCategoria(dados.categorias, categoriaURL)) {
      estado.categoria = categoriaURL;
    }

    marcarChips();
    renderizar();
    if (window.rastrear) window.rastrear("view_catalog", { categoria: estado.categoria || "todas" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      iniciarInicio();
      iniciarCatalogo();
    } catch (erro) {
      if (window.console && console.error) console.error("[catalogo]", erro);
    }
  });
})();
