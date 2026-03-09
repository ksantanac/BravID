# BRAV.ID — Site Institucional (Estático)

Breve descrição

Projeto estático do site institucional da BRAV.ID — landing page responsiva com navegação suave, carregamento de partials HTML, e um botão flutuante de WhatsApp.

Status

Este repositório contém os arquivos estáticos (HTML, CSS, JS e partials). Não há pipeline de build configurado; o projeto funciona abrindo `index.html` em um servidor estático.

Principais features

- Navegação responsiva com menu mobile.
- Rolagem suave para seções (smooth scroll).
- Inclusão dinâmica de partials via atributo `data-include` e `fetch` (ver `js/main.js`).
- Floating WhatsApp FAB com interações e animações.
- Estilo com Tailwind CDN + `css/styles.css` para tema e utilitários.

Como visualizar localmente

1. Opção rápida (abrir arquivo):

   - Abra `index.html` no navegador. Alguns navegadores limitam fetch local (partials), então recomenda-se um servidor HTTP.

2. Servidor estático simples (recomendado):

   - Python 3:

```bash
python -m http.server 8000
# depois abra http://localhost:8000
```

   - Ou use uma extensão/editor (Live Server) que sirva a pasta do projeto.

Estrutura do projeto

- `index.html` — página principal e ponto de entrada.
- `css/styles.css` — variáveis de tema e classes auxiliares.
- `js/main.js` — comportamento do site (menu mobile, smooth scroll, carregamento de partials, FAB).
- `partials/` — seções da página (sobre, serviços, time, contato, whatsapp-fab).
- `assets/` — imagens e recursos estáticos (logo, etc.).

Como o carregamento de partials funciona

O script `js/main.js` procura elementos com `data-include="partials/xxx.html"` e faz `fetch()` para injetar o HTML no DOM. A função `loadPartials()` é idempotente — só carrega uma vez.

Dicas rápidas para editar

- Para alterar uma seção: edite o arquivo correspondente em `partials/` (por exemplo `partials/sobre.html`).
- Para trocar o número do WhatsApp: edite `partials/whatsapp-fab.html`.
- Para ajustar estilos globais: edite `css/styles.css`.
- Para alterar comportamento JS: edite `js/main.js`. Se o código crescer, recomendo modularizar com ES Modules (`type="module"`) ou usar Vite para desenvolvimento.

Modularização (opcional)

Se preferir modularizar o JavaScript sem bundler, converta partes de `js/main.js` para módulos (por exemplo `js/utils.js`, `js/ui.js`) e atualize `index.html` para carregar `js/main.js` com `<script type="module" src="js/main.js"></script>`.

Deploy

- Qualquer host de arquivos estáticos funciona (Netlify, Vercel, GitHub Pages). Apenas publique a pasta com `index.html`, `css/`, `js/`, `partials/` e `assets/`.

Contribuições

Pull requests são bem-vindos para correções, melhoria de acessibilidade, otimização de imagens e modularização do JS.

Contato

Se quiser que eu ajuste a modularização ou configure um scaffold com Vite para desenvolvimento, diga qual opção prefere e eu implemento.

---
Última atualização: arquivo gerado automaticamente por assistente.
