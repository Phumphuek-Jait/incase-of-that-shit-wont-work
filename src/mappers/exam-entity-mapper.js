// รูปแบบเดียวกับ product-mapper.js เดิม: map() หนึ่งแถว, maps() หลายแถว
export default class EntityMapper {
  static toSummaryDTO(row) {
    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      brandId: row.brand_id ?? row.brandId,
      category: row.category,
      price: Number(row.price),
      status: row.status,
    };
  }

  static toDetailDTO(row) {
    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      brandId: row.brand_id ?? row.brandId,
      brandName: row.brand_name ?? row.brandName,
      category: row.category,
      price: Number(row.price),
      ramGb: row.ram_gb ?? row.ramGb,
      storageGb: row.storage_gb ?? row.storageGb,
      color: row.color,
      stockQuantity: row.stock_quantity ?? row.stockQuantity,
      status: row.status,
      releaseDate: row.release_date ?? row.releaseDate,
    };
  }

  // [ปรับถ้าโจทย์กำหนด view ชื่ออื่น] เลือก DTO ของหนึ่งแถว
  static map(row, viewType = 'full') {
    if (viewType === 'summary') {
      return this.toSummaryDTO(row);
    }

    return this.toDetailDTO(row);
  }

  static maps(rows, viewType = 'summary') {
    const totalItems = rows.totalItems;
    const mappedRows = rows.map((row) => this.map(row, viewType));

    // ส่ง totalItems ต่อให้ apiResponse สร้าง pagination metadata
    if (totalItems !== undefined) {
      mappedRows.totalItems = totalItems;
    }

    return mappedRows;
  }
}
