# Cart Foreign Key Constraint Fix

## Problem
When adding items to cart, you get this error:
```
insert or update on table "cart" violates foreign key constraint "cart_user_id_fkey"
```

This happens because:
1. User signs in with Google OAuth (or email/password)
2. Supabase Auth creates a user in `auth.users`
3. But the user doesn't exist in the custom `users` table yet
4. When adding to cart, the foreign key `cart.user_id` references `users.user_id`
5. Since the user doesn't exist in `users`, the constraint fails

## Solution

### 1. Frontend Fix (Implemented)

**File: `src/store/cartStore.js`**

Added `ensureUserProfile()` function that:
- Checks if user exists in `users` table
- If not, creates the user profile automatically
- Handles race conditions and errors gracefully

**Changes:**
- `setUser()` now calls `ensureUserProfile()` before fetching cart items
- `addItem()` ensures user profile exists before adding items
- Added error handling for foreign key constraint violations (code `23503`)
- If foreign key error occurs, automatically creates user profile and retries

### 2. Database Trigger (Optional Backup)

**File: `fix-cart-foreign-key-error.sql`**

Created a database trigger that automatically creates user profiles when cart items are inserted. This is a backup in case the frontend check fails.

**To apply:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of `fix-cart-foreign-key-error.sql`
3. Run the SQL script

## How It Works Now

1. **On Login:**
   - User signs in → `AuthContext` creates user profile if needed
   - `cartStore.setUser()` is called → ensures user profile exists
   - Cart items are fetched

2. **On Add to Cart:**
   - `addItem()` is called
   - First, `ensureUserProfile()` checks if user exists
   - If not, creates user profile
   - Then adds item to cart
   - If foreign key error still occurs, automatically retries after creating profile

3. **Error Handling:**
   - Foreign key errors (23503) are caught
   - User profile is created automatically
   - Operation is retried
   - User sees success message

## Testing

1. Sign in with Google OAuth
2. Try adding an item to cart
3. Should work without errors
4. User profile should be created automatically if missing

## Notes

- The fix handles race conditions (multiple simultaneous cart operations)
- Ignores duplicate user creation errors (code 23505)
- Works for both Google OAuth and email/password sign-in
- Admin status is automatically determined based on email

