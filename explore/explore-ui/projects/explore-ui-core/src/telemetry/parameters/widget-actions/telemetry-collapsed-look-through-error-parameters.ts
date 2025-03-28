/**
 * TelemetryCollapsedLookThroughErrorParameters is used to capture info about collapsed LT errors
 */
export class TelemetryCollapsedLookThroughErrorParameters {
    widgetType: string;
    widgetColumns: string[];
    portfolioTicker: string;
    ltSecurityTypes: Map<string, string[]>;

    constructor(widgetType: string, widgetColumns: string[], portfolioTicker: string, ltSecurityTypes: Map<string, string[]>) {
        this.widgetType = widgetType;
        this.widgetColumns = widgetColumns;
        this.portfolioTicker = portfolioTicker;
        this.ltSecurityTypes = ltSecurityTypes;
    }
}
