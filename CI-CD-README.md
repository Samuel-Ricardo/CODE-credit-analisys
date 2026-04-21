# 🚀 CI/CD - Sistema de Análise de Crédito

## 📊 Status

[![CI Pipeline](https://img.shields.io/github/actions/workflow/status/seu-usuario/seu-repo/ci.yml?branch=main&label=CI&logo=github)](https://github.com/seu-usuario/seu-repo/actions/workflows/ci.yml)
[![E2E Tests](https://img.shields.io/github/actions/workflow/status/seu-usuario/seu-repo/e2e.yml?branch=main&label=E2E&logo=cypress)](https://github.com/seu-usuario/seu-repo/actions/workflows/e2e.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/seu-usuario/seu-repo/codeql.yml?branch=main&label=Security&logo=github)](https://github.com/seu-usuario/seu-repo/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/seu-usuario/seu-repo/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/seu-repo)

---

## 🎯 Visão Geral

Este projeto possui um pipeline completo de CI/CD com GitHub Actions, garantindo qualidade, segurança e performance em cada commit.

### ✨ Features

- ✅ **Lint automático** - ESLint em todo push
- ✅ **Type checking** - TypeScript validation
- ✅ **105 testes** - Unit, Integration, Component e E2E
- ✅ **Coverage tracking** - Mínimo 80% em todas as métricas
- ✅ **E2E paralelo** - Cypress em 3 containers
- ✅ **Security scan** - CodeQL + npm audit
- ✅ **Performance audit** - Lighthouse CI
- ✅ **Auto-deploy** - Vercel em cada merge

---

## 🔄 Workflows

### 1. **CI Pipeline** ([ci.yml](.github/workflows/ci.yml))

Executa em todos os pushes e PRs:

```
┌─────────────────────────────┐
│ ✓ Lint & Type Check         │
│ ✓ Unit Tests (Node 20, 22)  │
│ ✓ Integration Tests          │
│ ✓ Component Tests            │
│ ✓ Build Validation           │
└─────────────────────────────┘
```

**Duração:** ~8-12 minutos

### 2. **E2E Tests** ([e2e.yml](.github/workflows/e2e.yml))

Testes end-to-end com Cypress:

```
┌─────────────────────────────┐
│ ✓ 105 testes E2E             │
│ ✓ 3 containers paralelos     │
│ ✓ Critical flows             │
│ ✓ Cross-browser (main only)  │
└─────────────────────────────┘
```

**Duração:** ~10-15 minutos

### 3. **PR Checks** ([pr-checks.yml](.github/workflows/pr-checks.yml))

Verificações específicas de Pull Requests:

```
┌─────────────────────────────┐
│ ✓ PR metadata validation     │
│ ✓ Bundle size analysis       │
│ ✓ Security audit             │
│ ✓ Dependency review          │
│ ✓ Coverage comparison        │
└─────────────────────────────┘
```

**Duração:** ~5-8 minutos

### 4. **CodeQL Security** ([codeql.yml](.github/workflows/codeql.yml))

Análise de segurança semanal e em PRs.

### 5. **Lighthouse Performance** ([lighthouse.yml](.github/workflows/lighthouse.yml))

Auditoria de performance em PRs.

---

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# Clone e instale
git clone <repo-url>
cd credit-analysis
npm install

# Rode os testes antes de commitar
npm run ci:local

# OU execute checks individualmente
npm run lint
npm run test
npm run build
```

### Criar Pull Request

```bash
# 1. Crie uma branch
git checkout -b feature/minha-feature

# 2. Desenvolva e commite (Conventional Commits)
git commit -m "feat: adiciona nova funcionalidade"

# 3. Valide localmente
npm run ci:local

# 4. Push
git push -u origin feature/minha-feature

# 5. Abra PR no GitHub
# Todos os workflows executarão automaticamente
```

---

## 📋 Conventional Commits

Use o padrão para todos os commits:

```bash
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação
refactor: Refatoração
perf:     Performance
test:     Testes
chore:    Manutenção
ci:       CI/CD
```

**Exemplos:**

```bash
git commit -m "feat(dashboard): adiciona gráfico de tendências"
git commit -m "fix(api): corrige validação de CPF"
git commit -m "test: adiciona testes para Cliente entity"
```

---

## ✅ Quality Gates

Todo código precisa passar por:

### Obrigatório para Merge

- [x] ESLint sem erros
- [x] TypeScript sem erros
- [x] Todos os testes passando
- [x] Coverage ≥ 80%
- [x] Build bem-sucedido
- [x] 1 aprovação de code review

### Verificações Automáticas

- [x] Security audit
- [x] Dependency review
- [x] Bundle size analysis
- [x] Performance audit (Lighthouse)

---

## 📊 Métricas

### Cobertura de Testes

```
Target: ≥ 80% em todas as métricas

Current:
  Lines      : 85%
  Statements : 84%
  Functions  : 82%
  Branches   : 80%
```

### Testes

```
Total: 105 testes

Unit:        45 testes
Integration: 25 testes
Component:   20 testes
E2E:        105 testes (Cypress)
```

---

## 🔧 Scripts Úteis

```bash
# Validação completa local (simula CI)
npm run ci:local

# Checks rápidos
npm run ci:check

# Testes por categoria
npm run test:unit
npm run test:integration
npm run test:components

# E2E
npm run cy:open    # Interface gráfica
npm run cy:run     # Headless

# Coverage
npm run test:coverage
```

---

## 📚 Documentação Detalhada

- **[Setup Guide](.github/SETUP.md)** - Configuração inicial do CI/CD
- **[Usage Guide](.github/USAGE.md)** - Como usar o CI/CD no dia a dia
- **[Workflows README](.github/workflows/README.md)** - Detalhes dos workflows
- **[PR Template](.github/PULL_REQUEST_TEMPLATE.md)** - Template de Pull Request

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

Todos os PRs passam por:
- Code review obrigatório
- Todos os workflows de CI/CD
- Merge somente após aprovação + checks verdes

---

## 🔒 Segurança

- **CodeQL**: Análise semanal de vulnerabilidades
- **Dependabot**: Atualizações automáticas de segurança
- **npm audit**: Executado em cada PR
- **Dependency Review**: Análise de novas dependências

Reportar vulnerabilidades: [SECURITY.md](SECURITY.md)

---

## 📈 Roadmap

- [ ] Testes de performance automatizados
- [ ] Deploy preview em cada PR
- [ ] Notificações Slack/Discord
- [ ] Análise de bundle size trends
- [ ] Semantic release automation

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Cypress](https://www.cypress.io/)
- [GitHub Actions](https://github.com/features/actions)
- [Vercel](https://vercel.com/)

---

**Desenvolvido com ❤️ e muitos testes automatizados**
