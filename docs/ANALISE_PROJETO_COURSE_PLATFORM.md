# 📊 Análise Técnica & Arquitetural - Plataforma de Cursos com CMS Modular

**Data da Análise:** 15 de maio de 2026  
**Projeto:** Course Platform - Infraestrutura Proprietária de Educação  
**Status do Repositório:** Bootstrap Inicial - Estrutura e Documentação Definidas

---

## 🎯 1. Visão Estratégica do Projeto

### 1.1 Proposta de Valor

A **Course Platform** é uma infraestrutura proprietária focada em três pilares:

1. **Autonomia Operacional:** Educadores conseguem criar layouts ricos **sem dependência de engenheiros** utilizando um visual builder tipo Canva.
2. **Experiência de Alto Padrão:** Interface fluida, responsiva e profissional que aumenta a autoridade técnica da marca.
3. **Escalabilidade Tecnológica:** Arquitetura modular preparada para suportar alto volume de requisições simultâneas e modificações em tempo real.

### 1.2 Diferenciação de Mercado

- **CMS Drag-and-Drop:** Editor visual inline, sem formulários estáticos tradicionais.
- **Renderização Dinâmica:** JSON → Componentes Nativos (Web/Mobile) sem recompilação.
- **Segurança Corporativa:** Row Level Security (RLS) no Supabase, validação Zod de ponta a ponta.
- **Ecossistema Separado:** Admin (Next.js) ≠ Aluno (Expo), cada um otimizado para seu caso de uso.

---

## 🏗️ 2. Arquitetura Técnica

### 2.1 Stack Tecnológico (Decisions Locked)

| Camada | Tecnologia | Motivo | Status |
|--------|-----------|--------|--------|
| **Frontend Admin** | Next.js 16.2.6 (App Router) | SSR, API Routes integradas, TypeScript nativo | ✅ Produção |
| **Frontend Mobile** | Expo 54.0.33 + Expo Router | React Native com sintaxe Web, OTA Updates | ✅ Produção |
| **Backend & Dados** | Supabase (PostgreSQL) | Realtime, Auth, Storage, RLS integrados | ✅ Produção |
| **Design System** | Tamagui 1.x | Cross-platform (Web + Native), tema via CSS-in-JS | ✅ Produção |
| **Validação & Tipos** | TypeScript 5.x + Zod | Type-safe em runtime, contratos de API explicados | ✅ Produção |
| **Gerenciamento de Pacotes** | pnpm Workspace | Monorepo híbrido, dependências isoladas | ✅ Produção |

### 2.2 Estrutura do Monorepo

```
course-platform-main/
├── apps/
│   ├── admin-web/              # Next.js 16 - Estúdio do Administrador
│   │   ├── src/app/            # App Router pages
│   │   ├── public/             # Assets estáticos
│   │   └── package.json        # React 19.2.4, Next 16.2.6
│   │
│   └── aluno-mobile/           # Expo 54 - Portal do Aluno
│       ├── src/                # Screens e Navegação (Expo Router)
│       ├── assets/             # Ícones e imagens
│       └── package.json        # React 19.1.0, Expo 54
│
├── packages/
│   ├── types/                  # Contratos, Schemas Zod, Tipagem Global
│   │   └── src/index.ts        # Schemas de: TextBlock, VideoBlock, QuizBlock
│   │
│   └── ui/                     # Design System & Componentes Atômicos
│       ├── src/                # Primitivos Tamagui (Button, Card, Text, etc)
│       └── tamagui.config.ts   # Configuração centralizada de tokens
│
├── docs/
│   ├── AGENTS.md               # Regras de Workflow para IAs
│   ├── CONTEXT_MAP.md          # Índice de Camadas & Arquivos
│   ├── context_buffer.md       # Estado da Execução Atual (Updated per session)
│   ├── ARCHITECTURAL_SEVERITY.md
│   ├── FORBIDDEN_OPERATIONS.md
│   ├── adrs/                   # Architecture Decision Records
│   ├── layers/                 # Documentação de cada camada técnica
│   ├── history/                # Registro histórico de sessões
│   └── roadmaps/               # SDP (Software Development Plan)
│
├── pnpm-workspace.yaml         # Configuração do monorepo
├── pnpm-lock.yaml              # Lock file (295KB)
└── opencode.json               # Metadados do projeto
```

### 2.3 Camadas Técnicas Definidas

#### **Camada 1: Contratos de Dados (packages/types/)**
- **Responsável:** Agente 1 (Product Manager)
- **Artefatos:** 
  - Schemas Zod para TextBlock, VideoBlock, QuizBlock
  - Tipagem TypeScript de ponta a ponta
  - Validação em tempo de execução
