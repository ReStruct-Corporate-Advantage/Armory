import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {cloneDeep, isEqual} from 'lodash';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {NotificationService} from '@services/notification';
import {AppStore} from '../../../app.store';
import {WorkspaceStore} from '@stores/workspace.store';
import {WorkpadService} from '@services/workspace';
import {CalendarDateUtils, DateValue} from '@blk/explore-ui-core';

/**
 * Set Report Group Date Modal Component
 *
 * @example
 *  <ng-container *ngIf="isReportGroupSettingsModalOpen">
 *      <app-set-report-group-date-modal [reportGroup]="reportGroup"
 *                                       [isOpen]="isSetReportGroupDateModalOpen"
 *                                       (modalClosed)="closeSetReportGroupDateModal()">
 *      </app-set-report-group-date-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-set-report-group-date-modal',
    templateUrl: './set-report-group-date-modal.component.html',
    styleUrls: ['../../set-workspace-date-modal/set-workspace-date-modal.component.scss']
})
export class SetReportGroupDateModalComponent implements OnInit {
    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter();
    @Input() isOpen: boolean;

    @Input() reportGroup: ReportGroup;

    private currentPortfolio: Portfolio;

    // the date in date picker
    dateValueObject: DateValue;

    /**
     * constructor
     */
    constructor(private notificationService: NotificationService, private appStore: AppStore, private workpadService: WorkpadService) {
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.currentPortfolio = WorkspaceStore.getCurrentPortfolio();
        this.dateValueObject = CalendarDateUtils.getDefaultDateObject();
    }

    /**
     * Event handler for when the date object is changed.
     */
    onDateChange(dateValue: DateValue): void {
        this.dateValueObject = dateValue;
    }

    /**
     * Close modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }

    /**
     * rename the report group and set the date for all portfolios in the report group if date is defined
     */
    onDoneClicked(): void {
        const currentDate = cloneDeep(this.currentPortfolio.datePicker);

        // Updates Each portfolio date if new date is a valid date
        if (this.dateValueObject) {
            for (const portfolio of this.reportGroup.getAllPortfolios()) {
                portfolio.datePicker = cloneDeep(this.dateValueObject);
            }

            // if the current portfolio is from this report and there is date change we will show reload prompt.
            // This is consistent with what we do for portfolio date change in portfolio input panel
            if (this.reportGroup.getAllPortfolios().indexOf(this.currentPortfolio) > -1 && !isEqual(currentDate, this.dateValueObject)) {
                // We have asked for the updated portfolio info, but did not refreshed
                this.workpadService.updatePortInfoOnDateChange([this.currentPortfolio], this.dateValueObject);
                // Provide a notification in report presenter with a reload button.
                this.notificationService.invokeWidgetReloadPrompt();
            }
        }

        this.closeModal();
    }
}
