import {
    ChartTypeColumnOption,
    ColumnOptionUtils,
    ColumnSet,
    DataFormatter,
    FormatAndScaleFactory,
    LibColumnUtils,
    NumericDataFormatter
} from '@blk/explore-ui-column-option';
import {
    AlertConstants,
    ChartWidgetInputConfigType,
    ColumnConfig,
    ColumnConstants,
    ColumnDefinition,
    CoreColumnUtils,
    CoreWidgetConstants,
    DateFormatConstants,
    ErrorTypeConstants,
    isDerivedSetting,
    PerformanceSettings,
    ResponseData,
    ReturnsUtilityService,
    UIErrorParameters,
    WidgetConfigInput,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {CoreRiskConstants, isSupportsRevealSources} from '@blk/explore-ui-risk';
import {CommonConstants} from '@constants/common.constants';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {
    ColumnHeaderDetails,
    ExploreResponse,
    SplitColumnHeaderKey,
    SplitColumnKeys
} from '@interfaces/response.interface';
import {TableBreakdown} from '@interfaces/table-breakdown.interface';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Notification} from '@models/widget/notification.model';
import {Widget} from '@models/widget/widget.model';
import {FilterIncludeKey, QueryKeyEntry} from '@qbstr/data-cube';
import {ObjectUtils} from '@utils/object.utils';
import {CUSTOM_CALC_COL_TAG} from '@utils/qbstr';
import {isEmpty, isNil, isNumber} from 'lodash';
import moment from 'moment';
import {AppStore} from '../app.store';
import {WidgetConfigFactory} from '../factories';
import {WidgetComponent} from '../modules/widget/widget.component';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnUtils} from './column.utils';
import {decode, encode} from 'utf8';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {ChartUtils} from '@utils/chart.utils';
import {VizColumnData} from '@interfaces/viz-column.data';
import {AuxAdvancedFilterModel} from '@blk/aladdin-angular-components';

/**
 * Utility class for widget related functions
 */
export class WidgetUtils {

    /**
     * Gets the inputs from the data store and the widget into a single map.
     */
    static getCombinedInputs(widget: Widget): Map<string, WidgetInput> {
        const inputs: Map<string, WidgetInput> = new Map(widget.dataStore.metaData.inputs);
        widget.displayInputs.forEach((val: WidgetInput, key: string) => {
            inputs.set(key, val);
        });
        return inputs;
    }

