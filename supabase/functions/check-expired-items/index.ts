import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotifyExpiryData {
  itemName: string;
  expiryDate: string;
  userEmail: string;
}

/**
 * Sends notification to n8n webhook when an item expires
 */
async function notifyExpiry(data: NotifyExpiryData): Promise<boolean> {
  const webhookUrl = "https://manohar12345.app.n8n.cloud/webhook/9cafaedb-017a-4546-a80c-168863617480";
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName: data.itemName,
        expiryDate: data.expiryDate,
        userEmail: data.userEmail,
        timestamp: new Date().toISOString(),
        source: "Smart Fridge App - Cron Job"
      }),
    });

    console.log(`Expiry notification sent for ${data.itemName} to n8n webhook`);
    return response.ok;
  } catch (error) {
    console.error("Error sending expiry notification:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Checking for expired items...')

    // Get all food items with user profiles
    const { data: items, error } = await supabaseClient
      .from('food_items')
      .select(`
        *,
        profiles!inner(email)
      `)
      .eq('notification_sent', false)

    if (error) {
      console.error('Error fetching items:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch items' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!items || items.length === 0) {
      console.log('No items found or all notifications already sent')
      return new Response(
        JSON.stringify({ message: 'No items to check' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let notificationsSent = 0
    const expiredItems = []

    for (const item of items) {
      const printedExpiry = new Date(item.printed_expiry)
      const predictedExpiry = new Date(item.predicted_expiry)
      const expiryDate = new Date(Math.min(printedExpiry.getTime(), predictedExpiry.getTime()))
      expiryDate.setHours(0, 0, 0, 0)

      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log(`Item: ${item.name}, Days left: ${daysLeft}, User: ${item.profiles?.email}`)

      // Check if item is expired or expiring today
      if (daysLeft <= 0 && item.profiles?.email) {
        console.log(`Sending notification for expired item: ${item.name}`)
        
        const success = await notifyExpiry({
          itemName: item.name,
          expiryDate: expiryDate.toISOString().split('T')[0],
          userEmail: item.profiles.email
        })
        
        if (success) {
          // Mark notification as sent
          const { error: updateError } = await supabaseClient
            .from('food_items')
            .update({ notification_sent: true })
            .eq('id', item.id)
            
          if (updateError) {
            console.error(`Error updating notification status for ${item.name}:`, updateError)
          } else {
            console.log(`Successfully sent notification for ${item.name}`)
            notificationsSent++
            expiredItems.push(item.name)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${items.length} items, sent ${notificationsSent} notifications`,
        expiredItems: expiredItems
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})