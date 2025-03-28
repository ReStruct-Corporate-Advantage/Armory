import {
    AbstractColumnOption,
    ColumnConfig,
    ColumnConstants,
    CoreCommonConstants,
    FormatConstants,
    TableColumnState,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {
    CellClassParams,
    CellKeyDownEvent,
    ColDef,
    ColGroupDef,
    Column,
    ColumnState,
    GridReadyEvent,
    SortChangedEvent
} from 'ag-grid-community';
import {
    ExploreResponseConfig,
    isExpostStatsConfig,
    PossibleColumnGroup,
    RequestAdapterConfig,
    SplitColumnHeaderKey,
    SplitColumnKeys,
    VizualizationColumnConfig
} from '../../interfaces';
import {ROOT_LEVEL, rootColumnKey, SUB_TOTAL_AGG} from '@utils/qbstr';
import {isEmpty, isNil, isNumber, isUndefined} from 'lodash';
import {Widget} from '@models/widget/widget.model';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {CommonConstants} from '@constants/common.constants';
import {WidgetUtils} from '@utils/widget.utils';
import {
    ColumnDataType,
    ColumnSet,
    DataFormatter,
    HighlightUtils,
    NumericColumnFormatColumnOption,
    NumericDataFormatter
} from '@blk/explore-ui-column-option';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {ValueFormatterParams} from 'ag-grid-community';
import {UserMetaDataStore} from '@stores/user-meta-data.store';
import {UserPreference} from '@constants/user-preference.constants';

/**
 * Generates ag-grid ColDefs based on the request and the response
 *
 * @param request the configuration needed from the ExploreRequest
 * @param response the response from the Explore backend
 * @param breakdownLevels the levels in the breakdown
 * @param widgetColumnConfigs column configuration
 */
export function generateColumnDefinitions(request: RequestAdapterConfig, response: ExploreResponseConfig, breakdownLevels: string[], widgetColumnConfigs?: TableColumnState[], isPivot?: boolean, suppressRootNode?: boolean): Array<ColDef | ColGroupDef> {
    const colDefMap: {[columnName: string]: ColDef} = {};
    const columnMap: {[columnName: string]: VizualizationColumnConfig} = {};
    const splitColumnMap: {[columnName: string]: VizualizationColumnConfig} = {};
    const requestColumns: VizualizationColumnConfig[] = request.columns;
    const requstSplitColumns: VizualizationColumnConfig[] = request.splitColumns;

    requestColumns.forEach(column => {
        columnMap[column.columnKey] = column;
    });

    if (!isEmpty(requstSplitColumns)) {
        requstSplitColumns.forEach(column => {
            splitColumnMap[column.columnKey] = column;
        });
    }

    if (widgetColumnConfigs) {
        widgetColumnConfigs.forEach(column => {
            if (columnMap[column.columnKey]) {
                columnMap[column.columnKey].width = column.width;
                columnMap[column.columnKey].pinned = column.pinned;
            }

            if (splitColumnMap[column.columnKey]) {
                splitColumnMap[column.columnKey].width = column.width;
                splitColumnMap[column.columnKey].pinned = column.pinned;
            }
        });
    }


    // All columns
    const columns: string[] = response.columns;

    // Hide columns that are not in widget inputs but present in response
    const colsToHide: string[] = columns.filter(col => !columnMap[rootColumnKey(col)]);

    // Columns that DO NOT require header grouping. If split columns are present then we will ignore split column names
    columns
        .map(columnName => rootColumnKey(columnName))
        .forEach(columnName => {
            if (colsToHide.indexOf(columnName) !== -1) {
                const column = columnMap[columnName];

                colDefMap[columnName] = generateColumn({
                    originalColumnTitle: columnName,
                    columnTag: columnName,
                    columnKey: columnName,
                    columnTitle: columnName,
                    isSubtotalable: false,
                    isHidden: false,
                    dataType: undefined,
                    formatter: undefined,
                    width: column ? column.width : undefined,
                    pinned: column ? column.pinned : undefined
                }, null, isPivot);
                if (colDefMap[columnName]) {
                    colDefMap[columnName].hide = true;
                }
            } else if (columnMap[columnName]) {
                colDefMap[columnName] = generateColumn(columnMap[columnName], isExpostStatsConfig(request) ? request.columnFormatters : null, isPivot);
            }
        });

    // Row Group columns
    const rowGroups = Object.values(colDefMap).length > 0 ? breakdownLevels.map(col => colDefMap[col] = generateGroupColumn(col)) : [];
    const allColumns = Object.values(colDefMap).length > 0 ? requestColumns.map(col => colDefMap[col.columnKey]).filter(requestCol => !isNil(requestCol)) : [];

    // The first column is the one we use for the leaf nodes e.g. security_description_1, so we want to hide it from the table columns
    if (allColumns.length > 0 && allColumns[0]) {
        allColumns[0].hide = true;
    }

    // if root node is to be hidden, make rowGroup for ROOT false
    if (suppressRootNode) {
        rowGroups.find(c => c.field === ROOT_LEVEL).rowGroup = false;
        // For flat data structure, unhide the hidden column else the 0th column will be missing
        if (!rowGroups.find(c => c.field === 'level-1')) {
            allColumns[0].hide = false;
        }
    }

    return checkForPossibleGroupings([...rowGroups, ...allColumns], response, columnMap, splitColumnMap, isPivot);
}

/**
 * Takes a list of ag-grid column definitions and based on the PossibleColumnGroup configuration create a correct list of ColDefs
 */
export function checkForPossibleGroupings(columnDefs: ColDef[], response: ExploreResponseConfig, columnMap: {[columnName: string]: VizualizationColumnConfig}, splitColumnMap: {[columnName: string]: VizualizationColumnConfig}, isPivot?: boolean): ColDef[] {

    // Columns that require header grouping generation
    const splitColumnKeys: SplitColumnKeys = response.splitColumnKeys;
    const possibleColumnGroups: PossibleColumnGroup[] = response.columnHeaderDetails.possibleColumnGroups;
    const columnKeyToDisplayNameMap: {[column: string]: string} = response.columnHeaderDetails.columnKeyToDisplayNameMap;

    const colDefsResult: ColDef[] = [];
    const possibleColumnGroupLookup: {[columnName: string]: PossibleColumnGroup} = {};
    if (possibleColumnGroups) {
        possibleColumnGroups.forEach((colGroup: PossibleColumnGroup) => {
            colGroup.columnKeys.forEach((columnName: string) => {
                possibleColumnGroupLookup[columnName] = colGroup;
            });
        });
    }

    const possibleHeaderGroupColDefMap: Map<string, ColGroupDef> = new Map<string, ColGroupDef>();
    columnDefs.forEach((colDef: ColDef, i: number) => {
        let possibleHeaderGroupColDef: ColGroupDef = null;
        if (colDef.field && isPossibleColumnGroup(colDef.field, possibleColumnGroupLookup)) {
            const columnGroup = possibleColumnGroupLookup[colDef.field];
            if (isNeighbourPossibleColumnGroup(columnDefs, i, columnGroup)) {
                const groupName = possibleColumnGroupLookup[colDef.field].groupName;
                possibleHeaderGroupColDef = possibleHeaderGroupColDefMap.get(groupName);
                if (!possibleHeaderGroupColDef) {
                    possibleHeaderGroupColDef = {
                        headerName: possibleColumnGroupLookup[colDef.field].groupName,
                        children: []
                    };
                    colDefsResult.push(possibleHeaderGroupColDef);
                    possibleHeaderGroupColDefMap.set(groupName, possibleHeaderGroupColDef);
                }
                updateHeaderNameOrValueGetter(colDef, possibleColumnGroupLookup[colDef.field].columnKeyToChildHeaderMap[colDef.field], columnMap);
            } else {
                updateHeaderNameOrValueGetter(colDef, columnKeyToDisplayNameMap[colDef.field], columnMap);
            }
        } else {
            updateHeaderNameOrValueGetter(colDef, columnKeyToDisplayNameMap[colDef.field], columnMap);
        }
        const rootColumnSplitKeys: string[] = splitColumnKeys ? Object.keys(splitColumnKeys) : null;
        if (splitColumnKeys && rootColumnSplitKeys.indexOf(colDef.field) !== -1) {
            const colGroup = generateColumnGroups(colDef.field, colDef.headerName || (colDef.headerValueGetter as () => string)(), splitColumnKeys[colDef.field], {...columnMap, ...splitColumnMap}, isPivot);
            if (possibleHeaderGroupColDef) {
                possibleHeaderGroupColDef.children.push(colGroup);
            } else {
                colDefsResult.push(colGroup);
            }
        } else {
            if (possibleHeaderGroupColDef) {
                possibleHeaderGroupColDef.children.push(colDef);
            } else {
                colDefsResult.push(colDef);
            }
        }
    });
    return colDefsResult;
}

/**
 * Checks if a given column field is present in the group lookup
 *
 * @param columnField name of the column
 * @param possibleColumnGroupLookup lookup for possibleGroupColumns
 */
function isPossibleColumnGroup(columnField: string, possibleColumnGroupLookup: {[columnName: string]: PossibleColumnGroup}): boolean {
    return possibleColumnGroupLookup[columnField] !== undefined;
}

/**
 * Checks if ColDefs around a given column are part of the possibleGroupColumnConfig
 *
 * @param columns ColDefs array that defines the order
 * @param index the current index of the column we are looking up for
 * @param columnGroup the lookup for possibleGroupColumns
 */
function isNeighbourPossibleColumnGroup(columns: ColDef[], index, columnGroup: PossibleColumnGroup): boolean {
    return ((columns[index - 1] && columns[index - 1].field && columnGroup.columnKeys.indexOf(columns[index - 1].field) !== -1) || (columns[index + 1] && columns[index + 1].field && columnGroup.columnKeys.indexOf(columns[index + 1].field) !== -1));
}

/**
 * Generate agGrid ColDef for group column
 *
 * @param columnName the name of the column
 */
export const generateGroupColumn = (columnName: string): ColDef => {
    return {
        field: columnName,
        hide: true,
        sortable: false,
        rowGroup: true,
        valueFormatter: (data) => {
            // returning title for all rows
            if (data && data.data) {
                return data.data.title;
            }
        }
    };
};

function getValueFormatter(column: VizualizationColumnConfig) {
    return column.formatter ? (params: ValueFormatterParams) => {
        if (isNil(params.value)) {
            return undefined;
        }
        // assumption - entries in 'scaledAt' must only be present in case of scaling via shortcuts
        // else we default to regular approach (widget loads for first time / widget data reloads)
        const previousScaling: number = params.context && params.context[CommonConstants.INITIAL_SCALING_INFO] && params.context[CommonConstants.INITIAL_SCALING_INFO][column.columnKey];
        return column.formatter.format(WidgetUtils.getInputValueToFormat(params.value, column.formatter, false, previousScaling), {locale: UserMetaDataStore.getPreferenceValue(UserPreference.LOCALE)});
    } : undefined;
}

function getValueUnScaler(column: VizualizationColumnConfig) {
    return column.formatter ? (value) => {
        if (isNil(value)) {
            return undefined;
        }
        return column.formatter.convertToRaw(column.formatter instanceof NumericDataFormatter ? value / column.formatter.getScaling() : value);
    } : undefined;
}

function getColumnTooltiptext(column: VizualizationColumnConfig) {
    let toolTipText = column.columnTitle;
    if (column.splitColumnHeaderName) {
        toolTipText = `${column.columnTitle} ${column.originalColumnTitle}`;
    } else if (column.columnTitle !== column.originalColumnTitle) {
        toolTipText = `Custom Column Title: ${column.columnTitle}<br>Original Title: ${column.originalColumnTitle}`;
    }
    return toolTipText;
}

export function getCellStyle(params: CellClassParams<any>, column: VizualizationColumnConfig) {
    // sets background color of cell if it needs to be highlighted
    const backgroundColor = params.data?.bgColorMap?.[column.columnKey];
    const color = params.data?.fgColorMap?.[column.columnKey];
    const style = {} as any;
    if (color) {
        style.color = color;
    }
    if (backgroundColor) {
        style.backgroundColor = backgroundColor;
        if (!style.color) {
            style.color = HighlightUtils.determineTextColor(backgroundColor);
        }
    }
    return style;
}

/**
 * Generate ColDef
 *
 * @param column column config
 * @param columnFormatters optional map of column key to column formatter
 */
export function generateColumn(column: VizualizationColumnConfig, columnFormatters?: Map<string, DataFormatter>, isPivot?: boolean): ColDef {
    const valueFormatter = getValueFormatter(column);

    const valueUnScaler = getValueUnScaler(column);

    const toolTipText = getColumnTooltiptext(column);

    const colDef: ColDef & {valueUnScaler: (value) => any} & {colTag: string} = {
        colTag: column.columnTag,  // added column tag to be able to get the right "Explore" column definition
        field: column.columnKey,
        ...(
            column.formatter instanceof NumericDataFormatter
                ? {headerValueGetter: () => getColumnHeaderNameWithScaling(column.columnTitle, column.formatter as NumericDataFormatter)}
                : {headerName: column.columnTitle}
        ),
        headerTooltip: toolTipText,
        aggFunc: column.isSubtotalable ? SUB_TOTAL_AGG : undefined,
        hide: column.isHidden,
        type: getColumnType(column),
        filter: determineColumnFilter(column),
        filterParams: {
            maxNumConditions: 1
        },
        // If column.width is undefined, AUX-grid sets it to 200.
        // In most cases, it is too large since we use x-small version of it, so overriding it to 125.
        ...(!column.flex? {width: isPivot ? column.width : column.width || 125} : {}),
        pinned: column.pinned,
        cellStyle: (params => {
            return getCellStyle(params, column);
        }),
        valueFormatter,
        valueUnScaler,
        ...(column.editableCallback ? {editable: column.editableCallback} : {}),
        ...(column.onCellValueChanged ? {onCellValueChanged: column.onCellValueChanged} : {}),
        ...(column.flex ? {flex: column.flex} : {}),
        ...(column.cellEditor ? {cellEditor: column.cellEditor} : {}),
        ...(column.valueSetter ? {valueSetter: column.valueSetter} : {})
    } as ColDef & {valueUnScaler: (value) => any} & {colTag: string};

    /**
     * For expost stats widget each cell could represent a different column value and hence we need to apply column renderer to format the values correctly
     */
    if (columnFormatters && columnFormatters.size > 0 && colDef.field !== ColumnConstants.COLUMN_TAG.SEC_DESC) {
        colDef.cellRenderer = (params) => {
            if (params.value) {
                const formatter = columnFormatters.get(params.value.columnKey);
                return !isNil(params.value.value)
                    ? formatter.format(WidgetUtils.getInputValueToFormat(params.value.value, formatter, true), {locale: UserMetaDataStore.getPreferenceValue(UserPreference.LOCALE)})
                    : params.value.value;
            }
            return null;
        };
    }
    return colDef;
}

export function getColumnType(colDef: VizualizationColumnConfig) {
    switch (colDef.dataType) {
        case ColumnConstants.COLUMN_DATA_TYPE.DOUBLE:
        case ColumnConstants.COLUMN_DATA_TYPE.INT:
            return 'auxNumberColumn';
        case ColumnConstants.COLUMN_DATA_TYPE.DATE:
            return 'auxDateColumn';
        default:
            return 'auxTextColumn';
    }
}

export function determineColumnFilter(column: VizualizationColumnConfig): string {
    const dataType = ColumnDataType[column.dataType];
    switch (dataType) {
        case ColumnDataType.INT:
        case ColumnDataType.DOUBLE: {
            return 'agNumberColumnFilter';
        }
        case ColumnDataType.DATE: {
            return 'agDateColumnFilter';
        }
        // STRING and RATING default to agTextColumnFilter
        default:
            return 'agTextColumnFilter';
    }
}

/**
 * Recursive function that goes through the splitColumnKeys configuration
 *
 * @param colField name of the column
 * @param colTitle name of the column header
 * @param splitColumnHeaderKeys the configuration of splitColumnKeys coming from the reponse
 * @param columnMap Map of all the explore ColumnDefinitions that are part of the ExploreRequest
 */
export function generateColumnGroups(colField: string, colTitle: string, splitColumnHeaderKeys: SplitColumnHeaderKey[], columnMap: {[columnName: string]: VizualizationColumnConfig}, isPivot?: boolean): ColDef | ColGroupDef {
    if (splitColumnHeaderKeys) {
        return {
            marryChildren: true,
            headerName: colTitle,
            children: splitColumnHeaderKeys.map(splitColKey => generateColumnGroups(splitColKey.updatedKey, splitColKey.header, splitColKey.children, columnMap, isPivot))
        };
    } else {
        return generateColumn(columnMap[colField], null, isPivot);
    }
}

/**
 * logic for cellKeyDown event handler on ag-grid
 */
export function cellKeyDownHandler(event: CellKeyDownEvent, widget: Widget, requestConfig: RequestAdapterConfig): void {
    const keyboardEvent: KeyboardEvent = event.event as KeyboardEvent;

    // Block any keydown from going further, other than 'd' & 's'
    if (!keyboardEvent.ctrlKey || !(keyboardEvent.key === TabularWidgetConstants.SHORTCUTS.D_SHORTCUT || keyboardEvent.key === TabularWidgetConstants.SHORTCUTS.S_SHORTCUT)) {
        return;
    }

    const selectedParentColKey: string = event.colDef.field.split('|')[0];

    // Get the formatter for currently selected column
    const dataFormatter: NumericDataFormatter = requestConfig.columns
        .find(column => selectedParentColKey.indexOf(column.columnKey) !== -1).formatter as NumericDataFormatter;

    // If either formatter is undefined or pre-requisite checks fail, simply return
    if (!dataFormatter || !doScalingOrDecimalPreChecks(dataFormatter, keyboardEvent.key === TabularWidgetConstants.SHORTCUTS.S_SHORTCUT)) {
        return;
    }

    // here, we are trying to register default scaling of the column (in qbstr)
    // This will help in scaling the value via shortcuts as we can't modify cube data at this point
    event.context[CommonConstants.INITIAL_SCALING_INFO] = event.context[CommonConstants.INITIAL_SCALING_INFO] || {};
    const scalingInfo = event.context[CommonConstants.INITIAL_SCALING_INFO];
    if (!scalingInfo[event.colDef.field]) {
        scalingInfo[event.colDef.field] = dataFormatter.getScaling();
    }

    // in splitColumn set the same dataFormatter as set in requestConfig.columns
    requestConfig.splitColumns
        .filter(column => column.columnKey.split('|')[0] === selectedParentColKey) // find the split columns for selected columns
        .filter(column => column.formatter !== dataFormatter && column.formatter instanceof NumericDataFormatter) // if formatter reference is already same ignore; else continue
        .forEach(column => {
            column.formatter = dataFormatter; // set formatter for split columns to have same object as actual column format i.e dataFormatter
            // store previous scaling factor in the context for split columnKeys
            if (!scalingInfo[column.columnKey]) {
                scalingInfo[column.columnKey] = dataFormatter.getScaling();
            }
        });

    // Execute keydown logic for the key pressed
    keyboardEvent.key === TabularWidgetConstants.SHORTCUTS.D_SHORTCUT
        ? dataFormatter.optionValue.decimalPlaces = dataFormatter.optionValue.decimalPlaces === FormatConstants.DECIMAL_PLACES_LIMIT ? 0 : ++dataFormatter.optionValue.decimalPlaces
        : handleKeydownForS(dataFormatter);

    // find the column config to persist the changes made to formatter
    const columnSet: ColumnSet = widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
    if (isNil(columnSet)) {
        return;
    }

    const selectedColConfig: ColumnConfig = columnSet.columns.find(col => col.columnKey === selectedParentColKey);

    // get the numeric column option for the config
    let numericColOption: AbstractColumnOption = selectedColConfig.optionValues
        .find(optionVal => optionVal instanceof NumericColumnFormatColumnOption);

    if (!numericColOption) {
        numericColOption = new NumericColumnFormatColumnOption();
        selectedColConfig.optionValues.push(numericColOption);
    }

    keyboardEvent.key === TabularWidgetConstants.SHORTCUTS.D_SHORTCUT
        ? (numericColOption as NumericColumnFormatColumnOption).decimalPlaces = dataFormatter.optionValue.decimalPlaces
        : (numericColOption as NumericColumnFormatColumnOption).scaling = dataFormatter.optionValue.scaling;

    // get all the columns for which we need to call refresh cells api function
    const columns: Column[] = event.api.getColumns()
        .filter(column => column.getColDef().field.split('|')[0] && column.getColDef().field.split('|')[0].indexOf(selectedParentColKey) !== -1);

    // in case of pivot table, find the individual col defs and update the formatters
    if (widget.configType === WidgetConfigType.PIVOT) {
        columns.filter(col => col.getUserProvidedColDef().cellRendererParams)
            .map(col => col.getUserProvidedColDef().cellRendererParams['vizPivotColumnObject'].formatter as NumericDataFormatter)
            .forEach(formatter => {
                if (!formatter.optionValue) {
                    formatter.optionValue = new NumericColumnFormatColumnOption();
                }

                keyboardEvent.key === TabularWidgetConstants.SHORTCUTS.D_SHORTCUT
                    ? formatter.optionValue.decimalPlaces = dataFormatter.optionValue.decimalPlaces
                    : formatter.optionValue.scaling = dataFormatter.optionValue.scaling;
            });
    }

    // refresh the widget cells
    event.api.refreshCells({
        force: true,
        rowNodes: event.api.getRenderedNodes(),
        columns
    });

    // refresh the widget headers
    event.api.refreshHeader();
}

/**
 * Logic to handle keydown event 's'.
 * Returns true if keydown is handled
 */
export function handleKeydownForS(dataFormatter: NumericDataFormatter): void {
    let scalingValue = -1;
    if (dataFormatter.columnFormat.scalingOptions.has(CoreCommonConstants.BASIS_POINT)) {
        // for risk columns the default scaling value for bps is 1 and for percent it is 100
        // this is because we do not send the raw data for risk cols from server instead it is in bps already
        if (dataFormatter.columnFormat.scalingOptions.get(CoreCommonConstants.BASIS_POINT) === 1) {
            scalingValue = dataFormatter.optionValue.scaling === 1 ? 100 : 1;
        } else {
            // scalingFactor - section for percentage/bps columns
            scalingValue = dataFormatter.optionValue.scaling === 0.0001 ? 0.01 : 0.0001;
        }
    } else {
        // section for non-percentage/bps columns (factors -> 1, 1000, 1000000, 1000000000)
        // based on current scaling value, pick the next scaling value
        switch (dataFormatter.optionValue.scaling) {
            case 1:
            case 1e3:
            case 1e6:
                scalingValue = dataFormatter.optionValue.scaling * 1e3;
                break;
            case 1e9:
                scalingValue = 1;
                break;
        }
    }

    // update optionValue scaling
    dataFormatter.optionValue.scaling = scalingValue;
}

/**
 * Pre-checks before scaling or decimalPlaces logic for colDefs
 */
export function doScalingOrDecimalPreChecks(dataFormatter: NumericDataFormatter, forScaling: boolean): boolean {
    // return false if any of the following is not true
    if (!dataFormatter.columnFormat || (forScaling && !dataFormatter.columnFormat.isScalable) || (!forScaling && !dataFormatter.columnFormat.isUseThousandsSeparator)) {
        return false;
    }

    if (!dataFormatter.optionValue) {
        dataFormatter.optionValue = new NumericColumnFormatColumnOption();
    }

    // if scaling/decimal value is undefined, assign from default columnFormat
    if (forScaling && isUndefined(dataFormatter.optionValue.scaling)) {
        dataFormatter.optionValue.scaling = dataFormatter.columnFormat.scalingFactor;
    } else if (!forScaling && isUndefined(dataFormatter.optionValue.decimalPlaces)) {
        dataFormatter.optionValue.decimalPlaces = dataFormatter.columnFormat.decimalPlaces;
    }

    return true;
}

/**
 * Returns the column header name with scaling (m) based on factors of 1000 or format (bp) if in basis points
 */
export function getColumnHeaderNameWithScaling(headerName: string, dataFormatter: NumericDataFormatter): string {
    let scaling = CoreCommonConstants.EMPTY_STRING;
    if ((dataFormatter.optionValue && isNumber(dataFormatter.optionValue.scaling)) || (dataFormatter.columnFormat && isNumber(dataFormatter.columnFormat.scalingFactor))) {
        switch ((dataFormatter.optionValue && dataFormatter.optionValue.scaling) || (dataFormatter.columnFormat && dataFormatter.columnFormat.scalingFactor)) {
            case 1e-4:
                scaling = TabularWidgetConstants.SCALING_APPENDERS.BPS;
                break;
            case 1e6:
                scaling = TabularWidgetConstants.SCALING_APPENDERS.MM;
                break;
            case 1e9:
                scaling = TabularWidgetConstants.SCALING_APPENDERS.MMM;
                break;
            case 1e3:
                scaling = TabularWidgetConstants.SCALING_APPENDERS.M;
                break;
        }
    }

    return headerName + scaling;
}

/**
 * update header name Or value getter, whichever applicable for the column
 */
export function updateHeaderNameOrValueGetter(colDef: ColDef, updatedValue: string, columnMap: { [columnName: string]: VizualizationColumnConfig }): void {
    if (!isNil(colDef.headerValueGetter) && columnMap[colDef.field] && columnMap[colDef.field].formatter instanceof NumericDataFormatter) {
        colDef.headerValueGetter = () => getColumnHeaderNameWithScaling(updatedValue, columnMap[colDef.field].formatter as NumericDataFormatter);
    } else {
        colDef.headerName = updatedValue;
    }
}

/**
 * Get sorted columns from AgGrid getColumnState
 */
export function getSortedColumns(columnStates: ColumnState[], columnSet?: ColumnSet): any[] {
    const sortedColumns: any[] = [];
    for (const columnState of columnStates) {
        // Takes in the SortModel from the ag-grid API and corrects the colId for the first column.
        //  The colId of the first column is always set to 'ag-Grid-AutoColumn'
        //  For the purpose of maintaining the proper columnId, we change the colId to the columnKey of the first column
        if (columnSet && columnState.colId === ColumnConstants.AGGRID_AUTO_COLUMN) {
            columnState.colId = columnSet.columns[0].columnKey;
        }

        // As AgGrid deprecate sortModel, we need to update the sort information to column state ourselves.
        //  AG Grid: as of version 24.0.0, getSortModel() is deprecated, sort information is now part of Column State.
        //  Please use columnApi.getColumnState() instead.
        if (!isNil(columnState.sort)) {
            sortedColumns.push({colId: columnState.colId, sort: columnState.sort, sortIndex: columnState.sortIndex});
        }
    }
    return sortedColumns;
}

/**
 * set sorted columns input on sort change event
 */
export function setSortedColumnsInput(widget: Widget , event: SortChangedEvent) {
    const inputs = widget?.dataStore?.metaData?.inputs;
    inputs?.set(
        ColumnConstants.SORTED_COLUMNS,
        new SortedColumns({
            sortedColumns: getSortedColumns(event.api.getColumnState(), inputs.get(WidgetInputType.COLUMNS) as ColumnSet)
        })
    );
    event.api.refreshServerSide({purge: true});
}

/**
 * Set sorted columns in ag grid from sorted columns widget input
 */
export function setSortedColumnsInGrid(widget: Widget, params: GridReadyEvent<any>) {
    const sortedColumns = widget?.dataStore?.metaData?.inputs?.get(ColumnConstants.SORTED_COLUMNS) as SortedColumns;
    if (sortedColumns) {
        const columnSet = widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const updatedColumnState = getUpdatedColumnState(params.api.getColumnState(), sortedColumns.sortedColumns, columnSet);
        params.api.applyColumnState({state: updatedColumnState});
    }
}


/**
 * Get updated columnState with sortedModels
 */
export function getUpdatedColumnState(columnStates: ColumnState[], sortedColumns: SortedColumn[], columnSet?: ColumnSet): ColumnState[] {
    for (const sortedColumn of sortedColumns) {
        if (columnSet) {
            // Takes in an Explore SortedColumns object and corrects the colId for any sortedColumn who's colId matches the first column for ag-grid to properly apply the sort
            //  In order for ag-grid to properly apply the sort for the first column,
            //  we need to check if any of the sortedColumns has a colId that matches the columnKey of that first column
            if (sortedColumn.colId === columnSet.columns[0].columnKey) {
                sortedColumn.colId = ColumnConstants.AGGRID_AUTO_COLUMN;
            }
        }

        // As AgGrid deprecate sortModel, we need to update the sort information to column state ourselves.
        //  AG Grid: as of version 24.0.0, setSortModel() is deprecated, sort information is now part of Column State.
        //  Please use columnApi.applyColumnState() instead.
        let columnToUpdate = columnStates.find(col => col.colId === sortedColumn.colId);
        if (!columnToUpdate) {
            // try to match on parent id
            const matches = columnStates.filter(col => col.colId.split('|')[0] === sortedColumn.colId.split('|')[0]);
            if (matches.length === 1) {
                columnToUpdate = matches[0];
            }
        }

        // gets the sortedColumn sort and the sortIndex
        if (columnToUpdate) {
            columnToUpdate.sort = sortedColumn.sort as 'asc' | 'desc';
            columnToUpdate.sortIndex = sortedColumn.sortIndex;
        }
    }
    return columnStates;
}
