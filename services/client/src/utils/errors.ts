import React from 'react';

import { TFunction } from 'react-i18next';

import resources from '../i18n/config';
import { minPasswordLength } from './validation';

export type I18Namespace = keyof typeof resources.en;
export type AddErrorKeyPrefix<T extends string> = `error:${T}`;
export type ErrorKey = keyof typeof resources.en.error;
export type ErrorKeyWithPrefix = AddErrorKeyPrefix<keyof typeof resources.en.error>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseError = any;

export interface FormFieldErrors {
    [fieldName: string]: string | undefined;
}

/**
 * Generate error translation function from general translation function, which
 * handles special cases where translations require parameters.
 * @param t Translation function.
 * @returns Translation function adapted for translating errors.
 */
function getErrorTranslator(t: TFunction<I18Namespace[]>) {
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

        return t(`error:${key}` as ErrorKeyWithPrefix, options);
    };
}

/**
 * Get errors from axios response.
 * @param error Response error object.
 * @param t Translation function.
 * @returns Errors extracted from error response.
 */
export function getResponseErrors<T extends FormFieldErrors>(
    error: ResponseError,
    t: TFunction<I18Namespace[]>
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

    return [error.message ?? t('error:unknown_error')];
}

/**
 * Focus first form field with error.
 * @param errors Dictionary of errors, where some keys might match form field names.
 * @param refs Dicrionary of form field references, where keys match form field names.
 */
export function focusFormFieldError<T extends FormFieldErrors>(
    errors: T,
    refs: Record<string, React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>>
): void {
    const errorKeys = Object.keys(errors);

    for (let i = 0; i < errorKeys.length; i++) {
        const key = errorKeys[i];

        if (refs[key]) {
            refs[key].current?.focus();
            break;
        }
    }
}
