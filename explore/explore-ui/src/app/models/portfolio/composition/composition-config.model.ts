import compositionConfigJson from '@assets/composition-config/CompositionConfig.json';
import {cloneDeep, isEmpty, isNil, isUndefined} from 'lodash';
import {CompositionConstants} from '@constants/composition.constants';
import {ModellingType} from '@enums/modelling-type.enum';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {AbstractColDef, ColDef, ColGroupDef, EditableCallbackParams, ValueFormatterParams} from 'ag-grid-community';
import {ROOT_LEVEL} from '@utils/qbstr';
import {NumericCellEditor} from '@models/portfolio/composition/numeric-cell-editor';
import {AbstractConfig, ColumnConfig, ColumnState, SerializeFavoriteType} from '@blk/explore-ui-core';
import {AuxAdvancedFilterModel} from '@blk/aladdin-angular-components';
import {CommonConstants} from '@constants/common.constants';

/**
 * Base config class for composition data. This is used to configure pre-defined ag-grid column defs
 * with required visual attributes to make the composition table editable
 */
export class CompositionConfig extends AbstractConfig {
    requestColumns: ColumnConfig[] = [];
    columnDefinitions: AbstractColDef[] = [];
    tradeColumnDefinitions: ColDef[] = [];
    columnState: ColumnState;
    colFilters: Record<string, AuxAdvancedFilterModel>;

    constructor(portfolio: WhatIfPortfolio, initWithData?: boolean, eventHandlerMap?: Map<string, Function>) {
        super();
        if (initWithData) {
            this.requestColumns = this.getRequestColumns(portfolio);
            this.columnDefinitions = this.getColumnDefinitions(portfolio, eventHandlerMap);
            this.tradeColumnDefinitions = this.getTradeTableColumnDefinitions();
            this.columnState = (!isNil(portfolio) && !isNil(portfolio.compositionConfig)) ? portfolio.compositionConfig.columnState : new ColumnState();
            this.colFilters = portfolio?.compositionConfig?.colFilters;
        }
    }

    /**
     * Deserialize saved column state from data to object
     */
    deserialize(data: any) {
        if (!data) {
            return;
        }
        if (data.columnState) {
            this.columnState = new ColumnState(data.columnState);
        }
        if (data.colFilters) {
            this.colFilters = JSON.parse(data.colFilters) as Record<string, AuxAdvancedFilterModel>;
        }
    }
    /**
     * Serialize column state to JSON format
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        return {
            columnState: this.columnState?.serialize(isNested),
            colFilters: JSON.stringify(this.colFilters)
        };
    }

    /**
     *  Default column definition for the composition table
     */
    getColumnDefinitions(portfolio: WhatIfPortfolio, eventHandlerMap?: Map<string, Function>): AbstractColDef[] {
        const defaultColDefs: AbstractColDef[] = cloneDeep(compositionConfigJson['defaultColumnDefinitions']);
        const selectedColumnDef: AbstractColDef[] = [];
        const allColDefs: AbstractColDef[] = cloneDeep(compositionConfigJson['allColumnDefinitions']);
        if (isEmpty(portfolio.compositionSetting.selectedColumns)) {
            // no selected columns for composition table, initialize with default columns from config json
            portfolio.compositionSetting.defaultSelectedColumns = cloneDeep(compositionConfigJson['defaultSelectedColumns']).map(column => new ColumnConfig(column));
            portfolio.compositionSetting.selectedColumns = cloneDeep(portfolio.compositionSetting.defaultSelectedColumns);
        }
        portfolio.compositionSetting.selectedColumns.forEach(column => {
            const colDefForSelectedColumn = allColDefs.find((col: ColGroupDef) => col.groupId === column.columnKey);
            if (!isUndefined(colDefForSelectedColumn)) {
                selectedColumnDef.push(colDefForSelectedColumn);
            }
        });

        // set the format, editable and style properties for selected columns
        selectedColumnDef.forEach((grpColDef: ColGroupDef) => {
            if (grpColDef.children) {
                if (!isUndefined(CompositionConstants.COMPOSITION_EDITABLE_COLUMNS.find(column => column === grpColDef.groupId))) {
                    this.setStylingForEditableColumn(grpColDef, portfolio, eventHandlerMap);
                } else {
                    // set the styling for non editable columns
                    grpColDef.children.forEach((colDef: ColDef) => {
                        colDef.cellClass = params => this.getCellStyleForChanges(params);
                    });
                }
                // set the format for number columns
                grpColDef.children.forEach((colDef: ColDef) => {
                    if (colDef.type === 'auxNumberColumn') {
                        colDef.valueFormatter = params => this.formatPctColumns(params, 3);
                    }
                });
            }
        });

        // set change detection styling for Securities columns
        const securitiesColDef: ColDef = defaultColDefs.find(cDef => cDef.headerName === 'Securities');
        securitiesColDef.cellClass = params => this.getCellStyleForChanges(params, true, false, false);

        const descColDef: ColDef = defaultColDefs.find(cDef => cDef.headerName === 'Description');
        descColDef.colSpan = params => [
            CompositionConstants.PORT_SECURITIES_CONSTRAINTS.LINE_BREAK,
            CompositionConstants.PORT_SECURITIES_CONSTRAINTS.LINE_BREAK_1,
            CompositionConstants.PORT_SECURITIES_CONSTRAINTS.LINE_BREAK_2
        ].includes(params.data.rowId)
            ? Object.keys(params.data).length
            : 1;

        return defaultColDefs.concat(selectedColumnDef);
    }

