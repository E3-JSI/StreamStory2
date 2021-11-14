import axios, { AxiosResponse } from 'axios';

import { ApiError } from './index';
import { User } from './users';

export interface AuthResponse {
    error?: ApiError;
}

// Auth status
// -----------

export interface GetStatusResponse extends AuthResponse {
    user?: User;
}

export async function getAuthStatus(): Promise<AxiosResponse<GetStatusResponse>> {
    return axios.get<GetStatusResponse>('/api/auth/status');
}

// Login
// -----

export interface LogInRequest {
    email: string;
    password: string;
    remember: boolean;
}

export interface LogInResponse extends AuthResponse {
    user?: User;
}

export async function logIn(request: LogInRequest): Promise<AxiosResponse<LogInResponse>> {
    return axios.post<LogInResponse>('/api/auth/login', request);
}

// OAuth Login
// -----------

export interface LogInWithOauthRequest {
    code: string;
    state: string;
    redirectUri: string;
}

export interface LogInWithOauthResponse extends AuthResponse {
    user?: User;
}

export async function logInWithOauth(
    request: LogInWithOauthRequest,
): Promise<AxiosResponse<LogInWithOauthResponse>> {
    return axios.post<LogInWithOauthResponse>('/api/auth/oauth', request);
}

// Registration
// ------------

export interface RegisterRequest {
    email: string;
    password: string;
    password2: string;
}

export interface RegisterResponse extends AuthResponse {
    success?: boolean;
}

export async function register(request: RegisterRequest): Promise<AxiosResponse<RegisterResponse>> {
    return axios.post<RegisterResponse>('/api/auth/registration', request);
}

// Account activation
// ------------------

export interface ActivateAccountRequest {
    token: string;
}

export interface ActivateAccountResponse extends AuthResponse {
    success?: boolean;
}

export async function activateAccount(
    request: ActivateAccountRequest,
): Promise<AxiosResponse<ActivateAccountResponse>> {
    return axios.post<ActivateAccountResponse>('/api/auth/activation', request);
}

// Password reset
// --------------

export interface ResetPasswordRequest {
    password: string;
    password2: string;
}

export interface ResetPasswordResponse extends AuthResponse {
    success?: boolean;
}

export async function resetPassword(
    request: ResetPasswordRequest,
): Promise<AxiosResponse<ResetPasswordResponse>> {
    return axios.put<ResetPasswordResponse>('/api/auth/password', request);
}

// Password reset initialization
// -----------------------------

export interface InitPasswordResetRequest {
    email: string;
}

export interface InitPasswordResetResponse extends AuthResponse {
    success?: boolean;
}

export async function initPasswordReset(
    request: InitPasswordResetRequest,
): Promise<AxiosResponse<InitPasswordResetResponse>> {
    return axios.post<InitPasswordResetResponse>('/api/auth/password', request);
}

// Logout
// ------

export interface LogOutResponse extends AuthResponse {
    success?: boolean;
}

export async function logOut(): Promise<AxiosResponse<LogOutResponse>> {
    return axios.post<LogOutResponse>('/api/auth/logout');
}
