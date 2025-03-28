import {AbstractRiskSettings} from '../abstract-risk-settings.model';
import {CalendarDateUtils, ColumnOptionValidatorInterface, DateValue, ExploreInputValidationInfo, NotificationType} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '../../core-risk.constants';
import {cloneDeep, isNil, isUndefined} from 'lodash';
import {AdvancedHvarRiskSettingsModel} from '../advance-hvar-risk-settings/advanced-hvar-risk-settings.model';
import {CopySettings} from '../../interfaces';

export class HvarRiskSettingsModel extends AbstractRiskSettings implements CopySettings<HvarRiskSettingsModel>, ColumnOptionValidatorInterface {

    public static readonly DEFAULT_NUMBER_OF_DAYS = 20;
    public static readonly DEFAULT_NUMBER_OF_DAYS_WEEK = 5;
    public static readonly DEFAULT_NUMBER_OF_DAYS_MONTH = 21;
    public static readonly DEFAULT_NON_LINEAR = 5;
    public static readonly DEFAULT_CONFIDENCE_LEVEL = 95;

    private _confidenceLevelPercentage: number;
    private _returnHorizonSelection: string;
    private _numberOfDays: number;
    private _linear: number;
    private _dailyOverlappingObservation: boolean;
    private _startDate: DateValue;
    private _numberOfObservations: number;
    private _historicalReturnDecay: number;
    private _fullRevaluation: boolean;
    private _includeTimeReturn: boolean;
    private _isNumberOfObservationsSelected: boolean;
    private _advancedHvarRiskSettings: AdvancedHvarRiskSettingsModel;
    private _factorScaling: string;
    private _version: string;

    readonly propertyList: any = cloneDeep(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES);

    constructor(parentHVaRSettings?: HvarRiskSettingsModel, name?: string) {
        super(parentHVaRSettings, name);
    }

