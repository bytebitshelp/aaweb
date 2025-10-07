// Quick Authentication Test Script
// Run this in your browser console after creating .env file

console.log('🔍 Testing Arty Affairs Authentication Setup...');

// Test 1: Check if environment variables are loaded
console.log('📋 Test 1: Environment Variables');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');

// Test 2: Check Supabase connection
console.log('\n📋 Test 2: Supabase Connection');
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client is available');
  
  // Test database connection
  window.supabase.from('users').select('count').then(result => {
    if (result.error) {
      console.log('❌ Database connection failed:', result.error.message);
    } else {
      console.log('✅ Database connection successful');
    }
  }).catch(err => {
    console.log('❌ Database connection error:', err);
  });
} else {
  console.log('❌ Supabase client not available');
}

// Test 3: Check if auth context is working
console.log('\n📋 Test 3: Authentication Context');
if (typeof window !== 'undefined' && window.React) {
  console.log('✅ React is available');
} else {
  console.log('❌ React not available');
}

console.log('\n🎯 Manual Tests to Perform:');
console.log('1. Try signing in with: asadmohammed181105@gmail.com / 123456789');
console.log('2. Check if you get redirected to admin dashboard');
console.log('3. Verify admin navigation items are visible');
console.log('4. Test sign out functionality');

console.log('\n📝 If authentication fails, check:');
console.log('- .env file exists and has correct content');
console.log('- Admin user exists in Supabase Auth');
console.log('- Admin email is in admin_emails table');
console.log('- Database tables are created');
