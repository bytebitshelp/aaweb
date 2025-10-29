# Razorpay Payment Gateway & Resend Email Setup Guide

## 📋 Overview

This guide explains how to set up the Razorpay payment gateway and Resend API for email notifications.

## 🔑 Environment Variables

Add these environment variables to your `.env` file (and your deployment platform):

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx  # Your Razorpay Key ID (from Razorpay Dashboard)

# Resend API Configuration (for email notifications)
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Your Resend API key
VITE_ADMIN_EMAIL=asadmohammed181105@gmail.com  # Admin email to receive order notifications

# Site URL (for OAuth redirects)
VITE_SITE_URL=https://yourdomain.com  # Your deployed site URL
```

## 🚀 Razorpay Setup

### Step 1: Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Navigate to **Settings** → **API Keys**
4. Generate a **Test Key** for development
5. Copy the **Key ID** (starts with `rzp_test_`)

### Step 2: Configure in Your Project
1. Add `VITE_RAZORPAY_KEY_ID` to your `.env` file
2. For production, use a **Live Key** (starts with `rzp_live_`)

### Step 3: Important Notes

⚠️ **IMPORTANT**: The current implementation creates orders on the frontend for simplicity. For production:

1. **Create orders on backend**: The Razorpay Secret Key should NEVER be exposed on the frontend
2. **Set up Supabase Edge Function** or your own backend API to:
   - Create Razorpay orders using the secret key
   - Verify payment signatures securely
   - Handle webhooks for payment status updates

### Recommended Backend Setup

Create a Supabase Edge Function or API endpoint:

```javascript
// Example: Supabase Edge Function for creating orders
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "https://cdn.skypack.dev/razorpay"

serve(async (req) => {
  const { amount, receipt } = await req.json()
  
  const razorpay = new Razorpay({
    key_id: Deno.env.get("RAZORPAY_KEY_ID"),
    key_secret: Deno.env.get("RAZORPAY_SECRET_KEY")
  })
  
  const order = await razorpay.orders.create({
    amount: amount,
    currency: "INR",
    receipt: receipt
  })
  
  return new Response(JSON.stringify(order), {
    headers: { "Content-Type": "application/json" }
  })
})
```

## 📧 Resend API Setup

### Step 1: Create Resend Account
1. Go to [Resend](https://resend.com/)
2. Sign up for a free account
3. Navigate to **API Keys** in dashboard
4. Create a new API key
5. Copy the API key

### Step 2: Verify Domain (Production)
1. In Resend dashboard, go to **Domains**
2. Add your domain
3. Configure DNS records as instructed
4. Once verified, update the `from` email in `src/services/razorpay.js`:
   ```javascript
   from: 'Arty Affairs <orders@yourdomain.com>', // Replace with your verified domain
   ```

### Step 3: Configure in Your Project
1. Add `VITE_RESEND_API_KEY` to your `.env` file
2. Add `VITE_ADMIN_EMAIL` with the admin's email address

### Step 4: Test Email Sending

The email will be sent automatically when:
- A payment is successful
- Order is created in database
- Admin receives notification with order details

## 📝 Payment Flow

1. **User clicks "Buy Now" or "Proceed to Checkout"**
   - Cart items are validated
   - User authentication is checked

2. **Razorpay Order Creation**
   - Order is created (currently frontend, should be backend in production)
   - Order details are prepared

3. **Razorpay Payment Modal**
   - User enters payment details
   - Payment is processed by Razorpay

4. **Payment Handler**
   - Payment signature is verified (basic validation on frontend, should be backend)
   - Order is saved to database
   - Artwork quantities are updated
   - Cart is cleared

5. **Admin Notification**
   - Email is sent to admin using Resend API
   - Email contains order details, customer info, and payment details

6. **Success/Error Handling**
   - User receives success/error notifications
   - Order confirmation shown

## 🔒 Security Recommendations

### For Production:

1. **Move Order Creation to Backend**
   - Never expose Razorpay Secret Key
   - Use Supabase Edge Functions or your own API

2. **Verify Payment Signatures on Backend**
   - Use Razorpay's signature verification utility
   - Verify before marking payment as successful

3. **Set Up Webhooks**
   - Configure Razorpay webhooks for payment status updates
   - Handle payment failures, refunds, etc.

4. **Environment Variables**
   - Never commit `.env` files to git
   - Use secure environment variable storage in deployment platform

## 🧪 Testing

### Test Mode:
- Use Razorpay Test Keys
- Use test card numbers from Razorpay documentation
- Test payment success and failure scenarios

### Test Cards (Razorpay):
- **Success**: 4111 1111 1111 1111
- **Failure**: Any other card number
- CVV: Any 3 digits
- Expiry: Any future date

## 📧 Email Template

The admin notification email includes:
- Order ID and Payment ID
- Customer details (name, email)
- Order items table (artwork, artist, quantity, price)
- Total amount
- Order date

## 🐛 Troubleshooting

### Payment not processing?
- Check Razorpay Key ID is correct
- Verify Razorpay SDK loaded (check browser console)
- Check network tab for API errors

### Emails not sending?
- Verify Resend API key is correct
- Check Resend dashboard for email logs
- Verify domain is verified (for production)
- Check browser console for errors

### "Please login to proceed" error?
- Verify user session exists
- Check AuthContext is properly initialized
- Clear localStorage and try again

### Orders not saving?
- Check Supabase RLS policies allow inserts
- Verify user_id matches authenticated user
- Check database logs in Supabase dashboard

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Resend Documentation](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## ✅ Checklist

Before going to production:

- [ ] Replace test Razorpay keys with live keys
- [ ] Move order creation to backend/Edge Function
- [ ] Implement proper signature verification
- [ ] Verify Resend domain
- [ ] Update `from` email address
- [ ] Set up webhooks for payment status
- [ ] Test complete payment flow
- [ ] Test email notifications
- [ ] Configure error handling and logging

