# 📋 DECISÕES ARQUITETURAIS & RECOMENDAÇÕES TÉCNICAS

**Projeto:** Course Platform - Infraestrutura Proprietária de Educação  
**Data:** 15 de maio de 2026  
**Status:** Bootstrap - Pronto para Iniciar Desenvolvimento

---

## 1. Decisões Arquiteturais Bloqueadas 🔒

As decisões abaixo **não são negociáveis** e foram explicitamente documentadas em `docs/adrs/`.

### 1.1 Stack Tecnológico Principal

| Camada | Tecnologia | Versão | Decisão | Motivo |
|--------|-----------|--------|---------|--------|
| **Frontend Web** | Next.js | 16.2.6 | ✅ LOCKED | App Router, SSR, TypeScript nativo, API Routes |
| **Frontend Mobile** | Expo | 54.0.33 | ✅ LOCKED | React Native, Sintaxe Web, OTA updates |
| **Backend & DB** | Supabase | Latest | ✅ LOCKED | PostgreSQL realtime, Auth integrado, RLS, Storage |
| **Design System** | Tamagui | 1.x | ✅ LOCKED | Cross-platform Web+Mobile, CSS-in-JS |
| **Tipagem & Validação** | TypeScript + Zod | 5.x + latest | ✅ LOCKED | Type-safe em compile-time + runtime |
| **Monorepo** | pnpm Workspace | Latest | ✅ LOCKED | Isolamento de escopo, dependências otimizadas |

### 1.2 Proibições Absoluta (FORBIDDEN)

| # | Proibição | Razão | Alternativa |
|---|-----------|-------|------------|
| F1 | Usar Tailwind CSS | Viola princípio DRY do design system | Usar Tamagui `styled()` |
| F2 | CSS inline ou Sass | Mesmo motivo acima | Tokens do Tamagui |
| F3 | Componentes sem Zod | Falta de validação runtime | Sempre criar schema Zod para novos types |
| F4 | Queries SQL sem RLS | Violação de segurança | Sempre adicionar `enable rls on table` + policies |
| F5 | Git commits sem permissão | Histórico descontrolado | Solicitar aprovação do usuário sempre |
| F6 | Commit em português | Perde consistência | Usar Conventional Commits em inglês |
| F7 | Modificar `docs/history/` | Arquivo é imutável | Criar novo arquivo de sessão em `docs/history/` |

---

## 2. Camadas Técnicas & Responsabilidades

### 2.1 Matriz de Agentes por Camada

```
┌─────────────────────────────────────────────────────────────────┐
│ CAMADA 1: CONTRATOS DE DADOS (packages/types/)                 │
├─────────────────────────────────────────────────────────────────┤
│ Agente: 1 (Product Manager / Gemini Flash)                     │
│ Responsabilidade: Definir schemas Zod e types TypeScript       │
│ Escopo: packages/types/src/index.ts                            │
│ Artefatos: TextBlock, VideoBlock, QuizBlock, API Payloads      │
│ ⚠️ Nunca escrever: UI, SQL, Componentes                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CAMADA 2: DESIGN SYSTEM & COMPONENTES (packages/ui/)            │
├─────────────────────────────────────────────────────────────────┤
│ Agente: 2 (Tech Lead & Arquiteto / MiniMax M2.5)              │
│ Responsabilidade: Configurar Tamagui e criar primitivos        │
│ Escopo: packages/ui/src/, tamagui.config.ts                    │
│ Artefatos: Tokens, Button, Card, Text, Container Styles       │
│ ⚠️ Nunca escrever: Lógica app, SQL, Hooks custom              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CAMADA 3: PERSISTÊNCIA & SEGURANÇA (supabase/migrations/)       │
├─────────────────────────────────────────────────────────────────┤
│ Agente: 2 (Tech Lead & Arquiteto / MiniMax M2.5)              │
│ Responsabilidade: Migrations SQL e políticas RLS               │
│ Escopo: supabase/migrations/, RLS governance                   │
│ Artefatos: Tabelas Aulas, Colunas JSONB, Buckets Storage      │
│ ⚠️ Nunca escrever: Componentes React/Expo, UI                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CAMADA 4: APLICAÇÕES FINAIS (apps/)                             │
├─────────────────────────────────────────────────────────────────┤
│ Agente: 3 (Desenvolvedor Pleno / DeepSeek V4 Flash)           │
│ Responsabilidade: Montar screens, hooks, conexões com API      │
│ Escopo: apps/admin-web/, apps/aluno-mobile/                   │
│ Artefatos: Pages Next.js, Screens Expo, Clientes Supabase     │
│ ⚠️ Nunca escrever: Tipos globais, Tokens, SQL migrations      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Fluxo de Integração Entre Camadas

```
┌────────────────────────────────────────────────────────────────┐
│ FLUXO MANDATÓRIO DE DESENVOLVIMENTO (5 FASES)                  │
└────────────────────────────────────────────────────────────────┘

