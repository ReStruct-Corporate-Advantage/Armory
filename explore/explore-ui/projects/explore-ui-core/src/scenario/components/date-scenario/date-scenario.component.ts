import {
    AuxCheckboxChangedDetailInterface,
    AuxCalendarValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, Input, OnInit} from '@angular/core';
import {DateFormatConstants} from '../../../date/constants';
import {DateValue} from '../../../date/models/date-value/date-value.model';
import {CalendarDateUtils} from '../../../date/utils';
import {DateScenario} from '../../models/date-scenario.model';
import {Moment} from 'moment';

/**
 * This component allows the selection of date scenarios.
 */
@Component({
    selector: 'explore-core-date-scenario',
    templateUrl: './date-scenario.component.html',
    styleUrls: ['../scenario.component.scss']
})
export class DateScenarioComponent implements OnInit {
    /**
     * The list of scenarios that are selected.
     */
    @Input()
    scenarios: DateScenario[];

    /**
     * Disables Add scenario button. This button is not required in case of objectives
     */
    @Input()
    disableAddDateScenarioButton: boolean;

    /**
     * Disables Checkbox. This button is not required in case of objectives
     */
    @Input()
    disableCheckbox: boolean;

    /**
     * The minimum date allowed for a scenario is 1-jan-1900.
     */
    minDate: Moment = CalendarDateUtils.getDateInMoment('01/01/1900');

    /**
     * Init the control.
     */
    ngOnInit(): void {
        // If there are no scenarios passed it log an exception and just get out of here.
        if (!this.scenarios) {
            console.error('Control needs to be passed the scenarios');
            return;
        }
        this.scenarios.forEach(scenario => {
            if (scenario.fromDate) {
                scenario.fromDate.dateString = false;
            }
            if (scenario.toDate) {
                scenario.toDate.dateString = false;
            }
        });
    }

    /**
     * Event handler that is use to add a new scenario.
     */
    addScenario() {
        const newScenario = new DateScenario();
        newScenario.fromDate = DateValue.newRelativeDate('T-2');
        newScenario.toDate = DateValue.newRelativeDate('T-1');
        this.scenarios.push(newScenario);
    }

    /**
     * Event that is fired when the date component is changed.
     */
    onDateChanged(dateValue: DateValue, event: CustomEvent<AuxCalendarValueChangedDetailInterface>) {
        const srcEvent = event.detail.srcEvent as CustomEvent;
        // Check if this is a relative date.
        dateValue.dateString = CalendarDateUtils.isRelativeDate(srcEvent.detail.value);
        if (dateValue.dateString) {
            dateValue.dateStringValue = srcEvent.detail.value;
            dateValue.date = '';
        } else {
            dateValue.date = CalendarDateUtils.getDateInFormat(srcEvent.detail.value.dateMoment, DateFormatConstants.MMDDYYYY_SLASH);
            dateValue.dateStringValue = '';
        }
    }

    /**
     * Event when a scenario item is enabled/disabled.
     */
    onItemEnabledChanged(scenario: DateScenario, event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        scenario.enabled = event.detail.value.checked;
    }

    /**
     * Deletes the scenario
     */
    deleteScenario(index: number): void {
        this.scenarios.splice(index, 1);
    }
}
