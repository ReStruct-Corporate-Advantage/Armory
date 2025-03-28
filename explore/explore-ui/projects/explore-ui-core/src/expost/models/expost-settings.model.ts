import {cloneDeep, forEach, isNil, isObject} from 'lodash';
import {DerivedSettings, RequestParamsCreator} from '../../core/interfaces';
import {AbstractConfig} from '../../core/models/abstract-config.model';
import {TimePeriod} from '../../date/models/time-period/time-period.model';
import {WidgetInput} from '../../widget-config/interfaces';

/**
 * ExpostSettings model
 */
export class ExpostSettings extends AbstractConfig implements DerivedSettings<ExpostSettings>, WidgetInput, RequestParamsCreator {

    static readonly EXPOST_SETTINGS = 'expostSettings';

    static readonly configType = ExpostSettings.EXPOST_SETTINGS;

    /**
     * Sampling Period
     */
    samplingPeriod: TimePeriod;

    /**
     * Statistic Period
     */
    statisticPeriods: TimePeriod[] = [];

    /**
     * Net Returns flag
     */
    isNetReturns: boolean;

    /**
     * Gross and Net Returns flag
     */
    isGrossAndNetReturns: boolean;

    /**
     * Log Returns flag
     */
    isLogNormal: boolean;

    /**
     * Flag indicating if category breakdown is to be applied
     */
    categoryBreakdown = true;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Adds given parameter the given request parameters
     * @param requestParams the request params to add the parameters to
     * @param samplingPeriod a sampling period to add
     * @param statisticPeriods statistical periods to add
     * @param timePeriod an optional time period to add
     */
    static addRequestParameters(requestParams: any, samplingPeriod: TimePeriod, statisticPeriods: TimePeriod[], timePeriod?: TimePeriod, isNetReturns?: boolean) {
        // Set a sampling period
        requestParams.samplingPeriod = samplingPeriod.createReqParamWithNumberOfPeriodsAndShortName();

        // Set statistical periods
        requestParams.statisticPeriods = [];
        statisticPeriods.forEach(function (statisticPeriod: TimePeriod) {
            requestParams.statisticPeriods.push({
                numberOfPeriods: statisticPeriod.numberOfPeriods,
                shortName: statisticPeriod.shortName
            });
        });

        if (!isNil(timePeriod)) {
            requestParams.timePeriod = timePeriod.createReqParamWithNumberOfPeriodsAndShortName();
        }
        if (!isNil(isNetReturns)) {
            requestParams.isNetReturns = isNetReturns;
        }
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
        if (this.samplingPeriod) {
            data.samplingPeriod = this.samplingPeriod.serialize();
        }

        data.statisticPeriods = [];
        forEach(this.statisticPeriods, function (statsPeriod: TimePeriod) {
            data.statisticPeriods.push(statsPeriod.serialize());
        });
        if (!isNil(this.isNetReturns)) {
            data.isNetReturns = this.isNetReturns;
        }
        if (!isNil(this.isGrossAndNetReturns)) {
            data.isGrossAndNetReturns = this.isGrossAndNetReturns;
        }
        if (!isNil(this.isLogNormal)) {
            data.isLogNormal = this.isLogNormal;
        }
        if (!isNil(this.categoryBreakdown)) {
            data.categoryBreakdown = this.categoryBreakdown;
        }

        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (data.samplingPeriod) {
            this.samplingPeriod = new TimePeriod();
            this.samplingPeriod.deserialize(data.samplingPeriod);
        }
        this.statisticPeriods = [];
        const self = this;
        if (data.statisticPeriods) {
            forEach(data.statisticPeriods, function (statsPeriod: any) {
                if (!statsPeriod) {
                    return;
                }
                const statisticsPeriod = new TimePeriod();
                statisticsPeriod.deserialize(statsPeriod);
                self.statisticPeriods.push(statisticsPeriod);
            });
        } else if (data.statisticPeriod) {
            const statisticsPeriod = new TimePeriod();
            statisticsPeriod.deserialize(data.statisticPeriod);
        }

        if (!isNil(data.isNetReturns)) {
            this.isNetReturns = data.isNetReturns;
        }
        if (!isNil(data.isGrossAndNetReturns)) {
            this.isGrossAndNetReturns = data.isGrossAndNetReturns;
        }
        if (!isNil(data.isLogNormal)) {
            this.isLogNormal = data.isLogNormal;
        }
        if (!isNil(data.categoryBreakdown)) {
            this.categoryBreakdown = data.categoryBreakdown;
        }
    }

    /**
     * Return false if the passed in ExpostSettings is not equal to this
     */
    equals(otherExpostSettings: AbstractConfig): boolean {
        if (!(otherExpostSettings instanceof ExpostSettings)) {
            return false;
        }
        if (!this.samplingPeriod) {
            if (otherExpostSettings.samplingPeriod) {
                return false;
            }
        } else if (!this.samplingPeriod.equals(otherExpostSettings.samplingPeriod)) {
            return false;
        }

        if (this.statisticPeriods.length !== otherExpostSettings.statisticPeriods.length) {
            return false;
        }
        for (let i = 0; i < this.statisticPeriods.length; i++) {
            if (!this.statisticPeriods[i].equals(otherExpostSettings.statisticPeriods[i])) {
                return false;
            }
        }
        if (this.isNetReturns !== otherExpostSettings.isNetReturns) {
            return false;
        }
        if (this.isGrossAndNetReturns !== otherExpostSettings.isGrossAndNetReturns) {
            return false;
        }
        if (this.isLogNormal !== otherExpostSettings.isLogNormal) {
            return false;
        }

        return this.categoryBreakdown === otherExpostSettings.categoryBreakdown;
    }

    /**
     * AbstractDerivedSettingsColumnOption.getParentPortfolioSettingKey()
     */
    getParentPortfolioSettingKey(): string {
        return ExpostSettings.EXPOST_SETTINGS;
    }

    /**
     * AbstractDerivedSettingsColumnOption.getParentWidgetSettingKey()
     */
    getParentWidgetSettingKey(): string {
        return ExpostSettings.EXPOST_SETTINGS;
    }

    /**
     * AbstractDerivedSettingsColumnOption.updateDerivedSettings
     */
    updateDerivedSettings(settings: ExpostSettings, updateColumnOnlySettings?: boolean): void {
        if (isNil(this.samplingPeriod) && !updateColumnOnlySettings) {
            this.samplingPeriod = cloneDeep(settings.samplingPeriod);
        }
        if (this.statisticPeriods.length === 0 && !updateColumnOnlySettings) {
            this.statisticPeriods = cloneDeep(settings.statisticPeriods);
        }
        if (isNil(this.isLogNormal)) {
            this.isLogNormal = settings.isLogNormal;
        }
        if (isNil(this.isNetReturns)) {
            this.isNetReturns = settings.isNetReturns;
        }
    }

    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Adds request parameters
     * @see RequestParamsCreator.addRequestParams
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        // Set a sampling period
        ExpostSettings.addRequestParameters(requestParams, this.samplingPeriod, this.statisticPeriods);
        // Set category breakdown
        requestParams.categoryBreakdown = this.categoryBreakdown;
    }
}
