# 🖥️ Admin CMS — Guia de Usabilidade

Este documento descreve o funcionamento da plataforma **Admin CMS** (`apps/admin`) do ponto de vista do usuário administrador. Use este guia para entender como cada funcionalidade se comporta e como o admin interage com o sistema.

---

## 🔐 1. Login e Redirecionamento

### Credenciais de Desenvolvimento

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | `admin@admin.com` | `123456` |
| Aluno | `aluno@aluno.com` | `123456` |

### Fluxo
1. Acesse `/login` e faça login com email e senha.
2. O sistema redireciona automaticamente:
   - **Admin / Professor** → Dashboard do admin (`/`)
   - **Aluno** → App mobile do aluno
3. Usuário não autenticado é redirecionado para `/login`.

---

## 🎯 2. Regra de Ouro do Preview

> **TUDO O QUE FOR APRESENTADO NO PREVIEW SERÁ O RESULTADO FINAL DA TELA DO ALUNO.**

- O preview do editor é **exatamente** o que o aluno vê — sem diferenças visuais.
- Qualquer desvio entre preview e tela real do aluno é considerado bug crítico.

### Espaço de Design e Delimitação Visual

O conteúdo das aulas é desenhado em um espaço de coordenadas de **1100px de largura** (constante `DESKTOP_W` em `@projeto/core` e `PAGE_W` no editor). Esse é o **mesmo espaço** usado pelo preview e pelo app do aluno, garantindo fidelidade 1:1.

| Ambiente | Delimitador visual do espaço de 1100px | Alinhamento do conteúdo |
|----------|----------------------------------------|------------------------|
| **Editor** (modo edição) | Sim — borda/sombra visível contornando a área de 1100px (desktop) ou moldura de celular (mobile/tablet) | Centralizado, com delimitação clara para o admin |
| **Preview** (modo visualização) | Não — apenas a área de conteúdo, sem moldura | Centralizado, sem delimitação (a tela real do aluno não tem moldura) |
| **App do Aluno** | Não | Centralizado, sem delimitação |

**Por que o editor tem borda e o preview/student não?**
- O editor precisa mostrar ao admin **onde estão os limites do espaço de 1100px** para que o posicionamento de blocos tenha significado visual.
- O preview e a tela do aluno mostram o **resultado final**: uma página limpa, sem marcadores de desenvolvimento.
- Manter a borda no preview ou no app do aluno causaria estranhamento visual, pois o aluno final não tem por que ver uma moldura de "área de edição".

> Se o conteúdo parecer "encostado à esquerda" no preview, é porque o contêiner do preview é maior que 1100px — o conteúdo está **centralizado** dentro do espaço disponível, mas a `border` que delimitava o espaço de design só existe no editor.

---

## 📱 3. Visualizando no Mobile

No canto superior do editor há um seletor de viewport:
- **Desktop:** Canvas livre de 1100px com blocos posicionados absolutamente.
- **Tablet / Mobile:** Simula a tela do dispositivo. Os blocos são reorganizados em layout fluido (reflow responsivo).
- O preview mobile não tem limite de altura — role para ver todo o conteúdo.

---

## 📝 4. Tipografia e Formatação

### Tamanhos de Fonte

| Tamanho | Desktop | Mobile |
|---------|---------|--------|
| `small` | 13px | 12px |
| `medium` | 16px | 15px |
| `large` | 24px | 19px |
| `xlarge` | 32px | 24px |

### Formatação Inline (Markdown)

Dentro dos blocos de **Texto** e **Citação**, você pode usar:

| Digite | Resultado |
|--------|-----------|
| `**texto**` ou `__texto__` | **negrito** |
| `*texto*` ou `_texto_` | *itálico* |
| `***texto***` | ***negrito + itálico*** |
| `> texto` (início da linha) | Citação com borda azul |

### Bloco de Citação (`quote`)

Bloco independente com:
- Conteúdo da citação + autor/fonte (exibido como `— Autor`)
- Controle de cor, alinhamento, tipografia, fundo
- Com fundo: exibe aspas ornamentais no topo
- Sem fundo: borda lateral azul clássica

---

## 🖌️ 5. Editor de Imagem

