import {NumericDataFormatter} from '@blk/explore-ui-column-option';
import {QueryKey, StreamConfig} from '@qbstr/data-cube';
import {Observable, of} from 'rxjs';
import {AnyAction} from 'redux';
import {isNil} from 'lodash';
import {ColumnConstants} from '@blk/explore-ui-core';
import {ColumnMap} from '@utils/qbstr/qbstr.adapter';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {ReactiveCubeCrud, ReactiveStream, ReactiveStreamConfig} from '@qbstr/data-cube-reactive';
import {WidgetSearchMatch} from '@interfaces/widget-search-match.interface';
import {DateDataFormatter} from '@models/data-formatters/date-data.formatter';

/**
 * This is an implementation of the cube that takes the Explore tree structure.
 * The main difference from the SimpleCube is that this implementation does a lazy
 * conversion of the nodes to help reduce the time it take to process the cube.
 * For very large responses, >50,0000 nodes, the other implementation was taking
 * around 20s, this is <1s as most of the processing time is delayed till it is needed.
 *
 * NOTE:  Currently this implementation is only to be used with the R&E and Returns widgets.
 */
export class TreeCube implements ReactiveCubeCrud<any> {
    public static readonly LEVEL_KEY = 'level-';
    private columnMap: ColumnMap = {};
    private columnFormatters: any = {};
    private leafNodeCache: any[] = undefined;
    public store: any;

    /**
     * Constructor that passes in the raw data.
     */
    constructor(protected port: string, protected columns: VizualizationColumnConfig[], protected rawData: any) {
        // Create a formatter lookup for the columns.
        columns.forEach(column => {
            this.columnMap[column.columnKey] = column;
        });
        this.rawData.columns.forEach(column => {
            const colKey = column.split('|')[0];
            const col = this.columnMap[colKey];
            if (col) {
                this.columnFormatters[column] = col.formatter;
            }
        });
    }

    /**
     * Convenience function used to check if a node has any children.
     */
    private static hasChildren(rawRow: any): boolean {
        return (!isNil(rawRow.children) && rawRow.children.length > 0);
    }

    /**
     * Clears the entire data of the tree
     * */
    delete(ck: QueryKey): void {
        const path: string[] = this.getKeyPath(ck);
        if(path.length === 0){
            return;
        }
        const rootNode = this.getRawRow(path);
        const stack = [rootNode];

        while (stack.length > 0) {
            const node = stack.pop();
            node.data = node.data.map(() => null);

            if (node.children) {
                stack.push(...node.children);
            }
        }
    }


    dispatch(action: AnyAction): void {
        // Not needed in this implementation
    }

    /**
     * Given the key get the list of rows that match.
     */
    get(ck: QueryKey): Observable<Partial<any[]>> {
        return of(this.getData(ck));
    }

    getData(ck: QueryKey): Partial<any[]> {
        // If the key is empty then we want to return the root node.
        let rows = [];
        const path = this.getKeyPath(ck);
        if (path.length === 0) {
            // Get the node for this path.
            rows = [this.convertRawRow(this.rawData.data)];
        } else {
            const pathRow = this.getRawRow(path);
            if (pathRow?.children) {
                rows = pathRow.children.map(rawRow => this.convertRawRow(rawRow, path));
            }
        }
        return rows;
    }


    getConfig(): ReactiveStreamConfig {
        // Not needed in this implementation
        return null;
    }

    getSimilarIfPresent(ck: QueryKey, includeSort?: boolean): Observable<Partial<any[]>> {
        // Not needed in this implementation
        return null;
    }

    /**
     * For this implementation we an always return true here.
     */
    has(ck: QueryKey): boolean {
        return true;
    }

    isSimilarPresent(ck: QueryKey, includeSort?: boolean): boolean {
        // Not needed in this implementation
        return false;
    }

    set(ck: QueryKey, data: Partial<any[]>): void {
        // Not sure we ever actually need to set rows in the tree cube, so not implementing this for now.
    }

