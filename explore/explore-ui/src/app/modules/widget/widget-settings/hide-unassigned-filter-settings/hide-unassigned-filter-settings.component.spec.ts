import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HideUnassignedFilterSettingsComponent} from './hide-unassigned-filter-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HideUnassignedFilterInput} from '@models/widget/inputs/hide-unassigned-filter-input.model';

describe('HideUnassignedFilterSettingsComponent', () => {
    let component: HideUnassignedFilterSettingsComponent;
    let fixture: ComponentFixture<HideUnassignedFilterSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HideUnassignedFilterSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(HideUnassignedFilterSettingsComponent);
        component = fixture.componentInstance;
        component.inputs = new Map<string, HideUnassignedFilterInput>();
        component.widgetConfigInput = {
            inputConfigType: 'hideUnassignedFilter',
            inputTitle: 'Settings',
            inputName: 'hideUnassignedFilter'
        };
        component.widgetInput = new HideUnassignedFilterInput({hideUnassignedFilter: false});
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test onCheckboxChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: {checked: true}, srcEvent: null}});
        expect(component.widgetInput.hideUnassignedFilter).toBeFalsy();
        component.onCheckboxChanged(customEvent);
        expect(component.widgetInput.hideUnassignedFilter).toBeTruthy();
    });
});
