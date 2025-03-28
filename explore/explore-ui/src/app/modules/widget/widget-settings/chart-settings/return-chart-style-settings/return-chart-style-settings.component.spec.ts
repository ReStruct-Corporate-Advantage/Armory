import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ReturnChartStyleSettingsComponent} from './return-chart-style-settings.component';
import {ReturnChartStyleSettingsModel} from '@models/widget/inputs/chart-settings/return-chart-style-settings.model';
import {ExploreCheckbox} from '@blk/explore-ui-core';

describe('ReturnChartStyleSetting Component test cases', () => {
    let component: ReturnChartStyleSettingsComponent;
    let fixture: ComponentFixture<ReturnChartStyleSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ReturnChartStyleSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ReturnChartStyleSettingsComponent);
        component = fixture.componentInstance;
        component.widgetInput = new ReturnChartStyleSettingsModel({
            showPortfolio: true, showBenchmark: true, showActive: true,
            showPortfolioCumulative: true, showBenchmarkCumulative: true, showActiveCumulative: true
        });
    });

    it('Initialize stackedOptionData for checkboxes', () => {
        const stackedData: ExploreCheckbox[] = [
            new ExploreCheckbox('Portfolio', true, false),
            new ExploreCheckbox('Benchmark', true, false),
            new ExploreCheckbox('Active', true, false),
            new ExploreCheckbox('Portfolio cumulative', true, false),
            new ExploreCheckbox('Benchmark cumulative', true, false),
            new ExploreCheckbox('Active cumulative', true, false)];

        // Create array of all three checkbox with their checked value
        component.initializeComponent();
        expect(component.stackedStyleOptions).toStrictEqual(stackedData);
    });

    it('Update checkbox value in model test case', () => {
        const event = {detail: {value: {label: 'Portfolio', checked: false}}};
        component.updateStyleOptions(event as CustomEvent);

        // Portfolio checkbox value will be updated and other would be at previous value
        expect(component.widgetInput.showPortfolio).toBeFalsy();
        // Retain value what is already there
        expect(component.widgetInput.showBenchmark).toBeTruthy();
    });

    it('change in date value should reflect in model', () => {
       component.updateDateFormatValue('M/yy');
        expect(component.widgetInput.dateFormat).toBe('M/yy');
    });

    describe('Test onShowDataMarkerChanged method', () => {
        it('onShowDataMarkerChanged should change the value properly', () => {
            expect(component.widgetInput.showDataMarker).toBeTruthy();

            // check show total line option
            const event = {detail: { value: {checked: false}}};
            component.onShowDataMarkerValueChanged(event as CustomEvent);
            expect(component.widgetInput.showDataMarker).toBeFalsy();
        });
    });
});