Disponível ao selecionar um bloco de imagem no Studio.

### Rotacionar
- **↺ 90°** — rotaciona 90° anti-horário
- **↻ 90°** — rotaciona 90° horário
- Cliques sucessivos acumulam (90° → 180° → 270° → 0°)

### Espelhar
- **H** — espelha horizontalmente (efeito flip horizontal)
- **V** — espelha verticalmente (efeito flip vertical)
- Os botões alternam entre ligado/desligado a cada clique

### Cortar (Crop)
1. Clique em **Cortar** para abrir o modal de corte.
2. Arraste sobre a imagem para selecionar a área desejada.
3. Ajuste a seleção usando os **8 handles** (cantos e bordas).
4. Confirme com **"Aplicar Corte"**.
5. Uma nova imagem é gerada e a URL do bloco é atualizada.

> As transformações (rotate/flip) são aplicadas via CSS — não alteram a imagem original. O crop gera uma nova imagem no storage.

---

## 🎓 6. Certificado do Curso

### Personalização
1. Nas configurações do curso, ative **"Emitir certificado"**.
2. Clique em **"Personalizar no Studio"** para abrir o editor de certificado.
3. O editor de certificado abre numa **rota dedicada** (`/studio/[courseId]/certificate`) — fisicamente isolada do editor de aula (SDR-001). A antiga query `?mode=certificate` é redirecionada (HTTP 308) automaticamente.
4. Adicione blocos (texto, imagem, heading, divider) posicionando-os livremente.
5. Configure o tamanho do certificado (presets A4: 700/900/1100/1300px de largura).
6. Para certificados **frente e verso**, ative "Dupla Face" e atribua cada bloco ao lado desejado.

### Preview
- Na página de configurações, clique na miniatura do certificado para abrir o preview ampliado.
- O modal mostra **frente e verso lado a lado** (quando duplex), alinhado com a impressão.
- O preview respeita fielmente as dimensões e posições definidas no Studio.
- O `CertificatePage` usa o hook `useA4Scale` (em `@projeto/ui`) que escala automaticamente para caber tanto em largura quanto em altura limitada.

### Impressão (Ctrl+P)
- Clique no ícone de download/impressão no modal de preview.
- O certificado é impresso em **A4 paisagem**, ocupando 100% da folha.
- Certificados duplex geram **2 páginas** (frente e verso) automaticamente, com `page-break-after: always` entre elas.
- A impressão é fiel ao preview, sem cortes ou escalas incorretas.

### Isolamento do editor de certificado (SDR-001)
- O editor de certificado é uma **rota dedicada** (`/studio/[courseId]/certificate`) com entry component próprio (`CertificateEditor` em `apps/admin/src/components/certificate-editor/`).
- Mudanças no editor de aula **não podem** quebrar o editor de certificado (e vice-versa).
- A única partilha permitida é via `CertificateBlockRenderer` (em `packages/ui/src/components/Certificate/`) — o renderizador puro dos blocos de certificado.

### Validação manual end-to-end
- Para o procedimento completo de teste manual (happy path, bordas, regressões), ver [`docs/manual-tests/certificate-end-to-end.md`](../manual-tests/certificate-end-to-end.md).

---

## 📦 7. Blocos do Editor

| Bloco | Descrição |
|-------|-----------|
| **Texto** | Parágrafo com formatação Markdown (negrito, itálico, citação inline) |
| **Título** | Heading H1/H2/H3 com alinhamento |
| **Imagem** | Upload ou URL, com ajuste de fit (cover/contain/fill), rotate, flip e crop |
| **Vídeo** | Incorpora vídeo (YouTube, Vimeo, etc.) via URL |
| **Quiz** | Pergunta de múltipla escolha com opções e feedback |
| **HTML** | Código HTML livre para conteúdo avançado (3D, canvas, etc.) |
| **Divisor** | Linha horizontal personalizável (espessura, estilo, cor) |
| **Citação** | Bloco de citação com autor, fundo e formatação premium |

### Como usar
1. Abra o Studio de uma aula.
2. No painel esquerdo (Paleta), clique no bloco desejado ou arraste para o canvas.
3. Selecione o bloco no canvas para abrir suas propriedades no painel direito.
4. Ajuste posição, tamanho, conteúdo e estilo conforme necessário.

