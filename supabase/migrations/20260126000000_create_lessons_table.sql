-- Create lesson_status enum
CREATE TYPE public.lesson_status AS ENUM ('available', 'scheduled', 'completed', 'cancelled');

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status lesson_status NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT no_overlapping_lessons UNIQUE (trainer_id, scheduled_date, start_time)
);

CREATE INDEX idx_lessons_trainer_id ON public.lessons(trainer_id);
CREATE INDEX idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX idx_lessons_scheduled_date ON public.lessons(scheduled_date);
CREATE INDEX idx_lessons_status ON public.lessons(status);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Trainers can view and manage their own lessons
CREATE POLICY "Trainers can view their own lessons"
  ON public.lessons FOR SELECT
  USING (auth.uid() = trainer_id OR auth.uid() = student_id);

CREATE POLICY "Trainers can insert lessons for themselves"
  ON public.lessons FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own lessons"
  ON public.lessons FOR UPDATE
  USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete their own lessons"
  ON public.lessons FOR DELETE
  USING (auth.uid() = trainer_id);

-- Students can book lessons
CREATE POLICY "Students can book available lessons"
  ON public.lessons FOR UPDATE
  USING (status = 'available')
  WITH CHECK (student_id IS NOT NULL AND status = 'scheduled');
