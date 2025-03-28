import {FormatterParams} from './formatter-params.interface';

/**
 * Interface that is implemented by data formatter classes
 */
export interface DataFormatter {
    /**
     * This method takes in a raw Value and format it as per the column format and optionValue of this formatter
     */
    format(value: any, formatterParams?: FormatterParams): string;

    /**
     * Convert the formatted value to raw value
     * In case of invalid input, return null
     * @param value: Formatted and scaled value
     * @return Raw value without scaling or formatting
     */
    convertToRaw(value: any): string | number;

    /**
     * Converts the value into a format where it can be compared to values of the same type
     * @param value:  Raw value
     * @returns Comparable equivalent of the value passed in
     */
    getComparableValue(value: any): any;
}
