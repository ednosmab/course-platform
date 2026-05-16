# 📦 SKILL: SUPABASE STORAGE & ASSETS GOVERNANCE

## 🎯 Objetivo
Gerenciar arquivos, mídias e documentos de forma organizada, segura e otimizada para entrega global.

## 🔐 Segurança e Organização
1. **Buckets Públicos vs Privados:** 
   - **Públicos:** Apenas para assets genéricos (logos, ícones públicos).
   - **Privados:** Para conteúdos de cursos, documentos de alunos e mídias pagas. Use URLs assinadas (`createSignedUrl`) para acesso temporário.
2. **RLS no Storage:** Aplique políticas RLS no schema `storage.objects` para controlar quem pode dar upload, download ou deletar arquivos baseado no caminho (`name`).
3. **Estrutura de Pastas:** Use convenções de nomes para caminhos (ex: `courses/{course_id}/lessons/{lesson_id}/{filename}`).
4. **Otimização de Imagens:** Utilize o serviço de transformação de imagens do Supabase (`render_image?width=...`) para economizar banda no mobile.
5. **Mime-Types:** Valide o tipo de arquivo no frontend e no banco (via RLS ou check constraints) para evitar uploads maliciosos.

## 📂 Onde Aplicar
- `supabase/migrations/` (Políticas de Storage).
- Upload de avatares e mídias de aula.
