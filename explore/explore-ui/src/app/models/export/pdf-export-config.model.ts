import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {ExportConfig} from '@interfaces/export-config.interface';
import {isNil, isNumber, isObject, isString} from 'lodash';
import {ExportConstants, ExportLevel} from '../../constants';
import {PDFExportOrientation} from '@enums/export/pdf-export-orientation.enum';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {PDFPageMargin} from './pdf-page-margin.model';
import {LogoConfig} from '@models/export/logo-config.model';

/**
 * Class for PDF Export configuration options
 */
export class PDFExportConfig extends AbstractConfig implements ExportConfig {

    static CONFIG_TYPE = 'PDFExportConfig';

    orientation: PDFExportOrientation = PDFExportOrientation.PORTRAIT;
    appendTimestamp = false;
    layout: PDFPageLayout = PDFPageLayout.REPORT_AS_IS;
    pageFormat: PDFPageFormat = PDFPageFormat.LETTER;
    pageMargin: PDFPageMargin = PDFPageMargin.NORMAL;
    printAsIs = true;
    exportLevel: ExportLevel;
    logoConfig: LogoConfig = new LogoConfig();

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type for PDF export configs
     */
    get configType(): string {
        return PDFExportConfig.CONFIG_TYPE;
    }

    /**
     * Gets the export type
     */
    getExportType(): string {
        return ExportConstants.PDF;
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            configType: PDFExportConfig.CONFIG_TYPE,
            orientation: this.orientation,
            printAsIs: this.printAsIs,
            pageFormat: this.pageFormat,
            logoConfig: this.logoConfig.serialize(),
            layout: this.layout,
            pageMargin: this.pageMargin.serialize(),
            type: ExportConstants.PDF_TYPE,
            appendTimestamp: this.appendTimestamp
        };
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.orientation = PDFExportOrientation[PDFExportOrientation[data.orientation]];
        this.printAsIs = data.printAsIs;
        this.logoConfig = new LogoConfig(data.logoConfig);
        // Cater for Prism Favorites that have pageFormat as a string
        this.pageFormat = isString(data.pageFormat) ? PDFPageFormat[data.pageFormat.toUpperCase() as string] : data.pageFormat;

        if (isString(data.widgetLayout)) {
            // Cater for Prism Favorites that have pageLayout as a string
            this.layout = PDFPageLayout.getExplorePDFPageLayoutFromPrism(data.widgetLayout);
        } else {
            this.layout = (isNumber(data.layout) && !Number.isNaN(data.layout)) ? data.layout : PDFPageLayout.W1X1;
        }

        this.appendTimestamp = !isNil(data.appendTimestamp) ? data.appendTimestamp : false;
        // Cater for Prism Favorites that have pageMargin as a string
        this.pageMargin = isString(data.pageMargin) ? PDFPageMargin.getExplorePDFPageMarginFromPrism(data.pageMargin) : PDFPageMargin.deserialize(data.pageMargin);
    }
}
