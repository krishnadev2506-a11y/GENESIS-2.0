import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Razorpay from 'npm:razorpay'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, registrationId } = await req.json()

    if (!userId || !registrationId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or registrationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rzp = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
    })

    const order = await rzp.orders.create({
      amount: 50000, // ₹500 in paise
      currency: 'INR',
      receipt: `genesis_${registrationId.substring(0, 20)}`,
    })

    // Save pending payment record to DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: dbError } = await supabase.from('payments').insert({
      user_id: userId,
      registration_id: registrationId,
      amount: 50000,
      currency: 'INR',
      razorpay_order_id: order.id,
      status: 'pending',
      gateway: 'razorpay',
    })

    if (dbError) {
      console.error('DB insert error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record: ' + dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Function error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
