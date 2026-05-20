# Workflow de Desenvolvimento do Admin CMS

Este documento descreve as regras absolutas de arquitetura, layout, comportamento de eventos e renderização do subsistema **Admin CMS** (`apps/admin`). Toda e qualquer modificação ou adição de código efetuada por desenvolvedores humanos ou agentes de IA deve respeitar rigorosamente as diretrizes aqui consolidadas.

---

## 🏛️ 1. A Lei Absoluta do Preview (ADR-005)

> **TUDO O QUE FOR APRESENTADO NO PREVIEW SERÁ O RESULTADO FINAL DA TELA DO USUÁRIO.**

1. **Renderer Único:** O componente `MobileCanvas` (localizado em [EditorCanvas.tsx](file:///media/edson-ubuntu/Data1/Plataforma%20de%20Cursos%20com%20CMS/plataforma_cursos/apps/admin/src/components/editor/EditorCanvas.tsx)) é o único mecanismo oficial de renderização responsiva do sistema. Ele é compartilhado entre o **Preview Canvas**, o **Mobile Viewport** do admin e a **Tela do Aluno** no portal móvel.
2. **Fidelidade Total:** Nenhuma diferença visual ou estrutural entre o preview e a tela final do aluno é tolerada. Qualquer desvio é classificado como bug crítico.

---

## 📐 2. Viewports, Grid e Responsividade

O CMS opera com dois layouts fundamentais de tela:

### A. Modo de Edição Desktop (Canvas Livre)
- **Delimitador de Página:** Um card branco centralizado de largura fixa (`PAGE_W = 1100px`).
- **Alinhamento do Card:** É proibido centralizar o card do editor usando flexbox (`alignItems: 'center'`) no container pai, pois isso causa perda visual do lado esquerdo do card em telas de notebooks comuns.
- **Regra de Centralização:** O card de 1100px deve ser centralizado através de margem automática:
  ```css
  margin: 0 auto;
  ```
  Isso garante que se a janela do navegador for menor que 1100px, o card encoste na esquerda (`x = 0`) permitindo fazer scroll horizontal normal, sem truncar nem cortar o conteúdo.

### B. Modo Mobile e Preview (Reflow Responsivo)
- **Delimitador de Viewport:** A largura padrão do dispositivo móvel simulado é de `390px` (`MOBILE_W`).
- **Reflow Proporcional (`groupBlocksByRow`):** O sistema agrupa dinamicamente os blocos que residem na mesma linha horizontal (com base em colisão de intervalos Y) e os distribui no mobile usando `flex-wrap` e larguras flexíveis proporcionais baseadas nas larguras originais de cada bloco no desktop.
- **Scroll e Altura Vertical:**
  - O frame de preview **não possui limitação de altura vertical** (`max-height` é proibido).
  - O conteúdo deve se estender naturalmente para baixo, com scroll ilimitado para garantir que todo o texto e elementos fiquem visíveis exatamente como na tela real do dispositivo móvel do aluno.

---

## ⚡ 3. Interação com Elementos HTML Livre / Iframes

O bloco HTML carrega códigos externos (incluindo renderizadores 3D, Three.js, Canvas, etc.) que rodam isolados em um `<iframe>` com `srcDoc`. Para evitar bugs de arrasto e redimensionamento, as seguintes regras são aplicadas:

1. **pointer-events Dinâmicos:**
   - Durante a movimentação ou redimensionamento de qualquer bloco (`isInteracting === true`), o iframe de todos os blocos HTML deve receber `pointerEvents: 'none'`.
   - Isso impede que o iframe capture os eventos de movimento do mouse, garantindo que a lógica de drag-and-drop no documento principal do editor funcione de maneira 100% fluida e sem travamentos.
2. **Escalabilidade 100% no Iframe:**
   - O modelo HTML injetado (`srcDoc`) do bloco HTML deve conter estilos globais de preenchimento completo:
     ```css
     html, body {
       width: 100%;
       height: 100%;
       margin: 0;
       padding: 0;
       overflow: auto;
     }
     ```
   - Isso evita o colapso vertical de canvas e gráficos 3D baseados em porcentagem, garantindo que o conteúdo interno redimensione instantaneamente junto com as alças de redimensionamento do bloco pai.
3. **Overlay de Seleção no Editor:**
   - No editor desktop, blocos interativos (como `html` e `video`) possuem um `div` de overlay transparente posicionado sobre o conteúdo (`zIndex: 10`).
   - Este overlay captura os cliques e cliques de arraste originais no editor para permitir seleção fácil e drag-and-drop fluido. A interação com o conteúdo interno (como dar play em vídeos ou girar um cubo 3D) deve ser efetuada no modo **Preview**.

---

## 📝 4. Tipografia Responsiva e Formatação Semântica (HTML5)

### A. Tipografia Responsiva Padrão Comercial
O tamanho das fontes de texto e perguntas varia dinamicamente de acordo com a viewport para respeitar os padrões comerciais de design de mercado:

| Tamanho | Desktop | Mobile / Preview | Peso da Fonte |
| :--- | :--- | :--- | :--- |
| `small` | `13px` | `12px` | `400` |
| `medium` | `16px` | `15px` | `400` |
| `large` | `24px` | `19px` | `600` |
| `xlarge` | `32px` | `24px` | `700` |

### B. Formatação Semântica HTML5 e Markdown Inline
1. **Tags Semânticas Reais:** O painel de propriedades ativa negrito e itálico usando as tags semânticas HTML5 **`<strong>`** e **`<em>`** (evitando apenas estilização de fonte puramente via CSS) para garantir acessibilidade e SEO impecáveis.
2. **Ênfase Inline via Markdown:** O editor e o visualizador contam com um parser simples que converte na hora a notação de escrita de Markdown em tags semânticas:
   - `***texto***` ou `___texto___` ou `**_texto_**` ou `_**texto**_` $\rightarrow$ `<strong><em>texto</em></strong>` (Negrito + Itálico combinados)
   - `**texto**` ou `__texto__` $\rightarrow$ `<strong>texto</strong>` (Negrito)
   - `*texto*` ou `_texto_` $\rightarrow$ `<em>texto</em>` (Itálico)
   - `> citação` (no início da linha) $\rightarrow$ `<blockquote style="...">citação</blockquote>` (Bloco de Citação renderizado com borda azul à esquerda e estilo itálico, aplicável dentro de blocos de **Texto** e **Quiz**).
3. **Bloco de Citação Standalone (`quote`):**
   - Bloco independente que permite definir o conteúdo da citação, o autor/fonte (exibido como `— Autor`) e controle completo de cores, alinhamentos, tipografia premium, imagem de fundo ou cor de fundo customizados.
   - Quando estilizado com fundo, exibe aspas serifadas ornamentais no topo para estética premium. Sem fundo, exibe uma borda lateral vertical azul clássica.
4. **Estilos de Card:** Blocos com cor ou imagem de fundo definidas recebem automaticamente preenchimento interno dinâmico (`padding: 16px`) e cantos levemente arredondados (`borderRadius: 8px`) para garantir a estética premium e evitar que textos toquem nas bordas do fundo.

---

## 💾 5. Fidelidade na Exportação de Código (HTML Fonte)

A função `getHtmlFromBlock` é responsável por traduzir o estado visual do editor em código de produção limpo e utilizável. Ela deve:
- Converter todas as estilizações de cores, fundos, imagens e fontes do painel em estilos em linha CSS válidos (`style="..."`).
- Aplicar o parser de Markdown para converter as marcações do usuário em elementos semânticos reais (`<strong>` e `<em>`) na string final exportada.
- O HTML exportado deve ser 100% autocontido, responsivo e semanticamente impecável.

---

## 🚦 6. Publicação de Aulas (Publish Gate)

A publicação de aulas segue uma hierarquia de dependência com o curso pai:

1. **Auto-save (rascunho):** Toda alteração nos blocos é salva automaticamente no registro `draftId` da tabela `lessons` com `is_published: false`. Este salvamento é incondicional — não depende do estado de publicação do curso.

2. **Publicação explícita (publishLesson):** O botão "Publicar" no header do editor copia o conteúdo do rascunho para a aula ativa (`activeLessonId`) com `is_published: true`. Antes de executar, o sistema consulta a cadeia `lesson.module_id → modules.course_id → courses.is_published`:
   - Se `courses.is_published === false` → a publicação é **bloqueada** e um erro é exibido: *"O curso precisa estar publicado antes de publicar aulas."*
   - Se o curso estiver publicado → a publicação prossegue normalmente.

3. **Toggle "Publicado" no curso:** O painel Configurações do curso (`/studio/[courseId]`) altera exclusivamente `courses.is_published`. Não há cascata automática para módulos ou aulas — cada aula mantém seu estado individual de publicação.

| Ação | Tabela | `is_published` | Gate do curso? |
|---|---|---|---|
| Auto-save (debounce 1.5s) | `lessons` (draftId) | `false` | ❌ |
| Publicar aula | `lessons` (activeLessonId) | `true` | ✅ |
| Toggle curso | `courses` | toggle | N/A |

---

## 🖼️ 7. Thumbnail de Curso (Upload e Especificações)

### A. Especificações Técnicas
| Atributo | Valor |
| :--- | :--- |
| Resolução | **1280×720px** (16:9) |
| Formato | JPEG (menor peso) ou **WebP** (melhor compressão) |
| Tamanho máximo | **2MB** |
| Espaço de cor | sRGB |

### B. Armazenamento
- Bucket no Supabase Storage: `course-thumbnails`
- O URL gerado no upload é salvo no campo `thumbnail_url` da tabela `courses`
- Política RLS: Apenas admins podem fazer upload; leitura pública para usuários autenticados

### C. Comportamento na Interface
- Modal de criação/edição de curso exibe um botão "Selecionar imagem" que abre o seletor de arquivos
- Após selecionar, o preview do thumbnail é mostrado antes do salvamento
- O upload ocorre no momento do salvamento do formulário (ou separadamente com feedback de progresso)
- Caso o curso não tenha thumbnail, o card exibe um gradiente padrão (definido no componente)

---

## ⚡ 8. Sincronização em Tempo Real (Supabase Realtime)

1. **Autosave do CMS:** O editor do CMS possui um mecanismo de Autosave que monitora as alterações nos blocos e faz a persistência de forma transparente com um debounce de `1.5s` na tabela `lessons` do Supabase.
2. **Atualização Reativa do Usuário:** O aplicativo do aluno (`student`) utiliza **Supabase Realtime Channels** para se inscrever na aula ativa.
3. **Fidelidade Instantânea:** Quando o administrador atualiza ou publica um bloco no CMS, a alteração é gravada no banco de dados e enviada imediatamente via WebSockets para todos os alunos que estão visualizando a aula ativa, atualizando os blocos na tela do dispositivo em tempo real sem necessidade de recarregar o aplicativo.
