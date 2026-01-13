-- Allow public selection of user_roles for trainer role so the frontend
-- can list trainers without requiring the current user to be the owner.

CREATE POLICY "Public can view trainer roles"
  ON public.user_roles FOR SELECT
  USING (role = 'trainer');
