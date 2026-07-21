const fs = require('fs');

function parseAndLog(filename, label) {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  console.log(`\n=== ${label} ===`);
  console.log("CATEGORIES:");
  Object.entries(data.categories).forEach(([key, category]) => {
    console.log(`  ${category.title}: ${Math.round(category.score * 100)}%`);
  });
  
  console.log("\nPERFORMANCE METRICS:");
  if (data.categories.performance && data.categories.performance.auditRefs) {
    data.categories.performance.auditRefs.forEach(ref => {
      const audit = data.audits[ref.id];
      if (audit && (audit.scoreDisplayMode === 'numeric' || audit.scoreDisplayMode === 'metric')) {
        console.log(`  ${audit.title}: ${audit.displayValue}`);
      }
    });
  }
  
  console.log("\nOPPORTUNITIES:");
  Object.values(data.audits).filter(a => a.score !== null && a.score < 1 && a.details?.type === 'opportunity').sort((a, b) => (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0)).forEach(opp => {
    console.log(`  ${opp.title} - Savings: ${opp.details.overallSavingsMs}ms (Est. Score: ${opp.scoreDisplayMode === 'numeric' ? Math.round(opp.score*100) : opp.score})`);
  });
}

parseAndLog('lighthouse-mobile.json', 'Mobile Lighthouse Scores');
parseAndLog('lighthouse-desktop.json', 'Desktop Lighthouse Scores');
