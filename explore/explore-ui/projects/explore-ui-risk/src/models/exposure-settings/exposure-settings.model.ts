import {PortfolioDefaults, RiskModel} from '@blk/explore-ui-core';
import {cloneDeep, isNil} from 'lodash';
import {CoreRiskConstants} from '../../core-risk.constants';
import {AbstractRiskSettings} from '../abstract-risk-settings.model';
import {DefaultRiskSettings} from '../default-risk-settings/default-risk-settings.model';
import {CopySettings} from '../../interfaces/copy-settings.interface';

/**
 * Subset of Risk settings - exposure risk settings
 */
export class ExposureSettings extends AbstractRiskSettings implements CopySettings<ExposureSettings> {

    // risk properties ( exposure)
    private _riskModel: string;
    riskModels: RiskModel[];

    readonly propertyList = cloneDeep(CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES);

    /**
     * Constructor
     */
    constructor(parentRiskSettings?: ExposureSettings, name?: string) {
        super(parentRiskSettings, name);
    }

    /**
     * Getter for riskModel
     */
    get riskModel(): string {
        if (this._riskModel) {
            return this._riskModel;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as ExposureSettings).riskModel;
        }
    }

    /**
     * Setter for riskModel
     * If selected model is DEFAULT then don't update _riskModel
     */
    set riskModel(value: string) {
        this._riskModel = this.parentRiskSettings && (value === (this.parentRiskSettings as ExposureSettings).riskModel
            || value === CoreRiskConstants.RISK_MODEL_TYPE.DEFAULT) ? null : value;
    }

    /**
     * Method to deserialize from saved value
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        if (!isNil(data.riskModel)) {
            this.riskModel = data.riskModel;
        } else if (!isNil(data.ModelMapping)) {
            this.riskModel = data.ModelMapping;
        }
    }

    /**
     * Serialize the attribution settings to json.
     */
    serialize(): any {
        return !isNil(this._riskModel) ? {'riskModel': this._riskModel} : undefined;
    }

    /**
     * Resets all settings
     */
    resetSettings(): void {
        this.riskModel = null;
    }

    /**
     * Method to extract params for the request
     */
    addRequestData(requestRiskSettingsData: any, rootRiskSettings: ExposureSettings): void {
        if (!isNil(this._riskModel)) {
            requestRiskSettingsData.ModelMapping = this._riskModel;
        } else if (this === rootRiskSettings && this.riskModel && !this.isDefaultSetting(CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL)) {
            requestRiskSettingsData.ModelMapping = this.riskModel;
        }
    }

    /**
     * Sets Org Default ExposureRiskSettings
     */
    setOrgDefaultExposureRiskSettings(orgDefaultRiskSettings: DefaultRiskSettings): void {
        this.riskModel = orgDefaultRiskSettings.modelMapping;
    }

    /**
     * Sets Port Default ExposureRiskSettings
     */
    setPortDefaultExposureRiskSettings(portDefaultRiskSettings: DefaultRiskSettings): void {
        if (portDefaultRiskSettings.modelMapping) {
            this.riskModel = portDefaultRiskSettings.modelMapping;
        }
    }

    /**
     * Sets default values for exposure settings
     */
    setDefaultExposureRiskSettings(portfolioDefaults: PortfolioDefaults) {
        if (portfolioDefaults) {
            this.riskModel = portfolioDefaults.defaultModelCode;
        }
    }

    /**
     * if setting is in default state, return false. Otherwise return false
     */
    isExposureRiskSettingsChanged(): boolean {
        return this.doesValueExist(this.propertyList['RISK_MODEL']);
    }

    /**
     * equals method implementation
     */
    equals(exposureSettings: ExposureSettings): boolean {
        return this.riskModel === exposureSettings.riskModel;
    }

    /**
     * If the value isn't defined by user, updates according to port or org defaults.
     */
    checkGPDefault(): void {
        if (this.doesValueExist(CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL)) {
            return;
        }

        // doesnt exist. Add another item to list with this model as value and name it GP Default + first few characters of the model string
        if (this.getSourceName(CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL) === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT) {
            const riskModel = new RiskModel({
                Value: this.riskModel,
                Label: CoreRiskConstants.RISK_MODEL_TYPE.GP + ' (' + this.riskModel.substring(0, 10) + ')'
            });
            this.riskModels.unshift(riskModel);
        } else if (this.getSourceName(CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL) === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT) {
            for (let i = 0, l = this.riskModels.length; i < l; i++) {
                if (this.riskModels[i].value === CoreRiskConstants.RISK_MODEL_TYPE.DEFAULT) {
                    const riskModel = new RiskModel({
                        Value: this.riskModel,
                        Label: CoreRiskConstants.RISK_MODEL_TYPE.ORG + ' (' + this.riskModel.substring(0, 10) + ')'
                    });
                    this.riskModels[i] = riskModel;
                    break;
                }
            }
        }
    }

    copySettings(settings: ExposureSettings) {
        if (isNil(settings)) {
            return;
        }
        this._riskModel = settings._riskModel;
    }

    /**
     * Returns the formatted value of the parent field
     * @param key  Field name
     */
    getFormattedParentValue(key: string): string {
        if (key === CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL) {
            return (this.parentRiskSettings as ExposureSettings).riskModel;
        }
        return '';
    }
}
