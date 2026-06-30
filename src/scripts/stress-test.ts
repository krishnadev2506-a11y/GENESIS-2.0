import crypto from 'crypto';

const API_URL = 'http://localhost:3000/api/register';
const NUM_TEAMS = 100;
const BATCH_SIZE = 10;

async function registerTeam(index: number) {
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const teamName = `Stress Test Team ${index} ${randomSuffix}`;
  
  const payload = {
    teamName,
    college: "Stress Test Institute",
    semester: "6th",
    contactNumber: "9876543210",
    email: `stresstest${index}_${randomSuffix}@test.com`,
    foodPreference: "veg",
    members: [
      { name: "Member 1", role: "Frontend", email: `m1_${randomSuffix}@test.com`, phone: "9876543210" },
      { name: "Member 2", role: "Backend", email: `m2_${randomSuffix}@test.com`, phone: "9876543210" },
      { name: "Member 3", role: "Design", email: `m3_${randomSuffix}@test.com`, phone: "9876543210" },
      { name: "Member 4", role: "AI", email: `m4_${randomSuffix}@test.com`, phone: "9876543210" },
    ],
    paymentScreenshotUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    paymentScreenshotPublicId: "sample",
    transactionId: `TXN${randomSuffix.toUpperCase()}`
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
  console.log(`Starting stress test: Registering ${NUM_TEAMS} teams in batches of ${BATCH_SIZE}...`);
  
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

    console.log(`Progress: ${Math.min(i + BATCH_SIZE, NUM_TEAMS)} / ${NUM_TEAMS} completed.`);
  }

  const totalTime = Date.now() - startTime;
  const avgTime = results.times.length ? results.times.reduce((a, b) => a + b, 0) / results.times.length : 0;

  console.log('\n--- STRESS TEST RESULTS ---');
  console.log(`Total Time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`Successful Registrations: ${results.success}`);
  console.log(`Failed Registrations: ${results.failed}`);
  if (results.success > 0) {
    console.log(`Average API Response Time: ${Math.round(avgTime)}ms`);
    console.log(`Max API Response Time: ${Math.max(...results.times)}ms`);
    console.log(`Min API Response Time: ${Math.min(...results.times)}ms`);
  }
  if (results.failed > 0) {
    console.log(`Errors encountered:`, results.errors);
  }
}

runStressTest().catch(console.error);
