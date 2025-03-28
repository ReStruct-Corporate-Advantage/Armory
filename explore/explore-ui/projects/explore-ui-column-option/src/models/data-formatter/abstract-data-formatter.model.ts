import {ColumnFormat, CoreColumnUtils} from '@blk/explore-ui-core';
import {DataFormatter} from '../../interfaces';
import {AbstractColumnOption} from '@blk/explore-ui-core';

/**
 * Abstract base class for all types of data formatter
 */
export abstract class AbstractDataFormatter<T extends ColumnFormat, U extends AbstractColumnOption> implements DataFormatter {

    columnFormat: T;
    optionValue: U;

    protected constructor(columnFormat: T, optionValues: AbstractColumnOption[]) {
        this.columnFormat = columnFormat;
        this.optionValue = this.getColumnOption(optionValues);
    }

    /**
     * DataFormatter.format(any)
     */
    abstract format(value: any): string;

    /**
     * Convert the formatted value to raw value
     * In case of invalid input, return null
     * @param value: Formatted and scaled value
     * @return Raw value without scaling or formatting
     */
    abstract convertToRaw(value: any): string | number;

    /**
     * Converts the value into a format where it can be compared to values of the same type
     * @param value:  Raw value
     * @returns Comparable equivalent of the value passed in
     */
    abstract getComparableValue(value: any): any;

    /**
     * This method formats the passed in numeric value to the number of decimalPlaces passed in
     */
    protected formatDecimalPlaces(numValue: number, decimalPlaces: number): string {
        let tmpScale = 1;
        if (decimalPlaces > 0) {
            tmpScale = Math.round(Math.pow(10, decimalPlaces));
        }

        const scaledValue = Math.round(tmpScale * numValue) / tmpScale;
        return scaledValue.toFixed(decimalPlaces);
    }

    /**
     * Returns the config type corresponding to the column option type 'U'
     */
    protected abstract getColumnOptionConfigType(): string;

    /**
     * Get the option value corresponding to U
     */
    private getColumnOption(optionValues: AbstractColumnOption[]): U {
        return CoreColumnUtils.getOptionValueByConfigType(optionValues, this.getColumnOptionConfigType()) as U;
    }

}