    setConfig(config: StreamConfig): any {
        // Not needed in this implementation
    }

    /**
     * When the grid is filtered we need to get the list of leaf nodes in the tree.
     */
    getLeafNodes(): any[] {
        if (!this.leafNodeCache) {
            this.leafNodeCache = [];
            this.addLeafNodes(this.rawData.data, [], this.leafNodeCache);
        }

        return this.leafNodeCache;
    }

    /**
     * Searches tree cube for occurrences of a specific searchTerm
     * @param searchTerm  Term to search for
     * @param columnKeyToSearch  Optional arg to limit search to searching against a specific column
     * @return List of matches with the exact row, column, and path from root of the match
     */
    searchTree(searchTerm: string, columnKeyToSearch: string | null): WidgetSearchMatch[] {
        const matches: WidgetSearchMatch[] = [];
        const columnIndexToSearch = this.rawData.columns.indexOf(columnKeyToSearch);
        this.searchRow(searchTerm, columnIndexToSearch, this.rawData.data, [], matches);
        return matches;
    }

    /**
     * Searches through the tree to find matches.  Scales/formats the values because it is trying
     * to find matches against what is displayed in the UI
     * @param searchTerm  Term to search for
     * @param columnIndexToSearch  Optional arg to limit search to searching against a specific column.  -1 means search all columns
     * @param rawRow  Current row being searched
     * @param path  Path to current row from root
     * @param matches  List of all current matches
     */
    private searchRow(searchTerm: string, columnIndexToSearch: number, rawRow: any, path: string[], matches: WidgetSearchMatch[]): void {
        // see if row group name matches search term when searching all columns (-1) or first column (0)
        if (columnIndexToSearch <= 0 && rawRow.title && rawRow.title.toString().toLowerCase().includes(searchTerm)) {
            matches.push({
                rowId: rawRow.rowId,
                isLeafNode: !TreeCube.hasChildren(rawRow),
                columnKey: this.rawData.columns[0],  // since row group, it will always be the first column we want to bring into view
                path
            });
        } else {
            // step through each data value in row and check for match
            for (let currDataIndex = 0; currDataIndex < rawRow.data.length; currDataIndex++) {
                const dataValue = rawRow.data[currDataIndex];
                // if performing search on a single column, skip all others
                // columnIndexToSearch === -1 when searching all columns
                if (columnIndexToSearch >= 0 && columnIndexToSearch !== currDataIndex) {
                    continue;
                }

                const columnKey = this.rawData.columns[currDataIndex];
                const column = this.columnMap[columnKey];
                // do not search against hidden columns
                if (column.isHidden) {
                    continue;
                }
                const formattedDataValue = this.formatValue(dataValue, columnKey);
                if (formattedDataValue && formattedDataValue.toString().toLowerCase().includes(searchTerm)) {
                    matches.push({
                        rowId: rawRow.rowId,
                        isLeafNode: !TreeCube.hasChildren(rawRow),
                        columnKey,
                        path
                    });
                    break; // only take first match in row
                }
            }
        }

        // recursively check for matches on children
        if (TreeCube.hasChildren(rawRow)) {
            const childPath = [...path, rawRow.rowId];
            rawRow.children.forEach(child => this.searchRow(searchTerm, columnIndexToSearch, child, childPath, matches));
        }
    }

    /**
     * Function used to recursively get the leaf nodes.
     */
    private addLeafNodes(rawRow: any, path: string[], leafNodes: any[]): void {
        if (TreeCube.hasChildren(rawRow)) {
            // Since we have enhanced tree-cube path assign rowId instead of title for filtering and forming of groupKeys
            const newPath = [...path, rawRow.rowId ? rawRow.rowId : this.port];
            rawRow.children.forEach(childRow => {
                this.addLeafNodes(childRow, newPath, leafNodes);
            });
        } else {
            leafNodes.push(this.convertRawRow(rawRow, path));
        }
    }

