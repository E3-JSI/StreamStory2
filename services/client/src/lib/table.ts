import { SortDirection } from '@material-ui/core/TableCell';

export type Order = Exclude<SortDirection, false>;

/**
 * Compare property of two values.
 * @param a First value
 * @param b Second value
 * @param orderBy Property to compare
 * @returns -1 if property of a is greater than property of b, 1 if property of
 * a is less than property of b, 1 otherwise 
 */
export function compareDescending<T>(a: T, b: T, orderBy: keyof T): number {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }

    if (b[orderBy] > a[orderBy]) {
        return 1;
    }

    return 0;
}
 
/**
 * Sort given array of values using comparator. When comparator can't
 * distinguish values, indices are used.
 * @param array Array of values
 * @param comparator Comparator for values
 * @returns Sorted array of values
 */
export function sortStable<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }

        return a[1] - b[1];
    });

    return stabilizedThis.map((el) => el[0]);
}

/**
 * Generate function for comparing two values based on given sort order and sort property.
 * @param order Sort order
 * @param orderBy Sort property
 * @returns Function for comparing two values
 */
export function getComparator<Key extends string | number | symbol>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
        ? (a, b) => compareDescending(a, b, orderBy)
        : (a, b) => -compareDescending(a, b, orderBy);
}
