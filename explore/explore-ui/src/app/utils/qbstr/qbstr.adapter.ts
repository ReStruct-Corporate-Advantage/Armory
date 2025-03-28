import {GroupLevel, ExploreResponse} from '@interfaces/response.interface';
import {
    AggregationKey,
    QueryKey,
    QueryKeyEntry,
    createQK,
    DEFAULT_QUERY_KEY,
    FilterIncludeKey,
    GroupByKey
} from '@qbstr/data-cube';
import {getBreakdownLevels, ROOT_LEVEL, rootColumnKey, SUB_TOTAL_AGG} from './qbstr.utils';
import {isExpostStatsConfig, RequestAdapterConfig, VizualizationColumnConfig} from '@interfaces/request.interface';
import {cloneDeep, flatten, isEmpty, isNil, isNumber, isUndefined, mapValues, uniqBy} from 'lodash';
import {isLeafNode, SimpleCube} from '@qbstr/data-cube-reactive';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {ColumnConstants, CoreColumnUtils, CoreDefinitionStore, DateFormatConstants, NumericColumnFormat, ResponseData, TokenConstants} from '@blk/explore-ui-core';
import {NumericDataFormatter} from '@blk/explore-ui-column-option';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {FactorDataCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {HighlightUtils} from '@utils/highlight.utils';
import moment from 'moment';
import {
    COMPARE_MODE_VALUE
} from '../../modules/widget/widget-settings/factor-data-settings/factor-data.constants';
import {ChartUtils} from '@utils/chart.utils';

export const SECTOR_ORDER_COLUMN_NAME = 'sectorOrder';
export const ROW_ID_COLUMN_NAME = 'rowId';
export const BG_COLOR_MAP = 'bgColorMap';
export const FG_COLOR_MAP = 'fgColorMap';
export const DOUBLE_COLUMN_TYPE = 'DOUBLE';
export const INTEGER_COLUMN_TYPE = 'INT';
export const TIME_SPAN_COLUMN_TYPE = 'TIME_SPAN';
export const TOP_LEVEL_DEFAULT_COLUMNS = [SECTOR_ORDER_COLUMN_NAME, ROW_ID_COLUMN_NAME, BG_COLOR_MAP, FG_COLOR_MAP];

export interface ColumnMap {
    [columnKey: string]: VizualizationColumnConfig;
}

export interface DataCubeContext {
    cube: SimpleCube<any> | TreeCube;
    breakdownLevels: string[];
    leafData?: any[];
    columns?: {
        columnMap: ColumnMap,
        responseColumns: string[],
        numberColumns: string[],
        groupColumns: string[]
    };
}

/**
 * Creates the TreeCube for the required inputs and Explore response.
 */
export function createTreeCube(config: RequestAdapterConfig, response: ExploreResponse, cubeName?: string, shouldNullFirstField = true): DataCubeContext {
    const port: string = config.portfolio;
    const groupColumns: string[] = getBreakdownLevels(response.data.data);

    // Create the cube.
    const exploreCube = new TreeCube(port, config.columns, response.data);

    // Return the required object.
    return {
        cube: exploreCube,
        breakdownLevels: groupColumns
    };
}

function getColumnMap(columns: VizualizationColumnConfig[]): ColumnMap {
    const columnMap: ColumnMap = {};
    columns.forEach(column => {
        columnMap[column.columnKey] = column;
    });
    return columnMap;
}

function getNewColumnMap(columns: VizualizationColumnConfig[]): ColumnMap {
    const columnMap: ColumnMap = {};
    columns.forEach(column => {
        const colDef = CoreColumnUtils.getColumnDefByTag(column.columnTag);
            if (column?.formatter instanceof NumericDataFormatter && !isEmpty(colDef?.mappedColTags)) {
                const mappedColTag = colDef.mappedColTags[0];
                if (mappedColTag !== '') {
                    const mappedColDef = CoreColumnUtils.getColumnDefByTag(mappedColTag);
                    if (mappedColDef?.columnFormat instanceof NumericColumnFormat) {
                        column.formatter = new NumericDataFormatter(new NumericColumnFormat({
                                decimalPlaces: mappedColDef.columnFormat.decimalPlaces,
                                useThousandsSeparator: mappedColDef.columnFormat.isUseThousandsSeparator,
                                scalable: mappedColDef.columnFormat.isScalable,
                                scalingOptions: mappedColDef.columnFormat.scalingOptions,
                                scalingFactor: mappedColDef.columnFormat.scalingFactor
                        }
                        ), []);
                    }
                }
            }
            columnMap[column.columnKey] = column;
    });
    return columnMap;
}

/**
 * Given a configuration ${CubeAdapterConfig} that represents information in Explore's request object and a response from the server we can
 * completely build Qbstr's data cube by mapping the tree data in the response with the column meta data in the request
 *
 * @param config Config that represents the Explore Requests fields that are needed for the cube to be built
 * @param response A response from the explore backe end
 * @param shouldNullFirstField will make the first item from the incoming data 'null'. This is used for the ReturnAnalysis use case
 * where the data is incorrectly setting the 'level' / 'Title' data in the first column when it is actually 'null'. The first column is kept when we are at the leaf level
 * @param cubeName the name of the cube if we wish to access it by name via the Cubes API.
 * @param customViz responsible for widget specific configurations
 * @param forDate request forDate
 */
export function createDataCube(config: RequestAdapterConfig, response: ExploreResponse, _cubeName?: string, shouldNullFirstField = true, customViz?: FactorDataCustomVizConfig, forDate?: string): DataCubeContext {
    const startTime = window.performance.now();
    const port: string = config.portfolio;

    const columnMap: ColumnMap = getColumnMap(config.columns);

    const responseColumns: string[] = response.data.columns;
    const numberColumns: string[] = responseColumns.filter(column => columnMap[rootColumnKey(column)] && columnMap[rootColumnKey(column)].isSubtotalable);
    // If the first column is subtotable then we don't null the first column

    // For every numeric column we create an aggregation key so that we create a context mapping in the cube
    // This mapping will be used by the charts to refer to data that has already been computed for other queries
    // e.g.
    // RiskAndExposure -> sector-breakdown, pct_mv_1, pct_notional_mv_1
    // Pie Chart -> sector-breakdown, pct_mv_1
    // Pie chart can reuse the data from the risk and exposure cube because breakdown and at least one aggregation column match
    const aggKeys: AggregationKey[] = uniqBy(numberColumns.map(c => new AggregationKey(c, SUB_TOTAL_AGG)), 'field');
    const exploreCube = new SimpleCube([]);

    // Set the top level 'portfolio' level aggregation
    const topLevelData: ResponseData = response.data.data;
    const bgColorMap = getColorMap(topLevelData.bgColorData, responseColumns);
    const fgColorMap = getColorMap(topLevelData.fgColorData, responseColumns);
    let newColumnMap;
    const cutOffDate = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_RISK_CUTOFF_DATE];
    if (!isUndefined(cutOffDate) && !isUndefined(forDate)) {
        const cutOffDateMoment = moment(cutOffDate, DateFormatConstants.YYYYMMDD, true);
        const forDateMoment = moment(forDate, DateFormatConstants.MMDDYYYY_SLASH, true);
        if (cutOffDateMoment.isValid() && forDateMoment.isValid() && cutOffDateMoment.isSameOrBefore(forDateMoment)) {
            newColumnMap = getNewColumnMap(config.columns);
        }
    }
    const formatterMap = mapValues(!isUndefined(newColumnMap) ? newColumnMap : columnMap, vizConfig => vizConfig.formatter);

    // If topLevelData.data is nullish, it gets an iteration error (while ...topLevelData.data).
    topLevelData.data ??= [];
    const baseData = [];

    const params = {
        aggKeys, bgColorMap, fgColorMap, formatterMap, topLevelData, responseColumns, exploreCube, baseData,
    };
    let groupColumns;
    if (!isUndefined(customViz?.factorTimeSeriesSelectedOption)) {
        if (!customViz.isTimeSeriesMode) {
            customViz.colKeys = cloneDeep(response.data?.columnHeaderDetails?.orderedColumnKeys);
        }
        groupColumns = createFactorDataCubeHelper(config, port, params, customViz);
    } else {
        groupColumns = createDataCubeHelper(config, port, params, shouldNullFirstField);
    }

    // We are adding this while we are in BETA so that we can monitor performance
    const endTime = window.performance.now();
    const time = endTime - startTime;
    if (time > 1000) {
        console.warn(`Cube took ${time} to process response`);
    }
    return {
        leafData: baseData,
        cube: exploreCube,
        breakdownLevels: groupColumns,
        columns: {
            columnMap,
            responseColumns,
            numberColumns,
            groupColumns
        }
    };
}

