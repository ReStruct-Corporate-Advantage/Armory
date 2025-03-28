import {Component, Inject, Optional} from '@angular/core';
import {DateFormatConstants, CalendarDateUtils, DateService, DateStore, DateValue, NotificationServiceInterface, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {ScenarioConstants} from '../../../../../../constants/scenario.constant';
import {isEmpty, isNil} from 'lodash';
import moment, {Moment} from 'moment/moment';
import {BaseScenarioTypeDirective} from '../base-scenario-type.directive';
import {Validator} from '@blk/aladdin-angular-components';
import {finalize, forkJoin} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'explore-extended-column-option-date-range-scenario',
  templateUrl: './date-range-scenario.component.html',
  styleUrls: ['./date-range-scenario.component.scss']
})
export class DateRangeScenarioComponent extends BaseScenarioTypeDirective {

    /**
     * The minimum date allowed for a scenario is 1-jan-1900.
     */
    minDate: Moment;

    /**
     * To validate the holdingPeriodOverride input number
     */
    validator: Validator[];

    constructor(private dateService: DateService, @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface) {
        super(notificationService);
    }

    protected initializeComponent() {
        this.minDate = moment('01/01/1900', DateFormatConstants.MMDDYYYY_SLASH);

        if (isNil(this.scenario.dateScenario.dxsShockUnit)) {
            this.scenario.dateScenario.dxsShockUnit = ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD;
        }

        // holdingPeriodOverride is valid if value is empty or a number greater than 0 without decimal points
        this.validator = [{
            validate: (value: string) => {
                if (isNil(value) || value === '') {
                    return true;
                }
                const num = Number(value);
                const numWithoutDecimal = num.toFixed(0);
                return num > 0 && (numWithoutDecimal === value);
            },
        }];

        this.initializeDates();
    }

    /**
     * Initialize the dates for the scenario
     * @private
     */
    private initializeDates(): void {
        this.showSpinner$.next(true);

        const calCode = DateStore.getCurrentDate().calCode;

        if (isNil(this.scenario.dateScenario.fromDate)) {
            this.scenario.dateScenario.fromDate = DateValue.newRelativeDate('T-2');
        }
        if (isNil(this.scenario.dateScenario.toDate)) {
            this.scenario.dateScenario.toDate = DateValue.newRelativeDate('T-1');
        }
        this.scenario.dateScenario.fromDate.calCode = calCode;
        this.scenario.dateScenario.toDate.calCode = calCode;

        forkJoin([
            this.dateService.parseDateString$(calCode, this.scenario.dateScenario.fromDate.dateStringValue),
            this.dateService.parseDateString$(calCode, this.scenario.dateScenario.toDate.dateStringValue)
        ])
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    this.showSpinner$.next(false);
                }))
            .subscribe(([fromDate, toDate]) => {
                const fromDateString = CalendarDateUtils.getDateInFormat(fromDate, DateFormatConstants.MMDDYYYY_SLASH);
                if (fromDateString) {
                    this.scenario.dateScenario.fromDate.date = fromDateString;
                }
                const toDateString = CalendarDateUtils.getDateInFormat(toDate, DateFormatConstants.MMDDYYYY_SLASH);
                if (toDateString) {
                    this.scenario.dateScenario.toDate.date = toDateString;
                }
            });
    }

    onHoldingPeriodOverrideChanged(value: string): void {
        this.scenario.dateScenario.holdingPeriodOverride = isEmpty(value) ? undefined : Number(value);
    }

    protected validateStressScenario() {
        const isValid = this.checkForValidDates() && this.checkForHoldingPeriodOverride();
        this.scenarioValidatedEmitter.emit(isValid);
    }

    private checkForValidDates(): boolean {
        const fromDate: DateValue = this.scenario.dateScenario.fromDate;
        const toDate: DateValue = this.scenario.dateScenario.toDate;

        if ((!fromDate.dateString && isEmpty(fromDate.date)) || (fromDate.dateString && isEmpty(fromDate.dateStringValue))) {
            this.notificationService?.error('Invalid start date.');
            return false;
        }
        if ((!toDate.dateString && isEmpty(toDate.date)) || (toDate.dateString && isEmpty(toDate.dateStringValue))) {
            this.notificationService?.error('Invalid end date.');
            return false;
        }
        return true;
    }

    private checkForHoldingPeriodOverride(): boolean {
        const val = isNil(this.scenario.dateScenario.holdingPeriodOverride) ? undefined : String(this.scenario.dateScenario.holdingPeriodOverride);
        if (!this.validator[0].validate(val)) {
            this.notificationService?.error('Invalid holdingPeriodOverride value.');
            return false;
        }
        return true;
    }

}
