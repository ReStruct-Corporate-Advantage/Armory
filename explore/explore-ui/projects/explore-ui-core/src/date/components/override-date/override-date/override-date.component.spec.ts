import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {map} from 'lodash';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {CoreDefinitionStore} from '../../../../definition/core-definition.store';
import {OverrideDate} from '../../../../definition/models/override-date/override-date.model';
import {CoreWidgetConfigStore} from '../../../../widget-config/core-widget-config.store';
import {WidgetConfigType} from '../../../../widget-config/enums';
import {OverrideDateConstants} from '../../../constants';
import {DateValue} from '../../../models/date-value/date-value.model';
import {OverrideDateSettings} from '../../../models/override-date-settings/override-date-settings.model';
import {DateService} from '../../../services/date.service';
import {DateStore} from '../../../stores';
import {OverrideDateComponent} from './override-date.component';

describe('OverrideDateComponent', () => {
    let component: OverrideDateComponent;
    let fixture: ComponentFixture<OverrideDateComponent>;
    DateStore.currentDate$ = new BehaviorSubject(getCurrentDate());
    // WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(getPortfolio());
    CoreDefinitionStore.overrideDateType = map(OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS, (definition: string) => {
        return new OverrideDate({
            value: definition,
            displayName: definition.toLowerCase().split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OverrideDateComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: DateService}
            ]
        });

        fixture = TestBed.createComponent(OverrideDateComponent);
        component = fixture.componentInstance;
        component.overrideDateSelectionSubject$ = new BehaviorSubject<boolean>(true);
        CoreWidgetConfigStore.currentWidgetConfigType$ = new BehaviorSubject(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
        component.overrideDateSettings = new OverrideDateSettings([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY, OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.MONTH_END, OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CUSTOM], '04/01/2020');
        fixture.detectChanges();
    });

    it('Test onInit', () => {
        expect(component.availableOverrideDates.length).toEqual(component.supportedOverrideDates.length);
        expect(component.isFBAPieChart).toBeTruthy();
    });

    it('Test initializeCustomOverrideDate with customOverrideDate', () => {
        component.overrideDateSettings.customOverrideDate = '';
        component.initializeCustomOverrideDate();
        let expectedDate: DateValue = getCurrentDate();
        // With no customOverrideDate, it should just take it from the portfolio
        expect(component.customOverrideDate.equals(expectedDate)).toBeTruthy();

        // Test with custom date string
        component.overrideDateSettings.customOverrideDate = 'T-3';
        component.initializeCustomOverrideDate();
        expectedDate = DateValue.newRelativeDate('T-3');
        expectedDate.calCode = 'GP_HK_STD';
        expect(component.customOverrideDate.equals(expectedDate)).toBeTruthy();

        // Test with actual date
        component.overrideDateSettings.customOverrideDate = '04/01/2020';
        component.initializeCustomOverrideDate();
        expectedDate = DateValue.newDate('04/01/2020');
        expectedDate.calCode = 'GP_HK_STD';
        expect(component.customOverrideDate.equals(expectedDate)).toBeTruthy();
    });

    it('Test setCustomOverrideDate', () => {
        jest.spyOn(component.customDateChange, 'emit');
        let newDate = DateValue.newDate('04/01/2020');
        component.setCustomOverrideDate(newDate);

        expect(component.customOverrideDate).toEqual(newDate);
        expect(component.overrideDateSettings.customOverrideDate).toEqual(newDate.date);
        expect(component.customDateChange.emit).toHaveBeenCalled();

        // Test with a relative date
        newDate = DateValue.newRelativeDate('T-3');
        component.setCustomOverrideDate(newDate);

        expect(component.customOverrideDate).toEqual(newDate);
        expect(component.overrideDateSettings.customOverrideDate).toEqual(newDate.dateStringValue);
    });

    it('Test initializeSupportedOverrideDateOptions', () => {
        component.initializeSupportedOverrideDateOptions();

        expect(component.availableOverrideDates.length).toEqual(6);
    });

    it('Test onOverrideDateOptionGroupChangedForCustomDate', () => {

        const newDate = DateValue.newDate('04/01/2020');
        component.customOverrideDate = newDate;

        // Fake event
        const event = getFakeEvent();
        event.detail.value[5].checked = true;

        component.onOverrideDateOptionGroupChanged(event);

        expect(component.overrideDateSettings.customOverrideDate).toEqual(newDate.date);
    });

    it('Test onOverrideDateOptionGroupChanged', () => {
        component.onOverrideDateOptionGroupChanged(null);

        expect(component.overrideDateSettings.overrideDateTypes.length).toEqual(3);

        // Fake event
        const event = getFakeEvent();
        event.detail.value[3].checked = true;
        event.detail.value[4].checked = true;

        component.onOverrideDateOptionGroupChanged(event);
        expect(component.overrideDateSettings.overrideDateTypes).toEqual(['QUARTER_END', 'YEAR_END']);
    });

    it('Test onOverrideDateOptionGroupChanged - canHaveMultipleOverrideDates is false and no override date is selected previously', () => {

        component.canHaveMultipleOverrideDates = false;
        component.overrideDateSettings.overrideDateTypes = [];

        // Fake event
        const event = getFakeEvent();
        event.detail.value[0].checked = true;

        component.onOverrideDateOptionGroupChanged(event);
        expect(component.overrideDateSettings.overrideDateTypes).toEqual(['CURRENT']);
    });

    it('Test onOverrideDateOptionGroupChanged - canHaveMultipleOverrideDates is false and override date is selected previously', () => {

        // setting up data for test
        component.canHaveMultipleOverrideDates = false;
        component.overrideDateSettings.overrideDateTypes = ['QUARTER_END'];
        component.availableOverrideDates.forEach(od => od.checked = false);
        component.availableOverrideDates.filter(od => od.label === 'Quarter end')[0].checked = true;
        // Fake event
        const event = getFakeEvent();
        event.detail.value[1].checked = true; // newly selected 'Prior Day'

        component.onOverrideDateOptionGroupChanged(event);
        expect(component.overrideDateSettings.overrideDateTypes).toEqual(['PRIOR_DAY']);
        expect(component.availableOverrideDates.filter(od => od.checked === true).length).toBe(0);
    });

    /**
     * return the fake event
     */
    function getFakeEvent(): CustomEvent {
        return {
            detail: {
                value: [
                    {
                        'label': 'Current',
                        'checked': false,
                        'disabled': false
                    },
                    {
                        'label': 'Prior day',
                        'checked': false,
                        'disabled': false
                    },
                    {
                        'label': 'Month end',
                        'checked': false,
                        'disabled': false
                    },
                    {
                        'label': 'Quarter end',
                        'checked': false,
                        'disabled': false
                    },
                    {
                        'label': 'Year end',
                        'checked': false,
                        'disabled': false
                    },
                    {
                        'label': 'Custom date',
                        'checked': false,
                        'disabled': false
                    }
                ]
            }
        } as CustomEvent;
    }

    function getCurrentDate(): DateValue {
        return new DateValue({'calCode': 'GP_HK_STD', 'dateString': false, 'date': '04/20/2020'});
    }
});
