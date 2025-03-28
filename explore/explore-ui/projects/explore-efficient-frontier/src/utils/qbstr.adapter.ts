import {
    AggregationKey,
    QueryKey,
    QueryKeyEntry,
    createQK,
    DEFAULT_QUERY_KEY,
    FilterIncludeKey,
    GroupByKey
} from '@qbstr/data-cube';
import {isLeafNode, SimpleCube} from '@qbstr/data-cube-reactive';
import {flatten, isNil, isEmpty, uniqBy, max} from 'lodash';
import {RequestConfig, VizualizationColumnConfigEF, EfficientFrontierResponse, ResponseData, GroupLevel} from '../interfaces/common.interface';

export const SECTOR_ORDER_COLUMN_NAME = 'sectorOrder';
export const ROW_ID_COLUMN_NAME = 'rowId';
export const TOP_LEVEL_DEFAULT_COLUMNS = [SECTOR_ORDER_COLUMN_NAME, ROW_ID_COLUMN_NAME];
export const ROOT_LEVEL = '_ROOT_';
export const SUB_TOTAL_AGG = 'sum'; // default agg type for all sub totaling columns

export interface ColumnMap {
    [columnKey: string]: VizualizationColumnConfigEF;
}

export interface DataCubeContext {
    cube: SimpleCube<any>;
    breakdownLevels: string[];
}

/**
 * Given a configuration ${CubeAdapterConfig} that represents information in request object and a response from the server we can
 * completely build Qbstr's data cube by mapping the tree data in the response with the column meta data in the request
 */
export function createDataCube(config: RequestConfig, response: EfficientFrontierResponse): DataCubeContext {
    const startTime = window.performance.now();
    const port: string = config.portfolio;

    const columnMap: ColumnMap = {};
    config.columns.forEach(column => {
        columnMap[column.columnKey] = column;
    });

    const responseColumns: string[] = response.data.columns;
    const numberColumns: string[] = responseColumns.filter(column => columnMap[column] && columnMap[column].isSubtotalable);

    // For every numeric column we create an aggregation key so that we create a context mapping in the cube
    // This mapping will be used by the charts to refer to data that has already been computed for other queries
    const aggKeys: AggregationKey[] = uniqBy(numberColumns.map(c => new AggregationKey(c, SUB_TOTAL_AGG)), 'field');
    const exploreCube = new SimpleCube([]);

    // Set the top level 'portfolio' level aggregation
    const topLevelData: ResponseData = response.data.data;
    const row = [convertArrayToJson([topLevelData.sectorOrder, topLevelData.rowId, ...topLevelData.data, port], [...TOP_LEVEL_DEFAULT_COLUMNS, ...responseColumns, ROOT_LEVEL])];

    const queryKey: QueryKey = createQK([new GroupByKey(ROOT_LEVEL), ...aggKeys]);
    let groupColumns: string[] = [];
    if (!Object.keys(row[0])
        .filter(rowValues => rowValues !== ROW_ID_COLUMN_NAME && rowValues !== SECTOR_ORDER_COLUMN_NAME)
        .every(rowValue => isNil(row[0][rowValue]))) {

        exploreCube.set(queryKey, row);
        groupColumns = getBreakdownLevels(topLevelData);
    }

    const baseData = [];
    if (topLevelData.children) {
        const groupLevels: GroupLevel = {groupKeys: !isEmpty(groupColumns) ? [port] : [], groupColumns};
        createChildData(exploreCube, topLevelData.children, groupLevels, responseColumns, aggKeys, port, baseData);
    }
    // Populate DEFAULT_QUERY_KEY that contains all of the leaf level data this is used for filtering
    // the underlying rows are pointers so no data is duplicated
    exploreCube.set(DEFAULT_QUERY_KEY, flatten(baseData));

    const endTime = window.performance.now();
    const time = endTime - startTime;
    if (time > 1000) {
        console.warn(`Cube took ${time} to process response`);
    }
    return {
        cube: exploreCube,
        breakdownLevels: groupColumns
    };
}

