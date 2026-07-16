import crypto from 'crypto';

const API_URL = 'http://localhost:3000/api/register';
const NUM_TEAMS = 100;
const BATCH_SIZE = 10;

async function registerTeam(index: number) {
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const teamName = `Stress Test Team ${index} ${randomSuffix}`;
  
  const payload = {
    teamName,
    college: "Stress Test Institute of Technology",
    semester: "6th",
    contactNumber: "9876543210",
    email: `stresstest${index}_${randomSuffix}@test.com`,
    foodPreference: "veg",
    members: [
      // Bug fix: all required fields are now included per teamMemberSchema
      {
        name: "Member One",
        role: "Leader",
        email: `m1_${randomSuffix}@test.com`,
        phone: "9876543210",
        college: "Stress Test Institute of Technology",
        semester: "6th",
        foodPreference: "veg",
        isLeader: true
      },
      {
        name: "Member Two",
        role: "Member",
        email: `m2_${randomSuffix}@test.com`,
        phone: "9876543211",
        college: "Stress Test Institute of Technology",
        semester: "6th",
        foodPreference: "veg",
        isLeader: false
      },
      {
        name: "Member Three",
        role: "Member",
        email: `m3_${randomSuffix}@test.com`,
        phone: "9876543212",
        college: "Stress Test Institute of Technology",
        semester: "5th",
        foodPreference: "non-veg",
        isLeader: false
      },
      {
        name: "Member Four",
        role: "Member",
        email: `m4_${randomSuffix}@test.com`,
        phone: "9876543213",
        college: "Stress Test Institute of Technology",
        semester: "4th",
        foodPreference: "veg",
        isLeader: false
      },
    ],
    paymentScreenshotUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    paymentScreenshotPublicId: "sample",
    transactionId: `TXN${randomSuffix.toUpperCase().slice(0, 12)}`
  };

  try {
    const start = Date.now();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    const duration = Date.now() - start;

    if (res.ok) {
      return { success: true, duration, teamId: data.teamId };
    } else {
      return { success: false, duration, error: data.error };
    }
  } catch (error: any) {
    return { success: false, duration: 0, error: error.message };
  }
}

async function runStressTest() {
  console.log(`\n🚀 Starting stress test: Registering ${NUM_TEAMS} teams in batches of ${BATCH_SIZE}...`);
  
  const results = {
    total: NUM_TEAMS,
    success: 0,
    failed: 0,
    times: [] as number[],
    errors: {} as Record<string, number>
  };

  const startTime = Date.now();

  for (let i = 0; i < NUM_TEAMS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && (i + j) < NUM_TEAMS; j++) {
      batch.push(registerTeam(i + j));
    }

    const batchResults = await Promise.all(batch);
    
    batchResults.forEach(res => {
      if (res.success) {
        results.success++;
        results.times.push(res.duration);
      } else {
        results.failed++;
        const err = res.error || 'Unknown Error';
        results.errors[err] = (results.errors[err] || 0) + 1;
      }
    });

    const done = Math.min(i + BATCH_SIZE, NUM_TEAMS);
    const pct = Math.round((done / NUM_TEAMS) * 100);
    console.log(`  Progress: ${done}/${NUM_TEAMS} (${pct}%) — Success: ${results.success} | Failed: ${results.failed}`);
  }

  const totalTime = Date.now() - startTime;
  const avgTime = results.times.length
    ? results.times.reduce((a, b) => a + b, 0) / results.times.length
    : 0;

  console.log('\n--- STRESS TEST RESULTS ---');
  console.log(`Total Time:               ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`Successful Registrations: ${results.success} / ${NUM_TEAMS}`);
  console.log(`Failed Registrations:     ${results.failed} / ${NUM_TEAMS}`);
  if (results.success > 0) {
    console.log(`Average Response Time:    ${Math.round(avgTime)}ms`);
    console.log(`Max Response Time:        ${Math.max(...results.times)}ms`);
    console.log(`Min Response Time:        ${Math.min(...results.times)}ms`);
  }
  if (results.failed > 0) {
    console.log(`\nErrors encountered:`);
    Object.entries(results.errors).forEach(([err, count]) => {
      console.log(`  [${count}x] ${err}`);
    });
  }
}

runStressTest().catch(console.error);
