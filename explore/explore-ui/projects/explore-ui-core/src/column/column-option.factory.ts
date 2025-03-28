import {HasLegacyAndNewColumnOptionAttributes, ColumnOptionMetaDataInterface, RestrictedOptionInterface} from './interfaces';
import {CoreWidgetConfigStore} from '../widget-config/core-widget-config.store';
import {cloneDeep, each, find, isArray, isFunction, isNil} from 'lodash';
import {AbstractColumnOption} from './models/abstract-column-option.model';

/**
 * This Class acts as factory for generating column option model
 */
export class ColumnOptionFactory {

    // Contains the list of column option types that this factory class knows how to create.
    // NOTE: This is populated from all the column option model classes that can be created.
    private static optionTypes: Map<string, any> = new Map<string, any>();

    private static readonly deserializeLegacyColumnOptionAttributes = 'deserializeLegacyColumnOptionAttributes';

    /**
     * Registers a config type with the factory.
     */
    static registerOptionType(name: string, optionModel: any) {
        ColumnOptionFactory.optionTypes.set(name, optionModel);
    }

    /**
     * Returns the column option type
     * @param type  They column option config type
     */
    static getOptionType(type: string): any {
        return ColumnOptionFactory.optionTypes.get(type);
    }

    /**
     * Creates a new instance of the model for the type given.
     * @param type - config type of the model
     * @param defaultSettings - allows for the column option to be initialised with default settings. This is an optional parameter.
     * @param definitions - definitions from the store
     */
    static createNewModel(type: string, defaultSettings?: any, definitions?: Map<string, any>): AbstractColumnOption {
        const optionType: any = ColumnOptionFactory.optionTypes.get(type);
        if (!optionType) {
            return undefined;
        }

        const columnOption: AbstractColumnOption = new optionType();
        columnOption.initialize(defaultSettings, definitions);
        return columnOption;
    }

    /**
     * Get Column option model based on model name passed.
     * @param optionDefinitions The definitions from the store
     * @param key The string name of the option being created.
     * @param option The option to be converted into a model.
     */
    static createModel(key: string, option: any, optionDefinitions?: Map<string, any>): AbstractColumnOption {
        // If the key passed in is not defined then just get out.
        if (isNil(key)) {
            return undefined;
        }

        // Return a new instance of the correct config object.
        // NOTE:  The check on key here is to be able to deserialize existing favorites that may not have the config type specified.
        const optionType: AbstractColumnOption = ColumnOptionFactory.createNewModel(key, option, optionDefinitions);
        if (optionType) {
            return optionType;
        }

        // If we got here then we don't know what it is so just return nothing.
        return undefined;
    }

    /**
     * As part of deserializing a column we need to create all the column option models for it.
     */
    static createModels(optionValues: any): AbstractColumnOption[] {
        const optionModels: AbstractColumnOption[] = [];

        // First go through the list of options and create any that have a config type.
        const optionValuesCopy: any = cloneDeep(optionValues);
        each(optionValues, function(value: any, key: string) {
            // If the value  is undefined or null then just skip it.
            if (isNil(value)) {
                return;
            }
            if (isArray(optionValues)) {
                key = value.configType;
            }
            if (!key) {
                return;
            }

            // Create the model.
            let optionModel: AbstractColumnOption;
            if (value instanceof AbstractColumnOption) {
                optionModel = value;
            } else {
                optionModel = ColumnOptionFactory.createModel(key, undefined);
                if (optionModel) {
                    optionModel.deserialize(value);
                    if (ColumnOptionFactory.hasLegacyAndNewColumnOptionAttributes(optionModel)) {
                        optionModel.deserializeLegacyColumnOptionAttributes(optionValues);
                    }
                }
            }

            // If we got a model then add it to the new object.
            if (optionModel) {
                optionModels.push(optionModel);
                // Also remove this key from the copy as we do not need to cater for it now.
                delete optionValuesCopy[key];
            }
        });

        // Now if we have any options left then we need to figure out which column option
        const legacyOptions: AbstractColumnOption[] = ColumnOptionFactory.createModelFromLegacyOptions(optionValuesCopy);
        each(legacyOptions, function(optionModel: AbstractColumnOption) {
            // For some favorites we may have a new and a legacy favorite, so only add ones that are not already there.
            if (!(find(optionModels, {configType: optionModel.configType}))) {
                optionModels.push(optionModel);
            }
        });
        return optionModels;
    }

