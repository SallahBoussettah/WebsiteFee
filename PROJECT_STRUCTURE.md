# 📁 Project Structure

```
PayoutProject/
├── 📄 README.md                    # Main project documentation
├── 📄 PROJECT_STRUCTURE.md         # This file - project structure overview
├── 📄 package.json                 # Root package.json for workspace management
├── 📄 .gitignore                   # Git ignore rules
├── 📄 cdp_api_key.json             # Coinbase API credentials
│
├── 📁 frontend/                    # Next.js Frontend Application
│   ├── 📄 package.json             # Frontend dependencies
│   ├── 📄 next.config.ts           # Next.js configuration
│   ├── 📄 tsconfig.json            # TypeScript configuration
│   ├── 📄 postcss.config.js        # PostCSS configuration for Tailwind v4
│   ├── 📄 .eslintrc.json           # ESLint configuration
│   ├── 📄 .prettierrc              # Prettier configuration
│   ├── 📄 .gitignore               # Frontend-specific git ignore
│   │
│   └── 📁 src/
│       └── 📁 app/                 # Next.js App Router
│           ├── 📄 layout.tsx       # Root layout component
│           ├── 📄 page.tsx         # Landing page with payment button
│           ├── 📄 globals.css      # Global styles with Tailwind v4 import
│           │
│           └── 📁 success/         # Success page route
│               └── 📄 page.tsx     # Payment success confirmation page
│
├── 📁 backend/                     # Node.js Backend API
│   ├── 📄 package.json             # Backend dependencies
│   ├── 📄 tsconfig.json            # TypeScript configuration
│   ├── 📄 .eslintrc.json           # ESLint configuration
│   ├── 📄 .prettierrc              # Prettier configuration
│   ├── 📄 .gitignore               # Backend-specific git ignore
│   ├── 📄 Dockerfile               # Docker configuration
│   ├── 📄 .env.example             # Environment variables template
│   ├── 📄 .env                     # Environment variables (gitignored)
│   │
│   └── 📁 src/
│       ├── 📄 index.ts             # Main Express server
│       │
│       └── 📁 routes/
│           ├── 📄 checkout.ts      # POST /api/checkout - Create payment session
│           └── 📄 webhook.ts       # POST /api/webhook - Handle Coinbase events
```

## 🎯 Key Features by Directory

### 📁 Frontend (`/frontend`)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 (zero-config setup)
- **Language**: TypeScript with strict mode
- **UI Components**: 
  - Modern landing page with gradient design
  - Payment button with loading states
  - Success page for completed payments
  - Responsive design for all screen sizes

### 📁 Backend (`/backend`)
- **Framework**: Express.js with TypeScript
- **API Endpoints**:
  - `POST /api/checkout` - Creates Coinbase Commerce checkout sessions
  - `POST /api/webhook` - Processes payment status webhooks
  - `GET /health` - Health check endpoint
- **Security**: CORS, Helmet, input validation
- **Docker**: Production-ready containerization

## 🔧 Configuration Files

### Frontend Configuration
- `next.config.ts` - Next.js configuration with Turbo support
- `postcss.config.js` - PostCSS setup for Tailwind CSS v4
- `tsconfig.json` - TypeScript with strict mode and path mapping
- `.eslintrc.json` - ESLint with Next.js and TypeScript rules
- `.prettierrc` - Code formatting with Tailwind class sorting

### Backend Configuration  
- `tsconfig.json` - Node.js TypeScript configuration
- `.eslintrc.json` - ESLint for Node.js and TypeScript
- `Dockerfile` - Multi-stage Docker build for production
- `.env` - Environment variables for API keys and configuration

## 🚀 Development Workflow

### Quick Start
```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend in development mode
npm run dev
```

### Individual Services
```bash
# Frontend only (http://localhost:3000)
npm run dev:frontend

# Backend only (http://localhost:3001)  
npm run dev:backend
```

### Production Build
```bash
# Build both applications
npm run build

# Start production servers
npm run start
```

## 🔗 API Integration Flow

1. **User clicks "Pay with Card"** on frontend landing page
2. **Frontend sends POST request** to `/api/checkout` with payment details
3. **Backend creates checkout session** (currently dummy data, ready for Coinbase API)
4. **User redirected to payment page** (currently success page for demo)
5. **Coinbase sends webhook events** to `/api/webhook` for status updates
6. **Backend processes webhook** and logs payment status changes

## 🎨 Tailwind CSS v4 Implementation

This project showcases the latest Tailwind CSS v4 features:

- **Zero Configuration**: No `tailwind.config.js` required
- **PostCSS Plugin**: Uses `@tailwindcss/postcss` for processing
- **CSS Import**: Simple `@import "tailwindcss"` in globals.css
- **Modern Utilities**: Latest gradient, spacing, and responsive utilities
- **Automatic Purging**: Built-in unused CSS removal

## 🔐 Security Considerations

- API keys stored in environment variables
- CORS configured for specific origins
- Webhook signature verification ready for production
- Input validation on all API endpoints
- Helmet.js for security headers
- Docker container runs as non-root user

## 📦 Dependencies Overview

### Frontend Dependencies
- `next` - React framework with App Router
- `react` & `react-dom` - React 19
- `axios` - HTTP client for API calls
- `tailwindcss` - CSS framework v4
- `typescript` - Type safety

### Backend Dependencies
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `helmet` - Security middleware
- `dotenv` - Environment variable management
- `axios` - HTTP client for Coinbase API
- `tsx` - TypeScript execution for development