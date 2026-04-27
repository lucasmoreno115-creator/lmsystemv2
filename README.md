# LM System Zero

Arquivos prontos para rodar o app:

- `index.html`
- `style.css`
- `script.js`
- `workers/api.js`
- `sql/schema.sql`
- `wrangler.toml`

## 1. Frontend

Suba `index.html`, `style.css` e `script.js` no GitHub Pages.

No `index.html`, confira a URL:

```html
<meta name="lm-api-base" content="https://lmsystemv2-api-v2.lucasmoreno115.workers.dev" />
```

Ela precisa apontar para seu Worker publicado.

## 2. Backend

Substitua `workers/api.js`.

## 3. D1

Rode o schema:

```bash
wrangler d1 execute lm_system --remote --file=./sql/schema.sql
```

O Worker também tem `ensureSchema`, então ele tenta criar/ajustar colunas automaticamente.

## 4. Deploy Worker

```bash
wrangler deploy
```

## 5. Teste

Teste a API:

```bash
curl https://lmsystemv2-api-v2.lucasmoreno115.workers.dev/api/health
```

Teste o diagnóstico pelo app.

## Observação importante

No formulário, `stressLevel` segue esta direção:

- 1 = estresse muito alto
- 5 = estresse muito baixo

Por isso a dimensão `recovery` usa `sleepQuality + stressLevel`, sem inverter.
