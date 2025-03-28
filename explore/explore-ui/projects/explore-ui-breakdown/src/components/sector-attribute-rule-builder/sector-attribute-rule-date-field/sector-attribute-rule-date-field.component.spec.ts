import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SectorAttributeRuleDateFieldComponent} from './sector-attribute-rule-date-field.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {CalendarDateUtils, CommonUtils, DateValue} from '@blk/explore-ui-core';

describe('SectorAttributeRuleDateFieldComponent', () => {
    let component: SectorAttributeRuleDateFieldComponent;
    let fixture: ComponentFixture<SectorAttributeRuleDateFieldComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SectorAttributeRuleDateFieldComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SectorAttributeRuleDateFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test Initialize data field', () => {
        jest.spyOn(component.valueChange, 'emit');
        jest.spyOn(CommonUtils, 'getURLParam').mockImplementation((param: string) => {
            return param === 'todayOverride' ? '12/11/2019' : undefined;
        });
        component.initializeDateField();
        expect(component.valueChange.emit).toHaveBeenCalledWith('11-Dec-2019');
        jest.spyOn(CommonUtils, 'getURLParam').mockImplementation((param: string) => {
            return undefined;
        });
        component.initializeDateField();
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(CalendarDateUtils.getDateInAladdinFormat(new Date()));
        component.value = '05/24/2019';
        component.ngOnChanges(
            {value: new SimpleChange(null, '05/24/2019', true)}
        );
        component.initializeDateField('05/24/2019');
        expect(component.valueChange.emit).toHaveBeenLastCalledWith('24-May-2019');
    });

    it('Test Date picker Value Change', () => {
        jest.spyOn(component.valueChange, 'emit');
        const eventDate: DateValue = new DateValue({
            date: '12/11/2019',
            dateString: false
        });
        component.onDateChange(eventDate);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith('11-Dec-2019');
    });

});
