import {ColumnDefinition} from '@blk/explore-ui-core';

/**
 * This class represents the column definition for Columns representing PMS GP Breakdowns for Explore. This extends the base class column definition bean and just adds in another
 * attribute levelColumns which is required to show multiple levels in the breakdown tree when user clicks on such a column. For example GICS_ALL needs to be mapped to 4 levels in the UI
 */
export class GpBreakdownColumnDefinition extends ColumnDefinition {
    levelColumns: string[];

    deserialize(col: any): void {
        super.deserialize(col);
        this.levelColumns = col.levelColumns;
    }
}
