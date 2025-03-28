/**
 * Interface implemented by export configurations
 */
import {ExportLevel} from '@constants/export.constants';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

export interface ExportConfig {
    appendTimestamp: boolean;
    exportLevel: ExportLevel;

    /**
     * Serializes the export configuration
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any;

    getExportType(): string;
}
