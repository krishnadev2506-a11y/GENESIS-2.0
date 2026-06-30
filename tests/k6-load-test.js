import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration for the load test
export const options = {
  stages: [
    { duration: '5s', target: 20 },  // Ramp-up to 20 users over 5 seconds
    { duration: '15s', target: 20 }, // Stay at 20 users for 15 seconds
    { duration: '5s', target: 0 },   // Ramp-down to 0 users over 5 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function loadTestScenario() {
  // Test the main admin dashboard page (HTML render)
  const dashboardRes = http.get(`${BASE_URL}/admin`);
  
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard loaded within limits': (r) => r.timings.duration < 1000,
  });

  // Short pause to simulate user reading
  sleep(1);

  // Test one of the scaffolded routes
  const teamsRes = http.get(`${BASE_URL}/admin/teams`);
  check(teamsRes, {
    'teams page status is 200 (not 404)': (r) => r.status === 200,
  });

  // Test the admin stats API directly
  // Note: Usually requires auth token in headers, but for basic load testing we check response times 
  // (it will likely return 401 Unauthorized if not passing cookies, which is still a valid load test of the middleware).
  const statsRes = http.get(`${BASE_URL}/api/admin/stats`);
  check(statsRes, {
    'stats API responds quickly': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}


