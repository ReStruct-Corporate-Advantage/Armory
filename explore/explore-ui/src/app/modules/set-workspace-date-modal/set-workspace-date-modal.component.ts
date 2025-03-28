import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonConstants} from '@constants/common.constants';
import {WorkpadService} from '@services/workspace';
import {WorkspaceStore} from '../../stores';
import {NotificationService} from '@services/notification';
import {cloneDeep, isEqual} from 'lodash';
import {CalendarDateUtils, DateValue, MenuOptionWorkspaceDateChangedParameters, TelemetryActionConstants, TelemetryService} from '@blk/explore-ui-core';

@Component({
    selector: 'app-set-workspace-date-modal',
    templateUrl: './set-workspace-date-modal.component.html',
    styleUrls: ['./set-workspace-date-modal.component.scss']
})

/**
 * Modal component for Set Workspace Date
 */
export class SetWorkspaceDateModalComponent implements OnInit {

    @Output() modalClosed = new EventEmitter<void>();
    @Input() isOpen: boolean;
    date: DateValue;
    updatedDate: DateValue;
    isRelativeDate: boolean;

    modalHeader: string;
    readonly CLOSE_TEXT = CommonConstants.BUTTON_TEXT.CANCEL;
    readonly DONE_TEXT = CommonConstants.BUTTON_TEXT.APPLY;

    constructor(private workpadService: WorkpadService, private notificationService: NotificationService) {
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.modalHeader = 'Apply Workspace Date';
        this.date = cloneDeep(WorkspaceStore.getCurrentPortfolio().datePicker);
        this.updatedDate = cloneDeep(this.date);
        this.isRelativeDate = CalendarDateUtils.isRelativeDate(this.date.dateStringValue);
    }

    /**
     * set this.updatedDate when the datepicker's value is changed
     */
    onDateChange(updatedDate: DateValue): void {
            this.isRelativeDate = CalendarDateUtils.isRelativeDate(updatedDate.dateStringValue);
            this.updatedDate = updatedDate;
    }

    /**
     * Update all the portfolios in workspace with the updated date
     */
    onDone(): void {
        // Update Date of all portfolios with date in date picker
        for (const workpad of WorkspaceStore.getWorkspace().workpads) {
            for (const portfolio of workpad.getAllPortfolios()) {
                portfolio.datePicker = cloneDeep(this.updatedDate);
            }
        }
        // if there is date change we will show reload prompt.
        // This is consistent with what we do for portfolio date change in portfolio input panel
        if (!isEqual(this.date, this.updatedDate)) {
            // track date change with telemetry
            this.telemetrySetWorkspaceDateClicked();
            // We have asked for the updated portfolio info, but did not refreshed
            this.workpadService.updatePortInfoOnDateChange([WorkspaceStore.getCurrentPortfolio()], this.updatedDate);
            // Provide a notification in report presenter with a reload button.
            this.notificationService.invokeWidgetReloadPrompt();
        }
        // Close the modal
        this.closeModal();
    }

    private telemetrySetWorkspaceDateClicked() {
        const newDate = this.updatedDate.dateStringValue ? this.updatedDate.dateStringValue : this.updatedDate.date;
        const setWorkspaceDateParameters = new MenuOptionWorkspaceDateChangedParameters(newDate);
        TelemetryService.track(
            TelemetryActionConstants.MENU_OPTIONS.SET_WORKSPACE_DATE,
            setWorkspaceDateParameters
        );
    }

    /**
     * Close modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }
}
