# 🔄 SKILL: SUPABASE REALTIME & SYNC

## 🎯 Objetivo
Habilitar experiências colaborativas e atualizações instantâneas na interface sem a necessidade de recarregar a página (polling).

## 🛠️ Configuração e Limites
1. **Habilitar por Tabela:** Lembre-se que o Realtime deve ser habilitado explicitamente no Supabase para cada tabela (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`).
2. **Filtering no Lado do Cliente:** Use filtros nas subscrições (`eq`, `neq`) para receber apenas os dados necessários e reduzir o tráfego de rede.
3. **Channel Management:** Sempre faça o `unsubscribe` ao desmontar componentes React para evitar vazamentos de memória e atingir o limite de conexões simultâneas.
4. **Presence API:** Use para mostrar quem está online em um curso ou aula (ex: "3 alunos assistindo agora").
5. **Broadcast:** Use para mensagens rápidas e efêmeras entre clientes que não precisam ser persistidas no banco de dados.

## 📂 Onde Aplicar
- Dashboards de administração.
- Player de aula (sincronização de progresso e comentários).
