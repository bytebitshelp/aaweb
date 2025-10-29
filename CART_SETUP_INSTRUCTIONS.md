# Cart Persistence Setup Instructions

## 📋 Overview

This document explains how to set up the persistent cart functionality with proper backend validation and automatic cleanup.

## 🗄️ Database Setup

### Step 1: Run SQL Functions

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `cart-persistence-functions.sql`
4. Click **Run** to execute all functions and triggers

### What These Functions Do:

1. **`validate_cart_item()`** - Validates cart items before insert/update
   - Ensures artwork exists
   - Checks availability status
   - Validates quantity doesn't exceed available stock

2. **`cleanup_invalid_cart_items()`** - Automatically removes/updates invalid cart items
   - Runs when artwork availability changes
   - Removes items for sold/out-of-stock artworks
   - Adjusts quantities if cart quantity exceeds available stock

3. **`sync_user_cart()`** - Merges cart items (for future sync functionality)
   - Useful when syncing cart from local storage to database

4. **`get_user_cart_with_details()`** - Optimized function to get cart with artwork details
   - Returns all cart items with full artwork information

5. **`update_cart_quantity()`** - Validates and updates cart item quantity
   - Includes user verification
   - Validates against available stock

6. **`add_to_cart()`** - Adds item to cart with validation
   - Checks availability
   - Handles quantity limits

7. **`remove_unavailable_cart_items()`** - Manual cleanup function
   - Can be called to clean up invalid items

### Step 2: Verify RLS Policies

Ensure these RLS policies exist on the `cart` table:

```sql
-- Users can view own cart
CREATE POLICY "Users can view own cart" ON cart
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Users can insert own cart items
CREATE POLICY "Users can insert own cart items" ON cart
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Users can update own cart items
CREATE POLICY "Users can update own cart items" ON cart
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Users can delete own cart items
CREATE POLICY "Users can delete own cart items" ON cart
  FOR DELETE USING (user_id::text = auth.uid()::text);
```

## ✅ Features Implemented

### Product Card Improvements:
- ✅ Availability button showing "View Details" or "Out of Stock"
- ✅ Proper status display (Available/Out of Stock)
- ✅ Quantity display (e.g., "5 available" or "Out of stock")
- ✅ Button disabled state for unavailable items
- ✅ Proper image handling for all formats (.jpg, .png, etc.)

### Cart Persistence:
- ✅ All cart operations saved to database
- ✅ Cart automatically fetched on user login
- ✅ Cart persists across sessions and page refreshes
- ✅ Invalid items automatically removed
- ✅ Quantity validation against available stock
- ✅ Proper error handling and user feedback

### Backend Functions:
- ✅ Automatic validation on cart insert/update
- ✅ Automatic cleanup when artwork availability changes
- ✅ Quantity validation (can't exceed available stock)
- ✅ Status validation (can't add unavailable items)
- ✅ Optimized queries for better performance

## 🔧 How It Works

1. **When user adds item to cart:**
   - Frontend validates availability
   - Item is inserted into `cart` table
   - Database trigger validates the insert
   - Cart is refreshed from database

2. **When user logs in:**
   - Cart items are automatically fetched from database
   - Invalid items (sold/out-of-stock) are filtered out
   - Cart state is synced with database

3. **When artwork availability changes:**
   - Database trigger automatically runs
   - Invalid cart items are removed/updated
   - Cart quantities are adjusted if needed

4. **When user views cart:**
   - Cart items are fetched with full artwork details
   - Only available items are shown
   - Quantities are validated against current availability

## 📝 Testing Checklist

After setup, test:

- [ ] Add item to cart - should save to database
- [ ] Refresh page - cart should persist
- [ ] Log out and log back in - cart should still be there
- [ ] Try adding more items than available - should show error
- [ ] Mark artwork as sold - cart item should be removed automatically
- [ ] Update cart quantity - should validate against available stock
- [ ] Remove item from cart - should delete from database
- [ ] Check product card buttons - should show correct availability status

## 🐛 Troubleshooting

### Cart items not persisting?
- Check RLS policies are enabled and correct
- Verify user is authenticated (check `auth.uid()`)
- Check browser console for errors

### "Permission denied" errors?
- Verify RLS policies match user_id with auth.uid()
- Check that cart table has proper foreign key constraints

### Invalid items in cart?
- Run `remove_unavailable_cart_items()` function manually
- Check that triggers are created successfully

### Cart not loading on login?
- Verify `fetchCartItems()` is called in `AuthContext`
- Check that `setUser()` is called when user logs in
- Verify database connection is working

## 📚 Additional Notes

- Cart items are automatically cleaned up when artworks become unavailable
- Quantities are automatically adjusted if they exceed available stock
- All cart operations include user verification for security
- Cart state is synced with database on every operation

