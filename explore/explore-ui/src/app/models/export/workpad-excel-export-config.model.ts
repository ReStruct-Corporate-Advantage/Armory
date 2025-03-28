import {ExcelExportConfig} from './excel-export-config.model';
import {isNil, isObject} from 'lodash';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Class for workpad level and up (including workspace) specific Excel Export configuration options
 */
export class WorkpadExcelExportConfig extends ExcelExportConfig {

    static CONFIG_TYPE = 'WorkpadExcelExportConfig';

    oneWorkbookPerWorkpad = false;

    isWorkspaceRequest = false;

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
        return 'WorkpadExcelExportConfig';
    }

    /**
     * Serialize the config to json
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data = super.serialize(isNested);
        data.configType = WorkpadExcelExportConfig.CONFIG_TYPE;
        data.oneWorkbookPerWorkpad = this.oneWorkbookPerWorkpad;
        return data;
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        super.deserialize(data);
        if (data) {
            // Set the values if present, else set to default ones
            this.oneWorkbookPerWorkpad = !isNil(data.oneWorkbookPerWorkpad) ? data.oneWorkbookPerWorkpad : false;
        }
    }
}
