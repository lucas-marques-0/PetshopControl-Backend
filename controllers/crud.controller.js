import { pool } from "../db.js";

const validTables = {
  pets: ["name", "species", "breed", "age", "tutor_id"],
  tutors: ["name", "phone", "address"],
  services: ["name", "description", "price"],
  products: ["name", "description", "price", "stock"],
  appointments: ["tutor_id", "pet_id", "service_id", "datetime", "status"],
};

// 💬 Traduz erros do PostgreSQL em linguagem humana
function humanizeError(err) {
  const msg = err.message || "";

  if (msg.includes("foreign key constraint"))
    return "⚠️ O item relacionado não existe (verifique o tutor, pet ou serviço).";
  if (msg.includes("invalid input syntax for type integer"))
    return "⚠️ Um campo numérico recebeu texto — digite apenas números.";
  if (msg.includes("violates not-null constraint"))
    return "⚠️ Um campo obrigatório não foi preenchido.";
  if (msg.includes("unique constraint"))
    return "⚠️ Já existe um registro com esses dados.";
  if (msg.includes("syntax error"))
    return "⚠️ Erro de sintaxe na requisição (campo ou valor incorreto).";

  return "❌ Erro inesperado no servidor. Verifique os dados e tente novamente.";
}

function success(data, message = "✅ Operação concluída com sucesso!") {
  return { success: true, message, data };
}

function failure(message) {
  return { success: false, message };
}

// 🔎 Valida campos obrigatórios e tipos básicos
function validateData(table, data) {
  const requiredFields = validTables[table];
  if (!requiredFields) return "Tabela inválida.";

  // Verifica se todos os campos obrigatórios existem e têm valor válido
  for (const field of requiredFields) {
    const value = data[field];
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "number" && isNaN(value))
    ) {
      return '⚠️ Todos os campos são obrigatórios, preencha tudo corretamente.';
    }
  }

  // Validação leve por tipo de campo
  if (data.price && isNaN(Number(data.price)))
    return "⚠️ O campo 'price' deve conter apenas números.";
  if (data.stock && isNaN(Number(data.stock)))
    return "⚠️ O campo 'stock' deve conter apenas números.";
  if (data.age && isNaN(Number(data.age)))
    return "⚠️ O campo 'age' deve conter apenas números.";

  return null; // Tudo certo
}

export async function getAll(req, res) {
  try {
    const table = req.params.table?.trim().replace(/\/+$/, "");
    if (!validTables[table])
      return res.status(400).json(failure("Tabela inválida."));

    let result;

    if (table === "appointments") {
      result = await pool.query(`
        SELECT 
          a.id,
          t.name AS tutor_name,
          p.name AS pet_name,
          s.name AS service_name,
          a.datetime,
          a.status
        FROM appointments a
        LEFT JOIN tutors t ON a.tutor_id = t.id
        LEFT JOIN pets p ON a.pet_id = p.id
        LEFT JOIN services s ON a.service_id = s.id
        ORDER BY a.id DESC
      `);
    } else {
      result = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
    }

    res.json(success(result.rows, "✅ Dados carregados com sucesso!"));
  } catch (err) {
    res.status(400).json(failure(humanizeError(err)));
  }
}

export async function createItem(req, res) {
  try {
    const table = req.params.table?.trim().replace(/\/+$/, "");
    const data = req.body;

    if (!validTables[table])
      return res.status(400).json(failure("Tabela inválida."));

    // ✅ Validação antes de inserir
    const validationError = validateData(table, data);
    if (validationError)
      return res.status(400).json(failure(validationError));

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");

    const result = await pool.query(
      `INSERT INTO ${table} (${keys.join(",")}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    res.json(success(result.rows[0], "✅ Registro criado com sucesso!"));
  } catch (err) {
    res.status(400).json(failure(humanizeError(err)));
  }
}

export async function updateItem(req, res) {
  try {
    const table = req.params.table?.trim().replace(/\/+$/, "");
    const { id } = req.params;
    const data = req.body;

    if (!validTables[table])
      return res.status(400).json(failure("Tabela inválida."));

    // ✅ Validação antes de atualizar
    const validationError = validateData(table, data);
    if (validationError)
      return res.status(400).json(failure(validationError));

    const keys = Object.keys(data);
    const values = Object.values(data);
    const updates = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");

    const result = await pool.query(
      `UPDATE ${table} SET ${updates} WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json(failure("Registro não encontrado."));

    res.json(success(result.rows[0], "✅ Registro atualizado com sucesso!"));
  } catch (err) {
    res.status(400).json(failure(humanizeError(err)));
  }
}

export async function deleteItem(req, res) {
  try {
    const table = req.params.table?.trim().replace(/\/+$/, "");
    const { id } = req.params;

    if (!validTables[table])
      return res.status(400).json(failure("Tabela inválida."));

    const result = await pool.query(`DELETE FROM ${table} WHERE id=$1`, [id]);

    if (result.rowCount === 0)
      return res.status(404).json(failure("Registro não encontrado."));

    res.json(success(null, "🗑️ Registro deletado com sucesso!"));
  } catch (err) {
    res.status(400).json(failure(humanizeError(err)));
  }
}
