import getRandomInt from '../getRandomInt';

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
