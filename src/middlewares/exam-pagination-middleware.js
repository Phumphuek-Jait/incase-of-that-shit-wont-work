// รองรับ query: ?page=2&limit=10 หรือ ?page=2&size=10
// page size ไม่มี min/max cap: ใช้ค่าบวกจำนวนเต็มที่โจทย์ส่งมาโดยตรง
export function queryParser({
  defaultLimit = 10,
  invalid = 'default',
} = {}) {
  return (req, res, next) => {
    const query = req.query ?? {};
    const pagingKeys = ['page', 'limit', 'size'];
    const hasPaging = pagingKeys.some((key) => query[key] !== undefined);

    // เมื่อไม่มี query pagination ให้ route เลือกว่าจะคืนทั้งหมดหรือใช้ default
    if (!hasPaging) {
      req.pagination = null;
      return next();
    }

    const parsePositiveInteger = (value, fallback) => {
      if (value === undefined || value === '') {
        return fallback;
      }

      const number = Number(value);
      return Number.isSafeInteger(number) && number > 0 ? number : null;
    };

    let page = parsePositiveInteger(query.page, 1);
    let limit = parsePositiveInteger(query.limit ?? query.size, defaultLimit);

    // invalid='error' ตอบ 400; invalid='default' ใช้ default เฉพาะค่าที่ไม่ถูกต้อง
    if (invalid === 'error' && (page === null || limit === null)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAGINATION',
          message: 'page and limit must be positive integers',
        },
        timestamp: new Date().toISOString(),
      });
    }

    page = page ?? 1;
    limit = limit ?? defaultLimit;

    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit,
    };

    return next();
  };
}
