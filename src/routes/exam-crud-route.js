import express from 'express';
import httpStatus from 'http-status';

import * as service from '../services/exam-crud-service.js';
import { apiResponse } from '../mappers/exam-api-response.js';

const router = express.Router();

// ใช้ชื่อ service method ตาม route/service ใน template เดิม
router.get('/', async (req, res) => {
  const viewType = req.query.view ?? 'summary';
  const objects = await service.getAllObjects(req.pagination, viewType);

  return apiResponse(res, objects, req.pagination);
});

router.get('/:id', async (req, res) => {
  const viewType = req.query.view ?? 'full';
  const object = await service.getObject(req.params.id, viewType);

  return apiResponse(res, object);
});

router.post('/', async (req, res) => {
  const object = await service.createObject(req.body);

  return apiResponse(res, object, null, httpStatus.CREATED);
});

router.put('/:id', async (req, res) => {
  const object = await service.updateObject(req.params.id, req.body);

  return apiResponse(res, object);
});

router.delete('/:id', async (req, res) => {
  await service.removeObject(req.params.id);

  return apiResponse(res, null, null, httpStatus.NO_CONTENT);
});

export default router;
