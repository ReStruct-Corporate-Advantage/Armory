import {Serializable} from '../../../core/interfaces';
import {cloneDeep, each, isEqual, isNil, isUndefined} from 'lodash';
import {PerformanceConstants} from '../../performance.constants';
import {CoreCommonConstants} from '../../../core/constants';
import {WidgetInput} from '../../../widget-config/interfaces';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {AssetType} from '../../asset-type.enum';
import {TokenUtils} from '../../../definition/token/token.utils';
import {TokenConstants} from '../../../definition/token/token.constants';

/**
 * Model class for Attribution Settings
 */
export class AttributionSettings extends AbstractConfig implements Serializable, WidgetInput {
    private _assetType: string;

    private _factors: string[];

    private _sectorWeighting: string;

    private _attributionCalculatorMethod: string;

    private _sectorLevel: string;

    private _exposureMode: string;

    private _multiManagerAttribution = false;

    private _cannedMethod: string;

    private _topDownWithoutLookthrough: boolean;
    private _bottomsUpWithLookthrough: boolean;

    private _excessFlagMap: Map<string, boolean>;

    parentAttributionSettings: AttributionSettings;

    isColumnListUpdateEnabled = false; // this check keeps the track of the automatic update of the columnList on factors addition or removal

    sourceName: string;

    /**
     * Create an instance of attribution settings model using passed in parameters
     */
    constructor(
        assetType?: string,
        cannedMethod?: string,
        factors?: string[],
        sectorWeighting?: string,
        attributionCalculatorMethod?: string,
        sectorLevel?: string,
        exposureMode?: string,
        multiManagerAttribution?: boolean,
        topDownWithoutLookthrough?: boolean,
        bottomsUpWithLookthrough?: boolean,
        sourceName?: string
    ) {
        super();
        this._assetType = assetType;
        this._cannedMethod = cannedMethod;
        this._factors = factors;
        this._sectorWeighting = sectorWeighting;
        this._attributionCalculatorMethod = attributionCalculatorMethod;
        this._sectorLevel = sectorLevel;
        this._exposureMode = exposureMode;
        this._multiManagerAttribution = multiManagerAttribution;
        this._topDownWithoutLookthrough = topDownWithoutLookthrough;
        this._bottomsUpWithLookthrough = bottomsUpWithLookthrough;
        this.sourceName = sourceName;
    }

    get assetType(): string {
        if (this._assetType) {
            return this._assetType;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.assetType;
        }
    }

