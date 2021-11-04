import { Errors } from '../utils/errors';

export interface DatasetAttribute {
    name: string;
    numeric: boolean;
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

export interface ModelsResponse {
    success?: boolean;
    attributes?: DatasetAttribute[];
    model?: Model | Model[];
    error?: string | string[] | Errors;
}
