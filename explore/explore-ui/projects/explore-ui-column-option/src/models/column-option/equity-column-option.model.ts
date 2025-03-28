import {isUndefined, isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Equity column options model
 */
export class EquityColumnOption extends AbstractColumnOption {

    static CONFIG_TYPE = 'equity_column_options';

    noOfPeriods: number;
    frequency: string;
    measureType: string;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): EquityColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isUndefined(optionValues.noOfYears) && isUndefined(optionValues.frequency) && isUndefined(optionValues.measureType)) {
            return undefined;
        }

        // Create the model.
        const columnOption = new EquityColumnOption();
        columnOption.noOfPeriods = optionValues.noOfYears;
        columnOption.frequency = optionValues.frequency;
        columnOption.measureType = optionValues.measureType;

        // Remove the used settings.
        delete optionValues.noOfYears;
        delete optionValues.frequency;
        delete optionValues.measureType;

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
    public get configType(): string {
        return EquityColumnOption.CONFIG_TYPE;
    }


    /**
     * Get params that are to be send as a part of the request param
     */
    protected doAddRequestParams(requestParams: any) {
        if (!isUndefined(this.noOfPeriods)) {
            requestParams['noOfYears'] = this.noOfPeriods;
        }
        if (!isUndefined(this.frequency)) {
            requestParams['frequency'] = this.frequency;
        }
        if (!isUndefined(this.measureType)) {
            requestParams['measureType'] = this.measureType;
        }
    }

    /**
     * Initialises the column with the default settings.
     */
    public initialize(defaultSettings: any): void {
        // Checks for which option is present in column attributes.
        const noOfYearsObj: any = this.findSetting(defaultSettings, 'noOfYears');
        const frequencyObj: any = this.findSetting(defaultSettings, 'frequency');
        const measureObj: any = this.findSetting(defaultSettings, 'measureType');

        // Set the values if the the options are present
        if (noOfYearsObj) {
            this.noOfPeriods = noOfYearsObj.defaultValue.value;
        }
        if (frequencyObj) {
            this.frequency = frequencyObj.defaultValue.value;
        }
        if (measureObj) {
            this.measureType = measureObj.defaultValue.value;
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        const data: any = {};
        if (this.noOfPeriods) {
            data.noOfPeriods = this.noOfPeriods;
        }
        if (this.frequency) {
            data.frequency = this.frequency;
        }
        if (this.measureType) {
            data.measureType = this.measureType;
        }
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (data.noOfYears || data.noOfPeriods) {
           this.noOfPeriods = data.noOfYears ? data.noOfYears : data.noOfPeriods;
        }
        if (data.frequency) {
            this.frequency = data.frequency;
        }
        if (data.measureType) {
            this.measureType = data.measureType;
        }
    }

    /**
     * AbstractColumnOption.equals(AbstractColumnOption)
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof EquityColumnOption)) {
            return false;
        }
        return this.noOfPeriods === otherColOption.noOfPeriods && this.frequency === otherColOption.frequency && this.measureType === otherColOption.measureType;
    }

    /**
     * AbstractColumnOption.isValid()
     */
    isValid(): boolean {
        return !(isUndefined(this.noOfPeriods) && isUndefined(this.frequency) && isUndefined(this.measureType));
    }
}
