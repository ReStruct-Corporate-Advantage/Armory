import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PieChartDisplaySettingsComponent} from './pie-chart-display-settings.component';
import {PieChartDisplayAsOption, PieChartDisplayInput} from '@models/widget/inputs/chart-settings/pie-chart-display-input.model';

describe('PieChartDisplaySettingsComponent', () => {
    let component: PieChartDisplaySettingsComponent;
    let fixture: ComponentFixture<PieChartDisplaySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PieChartDisplaySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(PieChartDisplaySettingsComponent);
        component = fixture.componentInstance;
        component.widgetInput = new PieChartDisplayInput({displayAs: 'pie'});
    });

    describe('Test onRadioGroupChanged method', () => {
        it('onRadioGroupChanged should change the value properly', () => {
            // Change it to sunburst
            component.onRadioGroupChanged({eventData: PieChartDisplayAsOption.SUNBURST});
            expect(component.widgetInput.displayAs).toEqual(PieChartDisplayAsOption.SUNBURST);

            // Change it to pie
            component.onRadioGroupChanged({eventData: PieChartDisplayAsOption.PIE});
            expect(component.widgetInput.displayAs).toEqual(PieChartDisplayAsOption.PIE);
        });
    });

    describe('Test initializeDisplayAsOptions method', () => {
        it('initializeDisplayAsOptions should create options properly', () => {
            component.initializeDisplayAsOptions();

            // First option
            expect(component.displayAsOptions[0].label).toEqual('Pie chart');
            expect(component.displayAsOptions[0].eventData).toEqual(PieChartDisplayAsOption.PIE);
            // The pie chart options should be checked
            expect(component.displayAsOptions[0].checked).toEqual(true);

            // Second option
            expect(component.displayAsOptions[1].label).toEqual('Sunburst chart');
            expect(component.displayAsOptions[1].eventData).toEqual(PieChartDisplayAsOption.SUNBURST);
            expect(component.displayAsOptions[1].checked).toEqual(false);
        });
    });
});
