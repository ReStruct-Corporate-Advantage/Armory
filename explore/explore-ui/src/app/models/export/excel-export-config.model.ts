import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {ExportConfig} from '@interfaces/export-config.interface';
import {ExcelExportOutlineStyle} from '@enums/export/excel-export-outline-style.enum';
import {isObject, isString} from 'lodash';
import {ExportConstants, ExportLevel} from '../../constants';

/**
 * Class for Excel Export configuration options
 */
export class ExcelExportConfig extends AbstractConfig implements ExportConfig {

    static CONFIG_TYPE = 'ExcelExportConfig';

    visibleOnly = false;
    suppressRowShading = false;
    isGroupingEnabled = false;
    fullyExpanded = true; // Default fully expanded to be true
    isFilterFriendly = false;
    freezeColumnHeaders = false;
    exportToSingleSheet = false;
    useMergedCellFooter = false;
    outlineStyle: ExcelExportOutlineStyle = ExcelExportOutlineStyle.HORIZONTAL;
    appendTimestamp = false;
    exportLevel: ExportLevel;
    includeTimePeriod = true;

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
     * Gets the config type for Excel export configs
     */
    get configType(): string {
        return ExcelExportConfig.CONFIG_TYPE;
    }

    /**
     * Gets the export type
     */
    getExportType(): string {
        return ExportConstants.EXCEL;
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            configType: ExcelExportConfig.CONFIG_TYPE,
            visibleOnly: this.visibleOnly,
            suppressRowShading: this.suppressRowShading,
            isGroupingEnabled: this.isGroupingEnabled,
            fullyExpanded: this.fullyExpanded,
            isFilterFriendly: this.isFilterFriendly,
            freezeColumnHeaders: this.freezeColumnHeaders,
            exportToSingleSheet: this.exportToSingleSheet,
            useMergedCellFooter: this.useMergedCellFooter,
            outlineStyle: ExcelExportOutlineStyle[this.outlineStyle],
            appendTimestamp: this.appendTimestamp,
            type: ExportConstants.EXCEL_TYPE_XLSX,
            includeTimePeriod: this.includeTimePeriod
        };
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.visibleOnly = data.visibleOnly;
        this.suppressRowShading = data.suppressRowShading;
        this.isGroupingEnabled = data.isGroupingEnabled;
        this.fullyExpanded = data.fullyExpanded;
        this.isFilterFriendly = data.isFilterFriendly;
        this.freezeColumnHeaders = data.freezeColumnHeaders;
        this.exportToSingleSheet = data.exportToSingleSheet;
        this.useMergedCellFooter = data.useMergedCellFooter;
        this.outlineStyle = isString(data.outlineStyle) ? ExcelExportOutlineStyle[data.outlineStyle as string] : ExcelExportOutlineStyle[ExcelExportOutlineStyle[data.outlineStyle]];
        this.appendTimestamp = data.appendTimestamp;
        this.includeTimePeriod = data.includeTimePeriod;
    }
}
