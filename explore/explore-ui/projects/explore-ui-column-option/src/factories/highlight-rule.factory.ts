import {HighlightComparisonType} from '../enums';
import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightRule} from '../models/highlight/highlight-rule.model';
import {HighlightSettings} from '../models/highlight/highlight-settings.model';

/**
 * Factory that holds the configs for the various types of highlight rules that can be applied to table columns
 */
export class HighlightRuleFactory {

    /**
     * Mapping of highlight rule types to their corresponding classes
     */
    private static ruleTypes: Map<HighlightComparisonType, any> = new Map<HighlightComparisonType, any>();

    /**
     * Registers a highlight rule type with the factory.  Set in config.initializer.ts
     */
    static registerRuleType(comparisonType: HighlightComparisonType, configType: any) {
        HighlightRuleFactory.ruleTypes.set(comparisonType, configType);
    }

    /**
     * Creates the specific highlight rule class based on highlightSetting.comparisonType
     * @param highlightSetting  Settings for the highlight rule
     * @param columnConfig  Column the highlight rule is applied to
     * @param dataColumnIndex  Index of the column in the data response from backend
     * @param columnValues  Data values of column.  Needed for some types such as quantile, std dev, top/bottom %
     */
    static createHighlightRule(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: number[]): HighlightRule {
        const highlightRuleType = HighlightRuleFactory.ruleTypes.get(highlightSetting.comparisonType);

        if (!highlightRuleType) {
            console.warn('No highlight rule found for: ' + highlightSetting.comparisonType);
            return;
        }

        return new highlightRuleType(highlightSetting, columnConfig, dataColumnIndex, columnValues);
    }

    /**
     * Returns the display name corresponding to each {@link HighlightComparisonType}
     * @param compareType  The enum representing the comparison type
     * @returns  Display name of comparison type
     */
    static getDisplayName(compareType: HighlightComparisonType): string {
        switch (compareType) {
            case HighlightComparisonType.EQUALS:
                return 'Equals';
            case HighlightComparisonType.DOES_NOT_EQUAL:
                return 'Does not equal';
            case HighlightComparisonType.GREATER_THAN:
                return 'Greater than';
            case HighlightComparisonType.LESS_THAN:
                return 'Less than';
            case HighlightComparisonType.GT_THAN_EQUAL:
                return 'Greater than or equal';
            case HighlightComparisonType.LESS_THAN_EQUAL:
                return 'Less than or equal';
            case HighlightComparisonType.STARTS_WITH:
                return 'Starts with';
            case HighlightComparisonType.CONTAINS:
                return 'Contains';
            case HighlightComparisonType.DOES_NOT_CONTAIN:
                return 'Does not contain';
            case HighlightComparisonType.TOP:
                return 'Top %';
            case HighlightComparisonType.BOTTOM:
                return 'Bottom %';
            case HighlightComparisonType.BETWEEN:
                return 'Between';
            case HighlightComparisonType.STD_DEV_IN:
                return 'Within (standard deviation)';
            case HighlightComparisonType.STD_DEV_OUT:
                return 'Outliers (standard deviation)';
            case HighlightComparisonType.QUANTILE:
                return 'Quantile';
            default:
                console.warn('No HighlightComparisonType: ' + compareType);
                return null;
        }
    }
}
