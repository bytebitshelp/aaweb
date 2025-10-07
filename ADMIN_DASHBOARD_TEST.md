# Admin Dashboard Testing Guide

## 🎯 Admin Dashboard Requirements Verification

### ✅ **Authentication & Access Control**

**Test Admin Login:**
1. Go to the website
2. Click on the user icon in the navbar
3. Enter credentials:
   - **Email**: `asadmohammed181105@gmail.com`
   - **Password**: `123456789`
4. **Expected Result**: Automatically redirected to `/admin-dashboard`

**Test Role-Based Access:**
1. Try accessing `/admin-dashboard` without login
2. **Expected Result**: Redirected to homepage
3. Login as a regular customer (any other email)
4. Try accessing `/admin-dashboard`
5. **Expected Result**: Access denied, redirected to homepage

### ✅ **Admin Dashboard Layout**

**Sidebar Navigation:**
- [ ] **Orders Management** tab
- [ ] **Artwork Management** tab  
- [ ] **User Overview** tab
- [ ] **Analytics** tab

**Header Section:**
- [ ] Welcome message with admin name
- [ ] Stats cards showing:
  - Total Orders
  - Total Revenue
  - Total Artworks
  - Total Users
  - Pending Orders
  - Paid Orders

### ✅ **Orders Management Section**

**Order Table Columns:**
- [ ] Order ID (truncated)
- [ ] Customer Name & Email
- [ ] Artwork Title & Artist
- [ ] Total Amount
- [ ] Payment Status (Pending/Paid/Failed)
- [ ] Order Status (Pending/Dispatched)
- [ ] Actions column

**Functionality:**
- [ ] View all orders in real-time
- [ ] Filter orders by status
- [ ] Mark orders as "Dispatched" (only for paid orders)
- [ ] Real-time updates when orders change

### ✅ **Artwork Management Section**

**Artwork Table Columns:**
- [ ] Artwork Image & Title
- [ ] Artist Name
- [ ] Category (Original/Resin/Giftable/Bouquet)
- [ ] Price
- [ ] Quantity Available
- [ ] Status (Available/Sold)
- [ ] Actions column

**Functionality:**
- [ ] View all artworks
- [ ] Toggle artwork availability (Available ↔ Sold)
- [ ] "Add Artwork" button redirects to upload form
- [ ] Real-time updates when artwork status changes

### ✅ **User Overview Section**

**User Table Columns:**
- [ ] User Avatar & Name
- [ ] Email Address
- [ ] Role (Admin/Customer)
- [ ] Join Date
- [ ] Actions (View Orders)

**Functionality:**
- [ ] View all registered users
- [ ] See user roles clearly
- [ ] Access user order history

### ✅ **Analytics Section**

**Order Status Overview:**
- [ ] Pending Orders count
- [ ] Paid Orders count
- [ ] Visual indicators (colored dots)

**Quick Actions:**
- [ ] Manage Artworks button
- [ ] View Orders button
- [ ] Add New Artwork button

### ✅ **Real-Time Updates**

**Test Real-Time Functionality:**
1. Open admin dashboard in one browser tab
2. Open the main site in another tab
3. Place an order as a customer
4. **Expected Result**: Order appears immediately in admin dashboard
5. Mark order as dispatched in admin dashboard
6. **Expected Result**: Status updates immediately

### ✅ **Responsive Design**

**Test on Different Screen Sizes:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Expected Behavior:**
- Sidebar collapses on mobile
- Tables become horizontally scrollable
- All buttons remain accessible
- Stats cards stack properly

### ✅ **Theme Consistency**

**Visual Elements:**
- [ ] Primary color: #44895d (forest-green)
- [ ] Secondary color: #FFFFFF (white)
- [ ] Consistent button styling
- [ ] Proper hover effects
- [ ] Loading states with theme colors

### ✅ **Error Handling**

**Test Error Scenarios:**
1. Try to mark an unpaid order as dispatched
2. **Expected Result**: Only paid orders show dispatch button
3. Test with network disconnected
4. **Expected Result**: Graceful error handling with toast messages

### ✅ **Performance**

**Loading States:**
- [ ] Loading spinner while fetching data
- [ ] Skeleton loading for tables
- [ ] Smooth transitions between tabs
- [ ] Fast response times (< 2 seconds)

## 🧪 **Complete Test Flow**

### **End-to-End Admin Workflow:**

1. **Login as Admin**
   ```
   Email: asadmohammed181105@gmail.com
   Password: 123456789
   ```

2. **View Dashboard Stats**
   - Check all stats cards are populated
   - Verify numbers match actual data

3. **Upload New Artwork**
   - Click "Add Artwork" button
   - Fill form with test data:
     - Artist: Test Artist
     - Title: Test Artwork
     - Category: Original
     - Price: 99.99
     - Quantity: 1
     - Description: Test description
   - Upload an image
   - Submit form
   - **Expected**: Artwork appears in Artwork Management table

4. **Process Customer Order**
   - Login as customer in another tab
   - Add artwork to cart
   - Complete checkout with Razorpay
   - **Expected**: Order appears in Orders Management

5. **Mark Order as Dispatched**
   - In admin dashboard, find the new order
   - Click "Mark Dispatched" button
   - **Expected**: Order status changes to "Dispatched"

6. **Test Artwork Status Update**
   - Go to Artwork Management
   - Mark an original artwork as "Sold"
   - **Expected**: Status updates immediately

## 🐛 **Common Issues & Solutions**

### **Issue: Admin dashboard not loading**
- **Solution**: Check Supabase connection and RLS policies

### **Issue: Orders not showing**
- **Solution**: Verify orders table has proper relationships

### **Issue: Cannot mark order as dispatched**
- **Solution**: Ensure order has payment_status = 'Paid'

### **Issue: Theme colors not applied**
- **Solution**: Clear browser cache and restart dev server

### **Issue: Real-time updates not working**
- **Solution**: Check Supabase subscriptions and network connection

## ✅ **Success Criteria**

The admin dashboard is fully functional when:
- [ ] Admin can login and access dashboard
- [ ] All four sections (Orders, Artworks, Users, Analytics) work
- [ ] Real-time updates function properly
- [ ] Order management workflow is complete
- [ ] Artwork management workflow is complete
- [ ] Responsive design works on all devices
- [ ] Theme is consistent throughout
- [ ] Error handling is graceful
- [ ] Performance is acceptable (< 2s load times)

---

**Note**: This testing guide ensures all admin dashboard requirements are met and functioning correctly.
