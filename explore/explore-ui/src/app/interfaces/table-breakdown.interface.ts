/**
 * Used for selecting a subset of data in a data grid.  Maps the level in the data grid to the value to filter on for that level.
 */
export interface TableBreakdown {
    // level in data grid, i.e. _ROOT_, level-1
    level: string;
    // value at the level
    value: string;
}
