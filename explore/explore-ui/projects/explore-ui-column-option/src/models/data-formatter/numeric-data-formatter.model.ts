import {isBoolean, isNil, isNumber} from 'lodash';
import {AbstractColumnOption, CoreCommonConstants, NumericColumnFormat} from '@blk/explore-ui-core';
import {NumericColumnFormatColumnOption} from '../column-option/numeric-column-format-column-option.model';
import {AbstractDataFormatter} from './abstract-data-formatter.model';
import {ColumnOptionUtils} from '../../utils';
import {FormatterParams} from '../../interfaces/formatter-params.interface';

export const SCALE_FACTOR_FOR_PERCENT = 0.01;

/**
 * Data formatter for numeric column format
 */
export class NumericDataFormatter extends AbstractDataFormatter<NumericColumnFormat, NumericColumnFormatColumnOption> {

    /**
     * Constructor
     */
    constructor(columnFormat: NumericColumnFormat, optionValues: AbstractColumnOption[]) {
        super(columnFormat, optionValues);
    }

    /**
     * DataFormatter.format(any)
     */
    format(value: any, formatterParams?: FormatterParams): string {
        if (isNaN(value) || isNil(value) || value === '') {
            return isNil(value) ? null : value.toString();
        }

        const scaleFactor = this.getScaling();
        const decimalPlaces = this.optionValue && isNumber(this.optionValue.decimalPlaces) ? this.optionValue.decimalPlaces : this.columnFormat.decimalPlaces;
        const separator = this.optionValue && isBoolean(this.optionValue.useThousandsSeparator) ? this.optionValue.useThousandsSeparator : (this.columnFormat.isUseThousandsSeparator);

        const scaledValue = value / scaleFactor;

        const lang = formatterParams?.locale ?? navigator.languages[0];
        const formatter = new Intl.NumberFormat(lang, {
            maximumFractionDigits: decimalPlaces,
            minimumFractionDigits: decimalPlaces,
            useGrouping: separator
        });
        let formattedValue = formatter.format(scaledValue);

        if (scaleFactor === SCALE_FACTOR_FOR_PERCENT) {
            formattedValue = formattedValue + '%';
        }

        return formattedValue;
    }

    /**
     * format in short form
     * @example
     *  156, 2K, 10M, 45B
     */
    formatInShort(value: number, decimalPlaces?: number): string {
        if (typeof value !== 'number') {
            console.error('value is not in number');
            return;
        }

        value /= this.getScaling();
        let unit: string;

        if (value / 1000000000000 >= 1 || value / 1000000000000 <= -1) {
            value /= 1000000000000;
            unit = 'T';
        }

        if (value / 1000000000 >= 1 || value / 1000000000 <= -1) {
            value /= 1000000000;
            unit = 'B';
        }

        if (value / 1000000 >= 1 || value / 1000000 <= -1) {
            value /= 1000000;
            unit = 'M';
        }

        if (value / 1000 >= 1 || value / 1000 <= -1) {
            value /= 1000;
            unit = 'K';
        }

        if (isNil(decimalPlaces)) {
            decimalPlaces = this.optionValue ? this.optionValue.decimalPlaces : this.columnFormat.decimalPlaces;
        }

        const numberInShortFormat = this.formatDecimalPlaces(value, decimalPlaces);
        return unit ? numberInShortFormat + unit : numberInShortFormat;
    }

    /**
     * Rounds value to specified number of decimal places
     */
    roundValue(numValue: number): string {
        const decimalPlaces = this.optionValue && isNumber(this.optionValue.decimalPlaces) ? this.optionValue.decimalPlaces : this.columnFormat.decimalPlaces;
        return this.formatDecimalPlaces(numValue, decimalPlaces);
    }

    /**
     * Convert the formatted number value to raw number value.  Un-scale and remove commas.
     * In case of invalid date input, return null
     * @param value Value that is scaled and formatted with commas
     * @return Raw number value
     */
    convertToRaw(value: any): number {
        // remove commas from number if present, ie- 10,000 to 10000
        const noCommaValue = String(value).replace(/,/g, '').replace(/%/g, '');

        const numericValue = Number(noCommaValue);
        return isNaN(numericValue) ? null : numericValue * this.getScaling();
    }

    /**
     * Converts a value into a number if it is not already
     */
    getComparableValue(value: any): number {
        return Number(value);
    }

    /**
     * Get the scaling factor based on option value, if not available use column default
     * @return scaling factor
     */
    getScaling(): number {
         // check if scaling option is bps/percent and default scalingOptions are only 2 and equals to Basis point options without None then
        // it means it is an old workspace, and we need to use the default scaling Factor i.e. 1 for bps and 100 for percent
        if (this.optionValue && ColumnOptionUtils.isBasisPointWithoutNoneOption(this.columnFormat.scalingOptions)) {
            if(this.optionValue.scaling === 0.0001){
                this.optionValue.scaling =  this.columnFormat.scalingOptions.get(CoreCommonConstants.BASIS_POINT);
            }
            else if(this.optionValue.scaling === 0.01){
                this.optionValue.scaling =  this.columnFormat.scalingOptions.get(CoreCommonConstants.PERCENT);
            }
        }
        return (this.optionValue && this.optionValue.scaling) ? this.optionValue.scaling : this.columnFormat.scalingFactor;
    }

    /**
     * Returns the scaling option string based on the option set
     */
    getScalingOptionString(): string {
        switch (this.getScaling()) {
            case 0.0001:
                return CoreCommonConstants.BASIS_POINT;
            case 0.01:
                return CoreCommonConstants.PERCENT;
            case 1000:
                return CoreCommonConstants.THOUSANDS;
            case 1000000:
                return CoreCommonConstants.MILLIONS;
            case 1000000000:
                return CoreCommonConstants.BILLIONS;
            default:
                return '';
        }
    }

    /**
     * Returns the scale unit based on the scaling factor
     */
    getScaleUnit(): string {
        switch (this.getScaling()) {
            case 1000:
                return CoreCommonConstants.M;
            case 1000000:
                return CoreCommonConstants.MM;
            case 1000000000:
                return CoreCommonConstants.MMM;
            default:
                return '';
        }
    }

    /**
     * AbstractDataFormatter.getColumnOptionConfigType()
     */
    protected getColumnOptionConfigType(): string {
        return NumericColumnFormatColumnOption.CONFIG_TYPE;
    }

    /**
     * Introduces commas in the number passed in
     */
    private numberWithCommas(num: string): string {
        const x = num.split('.');
        let x1 = x[0];
        const x2 = x.length > 1 ? '.' + x[1] : '';
        const rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

}
