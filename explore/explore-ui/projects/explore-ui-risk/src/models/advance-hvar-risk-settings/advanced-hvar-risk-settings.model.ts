import {cloneDeep, isNil, isUndefined} from 'lodash';
import {AbstractRiskSettings} from '../abstract-risk-settings.model';
import {CoreRiskConstants} from '../../core-risk.constants';

export class AdvancedHvarRiskSettingsModel extends AbstractRiskSettings {

    private _holdingPeriod: number;
    private _confidenceIntervalScaling: number;

    readonly propertyList: any = cloneDeep(CoreRiskConstants.ADVANCED_HVAR_RISK_SETTINGS_PROPS);

    constructor(parentAdvancedHvarRiskSettings?: any, name?: string) {
        super(parentAdvancedHvarRiskSettings, name);
    }


    get holdingPeriod(): number {
        if (!isNil(this._holdingPeriod)) {
            return this._holdingPeriod;
        } else {
            return (this.parentRiskSettings as AdvancedHvarRiskSettingsModel)?.holdingPeriod;
        }
    }

    set holdingPeriod(value: number) {
        this._holdingPeriod = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedHvarRiskSettingsModel)?.holdingPeriod ? null : value;
    }

    get confidenceIntervalScaling(): number {
        if (!isNil(this._confidenceIntervalScaling)) {
            return this._confidenceIntervalScaling;
        } else {
            return (this.parentRiskSettings as AdvancedHvarRiskSettingsModel)?.confidenceIntervalScaling;
        }
    }

    set confidenceIntervalScaling(value: number) {
        this._confidenceIntervalScaling = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedHvarRiskSettingsModel)?.confidenceIntervalScaling ? null : value;
    }

    deserialize(data: any): void {
        if (!data) {
            return;
        }

        if (!isUndefined(data.holdingPeriod)) {
            this._holdingPeriod = data.holdingPeriod;
        }
        if (!isUndefined(data.confidenceIntervalScaling)) {
            this._confidenceIntervalScaling = data.confidenceIntervalScaling;
        }
    }

    serialize(): any {
        const data: any = {};
        if (this._holdingPeriod) {
            data.holdingPeriod = this._holdingPeriod;
        }
        if (this._confidenceIntervalScaling) {
            data.confidenceIntervalScaling = this._confidenceIntervalScaling;
        }
        return data;
    }

    equals(other: AdvancedHvarRiskSettingsModel): boolean {
        return !isUndefined(other) && this._holdingPeriod === other._holdingPeriod && this._confidenceIntervalScaling === other._confidenceIntervalScaling;
    }

    addRequestData(params: any, rootRiskSettings: AdvancedHvarRiskSettingsModel): void {
        const amIRoot: boolean = this === rootRiskSettings;
        this.addRequestParamProperty(params, amIRoot, CoreRiskConstants.ADVANCED_HVAR_RISK_SETTINGS_PROPS.HOLDING_PERIOD);
        this.addRequestParamProperty(params, amIRoot, CoreRiskConstants.ADVANCED_HVAR_RISK_SETTINGS_PROPS.CONFIDENCE_INTERVAL_SCALING);
    }

    addRequestParamProperty(params: any, amIRoot: boolean, defaultSettingKey: string): void {
        const value: any = this['_' + defaultSettingKey];
        if (!isUndefined(value) && !isNil(value)) {
            params[defaultSettingKey] = value;
        } else if (amIRoot && this[defaultSettingKey] && !this.isDefaultSetting(defaultSettingKey)) {
            params[defaultSettingKey] = this[defaultSettingKey];
        }
    }
}
