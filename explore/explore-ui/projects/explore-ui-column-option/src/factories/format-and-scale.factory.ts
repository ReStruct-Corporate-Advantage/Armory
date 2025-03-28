import {ColumnFormat} from '@blk/explore-ui-core';
import {DataFormatter} from '../interfaces';
import {AbstractColumnOption} from '@blk/explore-ui-core';
import {StringDataFormatter} from '../models/data-formatter/string-data-formatter.model';

/**
 * Factory responsible for registering different types of formatters based on different column formats and then using them to format the values
 */
export class FormatAndScaleFactory {

    // Map containing the registered formatter types for different column formats
    private static formatterTypes: Map<string, any> = new Map<string, any>();

    /**
     * Registers a config type with the factory.
     */
    static registerFormatterType(columnFormat: string, formatter: any) {
        FormatAndScaleFactory.formatterTypes.set(columnFormat, formatter);
    }

    /**
     * Return the data formatter to be used based on column format and column options passed in
     */
    static getFormatterToUse(columnFormat: ColumnFormat, columnOptions: AbstractColumnOption[]): DataFormatter {
        // If no column format is defined then try to use the string formatter
        if (!columnFormat) {
            return new StringDataFormatter();
        }
        const formatterType = FormatAndScaleFactory.formatterTypes.get(columnFormat.getConfigType());
        return new formatterType(columnFormat, columnOptions);
    }
}
