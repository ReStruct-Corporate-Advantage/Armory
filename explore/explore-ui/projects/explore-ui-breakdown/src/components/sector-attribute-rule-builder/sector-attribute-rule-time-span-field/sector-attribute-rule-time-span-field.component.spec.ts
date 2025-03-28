import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';

import {SectorAttributeRuleTimeSpanFieldComponent} from './sector-attribute-rule-time-span-field.component';
import {SectorConstants} from '../../../constants/sector.constants';

describe('SectorAttributeRuleTimeSpanComponent', () => {
    let component: SectorAttributeRuleTimeSpanFieldComponent;
    let fixture: ComponentFixture<SectorAttributeRuleTimeSpanFieldComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SectorAttributeRuleTimeSpanFieldComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SectorAttributeRuleTimeSpanFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Test ngOnChanges', () => {
        jest.spyOn(component.valueChange, 'emit');
        component.ngOnChanges(
            {}
        );
        expect(component.valueChange.emit).toHaveBeenCalledTimes(0);
        component.ngOnChanges(
            {
                value: new SimpleChange(null, null, true)
            }
        );
        expect(component.valueChange.emit).toHaveBeenLastCalledWith('0D');
        component.value = '1Y';
        component.ngOnChanges(
            {
                value: new SimpleChange(null, '1Y', true)
            }
        );
        expect(component.valueChange.emit).toHaveBeenLastCalledWith('1Y');
    });

    it('Test validateAndParseTime and setDefaultTimeSpan', function () {
        jest.spyOn(component.valueChange, 'emit');
        expect(component['validateAndParseTimeSpanRule']('1Y')).toBeTruthy();
        expect(component.valueChange.emit).toHaveBeenCalledWith('1Y');
        expect(component.timeSpanUnitValue).toEqual(1);
        expect(component.timeSpanSelectedUnit.value).toEqual(SectorConstants.TIME_SPAN_UNITS.Y.value);
        expect(component['validateAndParseTimeSpanRule']('1S')).toBeFalsy();
        expect(component.valueChange.emit).toHaveBeenLastCalledWith('0D');
        expect(component.timeSpanUnitValue).toEqual(0);
        expect(component.timeSpanSelectedUnit.value).toEqual(SectorConstants.TIME_SPAN_UNITS.D.value);
    });


    it('Test Time Span Value Change', () => {
        jest.spyOn(component.valueChange, 'emit');
        const event = {detail: {value: 2}};
        component.onUnitValueChanged(event as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(null);
        component.timeSpanSelectedUnit = SectorConstants.TIME_SPAN_UNITS.D;
        component.onUnitValueChanged(event as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith('2D');
        const unitChangeEvent = {detail: {value: SectorConstants.TIME_SPAN_UNITS.Y}};
        component.onUnitChanged(unitChangeEvent as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith('2Y');
        component.timeSpanUnitValue = null;
        component.onUnitChanged(unitChangeEvent as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(null);
    });
});
