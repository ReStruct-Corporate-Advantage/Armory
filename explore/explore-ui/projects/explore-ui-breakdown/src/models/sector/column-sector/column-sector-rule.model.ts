import {isArray, isEmpty, isEqual, isObject, isUndefined} from 'lodash';
import {Rule} from '../../../interfaces/rule.interface';
import {CustomSectorType} from '../../../enums/custom-sector-type.enum';
import {SectorConstants} from '../../../constants/sector.constants';
import {AbstractConfig, CommonUtils, CoreColumnUtils, SerializeFavoriteType, ColumnDefinition} from '@blk/explore-ui-core';

/**
 * Class for the column sector rule.
 */
export class ColumnSectorRule extends AbstractConfig implements Rule {

    columnName: string;
    columnTag: string;
    positionColumnType: string;
    dataType: string;
    comparisonType: string;
    comparisonValues: Array<string | number>;
    comparisonLabels: string[];
    customSectorType: string = CustomSectorType.ATTRIBUTES;
    includeNullValues: boolean;

    /**
     * This method will populate values from rule builder into rule.
     */
    static updateRule(rule: ColumnSectorRule, selectedColumn: any, operator: string, value: any, dataType: string, includeNullValues?: boolean): boolean {
        // Check whether any changes happened to the rule...or not
        const ruleChangedAtAll: boolean = ColumnSectorRule.checkIfRuleChanged(rule, selectedColumn, operator, value, dataType, includeNullValues);

        rule.columnName = selectedColumn.title;
        rule.columnTag = selectedColumn.columnTag;
        rule.positionColumnType = selectedColumn.uses;
        rule.comparisonType = operator;
        rule.comparisonValues = isArray(value) ? value : [value];

        // If the column dataType is an INT or DOUBLE, set the custom rule's dataType to be 'Numeric'
        rule.dataType = dataType;

        rule.includeNullValues = includeNullValues;
        // return the boolean indicating whether the change happened or not
        return ruleChangedAtAll;
    }

    /**
     * This method checks whether any changes happened to the rule...or not
     */
    static checkIfRuleChanged(rule: ColumnSectorRule, selectedColumn: any, operator: string, value: any, dataType: string, includeNullValues: boolean): boolean {
        let areRuleValuesTheSame: boolean;

        // Here 3 scenarios are in consideration -
        // 1) If the value is undefined Or null
        // 2) If the value is defined and is an Array
        // 3) If the value is defined and is not an Array
        if (value === null) {
            areRuleValuesTheSame = isEmpty(rule.comparisonValues);
        } else {
            areRuleValuesTheSame = isArray(value) ? CommonUtils.compareTheValues(rule.comparisonValues, value) : CommonUtils.compareTheValues(rule.comparisonValues, [value]);
        }

        return !(rule.columnName === selectedColumn.title && rule.columnTag === selectedColumn.columnTag && rule.positionColumnType === selectedColumn.uses && rule.comparisonType === operator && rule.dataType === dataType && rule.includeNullValues === includeNullValues && areRuleValuesTheSame);
    }


    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Method to copy values of any other column sector rule into this rule
     * @param columnSectorRule
     */
    copy(columnSectorRule: ColumnSectorRule) {
        this.customSectorType = columnSectorRule.customSectorType;
        this.columnTag = columnSectorRule.columnTag;
        this.comparisonType = columnSectorRule.comparisonType;
        this.comparisonValues = columnSectorRule.comparisonValues;
        this.columnName = columnSectorRule.columnName;
        this.comparisonLabels = columnSectorRule.comparisonLabels;
        this.positionColumnType = columnSectorRule.positionColumnType;
        this.includeNullValues = columnSectorRule.includeNullValues;
        this.dataType = columnSectorRule.dataType;
    }

    /**
     * Gets the config type for column custom sector rule.
     */
    get configType(): string {
        return SectorConstants.ConfigType.COLUMN_SECTOR_RULE;
    }

    /**
     * Gets the name of the rule type for this rule.
     */
    get ruleType(): string {
        return 'Rule';
    }

    /**
     * Gets a user friendly display of the custom sector rule.
     */
    getDisplayText(): string {
        let text: string = this.columnName + ' ' + this.comparisonType + ' ';
        text += this.comparisonLabels ? this.comparisonLabels.toString() : this.comparisonValues.toString();
        return text;
    }

    /**
     * Gets a user friendly display of fund sector rule.
     */
    getDisplayTextForFundSectoring(): string {
        let text: string;
        switch (this.customSectorType) {
            case CustomSectorType.FUND:
                text = SectorConstants.CUSTOM_SECTOR_RULE_TEXT.FUND_ASSIGNMENT_EQUALS;
                break;
            case CustomSectorType.PORTFOLIO:
                text = SectorConstants.CUSTOM_SECTOR_RULE_TEXT.PORTFOLIO_ASSIGNMENT_EQUALS;
                break;
            case CustomSectorType.INDEX:
                text = SectorConstants.CUSTOM_SECTOR_RULE_TEXT.INDEX_ASSIGNMENT_EQUALS;
        }
        return text + this.comparisonValues.toString();
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            colPositionColumnType: this.positionColumnType,
            colTag: this.columnTag,
            colTitle: this.columnName,
            colType: this.dataType,
            compType: this.comparisonType,
            compValues: this.comparisonValues,
            compValuesLabel: this.comparisonLabels,
            customSectorType: this.customSectorType,
            ruleType: this.ruleType,
            includeNullValues: this.includeNullValues
        };
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        // Ensure a column tag does not have whitespaces
        this.columnTag = CoreColumnUtils.replaceWhitespaceInColumnTag(data.colTag);
        this.comparisonType = data.compType;
        this.dataType = data.colType;

        let column: ColumnDefinition = CoreColumnUtils.getColumnDefByTag(this.columnTag);
        this.columnName = column ? column.title : data.colTitle;
        this.positionColumnType = data.colPositionColumnType;
        this.comparisonValues = data.compValues;
        this.comparisonLabels = data.compValuesLabel;
        this.customSectorType = data.customSectorType ? data.customSectorType : CustomSectorType.ATTRIBUTES;
        this.includeNullValues = data.includeNullValues;
    }

    /**
     * Checks if this rule definition is valid.
     */
    isValid(): boolean {
        // For a column rule it needs to have the 4 main attributes set.
        return !isUndefined(this.columnTag) && !isUndefined(this.comparisonType) && !isUndefined(this.comparisonValues) && this.comparisonValues.length > 0;
    }

    /**
     * Returns true, if both object are equal
     * @param ruleInput
     */
    equals(ruleInput: Rule): boolean {
        if (!(ruleInput instanceof ColumnSectorRule)) {
            return false;
        }

        return isEqual(this, ruleInput);
    }
}
