import * as repo from '../repositories/exam-crud-repo.js';
import EntityMapper from '../mappers/exam-entity-mapper.js';

// ชื่อ methods ให้ตรงกับ *-service.js ที่มีอยู่ใน template
export async function getObject(id, viewType = 'full') {
  const object = await repo.findOne(id);
  return EntityMapper.map(object, viewType);
}

export async function getAllObjects(pagination = null, viewType = 'summary') {
  const objects = await repo.findAll(pagination);
  return EntityMapper.maps(objects, viewType);
}

export async function updateObject(id, data) {
  return repo.update(id, data);
}

export async function removeObject(id) {
  return repo.remove(id);
}

export async function createObject(data) {
  return repo.create(data);
}
