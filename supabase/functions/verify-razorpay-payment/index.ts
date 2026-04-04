import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, paymentId, signature, registrationId, userId } = await req.json()

    if (!orderId || !paymentId || !signature || !registrationId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify Razorpay signature
    const expectedSig = createHmac('sha256', Deno.env.get('RAZORPAY_KEY_SECRET')!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (expectedSig !== signature) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate QR hash for attendance scanning
    const qrHash = createHmac('sha256', Deno.env.get('QR_HMAC_SECRET')!)
      .update(`${registrationId}${userId}`)
      .digest('hex')

    const qrData = JSON.stringify({ regId: registrationId, userId, hash: qrHash })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Update payment record to paid
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId)

    if (paymentError) {
      console.error('Payment update error:', paymentError)
      return new Response(
        JSON.stringify({ error: 'Failed to update payment: ' + paymentError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Confirm registration and embed QR data
    const { error: regError } = await supabase
      .from('registrations')
      .update({
        status: 'confirmed',
        qr_hash: qrHash,
        qr_data: qrData,
      })
      .eq('id', registrationId)

    if (regError) {
      console.error('Registration update error:', regError)
      return new Response(
        JSON.stringify({ error: 'Failed to confirm registration: ' + regError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, qrHash, qrData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Function error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
