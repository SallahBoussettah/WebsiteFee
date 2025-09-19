# Payout Project - Coinbase Commerce Integration

A full-stack application for accepting cryptocurrency payments using Coinbase Commerce API.

## 🏗️ Project Structure

```
PayoutProject/
├── frontend/          # Next.js 15 + TypeScript + Tailwind CSS v4
├── backend/           # Node.js + Express + TypeScript
├── cdp_api_key.json   # Coinbase API credentials
└── README.md
```

## 🚀 Features

### Frontend (`/frontend`)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (latest)
- **UI**: Modern, responsive landing page optimized for USDC payments
- **Payment Flow**: USDC on Base → Coinbase Commerce → Success confirmation

### Backend (`/backend`)
- **Framework**: Node.js + Express
- **Language**: TypeScript
- **Payment Integration**: USDC on Base network via Coinbase Commerce
- **API Endpoints**:
  - `POST /api/checkout` - Create USDC checkout session on Base
  - `POST /api/webhook` - Handle payment status webhooks
- **Security**: CORS, Helmet, webhook signature verification
- **Configuration**: 
  - Network: Base
  - Currency: USDC
  - Destination: `0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd`

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
pnpm install
```

**Backend:**
```bash
cd backend
pnpm install
```

### 2. Environment Configuration

The backend `.env` file is already configured with your API credentials:

```env
# Coinbase Commerce API
COINBASE_API_KEY=BZtPkD4Kok89tAqqYI36jRMYM0qXo4fm

# Payment Configuration  
DESTINATION_ADDRESS=0x4D884A7E2459bD7DDad48Ab7e125a528DfeE60Fd
NETWORK=base
PURCHASE_CURRENCY=USDC
```

**Note**: Update `COINBASE_WEBHOOK_SECRET` when you set up webhooks in production.

### 3. Development

**Quick Start (Windows):**
```cmd
start-dev.bat
```

**Manual Start:**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend  
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 🎨 Tailwind CSS v4 Setup

This project uses the latest Tailwind CSS v4 with:
- **Zero Configuration**: No `tailwind.config.js` needed
- **PostCSS Integration**: Via `@tailwindcss/postcss`
- **CSS Import**: Simple `@import "tailwindcss"` in `globals.css`
- **Modern Features**: Latest utility classes and optimizations

## 🔗 API Endpoints

### POST `/api/checkout`
Creates a new Coinbase Commerce checkout session.

**Request Body:**
```json
{
  "amount": "10.00",
  "currency": "USD", 
  "name": "Product Name",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "id": "checkout_123456789",
  "checkout_url": "https://commerce.coinbase.com/charges/ABC123",
  "amount": { "local": { "amount": "10.00", "currency": "USD" } },
  "name": "Product Name",
  "status": "NEW"
}
```

### POST `/api/webhook`
Handles Coinbase Commerce webhook events for payment status updates.

**Supported Events:**
- `charge:created` - New payment initiated
- `charge:confirmed` - Payment confirmed
- `charge:failed` - Payment failed
- `charge:pending` - Payment pending
- `charge:resolved` - Payment completed

## 🐳 Docker Support

Build and run the backend with Docker:

```bash
cd backend
docker build -t payout-backend .
docker run -p 3001:3001 --env-file .env payout-backend
```

## 🔧 Development Scripts

### Frontend
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks

### Backend
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks

## 🔐 Security Notes

1. **API Keys**: Never commit real API keys to version control
2. **Webhook Verification**: Uncomment signature verification in production
3. **CORS**: Configure appropriate origins for production
4. **Environment Variables**: Use proper secret management in production

## 📝 Next Steps

1. **Database Integration**: Add PostgreSQL/MongoDB for order tracking
2. **User Authentication**: Implement user accounts and order history
3. **Email Notifications**: Send confirmation emails after payments
4. **Error Handling**: Enhanced error pages and user feedback
5. **Testing**: Add unit and integration tests
6. **Monitoring**: Add logging and monitoring solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.