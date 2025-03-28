import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {CalendarTestUtils} from '../calendar-test.utils';

import {CalendarPickerComponent} from './calendar-picker.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('CalendarPickerComponent', () => {
    let component: CalendarPickerComponent;
    let fixture: ComponentFixture<CalendarPickerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CalendarPickerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(CalendarPickerComponent);
        component = fixture.componentInstance;
        component.calendars = CalendarTestUtils.getMockCalendars();
        fixture.detectChanges();
    });

    it('Test ngOnInit', () => {
        jest.spyOn(component, 'setAuxCalendarListData' as any);
        component.ngOnInit();
        expect(component['setAuxCalendarListData']).toHaveBeenCalled();
    });

    it('Test set auxCalendarListData', () => {
        component.calCode = 'GreenPkg';

        const expectedCalendarListData = [new ExploreSelectOptionGroup([
            new ExploreSelectOption('United States', 'GreenPkg', true),
            new ExploreSelectOption('England', 'GB', false),
            new ExploreSelectOption('No Holidays', 'EMPTY', false),
            new ExploreSelectOption('HK_STD', 'GP_HK_STD', false)
        ])];
        component['setAuxCalendarListData']();

        expect(component.auxCalendarListData).toEqual(expectedCalendarListData);
    });

    it('Test onCalendarChanged', () => {
        component.onCalendarChanged({detail: {value: {value: 'GB'}}});
        expect(component.selectedCalendar.calendarName).toEqual('England');
        expect(component.selectedCalendar.calendarCode).toEqual('GB');
    });
});
