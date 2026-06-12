# GDPR Compliance — Requisitos para Operação na Europa

## Escopo

Aplicável se a plataforma atender cidadãos da União Europeia ou processar dados de residentes na UE.

## Direitos do Titular

| Direito | Implementação Necessária |
|---------|-------------------------|
| Acesso (Art. 15) | Exportar dados pessoais do usuário em formato JSON |
| Retificação (Art. 16) | Editar perfil e dados cadastrais |
| Apagamento (Art. 17) | `DELETE /user/data` + remover de backups em 30 dias |
| Portabilidade (Art. 20) | Download de dados em formato estruturado (JSON) |
| Oposição (Art. 21) | Opt-out de marketing e notificações |
| Decisões automatizadas (Art. 22) | Revisão manual de qualquer decisão automatizada |

## Bases Legais para Processamento

| Finalidade | Base Legal | Observação |
|------------|-----------|------------|
| Prestação do serviço EAD | Execução de contrato (Art. 6.1.b) | Necessário para funcionamento |
| Certificados | Obrigação legal (Art. 6.1.c) | Retenção mínima exigida por lei |
| Marketing | Consentimento (Art. 6.1.a) | Opt-in explícito no cadastro |
| Analytics | Interesse legítimo (Art. 6.1.f) | Dados anonimizados |

## Registro de Atividades de Tratamento (Art. 30)

Manter registro de:
- Categorias de dados coletados (nome, email, progresso, etc.)
- Finalidade do processamento
- Bases legais aplicáveis
- Períodos de retenção
- Medidas de segurança técnicas e organizacionais

## DPO (Data Protection Officer)

Nome e contato do DPO devem ser disponibilizados publicamente. Designar quando houver processamento em larga escala de dados sensíveis.

## Violação de Dados (Art. 33-34)

- Notificar autoridade competente em até 72h
- Notificar titulares afetados sem demora injustificada
- Manter registro de todas as violações

## Transferências Internacionais

Dados armazenados no Supabase (AWS/Europa ou EUA). Verificar:
- Cláusulas contratuais padrão (SCCs) com provedores
- Data Processing Agreement (DPA) assinado com Supabase
- Localização dos servidores (preferencialmente UE ou US com Privacy Shield)
