# 🔄 WORKFLOW OPERACIONAL: HISTÓRICO DE SESSÕES (README.md)

Este documento estabelece o protocolo estrito de gerenciamento da Memória de Longo Prazo do projeto. O objetivo é registrar decisões de arquitetura e estados de sucesso em arquivos markdown imutáveis antes de resetar as sessões de chat.

---

## 📌 1. PADRÃO DE NOMENCLATURA DE ARQUIVOS

Todos os arquivos de histórico devem ser criados dentro deste diretório `docs/history/` seguindo rigorosamente a estrutura de sufixos numéricos e escopos textuais em letras minúsculas separadas por underline:

```bash
docs/history/session_[NÚMERO_SEQUENCIAL]_[escopo_da_tarefa].md
```

### 📋 Exemplos de Aplicação:
- `docs/history/session_01_architecture_setup.md` (Configuração inicial do ecossistema de contexto)
- `docs/history/session_02_zod_types_validation.md` (Modelagem dos contratos de dados com Agente 1)
- `docs/history/session_03_tamagui_design_system.md` (Configuração dos tokens globais com Agente 2)

---

## ⏱️ 2. O RITUAL DE FECHAMENTO (MÁXIMO 55% DE TOKENS)

Quando o contador da extensão OpenCode atingir a marca de **50% a 55% de consumo de tokens**, interrompa a codificação e execute o fluxo de persistência em 5 etapas rápidas:

### 📥 Passo 1: O Comando de Fechamento (No Chat)
Envie exatamente este comando para a IA ativa na sessão atual:
> *"Atingimos o limite de segurança de contexto de 55%. Execute o Passo 4 do algoritmo de gestão de contexto: consolide o `context_buffer.md` e gere o snapshot denso em Markdown para o arquivo `docs/history/session_[PRÓXIMO_NÚMERO]_[tarefa].md`."*

### 🔨 Passo 2: Criar o Arquivo Físico (No Terminal Ubuntu)
Abra o terminal na raiz do monorepo e crie o novo arquivo apontado pela numeração sequencial:
```bash
touch docs/history/session_02_zod_types_validation.md
```

### 📋 Passo 3: Sincronização de Arquivos (No VS Code)
1. Abra o arquivo `.md` recém-criado na pasta `docs/history/`.
2. Cole o conteúdo do snapshot denso gerado pela IA.
3. Abra o arquivo `docs/context_buffer.md` e limpe os logs antigos da seção `## ⚠️ Impedimentos & Logs de Erro Recentes`, inserindo o texto: `*Nenhum erro ativo. Sessão anterior consolidada com sucesso.*`

### 🚀 Passo 4: O Commit de Transição (No Git)
Rode o comando unificado no terminal para registrar o histórico na linha do tempo do Git e limpar o ambiente de trabalho:
```bash
git add docs/history/ docs/context_buffer.md
git commit -m "docs: archive session [NÚMERO] history and cycle context buffer"
```

### 🧼 Passo 5: Inicialização do Novo Chat
1. Feche o chat atual no OpenCode para expurgar a memória RAM inflada.
2. Abra uma sessão de chat completamente nova e limpa.
3. Envie o conteúdo atualizado do seu `docs/context_buffer.md` como a primeira mensagem de contexto. 
4. A nova IA lerá o buffer e o `CONTEXT_MAP.md`, iniciando o trabalho com **apenas 10% de consumo de tokens**.

---

## 🛡️ 3. REGRAS DE GOVERNANÇA PARA AS IAs

- **Imutabilidade Histórica:** As IAs estão terminantemente proibidas de alterar ou deletar arquivos de sessões anteriores dentro deste diretório `docs/history/`.
- **Restauração Sob Demanda:** Esta pasta de histórico só deve ser lida pelas IAs se o usuário solicitar explicitamente uma retrospectiva técnica (Ex: *"IA, verifique no histórico da sessão 01 por que optamos por HTML em vez de Markdown"*).
