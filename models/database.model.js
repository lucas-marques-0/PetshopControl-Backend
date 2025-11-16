import { pool } from "../db.js";

export async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tutors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS pets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT,
      breed TEXT,
      age INT,
      tutor_id INT REFERENCES tutors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10,2)
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10,2),
      stock INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      tutor_id INT REFERENCES tutors(id) ON DELETE SET NULL,
      pet_id INT REFERENCES pets(id) ON DELETE SET NULL,
      service_id INT REFERENCES services(id) ON DELETE SET NULL,
      datetime TIMESTAMP,
      status TEXT DEFAULT 'scheduled'
    );
  `);

  console.log("✅ Todas as tabelas foram criadas/verificadas!");
}
