# 🔒 Análise de Requisitos: Robustez, Disponibilidade, Segurança e Profissionalismo

> Gerado automaticamente por análise comparativa entre requisitos definidos e documentação existente.

---

## 📊 Metodologia

Cada requisito foi classificado em:
- ✅ **Coberto** — já documentado ou em andamento no backlog
- ⚠️ **Parcial** — mencionado superficialmente, sem detalhes ou plano
- ❌ **Ausente** — não documentado nem planejado

---

## 1. ROBUSTEZ — Confiabilidade sob condições adversas

| Requisito | Status | Onde / Gap |
|-----------|--------|------------|
| Tratar erros sem quebrar (entrada inválida, falha de rede) | ✅ | `docs/skills/error_handling_observability.md` + `<ErrorBoundary>` |
| Evitar perda de dados em falha súbita | ⚠️ | `useMobileProgress` com fila offline, mas sem plano de recovery |
| Validação de entrada com Zod | ✅ | `docs/skills/zod_validation.md`, ADR-007 |
| Proteção contra N+1 queries | ✅ | `docs/FORBIDDEN_OPERATIONS.md` P-01 |
| Indices PostgreSQL para performance | ✅ | SCL-01 no backlog |
| Connection pooling (PgBouncer) | ✅ | SCL-05 no backlog |
| Logs estruturados (JSON) | ✅ | `docs/roadmaps/scalability-plan.md` |

---

## 2. DISPONIBILIDADE — Acessível quando necessário

| Requisito | Status | Onde / Gap |
|-----------|--------|------------|
| Tempo de atividade definido (SLA) | ❌ **Ausente** | Nenhum SLA documentado (ex: 99.9%, 99.95%) |
| Plano de contingência | ❌ **Ausente** | Nenhum DRP (Disaster Recovery Plan) documentado |
| Backup restaurado e testado | ❌ **Ausente** | Nenhuma estratégia de backup, retention ou restore test |
| Manutenção sem interrupção | ❌ **Ausente** | Nenhum plano de manutenção com zero-downtime |
| Rate limiting (Redis sliding window) | ✅ | SCL-02 no backlog |
| Cache headers em GET públicas | ✅ | SCL-03 no backlog |
| ISR para catálogo | ✅ | SCL-04 no backlog |
| CDN para vídeos | ⚠️ | `docs/roadmaps/scalability-plan.md` + `Requisitos_plataforma.md` — sem provider definido |
| Read replicas (50k+) | ✅ | SCL-10 no backlog |
| Auto-scaling (50k+) | ✅ | SCL-13 no backlog |
| Offline-first (mobile) | ✅ | SCL-08, `docs/layers/core/offline-strategy.md` (stub) |

---

## 3. SEGURANÇA — Proteção de dados, identidade e transações

### 3.1 Desenvolvimento Seguro

| Requisito | Status | Onde / Gap |
|-----------|--------|------------|
| Codificação segura (SQL injection, XSS, CSRF) | ⚠️ | XSS tem skill dedicada; SQL injection + CSRF não documentados |
| Validação de entrada | ✅ | Zod + RLS |
| Revisão de código e SAST | ❌ **Ausente** | Nenhuma ferramenta SAST (SonarQube, CodeQL, Semgrep) no pipeline |
| Gestão de dependências (Dependabot/Snyk) | ❌ **Ausente** | Nenhum scanner de vulnerabilidades em dependências |
| SBOM / CycloneDX | ❌ **Ausente** | Nenhum SBOM gerado |

### 3.2 Infraestrutura

| Requisito | Status | Onde / Gap |
|-----------|--------|------------|
| Menor privilégio (RLS + JWT) | ✅ | `docs/skills/supabase_rls.md`, `supabase_auth_jwt.md` |
| Criptografia em trânsito (HTTPS/TLS) | ⚠️ | Assumido (Supabase + Next.js) mas não documentado como requisito |
| Criptografia em repouso (DB, backups) | ⚠️ | Mencionado em `Requisitos_plataforma.md` sem detalhes |
| Firewall / WAF | ⚠️ | WAF mencionado em `Requisitos_plataforma.md` sem detalhes |
| Segmentação de rede | ❌ **Ausente** | Não documentada |
| URLs assinadas para storage | ✅ | `docs/skills/supabase_storage.md` |
| CORS hardening | ⚠️ | Edge Functions mencionam CORS, sem política global |

