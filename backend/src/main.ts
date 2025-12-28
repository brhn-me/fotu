import './env'; // Load env vars BEFORE any other imports to avoid hoisting issues

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

import { config, initializeStorage } from './config'
import { settingsService } from './services/settingsService'
import { createServer } from 'http'
// Bull Board Imports
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getQueue } from './lib/queue';
import { JOBS_CONFIG } from './config/jobsConfig';

import { initWorkers, closeWorkers } from './workers'
import { initQueues, closeQueues } from './lib/queue'
import { initSocket } from './lib/socket'

import prisma from './db/client'

// Routes
import settingsRouter from './api/settings'
import runtimesRouter from './api/runtimes'
import sourcesRouter from './api/sources'
import jobsRouter from './api/jobs'
import statsRouter from './api/stats'

const bootstrap = async () => {
    // Initialize storage directories
    initializeStorage()

    // Initialize Queues
    initQueues()

    // Seed default settings and load cache
    // seedDefaults calls load() internally after seeding
    await settingsService.seedDefaults();

    // Explicit load just in case (idempotent)
    await settingsService.load();

    // Create Express app
    const app = express()
    const port = config.port

    // Create HTTP Server
    const httpServer = createServer(app)

    initSocket(httpServer)

    // Initialize Workers
    await initWorkers()

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

    app.use('/api/settings', settingsRouter)
    app.use('/api/runtimes', runtimesRouter)
    app.use('/api/sources', sourcesRouter)
    app.use('/api/jobs', jobsRouter)
    app.use('/api/stats', statsRouter)

    const server = httpServer.listen(port, () => {
        console.log(`Server running on port ${port}`)
        console.log(`Swagger docs available at http://localhost:${port}/api-docs`)
    })

    return server;
}

// Graceful shutdown
const gracefulShutdown = async (server: any) => {
    console.log('Received kill signal, shutting down gracefully');

    if (server) {
        // Stop accepting new connections
        server.close(async () => {
            console.log('Closed out remaining connections');
            await performShutdown();
        });
    } else {
        await performShutdown();
    }

    // Force close after 10s
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

const performShutdown = async () => {
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
}

// Start application
let serverInstance: any;

bootstrap().then(server => {
    serverInstance = server;
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown(serverInstance));
process.on('SIGINT', () => gracefulShutdown(serverInstance));
