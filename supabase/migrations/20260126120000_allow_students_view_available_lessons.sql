-- Allow all authenticated users to view available lessons
CREATE POLICY "Anyone can view available lessons"
  ON public.lessons FOR SELECT
  USING (status = 'available');
