import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    AlertConstants,
    ColumnConfig,
    CoreFavoriteConstants,
    CoreWidgetConfigStore,
    ErrorTypeConstants,
    RestrictedOptionInterface, UIErrorParameters,
    UseType,
    WidgetConfigInput,
    WidgetConfigType,
    WidgetInput
} from '@blk/explore-ui-core';
import {
    ColumnFilter, ColumnOptionService,
    ColumnSelectorOption,
    ColumnSet,
    createColumnFilter, CustomTitleColumnOption
} from '@blk/explore-ui-column-option';
import {cloneDeep, isEmpty} from 'lodash';
import {SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY} from '@optimization-settings/constants/optimization-summaries.constants';
import {ColumnUtils} from '@utils/column.utils';
import {NotificationService} from '@services/notification';
import {CommonConstants} from '@constants/common.constants';

/**
 * Modal component for custom calculation column measures
 */
@Component({
               selector: 'app-maximize-alpha-score-component',
               templateUrl: './maximize-alpha-score.component.html'
           })
export class MaximizeAlphaScoreComponent implements OnInit {

    readonly customCalcFavoriteType = CoreFavoriteConstants.OPTO_CUSTOM_CALC_COLUMN;
    @Input() showColumnMeasures: boolean;

    /**
     * Selected columns measures
     */
    @Input() columnMeasures: ColumnConfig[];

    /**
     * Event emitter to send back updated column measures to parent
     */
    @Output() objectiveMeasuresClosed: EventEmitter<Map<string, WidgetInput>> = new EventEmitter<Map<string, WidgetInput>>();

    inputs: Map<string, WidgetInput>;
    widgetConfigInput: WidgetConfigInput;
    optoConstraintType: string;
    isApplyButtonDisabled = {value: 0};
    restrictedColumnOptions: RestrictedOptionInterface;
    columnTree: ColumnSelectorOption[];
    widgetType = WidgetConfigType.RISK_EXPOSURE;

    constructor(private notificationService: NotificationService, private columnOptionsService: ColumnOptionService) {
    }

    /**
     * OnInit hook to initialize inputs and widgetConfigInput (to be sent down to form column settings)
     */
    ngOnInit() {
        // wrap the column measures into the map to be sent to column settings
        this.inputs = new Map<string, WidgetInput>([['columns', new ColumnSet()]]);
        (this.inputs.get('columns') as ColumnSet).columns = cloneDeep(this.columnMeasures);
        this.widgetConfigInput = {inputConfigType: 'columns', inputName: 'columns', inputTitle: 'columns'};
        const widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetType);
        this.restrictedColumnOptions = widgetConfig.customCalculationColumn.restrictedOptoColumnOptions;
        // we need to show custom title option for maximize alpha score
        this.restrictedColumnOptions.sections.splice(this.restrictedColumnOptions.sections.indexOf(CustomTitleColumnOption.CONFIG_TYPE), 1);
        this.optoConstraintType = SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY.subType;
        const columnFilters: ColumnFilter[] = [createColumnFilter('uses', '!=', UseType.ACTIVE), createColumnFilter('isConstraintOnly', '!=', true), createColumnFilter('isVisible', '!=', false)];
        this.columnTree = ColumnUtils.createConstraintMeasures(this.optoConstraintType, columnFilters);
    }

    /**
     * Called upon close of modal
     */
    closeColumnMeasuresModal(apply: boolean): Promise<void> {
        if (apply) {
            // check if custom calc expression is correct, if not - throw error notification
            const validationMessage = (this.inputs.get(CommonConstants.CONFIG_TYPE.COLUMNS) as ColumnSet)?.columns?.[0]?.validateColumnOptionsToProceed();
            if (!isEmpty(validationMessage)) {
                this.notificationService.error(validationMessage, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_COLUMN_MEASURES_MODAL_ERROR);
                return;
            }
            this.isSingleChildColumn();
            return;
        }
        this.objectiveMeasuresClosed.emit(undefined);
    }

    private isSingleChildColumn() {
        const columnSet = this.inputs.get('columns') as ColumnSet;
        // Make backend call to check whether multiple child columns are generated
        this.columnOptionsService.isSingleChildColumn$(columnSet)
            .subscribe({
                next: payload => {
                    if (!payload.data) {
                        this.triggerNotification(AlertConstants.NOTIFICATION.INVALID_CHILD_COLUMN_OPTIONS(columnSet.columns[0].columnTitle));
                        return;
                    }
                    this.objectiveMeasuresClosed.emit(this.inputs);
                },
                error: error => {
                    console.log('Error validating child columns', error);
                }
            });
    }

    /**
     * Send notification wth error message
     * @param message
     * @private
     */
    private triggerNotification(message: string) {
        this.notificationService.error(message, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_COLUMN_MEASURES_MODAL_ERROR, true);
    }
}