function createDataCubeHelper(config: RequestAdapterConfig, port: string, params: any, shouldNullFirstField: boolean): string[] {
    // This is to display long name of portfolio or port group if set in additional settings of portfolio column
    if (params.responseColumns.indexOf(ColumnConstants.PORTFOLIO) > -1 && params.topLevelData && params.topLevelData.data && !config.isCompareMode) {
        const portfolioNameInResponse = params.topLevelData.data[params.responseColumns.indexOf(ColumnConstants.PORTFOLIO)];
        port = portfolioNameInResponse ? portfolioNameInResponse : port;
    }
    const isExpost: boolean = isExpostStatsConfig(config);
    if (isExpostStatsConfig(config)) {
        config.columnFormatters.forEach((v, k) => params.formatterMap[k] = v);
    }
    const queryKey: QueryKey = createQK([new GroupByKey(ROOT_LEVEL), ...params.aggKeys]);

    const row = [convertArrayToJson([params.topLevelData.sectorOrder, params.topLevelData.rowId, params.bgColorMap, params.fgColorMap, ...params.topLevelData.data, port], [...TOP_LEVEL_DEFAULT_COLUMNS, ...params.responseColumns, ROOT_LEVEL], (shouldNullFirstField && params.topLevelData.children !== undefined), params.formatterMap, isExpost)];
    let groupColumns: string[] = [];
    if (!Object.keys(row[0])
        .filter(rowValues => rowValues !== BG_COLOR_MAP && rowValues !== FG_COLOR_MAP && rowValues !== ROW_ID_COLUMN_NAME && rowValues !== SECTOR_ORDER_COLUMN_NAME)
        .every(rowValue => isNil(row[0][rowValue]))) {

        params.exploreCube.set(queryKey, row);
        groupColumns = getBreakdownLevels(params.topLevelData);
    }

    if (params.topLevelData.children) {
        const groupLevels: GroupLevel = {groupKeys: !isEmpty(groupColumns) ? [port] : [], groupColumns};
        createChildData(params.exploreCube, params.topLevelData.children, groupLevels, params.responseColumns, params.aggKeys, port, {baseData: params.baseData, shouldNullFirstField, formatterMap: params.formatterMap, isExpost, widgetConfig: config.widgetConfig});
    }
    // Populate DEFAULT_QUERY_KEY that contains all of the leaf level data this is used for filtering
    // the underlying rows are pointers so no data is duplicated
    params.exploreCube.set(DEFAULT_QUERY_KEY, flatten(params.baseData));

    return groupColumns;
}

