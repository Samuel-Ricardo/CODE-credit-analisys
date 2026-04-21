# 🔄 GitHub Actions Workflows

Este diretório contém todos os workflows de CI/CD do projeto.

## 📋 Workflows Disponíveis

### 1. **CI Pipeline** (`ci.yml`)
Pipeline principal de integração contínua que executa em todos os pushes e PRs.

**Triggers:**
- Push para `main` e `develop`
- Pull requests para `main` e `develop`
- Manual via `workflow_dispatch`

**Jobs:**
- ✅ Setup & Validation
- 🔍 Lint & Code Quality
- 📘 TypeScript Type Check
- 🧪 Unit Tests (Matrix: Node 20.x, 22.x)
- 🔗 Integration Tests
- 🎨 Component Tests
- 🏗️ Build Validation
- ✅ Quality Gate

**Duração estimada:** ~8-12 minutos

---

### 2. **E2E Tests** (`e2e.yml`)
Executa testes end-to-end com Cypress em múltiplos containers e navegadores.

**Triggers:**
- Push para `main` e `develop`
- Pull requests
- Agendado: diariamente às 2h UTC
- Manual

**Jobs:**
- 🎭 Cypress E2E Tests (3 containers paralelos)
- 🔥 Critical User Flows
- 🌐 Cross-Browser Testing (apenas em `main`)
- ✅ E2E Quality Gate

**Features:**
- Paralelização em 3 containers
- Upload de screenshots em caso de falha
- Upload de vídeos de todos os testes
- Testes em Chrome, Firefox e Edge (apenas `main`)

**Duração estimada:** ~10-15 minutos

---

### 3. **PR Checks** (`pr-checks.yml`)
Verificações específicas para Pull Requests.

**Triggers:**
- PRs abertos, sincronizados, reabertos ou prontos para revisão

**Jobs:**
- 📋 PR Metadata Check
- 📦 Bundle Size Analysis
- 🔒 Security Audit
- 🔍 Dependency Review
- 📊 Coverage Comparison
- 📁 Changed Files Analysis
- ✅ PR Quality Gate

**Features:**
- Validação de Conventional Commits
- Análise de tamanho do bundle
- Auditoria de segurança
- Comentário automático de cobertura no PR

**Duração estimada:** ~5-8 minutos

---

### 4. **CodeQL Security** (`codeql.yml`)
Análise de segurança automatizada com CodeQL.

**Triggers:**
- Push para `main` e `develop`
- Pull requests
- Agendado: semanalmente às segundas às 6h UTC
- Manual

**Jobs:**
- 🔒 CodeQL Analysis (JavaScript + TypeScript)

**Duração estimada:** ~15-20 minutos

---

### 5. **Lighthouse Performance** (`lighthouse.yml`)
Auditoria de performance e qualidade com Lighthouse.

**Triggers:**
- Pull requests para `main` e `develop`
- Manual

**Jobs:**
- 🔆 Lighthouse Audit

**Features:**
- Audita 3 páginas principais
- Executa 3 runs por página
- Gera relatórios detalhados
- Upload de artifacts

**Duração estimada:** ~5-7 minutos

---

## 🎯 Status Badges

Adicione ao README.md:

```markdown
[![CI Pipeline](https://github.com/seu-usuario/seu-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/seu-repo/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/seu-usuario/seu-repo/actions/workflows/e2e.yml/badge.svg)](https://github.com/seu-usuario/seu-repo/actions/workflows/e2e.yml)
[![CodeQL](https://github.com/seu-usuario/seu-repo/actions/workflows/codeql.yml/badge.svg)](https://github.com/seu-usuario/seu-repo/actions/workflows/codeql.yml)
```

---

## 🔧 Configuração Necessária

### Secrets do GitHub

Configure os seguintes secrets no repositório:

1. **CODECOV_TOKEN** (opcional)
   - Token do Codecov para upload de cobertura
   - Obtenha em: https://codecov.io

### Permissões

Os workflows precisam das seguintes permissões:

- **contents**: read
- **actions**: read
- **security-events**: write (para CodeQL)
- **pull-requests**: write (para comentários em PRs)

---

## 📊 Otimizações Implementadas

### Caching
- ✅ Cache de `node_modules`
- ✅ Cache do binário do Cypress
- ✅ Cache do `.next/cache`

### Paralelização
- ✅ Testes E2E em 3 containers
- ✅ Unit tests em matriz de Node versions

### Condicionais
- ✅ Cross-browser testing apenas em `main`
- ✅ Skips em PRs em draft
- ✅ Cancel de runs anteriores em novo push

---

## 🚀 Execução Local

### Simular CI localmente com Act

```bash
# Instalar act
brew install act  # macOS
# ou
choco install act  # Windows

# Executar workflow de CI
act -j lint

# Executar todos os jobs
act push

# Com secrets
act -s CODECOV_TOKEN=your-token
```

---

## 📈 Métricas e Monitoramento

### Status Checks Obrigatórios

Configure os seguintes checks como obrigatórios no GitHub:

1. **CI Pipeline**
   - ✅ Quality Gate

2. **E2E Tests**
   - ✅ E2E Quality Gate

3. **PR Checks**
   - ✅ PR Quality Gate

### Branch Protection Rules

```yaml
Required status checks:
  - quality-gate (CI Pipeline)
  - e2e-quality-gate (E2E Tests)
  - pr-quality-gate (PR Checks)

Required reviews: 1
Dismiss stale reviews: true
Require review from Code Owners: true
```

---

## 🐛 Troubleshooting

### Falha no cache
```bash
# Limpar cache manualmente no GitHub Actions UI
Settings → Actions → Caches → Delete cache
```

### Timeout em testes E2E
```yaml
# Aumentar timeout no workflow
timeout-minutes: 20
```

### Problemas com Cypress
```bash
# Verificar instalação do Cypress localmente
npx cypress verify
npx cypress info
```

---

## 📚 Documentação Adicional

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cypress CI Documentation](https://docs.cypress.io/guides/continuous-integration/introduction)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 🤝 Contribuindo

Para adicionar ou modificar workflows:

1. Crie uma branch a partir de `develop`
2. Adicione/modifique o workflow em `.github/workflows/`
3. Teste localmente com `act` se possível
4. Crie um PR seguindo o template
5. Aguarde aprovação e merge

---

**Última atualização:** 2026-04-20