FASE 1: CONTRATO (Agente 1)
└─ Ler: docs/layers/types/execution_plan.md
└─ Ler: docs/layers/types/zod_strict_validation_skill.md
└─ Criar: packages/types/src/index.ts
   - TextBlockSchema: Zod
   - VideoBlockSchema: Zod
   - QuizBlockSchema: Zod
   - TypeScript types exportados

FASE 2: ARQUITETURA (Agente 2)
└─ Ler: docs/layers/ui/execution_plan.md
└─ Ler: docs/layers/ui/tamagui_tokenization_skill.md
└─ Criar: packages/ui/src/tamagui.config.ts
   - Tokens de cores, tipografia, espaçamento
   - Componentes: Button, Card, Text, Container
└─ Criar: supabase/migrations/001_initial_schema.sql
   - Tabela: aulas (JSONB para blocos)
   - Políticas RLS para acesso

FASE 3: IMPLEMENTAÇÃO (Agente 3)
└─ Ler: docs/layers/apps/admin_canvas_plan.md
└─ Criar: apps/admin-web/src/pages/editor.tsx
   - Importar types do @projeto/types
   - Importar componentes do @projeto/ui
   - Integrar cliente Supabase
   - Implementar canvas drag-drop
└─ Criar: apps/aluno-mobile/src/screens/Player.tsx
   - Renderizador JSON → Componentes

FASE 4: VALIDAÇÃO (Usuário - Edson)
└─ Usuário testa localmente:
   - pnpm run dev (admin-web)
   - pnpm run android (aluno-mobile)
   - Testa fluxos de criação e consumo
   - Aprova ou solicita ajustes

FASE 5: GIT & REGISTRO (IA + Usuário)
└─ IA sugere commit message (Conventional Commits)
└─ Usuário revisa e autoriza explicitamente
└─ Commit é gravado com mensagem em inglês
   Exemplo: "feat: add TextBlock schema and Tamagui button primitive"
```

---

## 3. Ciclo de Vida de Dados

### 3.1 Jornada Completa de um Bloco de Texto

```
┌───────────────────────────────────────────────────────────────────┐
│ JORNADA: CRIAR → VALIDAR → PERSISTIR → RENDERIZAR                │
└───────────────────────────────────────────────────────────────────┘

1. AUTHORING (Admin)
   └─ Admin abre Canvas editor no Next.js
   └─ Clica em "Add Text Block"
   └─ Digita conteúdo + estilo (cor, tamanho, fonte)

2. VALIDATION (Frontend)
   └─ JavaScript valida input contra TextBlockSchema (Zod)
   └─ Se inválido: mostra erro inline
   └─ Se válido: serializa para JSON

3. STATE MANAGEMENT
   └─ Canvas state manager (Redux/Zustand) atualiza local state
   └─ Renderiza preview em tempo real
   └─ Ativa debounce (500ms) para não entupir a rede

