# Plataforma de Cursos com CMS Modular (Visual Builder)

Uma infraestrutura proprietária de educação focada em alta performance, autonomia operacional e flexibilidade de design. O ecossistema separa completamente o ecossistema de criação (Estúdio do Administrador) da experiência otimizada de consumo (Portal do Aluno).

---

## Visão Geral e Pilares Técnicos

*   **CMS Estilo Canva (O Estúdio do ADM):** Interface visual interativa onde o administrador arrasta, solta e edita os blocos de conteúdo de cada aula, eliminando formulários estáticos tradicionais.
*   **Editor de Conteúdo "In-Place":** Edição direta de textos, mídias e propriedades visuais clicando no próprio elemento em tempo real na tela.
*   **Frontend de Alta Performance (A Vitrine do Aluno):** Um motor de renderização leve e otimizado que interpreta a árvore de blocos e entrega uma interface fluida, adaptada e profissional para dispositivos Web e Mobile.
*   **Arquitetura de Dados Flexível:** Armazenamento estruturado de layouts em formato de blocos dinâmicos (`JSONB`), permitindo a expansão para novos tipos de conteúdo sem quebras de compatibilidade ou migrações complexas de banco de dados.
*   **Offline-First com SQLite:** Sistema de cache offline via `expo-sqlite` que permite aos alunos continuar assistindo aulas mesmo sem conexão, com sincronização automática ao reconectar.

---

## Stack Tecnológica & Arquitetura

O projeto adota uma arquitetura de **Monorepo Híbrido** e modular, garantindo reaproveitamento de lógica e contratos rígidos entre plataformas:

