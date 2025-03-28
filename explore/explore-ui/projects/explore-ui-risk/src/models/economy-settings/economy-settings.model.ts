import {CoreDefinitionStore, DateValue, PortfolioDefaults, RiskParameter, WeightingSchemes} from '@blk/explore-ui-core';

import {cloneDeep, find, isEmpty, isEqual, isNil, isNumber} from 'lodash';
import {Gaussian} from 'ts-gaussian';
import {CoreRiskConstants} from '../../core-risk.constants';
import {AbstractRiskSettings} from '../abstract-risk-settings.model';
import {DefaultRiskSettings} from '../default-risk-settings/default-risk-settings.model';
import {CopySettings} from '../../interfaces';

/**
 * Subset of Risk settings - economy risk settings
 */
export class EconomySettings extends AbstractRiskSettings implements CopySettings<EconomySettings> {

    availableWeightingSchemes: WeightingSchemes[] = [];
    availablePeriods = ['6M', '1Y', '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '9Y', '10Y', 'Other'];

    // private risk properties with custom setters/getters
    private _period: number;
    private _decayFactor: number;
    private _riskHorizon: number;
    private _confidenceLevelSD: number;
    private _dateObject: DateValue;
    private _weightingScheme: string;
    private _overlap: number;

    // public risk properties
    confidenceLevelPercentage: number;
    halfLifeInDays: number;
    halfLifeLabel: string;
    isHalfLifeModifiable: boolean;
    isPeriodModifiable: boolean;
    selectedPeriod: string;
    selectedOverlap: number;
    riskHorizons: RiskParameter[] = [];

    readonly propertyList: any = cloneDeep(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES);

    /**
     * Constructor
     */
    constructor(parentRiskSettings?: EconomySettings, name?: string) {
        super(parentRiskSettings, name);
    }

    /**
     * Getter for period
     */
    get period(): number {
        return this.getValueWithSchemaDefault(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD, 'defaultPeriod');
    }

    /**
     * Setter for period
     */
    set period(value: number) {
        this._period = this.parentRiskSettings && value === (this.parentRiskSettings as EconomySettings).period
        && (this.weightingScheme === (this.parentRiskSettings as EconomySettings).weightingScheme) ? null : value;
    }

    /**
     * Getter for decayFactor
     */
    get decayFactor(): number {
        return this.getValueWithSchemaDefault(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR, 'defaultDecay');
    }

    /**
     * Setter for decayFactor
     */
    set decayFactor(value: number) {
        this._decayFactor = value && this.parentRiskSettings && (this.parentRiskSettings as EconomySettings).decayFactor
        && value.toFixed(4) === (this.parentRiskSettings as EconomySettings).decayFactor.toFixed(4)
        && (this.weightingScheme === (this.parentRiskSettings as EconomySettings).weightingScheme) ? null : value;
    }

    /**
     * Getter for confidenceLevelSD
     */
    get confidenceLevelSD(): number {
        return this._confidenceLevelSD != null ? this._confidenceLevelSD : this.parentRiskSettings ? (this.parentRiskSettings as EconomySettings).confidenceLevelSD : undefined;
    }

    /**
     * Setter for confidenceLevelSD
     */
    set confidenceLevelSD(value: number) {
        this._confidenceLevelSD = this.parentRiskSettings && value === (this.parentRiskSettings as EconomySettings).confidenceLevelSD ? null : value;
    }

    /**
     * Getter for dateObject
     */
    get dateObject(): DateValue {
        return this._dateObject != null ? this._dateObject : this.parentRiskSettings ? cloneDeep((this.parentRiskSettings as EconomySettings).dateObject) : undefined;
    }

    /**
     * Setter for dateObject
     */
    set dateObject(value: DateValue) {
        this._dateObject = this.parentRiskSettings && (this.parentRiskSettings as EconomySettings).dateObject && (this.parentRiskSettings as EconomySettings).dateObject.equals(value) ? null : value;
    }

    /**
     * Getter for weightingScheme
     */
    get weightingScheme(): string {
        return this._weightingScheme != null ? this._weightingScheme : this.parentRiskSettings ? (this.parentRiskSettings as EconomySettings).weightingScheme : undefined;
    }

    /**
     * Setter for weightingScheme
     */
    set weightingScheme(value: string) {
        this._weightingScheme = this.parentRiskSettings && value === (this.parentRiskSettings as EconomySettings).weightingScheme ? null : value;
    }

    /**
     * Getter for riskHorizon
     */
    get riskHorizon(): number {
        return this._riskHorizon != null ? this._riskHorizon : this.parentRiskSettings ? (this.parentRiskSettings as EconomySettings).riskHorizon : undefined;
    }

    /**
     * Setter for riskHorizon
     */
    set riskHorizon(value: number) {
        this._riskHorizon = value && this.parentRiskSettings && value === (this.parentRiskSettings as EconomySettings).riskHorizon ? null : value;
    }

    /**
     * Getter for overlap
     */
    get overlap(): number {
        return this.getValueWithSchemaDefault(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.OVERLAP, 'defaultOverlap');
    }

    /**
     * Setter for overlap
     */
    set overlap(value: number) {
        this._overlap = this.parentRiskSettings && value === (this.parentRiskSettings as EconomySettings).overlap
        && (this.weightingScheme === (this.parentRiskSettings as EconomySettings).weightingScheme) ? null : value;
    }

    /**
     * Deserialize the data into economy settings object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.riskHorizon = data.riskHorizon ? data.riskHorizon : data.RiskHorizon ? data.RiskHorizon : undefined;
        this.weightingScheme = data.weightingScheme ? data.weightingScheme : data.CovMatrix ? data.CovMatrix : undefined;
        this.decayFactor = data.decayFactor ? data.decayFactor : data.DecayFactor ? data.DecayFactor : undefined;
        this.confidenceLevelSD = data.confidenceLevelSD ? data.confidenceLevelSD : data.ConfidenceLevelInStdDeviation ? data.ConfidenceLevelInStdDeviation : undefined;
        this.period = data.period ? data.period : undefined;
        this.dateObject = data.dateObject ? new DateValue(data.dateObject) : undefined;
        this.overlap = data.overlap ? data.overlap : undefined;
    }

    /**
     * Serialize the attribution settings to json.
     */
    serialize(): any {
        const dataToSave: any = {};
        if (this._riskHorizon) {
            dataToSave.riskHorizon = this._riskHorizon;
        }
        if (this._weightingScheme) {
            dataToSave.weightingScheme = this._weightingScheme;
        }
        if (this._decayFactor) {
            dataToSave.decayFactor = this._decayFactor;
        }
        if (this._confidenceLevelSD) {
            dataToSave.confidenceLevelSD = this._confidenceLevelSD;
        }
        if (this._period) {
            dataToSave.period = this._period;
        }
        if (this._dateObject) {
            dataToSave.dateObject = this._dateObject.serialize();
        }
        if (this._overlap) {
            dataToSave.overlap = this._overlap;
        }
        return dataToSave;
    }

    /**
     * Gets the value of this key respecting the parent heirachy, but ensures that the parent value is only used if the weighting schema is the same.
     * Also has a fallback to the default weight scheme value.
     */
    getValueWithSchemaDefault(key: string, defaultKey: string) {
        if (!isNil(this['_' + key])) {
            return this['_' + key];
        }

        if (this.parentRiskSettings) {
            const value: any = this.getValueByWeightingScheme(key, this.weightingScheme);
            if (value) {
                return value;
            }
        }

        const ws: any = find(this.availableWeightingSchemes, {value: this.weightingScheme});
        return ws ? ws[defaultKey] : undefined;
    }

    /**
     * Gets the value as long as it matches the weighting scheme.  If not looks to the parent to find a match.
     */
    getValueByWeightingScheme(key: string, weightScheme: string) {
        if (this.weightingScheme === weightScheme && this['_' + key]) {
            return this['_' + key];
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as EconomySettings).getValueByWeightingScheme(key, weightScheme);
        }
        return undefined;
    }

