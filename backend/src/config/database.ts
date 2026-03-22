import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(() => console.log('✅ Conectado a PostgreSQL (Supabase)'))
    .catch((err) => console.error('❌ Error conectando a la base de datos:', err));

export default pool;