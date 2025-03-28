import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {SectorAttributeRuleNumericFieldComponent} from './sector-attribute-rule-numeric-field.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('SectorAttributeRuleNumericFieldComponent', () => {
    let component: SectorAttributeRuleNumericFieldComponent;
    let fixture: ComponentFixture<SectorAttributeRuleNumericFieldComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SectorAttributeRuleNumericFieldComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SectorAttributeRuleNumericFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Test Numeric Value Change', fakeAsync(() => {
        component.ngOnInit();
        jest.spyOn(component.valueChange, 'emit');
        let event = {detail: {value: 2}};
        component.onNumericFieldValueChanged(event as CustomEvent);
        tick(200);
        expect(component.valueChange.emit).toHaveBeenCalledWith(2);
        event = {detail: {value: undefined}};
        component.onNumericFieldValueChanged(event as CustomEvent);
        tick(200);
        expect(component.valueChange.emit).toHaveBeenCalledWith(null);
    }));
});
