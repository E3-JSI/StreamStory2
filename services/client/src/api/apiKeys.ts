import axios, { AxiosResponse } from 'axios';

import { ApiError } from './index';

export interface ApiKey {
    id: number;
    userId: number;
    value: string;
    domain: string;
}

export type ApiKeyConfiguration = Omit<ApiKey, 'id' | 'userId'> & {
    userId?: number;
};

export type ApiKeySettings = Omit<ApiKey, 'id' | 'userId' | 'value'>;

export interface ApiKeyResponse {
    error?: ApiError;
}

// Get API keys
// ------------

export interface GetApiKeysResponse extends ApiKeyResponse {
    apiKeys?: ApiKey[];
}

export async function getApiKeys(userId?: number): Promise<AxiosResponse<GetApiKeysResponse>> {
    return axios.get<GetApiKeysResponse>(
        '/api/apikeys',
        (userId && { params: { userId } }) || undefined,
    );
}

// Get API key
// -----------

export interface GetApiKeyResponse extends ApiKeyResponse {
    apiKey?: ApiKey;
}

export async function getApiKey(id: number): Promise<AxiosResponse<GetApiKeyResponse>> {
    return axios.get<GetApiKeyResponse>(`/api/apikeys/${id}`);
}

// Add API key
// -----------

export interface AddApiKeyResponse extends ApiKeyResponse {
    apiKey?: ApiKey;
}

export async function addApiKey(
    config: ApiKeyConfiguration,
): Promise<AxiosResponse<AddApiKeyResponse>> {
    return axios.post<AddApiKeyResponse>('/api/apikeys', config);
}

// Update API key
// --------------

export interface UpdateApiKeyResponse extends ApiKeyResponse {
    apiKey?: ApiKey;
}

export async function updateApiKey(
    id: number,
    props: ApiKeySettings,
): Promise<AxiosResponse<UpdateApiKeyResponse>> {
    return axios.put<UpdateApiKeyResponse>(`/api/apikeys/${id}`, props);
}

// Delete API key
// --------------

export interface DeleteApiKeyResponse extends ApiKeyResponse {
    success?: boolean;
}

export async function deleteApiKey(id: number): Promise<AxiosResponse<DeleteApiKeyResponse>> {
    return axios.delete<DeleteApiKeyResponse>(`/api/apikeys/${id}`);
}
