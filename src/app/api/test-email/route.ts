import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(_req: NextRequest) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'krishnadev2506@gmail.com',
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"GENESIS 2.0" <${process.env.EMAIL_USER || 'krishnadev2506@gmail.com'}>`,
      to: 'krishnadev2506@gmail.com',
      subject: 'Genesis 2.0 - Gmail SMTP Test',
      text: 'If you are reading this, the Gmail SMTP integration is working perfectly!',
      html: '<html><body><p>If you are reading this, the Gmail SMTP integration is working perfectly!</p></body></html>'
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully via Gmail SMTP!",
      messageId: info.messageId
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
}