    get confidenceLevelPercentage(): number {
        if (!isNil(this._confidenceLevelPercentage)) {
            return this._confidenceLevelPercentage;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).confidenceLevelPercentage;
        }
    }

    set confidenceLevelPercentage(value: number) {
        this._confidenceLevelPercentage = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).confidenceLevelPercentage ? null : value;
    }

    get returnHorizonSelection(): string {
        if (!isNil(this._returnHorizonSelection)) {
            return this._returnHorizonSelection;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).returnHorizonSelection;
        }
    }

    set returnHorizonSelection(value: string) {
        this._returnHorizonSelection = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).returnHorizonSelection ? null : value;
    }

    get numberOfDays(): number {
        if (!isNil(this._numberOfDays)) {
            return this._numberOfDays;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).numberOfDays;
        }
    }

    set numberOfDays(value: number) {
        this._numberOfDays = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).numberOfDays ? null : value;
    }

    get linear(): number {
        if (!isNil(this._linear)) {
            return this._linear;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).linear;
        }
    }

    set linear(value: number) {
        this._linear = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).linear ? null : value;
    }

    get dailyOverlappingObservation(): boolean {
        if (!isNil(this._dailyOverlappingObservation)) {
            return this._dailyOverlappingObservation;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).dailyOverlappingObservation;
        }
    }

    set dailyOverlappingObservation(value: boolean) {
        this._dailyOverlappingObservation = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).dailyOverlappingObservation ? null : value;
    }

    get startDate(): DateValue {
        if (!isNil(this._startDate)) {
            return this._startDate;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).startDate;
        }
    }

    set startDate(value: DateValue) {
        this._startDate = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).startDate ? null : value;
    }

    get numberOfObservations(): number {
        if (!isNil(this._numberOfObservations)) {
            return this._numberOfObservations;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).numberOfObservations;
        }
    }

    set numberOfObservations(value: number) {
        this._numberOfObservations = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).numberOfObservations ? null : value;
    }

    get historicalReturnDecay(): number {
        if (!isNil(this._historicalReturnDecay)) {
            return this._historicalReturnDecay;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).historicalReturnDecay;
        }
    }

    set historicalReturnDecay(value: number) {
        this._historicalReturnDecay = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).historicalReturnDecay ? null : value;
    }

    get fullRevaluation(): boolean {
        if (!isNil(this._fullRevaluation)) {
            return this._fullRevaluation;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).fullRevaluation;
        }
    }

    set fullRevaluation(value: boolean) {
        this._fullRevaluation = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).fullRevaluation ? null : value;
    }

    get includeTimeReturn(): boolean {
        if (!isNil(this._includeTimeReturn)) {
            return this._includeTimeReturn;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).includeTimeReturn;
        }
    }

    set includeTimeReturn(value: boolean) {
        this._includeTimeReturn = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).includeTimeReturn ? null : value;
    }

    get isNumberOfObservationsSelected(): boolean {
        if (!isNil(this._isNumberOfObservationsSelected)) {
            return this._isNumberOfObservationsSelected;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).isNumberOfObservationsSelected;
        }
    }

    set isNumberOfObservationsSelected(value: boolean) {
        this._isNumberOfObservationsSelected = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).isNumberOfObservationsSelected ? null : value;
    }

    get advancedHvarRiskSettings(): AdvancedHvarRiskSettingsModel {
        if (!isNil(this._advancedHvarRiskSettings)) {
            return this._advancedHvarRiskSettings;
        } else {
            return (this.parentRiskSettings as HvarRiskSettingsModel)?.advancedHvarRiskSettings;
        }
    }

    set advancedHvarRiskSettings(value: AdvancedHvarRiskSettingsModel) {
        this._advancedHvarRiskSettings = this.parentRiskSettings && value.equals((this.parentRiskSettings as HvarRiskSettingsModel)?.advancedHvarRiskSettings) ? null : value;
    }

    get factorScaling(): string {
        if (!isNil(this._factorScaling)) {
            return this._factorScaling;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).factorScaling;
        }
    }

    set factorScaling(value: string) {
        this._factorScaling = this.parentRiskSettings && value === (this.parentRiskSettings as HvarRiskSettingsModel).factorScaling ? null : value;
    }

    get version(): string {
        return this._version;
    }

    set version(value: string) {
        this._version = value;
    }

    deserialize(data: any): void {
        if (!data) {
            return;
        }
        if (data.confidenceLevelPercentage) {
            this.confidenceLevelPercentage = data.confidenceLevelPercentage;
        }
        if (data.returnHorizon) {
            this.returnHorizonSelection = data.returnHorizon;
        }
        if (data.numberOfDays) {
            this.numberOfDays = data.numberOfDays;
        }
        if (data.linear) {
            this.linear = data.linear;
        }
        if (!isUndefined(data.dailyOverlappingObservation)) {
            this.dailyOverlappingObservation = data.dailyOverlappingObservation;
        }
        if (data.startDate) {
            this.startDate = new DateValue(data.startDate);
        }
        if (data.historicalReturnDecay) {
            this.historicalReturnDecay = data.historicalReturnDecay;
        }
        if (!isUndefined(data.fullRevaluation)) {
            this.fullRevaluation = data.fullRevaluation;
        }
        if (!isUndefined(data.includeTimeReturn)) {
            this.includeTimeReturn = data.includeTimeReturn;
        }
        if (data.numberOfObservations) {
            this.numberOfObservations = data.numberOfObservations;
        }
        if (!isUndefined(data.isNumberOfObservationsSelected)) {
            this.isNumberOfObservationsSelected = data.isNumberOfObservationsSelected;
        }
        this._deserializeAdvancedHvarRiskSettings(data);
        this._deserializeVolatilityScalingAndEVTInteractions(data);
        if (data.version) {
            this.version = data.version;
        }
    }

    private _deserializeAdvancedHvarRiskSettings(data: any): void {
        if (!isUndefined(data.advancedHvarRiskSettings)) {
            this.advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel(null, this.name);
            this.advancedHvarRiskSettings.deserialize(data.advancedHvarRiskSettings);
        } else if (data.secScaling) {
            // This is for backward compatibility purpose
            this.advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel(null, this.name);
            this.advancedHvarRiskSettings.holdingPeriod = 20;
            this.advancedHvarRiskSettings.confidenceIntervalScaling = 99;
        }
    }

    private _deserializeVolatilityScalingAndEVTInteractions(data: any): void {
        if (!isUndefined(data.factorScaling)) {
            this.factorScaling = data.factorScaling;
        } else if (!isUndefined(data.evtKernelSmoothing) || !isUndefined(data.volatilityScaling)) {
            // This is for backward compatibility purpose
            if (isUndefined(data.volatilityScaling) || data.volatilityScaling === 'OFF') {
                this.factorScaling = 'NONE';
            } else {
                this.factorScaling = data.evtKernelSmoothing === true ? 'FACTORLEVEL_EVT_AND_VOL_SCALE' : 'FACTORLEVEL_VOL_SCALE';
            }
        }
    }

    serialize(): any {
        const data: any = {};
        if (this._returnHorizonSelection) {
            data.returnHorizon = this._returnHorizonSelection;
        }
        if (this._numberOfDays) {
            data.numberOfDays = this._numberOfDays;
        }
        if (this._linear) {
            data.linear = this._linear;
        }
        if (!isNil(this._dailyOverlappingObservation)) {
            data.dailyOverlappingObservation = this._dailyOverlappingObservation;
        }
        if (this._historicalReturnDecay) {
            data.historicalReturnDecay = this._historicalReturnDecay;
        }
        if (this._confidenceLevelPercentage) {
            data.confidenceLevelPercentage = this._confidenceLevelPercentage;
        }
        if (!isNil(this._fullRevaluation)) {
            data.fullRevaluation = this._fullRevaluation;
        }
        if (!isNil(this._includeTimeReturn)) {
            data.includeTimeReturn = this._includeTimeReturn;
        }
        if (this._numberOfObservations) {
            data.numberOfObservations = this._numberOfObservations;
        }
        if (this._isNumberOfObservationsSelected) {
            data.isNumberOfObservationsSelected = this._isNumberOfObservationsSelected;
        }
        if (this._startDate) {
            data.startDate = this._startDate.serialize(false);
        }
        if (this._advancedHvarRiskSettings) {
            data.advancedHvarRiskSettings = this._advancedHvarRiskSettings.serialize();
        }
        if (this._factorScaling) {
            data.factorScaling = this._factorScaling;
        }
        if (this._version) {
            data.version = this._version;
        }
        return data;
    }

    /**
     * If I have a value use it.
     * If I don't - compare the value that my "parent" has. If its same as default value, don't bother. if it's not the same as the default value, I will set it.
     */
    addRequestData(requestRiskSettingsData: any, rootRiskSettings: HvarRiskSettingsModel): void {
        const amIRoot: boolean = this === rootRiskSettings;

        const hvarRiskSettings: any = {};
        this.addObservationsData(hvarRiskSettings, amIRoot);
        if (this._returnHorizonSelection) {
            hvarRiskSettings.returnHorizon = this._returnHorizonSelection;
        } else if (amIRoot && this.returnHorizonSelection && !this.isDefaultSetting(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.RETURN_HORIZON)) {
            hvarRiskSettings.returnHorizon = this.returnHorizonSelection;
        }
        if ('1week' === hvarRiskSettings.returnHorizon) {
            hvarRiskSettings.numberOfDays = HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_WEEK;
            hvarRiskSettings.linear = HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_WEEK;
            hvarRiskSettings.dailyOverlappingObservation = false;
        } else if ('1month' === hvarRiskSettings.returnHorizon) {
            hvarRiskSettings.numberOfDays = HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_MONTH;
            hvarRiskSettings.linear = HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_MONTH;
            hvarRiskSettings.dailyOverlappingObservation = false;
        } else  {
            this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.NUMBER_OF_DAYS);
            this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.LINEAR);
            this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.DAILY_OVERLAPPING_OBSERVATION);
        }
        this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.CONFIDENCE_LEVEL_PERCENT);
        this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.FULL_REVALUATION);
        this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.INCLUDE_TIME_RETURN);
        this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.HISTORICAL_RETURN_DECAY);
        if (this.advancedHvarRiskSettings) {
            this.advancedHvarRiskSettings.addRequestData(hvarRiskSettings, rootRiskSettings.advancedHvarRiskSettings);
        }
        this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.FACTOR_SCALING);
        if (this._version !== 'default') {
            this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.VERSION);
        }
        if (Object.keys(hvarRiskSettings).length > 0) {
            requestRiskSettingsData['hvarRiskSettings'] = hvarRiskSettings;
        }
    }

    addRequestParamProperty(hvarRiskSettings: any, amIRoot: boolean, defaultSettingKey: string, isDate?: boolean): void {
        let value: any = this['_' + defaultSettingKey];
        if (!isUndefined(value) && isDate) {
            value = CalendarDateUtils.getDateInAladdinFormat(this['_' + defaultSettingKey].getMoment());
        }
        if (!isUndefined(value) && !isNil(value)) {
            hvarRiskSettings[defaultSettingKey] = value;
        } else if (amIRoot && !isNil(this[defaultSettingKey]) && !this.isDefaultSetting(defaultSettingKey)) {
            hvarRiskSettings[defaultSettingKey] = this[defaultSettingKey];
        }
    }

    /**
     *  To know which date should be passed relative or absolute date
     *  dateString => true, return relative date otherwise absolute
     */
    getDateToUse(dateObject: any): string {
        return dateObject.dateString ? dateObject.dateStringValue : dateObject.date;
    }
    /**
     * Method to reset the value for a given property key
     */
    resetValue(key: string): void {
        this[key] = null;
    }

    public isHVarRiskSettingsChanged(): boolean {
        return this.doesValueExist(this.propertyList['RETURN_HORIZON']) ||
            this.doesValueExist(this.propertyList['CONFIDENCE_LEVEL_PERCENT']) ||
            this.doesValueExist(this.propertyList['NUMBER_OF_DAYS']) ||
            this.doesValueExist(this.propertyList['LINEAR']) ||
            this.doesValueExist(this.propertyList['DAILY_OVERLAPPING_OBSERVATION']) ||
            this.doesValueExist(this.propertyList['HISTORICAL_RETURN_DECAY']) ||
            this.doesValueExist(this.propertyList['FULL_REVALUATION']) ||
            this.doesValueExist(this.propertyList['NUMBER_OF_OBSERVATIONS']) ||
            this.doesValueExist(this.propertyList['ADVANCED_HVAR_RISK_SETTINGS']) ||
            this.doesValueExist(this.propertyList['FACTOR_SCALING']);
    }

    /**
     * equals method implementation
     */
    equals(hvarRiskSettingsModel: HvarRiskSettingsModel): boolean {
        return this.confidenceLevelPercentage === hvarRiskSettingsModel.confidenceLevelPercentage
            && this.returnHorizonSelection === hvarRiskSettingsModel.returnHorizonSelection
            && this.numberOfDays === hvarRiskSettingsModel.numberOfDays
            && this.linear === hvarRiskSettingsModel.linear
            && this.dailyOverlappingObservation === hvarRiskSettingsModel.dailyOverlappingObservation
            && (this.startDate ? this.startDate.equals(hvarRiskSettingsModel.startDate) : !hvarRiskSettingsModel.startDate)
            && this.historicalReturnDecay === hvarRiskSettingsModel.historicalReturnDecay
            && this.fullRevaluation === hvarRiskSettingsModel.fullRevaluation
            && this.includeTimeReturn === hvarRiskSettingsModel.includeTimeReturn
            && this.numberOfObservations === hvarRiskSettingsModel.numberOfObservations
            && ((isUndefined(this.advancedHvarRiskSettings) && isUndefined(hvarRiskSettingsModel.advancedHvarRiskSettings)) || this.advancedHvarRiskSettings.equals(hvarRiskSettingsModel.advancedHvarRiskSettings))
            && this.isNumberOfObservationsSelected === hvarRiskSettingsModel.isNumberOfObservationsSelected
            && this.factorScaling === hvarRiskSettingsModel.factorScaling
            && this.version === hvarRiskSettingsModel.version;
    }

    /**
     * Sets Org Default HvarRiskSettings
     */
    setOrgDefaultHvarRiskSettings(): void {
        this.factorScaling = 'NONE';
    }

    copySettings(settings: HvarRiskSettingsModel) {
        if (isNil(settings)) {
            return;
        }
        this._confidenceLevelPercentage = settings._confidenceLevelPercentage;
        this._returnHorizonSelection = settings._returnHorizonSelection;
        this._numberOfDays = settings._numberOfDays;
        this._linear = settings._linear;
        this._dailyOverlappingObservation = settings._dailyOverlappingObservation;
        this._startDate = settings._startDate;
        this._numberOfObservations = settings._numberOfObservations;
        this._historicalReturnDecay = settings._historicalReturnDecay;
        this._fullRevaluation = settings._fullRevaluation;
        this._includeTimeReturn = settings._includeTimeReturn;
        this._isNumberOfObservationsSelected = settings._isNumberOfObservationsSelected;
        this._advancedHvarRiskSettings = settings._advancedHvarRiskSettings;
        this._version = settings._version;
        this._factorScaling = settings._factorScaling;
    }

    isValidColumnOption(): ExploreInputValidationInfo | undefined {
        if (!isUndefined(this.confidenceLevelPercentage)) {
            const advancedHVaRRiskSettings = this.advancedHvarRiskSettings;
            if (!isUndefined(advancedHVaRRiskSettings)) {
                if (this.confidenceLevelPercentage > advancedHVaRRiskSettings.confidenceIntervalScaling) {
                    return new ExploreInputValidationInfo(NotificationType.ERROR, `confidenceLevelPercentage=${this.confidenceLevelPercentage} must be less than confidenceIntervalToScale=${advancedHVaRRiskSettings.confidenceIntervalScaling}`);
                }
            }
        }
    }

    /**
     * Returns the formatted value of the parent field
     * @param key  Field name
     */
    getFormattedParentValue(key: string): string {
        if (key === CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL) {
            return (this.parentRiskSettings as HvarRiskSettingsModel).factorScaling;
        }
        return '';
    }

    private addObservationsData(hvarRiskSettings: any, amIRoot: boolean): void {
        if (this.isNumberOfObservationsSelected) {
            this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.NUMBER_OF_OBSERVATIONS);
        } else {
            this.addRequestParamProperty(hvarRiskSettings, amIRoot, CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.START_DATE, true);
            if (this._startDate && this._startDate.calCode) {
                hvarRiskSettings.calendar = this._startDate.calCode;
            } else if (amIRoot && this.startDate && !this.isDefaultSetting(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.START_DATE) && this.startDate.calCode) {
                hvarRiskSettings.calendar = this.startDate.calCode;
            }
        }
    }
}
