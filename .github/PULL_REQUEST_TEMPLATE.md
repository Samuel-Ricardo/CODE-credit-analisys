## 📋 Descrição

<!-- Descreva as mudanças implementadas neste PR de forma clara e concisa -->

## 🎯 Tipo de Mudança

<!-- Marque com [x] o tipo de mudança deste PR -->

- [ ] 🐛 Bug fix (correção de bug que não quebra funcionalidades existentes)
- [ ] ✨ Nova feature (nova funcionalidade que não quebra funcionalidades existentes)
- [ ] 💥 Breaking change (correção ou feature que causa quebra de funcionalidades existentes)
- [ ] 📚 Documentação (mudanças apenas na documentação)
- [ ] 🎨 Estilo (formatação, ponto e vírgula, etc; sem mudança de código)
- [ ] ♻️ Refatoração (mudança de código que não corrige bug nem adiciona feature)
- [ ] ⚡️ Performance (mudanças que melhoram a performance)
- [ ] ✅ Testes (adição ou correção de testes)
- [ ] 🔧 Chore (mudanças em configuração, CI/CD, etc)

## 🔗 Issue Relacionada

<!-- Cole o link da issue relacionada, se houver -->

Closes #(issue)

## 🧪 Como Testar

<!-- Descreva os passos para testar as mudanças -->

1. Execute `npm install`
2. Execute `npm run dev`
3. Navegue para...
4. Verifique que...

## 📸 Screenshots/Vídeos

<!-- Se aplicável, adicione screenshots ou vídeos das mudanças -->

| Antes | Depois |
|-------|--------|
| (screenshot) | (screenshot) |

## ✅ Checklist

<!-- Marque com [x] os itens concluídos -->

### Código
- [ ] Meu código segue os padrões de estilo do projeto
- [ ] Realizei uma auto-revisão do meu código
- [ ] Comentei trechos complexos do código
- [ ] Minhas mudanças não geram novos warnings
- [ ] Executei `npm run lint` sem erros
- [ ] Executei `npm run build` com sucesso

### Testes
- [ ] Adicionei testes unitários que provam que minha correção/feature funciona
- [ ] Todos os testes unitários passam (`npm run test`)
- [ ] Testes de integração passam (`npm run test:integration`)
- [ ] Testes de componentes passam (`npm run test:components`)
- [ ] Testes E2E passam (`npm run cy:run`)
- [ ] Cobertura de testes está acima de 80%

### Documentação
- [ ] Atualizei a documentação relacionada
- [ ] Atualizei o README se necessário
- [ ] Adicionei comentários JSDoc quando apropriado

### Performance & Segurança
- [ ] Considerei o impacto de performance das mudanças
- [ ] Não introduzi vulnerabilidades de segurança
- [ ] Verifiquei que não há dados sensíveis no código

### Acessibilidade
- [ ] Componentes UI são acessíveis (ARIA, navegação por teclado)
- [ ] Texto alternativo em imagens
- [ ] Contraste de cores adequado

### Mobile/Responsivo
- [ ] Testei em diferentes tamanhos de tela
- [ ] Layout funciona em mobile
- [ ] Touch events funcionam corretamente

## 📝 Notas Adicionais

<!-- Adicione qualquer contexto adicional sobre o PR aqui -->

## 🔍 Revisores

<!-- Mencione pessoas específicas para revisar se necessário -->

@mention-reviewer-here

---

### Para os Revisores

#### O que revisar:
- [ ] Lógica de negócio está correta
- [ ] Código está limpo e legível
- [ ] Testes cobrem os casos de uso
- [ ] Sem código duplicado
- [ ] Performance é adequada
- [ ] Segurança está garantida
- [ ] Documentação está atualizada

#### Como testar:
```bash
git checkout -b <branch-name>
npm install
npm run dev
# Siga os passos de teste descritos acima
```
