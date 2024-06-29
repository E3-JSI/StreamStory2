import { Router } from 'express';

import requirePrivateApiKey from '../../../middleware/requirePrivateApiKey';
import * as models from '../../../controllers/v1/models';

const router = Router();

const modelsPath = '/models';
router.get(`${modelsPath}`, requirePrivateApiKey, models.getModels);
// router.post(`${modelsPath}`, requirePrivateApiKey, models.createModel);
router.get(`${modelsPath}/:uuid`, requirePrivateApiKey, models.getModel);
router.delete(`${modelsPath}/:uuid`, requirePrivateApiKey, models.deleteModel);
router.post(`${modelsPath}/:uuid/classification`, requirePrivateApiKey, models.getModelClassification);

export default router;
