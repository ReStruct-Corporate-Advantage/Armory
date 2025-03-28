import {isEmpty, isEqual, isNil, isNumber, max, uniqWith} from 'lodash';
import {SortingKey, SortType, Stream, streamOf, UnaryFunction} from '@qbstr/data-cube';
import {sortCkes} from '@qbstr/ag-grid';
import {GridSortModel} from '@interfaces/sort-model.interface';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {ColDef} from 'ag-grid-community';
import {ColumnConstants, ColumnDefinition, CoreColumnUtils, CoreCommonConstants, ResponseData} from '@blk/explore-ui-core';

export const ROOT_LEVEL = '_ROOT_';
export const SUB_TOTAL_AGG = 'sum'; // default agg type for all sub totaling columns
export const CUSTOM_CALC_COL_TAG = 'custom_calc';
export const FILTER_INCLUDE = 'filterInclude';
export const GROUP_BY = 'groupBy';
export const FILTER_EXCLUDE = 'filterExclude';
export const LEVEL_KEY = 'level-';
export const INCLUDES = 'includes';

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

/**
 * Takes a column and returns the root key
 *
 * @param column key that can have | as a delimiter
 */
export function rootColumnKey(column: string): string {
    if (column.indexOf('_before') !== -1) {
        return column.split('_before')[0];
    } else if (column.indexOf('_after') !== -1) {
        return column.split('_after')[0];
    } else if (column.indexOf('_change') !== -1) {
        return column.split('_change')[0];
    } else {
        return column.split('|')[0];
    }
}

/**
 * get sorted data for the input data based on the sort model provided
 */
export function getSortedData(data: any[], autoColDef: ColDef & {colTag: string}, rowGrpColIds: string[], sortModel: GridSortModel[], columns?: any): any[] {
    if (isEmpty(data)) {
        return [];
    }

    const sortKeysForAutoGrpCol: GridSortModel[] = getSortKeyForAutoGrpCol(autoColDef, rowGrpColIds, sortModel);
    const streamObject: { stream: Stream<any>, transformedCols: GridSortModel[] } = makeDateAndTimeSpanCompatibleStream(data, [...sortModel, ...sortKeysForAutoGrpCol], autoColDef);

    // Get all sort-models where sorting is applied
    const transformedSortModel: any[] = [
        ...sortKeysForAutoGrpCol,
        ...(!isEmpty(streamObject.transformedCols) ? streamObject.transformedCols : sortModel.filter(val => rowGrpColIds.indexOf(val.colId) === -1))
    ];

    // Rearrange elements in order with which they appear in sortModel on the basis of original ColId(to keep primary sort column first and secondary sort column second in array)
    const sortedTransformedSortModel = uniqWith(sortModel
        .map(model => transformedSortModel.find(transformedModel => transformedModel.origColId === model.colId))
        .filter(model => !!model), isEqual);

    // For auto group column, we are relying on sectorOrder for sorting (if all nodes on the same level are sector level).
    if (autoColDef && !data.find(row => !isNumber(row.sectorOrder))) {
        const secDescColIndex = sortModel.findIndex(col => col.colTag === autoColDef.colTag);
        if (secDescColIndex !== -1) {
            sortedTransformedSortModel[secDescColIndex].colId = ColumnConstants.SECTOR_ORDER_KEY;
        }
    }

    // Return sorted list of data
    const sortedList = streamObject.stream
        .sort(sortCkes(sortedTransformedSortModel, []) as SortingKey[])
        .toList();

    // Custom calc column is numeric column, but can also have string value.
    // stream.sort, in that case only sort for the numbers, and not for string.
    // This can be enhanced on qbstr side with custom sort.
    if (sortModel[0].colTag === CUSTOM_CALC_COL_TAG) {
        const customCalcColumnDataType = columns?.find(column => column.colId === sortModel[0].origColId)?.colDef?.type;
        sortedList.sort(sortByCustomCalc(sortModel[0].origColId, sortModel[0].sort, customCalcColumnDataType));
    }
    return sortedList;
}

/**
 * Sorting as per sortString (asc or desc)
 * @param field
 * @param sortString
 */
export function sortByCustomCalc(field, sortString, dataType) {
    return function (a, b) {
        let aField = a[field];
        let bField = b[field];
        if (dataType === ColumnConstants.AUX_DATE_COLUMN && !isNil(a[field])) {
            aField = Date.parse(a[field]);
            bField = Date.parse(b[field]);
        }
        if (aField === bField) {
            return 0;
        }
        return (sortString === SortType.ASC.toLowerCase()) ? ((aField < bField) ? -1 : 1) : ((aField < bField) ? 1 : -1);
    };
}

