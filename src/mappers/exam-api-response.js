import httpStatus from 'http-status';

// Signature เดียวกับ api-response.js เดิม: apiResponse(res, data, pagination, status)
export async function apiResponse(
  res,
  data,
  pagination = null,
  status = httpStatus.OK,
) {
  // 204 No Content ต้องไม่มี response body
  if (status === httpStatus.NO_CONTENT) {
    return res.status(status).end();
  }

  if (!pagination) {
    return res.status(status).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  const { page, limit } = pagination;
  const total = Number(data.totalItems ?? 0);
  const totalPages = Math.ceil(total / limit);

  return res.status(status).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
}
