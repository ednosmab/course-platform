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

### Regra Importante: Cursos são criados como Rascunho

> **Por padrão, todo curso novo é criado com `is_published = false` (rascunho).**
> Apenas cursos publicados (`is_published = true`) aparecem na sessão **"Explorar Cursos"**.
> Para um curso aparecer, o admin deve activar o toggle de publicação nas Configurações do Curso.

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

### Como interagir

#### 1. Selecionar o modo de acesso
- Clique no botão do modo desejado (**Livre**, **Progressivo** ou **Restrito**)
- O botão selecionado fica com **fundo azul e texto branco** (feedback visual)
- Os outros botões ficam com borda cinza e fundo transparente

#### 2. Configurar pré-requisito (modo Progressivo)
- Ao selecionar **Progressivo**, aparece o campo **"Pré-requisito"**
- Clique no dropdown e selecione o curso que o aluno deve concluir primeiro
- O sistema valida automaticamente se a seleção criaria um **ciclo** (ex: A→B→A)
- Se detectar ciclo, exibe mensagem de erro e desfaz a seleção

#### 3. Salvar as alterações
- Após configurar o modo, clique em **"Salvar Alterações"** na parte inferior
- As configurações são salvas imediatamente no banco de dados

### Regras de pré-requisito (modo Progressivo)

- O pré-requisito deve ser um **curso publicado** do mesmo tenant
- Um curso pode ter **no máximo 1 pré-requisito** (encadeamento linear)
- O sistema detecta **ciclos** (A→B→A) e impede a configuração
- Ao remover um pré-requisito, alunos que já desbloquearam mantêm o acesso

### Regras de plano (modo Restrito)

- O curso deve estar vinculado a **pelo menos 1 plano** para ter efeito prático
- Apenas alunos com **plano atribuído** que contenha o curso podem acessar
- Alunos **sem plano** ou com plano **sem esse curso** não veem o curso na tela Explorar
- Para atribuir planos aos alunos, use o painel de **Gestão de Planos** no admin
- Um aluno pode ter **vários planos** simultâneamente (ex: Básico + Premium)
- Ao desvincular um curso de um alunos com plano ativo perdem acesso

### Visão do aluno (tela "Explorar Cursos")

| Estado do curso | O que o aluno vê |
|-----------------|------------------|
| Livre + no plano | Card com badge verde "Disponível" — clique para acessar |
| Progressivo + pré-requisito concluído | Card com badge verde "Disponível" — clique para acessar |
| Progressivo + pré-requisito NÃO concluído | Card com badge cinza "Bloqueado" + "Complete o pré-requisito primeiro" |
| Restrito + não atribuído | Curso **não aparece** na tela Explorar |
| Restrito + atribuído | Card com badge azul "Acesso especial" |

### Filtros disponíveis para o aluno

O aluno pode filtrar os cursos por:
- **Todos** — mostra todos os cursos publicados
- **Publicados** — cursos publicados
- **Disponíveis** — cursos que o aluno tem acesso (livre ou desbloqueado)
- **Bloqueados** — cursos progressivos com pré-requisito pendente

### Plano de implementação

Ver `docs/plans/2026-06-10-controle-acesso.md` para detalhes completos da implementação (migration SQL, UI admin, UI student, testes).

---

## 📥 12. Restrições de Cache Offline

> O app do aluno cacheia automaticamente módulos para acesso offline.
> O admin DEVE respeitar os limites abaixo para garantir que o cache cabe no dispositivo do aluno.

### Limite Global de Armazenamento

| Parâmetro | Valor | Justificativa |
|-----------|-------|---------------|
| **Armazenamento máximo por curso** | **500 MB** | Espaço total para cache de 2 módulos no dispositivo do aluno |
| **Módulos em cache simultâneos** | **2** (actual + anterior) | Permite revisão do módulo anterior |

### Conteúdo por Aula (Peso Estimado)

| Componente | Peso Máximo | Notas |
|------------|-------------|-------|
| **Estrutura JSON** | ~50 KB | Blocos, metadados, ordem |
| **Imagens** | ~5 MB | Todas as imagens da aula |
| **Vídeo (360p)** | ~37.5 MB | 10 min × 3.75 MB/min (360p) |
| **Total por aula** | **~42.5 MB** | Máximo permitido |

### Regras por Configuração de Cache

| Cenário | Máximo de Aulas | Máximo por Módulo | Armazenamento Estimado |
|---------|-----------------|-------------------|------------------------|
| **2 módulos em cache** | 5 aulas por módulo | 10 aulas total | ~425 MB (dentro de 500 MB) |
| **1 módulo em cache** | 10 aulas no máximo | 10 aulas | ~425 MB (dentro de 500 MB) |

### Restrições de Vídeo

| Regra | Valor | Obrigatório |
|-------|-------|-------------|
| **Duração máxima por vídeo** | **10 minutos** | Sim |
| **Vídeos por aula** | **1** (um único vídeo) | Sim |
| **Resolução para cache** | **360p** | Automático (via CDN) |
| **Upload permitido** | MP4, WebM | Formatos aceites |

### Configuração no Admin

O admin configura estas restrições nas **Configurações do Curso**:

```
Configurações do Curso
├─ [toggle] Permitir cache offline (ativo por padrão)
├─ [input] Máximo de aulas por módulo: [5] (padrão)
├─ [input] Duração máxima por vídeo (min): [10] (padrão)
├─ [input] Vídeos por aula: [1] (fixo, não editável)
└─ [texto] Armazenamento estimado: ~XX MB por módulo
```

### Validação no Editor

Quando o admin adiciona um vídeo a uma aula:

1. **Se vídeo > 10 minutos:** O sistema exibe aviso:
   > "Vídeo excede o limite de 10 minutos para cache offline. Considere dividir em aulas menores."

2. **Se 2º vídeo na mesma aula:** O sistema bloqueia:
   > "Apenas 1 vídeo por aula é permitido para cache offline."

3. **Se módulo > 5 aulas (cache duplo):** O sistema exibe aviso:
   > "Módulo com mais de 5 aulas — apenas as 5 primeiras serão cacheadas quando 2 módulos estiverem em cache."

### Cálculo de Armazenamento

Para o admin estimar o peso do curso:

| Aulas por Módulo | Módulos em Cache | Vídeos (10min) | Imagens | Total Estimado |
|------------------|------------------|----------------|---------|----------------|
| 5 aulas | 2 | 10 × 37.5 MB = 375 MB | ~25 MB | **~400 MB** |
| 10 aulas | 1 | 10 × 37.5 MB = 375 MB | ~50 MB | **~425 MB** |
| 3 aulas | 2 | 6 × 37.5 MB = 225 MB | ~15 MB | **~240 MB** |

### Fluxo de Validação

```
Admin cria aula
  ↓
Adiciona bloco de vídeo
  ↓
Sistema valida:
  ├─ Duração ≤ 10 min? ✅/❌
  ├─ Já existe vídeo na aula? ✅/❌
  └─ Peso total ≤ 42.5 MB? ✅/❌
  ↓
Se inválido → mostra aviso/erro
Se válido → permite salvar
```
