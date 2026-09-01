import { Pool } from 'pg';

const isLocal = process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL?.includes("render.com");
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/Applications";

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Wrapper to replace `?` with `$1`, `$2`, etc. so we don't have to rewrite every query
export const db = {
  query: async (text: string, params: any[] = []) => {
    let index = 1;
    const pgQuery = text.replace(/\?/g, () => `$${index++}`);
    const result = await pool.query(pgQuery, params);
    // mysql2 returns [rows, fields]. We simulate it for compatibility.
    return [result.rows, result.fields];
  },
  execute: async (text: string, params: any[] = []) => {
    let index = 1;
    const pgQuery = text.replace(/\?/g, () => `$${index++}`);
    const result = await pool.query(pgQuery, params);
    // mysql2 returns [resultHeader, fields]. We add an insertId for Postgres if returning was used (or just 0).
    const insertId = result.rows.length > 0 ? (result.rows[0].id || 0) : 0;
    return [{ insertId, affectedRows: result.rowCount }, result.fields];
  },
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: async (text: string, params: any[] = []) => {
        let index = 1;
        const pgQuery = text.replace(/\?/g, () => `$${index++}`);
        const result = await client.query(pgQuery, params);
        return [result.rows, result.fields];
      },
      execute: async (text: string, params: any[] = []) => {
        let index = 1;
        const pgQuery = text.replace(/\?/g, () => `$${index++}`);
        const result = await client.query(pgQuery, params);
        const insertId = result.rows.length > 0 ? (result.rows[0].id || 0) : 0;
        return [{ insertId, affectedRows: result.rowCount }, result.fields];
      },
      beginTransaction: async () => await client.query("BEGIN"),
      commit: async () => await client.query("COMMIT"),
      rollback: async () => await client.query("ROLLBACK"),
      release: () => client.release(),
    };
  }
};