import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, Optional, Output} from '@angular/core';
import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {isUndefined} from 'lodash';
import {of} from 'rxjs';
import {FormatConstants} from '../../../core/constants';
import {DateValue} from '../../../date/models/date-value/date-value.model';
import {TimePeriod, TimePeriodShortName} from '../../../date/models/time-period/time-period.model';
import {CalendarDateUtils} from '../../../date/utils';
import {ExploreSelectOptionGroup} from '../../../ui/models/explore-select-option-group.model';
import {
    PerformanceTimePeriodSettingsServiceInterface
} from '../../service-interfaces/performance-time-period-settings-service.interface';
import {PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN} from '../../tokens';
import {NOTIFICATION_SERVICE_TOKEN} from '../../../ui/tokens';
import {NotificationServiceInterface} from '../../../ui/service-interfaces/notification-service.interface';

/**
 * Time period settings component
 */
@Component({
    selector: 'explore-core-time-period-settings',
    templateUrl: './time-period-settings.component.html',
    styleUrls: ['./time-period-settings.component.scss']
})
export class TimePeriodSettingsComponent implements OnChanges {

    /**
     * The time period that is being configured.
     */
    @Input() timePeriod: TimePeriod;

    /**
     * Default time period settings.
     */
    @Input() defaultTimePeriod: TimePeriod;

    @Input() sourceNameSupported: boolean;

    /**
     * The event when the time period has been changed.
     */
    @Output() timePeriodChange = new EventEmitter<TimePeriod>();

    /**
     * The event when the user wants to reset the time period.  This is needed as a reset required a new
     * time period to be bound into this component.
     */
    @Output() resetTimePeriod = new EventEmitter<void>();

    displayDataForAvailableTypes: ExploreSelectOptionGroup[];
    displayDataForAvailableIntervals: ExploreSelectOptionGroup[];
    isSettingChanged: boolean;

    private readonly TIME_PERIOD_TYPE_CUSTOM = 'Custom';

    /**
     * Construct the control with the required services.
     */
    constructor(
        @Inject(PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN) private performanceTimePeriodSettingsService: PerformanceTimePeriodSettingsServiceInterface,
        @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) private notificationService: NotificationServiceInterface,
        private changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * Handle the bound parameters changing.
     */
    ngOnChanges(changesObj: any): void {
        // Only want to do anything if there is a time period.
        if (isUndefined(this.timePeriod)) {
            return;
        }

        // Initialize defaultTimePeriod
        // Explore specific
        // TODO: Ideally, this nested subscription needs to be flatten out and the logic inside of subscription should live in the service.
        this.performanceTimePeriodSettingsService.populateTimePeriodFromValue$(this.defaultTimePeriod)
            .subscribe(defaultTimePeriod => {
                const timePeriod = this.timePeriod.type ? of(this.timePeriod) : this.performanceTimePeriodSettingsService.populateTimePeriodFromValue$(this.timePeriod);

                timePeriod.subscribe(() => {
                    // Initialize Types and intervals
                    this.initializeTypesAndIntervals();
                    this.changeDetectorRef.markForCheck();
                    if (this.timePeriod.type) {
                        if (!this.timePeriod.numberOfPeriods) {
                            this.timePeriod.numberOfPeriods = 1;
                        }
                        if (this.timePeriod.type !== FormatConstants.CUSTOM) {
                            // If the from/to dates are not set then create a new object to allow them to be set.
                            if (!this.timePeriod.fromDate) {
                                this.timePeriod.fromDate = new DateValue();
                            }
                            if (!this.timePeriod.toDate) {
                                this.timePeriod.toDate = new DateValue();
                            }
                        }
                        this.updateTimePeriodDates();
                        this.changeDetectorRef.markForCheck();
                    }
                    // Update state of reset to default button
                    this.isSettingChanged = !this.timePeriod.equals(defaultTimePeriod);
                });
            });
    }

    /**
     * Init the interval and dropdown types
     */
    private initializeTypesAndIntervals() {
        const availableTypes = this.performanceTimePeriodSettingsService.getAvailableTypes();
        // Prepare display lists for drop downs.
        this.displayDataForAvailableTypes = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(availableTypes, null, this.timePeriod.type);
        this.updateIntervalList();
    }

    /**
     * Set the list of available intervals based ont he selected type.
     */
    private updateIntervalList(): void {
        // Explore specific
        const availableIntervals = this.performanceTimePeriodSettingsService.getAvailableIntervals(this.timePeriod);
        this.displayDataForAvailableIntervals = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(
            availableIntervals,
            null,
            this.timePeriod.interval
        );
    }

    /**
     * Event that is triggered when the time period type is changed.
     */
    onTimePeriodTypeChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (!event || !event.detail) {
            return;
        }

