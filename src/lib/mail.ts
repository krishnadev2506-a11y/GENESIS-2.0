import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

// Use Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'krishnadev2506@gmail.com',
    pass: process.env.EMAIL_PASS,
  },
});

const FROM_EMAIL = process.env.EMAIL_USER || 'krishnadev2506@gmail.com';
const FROM_NAME = process.env.SENDER_NAME || 'GENESIS 2.0';

interface EmailParams {
  toEmails?: string[];
  bccEmails?: string[];
  subject: string;
  textContent: string;
  htmlContent: string;
}

async function sendEmail({ toEmails = [], bccEmails = [], subject, textContent, htmlContent }: EmailParams) {
  if (!process.env.EMAIL_PASS) {
    logger.warn('EMAIL_PASS is not set! Emails will fail.');
  }

  const mailOptions: any = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    subject,
    text: textContent,
    html: htmlContent,
  };

  if (toEmails.length > 0) {
    mailOptions.to = toEmails.join(', ');
  }
  if (bccEmails.length > 0) {
    mailOptions.bcc = bccEmails.join(', ');
  }
  
  if (toEmails.length === 0 && bccEmails.length > 0) {
    mailOptions.to = FROM_EMAIL; // To prevent empty 'to' issues
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Failed to send email via Gmail:', error);
    throw error;
  }
}

function emailTemplate(content: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; color: #E5E7EB;">
      <div style="background: linear-gradient(135deg, #4338CA 0%, #312E81 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #4F46E5;">
        <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: 2px;">GENESIS 2.0</h1>
        <p style="margin: 8px 0 0 0; color: #C7D2FE; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">The Ultimate Tech Symposium</p>
      </div>
      <div style="padding: 32px 24px; background-color: #0A0A0A;">
        ${content}
      </div>
      <div style="background-color: #050505; padding: 24px; text-align: center; border-top: 1px solid #1F2937;">
        <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">This is an automated message from the GENESIS 2.0 system.</p>
        <p style="margin: 0; color: #4B5563; font-size: 12px;">© 2026 GENESIS FISAT. All rights reserved.</p>
      </div>
    </div>
  `;
}

export async function sendRegistrationReceived(toEmails: string[], teamName: string, participantNames: string[] = []): Promise<void> {
  const content = `
    <h2 style="color: #F5F3FF; font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: bold;">Registration Received!</h2>
    <p style="margin: 0 0 16px 0; line-height: 1.6;">Hello ${participantNames.length > 0 ? participantNames.join(', ') : 'there'},</p>
    <p style="margin: 0 0 16px 0; line-height: 1.6;">We have successfully received the registration for your team <strong>${teamName}</strong>.</p>
    <p style="margin: 0 0 24px 0; line-height: 1.6;">Please note that your registration is currently <strong>Pending Verification</strong>. Our team will review your payment and details shortly. You will receive another email once your registration is confirmed.</p>
    <p style="margin: 0; line-height: 1.6; color: #9CA3AF;">If you have any questions, please contact the event organizers.</p>
  `;
  
  const textContent = `Registration Received!\n\nHello ${participantNames.length > 0 ? participantNames.join(', ') : 'there'},\n\nWe have successfully received the registration for your team ${teamName}.\n\nYour registration is currently Pending Verification. You will receive another email once your registration is confirmed.`;

  const promises = toEmails.map(to => 
    sendEmail({
      toEmails: [to],
      subject: "We have received your GENESIS 2.0 registration",
      textContent,
      htmlContent: emailTemplate(content)
    }).catch(err => logger.error(`Failed to send registration received email to ${to}:`, err))
  );

  await Promise.allSettled(promises);
}

export async function sendAdminRegistrationAlert(teamName: string, college: string, memberCount: number): Promise<void> {
  const content = `
    <h2 style="color: #F5F3FF; font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: bold;">New Registration</h2>
    <div style="background-color: #111827; border: 1px solid #374151; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0; color: #9CA3AF;"><strong>Team:</strong> <span style="color: #E5E7EB;">${teamName}</span></p>
      <p style="margin: 0 0 8px 0; color: #9CA3AF;"><strong>College:</strong> <span style="color: #E5E7EB;">${college}</span></p>
      <p style="margin: 0; color: #9CA3AF;"><strong>Members:</strong> <span style="color: #E5E7EB;">${memberCount}</span></p>
    </div>
    <p style="margin: 0; line-height: 1.6; color: #9CA3AF;">Please check the admin dashboard to verify the payment.</p>
  `;
  
  const textContent = `New Registration\n\nTeam: ${teamName}\nCollege: ${college}\nMembers: ${memberCount}\n\nPlease check the admin dashboard to verify the payment.`;

  await sendEmail({
    toEmails: ['krishnadev2506@gmail.com'],
    subject: `[Admin Alert] New Team Registered: ${teamName}`,
    textContent,
    htmlContent: emailTemplate(content)
  });
}

export async function sendTeamCredentials(toEmails: string[], teamName: string, username: string, password: string): Promise<void> {
  const contentStr = process.env.EMAIL_TEMPLATE_CREDENTIALS || `
    <h2 style="color: #F5F3FF; font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: bold;">Welcome to GENESIS 2.0!</h2>
    <p style="margin: 0 0 16px 0; line-height: 1.6;">Hello Team <strong>{{teamName}}</strong>,</p>
    <p style="margin: 0 0 16px 0; line-height: 1.6;">Your registration has been verified. Here are your login credentials for the dashboard:</p>
    <div style="background-color: #111827; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 12px 0; color: #9CA3AF; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Username</p>
      <p style="margin: 0 0 20px 0; color: #FFFFFF; font-size: 20px; font-weight: bold; font-family: monospace;">{{username}}</p>
      <p style="margin: 0 0 12px 0; color: #9CA3AF; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Password</p>
      <p style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: bold; font-family: monospace;">{{password}}</p>
    </div>
    <p style="margin: 0 0 16px 0; line-height: 1.6; color: #F87171;">⚠️ <strong>IMPORTANT:</strong> Keep these credentials safe. Anyone with this password can access your team's dashboard.</p>
  `;
  
  const content = contentStr
    .replace(/{{teamName}}/g, teamName)
    .replace(/{{username}}/g, username)
    .replace(/{{password}}/g, password);

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://genesisfisat.vercel.app'}/login`;
  const textContent = `${contentStr}\n\nAccess Dashboard here: ${loginUrl}`;
  const formattedContent = contentStr.split('\n').map(p => p.trim() ? `<p style="margin: 0 0 16px 0;">${p}</p>` : '').join('');
  
  const fullHtml = emailTemplate(`
    ${content}
    <div style="text-align: center; margin-top: 32px;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">Access Dashboard</a>
    </div>
  `);

  const promises = toEmails.map(to => 
    sendEmail({
      toEmails: [to],
      subject: `Your GENESIS 2.0 Login Credentials`,
      textContent,
      htmlContent: fullHtml
    }).catch(err => logger.error(`Failed to send credentials to ${to}:`, err))
  );

  await Promise.allSettled(promises);
}