### 3.3 Operação

| Requisito | Status | Onde / Gap |
|-----------|--------|------------|
| MFA para administradores | ❌ **Ausente** | Não documentado nem planejado |
| Monitoramento ativo com alertas | ⚠️ | Métricas definidas em scalability-plan.md, mas sem ferramenta (Sentry/Datadog/Grafana) |
| Plano de resposta a incidentes | ❌ **Ausente** | Nenhum IRP documentado |
| Backups imutáveis testados | ❌ **Ausente** | Não documentado |
| Testes de intrusão (pentest) | ❌ **Ausente** | Não planejado |
| Rate limiting contra brute force | ✅ | SCL-02 (login, criação de conteúdo) |
| Auditoria de operações críticas | ⚠️ | `idx_audit_logs_user` existe, mas política de auditoria não detalhada |
| Logs sem PII (anonimizados) | ✅ | `docs/FORBIDDEN_OPERATIONS.md` S-03 |

### 3.4 Governança e Compliance

| Requisito | Status | Onde / Gap |
|-----------|--------|------------|
| LGPD (Brasil) | ⚠️ | Mencionado em `Requisitos_plataforma.md` sem detalhes de implementação |
| GDPR (Europa) | ❌ **Ausente** | Não mencionado |
| PCI-DSS (cartão) | ❌ **Ausente** | Pagamentos bloqueados, sem planejamento PCI |
| Políticas de senha (força, lockout) | ❌ **Ausente** | Não documentadas |
| Treinamento da equipe (eng. social) | ❌ **Ausente** | Não documentado |
| Termos de serviço / privacidade | ❌ **Ausente** | Nenhuma política transparente para o usuário |
| Certificações (ISO 27001, SOC 2) | ❌ **Ausente** | Não planejadas |

---

## 4. PROFISSIONALISMO — Documentação, contratos e previsibilidade

| Requisito | Status | Onde / Gap |
|-----------|--------|------------|
| Código bem estruturado | ✅ | `docs/skills/clean_code_standards.md`, SOLID, DDD |
| Testes automatizados | ⚠️ | `vitest` + Playwright planejados (P2, BACKLOG) |
| Monitoramento e telemetria | ⚠️ | Métricas definidas, Sentry mencionado, sem implementação |
| Suporte e canais para reportar problemas | ❌ **Ausente** | Nenhum canal de suporte documentado |
| Documentação clara | ⚠️ | 6 docs stubs vazios, documentação parcial |
| Política de privacidade transparente | ❌ **Ausente** | Não existe |
| SLA auditável | ❌ **Ausente** | Nenhum SLA definido |
| Status page (transparência operacional) | ❌ **Ausente** | Não planejado |

---

## 📋 ITENS PARA ADICIONAR AO BACKLOG

### SEG — Segurança (Criticidade Alta)

| ID | Item | Prioridade |
|----|------|------------|
| SEG-01 | **MFA para administradores** — Autenticação multifator obrigatória no login do admin | P1 |
| SEG-02 | **Política de senhas** — Força mínima, lockout após N tentativas, expiração | P1 |
| SEG-03 | **Plano de Resposta a Incidentes (IRP)** — Procedimento documentado para vazamento/invasão | P1 |
| SEG-04 | **SAST no pipeline CI** — Integrar CodeQL ou Semgrep para análise estática | P2 |
| SEG-05 | **Scanner de dependências** — Dependabot ou Snyk para CVE em bibliotecas | P2 |
| SEG-06 | **GDPR compliance** — Requisitos para operação na Europa (direito ao esquecimento, portabilidade) | P2 |
| SEG-07 | **Plano de adequação LGPD** — Detalhar implementação: consentimento, cookies, encripitação PII | P1 |
| SEG-08 | **Plano PCI-DSS** — Roadmap para conformidade quando pagamentos forem implementados | P3 |
| SEG-09 | **Teste de intrusão (pentest)** — Agendar pentest periódico (ex: anual) | P2 |
| SEG-10 | **Treinamento de segurança para equipe** — Engenharia social, boas práticas | P2 |
| SEG-11 | **Responsible Disclosure / security.txt** — Canal para pesquisadores reportarem vulnerabilidades | P3 |
| SEG-12 | **CORS hardening policy** — Política global de CORS documentada e testada | P2 |

