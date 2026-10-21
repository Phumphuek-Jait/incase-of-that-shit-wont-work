import express from 'express';

import { errorHandler, notFoundHandler } from './middlewares/exam-error-handler.js';
import { queryParser } from './middlewares/exam-pagination-middleware.js';
import entityRouter from './routes/exam-crud-route.js';

// [แก้ตรงนี้] ใส่รหัสนักศึกษาตามโจทย์จริง ห้ามใช้ค่าจากโจทย์ตัวอย่าง
const STUDENT_ID = 'REPLACE_WITH_YOUR_ID';

// [แก้ตรงนี้] เปลี่ยนชื่อ/secret ให้ตรงโจทย์จริงทุกตัวอักษร
const STUDENT_NAME = 'REPLACE_WITH_YOUR_NAME';
const STUDENT_SECRET = 'REPLACE_WITH_YOUR_SECRET';

const app = express();

// อ่าน JSON body เพื่อให้ POST/PUT ใช้ req.body ได้
app.use(express.json());

// [ปรับตามโจทย์] defaultLimit ใช้เมื่อไม่ส่ง page size; ไม่มีเพดาน limit
app.use(queryParser({
  defaultLimit: 10,
  invalid: 'default', // เปลี่ยนเป็น 'error' หากโจทย์ให้ตอบ 400 เมื่อ query ผิด
}));

// Identity endpoint มักตรวจข้อความและรูปแบบ JSON แบบตรงตัว
app.get(`/api/${STUDENT_ID}/student-info`, (req, res) => {
  res.json({
    success: true,
    data: {
      studentId: STUDENT_ID,
      name: STUDENT_NAME,
      secretKey: STUDENT_SECRET,
    },
    timestamp: new Date().toISOString(),
  });
});

// [แก้ตรงนี้] เปลี่ยน resource และ router ให้ตรง endpoint ในโจทย์ เช่น products
app.use(`/api/${STUDENT_ID}/REPLACE_WITH_RESOURCE`, entityRouter);

// ต้องอยู่หลัง routes: route ที่ไม่มีจะกลายเป็น 404 แล้วค่อยส่งเข้า errorHandler
app.use(notFoundHandler);
app.use(errorHandler);

// เริ่ม server หลังลงทะเบียน middleware ครบแล้ว
app.listen(3000, () => {
  console.log('API listening on port 3000');
});


