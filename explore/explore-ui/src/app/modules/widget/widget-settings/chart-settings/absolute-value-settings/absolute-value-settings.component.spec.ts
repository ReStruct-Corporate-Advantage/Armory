import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AbsoluteValueSettingsComponent} from './absolute-value-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AbsoluteValueSetting} from '@models/widget/inputs/chart-settings/absolute-value-setting.model';

describe('AbsoluteValueSettingsComponent', () => {
    let component: AbsoluteValueSettingsComponent;
    let fixture: ComponentFixture<AbsoluteValueSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AbsoluteValueSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(AbsoluteValueSettingsComponent);
        component = fixture.componentInstance;
        component.widgetInput = new AbsoluteValueSetting({useAbsoluteValue: false});
    });

    describe('Test onRadioGroupChanged method', () => {
        it('onRadioGroupChanged should change the value properly', () => {
            // Change it to 'Treat as Absolute Value'
            component.onRadioGroupChanged({eventData: true});
            expect(component.widgetInput.useAbsoluteValue).toEqual(true);

            // Change it to 'Treat as Zero'
            component.onRadioGroupChanged({eventData: false});
            expect(component.widgetInput.useAbsoluteValue).toEqual(false);
        });
    });

    describe('Test initializeTreatAsOptions method', () => {
        it('initializeTreatAsOptions should create options properly', () => {
            component.initializeTreatAsOptions();

            // First option
            expect(component.treatAsOptions[0].label).toEqual('Treat as zero');
            expect(component.treatAsOptions[0].eventData).toEqual(false);
            // The treat as zero options should be checked
            expect(component.treatAsOptions[0].checked).toEqual(true);

            // Second option
            expect(component.treatAsOptions[1].label).toEqual('Treat as absolute value');
            expect(component.treatAsOptions[1].eventData).toEqual(true);
            expect(component.treatAsOptions[1].checked).toEqual(false);
        });
    });
});