---

## 🚦 8. Publicar Aulas e Cursos

### Auto-Save
- Toda alteração no editor é salva automaticamente como **rascunho** (não público).
- O salvamento é automático — não precisa clicar em salvar.

### Publicar uma Aula
1. O curso pai precisa estar publicado primeiro.
2. Clique no botão **"Publicar"** no header do editor.
3. Se o curso não estiver publicado, o sistema exibe: *"O curso precisa estar publicado antes de publicar aulas."*
4. Aulas publicadas ficam visíveis para os alunos.

### Publicar um Curso
- No painel **Configurações do Curso**, use o toggle de publicação.
- Alterar o status do curso **não** afeta automaticamente o status das aulas individuais.

| Ação | Resultado |
|------|-----------|
| Auto-save (digitar no editor) | Salva como rascunho |
| Clicar em "Publicar" | Aula fica visível para alunos |
| Toggle "Publicado" no curso | Controla visibilidade do curso |

---

## 🖼️ 9. Thumbnail do Curso

### Especificações

| Atributo | Valor |
|----------|-------|
| Resolução | **1280×720px** (16:9) |
| Formato | JPEG ou **WebP** |
| Tamanho máx. | **2MB** |

### Como fazer upload
1. Nas configurações do curso, clique na área de thumbnail.
2. Selecione um arquivo do computador.
3. O preview é exibido antes de salvar.
4. O upload ocorre ao clicar em **"Salvar Alterações"**.
5. Cursos sem thumbnail exibem um gradiente padrão.

---

## ⚡ 10. Sincronização em Tempo Real

- Quando o admin publica ou altera uma aula, a atualização chega **instantaneamente** aos alunos conectados.
- O aluno vê a alteração na tela sem precisar recarregar o aplicativo.
- Isso funciona via WebSockets (Supabase Realtime Channels).

---

## 🛡️ 11. Controle de Acesso a Cursos

### Onde configurar
Nas **Configurações do Curso** (`/configuracoes/[courseId]`), na sidebar direita
("Metadados e Opções"), **acima do Status de Publicação**.

### Modos de acesso

| Modo | Comportamento | Quando usar |
|------|---------------|-------------|
| **Livre** (padrão) | Todos os alunos matriculados no plano acessam imediatamente | Cursos introdutórios, onboarding |
| **Progressivo** | Aluno só acessa após concluir o pré-requisito (outro curso) | Trilhas de aprendizado, certificações |
| **Restrito** | Curso não está em nenhum plano — acesso apenas por atribuição direta | Cursos exclusivos, VIP |

### Fluxo de configuração

1. Acesse `/configuracoes/[courseId]`
2. Na sidebar direita, localize **"Controle de Acesso"** (acima de "Status de Publicação")
3. Selecione o modo:
   - **Livre** → Nenhuma ação adicional
   - **Progressivo** → Selecione o curso pré-requisito no dropdown
   - **Restrito** → Curso fica invisível até atribuição manual
4. Clique em **"Salvar Alterações"**

### Regras de pré-requisito (modo Progressivo)

- O pré-requisito deve ser um **curso publicado** do mesmo tenant
- Um curso pode ter **no máximo 1 pré-requisito** (encadeamento linear)
- O sistema detecta **ciclos** (A→B→A) e impede a configuração
- Ao remover um pré-requisito, alunos que já desbloquearam mantêm o acesso

### Visão do aluno (tela "Explorar Cursos")

| Estado do curso | O que o aluno vê |
|-----------------|------------------|
| Livre + no plano | Card com badge "Disponível" — clique para acessar |
| Progressivo + pré-requisito concluído | Card com badge "Disponível" — clique para acessar |
| Progressivo + pré-requisito NÃO concluído | Card com badge "Bloqueado" + "Complete {curso} primeiro" |
| Restrito + não atribuído | Curso **não aparece** na tela Explorar |
| Restrito + atribuído | Card com badge "Acesso especial" |

### Plano de implementação

Ver `docs/plans/2026-06-10-controle-acesso.md` para detalhes completos da implementação (migration SQL, UI admin, UI student, testes).
