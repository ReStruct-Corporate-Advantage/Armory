/**
 * TelemetryExportPDFRequestParameters captures information related to pdf file download.
 */
export class TelemetryExportPDFRequestParameters {
    exportLevel: string;
    orientation: string;
    appendTimestamp = false;
    layout: string;
    pageFormat: string;
    pageMargin: string;
    printAsIs = true;
    isLogoEnabled: boolean;
    logoPresent: boolean;
    logoPosition: string;
    showLogoPreview: boolean;

    constructor(exportLevel: string, orientation: string, appendTimestamp: boolean, layout: string,
                pageFormat: string, pageMargin: string, printAsIs: boolean, isLogoEnabled: boolean,
                logoPresent: boolean, logoPosition: string, showLogoPreview: boolean
    ) {
        this.exportLevel = exportLevel;
        this.orientation = orientation;
        this.appendTimestamp = appendTimestamp;
        this.layout = layout;
        this.pageFormat = pageFormat;
        this.pageMargin = pageMargin;
        this.printAsIs = printAsIs;
        this.isLogoEnabled = isLogoEnabled;
        this.logoPresent = logoPresent;
        this.logoPosition = logoPosition;
        this.showLogoPreview = showLogoPreview;
    }
}
