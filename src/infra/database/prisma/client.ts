import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "../../env/env.js";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pgPool: Pool;
};

// #region agent log
fetch('http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:16',message:'Pool initialization start',data:{hasExistingPool:!!globalForPrisma.pgPool,nodeEnv:env.NODE_ENV,databaseUrlLength:env.DATABASE_URL?.length||0,databaseUrlPreview:env.DATABASE_URL?.replace(/:[^:@]+@/,':***@')||'missing'},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1,H2,H4'})}).catch(()=>{});
// #endregion

// Criar pool do pg para o adapter
const pgPool =
  globalForPrisma.pgPool ||
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

// #region agent log
if (!globalForPrisma.pgPool) {
  fetch('http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:28',message:'New pool created',data:{poolId:pgPool?.totalCount||0},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1,H4'})}).catch(()=>{});
  
  // Test pool connection
  pgPool.query('SELECT 1 as test').then(() => {
    fetch('http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:32',message:'Pool connection test SUCCESS',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1,H4'})}).catch(()=>{});
  }).catch((err) => {
    fetch('http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:35',message:'Pool connection test FAILED',data:{error:err.message,code:err.code},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1,H2,H3'})}).catch(()=>{});
  });
}
// #endregion

if (env.NODE_ENV !== "production") globalForPrisma.pgPool = pgPool;

// #region agent log
fetch('http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:40',message:'Creating PrismaPg adapter',data:{hasPrisma:!!globalForPrisma.prisma},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4,H5'})}).catch(()=>{});
// #endregion

const adapter = new PrismaPg(pgPool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "dev" ? ["query"] : [],
    adapter,
  });

// #region agent log
if (!globalForPrisma.prisma) {
  fetch('http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:52',message:'New PrismaClient created with adapter',data:{hasAdapter:!!adapter},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4,H5'})}).catch(()=>{});
}
// #endregion

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Garantir que o pool seja fechado quando a aplicação encerrar
if (env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    await pgPool.end();
  });
}
