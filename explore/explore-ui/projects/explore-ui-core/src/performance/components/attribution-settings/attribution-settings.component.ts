import {ChangeDetectorRef, Component, Inject, Input, OnChanges, OnInit, Optional} from '@angular/core';
import {
    AuxAdvancedTreeListInterface,
    AuxButtonTypeEnum,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTargetAtrEnum
} from '@blk/aladdin-angular-components';
import {find, isNil, isUndefined} from 'lodash';
import {ColumnConfig} from '../../../column/models/column-config/column-config.model';
import {CoreDefinitionStore} from '../../../definition/core-definition.store';
import {GenericColumnDefinition} from '../../../definition/models/generic-column-definition.model';
import {PraadaAttributionCalculatorMethod} from '../../../definition/models/praada-meta-data/praada-attribution-calculator-method.model';
import {PraadaCannedAttributionMethod} from '../../../definition/models/praada-meta-data/praada-canned-attribution-method.model';
import {PraadaFactor} from '../../../definition/models/praada-meta-data/praada-factor.model';
import {PraadaSectorWeighting} from '../../../definition/models/praada-meta-data/praada-sector-weighting.model';
import {ExploreSelectOptionGroup} from '../../../ui/models/explore-select-option-group.model';
import {ExploreSelectOption} from '../../../ui/models/explore-select-option.model';
import {NotificationServiceInterface} from '../../../ui/service-interfaces/notification-service.interface';
import {NOTIFICATION_SERVICE_TOKEN} from '../../../ui/tokens';
import {AssetType} from '../../asset-type.enum';
import {AttributionSettings} from '../../models/attribution-settings/attribution-settings.model';
import {PerformanceConstants} from '../../performance.constants';
import {PerformanceAttributionSettingsServiceInterface} from '../../service-interfaces/performance-attribution-settings-service.interface';
import {PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN} from '../../tokens';
import {BehaviorSubject} from 'rxjs';
import {CoreCommonConstants, CoreUrlConstants} from '../../../core/constants';
import {ExploreDialogParam} from '../../../ui/models/explore-dialog-param.model';
import {AlertConstants} from '../../../ui/constants/alert.constants';
import {TelemetryGenericEventParameters} from '../../../telemetry/generic-event';
import {TokenUtils} from '../../../definition/token/token.utils';
import {TokenConstants} from '../../../definition/token/token.constants';
import {CommonUtils} from '../../../core/utils';

/**
 * Component for the attribution settings control for returns data
 */
@Component({
    selector: 'explore-core-attribution-settings',
    templateUrl: './attribution-settings.component.html',
    styleUrls: ['./attribution-settings.component.scss']
})
export class AttributionSettingsComponent implements OnInit, OnChanges {

