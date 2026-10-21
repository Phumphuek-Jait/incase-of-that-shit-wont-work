# Exam API template: คู่มือใช้ใน 15 นาที

ไฟล์ `src/**/exam-*` เป็นชุดอ้างอิงจาก template เดิม ปรับชื่อ entity/คอลัมน์ให้ตรงโจทย์ก่อนนำไปใช้ และคัดลอก/เปลี่ยนชื่อไฟล์เป็นชื่อที่ import ในโปรเจกต์ (ตัวอย่าง `exam-crud-repo.js` → `product-repo.js`). อย่าใช้ค่ารหัส/ชื่อ/secret จากโจทย์ตัวอย่าง ให้ใช้ข้อมูลเฉพาะตัวที่โจทย์จริงให้มา


## เปลี่ยนชื่อ entity ให้ครบ
| ชั้น | จุดที่แก้ |
|---|---|
| `exam-app.js` (คัดลอกเป็น app.js; เปลี่ยน ID/identity/resource) | ID, imports, `app.use('/api/'+ID+'/...')`, identity endpoint, `express.json()`, query parser และ error middleware ลำดับท้าย |
| `exam-crud-route.js` | ชื่อ service, path, ชื่อ param (`:id`), DTO view, status code |
| `exam-crud-service.js` | ใช้ชื่อเดิม: `getObject`, `getAllObjects`, `createObject`, `updateObject`, `removeObject` |
| `exam-crud-repo.js` | TABLE, ID/PK, ENTITY, columns/joins, unique key, insert ID (หลายตารางไม่ได้ใช้ auto increment) |
| `exam-entity-mapper.js` | สร้าง summary/detail field list ตามสัญญา API; map ชื่อ `brand_id` → `brandId` เป็นต้น |
| `exam-api-response.js` | ใช้ signature เดิม `apiResponse(res, data, pagination, status)` |
| `exam-pagination-middleware.js` | เลือกชื่อ query ที่โจทย์กำหนด (`limit` หรือ `size`), default เมื่อไม่ส่งค่า หรือ 400 เมื่อค่าไม่ถูกต้องตามโจทย์ |
| `exam-error-handler.js` | เพิ่ม mapping DB error เฉพาะที่พบ และรักษา error shape ที่ grader ต้องการ |

## Pagination ที่ต้องจำ
สูตร: `offset = (page - 1) * limit`; `totalPages = Math.ceil(total / limit)`; `hasNextPage = page < totalPages`; `hasPrevPage = page > 1`. Query rows ใช้ `LIMIT ? OFFSET ?` และ query COUNT ต้องนับ scope เดียวกันกับ list (เมื่อมี filter ต้องใส่ WHERE เดียวกันทั้งคู่). ไม่ส่ง pagination เมื่อโจทย์ไม่ร้องขอ; ถ้าส่ง page/limit ต้องได้ total count จริง ไม่ใช่จำนวนแถวในหน้านั้น. ตรวจหน้าเกิน total, total=0, ค่า 0/ลบ/ตัวอักษร และยืนยันว่าไม่มีเพดาน limit หากโจทย์ไม่กำหนด, ขาด page หรือ limit.

## DTO / request checklist
- Summary กับ detail เป็นคนละ allowlist; อย่าใช้ `...row` กับ summary.
- ตรวจชื่อ casing ตามตัวอย่าง grader (camelCase และ snake_case ถือว่าคนละ key).
- POST/PUT รับเฉพาะคอลัมน์ที่อนุญาต; ไม่ส่ง PK/created_at ที่ server คุม.
- ตรวจ required, type/number, enum, string length และ empty body ตามเวลาที่เหลือ.
- หากมี filter/sort/search ให้ whitelist ชื่อคอลัมน์ก่อนต่อ SQL; ใช้ bind parameters กับค่าข้อมูล (identifier ใช้ `?` ไม่ได้).

## Error/status cheat sheet
| เคส | Status ทั่วไป | ทำอย่างไร |
|---|---:|---|
| route/record ไม่มี | 404 | AppError `NOT_FOUND` |
| JSON เสีย / query หรือ body ไม่ถูก | 400 | `INVALID_JSON` / `VALIDATION_ERROR` |
| ID/path ไม่ใช่รูปแบบที่รับ | 400 | validate ก่อน query |
| duplicate unique/SKU | 409 | MySQL `ER_DUP_ENTRY` |
| FK อ้างอิงไม่มี | 400 | `ER_NO_REFERENCED_ROW_2` |
| ลบแล้วถูกอ้างถึง | 409 | `ER_ROW_IS_REFERENCED_2` |
| DB ใช้ไม่ได้/timeout | 503 | error mapping |
| ข้อผิดพลาดที่ไม่คาดคิด | 500 | ซ่อนรายละเอียดภายในจาก response |
| delete สำเร็จ | 204 | ไม่มี body |

## ลำดับ middleware สำคัญ
```js
app.use(express.json());
app.use(queryParser());
app.use('/api/' + ID + '/products', productRouter);
app.use(notFoundHandler);
app.use(errorHandler); // ลงทะเบียนหลัง routes และก่อน app.listen()
```
Express 5 ส่ง rejected async route ไป error middleware ได้; ถ้าโปรเจกต์เป็น Express 4 ให้ครอบ handler ด้วย try/catch/`next(err)` หรือ async wrapper.

## ตัวอย่างทดสอบเร็ว
```text
GET    /api/<ID>/student-info
GET    /api/<ID>/products?page=1&limit=10
GET    /api/<ID>/products/<id>
POST   /api/<ID>/products    (JSON body)
PUT    /api/<ID>/products/<id> (JSON body)
DELETE /api/<ID>/products/<id>
```
ตรวจ status + JSON keys + timestamp + pagination metadata + ไม่มี body ที่ 204. ทดสอบ unique ซ้ำและ ID ที่ไม่มีด้วย.

## จุดที่พลาดง่ายจาก template เดิม
- ต้อง mount `errorHandler` หลัง routes และก่อน `app.listen()`.
- อย่าใช้ `apiRespone` สะกดผิด; เรียก `apiResponse(res, data, null, httpStatus.CREATED)` ตาม signature เดิมของ template.
- DTO mapper ต้องเรียก `this.toSummaryDTO`; อย่าเรียกฟังก์ชันที่ไม่มี scope.
- `getObject` ต้องส่ง `viewType` ให้ mapper จริง.
- offset ต้องใช้ `limit` หลัง parse/clamp ไม่ใช้ query string ดิบ.
- ถ้า primary key ไม่ใช่ auto increment ให้หา record ด้วย key จาก request หลัง insert.

Template ช่วยลดงานซ้ำ แต่คะแนนยังขึ้นกับความตรงของ schema, field names, response shape และเงื่อนไขโจทย์จริง จึงให้โจทย์และ SQL เป็นแหล่งจริงเสมอ.


## ชื่อ method ให้ตรงกับ template เดิม

- **Route → Service:** `getAllObjects`, `getObject`, `createObject`, `updateObject`, `removeObject` ตามไฟล์ service เดิม
- **Service → Repository:** `findAll`, `findOne`, `create`, `update`, `remove` ตามไฟล์ repo เดิม
- **Mapper:** ใช้ `map(row, viewType)` และ `maps(rows, viewType)` ตาม `product-mapper.js`
- **Response:** เรียก `apiResponse(res, data, pagination, status)` ตาม `api-response.js`
- ไฟล์ `exam-*` ปรับให้เรียก method เหล่านี้แล้ว ถ้าคัดลอกไปใช้ให้เปลี่ยนชื่อ import ให้ตรงไฟล์จริง



