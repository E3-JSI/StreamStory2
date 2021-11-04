/**
 * Convert given string to camel case form.
 * @param str String to be converted to camel case form.
 * @returns `str` in camel case form.
 */
export function convertToCamelCase(str: string): string {
    return str
        .split(/[-_ ]/)
        .filter((val) => val.length > 0)
        .map((val, idx) =>
            idx ? `${val[0].toUpperCase()}${val.slice(1).toLowerCase()}` : `${val.toLowerCase()}`
        )
        .join('');
}

/**
 * Convert property names (keys) of given object to camel case form.
 * @param record Object with property names to be converted to camel case.
 * @returns New object with properties in camel case form.
 */
export function convertKeysToCamelCase<T>(record: Record<string, unknown>): T {
    const ccRecord: Record<string, unknown> = {};

    Object.keys(record).forEach((key) => {
        ccRecord[convertToCamelCase(key)] = record[key];
    });

    return ccRecord as T;
}

/**
 * Generate random number on given interval.
 * If `min` > `max`, bounds are switched.
 * @param min Lower bound.
 * @param max Upper bound.
 * @returns Random integer between `min` and `max`.
 */
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (Math.abs(max - min) + 1)) + Math.min(min, max);
}

/**
 * Generate random string of given length.
 * Characters are randpmly chosen from [A-Za-z0-9].
 * @param len Length of random string (absolute value).
 * @returns Random string of length `len`.
 */
export function getRandomString(len: number): string {
    const buf = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < Math.abs(len); i++) {
        buf.push(chars[getRandomInt(0, chars.length - 1)]);
    }

    return buf.join('');
}

/**
 * Check if given string value is numeric.
 * @param value String value.
 * @returns `true` if `value` is numeric string, `false` otherwise.
 */
export function isNumeric(value: string): boolean {
    const number = parseFloat(value);
    return !Number.isNaN(number) && Number.isFinite(number);
}

/**
 * Gets nested value in given object.
 * @param obj Object
 * @param path Path to nested value, consisting of dot separated object keys
 * @returns Nested object value if it exists, `undefined` otherwise.
 */
export function getValue<T extends unknown>(obj: unknown, path: string): T | undefined {
    const paths = path.split('.');
    let current = obj;

    for (let i = 0; i < paths.length; i++) {
        if (typeof current === 'object' || current !== null) {
            current = (current as Record<string, unknown>)[paths[i]];
        } else {
            return undefined;
        }
    }

    return current as T;
}
