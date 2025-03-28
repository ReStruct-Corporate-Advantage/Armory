import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ChartWidgetInputConfigType, WidgetInput} from '@blk/explore-ui-core';
import {PgsStackedBarChartSettingsComponent} from './pgs-stacked-bar-chart-settings.component';
import {PgsStackedBarChartSettingsModel} from '@models/widget/inputs/chart-settings/pgs-stacked-bar-chart-settings.model';

describe('PgsStackedBarChartSettingsComponent', () => {
    let component: PgsStackedBarChartSettingsComponent;
    let fixture: ComponentFixture<PgsStackedBarChartSettingsComponent>;

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PgsStackedBarChartSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(PgsStackedBarChartSettingsComponent);
        component = fixture.componentInstance;
        component.inputs = new Map<string, WidgetInput>();
        component.inputs.set(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS, new PgsStackedBarChartSettingsModel({isStackedBarChart: true}));
    });

    it('should initialize isStackedBarChart', () => {
        component.ngOnInit();
        expect(component.isStackedBarChart).toBeTruthy();
    });

    it('should change check box', () => {
        component.ngOnInit();
        component.onRadioGroupChanged({eventData: true});
        expect(component.isStackedBarChart).toBeTruthy();
    });
});
