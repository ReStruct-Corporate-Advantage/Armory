import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CoreDefinitionStore, RiskParameter} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '../../core-risk.constants';
import {AdvancedRiskSettings} from '../../models/advanced-risk-settings/advanced-risk-settings.model';
import {PORTFOLIO_SEARCH_SERVICE_TOKEN} from '../../tokens';
import {AdvancedRiskSettingsModalComponent} from './advanced-risk-settings-modal.component';
import {PositionModeSettings} from '../../models/position-mode-settings/position-mode-settings.model';
import {PositionModeType} from '../../enums/position-mode.enum';
import {FilterScaling} from '../../enums/filter-scaling.enum';

describe('AdvancedRiskSettingsComponent', () => {
    let component: AdvancedRiskSettingsModalComponent;
    let fixture: ComponentFixture<AdvancedRiskSettingsModalComponent>;

    const portfolioSearchServiceStub = {
        searchPortfolio$: jest.fn()
    };

    beforeAll(() => {
        CoreDefinitionStore.excludeFactorBlock = [new RiskParameter({
            'value': 'a',
            'text': 'A'
        }), new RiskParameter({
            'value': 'b',
            'text': 'B'
        }), new RiskParameter({
            'value': 'c',
            'text': 'C'
        })];
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdvancedRiskSettingsModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: PORTFOLIO_SEARCH_SERVICE_TOKEN, useValue: portfolioSearchServiceStub}
            ]
        });

        fixture = TestBed.createComponent(AdvancedRiskSettingsModalComponent);
        component = fixture.componentInstance;
        component.advancedRiskSettingsInput = new AdvancedRiskSettings();
        component.advancedRiskSettingsInput.market = 'market';
        component.advancedRiskSettingsInput.excludeBlock = 'b';
        component.positionModeSettingsInput = new PositionModeSettings();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test ngOnInit', () => {
        component.ngOnInit();
        expect(component.advancedRiskSettings).not.toBeUndefined();
        expect(component.advancedRiskSettings.market).toBe('market');
        expect(component.advancedRiskSettings.excludeBlock).toBe('b');
        expect(component.positionModeSettings).not.toBeUndefined();
        expect(component.positionModeSettings.positionModeSelection).toBe(PositionModeType.AS_OF_W);
        expect(component.availableExcludeBlocks[0].values.length).toBe(5);
        expect(component.availableExcludeBlocks[0].values[2].isSelected).toBeTruthy();
        expect(component.filerScalingOptions).not.toBeUndefined();
        expect(component.filerScalingOptions.length).toBe(2);
        expect(component.filerScalingOptions[0].label).not.toBeNull();
        expect(component.filerScalingOptions[0].eventData).not.toBeUndefined();
        expect(component.availableAssetClassCovarianceOptions).not.toBeUndefined(); // len - 3
        expect(component.availableAssetClassCovarianceOptions.length).not.toBe(0);
    });

    it('tests onExcludeFactorSelectionChanged - value picked from parent', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.excludeBlock = 'b';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name2');
        expect(component.advancedRiskSettings.excludeBlock === 'b').toBeTruthy();
        component.onExcludeFactorSelectionChanged({'detail': {'value': 'b'}} as CustomEvent);
        expect(component.advancedRiskSettings.excludeBlock === 'b').toBeTruthy();
    });

    it('tests onExcludeFactorSelectionChanged - value picked from same level', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.excludeBlock = 'b';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name2');
        expect(component.advancedRiskSettings.excludeBlock === 'b').toBeTruthy();
        component.onExcludeFactorSelectionChanged({detail: {value: {value: 'c'}}} as CustomEvent);
        expect(component.advancedRiskSettings.excludeBlock === 'c').toBeTruthy();
    });

    it('tests onOtherExcludeFactorChanged', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.excludeBlock = 'b';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name2');
        expect(component.advancedRiskSettings.excludeBlock === 'b').toBeTruthy();
        const event = {detail: {value: 'ABCD'}};
        component.onOtherExcludeFactorChanged(event as CustomEvent);
        expect(component.advancedRiskSettings.excludeBlock === 'ABCD').toBeTruthy();
        expect(component.inputExcludeFactor === 'ABCD').toBeTruthy();
    });


    it('tests onMarketChanged', () => {
        expect(component.advancedRiskSettings.market === 'market');
        component.advancedRiskSettings.name = 'name1';
        component.onMarketChanged('PEP');
        expect(component.advancedRiskSettings.market === 'PEP');
    });

    it('tests onMarketChanged - parent source', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.market = 'ticker1';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        expect(component.advancedRiskSettings.market === 'ticker1').toBeTruthy();
        component.advancedRiskSettings.name = 'name1';
        component.onMarketChanged('ticker1');
        expect(component.advancedRiskSettings.market === 'ticker1').toBeTruthy();
    });

    it('tests excludeReset - picks reset from parent', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.excludeBlock = 'b';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        component.advancedRiskSettings.excludeBlock = 'a';
        expect(component.advancedRiskSettings.excludeBlock === 'a').toBeTruthy();
        component.excludeReset();
        expect(component.advancedRiskSettings.excludeBlock === 'b').toBeTruthy();
    });

    it('tests marketReset - picks reset from parent', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.market = 'ticker1';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        component.advancedRiskSettings.market = 'ticker2';
        expect(component.advancedRiskSettings.market === 'ticker2').toBeTruthy();
        component.marketReset();
        expect(component.advancedRiskSettings.market === 'ticker1').toBeTruthy();
    });

    it('tests filterScalingReset - picks reset from parent', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.filterScaling = FilterScaling.PORTFOLIO_NAV;
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        component.advancedRiskSettings.filterScaling = FilterScaling.SECTOR_NOTIONAL_MARKET_VALUE;
        expect(component.advancedRiskSettings.filterScaling === FilterScaling.SECTOR_NOTIONAL_MARKET_VALUE).toBeTruthy();
        component.filterScalingReset();
        expect(component.advancedRiskSettings.filterScaling === FilterScaling.PORTFOLIO_NAV).toBeTruthy();
    });

    it('tests assetClassCovarianceReset - picks reset from parent', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.assetClassCovariance = 'abc';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        component.advancedRiskSettings.assetClassCovariance = 'test';
        expect(component.advancedRiskSettings.assetClassCovariance === 'test').toBeTruthy();
        component.assetClassCovarianceReset();
        expect(component.advancedRiskSettings.assetClassCovariance === 'abc').toBeTruthy();
    });

    it('tests dxsBlockReset - picks reset from parent', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.dxsBlock = 'abc';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        component.advancedRiskSettings.dxsBlock = 'test';
        expect(component.advancedRiskSettings.dxsBlock === 'test').toBeTruthy();
        component.dxsBlockReset();
        expect(component.advancedRiskSettings.dxsBlock === 'abc').toBeTruthy();
    });

    it('tests scaleDxsExposuresReset - picks reset from parent', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        parentAdvancedRiskSettings.scaleDxsExposures = true;
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        component.advancedRiskSettings.scaleDxsExposures = false;
        expect(component.advancedRiskSettings.scaleDxsExposures).toEqual(false);
        component.scaleDxsExposuresReset();
        expect(component.advancedRiskSettings.scaleDxsExposures).toEqual(true);
    });

    it('tests assumeZeroAverageReturnReset - picks reset from parent', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        parentAdvancedRiskSettings.assumeZeroAverageReturn = true;
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        component.advancedRiskSettings.assumeZeroAverageReturn = false;
        expect(component.advancedRiskSettings.assumeZeroAverageReturn).toEqual(false);
        component.assumeZeroAverageReturnReset();
        expect(component.advancedRiskSettings.assumeZeroAverageReturn).toEqual(true);
    });

    it('tests onFilterScalingChanged - parent source', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.filterScaling = FilterScaling.PORTFOLIO_NAV;
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        expect(component.advancedRiskSettings.filterScaling === FilterScaling.PORTFOLIO_NAV).toBeTruthy();
        component.onFilterScalingChanged({detail: {value: {eventData: FilterScaling.SECTOR_NOTIONAL_MARKET_VALUE}}});
        expect(component.advancedRiskSettings.filterScaling === FilterScaling.SECTOR_NOTIONAL_MARKET_VALUE).toBeTruthy();
    });

    it('tests onExposureLookbackChanged', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.exposureLookback = 9;
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        expect(component.advancedRiskSettings.exposureLookback === 9).toBeTruthy();
        const event: any = {detail: {value: 18}};
        component.onExposureLookbackChanged(event);
        expect(component.advancedRiskSettings.exposureLookback === 18).toBeTruthy();
    });

    it('tests onRiskMatrixChanged', () => {
        component.advancedRiskSettings = new AdvancedRiskSettings(undefined, 'name1');
        expect(component.advancedRiskSettings.riskMatrix === 1).toBeTruthy();
        component.advancedRiskSettings.riskMatrix = 11;
        expect(component.advancedRiskSettings.riskMatrix === 11).toBeTruthy();
        const event: any = {detail: {value: 13}};
        component.onRiskMatrixChanged(event);
        expect(component.advancedRiskSettings.riskMatrix === 13).toBeTruthy();
    });

    it('tests RiskMatrixReset - picks reset as default', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.riskMatrix = 11;
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        component.advancedRiskSettings.riskMatrix = 13;
        expect(component.advancedRiskSettings.riskMatrix === 13).toBeTruthy();
        component.riskMatrixReset();
        //it doesn't fall back on parent as riskMatrix is not a part of portfolio settings
        expect(component.advancedRiskSettings.riskMatrix === 1).toBeTruthy();
    });

    it('tests onDxSBlockChange - parent source', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.dxsBlock = 'abc';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        expect(component.advancedRiskSettings.dxsBlock === 'abc').toBeTruthy();
        component.onDxSBlockChange({detail: {value: 'test'}});
        expect(component.advancedRiskSettings.dxsBlock === 'test').toBeTruthy();
    });

    it('tests onAssetClassCovarianceSelectionChanged - parent source', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.assetClassCovariance = 'abc';
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        expect(component.advancedRiskSettings.assetClassCovariance === 'abc').toBeTruthy();
        component.onAssetClassCovarianceSelectionChanged({detail: {value: { value: 'test' }}});
        expect(component.advancedRiskSettings.assetClassCovariance === 'test').toBeTruthy();
    });

    it('tests onScaleDxsExposuresChanged', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        parentAdvancedRiskSettings.scaleDxsExposures = true;
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        expect(component.advancedRiskSettings.scaleDxsExposures).toEqual(true);
        const event = {detail: {value: {checked: false}}};
        component.onScaleDxSExposuresChanged(event);
        expect(component.advancedRiskSettings.scaleDxsExposures).toEqual(false);
    });

    it('tests onAssumeZeroAverageReturnChanged', () => {
        const parentAdvancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentAdvancedRiskSettings.assumeZeroAverageReturn = true;
        component.advancedRiskSettings = new AdvancedRiskSettings(parentAdvancedRiskSettings, 'name1');
        expect(component.advancedRiskSettings.assumeZeroAverageReturn).toEqual(true);
        const event = {detail: {value: {checked: false}}};
        component.onAssumeZeroAverageReturnChanged(event);
        expect(component.advancedRiskSettings.assumeZeroAverageReturn).toEqual(false);
    });


    describe('closeModal Test', () => {
        it('should call event emit when apply was clicked', () => {
            component.advancedRiskSettings.excludeBlock = 'b';
            component.advancedRiskSettings.market = 'marketNew';
            jest.spyOn(component.updateAdvancedRiskSettingsEvent, 'emit');
            jest.spyOn(component.updatePositionModeSettingsEvent,'emit');
            component.closeModal(true);
            expect(component.updateAdvancedRiskSettingsEvent.emit).toHaveBeenCalled();
            expect(component.updatePositionModeSettingsEvent.emit).toHaveBeenCalled();

        });
        it('should close modal', () => {
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();
            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });
});
