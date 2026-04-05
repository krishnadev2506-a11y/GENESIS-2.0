// deno-lint-ignore-file no-explicit-any
// @ts-ignore deno types available at runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore Deno global available at runtime
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// @ts-ignore Deno global available at runtime
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'
// @ts-ignore Deno global available at runtime
const RESEND_FROM_NAME = Deno.env.get('RESEND_FROM_NAME') ?? 'Genesis 2.0'
const BULK_BATCH_SIZE = 45

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeRecipients = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value : [value]
  return [...new Set(
    raw
      .flatMap((entry) => typeof entry === 'string' ? entry.split(',') : [])
      .map((entry) => entry.trim())
      .filter((entry) => emailRegex.test(entry))
  )]
}

const chunk = <T,>(items: T[], size: number) => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

const buildHtml = (body: string) => `
  <div style="font-family:monospace;background:#0A0A0F;color:#fff;padding:32px;">
    <h1 style="color:#00F5FF;letter-spacing:4px;font-size:20px;margin-bottom:4px;">GENESIS 2.0</h1>
    <p style="color:#64748B;font-size:10px;margin-top:0;letter-spacing:3px;">ADMIN TRANSMISSION</p>
    <hr style="border:1px solid #1E1E2E;margin:20px 0;" />
    <div style="font-size:14px;line-height:1.8;color:#e2e8f0;">
      ${body}
    </div>
    <hr style="border:1px solid #1E1E2E;margin:20px 0;" />
    <p style="font-size:10px;color:#64748B;">Automated transmission from the Genesis Hacker Platform. Do not reply to this email.</p>
  </div>
`

const sendViaResend = async (payload: Record<string, unknown>) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.name ||
      'Resend request failed'
    throw new Error(message)
  }

  return data
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      })
    }

    const { to, subject, body, isBulk } = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY. Set it with: supabase secrets set RESEND_API_KEY=re_...")
    }

    const recipients = normalizeRecipients(to)

    if (!subject?.trim()) throw new Error('Missing subject')
    if (!body?.trim()) throw new Error('Missing body')
    if (recipients.length === 0) throw new Error('No valid recipient emails provided')

    const basePayload: Record<string, unknown> = {
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      subject: subject.trim(),
      html: buildHtml(body.trim()),
    }

    if (isBulk) {
      const batches = chunk(recipients, BULK_BATCH_SIZE)
      const results = []

      for (const batch of batches) {
        const data = await sendViaResend({
          ...basePayload,
          to: [RESEND_FROM_EMAIL],
          bcc: batch,
        })
        results.push(data)
      }

      return new Response(JSON.stringify({
        batchCount: batches.length,
        message: `Sent ${recipients.length} emails in ${batches.length} batch(es)`,
        recipientCount: recipients.length,
        results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const data = await sendViaResend({
      ...basePayload,
      to: recipients,
    })

    return new Response(JSON.stringify({
      message: `Sent email to ${recipients[0]}`,
      recipientCount: recipients.length,
      result: data,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
