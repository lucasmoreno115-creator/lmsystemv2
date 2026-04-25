# LM System

Sistema de diagnóstico com frontend estático em Cloudflare Pages e API isolada em Cloudflare Workers + D1.

## Arquitetura SaaS recomendada (definitiva)

- **Frontend**: Cloudflare Pages (apenas assets estáticos).
- **API**: Worker dedicado (`workers/api.js`) responsável por `POST /api/diagnostic/evaluate`.
- **Banco**: D1 vinculado no Worker via binding `DB`.
- **Contrato de resposta**: `{ ok, leadId, engineVersion, result }`.

> Decisão: adotar arquitetura **Worker-first** e remover completamente Pages Functions para eliminar ambiguidades de runtime e evitar execução de código antigo.

## Estrutura final de pastas

```text
/workers/api.js                         # único backend em produção e desenvolvimento
/src/server/diagnostic/evaluateEndpoint.js
/src/server/diagnostic/diagnosticPersistence.js
/src/server/db/d1Client.js
/src/ui/remoteDiagnosticClient.js
/wrangler.toml
```

## Configuração de endpoint no frontend

O frontend usa por padrão endpoint relativo:

- `'/api/diagnostic/evaluate'`

Opcionalmente, para API em subdomínio/host distinto, configure **sem hardcode no código**:

1. Meta tag no HTML:

```html
<meta name="lm-api-base" content="https://api.seudominio.com">
```

ou

2. Variável global antes do bundle principal:

```html
<script>window.__LM_API_BASE__ = 'https://api.seudominio.com';</script>
```

## Deploy (wrangler)

### 1) Login

```bash
wrangler login
```

### 2) Criar/migrar D1 (se necessário)

```bash
wrangler d1 create lmsystemv2-db
wrangler d1 migrations apply lmsystemv2-db --remote
```

### 3) Deploy do Worker da API

```bash
wrangler deploy
```

### 4) (Opcional, recomendado em produção) rotear `/api/*` para o Worker

No `wrangler.toml`, configure `routes` para seu domínio:

```toml
routes = [
  { pattern = "app.seudominio.com/api/*", zone_name = "seudominio.com" }
]
```

Depois:

```bash
wrangler deploy
```

## Build/deploy limpo (sem cache fantasma)

```bash
rm -rf node_modules
rm -rf .wrangler
npm install
wrangler deploy
```

## Validação pós-deploy (checklist)

- [ ] `/functions` não existe mais.
- [ ] Busca global por inicialização de schema em runtime retorna vazio.
- [ ] Migrações SQL não usam criação condicional de tabela.
- [ ] `wrangler deploy` executa sem erro.
- [ ] `wrangler tail` mostra `LM API VERSION: CLEAN-2026-04-25`.
- [ ] `POST /api/diagnostic/evaluate` retorna `200` com `{ ok, leadId, engineVersion, result }`.
- [ ] `GET /api/diagnostic/evaluate` retorna `405`.
- [ ] D1 executa queries sem erro para `leads` e `diagnostic_results`.

## Testes

```bash
npm test
```
