import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {CalendarDateUtils, ExploreSelectOption, ExploreSelectOptionGroup, ExpostSettingsStore, TimePeriod} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {find} from 'lodash';
import {WorkspaceStore} from '../../../stores';
import {PerformanceTimePeriodSettingsService} from '../../performance-settings/services/performance-time-period-settings.service';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TimePeriodResponse} from '@interfaces/time-period-response.interface';

/**
 * Component for the time period component in expost time series widgets
 */
@Component({
    selector: 'app-expost-time-period-settings',
    templateUrl: './expost-time-period-settings.component.html'
})
export class ExpostTimePeriodSettingsComponent implements OnInit {
    // Currently chosen expost time period
    @Input() expostTimePeriod: TimePeriod;

    portfolio: Portfolio;

    // Available list of expost time series periods
    supportedExpostTimeSeriesPeriods: TimePeriod[] = [];
    displayDataForExpostTimeSeriesPeriods: ExploreSelectOptionGroup[];

    isTimePeriodMenuReady = false;

    /**
     * constructor
     */
    constructor(private performanceTimePeriodSettingsService: PerformanceTimePeriodSettingsService, private changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * Init hook
     */
    ngOnInit() {
        if (!this.expostTimePeriod) {
            return;
        }
        this.initialize();
    }

    /**
     * Do the required initializations
     */
    private initialize(): void {
        this.portfolio = WorkspaceStore.getCurrentPortfolio();
        this.supportedExpostTimeSeriesPeriods = ExpostSettingsStore.getSupportedExpostTimeSeriesPeriods();
        this.expostTimePeriod.timePeriodName = find(this.supportedExpostTimeSeriesPeriods, {
            shortName: this.expostTimePeriod.shortName,
            numberOfPeriods: this.expostTimePeriod.numberOfPeriods
        }).timePeriodName;

        // Prepare display list for dropdown
        this.setDisplayDataForTimePeriodDropdown();
    }

    /**
     * initialize displayDataForExpostTimeSeriesPeriods containing their display values
     */
    private setDisplayDataForTimePeriodDropdown() {
        const observableQueue = new Array<Observable<TimePeriodResponse>>();
        this.supportedExpostTimeSeriesPeriods.forEach(timePeriod => {
            observableQueue.push( this.performanceTimePeriodSettingsService.getDatesForTimePeriod$(
                timePeriod.shortName,
                timePeriod.numberOfPeriods,
                this.portfolio.datePicker.date,
                this.portfolio.datePicker.calCode,
                this.portfolio.portName,
                this.portfolio.isIndexResearchPortfolio
            ));
        });
        forkJoin(observableQueue)
            .pipe(
                map((data: TimePeriodResponse[]) => {
                    this.displayDataForExpostTimeSeriesPeriods = [];
                    this.displayDataForExpostTimeSeriesPeriods.push( new ExploreSelectOptionGroup());
                    data.forEach(timePeriodData => {
                        const startDate = CalendarDateUtils.getDateInAladdinFormat(timePeriodData.startDate);
                        const endDate = CalendarDateUtils.getDateInAladdinFormat(timePeriodData.endDate);
                        const timePeriod = this.supportedExpostTimeSeriesPeriods.filter(
                            (supportTimePeriod) => supportTimePeriod.timePeriodName === timePeriodData.fullName
                        )[0];
                        this.displayDataForExpostTimeSeriesPeriods[0].values.push( new ExploreSelectOption(
                            this.getTimePeriodDisplayName(timePeriod, endDate, startDate),
                            timePeriod.timePeriodName
                        ));
                    });
                    this.displayDataForExpostTimeSeriesPeriods[0].values.filter(
                        (timePeriod) => timePeriod.value === this.expostTimePeriod.timePeriodName
                    )[0].isSelected = true;
                    this.changeDetectorRef.markForCheck();
                    this.isTimePeriodMenuReady = true;
                })
            ).subscribe();
    }

    /**
     * Get the display name of the chosen time period
     * this.portfolioDate comes from datepicker in 'MM/DD/YYYY' format
     */
    private getTimePeriodDisplayName(timeSeriesPeriod: TimePeriod, endDate: string, startDate: string): string {
        const timePeriodDisplayName = timeSeriesPeriod.timePeriodName;
        return (
            timePeriodDisplayName +
            '(' +
            startDate +
            '  -  ' +
            endDate +
            ')'
        );
    }

    /**
     * Method invoked when user changes the time period
     */
    changeTimePeriod(timePeriodName: string): void {
        const selectedtimePeriod = find(this.supportedExpostTimeSeriesPeriods, {timePeriodName});
        this.expostTimePeriod.timePeriodName = selectedtimePeriod.timePeriodName;
        this.expostTimePeriod.numberOfPeriods = selectedtimePeriod.numberOfPeriods;
        this.expostTimePeriod.shortName = selectedtimePeriod.shortName;
    }
}
