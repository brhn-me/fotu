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

import { createServer } from 'http'
// Bull Board Imports
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getQueue } from './lib/queue';
import { JOBS_CONFIG } from './config/jobsConfig';

import { initWorkers } from './workers'
import { initQueues } from './lib/queue'
initQueues()

// Create Express app
const app = express()
const port = config.port

// Create HTTP Server
const httpServer = createServer(app)
import { initSocket } from './lib/socket'
initSocket(httpServer)

// Initialize Workers
initWorkers()

// Middleware
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for Bull Board for now or configure strictly
}))
app.use(cors())
app.use(express.json())

// Bull Board Setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/jobs/queues');

const queues = Object.keys(JOBS_CONFIG).map(key => {
    return new BullMQAdapter(getQueue(key as any));
});

createBullBoard({
    queues,
    serverAdapter,
});

app.use('/jobs/queues', serverAdapter.getRouter());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fotu API',
            version: '1.0.0',
            description: 'API documentation for Fotu Photo Management System',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/api/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
import settingsRouter from './api/settings'
import runtimesRouter from './api/runtimes'
import sourcesRouter from './api/sources'
import jobsRouter from './api/jobs'
import statsRouter from './api/stats'

app.use('/api/settings', settingsRouter)
app.use('/api/runtimes', runtimesRouter)
app.use('/api/sources', sourcesRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/stats', statsRouter)

const server = httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`)
})

// Graceful shutdown
import { closeWorkers } from './workers'
import { closeQueues } from './lib/queue'
import prisma from './db/client'

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('Received kill signal, shutting down gracefully');

    // Stop accepting new connections
    server.close(async () => {
        console.log('Closed out remaining connections');

        try {
            await closeWorkers();
            await closeQueues();
            await prisma.$disconnect();
            console.log('Database disconnected');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });

    // Force close after 10s
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

