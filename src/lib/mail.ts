import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) {
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
    }
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
  }
  return transporter;
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

  contentStr = contentStr.replace(/{{teamName}}/g, teamName);
  const content = contentStr.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();

  const promises = toEmails.map(to => getTransporter().sendMail({
    from: fromEmail,
    to,
    subject: "We've received your GENESIS 2.0 registration",
    html: htmlContent,
  }));

  await Promise.allSettled(promises);
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

  contentStr = contentStr
    .replace(/{{teamName}}/g, teamName)
    .replace(/{{username}}/g, username)
    .replace(/{{password}}/g, password);

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://genesis2026.dev'}/login`;
  const formattedContent = contentStr.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');

  const content = `
    ${formattedContent}
    <p style="text-align: center;">
      <a href="${loginUrl}" class="btn">Access Dashboard</a>
    </p>
  `;
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();

  const promises = toEmails.map(to => getTransporter().sendMail({
    from: fromEmail,
    to,
    subject: "You're confirmed for GENESIS 2.0 — Welcome!",
    html: htmlContent,
  }));

  await Promise.allSettled(promises);
}

export async function sendAdminMessage(to: string, subject: string, body: string): Promise<void> {
  const content = `
    <h1>${subject}</h1>
    ${body.split('\n').map(p => `<p>${p}</p>`).join('')}
  `;
  
  await getTransporter().sendMail({
    from: getFromEmail(),
    to,
    subject,
    html: emailTemplate(content),
  });
}

export async function sendAdminMessageBatch(toEmails: string[], subject: string, body: string): Promise<void> {
  const content = `
    <h1>${subject}</h1>
    ${body.split('\n').map(p => `<p>${p}</p>`).join('')}
  `;
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();

  const promises = toEmails.map(to => getTransporter().sendMail({
    from: fromEmail,
    to,
    subject,
    html: htmlContent,
  }));

  await Promise.allSettled(promises);
}
