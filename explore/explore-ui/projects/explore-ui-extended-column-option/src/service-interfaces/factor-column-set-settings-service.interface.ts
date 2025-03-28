import {
    ColumnConfig,
    WidgetConfigInput,
    WidgetInput,
} from '@blk/explore-ui-core';
import {ColDef} from 'ag-grid-community';

export interface FactorColumnSetSettingsServiceInterface {

    getWidgetConfigInputForBreakdown(): WidgetConfigInput;

    updateColumnWithDerivedSettings(column: ColumnConfig, inputs: Map<string, WidgetInput>): void;

    createSpecifiedShocksRequest(isCreateNewScenarioFlow: boolean): any;

    createAuxGridColDefs(columns: ColumnConfig[], columnHeaderDetails?: any): ColDef[];

    getSpecifiedScenarioDataUrl(isCreateNewScenarioFlow: boolean): string;
}
