import express from 'express'
import axios from 'axios'
import { coinbaseService } from '../services/coinbase'
import console from 'console'

const router = express.Router()

interface CheckoutRequest {
  amount: string
  currency: string
  name: string
  description?: string
  network?: string
  destination_address?: string
}

router.post('/checkout', async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency, name, description }: CheckoutRequest = req.body

    // Validate required fields
    if (!amount || !currency || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'currency', 'name']
      })
    }

    // Check if we have a valid Coinbase Commerce API key
    if (!process.env.COINBASE_API_KEY || process.env.COINBASE_API_KEY === 'BZtPkD4Kok89tAqqYI36jRMYM0qXo4fm') {
      console.log('⚠️  No valid Coinbase Commerce API key found')
      console.log('💡 To enable live payments, you need to:')
      console.log('   1. Sign up at https://commerce.coinbase.com/')
      console.log('   2. Create an API key in your Commerce dashboard')
      console.log('   3. Update COINBASE_API_KEY in backend/.env')
      console.log('🔄 Using demo mode for now...')
      
      const demoResponse = {
        id: `demo_charge_${Date.now()}`,
        checkout_url: `${process.env.FRONTEND_URL}/success?demo=true&session=${Date.now()}`,
        amount: {
          local: { amount, currency },
          usdc: { amount: amount, currency: 'USDC' }
        },
        name,
        description: description || `Payment for ${name}`,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        status: 'NEW',
        network: 'base',
        currency: 'USDC',
        destination_address: process.env.DESTINATION_ADDRESS,
        demo_mode: true,
        reason: 'No valid Coinbase Commerce API key configured'
      }

      return res.json(demoResponse)
    }

    // Use the Coinbase service to create USDC charge on Base
    const result = await coinbaseService.createUSDCBaseCharge(
      amount,
      currency,
      name,
      description
    )

    if (result.success && result.data) {
      const chargeData = result.data

      console.log('✅ Coinbase Commerce charge created:', {
        id: chargeData.id,
        hosted_url: chargeData.hosted_url,
        status: chargeData.timeline[0]?.status || 'NEW'
      })

      res.json({
        id: chargeData.id,
        checkout_url: chargeData.hosted_url,
        amount: chargeData.pricing,
        name: chargeData.name,
        description: chargeData.description,
        created_at: chargeData.created_at,
        expires_at: chargeData.expires_at,
        status: chargeData.timeline[0]?.status || 'NEW',
        network: 'base',
        currency: 'USDC',
        destination_address: process.env.DESTINATION_ADDRESS
      })
    } else {
      // Fallback to demo mode if API fails
      console.log('🔄 Coinbase Commerce API failed, falling back to demo mode...')
      console.log('Error:', result.error)
      
      const demoResponse = {
        id: `demo_charge_${Date.now()}`,
        checkout_url: `${process.env.FRONTEND_URL}/success?demo=true&session=${Date.now()}`,
        amount: {
          local: { amount, currency },
          usdc: { amount: amount, currency: 'USDC' }
        },
        name,
        description: description || `Payment for ${name}`,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        status: 'NEW',
        network: 'base',
        currency: 'USDC',
        destination_address: process.env.DESTINATION_ADDRESS,
        demo_mode: true,
        api_error: result.error
      }

      res.json(demoResponse)
    }

  } catch (error) {
    console.error('💥 Checkout error:', error)
    
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        error: 'Coinbase API error',
        message: error.response?.data?.error?.message || error.message,
        details: error.response?.data
      })
    }

    res.status(500).json({
      error: 'Failed to create checkout session',
      message: 'Internal server error'
    })
  }
})

export default router