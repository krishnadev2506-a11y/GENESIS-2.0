import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(_req: NextRequest) {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    
    if (!user || !pass) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing EMAIL_USER or EMAIL_PASS environment variables." 
      }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
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
      from: `GENESIS 2.0 <${user}>`,
      to: user,
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