- **Restrição:** ⚠️ Sem código visual ou SQL

#### **Camada 2: Design System (packages/ui/)**
- **Responsável:** Agente 2 (Tech Lead & Arquiteto)
- **Artefatos:**
  - `tamagui.config.ts` com tokens globais
  - Componentes primitivos (Button, Card, Text, Container)
  - Sem estilização Tailwind/Sass/inline CSS
- **Restrição:** ⚠️ PROIBIDO usar utilitários CSS externos

#### **Camada 3: Banco de Dados & Persistência (supabase/migrations/)**
- **Responsável:** Agente 2 (Tech Lead & Arquiteto)
- **Artefatos:**
  - Migrações SQL com tabelas de aulas, módulos
  - Colunas JSONB para árvore de componentes
  - Políticas RLS para segurança de acesso
- **Restrição:** ⚠️ Sem código de UI ou validação Zod

#### **Camada 4: Aplicações Finais (apps/)**
- **Responsável:** Agente 3 (Desenvolvedor Pleno)
- **Artefatos:**
  - Telas do Editor Visual (admin-web)
  - Telas do Portal de Consumo (aluno-mobile)
  - Hooks customizados, clientes Supabase
  - Roteamento Next.js/Expo Router
- **Restrição:** ⚠️ Dependente das camadas 1, 2, 3

#### **Camada 5: Core & Lógica Compartilhada (future: packages/core/)**
- **Status:** Não existente ainda
- **Escopo Futuro:** Regras de negócio isoladas, event bus, undo/redo, offline strategy

#### **Camada 6: Motor de Renderização (future: packages/renderer/)**
- **Status:** Não existente ainda
- **Escopo Futuro:** Registry dinâmico de componentes, lazy loading, plugins marketplace

---

## 📋 3. Cronograma de Desenvolvimento (8 Semanas)

### Timeline & Dependências

```
Semana 1-2: Design de Componentes & Contratos
  ├─ Tipos Zod (TextBlock, VideoBlock, QuizBlock)
  ├─ Configuração Tamagui
  └─ Primitivos visuais base
          ↓
Semana 3-4: Motor do Editor (Drag & Drop)
  ├─ Gerenciamento de estado Canvas
  ├─ Integração de bibliotecas D&D
  └─ Edição inline em tempo real
          ↓
Semana 5: Infraestrutura de Mídia & Persistência
  ├─ Migrações PostgreSQL + JSONB
  ├─ Buckets Supabase Storage
  ├─ Políticas RLS
  └─ Salvamento automático (debounce)
          ↓
Semana 6-7: Painel CMS (Admin Studio)
  ├─ Dashboard e listagens
  ├─ Fluxo de publicação
  └─ Feedback visual resiliente
          ↓
Semana 8: Portal do Aluno (Mobile Hybrid)
  ├─ Expo Router navigation
  ├─ Interpretador JSON → Componentes
  └─ Experiência mobile nativa
```

### Entregáveis por Fase

| Fase | Semanas | Entregáveis | Impacto |
|------|---------|-------------|--------|
| **Design & Contratos** | 1-2 | types/, ui/, tamagui.config.ts | Fundação para tudo |
| **Motor Editor** | 3-4 | Drag-drop engine, state management | CMS funcional |
| **Persistência** | 5 | Migrações SQL, RLS, Storage | Dados em produção |
| **CMS Completo** | 6-7 | Admin dashboard, publicação | Go-live administrador |
| **Portal Aluno** | 8 | Mobile app, renderização JSON | Go-live usuário final |

---

## 🔐 4. Segurança & Governança

### 4.1 Políticas de Código Mandatórias

#### ✅ Obrigatório:
- TypeScript strict mode
- Validação Zod em tempo de execução
- Row Level Security (RLS) em todas as queries
- Componentes Tamagui para UI (zero CSS inline)
- Documentação de ADRs para decisões arquiteturais

#### ❌ Proibido:
- Tailwind CSS, Sass, ou CSS utilities
- CSS inline nos componentes
- Queries SQL sem RLS
- Commits sem permission explícita do usuário
- Mudanças na pasta `docs/history/` (imutável)
- Globbing de arquivo da pasta `docs/` sem necessidade

### 4.2 Fluxo de Validação de Dados

```
Input (Usuário/CMS)
    ↓
[Zod Schema Validation] ← tipos/@projeto/types
    ↓
[Type Guard + Runtime Check]
    ↓
[RLS Policy Check] ← Supabase PostgreSQL
    ↓
[Persistência no JSONB]
    ↓
[Renderização no Front] ← Componentes Tamagui
```

