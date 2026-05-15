# Plataforma de Cursos com CMS Modular (Visual Builder)

Uma infraestrutura proprietária de educação focada em alta performance, autonomia operacional e flexibilidade de design. O ecossistema separa completamente o ecossistema de criação (Estúdio do Administrador) da experiência otimizada de consumo (Portal do Aluno).

---

## 🚀 Visão Geral e Pilares Técnicos

*   **CMS Estilo Canva (O Estúdio do ADM):** Interface visual interativa onde o administrador arrasta, solta e edita os blocos de conteúdo de cada aula, eliminando formulários estáticos tradicionais.
*   **Editor de Conteúdo "In-Place":** Edição direta de textos, mídias e propriedades visuais clicando no próprio elemento em tempo real na tela.
*   **Frontend de Alta Performance (A Vitrine do Aluno):** Um motor de renderização leve e otimizado que interpreta a árvore de blocos e entrega uma interface fluida, adaptada e profissional para dispositivos Web e Mobile.
*   **Arquitetura de Dados Flexível:** Armazenamento estruturado de layouts em formato de blocos dinâmicos (`JSONB`), permitindo a expansão para novos tipos de conteúdo sem quebras de compatibilidade ou migrações complexas de banco de dados.

---

## 🛠️ Stack Tecnológica & Arquitetura

O projeto adota uma arquitetura de **Monorepo Híbrido** e modular, garantindo reaproveitamento de lógica e contratos rígidos entre plataformas:

*   **Monorepo:** Gerenciado com foco em isolamento de escopo por pacotes e aplicações.
*   **Frontend Web:** [Next.js](https://nextjs.org) utilizando a arquitetura de **App Router**.
*   **Mobile App:** [Expo](https://expo.dev) utilizando **Expo Router** para navegação nativa.
*   **Backend & Infraestrutura:** [Supabase](https://supabase.com) provendo Banco de Dados PostgreSQL, Autenticação, Armazenamento Seguro de Mídias (Storage) e Segurança via Row Level Security (RLS).
*   **Design System & Estilização:** [Tamagui](https://tamagui.dev) injetado centralizadamente via `packages/ui`. Toda a estilização obedece ao princípio **DRY** através de propriedades dinâmicas (`props`) enviadas diretamente pelo CMS. *É proibido o uso de utilitários externos como Tailwind, Sass ou CSS inline.*
*   **Validação & Tipagem:** [TypeScript](https://typescriptlang.org) de ponta a ponta com validação de contratos em tempo de execução via [Zod](https://zod.dev).

---

## 📦 Estrutura do Repositório

```text
├── apps/
│   ├── admin-web/          # Estúdio do Administrador (Next.js App Router)
│   └── aluno-mobile/       # Aplicativo do Aluno (Expo Router Nativo)
├── packages/
│   ├── types/              # Contratos globais, regras de negócio e Schemas Zod
│   └── ui/                 # Design System, configurações do Tamagui e componentes base
├── supabase/
│   └── migrations/         # Schemas SQL, tabelas JSONB e políticas de RLS
└── docs/                   # Registros de arquitetura (ADRs) e cronogramas
```

---

## 📅 Cronograma de Desenvolvimento (8 Semanas)


| Fase | Descrição | Impacto no Negócio |
| :--- | :--- | :--- |
| **Semanas 1-2** | **Design de Componentes** | Construção dos primitivos visuais e moldes base no Tamagui que compõem o CMS. |
| **Semanas 3-4** | **Motor do Editor** | Desenvolvimento do motor lógico de arrastar, soltar e atualizar a árvore de blocos. |
| **Semana 5** | **Infraestrutura de Mídia** | Configuração dos buckets seguros no Supabase para imagens, vídeos e arquivos privados. |
| **Semanas 6-7** | **Entrega do CMS** | Finalização do painel administrativo (Estúdio de Criação) integrado ao banco. |
| **Semana 8** | **Portal do Aluno** | Lançamento do ambiente multiplataforma para consumo fluido e otimizado das aulas. |

---

## 🎯 Diferenciais Estratégicos

1. **Autonomia Operacional:** Liberdade total para a equipe pedagógica e administradores criarem layouts ricos sem dependência de equipes de engenharia ou design.
2. **Valor Percebido:** Interface de alto padrão estético com transições fluidas, aumentando a autoridade técnica e comercial da marca frente ao aluno.
3. **Escalabilidade Tecnológica:** Base de dados projetada especificamente para suportar alto volume de requisições simultâneas e modificações estruturais em tempo real.
