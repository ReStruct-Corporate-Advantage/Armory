import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Breakdown, BreakdownBuilderSettings, BreakdownConstants, ColumnSector} from '@blk/explore-ui-breakdown';
import {CommonConstants} from '../../../constants';
import {isUndefined} from 'lodash';
import {NotificationService} from '@services/notification';
import {ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';

/**
 * This component shows the preview of a breakdown and options to configure breakdown
 */
@Component({
    selector: 'app-breakdown-preview',
    templateUrl: './breakdown-preview.component.html',
    styleUrls: ['./breakdown-preview.component.scss']
})
export class BreakdownPreviewComponent implements OnInit {
    // Variables used to pass into this control.

    @Input() breakdown: Breakdown;

    @Input() breakdownBuilderSettings: BreakdownBuilderSettings;

    @Input() isOptimizationCashBreakdownSettingVisible: boolean;

    @Input() isOptimizationCashSettingChecked: boolean;

    @Output()  isOptimizationCashSettingChanged = new EventEmitter<boolean>();

    @Output() breakdownChanged = new EventEmitter<void>();

    selectedBreakdownType: string;

    breakdownOptions = BreakdownConstants.BREAKDOWN_OPTIONS;

    ngOnInit(): void {
        this.setBreakdownType();
    }

    constructor(private notificationService: NotificationService) {
    }

    /**
     * Set the type of current configured breakdown
     */
    private setBreakdownType(): void {
        // This check added for FBA widget only
        if (this.isNoneBreakdownOptionUpdatedToDefault()) {
            return;
        }
        // Set the type of selected breakdown.
        if (this.breakdown && (this.breakdown.isConfigured || isUndefined(this.breakdown.isConfigured))) {
            // If the breakdown is configured (or an old breakdown favorite) select the "Configured Breakdown" option
            this.selectedBreakdownType = BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.value;
            // Set the isConfigured flag to be true;
            this.breakdown.isConfigured = true;
        } else {
            // If the breakdown was not configured, assess its contents
            if (!this.breakdown || this.breakdown.isEmpty()) {
                this.selectedBreakdownType = BreakdownConstants.BREAKDOWN_OPTIONS.NONE.value;
            } else if (this.breakdown.isQuickSelectBreakdown()) {
                this.selectedBreakdownType = BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.value;
            }
        }
        const isEATColumn: boolean = !isUndefined(this.breakdownBuilderSettings.columnFilter) && this.breakdownBuilderSettings.columnFilter.length === 1 && this.breakdownBuilderSettings.columnFilter[0].key === 'isEATBreakdownDefinition';
        if (this.selectedBreakdownType === BreakdownConstants.BREAKDOWN_OPTIONS.NONE.value && isEATColumn) {
            this.selectedBreakdownType = BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.value;
            this.breakdown.isConfigured = false;
            const sector: ColumnSector = new ColumnSector();
            sector.columnTag = 'f_type';
            sector.columnName = BreakdownConstants.EXPOSURE_AGGREGATION_TYPE;
            sector.positionColumnType = 'ALL';

            const breakdown: Breakdown = new Breakdown();
            breakdown.title = BreakdownConstants.EXPOSURE_AGGREGATION_TYPE;
            breakdown.addChild(sector);
            this.breakdown.copyFrom(breakdown);
            // Emit an event to the parent to let them know the breakdown was updated
            this.breakdownChanged.emit();
        }
        // update notification
        this.restrictBreakdownToSingleLevelAlert();
    }

    /**
     * Method called when breakdown is updated and/or breakdown option is selected
     */
    onBreakdownUpdate(breakdown: Breakdown, breakdownType: string) {
        // If the user selects no breakdown, set the breakdown into a new empty breakdown
        if (breakdownType === BreakdownConstants.BREAKDOWN_OPTIONS.NONE.value) {
            this.breakdown.copyFrom(new Breakdown());
        } else {
            // Else, just copy the single or multi level breakdown
            this.breakdown.copyFrom(breakdown);
        }
        // if the breakdown title is undefined, we set one
        if (!this.breakdown.title) {
            this.breakdown.setDefaultTitle();
        }
        this.breakdown.isConfigured = breakdownType === BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.value;
        // Update the model of which is selected.
        this.selectedBreakdownType = breakdownType;
        // update notification
        this.restrictBreakdownToSingleLevelAlert();

        // Emit an event to the parent to let them know the breakdown was updated
        this.breakdownChanged.emit();
   }

    /**
     * Updates a warning if the breakdown is restricted to single level but the user has created a multilevel breakdown
     */
    restrictBreakdownToSingleLevelAlert() {
        if (this.breakdownBuilderSettings.restrictBreakdownToSingleLevel && this.breakdown.isMultiLevel()) {
            this.notificationService.warning(CommonConstants.NOTIFICATION_MESSAGE.BREAKDOWN_RESTRICTED_TO_SINGLE_LEVEL, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_RESTRICT_BREAKDOWN_TO_SINGLE_WARNING);
        }
    }

    /**
     * This method updates Breakdown type to Multi for FBA
     */
    isNoneBreakdownOptionUpdatedToDefault(): boolean {
        const isEATColumn: boolean = !isUndefined(this.breakdownBuilderSettings.columnFilter) && this.breakdownBuilderSettings.columnFilter.length === 1 && this.breakdownBuilderSettings.columnFilter[0].key === 'isEATBreakdownDefinition';
        // FBA widget with 'No Breakdown' saved in favorites
        if (this.breakdownBuilderSettings.includeNoBreakdownOption === false && this.breakdown && this.breakdown.isEmpty() && !isEATColumn) {
            this.selectedBreakdownType = BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.value;
            this.breakdown.isConfigured = true;
            return true;
        }
        return false;
    }

    onOptimizationCashSettingChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.isOptimizationCashSettingChanged.emit(event.detail.value.checked);
    }
}
