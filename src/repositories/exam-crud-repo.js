import db from '../configs/db-config.js';
import { AppError } from '../middlewares/exam-error-handler.js';

// [ต้องแก้ตาม SQL schema] ใส่ชื่อตาราง, primary key และ entity ตามโจทย์
const TABLE_NAME = 'YOUR_TABLE';
const PRIMARY_KEY = 'id';
const ENTITY_NAME = 'Entity';

async function countAll() {
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM ${TABLE_NAME}`,
  );

  return Number(total);
}

// Repository method names ตรงกับ *-repo.js ใน template เดิม
export async function findAll(pagination = null) {
  if (!pagination) {
    const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME}`);
    return rows;
  }

  const { limit, offset } = pagination;
  const [rows] = await db.query(
    `SELECT * FROM ${TABLE_NAME} LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  // COUNT(*) คือจำนวนทั้งหมด ใช้สร้าง pagination metadata
  rows.totalItems = await countAll();
  return rows;
}

export async function findOne(id) {
  const [rows] = await db.query(
    `SELECT * FROM ${TABLE_NAME} WHERE ${PRIMARY_KEY} = ?`,
    [id],
  );

  if (rows.length === 0) {
    throw new AppError(`${ENTITY_NAME} '${id}' not found`, 404, 'NOT_FOUND');
  }

  return rows[0];
}

export async function create(data) {
  const [result] = await db.query(
    `INSERT INTO ${TABLE_NAME} SET ?`,
    [data],
  );

  // [ปรับถ้า PK ไม่ใช่ auto increment] ใช้ key จาก request หรือ insertId
  const newId = data[PRIMARY_KEY] ?? result.insertId;
  return findOne(newId);
}

export async function update(id, data) {
  // เช็กก่อน update เพื่อให้ ID ที่ไม่มีตอบ 404 แม้ไม่มี field เปลี่ยน
  await findOne(id);

  await db.query(
    `UPDATE ${TABLE_NAME} SET ? WHERE ${PRIMARY_KEY} = ?`,
    [data, id],
  );

  return findOne(id);
}

export async function remove(id) {
  await findOne(id);

  await db.query(
    `DELETE FROM ${TABLE_NAME} WHERE ${PRIMARY_KEY} = ?`,
    [id],
  );
}
