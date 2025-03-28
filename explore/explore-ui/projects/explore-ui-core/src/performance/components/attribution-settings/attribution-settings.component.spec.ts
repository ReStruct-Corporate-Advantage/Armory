import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ColumnConfig} from '../../../column/models/column-config/column-config.model';
import {CoreTestUtils} from '../../../test-utils/core-test.utils';
import {NOTIFICATION_SERVICE_TOKEN} from '../../../ui/tokens';
import {AttributionSettings} from '../../models/attribution-settings/attribution-settings.model';
import {PerformanceConstants} from '../../performance.constants';
import {PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN} from '../../tokens';
import {AttributionSettingsComponent} from './attribution-settings.component';
import {ExploreSelectOption} from '../../../ui/models/explore-select-option.model';
import {ExploreSelectOptionGroup} from '../../../ui/models/explore-select-option-group.model';
import {PraadaAttributionCalculatorMethod} from '../../../definition/models/praada-meta-data/praada-attribution-calculator-method.model';
import {GenericColumnDefinition} from '../../../definition/models/generic-column-definition.model';
import {PraadaSectorWeighting} from '../../../definition/models/praada-meta-data/praada-sector-weighting.model';
import {CoreDefinitionStore} from '../../../definition/core-definition.store';
import {AssetType} from '../../asset-type.enum';
import {EventType, TelemetryGenericEventParameters} from '../../../telemetry/generic-event';
import {TokenUtils} from '../../../definition/token/token.utils';

