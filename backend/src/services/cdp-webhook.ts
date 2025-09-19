import { Coinbase, Webhook } from '@coinbase/coinbase-sdk'

/**
 * CDP Webhook Service for monitoring onchain events
 * Based on Coinbase Developer Platform SDK
 */
export class CDPWebhookService {
  private initialized = false

  constructor() {
    this.initializeSDK()
  }

  /**
   * Initialize CDP SDK with API credentials
   */
  private initializeSDK() {
    try {
      // Configure CDP SDK with API key from environment or file
      if (process.env.CDP_API_KEY_ID && process.env.CDP_PRIVATE_KEY) {
        console.log('🔑 Configuring CDP SDK with environment variables...')
        Coinbase.configure({
          apiKeyName: process.env.CDP_API_KEY_ID,
          privateKey: process.env.CDP_PRIVATE_KEY,
        })
        this.initialized = true
        console.log('✅ CDP SDK initialized with environment variables')
      } else {
        // Try to find the JSON file in different locations
        const possiblePaths = [
          './cdp_api_key.json',
          '../cdp_api_key.json',
          '../../cdp_api_key.json',
          './backend/cdp_api_key.json',
        ]

        let configFound = false
        for (const filePath of possiblePaths) {
          try {
            console.log(`🔍 Trying CDP config file: ${filePath}`)
            Coinbase.configureFromJson({ filePath })
            this.initialized = true
            configFound = true
            console.log(`✅ CDP SDK initialized with file: ${filePath}`)
            break
          } catch (fileError) {
            console.log(`❌ File not found: ${filePath}`)
          }
        }

        if (!configFound) {
          console.log('⚠️  CDP SDK not configured - no valid credentials found')
          console.log('💡 To enable CDP webhooks, either:')
          console.log(
            '   1. Set environment variables: CDP_API_KEY_ID and CDP_PRIVATE_KEY'
          )
          console.log('   2. Place cdp_api_key.json in the project root')
          this.initialized = false
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize CDP SDK:', error)
      console.log(
        '💡 CDP webhooks will be disabled. Server will continue without them.'
      )
      this.initialized = false
    }
  }

  /**
   * Create a webhook to monitor USDC transfers on Base network to our destination address
   */
  async createUSDCTransferWebhook(
    notificationUri: string,
    destinationAddress: string = process.env.DESTINATION_ADDRESS ||
      '0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd',
    signatureHeader?: string
  ) {
    if (!this.initialized) {
      console.log('⚠️  CDP SDK not initialized - skipping webhook creation')
      return {
        success: false,
        error: 'CDP SDK not initialized. Please configure API credentials.',
      }
    }

    // USDC contract address on Base mainnet
    const USDC_BASE_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

    try {
      const webhook = await Webhook.create({
        networkId: 'base-mainnet',
        notificationUri,
        eventType: 'erc20_transfer',
        eventFilters: [
          {
            contract_address: USDC_BASE_CONTRACT,
            to_address: destinationAddress, // Only monitor transfers TO our address
          },
        ],
        signatureHeader: signatureHeader || 'cdp-webhook-signature',
      })

      console.log('🎯 USDC payment webhook created:', {
        id: webhook.getId(),
        network: 'base-mainnet',
        currency: 'USDC',
        contract: USDC_BASE_CONTRACT,
        destination: destinationAddress,
        notificationUri: webhook.getNotificationURI(),
      })

      return {
        success: true,
        webhook,
        id: webhook.getId(),
      }
    } catch (error) {
      console.error('Failed to create USDC payment webhook:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Create a webhook to monitor our destination address for any activity
   */
  async createDestinationAddressWebhook(
    notificationUri: string,
    destinationAddress: string = process.env.DESTINATION_ADDRESS ||
      '0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd',
    signatureHeader?: string
  ) {
    if (!this.initialized) {
      console.log('⚠️  CDP SDK not initialized - skipping webhook creation')
      return {
        success: false,
        error: 'CDP SDK not initialized. Please configure API credentials.',
      }
    }

    try {
      const webhook = await Webhook.create({
        networkId: 'base-mainnet',
        notificationUri,
        eventType: 'wallet_activity',
        eventTypeFilter: {
          addresses: [destinationAddress],
          wallet_id: '', // Empty string to track external addresses only
        },
        signatureHeader: signatureHeader || 'cdp-webhook-signature',
      })

      console.log('👛 Destination address webhook created:', {
        id: webhook.getId(),
        network: 'base-mainnet',
        address: destinationAddress,
        notificationUri: webhook.getNotificationURI(),
      })

      return {
        success: true,
        webhook,
        id: webhook.getId(),
      }
    } catch (error) {
      console.error('Failed to create destination address webhook:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * List all configured webhooks
   */
  async listWebhooks() {
    if (!this.initialized) {
      return {
        success: false,
        error: 'CDP SDK not initialized. Please configure API credentials.',
        webhooks: [],
        count: 0,
      }
    }

    try {
      const response = await Webhook.list()
      const webhooks = response.data

      console.log(`📋 Found ${webhooks.length} webhooks`)

      return {
        success: true,
        webhooks,
        count: webhooks.length,
      }
    } catch (error) {
      console.error('Failed to list webhooks:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Update webhook notification URI
   */
  async updateWebhook(webhookId: string, newNotificationUri: string) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'CDP SDK not initialized. Please configure API credentials.',
      }
    }

    try {
      const webhooks = await Webhook.list()
      const webhook = webhooks.data.find((wh) => wh.getId() === webhookId)

      if (!webhook) {
        throw new Error(`Webhook with ID ${webhookId} not found`)
      }

      await webhook.update({ notificationUri: newNotificationUri })

      console.log('🔄 Webhook updated:', {
        id: webhookId,
        newUri: newNotificationUri,
      })

      return {
        success: true,
        webhook,
      }
    } catch (error) {
      console.error('Failed to update webhook:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string) {
    if (!this.initialized) {
      throw new Error('CDP SDK not initialized')
    }

    try {
      const webhooks = await Webhook.list()
      const webhook = webhooks.data.find((wh) => wh.getId() === webhookId)

      if (!webhook) {
        throw new Error(`Webhook with ID ${webhookId} not found`)
      }

      await webhook.delete()

      console.log('🗑️ Webhook deleted:', webhookId)

      return {
        success: true,
        deletedId: webhookId,
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Setup webhooks for USDC payment monitoring on Base network
   */
  async setupUSDCPaymentWebhooks(baseNotificationUri: string) {
    const results = []
    const destinationAddress =
      process.env.DESTINATION_ADDRESS ||
      '0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd'

    console.log('🚀 Setting up USDC payment monitoring for:', {
      network: 'base-mainnet',
      currency: 'USDC',
      destination: destinationAddress,
    })

    // 1. Monitor USDC transfers TO our destination address
    const usdcWebhook = await this.createUSDCTransferWebhook(
      `${baseNotificationUri}/cdp/usdc-payment`,
      destinationAddress
    )
    results.push({ type: 'usdc_payment', ...usdcWebhook })

    // 2. Monitor general activity on our destination address (backup)
    const addressWebhook = await this.createDestinationAddressWebhook(
      `${baseNotificationUri}/cdp/address-activity`,
      destinationAddress
    )
    results.push({ type: 'address_activity', ...addressWebhook })

    return results
  }
}

// Export singleton instance
export const cdpWebhookService = new CDPWebhookService()