    /**
     * Utility method to check if the object is an instance of this.
     */
    private static hasLegacyAndNewColumnOptionAttributes(object: any): object is HasLegacyAndNewColumnOptionAttributes {
        return ColumnOptionFactory.deserializeLegacyColumnOptionAttributes in object;
    }

    /**
     * Filter out the column options not needed by this widget.
     * @param configType - configuration type
     * @param columnOptions - column options array to be filtered
     * @param restrictedOptions - restricted options, if any
     */
    static getFilteredColumnOptions(configType, columnOptions: ColumnOptionMetaDataInterface[], restrictedOptions?: RestrictedOptionInterface): ColumnOptionMetaDataInterface[] {

        if (isNil(restrictedOptions)) {
            // Get the column options that are restricted for this widget.
            restrictedOptions = ColumnOptionFactory.getRestrictedColumnOptions(configType);
            // If there are no restrictions then just return the full list.
            if (!restrictedOptions) {
                return columnOptions;
            }
        }

        // No go through them and skip any that match the restrictions.
        // {"sections": ["columnBreakdown", "aggregation"],
        // "options": [{"section": "performanceSettings", "options": ["TIME-PERIOD", "AS-REPORTED"]}]}
        let filteredOptions = columnOptions.filter((columnOption) => {
            return !restrictedOptions.sections.some((section) => section === columnOption.columnOptionKey);
        });

        // Now if there are any options to be removed process them.
        if (restrictedOptions.options) {
            restrictedOptions.options.forEach((restrictedOption) => {
                const option = filteredOptions.find((filteredOption) =>
                    filteredOption.columnOptionKey === restrictedOption.section
                );

                // Didn't find the option so skip out of here.
                if (!option) {
                    return;
                }

                // Go through the options and remove any that are in the restricted options.
                for (let i = option.columnOptionAttributes.length - 1; i >= 0; i--) {
                    const key = option.columnOptionAttributes[i].key;
                    if (restrictedOption.options.some((restrictedOptionInner) => restrictedOptionInner === key)) {
                        option.columnOptionAttributes.splice(i, 1);
                    }
                }
            });

            // We may have removed all the options above, so filter out the items with no options left.
            filteredOptions = filteredOptions.filter((filteredOption) =>
                filteredOption.columnOptionAttributes.length > 0
            );
        }
        return filteredOptions;
    }

    /**
     * Modifies Column Options
     */
    static modifyColumnOptions(columnOptionsToModify: Map<string, (columnOption: ColumnOptionMetaDataInterface) => void>, columnOptions: ColumnOptionMetaDataInterface[]): void {
        if (!columnOptionsToModify) {
            return;
        }

        columnOptions.forEach(columnOption => {
            const modifyColumnOptionValueCallback = columnOptionsToModify.get(columnOption.columnOptionConfigType);
            if (modifyColumnOptionValueCallback) {
                modifyColumnOptionValueCallback(columnOption);
            }
        });
    }

    /**
     * Return restricted column options for the passed in configType
     */
    static getRestrictedColumnOptions(configType: string): any {
        const chartConfig = CoreWidgetConfigStore.chartConfig.get(configType);
        return chartConfig && chartConfig.restrictedColumnOptions ? cloneDeep(chartConfig.restrictedColumnOptions) : null;
    }

    /**
     * This function checks all the items registered with this service and if it supports the key then generates the correct option.
     * NOTE:  The optionValues passed into this function is modified to remove any values that are consumed as part of this.
     */
    private static createModelFromLegacyOptions(optionValues: any): AbstractColumnOption[] {
        const options: AbstractColumnOption[] = [];
        // Loop through the  and if they support creating a legacy config allow it to create the item.
        each(Array.from(ColumnOptionFactory.optionTypes.values()), function(type: any) {
            if (!isFunction(type.createModelLegacy)) {
                return;
            }

            const optionModel: AbstractColumnOption = type.createModelLegacy(optionValues);
            if (optionModel) {
                options.push(optionModel);
            }
        });
        return options;
    }
}
