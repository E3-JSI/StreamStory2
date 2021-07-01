import { User as UserModel } from '../../db/users';

declare global {
    namespace Express {
        interface Request {
            user?: UserModel;
        }
    }
}