4. PERSISTENCE
   └─ Após debounce: POST /api/aulas/:id/blocks
   └─ Payload: { type: 'text', content: {...} } (JSON)
   └─ Supabase valida com Zod novamente (runtime check)
   └─ PostgreSQL: INSERT INTO aulas (id, blocos) VALUES (...)
      └─ Coluna blocos é JSONB, armazena array de blocks

5. SECURITY CHECK
   └─ Supabase RLS policy verifica: user_id = current_user_id
   └─ Se falha: rejeita com erro 403
   └─ Se passa: commit a transação

6. REALTIME SYNC
   └─ Supabase Realtime notifica clientes subscritos
   └─ Admin vê preview atualizado em tempo real
   └─ Outros usuários veem changes ao vivo (multiplayer)

7. RETRIEVAL (Student)
   └─ Aluno abre app mobile (Expo)
   └─ GET /api/aulas/:id/blocos (fetch JSON)
   └─ Aplicação desserializa array de blocks

8. VALIDATION (Runtime)
   └─ Verifica cada block contra seu schema Zod
   └─ Valida tipos de dados antes de renderizar

9. RENDERING
   └─ Renderer engine mapeia JSON → Componentes Tamagui
   └─ TextBlock { content, color, size } → <Text color={color} size={size}>
   └─ Interface nativa renderiza em tela

10. DISPLAY
    └─ Aluno vê conteúdo formatado, fluido e responsivo
```

### 3.2 Data Lifecycle Diagram

```
Admin Input
   ↓
[Zod Validation] ←── @projeto/types/TextBlockSchema
   ↓ PASS
State Manager (Canvas)
   ↓
Preview in Editor (Real-time)
   ↓
Debounce Timer (500ms)
   ↓ Fire
POST /api/aulas/:id/blocks
   ↓
Supabase Auth Check (JWT Token)
   ↓ PASS
Zod Runtime Validation (2nd check)
   ↓ PASS
PostgreSQL INSERT (JSONB)
   ↓
Supabase RLS Policy Check (SELECT user_id = current_user_id)
   ↓ PASS
COMMIT Transaction
   ↓
Realtime Broadcast to Subscribed Clients
   ↓
Student Mobile App (Fetch)
   ↓
Zod Schema Validation (3rd check)
   ↓ PASS
Renderer Engine: JSON → Tamagui Components
   ↓
Native Mobile Render
   ↓
✅ Display to Student
```

---

## 4. Fluxo de Workflow MCP (Algoritmo Obrigatório)

Toda tarefa segue **4 passos sequenciais e imutáveis**:

### Passo 1: Diagnóstico & Lazy Loading
```bash
# O Agente IA LÊ:
1. docs/CONTEXT_MAP.md          # Identifica a camada
2. docs/context_buffer.md        # Vê o estado anterior
3. docs/layers/{layer}/execution_plan.md
4. docs/layers/{layer}/skill.md
# O Agente IA NÃO faz glob() de toda docs/
```

### Passo 2: Atualização de Memória (Before-Code)
```markdown
# docs/context_buffer.md precisa ser reescrito:

## 🎯 Tarefa em Execução
[Descrever o objetivo imediato]

## 🕹️ Camada Ativa e Documentos Carregados via MCP
- Arquivo 1: packages/types/src/index.ts
- Arquivo 2: docs/layers/types/execution_plan.md
[... etc]

## ⚠️ Impedimentos & Logs de Erro Recentes
*Nenhum erro ativo.*
```

### Passo 3: Execução Cirúrgica
```typescript
// Modificar código APENAS dentro do escopo permitido
// Se erro TypeScript/Lint/Zod: PARAR IMEDIATAMENTE
// Documentar erro em context_buffer.md

// ✅ PERMITIDO:
packages/types/src/index.ts        // Agente 1
packages/ui/src/tamagui.config.ts  // Agente 2
supabase/migrations/*.sql          // Agente 2
apps/admin-web/src/**/*.tsx        // Agente 3
apps/aluno-mobile/src/**/*.tsx     // Agente 3

