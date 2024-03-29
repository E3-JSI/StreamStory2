import axios, { AxiosResponse } from 'axios';

import { ApiError } from './index';
import { AppTheme } from '../contexts/SessionContext';

export enum UserGroup {
    Admin = 1,
    Standard = 2,
}

export interface User {
    id: number;
    groupId: number;
    name: string;
    email: string;
    active: boolean;
    settings: Record<string, unknown>;
    createdAt: number;
    lastLogin: number | null;
}

export interface UsersResponse {
    error?: ApiError;
}

// Get users
// ---------

export interface GetUsersResponse extends UsersResponse {
    users?: User[];
}

export async function getUsers(): Promise<AxiosResponse<GetUsersResponse>> {
    return axios.get<GetUsersResponse>('/api/users');
}

// Update current user details
// ---------------------------

export interface UpdateCurrentUserDetailsRequest {
    name: string;
}

export interface UpdateCurrentUserDetailsResponse extends UsersResponse {
    user?: User;
}

export async function updateCurrentUserDetails(
    request: UpdateCurrentUserDetailsRequest,
): Promise<AxiosResponse<UpdateCurrentUserDetailsResponse>> {
    return axios.put<UpdateCurrentUserDetailsResponse>('/api/users/current', request);
}

// Update current user settings
// ----------------------------

export interface UpdateCurrentUserSettingsRequest {
    theme?: AppTheme;
    language?: string;
}

export interface UpdateCurrentUserSettingsResponse extends UsersResponse {
    user?: User;
}

export async function updateCurrentUserSettings(
    request: UpdateCurrentUserSettingsRequest,
): Promise<AxiosResponse<UpdateCurrentUserSettingsResponse>> {
    return axios.put<UpdateCurrentUserSettingsResponse>('/api/users/current', {
        settings: request,
    });
}

// Change current user password
// ----------------------------

export interface ChangeCurrentUserPasswordRequest {
    oldPassword: string;
    newPassword: string;
    newPassword2: string;
}

export interface ChangeCurrentUserPasswordResponse extends UsersResponse {
    success?: boolean;
}

export async function changeCurrentUserPassword(
    request: ChangeCurrentUserPasswordRequest,
): Promise<AxiosResponse<ChangeCurrentUserPasswordResponse>> {
    return axios.put<ChangeCurrentUserPasswordResponse>('/api/users/current', request);
}

// Delete current model
// --------------------

export interface DeleteCurrentUserResponse extends UsersResponse {
    success?: boolean;
}

export async function deleteCurrentUser(): Promise<AxiosResponse<DeleteCurrentUserResponse>> {
    return axios.delete<DeleteCurrentUserResponse>('/api/users/current');
}