### 4.3 Matriz de Responsabilidade (RACI)

| Atividade | Agente 1 | Agente 2 | Agente 3 | Usuário |
|-----------|----------|----------|----------|---------|
| Schemas Zod | **R** | C | C | - |
| Tipagem Global | **R** | C | C | - |
| Tokens Tamagui | I | **R** | - | - |
| SQL + RLS | - | **R** | I | - |
| Componentes Atômicos | C | **R** | - | - |
| Bibliotecas Externas | I | C | **R** | - |
| Telas & Views | - | C | **R** | - |
| Hooks Customizados | - | - | **R** | - |
| Testes & Validação | - | - | - | **R** |
| Aprovação & Git | - | - | - | **R** |

**Legenda:** R=Responsável, A=Accountable, C=Consultado, I=Informado

---

## 🤖 5. Workflow de Engenharia de IA (Algoritmo MCP)

### 5.1 Algoritmo Obrigatório de 4 Passos

Toda tarefa segue rigorosamente este ciclo:

#### **PASSO 1: Diagnóstico & Lazy Loading**
```
1. Ler docs/CONTEXT_MAP.md
2. Ler docs/context_buffer.md
3. Identificar camada afetada
4. Ler skill + plano específicos da camada
5. NÃO fazer glob reading indiscriminado de docs/
```

#### **PASSO 2: Atualização da Memória RAM (Before-Code)**
```
1. Reescrever docs/context_buffer.md
2. Campo "Tarefa em Execução" ← objetivo imediato
3. Campo "Camada Ativa" ← arquivos que serão modificados
4. Preparar para execução
```

#### **PASSO 3: Execução Cirúrgica (Code Changes)**
```
1. Modificar código APENAS dentro do escopo permitido
2. Se erro TypeScript/Lint/Zod: PARAR
3. Documentar erro em context_buffer.md
4. Tentar correção apenas após doc
```

#### **PASSO 4: Consolidação & Purga (After-Code)**
```
1. Code compila com sucesso → marcar [x] no plano
2. Limpar seção "Impedimentos" do buffer
3. Exibir estado resumido do buffer
4. Estimativa de consumo de tokens da sessão
```

### 5.2 Protocolo de Git Versionamento

#### ✅ Obrigatório:
1. **NUNCA fazer git commit automaticamente**
2. **Sempre solicitar que usuário teste localmente primeiro**
3. **Apenas após aprovação explícita, sugerir commit**
4. **Mensagem em inglês, Conventional Commits**
5. **Conciso:** `feat: add text block schema`, `chore: update rls policies`

#### ❌ Proibido:
- Commits sem permissão explícita
- Mensagens de commit em português
- Mensagens genéricas ("Update code", "Fix stuff")
- Múltiplos commits para uma tarefa lógica

---

## 📚 6. Documentação & Camadas

### 6.1 Estrutura de Documentação

```
docs/
├── AGENTS.md                          [P0 - Ler SEMPRE primeiro]
├── context_buffer.md                  [P1 - Estado atual da execução]
├── CONTEXT_MAP.md                     [P2 - Índice de camadas]
├── ARCHITECTURAL_SEVERITY.md          [Prioridades de decisões]
├── ARCHITECTURE_DECISION_CHECKLIST.md [Validação de mudanças]
├── FORBIDDEN_OPERATIONS.md            [O que NÃO fazer]
│
├── adrs/                              [Architecture Decision Records]
│   └── 0001-escolha-da-stack-e-estilizacao.md
│
├── layers/                            [Documentação técnica por camada]
│   ├── types/
│   │   ├── execution_plan.md
│   │   ├── zod_strict_validation_skill.md
│   │   ├── jsonb-governance.md
│   │   └── data-lifecycle.md
│   ├── ui/
│   │   ├── execution_plan.md
│   │   ├── tamagui_tokenization_skill.md
│   │   └── token-governance.md
│   ├── supabase/
│   │   ├── database_schema_plan.md
│   │   ├── rls_governance_skill.md
│   │   └── security-policies.md
│   ├── apps/
│   │   ├── admin_canvas_plan.md
│   │   └── mobile_player_plan.md
│   ├── core/
│   │   ├── domain-logic.md
│   │   ├── event-architecture.md
│   │   └── offline-strategy.md
│   ├── renderer/
│   │   └── engine-spec.md
│   └── infra/
│       ├── observability.md
│       └── future-automation.md
│
├── history/                           [Registros históricos - IMUTÁVEIS]
│   ├── README.md
│   └── session_01_architecture_setup.md
│
└── roadmaps/
    ├── governance/
    │   └── session-01-governance-bootstrap.md
    └── sdp/
        └── sdp.md                     [O plano detalhado de 8 semanas]
```

