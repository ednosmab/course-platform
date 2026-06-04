# Plano do Reprodutor de Aulas Móvel (Aluno Mobile)

## 🎯 Objetivo
Projetar o motor de renderização nativo e a experiência de reprodução do aluno no aplicativo mobile (`apps/student`), garantindo compatibilidade cross-platform (iOS/Android), performance fluida de reprodução de vídeo nativo (Expo AV) e suporte a sincronização offline-first.

---

## 🛠️ Stack Tecnológica do App Mobile
* **Framework:** Expo 54.0.33 + Expo Router (Navegação baseada em arquivos)
* **Estilização Cross-Platform:** Tamagui (Compilação para views nativas do React Native sem overhead)
* **Reprodutor de Vídeo:** `expo-av` ou `expo-video` (reprodução nativa acelerada por hardware)
* **Cache Offline:** `@react-native-async-storage/async-storage` (armazenamento leve de chaves e progresso) + SQLite local (para caching completo de árvore de blocos e mídias pequenas)
* **Sincronização de Progresso:** Custom React Hooks com suporte a fila offline (outbox pattern)

---

## ⚙️ Motor de Renderização JSON (Block Renderer)

Como as aulas são armazenadas como árvores flexíveis de blocos `JSONB` no Supabase, o app mobile precisa analisar essa árvore no carregamento da tela e renderizar dinamicamente componentes nativos correspondentes otimizados para o Tamagui.

```
┌────────────────────────────────────────────────────────┐
│                   [LessonPlayer]                       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  [VideoBlockRenderer] (expo-av native video)     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  [TextBlockRenderer] (Tamagui Text c/ rich style)│  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  [QuizBlockRenderer] (Estado local interativo)   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  [Progresso/Navegação] Botão Concluir Aula e Avançar   │
└────────────────────────────────────────────────────────┘
```

### Componentes de Renderização Nativa (`packages/ui/src/`):

1. **`TextBlockRenderer`:**
   * Recebe as propriedades de texto formatadas.
   * Renderiza usando componentes primitivos `<Paragraph>` e `<Heading>` do Tamagui, mapeando os tokens tipográficos locais.
2. **`VideoBlockRenderer`:**
   * Utiliza o componente `<Video>` do `expo-av` configurado com controles nativos de player.
   * Suporta reprodução em tela cheia automática e otimização de aspect ratio.
3. **`QuizBlockRenderer`:**
   * Mantém o estado local da alternativa selecionada pelo aluno.
   * Ao enviar a resposta, exibe feedback visual instantâneo (Verde para correto, Vermelho para incorreto) com animações suaves de feedback (Tamagui Animations).

---

## 📶 Estratégia Offline-First de Carregamento

Para que o aluno possa consumir conteúdos mesmo com conexões instáveis ou offline:

```
[Lesson Request] ──> Tenta Carregar do Cache Local (SQLite)
                             │
                             ├─────> Encontrou? Renderiza Imediatamente.
                             │
                             └─────> Tenta Atualizar em Background (Supabase API)
                                           │
                                           └─> Sucesso? Atualiza Cache Local
```

1. **Caching de Aulas:**
   * Ao carregar um curso com conectividade ativa, o app pré-carrega as aulas (`lessons`) e armazena os blocos JSONB no banco de dados SQLite local.
   * Imagens e miniaturas do bucket `course-thumbnails` são cacheadas em disco usando a propriedade `cache` do componente `<Image>` do Tamagui / React Native.
2. **Fila de Sincronização de Progresso (Outbox):**
   * Se o aluno conclui uma aula enquanto está offline:
     * O app grava localmente o progresso em uma tabela do SQLite `pending_progress`.
     * Quando a conexão é restabelecida (detectada pelo hook `NetInfo`), um sincronizador em background envia o lote de progresso pendente ao Supabase e limpa a fila local.
