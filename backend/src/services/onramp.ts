import axios from 'axios'

/**
 * Coinbase Onramp Service for fiat-to-crypto payments
 * Allows users to pay with credit cards, Apple Pay, Google Pay, etc.
 * and receive USDC directly on Base network
 */
export class CoinbaseOnrampService {
  private baseUrl: string = 'https://api.coinbase.com/v2'
  private apiVersion: string = '2024-01-01'

  constructor() {}

  private getApiKey(): string {
    return process.env.CDP_API_KEY_ID || ''
  }

  private getPrivateKey(): string {
    return process.env.CDP_PRIVATE_KEY || ''
  }

  /**
   * Create an Onramp order for USDC on Base network
   * Supports Apple Pay, Google Pay, and credit cards
   */
  async createOnrampOrder(
    amount: string,
    currency: string = 'USD',
    destinationAddress: string,
    paymentMethod: 'GUEST_CHECKOUT_APPLE_PAY' | 'GUEST_CHECKOUT_DEBIT_CARD' = 'GUEST_CHECKOUT_APPLE_PAY'
  ) {
    try {
      const orderData = {
        paymentAmount: {
          amount: amount,
          currency: currency
        },
        purchaseNetwork: 'base',
        purchaseAsset: 'USDC',
        destinationWallet: {
          address: destinationAddress,
          blockchains: ['base']
        },
        paymentMethod: paymentMethod,
        // Enable guest checkout for users without Coinbase accounts
        guestCheckout: true
      }

      console.log('🚀 Creating Coinbase Onramp order:', {
        amount: `${amount} ${currency}`,
        asset: 'USDC',
        network: 'base',
        destination: destinationAddress,
        paymentMethod
      })

      const response = await axios.post(
        `${this.baseUrl}/onramp/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getApiKey()}`,
            'CB-VERSION': this.apiVersion
          }
        }
      )

      const orderResult = response.data.data

      console.log('✅ Onramp order created:', {
        id: orderResult.id,
        status: orderResult.status,
        paymentLink: orderResult.paymentLink
      })

      return {
        success: true,
        data: {
          id: orderResult.id,
          status: orderResult.status,
          paymentLink: orderResult.paymentLink,
          amount: orderResult.paymentAmount,
          asset: 'USDC',
          network: 'base',
          destinationAddress,
          expiresAt: orderResult.expiresAt
        }
      }

    } catch (error) {
      console.error('❌ Coinbase Onramp error:', error)
      
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
   * Get Onramp order status
   */
  async getOrderStatus(orderId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/onramp/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.getApiKey()}`,
            'CB-VERSION': this.apiVersion
          }
        }
      )

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Failed to get order status:', error)
      return {
        success: false,
        error: axios.isAxiosError(error) ? error.response?.data?.error : 'Unknown error'
      }
    }
  }

  /**
   * Create a quote for USDC purchase
   */
  async getQuote(
    amount: string,
    currency: string = 'USD',
    paymentMethod: 'GUEST_CHECKOUT_APPLE_PAY' | 'GUEST_CHECKOUT_DEBIT_CARD' = 'GUEST_CHECKOUT_APPLE_PAY'
  ) {
    try {
      const quoteData = {
        paymentAmount: {
          amount: amount,
          currency: currency
        },
        purchaseNetwork: 'base',
        purchaseAsset: 'USDC',
        paymentMethod: paymentMethod
      }

      const response = await axios.post(
        `${this.baseUrl}/onramp/quote`,
        quoteData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getApiKey()}`,
            'CB-VERSION': this.apiVersion
          }
        }
      )

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Failed to get quote:', error)
      return {
        success: false,
        error: axios.isAxiosError(error) ? error.response?.data?.error : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const onrampService = new CoinbaseOnrampService()