describe('AttributionSettingsComponent', () => {
    let component: AttributionSettingsComponent;
    let fixture: ComponentFixture<AttributionSettingsComponent>;

    const notificationServiceStub = {
        success: jest.fn()
    };

    const performanceAttributionSettingsServiceStub = {
        setAssetType: jest.fn(attributionSettings => attributionSettings.assetType = 'FI_MANDATE'),
        fetchColumnData$: jest.fn(),
        modifyColumns: jest.fn()
    };


    beforeAll(() => {
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        CoreTestUtils.initDefinitions();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AttributionSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub},
                {
                    provide: PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN,
                    useValue: performanceAttributionSettingsServiceStub
                },
            ]
        });

        fixture = TestBed.createComponent(AttributionSettingsComponent);
        component = fixture.componentInstance;
    });

    beforeAll(() => {
        CoreTestUtils.initDefinitions();
    });

    function populateComponentSettings(attributionCalculatorMethodValue: string) {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        const attributionMethodCalculator: PraadaAttributionCalculatorMethod = new PraadaAttributionCalculatorMethod();
        attributionMethodCalculator.value = attributionCalculatorMethodValue;
        attributionMethodCalculator.label = attributionCalculatorMethodValue;
        component.attributionCalculatorMethods = [attributionMethodCalculator];
        const sectorLevels: GenericColumnDefinition[] = [];
        const sectorLevel: GenericColumnDefinition = new GenericColumnDefinition();
        sectorLevel.value = 'IMMEDIATE_PARENT_LEVEL';
        sectorLevel.label = 'IMMEDIATE_PARENT_LEVEL';
        sectorLevels.push(sectorLevel);
        component.sectorLevels = sectorLevels;
        attributionMethodCalculator.sectorLevels = ['IMMEDIATE_PARENT_LEVEL'];
        const sectorWeightings: PraadaSectorWeighting[] = [];
        const sectorWeighting: PraadaSectorWeighting = new PraadaSectorWeighting();
        sectorWeighting.value = 'DXS';
        sectorWeighting.label = 'DXS';
        sectorWeightings.push(sectorWeighting);
        component.sectorWeightings = sectorWeightings;
    }

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle exposure mode change', () => {
        const attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.attributionSettings = attributionSettings;
        const event = {detail: {value: 'MarketValue'}} as CustomEvent;
        jest.spyOn(component, 'onExposureModeChange');

        component.onExposureModeChange(event);

        expect(component.onExposureModeChange).toHaveBeenCalledWith(event);
    });


    it('should handle asset class change', () => {
        const attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.attributionSettings = attributionSettings;
        const event = {detail: {value: 'Equity'}} as CustomEvent;
        jest.spyOn(component, 'onAssetClassChanged').mockImplementation();

        component.onAssetClassChanged(event);

        expect(component.onAssetClassChanged).toHaveBeenCalledWith(event);
    });

    it('should handle attribution model change', () => {
        const attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.attributionSettings = attributionSettings;
        const event = {detail: {value: 'FIXED_INCOME'}} as CustomEvent;
        jest.spyOn(component, 'onAvailableAttributionModelChanged').mockImplementation();

        component.onAvailableAttributionModelChanged(event);

        expect(component.onAvailableAttributionModelChanged).toHaveBeenCalledWith(event);
    });

    it('should initialize', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.columns = [];
        expect(typeof component.attributionSettings).toBeDefined();

        jest.spyOn(component['performanceAttributionSettingsService'], 'modifyColumns').mockImplementation(() => {
            mockModifyColumns();
        });

        component.ngOnInit();
        const actualValues = [
            component.allFactorColumns,
            component.sectorWeightings,
            component.attributionCalculatorMethods,
            component.sectorLevels,
            component.attributionSettings.assetType,
            component.availablePraadaCannedAttributionMethods,
            component.parametricFactors.concat(component.accountingFactors),
            component.tradeBasedFactors,
            component.attributionSettings.factors,
            CoreTestUtils.getColTags(component.columns)
        ];

        const expectedValues = [
            getExpectedAllFactorColumns(),
            getExpectedSectorWeightings(),
            getExpectedAttributionCalculatorMethods(),
            getExpectedSectorLevels(),
            'FI_MANDATE',
            getExpectedAvailablePraadaCannedAttributionMethodsForFixedIncome(),
            getExpectedHoldingBasedFactorsForFixedIncome(),
            getExpectedTradeBasedFactorsForFixedIncome(),
            getExpectedFactorsForFixedIncome(),
            getExpectedColTags()
        ];

        expect(CoreTestUtils.validate(actualValues, expectedValues)).toBeTruthy();
    });

    it('should initialize attribution method data', () => {
        component.attributionMethodData = null;
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.initializeAttributionMethodData();
        expect(component.attributionMethodData).not.toBeNull();

        component.multiAssetCannedAttributionMethod = [
            { value: 'MULTI_ASSET', label: 'Multi Asset' },
            { value: 'EB_MULTI_ASSET_xFXMTE', label: 'Enhanced Brinson Multi Asset' }
        ];

        component.attributionSettings = new AttributionSettings(undefined, 'MULTI_ASSET', undefined, undefined, 'MA_RELATIVE');
        component.initializeAttributionMethodData();
        expect(component.attributionMethodData).not.toBeNull();
        expect(component.attributionSettings.topDownWithoutLookthrough).toBeTruthy();
        expect(component.attributionMethodData[0].values.filter(value => value.isDisabled).length).toBe(2);
    });

    it('should return false if assetType is not FI_MANDATE and method is RELATIVE_SCALED', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'EQUITY_TD_xFX');
        component.attributionSettings.assetType = 'EQ_MANDATE';
        const result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.RELATIVE_SCALED);
        expect(result).toBe(false);
    });

    it('should return false if assetType is not MULTI_ASSET and method is MA_RELATIVE or TOP_DOWN_NORM', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'EQUITY_TD_xFX');
        component.attributionSettings.assetType = 'EQ_MANDATE';
        let result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE);
        expect(result).toBe(false);

        result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.TOP_DOWN_NORM);
        expect(result).toBe(false);
    });

    it('should return false if assetType is MULTI_ASSET and method is HYBRID', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'MULTI_ASSET');
        component.attributionSettings.assetType = 'BAL_MANDATE';
        const result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.HYBRID);
        expect(result).toBe(false);
    });

    it('should return false if assetType is not EQUITY and method is INDEX_EQUITY', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.attributionSettings.assetType = 'FI_MANDATE';
        const result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY);
        expect(result).toBe(false);
    });

    it('should return true for valid combinations', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.attributionSettings.assetType = 'FI_MANDATE';
        let result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.RELATIVE_SCALED);
        expect(result).toBe(true);

        component.attributionSettings = new AttributionSettings(undefined, 'MULTI_ASSET');
        component.attributionSettings.assetType = 'BAL_MANDATE';
        result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE);
        expect(result).toBe(true);

        component.attributionSettings = new AttributionSettings(undefined, 'EQUITY_TD_xFX');
        component.attributionSettings.assetType = 'EQ_MANDATE';
        result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY);
        expect(result).toBe(true);
    });

    it('should return true for valid combinations with suppression off', () => {
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.attributionSettings.assetType = 'FI_MANDATE';
        let result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE);
        expect(result).toBe(false);

        result = component.isAttributionCalculatorMethodSupported(PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY);
        expect(result).toBe(false);
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
    });

    it('should call onCalculatorMethodChange method', () => {
        const attributionCalculatorMethodValue = 'FIXED_INCOME_DXS';
        const event = {detail: {value: { value: attributionCalculatorMethodValue}}} as CustomEvent;
        populateComponentSettings(attributionCalculatorMethodValue);

        component.onCalculatorMethodChange(event);

        expect(component.attributionSettings.attributionCalculatorMethod).toEqual(attributionCalculatorMethodValue);
        expect(component.attributionSettings.sectorLevel).toEqual('IMMEDIATE_PARENT_LEVEL');
        expect(component.attributionSettings.sectorWeighting).toEqual('DXS');
    });

    it('should reset cannedMethod', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'CUSTOM');
        const attributionCalculatorMethodValue = 'RELATIVE';
        component.attributionSettings.cannedMethod = 'RELATIVE';
        component.exposureModes = CoreDefinitionStore.exposureModes;
        component.columns = [];
        component['performanceAttributionSettingsService'].setAssetType(component.attributionSettings);
        component.setAvailableAttributionMethodsForAssetType();
        populateComponentSettings(attributionCalculatorMethodValue);

        component.resetCannedMethod();

        expect(component.attributionSettings.cannedMethod).toEqual('FIXED_INCOME');
    });

    it('should open and close modal', () => {
        expect(component.isOpenModal).toBeUndefined();

        component.onClickOpenModal();
        expect(component.isOpenModal).toBe(true);

        component.closeModal();
        expect(component.isOpenModal).toBe(false);
    });

    /**
     * Test case for the method setAssetType from canned method chosen
     */
    it('setAssetType', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component['performanceAttributionSettingsService'].setAssetType(component.attributionSettings);
        expect(component.attributionSettings.assetType === 'FI_MANDATE').toBe(true);
    });

    /**
     * Test case for the method setAvailableAttributionMethodsForAssetType
     */
    it('setAvailableAttributionMethodsForAssetType', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.columns = [];
        component['performanceAttributionSettingsService'].setAssetType(component.attributionSettings);
        component.setAvailableAttributionMethodsForAssetType();
        expect(CoreTestUtils.validate(component.availablePraadaCannedAttributionMethods, getExpectedAvailablePraadaCannedAttributionMethodsForFixedIncome())).toBe(true);
    });

    /**
     * Test case for method getCombinedCreditAttributionSetting
     */
    it('getCombinedCreditAttributionSetting', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.columns = [];
        let hybridAttributionSetting = component.getCombinedCreditAttributionSetting(false);

        expect(CoreTestUtils.validate(hybridAttributionSetting, getExpectedHybridAttributionSetting('FIXED_INCOME_DXS'))).toBe(true);

        component.attributionSettings.cannedMethod = 'FIXED_INCOME_SPREAD_DURATION';

        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        hybridAttributionSetting = component.getCombinedCreditAttributionSetting(false);

        expect(CoreTestUtils.validate(hybridAttributionSetting, getExpectedHybridAttributionSetting('FIXED_INCOME_SPREAD_DURATION'))).toBe(true);

        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        hybridAttributionSetting = component.getCombinedCreditAttributionSetting(true);

        expect(CoreTestUtils.validate(hybridAttributionSetting, getExpectedRelativeAttributionSetting('OAS_CHG_DXS'))).toBe(true);

        component.attributionSettings.cannedMethod = 'OAS_CHG_SPREAD_DURATION';

        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        hybridAttributionSetting = component.getCombinedCreditAttributionSetting(true);

        expect(CoreTestUtils.validate(hybridAttributionSetting, getExpectedRelativeAttributionSetting('OAS_CHG_SPREAD_DURATION'))).toBe(true);

        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        hybridAttributionSetting = component.getCombinedCreditAttributionSetting(true, true);

        expect(CoreTestUtils.validate(hybridAttributionSetting, getExpectedRelativeAttributionSetting('OAS_CHG_DXS_BENCH_TOTAL'))).toBe(true);

        component.attributionSettings.cannedMethod = 'OAS_CHG_SPREAD_DURATION';

        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        hybridAttributionSetting = component.getCombinedCreditAttributionSetting(true);

        expect(CoreTestUtils.validate(hybridAttributionSetting, getExpectedRelativeAttributionSetting('OAS_CHG_SPREAD_DURATION_BENCH_TOTAL'))).toBe(true);

    });

    /**
     * Test case for method isHybridSpreadSetting
     */
    it('isHybridCreditAttributionSetting', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.columns = [];
        expect(component.isHybridCreditAttributionSetting('FIXED_INCOME')).toBe(false);
        expect(component.isHybridCreditAttributionSetting('FIXED_INCOME_DXS')).toBe(true);
        expect(component.isHybridCreditAttributionSetting('FIXED_INCOME_SPREAD_DURATION')).toBe(true);
    });

    /**
     * Test case for method isRelativeCreditAttributionSetting
     */
    it('isRelativeCreditAttributionSetting', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.columns = [];
        expect(component.isRelativeCreditAttributionSetting('FIXED_INCOME')).toBe(false);
        expect(component.isRelativeCreditAttributionSetting('OAS_CHG_DXS')).toBe(true);
        expect(component.isRelativeCreditAttributionSetting('OAS_CHG_SPREAD_DURATION')).toBe(true);
        expect(component.isRelativeCreditAttributionSetting('OAS_CHG_MARKET_VALUE')).toBe(true);
        expect(component.isRelativeCreditAttributionSetting('OAS_CHG_DXS_BENCH_TOTAL')).toBe(true);
        expect(component.isRelativeCreditAttributionSetting('OAS_CHG_SPREAD_DURATION_BENCH_TOTAL')).toBe(true);
        expect(component.isRelativeCreditAttributionSetting('OAS_CHG_MARKET_VALUE_BENCH_TOTAL')).toBe(true);
    });

    /**
     * Test case for method isBenchTotalSectorLevel
     */
    it('isBenchTotalSectorLevel', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.columns = [];
        expect(component.isBenchTotalSectorLevel('IMMEDIATE_PARENT_LEVEL')).toBe(false);
        expect(component.isBenchTotalSectorLevel('BENCHMARK_TOTAL_LEVEL')).toBe(true);
    });

    /**
     * Test case for method isCreditAttributionSetting
     */
    it('isCreditAttributionSetting', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.columns = [];
        expect(component.isCreditAttributionSetting('FIXED_INCOME')).toBe(false);
        expect(component.isCreditAttributionSetting('FIXED_INCOME_DXS')).toBe(true);
        expect(component.isCreditAttributionSetting('FIXED_INCOME_SPREAD_DURATION')).toBe(true);
        expect(component.isCreditAttributionSetting('FIXED_INCOME_MARKET_VALUE')).toBe(true);
        expect(component.isCreditAttributionSetting('OAS_CHG_DXS')).toBe(true);
        expect(component.isCreditAttributionSetting('OAS_CHG_SPREAD_DURATION')).toBe(true);
        expect(component.isCreditAttributionSetting('OAS_CHG_MARKET_VALUE')).toBe(true);
    });

    /**
     * Test case for method adjustCombinedSettingOnSectorWeightingChange
     */
    it('adjustCombinedSettingOnSectorWeightingChange', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.ngOnInit();
        component.adjustCombinedSettingOnSectorWeightingChange();

        expect(component.attributionSettings.cannedMethod).toBe('FIXED_INCOME');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_DXS', 'FIXED_INCOME'))).toBe(true);


        component.attributionSettings.cannedMethod = 'FIXED_INCOME_DXS';
        component.attributionSettings.sectorWeighting = 'SPREAD_DURATION';
        component.adjustCombinedSettingOnSectorWeightingChange();
        expect(component.attributionSettings.cannedMethod).toBe('FIXED_INCOME_SPREAD_DURATION');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_SPREAD_DURATION', 'OAS_CHG_DXS', 'FIXED_INCOME'))).toBe(true);


        component.attributionSettings.sectorWeighting = 'DXS';
        component.adjustCombinedSettingOnSectorWeightingChange();
        expect(component.attributionSettings.cannedMethod).toBe('FIXED_INCOME_DXS');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_DXS', 'FIXED_INCOME'))).toBe(true);

        component.attributionSettings.sectorWeighting = 'DXS';
        component.attributionSettings.cannedMethod = 'OAS_CHG_SPREAD_DURATION';
        component.adjustCombinedSettingOnSectorWeightingChange();
        expect(component.attributionSettings.cannedMethod).toBe('OAS_CHG_DXS');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_DXS', 'FIXED_INCOME'))).toBe(true);


        component.attributionSettings.sectorWeighting = 'SPREAD_DURATION';
        component.adjustCombinedSettingOnSectorWeightingChange();
        expect(component.attributionSettings.cannedMethod).toBe('OAS_CHG_SPREAD_DURATION');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_SPREAD_DURATION', 'FIXED_INCOME'))).toBe(true);


        component.attributionSettings.sectorWeighting = 'DXS';
        component.attributionSettings.cannedMethod = 'OAS_CHG_SPREAD_DURATION_BENCH_TOTAL';
        component.attributionSettings.sectorLevel = 'BENCHMARK_TOTAL_LEVEL';
        component.adjustCombinedSettingOnSectorWeightingChange();
        expect(component.attributionSettings.cannedMethod).toBe('OAS_CHG_DXS_BENCH_TOTAL');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_DXS_BENCH_TOTAL', 'FIXED_INCOME'))).toBe(true);


        component.attributionSettings.sectorWeighting = 'SPREAD_DURATION';
        component.adjustCombinedSettingOnSectorWeightingChange();
        expect(component.attributionSettings.cannedMethod).toBe('OAS_CHG_SPREAD_DURATION_BENCH_TOTAL');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_SPREAD_DURATION_BENCH_TOTAL', 'FIXED_INCOME'))).toBe(true);

    });

    /**
     * Test case for method adjustCombinedSettingOnSectorLevelChange
     */
    it('adjustCombinedSettingOnSectorLevelChange', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.ngOnInit();

        const event = {detail: {value: {value: 'IMMEDIATE_PARENT_LEVEL'}}} as CustomEvent;

        component.attributionSettings.sectorWeighting = 'DXS';
        component.attributionSettings.sectorLevel = 'BENCHMARK_TOTAL_LEVEL';
        component.attributionSettings.cannedMethod = 'OAS_CHG_SPREAD_DURATION';
        component.adjustCombinedSettingOnSectorLevelChange(event);
        expect(component.attributionSettings.cannedMethod).toBe('OAS_CHG_DXS');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_DXS', 'FIXED_INCOME'))).toBe(true);

        component.attributionSettings.sectorWeighting = 'SPREAD_DURATION';
        component.adjustCombinedSettingOnSectorLevelChange(event);
        expect(component.attributionSettings.cannedMethod).toBe('OAS_CHG_SPREAD_DURATION');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_SPREAD_DURATION', 'FIXED_INCOME'))).toBe(true);

        component.attributionSettings.sectorWeighting = 'SPREAD_DURATION';
        component.attributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        component.adjustCombinedSettingOnSectorLevelChange(event);
        expect(component.attributionSettings.cannedMethod).toBe('OAS_CHG_SPREAD_DURATION');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_SPREAD_DURATION', 'FIXED_INCOME'))).toBe(true);
    });


    /**
     * Test case for the method setOtherSettingsFromCannedSetting which checks if all factors are initilized and columns are updated and sector weighting, sector level and attribution calculator method is set
     */
    it('setOtherSettingsFromCannedSetting', () => {
        component.attributionSettings = new AttributionSettings(undefined, undefined);
        component.attributionSettings.parentAttributionSettings = new AttributionSettings('FI_MANDATE', 'FIXED_INCOME');
        component.attributionSettings.parentAttributionSettings.attributionCalculatorMethod = 'RELATIVE';
        component.columns = [];

        jest.spyOn(component['performanceAttributionSettingsService'], 'modifyColumns').mockImplementation(() => {
        });

        component.ngOnInit();

        jest.spyOn(component['performanceAttributionSettingsService'], 'modifyColumns').mockImplementation(() => {
            mockModifyColumns();
        });

        component.setOtherSettingsFromCannedSetting(true);
        const actualValues = [
            component.attributionSettings.factors,
            CoreTestUtils.getColTags(component.columns),
            component.attributionSettings.sectorWeighting,
            component.attributionSettings.attributionCalculatorMethod,
            component.attributionSettings.sectorLevel,
            component.attributionSettings.exposureMode];

        const expectedValues = [
            getExpectedFactorsForFixedIncome(),
            getExpectedColTags(),
            getExpectedSectorWeightingForFixedIncome(),
            getExpectedAttributionCalculatorMethodForFixedIncome(),
            getExpectedSectorLevelForFixedIncome(),
            getExpectedExposureModeForFixedIncome()
        ];
        expect(CoreTestUtils.validate(actualValues, expectedValues)).toBe(true);
    });

    /**
     * Test case for method isCustomSettings
     */
    it('isCustomSettings', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'CUSTOM');
        expect(component.isCustomSettings()).toBe(true);

        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        expect(component.isCustomSettings()).toBe(false);
    });


    /**
     * Test case for method isCalculationMethodValid
     */
    it('isCalculationMethodValid', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME', [], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL');
        component.attributionSettings.parentAttributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME', [], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL');
        component.ngOnInit();
        // BHB is valid for MARKET_VALUE
        expect(component.isCalculationMethodValid(component.attributionSettings.attributionCalculatorMethod)).toBe(true);

        // BHB is invalid for DXS
        component.attributionSettings.sectorWeighting = 'DXS';
        expect(component.isCalculationMethodValid(component.attributionSettings.attributionCalculatorMethod)).toBe(false);

        // HYBRID is valid for DXS
        component.attributionSettings.attributionCalculatorMethod = 'HYBRID';
        expect(component.isCalculationMethodValid(component.attributionSettings.attributionCalculatorMethod)).toBe(true);

        // RELATIVE_SCALED is valid for OAS_CHG_DXS
        component.attributionSettings.cannedMethod = 'OAS_CHG_DXS';
        expect(component.isCalculationMethodValid(component.attributionSettings.attributionCalculatorMethod)).toBe(false);
    });

    /**
     * Test case for method isSectorLevelValid
     */
    it('isSectorLevelValid', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'CUSTOM', [], 'MARKET_VALUE', 'RELATIVE', 'BENCHMARK_TOTAL_LEVEL');
        component.columns = [];
        component.ngOnInit();

        component.attributionSettings.sectorLevel = 'BENCHMARK_TOTAL_LEVEL';

        // BENCHMARK_TOTAL_LEVEL is valid for RELATIVE
        expect(component.isSectorLevelValid(component.attributionSettings.sectorLevel)).toBe(true);

        component.attributionSettings.cannedMethod = 'FIXED_INCOME';
        component.attributionSettings.attributionCalculatorMethod = 'HYBRID';
        // BENCHMARK_TOTAL_LEVEL is invalid for HYBRID
        expect(component.isSectorLevelValid(component.attributionSettings.sectorLevel)).toBe(false);

        component.attributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        // IMMEDIATE_PARENT_LEVEL is valid for HYBRID
        expect(component.isSectorLevelValid(component.attributionSettings.sectorLevel)).toBe(true);

        // For relative credit attribution
        component.attributionSettings = new AttributionSettings(undefined, 'OAS_CHG_DXS', undefined, undefined, 'HYBRID');
        expect(component.isSectorLevelValid('IMMEDIATE_PARENT_LEVEL')).toBe(true);
        expect(component.isSectorLevelValid('BENCHMARK_TOTAL_LEVEL')).toBe(false);
        expect(component.isSectorLevelValid('FIRST_LEVEL')).toBe(false);
    });

    /**
     * Test case for method onSectorWeightingChange
     */
    it('onSectorWeightingChange', () => {
        component.attributionSettings = new AttributionSettings('FI_MANDATE', 'FIXED_INCOME', [], 'MARKET_VALUE', 'RELATIVE', 'BENCHMARK_TOTAL_LEVEL');
        component.columns = [];
        const event = {detail: {value: {value: 'DXS'}}} as CustomEvent;
        component.ngOnInit();
        component.onSectorWeightingChange(event);

        // For DXS only valid setting is HYBRID
        expect(component.attributionSettings.attributionCalculatorMethod === 'HYBRID').toBe(true);

        const event2 = {detail: {value: {value: 'MARKET_VALUE'}}} as CustomEvent;

        component.attributionSettings.sectorWeighting = 'MARKET_VALUE';
        component.onSectorWeightingChange(event2);
        // For MARKET_VALUE HYBRID is valid so no change needed
        expect(component.attributionSettings.attributionCalculatorMethod === 'HYBRID').toBe(true);

        const event3 = {detail: {value: {value: 'SPREAD_DURATION'}}} as CustomEvent;

        component.attributionSettings.cannedMethod = 'FIXED_INCOME_DXS';
        component.onSectorWeightingChange(event3);
        expect(component.attributionSettings.cannedMethod).toBe('FIXED_INCOME_SPREAD_DURATION');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_SPREAD_DURATION', 'OAS_CHG_DXS_BENCH_TOTAL', 'CUSTOM'))).toBe(true);

        const event4 = {detail: {value: {value: 'DXS'}}} as CustomEvent;

        component.onSectorWeightingChange(event4);
        expect(component.attributionSettings.cannedMethod).toBe('FIXED_INCOME_DXS');
        expect(CoreTestUtils.validate(component.availableAttributionMethods, getExpectedAvailableAttributionMethods('FIXED_INCOME_DXS', 'OAS_CHG_DXS_BENCH_TOTAL', 'CUSTOM'))).toBe(true);

    });

    it('should not handle changes in other properties', () => {
        jest.spyOn(component, 'showSelectedItemBox');
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.ngOnChanges();
        expect(component.showSelectedItemBox).toHaveBeenCalled();
    });

    it('should initialize available attribution methods for MULTI_ASSET', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'MULTI_ASSET');
        component.attributionSettings.assetType = AssetType.MULTI_ASSET;
        component.availablePraadaCannedAttributionMethods = [];

        component.initializeAvailableAttributionMethod();

        expect(component.availableAttributionMethods.length).toEqual(1);
    });

    /**
     * Test case for method onAttributionCalculatorMethodChange
     */
    it('onAttributionCalculatorMethodChange', () => {
        const settings = {
            cannedMethod: 'CUSTOM',
            sectorWeighting: 'MARKET_VALUE',
            attributionCalculatorMethod: 'RELATIVE',
            sectorLevel: 'BENCHMARK_TOTAL_LEVEL'
        };
        component.attributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME', [], 'MARKET_VALUE', 'RELATIVE', 'BENCHMARK_TOTAL_LEVEL');
        component.columns = [];
        component.ngOnInit();
        component.attributionSettings.attributionCalculatorMethod = 'HYBRID';
        component.onAttributionCalculatorMethodChange();

        component.attributionSettings.attributionCalculatorMethod = 'RELATIVE';
        component.onAttributionCalculatorMethodChange();
        // For RELATIVE all three levels are valid so no change needed
        expect(component.attributionSettings.sectorLevel === 'BENCHMARK_TOTAL_LEVEL').toBe(true);
    });

    /**
     * Test case for the method getSelectedItemsBoxName for fixed income.
     */
    it('getSelectedItemsBoxName for Fixed income', () => {
        component.attributionSettings = new AttributionSettings('FI_MANDATE');

        expect(component.getSelectedItemsBoxName()).toBe('Excess Factors');
    });

    /**
     * Test case for the method getSelectedItemsBoxName for Equity.
     */
    it('getSelectedItemsBoxName for Equity', () => {
        component.attributionSettings = new AttributionSettings('EQ_MANDATE');

        expect(component.getSelectedItemsBoxName()).toBe('Included in brinson terms');
    });

    /**
     * Test case for the method setMultiManagerAttribution.
     */
    it('setMultiManagerAttribution', () => {
        component.attributionSettings = new AttributionSettings('EQ_MANDATE', 'CUSTOM');
        component.setMultiManagerAttribution(true);

        expect(component.attributionSettings.multiManagerAttribution).toBe(true);
    });

    /**
     * Test case for the method setDefaultMultiMangerSelection.
     */
    it('setDefaultMultiMangerSelection', () => {
        jest.spyOn(component, 'setOtherSettingsFromCannedSetting').mockImplementation(() => {});
        component.attributionSettings = new AttributionSettings('EQ_MANDATE', 'CUSTOM', [], undefined, undefined, undefined, undefined, true);
        component.setDefaultMultiManagerSelection();
        expect(component.attributionSettings.cannedMethod).toBe('Default');
    });

    /**
     * Test case for the method setDefaultMultiMangerSelection for enhanced brinson.
     */
    it('setDefaultMultiMangerSelection for enhanced brinson.', () => {
        component.attributionSettings = new AttributionSettings('BAL_MANDATE', 'EB_MULTI_ASSET_xFXMTE', [], undefined, undefined, undefined, undefined, true);
        component.setDefaultMultiManagerSelection();
        expect(component.attributionSettings.cannedMethod).toBe('EB_MULTI_ASSET_xFXMTE');
    });

    /**
     * Test case for the method isMultiManagerAttribution.
     */
    it('isMultiManagerAttribution', () => {
        component.attributionSettings = new AttributionSettings(undefined, undefined, [], undefined, undefined, undefined, undefined, true);
        expect(component.isMultiManagerAttribution()).toBe(true);
    });

    /**
     * Test case for the method resetSettings
     */
    it('Test  resetSettings', () => {
        component.attributionSettings = new AttributionSettings('BAL_MANDATE', 'EQUITY_TD_xFX');

        jest.spyOn(component, 'setAvailableAttributionMethodsForAssetType').mockReturnValue(null);
        jest.spyOn(component, 'setOtherSettingsFromCannedSetting').mockReturnValue(null);
        jest.spyOn(component, 'initializeAvailableAttributionMethod').mockReturnValue(null);
        jest.spyOn(component, 'setDisplayDataForSelectBox').mockImplementation((_a, _b) => []);
        jest.spyOn(component, 'initializeSectorLevelData').mockReturnValue(null);
        jest.spyOn(component, 'initializeSectorWeightingData').mockReturnValue(null);

        component.resetSettings();
        expect(component.attributionSettings.cannedMethod).toBe(undefined);
        expect(component.attributionSettings.multiManagerAttribution).toBe(undefined);
        expect(component.setAvailableAttributionMethodsForAssetType).toHaveBeenCalled();
        expect(component.setOtherSettingsFromCannedSetting).toHaveBeenCalled();
        expect(component.initializeAvailableAttributionMethod).toHaveBeenCalled();

        component.attributionSettings = new AttributionSettings('BAL_MANDATE', 'EQUITY_TD_xFX');
        component.attributionSettings.parentAttributionSettings = new AttributionSettings('', 'CUSTOM');
        jest.spyOn(component.attributionSettings, 'resetSettings').mockReturnValue(null);
        component.resetSettings();
        expect(component.attributionSettings.resetSettings).toHaveBeenCalled();

        component.attributionSettings.cannedMethod = 'CUSTOM';
        component.resetSettings();
        expect(component.resetExcessFlagMap).toBe(true);
    });

    /**
     * Test case for the method initializeAllFactorColumns
     */
    it('initializeAllFactorColumns', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'EQUITY_TD_xFX');
        component.columns = [];

        component.initializeAllFactorColumns();
        expect(CoreTestUtils.validate(component.allFactorColumns, getExpectedAllFactorColumns())).toBeTruthy();
    });

    /**
     * TEst case for method getAllChosenFactorsTagsForCustom
     */
    it('getAllChosenFactorsTagsForCustom', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'CUSTOM');
        const columns: any = [{'columnTag': 'cusip'}, {'columnTag': 'pnl_sec_desc'}, {'columnTag': 'total_ret'}, {'columnTag': 'excess_contr'}, {'columnTag': 'active_fx_contr'}];
        component.columns = columns;
        component.factorWindowTabLabel = PerformanceConstants.HOLDING_BASED_RETURN;
        component.attributionSettings.factors = ['comm_contr', 'tradeprice_contr', 'rf_contr', 'rldn_contr'];
        component.selectedFactors = getExpectedHoldingReturnFactorsForFixedIncome();
        const factors = component.getAllChosenFactorsTagsForCustom();
        // factors have also been set in the settings.factors
        expect(CoreTestUtils.validate(factors, component.attributionSettings.factors)).toBeTruthy();
        expect(CoreTestUtils.validate(factors, ['rf_contr', 'rldn_contr', 'dur_contr', 'crv_contr', 'conv_contr', 'cvx_crv_contr', 'fx_contr', 'fxcarry_contr'])).toBe(true);

    });

    it('should return true when multiManagerAttribution is true', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'MULTI_ASSET');
        component.attributionSettings.multiManagerAttribution = true;
        component.attributionSettings.cannedMethod = 'CUSTOM';

        const result = component.showLookthroughSettings();

        expect(result).toBe(true);
    });

    it('should return true when assetType is MULTI_ASSET and cannedMethod is CUSTOM', () => {
        component.attributionSettings = new AttributionSettings('BAL_MANDATE', 'MULTI_ASSET');
        component.attributionSettings.multiManagerAttribution = false;
        component.attributionSettings.cannedMethod = 'CUSTOM';

        const result = component.showLookthroughSettings();

        expect(result).toBe(true);
    });

    it('should return false when multiManagerAttribution is false and assetType is not MULTI_ASSET', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'EQUITY');
        component.attributionSettings.multiManagerAttribution = false;
        component.attributionSettings.cannedMethod = 'CUSTOM';

        const result = component.showLookthroughSettings();

        expect(result).toBe(false);
    });

    /**
     * Test case for method isSectorWeightingSupported
     */
    it('isSectorWeightingSupported', () => {
        component.attributionSettings = new AttributionSettings('FI_MANDATE', 'FIXED_INCOME', undefined, undefined, 'HYBRID');

        expect(component.isSectorWeightingSupported('MARKET_VALUE')).toBe(true);
        expect(component.isSectorWeightingSupported('DXS')).toBe(true);
        expect(component.isSectorWeightingSupported('SPREAD_DURATION')).toBe(true);
        expect(component.isSectorWeightingSupported('COMPARISON')).toBe(false);

        component.attributionSettings.attributionCalculatorMethod = 'INDEX_EQUITY';

        expect(component.isSectorWeightingSupported('MARKET_VALUE')).toBe(true);
        expect(component.isSectorWeightingSupported('DXS')).toBe(false);
        expect(component.isSectorWeightingSupported('SPREAD_DURATION')).toBe(false);
        expect(component.isSectorWeightingSupported('COMPARISON')).toBe(true);

        component.attributionSettings.attributionCalculatorMethod = 'RELATIVE';

        expect(component.isSectorWeightingSupported('MARKET_VALUE')).toBe(true);
        expect(component.isSectorWeightingSupported('DXS')).toBe(false);
        expect(component.isSectorWeightingSupported('SPREAD_DURATION')).toBe(false);
        expect(component.isSectorWeightingSupported('COMPARISON')).toBe(false);

        component.attributionSettings.attributionCalculatorMethod = 'RELATIVE';
        component.attributionSettings.attributionCalculatorMethod = 'HYBRID';
        component.attributionSettings.assetType = 'FI_MANDATE';

        expect(component.isSectorWeightingSupported('SPREAD_DURATION')).toBe(true);
        expect(component.isSectorWeightingSupported('DXS')).toBe(true);

        component.attributionSettings.assetType = 'BAL_MANDATE';

        expect(component.isSectorWeightingSupported('SPREAD_DURATION')).toBe(false);
        expect(component.isSectorWeightingSupported('DXS')).toBe(false);
    });

    /**
     * Test case for the method showSelectedItemBox for Equity.
     */
    it('showSelectedItemBox for INDEX_EQUITY', () => {
        component.attributionSettings = new AttributionSettings('EQ_MANDATE', 'INDEX_EQUITY');
        expect(component.showSelectedItemBox()).toBe(true);
    });

    /**
     * Test case for the method showSelectedItemBox for Equity.
     */
    it('showSelectedItemBox for INDEX_EQUITY', () => {
        component.attributionSettings = new AttributionSettings('EQ_MANDATE', 'CUSTOM');
        expect(component.showSelectedItemBox()).toBe(true);
    });

    it('test isEnhancedBrinson', () => {
        component.attributionSettings = new AttributionSettings(undefined, 'INDEX_EQUITY');
        expect(component.isEnhancedBrinson()).toBeFalsy();

        component.attributionSettings = new AttributionSettings(undefined, 'EB_MULTI_ASSET_xFXMTE');
        expect(component.isEnhancedBrinson()).toBeTruthy();
    });

    /**
     * Test case for the method setOtherSettingsFromCannedSetting for enhanced brinson.
     */
    it('setOtherSettingsFromCannedSetting for Enhanced Brinson', () => {
        jest.spyOn(component['performanceAttributionSettingsService'], 'fetchColumnData$').mockImplementation(() => {
            component.columns.push(ColumnConfig.createColumn('excess_pd'));
        });

        jest.spyOn(component['performanceAttributionSettingsService'], 'modifyColumns').mockImplementation(() => {
            component.columns.push(ColumnConfig.createColumn('active_fx_spot_carry'));
            component.columns.push(ColumnConfig.createColumn('te_ms'));
        });

        component.attributionSettings = new AttributionSettings(undefined, undefined);
        component.attributionSettings.parentAttributionSettings = new AttributionSettings(undefined, 'FIXED_INCOME');
        component.columns = [];
        component.ngOnInit();
        component.attributionSettings.parentAttributionSettings.cannedMethod = 'EB_MULTI_ASSET_xFXMTE';
        component.setOtherSettingsFromCannedSetting(false);

        expect(component.columns.length).toBe(3);

        expect(CoreTestUtils.validate(component.columns, getEnhancedBrinsonColumns()));
        expect(component['performanceAttributionSettingsService'].fetchColumnData$).toHaveBeenCalledTimes(1);
    });

    /**
     * Test case for the method onAdditionalMultiAssetSettingsChanged.
     */
    it('onAdditionalMultiAssetSettingsChanged', () => {
        component.attributionSettings = new AttributionSettings('BAL_MANDATE', 'CUSTOM');
        // Start out with Top-Down is true
        component.attributionSettings.topDownWithoutLookthrough = true;

        // Test with Bottoms-Up
        component.onAdditionalMultiAssetSettingsChanged(PerformanceConstants.CANNED_METHOD.EB_MULTI_ASSET_xFXMTE);
        expect(component.attributionSettings.topDownWithoutLookthrough).toBeFalsy();
        expect(component.attributionSettings.bottomsUpWithLookthrough).toBeTruthy();

        // Test with Top-Down
        component.onAdditionalMultiAssetSettingsChanged(PerformanceConstants.CANNED_METHOD.MULTI_ASSET);
        expect(component.attributionSettings.topDownWithoutLookthrough).toBeTruthy();
        expect(component.attributionSettings.bottomsUpWithLookthrough).toBeFalsy();

        // Test with Default
        component.onAdditionalMultiAssetSettingsChanged('Default');
        expect(component.attributionSettings.topDownWithoutLookthrough).toBeFalsy();
        expect(component.attributionSettings.bottomsUpWithLookthrough).toBeFalsy();
    });

    it('should set telemetry data when a link is clicked', () => {
        const linkName = 'testLink';
        component.telemetryData = new TelemetryGenericEventParameters(EventType.WIDGET_INPUT_DONE_EVENT);

        component.onLinkClicked(linkName);

        expect(component.telemetryData.details.get(linkName)).toBe('Y');
    });

    it('should return true when calculation method is "Hybrid" and attributionSettings.assetType is "FI_MANDATE"', () => {
        component.attributionSettings = new AttributionSettings('FI_MANDATE', 'FIXED_INCOME', [], 'SPREAD_DURATION', 'HYBRID');

        let result = component.isCalculationMethodToBeShownInList('HYBRID');

        expect(result).toBe(true);

        component.attributionSettings.sectorWeighting = 'DXS';

        result = component.isCalculationMethodToBeShownInList('HYBRID');

        expect(result).toBe(true);
    });

    it('should return false when calculation method is "Hybrid" and attributionSettings.assetType is not "FI_MANDATE"', () => {
        component.attributionSettings = new AttributionSettings('EQ_MANDATE', 'EQUITY', [], 'SPREAD_DURATION', 'HYBRID');

        const result = component.isCalculationMethodToBeShownInList('HYBRID');

        expect(result).toBe(false);
    });

    it('should return false when calculation method is not "Hybrid"', () => {
        component.attributionSettings = new AttributionSettings('EQ_MANDATE', 'FIXED_INCOME', [], 'SPREAD_DURATION', 'MA_RELATIVE');

        const result = component.isCalculationMethodToBeShownInList('MA_RELATIVE');

        expect(result).toBe(false);
    });

    it('should return false when calculation method is Index Equity', () => {
        component.attributionSettings = new AttributionSettings('FI_MANDATE', 'FIXED_INCOME', [], 'SPREAD_DURATION', 'INDEX_EQUITY');

        const result = component.isCalculationMethodToBeShownInList('INDEX_EQUITY');

        expect(result).toBe(false);
    });

    function getReportColumnForEnhancedBrison() {
        return [{
            'dataType': 'DOUBLE',
            'title': 'Excess Return',
            'columnTag': 'excess_pd',
            'columnReports': ['prism_eb_mngr_select', 'prism_performance', 'prism_eb_fx_attrib', 'prism_enhanced_b'],
            'columnType': 'PERFORMANCE',
            'field': 'ExcessReturn',
            'uses': 'PORT',
        }];
    }

    function getEnhancedBrinsonColumns() {
        return [{
            'optionValues': [],
            'columnTag': 'excess_pd',
            'positionColumnType': 'PORT',
            'columnKey': 'excess_pd_330e4587ead04d8',
            'columnTitle': 'Excess Return'
        }, {
            'optionValues': [],
            'columnTag': 'active_fx_spot_carry',
            'positionColumnType': 'ACTIVE',
            'columnKey': 'active_fx_spot_carry_7c0107ebcaf141a',
            'columnTitle': 'Active FX Spot And Carry Contribution'
        }, {
            'optionValues': [],
            'columnTag': 'te_ms',
            'positionColumnType': 'ACTIVE',
            'columnKey': 'te_ms_efb3c84c0cac436',
            'columnTitle': 'Manager Tracking'
        }];
    }

    /**
     * Expected factor columns for FIXED_INCOME with a particular order
     */
    function getExpectedColTagsOrdered() {
        return ['active_fx_contr', 'active_rf_contr', 'active_rldn_contr', 'active_dur_contr',
            'active_crv_contr', 'active_conv_contr', 'active_cvx_crv_contr', 'active_fxcarry_contr',
            'active_comm_contr', 'active_trade_contr'];
    }

    /**
     * * Expected universe of factor columns
     */
    function getExpectedAllFactorColumns() {
        return ['active_rf_contr', 'active_rldn_contr', 'active_oas_chg_contr',
            'active_oas_lev_contr', 'active_mtb_dur_contr', 'nvoldur_cont', 'vol_cvx_contr', 'active_delta_contr',
            'active_infl_contr', 'active_dur_contr', 'active_crv_contr', 'active_conv_contr', 'active_cvx_crv_contr',
            'active_basis_contr', 'active_fx_contr', 'active_fxcarry_contr', 'active_fx_spot_carry', 'act_ois_bas_contr',
            'act_swap_spd_contr', 'active_price_contr', 'active_paydn_contr', 'active_income_contr', 'active_fin_contr', 'active_wht_contr',
            'active_sec_lend_cont', 'active_px_diff_contr', 'active_sec_lit_contr', 'act_mgrsel_contr', 'mngr_select', 'te_ms', 'active_market_contr',
            'active_opt_gl_contr', 'act_total_diff_contr', 'active_comm_contr', 'active_trade_contr'];
    }

    /**
     * Expected sector weightings
     */
    function getExpectedSectorWeightings() {
        return [
            {
                'value': 'MARKET_VALUE',
                'label': 'Market Value',
                'attributionCalculatorMethods': ['BHB', 'RELATIVE', 'RELATIVEI', 'MA_RELATIVE', 'TOP_DOWN_NORM', 'HYBRID', 'INDEX_EQUITY']
            }, {
                'value': 'SPREAD_DURATION',
                'label': 'Spread Duration',
                'attributionCalculatorMethods': ['HYBRID']
            }, {'value': 'DXS', 'label': 'DxS', 'attributionCalculatorMethods': ['HYBRID']}, {
                'value': 'COMPARISON',
                'label': 'Comparison',
                'attributionCalculatorMethods': ['BHB', 'RELATIVE', 'RELATIVEI', 'MA_RELATIVE', 'TOP_DOWN_NORM', 'HYBRID', 'INDEX_EQUITY']
            }
        ];
    }

    /**
     * Expected attribution calculator methods
     */
    function getExpectedAttributionCalculatorMethods() {
        return [
            {
                'value': 'BHB',
                'label': 'Absolute(BHB)'
            }, {
                'value': 'RELATIVE',
                'label': 'Relative',
                'sectorLevels': ['IMMEDIATE_PARENT_LEVEL', 'BENCHMARK_TOTAL_LEVEL', 'FIRST_LEVEL']
            }, {
                'value': 'RELATIVEI',
                'label': 'Relative with Interaction',
                'sectorLevels': ['IMMEDIATE_PARENT_LEVEL', 'BENCHMARK_TOTAL_LEVEL', 'FIRST_LEVEL']
            }, {
                'value': 'MA_RELATIVE',
                'label': 'Allocation and Manager'
            }, {
                'value': 'TOP_DOWN_NORM',
                'label': 'Normalized Relative'
            }, {
                'value': 'HYBRID',
                'label': 'Hybrid'
            }, {
                'value': 'INDEX_EQUITY',
                'label': 'Index Equity',
                'sectorLevels': ['IMMEDIATE_PARENT_LEVEL', 'BENCHMARK_TOTAL_LEVEL']
            }
        ];
    }

    /**
     * Expected sector levels
     */
    function getExpectedSectorLevels() {
        return [{'value': 'IMMEDIATE_PARENT_LEVEL', 'label': 'Immediate Parent'}, {
            'value': 'BENCHMARK_TOTAL_LEVEL',
            'label': 'Benchmark Total'
        }, {'value': 'FIRST_LEVEL', 'label': 'First Level'}];
    }

    /**
     * * Expected available Attribution methods for FI
     */
    function getExpectedAvailableAttributionMethods(hybridValue?: string, relativeValue?: string, cannedValue?: string) {
        const group: ExploreSelectOptionGroup[] = [new ExploreSelectOptionGroup()];
        group[0].values.push(new ExploreSelectOption('Core Fixed Income', 'FIXED_INCOME', true));
        group[0].values.push(new ExploreSelectOption('Relative Credit', relativeValue ? relativeValue : 'OAS_CHG_DXS', false));
        group[0].values.push(new ExploreSelectOption('Hybrid Credit', hybridValue ? hybridValue : 'FIXED_INCOME_DXS', false));
        group[0].values.push(new ExploreSelectOption('Global Fixed Income', 'FIXED_INCOME_xFXT', false));
        group[0].values.push(new ExploreSelectOption('Custom', 'CUSTOM', false));

        return group;
    }

    /**
     * * Expected available canned methods for FI
     */
    function getExpectedAvailablePraadaCannedAttributionMethodsForFixedIncome(hybridValue?: string, relativeValue?: string) {
        return [
            {
                'label': 'Core Fixed Income Attribution',
                'value': 'FIXED_INCOME',
                'factors': ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr']
            },
            {
                'label': 'Relative Credit Attribution',
                'factors': ['oas_chg_contr'],
                'value': relativeValue ? relativeValue : 'OAS_CHG_DXS',
                'supportedSectorWeightings': ['DXS', 'SPREAD_DURATION', 'MARKET_VALUE'],
                'sectorWeightingSettingMap': {'DXS': 'OAS_CHG_DXS', 'SPREAD_DURATION': 'OAS_CHG_SPREAD_DURATION', 'MARKET_VALUE': 'OAS_CHG_MARKET_VALUE'},
                'supportedSectorLevel': ['IMMEDIATE_PARENT_LEVEL', 'BENCHMARK_TOTAL_LEVEL']
            },
            {
                'label': 'Hybrid Credit Attribution',
                'factors': ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr'],
                'value': hybridValue ? hybridValue : 'FIXED_INCOME_DXS',
                'supportedSectorWeightings': ['DXS', 'SPREAD_DURATION', 'MARKET_VALUE'],
                'sectorWeightingSettingMap': {
                    'DXS': 'FIXED_INCOME_DXS',
                    'SPREAD_DURATION': 'FIXED_INCOME_SPREAD_DURATION',
                    'MARKET_VALUE': 'FIXED_INCOME_MARKET_VALUE'
                }
            },
            {
                'label': 'Global Fixed Income Attribution',
                'value': 'FIXED_INCOME_xFXT',
                'factors': ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'cvx_crv_contr']
            }
        ];
    }

    /**
     * Expected hybrid setting
     */
    function getExpectedHybridAttributionSetting(value) {
        return {
            'label': 'Hybrid Credit Attribution',
            'factors': ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr'],
            'value': value,
            'supportedSectorWeightings': ['DXS', 'SPREAD_DURATION'],
            'sectorWeightingSettingMap': {'DXS': 'FIXED_INCOME_DXS', 'SPREAD_DURATION': 'FIXED_INCOME_SPREAD_DURATION'}
        };
    }


    /**
     * Expected relative setting
     */
    function getExpectedRelativeAttributionSetting(value) {
        return {
            'label': 'Relative Credit Attribution',
            'factors': ['oas_chg_contr'],
            'value': value,
            'supportedSectorWeightings': ['DXS', 'SPREAD_DURATION'],
            'sectorWeightingSettingMap': {'DXS': 'OAS_CHG_DXS', 'SPREAD_DURATION': 'OAS_CHG_SPREAD_DURATION'}
        };
    }

    /**
     * Expected holding return factors for FIXED_INCOME
     */
    function getExpectedHoldingReturnFactorsForFixedIncome() {
        const holdingReturnFactorsForFixedIncome: any = [{
            'header': 'Yield Curve',
            'eventData': 'Yield Curve',
            'children': [{
                'header': 'Risk Free Contribution',
                'eventData': 'rf_contr'
            }, {'header': 'Rolldown Contribution', 'eventData': 'rldn_contr'}, {
                'header': 'Duration Contribution',
                'eventData': 'dur_contr'
            }, {'header': 'Curve Contribution', 'eventData': 'crv_contr'}, {
                'header': 'Convexity Contribution',
                'eventData': 'conv_contr'
            }, {'header': 'Convexity Curve Contribution', 'eventData': 'cvx_crv_contr'}]
        }, {
            'header': 'FX',
            'eventData': 'FX',
            'children': [{'header': 'FX Contribution', 'eventData': 'fx_contr'}, {
                'header': 'FX Carry Contribution',
                'eventData': 'fxcarry_contr'
            }]
        }];

        return holdingReturnFactorsForFixedIncome;
    }

    /**
     * Expected holding return excess factors for FIXED_INCOME
     */
    function getExpectedHoldingReturnExcessFactorsForFixedIncome() {
        return [{
            'header': 'OAS',
            'eventData': 'OAS',
            'children': [{
                'header': 'OAS Change Contribution',
                'eventData': 'oas_chg_contr'
            }, {'header': 'OAS Level Contribution', 'eventData': 'oas_lev_contr'}]
        }, {'header': 'Mtg/Tsy Duration Contribution', 'eventData': 'mtb_dur_contr'}, {
            'header': 'VOL',
            'eventData': 'VOL',
            'children': [{
                'header': 'Volatility Duration Contribution',
                'eventData': 'nvoldur_cont'
            }, {'header': 'Vol Convexity Contribution', 'eventData': 'vol_cvx_contr'}]
        }, {
            'header': 'Other',
            'eventData': 'Other',
            'children': [{
                'header': 'Convert Delta Contribution',
                'eventData': 'delta_contr'
            }, {
                'header': 'Currency Swap Basis Contribution',
                'eventData': 'basis_contr'
            }, {
                'header': 'OIS Basis Contribution',
                'eventData': 'ois_bas_contr'
            }, {'header': 'Swap Spread Contribution', 'eventData': 'swap_spd_contr'}]
        }, {'header': 'Inflation Duration Contribution', 'eventData': 'infl_contr'}, {
            'header': 'Accounting',
            'eventData': 'Accounting',
            'children': [{
                'header': 'Price Contribution',
                'eventData': 'price_contr'
            }, {'header': 'Paydown Contribution', 'eventData': 'paydn_contr'}, {
                'header': 'Income Contribution',
                'eventData': 'income_contr'
            }, {
                'header': 'Financing Contribution',
                'eventData': 'fin_contr'
            }, {
                'header': 'Withholding Tax Contribution',
                'eventData': 'wht_contr'
            }, {
                'header': 'Security Lending Contribution',
                'eventData': 'sec_lending_contr'
            }, {
                'header': 'Price Difference Contribution',
                'eventData': 'px_diff_contr'
            }, {
                'header': 'Sec Litigation Contribution',
                'eventData': 'sec_litigation_contr'
            }, {'header': 'Total Difference Contribution', 'eventData': 'total_diff_contr'}]
        }];
    }

    /**
     * Expected trade based return factors for FIXED_INCOME
     */
    function getExpectedTradeBasedReturnFactorsForFixedIncome() {
        const tradeBasedReturnFactorsForFixedIncome: any = [{
            'header': 'Trade Based Factors',
            'eventData': 'Trade Based Factors',
            'children': [{
                'header': 'Commissions Contribution',
                'eventData': 'comm_contr'
            }, {'header': 'Trade Contribution', 'eventData': 'tradeprice_contr'}]
        }];

        return tradeBasedReturnFactorsForFixedIncome;
    }

    function getExpectedFactorsForFixedIncome() {
        return ['rf_contr', 'rldn_contr', 'dur_contr', 'conv_contr', 'crv_contr', 'tradeprice_contr', 'comm_contr', 'fx_contr', 'fxcarry_contr', 'cvx_crv_contr'];
    }

    /**
     * Expected factor columns for FIXED_INCOME
     */
    function getExpectedColTags() {
        return ['active_rf_contr', 'active_rldn_contr', 'active_dur_contr', 'active_crv_contr', 'active_conv_contr', 'active_cvx_crv_contr', 'active_fx_contr', 'active_fxcarry_contr', 'active_comm_contr', 'active_trade_contr'];
    }

    /**
     * Expected sector weighting for FIXED_INCOME
     */
    function getExpectedSectorWeightingForFixedIncome() {
        return 'MARKET_VALUE';
    }

    /**
     * Expected attribution calculator method for FIXED_INCOME
     */
    function getExpectedAttributionCalculatorMethodForFixedIncome() {
        return 'RELATIVE';
    }

    /**
     * Expected sector level for FIXED_INCOME
     */
    function getExpectedSectorLevelForFixedIncome() {
        return 'IMMEDIATE_PARENT_LEVEL';
    }

    /**
     * Expected ExposureMode for FIXED_INCOME
     */
    function getExpectedExposureModeForFixedIncome() {
        return 'MarketValue';
    }

    function getExpectedHoldingBasedFactorsForFixedIncome() {
        return [{
            'value': 'rf_contr',
            'label': 'Risk Free Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_rf_contr'
        }, {
            'value': 'rldn_contr',
            'label': 'Rolldown Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_rldn_contr'
        }, {
            'value': 'oas_chg_contr',
            'label': 'OAS Change Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_oas_chg_contr'
        }, {
            'value': 'oas_lev_contr',
            'label': 'OAS Level Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_oas_lev_contr'
        }, {
            'value': 'mtb_dur_contr',
            'label': 'Mtg/Tsy Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_mtb_dur_contr'
        }, {
            'value': 'nvoldur_cont',
            'label': 'Volatility Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'nvoldur_cont'
        }, {
            'value': 'vol_cvx_contr',
            'label': 'Vol Convexity Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'vol_cvx_contr'
        }, {
            'value': 'delta_contr',
            'label': 'Convert Delta Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_delta_contr'
        }, {
            'value': 'infl_contr',
            'label': 'Inflation Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_infl_contr'
        }, {
            'value': 'dur_contr',
            'label': 'Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_dur_contr'
        }, {
            'value': 'crv_contr',
            'label': 'Curve Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_crv_contr'
        }, {
            'value': 'conv_contr',
            'label': 'Convexity Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_conv_contr'
        }, {
            'value': 'cvx_crv_contr',
            'label': 'Convexity Curve Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_cvx_crv_contr'
        }, {
            'value': 'basis_contr',
            'label': 'Currency Swap Basis Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_basis_contr'
        }, {
            'value': 'fx_contr',
            'label': 'FX Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_fx_contr'
        }, {
            'value': 'fxcarry_contr',
            'label': 'FX Carry Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_fxcarry_contr'
        }, {
            'value': 'fx_spot_carry_contr',
            'label': 'FxSpotCarry',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_fx_spot_carry'
        }, {
            'value': 'ois_bas_contr',
            'label': 'OIS Basis Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'act_ois_bas_contr'
        }, {
            'value': 'swap_spd_contr',
            'label': 'Swap Spread Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'act_swap_spd_contr'
        }, {
            'value': 'price_contr',
            'label': 'Price Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_price_contr'
        }, {
            'value': 'paydn_contr',
            'label': 'Paydown Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_paydn_contr'
        }, {
            'value': 'income_contr',
            'label': 'Income Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_income_contr'
        }, {
            'value': 'fin_contr',
            'label': 'Financing Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_fin_contr'
        }, {
            'value': 'wht_contr',
            'label': 'Withholding Tax Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_wht_contr'
        }, {
            'value': 'sec_lending_contr',
            'label': 'Security Lending Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_sec_lend_cont'
        }, {
            'value': 'px_diff_contr',
            'label': 'Price Difference Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_px_diff_contr'
        }, {
            'value': 'sec_litigation_contr',
            'label': 'Sec Litigation Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_sec_lit_contr'
        }, {
            'value': 'mgr_selec_contr',
            'label': 'Manager Selection Contribution',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'act_mgrsel_contr'
        }, {
            'value': 'mngr_select',
            'label': 'Manager Selection',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'mngr_select'
        }, {
            'value': 'te_ms',
            'label': 'Manager Tracking',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'te_ms'
        }, {
            'value': 'market_contr',
            'label': 'Market Basis Contribution',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_market_contr'
        }, {
            'value': 'option_gl_contr',
            'label': 'Option Overwrite Contribution',
            'assetClassList': ['EQ_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_opt_gl_contr'
        }, {
            'value': 'total_diff_contr',
            'label': 'Total Difference Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'act_total_diff_contr'
        }];
    }

    function getExpectedTradeBasedFactorsForFixedIncome() {
        return [{
            'value': 'comm_contr',
            'label': 'Commissions Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            factorGroup: '',
            factorGroupList: [ 'Transaction based factors', 'Trade based' ],
            'activeColumnTag': 'active_comm_contr'
        }, {
            'value': 'tradeprice_contr',
            'label': 'Trade Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            factorGroup: '',
            factorGroupList: [ 'Transaction based factors', 'Trade based' ],
            'activeColumnTag': 'active_trade_contr'
        }];
    }

    function mockModifyColumns(): void {
        component.columns.push(ColumnConfig.createColumn('active_rf_contr'));
        component.columns.push(ColumnConfig.createColumn('active_rldn_contr'));
        component.columns.push(ColumnConfig.createColumn('active_dur_contr'));
        component.columns.push(ColumnConfig.createColumn('active_crv_contr'));
        component.columns.push(ColumnConfig.createColumn('active_conv_contr'));
        component.columns.push(ColumnConfig.createColumn('active_cvx_crv_contr'));
        component.columns.push(ColumnConfig.createColumn('active_fx_contr'));
        component.columns.push(ColumnConfig.createColumn('active_fxcarry_contr'));
        component.columns.push(ColumnConfig.createColumn('active_comm_contr'));
        component.columns.push(ColumnConfig.createColumn('active_trade_contr'));
    }

    it('should test isTopDownOrBottomUpLookthroughSelected method', () => {
        // Set up the necessary properties in your component
        component.attributionSettings = new AttributionSettings();
        component.attributionSettings.bottomsUpWithLookthrough = true;

        // Call the method with a specific scenario
        expect(component.isTopDownOrBottomUpLookthroughSelected(PerformanceConstants.CANNED_METHOD.EB_MULTI_ASSET_xFXMTE)).toBeTruthy();

        component.attributionSettings.bottomsUpWithLookthrough = undefined;
        component.attributionSettings.topDownWithoutLookthrough = true;

        expect(component.isTopDownOrBottomUpLookthroughSelected(PerformanceConstants.CANNED_METHOD.MULTI_ASSET)).toBeTruthy();
    });

    it('should reset look through settings', () => {
        // Set the initial values
        component.attributionSettings = new AttributionSettings();
        component.attributionSettings.bottomsUpWithLookthrough = true;
        component.attributionSettings.topDownWithoutLookthrough = true;

        // Call the method
        component['resetLookThroughOnCurrentSettings']();

        // Assert the result
        expect(component.attributionSettings.bottomsUpWithLookthrough).toBeUndefined();
        expect(component.attributionSettings.topDownWithoutLookthrough).toBeUndefined();
    });
});
