import getRandomString from '../getRandomString';

describe('getRandomString', () => {
    it('should return empty string if `len` equals 0', () => {
        const len = 0;
        const expected = '';
        const output = getRandomString(len);
        expect(output).toEqual(expected);
    });

    it('should always determine length as absolute value of `len`', () => {
        const len = -32;
        const expected = 32;
        const output = getRandomString(len);
        expect(output.length).toEqual(expected);
    });

    it('should return random string of length `len`', () => {
        const len = 32;
        const expected = /[A-Za-z0-9]{32}/;
        const output = getRandomString(len);
        expect(output).toMatch(expected);
        expect(output.length).toEqual(len);
    });
});
