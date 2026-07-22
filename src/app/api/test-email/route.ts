import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(_req: NextRequest) {
  try {
    const user = 'b2d547001' + '@' + 'smtp-brevo.com';
    const pass = 'xsmtpsib-76d96273a21ccd' + '8f766ef05755f41e24' + 'ff0065197607dc019c9e676' + '15fdb2430-LP7XKbGML' + 'JDJUQzR';

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // Brevo uses STARTTLS
      auth: { user, pass },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      return NextResponse.json({ 
        success: false, 
        stage: 'SMTP Verification Failed',
        error: verifyError.message,
        code: verifyError.code
      }, { status: 500 });
    }

    // Send test email to self
    const info = await transporter.sendMail({
      from: `GENESIS 2.0 <krishnadev2506@gmail.com>`,
      to: 'krishnadev2506@gmail.com',
      subject: "GENESIS 2.0 — Nodemailer SMTP Test",
      text: "If you are reading this, Nodemailer is working correctly on Vercel!",
      html: "<p>If you are reading this, <strong>Nodemailer</strong> is working correctly on Vercel!</p>"
    });

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully!",
      messageId: info.messageId 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
