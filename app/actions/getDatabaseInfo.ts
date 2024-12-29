import { prisma } from '@/lib/db-config'
import { Prisma } from '@prisma/client'

export async function getDatabaseInfo() {
  try {
    // Basic database information using Prisma's internal methods
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `

    // Get row count estimate
    const rowCount = await prisma.$queryRaw`
      SELECT COALESCE(SUM(n_live_tup), 0) as count 
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
    `

    // Get database size
    const dbSize = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `

    // Get active connections
    const connections = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `

    return {
      provider: 'postgresql',
      version: 'PostgreSQL',
      database: 'loans_v2',
      size: (dbSize as any)[0]?.size || 'Unknown',
      activeConnections: Number((connections as any)[0]?.count || 0),
      tableCount: Number((tables as any)[0]?.count || 0),
      totalRows: String((rowCount as any)[0]?.count || 0),
      status: 'connected'
    }
  } catch (error) {
    console.error('Database info error:', error)
    return {
      provider: 'postgresql',
      version: 'PostgreSQL',
      database: 'loans_v2',
      size: 'Unknown',
      activeConnections: 0,
      tableCount: 0,
      totalRows: '0',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 