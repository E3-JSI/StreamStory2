import { Router } from 'express';

import * as data from '../controllers/data';

const router = Router();

const seriesPath = '/series';
router.get(`${seriesPath}`, data.getSeries);
router.get(`${seriesPath}/last`, data.getLastDataPoint);

export default router;
