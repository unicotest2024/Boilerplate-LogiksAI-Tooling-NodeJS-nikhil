import { getDBClient } from "../utils/dbClient.js";
import { DB_CONFIG } from "../config/dbConfig.js";

export async function getFileById(fileId) {
  if (DB_CONFIG.ENGINE === "mysql") {
    return await getFileByIdMySQL(fileId);
  } else if (DB_CONFIG.ENGINE === "mongo") {
    return await getFileByIdMongo(fileId);
  } else {
    throw new Error(`Unsupported DB engine: ${DB_CONFIG.ENGINE}`);
  }
}

// ---------- MySQL Implementation ----------
async function getFileByIdMySQL(fileId) {
  const db = await getDBClient();

  const sql = `
    SELECT *
    FROM file_tbl
    WHERE id = ? AND blocked = 'false'
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [fileId]);
  return rows.length > 0 ? rows[0] : null;
}

// ---------- MongoDB Implementation ----------
async function getFileByIdMongo(fileId) {
  const db = await getDBClient();
  const collection = db.collection("file_tbl");

  const record = await collection.findOne({
    id: fileId,
    blocked: "false",
  });

  return record || null;
}
