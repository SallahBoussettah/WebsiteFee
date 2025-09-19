import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import checkoutRoutes from './routes/checkout'
import webhookRoutes from './routes/webhook'
import cdpWebhookRoutes from './routes/cdp-webhook'
import onrampRoutes from './routes/onramp'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://1899rp.store',
    'https://www.1899rp.store'
  ],
  credentials: true
}))

// Raw body parser for webhooks (must be before express.json())
app.use('/api/webhook', express.raw({ type: 'application/json' }))

// JSON parser for other routes
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', checkoutRoutes)
app.use('/api', webhookRoutes)
app.use('/api', cdpWebhookRoutes)
app.use('/api', onrampRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})