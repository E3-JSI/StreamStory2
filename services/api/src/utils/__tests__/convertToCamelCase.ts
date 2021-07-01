import convertToCamelCase from '../convertToCamelCase';

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
