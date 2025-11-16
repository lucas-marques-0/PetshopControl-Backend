import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createTables } from "./models/database.model.js";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import apiRoutes from "./routes/api.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

pool.connect()
  .then(async () => {
    console.log("✅ Conectado ao banco PostgreSQL!");
    await createTables();
  })
  .catch(err => console.error("❌ Erro ao conectar ao banco:", err.message));

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
);