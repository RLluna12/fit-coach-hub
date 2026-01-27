-- Allow students to cancel their own scheduled lessons
CREATE POLICY "Students can cancel their lessons"
  ON public.lessons FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid() OR (student_id IS NULL AND status = 'available'));
