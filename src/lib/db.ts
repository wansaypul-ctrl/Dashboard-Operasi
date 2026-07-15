import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Returns the SQLite database path for the current environment.
 *
 * - LOCAL DEV: uses DATABASE_URL from .env (file:/home/z/my-project/db/custom.db)
 * - VERCEL BUILD: uses DATABASE_URL from env (file:./db/vercel-prod.db) — writable during build
 * - VERCEL RUNTIME: copies the bundled DB to /tmp (the only writable directory on serverless)
 *   and returns the /tmp path. SQLite needs write access for its journal/WAL files.
 */
function resolveDbUrl(): string {
  const envUrl = process.env.DATABASE_URL

  // On Vercel serverless runtime — copy bundled DB to /tmp
  if (process.env.VERCEL && process.env.VERCEL_ENV === 'production') {
    const tmpPath = '/tmp/vercel-prod.db'
    const bundledPath = path.join(process.cwd(), 'db', 'vercel-prod.db')

    if (!fs.existsSync(tmpPath) && fs.existsSync(bundledPath)) {
      try {
        fs.copyFileSync(bundledPath, tmpPath)
        console.log('[db] Copied bundled SQLite to /tmp for serverless runtime')
      } catch (e) {
        console.error('[db] Failed to copy DB to /tmp:', e)
      }
    }
    return `file:${tmpPath}`
  }

  return envUrl || 'file:./db/custom.db'
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: { url: resolveDbUrl() },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
