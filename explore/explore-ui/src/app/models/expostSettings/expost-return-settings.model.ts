import {
    AbstractConfig,
    ExpostSettings,
    RequestParamsCreator,
    TimePeriod,
    TimePeriodShortName,
    WidgetInput
} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * ExpostReturnSettings model
 */
export class ExpostReturnSettings extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    static readonly EXPOST_RETURN_SETTINGS = 'expostReturnSettings';

    timePeriod: TimePeriod;
    expostSettings: ExpostSettings;
    showBench = false;
    showActive = false;

    /**
     * Constructor to create an instance of ExpostReturnSettings
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return ExpostReturnSettings.EXPOST_RETURN_SETTINGS;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize the config to json.
     */
    serialize(): any {
        const data: any = {};
        data.timePeriod = this.timePeriod.serialize();
        data.expostSettings = this.expostSettings.serialize();
        data.showBench = this.showBench;
        data.showActive = this.showActive;
        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.timePeriod = new TimePeriod();
        this.timePeriod.deserialize(data.timePeriod);
        this.expostSettings = new ExpostSettings();
        this.expostSettings.deserialize(data.expostSettings);
        this.showBench = data.showBench;
        this.showActive = data.showActive;
    }

    /**
     * Return false if the passed in ExpostReturnSettings is not equal to this
     */
    equals(otherExpostReturnSettings: AbstractConfig): boolean {
        if (!(otherExpostReturnSettings instanceof ExpostReturnSettings)) {
            return false;
        }
        if (!this.timePeriod.equals(otherExpostReturnSettings.timePeriod)) {
            return false;
        }
        if (!this.expostSettings.equals(otherExpostReturnSettings.expostSettings)) {
            return false;
        }
        if (this.showBench !== otherExpostReturnSettings.showBench) {
            return false;
        }
        return this.showActive === otherExpostReturnSettings.showActive;
    }

    /**
     * @return true as it's data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Adds request parameters
     * @see RequestParamsCreator.addRequestParams
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        // Set a sampling period which for the ex-post returns request is always 1 Month
        const samplingPeriod = new TimePeriod();
        samplingPeriod.numberOfPeriods = 1;
        samplingPeriod.shortName = TimePeriodShortName.MONTHS;

        // Add request params
        ExpostSettings.addRequestParameters(requestParams, samplingPeriod, this.expostSettings.statisticPeriods, this.timePeriod, this.expostSettings.isNetReturns);
    }
}