### 6.2 Leitura Obrigatória por Papel

**Para Agente 1 (Product Manager):**
1. AGENTS.md
2. docs/layers/types/execution_plan.md
3. docs/layers/types/zod_strict_validation_skill.md
4. docs/layers/types/data-lifecycle.md

**Para Agente 2 (Tech Lead & Arquiteto):**
1. AGENTS.md
2. docs/layers/ui/execution_plan.md
3. docs/layers/ui/tamagui_tokenization_skill.md
4. docs/layers/supabase/database_schema_plan.md
5. docs/layers/supabase/rls_governance_skill.md

**Para Agente 3 (Desenvolvedor Pleno):**
1. AGENTS.md
2. docs/layers/apps/admin_canvas_plan.md
3. docs/layers/apps/mobile_player_plan.md
4. docs/layers/core/domain-logic.md (futuro)

---

## 💾 7. Análise de Código Existente

### 7.1 Estrutura Atual dos Arquivos

#### **apps/admin-web/**
```typescript
// package.json
{
  "name": "admin-web",
  "version": "0.1.0",
  "dependencies": {
    "next": "16.2.6",
    "react": "19.2.4",
    "@projeto/types": "workspace:*",
    "@projeto/ui": "workspace:*"
  }
}

// Estrutura
src/app/
├── favicon.ico
├── globals.css        # CSS global (mínimo)
├── layout.tsx         # Root layout Next.js
├── page.tsx           # Página inicial
└── page.module.css    # Estilos por página
```

**Status:** Bootstrap inicial - Apenas estrutura Next.js padrão

#### **apps/aluno-mobile/**
```typescript
// package.json
{
  "name": "aluno-mobile",
  "version": "1.0.0",
  "dependencies": {
    "expo": "~54.0.33",
    "react-native": "0.81.5",
    "react": "19.1.0",
    "@projeto/types": "workspace:*",
    "@projeto/ui": "workspace:*"
  }
}

// Estrutura
├── App.tsx           # Entry point
├── app.json          # Expo config
├── index.ts          # Root index
└── assets/           # Icons & images
```

**Status:** Bootstrap inicial - Projeto Expo base

#### **packages/types/**
```typescript
// package.json
{
  "name": "@projeto/types",
  "version": "1.0.0",
  "type": "module"  // ESM
}

// Estrutura (esperada)
src/
└── index.ts         # Schemas Zod + TypeScript types
```

**Status:** VAZIO - Aguardando primeira tarefa

#### **packages/ui/**
```typescript
// package.json
{
  "name": "@projeto/ui",
  "version": "1.0.0",
  "type": "module"  // ESM
}

// Estrutura (esperada)
src/
├── tamagui.config.ts    # Tokens + tema
└── components/          # Primitivos (Button, Card, Text, etc)
```

**Status:** VAZIO - Aguardando primeira tarefa

### 7.2 Dependências Instaladas (pnpm-lock.yaml - 295KB)

As dependências base estão pinadas mas o projeto ainda não inicia. Observações:

- ✅ Next.js 16.2.6 instalado
- ✅ React 19.x instalado
- ✅ Expo 54.0.33 instalado
- ✅ TypeScript 5.x instalado
- ⚠️ Tamagui NÃO ainda instalado (sera adicionado em fase inicial)
- ⚠️ Zod NÃO ainda instalado (sera adicionado em fase 1)
- ⚠️ Supabase client NÃO ainda instalado (sera adicionado em fase 5)

---

## 🚨 8. Problemas Identificados & Recomendações

### 8.1 Problemas Críticos

| # | Problema | Severidade | Recomendação |
|---|----------|-----------|--------------|
| P1 | Nenhuma dependência Tamagui instalada | 🔴 CRÍTICO | Adicionar à package.json antes de iniciar semanas 1-2 |
| P2 | Nenhuma dependência Zod instalada | 🔴 CRÍTICO | Adicionar para validação em tempo de execução |
| P3 | Pasta `supabase/migrations/` não existe | 🔴 CRÍTICO | Criar estrutura de migrações SQL antes de semana 5 |
| P4 | packages/ui vazia | 🟡 ALTO | Agente 2 deve criar tamagui.config.ts primeira coisa |
| P5 | packages/types vazia | 🟡 ALTO | Agente 1 deve criar schemas Zod base |
| P6 | Nenhuma autenticação Supabase | 🟡 ALTO | Adicionar cliente Supabase apenas em fase 5 |

