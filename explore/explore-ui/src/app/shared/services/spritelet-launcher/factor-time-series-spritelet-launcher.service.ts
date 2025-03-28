import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {
    ColumnConfig,
    ColumnConstants,
    CoreColumnUtils,
    ErrorTypeConstants,
    NOTIFICATION_SERVICE_TOKEN,
    PerformanceSettings,
    UIErrorParameters,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnSet, OverrideDateColumnOption} from '@blk/explore-ui-column-option';
import {TableBreakdown} from '@interfaces/table-breakdown.interface';
import {GetContextMenuItemsParams, IRowNode} from 'ag-grid-community';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {CommonConstants} from '@constants/common.constants';
import {Inject, Injectable} from '@angular/core';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {cloneDeep, isNil, isUndefined} from 'lodash';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {NotificationService} from '@services/notification';
import {ColumnUtils} from '@utils/column.utils';

@Injectable({
    providedIn: 'root'
})
export class FactorTimeSeriesSpriteletLauncherService extends AbstractSpriteletLauncherService {
    static readonly PRAADA_RETURN_ATTRIBUTION_GROUP: string = 'Return Attribution';

    constructor(@Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationService) {
        super();
    }

    getSpriteletActionKey(): string {
        return WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES;
    }

    launchSpritelet(widget: Widget, event: SpriteletEvent, callbackMethod?: (any) => void): void {
        const childWidget = new Widget(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);

        // security contributors spritelet is dependent on parent widget for metadata
        childWidget.dataStore.parentDataStore = widget.dataStore;
        childWidget.dataStore.isDependentOnParentForMetaData = true;

        // copy over parent inputs to child then override as needed
        this.setWidgetInputs(childWidget.dataStore.metaData, widget.dataStore.metaData);

        let isLaunchSuccessful: boolean;
        // launch the row based if spritelet is launched from 1st column (ag-Grid-AutoColumn)
        if ('node' in event.params && ColumnUtils.checkIfColumnIsRowBasedForSpriteletLaunch(event.params.column.getColId())) {
            // spritelet launched from row
            isLaunchSuccessful = this.configureRowBasedSpritelet(widget, childWidget, event);
        } else {
            // spritelet launched from column
            isLaunchSuccessful = this.configureColumnBasedSpritelet(widget, childWidget, event);
        }

        if (isLaunchSuccessful) {
            this.addSpriteletWidgetToReport(widget, childWidget, WorkspaceStore.getCurrentReport());
        }
    }

