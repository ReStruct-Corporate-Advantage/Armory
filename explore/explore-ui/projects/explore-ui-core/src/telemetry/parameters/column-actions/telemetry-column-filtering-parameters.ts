import {ColumnDescriptionTrackingParameters} from './telemetry-column-tracking-parameters';
import {ReportContextParameters} from '../report-context/report-context-parameters';

export class ColumnFilteringParameters extends ColumnDescriptionTrackingParameters {
    widgetType: string;
    filterType: string;
    filterValue: string;
    reportContext: ReportContextParameters;

    /**
     * set the values we want to capture when we perform a column filter
     * A widget can have multiple column filtering, for each column we invoke
     * this methods
     * @param colTag
     * @param columnKey
     * @param widgetType
     * @param filterType
     * @param filterValue
     * @param reportTitle
     * @param reportId
     * @param reportOwner
     */
    constructor(colTag: string, widgetType: string, filterType: string,
                filterValue: string, reportTitle?: string, reportId?: number|string, reportOwner?: string) {
        super(colTag);
        this.widgetType = widgetType;
        this.filterType = filterType;
        this.filterValue = filterValue;
        this.reportContext = new ReportContextParameters(reportTitle, reportId, reportOwner);
    }
}
