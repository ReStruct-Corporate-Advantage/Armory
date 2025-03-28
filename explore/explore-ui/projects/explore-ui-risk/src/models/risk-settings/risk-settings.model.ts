import {AbstractColumnOption, ColumnOptionValidatorInterface, DerivedSettings, ExploreInputValidationInfo, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isEmpty, isNil, isObject, isUndefined} from 'lodash';
import {CoreRiskConstants} from '../../core-risk.constants';
import {SupportsRevealSources} from '../../interfaces/supports-reveal-sources.interface';
import {AdvancedRiskSettings} from '../advanced-risk-settings/advanced-risk-settings.model';
import {EconomySettings} from '../economy-settings/economy-settings.model';
import {ExposureSettings} from '../exposure-settings/exposure-settings.model';
import {HvarRiskSettingsModel} from '../hvar-risk-settings/hvar-risk-settings.model';
import {CopySettings} from '../../interfaces/copy-settings.interface';
import { MCVaRRiskSettingsModel } from '../mcvar-risk-settings/mcvar-risk-settings.model';

export class RiskSettings extends AbstractColumnOption implements WidgetInput, DerivedSettings<RiskSettings>, SupportsRevealSources, CopySettings<RiskSettings>, ColumnOptionValidatorInterface {
    static readonly CONFIG_TYPE: string = 'riskSettings';
    static readonly LEGACY_CONFIG_TYPE: string = 'portfolioRiskAttributes';
    static readonly LEGACY_WIDGET_CONFIG_TYPE: string = 'widgetRiskSettings';

