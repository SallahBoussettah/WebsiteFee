import axios from 'axios'
import crypto from 'crypto'

interface CoinbaseCommerceCharge {
  name: string
  description: string
  local_price: {
    amount: string
    currency: string
  }
  pricing_type: 'fixed_price'
  redirect_url: string
  cancel_url: string
  metadata?: {
    network?: string
    destination_address?: string
    purchase_currency?: string
    created_at?: string
    integration?: string
    [key: string]: any // Allow additional properties
  }
}

interface CDPWalletConfig {
  network: string
  destination_address: string
  purchase_currency: string
}

export class CoinbaseService {
  private apiVersion: string = '2018-03-22'
  private baseUrl: string = 'https://api.commerce.coinbase.com'

  constructor() {
    // API key will be read dynamically from environment
  }

  private getApiKey(): string {
    return process.env.COINBASE_API_KEY || ''
  }

  /**
   * Create a Coinbase Commerce charge for USDC payments on Base
   */
  async createCharge(chargeData: CoinbaseCommerceCharge) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/charges`,
        chargeData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CC-Api-Key': this.getApiKey(),
            'X-CC-Version': this.apiVersion
          }
        }
      )

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Coinbase Commerce API Error:', error)
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
          status: error.response?.status
        }
      }

      return {
        success: false,
        error: 'Unknown error occurred'
      }
    }
  }

  /**
   * Verify webhook signature from Coinbase Commerce
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex')

      return signature === expectedSignature
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return false
    }
  }

  /**
   * Get charge details by ID
   */
  async getCharge(chargeId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/charges/${chargeId}`,
        {
          headers: {
            'X-CC-Api-Key': this.getApiKey(),
            'X-CC-Version': this.apiVersion
          }
        }
      )

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Failed to fetch charge:', error)
      return {
        success: false,
        error: axios.isAxiosError(error) ? error.response?.data?.error : 'Unknown error'
      }
    }
  }

  /**
   * Create a charge specifically configured for USDC on Base network
   */
  async createUSDCBaseCharge(
    amount: string,
    currency: string,
    name: string,
    description?: string,
    redirectUrl?: string,
    cancelUrl?: string
  ) {
    const walletConfig: CDPWalletConfig = {
      network: process.env.NETWORK || 'base',
      destination_address: process.env.DESTINATION_ADDRESS || '0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd',
      purchase_currency: process.env.PURCHASE_CURRENCY || 'USDC'
    }

    const chargeData: CoinbaseCommerceCharge = {
      name,
      description: description || `${name} - USDC payment on Base`,
      local_price: {
        amount,
        currency
      },
      pricing_type: 'fixed_price',
      redirect_url: redirectUrl || `${process.env.FRONTEND_URL}/success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/`,
      metadata: {
        ...walletConfig,
        created_at: new Date().toISOString(),
        integration: 'coinbase-commerce-usdc-base'
      }
    }

    console.log('🎯 Creating USDC Base charge:', {
      amount: `${amount} ${currency}`,
      name,
      network: walletConfig.network,
      currency: walletConfig.purchase_currency,
      destination: walletConfig.destination_address
    })

    return this.createCharge(chargeData)
  }
}

// Export singleton instance - API key will be read dynamically from environment
export const coinbaseService = new CoinbaseService()