/**
 * Helper for creating Factor Data Widget cube
 */
function createFactorDataCubeHelper(_config: RequestAdapterConfig, port: string, params: any, customViz: FactorDataCustomVizConfig): string[] {
    let rowId = 1;
    let dateToIndexMap;
    let factorDataMap;
    let colKeyToIndexMap;

    let scaling;
    if (customViz.factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.FACTOR_LEVELS || customViz.factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.CUMULATIVE_RETURNS) {
        scaling = 0.01;
    } else if (customViz.factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.VOLATILITIES) {
        scaling = 0.0001;
    } else {
        scaling = 1;
    }

    if (!isUndefined(params.topLevelData.dateToIndexMap)) {
        dateToIndexMap = new Map(Object.entries(params.topLevelData.dateToIndexMap));
    }
    if (!isUndefined(params.topLevelData.factorData)) {
        factorDataMap = new Map(Object.entries(params.topLevelData.factorData));
    }
    if (!isUndefined(params.topLevelData.columnKeyToIndexMap)) {
        colKeyToIndexMap = new Map(Object.entries(params.topLevelData.columnKeyToIndexMap));
    }

    if (!isUndefined(params.topLevelData.dateList)) {
        params.topLevelData.dateList.forEach((date: string) => {
            params.baseData.push({...convertArrayToJsonForFactorDataCube([port, params.topLevelData.sectorOrder, rowId++, params.bgColorMap, params.fgColorMap, date], [ROOT_LEVEL, ...TOP_LEVEL_DEFAULT_COLUMNS, ...params.responseColumns], undefined, dateToIndexMap, factorDataMap, params.formatterMap, scaling, undefined)});
        });
    }

    if (!isUndefined(params.topLevelData.riskMatrixData)) {
        params.topLevelData.riskMatrixData.forEach(data => {
            const row: any = {
                ...convertArrayToJsonForFactorDataCube([port, params.topLevelData.sectorOrder, rowId++, params.bgColorMap, params.fgColorMap], [ROOT_LEVEL, ...TOP_LEVEL_DEFAULT_COLUMNS, ...params.responseColumns], [...data], colKeyToIndexMap, undefined, params.formatterMap, scaling, [customViz.isTriangularMatrix, customViz.showChangeInUpperTriangle])
            };
            HighlightUtils.applyHighlightingToRiskMatrixRow(row, customViz);
            params.baseData.push(row);
        });
    }
    if (customViz.compareModeToggle) {
        applyComparison(params.baseData, [ ...factorDataMap.keys() ], customViz.compareMode);
    }

    const groupColumns = getBreakdownLevels(params.topLevelData);
    const groupLevels: GroupLevel = {groupKeys: !isEmpty(groupColumns) ? [port] : [], groupColumns};
    const ck = createQueryKeyForLevel(groupLevels, params.aggKeys, true);
    params.exploreCube.set(ck, params.baseData);
    params.exploreCube.set(DEFAULT_QUERY_KEY, flatten(params.baseData));
    return groupColumns;
}

