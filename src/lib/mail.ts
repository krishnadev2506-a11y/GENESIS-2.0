import { Resend } from 'resend';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

function getFromEmail(): string {
  return process.env.EMAIL_FROM || 'GENESIS 2.0 <noreply@genesis2026.dev>';
}

const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Outfit:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body { background-color: #0A0118; color: #F5F3FF; font-family: 'Outfit', sans-serif; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 40px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: 0.14em; color: #F5F3FF; text-transform: uppercase; }
    .accent { color: #A78BFA; text-shadow: 0 0 20px rgba(167, 139, 250, 0.6); }
    .content { font-size: 16px; line-height: 1.6; color: #B9B0CF; }
    .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #B9B0CF; opacity: 0.7; }
    h1 { font-family: 'Space Grotesk', sans-serif; color: #F5F3FF; font-size: 24px; margin-top: 0; letter-spacing: 0.06em; }
    .btn { display: inline-block; background-color: #8B5CF6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; margin-top: 20px; }
    .credentials { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(139, 92, 246, 0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Genesis <span class="accent">2.0</span></div>
      <div style="font-size: 14px; margin-top: 8px; color: #B3A8CC;">July 10-11, 2026</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      Code The Future. Create the Impossible.<br>
      © 2026 GENESIS Buildathon
    </div>
  </div>
</body>
</html>
`;

export async function sendRegistrationReceived(toEmails: string[], teamName: string): Promise<void> {
  await connectDB();
  let contentStr = '';
  try {
    // @ts-ignore
    const settings = await Settings.getSettings();
    contentStr = settings.registrationReceivedEmailTemplate || 'Registration received for {{teamName}}';
  } catch (err) {
    console.error('Error fetching settings for email template', err);
    contentStr = 'Registration received for {{teamName}}';
  }

  // Replace variables
  contentStr = contentStr.replace(/{{teamName}}/g, teamName);

  // Convert newlines to HTML paragraphs for plain text templates
  const content = contentStr.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();

  const payload = toEmails.map(to => ({
    from: fromEmail,
    to,
    subject: "We've received your GENESIS 2.0 registration",
    html: htmlContent,
  }));

  const { error } = await getResend().batch.send(payload);

  if (error) {
    throw new Error(`Resend Batch Error: ${error.message}`);
  }
}

export async function sendRegistrationConfirmed(toEmails: string[], teamName: string, username: string, password: string): Promise<void> {
  await connectDB();
  let contentStr = '';
  try {
    // @ts-ignore
    const settings = await Settings.getSettings();
    contentStr = settings.registrationConfirmedEmailTemplate || 'Confirmed! User: {{username}}, Pass: {{password}}';
  } catch (err) {
    console.error('Error fetching settings for email template', err);
    contentStr = 'Confirmed! User: {{username}}, Pass: {{password}}';
  }

  // Replace variables
  contentStr = contentStr
    .replace(/{{teamName}}/g, teamName)
    .replace(/{{username}}/g, username)
    .replace(/{{password}}/g, password);

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://genesis2026.dev'}/login`;
  
  // Convert newlines to HTML paragraphs for plain text templates
  const formattedContent = contentStr.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');

  const content = `
    ${formattedContent}
    <p style="text-align: center;">
      <a href="${loginUrl}" class="btn">Access Dashboard</a>
    </p>
  `;
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();

  const payload = toEmails.map(to => ({
    from: fromEmail,
    to,
    subject: "You're confirmed for GENESIS 2.0 — Welcome!",
    html: htmlContent,
  }));

  const { error } = await getResend().batch.send(payload);

  if (error) {
    throw new Error(`Resend Batch Error: ${error.message}`);
  }
}

export async function sendAdminMessage(to: string, subject: string, body: string): Promise<void> {
  const content = `
    <h1>${subject}</h1>
    ${body.split('\n').map(p => `<p>${p}</p>`).join('')}
  `;

  const { error } = await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject,
    html: emailTemplate(content),
  });

  if (error) {
    throw new Error(`Resend Error: ${error.message}`);
  }
}

export async function sendAdminMessageBatch(toEmails: string[], subject: string, body: string): Promise<void> {
  const content = `
    <h1>${subject}</h1>
    ${body.split('\n').map(p => `<p>${p}</p>`).join('')}
  `;
  
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();

  // Resend batch API accepts an array of email objects
  const payload = toEmails.map(to => ({
    from: fromEmail,
    to,
    subject,
    html: htmlContent,
  }));

  const { error } = await getResend().batch.send(payload);

  if (error) {
    throw new Error(`Resend Batch Error: ${error.message}`);
  }
}


