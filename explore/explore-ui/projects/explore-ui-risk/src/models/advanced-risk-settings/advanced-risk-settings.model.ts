import {isEmpty, isNil, isUndefined} from 'lodash';
import {CoreRiskConstants} from '../../core-risk.constants';
import {AbstractRiskSettings} from '../abstract-risk-settings.model';
import {FilterScaling, FilterScalingUtil} from '../../enums/filter-scaling.enum';
import {DefaultRiskSettings} from '../default-risk-settings/default-risk-settings.model';
import {CopySettings} from '../../interfaces';
import {CoreDefinitionStore} from '@blk/explore-ui-core';

/**
 * Subset of Risk settings - advanced risk settings
 */
export class AdvancedRiskSettings extends AbstractRiskSettings implements CopySettings<AdvancedRiskSettings> {

    // Risk Properties(advanced)
    private _excludeBlock: string;
    private _market: string;
    private _filterScaling: FilterScaling;
    private _assetClassCovariance: string;
    private _dxsBlock: string;
    private _scaleDxsExposures: boolean;
    private _assumeZeroAverageReturn: boolean;
    private _exposureLookback: number;
    private _riskMatrix = 1;

    readonly propertyList = CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES;

    constructor(parentRiskSettings?: AdvancedRiskSettings, name?: string) {
        super(parentRiskSettings, name);
    }

