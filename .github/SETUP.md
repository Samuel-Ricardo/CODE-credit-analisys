# 🚀 Setup do CI/CD - GitHub Actions

Este guia orienta a configuração completa do CI/CD no GitHub.

## 📋 Pré-requisitos

- [x] Repositório GitHub criado
- [x] Código commitado na branch `main`
- [x] Acesso de administrador ao repositório

---

## 🔧 1. Configuração Inicial

### 1.1. Habilitar GitHub Actions

1. Acesse `Settings` → `Actions` → `General`
2. Em **Actions permissions**, selecione:
   - ✅ "Allow all actions and reusable workflows"
3. Em **Workflow permissions**, selecione:
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"
4. Clique em **Save**

### 1.2. Criar Branch `develop`

```bash
git checkout -b develop
git push -u origin develop
```

---

## 🔒 2. Configurar Secrets

### 2.1. CODECOV_TOKEN (Opcional, mas recomendado)

1. Acesse [codecov.io](https://codecov.io)
2. Faça login com GitHub
3. Adicione seu repositório
4. Copie o token gerado

No GitHub:
1. `Settings` → `Secrets and variables` → `Actions`
2. Clique em **New repository secret**
3. Name: `CODECOV_TOKEN`
4. Secret: cole o token
5. Clique em **Add secret**

---

## 🛡️ 3. Configurar Branch Protection Rules

### 3.1. Proteger branch `main`

`Settings` → `Branches` → `Add rule`

**Branch name pattern:** `main`

#### Configurações recomendadas:

✅ **Require a pull request before merging**
- ✅ Require approvals: **1**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners

✅ **Require status checks to pass before merging**
- ✅ Require branches to be up to date before merging
- Adicionar os seguintes checks:
  ```
  quality-gate
  e2e-quality-gate
  pr-quality-gate
  ```

✅ **Require conversation resolution before merging**

✅ **Require signed commits** (opcional, mas recomendado)

✅ **Require linear history**

✅ **Do not allow bypassing the above settings**

#### Regras adicionais:

- [ ] Allow force pushes (desabilitado)
- [ ] Allow deletions (desabilitado)

Clique em **Create** ou **Save changes**

### 3.2. Proteger branch `develop`

Repita o processo acima para a branch `develop` com configurações similares, mas pode ser mais permissivo:

- Approvals: **1**
- Status checks obrigatórios:
  ```
  quality-gate
  ```

---

## 📊 4. Configurar Codecov (Opcional)

### 4.1. Configurar codecov.yml

```bash
# Já está incluído no projeto
cat .github/codecov.yml
```

### 4.2. Adicionar badge ao README

```markdown
[![codecov](https://codecov.io/gh/seu-usuario/seu-repo/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/seu-repo)
```

---

## 🏷️ 5. Configurar Labels

Crie os seguintes labels para organização:

`Settings` → `Labels` → **New label**

| Label | Cor | Descrição |
|-------|-----|-----------|
| `dependencies` | `#0366d6` | Atualizações de dependências |
| `npm` | `#cb2431` | Relacionado ao NPM |
| `github-actions` | `#000000` | Relacionado ao GitHub Actions |
| `bug` | `#d73a4a` | Algo não está funcionando |
| `enhancement` | `#a2eeef` | Nova feature ou melhoria |
| `documentation` | `#0075ca` | Melhorias na documentação |
| `security` | `#ee0701` | Vulnerabilidade de segurança |
| `performance` | `#fbca04` | Melhorias de performance |

---

## 🤖 6. Configurar Dependabot

### 6.1. Verificar configuração

O arquivo `.github/dependabot.yml` já está configurado. Verifique:

```bash
cat .github/dependabot.yml
```

### 6.2. Editar configuração (se necessário)

Substitua `your-github-username` pelo seu username:

```yaml
reviewers:
  - "seu-username-aqui"
assignees:
  - "seu-username-aqui"
```

### 6.3. Habilitar Dependabot

1. `Settings` → `Security` → `Code security and analysis`
2. Habilite:
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**

---

## 🔍 7. Configurar CodeQL

### 7.1. Habilitar análise de código

1. `Settings` → `Security` → `Code security and analysis`
2. Habilite:
   - ✅ **Code scanning**
   - ✅ **Secret scanning**

### 7.2. Verificar workflow

O workflow `.github/workflows/codeql.yml` já está configurado e será executado automaticamente.

---

## 🎯 8. Configurar CODEOWNERS (Opcional)

Crie `.github/CODEOWNERS`:

```bash
# Default owners for everything
* @seu-username

# Owners específicos
/src/domain/ @seu-username @tech-lead
/cypress/ @seu-username @qa-lead
/.github/ @seu-username @devops-lead
```

---

## ✅ 9. Testar Workflows

### 9.1. Primeiro teste - CI Pipeline

```bash
# Fazer uma pequena mudança
echo "# CI/CD Setup Complete" >> README.md
git add .
git commit -m "ci: test GitHub Actions workflows"
git push origin develop
```

Acesse `Actions` no GitHub e verifique se o workflow `CI Pipeline` foi executado.

### 9.2. Teste de PR

```bash
# Criar uma feature branch
git checkout -b feature/test-pr
echo "test" > test.txt
git add test.txt
git commit -m "feat: test PR workflow"
git push -u origin feature/test-pr
```

Crie um PR no GitHub e verifique:
- ✅ CI Pipeline executando
- ✅ E2E Tests executando
- ✅ PR Checks executando
- ✅ Comentário de coverage automático

---

## 📈 10. Adicionar Badges ao README

Adicione ao `README.md`:

```markdown
# Credit Analysis System

[![CI Pipeline](https://github.com/seu-usuario/seu-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/seu-repo/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/seu-usuario/seu-repo/actions/workflows/e2e.yml/badge.svg)](https://github.com/seu-usuario/seu-repo/actions/workflows/e2e.yml)
[![CodeQL](https://github.com/seu-usuario/seu-repo/actions/workflows/codeql.yml/badge.svg)](https://github.com/seu-usuario/seu-repo/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/seu-usuario/seu-repo/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/seu-repo)
```

---

## 🎨 11. Customizar Workflows (Opcional)

### 11.1. Ajustar Node versions

Em `.github/workflows/ci.yml`:

```yaml
strategy:
  matrix:
    node-version: ['20.x', '22.x']  # Adicione/remova versões conforme necessário
```

### 11.2. Ajustar timeout

```yaml
timeout-minutes: 15  # Ajuste conforme necessário
```

### 11.3. Desabilitar workflows específicos

Para desabilitar temporariamente um workflow, adicione no topo:

```yaml
on:
  # Comentar todos os triggers
  # push:
  #   branches: [main, develop]
  workflow_dispatch:  # Manter apenas execução manual
```

---

## 🔄 12. Integração com Vercel

### 12.1. Conectar Vercel ao GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório
3. Configure:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 12.2. Variáveis de Ambiente (se necessário)

No Vercel Dashboard:
1. `Settings` → `Environment Variables`
2. Adicione as variáveis necessárias

### 12.3. Deploy Automático

O Vercel automaticamente:
- ✅ Deploya `main` para produção
- ✅ Cria preview para cada PR
- ✅ Executa builds em cada commit

**GitHub Actions NÃO faz deploy** - apenas valida o código antes do Vercel fazer o deploy.

---

## 🚨 13. Troubleshooting

### Workflow não executa

**Verificar:**
1. Actions habilitado no repositório
2. Workflow file válido (YAML syntax)
3. Triggers configurados corretamente

### Falha de permissão

**Solução:**
```yaml
# Adicionar no workflow
permissions:
  contents: read
  pull-requests: write
```

### Cache não funciona

**Limpar cache:**
1. `Settings` → `Actions` → `Caches`
2. Delete o cache específico
3. Re-executar workflow

### Cypress timeout

**Aumentar timeout:**
```yaml
timeout-minutes: 20
```

---

## 📚 14. Recursos Adicionais

### Documentação
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cypress CI Guide](https://docs.cypress.io/guides/continuous-integration/introduction)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)

### Ferramentas Úteis
- [Act](https://github.com/nektos/act) - Executar Actions localmente
- [actionlint](https://github.com/rhysd/actionlint) - Linter para workflows

---

## ✅ Checklist Final

Marque quando completar:

- [ ] GitHub Actions habilitado
- [ ] Branch `develop` criada
- [ ] Secrets configurados (CODECOV_TOKEN)
- [ ] Branch protection rules configuradas
- [ ] Labels criadas
- [ ] Dependabot configurado
- [ ] CodeQL habilitado
- [ ] CODEOWNERS criado (opcional)
- [ ] Workflows testados
- [ ] Badges adicionados ao README
- [ ] Vercel conectado
- [ ] Primeiro PR criado e aprovado

---

**🎉 Parabéns! Seu CI/CD está configurado e pronto para uso!**

Agora todo código que for para produção passará por:
- ✅ Lint e type checking
- ✅ Testes unitários, integração e componentes
- ✅ Testes E2E com Cypress
- ✅ Build validation
- ✅ Security scanning
- ✅ Performance audit
- ✅ Code review obrigatório

---

**Última atualização:** 2026-04-20
