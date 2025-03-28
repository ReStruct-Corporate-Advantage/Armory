import {ExportType} from '../../enums/telemetry-export-type.enum';
import {isObject} from 'lodash';

/**
 * TelemetryTradeTableExportParameters captures information related to exporting trade table.
 */
export class TelemetryTradeTableExportParameters {
    exportType: ExportType;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize.
     */
    protected deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.exportType = data.exportType;
    }
}
