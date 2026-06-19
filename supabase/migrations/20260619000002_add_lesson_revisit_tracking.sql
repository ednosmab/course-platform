-- Migration: Add lesson revisit tracking
-- Tracks when students re-watch completed lessons for analytics

-- 1. Add revisit columns to student_progress
ALTER TABLE public.student_progress
  ADD COLUMN IF NOT EXISTS revisit_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_revisited_at timestamptz;

-- 2. Create lesson_revisit_events table
CREATE TABLE public.lesson_revisit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_level text,
  completed_before boolean NOT NULL DEFAULT true,
  revisit_number integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes for performance
CREATE INDEX idx_lesson_revisit_events_user_id ON public.lesson_revisit_events(user_id);
CREATE INDEX idx_lesson_revisit_events_lesson_id ON public.lesson_revisit_events(lesson_id);
CREATE INDEX idx_lesson_revisit_events_course_id ON public.lesson_revisit_events(course_id);
CREATE INDEX idx_lesson_revisit_events_created_at ON public.lesson_revisit_events(created_at);

-- 4. Enable RLS
ALTER TABLE public.lesson_revisit_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Students can read their own revisit events
CREATE POLICY "Students read own revisit events"
  ON public.lesson_revisit_events FOR SELECT
  USING (auth.uid() = user_id);

-- Students can insert their own revisit events
CREATE POLICY "Students insert own revisit events"
  ON public.lesson_revisit_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins and teachers can read all revisit events
CREATE POLICY "Admins and teachers read all revisit events"
  ON public.lesson_revisit_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );
