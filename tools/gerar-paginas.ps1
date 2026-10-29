# ============================================================
# VICOM LOCAÇÕES — Gerador de páginas de equipamento
#
# Lê dados/catalogo.json e gera:
#   1) equipamentos/<slug>/index.html  (página individual de cada item)
#   2) assets/js/catalogo-data.js      (dados usados pela busca e pelos filtros)
#   3) sitemap.xml                     (mapa de páginas para o Google)
#
# Uso:  powershell -ExecutionPolicy Bypass -File tools\gerar-paginas.ps1
#
# Para atualizar o site com dados reais:
#   1. Edite dados/catalogo.json
#   2. Execute este script novamente
#   3. Substitua os SVGs em assets/img/equipamentos/ pelas fotos oficiais
# ============================================================

$ErrorActionPreference = "Stop"

# ---------- Configuração ----------
$BaseUrl      = "https://www.vicomlocacoes.com.br"   # trocar pelo domínio definitivo
$TelefoneEx   = "(98) 98854-4736"
$Raiz         = Split-Path -Parent $PSScriptRoot    # pasta raiz do site
$Utf8SemBom   = New-Object System.Text.UTF8Encoding($false)

# ---------- Leitura dos dados ----------
$jsonPath = Join-Path $Raiz "dados\catalogo.json"
$dados    = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

$categorias  = @($dados.categorias)
$equipamentos = @($dados.equipamentos)

function Esc([string]$t) {
    if ($null -eq $t) { return "" }
    return $t.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;")
}

function Buscar-Categoria([string]$slug) {
    foreach ($c in $categorias) { if ($c.slug -eq $slug) { return $c } }
    return $null
}

# ---------- 1) catalogo-data.js ----------
$catalogoJs = @"
/* Gerado automaticamente por tools/gerar-paginas.ps1 — não edite manualmente.
   Fonte: dados/catalogo.json ($($dados.atualizadoEm)) */
window.VICOM_CATALOGO = $((($dados | ConvertTo-Json -Depth 10)));
"@
[IO.File]::WriteAllText((Join-Path $Raiz "assets\js\catalogo-data.js"), $catalogoJs, $Utf8SemBom)
Write-Host "OK: assets/js/catalogo-data.js"

# ---------- Template da página de equipamento ----------
$template = @'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{NOME}} — Locação em São Luís/MA | VICOM LOCAÇÕES</title>
  <meta name="description" content="{{META_DESC}}">
  <link rel="canonical" href="{{BASE_URL}}/equipamentos/{{SLUG}}/">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="VICOM LOCAÇÕES">
  <meta property="og:title" content="{{NOME}} — Locação | VICOM LOCAÇÕES">
  <meta property="og:description" content="{{META_DESC}}">
  <meta property="og:url" content="{{BASE_URL}}/equipamentos/{{SLUG}}/">
  <link rel="icon" type="image/svg+xml" href="../../favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../assets/css/styles.css">
  <script type="application/ld+json">{{JSONLD}}</script>
