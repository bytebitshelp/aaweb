-- Cart Persistence and Management Functions
-- This file contains all database functions and triggers needed for persistent cart functionality

-- ============================================
-- 1. Function to validate cart items (check availability)
-- ============================================
CREATE OR REPLACE FUNCTION validate_cart_item()
RETURNS TRIGGER AS $$
DECLARE
  artwork_available INT;
  artwork_status TEXT;
BEGIN
  -- Get current artwork availability and status
  SELECT quantity_available, status 
  INTO artwork_available, artwork_status
  FROM artworks 
  WHERE artwork_id = NEW.artwork_id;

  -- Check if artwork exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Artwork with id % does not exist', NEW.artwork_id;
  END IF;

  -- Check if artwork is available
  IF artwork_status != 'Available' AND artwork_status != 'available' THEN
    RAISE EXCEPTION 'Artwork with id % is not available (status: %)', NEW.artwork_id, artwork_status;
  END IF;

  -- Check if quantity is available
  IF NEW.quantity > artwork_available THEN
    RAISE EXCEPTION 'Requested quantity (%) exceeds available quantity (%) for artwork %', 
      NEW.quantity, artwork_available, NEW.artwork_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate cart items before insert/update
CREATE TRIGGER trigger_validate_cart_item
  BEFORE INSERT OR UPDATE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION validate_cart_item();

-- ============================================
-- 2. Function to clean up invalid cart items when artwork availability changes
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_invalid_cart_items()
RETURNS TRIGGER AS $$
BEGIN
  -- If artwork becomes unavailable or quantity goes to zero,
  -- remove it from all carts where quantity in cart exceeds available quantity
  IF NEW.status != 'Available' AND NEW.status != 'available' OR NEW.quantity_available <= 0 THEN
    -- Delete cart items for this artwork that exceed available quantity
    DELETE FROM cart
    WHERE artwork_id = NEW.artwork_id
    AND quantity > NEW.quantity_available;
    
    -- Update quantities for items that are still in carts but exceed availability
    UPDATE cart
    SET quantity = NEW.quantity_available
    WHERE artwork_id = NEW.artwork_id
    AND quantity > NEW.quantity_available
    AND NEW.quantity_available > 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to clean up cart when artwork availability changes
