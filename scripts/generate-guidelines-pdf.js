const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.resolve(process.cwd(), 'public', 'GENESIS_2.0_Buildathon_Guidelines.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  autoFirstPage: true,
  info: {
    Title: 'GENESIS 2.0 Buildathon Guidelines',
    Author: 'GENESIS 2.0 Organizing Committee',
    Subject: 'Official Buildathon Guidelines and Rules',
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

function addHeader() {
  doc.fontSize(22).font('Helvetica-Bold').text('GENESIS 2.0', { align: 'center' });
  doc.fontSize(14).font('Helvetica-Bold').text('BUILDATHON GUIDELINES', { align: 'center' });
  doc.moveDown(1.5);
}

// ─── PAGE 1 ───
addHeader();

doc.fontSize(14).font('Helvetica-Bold').text('1. Welcome to Genesis 2.0');
doc.moveDown(0.4);
doc.fontSize(11).font('Helvetica-Oblique').text('"Great software isn\'t measured by how many technologies it uses, but by how well it is engineered."');
doc.moveDown(0.6);
doc.fontSize(10.5).font('Helvetica').text('Welcome to Genesis 2.0 Buildathon.');
doc.moveDown(0.5);
doc.text('Genesis is not designed to be another hackathon where teams race to build the maximum number of features.');
doc.moveDown(0.5);
doc.text('Instead, Genesis evaluates participants on their ability to design, develop, deploy, and justify software systems using modern engineering practices.');
doc.moveDown(0.5);
doc.text('Throughout this Buildathon, teams are encouraged to think like software engineers rather than simply developers.');
doc.moveDown(0.5);
doc.text('The competition rewards thoughtful engineering decisions, maintainable code, secure implementations, and scalable architectures.');
doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('Our objective is simple:');
doc.font('Helvetica-Bold').text("Don't just build software. Engineer it.");
doc.moveDown(1.2);

doc.fontSize(14).font('Helvetica-Bold').text('2. Competition Tracks');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('To ensure fair competition, participants compete only within their respective academic year.');
doc.moveDown(0.5);
doc.text('There are three independent tracks:');
doc.moveDown(0.3);
doc.text('  •  Second Year Track — Focuses on software engineering fundamentals.', { indent: 10 });
doc.text('  •  Third Year Track — Focuses on production-ready web applications.', { indent: 10 });
doc.text('  •  Fourth Year Track — Focuses on industry-standard engineering and cloud deployment.', { indent: 10 });
doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('Teams from different academic years will not compete against each other.');
doc.moveDown(1.2);

doc.fontSize(14).font('Helvetica-Bold').text('3. General Technical Requirements');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('These requirements apply to every participating team.');
doc.moveDown(0.8);
doc.fontSize(12).font('Helvetica-Bold').text('3.1 Source Code Management (Mandatory)');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('Git and GitHub are mandatory for every participating team.');

// ─── PAGE 2 ───
doc.addPage();

doc.fontSize(10.5).font('Helvetica').text('The use of GitHub is considered a standard software engineering practice and is therefore required throughout Genesis Buildathon.');
doc.moveDown(0.6);
doc.font('Helvetica-Bold').text('Requirements');
doc.moveDown(0.3);
doc.font('Helvetica');
doc.text('  •  Create a dedicated GitHub repository.', { indent: 10 });
doc.text('  •  Maintain meaningful commit history.', { indent: 10 });
doc.text('  •  Organize the repository professionally.', { indent: 10 });
doc.text('  •  Include a comprehensive README.', { indent: 10 });
doc.text('  •  Use proper .gitignore files.', { indent: 10 });
doc.text('  •  Encourage contributions from all team members.', { indent: 10 });
doc.moveDown(0.8);

doc.font('Helvetica-Bold').text('Judges may inspect:');
doc.moveDown(0.3);
doc.font('Helvetica');
doc.text('  •  Commit history', { indent: 10 });
doc.text('  •  Repository quality', { indent: 10 });
doc.text('  •  Contributor activity', { indent: 10 });
doc.text('  •  Documentation', { indent: 10 });
doc.text('  •  Project organization', { indent: 10 });
doc.moveDown(0.6);
doc.font('Helvetica-Bold').text('Failure to maintain a proper GitHub repository may result in score deductions or disqualification.');
doc.moveDown(1.4);

doc.fontSize(13).font('Helvetica-Bold').text('3.2 Official Development Window');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('To ensure fairness across all teams, implementation must begin only after the official commencement time.');
doc.moveDown(0.8);

doc.font('Helvetica-Bold').text('Official Start');
doc.fontSize(12).font('Helvetica-Bold').text('01 August 2026 — 10:00 PM IST', { indent: 10 });
doc.moveDown(0.6);

doc.fontSize(10.5).font('Helvetica').text('The following must not exist before this time:');
doc.moveDown(0.3);
doc.text('  •  GitHub repository', { indent: 10 });
doc.text('  •  Local project directory', { indent: 10 });
doc.text('  •  Source code', { indent: 10 });
doc.text('  •  Backend implementation', { indent: 10 });
doc.text('  •  Frontend implementation', { indent: 10 });
doc.text('  •  Database implementation', { indent: 10 });
doc.text('  •  Configuration files', { indent: 10 });
doc.text('  •  Project-specific implementation', { indent: 10 });
doc.moveDown(0.6);

doc.text('The organizing committee reserves the right to verify:');

// ─── PAGE 3 ───
doc.addPage();

doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Repository creation timestamps', { indent: 10 });
doc.text('  •  Commit history', { indent: 10 });
doc.text('  •  Local file timestamps', { indent: 10 });
doc.text('  •  Overall project timeline', { indent: 10 });
doc.moveDown(0.6);
doc.font('Helvetica-Bold').text('Any evidence suggesting prior implementation may result in immediate disqualification.');
doc.moveDown(1.2);

doc.fontSize(13).font('Helvetica-Bold').text('4. Application Architecture Expectations');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Genesis encourages participants to build software using modern engineering practices.', { indent: 10 });
doc.text('  •  Teams are expected to develop dedicated frontend and backend applications.', { indent: 10 });
doc.text('  •  Applications should communicate using well-designed APIs such as REST or GraphQL.', { indent: 10 });
doc.text('  •  Participants may choose any programming language or framework unless otherwise specified for their track.', { indent: 10 });
doc.moveDown(1.2);

doc.fontSize(13).font('Helvetica-Bold').text('5. Important Note to Participants');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('The expectations outlined in this handbook may appear ambitious.');
doc.moveDown(0.4);
doc.text('This is intentional. They represent the engineering practices commonly adopted in modern software development.');
doc.moveDown(0.4);
doc.text('However, this handbook is not a mandatory checklist.');
doc.moveDown(0.4);
doc.text('Teams are not expected to implement every technology or practice listed for their track.');
doc.moveDown(0.4);
doc.text('Instead, we encourage participants to:');
doc.moveDown(0.3);
doc.text('  •  Build a functional application first.', { indent: 10 });
doc.text('  •  Focus on correctness before complexity.', { indent: 10 });
doc.text('  •  Gradually adopt additional engineering practices.', { indent: 10 });
doc.text('  •  Learn throughout the Buildathon.', { indent: 10 });
doc.moveDown(0.5);
doc.text('Projects are evaluated relative to other teams competing within the same academic year.');
doc.moveDown(0.4);
doc.text('A project implementing fewer technologies exceptionally well will often outperform one that includes numerous technologies without proper understanding.');
doc.moveDown(0.4);
doc.font('Helvetica-Bold').text('The objective is to build the best-engineered application within your track and not the most complicated one.');
doc.moveDown(1.2);

doc.fontSize(13).font('Helvetica-Bold').text('6. Additional Challenges');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('Genesis is more than an application development competition.');

// ─── PAGE 4 ───
doc.addPage();

doc.fontSize(10.5).font('Helvetica').text('Throughout the event, participants may encounter surprise side quests.');
doc.moveDown(0.4);
doc.text('These challenges will only be revealed during the event.');
doc.moveDown(0.6);

doc.font('Helvetica-Bold').text('They may evaluate:');
doc.moveDown(0.3);
doc.font('Helvetica');
doc.text('  •  Technical aptitude', { indent: 10 });
doc.text('  •  Collaboration', { indent: 10 });
doc.text('  •  Adaptability', { indent: 10 });
doc.text('  •  Communication', { indent: 10 });
doc.text('  •  Engineering skills', { indent: 10 });
doc.text('  •  Problem-solving', { indent: 10 });
doc.moveDown(0.6);

doc.font('Helvetica-Bold').text('Participation may contribute towards:');
doc.moveDown(0.3);
doc.font('Helvetica');
doc.text('  •  Overall evaluation', { indent: 10 });
doc.text('  •  Special recognitions', { indent: 10 });
doc.text('  •  Bonus awards', { indent: 10 });
doc.moveDown(0.6);
doc.font('Helvetica-Bold').text('Stay prepared. Not every challenge will be announced beforehand.');
doc.moveDown(1.4);

doc.fontSize(14).font('Helvetica-Bold').text('7. Track Expectations');
doc.moveDown(0.6);

doc.fontSize(12).font('Helvetica-Bold').text('Second Year Track');
doc.moveDown(0.3);
doc.fontSize(11).font('Helvetica-Bold').text('Objective');
doc.fontSize(10.5).font('Helvetica').text('Build a complete full-stack application demonstrating software engineering fundamentals.');
doc.moveDown(0.6);

doc.fontSize(11).font('Helvetica-Bold').text('Expected');
doc.moveDown(0.3);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Functional full-stack application', { indent: 10 });
doc.text('  •  CRUD operations', { indent: 10 });
doc.text('  •  Authentication', { indent: 10 });
doc.text('  •  Password hashing', { indent: 10 });
doc.text('  •  Database integration', { indent: 10 });
doc.text('  •  Validation', { indent: 10 });
doc.text('  •  Error handling', { indent: 10 });
doc.text('  •  Responsive UI', { indent: 10 });
doc.text('  •  Git & GitHub', { indent: 10 });
doc.text('  •  Environment variables', { indent: 10 });
doc.text('  •  README', { indent: 10 });

// ─── PAGE 5 ───
doc.addPage();

doc.fontSize(11).font('Helvetica-Bold').text('Bonus (Second Year Track)');
doc.moveDown(0.3);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Deployment', { indent: 10 });
doc.text('  •  Search', { indent: 10 });
doc.text('  •  Pagination', { indent: 10 });
doc.text('  •  Image Upload', { indent: 10 });
doc.text('  •  Email Verification', { indent: 10 });
doc.text('  •  Role-Based Authentication', { indent: 10 });
doc.moveDown(1.2);

doc.fontSize(13).font('Helvetica-Bold').text('Third Year Track');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('Everything from Second Year, plus:');
doc.moveDown(0.6);

doc.fontSize(11).font('Helvetica-Bold').text('Deployment');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Vercel', { indent: 10 });
doc.text('  •  Render', { indent: 10 });
doc.text('  •  Railway', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Managed Cloud Database');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  MongoDB Atlas', { indent: 10 });
doc.text('  •  Supabase', { indent: 10 });
doc.text('  •  Neon', { indent: 10 });
doc.text('  •  Railway PostgreSQL', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Cloud Storage');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Cloudinary', { indent: 10 });
doc.text('  •  Firebase', { indent: 10 });
doc.text('  •  Supabase Storage', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Docker');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Docker', { indent: 10 });
doc.text('  •  Docker Compose', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Authentication');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  JWT', { indent: 10 });
doc.text('  •  Refresh Tokens', { indent: 10 });
doc.text('  •  OAuth (Google/GitHub)', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Security');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Rate limiting', { indent: 10 });

// ─── PAGE 6 ───
doc.addPage();

doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Environment variables', { indent: 10 });
doc.text('  •  Password hashing', { indent: 10 });
doc.text('  •  Validation', { indent: 10 });
doc.text('  •  CORS', { indent: 10 });
doc.moveDown(0.8);

doc.fontSize(11).font('Helvetica-Bold').text('Architecture (any standard architecture)');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  MVC', { indent: 10 });
doc.text('  •  Microservices', { indent: 10 });
doc.text('  •  Feature-Based Architecture', { indent: 10 });
doc.moveDown(1.2);

doc.fontSize(13).font('Helvetica-Bold').text('Fourth Year Track');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('Everything from Third Year, plus:');
doc.moveDown(0.6);

doc.fontSize(11).font('Helvetica-Bold').text('Cloud Infrastructure — AWS (or equivalent)');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  EC2', { indent: 10 });
doc.text('  •  Elastic Beanstalk', { indent: 10 });
doc.text('  •  ECS', { indent: 10 });
doc.text('  •  App Runner', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Database');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Amazon RDS', { indent: 10 });
doc.text('  •  Aurora', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Storage');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Amazon S3', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('DevOps');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Docker', { indent: 10 });
doc.text('  •  Docker Compose', { indent: 10 });
doc.text('  •  CI/CD', { indent: 10 });
doc.text('  •  GitHub Actions', { indent: 10 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Security');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Secure Authentication', { indent: 10 });
doc.text('  •  Secure Cookies', { indent: 10 });
doc.text('  •  RBAC', { indent: 10 });
doc.text('  •  HTTPS', { indent: 10 });
doc.text('  •  Secrets Management', { indent: 10 });

// ─── PAGE 7 ───
doc.addPage();

doc.fontSize(11).font('Helvetica-Bold').text('Performance');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Caching', { indent: 10 });
doc.text('  •  Pagination', { indent: 10 });
doc.text('  •  Query Optimisation', { indent: 10 });
doc.text('  •  Lazy Loading', { indent: 10 });
doc.moveDown(0.8);

doc.fontSize(11).font('Helvetica-Bold').text('Engineering — Teams should justify:');
doc.moveDown(0.2);
doc.fontSize(10.5).font('Helvetica');
doc.text('  •  Database selection', { indent: 10 });
doc.text('  •  Cloud architecture', { indent: 10 });
doc.text('  •  Deployment strategy', { indent: 10 });
doc.text('  •  Authentication', { indent: 10 });
doc.text('  •  Performance', { indent: 10 });
doc.text('  •  Scalability', { indent: 10 });
doc.moveDown(1.2);

doc.fontSize(14).font('Helvetica-Bold').text('8. Evaluation Philosophy');
doc.moveDown(0.4);
doc.fontSize(10.5).font('Helvetica').text('Genesis evaluates software engineering, not technology count.');
doc.moveDown(0.6);

doc.font('Helvetica-Bold').text('Judges will assess:');
doc.moveDown(0.3);
doc.font('Helvetica');
doc.text('  •  Correct implementation', { indent: 10 });
doc.text('  •  Code quality', { indent: 10 });
doc.text('  •  Architecture', { indent: 10 });
doc.text('  •  Security', { indent: 10 });
doc.text('  •  Deployment', { indent: 10 });
doc.text('  •  Engineering practices', { indent: 10 });
doc.text('  •  Technical understanding', { indent: 10 });
doc.text('  •  Maintainability', { indent: 10 });
doc.moveDown(0.6);

doc.font('Helvetica').text('Using additional technologies does not automatically result in higher scores.');
doc.moveDown(0.6);

doc.font('Helvetica-Bold').text('Projects will be evaluated based on:');
doc.moveDown(0.3);
doc.font('Helvetica');
doc.text('  •  What was implemented', { indent: 10 });
doc.text('  •  How well it was implemented', { indent: 10 });
doc.text('  •  Whether the team understands their implementation', { indent: 10 });
doc.moveDown(1.2);

doc.fontSize(14).font('Helvetica-Bold').text('9. Final Note');

// ─── PAGE 8 ───
doc.addPage();

doc.fontSize(10.5).font('Helvetica').text('Genesis 2.0 Buildathon has been designed to simulate modern software engineering rather than traditional feature-focused hackathons.');
doc.moveDown(0.6);
doc.text('We encourage every participant to challenge themselves, collaborate effectively, experiment with new technologies, and understand every engineering decision made throughout the development process.');
doc.moveDown(0.6);
doc.text('Whether your project implements five technologies or fifteen, what matters most is that your implementation is thoughtful, maintainable, secure, and technically sound.');
doc.moveDown(0.6);
doc.font('Helvetica-Bold').text('Great software is not defined by the number of technologies it uses, but by the quality of its implementation.');
doc.moveDown(0.6);
doc.font('Helvetica-Oblique').text('We wish every participant the very best and look forward to seeing what you build.');

doc.end();

writeStream.on('finish', () => {
  console.log(`✅ PDF successfully generated at: ${outputPath}`);
});
