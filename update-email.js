const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function updateEmail() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const result = await db.collection('adminusers').updateOne(
    { email: 'krishnadev2506@mail.com' },
    { $set: { email: 'krishnadev2506@gmail.com' } }
  );
  if (result.modifiedCount > 0) {
    console.log('Email successfully updated to @gmail.com!');
  } else {
    // Check if it already exists
    const existing = await db.collection('adminusers').findOne({ email: 'krishnadev2506@gmail.com' });
    if (existing) {
      console.log('Email is already krishnadev2506@gmail.com');
    } else {
      console.log('User not found to update.');
    }
  }
  process.exit(0);
}
updateEmail();
