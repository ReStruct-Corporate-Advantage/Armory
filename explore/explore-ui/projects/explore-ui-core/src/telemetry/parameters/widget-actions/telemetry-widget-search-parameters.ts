/**
 * TelemetryWidgetSearchParameters captures information related to widget searching.
 * widget searching in invoked when we click on the magnifying glass on a table widget.
 */
export class TelemetryWidgetSearchParameters {
    widgetType: string;
    searchColumn: string;
    searchValue: string;
    isWrapSearchEnabled: boolean;

    constructor(widgetType: string, searchColumn: string, searchValue: string, isWrapSearchEnabled: boolean) {
        this.widgetType = widgetType;
        this.searchColumn = searchColumn;
        this.searchValue = searchValue;
        this.isWrapSearchEnabled = isWrapSearchEnabled;
    }
}
