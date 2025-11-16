import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

let pool;

if (process.env.DATABASE_URL) {
  // Para produção no Replit
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  console.log("✅ Conectando ao PostgreSQL via DATABASE_URL (produção)...");
} else {
  // Para desenvolvimento local
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });
  console.log("✅ Conectando ao PostgreSQL local...");
}

export { pool };
