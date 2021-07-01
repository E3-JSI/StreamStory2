import convertKeysToCamelCase from '../convertKeysToCamelCase';

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
            }
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
            'Pi-number equals_': 3.14
        };
        const expected = {
            undefinedValue: undefined,
            nullValue: null,
            thisIsFalse: false,
            piNumberEquals: 3.14
        };
        const output = convertKeysToCamelCase(input);
        expect(output).toEqual(expected);
    });
});
