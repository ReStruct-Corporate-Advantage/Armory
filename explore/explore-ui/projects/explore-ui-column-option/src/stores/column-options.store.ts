import {ColumnOptionMetaDataInterface} from '@blk/explore-ui-core';
import {ColumnSelectorOption} from '../models/ui/column-selector-option.model';

export class ColumnOptionsStore {
    /**
     * List of column options
     */
    static columnOptions: Map<string, ColumnOptionMetaDataInterface[]> = new Map();
}
