import {
    AbstractColumnOption,
    ColumnConfig,
    ColumnOptionAttribute,
    ColumnOptionAttributeValue,
    ColumnOptionFactory,
    ColumnOptionMetaDataInterface,
    ColumnTitleModifiable,
    CoreColumnUtils,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    HasLegacyAndNewColumnOptionAttributes,
    RestrictedOptionInterface
} from '@blk/explore-ui-core';
import {ColumnOptionConstants} from '../constants';
import {CustomTitleColumnOption} from '../models/column-option/custom-title-column-option.model';
import {isEmpty, isNil} from 'lodash';
import {ScenarioColumnOption} from '../models/column-option/scenario-column-option.model';

export class ColumnOptionUtils {

    static readonly BASIS_POINT_OPTIONS = ['Basis Point (bp)', 'Percent (%)'];

    /**
     * Utility method to check if the object is an instance of this.
     */
    static hasLegacyAndNewColumnOptionAttributes(object: any): object is HasLegacyAndNewColumnOptionAttributes {
        return ColumnOptionConstants.deserializeLegacyColumnOptionAttributes in object;
    }

    static isColumnTitleModifiable(object: any): object is ColumnTitleModifiable {
        return ColumnOptionConstants.getModifiedColumnTitle in object;
    }

    /**
     * Populate values in this select option group using the column option  attribute and selectedValue passed in
     */
    static populateFromColumnOptionAttribute(optionGroup: ExploreSelectOptionGroup, colOptionAttribute: ColumnOptionAttribute, selectedValue: any) {
        colOptionAttribute.values.forEach((colOptionAttributeValue: ColumnOptionAttributeValue) => {
            optionGroup.values.push(new ExploreSelectOption(colOptionAttributeValue.label, colOptionAttributeValue.value, selectedValue === colOptionAttributeValue.value));
        });
    }

    /**
     * Function to update column title based on column option.
     */
    static updateColumnTitle(column: ColumnConfig, optionValue: AbstractColumnOption, widgetType: string): void {
        // if there column option model defined we still want to use that information to update title.
        if (!isNil(optionValue) && ColumnOptionUtils.isColumnTitleModifiable(optionValue)) {
            // WE have to use original title here, otherwise when column options are loaded title end up having multiple
            // entries.
            let originalTitle: string = CoreColumnUtils.getOriginalColumnTitle(column.columnTag, column.positionColumnType);
            if (optionValue instanceof CustomTitleColumnOption) {
                // If the optionValue is a custom title column option, then we need to check if the current title is the same as the original
                // Because another option might have already changed it, we want to use that instead. (CustomTitleColumnOption would just revert title to original if it doesn't have customTitle)
                originalTitle = column.columnTitle === originalTitle ? originalTitle : column.columnTitle;
            }
            column.columnTitle = (optionValue as ColumnTitleModifiable).getModifiedColumnTitle(originalTitle, widgetType);
        }
    }

    /**
     * get customTitle from column option
     */
    static getCustomTitle(column: ColumnConfig): string {
        const customTitleColumnOption = column.optionValues.find((option) => option.configType === CustomTitleColumnOption.CONFIG_TYPE);
        const customTitle = customTitleColumnOption ? (customTitleColumnOption as CustomTitleColumnOption).customTitle : null;
        return !isEmpty(customTitle) ? customTitle : null;
    }

    /**
     * Check if the target and source column option has same config type
     * Since ScenarioColumnOption has two config types: 'scenarioSettings' and 'scenarioRiskFactorViewColumnSettings'
     * need to check both
     * @param targetColumnOption: AbstractColumnOption
     * @param sourceColumnOptionMetaData: ColumnOptionMetaDataInterface
     * @return true if target column option has the same config type as source column option
     */
    static hasSameConfigType(targetColumnOption: AbstractColumnOption, sourceColumnOptionMetaData: ColumnOptionMetaDataInterface): boolean {
        return targetColumnOption.configType === sourceColumnOptionMetaData.columnOptionConfigType
            || targetColumnOption instanceof ScenarioColumnOption
            && (ScenarioColumnOption.ALT_CONFIG_TYPE === sourceColumnOptionMetaData.columnOptionConfigType || ScenarioColumnOption.CONFIG_TYPE === sourceColumnOptionMetaData.columnOptionConfigType);
    }

    /**
     * Update column options based on the parameters passed in (restricted, add, modify)
     * @param columnOptions: column options to update
     * @param restrictedColumnOptions: restricted column options to be filtered out
     * @param columnOptionsToAdd: column options to be added, optional
     * @param columnOptionsToModify: column options to be modified, optional
     * @return ColumnOptionMetaDataInterface[]: updated column options
     */
    static updateColumnOptions(columnOptions: ColumnOptionMetaDataInterface[], restrictedColumnOptions: RestrictedOptionInterface, columnOptionsToAdd?: ColumnOptionMetaDataInterface[], columnOptionsToModify?: Map<string, (columnOption: ColumnOptionMetaDataInterface) => void>): ColumnOptionMetaDataInterface[] {
        // filter out the options not required
        if (columnOptions.length) {
            columnOptions = ColumnOptionFactory.getFilteredColumnOptions(undefined, columnOptions, restrictedColumnOptions);
        }
        // add the options passed on as input
        if (!isEmpty(columnOptionsToAdd)) {
            columnOptions = columnOptions.concat(columnOptionsToAdd);
        }
        // modify options passed on as input
        if (columnOptionsToModify) {
            ColumnOptionFactory.modifyColumnOptions(columnOptionsToModify, columnOptions);
        }
        return columnOptions;
    }

    /**
     * check if scalingOptions are only 2 and equals to Basis point options without None
     * @param scalingOptions: scaling option to test
     */
     static isBasisPointWithoutNoneOption(scalingOptions: Map<string, number>): boolean {
        return scalingOptions.size === 2 && Object.keys(scalingOptions).every(option => ColumnOptionUtils.BASIS_POINT_OPTIONS.includes(option));
    }

    /**
     * checks if a given column is RAS multi-manager enabled by checking on it's decomposition mode value
     */
    static isColumnRasMultiManagerEnabled(columnConfig: ColumnConfig): boolean {
        return columnConfig.optionValues?.some(option => option.configType === 'columnBreakdown' && option['multiManagerData'] && option['multiManagerData'].decompositionMode !== 'none');
    }
}
