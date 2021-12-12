/* eslint-disable import/prefer-default-export */

/**
 * Check if given string value is numeric.
 * @param value String value.
 * @returns `true` if `value` is numeric string, `false` otherwise.
 */
export function isNumeric(value: string): boolean {
    const number = parseFloat(value);
    return !Number.isNaN(number) && Number.isFinite(number);
}
