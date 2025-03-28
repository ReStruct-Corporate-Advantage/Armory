import {Component, Input, OnInit} from '@angular/core';
import {EpnlSettings} from '@models/batch-reporting/epnl-settings.model';
import {
    Calendar,
    CalendarDateUtils,
    DateFormatConstants,
    DateService,
    SubscribableComponent
} from '@blk/explore-ui-core';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {forkJoin, of} from 'rxjs';
import {catchError, takeUntil} from 'rxjs/operators';

/**
 * Component to configure epnl settings
 */
@Component({
    selector: 'app-epnl-settings',
    templateUrl: './epnl-settings.component.html',
    styleUrls: ['./epnl-settings.component.scss']
})
export class EpnlSettingsComponent extends SubscribableComponent implements OnInit {

    @Input() epnlSettings = new EpnlSettings();

    private selectedCalendar: Calendar;

    constructor(protected dateService: DateService) {
        super();
    }
    ngOnInit(): void {
        this.updateDateRange();
    }

    /**
     * Update the date range
     */
    private updateDateRange(): void {    
        const fromDate$ = this.epnlSettings.fromDate.dateStringValue
            ? this.dateService.parseDateString$(this.epnlSettings.calCode, this.epnlSettings.fromDate.dateStringValue).pipe(
                catchError(() => of(this.epnlSettings.fromDate.date))
            )
            : of(this.epnlSettings.fromDate.date);
    
        const toDate$ = this.epnlSettings.toDate.dateStringValue
            ? this.dateService.parseDateString$(this.epnlSettings.calCode, this.epnlSettings.toDate.dateStringValue).pipe(
                catchError(() => of(this.epnlSettings.toDate.date))
            )
            : of(this.epnlSettings.toDate.date);
    
        forkJoin([fromDate$, toDate$])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(([fromDate, toDate]) => {
                this.epnlSettings.fromDate.date = CalendarDateUtils.getDateInFormat(fromDate, DateFormatConstants.MMDDYYYY_SLASH);
                this.epnlSettings.toDate.date = CalendarDateUtils.getDateInFormat(toDate, DateFormatConstants.MMDDYYYY_SLASH);
            });
    }


    /**
     * On calendar changed
     */
    onCalendarChanged(selectedCalendar: Calendar): void {
        this.selectedCalendar = selectedCalendar;
        this.epnlSettings.calCode = this.selectedCalendar.calendarCode;
    }

    /**
     * Handler to update the epnl settings enableBirtsummary value
     */
    updateEnableBirtSummaryValue(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.epnlSettings.enableBirtSummary = event.detail.value.checked;
    }

    /**
     * Handler to update the epnl settings enableHideLinks value
     */
    updateEnableHideLinksValue(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.epnlSettings.enableHideLinks = event.detail.value.checked;
    }
}