        // This event will be fired even if the user selects the same value that is shown, so if the value is not changing then don't do anything.
        if (this.timePeriod.type !== (event.detail.value as AuxSelectOption).displayValue) {
            this.timePeriod.type = (event.detail.value as AuxSelectOption).displayValue;

            // Since we changed the type we should default the new interval to the first one if the current doesn't exist.
            this.timePeriod.interval = this.performanceTimePeriodSettingsService.getIntervalsByType(this.timePeriod.type)[0];

            // Trigger the update of the settings.
            this.settingsChanged();

            // Now that we have set the time period we can regenerate the intervals.
            this.updateIntervalList();
        }
    }

    /**
     * Event that is triggered when the number of periods is changed.
     */
    onNumberOfPeriodsChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (!event || !event.detail) {
            return;
        }
        this.timePeriod.numberOfPeriods = Number(event.detail.value);

        // Trigger the update of the settings.
        this.settingsChanged();
    }

    /**
     * Event that is triggered when the time period interval is changed.
     */
    onTimePeriodIntervalChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (!event || !event.detail || !event.detail.value) {
            return;
        }

        // This event will be fired even if the user selects the same value that is shown, so if the value is not changing then don't do anything.
        if (this.timePeriod.interval !== (event.detail.value as AuxSelectOption).displayValue) {
            this.timePeriod.interval = (event.detail.value as AuxSelectOption).displayValue;

            // Trigger the update of the settings.
            this.settingsChanged();
        }
    }

    /**
     * Event that is fired when the date range is changed.
     */
    onDateRangeChange(): void {
        this.timePeriod.fromDateValue = this.getValidDateValue(this.timePeriod.fromDate);
        this.timePeriod.toDateValue = this.getValidDateValue(this.timePeriod.toDate);
        this.settingsChanged();
    }

    /**
     * Returns valid date value i.e relative or absolute
     */
    getValidDateValue(dateValue: DateValue): string {
        return dateValue.dateStringValue && CalendarDateUtils.isRelativeDate(dateValue.dateStringValue) ? dateValue.dateStringValue : dateValue.date;
    }

    /**
     * Reset the current settings to its parent
     */
    reset() {
        // This will cause the bound time period object to be reset.
        this.resetTimePeriod.emit();
    }

    /**
     * Calls the server and updates the time period date
     */
    // Explore specific
    updateTimePeriodDates(): void {
        if (this.timePeriod.type === this.TIME_PERIOD_TYPE_CUSTOM) {
            this.setCustomTimePeriodDefaults(this.timePeriod);
            this.emitTimePeriodChanged();
            return;
        }
        // Also trigger an update of the dates.
        // NOTE:  This calls the server to evaluate what the dates are.
        this.performanceTimePeriodSettingsService.modifyTimePeriod$(this.timePeriod)
            .subscribe(() => {
                this.emitTimePeriodChanged();
                if (this.timePeriod.isStartDateSetToPerformDate) {
                    const warnMessage = 'Returns are displaying for a partial period [' + this.timePeriod.fromDateValue + ' to ' + this.timePeriod.toDateValue + ']';
                    this.notificationService?.warning(warnMessage);
                }
            });
    }

    /**
     * Set details for Custom time Period
     */
    private setCustomTimePeriodDefaults(timePeriod: TimePeriod): void {
        timePeriod.shortName = TimePeriodShortName.CUSTOM;
        timePeriod.timePeriodName = 'Custom';
        timePeriod.numberOfPeriods = 1;
        timePeriod.interval = '';
        timePeriod.type = 'Custom';
    }

    emitTimePeriodChanged(): void {
        // Event out that the time period has changed.
        if (!this.timePeriod.equals(this.defaultTimePeriod)) {
            // TODO: this emitter gets called on EVERY SINGLE THING we change:
            //  (onTimePeriodTypeChanged, onTimePeriodIntervalChanged, onNumberOfPeriodsChanged, onDateRangeChange)
            //  then we update this.performanceSettings.timePeriod on PerformanceSettingsComponent
            //  (or this.optionValue.timePeriod on PerformanceColumnOptionsComponent)
            //  which can be either it's own settings or the parent's settings
            //  Q: Will this break something if we just pass this.performanceSettings.timePeriod and update it directly here?
            //  IF THEN,
            //  We can move this whole logic in the PerformanceSettingsService as this being Explore specific
            this.timePeriodChange.emit(this.timePeriod);
        }
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Function that is called whenever something is changed in tcohe time period.
     */
    settingsChanged() {
        // update dates
        this.updateTimePeriodDates();
        // Update flag to indicate if anything has changed from the default.
        this.isSettingChanged = !this.timePeriod.equals(this.defaultTimePeriod);
    }
}