    set assetType(value: string) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.assetType) {
            this._assetType = undefined;
        } else {
            this._assetType = value;
            // if we are changing the asset type at this level and there is custom canned method defined at parent and no canned method defined at this level..
            // we need to define the canned method at this level to indicate that it is overridden
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    get cannedMethod(): string {
        if (this._cannedMethod) {
            return this._cannedMethod;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.cannedMethod;
        }
    }

    set cannedMethod(value: string) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.cannedMethod) {
            this._cannedMethod = undefined;
        } else {
            this._cannedMethod = value;
        }
    }

    get excessFlagMap(): Map<string, boolean> {
        if (this._excessFlagMap) {
            return this._excessFlagMap;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.excessFlagMap;
        }
    }

    set excessFlagMap(value: Map<string, boolean>) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.excessFlagMap) {
            this._excessFlagMap = undefined;
        } else {
            this._excessFlagMap = value;
        }
    }

    getLocalExcessFlagMap(): Map<string, boolean> {
        return this._excessFlagMap;
    }

    setLocalExcessFlagMap(value: Map<string, boolean>) {
        this._excessFlagMap =  value;
    }

    setLocalExcessFlagMapAsParentCopy() {
        this._excessFlagMap = this.parentAttributionSettings && this.parentAttributionSettings.excessFlagMap ? cloneDeep(this.parentAttributionSettings.excessFlagMap) : undefined;
    }

    get factors(): string[] {
        if (this._factors) {
            return this._factors;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.factors;
        }
    }

    set factors(value: string[]) {
        if (this.parentAttributionSettings && !this.checkPassedInFactors(value)) {
            this._factors = undefined;
        } else {
            this._factors = value;
            // if we are changing the factors at this level and there is custom canned method defined at parent and no canned method defined at this level..
            // we need to define the canned method at this level to indicate that it is overridden
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    get sectorWeighting(): string {
        if (this._sectorWeighting) {
            return this._sectorWeighting;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.sectorWeighting;
        }
    }

    set sectorWeighting(value: string) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.sectorWeighting) {
            this._sectorWeighting = undefined;
        } else {
            this._sectorWeighting = value;
            // if we are changing the sector weighting at this level and there is custom canned method defined at parent and no canned method defined at this level..
            // we need to define the canned method at this level to indicate that it is overridden
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    get attributionCalculatorMethod(): string {
        if (this._attributionCalculatorMethod) {
            return this._attributionCalculatorMethod;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.attributionCalculatorMethod;
        }
    }

    set attributionCalculatorMethod(value: string) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.attributionCalculatorMethod) {
            this._attributionCalculatorMethod = undefined;
        } else {
            this._attributionCalculatorMethod = value;
            // if we are changing the attribution calculation method at this level and there is custom canned method defined at parent and no canned method defined at this level..
            // we need to define the canned method at this level to indicate that it is overridden
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    get sectorLevel(): string {
        if (this._sectorLevel) {
            return this._sectorLevel;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.sectorLevel;
        }
    }

    set sectorLevel(value: string) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.sectorLevel) {
            this._sectorLevel = undefined;
        } else {
            this._sectorLevel = value;
            // if we are changing the sector level at this level and there is custom canned method defined at parent and no canned method defined at this level..
            // we need to define the canned method at this level to indicate that it is overridden
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    get exposureMode(): string {
        if (this._exposureMode) {
            return this._exposureMode;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.exposureMode;
        }
    }

    set exposureMode(value: string) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.exposureMode) {
            this._exposureMode = undefined;
        } else {
            this._exposureMode = value;
            // if we are changing the exposure mode at this level and there is custom canned method defined at parent and no canned method defined at this level..
            // we need to define the canned method at this level to indicate that it is overridden
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    get multiManagerAttribution(): boolean {
        if (!isUndefined(this._multiManagerAttribution)) {
            return this._multiManagerAttribution;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.multiManagerAttribution;
        }
    }

    set multiManagerAttribution(value: boolean) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.multiManagerAttribution) {
            this._multiManagerAttribution = undefined;
        } else {
            this._multiManagerAttribution = value;
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    get topDownWithoutLookthrough(): boolean {
        if (!isUndefined(this._topDownWithoutLookthrough)) {
            return this._topDownWithoutLookthrough;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.topDownWithoutLookthrough;
        }
    }

    set topDownWithoutLookthrough(value: boolean) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.topDownWithoutLookthrough) {
            this._topDownWithoutLookthrough = undefined;
        } else {
            this._topDownWithoutLookthrough = value;
            if (this._topDownWithoutLookthrough) {
                // Reset the Bottoms-Up value to avoid any potential conflicts
                this._bottomsUpWithLookthrough = undefined;
            }
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    get bottomsUpWithLookthrough(): boolean {
        if (!isUndefined(this._bottomsUpWithLookthrough)) {
            return this._bottomsUpWithLookthrough;
        } else if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.bottomsUpWithLookthrough;
        }
    }

    set bottomsUpWithLookthrough(value: boolean) {
        if (this.parentAttributionSettings && value === this.parentAttributionSettings.bottomsUpWithLookthrough) {
            this._bottomsUpWithLookthrough = undefined;
        } else {
            this._bottomsUpWithLookthrough = value;
            if (this._bottomsUpWithLookthrough) {
                // Reset the Bottoms-Up value to avoid any potential conflicts
                this._topDownWithoutLookthrough = undefined;
            }
            this.overrideAsCustomIfCustomSettingHasChanged();
        }
    }

    /**
     * based on a key(property name), gets the name of the source
     */
    getSourceName(): string {
        if (this.checkSettings()) {
            return this.sourceName;
        }
        if (this.parentAttributionSettings) {
            return this.parentAttributionSettings.getSourceName();
        }
    }

    getSourceDisplayName(): string {
        const srcName = this.getSourceName();
        return CoreCommonConstants.SETTINGS_HIERARCHY_DISPLAY_NAME[srcName] || srcName;
    }

    /**
     * Return false if the passed in AttributionSettings is not equal to this
     */
    equals(otherAttributionSettings: WidgetInput): boolean {
        if (!(otherAttributionSettings instanceof AttributionSettings)) {
            return false;
        }
        if (this.assetType !== otherAttributionSettings.assetType) {
            return false;
        }
        if (this.cannedMethod !== otherAttributionSettings.cannedMethod) {
            return false;
        }
        if (this.sectorLevel !== otherAttributionSettings.sectorLevel) {
            return false;
        }
        if (this.sectorLevel !== otherAttributionSettings.sectorLevel) {
            return false;
        }
        if (this.sectorWeighting !== otherAttributionSettings.sectorWeighting) {
            return false;
        }
        if (this.attributionCalculatorMethod !== otherAttributionSettings.attributionCalculatorMethod) {
            return false;
        }
        if (this.exposureMode !== otherAttributionSettings.exposureMode) {
            return false;
        }
        if (this.multiManagerAttribution !== otherAttributionSettings.multiManagerAttribution) {
            return false;
        }
        if (this.topDownWithoutLookthrough !== otherAttributionSettings.topDownWithoutLookthrough) {
            return false;
        }
        if (!this.factors && !otherAttributionSettings.factors) {
            return true;
        }
        if ((!this.factors && otherAttributionSettings.factors) || (this.factors && !otherAttributionSettings.factors)) {
            return false;
        }
        if (this.factors.length !== otherAttributionSettings.factors.length) {
            return false;
        }
        if (this.isColumnListUpdateEnabled !== otherAttributionSettings.isColumnListUpdateEnabled) {
            return false;
        }
        if (!isEqual(this.excessFlagMap, otherAttributionSettings.excessFlagMap)) {
            return false;
        }
        for (const item of this.factors) {
            if (otherAttributionSettings.factors.indexOf(item) === -1) {
                return false;
            }
        }
        return true;
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
        // If there is no canned method defined at this level we don't need to save down anything here.
        if (!this._cannedMethod) {
            return data;
        }
        data.cannedMethod = this._cannedMethod;

        if (this.cannedMethod === PerformanceConstants.CUSTOM_ATTRIBUTION_METHODOLOGY) {
            this.serializeCustomSettings(data);
        } else {
            this.serializeNonCustomSettings(data);
        }
        if (this._multiManagerAttribution) {
            data.multiManagerAttribution = this.multiManagerAttribution;
        }
        return data;
    }

    private serializeNonCustomSettings(data: any) {
        if (this._sectorLevel) {
            data.sectorLevel = this.sectorLevel;
        }
        if (this._sectorWeighting) {
            data.sectorWeighting = this.sectorWeighting;
        }
        if (this._attributionCalculatorMethod) {
            data.attributionCalculatorMethod = this.attributionCalculatorMethod;
        }
        if (this._exposureMode) {
            data.exposureMode = this.exposureMode;
        }
    }

    private serializeCustomSettings(data: any) {
        // If parent setting is not custom we need to store the values at this level for custom methodology
        const isParentSettingNotCustom =
            this.parentAttributionSettings &&
            this.parentAttributionSettings.cannedMethod !== PerformanceConstants.CUSTOM_ATTRIBUTION_METHODOLOGY;

        if (this._assetType || isParentSettingNotCustom) {
            data.assetType = this.assetType;
        }
        if (this._sectorLevel || isParentSettingNotCustom) {
            data.sectorLevel = this.sectorLevel;
        }
        if (this._sectorWeighting || isParentSettingNotCustom) {
            data.sectorWeighting = this.sectorWeighting;
        }
        if (this._attributionCalculatorMethod || isParentSettingNotCustom) {
            data.attributionCalculatorMethod = this.attributionCalculatorMethod;
        }
        if (this._exposureMode || isParentSettingNotCustom) {
            data.exposureMode = this.exposureMode;
        }
        if (this._factors || isParentSettingNotCustom) {
            data.factors = this.factors;
        }
        if (this._topDownWithoutLookthrough) {
            data.topDownWithoutLookthrough = this.topDownWithoutLookthrough;
        }
        if (this._bottomsUpWithLookthrough) {
            data.bottomsUpWithLookthrough = this.bottomsUpWithLookthrough;
        }
        if (this._excessFlagMap) {
            const flagMapping = {};
            this.excessFlagMap.forEach(function(value, key) {
                flagMapping[key] = value;
            });
            data.excessFlagMap = flagMapping;
        }
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        this.deserializeCannedMethod(data);
        this.deserializeAssetType(data);
        this.deserializeSectorWeighting(data);
        this.deserializeSectorLevel(data);
        this.deserializeExposureMode(data);
        this.deserializeAttributionCalculatorMethod(data);
        this.deserializeFactors(data);
        this.deserializeMultiManagerAttribution(data);
        this.deserializeTopDownWithoutLookthrough(data);
        this.deserializeBottomsUpWithLookthrough(data);
        this.deserializeExcessFlagMap(data);
    }

    private deserializeExcessFlagMap(data: any) {
        if (data.excessFlagMap) {
            this._excessFlagMap = new Map<string, boolean>();
            for (const key of Object.keys(data.excessFlagMap)) {
                this._excessFlagMap.set(key, data.excessFlagMap[key]);
            }
        }
    }

    private deserializeBottomsUpWithLookthrough(data: any) {
        if (data.bottomsUpWithLookthrough) {
            this._bottomsUpWithLookthrough = data.bottomsUpWithLookthrough;
        }
    }

    private deserializeTopDownWithoutLookthrough(data: any) {
        if (data.topDownWithoutLookthrough) {
            this._topDownWithoutLookthrough = data.topDownWithoutLookthrough;
        }
    }

    private deserializeMultiManagerAttribution(data: any) {
        if (data.multiManagerAttribution) {
            this._multiManagerAttribution = data.multiManagerAttribution;
        }
    }

    private deserializeFactors(data: any) {
        if (data.factors) {
            this._factors = data.factors;
        }
    }

    private deserializeAttributionCalculatorMethod(data: any) {
        if (data.attributionCalculatorMethod) {
            if (data.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.DXS || data.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.SPREAD_DURATION) {
                this._attributionCalculatorMethod = PerformanceConstants.CALCULATION_METHOD.HYBRID;
            } else if (data.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.COMPARISON) {
                this._attributionCalculatorMethod = PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY;
            } else {
                this._attributionCalculatorMethod = data.attributionCalculatorMethod;
            }

        }
    }

    private deserializeExposureMode(data: any) {
        if (data.exposureMode) {
            this._exposureMode = data.exposureMode;
        }
    }

    private deserializeSectorLevel(data: any) {
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_SUPPRESS_ATTRIB_SETTINGS) &&
            data.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.HYBRID) {
            return;
        }

        if (data.sectorLevel && data.attributionCalculatorMethod !== PerformanceConstants.CALCULATION_METHOD.BHB) {
            if (data.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.DXS || data.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.SPREAD_DURATION) {
                this._sectorLevel = PerformanceConstants.CALCULATION_LEVEL.IMMEDIATE_PARENT_LEVEL;
            } else if (data.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.COMPARISON) {
                this._sectorLevel = PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL;
            } else {
                this._sectorLevel = data.sectorLevel;
            }
        }
    }

    private deserializeSectorWeighting(data: any) {
        if (data.sectorWeighting) {
            this._sectorWeighting = data.sectorWeighting;
        }
    }

    private deserializeAssetType(data: any) {
        if (data.assetType) {
            this._assetType = data.assetType;
        }
    }

    private deserializeCannedMethod(data: any) {
        if (data.cannedMethod) {
            this._cannedMethod =
                data.cannedMethod === PerformanceConstants.ENHANCED_BRINSON_CANNED_METHOD_OLD
                    ? PerformanceConstants.ENHANCED_BRINSON_CANNED_METHOD
                    : data.cannedMethod;
        }
    }

    /**
     * Returns true if any setting has been overridden
     */
    checkSettings(): boolean {
        if (this.cannedMethod !== PerformanceConstants.CUSTOM_ATTRIBUTION_METHODOLOGY) {
            return this.checkSetting('cannedMethod') ||
                this.checkSetting('sectorWeighting') ||
                this.checkSetting('attributionCalculatorMethod') ||
                this.checkSetting('sectorLevel') ||
                this.checkSetting('exposureMode') ||
                this.checkSetting('factors');
        } else {
            return (
                this.checkSetting('cannedMethod') ||
                this.checkSetting('multiManagerAttribution') ||
                this.checkSetting('sectorWeighting') ||
                this.checkSetting('attributionCalculatorMethod') ||
                this.checkSetting('sectorLevel') ||
                this.checkSetting('exposureMode') ||
                this.checkSetting('assetType') ||
                this.checkSetting('factors') ||
                this.checkSetting('topDownWithoutLookthrough')
            );
        }
    }

    /**
     * Return true is the passed in setting has been overridden
     */
    checkSetting(settingName: string): boolean {
        const setting = '_' + settingName;
        if (isUndefined(this[setting])) {
            return false;
        }
        if (settingName === 'factors') {
            return this.checkFactors();
        }
        return this[setting] !== this.parentAttributionSettings?.[settingName];
    }

    /**
     * Return true is the passed in factors have been overridden
     */
    checkFactors(): boolean {
        return this.checkPassedInFactors(this._factors);
    }

    /**
     * Return true if the passed in factors have been overridden
     */
    checkPassedInFactors(value: string[]) {
        if ((value && !this.parentAttributionSettings.factors) || (!value && this.parentAttributionSettings.factors)) {
            return true;
        }
        if (value.length !== this.parentAttributionSettings.factors.length) {
            return true;
        }
        const self = this;
        let result = false;
        each(value, function (factor: string) {
            if (self.parentAttributionSettings.factors.indexOf(factor) === -1) {
                result = true;
            }
        });
        return result;
    }

    /**
     * Create copy for the AttributionSettings object
     */
    resetSettings() {
        this._multiManagerAttribution = undefined;
        this._topDownWithoutLookthrough = undefined;
        this._bottomsUpWithLookthrough = undefined;
        this._cannedMethod = undefined;
        this._sectorWeighting = undefined;
        this._attributionCalculatorMethod = undefined;
        this._sectorLevel = undefined;
        this._exposureMode = undefined;
        this._assetType = undefined;
        this._factors = undefined;
        this._excessFlagMap = undefined;
    }

    /**
     * Method to extract params for the request
     */
    addRequestData(optionValues: any): void {
        const cannedMethod = this.cannedMethod === PerformanceConstants.CANNED_METHOD.DEFAULT ? PerformanceConstants.CANNED_METHOD.CUSTOM : this.cannedMethod;
        optionValues[PerformanceConstants.ATTRIBUTION_METHOD] = cannedMethod;
        optionValues[PerformanceConstants.SECTOR_WEIGHTING] = this.sectorWeighting;
        optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD] = this.attributionCalculatorMethod;
        optionValues[PerformanceConstants.SECTOR_LEVEL] = this.sectorLevel;
        optionValues[PerformanceConstants.EXPOSURE_MODE] = this.exposureMode;
        if (cannedMethod === PerformanceConstants.CANNED_METHOD.CUSTOM) {
            optionValues[PerformanceConstants.FACTORS] = this.factors;
        }
        optionValues[PerformanceConstants.ASSET_TYPE] = this.assetType;
        if (this.assetType === AssetType.MULTI_ASSET) {
            const topDownWithoutLookThrough = this.getLookThroughValue(PerformanceConstants.LOOK_THROUGH_SETTINGS.TOP_DOWN_WITHOUT_LOOK_THROUGH);
            const bottomsUpWithLookThrough = this.getLookThroughValue(PerformanceConstants.LOOK_THROUGH_SETTINGS.BOTTOMS_UP_WITH_LOOK_THROUGH);
            if (topDownWithoutLookThrough) {
                optionValues[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH] = topDownWithoutLookThrough;
            } else if (bottomsUpWithLookThrough) {
                optionValues[PerformanceConstants.IS_BOTTOMS_UP_WITH_LOOKTHROUGH] = bottomsUpWithLookThrough;
            }
        }
        if (this.multiManagerAttribution) {
            optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION] = this.multiManagerAttribution;
        }
    }

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public createModelLegacy(optionValues: any): AttributionSettings {
        this.cannedMethod = optionValues[PerformanceConstants.ATTRIBUTION_METHOD];

        if (this.cannedMethod === PerformanceConstants.CUSTOM_ATTRIBUTION_METHODOLOGY) {
            this.factors = optionValues[PerformanceConstants.FACTORS];
            this.sectorLevel = optionValues[PerformanceConstants.SECTOR_LEVEL];
            this.sectorWeighting = optionValues[PerformanceConstants.SECTOR_WEIGHTING];
            this.attributionCalculatorMethod = optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD];

            if (optionValues[PerformanceConstants.ASSET_TYPE]) {
                this.assetType = optionValues[PerformanceConstants.ASSET_TYPE];
                delete optionValues[PerformanceConstants.ASSET_TYPE];
            }

            // delete existing option values
            delete optionValues[PerformanceConstants.FACTORS];
            delete optionValues[PerformanceConstants.SECTOR_LEVEL];
            delete optionValues[PerformanceConstants.SECTOR_WEIGHTING];
            delete optionValues[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD];
        }

        if (optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION]) {
            this.multiManagerAttribution = optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION];
            delete optionValues[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION];
        }

        delete optionValues[PerformanceConstants.ATTRIBUTION_METHOD];

        return this;
    }

    /**
     * if we are changing a setting at this level and there is custom canned method defined at parent and no canned method defined at this level..
     * we need to define the canned method at this level to indicate that it is overridden
     */
    overrideAsCustomIfCustomSettingHasChanged() {
        if (this.cannedMethod === PerformanceConstants.CUSTOM_ATTRIBUTION_METHODOLOGY && !this._cannedMethod) {
            this._cannedMethod = this.cannedMethod;
        }
    }

    /**
     * Returns true if _cannedMethod is set
     */
    isSettingDefinedAtThisLevel(): boolean {
        return !(isUndefined(this._cannedMethod));
    }

    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * getting the telemetry trackable properties
     */
    getTrackableProperties(): any {
        return {
            assetType: this.assetType,
            attributionModel: this.cannedMethod,
            sectorWeighting: this.sectorWeighting,
            attributionCalculatorMethod: this.attributionCalculatorMethod,
            sectorLevel: this.sectorLevel,
            exposureMode: this.exposureMode,
            excessFactors: !this.excessFlagMap ? [] : Array.from(this.excessFlagMap.entries())
                .filter(([_key, value]) => !value)
                .map(([key]) => key)
                .join(','),
            startsAtDefault: !this.checkSettings()
        };
    }

    doesValueExist(key: string): boolean {
        // We have to check the property directly. The logic for getting the value from the parent is embedded in the getter,
        // so cannot do this[key] since that will always return the value.
        return !isNil(this['_' + key]);
    }

    getValue(key: string): boolean {
        // We have to check the property directly. The logic for getting the value from the parent is embedded in the getter,
        // so cannot do this[key] since that will always return the value.
        return this['_' + key];
    }

    getLookThroughValue(key: string): boolean {
        const isLookThroughSetOnSelf = this.doesValueExist(PerformanceConstants.LOOK_THROUGH_SETTINGS.TOP_DOWN_WITHOUT_LOOK_THROUGH) || this.doesValueExist(PerformanceConstants.LOOK_THROUGH_SETTINGS.BOTTOMS_UP_WITH_LOOK_THROUGH);
        return isLookThroughSetOnSelf ? this.getValue(key) : this[key];
    }
}
