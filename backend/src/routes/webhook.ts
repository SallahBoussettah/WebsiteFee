import express from 'express'
import { coinbaseService } from '../services/coinbase'

const router = express.Router()

// Webhook endpoint for Coinbase Commerce
router.post('/webhook', (req: express.Request, res: express.Response) => {
  try {
    const signature = req.headers['x-cc-webhook-signature'] as string
    const body = req.body

    // Verify webhook signature (uncomment for production)
    /*
    if (!signature || !process.env.COINBASE_WEBHOOK_SECRET) {
      return res.status(400).json({ error: 'Missing signature or webhook secret' })
    }

    const isValidSignature = coinbaseService.verifyWebhookSignature(
      typeof body === 'string' ? body : JSON.stringify(body),
      signature,
      process.env.COINBASE_WEBHOOK_SECRET
    )

    if (!isValidSignature) {
      return res.status(401).json({ error: 'Invalid webhook signature' })
    }
    */

    // Parse the webhook payload
    let event
    try {
      event = typeof body === 'string' ? JSON.parse(body) : body
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError)
      return res.status(400).json({ error: 'Invalid JSON payload' })
    }

    // Log the webhook event
    console.log('🔔 Webhook received:', {
      id: event.id,
      type: event.type,
      timestamp: new Date().toISOString(),
      data: event.data
    })

    // Extract payment details
    const chargeData = event.data
    const metadata = chargeData?.metadata || {}
    const isUSDCBase = metadata.network === 'base' && metadata.purchase_currency === 'USDC'

    // Handle different event types
    switch (event.type) {
      case 'charge:created':
        console.log('💰 New charge created:', {
          id: event.data.id,
          amount: chargeData?.pricing?.local?.amount,
          currency: chargeData?.pricing?.local?.currency,
          network: metadata.network,
          purchase_currency: metadata.purchase_currency
        })
        // Handle new charge creation
        break

      case 'charge:confirmed':
        console.log('✅ Charge confirmed:', {
          id: event.data.id,
          network: metadata.network,
          currency: metadata.purchase_currency,
          destination: metadata.destination_address
        })
        
        if (isUSDCBase) {
          console.log('🎯 USDC payment confirmed on Base network!')
          // Handle USDC-specific confirmation logic
          // - Update order status
          // - Send confirmation email
          // - Trigger fulfillment process
        }
        break

      case 'charge:failed':
        console.log('❌ Charge failed:', {
          id: event.data.id,
          reason: chargeData?.timeline?.find((t: any) => t.status === 'FAILED')?.context
        })
        // Handle failed payment
        break

      case 'charge:delayed':
        console.log('⏳ Charge delayed:', event.data.id)
        // Handle delayed payment (common with crypto)
        // Send notification to customer about delay
        break

      case 'charge:pending':
        console.log('⏱️ Charge pending:', {
          id: event.data.id,
          network: metadata.network
        })
        // Handle pending payment
        // Update UI to show "payment processing" status
        break

      case 'charge:resolved':
        console.log('🎉 Charge resolved:', {
          id: event.data.id,
          final_status: chargeData?.timeline?.[chargeData.timeline.length - 1]?.status
        })
        
        if (isUSDCBase) {
          console.log('🚀 USDC Base payment fully resolved!')
          // Final confirmation for USDC payments
        }
        break

      default:
        console.log('❓ Unknown event type:', event.type)
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router