
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root (backend/.env)
// Since we run from backend/src, we might need to adjust path ifcwd is different
// But usually dotenv.config() looks in process.cwd().
// Let's be explicit if possible or just rely on default.
dotenv.config();
