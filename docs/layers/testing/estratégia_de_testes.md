## Estratégia de Testes - Projeto CMS + Cliente (Next.js + Expo + Supabase + TypeScript)

### 1. Testes de Unidade
**Ferramentas:** Vitest (web) / Jest (mobile)  
**Descrição:** Validam funções puras e lógica isolada. Executam rápido, sem dependências externas.  
**Exemplo no projeto:** Validar formato de e-mail, calcular total do carrinho, transformar dados da API.  

### 2. Testes de Integração
**Ferramentas:** Vitest + MSW (web) / Jest + mocks manuais (mobile)  
**Descrição:** Verificam a comunicação entre o código e o Supabase (CRUD, autenticação, storage). Garantem que as queries estão corretas e os erros são tratados.  
**Exemplo no projeto:** Criar um post no CMS e confirmar que o Supabase retornou o registro com ID gerado.  

### 3. Testes de Segurança (RLS)
**Ferramentas:** Vitest + Supabase Client real (banco de teste isolado)  
**Descrição:** Validam as políticas de Row Level Security do Supabase. Testam diferentes perfis (admin, editor, visitante) tentando acessar ou modificar dados sem permissão.  
**Exemplo no projeto:** Visitante tenta deletar post de outro usuário e recebe erro 403/401.  

### 4. Testes de Validação de Esquema
**Ferramentas:** Vitest + Zod (ou verificação manual de tipos)  
**Descrição:** Garantem que os tipos TypeScript estão sincronizados com as tabelas e colunas do Supabase. Evitam quebras silenciosas após alterações no banco.  
**Exemplo no projeto:** Gerar tipos automaticamente com `supabase gen types` e testar se um objeto mock obedece à interface gerada.  

### 5. Testes de Componentes (Web)
**Ferramentas:** Vitest + React Testing Library + jsdom  
**Descrição:** Renderizam componentes React do Next.js isoladamente. Simulam cliques, preenchimento de formulários e verificam elementos no DOM.  
**Exemplo no projeto:** Formulário de login mostra mensagem de erro quando e-mail inválido é submetido.  

### 6. Testes de Componentes (Mobile)
**Ferramentas:** Jest + React Native Testing Library  
**Descrição:** Mesmo princípio da web, mas adaptado para Expo. Verificam elementos visíveis (`toBeOnTheScreen()`), toques e navegação entre telas.  
**Exemplo no projeto:** Tela de listagem de posts carrega skeleton enquanto busca dados e exibe lista ao final.  

### 7. Testes de API Mock (MSW)
**Ferramentas:** MSW (para Next.js)  
**Descrição:** Interceptam requisições HTTP reais (para Supabase ou APIs externas) durante os testes. Permitem simular respostas de sucesso, erro, lentidão e dados específicos sem tocar no banco real.  
**Exemplo no projeto:** Simular erro 500 do Supabase ao salvar um post e verificar se o CMS exibe mensagem amigável.  

### 8. Testes End-to-End (E2E)
**Ferramentas:** Maestro (mobile) / Playwright ou Cypress (web)  
**Descrição:** Testam fluxos completos em ambiente real (ou próximo disso). Automatizam interações de usuário final, como login, navegação, criação de conteúdo e logout.  
**Exemplo no projeto:** Usuário faz login, cria um post com imagem, publica e visualiza na página inicial do cliente.  

### 9. Testes de Regressão Visual
**Ferramentas:** Percy, Chromatic ou Playwright com snapshots  
**Descrição:** (Opcional) Capturam screenshots de componentes/telas e comparam com versões anteriores. Alertam sobre mudanças visuais inesperadas.  
**Exemplo no projeto:** Garantir que o botão "Publicar" não mudou de cor ou posição após refatoração de CSS.  

### 10. Testes de Mutação (Stryker)
**Ferramentas:** Stryker Mutator (para lógica crítica)  
**Descrição:** (Avançado) Introduzem pequenas alterações no código (mutantes) e verificam se os testes existentes detectam a mudança. Medem a qualidade real dos testes, não apenas cobertura de linhas.  
**Exemplo no projeto:** Mudar `if (user.role === 'admin')` para `if (user.role !== 'admin')` e ver se o teste de segurança falha.

## Prioridade para projeto solo (você)

1. **Testes de Integração** (mais valor para o tempo investido)
2. **Testes de Segurança (RLS)** (crítico para CMS com múltiplos perfis)
3. **Testes de Componentes** (apenas formulários e listas principais)
4. **Testes de Validação de Esquema** (baixo esforço, alta segurança)

## Pode ignorar no começo

- Testes de Mutação (exagero para projeto solo)
- Testes de Regressão Visual (muito trabalho para pouco retorno inicial)
- Testes de Performance (só quando tiver usuários reais reclamando)

## Setup técnico para o agente configurar

```bash
# Web (Next.js)
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom msw

# Mobile (Expo)
npm install -D jest jest-expo @testing-library/react-native @testing-library/jest-native

# E2E (Mobile)
npm install -D @maestro-project/maestrz