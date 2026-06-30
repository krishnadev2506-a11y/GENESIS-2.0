import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import Team from '../models/Team';

async function runTeardown() {
  try {
    await connectDB();
    console.log('Connected to MongoDB.');

    const result = await Team.deleteMany({
      teamName: { $regex: /^Stress Test Team/i }
    });

    console.log(`Successfully deleted ${result.deletedCount} stress test teams.`);
  } catch (error) {
    console.error('Error during teardown:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runTeardown();
