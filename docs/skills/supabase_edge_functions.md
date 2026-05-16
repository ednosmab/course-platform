# ⚡ SKILL: SUPABASE EDGE FUNCTIONS (SERVERLESS)

## 🎯 Objetivo
Executar lógica de backend complexa, integrações de terceiros e tarefas pesadas de forma isolada, performática e segura.

## 🛠️ Regras de Desenvolvimento
1. **Deno Runtime:** Lembre-se que as Edge Functions rodam em Deno. Use imports de URL ou o arquivo `import_map.json`.
2. **CORS Handling:** Implemente o tratamento de preflight (OPTIONS) em todas as funções que serão chamadas pelo navegador para evitar erros de rede.
3. **Secrets Management:** Nunca use chaves fixas no código. Utilize `Deno.env.get("NOME_DA_VAR")` e gerencie os segredos via CLI do Supabase.
4. **Service Role Key:** Use a `SERVICE_ROLE_KEY` apenas dentro das Edge Functions para operações que precisam ignorar o RLS (ex: enviar e-mails, processar pagamentos).
5. **Small & Focused:** Mantenha as funções pequenas. Se uma função demorar mais de 10s ou usar muita memória, considere uma abordagem diferente ou otimização.

## 📂 Onde Aplicar
- `supabase/functions/`.
- Integrações com gateways de pagamento, envio de e-mails ou processamento de arquivos.
