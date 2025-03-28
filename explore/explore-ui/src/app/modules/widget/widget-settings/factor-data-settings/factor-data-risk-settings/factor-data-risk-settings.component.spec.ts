import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FactorDataRiskSettingsComponent} from './factor-data-risk-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {FactorDataRiskMatrixSettings} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';

describe('FactorDataRiskSettingsComponent', () => {
    let component: FactorDataRiskSettingsComponent;
    let fixture: ComponentFixture<FactorDataRiskSettingsComponent>;

    let factorDataChartSettings: FactorDataChartSettings;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FactorDataRiskSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(FactorDataRiskSettingsComponent);
        component = fixture.componentInstance;
        component.widgetConfigInput = {
            inputConfigType: 'riskSettings',
            inputName: 'riskSettings',
            inputTitle: 'Risk Settings',
        };
        component.inputs = new Map();
        component.inputs.set(RiskSettings.CONFIG_TYPE, new RiskSettings());

        factorDataChartSettings = new FactorDataChartSettings();
        factorDataChartSettings.isTimeSeriesMode = true;
        factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.FACTOR_LEVELS;

        const factorDataRiskMatrixSettings = new FactorDataRiskMatrixSettings();
        factorDataRiskMatrixSettings.comparisonDate = '03/15/2021';

        component.inputs.set(FactorDataChartSettings.configType, factorDataChartSettings);
        component.inputs.set(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS, new RiskSettings());
        component.inputs.set(FactorDataRiskMatrixSettings.configType, factorDataRiskMatrixSettings);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('test ngOnInit', () => {
        it('test with factorDataChartSettings.factorTimeSeriesSelectedOption = Factor Levels', () => {
            jest.spyOn(component, 'setShowComparisonSettings').mockImplementationOnce(() => {});
            component.hideRiskSettingsMessage = undefined;
            component.ngOnInit();
            expect(component.cssClassNameForRiskSettings).not.toBeDefined();
        });
        it('test with other settings', () => {
            jest.spyOn(component, 'setShowComparisonSettings').mockImplementationOnce(() => {});
            component.factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.CORRELATIONS;
            component.hideRiskSettingsMessage = undefined;
            component.ngOnInit();
            expect(component.cssClassNameForRiskSettings).toBeDefined();
            expect(component.cssClassNameForRiskSettings).not.toBeNull();
        });
    });

    describe('test setShowComparisonSettings', () => {
        it('test if isTimeSeriesMode is true', () => {
            factorDataChartSettings.isTimeSeriesMode = true;
            component['setShowComparisonSettings']();
            expect(component.showComparisonSettings).toBeFalsy();
            expect(component.comparisonMatrixRiskSettings).toBeUndefined();
        });
        it('test if isTimeSeriesMode is false', () => {
            factorDataChartSettings.isTimeSeriesMode = false;
            component['setShowComparisonSettings']();
            expect(component.showComparisonSettings).toBeTruthy();
            expect(component.comparisonMatrixRiskSettings).toBeDefined();
        });
    });
});
