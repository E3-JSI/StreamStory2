import querystring from 'querystring';

import axios from 'axios';
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';

import config from '../config';
import transporter from '../config/mailing';
import { rememberMeCookie, userTokenSize } from '../config/const';
import oauth, { OauthUserInfo, OauthProviderId } from '../lib/oauth';
import * as users from '../db/users';
import * as tokens from '../db/tokens';
import { getUserResponse } from './users';
import { getValue, getRandomString } from '../utils/misc';

export const minPasswordLength = 6;

const siteUrl = config.url.replace(/:(80)?$/, '');

export async function logIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.user) {
        res.status(200).json({
            user: getUserResponse(req.user),
        });
        return;
    }

    try {
        const { email, password, remember } = req.body;
        const user = await users.findByEmail(email);

        if (!user || !user.active) {
            res.status(401).json({
                error: {
                    email: 'unknown_email',
                },
            });
            return;
        }

        if (!(await bcrypt.compare(password, user.password))) {
            res.status(401).json({
                error: {
                    password: 'invalid_password',
                },
            });
            return;
        }

        req.user = user;
        req.session.userId = user.id;
        await users.updateLastLogin(user.id);

        // Issue a remember me cookie if the option was checked.
        if (remember) {
            // Issue new token.
            const newToken = await tokens.issue(user.id);
            res.cookie(rememberMeCookie.name, newToken, rememberMeCookie.options);
        }

        res.status(200).json({
            user: getUserResponse(user),
        });
    } catch (error) {
        next(error);
    }
}

export async function logInWithOauth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const provider =
            config.auth?.providers && config.auth.providers.find((p) => p.id === req.body.state);

        if (!provider) {
            res.status(401).json({
                error: ['unknown_oauth_provider'],
            });
            return;
        }

        const { clientId, clientSecret, accessTokenUrl } = provider;

        // Get access token.
        const tokenResponse = await axios.request<{
            // eslint-disable-next-line camelcase
            access_token?: string;
            // eslint-disable-next-line camelcase
            expires_in?: number;
            error?: string;
        }>({
            method: 'POST',
            url: accessTokenUrl,
            data: querystring.encode({
                grant_type: 'authorization_code',
                code: req.body.code,
                redirect_uri: req.body.redirect_uri,
                client_id: clientId,
                client_secret: clientSecret,
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            res.status(401).json({
                error: ['bad_oauth_verification_code'],
            });
            return;
        }

        let userInfo: OauthUserInfo | null = null;

        if (provider.id in oauth) {
            userInfo = await oauth[provider.id as OauthProviderId].getUserInfo(accessToken);
        } else if (provider.userRequest && provider.userResponse) {
            const userResponse = await axios.request(
                JSON.parse(
                    JSON.stringify(provider.userRequest).replace(/ACCESS_TOKEN/g, accessToken)
                )
            );
            const { data } = userResponse;
            userInfo = {
                email: getValue(data, provider.userResponse.email) || '',
                name: getValue(data, provider.userResponse.name) || '',
            };
        }

        if (!userInfo) {
            res.status(400).json({
                error: ['oauth_user_request_failed'],
            });
            return;
        }

        if (
            !userInfo.email ||
            typeof userInfo.email !== 'string' ||
            !/^.+@.+$/.test(userInfo.email)
        ) {
            res.status(400).json({
                error: ['oauth_email_retrieval_failed'],
            });
            return;
        }

        // Find/create user with given email.
        const user =
            (await users.findByEmail(userInfo.email)) ||
            (await users.findById(await users.add(2, userInfo.name, userInfo.email, '', {})));

        if (!user) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        // Log in user.
        req.user = user;
        req.session.userId = user.id;
        await users.updateLastLogin(user.id);

        res.status(200).json({
            user: getUserResponse(user),
        });
    } catch (error) {
        next(error);
    }
}

export async function logOut(req: Request, res: Response): Promise<void> {
    delete req.user;
    delete req.session.userId;

    if (req.cookies[rememberMeCookie.name]) {
        // Clear cookie and token.
        tokens.consume(req.cookies[rememberMeCookie.name]);
        res.clearCookie(rememberMeCookie.name);
    }

    res.status(200).json({ success: true });
}

export async function getStatus(req: Request, res: Response): Promise<void> {
    res.status(200).json({
        user: req.user ? getUserResponse(req.user) : null,
    });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // TODO: form validation/sanitation (use: express-validation!?).
        const { email, password, password2 } = req.body;
        const user = await users.findByEmail(email);

        if (user) {
            res.status(409).json({
                error: {
                    email: 'registered_email',
                },
            });
            return;
        }

        if (password.length < minPasswordLength) {
            res.status(422).json({
                error: {
                    password: 'short_password',
                },
            });
            return;
        }

        if (password !== password2) {
            res.status(422).json({
                error: {
                    password2: 'password_mismatch',
                },
            });
            return;
        }

        const activationToken = getRandomString(userTokenSize);
        const success = await users.add(2, '', email, password, {
            activation: activationToken,
        });

        if (!success) {
            res.status(500).json({
                error: ['registration_failed'],
            });
            return;
        }

        // Send activation e-mail.
        const activationLink = `${siteUrl}/login/activation/${activationToken}`;

        // TODO: prepare email templates (separate content from code)
        await transporter.sendMail({
            from: 'StreamStory <streamstoryai@gmail.com>',
            to: email,
            subject: 'Activate your account',
            text: `Thank you for registering.\nFollow the link below to activate your account:\n${activationLink}`,
        });

        res.status(200).json({
            // TODO: return id?
            success: !!success,
        });
    } catch (error) {
        next(error);
    }
}

export async function activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { token } = req.body;
        const success = await users.activate(token);

        if (!success) {
            res.status(403).json({
                error: ['activation_failed'],
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

export async function initiatePasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email } = req.body;
        const user = await users.findByEmail(email);

        if (!user || !user.active) {
            res.status(401).json({
                error: {
                    email: 'unknown_email',
                },
            });
            return;
        }

        const passwordResetToken = getRandomString(userTokenSize);
        const success = await users.setPasswordResetToken(user.id, passwordResetToken);

        if (!success) {
            res.status(500).json({
                error: ['password_reset_initiation_failed'],
            });
            return;
        }

        // Send reset e-mail.
        const resetLink = `${siteUrl}/password-reset/${passwordResetToken}`;

        // TODO: prepare email templates (separate content from code)
        await transporter.sendMail({
            from: 'StreamStory <streamstoryai@gmail.com>',
            to: email,
            subject: 'Reset your password',
            text: `You requested a password reset for your StreamStory account.\nTo reset your password follow the link below:\n${resetLink}\nThis link will be valid for the next 24 hours.\nIf you did not request a password reset, you can safely ignore this e-mail.`,
        });

        res.status(200).json({
            success,
        });
    } catch (error) {
        next(error);
    }
}

export async function resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // TODO: form validation/sanitation (use: express-validation!?).
        const { token, password, password2 } = req.body;

        if (password.length < minPasswordLength) {
            res.status(422).json({
                error: {
                    password: 'short_password',
                },
            });
            return;
        }

        if (password !== password2) {
            res.status(422).json({
                error: {
                    password2: 'password_mismatch',
                },
            });
            return;
        }

        const success = await users.resetPassword(token, password);

        if (!success) {
            res.status(500).json({
                error: ['password_reset_failed'],
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
