-- Migration: Add INSERT RLS policy for students on certificates table
-- Date: 2026-06-11
-- Reason: Certificate issuance silently fails because students have no INSERT permission.
--         The checkAndIssue() function runs in the student's session context, but the
--         existing RLS policies only allow admins to INSERT. Students can only SELECT.

create policy "Estudantes recebem certificados automaticamente"
    on public.certificates for insert
    with check (auth.uid() = user_id);
