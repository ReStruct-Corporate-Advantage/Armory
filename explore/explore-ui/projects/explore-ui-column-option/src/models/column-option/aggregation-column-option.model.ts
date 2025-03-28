import {isNil, isObject, isString} from 'lodash';
import {GenericValueColumnOption} from './generic-value-column-option.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Aggregation Column Options Model
 */
export class AggregationColumnOption extends GenericValueColumnOption<number> {

    static CONFIG_TYPE = 'aggregation';

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): AggregationColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.aggregationType)) {
            return undefined;
        }

        // Create the model.
        const columnOption: AggregationColumnOption = new AggregationColumnOption();
        columnOption.value = optionValues.aggregationType;

        // Remove the used settings.
        delete optionValues.aggregationType;

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
        return AggregationColumnOption.CONFIG_TYPE;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams['aggregationType'] = this.value;
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        if (defaultSettings) {
            this.value = Number(defaultSettings.columnOptionAttributes[0].defaultValue.value);
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            aggregationType: this.value
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.value = isString(data.aggregationType) ? Number(data.aggregationType) : data.aggregationType;
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !(isNil(this.value) || this.value === -1);
    }

}

