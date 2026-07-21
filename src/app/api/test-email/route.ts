import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(_req: NextRequest) {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    
    if (!user || !pass) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing credentials. Vercel doesn't see EMAIL_USER or EMAIL_PASS." 
      }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      debug: true // Include SMTP traffic in logs
    });

    // Verify connection configuration
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

    // Try sending a test email to the sender's own email address
    const info = await transporter.sendMail({
      from: user,
      to: user, // Send to self
      subject: "GENESIS SMTP Test",
      text: "If you are reading this, Nodemailer is working perfectly on Vercel!"
    });

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully!",
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
