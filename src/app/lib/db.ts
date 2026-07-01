import mysql from "mysql2/promise"; 

const host = process.env.MYSQL_HOST || "localhost";
const isLocal = host === "localhost" || host === "127.0.0.1";

export const db = mysql.createPool({
  host,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "root",
  database: process.env.MYSQL_DATABASE || "Applications",
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isLocal ? undefined : { rejectUnauthorized: false }
});