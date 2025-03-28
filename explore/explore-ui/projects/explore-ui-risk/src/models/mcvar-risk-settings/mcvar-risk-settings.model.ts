import {CalendarDateUtils, ColumnOptionValidatorInterface, ExploreInputValidationInfo} from '@blk/explore-ui-core';

import {AbstractRiskSettings} from '../abstract-risk-settings.model';
import {CopySettings} from '../../interfaces';
import { isNil, isUndefined } from 'lodash';
import { CoreRiskConstants } from '../../core-risk.constants';

export class MCVaRRiskSettingsModel extends AbstractRiskSettings implements CopySettings<MCVaRRiskSettingsModel>, ColumnOptionValidatorInterface {

    static readonly DEFAULT_SAMPLES = 10000;
    static readonly DEFAULT_SEED = 0;
    static readonly DEFAULT_TRAINING_SAMPLES = 1000;
    static readonly DEFAULT_DEGREES_OF_FREEDOM = '5.0';

    private _distributionType: string;
    private _degreesOfFreedom: number;
    private _samples: number;
    private _seed: number;
    private _pricingType: string;
    private _includeTimeReturn: boolean;
    private _idiosyncraticCorrelation: string;
    private _useImportanceSampling: boolean;

    constructor(parentMCVaRRiskSettings?: MCVaRRiskSettingsModel, name?: string) {
        super(parentMCVaRRiskSettings, name);
    }

    selfDistributionType(): string {
        return this._distributionType;
    }