    economyRiskSettings: EconomySettings;
    exposureRiskSettings: ExposureSettings;
    advancedRiskSettings: AdvancedRiskSettings;
    hvarRiskSettings: HvarRiskSettingsModel;
    mcvarRiskSettings: MCVaRRiskSettingsModel;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        this.economyRiskSettings = new EconomySettings(undefined, '');
        this.exposureRiskSettings = new ExposureSettings(undefined, '');
        this.advancedRiskSettings = new AdvancedRiskSettings(undefined, '');
        this.hvarRiskSettings = new HvarRiskSettingsModel(undefined, '');
        this.mcvarRiskSettings = new MCVaRRiskSettingsModel(undefined, '');
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Method to deserialize
     */
    deserialize(data: any) {
        const rawData: any = data.data ? data.data : data;
        // NOTE:  For the economy risk settings the CovMatrix for an old Explore/Prism favorite can be inline on the top level object.
        //        So this is just flattening the economy and the top level values together to ensure we can load from either.
        this.economyRiskSettings.deserialize(data.economyRiskSettings ? {...data.economyRiskSettings, ...rawData} : rawData);
        this.exposureRiskSettings.deserialize(data.exposureRiskSettings ? data.exposureRiskSettings : rawData);
        this.advancedRiskSettings.deserialize(data.advancedRiskSettings ? data.advancedRiskSettings : rawData);
        this.hvarRiskSettings.deserialize(data.hvarRiskSettings ? data.hvarRiskSettings : rawData);
        this.mcvarRiskSettings.deserialize(data.mcvarRiskSettings ? data.mcvarRiskSettings : rawData);
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Method to serialize settings for saving
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};
        const economyRiskSettings = this.economyRiskSettings?.serialize();
        if (economyRiskSettings && !isEmpty(economyRiskSettings)) {
            data.economyRiskSettings = economyRiskSettings;
        }
        const exposureRiskSettings = this.exposureRiskSettings?.serialize();
        if (exposureRiskSettings && !isEmpty(exposureRiskSettings)) {
            data.exposureRiskSettings = exposureRiskSettings;
        }
        const advancedRiskSettings = this.advancedRiskSettings?.serialize();
        if (advancedRiskSettings && !isEmpty(advancedRiskSettings)) {
            data.advancedRiskSettings = advancedRiskSettings;
        }
        const hvarRiskSettings = this.hvarRiskSettings?.serialize();
        if (hvarRiskSettings && !isEmpty(hvarRiskSettings)) {
            data.hvarRiskSettings = hvarRiskSettings;
        }
        const mcvarRiskSettings = this.mcvarRiskSettings?.serialize();
        if (mcvarRiskSettings && !isEmpty(mcvarRiskSettings)) {
            data.mcvarRiskSettings = mcvarRiskSettings;
        }
        return data;
    }

    /**
     * Gets the risk settings params for the request to be sent to the server
     */
    getRequestParams(addDefaultValues?: boolean): any {
        const requestParams: any = {};
        if (this.economyRiskSettings) {
            this.isRootRiskSetting(this.economyRiskSettings.name)
                ? this.economyRiskSettings.addRequestData(requestParams, this.economyRiskSettings, addDefaultValues)
                : this.economyRiskSettings.addRequestData(requestParams, this.economyRiskSettings.parentRiskSettings as EconomySettings, addDefaultValues);
        }

        if (this.exposureRiskSettings) {
            this.isRootRiskSetting(this.exposureRiskSettings.name)
                ? this.exposureRiskSettings.addRequestData(requestParams, this.exposureRiskSettings)
                : this.exposureRiskSettings.addRequestData(requestParams, this.exposureRiskSettings.parentRiskSettings as ExposureSettings);
        }

        if (this.advancedRiskSettings) {
            this.isRootRiskSetting(this.advancedRiskSettings.name)
                ? this.advancedRiskSettings.addRequestData(requestParams, this.advancedRiskSettings)
                : this.advancedRiskSettings.addRequestData(requestParams, this.advancedRiskSettings.parentRiskSettings as AdvancedRiskSettings);
        }

        if (this.hvarRiskSettings) {
            this.isRootRiskSetting(this.hvarRiskSettings.name)
            ? this.hvarRiskSettings.addRequestData(requestParams, this.hvarRiskSettings)
            : this.hvarRiskSettings.addRequestData(requestParams, this.hvarRiskSettings.parentRiskSettings as HvarRiskSettingsModel);
        }

        if (this.mcvarRiskSettings) {
            this.isRootRiskSetting(this.mcvarRiskSettings.name) ? this.mcvarRiskSettings.addRequestData(requestParams, this.mcvarRiskSettings) : this.mcvarRiskSettings.addRequestData(requestParams, this.mcvarRiskSettings.parentRiskSettings);
        }

        return requestParams;
    }

    /**
     * Checks whether the risk setting is root level i.e Portfolio or Widget level
     */
    isRootRiskSetting(name: string): boolean {
        return name === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO || name === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET;
    }

    /**
     * equals method implementation
     */
    equals(portfolioRiskSettings: RiskSettings): boolean {
        if (this.exposureRiskSettings && !this.exposureRiskSettings.equals(portfolioRiskSettings.exposureRiskSettings)) {
            return false;
        }

        if (this.economyRiskSettings && !this.economyRiskSettings.equals(portfolioRiskSettings.economyRiskSettings)) {
            return false;
        }

        if (this.hvarRiskSettings && !this.hvarRiskSettings.equals(portfolioRiskSettings.hvarRiskSettings)) {
            return false;
        }

        if (this.mcvarRiskSettings && !this.mcvarRiskSettings.equals(portfolioRiskSettings.mcvarRiskSettings)) {
            return false;
        }

        return !(this.advancedRiskSettings && !this.advancedRiskSettings.equals(portfolioRiskSettings.advancedRiskSettings));
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any, paramName?: string) {
        const params = this.getRequestParams();
        if (!isEmpty(params)) {
            paramName = paramName || CoreRiskConstants.RISK_SETTINGS;
            requestParams[paramName] = params;
        }
    }

    get configType(): string {
        return RiskSettings.CONFIG_TYPE;
    }

    isValid(): boolean {
        return true;
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        // Intentionally left empty
    }

    /**
     * AbstractDerivedSettingsColumnOption.getParentWidgetSettingKey()
     */
    getParentWidgetSettingKey(): string {
        return 'riskSettings';
    }

    /**
     * AbstractDerivedSettingsColumnOption.getParentPortfolioSettingKey()
     */
    getParentPortfolioSettingKey(): string {
        return 'portfolioRiskSettings';
    }

    /**
     * AbstractDerivedSettingsColumnOption.updateDerivedSettings
     */
    updateDerivedSettings(settings: RiskSettings) {
        if (isNil(settings)) {
            return;
        }
        if (this.economyRiskSettings) {
            this.economyRiskSettings.parentRiskSettings = settings.economyRiskSettings;
        }
        if (this.exposureRiskSettings) {
            this.exposureRiskSettings.parentRiskSettings = settings.exposureRiskSettings;
        }
        if (this.advancedRiskSettings) {
            this.advancedRiskSettings.parentRiskSettings = settings.advancedRiskSettings;
        }
        if (this.hvarRiskSettings) {
            this.hvarRiskSettings.parentRiskSettings = settings.hvarRiskSettings;
        }
        if (this.mcvarRiskSettings) {
            this.mcvarRiskSettings.parentRiskSettings = settings.mcvarRiskSettings;
        }
    }

    /**
     * WidgetInput.isDataStoreInput()
     */
    isDataStoreInput(): boolean {
        return true;
    }

    setSettingsSource(source: string) {
        if (this.economyRiskSettings) {
            this.economyRiskSettings.name = source;
        }
        if (this.exposureRiskSettings) {
            this.exposureRiskSettings.name = source;
        }
        if (this.advancedRiskSettings) {
            this.advancedRiskSettings.name = source;
        }
        if (this.hvarRiskSettings) {
            this.hvarRiskSettings.name = source;
        }
        if (this.mcvarRiskSettings) {
            this.mcvarRiskSettings.name = source;
        }
    }

    copySettings(settings: RiskSettings) {
        if (isNil(settings)) {
            return;
        }
        this.economyRiskSettings.copySettings(settings.economyRiskSettings);
        this.exposureRiskSettings.copySettings(settings.exposureRiskSettings);
        this.advancedRiskSettings.copySettings(settings.advancedRiskSettings);
        this.hvarRiskSettings.copySettings(settings.hvarRiskSettings);
        this.mcvarRiskSettings.copySettings(settings.mcvarRiskSettings);
    }

    isValidColumnOption(): ExploreInputValidationInfo | undefined {
        let isValid: ExploreInputValidationInfo | undefined = undefined;
        if (!isUndefined(this.hvarRiskSettings)) {
            isValid = this.hvarRiskSettings.isValidColumnOption();
        }
        if (!isValid && !isUndefined(this.mcvarRiskSettings)) {
            isValid = this.mcvarRiskSettings.isValidColumnOption();
        }
        return isValid;
    }

    /**
     * Accumulates all risk settings and their parent risk settings parameters into one risk settings
     */
    createAllRiskSettings(): RiskSettings {
        const allRiskSettings = new RiskSettings();
        allRiskSettings.economyRiskSettings.deserialize(this.economyRiskSettings?.getAllSettings());
        allRiskSettings.exposureRiskSettings.deserialize(this.exposureRiskSettings?.getAllSettings());
        allRiskSettings.advancedRiskSettings.deserialize(this.advancedRiskSettings?.getAllSettings());
        allRiskSettings.hvarRiskSettings.deserialize(this.hvarRiskSettings?.getAllSettings());
        allRiskSettings.mcvarRiskSettings.deserialize(this.mcvarRiskSettings?.getAllSettings());
        return allRiskSettings;
    }

    getParentRiskSettings(): RiskSettings {
        const parentRiskSettings = new RiskSettings();
        let parentExists = false;
        if (this.economyRiskSettings?.parentRiskSettings) {
            parentExists = true;
            parentRiskSettings.economyRiskSettings.deserialize(this.economyRiskSettings.parentRiskSettings);
            parentRiskSettings.economyRiskSettings.parentRiskSettings = this.economyRiskSettings.parentRiskSettings.parentRiskSettings;
        }
        if (this.exposureRiskSettings?.parentRiskSettings) {
            parentExists = true;
            parentRiskSettings.exposureRiskSettings.deserialize(this.exposureRiskSettings.parentRiskSettings);
            parentRiskSettings.exposureRiskSettings.parentRiskSettings = this.exposureRiskSettings.parentRiskSettings.parentRiskSettings;
        }
        if (this.advancedRiskSettings?.parentRiskSettings) {
            parentExists = true;
            parentRiskSettings.advancedRiskSettings.deserialize(this.advancedRiskSettings.parentRiskSettings);
            parentRiskSettings.advancedRiskSettings.parentRiskSettings = this.advancedRiskSettings.parentRiskSettings.parentRiskSettings;
        }
        if (this.hvarRiskSettings?.parentRiskSettings) {
            parentExists = true;
            parentRiskSettings.hvarRiskSettings.deserialize(this.hvarRiskSettings.parentRiskSettings);
            parentRiskSettings.hvarRiskSettings.parentRiskSettings = this.hvarRiskSettings.parentRiskSettings.parentRiskSettings;
        }
        if (this.mcvarRiskSettings?.parentRiskSettings) {
            parentExists = true;
            parentRiskSettings.mcvarRiskSettings.deserialize(this.mcvarRiskSettings.parentRiskSettings);
            parentRiskSettings.mcvarRiskSettings.parentRiskSettings = this.mcvarRiskSettings.parentRiskSettings.parentRiskSettings;
        }
        return parentExists ? parentRiskSettings : undefined;
    }
}