    /**
     * Copy metadata inputs from parent widget to child spritelet
     */
    private setWidgetInputs(spriteletMetaData: WidgetDataStoreMetaData, parentMetaData: WidgetDataStoreMetaData): void {
        this.copyWidgetInput(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(RiskSettings.CONFIG_TYPE, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(PerformanceSettings.CONFIG_TYPE, spriteletMetaData, parentMetaData);

        // apply same breakdowns as in parent
        this.copyWidgetInput(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN, spriteletMetaData, parentMetaData);

        // apply same filters as in parent
        this.copyWidgetInput(WidgetInputType.TOP_BOTTOM_FILTER, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(WidgetInputType.MIN_VAL_FILTER, spriteletMetaData, parentMetaData);
    }

    /**
     * Launches time series widget with the specific column that it is launched from
     * @returns boolean true if successfully configured, false if failed
     */
    configureColumnBasedSpritelet(parentWidget: Widget, childWidget: Widget, event: SpriteletEvent): boolean {
        // get column that triggered spritelet
        const selectedColumnKey = event.params.column.getColId();
        const keyToUse = selectedColumnKey.split(CommonConstants.COLUMN_KEY_SPLITTER)[0];

        const parentColumnSet = childWidget.dataStore.parentDataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const selectedParentColumn = cloneDeep(parentColumnSet.columns.find(column => column.columnKey === keyToUse));

        // get data for row level launched at, or if launched from column header, get first row
        const rowData = ('node' in event.params) ? event.params.node.data : event.params.api.getDisplayedRowAtIndex(0).data;
        // check if column is supported for factor time series chart
        if (!this.isFactorTimeSeriesSupportedOnColumn(selectedParentColumn, rowData)) {
            return false;
        }

        // ignore override dates for the column if present so spritelet will use portfolio date
        selectedParentColumn.optionValues = selectedParentColumn.optionValues.filter(option => option.configType !== OverrideDateColumnOption.CONFIG_TYPE);

        // child is subset of parent's columns
        const childColumnSet = new ColumnSet();
        childColumnSet.columns = [selectedParentColumn];
        // update spritelet columns in meta data
        childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

        // if launched from specific row cell (not column header) add the factor breakdown path
        if ('node' in event.params) {
            this.setFactorPathInput(childWidget, event.params.node);
        }

        return true;
    }

    /**
     * Launches time series widget at specific row level and with the last numerical column in the widget
     * @returns boolean true if successfully configured, false if failed
     */
    configureRowBasedSpritelet(parentWidget: Widget, childWidget: Widget, event: SpriteletEvent): boolean {
        const {node} = event.params as GetContextMenuItemsParams;
        const parentColumnSet = parentWidget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        const numericalColumns = this.getParentNumericalColumns(parentColumnSet, node.data);
        // make sure there are any available columns
        if (!numericalColumns.length) {
            this.notificationService.error('Time series charting is only available on measures that are numerical, aggregatable, and not Return Attribution columns.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CONFIGURE_ROW_BASED_SPRITELET_ERROR);
            return false;
        }

        // default to using last numerical column from parent
        const parentColumn = cloneDeep(numericalColumns[numericalColumns.length - 1]);
        // ignore override dates for the column if present so spritelet will use portfolio date
        parentColumn.optionValues = parentColumn.optionValues.filter(option => option.configType !== OverrideDateColumnOption.CONFIG_TYPE);

        const childColumnSet = new ColumnSet();
        childColumnSet.columns = [parentColumn];
        // update spritelet columns in meta data
        childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

        this.setFactorPathInput(childWidget, node);

        return true;
    }

    /**
     * Sets the factor path input by creating the path down to the row level on which the spritelet is launched
     */
    protected setFactorPathInput(childWidget: Widget, selectedRowNode: IRowNode): void {
        // get path from root down to node clicked on
        const path: TableBreakdown[] = [];
        // use FBA_BLOCK_PATH to specify the path down to the leaf node as it is unique, whereas rfv_ftitle is not unique
        this.getParentPath(selectedRowNode, path, ColumnConstants.FBA_BLOCK_PATH);
        const factorPathInput = childWidget.dataStore.metaData.inputs.get(FactorPathInput.configType) as FactorPathInput;
        factorPathInput.path = path;

        // do not show total line if spritelet is launched at lowest level factor
        if (factorPathInput.isFactorTimeSeriesLeafLevelPath()) {
            (childWidget.dataStore.metaData.inputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings).includeTotalValues = false;
        }
    }

    /**
     * gets all available columns for child spritelet
     */
    protected getParentNumericalColumns(parentColumnSet: ColumnSet, rowData?: any): ColumnConfig[] {
        return parentColumnSet.columns.filter(column => {
            const {dataType, groups} = CoreColumnUtils.getColumnDefByTag(column.columnTag);
            // exclude non-numerical columns
            if (!((dataType === ColumnConstants.COLUMN_DATA_TYPE.DOUBLE) || (dataType === ColumnConstants.COLUMN_DATA_TYPE.INT))) {
                return false;
            }
            // only allow launching from aggregatable columns, for now we are just checking if the value trying to launch on is null
            // using field.startsWith(column.columnKey) for when spritelet launched on split column
            if (!Object.keys(rowData).find((field: string) => field.startsWith(column.columnKey) && !isNil(rowData[field]))) {
                return false;
            }
            return true;
        });
    }

    /**
     * Determines if time series spritelet can be launched on specified column
     */
    private isFactorTimeSeriesSupportedOnColumn(column: ColumnConfig, rowData: any): boolean {
        if (isUndefined(column)) {
            this.notificationService.error('Time series charting is not supported on this column', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FACTOR_TIME_SERIES_SUPPORTED_ON_COLUMN_ERROR);
            return false;
        }

        const columnDef = CoreColumnUtils.getColumnDefByTag(column.columnTag);
        // only allow launching from numerical columns
        if (!((columnDef.dataType === ColumnConstants.COLUMN_DATA_TYPE.DOUBLE) || (columnDef.dataType === ColumnConstants.COLUMN_DATA_TYPE.INT))) {
            this.notificationService.error('Time series charting is only available on measures that are numerical', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FACTOR_TIME_SERIES_SUPPORTED_ON_COLUMN_ERROR);
            return false;
        }
        // only allow launching from aggregatable columns, for now we are just checking if the value trying to launch on is null
        // using field.startsWith(column.columnKey) for when spritelet launched on split column
        if (!Object.keys(rowData).find((field: string) => field.startsWith(column.columnKey) && !isNil(rowData[field]))) {
            this.notificationService.error('Time series charting is only available on measures that are aggregatable', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FACTOR_TIME_SERIES_SUPPORTED_ON_COLUMN_ERROR);
            return false;
        }
        return true;
    }
}
