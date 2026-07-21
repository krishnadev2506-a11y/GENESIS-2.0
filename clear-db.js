const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function clearDb() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Clearing collections...');
    
    const db = mongoose.connection.db;
    
    // Clear teams, deletedteams, auditlogs, etc.
    const collectionsToClear = ['teams', 'deletedteams', 'auditlogs'];
    
    for (const name of collectionsToClear) {
      const collectionExists = await db.listCollections({ name }).hasNext();
      if (collectionExists) {
        const result = await db.collection(name).deleteMany({});
        console.log(`Cleared ${result.deletedCount} documents from ${name}`);
      } else {
        console.log(`Collection ${name} does not exist, skipping.`);
      }
    }
    
    console.log('Database successfully cleared of all team data!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to clear database:', err);
    process.exit(1);
  }
}

clearDb();