    /**
     * Default column definition for the trade table
     */
    getTradeTableColumnDefinitions(): ColDef[] {
        const defaultTradeTableColumnDefinitions: ColDef[] = cloneDeep(compositionConfigJson['defaultTradeTableColumnDefinitions']);
        const tradeTypeColDef: any = defaultTradeTableColumnDefinitions.find(colDef => colDef.field === 'tradeType');
        tradeTypeColDef.cellClassRules = {
            'ag-theme-apgux-buy-trade-text': params => params.value === CompositionConstants.TRADE_TYPE.BUY,
            'ag-theme-apgux-sell-trade-text': params => params.value === CompositionConstants.TRADE_TYPE.SELL
        };

        const numericTradeTableColFields = defaultTradeTableColumnDefinitions.filter(column => column.type === 'auxNumberColumn').map(column => column.field);
        defaultTradeTableColumnDefinitions.filter(colDef => numericTradeTableColFields.includes(colDef.field)).forEach(function (colDef: ColDef) {
            colDef.cellRenderer = params => (Math.abs(params.value)).toFixed(4);
            colDef.cellClassRules = {
                'ag-theme-apgux-buy-trade-text': params => params.value > 0,
                'ag-theme-apgux-sell-trade-text': params => params.value < 0
            };
        });
        return defaultTradeTableColumnDefinitions;
    }

    /**
     * This method is for checking if a given cell is editable or not based on the portfolio modelling type
     */
    isCellEditable(portfolio: WhatIfPortfolio, params: EditableCallbackParams, columnName: string): boolean {
        switch (portfolio.modellingType) {
            case ModellingType.SECTOR:
                return (params.node && params.node.group
                    && params.node.field !== ROOT_LEVEL
                    && !this.isSectorValueZero(params, columnName));
            case ModellingType.POSITION:
                return params.node
                    && params.node.field !== ROOT_LEVEL;
            case ModellingType.PORTFOLIO:
                return (portfolio.isPortfolioGroup || portfolio.isCompositePortfolio)
                    && params.node.field !== ROOT_LEVEL
                    && params.data.portfolio_name !== CompositionConstants.CASH_OFFSET;
            default:
                console.warn('Unknown modeling type. Cell is not editable' + portfolio.modellingType);
                return false;
        }
    }