### DR — Disponibilidade e Recuperação (Criticidade Alta)

| ID | Item | Prioridade |
|----|------|------------|
| DR-01 | **Definir SLA** — Tempo de atividade alvo (99.9% = ~8.7h/ano, 99.95% = ~4.3h/ano) | P1 |
| DR-02 | **Plano de Recuperação de Desastres (DRP)** — RTO/RPO, procedimento de restore | P1 |
| DR-03 | **Estratégia de backups** — Schedule, retention, imutabilidade, restore testado mensalmente | P1 |
| DR-04 | **Manutenção zero-downtime** — Procedimento para deploys sem interrupção | P2 |
| DR-05 | **Status page pública** — Página de status operacional para transparência | P3 |

### PRO — Profissionalismo (Criticidade Média)

| ID | Item | Prioridade |
|----|------|------------|
| PRO-01 | **Canais de suporte** — Documentar canais (e-mail, chat, ticket) e SLA de resposta | P2 |
| PRO-02 | **Política de Privacidade** — Documento público claro sobre tratamento de dados | P1 |
| PRO-03 | **Termos de Serviço** — Termos de uso da plataforma | P1 |
| PRO-04 | **SLA auditável** — Dashboard público de uptime + relatórios periódicos | P3 |
| PRO-05 | **Documentação de infraestrutura** — Preencher 6 docs stubs vazios | P2 |

### OBS — Observabilidade (Criticidade Média)

| ID | Item | Prioridade |
|----|------|------------|
| OBS-01 | **Implementar Sentry/APM** — Monitoramento de erros reais em produção | P1 |
| OBS-02 | **Alertas configurados** — Notificações para métricas críticas (5xx, pool DB, rate limit) | P2 |
| OBS-03 | **Logs centralizados** — Coleta e busca de logs estruturados (ex: Grafana Loki, ELK) | P2 |
| OBS-04 | **Health check endpoints** — Endpoints `/health`, `/ready`, `/metrics` | P2 |

---

## 🗺️ Roadmap Sugerido

```
Fase 1 (MVP — agora)
├── SEG-01 MFA Admin
├── SEG-02 Política de senhas
├── SEG-07 LGPD compliance detalhado
├── DR-01 Definir SLA
├── DR-03 Estratégia de backups
├── PRO-02 Política de Privacidade
├── PRO-03 Termos de Serviço
├── OBS-01 Sentry/APM

Fase 2 (Pós-MVP — 3 meses)
├── SEG-03 IRP
├── SEG-04 SAST no CI
├── SEG-05 Scanner de dependências
├── DR-02 DRP (RTO/RPO)
├── PRO-01 Canais de suporte
├── OBS-02 Alertas
├── OBS-03 Logs centralizados

Fase 3 (Escala — 6+ meses)
├── SEG-06 GDPR
├── SEG-08 PCI-DSS
├── SEG-09 Pentest
├── SEG-10 Treinamento equipe
├── DR-04 Manutenção zero-downtime
├── PRO-05 Docs stubs
├── OBS-04 Health check

Fase 4 (Maturidade — 12+ meses)
├── SEG-11 security.txt
├── SEG-12 CORS hardening
├── DR-05 Status page
├── PRO-04 SLA auditável
├── Certificações (ISO 27001, SOC 2)
```

---

## 📌 Notas

- Itens já cobertos no backlog existente (SCL-* , E2E-*, ADRs pendentes, Pós-MVP) **não foram duplicados**.
- Todo item listado acima representa uma **lacuna real** entre o requisito do produto e o que está documentado/planejado.
- 6 arquivos `docs/` estão vazios (stubs) — isso reduz a credibilidade da documentação atual.
