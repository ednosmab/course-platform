# 🧹 SKILL: CODEBASE HYGIENE & GIT WORKFLOW

## 🎯 Objetivo
Manter a sanidade, segurança e manutenibilidade do código-fonte através de regras estritas de organização de arquivos e controle de versão.

## 🛡️ Higiene de Código e Segurança
1. **Segredos e Credenciais:** NUNCA versione chaves API, certificados `.pem` ou o arquivo `.env`. Certifique-se de que o `.gitignore` os bloqueia.
2. **Organização de Assets:** Centralize imagens e logotipos em diretórios únicos (ex: `apps/admin-web/public/assets`). Não duplique ícones.
3. **Código Morto:** Substituiu um componente local por um do Design System? Apague o antigo IMEDIATAMENTE.
4. **Documentação:** Mantenha os históricos limpos e nomes de diretórios semânticos (ex: `docs/skills/` em vez de `docs/misc/`).

## 🌿 Estrutura de Branches (Trunk-Based Modificado)
| Branch | Ambiente | Propósito |
|--------|----------|-----------|
| `main` | Produção | Código estável. Nunca faça commit direto aqui. |
| `develop` | Staging | Validação antes de ir para a main. |
| `feat/*`, `fix/*` | Local | Todo e qualquer desenvolvimento ocorre aqui. |

## 📝 Padrão de Commits (Conventional Commits)
Sempre em INGLÊS e no formato: `type(scope): description`
- `feat`: Nova funcionalidade (`feat(auth): add google provider`)
- `fix`: Correção de bug (`fix(ui): fix button alignment`)
- `refactor`: Mudança que não adiciona feature nem corrige bug.
- `chore`: Atualização de pacotes, build, lint.
- `docs`: Apenas documentação.

## ✅ Checklist de Pull Request (ou Push)
- [ ] O código passa no linter (`eslint` ou comando equivalente do projeto).
- [ ] TypeScript compila sem erros.
- [ ] Não há `console.log` esquecidos (use logger adequado).
- [ ] Variáveis de ambiente novas foram adicionadas ao `.env.example`.
- [ ] A mensagem de commit segue o padrão exigido.
