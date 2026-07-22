import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';
import { logger } from '@/lib/logger';

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
  const user = process.env.EMAIL_USER;
  return `GENESIS 2.0 <${user}>`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    logger.error('Error fetching settings for email template', err);
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
  }).catch(err => {
    logger.error(`Failed to send registration received email to ${to}:`, err);
  }));

  await Promise.allSettled(promises);
  logger.info(`Sent registration received emails to ${toEmails.length} recipients for team ${teamName}`);
}

export async function sendRegistrationConfirmed(toEmails: string[], teamName: string, username: string, password: string): Promise<void> {
  await connectDB();
  let contentStr = '';
  try {
    // @ts-ignore
    const settings = await Settings.getSettings();
    contentStr = settings.registrationConfirmedEmailTemplate || 'Confirmed! User: {{username}}, Pass: {{password}}';
  } catch (err) {
    logger.error('Error fetching settings for email template', err);
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
  }).catch(err => {
    logger.error(`Failed to send registration confirmed email to ${to}:`, err);
  }));

  await Promise.allSettled(promises);
  logger.info(`Sent registration confirmed emails to ${toEmails.length} recipients for team ${teamName}`);
}

export async function sendAdminMessage(to: string, subject: string, body: string): Promise<void> {
  const content = `
    <h1 style="color: #F5F3FF; font-size: 20px; margin-top: 0; margin-bottom: 24px;">${subject}</h1>
    ${body.split('\n').map(p => `<p style="margin: 0 0 16px 0;">${p}</p>`).join('')}
  `;
  
  const textContent = `${subject}\n\n${body}`;

  try {
    const result = await getTransporter().sendMail({
      from: getFromEmail(),
      to,
      subject,
      text: textContent,
      html: emailTemplate(content),
      headers: {
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`
      }
    });
    logger.info(`Single admin message sent to ${to}: ${result.messageId}`);
  } catch (err) {
    logger.error(`Failed to send admin message to ${to}:`, err);
    throw err;
  }
}

export async function sendAdminMessageBatch(toEmails: string[], subject: string, body: string): Promise<void> {
  if (toEmails.length === 0) {
    logger.info('sendAdminMessageBatch called with no emails to send.');
    return;
  }

  const content = `
    <h1 style="color: #F5F3FF; font-size: 20px; margin-top: 0; margin-bottom: 24px;">${subject}</h1>
    ${body.split('\n').map(p => `<p style="margin: 0 0 16px 0;">${p}</p>`).join('')}
  `;

  const textContent = `${subject}\n\n${body}`;
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();
  const transporter = getTransporter();

  // Use BCC for batch sending to protect recipient privacy and improve efficiency
  const chunkSize = 100; // Gmail BCC limit is around 100
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < toEmails.length; i += chunkSize) {
    const chunk = toEmails.slice(i, i + chunkSize);
    try {
      await transporter.sendMail({ from: fromEmail, bcc: chunk, subject, text: textContent, html: htmlContent });
      succeeded += chunk.length;
    } catch (err) {
      failed += chunk.length;
      logger.error(`Failed to send batch email chunk:`, err);
    }
  }

  logger.info(`Batch email task finished: ${succeeded}/${toEmails.length} succeeded, ${failed} failed - Subject: ${subject}`);
  if (failed > 0) {
    throw new Error(`${failed} emails failed to send in batch.`);
  }
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
    logger.error('Failed to send admin alert email', err);
  }
}

/**
 * Send verification confirmation email to all team members after payment verification
 */
export async function sendVerificationConfirmation(toEmails: string[], teamName: string): Promise<void> {
  const content = `
    <h2 style="color: #F5F3FF; font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: bold;">Verification Confirmed! 🎉</h2>
    <p style="margin: 0 0 16px 0;">Great news! Your team <strong>${teamName}</strong> has been verified for GENESIS 2.0.</p>
    <p style="margin: 0 0 16px 0;">Your team leader will have received separate login credentials. You can now access the dashboard and prepare for the event.</p>
    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://genesis2026.dev'}/dashboard" style="display: inline-block; background-color: #8B5CF6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold;">Access Dashboard</a>
    </div>
    <p style="margin: 24px 0 0 0; color: #B3A8CC; font-size: 14px;">If you have any questions, reach out to the organizing team.</p>
  `;
  
  const textContent = `Verification Confirmed!\n\nGreat news! Your team ${teamName} has been verified for GENESIS 2.0.\n\nYour team leader will have received separate login credentials. You can now access the dashboard and prepare for the event.\n\nAccess Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://genesis2026.dev'}/dashboard`;
  const htmlContent = emailTemplate(content);
  const fromEmail = getFromEmail();

  const promises = toEmails.map(to => 
    getTransporter().sendMail({
      from: fromEmail,
      to,
      subject: `Your Team ${teamName} is Verified for GENESIS 2.0!`,
      text: textContent,
      html: htmlContent,
      headers: {
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`
      }
    }).catch(err => {
      logger.error(`Failed to send verification email to ${to}:`, err);
      return null;
    })
  );

  const results = await Promise.allSettled(promises);
  
  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    logger.warn(`${failed.length} verification emails failed to send`);
  }
}