    /**
     * Update widget settings of the passed in widget with portfolio settings
     */
    static updateWidgetWithPortfolioSettings(widget: Widget, portfolio: Portfolio) {
        // Make a new map and add all the inputs to it.
        const inputs = WidgetUtils.getCombinedInputs(widget);
        // Need to pass all inputs including  the parent data store ones so that for spritelets we link column performance settings to the parentDataStore performance settings rather than portfolio settings
        if (widget.dataStore.parentDataStore) {
            const widgetDataStoreKeys = Array.from(widget.dataStore.metaData.inputs.keys());
            const widgetParentDataStoreKeys = Array.from(widget.dataStore.parentDataStore.metaData.inputs.keys());
            const keysOnlyInParentDataStore = widgetParentDataStoreKeys.filter(key => widgetDataStoreKeys.indexOf(key) === -1);
            keysOnlyInParentDataStore.forEach((key: string) => {
                inputs.set(key, widget.dataStore.parentDataStore.metaData.inputs.get(key));
            });
        }
        inputs.forEach((input: WidgetInput) => {
            if (isNil(input)) {
                // If the input is null or undefined, skip it
                return;
            }
            if (isDerivedSetting(input)) {
                input.updateDerivedSettings(portfolio[input.getParentPortfolioSettingKey()]);
            }
            if (isSupportsRevealSources(input)) {
                // Currently only risk settings use the reveal sources feature so we have the constants defined in RiskConstants.. If we do this for performance as well then we can move the constants elsewhere
                input.setSettingsSource(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            }
            if (input instanceof ColumnSet) {
                input.columns.forEach((col: ColumnConfig) => {
                    ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(col, portfolio, inputs, widget.configType);
                    col.optionValues.forEach(value => {
                        ColumnOptionUtils.updateColumnTitle(col, value, widget.configType);
                    });
                });
            }
        });
        //if portfolio is not undefined, set the portfolio date picker in the widget
        if (portfolio) {
            widget.setDisplayTitle(portfolio.datePicker);
        }
    }

    /**
     * Adds default columns in Returns Widget according to attribution settings
     */
    static addDefaultReturnsColumn(widget: Widget) {
        const performanceSettings: PerformanceSettings = WorkspaceStore.getCurrentPortfolio().performanceSettings;
        const columns = (widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        ReturnsUtilityService.addFactorColumns(performanceSettings.attributionSettings.cannedMethod, columns, performanceSettings.attributionSettings.factors);
    }

    /**
     * Creates VizualisationColumnConfig objects from the Widget inputs
     */
    static convertWidgetInputsToVizualisationColumnConfig(widgetInputs: Map<string, WidgetInput>, widgetDisplayInputs: Map<string, WidgetInput>, configType: string, response?: ExploreResponse, columnHeaderDetails?: ColumnHeaderDetails, columnKeys?: string[], splitColumnKeys?: SplitColumnKeys): VizualizationColumnConfig[] {
        const configInput: WidgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigType(configType).find(inputConfig => inputConfig.inputName === WidgetInputType.COLUMNS);
        let hiddenColumns = (isNil(configInput) || isNil(configInput.hiddenColumns)) ? [] : configInput.hiddenColumns;
        let widgetColumns = [];

        const hiddenColKeys = [];
        widgetInputs.forEach(value => {
            if (value instanceof ColumnSet) {
                widgetColumns = widgetColumns.concat(value.columns);
            }
        });

        // Handle LegacyFavorites that need to be handled on the component/service level.
        WidgetUtils.handleLegacyFavorites(widgetColumns, widgetDisplayInputs);

        hiddenColumns = hiddenColumns.filter((col: ColumnConfig) => {
            return !widgetColumns.some((widgetCol: ColumnConfig) => {
                return col.columnTag === widgetCol.columnTag;
            });
        });

        widgetColumns = widgetColumns.concat(hiddenColumns);
        hiddenColumns.forEach(col => hiddenColKeys.push(col.columnKey));
        return WidgetUtils.convertColumnConfigsToVizColumns(widgetColumns, hiddenColKeys, columnKeys, splitColumnKeys, configType, response, columnHeaderDetails);
    }

    /**
     * Handle LegacyFavorites that need to be processed on the component/service level.
     */
    private static handleLegacyFavorites(widgetColumns: ColumnConfig[], widgetDisplayInputs: Map<string, WidgetInput>) {
        // Remove chartTypeColumnOption from columnOption and add it to ComboChartColumnSettings under widgetDisplayInputs.
        this.handleChartTypeColumnOptionFavorite(widgetColumns, widgetDisplayInputs);
    }

    /**
     * Special handling is required in order to handle the ChartTypeColumnOption (legacy favorite) saved at the column option level.
     * Chart type is now saved under ComboChartColumnSettings which is at the widget level.
     */
    private static handleChartTypeColumnOptionFavorite(widgetColumns: ColumnConfig[], widgetDisplayInputs: Map<string, WidgetInput>) {
        const comboChartSettings = widgetDisplayInputs.get(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS) as ComboChartColumnSettings ?? new ComboChartColumnSettings({columns: []});

        for (const column of widgetColumns) {
            const chartTypeColumnOption = column.optionValues.find(optionValue => optionValue.configType === ChartTypeColumnOption.CONFIG_TYPE) as ChartTypeColumnOption;
            if (chartTypeColumnOption) {
                // Legacy favorite holds wrong value `line` for `marker`, so fix it here.
                const chartType = chartTypeColumnOption.value === ColumnSeriesChartType.LINE ? ColumnSeriesChartType.MARKER : ColumnSeriesChartType.BAR;
                const comboChartColumn = comboChartSettings.columns.find(comboColumn => comboColumn.colKey === column.columnKey);
                if (comboChartColumn) {
                    comboChartColumn.chartType ??= chartType;
                } else {
                    comboChartSettings.columns.push(new ComboChartColumn({colKey: column.columnKey, chartType}));
                }
                // Now remove chartTypeColumnOption from the optionValues.
                column.optionValues = column.optionValues.filter(optionValue => optionValue.configType !== ChartTypeColumnOption.CONFIG_TYPE);
            }
        }

        if (comboChartSettings.columns.length) {
            widgetDisplayInputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, comboChartSettings);
        }
    }

    /**
     * accepts a list of column configs and returns a list of visualization column
     */
    static convertColumnConfigsToVizColumns(columns: ColumnConfig[], hiddenColKeys: string[], columnKeys?: string[], splitColumnKeys?: SplitColumnKeys, configType?: string, response?: ExploreResponse, columnHeaderDetails?: ColumnHeaderDetails): VizualizationColumnConfig[] {
        if (isEmpty(columns)) {
            return [];
        }

        if (!isEmpty(columnKeys)) {
            const vizColumns = [];
            columnKeys.forEach((key: string) => {
                // For fba Pie chart saved fav we need to match the complete columnKey (ptc_mv_123|11/09/2017)
                const columnConfig = columns.find(column => key.split(CommonConstants.COLUMN_KEY_SPLITTER)[0] === column.columnKey || (WidgetConfigType.FACTOR_GRAPHING_PIE_CHART === configType && key === column.columnKey));
                if (!columnConfig) {
                    return;
                }
                vizColumns.push(WidgetUtils.createVizColumn({
                    column: columnConfig,
                    isHidden: hiddenColKeys.indexOf(key) !== -1,
                    columnKey: key,
                    splitColumnKeys,
                    configType,
                    response,
                    columnHeaderDetails
                }));
            });
            return vizColumns;
        }

        return columns.map(column => WidgetUtils.createVizColumn({
            column,
            isHidden: hiddenColKeys.indexOf(column.columnKey) !== -1,
            columnKey: undefined,
            splitColumnKeys: undefined,
            configType,
            response,
            columnHeaderDetails
        }));
    }

    /**
     * creates a visualization column given a column config
     */
    static createVizColumn(vizColumnData: VizColumnData): VizualizationColumnConfig {
        const {
            column,
            isHidden = false,
            columnKey,
            splitColumnKeys,
            configType,
            response,
            columnHeaderDetails,
            editableCallback,
            onCellValueChanged,
            flex,
            cellEditor,
            valueSetter
        } = vizColumnData;
        const header = splitColumnKeys && splitColumnKeys[column.columnKey] ? WidgetUtils.findSplitColumnHeader(splitColumnKeys[column.columnKey], columnKey) : undefined;
        const columnDefinition: ColumnDefinition = CoreColumnUtils.getColumnDefByTagAndUse(column.columnTag, column.positionColumnType);
        const formatter: DataFormatter = FormatAndScaleFactory.getFormatterToUse(columnDefinition.columnFormat, column.optionValues);
        const originalTitle = CoreColumnUtils.getOriginalColumnTitle(column.columnTag, column.positionColumnType);
        const responseColumnTitle = columnHeaderDetails ? columnHeaderDetails.columnKeyToDisplayNameMap[column.columnKey] : undefined;
        let columnTitle: string;
        if (!isEmpty(header)) {
            if (configType === WidgetConfigType.BAR || configType === WidgetConfigType.FACTOR_GRAPHING_BAR_CHART || configType === WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART) {
                columnTitle = header + ' ' + (responseColumnTitle ? responseColumnTitle : this.getTheModifiedColumnTitle(column, configType));
            } else if (WidgetConfigFactory.getWidgetChartingLib(configType) !== CoreWidgetConstants.CHARTING_LIB.HIGHCHART) {
                columnTitle = header;
            }
        }
        if (!columnTitle) {
            const modifiedColumnTitle = this.getTheModifiedColumnTitle(column, configType);
            columnTitle = responseColumnTitle ? responseColumnTitle : (isNil(modifiedColumnTitle) ? originalTitle : modifiedColumnTitle);
        }

        // HACK, PM-17295: The custom_calc column definition defaults to type numerical.  Custom calc could also return strings or dates
        // so in order to make grid filtering work, we must override custom_calc dataType based on the values in the response data
        let dataType: string = columnDefinition.dataType;
        if (column.columnTag === CUSTOM_CALC_COL_TAG && response) {
            dataType = WidgetUtils.getCustomCalcDataTypeOverride(columnKey || column.columnKey, response) || dataType;
        }

        const optionsValues = ObjectUtils.flattenToObject(column.optionValues.map(value => ({[value.configType]: value})));
        return {
            originalColumnTitle: originalTitle,
            columnKey: isEmpty(columnKey) ? column.columnKey : columnKey,
            columnTag: column.columnTag,
            columnTitle,
            dataType,
            formatter,
            ...optionsValues,
            isHidden,
            isSubtotalable: columnDefinition.isSubtotalable || columnDefinition.dataType === ColumnConstants.COLUMN_DATA_TYPE.DOUBLE,
            splitColumnHeaderName: splitColumnKeys && splitColumnKeys[column.columnKey] ? column.columnTitle : undefined,
            scale: ColumnUtils.getScalingLabel(column),
            ...(editableCallback ? {editableCallback} : {}),
            ...(onCellValueChanged ? {onCellValueChanged} : {}),
            ...(flex ? {flex} : {}),
            ...(cellEditor ? {cellEditor} : {}),
            ...(valueSetter ? {valueSetter} : {})
        };
    }

    /**
     * modify the columnTitle if orignalTitle is equal to columnTitle and isColumnTitleModifiable true
     */
    static getTheModifiedColumnTitle(column: ColumnConfig, configType: string): string {
        column.optionValues.forEach(optionValue => {
            ColumnOptionUtils.updateColumnTitle(column, optionValue, configType);
        });
        return column.columnTitle;
    }

    /**
     * assemble default init filter values coming from favorite
     * returns an object of filter models in a format that ag-grid understands
     */
    static assembleDefaultFilterValues(columnSet: ColumnSet, columns: string[]): Record<string, AuxAdvancedFilterModel> {
        const gridColumnFilters: Record<string, AuxAdvancedFilterModel> = {};

        if (columnSet && !isEmpty(columnSet.columns)) {
            columnSet.columns
                .filter(column => column.columnFilters && !column.columnFilters.isEmpty())
                .map(column => column.columnFilters.columnFilters)
                .forEach(columnFilter => Object.keys(columnFilter).forEach(key => {
                    gridColumnFilters[key === columns[0] ? ColumnConstants.AUTO_GRP_COLUMN : key] = columnFilter[key];
                }));
        }

        return gridColumnFilters;
    }

    /**
     * Errors out the widget and stop the loading
     */
    static errorOutWidget(widget: WidgetComponent, notificationText: string) {
        // Store the payload for rendering in the widget's data store
        widget.widget.dataStore.data = {notification: Notification.createErrorNotification(notificationText, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ERROR_OUT_WIDGET_ERROR)};
        // update the loading status of the widget to false
        const widgetLoadingStatus$ = AppStore.getWidgetLoadingStatus$(widget.widget.id);
        widgetLoadingStatus$.next(false);
    }

    /**
     * Find header for the passed in column key from the provided splitColumnHeaderKeys
     */
    private static findSplitColumnHeader(splitColumnHeaderKeys: SplitColumnHeaderKey[], columnKey: string): string {
        let headerToReturn = null;
        splitColumnHeaderKeys.forEach((splitColumnHeaderKey: SplitColumnHeaderKey) => {
            if (splitColumnHeaderKey.children && splitColumnHeaderKey.children.length > 0) {
                const header = WidgetUtils.findSplitColumnHeader(splitColumnHeaderKey.children, columnKey);
                if (!isNil(header)) {
                    headerToReturn = header;
                }
            }
            if (splitColumnHeaderKey.updatedKey === columnKey) {
                headerToReturn = splitColumnHeaderKey.header;
            }
        });
        return headerToReturn;
    }

    /**
     * Adds leaf level to breakdowns so that child spritelet chart can drilldown to leaf level
     */
    static getLeafBreakdownLevel(parentColumnSet: ColumnSet): string {
        // use first column of leaf level to group on
        return parentColumnSet.columns[0].columnKey;
    }

    /**
     * Creates the corresponding composite key filters for when looking at a subset of data
     */
    static generateQueryKeys(path: TableBreakdown[]): QueryKeyEntry[] {
        return path.map(breakdown => new FilterIncludeKey(breakdown.level, [breakdown.value]));
    }

    /**
     * returns scaled value if formatter is numeric, else returns the value as it is
     */
    static getInputValueToFormat(value: any, formatter: any, isExpost = false, previousScaling?: number): number {
        // case applies to scaling via shortcuts
        if (previousScaling && isNumber(value)) {
            return value * previousScaling;
        }

        const scaling = formatter instanceof NumericDataFormatter ? formatter.getScaling() : undefined;
        return isNumber(scaling) && isNumber(value)
            ? value * scaling * (isExpost ? scaling : 1)
            : value;
    }

    /**
     * add missing null values to the passed in indices for each row of data
     */
    static addNullValuesToResponseData(responseData: ResponseData, absentValueIndices: number[]): void {
        absentValueIndices.forEach(i => responseData.data.splice(i, 0, null));
        if (responseData.children) {
            responseData.children.forEach(child => WidgetUtils.addNullValuesToResponseData(child, absentValueIndices));
        }
    }

    /**
     * Add Set of columns required for time Series Spritelet
     */
    static getTimeSeriesSpriteletColumns(cols: ColumnSet): ColumnSet {
        const columns = [];
        for (let i = 0; i < cols.columns.length; i++) {
            const colDef = LibColumnUtils.getColumnDefinition(cols.columns[i]);

            // Don't add columns of security type
            let hasSecurityGroup = false;
            if (colDef.columnType === 'SECURITY') {
                hasSecurityGroup = true;
            }

            if (hasSecurityGroup === false) {
                // See if Security is a column group
                for (let j = 0; j < colDef.groups.length; j++) {
                    if ('Security' === colDef.groups[j]) {
                        hasSecurityGroup = true;
                        break;
                    }
                }
            }

            if (hasSecurityGroup) {
                continue;
            }

            // Add column
            columns.push(cols.columns[i]);
        }
        const columnSet = new ColumnSet();
        columnSet.columns = columns;
        return columnSet;
    }

    /**
     *  Returns true if provided widget has riskFactorBreakdown of type macro factor.
     */
    static hasMacroFactorBreakdown(widget: Widget): boolean {
        const riskFactorBreakdown = widget.getCombinedInputs().get(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN);
        return riskFactorBreakdown && !(riskFactorBreakdown as Breakdown).isMandateDefaultBreakdown && (riskFactorBreakdown as Breakdown).isMacroFactorBreakdown();
    }

    /**
     * Looks at the response data to determine what dataType custom calc columns should have.  Used for setting the ag-grid column to the correct data type.
     * @param columnKey  Custom calc column key
     * @param response  Raw backend response data
     */
    static getCustomCalcDataTypeOverride(columnKey: string, response: ExploreResponse): string | null {
        const columnIndex = response.data.columns.indexOf(columnKey);

        if (columnIndex === -1) {
            return null;
        }

        // Checks if value is a date
        const isDate = (value: any): boolean => moment(value, DateFormatConstants.DDMMMYYYY_DASH, true).isValid();
        // Checks if value is a string. Note- we ignore strings that can be parsed to dates
        const isString = (value: any): boolean => (typeof value === 'string' || value instanceof String) && !isDate(value);

        // when determining the dataType of a custom_calc column with mixed types, the order of priority is string -> date -> number
        if (WidgetUtils.checkRowDataType(columnIndex, response.data.data, isString)) {
            return ColumnConstants.COLUMN_DATA_TYPE.STRING;
        }

        if (this.checkRowDataType(columnIndex, response.data.data, isDate)) {
            return ColumnConstants.COLUMN_DATA_TYPE.DATE;
        }

        // default dataType of custom_calc is DOUBLE
        return ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
    }

    /**
     * Recursively looks through a data response to determine if any of a column's values are of the dataType specified
     * @param columnIndex  Index of the custom_calc column being checked
     * @param responseData  Raw response data
     * @param dataTypeCheck  Function used to check the dataType of the responseData
     */
    static checkRowDataType(columnIndex: number, responseData: ResponseData, dataTypeCheck: (value: any) => boolean): boolean {
        // check if current row matches dataType
        const currValue = responseData.data?.[columnIndex];
        if (dataTypeCheck(currValue)) {
            return true;
        }

        // check if any children match the dataType
        if (responseData.children) {
            if (responseData.children.some(child => this.checkRowDataType(columnIndex, child, dataTypeCheck))) {
                return true;
            }
        }
        return false;
    }

    /**
     * This method sanitizes string
     * First remove invalid characters denoted by uFFFD, i.e.,�
     * Then try to decode the converted input character by character
     * If there is no error, append the original character to the result;
     * Otherwise it indicates that this character is not properly encoded up to this point. Hence, encode the entire input and return it
     * This should make sure no error will be thrown when protobuf tries to decode it.
     * @param input Input string
     * @return sanitized string
     */
    static sanitizeString(input: string): string {
        // remove invalid characters
        input = input.replace(/\uFFFD/g, '');
        let result = '';
        // try to decode character one by one
        for (const ch of Array.from(input)) {
            try {
                decode(ch);
                result += ch;
            } catch (e) {
                console.log('Unable to utf8 decode character %s.', ch, e);
                result = encode(input);
                return result;
            }
        }
        return result;
    }

    /**
     * Validate if PGS chart widget is compatible with the portfolio in report group
     */
    static validatePgsChartWidget(notification: Notification, widget: Widget, portfolioName: string, portfolioFullName: string, comparisonConfigId: number): Notification {
        if (!ChartUtils.isPGSGraphingSpritelet(widget.configType) || !isNil(notification)) {
            return notification;
        }

        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(comparisonConfigId)) { // Comparison mode is not supported for PGS chart widgets
            return Notification.createWarningNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.PGS_CHART, ErrorTypeConstants.UI_VALIDATION_ERROR);
        }

        const pgsChartPortfolio = isNil(widget.dataStore.data?.requestConfig) ? widget.pgsChartPortfolio : widget.dataStore.data?.requestConfig?.portfolio;
        return (portfolioName === portfolioFullName || pgsChartPortfolio !== portfolioFullName) && (pgsChartPortfolio === portfolioName || widget.pgsChartInputs?.level === 0) ? notification : Notification.createErrorNotification(AlertConstants.NOTIFICATION.PGS_CHART_COMPATIBILITY_ISSUE, 'UI_VALIDATION_ERROR');
    }
}
