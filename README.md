# VICOM LOCAÇÕES — Website

Site institucional, catálogo de equipamentos e solicitação de orçamentos da **VICOM LOCAÇÕES** — locação de equipamentos para construção civil em São Luís/MA e região.

**Stack:** HTML + CSS + JavaScript puro (sem build, sem dependências). Funciona em qualquer hospedagem estática.

---

## Como visualizar o site

Basta dar **duplo clique em `index.html`**. Não é preciso instalar nada.

Para simular a hospedagem real (recomendado antes de publicar), o projeto inclui um servidor local sem instalação alguma:

```powershell
# Windows 10/11 (PowerShell), na pasta do projeto:
powershell -ExecutionPolicy Bypass -File tools\servidor-local.ps1
```

Depois acesse `http://localhost:8123/`. Alternativas: `python -m http.server 8080` (se tiver Python) ou `npx serve .` (se tiver Node.js).

---

## Estrutura do projeto

```
├── index.html                  Página inicial
├── equipamentos.html           Catálogo com busca e filtros
├── como-funciona.html          Processo de locação
├── sobre.html                  Página institucional
├── faq.html                    Perguntas frequentes
├── contato.html                Formulário de orçamento (envia via WhatsApp)
├── privacidade.html            Política de privacidade (LGPD)
├── termos.html                 Termos de uso
├── 404.html                    Página de erro
├── robots.txt / sitemap.xml    Arquivos de SEO
├── favicon.svg / site.webmanifest
├── equipamentos/               1 pasta por equipamento (URLs amigáveis)
│   └── <slug>/index.html       ← geradas automaticamente
├── assets/
│   ├── css/styles.css          Todo o estilo do site
│   ├── js/
│   │   ├── config.js           ★ WhatsApp, telefone e ID do analytics
│   │   ├── analytics.js        Rastreamento de eventos (view_home, click_whatsapp…)
│   │   ├── catalogo-data.js    ← gerado automaticamente
│   │   ├── main.js             Menu mobile, ano do rodapé, links de WhatsApp
│   │   ├── catalogo.js         Busca, filtros e cards do catálogo
│   │   └── orcamento.js        Validação e envio do formulário
│   └── img/equipamentos/       Ilustrações dos equipamentos (substituir por fotos)
├── dados/catalogo.json         ★ FONTE DA VERDADE do catálogo
└── tools/
    ├── gerar-paginas.ps1       Gera páginas, catalogo-data.js e sitemap.xml
    └── codificar-com-bom.ps1   Auxiliar de codificação (Windows PowerShell 5.1)
```

★ = arquivos que você edita. As páginas `equipamentos/<slug>/` e o `catalogo-data.js` são **gerados** por esse script — não edite manualmente.

---

## Como atualizar o catálogo

1. Abra `dados/catalogo.json` em um editor de texto (VS Code, Bloco de Notas salvo em UTF-8).
2. Edite categorias, equipamentos, descrições e especificações.
3. Rode o gerador no PowerShell, **dentro da pasta do projeto**:

```powershell
powershell -ExecutionPolicy Bypass -File tools\gerar-paginas.ps1
```

Pronto: as páginas de cada equipamento, o arquivo de dados da busca e o `sitemap.xml` são atualizados.

> **Importante:** as especificações do catálogo atual são **de demonstração**. Substitua pelos dados reais antes de publicar. Para adicionar um equipamento novo, acrescente um objeto em `equipamentos` com um `slug` único (sem acentos, minúsculas, com hífens).

### Substituindo as ilustrações por fotos oficiais

1. Coloque as fotos em `assets/img/equipamentos/` (JPEG/WebP de 1200×900px é um bom ponto de partida; comprima antes de enviar).
2. No `catalogo.json`, troque o campo `imagem` (ex.: `"assets/img/equipamentos/betoneira.jpg"`) e ajuste `imagemAlt` com texto descritivo.
3. Rode o gerador novamente.

---

## Configurações importantes

### WhatsApp, telefone e analytics — `assets/js/config.js`

```js
whatsapp: "5598988544736",          // número comercial no formato internacional
telefoneExibicao: "(98) 98854-4736",
gaId: ""                            // cole o ID do Google Analytics 4 (G-XXXXXXX) para ativar
```

Sem ID de analytics, nenhum dado é coletado — os eventos ficam apenas no console (modo desenvolvedor).

### Domínio — busca e substituição

O domínio atual é um marcador: `https://www.vicomlocacoes.com.br`. Quando o domínio definitivo estiver ativo:

1. Substitua `https://www.vicomlocacoes.com.br` pelo domínio real em **todos** os `.html` da raiz, em `robots.txt` e na variável `$BaseUrl` de `tools/gerar-paginas.ps1`.
2. Rode o gerador novamente (atualiza canonicals, JSON-LD e sitemap).

### Como o formulário de orçamento funciona

O site é 100% estático: o formulário valida os dados no navegador e **monta a solicitação pronta no WhatsApp** (wa.me) da equipe — sem servidor e sem armazenar dados. A confirmação só aparece depois que o atendimento é aberto.

Se no futuro a empresa quiser receber as solicitações também por e-mail ou banco de dados (RF-04 do PRD), basta substituir o envio em `orcamento.js` por uma chamada a um serviço (ex.: Formspree, Supabase ou uma API própria), mantendo a mesma validação.

---

## Publicação

Funciona em qualquer hospedagem estática (cPanel, Hostinger, Netlify, Vercel, Cloudflare Pages):

1. Envie **todos os arquivos e pastas** para a raiz do domínio (public_html / www).
2. Ative HTTPS (gratuito na Netlify/Cloudflare; a maioria dos hosts brasileiros oferece Let's Encrypt no painel).
3. Após publicar, verifique no Google Search Console: envie o `sitemap.xml` e confira se as páginas foram indexadas.
4. Teste o formulário e os botões de WhatsApp no celular.

---

## Checklist antes de publicar

Conteúdo pendente de validação da empresa (itens do PRD, seção 16):

- [ ] Lista oficial de equipamentos e categorias (hoje: catálogo de demonstração)
- [ ] Fotos oficiais e especificações técnicas reais
- [ ] Respostas do FAQ validadas pela equipe comercial (`faq.html` tem comentários de orientação)
- [ ] Texto institucional aprovado (`sobre.html`)
- [ ] Política de privacidade e termos revisados pelo responsável jurídico
- [ ] Domínio e hospedagem contratados; HTTPS ativo
- [ ] ID do Google Analytics 4 configurado em `config.js` (opcional)
- [ ] Perfil da Empresa no Google (Google Meu Negócio) cadastrado
- [ ] Teste final do WhatsApp no celular Android e iPhone

---

## Navegadores suportados

Versões atuais de Chrome, Safari, Firefox e Edge (desktop e mobile). O site respeita navegação por teclado, contraste adequado e a preferência do sistema por movimento reduzido.