    get market(): string {
        if (!isNil(this._market)) {
            return this._market;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as AdvancedRiskSettings).market;
        }
    }

    set market(value: string) {
        this._market = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedRiskSettings).market ? null : value;
    }

    get excludeBlock(): string {
        if (!isNil(this._excludeBlock)) {
            return this._excludeBlock;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as AdvancedRiskSettings).excludeBlock;
        }
    }

    set excludeBlock(value: string) {
        this._excludeBlock = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedRiskSettings).excludeBlock ? null : value;
    }

    get filterScaling(): FilterScaling {
        if (!isNil(this._filterScaling)) {
            return this._filterScaling;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as AdvancedRiskSettings).filterScaling;
        }
    }

    set filterScaling(value: FilterScaling) {
        this._filterScaling = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedRiskSettings).filterScaling ? null : value;
    }

    get assetClassCovariance(): string {
        if (!isNil(this._assetClassCovariance)) {
            return this._assetClassCovariance;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as AdvancedRiskSettings).assetClassCovariance;
        }
    }

    set assetClassCovariance(value: string) {
        this._assetClassCovariance = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedRiskSettings).assetClassCovariance ? null : value;
    }

    get dxsBlock(): string {
        if (!isNil(this._dxsBlock)) {
            return this._dxsBlock;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as AdvancedRiskSettings).dxsBlock;
        }
    }

    set dxsBlock(value: string) {
        this._dxsBlock = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedRiskSettings).dxsBlock ? null : value;
    }

    get scaleDxsExposures(): boolean {
        if (!isNil(this._scaleDxsExposures)) {
            return this._scaleDxsExposures;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as AdvancedRiskSettings).scaleDxsExposures;
        }
    }

    set scaleDxsExposures(value: boolean) {
        this._scaleDxsExposures = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedRiskSettings).scaleDxsExposures ? null : value;
    }

    get assumeZeroAverageReturn(): boolean {
        if (!isNil(this._assumeZeroAverageReturn)) {
            return this._assumeZeroAverageReturn;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as AdvancedRiskSettings).assumeZeroAverageReturn;
        }
    }

    set assumeZeroAverageReturn(value: boolean) {
        this._assumeZeroAverageReturn = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedRiskSettings).assumeZeroAverageReturn ? null : value;
    }


    get exposureLookback(): number {
        if (!isNil(this._exposureLookback)) {
            return this._exposureLookback;
        } else if (this.parentRiskSettings) {
            return (this.parentRiskSettings as AdvancedRiskSettings).exposureLookback;
        }
    }

    set exposureLookback(value: number) {
        this._exposureLookback = this.parentRiskSettings && value === (this.parentRiskSettings as AdvancedRiskSettings).exposureLookback ? null : value;
    }

    get riskMatrix(): number {
        return this._riskMatrix;
    }
    set riskMatrix(value: number) {
        this._riskMatrix = value;
    }

    /**
     * Method to deserialize
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        if (data.excludeBlock) {
            this.excludeBlock = data.excludeBlock;
        }
        if (data.market) {
            this.market = data.market;
        }
        if (data.filterScaling) {
            this.filterScaling = FilterScalingUtil.valueOf(data.filterScaling);
        }
        if (data.assetClassCovariance) {
            this.assetClassCovariance = data.assetClassCovariance;
        }
        if (data.dxsBlock) {
            this.dxsBlock = data.dxsBlock;
        }
        if (!isUndefined(data.scaleDxsExposures)) {
            this.scaleDxsExposures = data.scaleDxsExposures;
        }
        if (!isUndefined(data.assumeZeroAverageReturn)) {
            this.assumeZeroAverageReturn = data.assumeZeroAverageReturn;
        }
        if (data.exposureLookback) {
            this.exposureLookback = data.exposureLookback;
        }
        if (data.riskMatrix) {
            this.riskMatrix = data.riskMatrix;
        }
    }

    /**
     * Serialize the attribution settings to json.
     */
    serialize(): any {
        const dataToSave: any = {};
        if (!isNil(this._excludeBlock)) {
            dataToSave.excludeBlock = this._excludeBlock;
        }
        if (!isNil(this._market)) {
            dataToSave.market = this._market;
        }
        if (!isNil(this._filterScaling)) {
            dataToSave.filterScaling = FilterScalingUtil.typeName(this._filterScaling);
        }
        if (!isNil(this._assetClassCovariance)) {
            dataToSave.assetClassCovariance = this._assetClassCovariance;
        }
        if (!isNil(this._dxsBlock)) {
            dataToSave.dxsBlock = this._dxsBlock;
        }
        if (!isNil(this._scaleDxsExposures)) {
            dataToSave.scaleDxsExposures = this._scaleDxsExposures;
        }
        if (!isNil(this._assumeZeroAverageReturn)) {
            dataToSave.assumeZeroAverageReturn = this._assumeZeroAverageReturn;
        }
        if (!isNil(this._exposureLookback)) {
            dataToSave.exposureLookback = this._exposureLookback;
        }
        if (!isNil(this._riskMatrix)) {
            dataToSave.riskMatrix = this._riskMatrix;
        }
        return dataToSave;
    }

    /**
     * Resets all settings
     */
    public resetSettings(): void {
        this.excludeBlock = null;
        this.market = null;
        this.filterScaling = null;
        this.assetClassCovariance = null;
        this.dxsBlock = null;
        this.scaleDxsExposures = null;
        this.assumeZeroAverageReturn = null;
        this.exposureLookback = null;
        this.riskMatrix = 1;
    }

    /**
     * Method to extract data for request params.
     */
    addRequestData(requestRiskSettingsData: any, rootRiskSettings: AdvancedRiskSettings): void {
        const amIRoot: boolean = this === rootRiskSettings;

        if (!isNil(this._excludeBlock)) {
            requestRiskSettingsData.ExcludeBlock = this._excludeBlock;
        } else if (amIRoot && !isNil(this.excludeBlock) && !this.isDefaultSetting(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.EXCLUDE_BLOCK)) {
            requestRiskSettingsData.ExcludeBlock = this.excludeBlock;
        }
        if (!isNil(this._market)) {
            requestRiskSettingsData.market = this._market;
        } else if (amIRoot && !isNil(this.market) && !this.isDefaultSetting(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.MARKET)) {
            requestRiskSettingsData.market = this.market;
        }
        if (!isNil(this._filterScaling)) {
            requestRiskSettingsData.filterScaling = FilterScalingUtil.typeName(this._filterScaling);
        } else if (amIRoot && !isNil(this.filterScaling) && !this.isDefaultSetting(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.FILTER_SCALING)) {
            requestRiskSettingsData.filterScaling = FilterScalingUtil.typeName(this.filterScaling);
        }
        if (!(isNil(this._exposureLookback)) && this._exposureLookback > 0 ) {
            requestRiskSettingsData.exposureLookback = this._exposureLookback;
        } else if (amIRoot && !isNil(this.exposureLookback) && !this.isDefaultSetting(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.EXPOSURE_LOOKBACK) && this.exposureLookback > 0) {
            requestRiskSettingsData.exposureLookback = this.exposureLookback;
        }

        this._addRequestDataForAdvancedRiskSettings(requestRiskSettingsData, amIRoot);
    }

    /**
     * Sets Org Default AdvancedRiskSettings
     */
    setOrgDefaultAdvancedRiskSettings(orgDefaultRiskSettings: DefaultRiskSettings): void {
        if (orgDefaultRiskSettings.assetClassCovariance) {
            this.assetClassCovariance = orgDefaultRiskSettings.assetClassCovariance;
        }
        if (orgDefaultRiskSettings.dxsBlock) {
            this.dxsBlock = orgDefaultRiskSettings.dxsBlock;
        }
        if (orgDefaultRiskSettings.scaleDxsExposures) {
            this.scaleDxsExposures = orgDefaultRiskSettings.scaleDxsExposures;
        }
        this.filterScaling = FilterScaling.PORTFOLIO_NAV;
        this.assumeZeroAverageReturn = true;
    }

    /**
     * Sets Port Default ExposureRiskSettings
     */
    setPortDefaultAdvancedRiskSettings(portDefaultRiskSettings: DefaultRiskSettings): void {
        if (portDefaultRiskSettings.assetClassCovariance) {
            this.assetClassCovariance = portDefaultRiskSettings.assetClassCovariance;
        }
        if (portDefaultRiskSettings.dxsBlock) {
            this.dxsBlock = portDefaultRiskSettings.dxsBlock;
        }
        this.filterScaling = FilterScaling.PORTFOLIO_NAV;
    }

    /**
     * Return true, if advancedRisk Setting changed
     * False if settings are default one
     */
    isAdvancedRiskSettingChanged(): boolean {
        return !isEmpty(this.market)
            || !isEmpty(this.excludeBlock)
            || this.doesValueExist(this.propertyList.FILTER_SCALING)
            || this.doesValueExist(this.propertyList.ASSET_CLASS_COVARIANCE)
            || this.doesValueExist(this.propertyList.DXS_BLOCK)
            || this.doesValueExist(this.propertyList.SCALE_DXS_EXPOSURES)
            || this.doesValueExist(this.propertyList.ASSUME_ZERO_AVERAGE_RETURN)
            || this.doesValueExist(this.propertyList.EXPOSURE_LOOKBACK)
            // Default risk matrix is set to 1.
            || this.riskMatrix !== 1;
    }

    /**
     * Sets excludeBlock to default value for Org / Port /Default level
     */
    setAdvancedRiskSettings(): void {
        this.excludeBlock = '';
    }

    /**
     * equals method implementation
     */
    equals(advancedSettings: AdvancedRiskSettings): boolean {
        return this.excludeBlock === advancedSettings.excludeBlock
            && this.market === advancedSettings.market
            && this.filterScaling === advancedSettings.filterScaling
            && this.assetClassCovariance === advancedSettings.assetClassCovariance
            && this.dxsBlock === advancedSettings.dxsBlock
            && this.scaleDxsExposures === advancedSettings.scaleDxsExposures
            && this.assumeZeroAverageReturn === advancedSettings.assumeZeroAverageReturn
            && this.exposureLookback === advancedSettings.exposureLookback
            && this.riskMatrix === advancedSettings.riskMatrix;

    }

    private _addRequestDataForAdvancedRiskSettings(requestRiskSettingsData: any, amIRoot: boolean) {
        if (!isNil(this._assetClassCovariance)) {
            requestRiskSettingsData.AssetClassCovariance = this._assetClassCovariance;
        } else if (amIRoot && !isNil(this.assetClassCovariance) && !this.isDefaultSetting(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.ASSET_CLASS_COVARIANCE)) {
            requestRiskSettingsData.AssetClassCovariance = this.assetClassCovariance;
        }
        if (!isNil(this._dxsBlock)) {
            requestRiskSettingsData.DxsBlock = this._dxsBlock;
        } else if (amIRoot && !isNil(this.dxsBlock) && !this.isDefaultSetting(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.DXS_BLOCK)) {
            requestRiskSettingsData.DxsBlock = this.dxsBlock;
        }
        if (!isNil(this._assumeZeroAverageReturn)) {
            requestRiskSettingsData.AssumeZeroAverageReturn = this._assumeZeroAverageReturn;
        } else if (amIRoot && !isNil(this.assumeZeroAverageReturn) && !this.isDefaultSetting(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.ASSUME_ZERO_AVERAGE_RETURN)) {
            requestRiskSettingsData.AssumeZeroAverageReturn = this.assumeZeroAverageReturn;
        }
        if (!isNil(this._scaleDxsExposures)) {
            requestRiskSettingsData.ScaleDxsExposures = this._scaleDxsExposures;
        } else if (amIRoot && !isNil(this.scaleDxsExposures) && !this.isDefaultSetting(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.SCALE_DXS_EXPOSURES)) {
            requestRiskSettingsData.ScaleDxsExposures = this.scaleDxsExposures;
        }
    }

    copySettings(settings: AdvancedRiskSettings) {
        if (isNil(settings)) {
            return;
        }
        this._excludeBlock = settings._excludeBlock;
        this._market = settings._market;
        this._filterScaling = settings._filterScaling;
        this._assetClassCovariance = settings._assetClassCovariance;
        this._dxsBlock = settings._dxsBlock;
        this._scaleDxsExposures = settings._scaleDxsExposures;
        this._assumeZeroAverageReturn = settings._assumeZeroAverageReturn;
        this._exposureLookback = settings._exposureLookback;
    }

    /**
     * Returns the formatted value of the parent field
     * @param key  Field name
     */
    getFormattedParentValue(key: string): string {
        const parentSettings = this.parentRiskSettings as AdvancedRiskSettings;
        switch (key) {
            case CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.EXCLUDE_BLOCK:
                if (parentSettings.excludeBlock === '') {
                    return CoreRiskConstants.NONE;
                } else if (parentSettings.excludeBlock === CoreRiskConstants.OTHER) {
                    return CoreRiskConstants.OTHER;
                }
                return CoreDefinitionStore.excludeFactorBlock.find(block => block.value === parentSettings.excludeBlock)?.value ?? '';
            case CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.MARKET:
                return parentSettings.market || CoreRiskConstants.NONE;
            case CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.FILTER_SCALING:
                return FilterScalingUtil.getDisplayName(parentSettings.filterScaling);
            case CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.DXS_BLOCK:
                return parentSettings.dxsBlock;
            case CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.ASSET_CLASS_COVARIANCE:
                return CoreRiskConstants.ASSET_CLASS_COVARIANCE_TYPE_OPTIONS.find(option => option.value === parentSettings.assetClassCovariance)?.label ?? '';
            case CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES.EXPOSURE_LOOKBACK:
                return parentSettings.exposureLookback?.toString() || '0';
        }
        return '';
    }
}
