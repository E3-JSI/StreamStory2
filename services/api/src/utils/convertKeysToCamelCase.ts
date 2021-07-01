import convertToCamelCase from './convertToCamelCase';

/**
 * Convert property names (keys) of given object to camel case form.
 * @param record Object with property names to be converted to camel case.
 * @returns New object with properties in camel case form.
 */
function convertKeysToCamelCase<T>(record: Record<string, unknown>): T {
    const ccRecord: Record<string, unknown> = {};

    Object.keys(record).forEach((key) => {
        ccRecord[convertToCamelCase(key)] = record[key];
    });

    return ccRecord as T;
}

export default convertKeysToCamelCase;
