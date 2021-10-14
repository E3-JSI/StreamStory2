/** Remembwe mw cookie settings */
export const rememberMeCookie = {
    name: 'remember_me',
    options: {
        path: '/',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    },
};

/** Password encryption salt */
export const salt = 10;

/**
 * Number of characters used to generate random tokens for user account activation,
 * password reset,...
 */
export const userTokenSize = 64;
