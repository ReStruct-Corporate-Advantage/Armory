import {ExportConstants, ExportLevel} from '@constants/export.constants';
import {isNil} from 'lodash';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Export Config to export widgets as images.
 */
export class ImageExportConfig extends PDFExportConfig {

    static CONFIG_TYPE = 'ImageExportConfig';

    appendTimestamp = false;
    exportLevel = ExportLevel.WIDGET;

    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.appendTimestamp = !isNil(data.appendTimestamp) ? data.appendTimestamp : false;
    }

    getExportType(): string {
        return ExportConstants.IMAGE;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            configType: ImageExportConfig.CONFIG_TYPE,
            type: ExportConstants.IMAGE_TYPE,
            appendTimestamp: this.appendTimestamp
        };
    }

}
