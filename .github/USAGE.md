# 📖 Guia de Uso do CI/CD

Este guia mostra como usar o sistema de CI/CD no dia a dia de desenvolvimento.

## 🚀 Fluxo de Trabalho Padrão

### 1️⃣ Criar Nova Feature

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar branch de feature
git checkout -b feature/nome-da-feature

# 3. Desenvolver
# ... fazer mudanças no código ...

# 4. Executar testes localmente
npm run lint
npm run test
npm run build

# 5. Commit seguindo Conventional Commits
git add .
git commit -m "feat(modulo): descrição da feature"

# 6. Push
git push -u origin feature/nome-da-feature
```

### 2️⃣ Abrir Pull Request

1. Acesse o GitHub
2. Clique em **Compare & pull request**
3. Preencha o template de PR:
   - Título seguindo Conventional Commits
   - Descrição detalhada
   - Marque os checkboxes
4. Adicione labels apropriadas
5. Atribua revisores
6. Clique em **Create pull request**

### 3️⃣ Acompanhar CI/CD

O GitHub Actions executará automaticamente:

```
┌─────────────────────────────────────┐
│ CI Pipeline (8-12min)               │
├─────────────────────────────────────┤
│ ✓ Setup & Validation                │
│ ✓ Lint & Code Quality               │
│ ✓ TypeScript Type Check             │
│ ✓ Unit Tests (Node 20.x, 22.x)      │
│ ✓ Integration Tests                 │
│ ✓ Component Tests                   │
│ ✓ Build Validation                  │
│ ✓ Quality Gate                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ E2E Tests (10-15min)                │
├─────────────────────────────────────┤
│ ✓ Cypress E2E (3 containers)        │
│ ✓ Critical Flows                    │
│ ✓ E2E Quality Gate                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ PR Checks (5-8min)                  │
├─────────────────────────────────────┤
│ ✓ PR Metadata                       │
│ ✓ Bundle Size Analysis              │
│ ✓ Security Audit                    │
│ ✓ Dependency Review                 │
│ ✓ Coverage Comparison               │
│ ✓ Changed Files Analysis            │
│ ✓ PR Quality Gate                   │
└─────────────────────────────────────┘
```

### 4️⃣ Revisar e Corrigir

Se algum check falhar:

```bash
# Ver o erro no GitHub Actions
# Clicar no check falhado → Details

# Corrigir localmente
git add .
git commit -m "fix: corrige problema identificado no CI"
git push

# CI executa automaticamente de novo
```

### 5️⃣ Merge

Após aprovação e todos os checks passarem:

1. Clique em **Squash and merge** ou **Merge pull request**
2. Delete a branch feature
3. Vercel fará o deploy automático

---

## 🎯 Conventional Commits

Use o padrão Conventional Commits para todos os commits:

### Tipos Principais

```bash
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação (sem mudança de código)
refactor: Refatoração de código
perf:     Melhoria de performance
test:     Testes
chore:    Tarefas de manutenção
ci:       Mudanças em CI/CD
build:    Build system ou dependências
revert:   Reverter commit anterior
```

### Exemplos

```bash
# Feature simples
git commit -m "feat: adiciona filtro por status"

# Feature com escopo
git commit -m "feat(dashboard): adiciona gráfico de análises"

# Breaking change
git commit -m "feat!: muda estrutura da API de clientes"

# Com corpo e footer
git commit -m "fix(api): corrige validação de CPF

O CPF não estava sendo validado corretamente para casos
com dígitos verificadores zero.

Closes #123"
```

---

## 🔍 Monitoramento de Status Checks

### Ver Status Atual

```bash
# Via GitHub CLI
gh pr checks

# Ver detalhes de um check específico
gh run view <run-id>

# Ver logs
gh run view <run-id> --log
```

### Status Badges

Adicione ao PR para acompanhamento rápido:

```markdown
## Status

