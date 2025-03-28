import {Injectable} from '@angular/core';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {AlertConstants, ColumnConfig, ColumnConstants, CoreColumnUtils, DateValue, ErrorTypeConstants, NumericColumnFormat, UIErrorParameters, UseType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {FactorDataCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnSet, NumericDataFormatter} from '@blk/explore-ui-column-option';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ExploreResponse} from '@interfaces/response.interface';
import {RequestAdapterConfig, VizualizationColumnConfig} from '@interfaces/request.interface';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {cloneDeep, isNil} from 'lodash';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {ChartType} from '@qbstr/highcharts-api';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {createDataCube} from '@utils/qbstr';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {DateDataFormatter} from '@models/data-formatters/date-data.formatter';
import {DateFormat} from '@models/column-formats/date-format.model';

import {ColumnUtils} from '@utils/column.utils';
import {FactorDataRiskMatrixSettings} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';

@Injectable()
export class FactorDataService extends AbstractWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.FACTOR_DATA, exploreDataRequestService, [WidgetConfigType.FACTOR_DATA], WidgetDataViewOption.HOLDINGS_VIEW);
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, _widget: Widget): void {
        const columns = cloneDeep(widgetInputs.get(WidgetInputType.COLUMNS)) as ColumnSet;
        const factorDataChartSettings = widgetInputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings;
        // Removing riskSettings at column level
        const hideColumnRiskSettings = ColumnUtils.checkToHideColumnRiskSettingsFactorDataWidget(factorDataChartSettings.isTimeSeriesMode, factorDataChartSettings.factorTimeSeriesSelectedOption);
        if (hideColumnRiskSettings) {
            columns.columns.forEach(column => {
               column.optionValues = column.optionValues.filter(optionValue => optionValue.configType !== RiskSettings.CONFIG_TYPE);
            });
        }
        if (factorDataChartSettings.isTimeSeriesMode) {
            const dateCol = ColumnConfig.createColumn(ColumnConstants.DATE, UseType.ALL, ColumnConstants.DATE);
            columns.columns.unshift(dateCol);
        } else {
            const titleCol = ColumnConfig.createColumn(ColumnConstants.FBA_TITLE, UseType.ALL, ColumnConstants.FBA_TITLE);
            columns.columns.unshift(titleCol);
            const factorDataRiskMatrixSettings = widgetInputs.get(FactorDataRiskMatrixSettings.configType) as FactorDataRiskMatrixSettings;
            if (!isNil(factorDataRiskMatrixSettings.comparisonDate)) {
                const factorComparisonMatrixRiskSettings = widgetInputs.get(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS) as RiskSettings;
                factorComparisonMatrixRiskSettings.economyRiskSettings.dateObject = DateValue.newDate(factorDataRiskMatrixSettings.comparisonDate);
            }
        }
        widgetInputs.delete(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN);
        widgetInputs.set(WidgetInputType.COLUMNS, columns);

        const widgetRiskSettings = (widgetInputs.get(CoreRiskConstants.RISK_SETTINGS) as RiskSettings);

        const defaultRiskSettings = widgetRiskSettings?.getParentRiskSettings()?.getParentRiskSettings()?.createAllRiskSettings();

        widgetInputs.set(CoreRiskConstants.DEFAULT_RISK_SETTINGS, defaultRiskSettings);
    }

    /**
     * This is overwritten by false for timeseries and return widgets for error message
     */
    supportsPointInTimePortfolio(): boolean {
        return false;
    }

    /**
     * Validate the inputs for the time series chart to ensure that the request can be satisfied.
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        // This widget does not support comparison mode, so error out if this is enabled.
        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.TIME_SERIES, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_TIME_SERIES_ERROR);
        }
        const factorDataChartSettings = widget.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings;
        //  In case of Risk Matrix, If duplicate factors present show error notification in the widget
        if (!factorDataChartSettings.isTimeSeriesMode) {
            const columns: ColumnConfig[] = (widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
            const uniqueColTags = new Set();
            for (const col of columns) {
                if (uniqueColTags.has(col.columnTag)) {
                    return Notification.createErrorNotification(AlertConstants.NOTIFICATION.DUPLICATE_RISK_FACTORS, ErrorTypeConstants.UI_VALIDATION_ERROR);
                }
                uniqueColTags.add(col.columnTag);
            }
        }

        return super.validateInputs(widget, portfolio, report);
    }

    protected createRequestConfig(widgetInputs: Map<string, WidgetInput>, widget: Widget, response: ExploreResponse, request: any, isCompareMode: boolean): RequestAdapterConfig {
        if ( request.factorDataChartSettings.isTimeSeriesMode === true && (request.factorDataChartSettings.factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.CORRELATIONS || request.factorDataChartSettings.factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.REGRESSION_BETAS)) {
            const responseColumns = response.data.columns;
            const columnKeyToColumnTagMap = new Map(Object.entries(response.data.columnHeaderDetails.columnKeyToTagMap));
            const columnKeyToDisplayNameMap = new Map(Object.entries(response.data.columnHeaderDetails.columnKeyToDisplayNameMap));
            const visualizationColumns: VizualizationColumnConfig[] = [];
            responseColumns.forEach((col: string) => {
                const originalTitle = CoreColumnUtils.getOriginalColumnTitle(columnKeyToColumnTagMap.get(col), ColumnConstants.FACTOR_MODEL);
                const columnConfig: VizualizationColumnConfig = {
                    originalColumnTitle: originalTitle,
                    columnTag: columnKeyToColumnTagMap.get(col),
                    columnKey: col,
                    columnTitle: columnKeyToDisplayNameMap.get(col),
                    isHidden: false,
                    isSubtotalable: false,
                    formatter: null,
                    dataType: null
                };
                if (col === ColumnConstants.DATE) {
                    const dateFormat = new DateFormat();
                    dateFormat.value = 'dd-MMM-yyyy';

                    columnConfig.formatter = new DateDataFormatter(dateFormat, []);
                    columnConfig.dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
                } else {
                    const colFormat = new NumericColumnFormat();
                    colFormat.decimalPlaces = 8;
                    colFormat.scalingFactor = 1;
                    colFormat.isScalable = true;

                    columnConfig.formatter = new NumericDataFormatter(colFormat, []);
                    columnConfig.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
                    columnConfig.isSubtotalable = true;
                }
                visualizationColumns.push(columnConfig);
            });
            // Create request config
            return {
                columns: visualizationColumns,
                splitColumns: visualizationColumns,
                portfolio: this.getPortfolioName(request, isCompareMode),
                isCompareMode
            };
        } else {
            return super.createRequestConfig(widgetInputs, widget, response, request, isCompareMode);
        }
    }

    protected customVizConfig(_widget: Widget, widgetInputs: Map<string, WidgetInput>, _portfolio: string): FactorDataCustomVizConfig {
        const factorChartSettings = widgetInputs.get(FactorDataChartSettings.FACTOR_DATA_CHART_SETTINGS) as FactorDataChartSettings;
        const timeSeriesSettings = widgetInputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings;
        const factorRiskMatrixSettings = widgetInputs.get(FactorDataRiskMatrixSettings.FACTOR_DATA_RISK_MATRIX_SETTINGS) as FactorDataRiskMatrixSettings;
        const factorDataHighlightSettings = widgetInputs.get(FactorDataHighlightSettings.configType) as FactorDataHighlightSettings;
        return {
            isTimeSeriesMode: factorChartSettings.isTimeSeriesMode,
            factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption[factorChartSettings.factorTimeSeriesSelectedOption],
            chartType: timeSeriesSettings?.chartType === ChartType.LINE ? ChartType.LINE : ChartType.COLUMN,
            dateFormat: timeSeriesSettings?.dateFormat,
            compareModeToggle: timeSeriesSettings?.compareModeToggle,
            compareMode: timeSeriesSettings?.compareMode,
            comparisonDate: factorRiskMatrixSettings?.comparisonDate,
            isTriangularMatrix: factorRiskMatrixSettings?.isTriangularMatrix,
            showChangeInUpperTriangle: factorRiskMatrixSettings?.showChangeInUpperTriangle,
            factorDataHighlightSettings: !factorChartSettings.isTimeSeriesMode ? factorDataHighlightSettings : undefined,
        };
    }

    protected processResponse(_widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload): void  {
        const {cube, breakdownLevels} = createDataCube(requestAdapterConfig, response, null, null, widgetPayload.customVizConfig);
        widgetPayload.cube = cube;
        widgetPayload.breakdownLevels = breakdownLevels;
    }
}