</head>
<body data-pagina="equipamento" data-equipamento="{{SLUG}}">
  <a class="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>

  <header class="cabecalho">
    <div class="container cabecalho-interno">
      <a class="logo" href="../../index.html">
        <img src="../../favicon.svg" alt="" width="44" height="44">
        <span class="logo-texto">
          <span class="logo-nome">VICOM Locações</span>
          <span class="logo-slogan">Eficiência que constrói</span>
        </span>
      </a>
      <button class="botao-menu" type="button" data-botao-menu aria-expanded="false" aria-label="Abrir menu" aria-menu-principal="">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <nav class="nav-principal" data-nav aria-label="Navegação principal">
        <ul>
          <li><a href="../../index.html">Início</a></li>
          <li><a href="../../equipamentos.html" aria-current="page">Equipamentos</a></li>
          <li><a href="../../como-funciona.html">Como funciona</a></li>
          <li><a href="../../sobre.html">Sobre</a></li>
          <li><a href="../../faq.html">Dúvidas</a></li>
          <li><a href="../../contato.html">Contato</a></li>
        </ul>
      </nav>
      <div class="cabecalho-acoes">
        <a class="botao-whatsapp-topo" data-whatsapp="geral" href="#">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2z"/></svg>
          <span>WhatsApp</span>
        </a>
        <a class="botao botao--principal" href="../../contato.html?equipamento={{SLUG}}">Solicitar orçamento</a>
      </div>
    </div>
  </header>
  <div class="faixa-seguranca" aria-hidden="true"></div>

  <nav class="migalhas" aria-label="Você está em">
    <div class="container">
      <ol>
        <li><a href="../../index.html">Início</a></li>
        <li><a href="../../equipamentos.html">Equipamentos</a></li>
        <li><a href="../../equipamentos.html?categoria={{CATEGORIA_SLUG}}">{{CATEGORIA_NOME}}</a></li>
        <li><span aria-current="page">{{NOME}}</span></li>
      </ol>
    </div>
  </nav>

  <main id="conteudo">
    <section class="secao">
      <div class="container">
        <div class="equipamento-principal">
          <figure class="equipamento-figura sem-margem">
            <img src="../../{{IMAGEM}}" alt="{{IMAGEM_ALT}}" width="640" height="480">
          </figure>
          <div class="equipamento-info">
            <span class="rotulo">{{CATEGORIA_NOME}}</span>
            <h1>{{NOME}}</h1>
            <p class="equipamento-resumo">{{RESUMO}}</p>
            <div class="equipamento-acoes">
              <a class="botao botao--principal" href="../../contato.html?equipamento={{SLUG}}">Solicitar orçamento</a>
              <a class="botao botao--whatsapp" data-whatsapp="equipamento" data-equipamento="{{NOME}}" href="#">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2z"/></svg>
                Falar no WhatsApp
              </a>
            </div>

            <div class="bloco-conteudo">
              <h2>Sobre o equipamento</h2>
              {{DESCRICAO}}
            </div>

            <div class="bloco-conteudo">
              <h2>Principais aplicações</h2>
              <ul>{{APLICACOES}}</ul>
            </div>
          </div>
        </div>

        <div class="conteudo-texto mt-2">
          <h2>Especificações</h2>
          <table class="tabela-especificacoes">
            <caption class="somente-leitor">Especificações técnicas de {{NOME}}</caption>
            <tbody>{{ESPECIFICACOES}}</tbody>
          </table>
          <p class="aviso-tecnico">As especificações são descritivas e podem variar conforme a unidade disponível. Confirme os detalhes com a equipe no momento do orçamento.</p>

          <h2>Orientações básicas de uso</h2>
          <ul>{{ORIENTACOES}}</ul>

          <h2>Como funciona a locação</h2>
          <p>Solicite o orçamento informando o equipamento, a quantidade e o período desejado. Nossa equipe comercial entra em contato para confirmar as condições, a disponibilidade e os detalhes da entrega ou retirada. Confira também as <a href="../../faq.html" style="color:var(--laranja-escuro);font-weight:600">respostas às dúvidas frequentes</a>.</p>
          <p><a class="botao botao--principal" href="../../contato.html?equipamento={{SLUG}}">Solicitar orçamento para {{NOME}}</a></p>
        </div>
      </div>
    </section>

    <section class="secao secao--concreto">
      <div class="container">
        <div class="secao-cabecalho">
          <span class="rotulo">Você também pode precisar</span>
          <h2>Equipamentos relacionados</h2>
        </div>
        {{RELACIONADOS}}
      </div>
    </section>

    <section class="secao chamada-final">
      <div class="container chamada-final-interno">
        <div>
          <h2>Precisa deste equipamento na sua obra?</h2>
          <p>Fale com nossa equipe e receba um orçamento sem compromisso, com atendimento direto para São Luís e região.</p>
        </div>
        <div class="chamada-acoes">
          <a class="botao botao--contorno" href="../../contato.html?equipamento={{SLUG}}">Solicitar orçamento</a>
          <a class="botao botao--whatsapp" data-whatsapp="equipamento" data-equipamento="{{NOME}}" href="#">WhatsApp: {{TELEFONE}}</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="rodape">
    <div class="container">
      <div class="rodape-grade">
        <div>
          <a class="logo" href="../../index.html">
            <img src="../../favicon.svg" alt="" width="44" height="44">
            <span class="logo-texto">
              <span class="logo-nome">VICOM Locações</span>
              <span class="logo-slogan">Eficiência que constrói</span>
            </span>
          </a>
          <p>Locação de equipamentos para construção civil com atendimento direto e soluções para sua necessidade.</p>
        </div>
        <nav aria-label="Navegação do rodapé">
          <h3>Navegação</h3>
          <ul>
            <li><a href="../../equipamentos.html">Equipamentos</a></li>
            <li><a href="../../como-funciona.html">Como funciona</a></li>
            <li><a href="../../sobre.html">Sobre a VICOM</a></li>
            <li><a href="../../faq.html">Perguntas frequentes</a></li>
            <li><a href="../../contato.html">Contato e orçamento</a></li>
          </ul>
        </nav>
        <div>
          <h3>Atendimento</h3>
          <ul class="rodape-contato">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.8a2 2 0 0 1 1.7 2z"/></svg>
              <a data-whatsapp="geral" href="#">WhatsApp {{TELEFONE}}</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>São Luís e região — Maranhão</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="rodape-rodape">
        <p>© <span class="ano-atual"></span> VICOM LOCAÇÕES — Eficiência que constrói.</p>
        <nav aria-label="Links legais">
          <a href="../../privacidade.html">Política de privacidade</a>
          <a href="../../termos.html">Termos de uso</a>
        </nav>
      </div>
    </div>
  </footer>

  <a class="whatsapp-flutuante" data-whatsapp="geral" href="#" aria-label="Falar com a VICOM Locações pelo WhatsApp">
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2z"/></svg>
    <span>WhatsApp</span>
  </a>

  <script src="../../assets/js/config.js"></script>
  <script src="../../assets/js/analytics.js"></script>
  <script src="../../assets/js/main.js"></script>
  <script>
    window.addEventListener("DOMContentLoaded", function () {
      if (window.rastrear) window.rastrear("view_equipment", { equipamento: "{{SLUG}}", categoria: "{{CATEGORIA_SLUG}}" });
    });
  </script>