// ❌ PROIBIDO:
Tamagui tokens em app/              // Deve estar em packages/ui
Types globais fora de packages/types
HTML/CSS direto em componentes      // Usar Tamagui styled()
```

### Passo 4: Consolidação & Purga (After-Code)
```markdown
# Após compilação com sucesso:
1. Marcar [x] na tarefa correspondente do plano
2. Reescrever context_buffer.md:
   - Tarefa: CONCLUÍDA
   - Impedimentos: Nenhum erro ativo
3. Exibir resumo do estado
4. Estimar consumo de tokens
```

---

## 5. Protocolo de Versionamento Git

### 5.1 Workflow de Commit

```bash
# ❌ ERRADO: Commit automático
git add .
git commit -m "Update code"
git push

# ✅ CORRETO: Solicitar aprovação
# 1. IA escreve o código
# 2. IA solicita: "Edson, por favor teste localmente:
#    - pnpm run dev
#    - Abra http://localhost:3000
#    - Teste o fluxo de criação de TextBlock
# 3. Usuário testa e confirma: "OK, funcionou tudo"
# 4. IA sugere commit message:
#    "feat: add TextBlock schema and validation"
# 5. Usuário autoriza: "Pode fazer commit"
# 6. IA executa:
git add packages/types/src/index.ts
git commit -m "feat: add TextBlock schema and validation"
git push origin feature/text-block
```

### 5.2 Formato de Mensagem de Commit

**Obrigatório: Conventional Commits**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos Permitidos:**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças em documentação
- `style:` Formatação (sem alteração lógica)
- `refactor:` Reestruturação de código
- `perf:` Otimizações de performance
- `test:` Adição/modificação de testes
- `chore:` Atualizações de dependências, config

**Escopos Permitidos:**
- `types:` Mudanças em packages/types
- `ui:` Mudanças em packages/ui
- `db:` Migrações Supabase
- `admin:` Mudanças em apps/admin-web
- `mobile:` Mudanças em apps/aluno-mobile
- `core:` Mudanças em packages/core (futuro)

**Exemplos Válidos:**
```
feat(types): add TextBlock schema with Zod validation
fix(ui): correct Button hover state in dark mode
chore(db): add RLS policy for aulas table
docs(types): update TextBlock documentation
refactor(admin): extract CanvasEditor to separate component
```

**Exemplos Inválidos:**
```
❌ Update code
❌ Fix stuff
❌ adicionar TextBlock (português)
❌ feat: add TextBlock schema with Zod validation (50 more lines of explanation)
```

---

## 6. Checklist de Validação de Arquitetura

Antes de qualquer pull request, esta checklist deve estar 100% completo:

### 6.1 Validação de Tipos

- [ ] Novo schema Zod criado para qualquer novo type
- [ ] Schema exportado de `packages/types/src/index.ts`
- [ ] TypeScript `strict: true` em `tsconfig.json`
- [ ] Nenhum `any` ou `as unknown` sem justificativa
- [ ] Validação Zod aplicada antes de persistência
- [ ] Runtime validation com `.parse()` ou `.safeParse()`

### 6.2 Validação de UI

- [ ] Nenhum Tailwind CSS usado
- [ ] Nenhum CSS inline (via `style=` attribute)
- [ ] Todos os estilos vindo de `@projeto/ui` (Tamagui)
- [ ] Componentes usando `styled()` ou Tamagui primitivos
- [ ] Tokens de cores/espaço vindo de `tamagui.config.ts`
- [ ] Temas claro/escuro testados

### 6.3 Validação de Banco de Dados

- [ ] Migração SQL com `.sql` nomeado incrementalmente
- [ ] Todas as tabelas com `enable rls on table;`
- [ ] Políticas RLS para SELECT, INSERT, UPDATE, DELETE
- [ ] Colunas JSONB com índices GIN para performance
- [ ] Foreign keys com `ON DELETE CASCADE/RESTRICT` apropriado
- [ ] Sem dados sensíveis em JSONB (criptografar se necessário)

### 6.4 Validação de Segurança

- [ ] Senhas/tokens nunca em source code
- [ ] Environment variables para secrets (`.env.local`)
- [ ] RLS policies bloqueando acesso não-autorizado
- [ ] CORS configurado apenas para domínios confiáveis
- [ ] Rate limiting em endpoints públicos
- [ ] Inputs sanitizados antes de renderização

### 6.5 Validação de Performance

- [ ] Componentes sem prop drilling excessivo
- [ ] Memoization em componentes heavy (React.memo)
- [ ] Lazy loading de imports (dynamic imports)
- [ ] Debounce em handlers de entrada de usuário
- [ ] Índices de banco de dados em colunas consultadas frequentemente
- [ ] Bundle size verificado (pnpm run build)

### 6.6 Validação de Documentação

- [ ] ADR criado para decisões arquiteturais significativas
- [ ] Code comments para lógica não óbvia
- [ ] README atualizado se houver mudança de setup
- [ ] Tipos JSDoc comentados com exemplos
- [ ] context_buffer.md atualizado ao final da sessão
- [ ] history/ atualizado com resumo de sessão (se solicitado)

---

## 7. Matriz de Decisão: "Como Implementar X"

Quando você não sabe qual agente deve fazer algo, use esta matriz:

### 7.1 "Preciso criar um novo bloco (ex: AudioBlock)"

| Passos | Agente | O que Fazer | Arquivo |
|--------|--------|-----------|---------|
| 1 | Agente 1 | Criar AudioBlockSchema em Zod | packages/types/src/index.ts |
| 2 | Agente 2 | Criar AudioBlockComponent em Tamagui | packages/ui/src/components/AudioBlock.tsx |
| 3 | Agente 2 | (Se necessário) Adicionar coluna JSONB | supabase/migrations/*.sql |
| 4 | Agente 3 | Integrar AudioBlock no Canvas Editor | apps/admin-web/src/components/Canvas.tsx |
| 5 | Agente 3 | Integrar renderer para AudioBlock | apps/aluno-mobile/src/renderer/index.tsx |

### 7.2 "Preciso adicionar um campo ao TextBlock"

| Passos | Agente | O que Fazer |
|--------|--------|-----------|
| 1 | Agente 1 | Atualizar TextBlockSchema (Zod) → adicionar campo |
| 2 | Agente 2 | Atualizar TextBlock component (Tamagui) → aceitar novo prop |
| 3 | (Skip) | Database schema já existe (JSONB é flexível) |
| 4 | Agente 3 | Atualizar Canvas UI para novo campo |
| 5 | Agente 3 | Testar renderização no mobile |

### 7.3 "Preciso adicionar autenticação social (Google)"

| Passos | Agente | O que Fazer |
|--------|--------|-----------|
| 1 | Agente 1 | (Skip) |
| 2 | Agente 2 | Adicionar políticas RLS para tabela users |
| 3 | Agente 2 | Criar migração para oauth_providers (se usar Supabase Auth) |
| 4 | Agente 3 | Integrar Supabase Auth client em apps/admin-web |
| 5 | Agente 3 | Integrar Supabase Auth client em apps/aluno-mobile |

---

## 8. Problemas Conhecidos & Soluções

### 8.1 Problema: Componentes Tamagui Renderizam Diferente Web vs Mobile

**Causa:** Tamagui exigencia inicialização diferente por plataforma  
**Solução:** Usar `@tamagui/core` no setup de ambos apps + testar cross-platform antes de merge

### 8.2 Problema: JSONB Queries Lentas com Muitos Blocos

**Causa:** Índices GIN não criados  
**Solução:**
```sql
CREATE INDEX idx_aulas_blocos ON aulas USING GIN (blocos);
-- Depois usar JSONPath queries:
WHERE blocos @> '[{"type": "text"}]'::jsonb
```

### 8.3 Problema: RLS Policies Bloqueiam Queries Legítimas

**Causa:** Policy muito restritiva ou lógica errada  
**Solução:**
1. Logar queries bloqueadas em `postgres_logs`
2. Debugar policy com `SELECT policy_name FROM pg_policies WHERE tablename='aulas'`
3. Ajustar com `ALTER POLICY ... ON ...`

### 8.4 Problema: Expo Build Falha com Dependências do Next.js

**Causa:** pnpm linkando pacotes incorretamente  
**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
# Ou especificar em package.json: "next": "false" em aluno-mobile
```

