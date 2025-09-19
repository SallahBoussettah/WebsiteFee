import express from 'express'
import { onrampService } from '../services/onramp'

const router = express.Router()

interface OnrampRequest {
  amount: string
  currency: string
  paymentMethod?: 'apple_pay' | 'google_pay' | 'debit_card'
  name?: string
  description?: string
}

/**
 * Create Coinbase Onramp order for fiat-to-USDC payments
 * Supports Apple Pay, Google Pay, and credit/debit cards
 */
router.post('/onramp', async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency, paymentMethod, name }: OnrampRequest = req.body
    const destinationAddress = process.env.DESTINATION_ADDRESS || '0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd'

    // Validate required fields
    if (!amount || !currency) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'currency']
      })
    }

    // Map frontend payment method to Coinbase format
    let coinbasePaymentMethod: 'GUEST_CHECKOUT_APPLE_PAY' | 'GUEST_CHECKOUT_DEBIT_CARD' = 'GUEST_CHECKOUT_DEBIT_CARD'
    
    if (paymentMethod === 'apple_pay') {
      coinbasePaymentMethod = 'GUEST_CHECKOUT_APPLE_PAY'
    }

    console.log('💳 Creating Onramp payment:', {
      amount: `${amount} ${currency}`,
      method: paymentMethod || 'debit_card',
      destination: destinationAddress,
      name: name || 'USDC Purchase'
    })

    // Check if we have valid CDP credentials for Onramp
    if (!process.env.CDP_API_KEY_ID || !process.env.CDP_PRIVATE_KEY) {
      console.log('⚠️  No CDP credentials found for Onramp')
      console.log('💡 To enable Onramp payments:')
      console.log('   1. Your CDP API key is already configured')
      console.log('   2. Apply for Onramp access at: https://www.coinbase.com/developer-platform/products/onramp')
      console.log('🔄 Using demo mode for now...')
      
      const frontendUrl = process.env.FRONTEND_URL || 'https://1899rp.store'
      const demoResponse = {
        id: `onramp_demo_${Date.now()}`,
        paymentLink: `${frontendUrl}/success?onramp=true&demo=true&session=${Date.now()}`,
        amount: { amount, currency },
        asset: 'USDC',
        network: 'base',
        destinationAddress,
        status: 'pending',
        paymentMethod: paymentMethod || 'debit_card',
        demo_mode: true,
        message: 'Demo mode - Apply for Onramp access to enable live payments'
      }

      return res.json(demoResponse)
    }

    // Create Onramp order
    const result = await onrampService.createOnrampOrder(
      amount,
      currency,
      destinationAddress,
      coinbasePaymentMethod
    )

    if (result.success && result.data) {
      const orderData = result.data

      res.json({
        id: orderData.id,
        paymentLink: orderData.paymentLink,
        amount: orderData.amount,
        asset: orderData.asset,
        network: orderData.network,
        destinationAddress: orderData.destinationAddress,
        status: orderData.status,
        expiresAt: orderData.expiresAt,
        paymentMethod: paymentMethod || 'debit_card'
      })
    } else {
      // Fallback to demo mode if API fails
      console.log('🔄 Onramp API failed, falling back to demo mode...')
      console.log('Error:', result.error)
      
      const frontendUrl = process.env.FRONTEND_URL || 'https://1899rp.store'
      const demoResponse = {
        id: `onramp_demo_${Date.now()}`,
        paymentLink: `${frontendUrl}/success?onramp=true&demo=true&session=${Date.now()}`,
        amount: { amount, currency },
        asset: 'USDC',
        network: 'base',
        destinationAddress,
        status: 'pending',
        paymentMethod: paymentMethod || 'debit_card',
        demo_mode: true,
        api_error: result.error
      }

      res.json(demoResponse)
    }

  } catch (error) {
    console.error('💥 Onramp error:', error)
    res.status(500).json({
      error: 'Failed to create onramp order',
      message: 'Internal server error'
    })
  }
})

/**
 * Get Onramp order status
 */
router.get('/onramp/:orderId', async (req: express.Request, res: express.Response) => {
  try {
    const { orderId } = req.params
    
    const result = await onrampService.getOrderStatus(orderId)
    
    if (result.success) {
      res.json(result.data)
    } else {
      res.status(404).json({
        error: 'Order not found',
        message: result.error
      })
    }
  } catch (error) {
    console.error('Get order status error:', error)
    res.status(500).json({
      error: 'Failed to get order status',
      message: 'Internal server error'
    })
  }
})

/**
 * Get quote for USDC purchase
 */
router.post('/onramp/quote', async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency, paymentMethod } = req.body

    if (!amount || !currency) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'currency']
      })
    }

    let coinbasePaymentMethod: 'GUEST_CHECKOUT_APPLE_PAY' | 'GUEST_CHECKOUT_DEBIT_CARD' = 'GUEST_CHECKOUT_DEBIT_CARD'
    
    if (paymentMethod === 'apple_pay') {
      coinbasePaymentMethod = 'GUEST_CHECKOUT_APPLE_PAY'
    }

    const result = await onrampService.getQuote(amount, currency, coinbasePaymentMethod)
    
    if (result.success) {
      res.json(result.data)
    } else {
      res.status(400).json({
        error: 'Failed to get quote',
        message: result.error
      })
    }
  } catch (error) {
    console.error('Get quote error:', error)
    res.status(500).json({
      error: 'Failed to get quote',
      message: 'Internal server error'
    })
  }
})

export default router