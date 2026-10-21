// AppError ใช้ส่ง error ที่เราตั้งใจควบคุม เช่น 404 หรือ 409
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = code;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

// [แก้ได้] รูปแบบนี้ทำให้ URL ที่ไม่มี route ตอบ 404 ใน error envelope เดียวกัน
export function notFoundHandler(req, res, next) {
  next(new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND',
  ));
}

// Error middleware ต้องมี 4 arguments และ mount หลัง routes ทั้งหมด
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status = err.statusCode ?? err.status ?? 500;
  let code = err.errorCode ?? err.code ?? 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Unexpected server error';

  // [เพิ่ม/แก้ตรงนี้] แปลง MySQL error code เป็น HTTP status และข้อความที่ API ใช้
  const mysqlErrors = {
    ER_DUP_ENTRY: [409, 'DUPLICATE_KEY', 'Resource already exists'],
    ER_NO_REFERENCED_ROW_2: [400, 'FOREIGN_KEY_NOT_FOUND', 'Referenced record does not exist'],
    ER_ROW_IS_REFERENCED_2: [409, 'RESOURCE_IN_USE', 'Resource is referenced by other records'],
    ER_BAD_FIELD_ERROR: [400, 'INVALID_FIELD', 'Unknown field in request'],
    ER_DATA_TOO_LONG: [400, 'VALUE_TOO_LONG', 'A value exceeds the allowed length'],
    ER_TRUNCATED_WRONG_VALUE: [400, 'INVALID_VALUE', 'A value has an invalid format'],
    ECONNREFUSED: [503, 'DATABASE_UNAVAILABLE', 'Database is unavailable'],
    ETIMEDOUT: [503, 'DATABASE_TIMEOUT', 'Database request timed out'],
  };

  if (mysqlErrors[err.code]) {
    [status, code, message] = mysqlErrors[err.code];
  }

  // JSON ที่ส่งมาไม่ถูกต้องจะถูก express.json() โยน SyntaxError มาให้
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Request body contains invalid JSON';
  }

  // ป้องกัน status ที่ผิดรูปแบบ และไม่เปิดเผยรายละเอียด server error ให้ client
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    status = 500;
  }

  if (status >= 500 && !(err instanceof AppError)) {
    code = 'INTERNAL_SERVER_ERROR';
    message = 'Unexpected server error';
  }

  return res.status(status).json({
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString(),
  });
}