![CI](https://github.com/user/repo/actions/workflows/ci.yml/badge.svg?branch=feature/minha-feature)
![E2E](https://github.com/user/repo/actions/workflows/e2e.yml/badge.svg?branch=feature/minha-feature)
```

---

## 🧪 Executar Testes Localmente

### Todos os testes

```bash
# Setup inicial
npm install

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Component tests
npm run test:components

# Todos os testes Jest
npm test

# E2E (Cypress)
npm run cy:run

# Build
npm run build
```

### Simular CI completo localmente

```bash
# Script helper
cat > run-ci-local.sh << 'EOF'
#!/bin/bash
set -e

echo "🔍 Running Lint..."
npm run lint

echo "📘 Running Type Check..."
npx tsc --noEmit

echo "🧪 Running Unit Tests..."
npm run test:unit

echo "🔗 Running Integration Tests..."
npm run test:integration

echo "🎨 Running Component Tests..."
npm run test:components

echo "🏗️ Running Build..."
npm run build

echo "✅ All local CI checks passed!"
EOF

chmod +x run-ci-local.sh
./run-ci-local.sh
```

---

## 📊 Cobertura de Testes

### Gerar relatório local

```bash
# Gerar coverage
npm run test:coverage

# Ver relatório HTML
open coverage/lcov-report/index.html
```

### Interpretar cobertura

```
Coverage summary:
  Lines      : 85% (1234/1450)
  Statements : 84% (1345/1600)
  Functions  : 82% (123/150)
  Branches   : 80% (234/292)
```

**Meta:** ≥ 80% em todas as métricas

### Comentário automático no PR

O CI adicionará automaticamente um comentário assim:

```markdown
## 📊 Test Coverage Report

| Metric | Coverage |
|--------|----------|
| Lines | 85% |
| Statements | 84% |
| Functions | 82% |
| Branches | 80% |

✅ Coverage threshold: 80%
```

---

## 🎭 Testes E2E

### Executar localmente com UI

```bash
# Abrir Cypress Test Runner
npm run cy:open

# Selecionar spec e browser
# Ver testes executando em tempo real
```

### Executar em headless

```bash
# Todos os testes
npm run cy:run

# Spec específico
npx cypress run --spec "cypress/e2e/01-dashboard.cy.ts"

# Browser específico
npx cypress run --browser chrome

# Com vídeo
npx cypress run --video
```

### Debugging

```bash
# Modo headed (ver navegador)
npx cypress run --headed

# Com delay
npx cypress run --slow 500

# Debug mode
DEBUG=cypress:* npx cypress run
```

---

## 🔄 Re-executar Workflows

### Via GitHub UI

1. Acesse `Actions`
2. Selecione o workflow run falhado
3. Clique em **Re-run jobs** → **Re-run failed jobs**

### Via GitHub CLI

```bash
# Re-executar workflow falhado
gh run rerun <run-id>

# Re-executar apenas jobs falhados
gh run rerun <run-id> --failed

# Ver lista de runs
gh run list

# Cancelar run em andamento
gh run cancel <run-id>
```

---

## 📦 Análise de Bundle Size

### Ver tamanho do bundle

```bash
# Build
npm run build

# Analisar
du -sh .next/static

# Ver arquivos maiores
find .next/static -type f -exec du -h {} \; | sort -rh | head -20
```

### Otimizações

```javascript
// next.config.ts
const nextConfig = {
  // Habilitar análise de bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
      };
    }
    return config;
  },
};
```

---

## 🔒 Security Audit

### Executar audit local

```bash
# npm audit
npm audit

# Audit com severidade
npm audit --audit-level=moderate

# Corrigir automaticamente
npm audit fix

# Corrigir inclusive breaking changes
npm audit fix --force
```

### Ver vulnerabilidades

```bash
# Relatório JSON
npm audit --json > audit-report.json

# Relatório detalhado
npm audit --json | jq '.vulnerabilities'
```

---

## 🏷️ Labels e Automação

### Labels importantes

- `dependencies`: Atualizações de deps
- `security`: Vulnerabilidades
- `performance`: Otimizações
- `bug`: Correções
- `enhancement`: Melhorias
- `documentation`: Docs
- `ci`: CI/CD

### Auto-label em PRs

PRs recebem labels automaticamente baseado em:
- Arquivos modificados
- Título do PR
- Conventional commits

---

## 📈 Métricas e Reports

### GitHub Insights

Ver métricas em:
1. `Insights` → `Pulse`
2. `Insights` → `Code frequency`
3. `Insights` → `Contributors`

### Actions Usage

Ver uso de minutos em:
1. `Settings` → `Billing`
2. `Actions minutes used`

### Lighthouse Reports

Disponíveis em artifacts dos PRs:
1. `Actions` → Workflow run
2. `Artifacts` → Download

---

## 🚨 Troubleshooting Comum

### "CI failing but works locally"

```bash
# Verificar versões
node --version
npm --version

# Limpar cache
rm -rf node_modules
rm package-lock.json
npm install

# Verificar variáveis de ambiente
echo $NODE_ENV
```

### "E2E tests timeout"

```bash
# Aumentar timeout no teste
cy.visit('/', { timeout: 10000 })

# Verificar baseUrl
grep baseUrl cypress.config.ts

# Verificar se dev server está rodando
curl http://localhost:3000
```

### "Coverage below threshold"

```bash
# Ver arquivos sem cobertura
npm run test:coverage
cat coverage/coverage-summary.json | jq '.total'

# Adicionar testes para arquivos específicos
npm test src/domain/entities/Cliente.test.ts
```

---

## 💡 Dicas Pro

### 1. Pre-commit hooks

```bash
# Instalar husky
npm install --save-dev husky lint-staged

# Configurar
npx husky install
npx husky add .husky/pre-commit "npm run lint-staged"
```

### 2. Commit template

```bash
# ~/.gitmessage
# <type>(<scope>): <subject>
# 
# <body>
# 
# <footer>

git config --global commit.template ~/.gitmessage
```

### 3. GitHub CLI aliases

```bash
# ~/.config/gh/config.yml
aliases:
  prc: pr create --fill
  prv: pr view --web
  prs: pr status
  ci: run list
```

### 4. Watch mode para desenvolvimento

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Testes em watch mode
npm run test:watch

# Terminal 3: Lint em watch mode
npx eslint . --watch
```

---

## 📚 Recursos Adicionais

### Documentação
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)

### Ferramentas
- [Commitizen](https://github.com/commitizen/cz-cli) - CLI para conventional commits
- [Semantic Release](https://github.com/semantic-release/semantic-release) - Automated versioning
- [Release Please](https://github.com/googleapis/release-please) - Automated releases

---

**🎉 Agora você está pronto para usar o CI/CD como um pro!**

Para dúvidas, consulte [.github/workflows/README.md](.github/workflows/README.md)
