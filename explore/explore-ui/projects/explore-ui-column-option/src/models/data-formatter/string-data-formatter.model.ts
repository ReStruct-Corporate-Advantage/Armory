import {DataFormatter} from '../../interfaces';

/**
 * Data formatter for string values
 */
export class StringDataFormatter implements DataFormatter {

    /**
     * DataFormatter.format(any)
     */
    format(value: any): string {
        return value;
    }

    /**
     * Convert the formatted value to raw value
     * In case of invalid input, return null
     * @param value: Formatted and scaled value
     * @return Raw value without scaling or formatting
     */
    convertToRaw(value: any): string {
        // strings are already considered to be in raw form
        return value;
    }

    /**
     * Converts a value into an upper case string for comparison
     */
    getComparableValue(value: any): string {
        return String(value).toUpperCase();
    }

}
