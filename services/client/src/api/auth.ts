import { User } from './users';
import { Errors } from '../utils/errors';

export interface AuthResponse {
    success?: boolean;
    user?: User;
    error?: string | string[] | Errors;
}
