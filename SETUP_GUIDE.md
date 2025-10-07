# Arty Affairs - Complete Setup Guide

## 🎨 Project Overview

Arty Affairs is a premium e-commerce website for art sales with the following features:

- **Theme**: Primary color #306b59 (teal-green) with white secondary
- **Authentication**: Supabase Auth with role-based access (Admin/Customer)
- **Admin Dashboard**: CRM-style dashboard for order and artwork management
- **Payment**: Razorpay integration for secure payments
- **Database**: Supabase with real-time updates

## 🔑 Admin Credentials

- **Email**: `asadmohammed181105@gmail.com`
- **Password**: `123456789`
- **Role**: Admin (automatically assigned)

## 📋 Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn
3. Supabase account
4. Razorpay account (for payments)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment file and add your credentials:

```bash
cp supabase-config.env .env
```

Update `.env` with your actual values:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### 3. Database Setup

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase-schema.sql` to create all tables and policies

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🗄️ Database Schema

### Tables Created:

1. **users** - User accounts and roles
2. **admin_emails** - Admin access control
3. **artworks** - Artwork catalog
4. **orders** - Customer orders
5. **cart** - Shopping cart items

### Key Features:

- Row Level Security (RLS) enabled
- Automatic role assignment based on email
- Real-time updates via Supabase subscriptions
- Automatic artwork status updates when sold

## 🎯 Authentication Flow

### Admin Login:
1. Use credentials: `asadmohammed181105@gmail.com` / `123456789`
2. Automatically redirected to `/admin-dashboard`
3. Full access to all admin features

### Customer Registration/Login:
1. Any other email becomes a customer
2. Redirected to homepage after login
3. Access to shopping and orders only

## 🛒 E-commerce Features

### For Customers:
- Browse artworks by category
- Add items to cart
- Secure checkout with Razorpay
- Order history tracking
- Real-time stock updates

### For Admins:
- **Orders Management**: View, track, and mark orders as dispatched
- **Artwork Management**: Add, edit, and manage artwork availability
- **User Overview**: View all customers and their activity
- **Analytics**: Order statistics and performance metrics

## 💳 Payment Integration

### Razorpay Setup:
1. Create Razorpay account
2. Get API keys from dashboard
3. Add keys to environment variables
4. Test with Razorpay test mode

### Payment Flow:
1. Customer adds items to cart
2. Proceeds to checkout
3. Razorpay payment modal opens
4. After successful payment:
   - Order created in database
   - Stock quantities updated
   - Cart cleared
   - Confirmation shown

## 🎨 Theme & Styling

### Color Palette:
- **Primary**: #306b59 (teal-green)
- **Secondary**: #FFFFFF (white)
- Applied consistently across all components

### Components Updated:
- Navigation bar
- Buttons and forms
- Cards and modals
- Admin dashboard
- All interactive elements

## 🔧 Key Components

### Authentication:
- `AuthContext` - Handles login/logout and role management
- `RouteGuards` - Protects admin routes
- `AuthModal` - Login/signup interface

### Admin Dashboard:
- `AdminDashboard` - Main CRM interface
- Sidebar navigation
- Real-time data updates
- Order and artwork management

### E-commerce:
- `CartStore` - Shopping cart state management
- `CartModal` - Cart interface with checkout
- `ArtworkCard` - Individual artwork display
- `RazorpayService` - Payment processing

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Secure payment processing
- Input validation and sanitization

## 🚀 Deployment

### Build for Production:
```bash
npm run build
```

### Environment Variables for Production:
- Ensure all environment variables are set
- Use production Razorpay keys
- Configure Supabase production settings

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication not working**:
   - Check Supabase URL and keys
   - Verify RLS policies are set up
   - Check browser console for errors

2. **Payment not processing**:
   - Verify Razorpay keys are correct
   - Check network connectivity
   - Ensure Razorpay script loads

3. **Admin access denied**:
   - Verify admin email in database
   - Check role assignment logic
   - Clear browser cache and cookies

4. **Database connection issues**:
   - Verify Supabase credentials
   - Check table permissions
   - Review RLS policies

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables
3. Ensure database schema is properly set up
4. Test with the provided admin credentials

## 🔄 Updates & Maintenance

### Regular Tasks:
- Monitor order status updates
- Manage artwork inventory
- Review user registrations
- Update payment settings as needed

### Database Maintenance:
- Regular backups via Supabase
- Monitor RLS policy performance
- Update admin email list as needed

---

**Note**: This is a production-ready e-commerce platform with full authentication, payment processing, and admin management capabilities. All security best practices are implemented.
