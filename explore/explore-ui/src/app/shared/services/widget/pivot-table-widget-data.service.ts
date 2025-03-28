import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {
    AlertConstants,
    ColumnConfig,
    ColumnDefinition,
    ErrorTypeConstants, UIErrorParameters,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {Breakdown, ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {cloneDeep} from 'lodash';
import {PivotTableSettingsModel} from '@models/widget/inputs/pivot-table-settings.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {CommonConstants} from '@constants/common.constants';
import {NotificationService} from '@services/notification';
import {PivotTableCustomViz} from '@interfaces/custom-viz-config.interface';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnFilter, ColumnSet, createColumnFilter, LibColumnUtils} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';
import {WorkspaceStore} from '@stores/workspace.store';

/**
 * Service to retrieve data for the pivot table
 */
@Injectable()
export class PivotTableWidgetDataService extends AbstractChartsWidgetService {
    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend serrver
     * @param notificationService - to show notifications
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService, protected notificationService: NotificationService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.PIVOT], WidgetDataViewOption.SECTOR_VIEW);
    }

    /**
     * Validates inputs
     * @see AbstractWidgetService.validateInputs
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        // Pivot does not support multi-level breakdown
        this.displayWarningForMultiLevelBreakdown(widget);

        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.PIVOT, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_PIVOT_TABLE_ERROR);
        }

        // Validate breakdowns
        const breakdown: Breakdown = AbstractWidgetService.getBreakdown(widget.dataStore.metaData.inputs, WidgetInputType.BREAKDOWN_TREE);
        const columnBreakdown: Breakdown = AbstractWidgetService.getBreakdown(
            widget.dataStore.metaData.inputs,
            WidgetInputType.COLUMN_BREAKDOWN_TREE
        );
        if (!breakdown || !columnBreakdown) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.BREAKDOWN_DEFINED.PIVOT, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_PIVOT_TABLE_ERROR);
        }

        // Pivot table specific inputs are valid, let now the parent validate the common inputs
        return super.validateInputs(widget, portfolio, report);
    }

    /**
     * Modifies given inputs
     * @param widgetInputs widget inputs to modify
     * @param widget a widget for which the inputs are to be modified
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // Get the clone of the only column from the columns collection (only one column is supported in Pivot table)
        let columnSet: ColumnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const column: ColumnConfig = cloneDeep(columnSet.columns[0]);

        // Replace the original column set with the new one and add the cloned column to it.
        // This is because the column is going to be modified and we don't want to corrupt the original column set
        // and the original column
        columnSet = new ColumnSet();
        columnSet.columns.push(column);
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);

        // Add column breakdown as a column-level breakdown to the corresponding column
        this.addColumnLevelBreakdown(widgetInputs, column);

        // Get cell breakdown
        const cellBreakdown: Breakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.CELL_BREAKDOWN_TREE);
        if (cellBreakdown) {
            // Add cell breakdown as the second level of the row breakdown
            this.addCellLevelBreakdown(widgetInputs, cellBreakdown);
        } else {
            // Determine if need to add port/bench/active
            const pivotTableSettings: PivotTableSettingsModel = widgetInputs.get(
                PivotTableSettingsModel.configType
            ) as PivotTableSettingsModel;
            if (pivotTableSettings && pivotTableSettings.portBenchActiveEnabled) {
                this.addPortBenchActiveColumns(column, columnSet);
            }
        }
    }

    /**
     * If the widget has a multilevel breakdown than display a warning that only a single level breakdown is supported by the widget
     */
    displayWarningForMultiLevelBreakdown(widget: Widget): void {
        const inputs = widget.dataStore.metaData.inputs;
        if ( (inputs.get(WidgetInputType.BREAKDOWN_TREE) && (inputs.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown).isMultiLevel()) ||
            (inputs.get(WidgetInputType.CELL_BREAKDOWN_TREE) && (inputs.get(WidgetInputType.CELL_BREAKDOWN_TREE) as Breakdown).isMultiLevel()) ||
            (inputs.get(WidgetInputType.COLUMN_BREAKDOWN_TREE) && (inputs.get(WidgetInputType.COLUMN_BREAKDOWN_TREE) as Breakdown).isMultiLevel()) ) {
            this.notificationService.warning(widget.title + ': ' + CommonConstants.NOTIFICATION_MESSAGE.BREAKDOWN_RESTRICTED_TO_SINGLE_LEVEL, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_MULTI_LEVEL_BREAKDOWN_WARNING);
        }
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Removes column breakdown from the given inputs and adds it as the column-level breakdown to the column in the
     * widget inputs
     * @param widgetInputs widget inputs that have the column and the column breakdown
     * @param column a column to add the column breakdown to
     */
    addColumnLevelBreakdown(widgetInputs: Map<string, WidgetInput>, column: ColumnConfig): void {
        // Extract column breakdown (no need to validate whether it exists as it's been done in validateInputs method)
        let columnBreakdown: Breakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.COLUMN_BREAKDOWN_TREE);
        // And remove it from the widget inputs as it's no longer required
        widgetInputs.delete(WidgetInputType.COLUMN_BREAKDOWN_TREE);

        // Only interested in the first level of a breakdown as more levels are not supported
        columnBreakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(columnBreakdown, 1);

        // Create column breakdown model and set a column breakdown in it
        const columnBreakdownModel = new ColumnBreakdown();
        columnBreakdownModel.initialize();
        columnBreakdownModel.breakdown = columnBreakdown;
        column.optionValues.push(columnBreakdownModel);
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Removes the cell-level breakdown from the given inputs and adds it as the second level to the row-level breakdown.
     * E.g. if the row-level breakdown is 'Security Group' and the cell-level breakdown is 'Issuer Ticker',
     * then the new 'breakdownTree' for the request would be 'TOTAL > Security Group > Issuer Ticker'
     * @param widgetInputs widget inputs that have the row and the cell breakdown
     * @param cellBreakdown a cell breakdown to add as the second level to the row breakdown
     */
    addCellLevelBreakdown(widgetInputs: Map<string, WidgetInput>, cellBreakdown: Breakdown): void {
        // Remove the cell breakdown from the widget inputs as it's no longer required
        widgetInputs.delete(WidgetInputType.CELL_BREAKDOWN_TREE);

        // Get the row breakdown (no need to validate for existence as it's been done in validateInputs method)
        let rowBreakdown: Breakdown = AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.BREAKDOWN_TREE);

        // Get the the stripped to the first first level clones of cell and row breakdown
        // (using clones as don't want to modify the originals)
        cellBreakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(cellBreakdown, 1);
        rowBreakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(rowBreakdown, 1);

        // Add the cell breakdown as the second level of the row breakdown and
        // replace the original row breakdown with the modified one
        rowBreakdown.append(cellBreakdown);
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, rowBreakdown);
    }

    /**
     *
     * @param column a column to 'multiply' into port / bench / active
     * @param columnSet a column set to which the created columns are added
     */
    addPortBenchActiveColumns(column: ColumnConfig, columnSet: ColumnSet): void {
        // See if we can find a port/bench/active version of the column.
        // NOTE: This feature can only work if we can identify all 3 columns.
        //       The main reason is we need the active column to ensure all sectors are present in the 1 column breakdown.
        const columnFilterColTag: ColumnFilter = createColumnFilter('columnTag', '=', column.columnTag);
        const columnFilterUses: ColumnFilter = createColumnFilter('uses', '!=', column.positionColumnType);

        const filteredColumnDefs: ColumnDefinition[] = LibColumnUtils.getFilteredList([columnFilterColTag, columnFilterUses]);

        // If we didn't find 2 columns then we do not support this feature.
        if (filteredColumnDefs && filteredColumnDefs.length !== 2) {
            return;
        }

        // Now we want to copy the column and change the use of it to the 2 just found.
        // Then we will have the columns collection with a port/bench/active version of the same column.
        filteredColumnDefs.forEach(function (colDef: any) {
            const columnClone = cloneDeep(column);
            columnClone.positionColumnType = colDef.uses;
            columnClone.columnKey += '_' + colDef.uses;
            columnSet.columns.push(columnClone);
        });
    }

    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>): PivotTableCustomViz {
        const metaInputs = widget.dataStore.metaData.inputs;
        return {
            rowBreakdown: (metaInputs.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown).title,
            columnBreakdown: (metaInputs.get(WidgetInputType.COLUMN_BREAKDOWN_TREE) as Breakdown).title,
            cellBreakdown: (metaInputs.get(WidgetInputType.CELL_BREAKDOWN_TREE) as Breakdown).title,
            portBenchActiveEnabled: metaInputs.has('pivotSettings')
                ? (metaInputs.get('pivotSettings') as PivotTableSettingsModel).portBenchActiveEnabled
                : false,
        };
    }
}