    /**
     * If I have a value use it.
     * If I dont - compare the value that my "parent" has. If its same as default value, dont bother. if its not the same as the default value, I will set it.
     */
    addRequestData(requestRiskSettingsData: any, rootRiskSettings: EconomySettings, addDefaultValues?: boolean): void {
        const amIRoot: boolean = this === rootRiskSettings;

        if (this._dateObject) {
            requestRiskSettingsData.EconomyDate = this.getDateToUse(this._dateObject);
        } else if (amIRoot && this.dateObject && !this.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DATE_OBJECT)) {
            requestRiskSettingsData.EconomyDate = this.getDateToUse(this.dateObject);

        }
        if (this._dateObject && this._dateObject.calCode) {
            requestRiskSettingsData.Calendar = this._dateObject.calCode;
        } else if (amIRoot && this.dateObject && !this.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DATE_OBJECT) && this.dateObject.calCode) {
            requestRiskSettingsData.Calendar = this.dateObject.calCode;
        }

        if (this._riskHorizon) {
            requestRiskSettingsData.RiskHorizon = this._riskHorizon;
        } else if (amIRoot && this.riskHorizon && !this.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.RISK_HORIZON)) {
            requestRiskSettingsData.RiskHorizon = this.riskHorizon;
        }

        if (this._confidenceLevelSD) {
            requestRiskSettingsData.ConfidenceLevelInStdDeviation = this._confidenceLevelSD;
        } else if (amIRoot && this.confidenceLevelSD && !this.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.CONFIDENCE_LEVEL_SD)) {
            requestRiskSettingsData.ConfidenceLevelInStdDeviation = this.confidenceLevelSD;
        }

        this.addWeightingSchemeSettings(requestRiskSettingsData, amIRoot, addDefaultValues);
    }

    /**
     * Add attributes related to weighting scheme to the request data
     * @param requestRiskSettingsData
     * @param amIRoot
     * @param addDefaultValues
     */
    private addWeightingSchemeSettings(requestRiskSettingsData: any, amIRoot: boolean, addDefaultValues: boolean): void {
        if (this._decayFactor) {
            requestRiskSettingsData.DecayFactor = this._decayFactor;
        } else if (addDefaultValues || (amIRoot && this.decayFactor && !this.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR))) {
            requestRiskSettingsData.DecayFactor = this.decayFactor;
        }

        if (this._period) {
            requestRiskSettingsData.Period = this._period;
        } else if (addDefaultValues || (amIRoot && this.period && !this.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD))) {
            requestRiskSettingsData.Period = this.period;
        }

        if (this._overlap) {
            requestRiskSettingsData.Overlap = this._overlap;
        } else if (addDefaultValues || (amIRoot && this.overlap && !this.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.OVERLAP))) {
            requestRiskSettingsData.Overlap = this.overlap;
        }

        this.addWeightingScheme(requestRiskSettingsData, amIRoot);
    }

    /**
     * Add weightingScheme to the request data
     * @param requestRiskSettingsData
     * @param amIRoot
     * @private
     */
    private addWeightingScheme(requestRiskSettingsData: any, amIRoot: boolean): void {
        // Clone economySettings to prevent changes to the original object
        // Resolve if this._weightingScheme = 'DLY' and same value is present in parentRiskSettings, then set the weighing scheme again to keep the value only if different from parent
        const economySettings = cloneDeep(this);
        economySettings.weightingScheme = economySettings._weightingScheme;

        // If either the period or decay have been set then we need to send the weighting scheme too.
        // The server will not add these parameters to the VARServer requests if it is not present.
        // NOTE:  I suspect the server code should change but it also looks up the decay for
        //        MKT and REG and adds to the request always.
        if (requestRiskSettingsData.Period || requestRiskSettingsData.DecayFactor) {
            requestRiskSettingsData.CovMatrix = economySettings.weightingScheme;
        } else if (economySettings._weightingScheme) {
            requestRiskSettingsData.CovMatrix = economySettings._weightingScheme;
        } else if (amIRoot && economySettings.weightingScheme && !economySettings.isDefaultSetting(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)) {
            requestRiskSettingsData.CovMatrix = economySettings.weightingScheme;
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
     * Resets all settings
     */
    resetSettings(): void {
        this.riskHorizon = null;
        this.confidenceLevelSD = null;
        this.dateObject = null;
        this.weightingScheme = null;
        this.decayFactor = null;
        this.period = null;
        this.overlap = null;
        this.addWeightingSchemeIfItDoesntExist();
        this.resetHalfLife();
        this.createCustomBasedOnHalfLife();
        this.createCustomBasedOnOverlap();
        this.confidenceLevelPercentage = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_PERCENTAGE;
        this.computeConfidenceLevelInPercentage();
    }

    /**
     * Compute confidence level in % given confidence level in std deviation
     */
    computeConfidenceLevelInPercentage(): void {
        if (!isNumber(this.confidenceLevelSD)) {
            this.confidenceLevelSD = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_STD_DEVIATION;
            this.confidenceLevelPercentage = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_PERCENTAGE;
        } else {
            this.confidenceLevelPercentage = +(new Gaussian(0, 1).cdf(this.confidenceLevelSD) * 100).toFixed(4);
            if (this.confidenceLevelPercentage <= CoreRiskConstants.RISK_SETTING_DEFAULTS.CONFIDENCE_LEVEL_LOWER_LIMIT ||
                this.confidenceLevelPercentage >= CoreRiskConstants.RISK_SETTING_DEFAULTS.CONFIDENCE_LEVEL_UPPER_LIMIT) {
                this.confidenceLevelSD = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_STD_DEVIATION;
                this.confidenceLevelPercentage = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_PERCENTAGE;
            }
        }
    }

    setDefaultOverlap(): boolean {
        this.createCustomBasedOnOverlap();
        return this.computeOverlap();
    }

    computeOverlap(): boolean {
        const selectWeightingScheme: WeightingSchemes[] = this.availableWeightingSchemes.filter(weightingScheme => weightingScheme.value === this.weightingScheme);
        if (!isEmpty(selectWeightingScheme)) {
            this.selectedOverlap = selectWeightingScheme[0].defaultOverlap;
            return true;
        }
        return false;
    }

    /**
     * Compute confidence level in % given confidence level in std deviation
     */
    computeConfidenceLevelInStdDeviation(): void {
        if (!isNumber(this.confidenceLevelPercentage) || this.confidenceLevelPercentage <= CoreRiskConstants.RISK_SETTING_DEFAULTS.CONFIDENCE_LEVEL_LOWER_LIMIT ||
            this.confidenceLevelPercentage >= CoreRiskConstants.RISK_SETTING_DEFAULTS.CONFIDENCE_LEVEL_UPPER_LIMIT) {

            this.confidenceLevelPercentage = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_PERCENTAGE;
            this.confidenceLevelSD = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_STD_DEVIATION;
        } else {
            this.confidenceLevelSD = +(new Gaussian(0, 1).ppf(this.confidenceLevelPercentage / 100)).toFixed(6);
        }
    }

    /**
     * Compute period given period in text
     */
    computePeriod(availableWeightingSchemes?: WeightingSchemes[]): boolean {
        let unit = null;
        const selectWeightingScheme: WeightingSchemes[] = (availableWeightingSchemes || this.availableWeightingSchemes)
            .filter(weightingScheme => weightingScheme.value === this.weightingScheme);
        if (!isEmpty(selectWeightingScheme)) {
            unit = selectWeightingScheme[0].halfLifeLabel;
        }

        let numberOfYears: number = null;
        switch (unit) {
            case CoreRiskConstants.HALF_LIFE_LABEL.DAYS:
                numberOfYears = this.period / CoreRiskConstants.YEAR_REPRESENTATION.DAYS_IN_YEAR;
                break;
            case  CoreRiskConstants.HALF_LIFE_LABEL.WEEKS:
                numberOfYears = this.period / CoreRiskConstants.YEAR_REPRESENTATION.WEEKS_IN_YEAR;
                break;
            case  CoreRiskConstants.HALF_LIFE_LABEL.MONTHS:
                numberOfYears = this.period / CoreRiskConstants.YEAR_REPRESENTATION.MONTHS_IN_YEAR;
                break;
        }

        const selectedPeriod = this.selectedPeriod;

        if (numberOfYears === 0.5) {
            this.selectedPeriod = CoreRiskConstants.PERIOD.SIX_MONTH;
        } else if (numberOfYears && numberOfYears % 1 === 0 && numberOfYears < 11) {
            this.selectedPeriod = numberOfYears + 'Y';
        } else {
            this.selectedPeriod = CoreRiskConstants.PERIOD.OTHER;
        }

        return selectedPeriod !== this.selectedPeriod;
    }

    /**
     * Reset half life on changing the weighting scheme
     */
    resetHalfLife(): void {
        const selectWeightingScheme: WeightingSchemes[] = this.availableWeightingSchemes.filter(weightingScheme => weightingScheme.value === this.weightingScheme);
        if (!isEmpty(selectWeightingScheme)) {
            this.halfLifeInDays = this.decayFactor === 1 ? null : Number((Math.log(0.5) / Math.log(this.decayFactor)).toFixed(0));
            this.halfLifeLabel = selectWeightingScheme[0].halfLifeLabel;
            this.isHalfLifeModifiable = selectWeightingScheme[0].isHalfLifeModifiable;
            this.isPeriodModifiable = selectWeightingScheme[0].isPeriodModifiable;
        }
    }

    /**
     * return true, if any settings got changed. Otherwise return false
     */
    isEconomyRiskSettingChanged(): boolean {
        return (
            this.doesValueExist(this.propertyList['WEIGHTING_SCHEME']) ||
            (this.doesValueExist(this.propertyList['PERIOD']) && this.isPeriodModifiable) ||
            (this.doesValueExist(this.propertyList['DECAY_FACTOR']) && this.isHalfLifeModifiable) ||
            this.doesValueExist(this.propertyList['RISK_HORIZON']) ||
            this.doesValueExist(this.propertyList['CONFIDENCE_LEVEL_SD']) ||
            this.doesValueExist(this.propertyList['DATE_OBJECT']) ||
            this.doesValueExist(this.propertyList['OVERLAP']));
    }

    /**
     * Set default period on initialization
     */
    setDefaultPeriod(): boolean {
        this.createCustomBasedOnPeriod();
        return this.computePeriod();
    }

    /**
     * This method creates a custom scheme if period or number of observations set is different from the default number of observations as per the weighting scheme
     */
    createCustomBasedOnPeriod(): void {
        let periodInTextAsPerWeightingScheme = null;
        const selectWeightingScheme: WeightingSchemes[] = this.availableWeightingSchemes.filter(weightingScheme => weightingScheme.defaultPeriod === this.period);
        if (!isEmpty(selectWeightingScheme)) {
            periodInTextAsPerWeightingScheme = selectWeightingScheme[0].defaultPeriod;
        }
        if (!find(this.availableWeightingSchemes, {value: this.weightingScheme})) {
            this.handleChangeInWeightingSchemeDependents();
        }
        if (this.period !== periodInTextAsPerWeightingScheme) {
            this.handleChangeInWeightingSchemeDependents();
        }
    }

    /**
     * This method creates a custom scheme , adds it to the list of weighting schemes and mmakes this as the current selection
     */
    handleChangeInWeightingSchemeDependents(): void {
        let weightingScheme = null;
        for (const availableWeightingScheme of this.availableWeightingSchemes) {
            const weightingSchemeName = this.weightingScheme;
            if (availableWeightingScheme.value === weightingSchemeName) {
                weightingScheme = availableWeightingScheme;
                break;
            }
        }
        if (weightingScheme) {
            let labelPrefix = '';
            if (this.getSourceName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD) === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT ||
                this.getSourceName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR) === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT ||
                this.getSourceName(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.OVERLAP) === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT) {
                labelPrefix = CoreRiskConstants.RISK_MODEL_TYPE.GP;
            }
            if (this.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD) ||
                this.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR) ||
                this.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.OVERLAP)) {
                labelPrefix = 'Custom';
            }
            const customWeightingScheme = new WeightingSchemes({
                value: weightingScheme.value,
                displayName: labelPrefix ? labelPrefix + ' based on ' + weightingScheme.value : weightingScheme.value,
                toolTip: weightingScheme.toolTip,
                halfLifeLabel: weightingScheme.halfLifeLabel,
                defaultDecay: this.decayFactor,
                isHalfLifeModifiable: weightingScheme.isHalfLifeModifiable,
                defaultPeriod: this.period,
                isPeriodModifiable: weightingScheme.isPeriodModifiable,
                defaultOverlap: this.overlap,
                isCustomScheme: true,
                isOrgOrPortDefault: false
            });
            let alreadyPresentCustomSchemeIndex = -1;
            for (let i = 0; i < this.availableWeightingSchemes.length; i++) {
                if (this.availableWeightingSchemes[i].isCustomScheme && !this.availableWeightingSchemes[i].isOrgOrPortDefault) {
                    alreadyPresentCustomSchemeIndex = i;
                    break;
                }
            }
            if (alreadyPresentCustomSchemeIndex > -1) {
                this.availableWeightingSchemes.splice(alreadyPresentCustomSchemeIndex, 1);
            }
            this.availableWeightingSchemes.push(customWeightingScheme);
            this.weightingScheme = customWeightingScheme.value;
        }
    }

    /**
     * This method creates a custom scheme if half life set is different from the default half life as per the weighting scheme
     */
    createCustomBasedOnHalfLife(): void {
        let decayAsPerWeightingScheme = null;
        for (const availableWeightingScheme of this.availableWeightingSchemes) {
            if (availableWeightingScheme.value === this.weightingScheme) {
                decayAsPerWeightingScheme = availableWeightingScheme.defaultDecay;
                break;
            }
        }
        if (this.decayFactor && decayAsPerWeightingScheme && this.decayFactor.toFixed(4) !== decayAsPerWeightingScheme.toFixed(4)) {
            this.handleChangeInWeightingSchemeDependents();
        }
    }

    /**
     * This method creates a custom scheme if overlap set is different from the default overlap as per the weighting scheme
     */
    createCustomBasedOnOverlap(): void {
        let overlapAsPerWeightingScheme = null;
        for (const availableWeightingScheme of this.availableWeightingSchemes) {
            if (availableWeightingScheme.value === this.weightingScheme) {
                overlapAsPerWeightingScheme = availableWeightingScheme.defaultOverlap;
                break;
            }
        }
        if (this.decayFactor && overlapAsPerWeightingScheme && this.overlap !== overlapAsPerWeightingScheme) {
            this.handleChangeInWeightingSchemeDependents();
        }
    }

    /**
     * Compute period in text given period
     */
    computePeriodInText(): void {
        if (this.selectedPeriod === CoreRiskConstants.PERIOD.OTHER) {
            return;
        }
        let numberOfYearsInPeriod = null;
        let numberOfMonthsInPeriod = null;
        if (this.selectedPeriod === CoreRiskConstants.PERIOD.SIX_MONTH) {
            numberOfMonthsInPeriod = 6;
        } else {
            numberOfYearsInPeriod = this.selectedPeriod.substring(0, this.selectedPeriod.length - 1);
        }

        let unit = null;
        for (const availableWeightingScheme of this.availableWeightingSchemes) {
            if (availableWeightingScheme.value === this.weightingScheme) {
                unit = availableWeightingScheme.halfLifeLabel;
                break;
            }
        }
        switch (unit) {
            case CoreRiskConstants.HALF_LIFE_LABEL.DAYS:
                this.period = Number(numberOfMonthsInPeriod ? numberOfMonthsInPeriod * CoreRiskConstants.YEAR_REPRESENTATION.DAYS_IN_YEAR / CoreRiskConstants.YEAR_REPRESENTATION.MONTHS_IN_YEAR : numberOfYearsInPeriod * CoreRiskConstants.YEAR_REPRESENTATION.DAYS_IN_YEAR);
                break;
            case CoreRiskConstants.HALF_LIFE_LABEL.WEEKS:
                this.period = Number(numberOfMonthsInPeriod ? numberOfMonthsInPeriod * CoreRiskConstants.YEAR_REPRESENTATION.WEEKS_IN_YEAR / CoreRiskConstants.YEAR_REPRESENTATION.MONTHS_IN_YEAR : numberOfYearsInPeriod * CoreRiskConstants.YEAR_REPRESENTATION.WEEKS_IN_YEAR);
                break;
            case CoreRiskConstants.HALF_LIFE_LABEL.MONTHS:
                this.period = Number(numberOfMonthsInPeriod ? numberOfMonthsInPeriod : numberOfYearsInPeriod * CoreRiskConstants.YEAR_REPRESENTATION.MONTHS_IN_YEAR);
                break;
        }
    }

    /**
     * Compute half life decay given half life in days/weeks/months
     */
    computeHalfLifeDecay(): void {
        if (this.halfLifeInDays <= 0) {
            this.resetHalfLife();
        } else {
            this.decayFactor = Number((Math.exp(Math.log(0.5) / this.halfLifeInDays)).toFixed(8));
        }
    }

    /**
     * Compute Half life in days/weeks/months given decay factor
     */
    computeHalfLifeInDays(): void {
        if (this.decayFactor <= 0 || this.decayFactor > 1) {
            this.resetHalfLife();
            return;
        }

        if (this.decayFactor === 1) {
            this.halfLifeInDays = null;
            return;
        }

        this.halfLifeInDays = Number((Math.log(0.5) / Math.log(this.decayFactor)).toFixed(0));
    }

    /**
     * Gets a value for a particular level for a particular key
     */
    getValueBySource(key: string, source: string): any {
        if (this.name !== source && this.parentRiskSettings) {
            return (this.parentRiskSettings as EconomySettings).getValueBySource(key, source);
        }

        if (this.doesValueExist(key)) {
            return this[key];
        }

        return null;
    }

    /**
     * Sets Org Default EconomyRiskSettings
     */
    setOrgDefaultEconomyRiskSettings(orgDefaultRiskSettings: DefaultRiskSettings): void {
        this.confidenceLevelSD = orgDefaultRiskSettings.confidenceLevelInStdDeviation;
        this.riskHorizon = Number(orgDefaultRiskSettings.riskHorizon);
        if (orgDefaultRiskSettings.weightingScheme) {
            this.weightingScheme = orgDefaultRiskSettings.weightingScheme.name;
            this.decayFactor = orgDefaultRiskSettings.weightingScheme.defaultDecay;
            this.period = orgDefaultRiskSettings.weightingScheme.defaultPeriod;
            this.overlap = orgDefaultRiskSettings.weightingScheme.defaultOverlap;
        }
    }

    /**
     * Sets Port Default EconomyRiskSettings
     */
    setPortDefaultEconomyRiskSettings(portDefaultRiskSettings: DefaultRiskSettings): void {
        if (portDefaultRiskSettings.confidenceLevelInStdDeviation) {
            this.confidenceLevelSD = portDefaultRiskSettings.confidenceLevelInStdDeviation;
        }
        if (portDefaultRiskSettings.riskHorizon) {
            this.riskHorizon = Number(portDefaultRiskSettings.riskHorizon);
        }
        if (portDefaultRiskSettings.weightingScheme) {
            if (portDefaultRiskSettings.weightingScheme.name) {
                this.weightingScheme = portDefaultRiskSettings.weightingScheme.name;
            }
            if (portDefaultRiskSettings.weightingScheme.defaultDecay) {
                this.decayFactor = portDefaultRiskSettings.weightingScheme.defaultDecay;

            }
            if (portDefaultRiskSettings.weightingScheme.defaultPeriod) {
                this.period = portDefaultRiskSettings.weightingScheme.defaultPeriod;
            }
            if (portDefaultRiskSettings.weightingScheme.defaultOverlap) {
                this.overlap = portDefaultRiskSettings.weightingScheme.defaultOverlap;
            }
        }
    }

    /**
     * Sets up default values for economyRiskSettings
     */
    setDefaultEconomyRiskSettings(portfolioDefaults: PortfolioDefaults): void {
        this.confidenceLevelSD = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_STD_DEVIATION;
        if (portfolioDefaults) {
            this.weightingScheme = portfolioDefaults.defaultVarType;
            this.decayFactor = portfolioDefaults.defaultDecay;
            const weightingSchemes: WeightingSchemes = find(CoreDefinitionStore.weightingSchemes, {name: portfolioDefaults.defaultVarType});
            this.period = weightingSchemes ? weightingSchemes.defaultPeriod : undefined;
            this.overlap = weightingSchemes ? weightingSchemes.defaultOverlap : undefined;
        }
        this.riskHorizon = Number(CoreDefinitionStore.defaultHorizon.value);
    }

    /**
     * Initialize available weighting schemes .
     */
    initWeightingSchemes(): void {
        this.availableWeightingSchemes = CoreDefinitionStore.weightingSchemes.map(weightingScheme => new WeightingSchemes({
            value: weightingScheme.name,
            displayName: weightingScheme.displayName,
            label: weightingScheme.displayName,
            toolTip: weightingScheme.toolTip,
            defaultDecay: weightingScheme.defaultDecay,
            halfLifeLabel: weightingScheme.halfLifeLabel,
            isHalfLifeModifiable: weightingScheme.isHalfLifeModifiable,
            defaultPeriod: weightingScheme.defaultPeriod,
            isPeriodModifiable: weightingScheme.isPeriodModifiable,
            defaultOverlap: weightingScheme.defaultOverlap,
            isCustomScheme: false,
            isOrgOrPortDefault: false
        }));
    }

    /**
     * Set override date definition from the input passed in
     */
    addWeightingSchemeIfItDoesntExist(): boolean {
        const portDefaultWeightingScheme = this.getValueBySource(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        const orgDefaultWeightingScheme = this.getValueBySource(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);

        const hasPortDefault = find(this.availableWeightingSchemes, {value: portDefaultWeightingScheme});
        const hasOrgDefault = find(this.availableWeightingSchemes, {value: orgDefaultWeightingScheme});

        let missingWeightingScheme: any;
        let weighingSchemesAdded = false;

        if (!hasPortDefault && portDefaultWeightingScheme) {
            missingWeightingScheme = find(CoreDefinitionStore.allWeightingSchemes, {name: portDefaultWeightingScheme});
            this.availableWeightingSchemes.push(new WeightingSchemes({
                value: missingWeightingScheme.name,
                label: missingWeightingScheme.displayName,
                displayName: missingWeightingScheme.displayName,
                toolTip: missingWeightingScheme.toolTip,
                defaultDecay: missingWeightingScheme.defaultDecay,
                halfLifeLabel: missingWeightingScheme.halfLifeLabel,
                isHalfLifeModifiable: missingWeightingScheme.isHalfLifeModifiable,
                defaultPeriod: missingWeightingScheme.defaultPeriod,
                isPeriodModifiable: missingWeightingScheme.isPeriodModifiable,
                defaultOverlap: missingWeightingScheme.defaultOverlap,
                isCustomScheme: true,
                isOrgOrPortDefault: true
            }));
            weighingSchemesAdded = true;
        }

        if (!hasOrgDefault && orgDefaultWeightingScheme) {
            missingWeightingScheme = find(CoreDefinitionStore.allWeightingSchemes, {name: orgDefaultWeightingScheme});
            this.availableWeightingSchemes.push(new WeightingSchemes({
                value: missingWeightingScheme.name,
                label: missingWeightingScheme.displayName,
                displayName: missingWeightingScheme.displayName,
                toolTip: missingWeightingScheme.toolTip,
                defaultDecay: missingWeightingScheme.defaultDecay,
                halfLifeLabel: missingWeightingScheme.halfLifeLabel,
                isHalfLifeModifiable: missingWeightingScheme.isHalfLifeModifiable,
                defaultPeriod: missingWeightingScheme.defaultPeriod,
                defaultOverlap: missingWeightingScheme.defaultOverlap,
                isCustomScheme: true,
                isOrgOrPortDefault: true
            }));
            weighingSchemesAdded = true;
        }

        return weighingSchemesAdded;
    }

    /**
     * equals method implementation
     */
    equals(economySettings: EconomySettings): boolean {
        return this.period === economySettings.period
            && this.decayFactor === economySettings.decayFactor
            && this.riskHorizon === economySettings.riskHorizon
            && this.confidenceLevelSD === economySettings.confidenceLevelSD
            && isEqual(this.dateObject?.serialize(), economySettings.dateObject?.serialize())
            && this.weightingScheme === economySettings.weightingScheme
            && this.confidenceLevelPercentage === economySettings.confidenceLevelPercentage
            && this.halfLifeInDays === economySettings.halfLifeInDays
            && this.halfLifeLabel === economySettings.halfLifeLabel
            && this.isHalfLifeModifiable === economySettings.isHalfLifeModifiable
            && this.isPeriodModifiable === economySettings.isPeriodModifiable
            && this.selectedPeriod === economySettings.selectedPeriod
            && this.selectedOverlap === economySettings.selectedOverlap
            && this.overlap === economySettings.overlap;
    }

    copySettings(settings: EconomySettings) {
        if (isNil(settings)) {
            return;
        }
        this._period = settings._period;
        this._decayFactor = settings._decayFactor;
        this._riskHorizon = settings._riskHorizon;
        this._confidenceLevelSD = settings._confidenceLevelSD;
        this._dateObject = settings._dateObject;
        this._weightingScheme = settings._weightingScheme;
        this._overlap = settings._overlap;
    }

    /**
     * Returns the formatted value of the parent field
     * @param key  Field name
     */
    getFormattedParentValue(key: string): string {
        const parentSettings = this.parentRiskSettings as EconomySettings;
        switch (key) {
            case CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DATE_OBJECT:
                return parentSettings.dateObject.getDateAsText();
            case CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME:
                return this.availableWeightingSchemes.find(scheme => scheme.value === parentSettings?.weightingScheme)?.displayName ?? '';
            case CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD:
                parentSettings.computePeriod(this.availableWeightingSchemes);
                return parentSettings.selectedPeriod + ' OR ' + parentSettings?.period;
            case CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR:
                parentSettings.computeHalfLifeInDays();
                return parentSettings.halfLifeInDays + ' OR ' + parentSettings.decayFactor + ' σ';
            case CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.OVERLAP:
                return parentSettings.overlap.toString();
            case CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.RISK_HORIZON:
                return this.riskHorizons.find(riskHorizon => Number(riskHorizon.value) === parentSettings.riskHorizon)?.text ?? '';
            case CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.CONFIDENCE_LEVEL_SD:
                parentSettings.computeConfidenceLevelInPercentage();
                return parentSettings.confidenceLevelPercentage + ' % OR ' + parentSettings.confidenceLevelSD + ' σ';
        }
        return '';
    }
}

