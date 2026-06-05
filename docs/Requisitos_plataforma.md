# 📋 Requisitos da Plataforma de Cursos EAD com CMS

Este documento reúne a visão de negócios, a jornada do aluno, a arquitetura de software e os requisitos técnicos consolidados da plataforma de cursos com CMS.

---

## 💼 1. Entendimento do Negócio EAD

### Estrutura de Monetização
* **Assinatura por Curso e por Trilha:** Os cursos serão vendidos tanto individualmente quanto agrupados em trilhas de aprendizado.
* **Modelo Híbrido:** Suporte a planos de assinatura recorrente, compras avulsas de curso único e cupons/planos específicos.

### Tipos de Conteúdo das Aulas
* 🎥 Vídeos (Streaming adaptativo)
* 📄 PDFs (Documentos de apoio)
* ❓ Quizzes (Questões de fixação)
* 🎮 Atividades interativas
* 🎓 Certificados (Emissão automática)
* 💬 Fóruns de discussão por aula
* 🔴 Aulas ao vivo (Webinars)

### Escala e Capacidade de Carga
* **Pico Máximo:** Média de **10.000 usuários simultâneos** em períodos de alto acesso.
* **Média Mensal:** ~3.000 usuários ativos.

### Perfis de Acesso (Roles)
* 👨‍🎓 **Aluno:** Visualiza catálogo, assiste aulas, realiza quizzes, interage nos fóruns e emite certificados.
* 👨‍🏫 **Professor:** Cria aulas, gerencia módulos, acompanha fóruns de dúvidas e analisa o progresso de seus cursos.
* 🛡️ **Administrador:** Acesso total à gestão de usuários, relatórios financeiros, controle do CMS e configurações gerais.

### Integrações e Conformidades
* **Integração com Extranet de Validação de Certificados:** Emissão e validação oficial de certificados via API externa de terceiros.
* **Conformidade LGPD:** Controle rígido de cookies, consentimentos, encriptação de dados de usuários e logs de auditoria.

---

## 🏛️ 2. Arquitetura de Software

* **Decisão do Arquiteto:** **Monorepo Híbrido.**
* **Por que esta decisão?** Excelente equilíbrio entre MVP (menor custo inicial, equipe compacta e desenvolvimento rápido) e escalabilidade para o futuro (separação de pacotes internos reutilizáveis como `@projeto/core`, `@projeto/types` e `@projeto/ui`).
* **Estrutura Proposta de Microsserviços/Módulos Compartilhados:**
  * **Autenticação:** Gestão de tokens JWT, permissões de perfis e RLS.
  * **Cursos & Conteúdos:** CMS de blocos dinâmicos, módulos e progresso.
  * **Pagamentos:** Checkout para Pix, cartão e cobranças recorrentes.
  * **Notificações:** Emails transacionais, lembretes de estudos e notificações Push/WhatsApp.

---

## 💻 3. Tecnologias Principais e Banco de Dados

* **Frontend:** React / Next.js (Admin/Web) + Expo / React Native (Aluno/Mobile).
* **Styling & Design System:** Tamagui (Tokens base 4px + temas Light/Dark + compilação cross-platform).
* **Persistência Principal:** **PostgreSQL (Supabase)**.
  * Banco relacional extremamente robusto para gerenciar relacionamentos complexos, transações de pagamentos e logs de auditoria.
  * **Estratégia NoSQL Híbrida:** Colunas JSONB dentro do PostgreSQL para estruturar os blocos do CMS de maneira dinâmica e flexível sem perder a performance.
* **Cache & Sessões:** Redis (para filas rápidas e cache de performance).

---

## 🎥 4. Streaming e Armazenamento de Vídeo

* **Importância:** Um dos pontos mais críticos do sistema EAD.
* **Requisitos:**
  * Distribuição global via CDN.
  * Compressão automática de mídia para diferentes velocidades de internet (streaming adaptativo).
  * Proteção rigorosa contra pirataria (URLs temporárias assinadas e encriptação).
  * **Opções recomendadas:** Bunny Stream, Mux, Vimeo OTT ou AWS S3 + CloudFront.

---

## 🛡️ 5. Segurança & LGPD

* Criptografia de ponta a ponta para dados pessoais.
* Controle de permissões estrito baseado em políticas de segurança (Supabase Row Level Security - RLS).
* Logs de auditoria estruturados para todas as operações críticas (excesso de tentativas de login, download de PDFs, geração de certificados).
* Rate limiting e proteção com WAF (Web Application Firewall).

---

## 👤 6. Experiência do Usuário (UX) & Jornada do Aluno

### 🔄 Fluxo de Progresso do Aluno (Crítico!)
1. **Cadastro e Login:** Entrada segura na área de membros.
2. **Matrícula:** Aluno acessa cursos livres ou planos adquiridos.
3. **Player de Aula:** Consumo de vídeos, arquivos ou quizzes.
4. **💾 Progresso Automático:** O progresso do aluno é sincronizado em tempo real enquanto ele assiste ao conteúdo.
5. **↩️ Retomada Inteligente:** Ao reabrir a plataforma, o aluno volta exatamente ao ponto (segundo do vídeo ou aula) de onde parou.
6. **✅ Regra de Conclusão (85%):** Uma aula é marcada automaticamente como concluída quando o aluno assiste a **85% ou mais do vídeo**.
7. **📝 Atividades & Quiz:** Resolução de quizzes de fixação ao fim de cada módulo.
8. **🎓 Emissão de Certificado:** PDF gerado automaticamente com integração à extranet de validação de certificados mediante diálogo de conclusão.
