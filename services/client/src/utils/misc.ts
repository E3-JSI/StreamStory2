import { OmitRequiredProps, AllowUndefinedProps } from '../types/utility';

/**
 * Discard all undefined properties of a given object.
 * @param obj Object with (un)defined properties.
 * @returns New object without undefined properties.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function filterDefinedProps<T extends object>(
    obj: AllowUndefinedProps<OmitRequiredProps<T>>
): Record<string, unknown> {
    const oldProps = obj as Record<string, unknown>;
    const newProps: Record<string, unknown> = {};

    Object.keys(oldProps).forEach((key: string) => {
        if (oldProps[key] !== undefined) {
            newProps[key] = oldProps[key];
        }
    });

    return newProps;
}

/**
 * Exclude list of properties from given object.
 * @param obj Object
 * @param excludedKeys List of properties to be excluded from `obj`.
 * @returns New object without properties listed in `excludedKeys`.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function excludeProps<T>(obj: object, excludedKeys: string[]): Record<string, T> {
    const oldProps = obj as Record<string, T>;
    const newProps: Record<string, T> = {};

    Object.keys(oldProps).forEach((key: string) => {
        if (!excludedKeys.includes(key)) {
            newProps[key] = oldProps[key];
        }
    });

    return newProps;
}

/**
 * Create wrapper function for given string map.
 * @param map String map.
 * @returns New translation function based on given map.
 */
export function setTranslationMap(
    map: Record<string, string>
): (key: string | undefined) => string | undefined {
    return (key: string | undefined) => (key !== undefined ? map[key] : key);
}
