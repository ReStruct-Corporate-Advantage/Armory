import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {
    TimePeriodInterval,
    TimePeriodIntervalSettings
} from '@models/widget/inputs/chart-settings/time-period-interval-settings.model';
import {
    ExploreSelectOptionGroup,
    PerformanceSettings,
    TimePeriod,
    TimePeriodShortName
} from '@blk/explore-ui-core';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {DateUtils} from '@utils/date.utils';

/**
 * Axis Settings Component for chart widget
 */
@Component({
    selector: 'app-time-period-interval-settings',
    templateUrl: './time-period-interval-settings.component.html',
    styleUrls: ['../chart-settings.component.scss']
})
export class TimePeriodIntervalSettingsComponent extends BaseWidgetSettingComponent<TimePeriodIntervalSettings> {
    timePeriodIntervalOptions: ExploreSelectOptionGroup[];

    /**
     * initialize
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.widgetInput.timePeriodInterval ??= TimePeriodInterval.DAILY;
        this.timePeriodIntervalOptions = this.createTimePeriodIntervalOptions();
    }

    /**
     * Create timePeriodIntervalOptions
     */
    private createTimePeriodIntervalOptions(): ExploreSelectOptionGroup[] {
        const timePeriodIntervalOptions = [new ExploreSelectOptionGroup()];
        const timePeriod = (this.inputs.get(PerformanceSettings.CONFIG_TYPE) as PerformanceSettings).timePeriod;

        let timePeriodIntervals;
        if (this.showYearlyOption(timePeriod)) {
            timePeriodIntervals = Object.values(TimePeriodInterval);
        } else if (this.showQuarterlyOption(timePeriod)) {
            timePeriodIntervals = [TimePeriodInterval.DAILY, TimePeriodInterval.WEEKLY, TimePeriodInterval.MONTHLY, TimePeriodInterval.QUARTERLY];
        } else if (this.showMonthlyOption(timePeriod)) {
            timePeriodIntervals = [TimePeriodInterval.DAILY, TimePeriodInterval.WEEKLY, TimePeriodInterval.MONTHLY];
        } else if (this.showWeeklyOption(timePeriod)) {
            timePeriodIntervals = [TimePeriodInterval.DAILY, TimePeriodInterval.WEEKLY];
        } else {
            timePeriodIntervals = [TimePeriodInterval.DAILY];
        }

        for (const timePeriodInterval of timePeriodIntervals) {
            const timePeriodIntervalOption = {
                displayValue: timePeriodInterval,
                value: timePeriodInterval,
                isSelected: this.widgetInput.timePeriodInterval === timePeriodInterval
            };
            timePeriodIntervalOptions[0].values.push(timePeriodIntervalOption);
        }
        return timePeriodIntervalOptions;
    }

    /**
     * Show weekly option condition
     */
    private showWeeklyOption(timePeriod: TimePeriod): boolean {
        if (timePeriod.shortName === TimePeriodShortName.CUSTOM && DateUtils.calculateDaysApart(timePeriod.fromDateValue, timePeriod.toDateValue) <= 7) {
            return false;
        }
        return !(
            timePeriod.shortName === TimePeriodShortName.BDAY ||
            (timePeriod.numberOfPeriods <= 7 &&
                (timePeriod.shortName === TimePeriodShortName.DTD || timePeriod.shortName === TimePeriodShortName.DAYS)) ||
            (timePeriod.numberOfPeriods <= 1 &&
                (timePeriod.shortName === TimePeriodShortName.WTD || timePeriod.shortName === TimePeriodShortName.WEEKS))
        );
    }