    /**
     * Given a composite ket generate the node path to the record.
     */
    private getKeyPath(ck: QueryKey): string[] {
        const path: string[] = [];
        ck.filterIncludeKeys().forEach(key => {
            path.push(key.includes[0]);
        });
        return path;
    }

    /**
     * Given a path to a row go through the raw data and extract the row.
     */
    private getRawRow(path: string[]): any {
        let rawRow: any = this.rawData.data;
        for (let i = 1; i < path.length; i++) {
            const sectorRowId = path[i];
            rawRow = rawRow.children.find(row => row.rowId === sectorRowId);

            if (isNil(rawRow)) {
                break;
            }
        }
        return rawRow;
    }

    /**
     * Convert the raw row to one that the grid knows how to render.
     * @param rawRow  The raw row to be converted.
     * @param levels The levels of the breakdown to this row, used to poipulate the level-... columns.
     */
    private convertRawRow(rawRow: any, levels?: string[]): any {
        const row: any = {
            rowId: rawRow.rowId,
            _ROOT_: this.port,
            hasChildNodes: TreeCube.hasChildren(rawRow)
        };

        // Add the data to this row.
        rawRow.data.forEach((dataValue, index) => {
            const columnKey: string = this.rawData.columns[index];
            row[columnKey] = this.scaleValue(dataValue, columnKey);
        });

        // If there are levels then add these columns into the row.
        if (levels) {
            for (let i = 1; i < levels.length; i++) {
                row[TreeCube.LEVEL_KEY + i] = levels[i];
            }
        }

        if (rawRow.title) {
            row.title = rawRow.title;
            row[ColumnConstants.AGGRID_AUTO_COLUMN] = rawRow.title;
            if (!isNil(levels)) {
                row[TreeCube.LEVEL_KEY + levels.length] = rawRow.rowId;
            }
        } else if (row.hasChildNodes) {
            // The root node does not have a title, but we do need this auto column populated for it with the port name.
            row[ColumnConstants.AGGRID_AUTO_COLUMN] = this.port;
        }

        if (!isNil(rawRow.sectorOrder)) {
            row.sectorOrder = rawRow.sectorOrder;
        }

        // If there is cell highlighting then we also need top copy this data over.
        row.bgColorMap = {};
        row.fgColorMap = {};
        this.rawData.columns.forEach((column, index) => {
            row.bgColorMap[column] = rawRow.bgColorData?.[index];
            row.fgColorMap[column] = rawRow.fgColorData?.[index];
        });

        return row;
    }

    private scaleValue(dataVal: any, columnKey: string): any {
        // Scale the value if there is a formatter associated with the column, otherwise return raw value
        const formatter = this.columnFormatters[columnKey];
        if (formatter instanceof NumericDataFormatter) {
            if (!isNil(dataVal) && !isNaN(dataVal) && dataVal !== '') {
                return dataVal / formatter.getScaling();
            }
        }
        return dataVal;
    }

    private formatValue(dataVal: any, columnKey: string): any {
        if (isNil(dataVal) || dataVal === '') {
            return dataVal;
        }

        // Scale the value if there is a formatter associated with the column, otherwise return raw value
        const formatter = this.columnFormatters[columnKey];
        if (formatter instanceof NumericDataFormatter && !isNaN(dataVal)) {
            // only scale and round numbers, do not add comma separators
            const scaledValue = dataVal / formatter.getScaling();
            return formatter.roundValue(scaledValue);
        } else if (formatter instanceof DateDataFormatter) {
            return formatter.format(dataVal);
        }

        return dataVal;
    }

    stream(): ReactiveStream<any> {
        return undefined;
    }


    keys(): QueryKey[] {
        return [];
    }

    /**
     * Re-runs the computation based on the current cube config (either backend or local)
     * @param ck
     */
    recompute(ck: QueryKey): void {
    }

    /**
     * Re-runs the computation based on the current cube config (either backend or local) for all keys
     */
    recomputeAll(): void {
    }
}
