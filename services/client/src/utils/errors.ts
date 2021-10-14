import { TFunction } from 'react-i18next';

import resources from '../i18n/config';
import { minPasswordLength } from './forms';

export type AddErrorKeyPrefix<T extends string> = `error.${T}`;
export type ErrorKey = keyof typeof resources.en.translation.error;
export type ErrorKeyWithPrefix = AddErrorKeyPrefix<keyof typeof resources.en.translation.error>;
export type Errors = Record<string, string | undefined>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseError = any;

/**
 * Generate error translation function from general translation function, which
 * handles special cases where translations require parameters.
 * @param t Translation function.
 * @returns Translation function adapted for translating errors.
 */
function getErrorTranslator(t: TFunction) {
    const options: Record<string, unknown> = {};

    return (key: ErrorKey) => {
        // Define special cases, where translations require parameters.
        switch (key) {
            case 'short_password':
                options.count = minPasswordLength;
                break;

            default:
                break;
        }

        return t(`error.${key}` as ErrorKeyWithPrefix, options);
    };
}

/**
 * Get errors from axios response.
 * @param error Response error object.
 * @param t Translation function.
 * @returns Errors extracted from error response.
 */
export function getResponseErrors<T extends Errors>(
    error: ResponseError,
    t: TFunction,
): T | string[] | undefined {
    const te = getErrorTranslator(t);

    if (error.isAxiosError) {
        if (error.response && error.response.data.error) {
            const errors = error.response.data.error;

            if (Array.isArray(errors)) {
                return errors.map((e: ErrorKey) => te(e));
            }

            if (typeof errors === 'object') {
                const translatedErrors: Record<string, string> = {};
                Object.keys(errors).forEach((key) => {
                    translatedErrors[key] = te(errors[key]);
                });
                return translatedErrors as T;
            }

            return errors;
        }
    }

    return [error.message ?? t('error.unknown_error')];
}
