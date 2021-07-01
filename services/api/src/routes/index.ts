import { Router } from 'express';

import requireAuth from '../middleware/requireAuth';
import * as auth from '../controllers/auth';
import * as users from '../controllers/users';
import * as models from '../controllers/models';

const router = Router();

const authPath = '/auth';
router.post(`${authPath}/login`, auth.logIn);
router.delete(`${authPath}/logout`, requireAuth, auth.logOut);
router.get(`${authPath}/status`, auth.getStatus);
router.post(`${authPath}/registration`, auth.register);
router.post(`${authPath}/activation`, auth.activate);
router.post(`${authPath}/password`, auth.initiatePasswordReset);
router.put(`${authPath}/password`, auth.resetPassword);

const usersPath = '/users';
router.post(`${usersPath}/`, users.createUser);
router.get(`${usersPath}/:id`, requireAuth, users.getUser);
router.put(`${usersPath}/:id`, requireAuth, users.updateUser);
router.delete(`${usersPath}/:id`, requireAuth, users.deleteUser);

const modelsPath = '/models';
router.post(`${modelsPath}/`, requireAuth, models.createModel);
router.get(`${modelsPath}/`, requireAuth, models.getModels);
router.get(`${modelsPath}/:id`, requireAuth, models.getModel);
router.put(`${modelsPath}/:id`, requireAuth, models.updateModel);
router.delete(`${modelsPath}/:id`, requireAuth, models.deleteModel);

export default router;
