import {ColumnConfig, ColumnDefinition, ResponseData} from '@blk/explore-ui-core';
import {FormatAndScaleFactory} from '../../factories';
import {DataFormatter} from '../../interfaces';
import {LibColumnUtils} from '../../utils';
import {HighlightSettings} from './highlight-settings.model';
import { RuleColors } from './highlight-colors.model';
import {isUndefined} from 'lodash';
import {ColumnOptionConstants} from '../../constants';

type CellValueType = string | number | Date;

/**
 * Base class for all highlight rules
 */
export abstract class HighlightRule {


    // contains all the highlight related rules
    protected highlightSetting: HighlightSettings;
    // column that is having the highlighting applied
    protected columnConfig: ColumnConfig;
    protected columnDefinition: ColumnDefinition;
    // index of column in the data response
    protected dataColumnIndex: number;

    // formatter for the data type
    protected dataFormatter: DataFormatter;

    protected comparisonValues: CellValueType[];

    // leaf node values of the column
    protected columnValues: any[];

    protected constructor(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: any[]) {
        this.highlightSetting = highlightSetting;
        this.columnConfig = columnConfig;
        this.columnDefinition = LibColumnUtils.getColumnDefinition(columnConfig);
        this.dataColumnIndex = dataColumnIndex;
        this.columnValues = columnValues;

        this.dataFormatter = FormatAndScaleFactory.getFormatterToUse(this.columnDefinition.columnFormat, this.columnConfig.optionValues);
    }

    /**
     * Applies highlight rule to data
     * @param data  Data response from backend
     * @param isLeafLevelOnly  Flag for applying highlighting to only leaf nodes of table
     */
    applyRuleToData(data: ResponseData, isLeafLevelOnly: boolean, isSecondLastLeaf: boolean): void {
        if (!this.isValidRule()) {
            return;
        }
        this.setComparisonValues();
        this.evaluateAndSetColor(data, isLeafLevelOnly, isSecondLastLeaf);
    }

    /**
     * Checks if the rule can be applied to the column data type
     */
    protected abstract isValidRule(): boolean;

    /**
     * Computes, scales, and formats values needed for applying the highlight rule
     */
    protected setComparisonValues(): void {
        // need to convert the values we are comparing against into comparable format
        // i.e. convert date string to Date
        this.comparisonValues = this.highlightSetting.comparisonRawValues.map(value => this.dataFormatter.getComparableValue(value));
    }

    /**
     * Recursively goes through each row of data and applies highlighting and returns 1 if the node is a child node
     * @param data  Data response from backend
     * @param isLeafLevelOnly  Flag for applying highlighting to only leaf nodes of table
     */
    protected evaluateAndSetColor(data: ResponseData, isLeafLevelOnly: boolean, isSecondLastLeaf: boolean): number {
        if (data.children) {
            let countOfLeafChildNodes = 0;
            // recursively call on child rows to set background color
            data.children.forEach(child => {
                countOfLeafChildNodes += this.evaluateAndSetColor(child, isLeafLevelOnly, isSecondLastLeaf);
            });
            // We want to highlight current level of data
            if ((!isLeafLevelOnly && !isSecondLastLeaf) || (countOfLeafChildNodes === data.children.length && isSecondLastLeaf)) {
                this.setColorData(data);
            }
            // It is not a leaf node hence return 0;
            return 0;
        } else {
            if (isLeafLevelOnly || !isSecondLastLeaf) {
                this.setColorData(data);
            }
            // return 1 since it is leaf node
            return 1;
        }
    }

    protected setColorData(data: ResponseData): void {
        // convert cell data value into the comparable format
        const cellValue = data?.data?.[this.dataColumnIndex];
        const dataCellValue: CellValueType = cellValue
            ? this.dataFormatter?.getComparableValue?.(cellValue) ?? null
            : cellValue;

        // no data for column in this row
        if (dataCellValue == null) {
            return;
        }

        // determine if data value should be highlighted
        const colorInfo = this.evaluateColors(dataCellValue);

        // initialise backing arrays if needed
        data.bgColorData = data.bgColorData || [];
        data.fgColorData = data.fgColorData || [];

        // if color already exists for column in row, do not override
        // this indicates a higher order highlight rule has already been applied
        if (!data.bgColorData[this.dataColumnIndex]) {
            data.bgColorData[this.dataColumnIndex] = colorInfo?.bgColor;
        }
        if (!data.fgColorData[this.dataColumnIndex]) {
            data.fgColorData[this.dataColumnIndex] = colorInfo?.fgColor;
        }
    }

    /**
     * Determines if data value meets rule criteria for color to be applied to the cell
     */
    protected abstract evaluateColors(dataCellValue: CellValueType): RuleColors;

    /**
     * This method applies the highlight rule to a column value of a row based on this.columnConfig.columnKey
     * @param rowData the cube row data
     */
    applyRuleToSingleCell(rowData: any): void {
        if (!this.isValidRule()) {
            return;
        }
        this.setComparisonValues();

        const colKey = this.columnConfig.columnKey;

        // convert cell data value into the comparable format
        const dataCellValue: CellValueType = this.dataFormatter.getComparableValue(rowData[colKey]);

        // determine if data value should be highlighted
        const colorInfo = this.evaluateColors(dataCellValue);

        // if color already exists for column in row, do not override
        // this indicates a higher order highlight rule has already been applied
        if (isUndefined(rowData[ColumnOptionConstants.BG_COLOR_MAP][colKey])  && colorInfo?.bgColor) {
            rowData[ColumnOptionConstants.BG_COLOR_MAP][colKey] = colorInfo?.bgColor;
        }
        if (isUndefined(rowData[ColumnOptionConstants.FG_COLOR_MAP][colKey]) && colorInfo?.fgColor) {
            rowData[ColumnOptionConstants.FG_COLOR_MAP][colKey] = colorInfo?.fgColor;
        }
    }
}
