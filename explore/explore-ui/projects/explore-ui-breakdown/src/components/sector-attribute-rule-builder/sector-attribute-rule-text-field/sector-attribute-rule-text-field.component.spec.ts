import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SectorAttributeRuleTextFieldComponent} from './sector-attribute-rule-text-field.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';

describe('SectorAttributeRuleTextFieldComponent', () => {
    let component: SectorAttributeRuleTextFieldComponent;
    let fixture: ComponentFixture<SectorAttributeRuleTextFieldComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SectorAttributeRuleTextFieldComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SectorAttributeRuleTextFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Test Text Value Change', () => {
        jest.spyOn(component.valueChange, 'emit');
        const event = {detail: {value: 'Test'}};
        component.onValueChanged(event as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(['Test']);
        const event1 = {detail: {value: 'Test1,Test2'}};
        component.onValueChanged(event1 as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(['Test1', 'Test2']);
        // Test with Empty spaces
        const event2 = {detail: {value: '  '}};
        component.onValueChanged(event2 as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(['']);
    });

    it('onChange test case', () => {
        component.value = null;

        component.onChanges({value: new SimpleChange(null, {}, true)});
        expect(component.stringInputTextData).toBe('');

        component.value = ['value1', 'value2', 'value3'];
        const changes = {value: new SimpleChange({}, {value: ['value1', 'value2', 'value3']}, true)};

        component.onChanges(changes);
        expect(component.stringInputTextData).toBe('value1,value2,value3');

    });
});
