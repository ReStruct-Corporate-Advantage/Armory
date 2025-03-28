/**
 * Enum for the available widget data view options
 */
export enum WidgetDataViewOption {
    // Sector view will only show sectors (all holdings will be stripped by the backend server)
    SECTOR_VIEW,
    // Holdings view will show sectors and their holdings (the backend server will not strip the holdings)
    HOLDINGS_VIEW,
    // Not applicable (neither sector nor holdings are applicable views for a widget, e.g. PGS widget)
    NOT_APPLICABLE
}