    get distributionType(): string {
        if (!isNil(this._distributionType)) {
            return this._distributionType;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as MCVaRRiskSettingsModel).distributionType;
        }
    }

    set distributionType(distributionType: string) {
        this._distributionType = this.parentRiskSettings && distributionType === (this.parentRiskSettings as MCVaRRiskSettingsModel).distributionType ? null : distributionType;
    }

    get degreesOfFreedom(): number {
        if (!isNil(this._degreesOfFreedom)) {
            return this._degreesOfFreedom;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as MCVaRRiskSettingsModel).degreesOfFreedom;
        }
    }

    set degreesOfFreedom(value: number) {
        this._degreesOfFreedom = this.parentRiskSettings && value === (this.parentRiskSettings as MCVaRRiskSettingsModel).degreesOfFreedom ? null : value;
    }

    get samples(): number {
        if (!isNil(this._samples)) {
            return this._samples;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as MCVaRRiskSettingsModel).samples;
        }
    }

    set samples(samples: number) {
        this._samples = this.parentRiskSettings && samples === (this.parentRiskSettings as MCVaRRiskSettingsModel).samples ? null : samples;
    }

    get seed(): number {
        if (!isNil(this._seed)) {
            return this._seed;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as MCVaRRiskSettingsModel).seed;
        }
    }

    set seed(seed: number) {
        this._seed = this.parentRiskSettings && seed === (this.parentRiskSettings as MCVaRRiskSettingsModel).seed ? null : seed;
    }

    get pricingType(): string {
        if (!isNil(this._pricingType)) {
            return this._pricingType;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as MCVaRRiskSettingsModel).pricingType;
        }
    }

    set pricingType(pricingType: string) {
        this._pricingType = this.parentRiskSettings && pricingType === (this.parentRiskSettings as MCVaRRiskSettingsModel).pricingType ? null : pricingType;
    }

    get includeTimeReturn(): boolean {
        if (!isNil(this._includeTimeReturn)) {
            return this._includeTimeReturn;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as MCVaRRiskSettingsModel).includeTimeReturn;
        }
    }

    set includeTimeReturn(includeTimeReturn: boolean) {
        this._includeTimeReturn = this.parentRiskSettings && includeTimeReturn === (this.parentRiskSettings as MCVaRRiskSettingsModel).includeTimeReturn ? null : includeTimeReturn;
    }

    get idiosyncraticCorrelation(): string {
        if (!isNil(this._idiosyncraticCorrelation)) {
            return this._idiosyncraticCorrelation;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as MCVaRRiskSettingsModel).idiosyncraticCorrelation;
        }
    }

    set idiosyncraticCorrelation(idiosyncraticCorrelation: string) {
        this._idiosyncraticCorrelation = this.parentRiskSettings && idiosyncraticCorrelation === (this.parentRiskSettings as MCVaRRiskSettingsModel).idiosyncraticCorrelation ? null : idiosyncraticCorrelation;
    }

    get useImportanceSampling(): boolean {
        if (!isNil(this._useImportanceSampling)) {
            return this._useImportanceSampling;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as MCVaRRiskSettingsModel).useImportanceSampling;
        }
    }

    set useImportanceSampling(useImportanceSampling: boolean) {
        this._useImportanceSampling = this.parentRiskSettings && useImportanceSampling === (this.parentRiskSettings as MCVaRRiskSettingsModel).useImportanceSampling ? null : useImportanceSampling;
    }

    addRequestData(requestRiskSettingsData: any, rootRiskSettings: AbstractRiskSettings): void {
        const amIRoot: boolean = this === rootRiskSettings;

        const mcvarRiskSettings: any = {};
        if (this.distributionType) {
            this.addRequestParamProperty(mcvarRiskSettings, amIRoot, CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.DISTRIBUTION_TYPE);
            if (this.distributionType === CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value) {
                this.addRequestParamProperty(mcvarRiskSettings, amIRoot, CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.DEGREES_OF_FREEDOM);
            }
        }
        if (this._samples) {
            this.addRequestParamProperty(mcvarRiskSettings, amIRoot, CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.SAMPLES);
        }
        if (this._seed) {
            this.addRequestParamProperty(mcvarRiskSettings, amIRoot, CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.SEED);
        }
        if (this._pricingType) {
            this.addRequestParamProperty(mcvarRiskSettings, amIRoot, CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.PRICING_TYPE);
        }
        if (!isUndefined(this._includeTimeReturn)) {
            this.addRequestParamProperty(mcvarRiskSettings, amIRoot, CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.INCLUDE_TIME_RETURN);
        }
        if (this._idiosyncraticCorrelation) {
            this.addRequestParamProperty(mcvarRiskSettings, amIRoot, CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.IDIOSYNC_CORR);
        }
        if (!isUndefined(this._useImportanceSampling)) {
            this.addRequestParamProperty(mcvarRiskSettings, amIRoot, CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.USE_IMPORTANCE_SAMPLING);
        }

        if (Object.keys(mcvarRiskSettings).length > 0) {
            requestRiskSettingsData['mcvarRiskSettings'] = mcvarRiskSettings;
        }
    }

    addRequestParamProperty(mcvarRiskSettings: any, amIRoot: boolean, defaultSettingKey: string, isDate?: boolean): void {
        let value: any = this['_' + defaultSettingKey];
        if (!isUndefined(value) && isDate) {
            value = CalendarDateUtils.getDateInAladdinFormat(this['_' + defaultSettingKey].getMoment());
        }
        if (!isUndefined(value) && !isNil(value)) {
            mcvarRiskSettings[defaultSettingKey] = value;
        } else if (amIRoot && !isNil(this[defaultSettingKey]) && !this.isDefaultSetting(defaultSettingKey)) {
            mcvarRiskSettings[defaultSettingKey] = this[defaultSettingKey];
        }
    }

    deserialize(data: any): void {
        if (!data) {
            return;
        }
        if (data.distributionType) {
            this.distributionType = data.distributionType;
        }
        if (data.degreesOfFreedom) {
            this._degreesOfFreedom = data.degreesOfFreedom;
        }
        if (data.samples) {
            this._samples = data.samples;
        }
        if (data.seed) {
            this._seed = data.seed;
        }
        if (data.pricingType) {
            this._pricingType = data.pricingType;
        }
        if (!isNil(data.includeTimeReturn)) {
            this._includeTimeReturn = data.includeTimeReturn;
        }
        if (data.idiosyncraticCorrelation) {
            this._idiosyncraticCorrelation = data.idiosyncraticCorrelation;
        }
        if (!isNil(data.useImportanceSampling)) {
            this._useImportanceSampling = data.useImportanceSampling;
        }
    }
    serialize(): any {
        const data: any = {};
        if (this._distributionType) {
            data.distributionType = this._distributionType;
            if (this._distributionType === CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value) {
                data.degreesOfFreedom = this._degreesOfFreedom;
            }
        }
        if (this._samples) {
            data.samples = this._samples;
        }
        if (this._seed) {
            data.seed = this._seed;
        }
        if (this._pricingType) {
            data.pricingType = this._pricingType;
        }
        if (!isUndefined(this._includeTimeReturn)) {
            data.includeTimeReturn = this._includeTimeReturn;
        }
        if (this._idiosyncraticCorrelation) {
            data.idiosyncraticCorrelation = this._idiosyncraticCorrelation;
        }
        if (!isUndefined(this._useImportanceSampling)) {
            data.useImportanceSampling = this._useImportanceSampling;
        }
        return data;
    }

    copySettings(settings: MCVaRRiskSettingsModel) {
        if (isNil(settings)) {
            return;
        }
        this._distributionType = settings._distributionType;
        this._degreesOfFreedom = settings._degreesOfFreedom;
        this._samples = settings._samples;
        this._seed = settings._seed;
        this._pricingType = settings._pricingType;
        this._includeTimeReturn = settings._includeTimeReturn;
        this._idiosyncraticCorrelation = settings._idiosyncraticCorrelation;
        this._useImportanceSampling = settings._useImportanceSampling;
    }

    isValidColumnOption(): ExploreInputValidationInfo | undefined {
        return undefined;
    }

    /**
     * equals method implementation
     */
    equals(mcvarRiskSettingsModel: MCVaRRiskSettingsModel): boolean {
        return this._distributionType === mcvarRiskSettingsModel._distributionType && this._degreesOfFreedom === mcvarRiskSettingsModel._degreesOfFreedom && this._samples === mcvarRiskSettingsModel._samples && this._seed === mcvarRiskSettingsModel._seed
        && this._pricingType === mcvarRiskSettingsModel._pricingType && this._includeTimeReturn === mcvarRiskSettingsModel._includeTimeReturn && this._idiosyncraticCorrelation === mcvarRiskSettingsModel._idiosyncraticCorrelation
        && this._useImportanceSampling === mcvarRiskSettingsModel.useImportanceSampling;
    }

}
