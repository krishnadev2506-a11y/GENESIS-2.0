const { spawn, execSync } = require('child_process');

async function run() {
  console.log('Starting Next.js production server...');
  const server = spawn('npm', ['start', '--', '-p', '3001'], { stdio: 'inherit', shell: true });
  
  // wait 5 seconds for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    console.log('Running mobile audit...');
    execSync('npx --yes lighthouse http://localhost:3001 --output=json --output-path=lighthouse-mobile.json --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless"', { stdio: 'inherit' });
    
    console.log('Running desktop audit...');
    execSync('npx --yes lighthouse http://localhost:3001 --output=json --output-path=lighthouse-desktop.json --only-categories=performance,accessibility,best-practices,seo --preset=desktop --chrome-flags="--headless"', { stdio: 'inherit' });
  } catch (err) {
    console.error('Lighthouse audit failed:', err);
  } finally {
    console.log('Killing server...');
    server.kill();
    process.exit(0);
  }
}
run();
