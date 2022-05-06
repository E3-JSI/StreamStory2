import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { ApiError } from './index';

export interface Notification {
    id: number;
    userId: number;
    modelId: number;
    type: string;
    title: string;
    content: string;
    time: number;
    read: boolean;
}

export type NotificationSettings = Omit<Notification, 'id' | 'userId'>;

export interface NotificationResponse {
    error?: ApiError;
}

// Get notifications
// -----------------

export interface GetNotificationsRequest {
    userId?: number;
    unread?: boolean;
}

export interface GetNotificationsResponse extends NotificationResponse {
    notifications?: Notification[];
}

export async function getNotifications(
    userId?: number,
    unread?: boolean,
): Promise<AxiosResponse<GetNotificationsResponse>> {
    const config: AxiosRequestConfig<GetNotificationsRequest> = {
        params: {},
    };

    if (userId !== undefined) {
        config.params.userId = userId;
    }

    if (unread !== undefined) {
        config.params.unread = unread;
    }

    return axios.get<GetNotificationsResponse>('/api/notifications', config);
}

// Get notification
// ----------------

export interface GetNotificationResponse extends NotificationResponse {
    notification?: Notification;
}

export async function getNotification(id: number): Promise<AxiosResponse<GetNotificationResponse>> {
    return axios.get<GetNotificationResponse>(`/api/notifications/${id}`);
}

// Update notification
// -------------------

export interface UpdateNotificationResponse extends NotificationResponse {
    notification?: Notification;
}

export async function updateNotification(
    id: number,
    props: NotificationSettings,
): Promise<AxiosResponse<UpdateNotificationResponse>> {
    return axios.put<UpdateNotificationResponse>(`/api/notifications/${id}`, props);
}

// Delete notification
// -------------------

export interface DeleteNotificationResponse extends NotificationResponse {
    success?: boolean;
}

export async function deleteNotification(
    id: number,
): Promise<AxiosResponse<DeleteNotificationResponse>> {
    return axios.delete<DeleteNotificationResponse>(`/api/notifications/${id}`);
}
