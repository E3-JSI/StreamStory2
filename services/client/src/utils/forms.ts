import React from 'react';
import { ChangeHandler, RefCallBack, UseFormRegisterReturn } from 'react-hook-form';

export interface RequestData {
    [name: string]: unknown;
}

export interface ResponseData {
    [name: string]: unknown;
}

export interface UseFormRegisterReturnInputRef extends Omit<UseFormRegisterReturn, 'ref'> {
    inputRef: UseFormRegisterReturn['ref'];
}

export interface Patterns {
    [id: string]: RegExp;
}

export const minPasswordLength = 6;

export const patterns: Patterns = {
    userToken: /^[A-Za-z0-9]{64}$/,
    emailLoose: /^.+@.+$/,
    emailStrict: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
};

/**
 * Extend react hook form's control registration return value.
 * @param registerReturn Register's return value.
 * @param options Extending options.
 * @returns Extended control registration return value.
 */
export function extendRegRet(
    registerReturn: UseFormRegisterReturn,
    options?: {
        refTarget?: 'ref' | 'inputRef';
        ref?: RefCallBack;
        onBlur?: ChangeHandler;
        onChange?: ChangeHandler;
    }
): UseFormRegisterReturn | UseFormRegisterReturnInputRef {
    const {
        onBlur, onChange, name, ref
    } = registerReturn;

    let newRef = ref;
    if (options?.ref) {
        newRef = (instance) => {
            (options.ref as RefCallBack)(instance);
            ref(instance);
        };
    }

    let newOnBlur = onBlur;
    if (options?.onBlur) {
        newOnBlur = async (event) => {
            (options.onBlur as ChangeHandler)(event);
            onBlur(event);
        };
    }

    let newOnChange = onChange;
    if (options?.onChange) {
        newOnChange = async (event) => {
            (options.onChange as ChangeHandler)(event);
            onChange(event);
        };
    }

    return options?.refTarget === 'ref'
        ? {
            name,
            onBlur: newOnBlur,
            onChange: newOnChange,
            ref: newRef
        }
        : {
            name,
            onBlur: newOnBlur,
            onChange: newOnChange,
            inputRef: newRef
        };
}

/**
 * Submit given form.
 * @param formRef Form reference.
 */
export function submitForm(formRef: React.RefObject<HTMLFormElement>): void {
    formRef.current?.dispatchEvent(
        new Event('submit', {
            cancelable: true,
            bubbles: true
        })
    );
}
