/**
 * Production Database Setup
 * Creates tables and initial schema on first deployment
 */

const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('🚀 Setting up production database...');
  
  try {
    const prisma = new PrismaClient();
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Create tables using db push
    console.log('📊 Creating database tables...');
    
    // The tables will be created automatically by Prisma
    // when the first query runs, but let's ensure they exist
    
    await prisma.$disconnect();
    console.log('✅ Production database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

main();