import {isNil, isObject} from 'lodash';
import {AbstractColumnOption, ColumnOptionAttribute, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * This Class represent custom aggregation column options.
 */
export class CustomAggregationColumnOption extends AbstractColumnOption {

    static CONFIG_TYPE = 'customAggregation';
    static SUBTOTAL_TYPE = 'subtotalType';
    static MIN_AGG_VALUE = 'minAggValue';
    static MAX_AGG_VALUE = 'maxAggValue';
    static EXCLUDE_OR_CAP = 'excludeOrCap';
    static WEIGHT_TYPE = 'weightType';
    static COL_WEIGHT_TYPE = 'colWeightType';
    static EXCLUDE_NULL_VALUES = 'excludeNullValues';

    subtotalType: number;
    minAggValue: number;
    maxAggValue: number;
    excludeOrCap: boolean;
    weightType: string;
    colWeightType: string;
    excludeNullValues = true;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): CustomAggregationColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.subtotalType) || isNil(optionValues.weightType)) {
            return undefined;
        }

        // Create the model.
        const columnOption = new CustomAggregationColumnOption();
        columnOption.subtotalType = Number(optionValues.subtotalType);
        if (!isNil(optionValues.minAggValue)) {
            columnOption.minAggValue = Number(optionValues.minAggValue);
        }
        if (!isNil(optionValues.maxAggValue)) {
            columnOption.maxAggValue = Number(optionValues.maxAggValue);
        }
        if (!isNil(optionValues.excludeOrCap)) {
            columnOption.excludeOrCap = Boolean(optionValues.excludeOrCap);
        }
        if (!isNil(optionValues.weightType)) {
            columnOption.weightType = optionValues.weightType;
        }
        if (!isNil(optionValues.colWeightType)) {
            columnOption.colWeightType = optionValues.colWeightType;
        }
        // Remove the used settings.
        delete optionValues.subtotalType;
        delete optionValues.minAggValue;
        delete optionValues.maxAggValue;
        delete optionValues.excludeOrCap;
        delete optionValues.weightType;
        delete optionValues.colWeightType;

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
     * AbstractColumnOption.configType()
     */
    get configType(): string {
        return CustomAggregationColumnOption.CONFIG_TYPE;
    }

    /**
     * Initialises the column with the default settings.
     */
    public initialize(defaultSettings: any): void {
        // Get out if there are no default settings.
        if (!defaultSettings || !defaultSettings.columnOptionAttributes) {
            return;
        }

        defaultSettings.columnOptionAttributes.forEach((columnOptionAttribute: ColumnOptionAttribute) => {
            // If no default value then skip over this one.
            if (isNil(columnOptionAttribute.defaultValue) || isNil(columnOptionAttribute.defaultValue.value) || isNil(columnOptionAttribute.defaultValue.value)) {
                return;
            }

            // Since this item has a default value we need to set it into the correct property.
            // Note:  For some of these we may also need to convert the data type.
            const defaultValue = columnOptionAttribute.defaultValue.value;
            switch (columnOptionAttribute.key) {
                case CustomAggregationColumnOption.SUBTOTAL_TYPE:
                    this.subtotalType = Number(defaultValue);
                    break;
                case CustomAggregationColumnOption.MIN_AGG_VALUE:
                    this.minAggValue = Number(defaultValue);
                    break;
                case CustomAggregationColumnOption.MAX_AGG_VALUE:
                    this.maxAggValue = Number(defaultValue);
                    break;
                case CustomAggregationColumnOption.EXCLUDE_OR_CAP:
                    this.excludeOrCap = Boolean(defaultValue);
                    break;
                case CustomAggregationColumnOption.WEIGHT_TYPE:
                    this.weightType = defaultValue;
                    break;
                case CustomAggregationColumnOption.COL_WEIGHT_TYPE:
                    this.colWeightType = defaultValue;
                    break;
            }
        });
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        // Get out if there is no data.
        if (!data) {
            return;
        }

        // Set the required variables.
        this.subtotalType = data.subtotalType;
        if (!isNil(data.minAggValue)) {
            this.minAggValue = data.minAggValue;
        }
        if (!isNil(data.maxAggValue)) {
            this.maxAggValue = data.maxAggValue;
        }
        if (!isNil(data.excludeOrCap)) {
            this.excludeOrCap = data.excludeOrCap;
        }
        if (!isNil(data.weightType)) {
            this.weightType = data.weightType;
        }
        if (!isNil(data.colWeightType)) {
            this.colWeightType = data.colWeightType;
        }
        if (!isNil(data.excludeNullValues)) {
            this.excludeNullValues = data.excludeNullValues;
        }
    }

    /**
     * Add params that are to be send as a part of the request Param
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams.subtotalType = this.subtotalType;
        requestParams.excludeNullValues = this.excludeNullValues;
        if (!isNil(this.minAggValue)) {
            requestParams.minAggValue = this.minAggValue;
        }
        if (!isNil(this.maxAggValue)) {
            requestParams.maxAggValue = this.maxAggValue;
        }
        if (!isNil(this.excludeOrCap)) {
            requestParams.excludeOrCap = this.excludeOrCap;
        }
        if (!isNil(this.weightType)) {
            requestParams.weightType = this.weightType;
        }
        if (!isNil(this.colWeightType)) {
            requestParams.colWeightType = this.colWeightType;
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        const data: any = {
            subtotalType: this.subtotalType,
            excludeNullValues: this.excludeNullValues
        };
        if (!isNil(this.minAggValue)) {
            data.minAggValue = this.minAggValue;
        }
        if (!isNil(this.maxAggValue)) {
            data.maxAggValue = this.maxAggValue;
        }
        if (!isNil(this.excludeOrCap)) {
            data.excludeOrCap = this.excludeOrCap;
        }
        if (!isNil(this.weightType)) {
            data.weightType = this.weightType;
        }
        if (!isNil(this.colWeightType)) {
            data.colWeightType = this.colWeightType;
        }
        return data;
    }

    /**
     * AbstractColumnOption.equals(AbstractColumnOption)
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof CustomAggregationColumnOption)) {
            return false;
        }
        return this.subtotalType === otherColOption.subtotalType
            && this.minAggValue === otherColOption.minAggValue
            && this.maxAggValue === otherColOption.maxAggValue
            && this.excludeOrCap === otherColOption.excludeOrCap
            && this.weightType === otherColOption.weightType
            && this.colWeightType  === otherColOption.colWeightType
            && this.excludeNullValues === otherColOption.excludeNullValues;
    }

    /**
     * AbstractColumnOption.isValid()
     */
    isValid(): boolean {
        return !isNil(this.subtotalType);
    }
}
