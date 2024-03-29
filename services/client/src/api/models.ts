import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { ApiError } from './index';

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
    model?: any; // eslint-disable-line
}

export interface ModelConfiguration {
    online: boolean;
    dataset: string;
    selectedAttributes: string[];
    timeAttribute: string;
    timeUnit: string;
    includeTimeAttribute: boolean;
    categoricalAttributes: string[];
    derivatives: string[];
    clusteringAlgorithm: string;
    numberOfStates?: number;
    minNumberOfStates?: number;
    maxNumberOfStates?: number;
    stateRadius?: number;
    hierarchyType: string;
    ignoredAttributes: string[];
    name: string;
    description: string;
}

export interface ModelSettings {
    description?: string;
    active?: boolean;
    public?: boolean;
}

export interface ModelUiStateConfiguration {
    initialStates: string;
    label: string;
    description: string;
    eventId?: string;
}

export interface ModelResponse {
    error?: ApiError;
}

// Create model
// ------------

export interface CreateModelResponse extends ModelResponse {
    model?: Model;
}

export async function createModel(
    config: ModelConfiguration,
): Promise<AxiosResponse<CreateModelResponse>> {
    return axios.post<CreateModelResponse>('/api/models', config);
}

// Get model
// ---------

export interface GetModelResponse extends ModelResponse {
    model?: Model;
}

export async function getModel(id: number): Promise<AxiosResponse<GetModelResponse>> {
    return axios.get<GetModelResponse>(`/api/models/${id}`);
}

export async function getModelWithApiKey(
    id: number,
    apiKey: string,
): Promise<AxiosResponse<GetModelResponse>> {
    return axios.get<GetModelResponse>(`/api/iframe/models/${id}?apiKey=${apiKey}`);
}

// Get models
// ----------

export interface GetModelsResponse extends ModelResponse {
    models?: Model[];
}

export async function getModels(): Promise<AxiosResponse<GetModelsResponse>> {
    return axios.get<GetModelsResponse>('/api/models');
}

// Update model
// ------------

export interface UpdateModelResponse extends ModelResponse {
    model?: Model;
}

export async function updateModel(
    id: number,
    props: ModelSettings,
): Promise<AxiosResponse<UpdateModelResponse>> {
    return axios.put<UpdateModelResponse>(`/api/models/${id}`, props);
}

export async function updateModelState(
    id: number,
    props: ModelUiStateConfiguration,
): Promise<AxiosResponse<UpdateModelResponse>> {
    return axios.put<UpdateModelResponse>(`/api/models/${id}/states`, props);
}

// Delete model
// ------------

export interface DeleteModelResponse extends ModelResponse {
    success?: boolean;
}

export async function deleteModel(id: number): Promise<AxiosResponse<DeleteModelResponse>> {
    return axios.delete<DeleteModelResponse>(`/api/models/${id}`);
}

// Share model
// -----------

export interface ShareModelResponse extends ModelResponse {
    success?: boolean;
}

export async function shareModel(
    id: number,
    userIds: number[],
): Promise<AxiosResponse<ShareModelResponse>> {
    return axios.put<ShareModelResponse>(`/api/models/${id}/share`, { userIds });
}

// Get model users
// ---------------

export interface GetUserModelsResponse extends ModelResponse {
    userIds?: number[];
}

export async function getModelUsers(id: number): Promise<AxiosResponse<GetUserModelsResponse>> {
    return axios.get<GetUserModelsResponse>(`/api/models/${id}/users`);
}

// Upload data
// -----------

export interface LoadDataResponse extends ModelResponse {
    attributes?: DatasetAttribute[];
}

export async function uploadData(
    file: Blob,
    { headers, ...config }: AxiosRequestConfig,
): Promise<AxiosResponse<LoadDataResponse>> {
    const data = new FormData();
    data.append('file', file);

    return axios.post<LoadDataResponse>('/api/models/data', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...(headers || {}),
        },
        ...config,
    });
}

// Load data source
// ----------------

export async function loadDataSource(
    id: number,
    config: AxiosRequestConfig,
): Promise<AxiosResponse<LoadDataResponse>> {
    return axios.post<LoadDataResponse>('/api/models/data', { dataSourceId: id }, config);
}

// Delete data
// -----------

export interface DeleteDataResponse extends ModelResponse {
    success?: boolean;
}

export async function deleteData(): Promise<AxiosResponse<DeleteDataResponse>> {
    return axios.delete<DeleteDataResponse>('/api/models/data');
}