export async function sendAdminMessage(to: string, subject: string, body: string): Promise<void> {
  const content = `
    <h1 style="color: #F5F3FF; font-size: 20px; margin-top: 0; margin-bottom: 24px;">${subject}</h1>
    ${body.split('\n').map(p => `<p style="margin: 0 0 16px 0;">${p}</p>`).join('')}
  `;
  const textContent = `${subject}\n\n${body}`;

  try {
    await sendEmail({
      toEmails: [to],
      subject,
      textContent,
      htmlContent: emailTemplate(content)
    });
    logger.info(`Single admin message sent to ${to}`);
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

  // Gmail SMTP limit is ~500 per day. Chunking in batches of 90 to be safe with BCC limits.
  const chunkSize = 90;
  let succeeded = 0;

  for (let i = 0; i < toEmails.length; i += chunkSize) {
    const chunk = toEmails.slice(i, i + chunkSize);
    try {
      await sendEmail({
        bccEmails: chunk,
        subject,
        textContent,
        htmlContent
      });
      succeeded += chunk.length;
    } catch (err) {
      logger.error(`Failed to send batch message chunk (${i} to ${i+chunkSize}):`, err);
    }
  }
  
  logger.info(`Admin message batch complete. Sent to ${succeeded}/${toEmails.length} participants.`);
}

export async function sendVerificationConfirmation(toEmails: string[], teamName: string): Promise<void> {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://genesisfisat.vercel.app'}/dashboard`;
  const content = `
    <h2 style="color: #F5F3FF; font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: bold;">Verification Confirmed! 🎉</h2>
    <p style="margin: 0 0 16px 0;">Great news! Your team <strong>${teamName}</strong> has been verified for GENESIS 2.0.</p>
    <p style="margin: 0 0 24px 0;">You can now log in to the dashboard to view your status, complete any pending tasks, and get ready for the event.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">Go to Dashboard</a>
    </div>
  `;
  
  const textContent = `Verification Confirmed!\n\nGreat news! Your team ${teamName} has been verified for GENESIS 2.0.\nYou can now log in to the dashboard to view your status and get ready for the event.\n\nDashboard URL: ${dashboardUrl}`;

  const promises = toEmails.map(to => 
    sendEmail({
      toEmails: [to],
      subject: `Your Team ${teamName} is Verified!`,
      textContent,
      htmlContent: emailTemplate(content)
    }).catch(err => logger.error(`Failed to send verification confirmation to ${to}:`, err))
  );

  await Promise.allSettled(promises);
}