### 8.2 Recomendações de Boot

**Para iniciar o projeto corretamente:**

1. **ANTES de começar qualquer código:**
   ```bash
   pnpm install
   # Adicionar Tamagui, Zod, Supabase, bibliotecas D&D
   ```

2. **Fase 1 (Semana 1):**
   - Agente 1: Criar `packages/types/src/index.ts` com schemas Zod
   - Agente 2: Criar `packages/ui/src/tamagui.config.ts` com tokens

3. **Antes de Fase 5:**
   - Criar pasta `supabase/migrations/`
   - Definir schema PostgreSQL base

4. **Testes Locais:**
   - `pnpm run build` deve compilar sem erros
   - `pnpm run lint` deve passar
   - `pnpm run dev` deve iniciar Next.js e Expo

---

## 📊 9. Matriz de Complexidade & Esforço

### Estimativa por Fase

| Fase | Complexidade | Horas Estimadas | Risk |
|------|-------------|-----------------|------|
| 1-2: Design & Contratos | 🟡 Média | 16-20h | Bom (definições claras) |
| 3-4: Motor Editor | 🔴 Alta | 32-40h | Médio (state management) |
| 5: Persistência | 🟡 Média | 12-16h | Médio (RLS policies) |
| 6-7: CMS Completo | 🔴 Alta | 24-32h | Médio (integração) |
| 8: Portal Aluno | 🟡 Média | 16-20h | Baixo (renderizador) |
| **TOTAL** | - | **100-128h** | **8 semanas OK** |

---

## 🎓 10. Aprendizados & Insights

### 10.1 Forças da Arquitetura

✅ **Separação clara de responsabilidades:** Cada agente IA tem escopo bem definido  
✅ **Monorepo bem estruturado:** pnpm workspace + TypeScript compartilhado  
✅ **Documentação detalhada:** ADRs, planos de execução, contexto buffer  
✅ **Validação de ponta a ponta:** Zod + TypeScript garante contratos  
✅ **Cross-platform:** Tamagui permite Web + Mobile com mesmo code base  
✅ **Segurança first:** RLS, validação, tipagem strict  

### 10.2 Desafios Conhecidos

⚠️ **Complexidade do motor Drag-and-Drop:** Semanas 3-4 serão intensas  
⚠️ **Gerenciamento de estado Canvas:** Precisa de otimização para não re-renderizar tudo  
⚠️ **Sincronização em tempo real:** Supabase Realtime pode ter latência inesperada  
⚠️ **Mobile offline-first:** Estratégia de sync ainda não definida  
⚠️ **Marketplace de componentes:** Futuro - pode impactar architecture hoje  

### 10.3 Próximos Passos Imediatos

1. ✅ **Você (Edson) validou a estrutura** ← Está aqui agora
2. 🔄 **Instalar dependências Tamagui + Zod**
3. 🔄 **Agente 1 cria primeiro schema de TextBlock**
4. 🔄 **Agente 2 cria tamagui.config.ts inicial**
5. 🔄 **Build dos pacotes packages/types e packages/ui**
6. 🔄 **Agente 3 cria tela base no admin-web com componentes**

---

## 🎬 11. Conclusão & Recomendações

### Status Geral: ✅ PRONTO PARA BOOTSTRAP

O projeto está **bem documentado, bem arquitetado e pronto para iniciar**. A estrutura segue princípios sólidos de engenharia de software:

- ✅ Monorepo modular com pnpm
- ✅ TypeScript + Zod para segurança de tipos
- ✅ Design System centralizado (Tamagui)
- ✅ Separação clara entre Web/Mobile
- ✅ Documentação completa de fluxo MCP
- ✅ Plano de desenvolvimento realista (8 semanas)

### Recomendações Finais

1. **Validar instalação de dependências** antes de começar Semana 1
2. **Manter docs/context_buffer.md atualizado** a cada sessão
3. **Sempre ler AGENTS.md + CONTEXT_MAP.md** antes de qualquer tarefa
4. **Nunca pular fases:** Type contracts → Arquitetura → Implementação → Testes
5. **Commits sempre em inglês** com Conventional Commits
6. **Testes locais ANTES de merge** - usuário sempre aprova

---

**Análise Completa Finalizada ✅**  
**Repositório:** course-platform-main  
**Estrutura:** Validada e Documentada  
**Próximo Passo:** Iniciar Semana 1 - Design de Componentes & Contratos