### 8.5 Problema: Zod Validation Usa Muito Bundle Size

**Causa:** Zod serializa todos os schemas  
**Solução:**
1. Tree-shake: usar `zod/lib` imports diretos
2. Lazy load schemas com dynamic imports
3. Para mobile: validar apenas no backend, confiar no tipo TypeScript

---

## 9. Próximos Passos Recomendados

### 9.1 Antes de Semana 1 (Setup)
```bash
✅ Validar instalação:
   pnpm install
   pnpm run build         # Deve compilar sem erros

✅ Adicionar dependências que faltam:
   pnpm add tamagui @tamagui/config
   pnpm add zod
   pnpm add @supabase/supabase-js

✅ Criar estrutura de pastas:
   mkdir -p supabase/migrations
   mkdir -p packages/types/src
   mkdir -p packages/ui/src/components
```

### 9.2 Início de Semana 1 (Agente 1)
```typescript
// packages/types/src/index.ts
// Criar schemas Zod:
- TextBlockSchema
- VideoBlockSchema (básico)
- QuizBlockSchema (básico)
// Exportar tipos TypeScript correspondentes
```

### 9.3 Paralelo de Semana 1 (Agente 2)
```typescript
// packages/ui/src/tamagui.config.ts
// Configurar:
- Tokens de cores (brand, semantic)
- Tipografia (body, heading, mono)
- Espaçamento (gap sizes)
- Componentes: Button, Card, Text, Container

// packages/ui/src/components/
// Criar primitivos Tamagui
```

