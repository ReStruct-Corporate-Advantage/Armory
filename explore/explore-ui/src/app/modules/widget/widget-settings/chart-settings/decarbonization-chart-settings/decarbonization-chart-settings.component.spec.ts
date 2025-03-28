import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {TestUtils} from '@utils/test.utils';

import {WidgetConfigFactory} from '../../../../../factories';
import {Widget} from '@models/widget/widget.model';
import {WorkspaceStore} from '@stores/index';
import {DecarbonizationChartSettingsComponent} from './decarbonization-chart-settings.component';
import { DecarbonizationChartSettings } from '@models/widget/inputs/decarbonization-chart-settings.model';

describe('DecarbonizationChartSettingsComponent', () => {
    let component: DecarbonizationChartSettingsComponent;
    let fixture: ComponentFixture<DecarbonizationChartSettings>;
    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DecarbonizationChartSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(DecarbonizationChartSettingsComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.DECARBONIZATION_WIDGET);

        component['widgetConfigInput']= WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.DECARBONIZATION_WIDGET, 'decarbonizationChartSettings');
        component['inputs'] = widget.getCombinedInputs();
        component['widgetInput'] = new DecarbonizationChartSettings();
        component.portfolioTargets = [];
    });

    it('check if component is initialized correctly', () => {
        jest.spyOn(component, 'initializeComponent');
        component.ngOnInit();
        expect(component.portfolioTargets).not.toBeUndefined();
        expect(component.initializeComponent).toHaveBeenCalled();
    });

    it('check openDecarbonizationModelOverview', () => {
        jest.spyOn(window, 'open');
        component.openDecarbonizationModelOverview();
        expect(window.open).toHaveBeenCalled();
    });

    it('check updateColTagOnEmissionMetricChange', () => {
        component.selectedEmissionScope = 's12';
        const event = {detail: {value: {value: 'EVICIntensity'}}};
        component.updateColTagOnEmissionMetricChange(event as CustomEvent);
        expect(component.selectedEmissionMetric).toEqual('EVICIntensity');
        expect(component['widgetInput'].columnTag).toEqual('ta_evic_int_s12');
    });

    it('check updateColTagOnEmissionScopeChange', () => {
        component.selectedEmissionMetric = 'EVICIntensity';
        const event = {detail: {value: {value: 's123'}}};
        component.updateColTagOnEmissionScopeChange(event as CustomEvent);
        expect(component.selectedEmissionScope).toEqual('s123');
        expect(component['widgetInput'].columnTag).toEqual('ta_evic_int_s123');
    });

    it('check updateAggregationMethod', () => {
        const event = {detail: {value: {value: 2}}};
        component.updateAggregationMethod(event as CustomEvent);
        expect(component['widgetInput'].aggregationMethod).toEqual(2);
    });

    it('check updateTargetsTypes', () => {
        const event = {detail: {value: {value: 'TA_METRIC_CODE_PRIORITY'}}};
        component.updateTargetsTypes(event as CustomEvent);
        expect(component['widgetInput'].emissionTargetType).toEqual('TA_METRIC_CODE_PRIORITY');
    });

    it('check updateTimeframe', () => {
        const event = {detail: {value: {value: '2026'}}};
        component.updateTimeframe(event as CustomEvent);
        expect(component['widgetInput'].emissionStartYear).toEqual('2026');
    });

    it('check updateScenarioType', () => {
        const event = {detail: {value: {value: 'Blended Scenario'}}};
        component.updateScenarioType(event as CustomEvent);
        expect(component['widgetInput'].selectedScenario).toEqual('Blended Scenario');
    });

    it('check add/delete PortfolioTarget', () => {
        expect(component.portfolioTargets.length).toEqual(0);
        component.addPortfolioTarget();
        expect(component.portfolioTargets.length).toEqual(1);
        component.deletePortfolioTarget(0);
        expect(component.portfolioTargets.length).toEqual(0);
    });

    it('check reductionTargetValueChanged', () => {
        component.addPortfolioTarget();
        const event = {detail: {value:undefined}};
        component.reductionTargetValueChanged(event as CustomEvent, 0);
        expect(component.portfolioTargets[0].reductionPercent).toEqual(undefined);
        const event1 = {detail: {value: 40}};
        component.reductionTargetValueChanged(event1 as CustomEvent, 0);
        expect(component.portfolioTargets[0].reductionPercent).toEqual(40);
    });

    it('check onStartYearChange', () => {
        component.addPortfolioTarget();
        const event = {detail: {value: '2019'}};
        component.onStartYearChange(event as CustomEvent, 0);
        expect(component.portfolioTargets[0].startYear).toEqual('2019');
    });

    it('check onTargetYearChange', () => {
        component.addPortfolioTarget();
        const event = {detail: {value: '2039'}};
        component.onTargetYearChange(event as CustomEvent, 0);
        expect(component.portfolioTargets[0].targetYear).toEqual('2039');
    });

    it('should return true for valid metric and scope', () => {
        expect(component.checkIfSovsMetricsSelected('IntensityGDP')).toBe(true);
        expect(component.checkIfSovsMetricsSelected('IntensityGDPPPP')).toBe(true);
        expect(component.checkIfSovsMetricsSelected('IntensityCAPITA')).toBe(true);
        expect(component.checkIfSovsMetricsSelected('IntensitySOVDEBT')).toBe(true);
        expect(component.checkIfSovsMetricsSelected('InvalidMetric')).toBe(false);
        expect(component.checkIfSovsMetricsSelected('')).toBe(false);
        expect(component.checkIfSovsMetricsSelected('IntensityXYZ')).toBe(false);
    });

    it('should initialize component with financed emissions aggregation options', () => {
        component['widgetInput'].columnTag = 'financed_emis_s12';
        component.initializeComponent();
        expect(component.aggregationMethodOptions[0].values.length).toBe(1);
        expect(component.aggregationMethodOptions[0].values[0].value).toBe(2);
    });

    it('should initialize component with correct emission metric and scope', () => {
        component['widgetInput'].columnTag = 'ta_rev_int_s12';
        component.initializeComponent();
        expect(component.selectedEmissionMetric).toBe('RevenueIntensity');
        expect(component.selectedEmissionScope).toBe('s12');
    });

    it('should initialize component with financed emissions aggregation options', () => {
        component['widgetInput'].columnTag = 'financed_emis_s12';
        component.initializeComponent();
        expect(component.aggregationMethodOptions[0].values.length).toBe(1);
        expect(component.aggregationMethodOptions[0].values[0].value).toBe(2);
    });

    it('should initialize component with sovs column options', () => {
        component['widgetInput'].columnTag = 'TA_SOV_SCOPE1_INTENSITY_GDP';
        component.initializeComponent();
        expect(component.isSovsMetricsSelected).toBe(true);
    });

    it('should initialize component with default aggregation options', () => {
        component['widgetInput'].columnTag = 'ta_rev_int_s12';
        component.initializeComponent();
        expect(component.isSovsMetricsSelected).toBe(false);
        expect(component.aggregationMethodOptions[0].values.length).toBe(3);
    });
    it('should update column tag on emission metric change for sovs column option', () => {
        const event = { detail: { value: { value: 'IntensityGDP' } } };
        component.updateColTagOnEmissionMetricChange(event as CustomEvent);
        expect(component.SovsColumnOption).toBeUndefined;
        expect(component.widgetInput.columnTag).toBe('TA_SOV_SCOPE1_INTENSITY_GDP');
    });

    it('should update column tag and aggregation method for financed emissions', () => {
        const event = { detail: { value: { value: 'FinancedEmissions' } } };
        component.updateColTagOnEmissionMetricChange(event as CustomEvent);
        expect(component.isSovsMetricsSelected).toBe(false);
        expect(component.widgetInput.aggregationMethod).toBe(2);
        expect(component.widgetInput.columnTag).toBe('financed_emis_s12');
        expect(component.widgetInput.emissionTargetType).toBe('TA_METRIC_CODE_PRIORITY');
    });

    it('should update column tag and aggregation method for other metrics', () => {
        const event = { detail: { value: { value: 'RevenueIntensity' } } };
        component.updateColTagOnEmissionMetricChange(event as CustomEvent);
        expect(component.isSovsMetricsSelected).toBe(false);
        expect(component.widgetInput.aggregationMethod).toBe(1401);
        expect(component.widgetInput.columnTag).toBe('ta_rev_int_s12');
        expect(component.widgetInput.emissionTargetType).toBe('TA_METRIC_CODE_PRIORITY');
    });

});