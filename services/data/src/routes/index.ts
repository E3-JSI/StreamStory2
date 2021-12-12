import { Router } from 'express';

import * as data from '../controllers/data';

const router = Router();

const tsPath = '/data';
router.get(`${tsPath}`, data.getData);
router.get(`${tsPath}/last`, data.getLastDataPoint);

export default router;
