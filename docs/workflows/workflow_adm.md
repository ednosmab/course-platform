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
3. Adicione blocos (texto, imagem, heading, divider) posicionando-os livremente.
4. Configure o tamanho do certificado (presets A4: 700/900/1100/1300px de largura).
5. Para certificados **frente e verso**, ative "Dupla Face" e atribua cada bloco ao lado desejado.

### Preview
- Na página de configurações, clique na miniatura do certificado para abrir o preview ampliado.
- No modal, use os botões **Frente / Verso** para visualizar cada lado.
- O preview respeita fielmente as dimensões e posições definidas no Studio.

### Impressão (Ctrl+P)
- Clique no ícone de download/impressão no modal de preview.
- O certificado é impresso em **A4 paisagem**, ocupando 100% da folha.
- Certificados duplex geram **2 páginas** (frente e verso) automaticamente.
- A impressão é fiel ao preview, sem cortes ou escalas incorretas.

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
