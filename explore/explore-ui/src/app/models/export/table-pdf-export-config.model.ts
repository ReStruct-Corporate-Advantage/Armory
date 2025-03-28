import {PDFExportConfig} from './pdf-export-config.model';
import {TablePDFScaling} from '@enums/export/table-pdf-scaling.enum';
import {isNil, isObject} from 'lodash';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {ExportConstants} from '../../constants';
import {PDFPageMargin} from './pdf-page-margin.model';
import {LogoConfig} from '@models/export/logo-config.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Class for Table PDF Export configuration options
 */
export class TablePDFExportConfig extends PDFExportConfig {

    static CONFIG_TYPE = 'TablePDFExportConfig';

    fullyExpanded = true; // Default fully expanded to be true
    visibleOnly = false;
    customLevel = false;
    customLevelDepth = 0;
    scaling = TablePDFScaling.NO_SCALING;

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
     * Gets the config type for Table PDF export config
     */
    get configType(): string {
        return TablePDFExportConfig.CONFIG_TYPE;
    }

    /**
     * Serialize the config to json
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            configType: TablePDFExportConfig.CONFIG_TYPE,
            orientation: this.orientation,
            pageFormat: PDFPageFormat[this.pageFormat],
            fullyExpanded: this.fullyExpanded,
            visibleOnly: this.visibleOnly,
            customLevel: this.customLevel,
            customLevelDepth: this.customLevelDepth,
            type: ExportConstants.PDF_TYPE,
            scaling: TablePDFScaling[this.scaling],
            appendTimestamp: this.appendTimestamp,
            logoConfig: this.logoConfig.serialize()
        };

        // Construct the pageMargin in a way that ExploreServer can understand
        // Ex: NORMAL:1:1:1:1 or CUSTOM:0.1:0.2:0.3:0.4
        if (this.pageMargin.units === PDFPageMargin.PIXELS) {
            switch (this.pageMargin) {
                case PDFPageMargin.NARROW:
                    data.pageMargin = 'NARROW:0.5:0.5:0.5:0.5';
                    break;
                case PDFPageMargin.MODERATE:
                    data.pageMargin = 'MODERATE:1:0.75:1:0.75';
                    break;
                case PDFPageMargin.WIDE:
                    data.pageMargin = 'WIDE:1:2:1:2';
                    break;
                default:
                    // Default to Normal if we can't find anything else
                    data.pageMargin = 'NORMAL:1:1:1:1';
            }
        } else {
            data.pageMargin = (this.pageMargin.isCustom ? ExportConstants.PAGE_MARGIN_CUSTOM : this.pageMargin.serialize().option) + ':' + this.pageMargin.top + ':' + this.pageMargin.right + ':' + this.pageMargin.bottom + ':' + this.pageMargin.left;
        }
        return data;
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        super.deserialize(data);
        if (data) {
            // Set the values if present, else set to default ones
            this.fullyExpanded = !isNil(data.fullyExpanded) ? data.fullyExpanded : true;
            this.visibleOnly = !isNil(data.visibleOnly) ? data.visibleOnly : false;
            this.customLevel = !isNil(data.customLevel) ? data.customLevel : false;
            this.customLevelDepth = !isNil(data.customLevelDepth) ? data.customLevelDepth : 0;
            this.scaling = data.scaling ? (<TablePDFScaling><any>TablePDFScaling)[data.scaling] : TablePDFScaling.NO_SCALING;
            this.logoConfig = new LogoConfig(data.logoConfig);
        }
    }
}
