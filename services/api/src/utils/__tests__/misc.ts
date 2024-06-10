import {
    convertKeysToCamelCase,
    convertToCamelCase,
    getRandomInt,
    getRandomString,
    isNumeric,
    isValidUuid
} from '../misc';

describe('convertToCamelCase', () => {
    // test.each([
    //     { str: '', expected: '' },
    //     { str: 'c', expected: 'c' },
    //     { str: 'C', expected: 'c' },
    //     { str: 'camel', expected: 'camel' },
    //     { str: 'CAMEL', expected: 'camel' },
    //     { str: 'camelCase', expected: 'camelcase' },
    //     { str: 'CamelCase', expected: 'camelcase' },
    //     { str: 'camel case', expected: 'camelCase' }
    // ])('should convert "$str" to "$expected"', ({ str, expected }) => {
    //     expect(convertToCamelCase(str)).toEqual<string>(expected);
    // });

    it('should convert empty string to empty string', () => {
        const input = '';
        const expected = input;
        const output = convertToCamelCase(input);
        expect(output).toEqual(expected);
    });

    it('should convert single word to lower case', () => {
        const input = 'camelCase';
        const expected = 'camelcase';
        const output = convertToCamelCase(input);
        expect(output).toEqual(expected);
    });

    it('should convert first word to lower case and the rest to capitalized lower case', () => {
        const input = 'PascalCase is not the same as camelCase';
        const expected = 'pascalcaseIsNotTheSameAsCamelcase';
        const output = convertToCamelCase(input);
        expect(output).toEqual(expected);
    });

    it('should treat spaces, undercsores and hyphens as separators', () => {
        const input = 'PascalCase_is-not   the--same__as --- ___ camelCase';
        const expected = 'pascalcaseIsNotTheSameAsCamelcase';
        const output = convertToCamelCase(input);
        expect(output).toEqual(expected);
    });
});

describe('convertKeysToCamelCase', () => {
    it('should convert empty record to empty record', () => {
        const input = {};
        const expected = {};
        const output = convertKeysToCamelCase(input);
        expect(output).toEqual(expected);
    });

    it('should leave record values untouched', () => {
        const input = {
            a: undefined,
            b: null,
            c: false,
            d: 3.14,
            e: [1, 2, 3],
            f: { a: 1, b: 2 },
            g: () => {
                /* noop */
            },
        };
        const expected = input;
        const output = convertKeysToCamelCase(input);
        expect(output).toEqual(expected);
    });

    it('should treat spaces, undercsores and hyphens as separators', () => {
        const input = {
            __undefined_value: undefined,
            ' null  value   ': null,
            'this-is--false': false,
            'Pi-number equals_': 3.14,
        };
        const expected = {
            undefinedValue: undefined,
            nullValue: null,
            thisIsFalse: false,
            piNumberEquals: 3.14,
        };
        const output = convertKeysToCamelCase(input);
        expect(output).toEqual(expected);
    });
});

describe('getRandomInt', () => {
    it('should return min/max value when bounds are equal', () => {
        const min = -1;
        const max = -1;
        const expected = -1;
        const output = getRandomInt(min, max);
        expect(output).toEqual(expected);
    });

    it('should switch bounds when min > max', () => {
        const min = 5;
        const max = -5;
        const count = 2 * (Math.abs(min - max) + 1);
        const numbers = [];
        for (let i = 0; i < count; i++) {
            numbers.push(getRandomInt(min, max));
        }

        expect(Math.min(...numbers)).toBeGreaterThanOrEqual(max);
        expect(Math.max(...numbers)).toBeLessThanOrEqual(min);
    });

    it('should return random number between min and max', () => {
        const min = 0;
        const max = 20;
        const count = 2 * (Math.abs(max - min) + 1);
        const numbers = [];
        for (let i = 0; i < count; i++) {
            numbers.push(getRandomInt(min, max));
        }

        expect(Math.min(...numbers)).toBeGreaterThanOrEqual(min);
        expect(Math.max(...numbers)).toBeLessThanOrEqual(max);
    });
});

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

describe('isNumeric', () => {
    test.each([
        { value: 'undefained', expected: false },
        { value: 'null', expected: false },
        { value: 'false', expected: false },
        { value: 'true', expected: false },
        { value: '[]', expected: false },
        { value: '{}', expected: false },
        { value: 'string', expected: false },
        { value: '0', expected: true },
        { value: '0.5', expected: true },
        { value: '0xabc', expected: true },
        { value: '-1e-5', expected: true },
    ])('should return `$expected` for "$value"', ({ value, expected }) => {
        expect(isNumeric(value)).toEqual(expected);
    });
});

describe('isValidUuid', () => {
    test.each([
        { uuid: '', expected: false },
        { uuid: 'a', expected: false },
        { uuid: '12345678-123', expected: false },
        { uuid: '12345678-1234-1234-1234-12345678', expected: false },
        { uuid: '12345678-1234-1234-1234-1234567890ab', expected: false },
        { uuid: '12345678-1234-1234-8234-1234567890ab', expected: true },
        { uuid: '10304b80-453d-4bf4-99a4-af2057ce1257', expected: true },
    ])('should return `$expected` for "$uuid"', ({ uuid, expected }) => {
        expect(isValidUuid(uuid)).toEqual(expected);
    });
});
