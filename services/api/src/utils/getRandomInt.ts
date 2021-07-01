/**
 * Generate random number on given interval. If `min` > `max`, bounds are switched.
 * @param min Lower bound of interval.
 * @param max Upper bound of interval.
 * @returns Random integer between `min` and `max`.
 */
function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (Math.abs(max - min) + 1)) + Math.min(min, max);
}

export default getRandomInt;