### 9.4 Semana 2 (Agente 3)
```typescript
// apps/admin-web/src/app/editor/page.tsx
// Criar:
- Canvas container
- Block palette (drag source)
- Inspector panel (edit properties)
// Conectar types + ui

// apps/aluno-mobile/src/screens/PlayerScreen.tsx
// Criar:
- Renderer JSON → Componentes
// Conectar types + ui
```

---

## 10. Métricas de Sucesso

Ao final de cada semana, avaliar:

| Métrica | Target | Como Medir |
|---------|--------|-----------|
| **Build Success Rate** | 100% | `pnpm run build` completa sem erros |
| **Type Coverage** | 100% | `npx type-coverage` no tsconfig |
| **Linting Score** | 100% | `pnpm run lint` zero warnings |
| **Zod Validation** | 3+ schemas | Schemas criados em @projeto/types |
| **Tamagui Tokens** | 5+ categories | Config completo com cores, spacing |
| **Component Count** | 5+ | Primitivos reutilizáveis criados |
| **Test Coverage** | 50%+ | (opcional em bootstrap) |
| **Documentation** | ADR + skills | Documentado em docs/layers/ |

---

## 11. Contato & Escalonamento

**Dúvidas de Arquitetura?**
→ Consultar `docs/AGENTS.md` seção "REGRAS CRUCIAIS"

**Erro de Build?**
→ Documentar em `docs/context_buffer.md` e ler error log completo

**Decisão Arquitetural Nova?**
→ Criar ADR em `docs/adrs/000X-*.md` antes de implementar

**Precisão de Timeline?**
→ Consultar `docs/roadmaps/sdp/sdp.md` seção "Cronograma"

---

**Documento Finalizado ✅**  
**Status:** Pronto para Bootstrap  
**Próximo:** Iniciar Semana 1 com Agente 1