</body>
</html>
'@

# ---------- Geração das páginas individuais ----------
foreach ($eq in $equipamentos) {
    $cat = Buscar-Categoria $eq.categoria
    $pastaSaida = Join-Path $Raiz ("equipamentos\" + $eq.slug)
    if (-not (Test-Path $pastaSaida)) { New-Item -ItemType Directory -Path $pastaSaida -Force | Out-Null }

    # Descrição e listas
    $descricaoHtml = ($eq.descricao | ForEach-Object { "<p>" + (Esc $_) + "</p>" }) -join ""
    $aplicacoesHtml = ($eq.aplicacoes | ForEach-Object { "<li>" + (Esc $_) + "</li>" }) -join ""
    $orientacoesHtml = ($eq.orientacoes | ForEach-Object { "<li>" + (Esc $_) + "</li>" }) -join ""
    $especHtml = ($eq.especificacoes | ForEach-Object {
        "<tr><th scope=`"row`">" + (Esc $_.rotulo) + "</th><td>" + (Esc $_.valor) + "</td></tr>"
    }) -join ""

    # Relacionados: mesmo categoria; completa com destaques de outras categorias
    $relacionados = @($equipamentos | Where-Object { $_.categoria -eq $eq.categoria -and $_.slug -ne $eq.slug })
    foreach ($outro in $equipamentos) {
        if ($relacionados.Count -ge 3) { break }
        if ($outro.slug -ne $eq.slug -and $outro.categoria -ne $eq.categoria) { $relacionados += $outro }
    }
    $relacionadosHtml = '<div class="grade-equipamentos">' + (($relacionados | Select-Object -First 3 | ForEach-Object {
        $catRel = Buscar-Categoria $_.categoria
        '<article class="card-equipamento">' +
          '<figure><img src="../../' + (Esc $_.imagem) + '" alt="' + (Esc $_.imagemAlt) + '" loading="lazy" width="640" height="480">' +
          '<figcaption><span class="etiqueta-categoria">' + (Esc $catRel.nome) + '</span></figcaption></figure>' +
          '<div class="card-corpo"><h3><a href="../' + (Esc $_.slug) + '/">' + (Esc $_.nome) + '</a></h3>' +
          '<p class="card-descricao">' + (Esc $_.resumo) + '</p>' +
          '<div class="card-acoes">' +
            '<a class="botao botao--contorno" href="../' + (Esc $_.slug) + '/">Ver detalhes</a>' +
            '<a class="botao botao--whatsapp" data-whatsapp="equipamento" data-equipamento="' + (Esc $_.nome) + '" href="#">Orçar no WhatsApp</a>' +
          '</div></div></article>'
    }) -join "") + '</div>'

    # JSON-LD: BreadcrumbList + Service (sem preço e sem disponibilidade fictícia)
    $jsonLd = @{
        "@context" = "https://schema.org"
        "@graph"   = @(
            @{
                "@type" = "BreadcrumbList"
                "itemListElement" = @(
                    @{ "@type" = "ListItem"; "position" = 1; "name" = "Início";             "item" = "$BaseUrl/" },
                    @{ "@type" = "ListItem"; "position" = 2; "name" = "Equipamentos";       "item" = "$BaseUrl/equipamentos.html" },
                    @{ "@type" = "ListItem"; "position" = 3; "name" = $cat.nome;            "item" = "$BaseUrl/equipamentos.html?categoria=$($cat.slug)" },
                    @{ "@type" = "ListItem"; "position" = 4; "name" = $eq.nome }
                )
            },
            @{
                "@type" = "Service"
                "name" = "Locação de " + $eq.nome
                "description" = $eq.resumo
                "url" = "$BaseUrl/equipamentos/$($eq.slug)/"
                "provider" = @{ "@type" = "Organization"; "name" = "VICOM LOCAÇÕES"; "telephone" = $TelefoneEx }
                "areaServed" = @{ "@type" = "City"; "name" = "São Luís"; "addressRegion" = "MA"; "addressCountry" = "BR" }
            }
        )
    } | ConvertTo-Json -Depth 8

    $html = $template.
        Replace("{{NOME}}", (Esc $eq.nome)).
        Replace("{{SLUG}}", $eq.slug).
        Replace("{{CATEGORIA_NOME}}", (Esc $cat.nome)).
        Replace("{{CATEGORIA_SLUG}}", $cat.slug).
        Replace("{{META_DESC}}", (Esc $eq.resumo)).
        Replace("{{RESUMO}}", (Esc $eq.resumo)).
        Replace("{{DESCRICAO}}", $descricaoHtml).
        Replace("{{APLICACOES}}", $aplicacoesHtml).
        Replace("{{ESPECIFICACOES}}", $especHtml).
        Replace("{{ORIENTACOES}}", $orientacoesHtml).
        Replace("{{IMAGEM}}", $eq.imagem).
        Replace("{{IMAGEM_ALT}}", (Esc $eq.imagemAlt)).
        Replace("{{RELACIONADOS}}", $relacionadosHtml).
        Replace("{{JSONLD}}", $jsonLd).
        Replace("{{BASE_URL}}", $BaseUrl).
        Replace("{{TELEFONE}}", $TelefoneEx)

    [IO.File]::WriteAllText((Join-Path $pastaSaida "index.html"), $html, $Utf8SemBom)
    Write-Host ("OK: equipamentos/" + $eq.slug + "/index.html")
}

# ---------- sitemap.xml ----------
$urls = New-Object System.Collections.Generic.List[string]
$urls.Add("$BaseUrl/")
foreach ($pagina in @("equipamentos.html", "como-funciona.html", "sobre.html", "faq.html", "contato.html", "privacidade.html", "termos.html")) {
    $urls.Add("$BaseUrl/$pagina")
}
foreach ($eq in $equipamentos) { $urls.Add("$BaseUrl/equipamentos/$($eq.slug)/") }

$prioridade = @{ "$BaseUrl/" = "1.0" }
$xml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n"
foreach ($u in $urls) {
    $p = if ($prioridade.ContainsKey($u)) { $prioridade[$u] } else { "0.7" }
    $xml += "  <url><loc>$u</loc><changefreq>monthly</changefreq><priority>$p</priority></url>`n"
}
$xml += "</urlset>`n"
[IO.File]::WriteAllText((Join-Path $Raiz "sitemap.xml"), $xml, $Utf8SemBom)
Write-Host "OK: sitemap.xml"

Write-Host ""
Write-Host "Geração concluída: $($equipamentos.Count) equipamentos e $($categorias.Count) categorias."
