# 1. Escolha da Stack e Estratégia de Estilização Híbrida (Next.js, Expo, Tamagui, Supabase)

- **Status:** Aceito
- **Data:** 2026-05-14
- **Autor:** Edson

## Contexto e Problema
Precisamos construir uma plataforma de cursos modular com um Visual Builder (CMS estilo Canva). O sistema deve operar simultaneamente na Web (Painel do Administrador em Next.js) e no Mobile (Aplicativo do Aluno em Expo/React Native). O maior desafio técnico é renderizar interfaces baseadas em nós dinâmicos JSON de forma unificada e de alta performance, sem duplicar código de estilização (respeitando o princípio DRY).

## Opções Consideradas
1. **Tailwind CSS + NativeWind:** Rejeitado. Embora unifique classes de strings, o Tailwind trabalha com utilitários estáticos pré-compilados. Ele falha ao lidar com propriedades altamente dinâmicas geradas pelo usuário em tempo de execução no Canvas (ex: mudanças arbitrárias de pixels ou cores salvas no banco de dados).
2. **Sass Modules + StyleSheet Nativo:** Rejeitado. Exige a escrita de arquivos `.module.scss` para a Web e objetos `StyleSheet.create` separados para o mobile, violando o princípio DRY e gerando retrabalho de engenharia.
3. **Tamagui (CSS-in-JS Universal):** Escolhido como a única alternativa.

## Decisão Técnica
Adotamos o **Tamagui** como ferramenta única de estilização. O Tamagui permite criar componentes estilizados unificados em um pacote compartilhado (`packages/ui`), aceitando injeção de `props` dinâmicas nativamente. O compilador do Tamagui gerará CSS otimizado para a Web e objetos nativos de estilo para o Expo. O banco de dados utilizará **Supabase com PostgreSQL e tabelas JSONB** para persistir essa estrutura flexível de blocos de forma performática.

## Consequências
- **Positivas:** Código 100% DRY para interfaces visuais; suporte nativo a layouts dinâmicos controlados por dados; tipagem ponta a ponta integrada com TypeScript e Zod.
- **Negativas:** Curva de aprendizado inicial ligeiramente maior para configurar o compilador unificado do Tamagui no ecossistema do monorepo.
