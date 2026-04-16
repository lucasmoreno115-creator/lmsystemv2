# LM System

Sistema completo de triagem inteligente para consultoria fitness, com motor de decisão e armazenamento de leads no Firestore.

## Stack
- Frontend: HTML + CSS + JavaScript ES Modules (sem frameworks)
- Backend: Firebase Firestore
- Deploy: GitHub Pages

## Estrutura
```text
/src
  /coach
  /core
  /firebase
  /ui
  /utils
index.html
coach-dashboard.html
style.css
script.js
firestore.rules
tests/
```

## Dashboard de Prescrição (Coach View)
- Acesse via `./coach-dashboard-login.html` (uso interno).
- O dashboard lê snapshot salvo em `localStorage` pelas chaves:
  - `LM_LAST_RESULT`
  - `LM_LAST_INPUT`
  - `LM_LAST_TS`
  - `LM_SELECTED_PLAN`
- O acesso interno usa sessão local temporária em `LM_ADMIN_SESSION` com expiração de 240 minutos.
- O snapshot é atualizado ao gerar diagnóstico em `index.html` e ao selecionar plano em `planos.html`.
- Regras de prescrição ficam centralizadas em `src/coach/coachPrescriptionEngine.js` (objeto `STATE_RULES`).
- O texto estruturado de “Gerar planejamento-base” é montado por `src/coach/buildPlanningBase.js`.
- A senha operacional do dashboard é configurada em `src/admin/adminAccessConfig.js` (`DASHBOARD_PASSWORD`).
- **Limitação importante:** por ser site estático, essa senha no frontend **não é segurança real**; é barreira operacional.
- Migração recomendada: trocar o gate atual por autenticação real (Firebase Auth/IdP + validação server-side).

## Configuração Firebase
1. Crie um projeto no Firebase.
2. Ative Firestore no modo produção.
3. Em **Firestore Database > Rules**, cole o conteúdo de `firestore.rules`.
4. Em **Project Settings > Web App**, copie as credenciais e substitua no `script.js`.
5. Garanta coleção `lm_leads` como destino de criação de documentos.

## Deploy no GitHub Pages
1. Suba este projeto para o GitHub.
2. Vá em **Settings > Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Escolha branch (`main`) e pasta (`/root`).
5. Salve e aguarde a URL pública.

## Testes
Pré-requisito: Node 18+.

```bash
node --test tests/*.test.js
```

## Checklist de funcionamento
- [ ] Formulário renderiza em tema dark premium.
- [ ] Campos obrigatórios validam corretamente.
- [ ] Submit bloqueia envios simultâneos.
- [ ] LM Score (0-100) é calculado e exibido.
- [ ] Classificação é exibida ao usuário.
- [ ] Mensagem de 48h é exibida.
- [ ] Payload é salvo em `lm_leads` com `status: NEW`.
- [ ] Regras bloqueiam leitura pública e update/delete.
