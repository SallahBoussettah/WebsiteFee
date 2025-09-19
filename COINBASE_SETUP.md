# 🔑 Coinbase API Keys Setup Guide

Your project uses **two different Coinbase services** that require separate API keys:

## 1. 💳 Coinbase Commerce (Payment Processing)

**Purpose**: Create payment checkout sessions for customers
**Status**: ❌ Not configured (currently in demo mode)

### Setup Steps:
1. **Sign up** at [commerce.coinbase.com](https://commerce.coinbase.com/)
2. **Create a new Commerce account** or use existing
3. **Go to Settings** → **API Keys** 
4. **Create new API key** with these permissions:
   - `charge:create` - Create payment charges
   - `charge:read` - Read charge details
5. **Copy the API key** and update `backend/.env`:
   ```env
   COINBASE_API_KEY=your_commerce_api_key_here
   ```

### Current Status:
```
❌ COINBASE_API_KEY=your_coinbase_commerce_api_key_here
```

---

## 2. 🔗 Coinbase Developer Platform (CDP) - Onchain Monitoring

**Purpose**: Monitor USDC transfers on Base network
**Status**: ✅ Configured and working

### Current Configuration:
```
✅ CDP_API_KEY_ID=c16100e1-f4a5-435c-87d9-7c29eba66814
✅ CDP_PRIVATE_KEY=YS7DfMtLCWsfBIPiRwmWFu4Vv7dM5ycz/...
✅ DESTINATION_ADDRESS=0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd
```

---

## 🚀 Quick Test

### Demo Mode (Current):
- ✅ Frontend works perfectly
- ✅ Payment button creates demo checkout
- ✅ Redirects to success page
- ❌ No real payment processing

### Live Mode (After Commerce setup):
- ✅ Real Coinbase Commerce checkout
- ✅ Accept USDC on Base network
- ✅ Webhook notifications for payments
- ✅ Production-ready payment flow

---

## 🔧 Testing the Current Setup

1. **Click "Pay with Card"** on the frontend
2. **Check backend logs** - you'll see:
   ```
   ⚠️  No valid Coinbase Commerce API key found
   💡 To enable live payments, you need to:
      1. Sign up at https://commerce.coinbase.com/
      2. Create an API key in your Commerce dashboard  
      3. Update COINBASE_API_KEY in backend/.env
   🔄 Using demo mode for now...
   ```
3. **You'll be redirected** to the success page in demo mode

---

## 📝 Next Steps

1. **Get Coinbase Commerce API key** (see setup steps above)
2. **Update backend/.env** with the real API key
3. **Restart backend server**: `npm run dev`
4. **Test live payments** with real USDC on Base!

---

## 🎯 Payment Flow

```
Frontend → Backend → Coinbase Commerce → Base Network
   ↓           ↓            ↓              ↓
User clicks → Create     → Real USDC    → Your wallet
"Pay Card"    charge       payment        receives USDC
```

The CDP webhooks will automatically detect when USDC arrives at your address: `0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd`