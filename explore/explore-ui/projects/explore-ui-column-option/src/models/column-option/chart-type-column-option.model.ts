import {isEmpty, isObject} from 'lodash';
import {GenericValueColumnOption} from './generic-value-column-option.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Chart Type Column Options Model
 * This column option is deprecated and is no longer in use.
 * Its functionality has been moved to the widget level, specifically under `ComboChartColumnSettings`.
 *
 * We are not removing this model class to avoid passing widget context to the column level during deserialization process.
 * During the component initialization process, this option is added to ComboChartColumnSettings and then removed.
 */
export class ChartTypeColumnOption extends GenericValueColumnOption<string> {

    static CONFIG_TYPE = 'chartType';

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): ChartTypeColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isEmpty(optionValues.chartType)) {
            return undefined;
        }

        // Create the model.
        const columnOption: ChartTypeColumnOption = new ChartTypeColumnOption();
        columnOption.value = optionValues.chartType;

        // Remove the used settings.
        delete optionValues.chartType;

        return columnOption;
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return ChartTypeColumnOption.CONFIG_TYPE;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        if (defaultSettings) {
            this.value = defaultSettings.columnOptionAttributes[0].defaultValue.value;
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return undefined;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.value = data.chartType;
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !isEmpty(this.value);
    }

}
