-- Fix Cart Foreign Key Constraint Error
-- This script ensures users table can handle auth users properly

-- Option 1: Make the foreign key constraint less strict (allow NULL temporarily)
-- Drop existing constraint
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_id_fkey;

-- Recreate with a function that handles user creation
-- But first, let's make sure users are created automatically

-- Option 2: Create a trigger function to auto-create user profile
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user exists in users table
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = NEW.user_id::text
  ) THEN
    -- Try to get user email from auth.users
    INSERT INTO users (user_id, email, name, role, created_at)
    SELECT 
      NEW.user_id::uuid,
      auth.users.email,
      COALESCE(auth.users.raw_user_meta_data->>'name', auth.users.email),
      COALESCE(
        CASE WHEN EXISTS (
          SELECT 1 FROM admin_emails 
          WHERE email = auth.users.email AND is_active = true
        ) THEN 'admin' ELSE 'customer' END,
        'customer'
      ),
      NOW()
    FROM auth.users
    WHERE auth.users.id::text = NEW.user_id::text
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on cart table
DROP TRIGGER IF EXISTS trigger_ensure_user_profile ON cart;
CREATE TRIGGER trigger_ensure_user_profile
  BEFORE INSERT ON cart
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_profile();

-- Recreate the foreign key constraint
ALTER TABLE cart
  ADD CONSTRAINT cart_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(user_id) 
  ON DELETE CASCADE;

