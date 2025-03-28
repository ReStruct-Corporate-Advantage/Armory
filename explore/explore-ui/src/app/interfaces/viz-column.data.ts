import {ColumnConfig} from '@blk/explore-ui-core';
import {ColumnHeaderDetails, ExploreResponse, SplitColumnKeys} from '@interfaces/response.interface';
import {CellValueChangedEvent, EditableCallback, RowNode, ValueSetterFunc} from 'ag-grid-community';

/**
 * interface for config to be passed while creating a visualization config object
 */
export interface VizColumnData {
    column: ColumnConfig;
    isHidden?: boolean;
    columnKey?: string;
    splitColumnKeys?: SplitColumnKeys;
    configType?: string;
    response?: ExploreResponse;
    columnHeaderDetails?: ColumnHeaderDetails;
    editableCallback?: EditableCallback;
    onCellValueChanged?: (params: CellValueChangedEvent) => void;
    flex?: number;
    cellEditor?: any;
    valueSetter?: ValueSetterFunc<RowNode, string>;
}
