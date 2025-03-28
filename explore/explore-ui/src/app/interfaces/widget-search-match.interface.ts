/**
 * Represents a search match when performing a search on a table widget with a TreeCube datastore
 */
export interface WidgetSearchMatch {
    // technically rowId is a number but elsewhere in the code casts it from any -> string
    rowId: string;
    isLeafNode: boolean;
    // column key of match used for horizontal scrolling of the grid
    columnKey: string;
    // rowId path from _ROOT_ down to search match (does not include rowId of match)
    path: string[];
}
