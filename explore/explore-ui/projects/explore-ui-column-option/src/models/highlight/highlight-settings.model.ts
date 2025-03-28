import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isEqual, isNil, isObject} from 'lodash';
import {HighlightComparisonType} from '../../enums';
import {DataFormatter} from '../../interfaces';

/**
 * Model for a highlight rule within the {@link HighlightColumnOption} column option.
 */
export class HighlightSettings extends AbstractConfig {

    /** Comparison used to determine data highlighting */
    comparisonType: HighlightComparisonType;

    /** Cell colors for highlighting. Second value only used for 'gradient' comparison. */
    backGroundColors: string[] = ['rgb(211,211,211)', 'rgb(211,211,211)'];

    /** Cell colors for highlighting. Second value only used for 'gradient' comparison. */
    foreGroundColors: string[] = ['rgb(0,0,0)', 'rgb(0,0,0)'];

    /** Value(s) to compare against.  Set directly by user input.  Second value only for 'between' comparison. */
    comparisonValues: (string | number)[] = [];
    /** Values to compare against.  Scaling removed and proper formatting enforced for saving. Second value only for 'between' comparison. */
    comparisonRawValues: (string | number)[] = [];

    /** Whether or not to apply highlight rule */
    isEnabled = true; // by default each row will be enabled for highlight settings.

    /**
     * Constructor to create a new empty Highlight rule or initialize an existing one
     * @param data Optional data to construct existing HighlightSetting from
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize saved highlight rule from data to object
     * @param data HighlightSettings in JSON form
     */
    deserialize(data: any): void {
        this.comparisonType = data.comparisonType;
        this.backGroundColors = data.backGroundColors;
        this.comparisonRawValues = data.comparisonRawValues;
        this.isEnabled = data.isEnabled;
        this.foreGroundColors = data.foregroundColors;
    }

    /**
     * Serialize highlight rule to JSON format
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            comparisonType: this.comparisonType,
            backGroundColors: this.backGroundColors,
            comparisonRawValues: this.comparisonRawValues,
            isEnabled: this.isEnabled,
            foregroundColors: this.foreGroundColors
        };
    }

    /**
     * Determine if the rule is a 'quantile' comparison.
     * Used to render second color picker.
     */
    isQuantileComparison(): boolean {
        return this.comparisonType === HighlightComparisonType.QUANTILE;
    }

    /**
     * Determine if the rule is a 'between' comparison.
     * Used to render second value textbox.
     */
    isBetweenComparison(): boolean {
        return this.comparisonType === HighlightComparisonType.BETWEEN;
    }

    /**
     * Convert user input to the underlying raw value for comparison
     * @param index  Which textbox to convert
     * @param dataFormatter  Formatter to use for getting the raw value
     */
    getRawValue(index: number, dataFormatter: DataFormatter): string | number {
        // Aggregated comparison types (top%, bottom%, std dev) are relative values and don't have any formatting
        if (this.isAggregatedComparisonType()) {
            return this.comparisonValues[index];
        }
        return dataFormatter.convertToRaw(this.comparisonValues[index]);
    }

    /**
     * Scales raw value for rendering in text box to user
     * @param dataFormatter Formatter to use
     */
    formatRuleValues(dataFormatter: DataFormatter): void {
        // aggregated types don't require formatting since we are using the original provided values so they are always raw value
        // i.e. if top% is 10, it means user wants to see the top 10% rows in the highlighted color
        this.comparisonRawValues.forEach((rawValue, valueIndex) => {
            this.comparisonValues[valueIndex] = this.isAggregatedComparisonType() ? rawValue : dataFormatter.format(rawValue);
        });
    }

    /**
     * Determines if a comparison type is aggregated type
     *
     * If it is an aggregated type then it does not need to be formatted because it is a relative value
     */
    public isAggregatedComparisonType(): boolean {
        return (this.comparisonType === HighlightComparisonType.TOP)
            || (this.comparisonType === HighlightComparisonType.BOTTOM)
            || (this.comparisonType === HighlightComparisonType.QUANTILE)
            || (this.comparisonType === HighlightComparisonType.STD_DEV_IN)
            || (this.comparisonType === HighlightComparisonType.STD_DEV_OUT);
    }

    /**
     * Checks if highlight rule is valid (has all necessary parts) for saving
     */
    isValid(): boolean {
        if (isNil(this.comparisonType)) {
            return false;
        }
        if (isNil(this.comparisonRawValues) || isNil(this.comparisonRawValues[0])) {
            return false;
        }
        if ((isNil(this.backGroundColors) || isNil(this.backGroundColors[0])) &&
            (isNil(this.foreGroundColors) || isNil(this.foreGroundColors[0]))) {
            return false;
        }
        // only 'between' comparison requires second value
        if (this.comparisonType === HighlightComparisonType.BETWEEN && isNil(this.comparisonRawValues[1])) {
            return false;
        }
        // only 'quantile' comparison requires second value
        if (this.comparisonType === HighlightComparisonType.QUANTILE && isNil(this.backGroundColors?.[1]) && isNil(this.foreGroundColors?.[1])) {
            return false;
        }
        // Note- comparisonValues is not required in order to be valid because comparisonValues is generated from comparisonRawValues and is not saved
        return true;
    }

    equals(other: HighlightSettings): boolean {
        if (this.comparisonType !== other.comparisonType) {
            return false;
        }
        if (this.isEnabled !== other.isEnabled) {
            return false;
        }
        if (!isEqual(this.backGroundColors, other.backGroundColors)) {
            return false;
        }
        if (!isEqual(this.foreGroundColors, other.foreGroundColors)) {
            return false;
        }
        if (!isEqual(this.comparisonRawValues, other.comparisonRawValues)) {
            return false;
        }
        return isEqual(this.comparisonValues, other.comparisonValues);

    }
}
