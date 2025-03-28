import {CompositionConstants, UtilConstants} from '../constants';
import {isNull} from 'lodash';
import {ValueFormatterParams, ValueSetterParams} from "ag-grid-community";

/**
 * Utility functions for manipulating numbers
 */
export class NumberUtils {

    /**
     * Returns a floating point number based on the string value passed in
     * Processes abbreviations such as 'm' for thousand and 'b' for billion
     */
    static parseNumberString(value: string): number {
        // Check if negative, if yes then remember that and remove the hyphen.
        // Utilize this information when returning the value and make it negative accordingly.
        let signMultiplier = 1;
        if (!isNull(value.match(/^\+/))) {
            value = value.replace(/^\+/, '');
        }
        if (!isNull(value.match(/^-.+/))) {
            signMultiplier = -1;
            // remove first hyphen
            value = value.replace(/^-/, '');
        }

        // remove commas and get number value
        const numericValue = value.replace(/,/g, '').match(/^(\d+)?(\.\d+)?/g)[0];
        if (!numericValue || 0 === numericValue.length) {
            // no number parsed from input
            return undefined;
        }
        // determine if it must be scaled to 'm' thousands or 'b' billions
        const stringSuffix = value.match(/[mMbB]+$/) ? value.match(/[mMbB]+$/)[0] : '';
        const multiplier = '1' + stringSuffix.replace(/[mMbB]/g, (match) => {
            if (match === 'm' || match === 'M') {
                return UtilConstants.THOUSAND;
            } else if (match === 'b' || match === 'B') {
                return UtilConstants.BILLION;
            }
        });
        const radix = 10; // decimal radix
        const finalValue = parseFloat(numericValue) * parseInt(multiplier, radix);
        return signMultiplier * finalValue;
    }

    /**
     * Calculates Mean for array of numbers
     */
    static calculateMean(numbers: number[]): number {
        const sum = numbers.reduce((prev, curr) => prev + curr, 0);
        return sum / numbers.length;
    }

    /**
     * Calculates Variance for array of numbers
     */
    static calculateVariance(numbers: number[]): number {
        const mean = NumberUtils.calculateMean(numbers);
        return NumberUtils.calculateMean(
            numbers.map(num => Math.pow(num - mean, 2))
        );
    }

    /**
     * Calculates Standard Deviation for array of numbers
     */
    static calculateStdDeviation(numbers: number[]): number {
        return Math.sqrt(NumberUtils.calculateVariance(numbers));
    }

    /**
     * Creates the upper bounds (inclusive) for each quantile
     * @param values  Numbers for determining the upper bounds of each quantile
     * @param numBuckets  How many quantiles to divide values into
     */
    static getUpperBoundsForQuantiles(values: number[], numBuckets: number): number[] {

        // sort values in ascending order
        values.sort((a: number, b: number) => a - b);
        const numValues = values.length;

        const gap: number = Math.ceil(numValues / numBuckets);

        const bucketBoundaries: number[] = [];

        // find the value that is the upper bound of each bucket
        for (let i = gap - 1; i < numValues; i += gap) {
            bucketBoundaries.push(values[i]);
        }

        // the final bucket upper bounds will be the largest value in the values array
        if (values[numValues - 1] !== bucketBoundaries[bucketBoundaries.length - 1]) {
            bucketBoundaries.push(values[numValues - 1]);
        }

        return bucketBoundaries;
    }

    /**
     * Checks if passed string qualifies as a number.
     * Takes optional negative sign  along with only digits or
     * digits with decimal point
     * Valid cases -> 0.23, -1.2, 4, -2, .5
     * Invalid cases -> 2., 'any string'
     * @param value
     */
    static validateIfStringIsNumber(value: string): boolean {
        return /^(-?(\d+)?\.\d+)$|^(-?\d+)$/.test(value);
}

    /**
     * Puts comma after every 3 digits
     * @param value
     */
    static commaSeparatedColumnFormatter(value: string): string {
        // separates number into values before and after decimal point
        const number: string[] = Number(value).toFixed(2).split('.');
        const searchRegex = new RegExp(CompositionConstants.COMMA_SEPARATED_REGEX.source, CompositionConstants.COMMA_SEPARATED_REGEX.flags + 'g');

        // Searches for set of 3 digits, considers digit before it as the argument ($1) and replaces it with the same thing adding ','
        number[0] =  Math.floor(Number(number[0])).toString().replace(searchRegex, '$1,');
        // Add the value after the decimal point back to the number and return
        return number.length > 1 ? number[0] + '.' + number[1] : number[0];
    }

    /**
     * Formats numeric columns with 4 decimal places
     */
    static numberColumnFormatter(params: ValueFormatterParams): string {
        return Number(params.value).toFixed(4);
    }

    /**
     * Called when cell is edited.  Updates value if it is a proper percent
     */
    static percentageValueSetter(params: ValueSetterParams): boolean {
        const numericValue = typeof params.newValue === 'number' ? params.newValue : Number(params.newValue?.replace(',', ''));
        if (isNaN(numericValue)) {
            return false;
        }
        const fieldModified = params.colDef.field;
        params.data[fieldModified] = numericValue;
        return true;
    }
}
