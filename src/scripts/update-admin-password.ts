import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
});

async function updatePassword() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  const email = 'krishnadev2506@mail.com';
  const newPassword = 'AdminPassword123!';

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);

  const admin = await AdminUser.findOne({ email });
  if (!admin) {
    console.error(`Admin user ${email} not found!`);
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  admin.passwordHash = passwordHash;
  await admin.save();

  console.log(`Password updated successfully for ${email}`);
  await mongoose.disconnect();
}

updatePassword().catch(err => {
  console.error('Update error:', err);
  process.exit(1);
});
