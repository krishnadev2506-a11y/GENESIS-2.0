import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(_req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing RESEND_API_KEY. Add it to your Vercel environment variables." 
      }, { status: 400 });
    }

    if (!fromEmail) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing FROM_EMAIL. Add it to your Vercel environment variables (e.g. noreply@yourdomain.com)." 
      }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: apiKey,
      },
    });

    // Verify SMTP connection first
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

    // Send a test email
    const info = await transporter.sendMail({
      from: `GENESIS 2.0 <${fromEmail}>`,
      to: fromEmail, // Send to self
      subject: "GENESIS SMTP Test via Resend",
      text: "If you are reading this, Nodemailer + Resend SMTP is working correctly!",
      html: "<p>If you are reading this, <strong>Nodemailer + Resend SMTP</strong> is working correctly!</p>"
    });

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully via Resend SMTP!",
      info: info.messageId 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      stage: 'General Error',
      error: error.message 
    }, { status: 500 });
  }
}
