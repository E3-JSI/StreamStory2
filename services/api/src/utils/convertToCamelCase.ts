/**
 * Convert given string to camel case form.
 * @param str String to be converted to camel case form.
 * @returns `str` in camel case form.
 */
function convertToCamelCase(str: string): string {
    return str
        .split(/[-_ ]/)
        .filter((val) => val.length > 0)
        .map((val, idx) => (idx ? `${val[0].toUpperCase()}${val.slice(1).toLowerCase()}` : `${val.toLowerCase()}`))
        .join('');
}

export default convertToCamelCase;