    constructor(
        @Inject(PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN) private performanceAttributionSettingsService: PerformanceAttributionSettingsServiceInterface,
        @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) private notificationService: NotificationServiceInterface,
        private changeDetectorRef: ChangeDetectorRef) {
    }
    /**
     * columns exist on widget level ONLY
     */
    @Input() columns: ColumnConfig[];

    @Input() attributionSettings: AttributionSettings;
    @Input() showExposureMode: boolean;
    @Input() showOtherSettings: boolean;
    @Input() isColumnUpdateEnabled: boolean;
    @Input() isApplyButtonDisabled: any;
    @Input() isOpenModal: boolean;
    @Input() telemetryData?: TelemetryGenericEventParameters;
    factorWindowTabLabel: string;
    sectorWeightings: PraadaSectorWeighting[];
    attributionCalculatorMethods: PraadaAttributionCalculatorMethod[];
    sectorLevels: GenericColumnDefinition[];
    exposureModes: GenericColumnDefinition[];
    allFactorColumns: string[];
    selectedFactors: AuxAdvancedTreeListInterface[] = [];
    availablePraadaCannedAttributionMethods: any[];
    multiAssetCannedAttributionMethod: any[] = [];
    displayAssetTypes: ExploreSelectOptionGroup[];
    attributionMethodData: ExploreSelectOptionGroup[];
    accountingFactors: PraadaFactor[] = [];
    parametricFactors: PraadaFactor[] = [];
    tradeBasedFactors: PraadaFactor[] = [];
    availableAttributionMethods: ExploreSelectOptionGroup[];
    sectorWeightingsData: ExploreSelectOptionGroup[] = [new ExploreSelectOptionGroup()];
    exposureModeData: ExploreSelectOptionGroup[] = [new ExploreSelectOptionGroup()];
    sectorLevelData: ExploreSelectOptionGroup[] = [new ExploreSelectOptionGroup()];
    attributionCalculatorMethodsData: ExploreSelectOptionGroup[] = [new ExploreSelectOptionGroup()];
    showFactors: boolean;
    allFactors: PraadaFactor[] = [];
    promptDialog$ = new BehaviorSubject<ExploreDialogParam>(null);
    previousAssetType: string;
    previousAttributionModel: string;
    previousAttributionMethod: string;
    resetExcessFlagMap: boolean;
    attributionSettingsLink = CommonUtils.getApplicationUrl(CoreUrlConstants.ATTRIBUTION_SETTINGS);

    private readonly CANNED_METHOD_CUSTOM = 'CUSTOM';

    protected readonly PerformanceConstants = PerformanceConstants;
    protected readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    protected readonly AuxTargetAtrEnum = AuxTargetAtrEnum;

    /**
     * Initializes the component controller
     */
    ngOnInit() {
        if (isUndefined(this.attributionSettings.multiManagerAttribution)) {
            this.attributionSettings.multiManagerAttribution = false;
        }

        if (isUndefined(this.showExposureMode)) {
            this.showExposureMode = true;
        }

        if (isUndefined(this.showOtherSettings)) {
            this.showOtherSettings = true;
        }

        // Initialize all available factors
        this.initializeAllFactorColumns();
        // Initialize all available sector weightings (exposure modes)
        this.sectorWeightings = CoreDefinitionStore.sectorWeightings;
        // Initialize all available attribution calculator methods
        this.attributionCalculatorMethods = CoreDefinitionStore.attributionCalculatorMethods;
        // Initialize all available sector levels
        this.sectorLevels = CoreDefinitionStore.sectorLevels;
        // Initialize all exposure modes
        this.exposureModes = CoreDefinitionStore.exposureModes;

        this.factorWindowTabLabel = PerformanceConstants.HOLDING_BASED_RETURN;

        // Set asset type
        this.performanceAttributionSettingsService.setAssetType(this.attributionSettings);
        this.initializeDisplayAssetTypes();

        // Set available attribution methods for the asset type set
        this.setAvailableAttributionMethodsForAssetType();

        // Set canned method if not already set
        if (!this.attributionSettings.cannedMethod) {
            this.resetCannedMethod();
        } else {
            // Set all other settings from the canned method chosen
            this.setOtherSettingsFromCannedSetting(false);
            this.initializeAvailableAttributionMethod();
        }

        this.accountingFactors = CoreDefinitionStore.accountingFactors;
        this.parametricFactors = CoreDefinitionStore.attributionFactors;
        this.tradeBasedFactors = CoreDefinitionStore.tradeBasedFactors;

        // Initialize attribution calculator method for display
        this.initializeAttributionCalculatorMethodsData();

        this.showFactors = true;
        this.allFactors = this.accountingFactors.concat(this.parametricFactors, this.tradeBasedFactors);
        this.resetExcessFlagMap = false;
    }

    /**
     * Detects changes in the input properties
     */
    ngOnChanges() {
        this.showFactors = this.showSelectedItemBox();
    }

    /**
     * Initialize display values for asset types
     */
    initializeDisplayAssetTypes(): void {
        const values: string[] = [];
        const labels: string[] = [];

        PerformanceConstants.AVAILABLE_ASSET_TYPES.forEach( item => {
            values.push(item.value);
            labels.push(item.label);
        });

        this.displayAssetTypes = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(
            values,
            labels,
            this.attributionSettings.assetType
        );
    }

    /**
     * Initializes attribution Method data for display
     */
    initializeAttributionMethodData(): void {
        this.attributionMethodData = [new ExploreSelectOptionGroup()];
        let isAllocationManagerMethod = false;
        if (this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE) {
            this.attributionSettings.topDownWithoutLookthrough = true;
            isAllocationManagerMethod = true;
        }
        this.attributionMethodData[0].values.push(new ExploreSelectOption(PerformanceConstants.CANNED_METHOD.DEFAULT, PerformanceConstants.CANNED_METHOD.DEFAULT, this.isDefaultLookThroughSelected(),
            isAllocationManagerMethod));
        const multiAssetOptions = this.multiAssetCannedAttributionMethod.map(item => new ExploreSelectOption(item.label, item.value, this.isTopDownOrBottomUpLookthroughSelected(item.value),
            isAllocationManagerMethod && item.value !== PerformanceConstants.CANNED_METHOD.MULTI_ASSET));
        this.attributionMethodData[0].values.push(...multiAssetOptions);
    }

    /**
     * Check if the attribution settings are for top down or bottom up lookthrough
     */
    isTopDownOrBottomUpLookthroughSelected(value: string): boolean {
        return (value === PerformanceConstants.CANNED_METHOD.EB_MULTI_ASSET_xFXMTE && this.attributionSettings.getLookThroughValue(PerformanceConstants.LOOK_THROUGH_SETTINGS.BOTTOMS_UP_WITH_LOOK_THROUGH))
            || (value === PerformanceConstants.CANNED_METHOD.MULTI_ASSET && this.attributionSettings.getLookThroughValue(PerformanceConstants.LOOK_THROUGH_SETTINGS.TOP_DOWN_WITHOUT_LOOK_THROUGH));
    }

    /**
     * Set display data for select box
     */
    setDisplayDataForSelectBox(items: any, setting): ExploreSelectOption[] {
        return items.map(item => new ExploreSelectOption(item.label, item.value, item.value === setting));
    }

    /**
     * Sets attribution Calculator Method Data
     */
    initializeAttributionCalculatorMethodsData() {
        this.attributionCalculatorMethodsData = [new ExploreSelectOptionGroup()];

        const applicableAttributionCalculatorMethodsData = this.attributionCalculatorMethods.filter(calculatorMethod => this.isAttributionCalculatorMethodSupported(calculatorMethod.value)).map(calculatorMethod => calculatorMethod.value);
        this.attributionSettings.attributionCalculatorMethod = applicableAttributionCalculatorMethodsData && applicableAttributionCalculatorMethodsData.indexOf(this.attributionSettings.attributionCalculatorMethod) > -1 ? this.attributionSettings.attributionCalculatorMethod : applicableAttributionCalculatorMethodsData[0];

        for (const attributionCalculatorMethod of this.attributionCalculatorMethods) {
            if (this.isCalculationMethodToBeShownInList(attributionCalculatorMethod)) {
                this.attributionCalculatorMethodsData[0].values.push(new ExploreSelectOption(attributionCalculatorMethod.label, attributionCalculatorMethod.value,
                    attributionCalculatorMethod.value === this.attributionSettings.attributionCalculatorMethod, applicableAttributionCalculatorMethodsData.indexOf(attributionCalculatorMethod.value) < 0));
            }
        }
        this.attributionCalculatorMethodsData = this.attributionCalculatorMethodsData.map(data => data);
    }

    /**
     * Sets sector weighting Data
     */
    initializeSectorWeightingData() {
        this.sectorWeightingsData = [new ExploreSelectOptionGroup()];

        const applicableSectorWeightings = this.sectorWeightings.filter(sectorWeighting => this.isSectorWeightingSupported(sectorWeighting.value)).map(sectorWeighting => sectorWeighting.value);
        this.attributionSettings.sectorWeighting = applicableSectorWeightings && applicableSectorWeightings.indexOf(this.attributionSettings.sectorWeighting) > -1 ? this.attributionSettings.sectorWeighting : applicableSectorWeightings[0];

        for (const sectorWeighting of this.sectorWeightings) {
            this.sectorWeightingsData[0].values.push(new ExploreSelectOption(sectorWeighting.label, sectorWeighting.value,
                sectorWeighting.value === this.attributionSettings.sectorWeighting, applicableSectorWeightings.indexOf(sectorWeighting.value) < 0));
        }
        this.sectorWeightingsData = this.sectorWeightingsData.map(data => data);
    }

    /**
     * Sets initializeSectorLevelData
     */
    initializeSectorLevelData() {
        this.sectorLevelData = [new ExploreSelectOptionGroup()];

        const attributionCalculatorMethod = find(this.attributionCalculatorMethods, {value: this.attributionSettings.attributionCalculatorMethod});
        const sectorLevels: string[] = attributionCalculatorMethod.sectorLevels;

        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_SUPPRESS_ATTRIB_SETTINGS) && this.isCustomSettings()) {
            for (const sectorLevel of this.sectorLevels) {
                this.sectorLevelData[0].values.push(new ExploreSelectOption(sectorLevel.label, sectorLevel.value,
                    sectorLevel.value === this.attributionSettings.sectorLevel, false));
            }
            this.sectorLevelData = this.sectorLevelData.map(data => data);
        } else if (isNil(sectorLevels)) {
            this.sectorLevelData = [];
        } else {
            this.attributionSettings.sectorLevel = sectorLevels && sectorLevels.indexOf(this.attributionSettings.sectorLevel) > -1 ? this.attributionSettings.sectorLevel : sectorLevels[0];

            for (const sectorLevel of this.sectorLevels) {
                this.sectorLevelData[0].values.push(new ExploreSelectOption(sectorLevel.label, sectorLevel.value,
                    sectorLevel.value === this.attributionSettings.sectorLevel, sectorLevels.indexOf(sectorLevel.value) < 0));
            }
            this.sectorLevelData = this.sectorLevelData.map(data => data);
        }
    }

    /**
     * Initialize canned attribution methods for display
     */
    initializeAvailableAttributionMethod() {
        this.availableAttributionMethods = [new ExploreSelectOptionGroup()];
        if (this.attributionSettings.assetType === AssetType.MULTI_ASSET) {
            this.availableAttributionMethods[0].values.push(new ExploreSelectOption(PerformanceConstants.MULTI_MANAGER_ATTRIBUTION_LABEL,
                PerformanceConstants.CANNED_METHOD.MULTI_ASSET, this.attributionSettings.multiManagerAttribution && this.attributionSettings.cannedMethod !== PerformanceConstants.CANNED_METHOD.CUSTOM));
        }
        for (const availablePraadaCannedAttributionMethod of this.availablePraadaCannedAttributionMethods) {
            this.availableAttributionMethods[0].values.push(new ExploreSelectOption(availablePraadaCannedAttributionMethod.label.replace(' Attribution', CoreCommonConstants.EMPTY_STRING),
                availablePraadaCannedAttributionMethod.value, availablePraadaCannedAttributionMethod.value === this.attributionSettings.cannedMethod));
        }

        this.availableAttributionMethods[0].values.push(new ExploreSelectOption('Custom', PerformanceConstants.CANNED_METHOD.CUSTOM, this.isCustomSettings()));
    }

    /**
     * sets exposure mode
     */
    onExposureModeChange(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.attributionSettings.exposureMode = (ev.detail.value as AuxSelectOption).value;
    }

    /**
     * Gets executed when calculator method selection is changed
     */
    onCalculatorMethodChange(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        const attributionCalculatorMethodValue = (ev.detail.value as AuxSelectOption).value;
        if (this.attributionSettings.attributionCalculatorMethod === attributionCalculatorMethodValue) {
            return;
        }
        this.attributionSettings.attributionCalculatorMethod = attributionCalculatorMethodValue;
        this.onAttributionCalculatorMethodChange();
    }

    onAvailableAttributionModelChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const cannedMethod = (ev.detail.value as AuxSelectOption).value;
        const tabName = (ev.detail.value as AuxSelectOption).displayValue;

        this.previousAttributionModel = this.attributionSettings.cannedMethod;
        if (this.CANNED_METHOD_CUSTOM === this.attributionSettings.cannedMethod && this.CANNED_METHOD_CUSTOM !== cannedMethod) {
            this.promptDialog$.next(
                new ExploreDialogParam(
                    AlertConstants.TYPE.PROMPT,
                    AlertConstants.HEADER.CHANGES_NOT_SAVED,
                    AlertConstants.BODY.ATTRIB_METHODOLOGY_CHANGED,
                    AlertConstants.BTN.LOSE_CHANGES,
                    AlertConstants.BTN.CANCEL,
                    () => {
                        this.resetLookThroughOnCurrentSettings();
                        this.setParametersOnAttributionModelChange(tabName, cannedMethod);
                    },
                    () => {
                        this.initializeAvailableAttributionMethod();
                    }
                ));
        } else {
            this.resetLookThroughOnCurrentSettings();
            this.setParametersOnAttributionModelChange(tabName, cannedMethod);
        }
    }

    private setParametersOnAttributionModelChange(tabName: string, cannedMethod: string) {
        if (tabName === PerformanceConstants.MULTI_MANAGER_ATTRIBUTION_LABEL) {
            this.setMultiManagerAttribution(true);
            this.setDefaultMultiManagerSelection();
            this.initializeAttributionMethodData();
        } else {
            this.attributionSettings.cannedMethod = cannedMethod;
            this.updateCannedMethodOnSectorChange();
            this.setOtherSettingsFromCannedSetting(true);
            this.setMultiManagerAttribution(false);
        }
    }

    /**
     * When assetType is changed
     */
    onAssetClassChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        const assetType = (ev.detail.value as AuxSelectOption).value;
        this.previousAssetType = this.attributionSettings.assetType;

        if (this.CANNED_METHOD_CUSTOM === this.attributionSettings.cannedMethod) {
            this.promptDialog$.next(
                new ExploreDialogParam(
                    AlertConstants.TYPE.PROMPT,
                    AlertConstants.HEADER.CHANGES_NOT_SAVED,
                    AlertConstants.BODY.ATTRIB_METHODOLOGY_CHANGED,
                    AlertConstants.BTN.LOSE_CHANGES,
                    AlertConstants.BTN.CANCEL,
                    () => {
                        this.setParametersOnAssetClassChange(assetType);
                    },
                    () => {
                        this.attributionSettings.assetType = this.previousAssetType;
                        this.initializeDisplayAssetTypes();
                    }
                ));
        } else {
            this.setParametersOnAssetClassChange(assetType);
        }
    }

    private setParametersOnAssetClassChange(assetType: string) {
        this.attributionSettings.assetType = assetType;
        this.setAvailableAttributionMethodsForAssetType();
        this.resetCannedMethod();
    }

    /**
     * Reset canned attribution method to the first one available on changing the asset type
     */
    resetCannedMethod() {
        this.attributionSettings.cannedMethod = this.availablePraadaCannedAttributionMethods[0]?.value;
        this.initializeAvailableAttributionMethod();
        this.setMultiManagerAttribution(false);
        // Initialize factors for the new canned method set
        this.setOtherSettingsFromCannedSetting(true);
    }

    /**
     * Open a new modal which has the factors which can be selected to be added to the list of target excess factors
     */
    onClickOpenModal(): void {
        this.isOpenModal = true;
    }

    closeModal() {
        this.isOpenModal = false;
    }

    /**
     * Set list of available methods for asset type chosen
     */
    setAvailableAttributionMethodsForAssetType(): void {
        this.availablePraadaCannedAttributionMethods = [];
        this.multiAssetCannedAttributionMethod = [];

        let hybridCreditAttributionSettingToBeAdded = false;
        let relativeCreditAttributionSettingToBeAdded = false;
        let indexToAddHybridSettingAt;
        let indexToAddRelativeSettingAt;
        CoreDefinitionStore.praadaCannedAttributionMethods.forEach(cannedAttributionMethod => {
            // Need to filter out the attribution methods whose asset type doesn't match the attribution settings asset type chosen..
            // But we also need to include Custom always which doesn't have any asset type. The first check is to include that
            if (!cannedAttributionMethod.assetClass || cannedAttributionMethod.assetClass === this.attributionSettings.assetType) {
                const praadaCannedAttributionMethod = {
                    label: cannedAttributionMethod.label,
                    value: cannedAttributionMethod.name,
                    factors: cannedAttributionMethod.excessMethodologies[0].factors
                };
                if (this.isHybridCreditAttributionSetting(praadaCannedAttributionMethod.value)) {
                    hybridCreditAttributionSettingToBeAdded = true;
                    if (!indexToAddHybridSettingAt) {
                        indexToAddHybridSettingAt = this.availablePraadaCannedAttributionMethods.length;
                    }
                    return;
                }

                if (this.isRelativeCreditAttributionSetting(praadaCannedAttributionMethod.value)) {
                    relativeCreditAttributionSettingToBeAdded = true;
                    if (!indexToAddRelativeSettingAt) {
                        indexToAddRelativeSettingAt = this.availablePraadaCannedAttributionMethods.length;
                    }
                    return;
                }

                if (cannedAttributionMethod.name === PerformanceConstants.CANNED_METHOD.MULTI_ASSET || cannedAttributionMethod.name === PerformanceConstants.CANNED_METHOD.EB_MULTI_ASSET_xFXMTE) {
                    this.multiAssetCannedAttributionMethod.push(praadaCannedAttributionMethod);
                } else {
                    this.availablePraadaCannedAttributionMethods.push(praadaCannedAttributionMethod);
                }
            }
        });

        if (hybridCreditAttributionSettingToBeAdded) {
            this.availablePraadaCannedAttributionMethods.splice(indexToAddHybridSettingAt, 0, this.getCombinedCreditAttributionSetting(false));
        }
        if (relativeCreditAttributionSettingToBeAdded) {
            this.availablePraadaCannedAttributionMethods.splice(indexToAddRelativeSettingAt, 0, this.getCombinedCreditAttributionSetting(true, this.attributionSettings.sectorLevel === PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL));
        }
        if (this.multiAssetCannedAttributionMethod.length > 0) {
            this.initializeAttributionMethodData();
        }
    }

    /**
     * Dxs Credit Attribution and Spread duration Credit Attribution are two predefined Fixed income attribution settings which we want to expose as one option of Hybrid credit attribution with choice of sector weightings as that is the only difference in the two attribution settings
     * Similarly, Relative Scaled Dxs Credit Attribution and Relative Scaled Spread Duration Credit attribution also need to be clubbed and shown as 1
     */
    getCombinedCreditAttributionSetting(isRelativeSetting: boolean, isBenchTotalRelative?: boolean) {
        const {dxsAttributionSetting, spreadDurationAttributionSetting, marketValueAttributionSetting} = this.getAttributionSettingsForDifferentLevels(isRelativeSetting, isBenchTotalRelative);

        let chosenAttributionSetting = dxsAttributionSetting;

        if (this.attributionSettings.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.SPREAD_DURATION) {
            chosenAttributionSetting = spreadDurationAttributionSetting;
        } else if (this.attributionSettings.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.MARKET_VALUE) {
            chosenAttributionSetting = marketValueAttributionSetting;
        }

        const combinedCreditAttributionSetting: any = {
            label: chosenAttributionSetting.label,
            factors: chosenAttributionSetting.excessMethodologies[0].factors
        };

        if ((isRelativeSetting && this.isRelativeCreditAttributionSetting(this.attributionSettings.cannedMethod)) || (!isRelativeSetting && this.isHybridCreditAttributionSetting(this.attributionSettings.cannedMethod))) {
            combinedCreditAttributionSetting.value = chosenAttributionSetting.name;
        } else {
            // Default to Dxs
            combinedCreditAttributionSetting.value = dxsAttributionSetting.name;
        }

        combinedCreditAttributionSetting.supportedSectorWeightings = [];
        combinedCreditAttributionSetting.supportedSectorWeightings.push(dxsAttributionSetting.attributionWeightType);
        combinedCreditAttributionSetting.supportedSectorWeightings.push(spreadDurationAttributionSetting.attributionWeightType);
        combinedCreditAttributionSetting.supportedSectorWeightings.push(marketValueAttributionSetting.attributionWeightType);
        combinedCreditAttributionSetting.sectorWeightingSettingMap = {};
        combinedCreditAttributionSetting.sectorWeightingSettingMap[dxsAttributionSetting.attributionWeightType] = dxsAttributionSetting.name;
        combinedCreditAttributionSetting.sectorWeightingSettingMap[spreadDurationAttributionSetting.attributionWeightType] = spreadDurationAttributionSetting.name;
        combinedCreditAttributionSetting.sectorWeightingSettingMap[marketValueAttributionSetting.attributionWeightType] = marketValueAttributionSetting.name;
        if (isRelativeSetting) {

            const spreadDurationTotalBenchAttributionSetting = find(CoreDefinitionStore.praadaCannedAttributionMethods, (setting: PraadaCannedAttributionMethod) => {
                return setting.name === PerformanceConstants.OAS_CHG_SPREAD_DURATION_BENCH_TOTAL;
            });

            const supportedSectorLevels: Set <string> = new Set<string>();
            supportedSectorLevels.add(dxsAttributionSetting.sectorLevel);
            supportedSectorLevels.add(spreadDurationTotalBenchAttributionSetting.sectorLevel);
            supportedSectorLevels.add(marketValueAttributionSetting.sectorLevel);

            combinedCreditAttributionSetting.supportedSectorLevel = Array.from(supportedSectorLevels);
        }
        return combinedCreditAttributionSetting;
    }

    private getAttributionSettingsForDifferentLevels(isRelativeSetting: boolean, isBenchTotalRelative: boolean) {
        const dxsAttributionSetting = find(CoreDefinitionStore.praadaCannedAttributionMethods, (setting: PraadaCannedAttributionMethod) => {
            let settingName: string;

            if (isRelativeSetting) {
                if (isBenchTotalRelative) {
                    settingName = PerformanceConstants.OAS_CHG_DXS_BENCH_TOTAL;
                } else {
                    settingName = PerformanceConstants.OAS_CHG_DXS;
                }
            } else {
                settingName = PerformanceConstants.FIXED_INCOME_DXS;
            }

            return setting.name === settingName;
        });

        const spreadDurationAttributionSetting = find(CoreDefinitionStore.praadaCannedAttributionMethods, (setting: PraadaCannedAttributionMethod) => {
            let settingName: string;

            if (isRelativeSetting) {
                if (isBenchTotalRelative) {
                    settingName = PerformanceConstants.OAS_CHG_SPREAD_DURATION_BENCH_TOTAL;
                } else {
                    settingName = PerformanceConstants.OAS_CHG_SPREAD_DURATION;
                }
            } else {
                settingName = PerformanceConstants.FIXED_INCOME_SPREAD_DURATION;
            }

            return setting.name === settingName;
        });

        const marketValueAttributionSetting = find(CoreDefinitionStore.praadaCannedAttributionMethods, (setting: PraadaCannedAttributionMethod) => {
            let settingName: string;

            if (isRelativeSetting) {
                if (isBenchTotalRelative) {
                    settingName = PerformanceConstants.OAS_CHG_MARKET_VALUE_BENCH_TOTAL;
                } else {
                    settingName = PerformanceConstants.OAS_CHG_MARKET_VALUE;
                }
            } else {
                settingName = PerformanceConstants.FIXED_INCOME_MARKET_VALUE;
            }

            return setting.name === settingName;
        });
        return {dxsAttributionSetting, spreadDurationAttributionSetting, marketValueAttributionSetting};
    }

    /**
     * Check if the current chosen attribution setting is one of the two settings that form the relative credit attribution setting
     */
    isRelativeCreditAttributionSetting(setting) {
        return PerformanceConstants.RELATIVE_CREDIT_ATTRIBUTION_CANNED_METHODS.includes(setting);
    }

    /**
     * Check if the current chosen attribution setting is one of the two settings that form the relative credit attribution setting
     */
    isBenchTotalSectorLevel(sectorLevel) {
        return sectorLevel === PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL;
    }

    /**
     * Check if the current chosen attribution setting is one of the four settings that form the hybrid and relative credit attribution setting
     */
    isCreditAttributionSetting(setting) {
        return this.isRelativeCreditAttributionSetting(setting) || this.isHybridCreditAttributionSetting(setting);
    }

    /**
     * Check if the current chosen attribution setting is one of the ewo settings that form the hybrid credit attribution setting
     */
    isHybridCreditAttributionSetting(setting) {
        return setting === PerformanceConstants.COMBINED_CANNED_METHODS.HYBRID_SETTING.FIXED_INCOME_SPREAD_DURATION ||
            setting === PerformanceConstants.COMBINED_CANNED_METHODS.HYBRID_SETTING.FIXED_INCOME_DXS ||
            setting === PerformanceConstants.COMBINED_CANNED_METHODS.HYBRID_SETTING.FIXED_INCOME_MARKET_VALUE;
    }

    /**
     * return the flag value of multi manager attribution.
     */
    isMultiManagerAttribution() {
        return this.attributionSettings.multiManagerAttribution && this.attributionSettings.multiManagerAttribution === true;
    }

    /**
     * sets the default value of multi manager selection.
     */
    setDefaultMultiManagerSelection() {
        if (this.attributionSettings.multiManagerAttribution === true && this.attributionSettings.cannedMethod !== PerformanceConstants.CANNED_METHOD.EB_MULTI_ASSET_xFXMTE) {
            this.attributionSettings.cannedMethod = PerformanceConstants.CANNED_METHOD.DEFAULT;
            this.setOtherSettingsFromCannedSetting(true);
        }
    }

    private resetLookThroughOnCurrentSettings(): void {
        if (this.attributionSettings.doesValueExist(PerformanceConstants.LOOK_THROUGH_SETTINGS.BOTTOMS_UP_WITH_LOOK_THROUGH)) {
            this.attributionSettings.bottomsUpWithLookthrough = undefined;
        }
        if (this.attributionSettings.doesValueExist(PerformanceConstants.LOOK_THROUGH_SETTINGS.TOP_DOWN_WITHOUT_LOOK_THROUGH)) {
            this.attributionSettings.topDownWithoutLookthrough = undefined;
        }
    }

    /**
     * Sets the multi manager attribution flag.
     */
    setMultiManagerAttribution(isMultiManager) {
        this.attributionSettings.multiManagerAttribution = isMultiManager;
    }

    /**
     * Returns true is canned method has been set as CUSTOM
     */
    isCustomSettings(): boolean {
        return this.attributionSettings.cannedMethod === this.CANNED_METHOD_CUSTOM;
    }

    private isDefaultLookThroughSelected(): boolean {
        return !this.attributionSettings.getLookThroughValue(PerformanceConstants.LOOK_THROUGH_SETTINGS.BOTTOMS_UP_WITH_LOOK_THROUGH) && !this.attributionSettings.getLookThroughValue(PerformanceConstants.LOOK_THROUGH_SETTINGS.TOP_DOWN_WITHOUT_LOOK_THROUGH);
    }

    onAttributionMethodChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const cannedMethodValue = (ev.detail.value as AuxSelectOption).value;

        this.previousAttributionMethod = this.attributionSettings.cannedMethod;

        const changedFromDefault = this.isDefaultLookThroughSelected() && cannedMethodValue !== PerformanceConstants.CANNED_METHOD.DEFAULT;

        if (cannedMethodValue !== this.previousAttributionMethod || changedFromDefault) {
            this.onAdditionalMultiAssetSettingsChanged(cannedMethodValue);
            if (this.previousAttributionMethod !== PerformanceConstants.CANNED_METHOD.CUSTOM) {
                this.attributionSettings.cannedMethod = cannedMethodValue;
            }
            this.setOtherSettingsFromCannedSetting(true);
            this.changeDetectorRef.markForCheck();
        } else {
            this.initializeAttributionMethodData();
        }
    }

    /**
     * Handler to update the multi asset option (Bottoms-Up / Top-Down)
     */
    onAdditionalMultiAssetSettingsChanged(multiAssetOption: string): void {
        // Reset Bottoms-Up and Top-Down to undefined initially (Default)
        this.attributionSettings.bottomsUpWithLookthrough = undefined;
        this.attributionSettings.topDownWithoutLookthrough = undefined;
        if (multiAssetOption === PerformanceConstants.CANNED_METHOD.EB_MULTI_ASSET_xFXMTE) {
            // Set Bottoms-Up With Lookthrough
            this.attributionSettings.bottomsUpWithLookthrough = true;
        } else if (multiAssetOption === PerformanceConstants.CANNED_METHOD.MULTI_ASSET) {
            // Set Top-Down Without Lookthrough
            this.attributionSettings.topDownWithoutLookthrough = true;
        }
    }

    /**
     * Initialize factors for the canned setting chosen
     */
    setOtherSettingsFromCannedSetting(resetFlag: boolean): void {
        // if the user switches between enhanced brinson and any other attribution settings, we need to check and re-enable the apply button.
        if (this.isApplyButtonDisabled && this.isApplyButtonDisabled.value === 1) {
            this.isApplyButtonDisabled.value--;
        }

        this.updateAdditionalSettings(resetFlag);
        if (this.isCustomSettings()) {
            this.attributionSettings.multiManagerAttribution = false;
        }
        this.initializeSectorWeightingData();
        // Initialize attribution calculator method for display
        this.initializeAttributionCalculatorMethodsData();
        this.initializeSectorLevelData();

        this.exposureModeData[0].values = this.setDisplayDataForSelectBox(this.exposureModes, this.attributionSettings.exposureMode);
        this.exposureModeData = this.exposureModeData.map(data => data);

        // in case of enhanced Brinson, add the item in the loading item list to disable the done button of widget settings.
        if (this.isEnhancedBrinson()) {
            if (this.isApplyButtonDisabled) {
                this.isApplyButtonDisabled.value++;
            }
            this.setEnhancedBrinsonColumn();
        } else {
            this.updateColumnsList();
        }
    }

    /**
     * Update the additional settings if the canned method is changed
     * @param resetFlag
     * @private
     */
    private updateAdditionalSettings(resetFlag: boolean) {
        if (!this.isCustomSettings()) {
            // Get the full blown praada canned attribution method from the key value
            const chosenPraadaCannedAttributionMethod = CoreDefinitionStore.praadaCannedAttributionMethods.filter(attributionMethod => this.attributionSettings.cannedMethod === attributionMethod.name)[0];

            if (chosenPraadaCannedAttributionMethod) {
                this.attributionSettings.factors = chosenPraadaCannedAttributionMethod.excessMethodologies[0].factors;
                this.attributionSettings.setLocalExcessFlagMap(new Map<string, boolean>);

                if (resetFlag) {
                    this.updateAdditionalSettingsBasedOnAttributionMethod(chosenPraadaCannedAttributionMethod);
                }
            }
        } else if (!this.attributionSettings.factors) {
            this.attributionSettings.factors = [];
        }
    }

    /**
     * Update the additional settings based on the canned method chosen
     * @param chosenPraadaCannedAttributionMethod
     * @private
     */
    private updateAdditionalSettingsBasedOnAttributionMethod(chosenPraadaCannedAttributionMethod: PraadaCannedAttributionMethod) {
        // Set sector weighting (exposure mode)
        if (!this.attributionSettings.sectorWeighting || this.attributionSettings.sectorWeighting !== chosenPraadaCannedAttributionMethod.attributionWeightType) {
            this.attributionSettings.sectorWeighting = chosenPraadaCannedAttributionMethod.attributionWeightType;
        }

        // Set attribution calculator method
        if (!this.attributionSettings.attributionCalculatorMethod || this.attributionSettings.attributionCalculatorMethod !== chosenPraadaCannedAttributionMethod.attributionCalculatorMethod) {
            this.attributionSettings.attributionCalculatorMethod = chosenPraadaCannedAttributionMethod.attributionCalculatorMethod;
        }

        // Set sector Level
        if (!this.attributionSettings.sectorLevel || this.attributionSettings.sectorLevel !== chosenPraadaCannedAttributionMethod.sectorLevel) {
            this.attributionSettings.sectorLevel = chosenPraadaCannedAttributionMethod.sectorLevel;
        }

        // Set exposure mode
        if (!this.attributionSettings.exposureMode || this.attributionSettings.exposureMode !== chosenPraadaCannedAttributionMethod.notionalMode) {
            this.attributionSettings.exposureMode = chosenPraadaCannedAttributionMethod.notionalMode;
        }
    }

    /**
     * Return false if current calculation method is not valid
     */
    isCalculationMethodToBeShownInList(setting) {
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_SUPPRESS_ATTRIB_SETTINGS) && this.isCustomSettings()) {
            return true;
        }
        if (this.attributionSettings.assetType !== AssetType.FI_MANDATE && setting === PerformanceConstants.CALCULATION_METHOD.HYBRID &&
            (this.attributionSettings.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.SPREAD_DURATION || this.attributionSettings.sectorWeighting === PerformanceConstants.WEIGHT_TYPE.DXS)) {
            return false;
        }
        if (this.attributionSettings.assetType !== AssetType.MULTI_ASSET && setting === PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE) {
            return false;
        }
        if (this.attributionSettings.assetType !== AssetType.EQUITY && setting === PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY) {
            return false;
        }
        return true;
    }

    /**
     * Returns the box name.
     */
    getSelectedItemsBoxName() {
        return this.attributionSettings.assetType === AssetType.FI_MANDATE ? 'Excess Factors' : 'Included in brinson terms';
    }

    /**
     * Method to reset settings to parent
     */
    resetSettings() {
        this.attributionSettings.multiManagerAttribution = undefined;
        this.attributionSettings.resetSettings();
        if (this.isCustomSettings()) {
            this.resetExcessFlagMap = true;
            // Update on UI
            this.exposureModeData[0].values = this.setDisplayDataForSelectBox(this.exposureModes, this.attributionSettings.exposureMode);
            this.exposureModeData = this.exposureModeData.map(data => data);

            this.attributionCalculatorMethodsData[0].values = this.setDisplayDataForSelectBox(this.attributionCalculatorMethods, this.attributionSettings.attributionCalculatorMethod);
            this.attributionCalculatorMethodsData = this.attributionCalculatorMethodsData.map(data => data);
        }
        // Set asset type
        this.performanceAttributionSettingsService.setAssetType(this.attributionSettings);
        this.initializeDisplayAssetTypes();

        // Set available attribution methods for the asset type set
        this.setAvailableAttributionMethodsForAssetType();
        // initialize the available attribution methods
        this.initializeAvailableAttributionMethod();
        // Set all other settings from the canned method chosen
        this.setOtherSettingsFromCannedSetting(true);
    }

    /**
     * Validates if a calculation method is valid as per the sector weighting chosen
     */
    isCalculationMethodValid(attributionCalculatorMethod): boolean {
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_SUPPRESS_ATTRIB_SETTINGS) && this.isCustomSettings()) {
            return true;
        }

        const isRelativeCreditAttributionSetting = this.isRelativeCreditAttributionSetting(this.attributionSettings.cannedMethod);
        if (isRelativeCreditAttributionSetting) {
            return this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.RELATIVE_SCALED_CALCULATION_METHOD;
        }
        const sectorWeighting = find(this.sectorWeightings, {value: this.attributionSettings.sectorWeighting});
        return sectorWeighting.attributionCalculatorMethods.indexOf(attributionCalculatorMethod) !== -1;
    }

    /**
     * Validates if a sector level is valid as per the calculation method chosen
     */
    isSectorLevelValid(sectorLevel): boolean {
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_SUPPRESS_ATTRIB_SETTINGS) && this.isCustomSettings()) {
            return true;
        }

        if ((this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.TOP_DOWN_NORM ||
                this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.HYBRID) &&
                sectorLevel !== PerformanceConstants.CALCULATION_LEVEL.IMMEDIATE_PARENT_LEVEL) {
            return false;
        }

        if ((this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE ||
                this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY) &&
                sectorLevel !== PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL) {
            return false;
        }

        return true;
    }

    /**
     * Method invoked on change of sector weighting
     */
    onSectorWeightingChange(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const sectorWeightingValue = (ev.detail.value as AuxSelectOption).value;
        if (this.attributionSettings.sectorWeighting === sectorWeightingValue) {
            return;
        }
        this.attributionSettings.sectorWeighting = sectorWeightingValue;
        this.adjustCombinedSettingOnSectorWeightingChange();
        // If calculation method is relevant for the new sector weighting chosen, nothing needs to be done so return
        if (this.isCalculationMethodValid(this.attributionSettings.attributionCalculatorMethod)) {
            this.initializeAttributionCalculatorMethodsData();
            return;
        }
        // We need to set a valid calculation method. So get all calculation methods for this sector weighting and set the first one
        const sectorWeighting = find(this.sectorWeightings, {value: this.attributionSettings.sectorWeighting});
        this.attributionSettings.attributionCalculatorMethod = sectorWeighting.attributionCalculatorMethods[0];
        // update the UI
        this.initializeAttributionCalculatorMethodsData();
        // Also validate and set the sector level as it is dependent on calculation method
        this.onAttributionCalculatorMethodChange();
    }

    /**
     * If the current chosen setting is hybrid  or relative credit attribution then adjust the canned method on change of sector weighting
     */
    adjustCombinedSettingOnSectorWeightingChange() {
        const isHybridCreditAttributionSetting = this.isHybridCreditAttributionSetting(this.attributionSettings.cannedMethod);
        const isRelativeCreditAttributionSetting = this.isRelativeCreditAttributionSetting(this.attributionSettings.cannedMethod);
        if (!isHybridCreditAttributionSetting && !isRelativeCreditAttributionSetting) {
            return;
        }

        const isBenchTotalSectorLevel = this.isBenchTotalSectorLevel(this.attributionSettings.sectorLevel);
        const combinedSetting = this.getCombinedCreditAttributionSetting(isRelativeCreditAttributionSetting, isBenchTotalSectorLevel);
        this.attributionSettings.cannedMethod = combinedSetting.sectorWeightingSettingMap[this.attributionSettings.sectorWeighting];

        // once the canned method is updated on sector weighting change, we need to update the availableAttributionMethods for UI
        const availableCombinedCreditAttributionSetting = find(this.availableAttributionMethods[0].values, (setting) => {
            return isHybridCreditAttributionSetting ? (setting.value === PerformanceConstants.FIXED_INCOME_DXS || setting.value === PerformanceConstants.FIXED_INCOME_SPREAD_DURATION || setting.value === PerformanceConstants.FIXED_INCOME_MARKET_VALUE) :
                (this.isRelativeCreditAttributionSetting(setting.value));
        });

        availableCombinedCreditAttributionSetting.value = this.attributionSettings.cannedMethod;
    }

    /**
     * If the current chosen setting is hybrid  or relative credit attribution then adjust the canned method on change of sector level
     */
    adjustCombinedSettingOnSectorLevelChange(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        const sectorLevelItem = (ev.detail.value as AuxSelectOption).value;
        this.attributionSettings.sectorLevel = sectorLevelItem;
        const isRelativeCreditAttributionSetting = this.isRelativeCreditAttributionSetting(this.attributionSettings.cannedMethod);
        if (!isRelativeCreditAttributionSetting) {
            return;
        }

        if (this.isBenchTotalSectorLevel(this.attributionSettings.sectorLevel)) {
            this.attributionSettings.cannedMethod = PerformanceConstants.OAS_CHG + CoreCommonConstants.UNDERSCORE + this.attributionSettings.sectorWeighting + CoreCommonConstants.UNDERSCORE + PerformanceConstants.BENCH_TOTAL;
        } else {
            this.attributionSettings.cannedMethod = PerformanceConstants.OAS_CHG + CoreCommonConstants.UNDERSCORE + this.attributionSettings.sectorWeighting;
        }

        // once the canned method is updated on sector weighting change, we need to update the availableAttributionMethods for UI
        const availableCombinedCreditAttributionSetting = find(this.availableAttributionMethods[0].values, (setting: any) => {
            return this.isRelativeCreditAttributionSetting(setting.value);
        });

        availableCombinedCreditAttributionSetting.value = this.attributionSettings.cannedMethod;
    }

    /**
     * Method invoked on change of calculation method
     */
    onAttributionCalculatorMethodChange(): void {
        this.initializeSectorLevelData();
        this.initializeSectorWeightingData();
        this.initializeAttributionMethodData();

        this.updateCannedMethodOnSectorChange();
    }

    private updateCannedMethodOnSectorChange() {
        const underscoreBenchTotal = this.isRelativeCreditAttributionSetting(this.attributionSettings.cannedMethod) ? CoreCommonConstants.UNDERSCORE + PerformanceConstants.BENCH_TOTAL : CoreCommonConstants.EMPTY_STRING;

        if (this.attributionSettings.sectorLevel === PerformanceConstants.CALCULATION_LEVEL.IMMEDIATE_PARENT_LEVEL) {
            this.attributionSettings.cannedMethod = this.attributionSettings.cannedMethod.replace(underscoreBenchTotal, CoreCommonConstants.EMPTY_STRING);
        }

        if (this.attributionSettings.sectorLevel === PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL && this.attributionSettings.cannedMethod.indexOf(underscoreBenchTotal) < 0) {
            this.attributionSettings.cannedMethod = this.attributionSettings.cannedMethod + underscoreBenchTotal;
        }

        Object.keys(PerformanceConstants.WEIGHT_TYPE).forEach(weightTypeKey => {
            this.attributionSettings.cannedMethod = this.attributionSettings.cannedMethod.replace(PerformanceConstants.WEIGHT_TYPE[weightTypeKey], this.attributionSettings.sectorWeighting);
        });
    }

    /**
     * Method used to enable/disable attribution calculator methods
     */
    isAttributionCalculatorMethodSupported(attributionCalculatorMethod) {
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_SUPPRESS_ATTRIB_SETTINGS)) {
            if (this.attributionSettings.assetType !== AssetType.FI_MANDATE && attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.RELATIVE_SCALED) {
                return false;
            }
            if (this.attributionSettings.assetType !== AssetType.MULTI_ASSET && (attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE ||
                attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.TOP_DOWN_NORM)) {
                return false;
            }
            if (this.attributionSettings.assetType === AssetType.MULTI_ASSET && attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.HYBRID) {
                return false;
            }
        } else {
            if (this.isCustomSettings()) {
                return true;
            }
            if (this.attributionSettings.assetType !== AssetType.MULTI_ASSET && attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE) {
                return false;
            }
        }
        if (this.attributionSettings.assetType !== AssetType.EQUITY && attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY) {
            return false;
        }
        return true;
    }

    /**
     * Method used to enable/disable sector weightings based on attribution setting
     */
    isSectorWeightingSupported(sectorWeighting) {
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_SUPPRESS_ATTRIB_SETTINGS) && this.isCustomSettings()) {
            return true;
        }
        if (PerformanceConstants.CALCULATION_METHODS_WITH_MARKET_VALUE_WEIGHTING.includes(this.attributionSettings.attributionCalculatorMethod) &&
                sectorWeighting !== PerformanceConstants.WEIGHT_TYPE.MARKET_VALUE) {
            return false;
        }

        if (this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.RELATIVE_SCALED &&
            ( sectorWeighting === PerformanceConstants.WEIGHT_TYPE.COMPARISON || sectorWeighting === PerformanceConstants.WEIGHT_TYPE.MARKET_VALUE )) {
            return false;
        }

        if (this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.HYBRID &&
                sectorWeighting === PerformanceConstants.WEIGHT_TYPE.COMPARISON) {
            return false;
        }

        if (this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY &&
                (sectorWeighting === PerformanceConstants.WEIGHT_TYPE.SPREAD_DURATION || sectorWeighting === PerformanceConstants.WEIGHT_TYPE.DXS)) {
            return false;
        }

        if (this.attributionSettings.attributionCalculatorMethod === PerformanceConstants.CALCULATION_METHOD.HYBRID && this.attributionSettings.assetType !== 'FI_MANDATE' &&
                (sectorWeighting === PerformanceConstants.WEIGHT_TYPE.SPREAD_DURATION || sectorWeighting === PerformanceConstants.WEIGHT_TYPE.DXS)) {
            return false;
        }

        return true;
    }

    /**
     * Update Column list according to the factors for the current canned attribution setting chosen
     */
    updateColumnsList(list?: AuxAdvancedTreeListInterface[]) {
        this.selectedFactors = list;

        let factorsToAdd: string[] = [];
        // For custom we need to check what factors have been chosen by the user
        factorsToAdd = this.isCustomSettings() && list ? this.getAllChosenFactorsTagsForCustom() : this.attributionSettings.factors;

        if (!this.columns) {
            return;
        }

        // this.columns is available for widget level only which is Explore specific.
        this.performanceAttributionSettingsService.modifyColumns(this.columns, this.allFactorColumns, factorsToAdd, this.attributionSettings.cannedMethod);
    }

    /**
     * Get the chosen factors from the holding and trade factors list in case of custom
     */
    getAllChosenFactorsTagsForCustom() {
        const factorsTags = [];

        this.selectedFactors.forEach(factor => {
            if (factor.children) {
                factor.children.forEach(child => {
                    factorsTags.push(child.eventData);
                });
            } else {
                factorsTags.push(factor.eventData);
            }
        });
        this.attributionSettings.factors = factorsTags;
        return factorsTags;
    }

    /**
     * Initializes all the available factors
     */
    initializeAllFactorColumns(): void {
        this.allFactorColumns = [];
        const factorList = CoreDefinitionStore.attributionFactors.concat(CoreDefinitionStore.accountingFactors).concat(CoreDefinitionStore.tradeBasedFactors);
        for (const factor of factorList) {
            // Only factors available for some asset class are eligible
            if (factor.assetClassList && factor.assetClassList.length && factor.assetClassList.length > 0) {
                this.allFactorColumns.push(factor.activeColumnTag);
            }
        }
    }

    /**
     * Sets ColumnListUpdateEnabled of attribution settings
     */
    setColumnListUpdateEnabled(): void {
        this.attributionSettings.isColumnListUpdateEnabled = !this.attributionSettings.isColumnListUpdateEnabled;
    }

    /**
     * setting columns for enhanced brinson attribution methodology.
     */
    setEnhancedBrinsonColumn(): void {
        // when we set the attribution setting from portfolio settings. this is not initialized.
        if (!this.columns) {
            this.onEnhancedBrinsonSettingCompletion();
        } else {
            // this.columns is available for widget level performance settings ONLY (Explore specific)
            this.performanceAttributionSettingsService.fetchColumnData$(this.columns, this.onEnhancedBrinsonSettingCompletion);
        }
    }

    /**
     * Gets called once the processing of enhanced brinson is complete.
     */
    onEnhancedBrinsonSettingCompletion = (): void => {
        this.updateColumnsList();
        if (this.isApplyButtonDisabled) {
            this.isApplyButtonDisabled.value--; // on completion enable the apply button
            this.changeDetectorRef.markForCheck();
        }

        if (this.notificationService) {
            this.notificationService.success('Portfolio Level Look-through settings will not be respected for this widget');
        }
    }

    /**
     * Returns true if the attribution setting is for Enhanced Brinson.
     */
    isEnhancedBrinson(): boolean {
        return this.attributionSettings.cannedMethod === PerformanceConstants.ENHANCED_BRINSON_CANNED_METHOD;
    }

    /**
     * Returns flag to show/not show the item box.
     */
    showSelectedItemBox(): boolean {
        return !this.isEnhancedBrinson();
    }

    /**
     * Should the lookthrough settings be shown in the settings
     */
    showLookthroughSettings(): boolean {
        return this.attributionSettings.multiManagerAttribution ||
            (this.attributionSettings.assetType === AssetType.MULTI_ASSET && this.attributionSettings.cannedMethod === PerformanceConstants.CANNED_METHOD.CUSTOM);
    }

    /**
     * Close the dialog box
     */
    closeDialog(): void {
        this.promptDialog$.next(null);
    }

    onLinkClicked(linkName: string) {
        if (this.telemetryData) {
            this.telemetryData.details.set(linkName, 'Y');
        }
    }
}