function applyComparison(baseData: any[], columnKeys: string[], compareMode: string): void {
    // Find first non-zero number for each column to compare the other points
    const columnKeyCompareValueMap = new Map();
    columnKeys.forEach(colKey => {
        const nonZeroIndex = baseData.findIndex(row => row[colKey] > 0);
        if (nonZeroIndex >= 0) {
            columnKeyCompareValueMap.set(colKey, baseData[nonZeroIndex][colKey]);
        } else {
            columnKeyCompareValueMap.set(colKey, 0);
        }
    });
    for (let i = baseData.length - 1; i >= 0; i--) {
        columnKeys.forEach(colKey => baseData[i][colKey] = getCompareValue(baseData[i][colKey], columnKeyCompareValueMap.get(colKey), i, compareMode));
    }
}

function getCompareValue(current: number, compareWith: number, index: number, compareMode: string): number {
    if (index === 0) {
        return 0;
    }
    const diff = current - compareWith;
    if (COMPARE_MODE_VALUE === compareMode) {
        return  diff;
    } else {
        if (compareWith === 0) {
            return 0;
        } else {
            return diff / compareWith * 100;
        }
    }
}

function convertArrayToJsonForFactorDataCube(data: any[], columns: string[], riskMatrixDataList: any[], keyToIndexMap: Map<string, number>, factorDataMap: Map<string, number[]>, formatterMap, scaling: number, matrixDisplayOptions: boolean[]): any {
    const row = {};
    let i = 0;
    for (; i < data.length; i++) {
        row[columns[i]] = data[i];
    }
    if (!isUndefined(factorDataMap)) {
        // index of date in the data array when this function is called in createFactorDataCubeHelper
        const dateIndex = 5;
        const formatter = formatterMap[columns[i]];
        // factorDataMap is map having the factor data column keys as keys and a list of corresponding values for all the dates as values
        for (let j = 0; j < factorDataMap.size; j++) {
            // keyToIndexMap is a map having dates as keys and their corresponding indices (in the factorDataMap values list) as values
            let dataVal = factorDataMap.get(columns[i])[keyToIndexMap.get(data[dateIndex])];
            if (formatter instanceof NumericDataFormatter) {
                if (!(isNaN(dataVal) || dataVal === null)) {
                    dataVal = dataVal / scaling;
                }
            }
            row[columns[i]] = dataVal;
            i++;
        }
    } else {
        createRowForRiskMatrixMode(riskMatrixDataList, keyToIndexMap, data, row, columns, i, matrixDisplayOptions);
    }
    return row;
}

