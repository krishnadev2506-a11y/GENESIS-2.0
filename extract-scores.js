const fs = require('fs');

function extractScores(filename) {
  if (!fs.existsSync(filename)) return null;
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const categories = data.categories;
  const audits = data.audits;
  
  return {
    performance: Math.round(categories.performance?.score * 100),
    accessibility: Math.round(categories.accessibility?.score * 100),
    bestPractices: Math.round(categories['best-practices']?.score * 100),
    seo: Math.round(categories.seo?.score * 100),
    metrics: {
      LCP: audits['largest-contentful-paint']?.displayValue,
      INP: audits['interactive']?.displayValue || audits['interaction-to-next-paint']?.displayValue,
      CLS: audits['cumulative-layout-shift']?.displayValue,
      TTFB: audits['server-response-time']?.displayValue,
      TBT: audits['total-blocking-time']?.displayValue,
      SpeedIndex: audits['speed-index']?.displayValue
    }
  };
}

console.log('Mobile:', JSON.stringify(extractScores('lighthouse-mobile.json'), null, 2));
console.log('Desktop:', JSON.stringify(extractScores('lighthouse-desktop.json'), null, 2));
