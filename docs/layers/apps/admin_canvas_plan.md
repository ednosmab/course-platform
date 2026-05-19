# Plano do Estúdio Canvas (Admin Web)

## 🎯 Objetivo
Projetar a arquitetura técnica, fluxo de dados e experiência do usuário (UX) para o construtor visual de aulas (Canvas estilo Canva) no portal do Administrador (`apps/admin`), integrando o sistema de estilização Tamagui e validação Zod.

---

## 🛠️ Stack Tecnológica do Canvas
* **Framework:** Next.js 16.2 (App Router)
* **Estilização:** Tamagui Web (Tokens de cores e superfícies)
* **Arrastar e Soltar (Drag & Drop):** `@dnd-kit/core` e `@dnd-kit/sortable`
* **Gerenciamento de Estado Ativo:** Zustand (leve, ideal para manipulação de listas e árvores complexas de componentes)
* **Validação dos Blocos:** Zod (usando schemas importados diretamente de `@projeto/types`)
* **Persistência:** Supabase Client + Debounced Auto-Save (500ms)

---

## 📐 Arquitetura do Componente Canvas

O editor visual é dividido em três regiões principais de controle:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [TopBar] Nome da Aula, Status (Rascunho/Publicado), Botão Fechar      │
├─────────────────┬──────────────────────────────────────┬───────────────┤
│  [Sidebar Bl.]   │                                      │ [Sidebar Pr.] │
│                 │          [Visual Canvas]             │               │
│  - Texto        │                                      │ - Propriedades│
│  - Vídeo        │   Árvore de blocos interativos       │   detalhadas  │
│  - Quiz         │   arrastáveis, reordenáveis          │   do bloco    │
│                 │   e selecionáveis.                   │   selecionado │
│  - Upload       │                                      │   (ex: Zod    │
│                 │                                      │   inputs)     │
└─────────────────┴──────────────────────────────────────┴───────────────┘
```

### 1. `SidebarBlocks` (Painel Esquerdo)
Menu de componentes disponíveis para inserção.
* Ao arrastar ou clicar em um item, insere o bloco padrão na árvore do Zustand.
* Os blocos suportados são:
  * **Texto:** Bloco para exibição de texto formatado (Rich Text).
  * **Vídeo:** Bloco com reprodutor de vídeo (URL Supabase Storage ou externa).
  * **Quiz:** Construtor de perguntas com opções de respostas de múltipla escolha.

### 2. `VisualCanvas` (Área Central)
Área de montagem física dos blocos da aula.
* Utiliza o wrapper `@dnd-kit/sortable` para permitir a reordenação instantânea dos blocos por arraste vertical.
* Cada bloco é renderizado por um componente de preview correspondente em `packages/ui`.
* Ao passar o mouse, exibe controles rápidos: *Remover*, *Mover (Dnd Handle)* e *Duplicar*.
* Ao clicar em um bloco do Canvas, ele é definido como o `activeBlockId` no estado global do Zustand.

### 3. `SidebarProperties` (Painel Direito)
Formulário gerado dinamicamente com base nas propriedades do bloco selecionado.
* Valida todas as alterações em tempo real via Zod.
* Se um valor inserido for inválido (ex: URL de vídeo mal formatada), exibe erros visuais detalhados na interface do construtor e impede o auto-save.

---

## 🔄 Fluxo de Estado e Salvamento Automático (Auto-Save)

```
[Ação do Usuário] ──> Modifica Estado (Zustand) ──> Validação Zod (types)
                                                          │
                                                (Se Válido / Debounce 500ms)
                                                          ▼
[Interface Visual] <── Sincroniza Sucesso ── Supabase (`public.lessons`)
```

1. **Zustand State (`useCanvasStore`):**
   * Mantém a lista ordenada de blocos: `blocks: Block[]`.
   * Mantém o bloco atualmente em edição: `selectedBlockId: string | null`.
   * Função `updateBlock(id, props)`: Atualiza as propriedades e aciona a validação Zod.
2. **Debounce Auto-Save Helper:**
   * Utiliza um gancho Custom Hook `useDebounceEffect` que escuta as alterações no estado `blocks`.
   * Quando o usuário para de digitar por 500ms, o hook dispara uma query do Supabase para atualizar a aula: `update public.lessons set blocks = ... where id = ...`.
   * Exibe um pequeno indicador visual discreto na `TopBar` ("Salvando...", "Alterações salvas").

---

## 🧼 Tratamento de Segurança e Prevenção de XSS
Para blindar o Canvas contra injeções de scripts maliciosos de administradores terceiros:
1. Todo input de texto enriquecido inserido em blocos do tipo `text` deve passar por sanitização obrigatória no frontend antes de ser enviado ao Supabase, utilizando a biblioteca `dompurify`.
2. A renderização no editor visual do Canvas nunca deve expor `dangerouslySetInnerHTML` sem passar por um helper de sanitização explícito.
