import { Errors } from '../utils/errors';

export interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
    settings: Record<string, unknown>;
    createdAt: number;
    lastLogin: number | null;
}

export interface UsersResponse {
    success?: boolean;
    user?: User | User[];
    error?: string | string[] | Errors;
}
