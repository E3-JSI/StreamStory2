import { NextFunction, Request, Response } from 'express';

import * as notifications from '../db/notifications';
import { Notification } from '../db/notifications';
import { User, UserGroup } from '../db/users';

type NotificationResponse = Notification;

/**
 * Generate notification response from notification.
 * @param notification Notification.
 * @returns Notification response object.
 */
function getNotificationResponse(notification: Notification): NotificationResponse {
    const notificationResponse = notification;
    return notificationResponse;
}

export async function getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const userId = req.query.userId ? Number(req.query.userId) : user.id;

        if (user.id !== userId && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const unread = req.query.unread === 'true';
        const notificationList = await notifications.get(userId, unread);
        res.status(200).json({
            notifications: notificationList.map((notification) =>
                getNotificationResponse(notification)
            ),
        });
    } catch (error) {
        next(error);
    }
}

export async function getNotification(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const notification = await notifications.findById(id);

        if (notification && notification.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        res.status(200).json({
            notification: notification && getNotificationResponse(notification),
        });
    } catch (error) {
        next(error);
    }
}

export async function updateNotification(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const notification = await notifications.findById(id);

        if (notification && notification.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const { read } = req.body;

        // TODO: form validation/sanitation (use: express-validation!?).
        const success = await notifications.update(id, read);

        if (!success) {
            res.status(500).json({
                error: ['notification_update_failed'],
            });
            return;
        }

        // Return updated notification.
        const updatedNotification = await notifications.findById(id);

        if (!updatedNotification) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        res.status(200).json({
            notification: getNotificationResponse(updatedNotification),
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const notification = await notifications.findById(id);

        if (notification && notification.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const success = await notifications.del(id);

        if (!success) {
            res.status(500).json({
                error: ['notification_deletion_failed'],
            });
            return;
        }

        res.status(200).json({
            success,
        });
    } catch (error) {
        next(error);
    }
}
