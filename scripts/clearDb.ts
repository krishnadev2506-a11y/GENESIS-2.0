import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearDb() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  // Clear Teams
  const teamResult = await mongoose.connection.collection('teams').deleteMany({});
  console.log(`Deleted ${teamResult.deletedCount} teams.`);
  
  // Clear Users (except admin)
  const userResult = await mongoose.connection.collection('users').deleteMany({ role: { $ne: 'admin' } });
  console.log(`Deleted ${userResult.deletedCount} non-admin users.`);
  
  // Clear Audit Logs
  const auditResult = await mongoose.connection.collection('auditlogs').deleteMany({});
  console.log(`Deleted ${auditResult.deletedCount} audit logs.`);
  
  console.log('Database cleared successfully!');
  await mongoose.disconnect();
}

clearDb().catch(console.error);
