#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Arty Affairs Enhanced E-commerce Website...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'supabase-config.env');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📄 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please update the Razorpay keys in .env file\n');
  } else {
    console.log('❌ supabase-config.env file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('📋 Next Steps:');
console.log('1. Update your Razorpay API keys in .env file');
console.log('2. Run the Supabase setup SQL script in your Supabase dashboard');
console.log('3. Start the development server with: npm run dev');
console.log('\n🎉 Setup complete! Your enhanced Arty Affairs website is ready!');

console.log('\n🔗 Important Links:');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Razorpay Dashboard: https://dashboard.razorpay.com');
console.log('- Local Development: http://localhost:3000');

console.log('\n📚 Documentation:');
console.log('- Enhanced Setup Guide: ENHANCED_SETUP_GUIDE.md');
console.log('- Supabase Setup: SUPABASE_SETUP_GUIDE.md');
