-- ─────────────────────────────────────────────────────────────────
-- FreshDS — Phase 1 migration
-- Run in: Supabase dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- 1. Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme_config     JSONB,
  ADD COLUMN IF NOT EXISTS component_rules  JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS has_paid         BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Allow users to update their own profile (needed for theme/rules saves)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- Verification queries (run after migration to confirm)
-- ─────────────────────────────────────────────────────────────────
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;
