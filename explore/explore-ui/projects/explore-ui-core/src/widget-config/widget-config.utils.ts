import {FavoriteType} from '../favorite/enums';
import {ConfigTypeConstants} from '../core/constants/config-type.constants';
import {CoreWidgetConfigStore} from './core-widget-config.store';
import {WidgetConfigType, WidgetInputType} from './enums';

export class WidgetConfigUtils {
    /**
     * This function returns the favorite type for the given widget input
     */
    static getWidgetInputFavoriteType(widgetType: string, inputType: string, inputName: string): string {
        if (inputType === WidgetInputType.BREAKDOWN_TREE) {
            if (inputName === ConfigTypeConstants.RISK_FACTOR_BREAKDOWN) {
                return FavoriteType.FACTOR_BREAKDOWN;
            } else {
                return FavoriteType.BREAKDOWN;
            }
        } else if (inputType === WidgetInputType.COLUMNS) {
            switch (widgetType) {
                case WidgetConfigType.RISK_EXPOSURE:
                    return FavoriteType.REPORT;
                case WidgetConfigType.PGS:
                    return FavoriteType.MULTI_REPORT;
                case WidgetConfigType.PRA:
                    return FavoriteType.RISK_REPORT;
                case WidgetConfigType.RETURNS:
                    return FavoriteType.RETURN_REPORT;
                case WidgetConfigType.EXPOST_TIME_SERIES:
                case WidgetConfigType.EXPOST_RETURNS:
                case WidgetConfigType.EXPOST_STATS:
                    return FavoriteType.EXPOST_REPORT;
                case WidgetConfigType.COMMITMENT_RISK:
                // Currently stats columnSet is savable when the widget is chart mode.
                // This will be updated if/when we support configurable columnSet for the chart.
                case WidgetConfigType.COMMITMENT_RISK_CHART:
                    return FavoriteType.COMMITMENT_RISK_REPORT;
                default:
                    return FavoriteType.CHART_REPORT;
            }
        } else if (inputType === WidgetInputType.CUSTOM_FILTER) {
            return FavoriteType.CUSTOM_SEC;
        }
    }

    /**
     * Checks if single column can be selected for widget.
     */
    static isSingleColumnWidget(widgetType?: string): boolean {
        return CoreWidgetConfigStore.getChartConfigForType(widgetType)?.showOnlySingleColumn;
    }

    /**
     * Return true if passed in configType is of return spritelet widget
     */
    static isReturnSpritelet(configType: string): boolean {
        return (configType === WidgetConfigType.RETURNS_FX_ATTRIBUTION || configType === WidgetConfigType.RETURNS_MANAGER_SELECTION || configType === WidgetConfigType.RETURNS_PERF_DETAIL || configType === WidgetConfigType.RETURNS_TIME_SERIES ||
            configType === WidgetConfigType.RETURNS_DRILLDOWN_PERF_DETAIL || configType === WidgetConfigType.RETURNS_DRILLDOWN_TIME_SERIES);
    }

    /**
     * Return true if passed in configType is of expost widget
     */
    static isExpostWidget(configType: string): boolean {
        return (configType === WidgetConfigType.EXPOST_RETURNS || configType === WidgetConfigType.EXPOST_STATS || configType === WidgetConfigType.EXPOST_TIME_SERIES);
    }
}