    /**
     * Show monthly option condition
     */
    private showMonthlyOption(timePeriod: TimePeriod): boolean {
        if (timePeriod.shortName === TimePeriodShortName.CUSTOM && DateUtils.calculateDaysApart(timePeriod.fromDateValue, timePeriod.toDateValue) <= 31) {
            return false;
        }
        return !(
            timePeriod.shortName === TimePeriodShortName.BDAY ||
            timePeriod.shortName === TimePeriodShortName.PREV_MTH ||
            (timePeriod.numberOfPeriods <= 31 &&
                (timePeriod.shortName === TimePeriodShortName.DTD || timePeriod.shortName === TimePeriodShortName.DAYS)) ||
            (timePeriod.numberOfPeriods <= 4 &&
                (timePeriod.shortName === TimePeriodShortName.WTD || timePeriod.shortName === TimePeriodShortName.WEEKS)) ||
            (timePeriod.numberOfPeriods <= 1 &&
                (timePeriod.shortName === TimePeriodShortName.MTD || timePeriod.shortName === TimePeriodShortName.MONTHS))
        );
    }

    /**
     * Show quarterly option condition
     */
    private showQuarterlyOption(timePeriod: TimePeriod): boolean {
        if (timePeriod.shortName === TimePeriodShortName.CUSTOM && DateUtils.calculateDaysApart(timePeriod.fromDateValue, timePeriod.toDateValue) <= 91) {
            return false;
        }
        return !(
            timePeriod.shortName === TimePeriodShortName.BDAY ||
            timePeriod.shortName === TimePeriodShortName.PREV_MTH ||
            timePeriod.shortName === TimePeriodShortName.PREV_QTR ||
            (timePeriod.numberOfPeriods <= 91 &&
                (timePeriod.shortName === TimePeriodShortName.DTD || timePeriod.shortName === TimePeriodShortName.DAYS)) ||
            (timePeriod.numberOfPeriods <= 13 &&
                (timePeriod.shortName === TimePeriodShortName.WTD || timePeriod.shortName === TimePeriodShortName.WEEKS)) ||
            (timePeriod.numberOfPeriods <= 3 &&
                (timePeriod.shortName === TimePeriodShortName.MTD || timePeriod.shortName === TimePeriodShortName.MONTHS)) ||
            (timePeriod.numberOfPeriods <= 1 &&
                (timePeriod.shortName === TimePeriodShortName.QTD || timePeriod.shortName === TimePeriodShortName.QUARTERS))
        );
    }

    /**
     * Show yearly option condition
     */
    private showYearlyOption(timePeriod: TimePeriod): boolean {
        if (timePeriod.shortName === TimePeriodShortName.CUSTOM && DateUtils.calculateDaysApart(timePeriod.fromDateValue, timePeriod.toDateValue) <= 365) {
            return false;
        }
        return !(
            timePeriod.shortName === TimePeriodShortName.BDAY ||
            timePeriod.shortName === TimePeriodShortName.PREV_MTH ||
            timePeriod.shortName === TimePeriodShortName.PREV_QTR ||
            timePeriod.shortName === TimePeriodShortName.FYTD ||
            (timePeriod.numberOfPeriods <= 365 &&
                (timePeriod.shortName === TimePeriodShortName.DTD || timePeriod.shortName === TimePeriodShortName.DAYS)) ||
            (timePeriod.numberOfPeriods <= 52 &&
                (timePeriod.shortName === TimePeriodShortName.WTD || timePeriod.shortName === TimePeriodShortName.WEEKS)) ||
            (timePeriod.numberOfPeriods <= 12 &&
                (timePeriod.shortName === TimePeriodShortName.MTD || timePeriod.shortName === TimePeriodShortName.MONTHS)) ||
            (timePeriod.numberOfPeriods <= 4 &&
                (timePeriod.shortName === TimePeriodShortName.QTD || timePeriod.shortName === TimePeriodShortName.QUARTERS)) ||
            (timePeriod.numberOfPeriods <= 1 &&
                (timePeriod.shortName === TimePeriodShortName.YTD || timePeriod.shortName === TimePeriodShortName.YEARS))
        );
    }

    /**
     * On timePeriodInterval changed
     */
    onTimePeriodIntervalChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.timePeriodInterval = (event.detail.value as AuxSelectOption).value;
    }
}
