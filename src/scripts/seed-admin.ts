import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup minimal schema here to avoid dependency issues in script
const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
});

const SettingsSchema = new mongoose.Schema({
  eventDate: { type: Date, default: new Date('2026-07-10T00:00:00Z') },
  eventEndDate: { type: Date, default: new Date('2026-07-11T23:59:59Z') },
  entryFee: { type: Number, default: 600 },
  extraMemberFee: { type: Number, default: 125 },
});

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
  const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

  // 1. Seed Admin
  const adminEmail = 'krishnadev2506@mail.com';
  const adminPass = 'AdminPassword123!';
  
  const existingAdmin = await AdminUser.findOne({ email: adminEmail });
  
  if (existingAdmin) {
    console.log(`Admin user ${adminEmail} already exists. Updating password...`);
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPass, salt);
    existingAdmin.passwordHash = passwordHash;
    await existingAdmin.save();
    console.log('Admin password updated successfully.');
  } else {
    console.log(`Creating admin user ${adminEmail}...`);
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPass, salt);
    
    await AdminUser.create({
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'admin',
    });
    console.log('Admin user created successfully.');
  }

  // 2. Ensure Settings exist
  const settings = await Settings.findOne();
  if (!settings) {
    console.log('Creating default Settings...');
    await Settings.create({});
    console.log('Default Settings created.');
  } else {
    console.log('Settings already exist.');
  }

  console.log('Seed completed successfully.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
