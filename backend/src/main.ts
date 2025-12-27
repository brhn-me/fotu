import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

// Load env vars
import dotenv from 'dotenv'
dotenv.config()

import { config, initializeStorage } from './config'

// Initialize storage directories
initializeStorage()

// Seed default settings
import { seedDefaultSettings } from './services/settingsService'
seedDefaultSettings()

const app = express()
const port = config.port

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Swagger Setup
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Photo Organizer API',
            version: '1.0.0',
        },
    },
    apis: ['./src/api/*.ts'], // Path to the API docs
}
const specs = swaggerJsdoc(options)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// TODO: Import and use routes
import settingsRouter from './api/settings'
import runtimesRouter from './api/runtimes'

app.use('/api/settings', settingsRouter)
app.use('/api/runtimes', runtimesRouter)
// import sourcesRouter from './api/sources'

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`)
})
