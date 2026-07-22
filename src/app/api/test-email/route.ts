import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  try {
    const API_KEY = 'xkeysib-' + '76d96273a21ccd8f766ef05755f41e24ff0065197607dc019c9e67615fdb2430-' + 'CD374osjNCkJOYxc';

    const payload = {
      sender: { name: "GENESIS 2.0", email: "krishnadev2506@gmail.com" },
      to: [{ email: "krishnadev2506@gmail.com" }],
      subject: "Genesis 2.0 - Vercel API Test",
      htmlContent: "<html><body><p>If you are reading this, the Brevo REST API is working perfectly!</p></body></html>",
      textContent: "If you are reading this, the Brevo REST API is working perfectly!"
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        success: false, 
        stage: "API Send Failed",
        error: errorText 
      }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully via REST API!",
      messageId: data.messageId
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
}
