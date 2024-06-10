import { Router } from 'express';

import requirePrivateApiKey from '../../../middleware/requirePrivateApiKey';
import * as models from '../../../controllers/v1/models';

const router = Router();

const modelsPath = '/models';
router.get(`${modelsPath}`, requirePrivateApiKey, models.getModels);
router.get(`${modelsPath}/:uuid`, requirePrivateApiKey, models.getModel);
router.delete(`${modelsPath}/:id`, requirePrivateApiKey, models.deleteModel);

export default router;
