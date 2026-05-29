-- Create wallets table for user virtual accounts
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

-- RLS Policies for wallets
CREATE POLICY "Users can read their own wallets" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Update transactions table
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS metadata jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add unique constraint on reference to prevent duplicate processing
ALTER TABLE transactions ADD CONSTRAINT transactions_reference_key UNIQUE (reference);

-- Enable Realtime for wallets
ALTER PUBLICATION supabase_realtime ADD TABLE wallets;

-- Function to handle OPay deposit atomically
CREATE OR REPLACE FUNCTION handle_opay_deposit(
  _reference text,
  _amount numeric,
  _metadata jsonb
)
RETURNS boolean AS $$
DECLARE
  _user_id uuid;
  _current_status text;
BEGIN
  -- Select the transaction and lock the row
  SELECT user_id, status INTO _user_id, _current_status
  FROM transactions
  WHERE reference = _reference
  FOR UPDATE;

  -- If transaction not found or already completed, return false
  IF _user_id IS NULL OR _current_status = 'completed' THEN
    RETURN false;
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET 
    status = 'completed',
    metadata = COALESCE(metadata, '{}'::jsonb) || _metadata,
    updated_at = now()
  WHERE reference = _reference;

  -- Update user balance
  UPDATE profiles
  SET 
    balance = balance + _amount,
    updated_at = now()
  WHERE id = _user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initiate withdrawal atomically
CREATE OR REPLACE FUNCTION initiate_withdrawal(
  _user_id uuid,
  _amount numeric,
  _reference text,
  _bank_name text,
  _account_number text
)
RETURNS boolean AS $$
DECLARE
  _current_balance numeric;
BEGIN
  -- Get and lock the profile
  SELECT balance INTO _current_balance
  FROM profiles
  WHERE id = _user_id
  FOR UPDATE;

  IF _current_balance < _amount THEN
    RETURN false;
  END IF;

  -- Deduct balance
  UPDATE profiles
  SET 
    balance = balance - _amount,
    updated_at = now()
  WHERE id = _user_id;

  -- Create pending transaction
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    status,
    reference,
    bank_name,
    account_number,
    created_at,
    updated_at
  ) VALUES (
    _user_id,
    'withdrawal',
    _amount,
    'pending',
    _reference,
    _bank_name,
    _account_number,
    now(),
    now()
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refund withdrawal
CREATE OR REPLACE FUNCTION refund_withdrawal(
  _reference text
)
RETURNS boolean AS $$
DECLARE
  _user_id uuid;
  _amount numeric;
  _current_status text;
BEGIN
  -- Get transaction details
  SELECT user_id, amount, status INTO _user_id, _amount, _current_status
  FROM transactions
  WHERE reference = _reference
  FOR UPDATE;

  IF _user_id IS NULL OR _current_status != 'pending' THEN
    RETURN false;
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET 
    status = 'failed',
    updated_at = now()
  WHERE reference = _reference;

  -- Refund user balance
  UPDATE profiles
  SET 
    balance = balance + _amount,
    updated_at = now()
  WHERE id = _user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
