import axios, { AxiosResponse } from 'axios';

import { ApiError } from './index';

export interface DataSource {
    id: number;
    userId: number;
    name: string;
    description: string;
    url: string;
    timeWindowStart: number;
    timeWindowEnd: number;
    interval: number;
}

export type DataSourceConfiguration = Omit<DataSource, 'id' | 'userId'> & {
    userId?: number;
};

export type DataSourceSettings = Omit<DataSource, 'id' | 'userId'>;

export interface DataSourceResponse {
    error?: ApiError;
}

// Get data sources
// ----------------

export interface GetDataSourcesResponse extends DataSourceResponse {
    dataSources?: DataSource[];
}

export async function getDataSources(
    userId?: number,
): Promise<AxiosResponse<GetDataSourcesResponse>> {
    return axios.get<GetDataSourcesResponse>(
        '/api/datasources',
        userId ? { params: { userId } } : undefined,
    );
}

// Get data source
// ---------------

export interface GetDataSourceResponse extends DataSourceResponse {
    dataSource?: DataSource;
}

export async function getDataSource(id: number): Promise<AxiosResponse<GetDataSourceResponse>> {
    return axios.get<GetDataSourceResponse>(`/api/datasources/${id}`);
}

// Add data source
// ---------------

export interface AddDataSourceResponse extends DataSourceResponse {
    dataSource?: DataSource;
}

export async function addDataSource(
    config: DataSourceConfiguration,
): Promise<AxiosResponse<AddDataSourceResponse>> {
    return axios.post<AddDataSourceResponse>('/api/datasources', config);
}

// Update data source
// ------------------

export interface UpdateDataSourceResponse extends DataSourceResponse {
    dataSource?: DataSource;
}

export async function updateDataSource(
    id: number,
    props: DataSourceSettings,
): Promise<AxiosResponse<UpdateDataSourceResponse>> {
    return axios.put<UpdateDataSourceResponse>(`/api/datasources/${id}`, props);
}

// Delete data source
// ------------------

export interface DeleteDataSourceResponse extends DataSourceResponse {
    success?: boolean;
}

export async function deleteDataSource(
    id: number,
): Promise<AxiosResponse<DeleteDataSourceResponse>> {
    return axios.delete<DeleteDataSourceResponse>(`/api/datasources/${id}`);
}
