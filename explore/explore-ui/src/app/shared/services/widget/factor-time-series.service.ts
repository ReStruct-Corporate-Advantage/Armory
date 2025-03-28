import {Injectable} from '@angular/core';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {
    AlertConstants,
    ChartWidgetInputConfigType,
    ColumnConstants,
    ErrorTypeConstants,
    UIErrorParameters,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {TimeSeriesCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {CommonConstants} from '@constants/common.constants';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TableBreakdown} from '@interfaces/table-breakdown.interface';
import {FilterIncludeKey, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';

@Injectable()
export class FactorTimeSeriesService extends AbstractChartsWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.RISK_DATA, exploreDataRequestService, [WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES], WidgetDataViewOption.HOLDINGS_VIEW);
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        const riskColumnSettings = widgetInputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS) as RiskColumnSettings;
        if (!riskColumnSettings) {
            return;
        }

        if (riskColumnSettings.disableSectorBreakdown) {
            widgetInputs.delete(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN);
        }

        if (riskColumnSettings.disableFactorBreakdown) {
            widgetInputs.delete(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN);
        }
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

        return super.validateInputs(widget, portfolio, report);
    }

    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>, portfolio: string): TimeSeriesCustomVizConfig {
        const timeSeriesSettings = widgetInputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings;
        const comboChartColSettings = widget.displayInputs.get(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS) as ComboChartColumnSettings;
        const chartType = timeSeriesSettings.chartType;

        // allow for launching factor time series from sector group
        let queryKeys;
        const factorPathInput = widgetInputs.get(FactorPathInput.configType) as FactorPathInput;
        if (factorPathInput && factorPathInput.path.length > 0) {
            // here we are trying to update ROOT value for the factorPath i.e. portfolio name, since it needs to update if the portfolio has changed
            factorPathInput.path[0].value = (factorPathInput.path[0].level === ROOT_LEVEL && portfolio !== factorPathInput.path[0].level) ? portfolio : factorPathInput.path[0].value;
            // generate the default composite keys
            queryKeys = this.generateTimeSeriesQueryKeys(factorPathInput.path);
        }

        // factor time series spritelet will have same title column as parent FBA widget (rfv_ftitle, rfv_ftitle_long) or we default if missing
        const parentColumnSet = widget.dataStore.metaData.parentMetaData?.inputs?.get(WidgetInputType.COLUMNS) as ColumnSet;
        const parentTitleColumnTag = parentColumnSet?.columns.find(col => col.columnTag === ColumnConstants.FBA_TITLE || col.columnTag === ColumnConstants.FBA_TITLE_LONG).columnTag || ColumnConstants.FBA_TITLE;

        // maintain backward compatibility where old spritelets were using rfv_ftitle rather than rfv_block_path in FactorPathInput when going down to factor leaf level
        // new factor time series charts will always use FBA_BLOCK_PATH, but older spritelets may be using FBA_TITLE
        const leafLevel = factorPathInput?.isFactorTimeSeriesLeafLevelPath() ? factorPathInput.path[factorPathInput.path.length - 1].level : ColumnConstants.FBA_BLOCK_PATH;

        return {
            ...this.getYAxisOverrideInputs(widgetInputs),
            showGridLines: widget.displayInputs.get(CommonConstants.WIDGET_LEVEL_PROP_LIST[1]) ? (widget.displayInputs.get(CommonConstants.WIDGET_LEVEL_PROP_LIST[1]) as GridLines).showGridLines : false,
            comboChartColumns: comboChartColSettings.columns,
            showTotal: !factorPathInput.isFactorTimeSeriesLeafLevelPath() && timeSeriesSettings?.includeTotalValues,
            dateFormat: timeSeriesSettings?.dateFormat,
            queryKeys,
            leafLevels: (factorPathInput?.path?.length > 1) ? [leafLevel] : undefined,
            seriesNameFieldOverride: parentTitleColumnTag
        };
    }

    /**
     * Creates the corresponding composite key filters for when looking at a subset of data in time series form
     *
     * Since level-1 is actually the date, we must increment all "level-<>" keys and add additional GroupBy key
     */
    private generateTimeSeriesQueryKeys(path: TableBreakdown[]): QueryKeyEntry[] {
        const queryKeys: QueryKeyEntry[] = path.map(breakdown => {
            let level = breakdown.level;
            if (level.startsWith('level-')) {
                const levelNum = Number(level.charAt(level.length - 1));
                level = `level-${levelNum + 1}`;
            }
            return new FilterIncludeKey(level, [breakdown.value]);
        });
        if (queryKeys.length > 1) {
            const [rootKey, ...levelFilterKeys] = queryKeys;
            return [rootKey, new GroupByKey('level-1'), ...levelFilterKeys];
        }
        return queryKeys;
    }
}
