export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean;
    settings: Record<string, unknown>;
    createdAt: number;
    lastLogin: number | null;
}

export interface Model {
    id: number;
    username: string;
    name: string;
    description: string;
    dataset: string;
    online: boolean;
    active: boolean;
    public: boolean;
    createdAt: number;
    model?: string;
}