| Camada | Tecnologia |
|---|---|
| **Frontend Web (Admin)** | [Next.js](https://nextjs.org) 16 (App Router) |
| **Mobile App (Aluno)** | [Expo](https://expo.dev) 54 (Expo Router) |
| **Backend & Infraestrutura** | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage, RLS) |
| **Design System** | [Tamagui](https://tamagui.dev) via `packages/ui` (tokens, temas light/dark) |
| **Motor de Renderização** | `packages/renderer` — interpreta JSONB em blocos visuais |
| **Validação & Tipagem** | [TypeScript](https://typescriptlang.org) + [Zod](https://zod.dev) (contratos em tempo de execução) |
| **Cache Offline** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (progresso + módulos) |
| **Testes** | [Vitest](https://vitest.dev) + @testing-library/react |

---

## Roadmap de Desenvolvimento (Progresso Actual)

| Fase | Módulo | Progresso | Detalhes |
|------|--------|-----------|----------|
| ✅ | **Banco de Dados (Supabase)** | **100%** | 13 migrações, 11 tabelas, RLS em todas, 5+ índices de performance. |
| ✅ | **Design System (Tamagui)** | **100%** | Primitivos visuais, tokens base 4px, temas light/dark, 6 componentes de bloco cross-platform. |
| ✅ | **Contratos de Dados (Zod)** | **100%** | Schemas para courses, lessons, modules, progress, certificates. Validação em tempo de execução. |
| ✅ | **Domínio e Serviços** | **100%** | 6 serviços (Course, Lesson, Progress, Auth, Certificate, Storage) com arquitetura Ports & Adapters. |
| ✅ | **Motor de Renderização** | **100%** | 8 tipos de bloco (text, video, image, heading, divider, quote, html, quiz). JSONB → UI via if-chain. |
| ✅ | **Estúdio do Administrador (CMS)** | **90%** | CRUD de cursos, editor visual com drag-and-drop, canvas de preview, publicação com versionamento, certificados. |
| ✅ | **Autenticação e Segurança** | **85%** | Supabase Auth, JWT, RLS policies, middleware admin, DOMPurify XSS prevention. |
| ✅ | **Portal do Aluno (Renderização)** | **75%** | Player de aulas, renderização de blocos, progress tracking, quizzes, emissão de certificados. |
| ✅ | **Offline-First (SQLite)** | **70%** | expo-sqlite para progresso e cache de módulos, sincronização bidireccional, badge offline, auto-sync. |
| 🟡 | **Relatórios e Analytics** | **60%** | KPIs, matrículas, ranking de cursos, revisit tracking — telas admin implementadas. |
| 🟡 | **Gestão de Mídia** | **50%** | Upload via Supabase Storage, thumbnails, filtros por tipo. CDN para streaming pendente. |
| 🟡 | **Integrações Externas** | **40%** | Certificados com UUID extranet, planos de acesso. Pagamentos e notificações pendentes. |
| ⏳ | **Escalabilidade** | **20%** | Rate limiting, Redis cache, connection pooling, read replicas — apenas documentado. |
| ⏳ | **Testes E2E** | **15%** | Playwright configurado, poucos testes escritos. Suite completa pendente. |
| 🔜 | **Observabilidade** | **Pendente** | Health checks implementados. Logs estruturados, métricas, alertas pendentes. |
| 🔜 | **Deploy e CI/CD** | **Pendente** | GitHub Actions configurado. Deploy automático pendente. |

---

## Estrutura do Repositório

```text
plataforma_cursos/
├── apps/
│   ├── admin/              # Estúdio do Administrador (Next.js App Router)
│   └── student/            # Portal do Aluno (Expo Router — Web + Mobile)
├── packages/
│   ├── core/               # Lógica de negócio, serviços, adapters (Ports & Adapters)
│   ├── types/              # Contratos globais, schemas Zod, tipos TypeScript
│   ├── ui/                 # Design System Tamagui, tokens, componentes base
│   └── renderer/           # Motor de renderização de blocos JSONB
├── supabase/
│   └── migrations/         # 13 migrações SQL, schemas, RLS policies, índices
├── docs/                   # ADRs, skills, roadmaps, planos de execução
├── governance/             # Workflow, context buffer, agents, contratos
├── scripts/                # Scripts de automação (validate-session, close-session, upload)
└── premortem/              # Templates de pré-mortem
```

---

## Componentes Principais

### Aplicações

| App | Stack | Responsabilidade |
|-----|-------|-----------------|
| `apps/admin` | Next.js 16 (App Router) | CMS visual com editor drag-and-drop, gestão de cursos/módulos/aulas, relatórios, certificados |
| `apps/student` | Expo 54 (Web + Mobile) | Player de aulas, progress tracking, quizzes, cache offline, certificados |

### Pacotes Internos

| Pacote | Responsabilidade |
|--------|-----------------|
| `packages/core` | Serviços de domínio, adapters Supabase, ports (interfaces), lógica de negócio |
| `packages/types` | Contratos Zod centralizados, schemas de blocos, tipos partilhados |
| `packages/ui` | Design System cross-platform (Tamagui), 6 componentes de bloco, tokens |
| `packages/renderer` | Motor de renderização — traduz JSONB em componentes UI visuais |

### Banco de Dados

| Tabela | Propósito |
|--------|-----------|
| `courses` | Cursos com blocks JSONB de certificado |
| `modules` | Módulos organizacionais dos cursos |
| `lessons` | Aulas com blocos JSONB de conteúdo + versionamento |
| `student_progress` | Progresso do aluno por aula (vídeo + quiz + blocos interactivos) |
| `enrollments` | Matrículas de alunos em cursos |
| `certificates` | Certificados emitidos com UUID extranet |
| `profiles` | Perfis de utilizador (aluno, professor, admin) |
| `paths` / `path_courses` | Trilhas de aprendizado |
| `course_access` / `plans` / `student_plans` | Controlo de acesso e planos |

---

## Fluxos Principais

### Fluxo de Publicação (Estúdio → Aluno)
1. Professor edita blocos no Canvas Admin
2. Blocos JSONB salvos como draft via `LessonService.saveDraft()`
3. Publicação: `LessonService.publishLesson()` incrementa `version`
4. Student App detecta mudança via polling (30s) ou realtime
5. Novos blocos renderizados pelo `BlockRenderer`

### Fluxo Offline-First
1. Aluno abre aula → `progressOfflineStore` restaura progresso do SQLite
2. Progresso salvo localmente (SQLite) + remotamente (Supabase) quando online
3. Módulo é cacheado automaticamente ao abrir aula
4. Sync silencioso a cada 30s (`syncService.startAutoSync`)
5. Badge "Offline" aparece no header quando sem conexão
6. Limpeza de cache anterior com verificação de estabilidade de rede

### Fluxo de Autenticação
1. Login via Supabase Auth (email/senha)
2. JWT validado no middleware (admin) e no cliente (student)
3. RLS policies controlam acesso a dados por role
4. Auto-confirm em ambiente de desenvolvimento

---

## Diferenciais Estratégicos

1. **Autonomia Operacional:** Liberdade total para a equipe pedagógica e administradores criarem layouts ricos sem dependência de equipes de engenharia ou design.
2. **Valor Percebido:** Interface de alto padrão estético com transições fluidas, aumentando a autoridade técnica e comercial da marca frente ao aluno.
3. **Escalabilidade Tecnológica:** Base de dados projetada especificamente para suportar alto volume de requisições simultâneas e modificações estruturais em tempo real.
4. **Offline-First:** Alunos podem continuar o aprendizado sem conexão, com sincronização transparente ao reconectar.
5. **Cross-Platform:** Design System partilhado entre Admin (Web) e Student (Web + Mobile) via Tamagui.

---

## Desenvolvimento

### Pré-requisitos

- Node.js ≥ 18
- pnpm ≥ 8
- Supabase project (variáveis de ambiente em `.env.local`)

### Comandos

```bash
# Instalar dependências
pnpm install

# Desenvolvimento — Admin
pnpm --filter admin dev

# Desenvolvimento — Student
pnpm --filter student start:web

# Build
pnpm --filter admin run build
pnpm --filter student run build:web

# Testes
pnpm run test

# Validação de sessão
pnpm run validate:session
pnpm run close:session
```

### Variáveis de Ambiente

Copiar `.env.example` para `.env.local` e preencher:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_ADMIN_KEY=<admin-key>
```
