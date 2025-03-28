/**
 * TelemetryWidgetReloadParameters captures info about a widget when a user
 * clicks on refresh widget
 */
export class TelemetryWidgetReloadParameters {
    widgetDisplayName: string;
    widgetType: string;
    isHardRefresh: boolean;
    columns: string[];

    constructor(widgetType: string, isHardRefresh: boolean, columns: string[], widgetDisplayName: string) {
        this.widgetType = widgetType;
        this.isHardRefresh = isHardRefresh;
        this.columns = columns;
        this.widgetDisplayName = widgetDisplayName;
    }
}