CREATE TRIGGER trigger_cleanup_invalid_cart_items
  AFTER UPDATE OF quantity_available, status ON artworks
  FOR EACH ROW
  WHEN (OLD.quantity_available IS DISTINCT FROM NEW.quantity_available 
        OR OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION cleanup_invalid_cart_items();

-- ============================================
-- 3. Function to sync cart items (merge cart on user login)
-- ============================================
CREATE OR REPLACE FUNCTION sync_user_cart(p_user_id UUID, p_cart_items JSONB)
RETURNS TABLE(cart_id UUID, artwork_id UUID, quantity INT) AS $$
DECLARE
  item JSONB;
  existing_cart_id UUID;
BEGIN
  -- Loop through each cart item in the JSON array
  FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    -- Check if item already exists in cart
    SELECT cart_id INTO existing_cart_id
    FROM cart
    WHERE user_id = p_user_id
    AND artwork_id = (item->>'artwork_id')::UUID;

    IF existing_cart_id IS NOT NULL THEN
      -- Update existing cart item quantity
      UPDATE cart
      SET quantity = GREATEST(
        quantity,
        LEAST(
          (item->>'quantity')::INT,
          (SELECT quantity_available FROM artworks WHERE artwork_id = (item->>'artwork_id')::UUID)
        )
      ),
      created_at = NOW()
      WHERE cart_id = existing_cart_id;
      
      -- Return updated item
      RETURN QUERY
      SELECT existing_cart_id, (item->>'artwork_id')::UUID, cart.quantity
      FROM cart
      WHERE cart_id = existing_cart_id;
    ELSE
      -- Insert new cart item
      INSERT INTO cart (user_id, artwork_id, quantity, created_at)
      VALUES (
        p_user_id,
        (item->>'artwork_id')::UUID,
        LEAST(
          (item->>'quantity')::INT,
          (SELECT quantity_available FROM artworks WHERE artwork_id = (item->>'artwork_id')::UUID)
        ),
        NOW()
      )
      ON CONFLICT (user_id, artwork_id) DO UPDATE
      SET quantity = LEAST(
        cart.quantity + EXCLUDED.quantity,
        (SELECT quantity_available FROM artworks WHERE artwork_id = EXCLUDED.artwork_id)
      );
      
      -- Return inserted item
      RETURN QUERY
      SELECT cart.cart_id, cart.artwork_id, cart.quantity
      FROM cart
      WHERE user_id = p_user_id
      AND artwork_id = (item->>'artwork_id')::UUID;
    END IF;
  END LOOP;

  -- Return all cart items for the user
  RETURN QUERY
  SELECT cart.cart_id, cart.artwork_id, cart.quantity
  FROM cart
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Function to get cart with artwork details (optimized query)
-- ============================================
CREATE OR REPLACE FUNCTION get_user_cart_with_details(p_user_id UUID)
RETURNS TABLE(
  cart_id UUID,
  artwork_id UUID,
  title TEXT,
  artist_name TEXT,
  price NUMERIC,
  image_url TEXT,
  image_urls TEXT[],
  quantity INT,
  quantity_available INT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cart_id,
    c.artwork_id,
    a.title,
    a.artist_name,
    a.price,
    a.image_url,
    a.image_urls,
    c.quantity,
    a.quantity_available,
    a.status
  FROM cart c
  INNER JOIN artworks a ON c.artwork_id = a.artwork_id
  WHERE c.user_id = p_user_id
  AND (a.status = 'Available' OR a.status = 'available')
  AND a.quantity_available > 0
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Function to update cart item quantity with validation
-- ============================================
CREATE OR REPLACE FUNCTION update_cart_quantity(
  p_cart_id UUID,
  p_quantity INT,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  artwork_available INT;
  artwork_status TEXT;
BEGIN
  -- Verify cart item belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM cart 
    WHERE cart_id = p_cart_id 
    AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Cart item does not belong to user';
  END IF;

  -- Get artwork availability
  SELECT a.quantity_available, a.status
  INTO artwork_available, artwork_status
  FROM cart c
  INNER JOIN artworks a ON c.artwork_id = a.artwork_id
  WHERE c.cart_id = p_cart_id;

  -- Validate quantity
  IF p_quantity <= 0 THEN
    -- Delete if quantity is 0 or less
    DELETE FROM cart WHERE cart_id = p_cart_id;
    RETURN TRUE;
  END IF;

  IF p_quantity > artwork_available THEN
    RAISE EXCEPTION 'Requested quantity (%) exceeds available quantity (%)', p_quantity, artwork_available;
  END IF;

  IF artwork_status != 'Available' AND artwork_status != 'available' THEN
    -- Remove item if artwork is not available
    DELETE FROM cart WHERE cart_id = p_cart_id;
    RETURN FALSE;
  END IF;

  -- Update quantity
  UPDATE cart
  SET quantity = p_quantity
  WHERE cart_id = p_cart_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Function to add item to cart (with upsert logic)
-- ============================================
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id UUID,
  p_artwork_id UUID,
  p_quantity INT DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_cart_id UUID;
  artwork_available INT;
  artwork_status TEXT;
BEGIN
  -- Check artwork availability
  SELECT quantity_available, status
  INTO artwork_available, artwork_status
  FROM artworks
  WHERE artwork_id = p_artwork_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Artwork not found';
  END IF;

  IF artwork_status != 'Available' AND artwork_status != 'available' THEN
    RAISE EXCEPTION 'Artwork is not available';
  END IF;

  IF artwork_available < p_quantity THEN
    RAISE EXCEPTION 'Insufficient quantity available';
  END IF;

  -- Upsert cart item
  INSERT INTO cart (user_id, artwork_id, quantity, created_at)
  VALUES (p_user_id, p_artwork_id, p_quantity, NOW())
  ON CONFLICT (user_id, artwork_id) DO UPDATE
  SET quantity = LEAST(
    cart.quantity + p_quantity,
    artwork_available
  );

  -- Get cart_id
  SELECT cart_id INTO v_cart_id
  FROM cart
  WHERE user_id = p_user_id
  AND artwork_id = p_artwork_id;

  RETURN v_cart_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. RLS Policies for cart (if not already exists)
-- ============================================
-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can manage own cart" ON cart;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own cart" ON cart
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own cart items" ON cart
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own cart items" ON cart
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own cart items" ON cart
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================
-- 8. Indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cart_user_artwork ON cart(user_id, artwork_id);
CREATE INDEX IF NOT EXISTS idx_cart_artwork_id ON cart(artwork_id);
CREATE INDEX IF NOT EXISTS idx_cart_created_at ON cart(created_at DESC);

-- ============================================
-- 9. Function to automatically remove sold/out-of-stock items from cart
-- ============================================
CREATE OR REPLACE FUNCTION remove_unavailable_cart_items()
RETURNS void AS $$
BEGIN
  -- Remove cart items where artwork is not available or quantity is 0
  DELETE FROM cart
  WHERE EXISTS (
    SELECT 1 FROM artworks a
    WHERE a.artwork_id = cart.artwork_id
    AND (
      (a.status != 'Available' AND a.status != 'available')
      OR a.quantity_available <= 0
      OR cart.quantity > a.quantity_available
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. Grant necessary permissions
-- ============================================
-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION add_to_cart(UUID, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_cart_quantity(UUID, INT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_cart_with_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_user_cart(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_unavailable_cart_items() TO authenticated;