/**
 * Converts an array to a json based on mappings.
 *
 * @param data the data in a simple array format e.g. [0,'test',2,3]
 * @param columns the list of columns to be mapped e.g. ['a','b','c','d']
 *
 * @example convertArrayToJson([0,'test',2,3], ['a','b','c','d']) => {'a': 0, 'b': 'test', 'c': 2, 'd': 3}
 *
 */
export function convertArrayToJson(data: any[], columns: string[]): any {
    const row = {};
    for (let i = 0; i < data.length; i++) {
        row[columns[i]] = data[i];
    }
    return row;
}

/**
 * Returns a composite key based on the current aggregation keys and current breakdown level represented in GroupLevel object
 *
 * @param groupLevel current breakdown level information
 * @param aggKeys aggregation keys that represent the numeric data in the row
 */
export function createQueryKeyForLevel(groupLevel: GroupLevel, aggKeys: AggregationKey[]): QueryKey {
    const level: number = groupLevel.groupKeys.length;

    const keyEntries: QueryKeyEntry[] = groupLevel.groupColumns[level]
        ? [...groupLevel.groupKeys.map((gk: any, i: number) => new FilterIncludeKey(groupLevel.groupColumns[i], [gk])), ...aggKeys, new GroupByKey(groupLevel.groupColumns[level])]
        : [...groupLevel.groupKeys.map((gk: any, i: number) => new FilterIncludeKey(groupLevel.groupColumns[i], [gk]))];


    return createQK(keyEntries);
}

function childToRow(child: ResponseData, groupKeys, columns, groupColumns) {
    const rowData = child.title
        ? [child.sectorOrder, child.rowId, ...child.data, ...groupKeys, child.title]
        : [child.sectorOrder, child.rowId, ...child.data, ...groupKeys];
    return {...convertArrayToJson(rowData, [...TOP_LEVEL_DEFAULT_COLUMNS, ...columns, ...groupColumns])};
}

/**
 * Create child data is a recursive function that goes through the tree data format returned from the Explore Backend and maps the data in the cube for the specific breakdown levels
 *
 * @param exploreCube the cube that is going to be populated with data recursively
 * @param children the children for the next level from which data should be extracted
 * @param groupLevel the current breakdown level and information about the expanded keys that helps build the QueryKey mapping for the cube
 * @param columns The list of all available columns that are going to be taken from the data
 * @param aggKeys the list of aggregation keys that are going to be part of each of the rows for mapping propose
 * @param port the portfolio name that enriches each of the rows with the correct information
 */
export function createChildData(exploreCube: SimpleCube<any>, children: ResponseData[], groupLevel: GroupLevel, columns: string[], aggKeys: AggregationKey[], port: string, baseData: any[]): void {
    const groupKeys: any[] = groupLevel.groupKeys;
    const groupColumns: string[] = groupLevel.groupColumns;

    const data: any[] = children.map(child => childToRow(child, groupKeys, columns, groupColumns));
    const ck = createQueryKeyForLevel(groupLevel, aggKeys);
    exploreCube.set(ck, data);
    if (isLeafNode(ck)) {
        baseData.push(data);
    }

    children.forEach((child: ResponseData) => {
        if (child.children) {
            const newGroupLevel = {groupKeys: [...groupKeys, child.title], groupColumns};
            createChildData(exploreCube, child.children, newGroupLevel, columns, aggKeys, port, baseData);
        } else {
            baseData.push(childToRow(child, groupKeys, columns, groupColumns));
        }
    });
}

/**
 * Creates a list of the breakdown levels based on the number of sub sector paths by always taking the __ROOT__ in mind
 */
export function getBreakdownLevels(data: ResponseData): string[] {
    const breakdownColumnsResult: string[] = [ROOT_LEVEL];
    let level = -1;
    level = findTreeDataDepth(data, level);
    for (let i = 0; i < level; i++) {
        breakdownColumnsResult.push(`level-${i + 1}`);
    }
    return breakdownColumnsResult;
}

/**
 * Determines the max depth of the tre.
 */
export function findTreeDataDepth(data: ResponseData, level: number) {
    if (data && data.children) {
        const newLevel = level + 1;
        return max(data.children.map(child => findTreeDataDepth(child, newLevel)));
    } else if (data && data.title) {
        // In the scenario where the data is sector level only a leaf node can still be a sector.
        return level + 1;
    }
    return level;
}
