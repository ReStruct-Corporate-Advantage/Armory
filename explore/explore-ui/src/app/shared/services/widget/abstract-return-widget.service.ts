import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    AlertConstants, ColumnConstants, CoreDefinitionStore,
    PerformanceConstants,
    PerformanceSettings,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {CommonConstants} from '@constants/common.constants';
import {Notification} from '@models/widget/notification.model';
import {NotificationConstants} from '@constants/notification.constants';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetUtils} from '@utils/widget.utils';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Base class for Returns Analysis Widget and Returns Spritelet Widget services
 */
export abstract class AbstractReturnWidgetService extends AbstractWidgetService {
    /**
     * Creates a new instance with the given parameter
     * @see constructor in AbstractWidgetService
     */
    constructor(protected baseUrl: string, protected exploreDataRequestService: ExploreDataRequestService, protected widgetConfigTypes: Array<WidgetConfigType>) {
        super(baseUrl, exploreDataRequestService, widgetConfigTypes, WidgetDataViewOption.HOLDINGS_VIEW);
    }

    /**
     * Modified given inputs for the Returns data request
     * @see AbstractWidgetService.modifyWidgetInputsForRequest
     */
    modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        if (!widget.dataStore.parentDataStore) {
            return;
        }
        const widgetDataStoreKeys = Array.from(widget.dataStore.metaData.inputs.keys());
        const widgetParentDataStoreKeys = Array.from(widget.dataStore.parentDataStore.metaData.inputs.keys());
        const keysOnlyInParentDataStore = widgetParentDataStoreKeys.filter(key => widgetDataStoreKeys.indexOf(key) === -1);
        keysOnlyInParentDataStore.forEach((key: string) => {
            widgetInputs.set(key, widget.dataStore.parentDataStore.metaData.inputs.get(key));
        });

        if (WidgetConfigType.RETURNS_DRILLDOWN_TIME_SERIES === widget.configType) {
            const columns = WidgetUtils.getTimeSeriesSpriteletColumns(widget.dataStore.parentDataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet);
            widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columns);
            widgetInputs.set(WidgetInputType.COLUMNS, columns);
        }
    }

    /**
     * This is overwritten by false for timeseries and return widgets for error message
     */
    supportsPointInTimePortfolio(): boolean {
        return false;
    }

    /**
     * validates inputs for returns and returns spritelet widgets
     * returns notification in case of error
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        const widgetInputs = new Map<string, WidgetInput>(widget.getCombinedInputs());
        this.modifyWidgetInputsForRequest(widgetInputs, widget);
        const performanceSettings: PerformanceSettings = widgetInputs.get(PerformanceConstants.PERFORMANCE_SETTINGS) as PerformanceSettings;
        const breakdown: Breakdown = widgetInputs.get(CommonConstants.CONFIG_TYPE.BREAKDOWN_TREE) as Breakdown;
        if (performanceSettings.additionalSettings) {
            if (performanceSettings.additionalSettings.showSummary) {
                if (portfolio.isCustomPortGroup()) {
                    return new Notification(`${NotificationConstants.SHOW_SUMMARY_PERF_CUSTOM_PORT_GROUP} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.SHOW_SUMMARY_PERF_CUSTOM_PORT_GROUP, AlertConstants.NOTIFICATION_STYLE.ERROR);
                }
                if (breakdown && !breakdown.isPerformanceBreakdown()) {
                    return new Notification(`${NotificationConstants.SHOW_SUMMARY_PERF_BREAKDOWN_MESSAGE} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.SHOW_SUMMARY_PERF_BREAKDOWN_MESSAGE, AlertConstants.NOTIFICATION_STYLE.ERROR);
                }
            }
            if (performanceSettings.additionalSettings.customBreakdownType && breakdown && !breakdown.hasPortfolioNameColumn()) {
                return new Notification(`${NotificationConstants.BREAKDOWN_FLATTEN_COMPONENT_MESSAGE} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.BREAKDOWN_FLATTEN_COMPONENT_MESSAGE, AlertConstants.NOTIFICATION_STYLE.ERROR);
            }
        }

        // Do additional validation for breakdowns with quantiles in Returns Widget
        if (widget.configType === WidgetConfigType.RETURNS) {
            const notification: Notification = this.validateQuantileBreakdownForReturns(breakdown, widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet);
            if (notification) {
                return notification;
            }
        }

        return super.validateInputs(widget, portfolio, report);
    }

    /**
     * Checks if the breakdown used in the returns widget has a valid quantile configured
     * Quantiles are only valid in a single-level breakdown
     */
    protected validateQuantileBreakdownForReturns(breakdown: Breakdown, columns: ColumnSet): Notification {
        if (!breakdown || breakdown.isEmpty()) {
            return null;
        }
        // Check if the breakdown even has quantiles
        if (breakdown.hasQuantiles()) {
            if (!breakdown.isSingleLevel()) {
                // Error if the breakdown is multi-level
                return new Notification(`${NotificationConstants.MULTI_LEVEL_QUANTILES_NOT_SUPPORTED_IN_RETURNS} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.MULTI_LEVEL_QUANTILES_NOT_SUPPORTED_IN_RETURNS, AlertConstants.NOTIFICATION_STYLE.ERROR);
            } else {
                // If we have a valid single-level quantile breakdown, do one more validation that all columns are performance
                const nonPerformanceColumns = [];

                for (const col of columns.columns) {
                    // Columns that are in the top-level "Performance" grouping will be considered invalid
                    if (CoreDefinitionStore.columnTagColumnsPairs.get(col.columnTag)[0].columnType !== ColumnConstants.PERF_COLUMN_TYPE) {
                        nonPerformanceColumns.push(col.columnTitle);
                    }
                }

                if (nonPerformanceColumns.length) {
                    const columnsString = nonPerformanceColumns.join(', ');
                    // Error if exposure columns are included in the request
                    return new Notification(columnsString + `${NotificationConstants.EXPOSURE_COLUMNS_NOT_SUPPORTED_IN_RETURNS_WITH_QUANTILES} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, columnsString + NotificationConstants.EXPOSURE_COLUMNS_NOT_SUPPORTED_IN_RETURNS_WITH_QUANTILES, AlertConstants.NOTIFICATION_STYLE.ERROR);
                }
            }
        }
    }
}