    /**
     * return request column for default compositionColumn
     */
    getRequestColumns(portfolio: WhatIfPortfolio): ColumnConfig[] {
        const requestColumns: ColumnConfig[] = compositionConfigJson['requestColumnsPortfolioData'].map(column => new ColumnConfig(column));
        if (!isEmpty(portfolio.compositionSetting.selectedColumns)) {
            portfolio.compositionSetting.selectedColumns.forEach(column => {
                if (isUndefined(requestColumns.find(col => col.columnKey === column.columnKey))) {
                    requestColumns.push(new ColumnConfig(column));
                }
            });
        }
        return requestColumns;
    }

    /**
     * Returns true for a sector (i.e it has children), if its given column's value is zero for the sector.
     */
    isSectorValueZero(params: EditableCallbackParams, columnName: string) {
        return (columnName && params.node.group && (params.node.data[columnName] === null || Math.abs(params.node.data[columnName]) < 0.000001));
    }

    /**
     * formatter function for % columns
     */
    formatPctColumns(params: ValueFormatterParams, fixedPlaces: number): string {
        const val: number = Number(parseFloat(params.value));
        if (isNaN(val)) {
            return params.value;
        }
        return val.toFixed(fixedPlaces);
    }

    /**
     * Return cell style for any changes
     */
    getCellStyleForChanges(params: any, applyEditClass = true, isModifiable = false, isNumber = true): string[] {
        const classNames: string[] = this.getChangeClass(params, applyEditClass);

        if (!isModifiable) {
            classNames.push('ag-theme-apgux-composition-cell-un-editable');
        }

        if (isNumber) {
            classNames.push('aux-right-align-cell');
        }

        return classNames;
    }

    /**
     * function to be overridden for PGS columns
     */
    getChangeClass(params: any, applyEditClass: boolean): string[] {
        // using params.colDef.columnTag here to check for the current tag
        // earlier we were using a static list of column and doing .some(), which results in even those
        // columns showing number changes that actually do not have any
        return applyEditClass && this.isChangePresent(
            params,
            params.colDef.columnTag + CommonConstants.UNDERSCORE + CommonConstants.BEFORE_SMALL,
            params.colDef.columnTag + CommonConstants.UNDERSCORE + CommonConstants.AFTER_SMALL
        )
            ? ['ag-theme-apgux-composition-cell-edited']
            : [];
    }

    /**
     * function which determines if a change is present for a cell in composition table
     */
    isChangePresent(params: any, colIdBefore: any, colIdAfter: any): boolean {
        if (!params.data) {
            return false;
        }

        // This is need when we switch from portfolio mode to port group mode, the columns change but we still have old data for old set of columns
        if (!params.data.hasOwnProperty(colIdBefore)) {
            return false;
        }
        // If only one of the values is null return true
        if ((params.data[colIdBefore] === null && params.data[colIdAfter] !== null) || (params.data[colIdBefore] !== null && params.data[colIdAfter] === null)) {
            return true;
        }
        // if both are null return false
        if (params.data[colIdBefore] === null && params.data[colIdAfter] === null) {
            return false;
        }

        return params.data[colIdBefore].toFixed(6) !== Number(params.data[colIdAfter]).toFixed(6);
    }

    /**
     * Set the styling and editable properties for given column
     */
    setStylingForEditableColumn(grpColDef: ColGroupDef, portfolio: WhatIfPortfolio, eventHandlerMap?: Map<string, Function>) {
        // set styling for original column
        const originalColDef: ColDef = grpColDef.children[0];
        originalColDef.cellClass = params => this.getCellStyleForChanges(params, false);
        // set the editable properties for modified column
        const modifiedColDef: ColDef = grpColDef.children[1];
        modifiedColDef.editable = params => this.isCellEditable(portfolio, params, modifiedColDef.field);
        modifiedColDef.onCellValueChanged = params => eventHandlerMap.get('tradeAction')(portfolio, params);
        modifiedColDef.cellEditor = NumericCellEditor;
        modifiedColDef.cellClass = params => this.getCellStyleForChanges(params, true, true);
    }
}
