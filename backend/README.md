# Fotu Backend ⚙️

The backend of Fotu is a robust, high-performance API and background processing engine built with Node.js, Express, and TypeScript.

## 🚀 Core Technologies

- **Runtime**: Node.js
- **API Framework**: Express.js
- **Language**: TypeScript (Strict Typing)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Job Queue**: BullMQ (Redis-backed)
- **Real-time**: Socket.io
- **API Docs**: Swagger/OpenAPI 3.0
- **Validation**: Zod
- **Security**: Helmet, CORS

## 🏗️ Architecture

The backend follows a service-oriented architecture with a focus on background job processing.

### 1. API Layer
Built with Express, the API handles client requests for settings, media metadata, sources, and job management.

### 2. Job Processing (BullMQ)
Heavy tasks like directory scanning and media hashing are handled by background workers.
- **Main Worker**: Handles the orchestration of jobs.
- **Scan Job**: Recursively scans directories for media files and updates the database.
- **Hash Job**: Computes unique hashes for media files to identify duplicates.

### 3. Real-time Communication
Socket.io is used to stream job progress updates to the frontend in real-time.

### 4. Database
Prisma ORM is used to interact with a PostgreSQL database, ensuring type safety and efficient migrations.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm
- Redis (running on port 6380 by default)
- PostgreSQL (running on port 5433 by default)

### Environment Variables
Create a `.env` file in this directory with the following variables:
```env
DATABASE_URL=postgresql://fotu:fotu@localhost:5433/fotu
REDIS_URL=redis://localhost:6380
PORT=3000
ADMIN_USERNAME=fotu
ADMIN_PASSWORD=fotu
FOTU_DATA_DIR=/path/to/your/media
```

### Installation & Run
```bash
pnpm install
pnpm prisma:migrate
pnpm dev
```

## 📁 Project Structure

```text
backend/
├── src/
│   ├── api/          # Route handlers
│   ├── config/       # Configuration logic
│   ├── controllers/  # Business logic controllers
│   ├── db/           # Prisma client initialization
│   ├── jobs/         # BullMQ job definitions
│   ├── lib/          # Utility libraries (Queue, Socket)
│   ├── middleware/   # Express middleware
│   ├── services/     # Core services (Settings, Runtimes)
│   ├── main.ts       # API Server entry point
│   └── workers.ts    # Background worker entry point
├── prisma/           # Database schema and migrations
└── config.yml        # Application settings
```

## 📡 API Endpoints (Summarized)

- **GET /api/settings**: Retrieve system settings.
- **GET /api/sources**: List all media sources.
- **POST /api/jobs**: Start background jobs (Scan, Hash).
- **GET /api/runtimes**: Monitor background workers.

Full documentation is available at `http://localhost:3000/api-docs` when the server is running.

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the server in development mode with nodemon |
| `pnpm build` | Compiles TypeScript to JavaScript |
| `pnpm start` | Runs the compiled server |
| `pnpm prisma:migrate` | Runs database migrations |
| `pnpm prisma:generate` | Generates Prisma client types |