function createRowForRiskMatrixMode(riskMatrixDataList: any[], keyToIndexMap: Map<string, number>, data: any[], row: {}, columns: string[], i: number, matrixDisplayOptions: boolean[]) {
    // index of rowId in the data array
    const rowIdIndex = 2;
    for (let j = 0; j < riskMatrixDataList.length; j++) {
        if (!isNumber(riskMatrixDataList[j])) {
            row[columns[i]] = riskMatrixDataList[j];
        } else {
            const index = keyToIndexMap.get(columns[i]);
            row[columns[i]] = riskMatrixDataList[index + 1];
            modifyRowAccordingToDisplayOptions(matrixDisplayOptions, data, rowIdIndex, j, i, row, columns);
        }
        i++;
    }
}

function modifyRowAccordingToDisplayOptions(matrixDisplayOptions: boolean[], data: any[], rowIdIndex: number, j: number, i: number, row: {}, columns: string[]) {
    // if isTriangular is enabled and showChange is disabled, we only display lower triangle
    if (matrixDisplayOptions[0] && !matrixDisplayOptions[1]) {
        if (data[rowIdIndex] < j) {
            row[columns[i]] = null;
        }
    }
    // if matrix is triangular and showChange is enabled, we make the diagonal blank
    if (matrixDisplayOptions[0] && matrixDisplayOptions[1]) {
        if (data[rowIdIndex] === j) {
            row[columns[i]] = null;
        }
    }
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
export function convertArrayToJson(data: any[], columns: string[], shouldNullFirstField = false, formatterMap, isExpost: boolean): any {
    const row = {};
    for (let i = 0; i < data.length; i++) {
        const formatter = formatterMap[isExpost && data[i] && data[i].columnKey ? data[i].columnKey : columns[i].split('|')[0]];
        if (formatter instanceof NumericDataFormatter) {
            const dataVal = isExpost ? data[i].value : data[i];
            if (!(isNaN(dataVal) || dataVal === null || dataVal === '')) {
                const scaledDataVal = dataVal / formatter.getScaling();
                isExpost ? data[i].value = scaledDataVal : data[i] = scaledDataVal;
            }
        }
        row[columns[i]] = data[i];
    }
    if (shouldNullFirstField) {
        // we are now deleting the zeroth column for sector node now instead of setting it to null
        // since we have scenario where the zeroth column of the leaf node may turn out to be null
        // this avoids ambiguity at server side source and the group property of leaf node is rightly set to false
        delete row[columns[TOP_LEVEL_DEFAULT_COLUMNS.length]];
    }
    return row;
}

/**
 * Returns a composite key based on the current aggregation keys and current breakdown level represented in GroupLevel object
 *
 * @param groupLevel current breakdown level information
 * @param aggKeys aggregation keys that represent the numeric data in the row
 */
export function createQueryKeyForLevel(groupLevel: GroupLevel, aggKeys: AggregationKey[], isLeafLevel: boolean): QueryKey {
    const level: number = groupLevel.groupKeys.length;

    const keyEntries: QueryKeyEntry[] = groupLevel.groupColumns[level]
        ? [...groupLevel.groupKeys.map((gk: any, i: number) => new FilterIncludeKey(groupLevel.groupColumns[i], [gk])), ...aggKeys, new GroupByKey(groupLevel.groupColumns[level])]
        : [...groupLevel.groupKeys.map((gk: any, i: number) => new FilterIncludeKey(groupLevel.groupColumns[i], [gk]))];


    return createQK(keyEntries);
}

function childToRow(child: ResponseData, groupKeys, columns, groupColumns, shouldNullFirstField, formatterMap, isExpost) {
    const bgColorMap = getColorMap(child.bgColorData, columns);
    const fgColorMap = getColorMap(child.fgColorData, columns);
    const rowData = child.title
        ? [child.sectorOrder, child.rowId, bgColorMap, fgColorMap, ...child.data, child.color, ...groupKeys, child.title]
        : [child.sectorOrder, child.rowId, bgColorMap, fgColorMap, ...child.data, child.color, ...groupKeys];
    return {...convertArrayToJson(rowData, [...TOP_LEVEL_DEFAULT_COLUMNS, ...columns, 'color', ...groupColumns], shouldNullFirstField && child.children !== undefined, formatterMap, isExpost)};
}

/**
 * Create child data is a recursive function that goes through the tree data format returned from the Explore Backend and maps the data in the cube for the specific breakdown levels
 *
 * @param exploreCube the cube that is going to be populated with data recursively
 * @param children the children for the next level from which data should be extracted
 * @param groupLevel the current breakdown level and information about the expanded keys that helps build the QueryKey mapping for the cube
 * @param columns The list of all available columns that are going to be taken from the data
 * @param aggKeys the list of aggregation keys that are going to be part of each of the rows for mapping puropuse
 * @param port the portfolio name that enriches each of the rows with the correct information
 * @param additionalArgs additional parameters required to create child data
 */
function createChildData(exploreCube: SimpleCube<any>, children: ResponseData[], groupLevel: GroupLevel, columns: string[], aggKeys: AggregationKey[], port: string, additionalArgs: { baseData: any[], shouldNullFirstField: boolean, formatterMap, isExpost: boolean, widgetConfig?: string}): void { // need to make a type for additional arguments in the future
    const groupKeys: any[] = groupLevel.groupKeys;
    const groupColumns: string[] = groupLevel.groupColumns;

    const data: any[] = children.map(child => childToRow(child, groupKeys, columns, groupColumns, additionalArgs.shouldNullFirstField, additionalArgs.formatterMap, additionalArgs.isExpost));
    const ck = createQueryKeyForLevel(groupLevel, aggKeys, children.length === 0);
    exploreCube.set(ck, data);
    let isLeafProcessed = false;
    if (isLeafNode(ck)) {
        additionalArgs.baseData.push(data);
        isLeafProcessed = true;
    }

    children.forEach((child: ResponseData) => {
        if (child.children) {
            const newGroupLevel = {groupKeys: [...groupKeys, child.title], groupColumns};
            createChildData(exploreCube, child.children, newGroupLevel, columns, aggKeys, port, {baseData: additionalArgs.baseData, shouldNullFirstField: additionalArgs.shouldNullFirstField, formatterMap: additionalArgs.formatterMap, isExpost: additionalArgs.isExpost, widgetConfig: additionalArgs.widgetConfig});
        } else {
            const rowData = childToRow(child, groupKeys, columns, groupColumns, additionalArgs.shouldNullFirstField, additionalArgs.formatterMap, additionalArgs.isExpost);
            // Duplicate entries are being created for PGS chart widgets resulting in inflated numbers
            if (!ChartUtils.isPGSGraphingSpritelet(additionalArgs.widgetConfig)) {
                additionalArgs.baseData.push(rowData);
            } else if (!isLeafProcessed) {
                enrichLeafLevelDataForPGS(groupColumns, groupKeys, rowData);
                additionalArgs.baseData.push(rowData);
            }
        }
    });
}

/**
 * Maps the background and foreground colors to their corresponding column.  Each colorData index has same index as responseColumns.
 * @param colorData  Color for each column in row this can be fgColorData or bgColorData
 * @param responseColumns  Columns in the row
 */
function getColorMap(colorData: string[], responseColumns: string[]): {} {
    const colorMap = {};
    if (!colorData) {
        return colorMap;
    }
    responseColumns.forEach((column, index) => {
        colorMap[column] = colorData[index];
    });
    return colorMap;
}

/**
 * Enriches the leaf level data for PGS chart widgets by copying the value of the last group column that has a value to the actual last group column.
 * This is for stacked breakdowns which rely on the stackedLevel to have some value.
 * In the case of portfolio with different nested levels, the stacked level might not have data
 * @param groupColumns
 * @param groupKeys
 * @param rowData
 */
function enrichLeafLevelDataForPGS(groupColumns: string[], groupKeys: any[], rowData: any): void {
    for (const column of groupColumns.slice().reverse()) {
        if (!isNil(rowData[column]) && !groupKeys.includes(rowData[column])) {
            rowData[groupColumns[groupColumns.length - 1]] = rowData[column];
            break;
        }
    }
}
