# Enhanced Arty Affairs - Complete Setup Guide

## 🚀 **What's New in the Enhanced Version**

The Arty Affairs website has been completely enhanced with:

### ✅ **Complete Admin System**
- **Admin Dashboard** with order tracking and artwork management
- **Role-based Access Control** - Only admins can access admin features
- **Order Management** - Track orders, mark as dispatched, view payment status
- **Enhanced Artwork Upload** - Admin-only upload with quantity tracking

### ✅ **Authentication System**
- **User Registration & Login** with Supabase Auth
- **Role Management** - Admin and Customer roles
- **Protected Routes** - Role-based page access
- **User Profiles** - Personal information management

### ✅ **E-commerce Features**
- **Shopping Cart** with real-time updates
- **Razorpay Payment Integration** - Secure payment processing
- **Order History** - Users can view their purchase history
- **Inventory Management** - Track available quantities

### ✅ **Real-time Features**
- **Live Cart Updates** - Instant cart synchronization
- **Order Status Tracking** - Real-time order updates
- **Payment Verification** - Secure payment confirmation
- **Stock Management** - Automatic quantity updates

## 📋 **Setup Instructions**

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in your project root with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ibgztilnaecjexshxmrz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3p0aWxuYWVjamV4c2h4bXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEzMTIsImV4cCI6MjA3MzI1NzMxMn0.BXVkSNLdZb6y6SyzBGIcr7MiFDsjUwY9LU01dJwmGRo

# Razorpay Configuration (Get from Razorpay Dashboard)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### Step 3: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to execute the script

This creates:
- ✅ `users` table with admin/customer roles
- ✅ Enhanced `artworks` table with quantity tracking
- ✅ `orders` table for order management
- ✅ `cart` table for shopping cart
- ✅ Storage bucket for images
- ✅ Sample data for testing

### Step 4: Razorpay Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the dashboard
3. Add them to your `.env` file
4. Configure webhook endpoints (optional for production)

### Step 5: Start Development

```bash
npm run dev
```

## 🎯 **Key Features Overview**

### **Admin Dashboard** (`/admin`)
- **Order Tracking**: View all orders with customer details
- **Payment Verification**: Check Razorpay payment status
- **Order Management**: Mark orders as dispatched
- **Artwork Upload**: Add new artworks with quantity tracking
- **Access Control**: Only admin users can access

### **User Authentication**
- **Registration**: Users can create accounts with roles
- **Login/Logout**: Secure authentication system
- **Profile Management**: User information and preferences
- **Role-based Access**: Different features for admin/customer

### **Shopping Cart System**
- **Add to Cart**: Real-time cart updates
- **Quantity Management**: Increase/decrease item quantities
- **Cart Persistence**: Cart saved across sessions
- **Checkout Process**: Integrated with Razorpay

### **Order Management**
- **Order Placement**: Only after successful payment
- **Order Tracking**: Users can view order status
- **Payment Integration**: Razorpay payment gateway
- **Admin Oversight**: Complete order management

### **Enhanced Artwork Management**
- **Quantity Tracking**: Track available quantities
- **Status Management**: Available/Sold status
- **Category System**: Original, Resin Art, Giftable, Bouquet
- **Real-time Updates**: Instant availability updates

## 🔐 **User Roles & Permissions**

### **Admin Users**
- ✅ Access Admin Dashboard
- ✅ Upload and manage artworks
- ✅ Track and manage orders
- ✅ View payment statuses
- ✅ Mark orders as dispatched

### **Customer Users**
- ✅ Browse and purchase artworks
- ✅ Manage shopping cart
- ✅ View order history
- ✅ Track order status
- ✅ Update profile information

## 💳 **Payment Integration**

### **Razorpay Features**
- ✅ Secure payment processing
- ✅ Multiple payment methods
- ✅ Payment verification
- ✅ Order confirmation
- ✅ Failed payment handling

### **Order Flow**
1. User adds items to cart
2. Proceeds to checkout
3. Razorpay payment gateway opens
4. Payment verification
5. Order created in database
6. Admin can track and dispatch

## 📱 **Responsive Design**

- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop enhancement
- ✅ Touch-friendly interface
- ✅ Fast loading times

## 🚀 **Production Deployment**

### **Environment Variables**
Ensure all environment variables are set in your production environment:
- Supabase URL and keys
- Razorpay API keys
- Any additional configurations

### **Database Security**
- Row Level Security (RLS) enabled
- Proper user permissions
- Secure API endpoints

### **Payment Security**
- Razorpay webhook verification
- Secure payment processing
- PCI compliance

## 🧪 **Testing the System**

### **Admin Testing**
1. Create an admin account
2. Login and access `/admin`
3. Upload test artworks
4. Create test orders
5. Verify order tracking

### **Customer Testing**
1. Create a customer account
2. Browse artworks
3. Add items to cart
4. Complete purchase with Razorpay
5. Check order history

### **Payment Testing**
- Use Razorpay test mode
- Test successful payments
- Test failed payments
- Verify order creation

## 📞 **Support & Troubleshooting**

### **Common Issues**
1. **Authentication Errors**: Check Supabase configuration
2. **Payment Failures**: Verify Razorpay keys
3. **Database Errors**: Ensure proper table setup
4. **Image Upload Issues**: Check storage permissions

### **Getting Help**
- Check browser console for errors
- Verify environment variables
- Test database connections
- Review Razorpay logs

## 🎉 **Congratulations!**

Your enhanced Arty Affairs e-commerce platform is now ready with:
- ✅ Complete admin system
- ✅ User authentication
- ✅ Shopping cart functionality
- ✅ Razorpay payment integration
- ✅ Real-time order tracking
- ✅ Role-based access control

The platform is now a fully functional e-commerce website with professional-grade features!

---

**Arty Affairs** - Where Art Meets Passion & Technology! 🎨💻
