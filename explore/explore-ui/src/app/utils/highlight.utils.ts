import {ExploreResponse, ExploreResponseConfig} from '@interfaces/response.interface';
import {ColumnSet, HighlightColumnOption, HighlightRule, HighlightRuleFactory} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnConstants, CoreColumnConstants, ResponseData} from '@blk/explore-ui-core';
import {ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {isNil, isNumber} from 'lodash';
import {FactorDataCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {BG_COLOR_MAP, FG_COLOR_MAP} from '@utils/qbstr';
import {CommonConstants} from '@constants/common.constants';

/**
 * Utility functions related to cell highlighting in data grids
 */
export class HighlightUtils {

    /**
     * Applies highlighting rules to the raw data received from the backend before inserting into qbstr cube
     * @param response  Response from server
     * @param columnSet  Columns present in the widget and their column options
     */
    public static applyHighlighting(response: ExploreResponse, columnSet: ColumnSet): void {
        const responseConfig: ExploreResponseConfig = response.data;

        // First loop to check if there are any columns with isGroupByPortBenchActive so we can get the groupings matched up
        // We can then adjust the split column keys accordingly (Child Bench/Active columns that are grouped get their columnKey assigned to the port columnKey as part of the grouping)
        const columnGrouping: Map<ColumnConfig, string> = new Map();
        for (const column of columnSet.columns) {
            const breakdown: ColumnBreakdown = column.getOptionValueByConfigType(ColumnBreakdown.CONFIG_TYPE) as ColumnBreakdown;
            // Find the breakdown and check if it has isGroupByPortBenchActive
            if (breakdown?.isGroupByPortBenchActive) {
                // If it does, check all the columns to find any column that has the same columnTag AND has an equal matching column breakdown
                for (const col of columnSet.columns) {
                    const colBreakdown: ColumnBreakdown = col.getOptionValueByConfigType(ColumnBreakdown.CONFIG_TYPE) as ColumnBreakdown;
                    if (column.columnTag === col.columnTag && breakdown.breakdown.equals(colBreakdown?.breakdown)) {
                        // Map the matching column with the isGroupByPortBenchActive column's columnKey
                        columnGrouping.set(col, column.columnKey);
                    }
                }
            }
        }

        columnSet.columns.forEach((column: ColumnConfig) => {
            const highlightColumnOption: HighlightColumnOption = column.getOptionValueByConfigType(HighlightColumnOption.CONFIG_TYPE) as HighlightColumnOption;

            if (highlightColumnOption?.highlightSettings) {
                // if it has child columns, process the child column list else process the main column only
                const childKeys = HighlightUtils.getChildColumnKeys(responseConfig, column, columnGrouping.get(column));

                childKeys.forEach(columnKey => {
                    const dataColumnIndex = response.data.columns.findIndex(columnFullKey => columnFullKey === columnKey);
                    HighlightUtils.updateColumnCellsColor(response.data.data, column, highlightColumnOption, dataColumnIndex);
                });
            }
        });
    }

    /**
     * Apply highlight rules to a single column in the response
     * @param data  Response data from server
     * @param highlightedColumnConfig  Column that highlighting is being performed on
     * @param highlightColumnOption  All of the highlight settings for the column
     * @param dataColumnIndex  Index of the data in each row of the response
     */
    private static updateColumnCellsColor(data: ResponseData, highlightedColumnConfig: ColumnConfig, highlightColumnOption: HighlightColumnOption, dataColumnIndex: number) {

        const columnValues: number[] = [];
        // only get all the leaf values if they will be required for one of the rules
        if (highlightColumnOption.containsAggregateRule()) {
            this.getAllLeafValues(data, dataColumnIndex, columnValues);
        }

        // go through each highlight rule and apply to column data if it's enabled
        highlightColumnOption.highlightSettings.filter(highlightSetting => highlightSetting.isEnabled)
            .forEach(highlightSetting => {
                const highlightRule: HighlightRule = HighlightRuleFactory.createHighlightRule(highlightSetting, highlightedColumnConfig, dataColumnIndex, columnValues);

                if (highlightRule) {
                    highlightRule.applyRuleToData(data, highlightColumnOption.highlightOnlyLeaf, highlightColumnOption.highlightSecondLastLeaf);
                }
            });
    }

    /**
     * Gets all child column keys
     * @param responseConfig  Columns in the response
     * @param column  Parent column
     * @param groupingColumnKey - If this is present it represents a columnKey override in the event of groupByPortBenchActive
     */
    private static getChildColumnKeys(responseConfig: ExploreResponseConfig, column: ColumnConfig, groupingColumnKey: string): string[] {
        // If groupingColumnKey exists, then we should use that columnKey instead of that of the column
        // This is because when we have isGroupByPortBenchActive, child BENCH/ACTIVE columns that are grouped in this way get their columnKey assigned to the port columnKey as part of the grouping
        const columnKey: string = groupingColumnKey || column.columnKey;
        const childColumnKeys = [];

        // in case of no child column return the input column key
        if (!responseConfig.splitColumnKeys || !responseConfig.splitColumnKeys.hasOwnProperty(columnKey)) {
            childColumnKeys.push(columnKey);
            return childColumnKeys;
        }

        // Assign a columnKeyEndsWith string if there is a groupingColumnKey to the corresponding Column Use Type
        // The child columnKeys generated by groupByPortBenchActive get 'Portfolio', 'Benchmark', or 'Active' appended to the end (ex: 'pct_mv_1|CASH|Benchmark')
        const columnKeyEndsWith: string = groupingColumnKey ? CoreColumnConstants.USE_TYPES_FULL_NAME[column.positionColumnType] : '';

        // In case of child columns the column key which we need to store is the original column key of the child column
        // i.e. market_val_13123|Total etc.
        for (const col of responseConfig.columns) {
            if (col.startsWith(columnKey + '|')) {
                // If there is a groupingColumnKey but the col doesn't end with the position column type, then skip it
                if (groupingColumnKey && !col.endsWith(columnKeyEndsWith)) {
                    continue;
                }
                childColumnKeys.push(col);
            }
        }

        return childColumnKeys;
    }

    /**
     * Gets all leaf node values for a column
     * @param data  Response data from server
     * @param dataIndex  Index of the data in each row of the response
     * @param leafValues  Array that returns all of the leaf node values
     */
    private static getAllLeafValues(data: ResponseData, dataIndex: number, leafValues: any[]): void {
        if (data.children) {
            data.children.forEach(child => this.getAllLeafValues(child, dataIndex, leafValues));
        } else {
            leafValues.push(data.data[dataIndex]);
        }
    }

    /**
     * Converts a Hex color to an [R,G,B] color array
     */
    public static convertHexToRGB(hexValue: string): number[] {
        // If the string is in rgb format then parse it accordingly.
        if (hexValue.startsWith('rgb')) {
            return hexValue.match(/\d+/g).map(Number);
        }

        hexValue = hexValue.replace(/[^0-9A-F]/gi, '');
        const bigint = parseInt(hexValue, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return [r, g, b];
    }

    /**
     * Converts an RGB color to a Hex color
     */
    public static convertRgbToHex(red: number, green: number, blue: number): string {
        let redString: string = red.toString(16);
        let greenString: string = green.toString(16);
        let blueString: string = blue.toString(16);

        if (redString.length < 2) {
            redString = '0' + redString;
        }
        if (greenString.length < 2) {
            greenString = '0' + greenString;
        }
        if (blueString.length < 2) {
            blueString = '0' + blueString;
        }
        return '#' + redString + greenString + blueString;
    }

    /**
     * Apply highlighting specific to a matrix data, configure highlighting in lower and upper triangles formed by diagonal in matrix
     * @param row cube data row
     * @param customVizConfig configurations used to configure matrix highlighting
     * customVizConfig.isTriangularMatrix === false indicates a Rectangular matrix ( same highlighting applies to both lower and upper triangles)
     * customVizConfig.isTriangularMatrix === true indicates a Triangular Matrix ( can have different highlighting for lower and upper triangles)
     */
    public static applyHighlightingToRiskMatrixRow(row: any, customVizConfig: FactorDataCustomVizConfig): void {
        row[BG_COLOR_MAP] = {};
        row[FG_COLOR_MAP] = {};

        // positionColumnType set to FACTOR_MODEL for factor data widget column
        const column = ColumnConfig.createColumn(CommonConstants.EMPTY_STRING, ColumnConstants.FACTOR_MODEL);

        // Now we have a row, we can iterate over the different cell values using colKeys and apply highlighting
        customVizConfig.colKeys.forEach((colKey, colIndex) => {
            // Only apply rule to cell data of type Number ( since data in matrix would be numbers)
            if (isNil(row[colKey]) || !isNumber(row[colKey])) {
                return;
            }
            column.columnKey = colKey;

            let highlightColumnOption: HighlightColumnOption;

            // For Rectangular mode, always set to lowerHighlightSettings
            // For Triangular mode, set based on cell lying in lower or upper triangle
            if (!customVizConfig.isTriangularMatrix || colIndex <= row.rowId) {
                highlightColumnOption = customVizConfig.factorDataHighlightSettings?.lowerHighlightSettings;
            } else {
                highlightColumnOption = customVizConfig.factorDataHighlightSettings?.upperHighlightSettings;
            }

            HighlightUtils.applyHighlightingToRiskMatrixRowHelper(row, highlightColumnOption, column);
        });
    }

    private static applyHighlightingToRiskMatrixRowHelper(row: any, highlightColumnOption: HighlightColumnOption, highlightedColumnConfig: ColumnConfig) {
        if (isNil(highlightColumnOption?.highlightSettings)) {
            return;
        }
        // go through each highlight rule and apply to column data if it's enabled
        highlightColumnOption.highlightSettings.filter(highlightSetting => highlightSetting.isEnabled)
            .forEach(highlightSetting => {
                const highlightRule: HighlightRule = HighlightRuleFactory.createHighlightRule(highlightSetting, highlightedColumnConfig, undefined, undefined);

                if (highlightRule) {
                    highlightRule.applyRuleToSingleCell(row);
                }
            });
    }
}
