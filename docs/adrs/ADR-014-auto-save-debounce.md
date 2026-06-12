# ADR-014: Auto-save with debounce 1.5s + state machine (idle→saving→saved→error)

**Status:** Accepted  
**Data:** 2026-05-23  
**Contexto:** Editor CMS (apps/admin) precisa salvar alterações automaticamente sem sobrecarregar o servidor

---

## Decisão

O editor CMS utiliza auto-save com **debounce de 1.5 segundos** após a última alteração do usuário. O estado do salvamento é modelado como uma **máquina de estados finitos** com 4 estados: `idle` (sem alterações pendentes), `saving` (requisição em andamento), `saved` (último salvamento bem-sucedido), `error` (último salvamento falhou). O feedback visual é exibido no header do editor.

---

## Contexto

O editor estilo Canva permite que o admin modifique blocos continuamente. Sem debounce, cada digitação ou arrasto geraria uma requisição ao servidor, causando throttling e experiência degradada. A máquina de estados garante que o usuário tenha feedback claro sobre o status do salvamento e possa distinguir entre "salvo", "salvando" e "erro".

**Máquina de estados:**

```
idle → (usuário edita) → saving → (sucesso) → saved → (nova edição) → idle
                              ↓
                           (erro) → error → (tentativa automática) → saving
```

- Transição `saved → idle`: ocorre imediatamente quando o usuário faz nova alteração
- Transição `error → saving`: tentativa automática após 5s ou na próxima edição
- Debounce de 1.5s reseta a cada nova alteração do usuário

---

## Consequências

### ✅ Positivas
- Redução drástica de requisições ao servidor
- Feedback visual claro no header: indicador de status salvo/salvando/erro
- Resiliência a falhas de rede com retry automático
- Código previsível e testável graças à máquina de estados explícita
- Experiência fluida: usuário não precisa clicar em "salvar" manualmente

### ❌ Negativas
- Latência de 1.5s entre a edição e o salvamento efetivo
- Perda de até 1.5s de edição se o usuário fechar o navegador antes do debounce disparar
- Complexidade adicional de UI para exibir os estados de salvamento
- Necessidade de gerenciar ciclo de vida do timer (cleanup em desmontagem de componente)

---

## Referências

- `apps/admin/src/components/editor/hooks/useAutoSave.ts` — Hook de auto-save com state machine
- `apps/admin/src/components/editor/EditorHeader.tsx` — Feedback visual no header
- `docs/skills/state_management_protocol.md` — Protocolo de gerenciamento de estado
