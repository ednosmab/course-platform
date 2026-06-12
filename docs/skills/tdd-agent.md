---
name: tdd-agent
description: >
  Ative esta skill sempre que o agente for escrever testes, implementar funcionalidades com cobertura
  de testes, corrigir bugs, ou trabalhar em qualquer código que deva ser verificado por testes
  automatizados. Esta skill define a postura de um engenheiro sênior que pratica TDD de forma
  rigorosa: o teste vem primeiro, o código de produção existe apenas para fazer o teste passar, e
  nenhuma funcionalidade é considerada completa até estar coberta. Use para implementações novas,
  refactors com rede de segurança, correção de regressões, e validação de contratos de interface.
  Se há comportamento a garantir, esta skill deve estar ativa.
---

# Agente TDD

Você pratica Test-Driven Development de forma disciplinada. Não escreve código de produção antes
de ter um teste que falha. Não avança para o próximo ciclo antes de o teste atual estar verde.
Não "limpa depois" — o refactor faz parte do ciclo, não é opcional.

O TDD não é sobre cobertura de código. É sobre design: testes que são difíceis de escrever revelam
código que é difícil de usar. Quando o teste é doloroso, o problema está no design, não no teste.

---

## O Ciclo Red-Green-Refactor

Cada unidade de trabalho segue exatamente este ciclo, sem exceções:

### 🔴 RED — Escrever o teste que falha

1. Escreva **um único teste** que descreve o comportamento desejado.
2. Execute o teste. Confirme que ele **falha pelo motivo certo**.
   - Falha esperada: `AssertionError`, `TypeError` por símbolo inexistente, etc.
   - Falha errada: erro de sintaxe, import quebrado, erro de configuração.
   - Se o teste passar sem código de produção, o teste está errado.
3. Leia a mensagem de erro completa antes de avançar. Ela é o seu spec.

### 🟢 GREEN — Escrever o mínimo de código para passar

1. Escreva **apenas o código necessário** para fazer o teste passar.
2. Não antecipe casos futuros. Não generalize. Não otimize.
3. Se "retornar um valor fixo" faz o teste passar, faça isso. Testes futuros vão forçar a
   implementação real — esse é o mecanismo do TDD, não um atalho.
4. Execute o teste. Confirme que ele **passa**.
5. Execute **toda a suíte** para confirmar que nenhum teste existente quebrou.

### 🔵 REFACTOR — Melhorar sem mudar comportamento

1. Remova duplicação. Melhore nomes. Simplifique lógica.
2. **Os testes não mudam** durante o refactor. Se precisar mudar um teste para que o refactor
   funcione, o refactor está errado.
3. Execute toda a suíte após cada mudança estrutural. Verde deve permanecer verde.
4. Só avance para o próximo ciclo depois que o refactor estiver completo e os testes verdes.

---

## Anatomia de um Bom Teste

```
describe('<Unidade>') {
  context('<condição ou estado>') {
    it('<comportamento esperado>') {
      // Arrange — montar o estado inicial
      // Act    — executar a ação sob teste
      // Assert — verificar o resultado
    }
  }
}
```

**Regras:**
- Um teste, uma asserção lógica. Múltiplas asserções físicas são aceitáveis se testam
  o mesmo comportamento (ex: objeto retornado com dois campos relacionados).
- Nomes descrevem comportamento, não implementação. Não `"deve chamar o repositório"` mas
  `"deve retornar null quando o curso não existe"`.
- Testes são código de primeira classe. Mesmas regras de qualidade que o código de produção:
  sem duplicação desnecessária, sem magic numbers sem contexto, sem setup incompreensível.
- Sem lógica condicional em testes. Um teste com `if` ou `try/catch` esconde casos de falha.

---

## Ordem de Escrita dos Testes

Escreva testes nesta ordem, do mais simples ao mais complexo:

1. **Caminho feliz** — entrada válida, resultado esperado
2. **Casos limite** — valores nulos, strings vazias, arrays vazios, zero
3. **Casos de erro** — entradas inválidas, dependências que falham
4. **Invariantes** — propriedades que devem ser sempre verdadeiras

Não pule para casos de erro antes de ter o caminho feliz funcionando. A ordem importa porque
cada teste força uma decisão de design.

---

## Mocks, Stubs e Dependências

Use test doubles apenas para:
- Isolar a unidade sob teste de I/O real (banco, rede, filesystem)
- Controlar o tempo ou estado não-determinístico
- Simular condições de erro que seriam difíceis de reproduzir

**Não use mocks para:**
- Evitar escrever implementações reais de objetos simples — crie o objeto real
- Verificar chamadas internas de implementação — isso acopla o teste à implementação
- Contornar design difícil — se o mock é complicado, o design precisa mudar

Quando um mock é difícil de configurar, pare. Pergunte: "Por que esta unidade depende de tanto?"
A resposta geralmente revela um problema de responsabilidade única.

---

## Quando o Teste É Difícil de Escrever

Dificuldade para escrever o teste é um sinal de design, não um problema do teste:

| Sintoma no teste | Problema no código |
|---|---|
| Setup muito longo | Objeto com muitas dependências ou responsabilidades |
| Preciso de mock complexo para um método simples | Acoplamento excessivo |
| Não consigo testar sem acessar internals | Encapsulamento fraco ou lógica no lugar errado |
| Teste quebra ao renomear variável interna | Teste testando implementação, não comportamento |
| Preciso de 10 testes para cobrir 1 função | Função faz coisas demais |

Nesses casos, **não force o teste**. Refatore o design primeiro, depois escreva o teste.

---

## TDD em Planos Multi-Step

Quando seguindo um plano com steps numerados que incluem testes:

- Steps de teste (ex: "Step 12: Testes unitários — Service") são **steps de produção**, não extras.
  Eles têm as mesmas verificações e o mesmo critério de conclusão que qualquer outro step.
- Se o plano especifica testes após a implementação, escreva-os como se estivesse descobrindo
  o comportamento — não como documentação do que você acabou de escrever.
- **Testes que passam trivialmente são um risco.** Depois de escrever cada teste, verifique se
  ele poderia falhar: quebre temporariamente o código de produção e confirme que o teste detecta.
- Verificação de step de teste: `pnpm --filter <pacote> test --run` deve terminar verde antes
  de marcar o step como completo.

---

## O Que Nunca Fazer

- **Nunca escrever código de produção antes do teste.** Se você sabe o que precisa implementar,
  escreva o teste que prova isso primeiro.
- **Nunca fazer o teste passar com `skip` ou `todo`.** Um teste ignorado é pior que nenhum teste
  — cria ilusão de cobertura.
- **Nunca comentar testes que falham.** Se um teste falha e você não quer consertar agora,
  delete-o e registre como dívida explícita. Testes comentados apodrecem.
- **Nunca alterar o teste para fazer a implementação funcionar** (exceto durante refactor de
  test code por duplicação). Se o teste precisa mudar, a especificação mudou — trate como isso.
- **Nunca pular o passo de verificação "falha pelo motivo certo".** Um teste que nunca falhou
  não prova nada.

---

## Checklist de Conclusão de Ciclo

Antes de declarar uma funcionalidade completa:

- [ ] Existe pelo menos um teste para cada comportamento especificado
- [ ] Todos os testes foram vistos falhar antes de passar
- [ ] Toda a suíte passa (não só os testes novos)
- [ ] Nenhum teste está em `skip`, `xit`, `todo` ou comentado
- [ ] O refactor foi feito — não há duplicação óbvia entre implementação e testes
- [ ] Os nomes dos testes descrevem comportamento observável, não detalhes internos
