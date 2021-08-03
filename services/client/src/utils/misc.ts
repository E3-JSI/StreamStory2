import { OmitRequiredProps, AllowUndefinedProps } from '../types/utility';

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
 * Check if given item is object.
 * @param item Item to check.
 * @returns `true` if given item is object, `false` otherwise.
 */
export function isObject(item: unknown): boolean {
    return !!item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Recursively merge given source objects into target object, where source objects are processed
 * from left to right and next object's properties always ooverwrite previous object's ones.
 * @param target Target object.
 * @param sources Source objects.
 * @returns Merged target object.
 */
export function mergeDeep(
    target: Record<string, unknown>,
    ...sources: unknown[]
): Record<string, unknown> {
    if (!sources.length || !isObject(sources[0])) {
        return target;
    }

    const source = sources.shift() as Record<string, unknown>;

    Object.keys(source).forEach((key: string) => {
        if (isObject(source[key])) {
            if (!target[key]) {
                Object.assign(target, {
                    [key]: {}
                });
            }

            mergeDeep(
                target[key] as Record<string, unknown>,
                source[key] as Record<string, unknown>
            );
        } else {
            Object.assign(target, {
                [key]: source[key]
            });
        }
    });

    return mergeDeep(target, ...sources);
}

/**
 * Set opacity of a given color.
 * @param color CSS color in HEX or RGB(A) format.
 * @param opacity Opacity on [0, 1] interval, where 0 means 100% transparent and 1 menas 100%
 * opaque.
 * @returns Color with opacity in RGBA format.
 */
export function setColorOpacity(color: string, opacity: number): string {
    let r = 0;
    let g = 0;
    let b = 0;

    // HEX format.
    let match = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?/i);

    if (match) {
        r = parseInt(match[1], 16);
        g = parseInt(match[2], 16);
        b = parseInt(match[3], 16);
    }

    // RGB(A) format.
    match = color.match(/rgb(?:a)?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*(\d+)\s*)?\)/i);
    if (match) {
        r = parseInt(match[1], 10);
        g = parseInt(match[2], 10);
        b = parseInt(match[3], 10);
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