/**
 * provide sorting keys for auto group column
 */
export function getSortKeyForAutoGrpCol(autoColDef: ColDef & {colTag: string}, rowGrpColIds: string[], sortModel: GridSortModel[]): GridSortModel[] {
    const requiredSortModel = sortModel.find(model => rowGrpColIds.indexOf(model.colId) !== -1);
    return !isNil(autoColDef) && requiredSortModel
        ? isEqual(sortModel.map(sortRule => sortRule.colId), rowGrpColIds)
            ? [{
                colId: ColumnConstants.SECTOR_ORDER_KEY,
                sort: requiredSortModel.sort,
                origColId: requiredSortModel.colId
            }] : [{
                colId: requiredSortModel.colId,
                sort: requiredSortModel.sort,
                colTag: autoColDef.colTag
            }]
        : [];
}

/**
 * returns a stream required to sort a date or a time span column
 * if neither of the criteria matches, it returns the stream as it is
 */
export function makeDateAndTimeSpanCompatibleStream(data: any, sortModel: GridSortModel[], autoColDef: ColDef & {colTag: string}): { stream: Stream<any>, transformedCols: GridSortModel[] } {
    let stream = streamOf(data);
    const transformedCols: GridSortModel[] = [];
    // Iterate over sortModel to get all columns on which sorting is applied with their respective UnaryFunction
    sortModel
        .filter(model => !isEmpty(model.colTag))
        .forEach((model: GridSortModel, index: number) => {
            let cellValue: UnaryFunction<string, number>;
            const colDef: ColumnDefinition = CoreColumnUtils.getColumnDefByTag(model.colTag);
            // Simply return with a warning if colDef is not available
            if (!colDef) {
                console.warn('definition not found while sorting the column with id ', model.colId);
                return;
            }

            if (colDef.dataType === ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN) {
                cellValue = rec => !isEmpty(rec[model.colId]) ? Number(rec[model.colId].split(',')[0]) : TabularWidgetConstants.COLUMN_SORT_NULL_VAL_REPLACEMENT;
            } else if (colDef.dataType === ColumnConstants.COLUMN_DATA_TYPE.DATE) {
                cellValue = rec => !isEmpty(rec[model.colId]) ? Date.parse(rec[model.colId]) : TabularWidgetConstants.COLUMN_SORT_NULL_VAL_REPLACEMENT;
            } else if (colDef.dataType === ColumnConstants.COLUMN_DATA_TYPE.STRING || colDef.dataType === ColumnConstants.COLUMN_DATA_TYPE.RATING) {
                // added condition for string/ratings column to have empty string instead of undefined/null in the transformed column
                // we, then, do the sorting on this transformed column...same as in case of date/timeSpan columns
                cellValue = rec => !isEmpty(rec[model.colId]) ? rec[model.colId] : CoreCommonConstants.EMPTY_STRING;
            } else if (colDef.dataType === ColumnConstants.COLUMN_DATA_TYPE.INT || colDef.dataType === ColumnConstants.COLUMN_DATA_TYPE.DOUBLE) {
                // added condition for number (int/double) column to have NEGATIVE_INFINITY instead of undefined/null in the transformed column
                // we, then, do the sorting on this transformed column...same as in case of date/timeSpan columns
                cellValue = rec => isNaN(rec[model.colId]) || isNil(rec[model.colId]) ? Number.NEGATIVE_INFINITY : rec[model.colId];
            }

            // to handle primary/secondary sort in case of autoGroupColumn
            // assign cellValue of colDef in case of sorting where bucketing is there so that cellValue won't stay null
            if (!!autoColDef && colDef.columnTag === autoColDef.colTag) {
                cellValue = rec => isNil(rec[autoColDef.colId]) ? rec[model.colId] : rec[autoColDef.colId];
            }

            // Add columns to stream and transformed columns with colID appended with index.
            if (cellValue) {
                stream = stream.addColumn(ColumnConstants.SORT_COLUMN_STR + index, cellValue);
                transformedCols.push({colId: ColumnConstants.SORT_COLUMN_STR + index, sort: model.sort, origColId: model.colId});
            }
        });

    return {stream, transformedCols};
}
