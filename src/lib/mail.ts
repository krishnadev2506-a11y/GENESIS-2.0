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

// CRITICAL FIX: The From email address must match the authenticated Gmail account exactly
// to pass SPF alignment. We can customize the display name, but the actual address must be EMAIL_USER.
function getFromEmail(): string {
  const user = process.env.EMAIL_USER;
  return `GENESIS 2.0 <${user}>`;
}

// Strip HTML tags for the plain-text fallback
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Email clients strip <style> blocks and external fonts. Everything must be inlined.
const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #0A0118; color: #F5F3FF; font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #110B1F; border: 1px solid #2D2342; border-radius: 16px; padding: 40px;">
    
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #F5F3FF; text-transform: uppercase;">
        Genesis <span style="color: #A78BFA;">2.0</span>
      </div>
      <div style="font-size: 14px; margin-top: 8px; color: #B3A8CC;">July 10-11, 2026</div>
    </div>
    
    <div style="font-size: 16px; line-height: 1.6; color: #E5E7EB;">
      ${content}
    </div>
    
    <div style="margin-top: 40px; text-align: center; font-size: 14px; color: #B3A8CC;">
      Code The Future. Create the Impossible.<br>
      &copy; 2026 GENESIS Buildathon
    </div>
  </div>
</body>
</html>
`;

export async function sendRegistrationReceived(toEmails: string[], teamName: string, memberNames: string[] = []): Promise<void> {
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
  
  if (memberNames.length > 0) {
    contentStr += '\n\nRegistered Participants:\n' + memberNames.map(name => `- ${name}`).join('\n');
  }
  
  // Create plain text fallback first
  const textContent = contentStr;
  
  // Create HTML version
  const content = contentStr.split('\n').map(p => p.trim() ? `<p style="margin: 0 0 16px 0;">${p}</p>` : '').join('');
  const htmlContent = emailTemplate(content);
  
  const fromEmail = getFromEmail();

  const promises = toEmails.map(to => getTransporter().sendMail({
    from: fromEmail,
    to,
    subject: "We have received your GENESIS 2.0 registration",
    text: textContent,
    html: htmlContent,
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`
    }
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
  
  // Create plain text fallback
  const textContent = `${contentStr}\n\nAccess Dashboard here: ${loginUrl}`;

  // Create HTML version
  const formattedContent = contentStr.split('\n').map(p => p.trim() ? `<p style="margin: 0 0 16px 0;">${p}</p>` : '').join('');
  
  const content = `
    ${formattedContent}
    <div style="text-align: center; margin-top: 32px;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #8B5CF6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold;">Access Dashboard</a>
    </div>
  `;
  const htmlContent = emailTemplate(content);
  
  const fromEmail = getFromEmail();

  const promises = toEmails.map(to => getTransporter().sendMail({
    from: fromEmail,
    to,
    subject: "You are confirmed for GENESIS 2.0 - Welcome!",
    text: textContent,
    html: htmlContent,
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`
    }
  }));

  await Promise.allSettled(promises);
}

export async function sendAdminMessage(to: string, subject: string, body: string): Promise<void> {
  const content = `
    <h1 style="color: #F5F3FF; font-size: 20px; margin-top: 0; margin-bottom: 24px;">${subject}</h1>
    ${body.split('\n').map(p => `<p style="margin: 0 0 16px 0;">${p}</p>`).join('')}
  `;
  
  const textContent = `${subject}\n\n${body}`;

  await getTransporter().sendMail({
    from: getFromEmail(),
    to,
    subject,
    text: textContent,
    html: emailTemplate(content),
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`
    }
  });
}

export async function sendAdminMessageBatch(toEmails: string[], subject: string, body: string): Promise<void> {
  const content = `
    <h1 style="color: #F5F3FF; font-size: 20px; margin-top: 0; margin-bottom: 24px;">${subject}</h1>
    ${body.split('\n').map(p => `<p style="margin: 0 0 16px 0;">${p}</p>`).join('')}
  `;
  
  const textContent = `${subject}\n\n${body}`;
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();

  const promises = toEmails.map(to => getTransporter().sendMail({
    from: fromEmail,
    to,
    subject,
    text: textContent,
    html: htmlContent,
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`
    }
  }));

  await Promise.allSettled(promises);
}

export async function sendAdminRegistrationAlert(teamName: string, college: string, memberCount: number): Promise<void> {
  const content = `
    <h1 style="color: #F5F3FF; font-size: 20px; margin-top: 0; margin-bottom: 24px;">New Team Registered!</h1>
    <p style="margin: 0 0 16px 0;">A new team has just submitted their registration for GENESIS 2.0.</p>
    <ul style="padding-left: 20px; margin-bottom: 24px; color: #E5E7EB;">
      <li style="margin-bottom: 8px;"><strong>Team Name:</strong> ${teamName}</li>
      <li style="margin-bottom: 8px;"><strong>College:</strong> ${college}</li>
      <li style="margin-bottom: 8px;"><strong>Members:</strong> ${memberCount}</li>
    </ul>
    <p style="margin: 0 0 16px 0;">Please log in to the admin panel to review and verify their payment.</p>
  `;
  
  const textContent = `New Team Registered!\n\nA new team has just submitted their registration for GENESIS 2.0.\n\nTeam Name: ${teamName}\nCollege: ${college}\nMembers: ${memberCount}\n\nPlease log in to the admin panel to review and verify their payment.`;
  
  try {
    await getTransporter().sendMail({
      from: getFromEmail(),
      to: process.env.EMAIL_USER || 'krishnadev2506@gmail.com',
      subject: `New Registration Alert: ${teamName}`,
      text: textContent,
      html: emailTemplate(content),
    });
  } catch (err) {
    console.error('Failed to send admin alert email:', err);
  }
}
