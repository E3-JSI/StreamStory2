import getRandomInt from './getRandomInt';

/**
 * Generate random string of given length. Characters are randpmly chosen from [A-Za-z0-9],
 * @param len Length of random string (absolute value).
 * @returns Random string of length `len`.
 */
function getRandomString(len: number): string {
    const buf = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < Math.abs(len); i++) {
        buf.push(chars[getRandomInt(0, chars.length - 1)]);
    }

    return buf.join('');
}

export default getRandomString;
