import {ColumnConfig, WidgetInput} from '@blk/explore-ui-core';

/**
 * DerivedColumnOptionServiceInterface
 * Library Consumers need to implement this interface and provide the token: DERIVED_COLUMN_OPTION_SERVICE_TOKEN
 */
export interface DerivedColumnOptionServiceInterface {
    getOptionDefinitions(): Map<string, any>;

    updateColumnWithDerivedSettings(column: ColumnConfig, inputs: Map<string, WidgetInput>, widgetType: string): void;
}
