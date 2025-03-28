import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {DateFormatConstants} from '../../../date/constants';
import {DateValue} from '../../../date/models/date-value/date-value.model';
import {DateScenarioComponent} from './date-scenario.component';
import {DateScenario} from '../../models/date-scenario.model';
import moment from 'moment';

describe('Date Scenario Component', () => {
    let component: DateScenarioComponent;
    let fixture: ComponentFixture<DateScenarioComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                DateScenarioComponent,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        // Create the component.
        fixture = TestBed.createComponent(DateScenarioComponent);
        component = fixture.componentInstance;

        // Add the required parameters.
        component.scenarios = [];

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('The control initializes correctly', () => {
        expect(component.scenarios.length).toBe(0);
    });

    it('Add scenario', () => {
        component.addScenario();
        expect(component.scenarios.length).toBe(1);
        expect(component.scenarios[0].enabled).toBeTruthy();
        expect(component.scenarios[0].fromDate).toBeDefined();
        expect(component.scenarios[0].toDate).toBeDefined();
    });

    it('Get the date format for the date picker', () => {
        // Validate for a relative date.
        let dateValue = new DateValue();
        dateValue.dateString = true;
        dateValue.dateStringValue = 'T-5';
        expect(dateValue.format(DateFormatConstants.MMDDYYYY_SLASH)).toBe(dateValue.dateStringValue);

        // Validate for an actual date.
        dateValue = new DateValue();
        dateValue.dateString = false;
        dateValue.date = '01/10/2020';
        expect(dateValue.format(DateFormatConstants.MMDDYYYY_SLASH, true)).toBe('01/10/2020');
    });

    it('Date change event - relative date', () => {
        const event = new CustomEvent<any>('');
        event.initCustomEvent('checked', true, true, {srcEvent: {detail : {value : 't-5'}}});

        // Trigger event to set the date.
        const dateValue = new DateValue();
        component.onDateChanged(dateValue, event);

        // Validate that the scenario is no longer enabled.
        expect(dateValue.dateString).toBeTruthy();
        expect(dateValue.dateStringValue).toBe('t-5');
    });

    it('Date change event - actual date', () => {
        const event = new CustomEvent<any>('');
        event.initCustomEvent('checked', true, true, {srcEvent: {detail : {value : {
            value: '10-jan-2020',
            dateMoment: moment('10-01-2020', 'DD-MM-YYYY')
        }}}});

        // Trigger event to set the date.
        const dateValue = new DateValue();
        component.onDateChanged(dateValue, event);

        // Validate that the date is set correctly
        expect(dateValue.dateString).toBeFalsy();
        expect(dateValue.date).toBe('01/10/2020');
    });

    it('Scenario enabled change', () => {
        const event = new CustomEvent<any>('');
        event.initCustomEvent('checked', true, true, {
            value: {
                checked: false
            }
        });

        // Create the scenario to test.
        const scenario = new DateScenario();
        expect(scenario.enabled).toBeTruthy();

        // Trigger event to change the state.
        component.onItemEnabledChanged(scenario, event);

        // Validate that the date is set correctly
        expect(scenario.enabled).toBeFalsy();
    });

    it('Delete scenario', () => {
        // Create the scenario to test.
        const scenario1 = new DateScenario();
        const scenario2 = new DateScenario();
        const scenario3 = new DateScenario();
        component.scenarios.push(scenario1);
        component.scenarios.push(scenario2);
        component.scenarios.push(scenario3);

        // Make sure that scenario all scenarios have different ids.
        expect(scenario1.id).not.toBe(scenario2.id);
        expect(scenario2.id).not.toBe(scenario3.id);
        expect(scenario3.id).not.toBe(scenario1.id);

        // Delete the second scenario (index of 1).
        component.deleteScenario(1);

        // Validate that the correct one was removed.
        expect(component.scenarios.length).toBe(2);
        expect(component.scenarios[0].id).toBe(scenario1.id);
        expect(component.scenarios[1].id).toBe(scenario3.id);
    });
});
