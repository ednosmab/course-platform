-- Migration: Add block_states column to student_progress
-- Purpose: Store interactive block state (quiz answers, video positions, etc.)
-- Date: 2026-06-20

ALTER TABLE public.student_progress
  ADD COLUMN IF NOT EXISTS block_states jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.student_progress.block_states IS 'Serialised state of interactive blocks (quiz selections, video positions, etc.). Keyed by block ID.';
