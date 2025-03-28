import {CompositionConfig} from '@models/portfolio/composition/composition-config.model';
import portfolioSummaryCompositionConfigJson from '@assets/composition-config/PortfolioSummaryCompositionConfig.json';
import {cloneDeep} from 'lodash';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {AbstractColDef, ColDef, ColGroupDef} from 'ag-grid-community';
import {CompositionConstants} from '@constants/composition.constants';
import {ColumnConfig} from '@blk/explore-ui-core';

/**
 * Config class for portfolio summary composition table. It creates the pre-defined set of ag-grid column defs
 * required to make cells editable and provide required visual behavior
 */
export class PortfolioSummaryCompositionConfig extends CompositionConfig {
    constructor(portfolio: WhatIfPortfolio, eventHandlerMap?: Map<string, Function>) {
        super(portfolio, false, eventHandlerMap);
        this.requestColumns = portfolioSummaryCompositionConfigJson['defaultPortfolioSummaryColumns'].map(column => new ColumnConfig(column));
        this.columnDefinitions = this.getColumnDefinitions(portfolio, eventHandlerMap);
    }

    /**
     *  Default column definition for the composition table
     */
    getColumnDefinitions(portfolio: WhatIfPortfolio, eventHandlerMap?: Map<string, Function>): any[] {
        const defaultColDefs: AbstractColDef[] = cloneDeep(portfolioSummaryCompositionConfigJson['defaultSummaryColDefinitions']);

        defaultColDefs.filter(colDef => (colDef as ColGroupDef).groupId).forEach((grpColDef: ColGroupDef) => {
            // set format for NAV columns
            grpColDef.children.forEach((colDef: ColDef) => colDef.valueFormatter = params => this.formatPctColumns(params, 3));
            // set styling for editable column
            this.setStylingForEditableColumn(grpColDef, portfolio, eventHandlerMap);
        });

        // set change detection styling for remaining columns
        const portfolioColDef: ColDef = defaultColDefs.find(colDef => (colDef as ColDef).field === CompositionConstants.PORTFOLIO_NAME_KEY);
        portfolioColDef.cellClass = params => this.getCellStyleForChanges(params, true, false, false);

        return defaultColDefs;
    }

    /**
     * function to return style class if cell value has changed
     */
    getChangeClass(params: any, applyEditClass: boolean): string[] {
        return applyEditClass && this.isChangePresent(params, CompositionConstants.PCT_NAV_GROUP_BEFORE, CompositionConstants.PCT_NAV_GROUP_AFTER)
            ? ['ag-theme-apgux-composition-cell-edited'] : [];
    }
}
