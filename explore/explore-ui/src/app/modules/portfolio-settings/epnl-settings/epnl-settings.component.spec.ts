import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EpnlSettingsComponent} from './epnl-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Calendar, DateService} from '@blk/explore-ui-core';
import { of, throwError } from 'rxjs';

describe('EpnlSettingsComponent', () => {
    let component: EpnlSettingsComponent;
    let fixture: ComponentFixture<EpnlSettingsComponent>;
    let dateServiceStub: Partial<DateService>;
    

    beforeEach(() => {
        dateServiceStub = {
            parseDateString$: jest.fn().mockImplementation((calCode, dateString) => {
                if (dateString === 'valid-date') {
                    return of(new Date(2020, 0, 1));
                } else {
                    return throwError('Invalid date');
                }
            })
        };


        TestBed.configureTestingModule({
            declarations: [EpnlSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: DateService, useValue: dateServiceStub},
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EpnlSettingsComponent);
        component = fixture.componentInstance;
        component.epnlSettings = {
            fromDate: { dateStringValue: null, date: null },
            toDate: { dateStringValue: null, date: null },
            calCode: '',
            enableBirtSummary: false,
            enableHideLinks: false
        };
        fixture.detectChanges();
    });

    it('Test onCalendarChanged', () => {
        const calendar = new Calendar();
        calendar.calendarCode = 'US';
        component.onCalendarChanged(calendar);
        expect(component.epnlSettings.calCode).toEqual('US');
    });

    it('Test updateEnableBirtSummaryValue', () => {
        component.epnlSettings.enableBirtSummary = false;
        component.updateEnableBirtSummaryValue({detail: {value: {checked: true}}});
        expect(component.epnlSettings.enableBirtSummary).toBeTruthy();
    });

    it('Test updateEnableHideLinksValue', () => {
        component.epnlSettings.enableHideLinks = false;
        component.updateEnableHideLinksValue({detail: {value: {checked: true}}});
        expect(component.epnlSettings.enableHideLinks).toBeTruthy();
    });
    it('Test updateDateRange', () => {
        component.epnlSettings.fromDate = { dateStringValue: 'valid-date', date: null };
        component.epnlSettings.toDate = { dateStringValue: 'invalid-date', date: null };
        component.epnlSettings.calCode = 'US';
    
        (component as any).updateDateRange(); // Change the accessibility of the method to public
    
        fixture.detectChanges();
    
        expect(component.epnlSettings.fromDate.date).toEqual('01/01/2020');
        expect(component.epnlSettings.toDate.date).toEqual(undefined); 
    });
    it('Test updateDateRange with no dateStringValue', () => {
        component.epnlSettings.fromDate = { dateStringValue: null, date: new Date(2020, 0, 1) };
        component.epnlSettings.toDate = { dateStringValue: null, date: new Date(2020, 0, 2) };
        component.epnlSettings.calCode = 'US';

        (component as any).updateDateRange(); // Change the accessibility of the method to public

        fixture.detectChanges();

        expect(component.epnlSettings.fromDate.date).toEqual('01/01/2020');
        expect(component.epnlSettings.toDate.date).toEqual('01/02/2020');
    });

});
