import React from 'react';
import {
    FieldPath,
    FieldValues,
    Path,
    RefCallBack,
    RegisterOptions,
    UseFormRegister,
    UseFormRegisterReturn,
    UseFormReturn,
} from 'react-hook-form';

export interface RequestData {
    [name: string]: unknown;
}

export interface ResponseData {
    [name: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = object;

export interface UseFormReturnMui<TFieldValues extends FieldValues, TContext extends Context>
    extends Omit<UseFormReturn<TFieldValues, TContext>, 'register'> {
    register: ReturnType<typeof initMuiRegister>;
}
export interface UseFormRegisterReturnMui extends Omit<UseFormRegisterReturn, 'ref'> {
    inputRef: RefCallBack;
}

export interface ValidationPatterns {
    [id: string]: RegExp;
}

export const minPasswordLength = 6;

export const validationPatterns: ValidationPatterns = {
    userToken: /^[A-Za-z0-9]{64}$/,
    emailLoose: /^.+@.+$/,
    emailStrict: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
};

/**
 * Initialize `register` function based on react hook form's `register`, with
 * modified return object with `inputRef` instead of `ref`.
 * @param register React hook form's register function.
 * @returns New `register` function, addapted for MUI components with `inputRef`.
 */
export function initMuiRegister<TFieldValues extends FieldValues>(
    register: UseFormRegister<TFieldValues>,
) {
    return (
        name: FieldPath<TFieldValues>,
        options?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>,
    ): UseFormRegisterReturnMui => {
        const { ref, ...other } = register(name, options);
        return {
            ...other,
            // inputRef: ref,
            inputRef: (instance) => {
                ref(instance?.node ?? instance);
            },
        };
    };
}

/**
 * Initialize `register` function based on react hook form's `register`, with
 * modified return object with `inputRef` instead of `ref`.
 * @param form React hook form.
 * @returns New `register` function, addapted for MUI components with `inputRef`.
 */
export function initFormFieldRegister<TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues, Context>,
) {
    return (
        name: FieldPath<TFieldValues>,
        options?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>,
    ): UseFormRegisterReturnMui => {
        const { ref, ...other } = form.register(name as Path<TFieldValues>, options);
        return {
            ...other,
            // inputRef: ref,
            inputRef: (instance) => {
                ref(instance?.node ?? instance);
            },
        };
    };
}

/**
 * Register form field using react hook form's `register` function.
 * @param register React hook form's `register` function.
 * @param name Form field name.
 * @param options React hook form's registration options.
 * @returns Modified `register`'s return object, addapted for MUI components
 * with with `inputRef` instead of `ref`.
 */
export function registerFormField(
    register: UseFormRegister<FieldValues>,
    name: FieldPath<FieldValues>,
    options?: RegisterOptions<FieldValues, FieldPath<FieldValues>>,
): UseFormRegisterReturnMui {
    const { ref, ...other } = register(name, options);
    return {
        ...other,
        inputRef: ref,
    };
}

/**
 * Set input instance to given input properties' reference attribute.
 * @param inputProps Input preoperties with `ref` attribute.
 * @param instance Input instance.
 */
export function setRef<T extends HTMLInputElement | HTMLSelectElement>(
    inputProps: React.RefAttributes<T>,
    instance: T | null,
): void {
    if (inputProps?.ref) {
        if (inputProps.ref instanceof Function) {
            inputProps.ref(instance);
        } else {
            // eslint-disable-next-line no-param-reassign
            inputProps.ref = { current: instance };
        }
    }
}

/**
 * Set input instance to given input reference object.
 * @param inputRef Input reference object.
 * @param instance Input instance.
 */
export function setInputRef<T extends HTMLInputElement | HTMLSelectElement>(
    inputRef: React.ForwardedRef<T>,
    instance: T | null,
): void {
    if (inputRef) {
        if (inputRef instanceof Function) {
            inputRef(instance);
        } else {
            // eslint-disable-next-line no-param-reassign
            inputRef.current = instance;
        }
    }
}

/**
 * Submit given form.
 * @param formRef Form reference.
 */
export function submitForm(formRef: React.RefObject<HTMLFormElement>): void {
    formRef.current?.dispatchEvent(
        new Event('submit', {
            cancelable: true,
            bubbles: true,
        }),
    );
}

/**
 * Trigger chenge event on given form field.
 * @param formFieldRef Form field reference.
 */
export function triggerChangeEvent(
    formFieldRef: React.RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
): void {
    setTimeout(() => {
        if (formFieldRef.current !== null) {
            formFieldRef.current.dispatchEvent(
                new Event('change', {
                    cancelable: true,
                    bubbles: true,
                }),
            );
        }
    });
}
