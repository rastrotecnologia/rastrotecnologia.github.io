# Site Rastro Sistemas e Tecnologias

Site institucional publicado em **https://lucasfdias90.github.io/rastro** via GitHub Pages.

## Como atualizar o site

1. Edite os arquivos-fonte: `index.html`, `servicos.html`, `rastreamento.html`, `precos.html`, `sobre.html`, `contato.html`, `css/style.css`, `js/main.js` ou `img/`.
2. Suba as mudanças para o repositório:

```
git add .
git commit -m "descricao da alteracao"
git push
```

3. O GitHub Actions gera as páginas automaticamente e publica em ~1 minuto.

## Estrutura

- `*.html` — páginas-fonte
- `css/style.css` — estilos
- `js/main.js` — scripts (abas, menu, carregamento de preços)
- `img/` — logo
- `build_selfcontained.py` — gera as páginas autocontidas em `deploy_html/` (CSS/JS inline) para o Pages
- `.github/workflows/pages.yml` — publicação automática
