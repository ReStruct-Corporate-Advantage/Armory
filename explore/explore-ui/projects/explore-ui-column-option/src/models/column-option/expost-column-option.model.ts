import {
    AbstractColumnOption,
    ColumnTitleModifiable,
    DerivedSettings,
    ExpostSettings,
    ExpostSettingsStore,
    SerializeFavoriteType,
    TimePeriod
} from '@blk/explore-ui-core';
import {find, isEmpty, isNil, isObject} from 'lodash';

/**
 * Expost Column Options Model
 */
export class ExpostColumnOption extends AbstractColumnOption implements ColumnTitleModifiable, DerivedSettings<ExpostSettings> {
    static readonly CONFIG_TYPE = 'expostSettings';

    expostSettings: ExpostSettings;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): ExpostColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.samplingPeriodShortName) && isNil(optionValues.statisticPeriodShortName) && isNil(optionValues.isNetReturns) && isNil(optionValues.isLogNormal)) {
            return undefined;
        }

        // Create the model.
        const columnOption: ExpostColumnOption = new ExpostColumnOption();
        columnOption.expostSettings = new ExpostSettings();
        if (!isNil(optionValues.samplingPeriodShortName)) {
            columnOption.expostSettings.samplingPeriod = new TimePeriod('', optionValues.numberOfSamplingPeriods, optionValues.samplingPeriodShortName);
            delete optionValues.numberOfSamplingPeriods;
            delete optionValues.samplingPeriodShortName;
        }
        if (!isNil(optionValues.statisticPeriodShortName)) {
            columnOption.expostSettings.statisticPeriods[0] = new TimePeriod('', optionValues.numberOfStatisticPeriods, optionValues.statisticPeriodShortName);
            delete optionValues.numberOfStatisticPeriods;
            delete optionValues.statisticPeriodShortName;
        }
        if (!isNil(optionValues.isNetReturns)) {
            columnOption.expostSettings.isNetReturns = optionValues.isNetReturns;
            delete optionValues.isNetReturns;
        }
        if (!isNil(optionValues.isLogNormal)) {
            columnOption.expostSettings.isLogNormal = optionValues.isLogNormal;
            delete optionValues.isLogNormal;
        }

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
        return ExpostColumnOption.CONFIG_TYPE;
    }

    /**
     * Modify the column title to have the selected settings.
     */
    public getModifiedColumnTitle(originalTitle: string): string {
        // append sampling period and statistic period
        let modifiedTitle = originalTitle + '(';
        if (this.expostSettings.samplingPeriod && !this.expostSettings.samplingPeriod.timePeriodName) {
            this.expostSettings.samplingPeriod.timePeriodName = find(ExpostSettingsStore.supportedSamplingPeriods, {
                shortName: this.expostSettings.samplingPeriod.shortName,
                numberOfPeriods: this.expostSettings.samplingPeriod.numberOfPeriods
            }).timePeriodName;
        }
        modifiedTitle += this.expostSettings.samplingPeriod ? this.expostSettings.samplingPeriod.timePeriodName : 'Widget Default';

        modifiedTitle += ',';
        if (!isEmpty(this.expostSettings.statisticPeriods) && !this.expostSettings.statisticPeriods[0].timePeriodName) {
            this.expostSettings.statisticPeriods[0].timePeriodName = find(ExpostSettingsStore.supportedStatisticPeriods, {
                shortName: this.expostSettings.statisticPeriods[0].shortName,
                numberOfPeriods: this.expostSettings.statisticPeriods[0].numberOfPeriods
            }).timePeriodName;
        }
        modifiedTitle += !isEmpty(this.expostSettings.statisticPeriods) ? this.expostSettings.statisticPeriods[0].timePeriodName : 'Widget Default';

        if (this.expostSettings.isNetReturns) {
            modifiedTitle += ',Net';
        }
        if (this.expostSettings.isLogNormal) {
            modifiedTitle += ',Log';
        }
        modifiedTitle += ')';
        return modifiedTitle;
    }

    /**
     * add params that are to be send as a part of the request Param
     */
    protected doAddRequestParams(requestParams: any) {
        if (!isNil(this.expostSettings.samplingPeriod)) {
            requestParams['samplingPeriodShortName'] = this.expostSettings.samplingPeriod.shortName;
            requestParams['numberOfSamplingPeriods'] = this.expostSettings.samplingPeriod.numberOfPeriods;
        }
        if (!isEmpty(this.expostSettings.statisticPeriods)) {
            requestParams['statisticPeriodShortName'] = this.expostSettings.statisticPeriods[0].shortName;
            requestParams['numberOfStatisticPeriods'] = this.expostSettings.statisticPeriods[0].numberOfPeriods;
        }

        requestParams['isNetReturns'] = this.expostSettings.isNetReturns;
        requestParams['isGrossAndNetReturns'] = this.expostSettings.isGrossAndNetReturns;
        requestParams['isLogNormal'] = this.expostSettings.isLogNormal;
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        this.expostSettings = new ExpostSettings();
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.expostSettings.serialize();
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.expostSettings = new ExpostSettings();
        this.expostSettings.deserialize(data);
    }

    /**
     * Validates that the objects are equal.
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof ExpostColumnOption)) {
            return false;
        }
        return this.expostSettings.equals(otherColOption.expostSettings);
    }

    /**
     * Checks if the object is valid.
     */
    isValid(): boolean {
        return !isNil(this.expostSettings);
    }

    updateDerivedSettings(settings: ExpostSettings, updateColumnOnlySettings?: boolean): void {
        this.expostSettings.updateDerivedSettings(settings, updateColumnOnlySettings);
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
}
