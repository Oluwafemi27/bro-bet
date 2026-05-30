-- Ensure transactions table has all required columns
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS metadata jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add unique constraint on reference if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transactions_reference_key'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_reference_key UNIQUE (reference);
  END IF;
END $$;

-- Create wallets table if not exists
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number text,
  bank_name text,
  account_name text,
  provider text DEFAULT 'opay',
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read their own wallets' AND tablename = 'wallets'
  ) THEN
    CREATE POLICY "Users can read their own wallets" ON wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enable Realtime for wallets
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS wallets;

-- Create trigger for wallets updated_at
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();