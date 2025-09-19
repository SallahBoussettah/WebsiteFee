import express from 'express'
import { cdpWebhookService } from '../services/cdp-webhook'

const router = express.Router()

/**
 * CDP Webhook endpoint for USDC payments to our destination address
 */
router.post('/cdp/usdc-payment', (req: express.Request, res: express.Response) => {
  try {
    const event = req.body
    const destinationAddress = process.env.DESTINATION_ADDRESS || '0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd'

    console.log('🔔 CDP USDC Payment Event:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    })

    // Handle USDC transfer events
    if (event.type === 'erc20_transfer') {
      const transferData = event.data
      
      console.log('💰 USDC Payment received:', {
        from: transferData.from_address,
        to: transferData.to_address,
        amount: transferData.amount,
        decimals: transferData.decimals,
        token_symbol: 'USDC',
        contract: transferData.contract_address,
        txHash: transferData.transaction_hash,
        blockNumber: transferData.block_number,
        network: 'base-mainnet'
      })

      // Verify this is a payment to our destination address
      if (transferData.to_address?.toLowerCase() === destinationAddress.toLowerCase()) {
        console.log('🎯 USDC Payment confirmed!')
        console.log(`💵 Amount: ${transferData.amount} USDC`)
        console.log(`📍 From: ${transferData.from_address}`)
        console.log(`🔗 TX: ${transferData.transaction_hash}`)
        
        // Handle payment confirmation logic here
        // - Update order status in database
        // - Send confirmation email to customer
        // - Trigger product fulfillment
        // - Update frontend via websocket/SSE
      }
    }

    res.status(200).json({ 
      received: true,
      processed: true,
      network: 'base-mainnet',
      currency: 'USDC'
    })
  } catch (error) {
    console.error('CDP USDC payment webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * CDP Address Activity webhook endpoint (backup monitoring)
 */
router.post('/cdp/address-activity', (req: express.Request, res: express.Response) => {
  try {
    const event = req.body
    const destinationAddress = process.env.DESTINATION_ADDRESS || '0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd'

    console.log('🔔 CDP Address Activity Event:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    })

    // Handle wallet activity events for our destination address
    if (event.type === 'wallet_activity') {
      const activityData = event.data
      
      console.log('👛 Destination Address Activity:', {
        address: activityData.address,
        activity_type: activityData.activity_type,
        amount: activityData.amount,
        asset: activityData.asset,
        network: 'base-mainnet'
      })

      // Log any activity on our destination address
      if (activityData.address?.toLowerCase() === destinationAddress.toLowerCase()) {
        console.log('📍 Activity detected on destination address!')
      }
    }

    res.status(200).json({ 
      received: true,
      address: destinationAddress,
      network: 'base-mainnet'
    })
  } catch (error) {
    console.error('CDP address activity webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * Setup webhooks for payment monitoring
 */
router.post('/setup-webhooks', async (req: express.Request, res: express.Response) => {
  try {
    const { baseUrl } = req.body

    if (!baseUrl) {
      return res.status(400).json({ 
        error: 'Missing baseUrl parameter',
        example: { baseUrl: 'https://your-domain.com/api' }
      })
    }

    console.log('🚀 Setting up CDP webhooks...')
    
    const results = await cdpWebhookService.setupUSDCPaymentWebhooks(baseUrl)
    
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    res.json({
      success: true,
      message: `Setup complete: ${successful.length} webhooks created, ${failed.length} failed`,
      webhooks: successful.map(r => ({
        type: r.type,
        id: r.id,
        success: r.success
      })),
      errors: failed.map(r => ({
        type: r.type,
        error: r.error
      }))
    })

  } catch (error) {
    console.error('Webhook setup error:', error)
    res.status(500).json({ 
      error: 'Failed to setup webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * List all configured webhooks
 */
router.get('/webhooks', async (_req: express.Request, res: express.Response) => {
  try {
    const result = await cdpWebhookService.listWebhooks()
    
    if (result.success) {
      res.json({
        success: true,
        count: result.count,
        webhooks: result.webhooks?.map(wh => ({
          id: wh.getId(),
          networkId: wh.getNetworkId(),
          eventType: wh.getEventType(),
          notificationUri: wh.getNotificationURI()
        }))
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('List webhooks error:', error)
    res.status(500).json({ 
      error: 'Failed to list webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Delete a webhook by ID
 */
router.delete('/webhooks/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    
    const result = await cdpWebhookService.deleteWebhook(id)
    
    if (result.success) {
      res.json({
        success: true,
        message: `Webhook ${id} deleted successfully`
      })
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Delete webhook error:', error)
    res.status(500).json({ 
      error: 'Failed to delete webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router