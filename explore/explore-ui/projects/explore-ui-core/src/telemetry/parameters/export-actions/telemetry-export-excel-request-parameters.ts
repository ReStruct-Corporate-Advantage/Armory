/**
 * TelemetryExportExcelRequestParameters captures information related to pdf file download.
 */
export class TelemetryExportExcelRequestParameters {
    exportLevel: string;
    showAllRecord: boolean;
    breakdownDisplay: string;
    outlineStyle: string;
    freezeColumnHeaders: boolean;
    suppressRowShading: boolean;
    useMergedCellFooter: boolean;
    appendTimestamp: boolean;

    constructor(exportLevel: string, showAllRecord: boolean, breakdownDisplay: string, outlineStyle: string,
                freezeColumnHeaders: boolean, suppressRowShading: boolean, useMergedCellFooter: boolean, appendTimestamp: boolean) {
        this.exportLevel = exportLevel;
        this.showAllRecord = showAllRecord;
        this.breakdownDisplay = breakdownDisplay;
        this.outlineStyle = outlineStyle;
        this.freezeColumnHeaders = freezeColumnHeaders;
        this.suppressRowShading = suppressRowShading;
        this.useMergedCellFooter = useMergedCellFooter;
        this.appendTimestamp = appendTimestamp;
    }
}
