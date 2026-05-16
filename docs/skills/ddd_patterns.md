# 🧩 SKILL: DOMAIN-DRIVEN DESIGN (DDD) PATTERNS

## 🎯 Objetivo
Isolar a complexidade do domínio da infraestrutura, garantindo que as regras de negócio sejam o coração do sistema e permaneçam agnósticas a frameworks.

## 🏗️ Padrões de Arquitetura (Domain Layer)
1. **Entidades:** Objetos com identidade única que persiste através do tempo (ex: `Curso`, `Aula`). Devem encapsular lógica de autovalidação.
2. **Value Objects (VOs):** Objetos definidos apenas por seus atributos, imutáveis (ex: `Email`, `UrlVideo`, `StatusAula`). Sempre use VOs para evitar o "Primitive Obsession".
3. **Agregados:** Clusters de entidades e VOs que são tratados como uma única unidade para mudanças de dados. O **Aggregate Root** é o único ponto de entrada para o agregado.
4. **Repositórios (Interfaces):** Defina contratos no domínio para persistência. A implementação real (Supabase/PostgreSQL) deve ficar na camada de infraestrutura.
5. **Domain Services:** Use quando uma operação de domínio não pertence naturalmente a uma única Entidade ou VO (ex: `CalculadorDeProgresso`).

## 🛡️ Regras de Dependência
- A camada de **Domínio** (`packages/core/domain`) NUNCA deve importar nada de **Infraestrutura** ou **UI**.
- Use **Injeção de Dependência** para fornecer implementações de infraestrutura para o domínio em tempo de execução.

## 📂 Onde Aplicar
- `packages/core/src/domain/`
- Definição de Use Cases e Business Rules.
