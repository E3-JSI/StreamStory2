import { TFunction } from 'react-i18next';

/**
 * Filter properties of given object based on predicate.
 * @param props Object
 * @param predicate Determines if property `key` with `value` should be included
 * in result.
 * @returns New object with filtered properties.
 */
export function filterProps(
    props: Record<string, unknown>,
    predicate: (key: string, value: unknown) => boolean,
): Record<string, unknown> {
    const newProps: Record<string, unknown> = {};

    Object.keys(props).forEach((key: string) => {
        if (predicate(key, props[key])) {
            newProps[key] = props[key];
        }
    });

    return newProps;
}

/**
 * Discard all undefined properties of a given object.
 * @param props Object
 * @returns New object without undefined properties.
 */
export function cleanProps(props: Record<string, unknown>): Record<string, unknown> {
    return filterProps(props, (key, val) => val !== undefined);
}

/**
 * Exclude list of properties from given object.
 * @param props Object
 * @param excludedKeys List of properties to be excluded from `props`.
 * @returns New object without properties listed in `excludedKeys`.
 */
export function excludeProps(
    props: Record<string, unknown>,
    excludedKeys: string[],
): Record<string, unknown> {
    return filterProps(props, (key) => !excludedKeys.includes(key));
}

/**
 * Format data size in bytes as human-readable text.
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, i.e. powers of 1000. False to use
 * binary (IEC), i.e. powers of 1024.
 * @param locale Number format locale.
 * @param options Number format options.
 * @returns Formatted string.
 */
export function formatDataSize(
    bytes: number,
    si = false,
    locale = 'en-GB',
    options: Intl.NumberFormatOptions = {},
): string {
    const formatOptions = options || {};
    const dp = formatOptions.maximumFractionDigits || 1;
    const numberFormat = new Intl.NumberFormat(locale, {
        ...formatOptions,
        maximumFractionDigits: dp,
        minimumFractionDigits: dp,
        style: 'unit',
        unit: 'byte',
    });
    const replacePattern = /[^\W\d]+$/;
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return numberFormat.format(bytes).replace(replacePattern, 'B');
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    let b = bytes;
    const r = 10 ** dp;

    do {
        b /= thresh;
        u += 1;
    } while (Math.round(Math.abs(b) * r) / r >= thresh && u < units.length - 1);

    return numberFormat.format(b).replace(replacePattern, units[u]);
}

/**
 * Format given time interval (in seconds) by dividing it into years, days, hours, minutes and seconds.
 * @param seconds Number of seconds
 * @param t Translation function
 * @returns Formated time interval, e.g. `1 year 2 days 3 hours 4 minutes 5 seconds` 
 */
export function formatTimeInterval(seconds: number, t: TFunction): string {
    let temp = seconds;
    const parts: string[] = [];
    const years = Math.floor(temp / 31536000);

    if (years) {
        parts.push(t('n_years' as never, { count: years }));
        temp -= years * 31536000;
    }

    const days = Math.floor(temp / 86400);
    if (days) {
        parts.push(t('n_days' as never, { count: days }));
        temp -= days * 86400;
    }

    const hours = Math.floor(temp / 3600);
    if (hours) {
        parts.push(t('n_hours' as never, { count: hours }));
        temp -= hours * 3600;
    }

    const minutes = Math.floor(temp / 60);
    if (minutes) {
        parts.push(t('n_minutes' as never, { count: minutes }));
        temp -= minutes * 60;
    }

    if (temp) {
        parts.push(t('n_seconds' as never, { count: temp }));
    }

    return parts.join(' ');
}

/**
 * Check if given value is an object.
 * @param value Value
 * @returns `true` if value is an object, `false` otherwise
 */
export function isObject(value: unknown): boolean {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Recursively merge given source objects into target object, where source
 * objects are processed from left to right and next object's properties always
 * overwrite previous object's ones.
 * @param target Target object
 * @param sources Source objects
 * @returns Merged target object
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
                    [key]: {},
                });
            }

            mergeDeep(
                target[key] as Record<string, unknown>,
                source[key] as Record<string, unknown>,
            );
        } else {
            Object.assign(target, {
                [key]: source[key],
            });
        }
    });

    return mergeDeep(target, ...sources);
}

/**
 * Set opacity of a given color.
 * @param color CSS color in HEX or RGB(A) format
 * @param opacity Opacity on [0, 1] interval, where 0 means 100% transparent
 * and 1 menas 100% opaque
 * @returns Color with opacity in RGBA format
 */
export function setColorOpacity(color: string, opacity: number): string {
    let r = 0;
    let g = 0;
    let b = 0;

    const cleanColor = color.trim();

    // HEX long format.
    let match = cleanColor.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i);
    if (match) {
        r = parseInt(match[1], 16);
        g = parseInt(match[2], 16);
        b = parseInt(match[3], 16);
    }

    // HEX short format.
    match = cleanColor.match(/^#([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})$/i);
    if (match) {
        r = parseInt(`${match[1]}${match[1]}`, 16);
        g = parseInt(`${match[2]}${match[2]}`, 16);
        b = parseInt(`${match[3]}${match[3]}`, 16);
    }

    // RGB(A) format.
    match = cleanColor.match(/^rgb(?:a)?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*(\d+)\s*)?\)$/i);
    if (match) {
        r = parseInt(match[1], 10);
        g = parseInt(match[2], 10);
        b = parseInt(match[3], 10);
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Create wrapper function for given string map.
 * @param map String map
 * @returns New translation function based on given map
 */
export function setTranslationMap(
    map: Record<string, string>,
): (key: string | undefined) => string | undefined {
    return (key: string | undefined) => (key !== undefined ? map[key] : key);
}

/**
 * Performs (simple) deep comparison between two given values.
 * @param value1 First value to compare
 * @param value2 Second value to compare
 * @param quick Indicates if quick (JSON based) comparison should be used
 * @returns `true` if `value1` equals `value2`, `false` otherwise
 */
export function isEqual(value1: unknown, value2: unknown, quick = true): boolean {
    if (quick) {
        return JSON.stringify(value1) === JSON.stringify(value2);
    }

    if (typeof value1 !== typeof value2) {
        return false;
    }

    if (value1 === value2) {
        return true;
    }

    if (typeof value1 === 'number' && Number.isNaN(value1) && Number.isNaN(value2)) {
        return true;
    }

    if (
        (typeof value1 === 'function' && typeof value2 === 'function') ||
        (value1 instanceof Date && value2 instanceof Date) ||
        (value1 instanceof RegExp && value2 instanceof RegExp) ||
        (value1 instanceof String && value2 instanceof String) ||
        (value1 instanceof Number && value2 instanceof Number)
    ) {
        return value1.toString() === value2.toString();
    }

    if (Array.isArray(value1) && Array.isArray(value2)) {
        if (value1.length !== value2.length) {
            return false;
        }

        for (let i = 0; i < value1.length; i++) {
            if (!isEqual(value1[i], value2[i])) {
                return false;
            }
        }

        return true;
    }

    if (
        typeof value1 === 'object' &&
        value1 !== null &&
        typeof value2 === 'object' &&
        value2 !== null
    ) {
        const keys1 = Object.keys(value1);
        const keys2 = Object.keys(value2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let i = 0; i < keys1.length; i++) {
            if (
                !isEqual(
                    (value1 as Record<string, unknown>)[keys1[i]],
                    (value2 as Record<string, unknown>)[keys1[i]],
                )
            ) {
                return false;
            }
        }

        return true;
    }

    return false;
}
