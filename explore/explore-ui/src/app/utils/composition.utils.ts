import {ExploreResponseConfig} from '@interfaces/response.interface';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {cloneDeep, flatten, isArray, isEmpty, isNil, isNumber} from 'lodash';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {CompositionRule} from '@models/portfolio/composition/composition-rule.model';
import {CompositionConstants} from '@constants/composition.constants';
import {CompositionConfig} from '@models/portfolio/composition/composition-config.model';
import {
    PortfolioSummaryCompositionConfig
} from '@models/portfolio/composition/portfolio-summary-composition-config.model';
import {AbstractColDef, ColDef, ColGroupDef} from 'ag-grid-community';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {WidgetUtils} from '@utils/widget.utils';
import {createDataCube, ROOT_LEVEL} from '@utils/qbstr';
import {CompositionSetting} from '@models/portfolio/composition/composition-setting.model';
import {Notification} from '@models/widget/notification.model';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {
    ColumnConfig,
    ColumnConstants,
    CoreDefinitionStore,
    ResponseData,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {ColumnUtils} from '@utils/column.utils';
import {NotificationConstants} from '@constants/notification.constants';
import {OptimizationStatusStore} from '../modules/optimization/stores/optimization-status.store';
import {OptimizationStatus} from '@interfaces/optimization-status.interface';
import {BehaviorSubject} from 'rxjs';
import {CommonConstants} from '@constants/common.constants';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {
    PortfolioNavSecurityHoldingChange
} from '@models/portfolio/composition/portfolio-nav-securities-holding-change.model';
import {AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';

/**
 * Util class for composition table view
 */
export class CompositionUtils {

    private static readonly defaultCashAssetIdMap = new Map<string, string>([
        ['ALL', 'XALL00003'], ['DZD', 'XDZD00000'], ['ARS', 'XARS00002'], ['AMD', 'XAMD00000'],
        ['AWG', 'XAWG00002'], ['AUD', 'XAUD00002'], ['ATS', 'XATS00000'], ['BSD', 'XBSD00002'], ['BHD', 'XBHD00004'],
        ['BDT', 'XBDT00003'], ['BBD', 'XBBD00000'], ['BEF', 'XBEF00002'], ['BZD', 'XBZD00004'], ['BMD', 'XBMD00008'],
        ['BOB', 'XBOB00000'], ['BWP', 'XBWP00000'], ['BRL', 'XBRL00005'], ['GBP', 'XGBP00002'], ['BND', 'XBND00007'],
        ['BGN', 'XBGN00003'], ['BGL', 'XBGL00007'], ['CAD', 'XCAD00009'], ['KYD', 'XKYD00005'], ['CLP', 'XCLP00000'],
        ['CNY', 'XCNY00009'], ['COP', 'XCOP00007'], ['CDF', 'XCDF00001'], ['CRC', 'XCRC00003'], ['CYP', 'XCYP00006'],
        ['CZK', 'XCZK00006'], ['DKK', 'XDKK00000'], ['DEM', 'XDEM00003'], ['DOP', 'XDOP00005'], ['ECS', 'XECS00000'],
        ['EGP', 'XEGP00002'], ['SVC', 'XSVC00003'], ['EEK', 'XEEK00005'], ['EUR', 'XEUR00002'], ['FJD', 'XFJD00003'],
        ['FIM', 'XFIM00004'], ['FRF', 'XFRF00009'], ['GHC', 'XGHC00005'], ['GHS', 'XGHS00000'], ['GIP', 'XGIP00005'],
        ['GRD', 'XGRD00002'], ['HTG', 'XHTG00001'], ['HNL', 'XHNL00006'], ['HKD', 'XHKD00007'], ['HUF', 'XHUF00001'],
        ['ISK', 'XISK00001'], ['INR', 'XINR00001'], ['IDR', 'XIDR00002'], ['IRR', 'XIRR00007'], ['IQD', 'XIQD00009'],
        ['IEP', 'XIEP00005'], ['ILS', 'XILS00001'], ['ITL', 'XITL00008'], ['JMD', 'XJMD00001'], ['JPY', 'XJPY00002'],
        ['JOD', 'XJOD00009'], ['KZT', 'XKZT00009'], ['KES', 'XKES00004'], ['KWD', 'XKWD00007'], ['LVL', 'XLVL00000'],
        ['LBP', 'XLBP00001'], ['LRD', 'XLRD00001'], ['LTL', 'XLTL00001'], ['LUF', 'XLUF00002'], ['MWK', 'XMWK00007'],
        ['MYR', 'XMYR00000'], ['MTL', 'XMTL00009'], ['MUR', 'XMUR00004'], ['MXN', 'XMXN00000'], ['MXV', 'XMXV00002'],
        ['MAD', 'XMAD00007'], ['NAD', 'XNAD00005'], ['NPR', 'XNPR00008'], ['ANG', 'XANG00002'], ['NLG', 'XNLG00006'],
        ['NZD', 'XNZD00008'], ['NGN', 'XNGN00007'], ['KPW', 'XKPW00003'], ['NOK', 'XNOK00004'], ['OMR', 'XOMR00009'],
        ['PKR', 'XPKR00008'], ['PAB', 'XPAB00004'], ['PGK', 'XPGK00008'], ['PYG', 'XPYG00007'], ['PEN', 'XPEN00004'],
        ['PHP', 'XPHP00006'], ['PLN', 'XPLN00006'], ['PTE', 'XPTE00008'], ['QAR', 'XQAR00007'], ['RON', 'XRON00009'],
        ['ROL', 'XROL00003'], ['RUB', 'XRUB00008'], ['STD', 'XSTD00004'], ['SAR', 'XSAR00003'], ['SGD', 'XSGD00008'],
        ['SKK', 'XSKK00007'], ['SIT', 'XSIT00001'], ['ZAR', 'XZAR00007'], ['KRW', 'XKRW00001'], ['SSP', 'XSSP00008'],
        ['ESP', 'XESP00009'], ['LKR', 'XLKR00007'], ['SRG', 'XSRG00009'], ['SZL', 'XSZL00009'], ['SEK', 'XSEK00004'],
        ['CHF', 'XCHF00007'], ['TWD', 'XTWD00008'], ['TZS', 'XTZS00002'], ['THB', 'XTHB00009'], ['TTD', 'XTTD00002'],
        ['TND', 'XTND00008'], ['TRY', 'XTRY00008'], ['TRL', 'XTRL00006'], ['UGX', 'XUGX00009'], ['UAH', 'XUAH00000'],
        ['AED', 'XAED00009'], ['USD', 'XUSD00000'], ['UYU', 'XUYU00005'], ['VUV', 'XVUV00005'], ['VEB', 'XVEB00007'],
        ['VEF', 'XVEF00008'], ['VND', 'XVND00003'], ['YUM', 'XYUM00009'], ['ZMK', 'XZMK00009'],
        ['ZWD', 'XZWD00004'], ['ZWR', 'XZWR00003']
    ]);

    /**
     * Return the passed rule from the list of all rule and list of skipped rules.
     */
    static calculatePassedRules(allRules: Array<BaseRule>, skippedRules: Array<BaseRule>): BaseRule[] {
        return isEmpty(skippedRules)
            ? cloneDeep(allRules)
            : allRules.filter(rule => isNil(skippedRules.find(skippedRule => rule.ruleType === skippedRule.ruleType && rule.lineItem === skippedRule.lineItem)));
    }

    static isCashAssetIdOrDefaultCash(tradeItem: HoldingChange, portfolioCurrency: string) {
        return CompositionUtils.isCashAssetId(tradeItem, portfolioCurrency) || CompositionUtils.isDefaultCashAssetId(tradeItem, portfolioCurrency);
    }

    static isCashAssetId(tradeItem: HoldingChange, portfolioCurrency: string) {
        return (tradeItem.lineItem.includes(portfolioCurrency) && tradeItem.lineItem.includes('CASH'));
    }

    static isDefaultCashAssetId(tradeItem: HoldingChange, portfolioCurrency: string) {
        return tradeItem.lineItem === this.defaultCashAssetIdMap.get(portfolioCurrency);
    }

    /**
     * Reset the portfolio composition and clear all the modelling rules and changes
     */
    static resetComposition(portfolio: WhatIfPortfolio): void {
        // Clear and reload the composition
        portfolio.composition = undefined;

        if (portfolio instanceof RulesBasedPortfolio) {
            // Clear the composition rules
            portfolio.compositionRules = new CompositionRule(portfolio.portName);
        }

        // Remove all the passed and failed rules
        portfolio.passedRulesForEachDate = [];
        portfolio.skippedRulesForEachDate = [];

        // Clear out holding changes
        portfolio.holdingChanges = [];

        if (portfolio instanceof WhatIfPortfolio) {
            // Reset the composite index weights to the default
            portfolio.resetCompositeIndexWeights();
        }
    }

    /**
     * Add cash off set row that will be used to neutralize any nav changes.
     */
    static addCashOffSetRow(rowData: ResponseData, columns: string[], compositionSetting: CompositionSetting): void {
        // If there are no children for this portfolio (no exposure data found).
        if (isEmpty(rowData.children)) {
            return;
        }

        let cashOffset: any = rowData.children.find(child =>
            child.data[columns.indexOf('portfolio')] === CompositionConstants.CASH_OFFSET
            || child.data[columns.indexOf('portfolio_name')] === CompositionConstants.CASH_OFFSET);

        const isCashOffsetAlreadyPresent = !isNil(cashOffset);

        if (!isCashOffsetAlreadyPresent) {
            cashOffset = {
                data: new Array(rowData.data.length).fill(0),
                rowId: this.getRowDataLastChildRowId(rowData) + 1
            };
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, 'portfolio', CompositionConstants.CASH_OFFSET);
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, 'portfolio_name', CompositionConstants.CASH_OFFSET);
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, 'port_full_name', CompositionConstants.CASH_OFFSET);
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, ColumnConstants.SECURITY_DESCRIPTION, CompositionConstants.CASH_OFFSET);
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, compositionSetting.tradingColumn + '_after', 0.0);
            rowData.children.push(cashOffset);
        }

        // For active mode add values for active column
        if (compositionSetting.showActiveInComposition) {
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, compositionSetting.tradingColumn + '_active_before', 0.0);
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, compositionSetting.tradingColumn + '_bench_before', 0.0);
            if (!isCashOffsetAlreadyPresent) {
                CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, compositionSetting.tradingColumn + '_active_after', 0.0);
            }
        }
    }

    /**
     * add value only if index exists for the mentioned field
     */
    static addValueIfIndexExists(data: any[], columns: string[], field: string, value: any): void {
        const index = columns.indexOf(field);
        if (index !== -1) {
            data[index] = value;
        }
    }

    /**
     * update the flags and the status in store for current portfolio
     */
    static updateStatusFlagsAndStore(port: Portfolio, completionFlag: boolean, spinnerFlag: boolean, optimizationStatus: OptimizationStatus, optimizationOngoing$: BehaviorSubject<boolean>): void {
        // set the completion flag
        optimizationStatus.completionFlag = completionFlag;
        // call for reset of spinnerFlag to hide opto spinner flag
        optimizationOngoing$.next(spinnerFlag);
        // also update the optimization status in the status store
        // this is needed to restore the state, in case the component is already destroyed
        // (by the time finalize is called and the subscription ends)
        OptimizationStatusStore.setOptimizationsStatus(port, {
            completionFlag,
            spinnerFlag
        });
    }

    /**
     * updates the trading column as per the portfolio/ port group.
     */
    static updateTradingColumn(portfolio: WhatIfPortfolio): void {
        portfolio.compositionSetting.tradingColumn = portfolio.isCompositionAtPortfolioLevel() ? ColumnConstants.PCT_NAV_GROUP : ColumnConstants.PCT_NOTIONAL_MARKET_VAL;
        CompositionUtils.resetCompositionOnBreakdownChange(portfolio, portfolio.isCompositionAtPortfolioLevel());
    }

    /**
     * Reset the composition on breakdown change for portfolio group.
     * if breakdown is specified and if any of the holding change is at portfolio level or
     * if breakdown is not specified and if any of the holding change is not portfolio level reset the composition.
     */
    static resetCompositionOnBreakdownChange(portfolio: WhatIfPortfolio, isBreakdownSpecified: boolean): void {
        if (isEmpty(portfolio.holdingChanges)) {
            return;
        }

        // Check the holding changes to see if any of them are portfolio level holding changes
        const portfolioChangeExists: boolean = !isNil(portfolio.holdingChanges
            .find(change => change.getChangeType() === 'Portfolio' || change.getChangeType() === 'NewPortfolio'));

        if ((isBreakdownSpecified && portfolioChangeExists) || (!isBreakdownSpecified && !portfolioChangeExists)) {
            CompositionUtils.resetComposition(portfolio);
        }
    }

    /**
     * trim the table data as per number and order of columns
     */
    static trimData(data: ResponseData, columns: string[]): void {
        if (data.data) {
            columns.forEach((val, i) => data.data[i] = isNil(val) ? '-*-*-' : data.data[i]);
            data.data = data.data.filter(val => val !== '-*-*-');
            if (data.children) {
                data.children.forEach(child => CompositionUtils.trimData(child, columns));
            }
        }
    }

    /**
     *
     * extracts all the records relevant to the passed addToPort in the given composition data (tree data)
     * 1) If the addToPort is root, it will fetch all the records for the given cusip
     * 2) If the addToPort is not root and is a leaf port & cusip is an existing one
     *    a) if portfolio_name breakdown is there - fetches records only relevant to the given addToPort
     *    b) if any other breakdown is there - fetches all records for the given cusip (something to improve on in future)
     * 3) If the addToPort is not root and is a leaf port & cusip is a new one, then it returns no records
     *
     * @param data - input composition data
     * @param cusipToBeFound - existing/new cusip to be added
     * @param addToPort - portfolio in the structure to which we are adding
     * @param isAddToPortRoot - flag , that is true id addToPort is Root portfolio
     * @param portNameLevelInBrkdn - tell the level of portfolio_name (if present) in the breakdown
     * @param outRowData - accumulate all the identified records relevant to the given input cusip
     */
    static findRowDataListBasedOnCusip(
        data: ResponseData,
        cusipToBeFound: string,
        addToPort: string,
        isAddToPortRoot: boolean,
        portNameLevelInBrkdn: number,
        outRowData: ResponseData[]
    ): void {
        if (isEmpty(data.children)) {
            console.warn('Did not find any child rows for the tree data at the root level. Returning....');
            return;
        }

        if (isEmpty(addToPort)) {
            console.log('No add to portfolio was found. Returning....');
            return;
        }

        CompositionUtils.findRowDataBasedOnCusip(data, cusipToBeFound, addToPort, isAddToPortRoot, portNameLevelInBrkdn, 0, outRowData);
    }

    /**
     * Return the row data if cusip is present else return null
     */
    static findRowDataBasedOnCusip(
        data: ResponseData,
        cusipToBeFound: string,
        addToPort: string,
        isAddToPortRoot: boolean,
        portNameLevelInBrkdn: number,
        brkdnLevel: number,
        outRowData: ResponseData[]
    ): void {
        if (data.data?.[0] === cusipToBeFound) {
            // if we are here then we found a cusip match for a record
            outRowData.push(data);
        }

        if (isEmpty(data.children)) {
            // return if there are no children in this branch
            return;
        }

        if (portNameLevelInBrkdn === brkdnLevel && !isAddToPortRoot) {
            // if portfolio name is present in the given breakdown, then we have a portfolio level > -1
            // if the current level matches with breakdown level and if it's a leaf port then find the matching sub-data
            const intendedLevelPortData = data.children.find(child => child.title === addToPort);
            if (!!intendedLevelPortData) {
                // continue to find the matching records in this matching sub-structure.
                CompositionUtils.findRowDataBasedOnCusip(intendedLevelPortData, cusipToBeFound, addToPort, isAddToPortRoot, portNameLevelInBrkdn, brkdnLevel + 1, outRowData);
            }

            return;
        }

        // if we do no have portfolio name breakdown, or if it's root port
        // then simply go through all the part of tree data and try to find all the matching records
        const childLen = data.children.length;
        for (let itr = 0; itr < childLen; itr++) {
            CompositionUtils.findRowDataBasedOnCusip(data.children[itr], cusipToBeFound, addToPort, isAddToPortRoot, portNameLevelInBrkdn, brkdnLevel + 1, outRowData);
        }
    }

    /**
     * get the required composition config based on the what if portfolio properties
     */
    static createCompositionConfig(portfolio: WhatIfPortfolio, eventHandlerMap?: Map<string, Function>): CompositionConfig {
        if (portfolio.isCompositionAtPortfolioLevel()) {
            return new PortfolioSummaryCompositionConfig(portfolio, eventHandlerMap);
        }
        return new CompositionConfig(portfolio, true, eventHandlerMap);
    }

    /**
     * refresh composition payload data for the portfolio
     * this would eventually update the composition table instance
     */
    static refreshCompositionData(portfolio: WhatIfPortfolio, eventHandlerMap: Map<string, Function>, sortModel?: SortedColumn[], expandedState?: ExpandedState): WidgetPayload {
        // get ag-grid composition config for the portfolio
        portfolio.compositionConfig = CompositionUtils.createCompositionConfig(portfolio, eventHandlerMap);
        // get field value at all levels
        const colKeys: any[] = flatten(portfolio.compositionConfig.columnDefinitions.map((colDef: ColGroupDef) => colDef.children ? colDef.children.map((child: ColDef) => child.field) : (colDef as ColDef).field));
        // get field or groupId, whichever applicable at parent level
        const colNames: string[] = portfolio.compositionConfig.columnDefinitions.map((colDef: ColGroupDef) => colDef.groupId ? colDef.groupId : (colDef as ColDef).field);
        // map the column list received from server based on column keys, else set undefined
        // we will remove these undefined values later as now we need the exact indices to trim down the table data
        let columns = portfolio.composition.columns.map(col => colKeys.indexOf(col) !== -1 ? col : undefined);
        const processedData = cloneDeep(portfolio.composition.data);
        // trim the data values we don't require to show
        CompositionUtils.trimData(processedData, columns);
        // now we can filter the undefined values
        columns = columns.filter(val => !isNil(val));
        // filter the request columns for which there is not match in column names
        const requestColumns = portfolio.compositionConfig.requestColumns.filter(reqCol => colNames.indexOf(reqCol.columnKey) !== -1);
        // prepare and return composition payload
        return CompositionUtils.prepareCompositionPayload(
            CompositionUtils.processCompositionTableData(processedData, columns, portfolio), columns, portfolio, requestColumns,
            portfolio.compositionConfig.columnDefinitions,
            new Notification(
                'A reload is required to see your changes. message',
                'Reload to see your changes.',
                'warning',
                [{type: 'button', buttonType: 'primary', label: 'Reload Now'}]
            ), sortModel, expandedState
        );
    }

    /**
     * Format Data to convert all pct value into pct values*100
     */
    static formatData(rowData: ResponseData, columns: string[]) {
        if (rowData.children) {
            rowData.children.forEach(child => CompositionUtils.formatData(child, columns));
        }

        // for every value in a node object multiply each percent value by 100 and fix it to 6 digits
        rowData.data.forEach((val, i) => {
            if (columns[i].indexOf('pct') !== -1) {
                if (isNil(val)) {
                    rowData.data[i] = 0;
                } else if (isNumber(val)) {
                    rowData.data[i] *= 100;
                }
            }
        });
    }

    /**
     * prepare widget payload for composition table
     */
    static prepareCompositionPayload(data: ResponseData, columns: string[], portfolio: WhatIfPortfolio, requestColumns: ColumnConfig[], columnDefinitions: AbstractColDef[], notification: Notification, sortModel?: SortedColumn[], expandedState?: ExpandedState): WidgetPayload {
        // Create request config
        const requestConfig: RequestAdapterConfig = {
            columns: !isEmpty(requestColumns) ? WidgetUtils.convertColumnConfigsToVizColumns(requestColumns, []) : [],
            portfolio: portfolio.portName
        };

        // Create the response config
        const exploreResponseConfig: ExploreResponseConfig = {
            columns
        };

        const defaultColumnDefs: AbstractColDef[] = cloneDeep(columnDefinitions);
        (defaultColumnDefs[0] as ColDef).hide = !isEmpty(data.data);

        // Create the data cube
        const dataCubeAndBreakdownLevels = createDataCube(requestConfig, {data: {data, columns}});

        // Create the payload to be be used to render the data in the widget
        return {
            responseConfig: exploreResponseConfig,
            requestConfig,
            defaultColumnDefs,
            cube: dataCubeAndBreakdownLevels.cube,
            breakdownLevels: !isEmpty(data.data) ? dataCubeAndBreakdownLevels.breakdownLevels : [],
            notification,
            // sending default expanded state for composition table
            customVizConfig: {
                expandedState: expandedState || new ExpandedState({expandedPaths: [[ROOT_LEVEL]]}),
                sortModel
            }
        };
    }

    /**
     * process table data to be shown on the composition table
     */
    static processCompositionTableData(processedData: ResponseData, columns: string[], portfolio: WhatIfPortfolio): ResponseData {
        CompositionUtils.addValueIfIndexExists(processedData.data, columns, 'cusip', portfolio.portName);
        CompositionUtils.addValueIfIndexExists(processedData.data, columns, ColumnConstants.SECURITY_DESCRIPTION, CommonConstants.EMPTY_STRING);
        // Add cash offset row to neutralize nav change.
        if (portfolio.isCompositionAtPortfolioLevel()) {
            // Only show cash offset in the composition table for port groups/composites with no breakdown applied
            CompositionUtils.addCashOffSetRow(processedData, columns, portfolio.compositionSetting);
            // If the portfolio is a composite, at portfolio level, and has holding changes, update the cash offset
            if (portfolio.isCompositePortfolio && !isEmpty(portfolio.holdingChanges)) {
                CompositionUtils.refreshCompositeCompositionTableCashOffset(processedData, columns, portfolio.holdingChanges);
            }
        }
        CompositionUtils.formatData(processedData, columns);
        return processedData;
    }

    /**
     * refresh cash offset value after holding changes
     */
    static refreshCompositeCompositionTableCashOffset(data: ResponseData, columns: string[], holdingChanges: HoldingChange[]): void {
        const cashOffset: ResponseData = data.children
            .find(child => child.data[columns.indexOf('portfolio_name')] === CompositionConstants.CASH_OFFSET);

        if (cashOffset) {
            const cashHoldingChanges = holdingChanges.filter(change => change instanceof NewSecurityHoldingChange || change instanceof PortfolioNavSecurityHoldingChange);
            const otherHoldingChanges = holdingChanges.filter(change => !(change instanceof NewSecurityHoldingChange || change instanceof PortfolioNavSecurityHoldingChange));
            let pctOffsetValue = 0.0;
            if (!isEmpty(cashHoldingChanges)) {
                pctOffsetValue = 0.01 * cashHoldingChanges.map(holdingChange => holdingChange.changeInWeight).reduce((change1, change2) => change1 + change2);
            }
            if (!isEmpty(otherHoldingChanges)) {
                pctOffsetValue = pctOffsetValue + (-0.01 * otherHoldingChanges.map(holdingChange => holdingChange.changeInWeight).reduce((change1, change2) => change1 + change2));
            }
            const originalNAV = data.data[columns.indexOf(CompositionConstants.NAV_GROUP_BEFORE)];
            const newNAV = data.data[columns.indexOf(CompositionConstants.NAV_GROUP_AFTER)];
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, CompositionConstants.PCT_NAV_GROUP_AFTER, pctOffsetValue * originalNAV / newNAV);
            CompositionUtils.addValueIfIndexExists(cashOffset.data, columns, CompositionConstants.NAV_GROUP_AFTER, pctOffsetValue * originalNAV);
        }
    }

    /**
     * disable and enable reset composition button.
     */
    static disableResetButton(portfolio: WhatIfPortfolio): boolean {
        // if adhoc portfolio is selected and holdingChangesGeneratedDuringInit are same as holding changes then disable reset button.
        if (isAdhocPort(portfolio) && portfolio.hasOnlyInitHoldingChanges()) {
            return true;
        }
        return portfolio.modellingType !== ModellingType.PORTFOLIO
            ? isEmpty(portfolio.holdingChanges.filter(item => item && (item as PortfolioSecurityHoldingChange).isNavNeutral))
            : isEmpty(portfolio.holdingChanges.filter(item => !!item));
    }

    /**
     * disable and enable pro rata cash button.
     */
    static disableProRataOption(portfolio: WhatIfPortfolio): boolean {
        return !isEmpty(portfolio.holdingChanges);
    }

    /**
     * Returns modelling categories for currently selected this.portfolio
     */
    static getModellingCategories(portfolio: Portfolio, forAdhocPort?: boolean): Record<string, number[]> {
        const modellingCategories: Record<string, number[]> = {};
        if (!portfolio && !forAdhocPort) {
            return modellingCategories;
        }

        // Define through time modelling options
        const throughTimeModellingOptions: Array<ModellingType> = new Array<ModellingType>();

        if (!forAdhocPort && portfolio.isSectorModellingAllowed) {
            throughTimeModellingOptions.push(ModellingType.SECTOR);
        }

        if (forAdhocPort || (!portfolio.isIndexResearchPortfolio && portfolio.isPortfolioModellingAllowed)) {
            // In addition to taking the this.portfolio's isPortfolioModellingAllowed flag into
            // consideration only allow the this.portfolio modelling if running in non-index research mode.
            // (Why in the non-index mode only? It was in the existing code so left it for now but don't understand)
            throughTimeModellingOptions.push(ModellingType.PORTFOLIO);
        }

        if (throughTimeModellingOptions.length !== 0) {
            modellingCategories[CompositionConstants.THROUGH_TIME_ANALYSIS_CATEGORY] = throughTimeModellingOptions;
        }

        const pointInTimeModellingOptions: ModellingType[] = [];

        // Define point in time modelling options
        if (forAdhocPort || portfolio.isSecurityModellingAllowed) {
            pointInTimeModellingOptions.push(ModellingType.POSITION);
        }

        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_EXPOSURE_BASED_PORT)) {
            pointInTimeModellingOptions.push(ModellingType.EXPOSURE);
        }

        if (pointInTimeModellingOptions.length !== 0) {
            modellingCategories[CompositionConstants.POINT_IN_TIME_ANALYSIS_CATEGORY] = pointInTimeModellingOptions;
        }

        return modellingCategories;
    }

    /**
     * Return serialized adhocPortParams/adhocParams based on key
     */
    static getAdhocParams(adhocParamsKey: string, portfolio: Portfolio): any {
        const adhocParamsSerialized = {};
        if (!isNil(portfolio) && isAdhocPort(portfolio) && portfolio.adhocParams) {
            adhocParamsSerialized[adhocParamsKey] = portfolio.adhocParams.serialize();
        }
        return adhocParamsSerialized;
    }

    /**
     *This method sets the addedDuringWhatIfInitialization flag true in case of WhatIf of WhatIf
     */
    static markAsAddedDuringWhatIfInitialization(portfolio: Portfolio): void {
        if (!(portfolio instanceof WhatIfPortfolio) || isEmpty(portfolio.holdingChanges)) {
            return;
        }
        if (isAdhocPort(portfolio)) {
            const uniqueHoldingChanges: Map<string, HoldingChange> = new Map();

            portfolio.holdingChanges.forEach(holdingChange => {
                const existingHoldingChange = uniqueHoldingChanges.get(holdingChange.lineItem);
                if (isNil(existingHoldingChange) || (existingHoldingChange.addedDuringWhatIfInitialization && !holdingChange.addedDuringWhatIfInitialization)) {
                    uniqueHoldingChanges.set(holdingChange.lineItem, holdingChange);
                }
            });
            portfolio.holdingChanges = Array.from(uniqueHoldingChanges.values());
        }
        portfolio.holdingChanges.forEach(holdingChange => holdingChange.addedDuringWhatIfInitialization = true);
    }

    private static getRowDataLastChildRowId(rowData: ResponseData): any {
        if (!rowData.children) {
            return rowData.rowId;
        }

        return this.getRowDataLastChildRowId(rowData.children[rowData.children.length - 1]);
    }

    /**
     * returns notification message if found child adhoc portfolios and risk column in the widget
     * else undefined
     *
     * @param portfolio
     * @param columns
     */
    static checkForChildAdhocPortsWithRiskColumns(portfolio: Portfolio, columns: ColumnConfig[]): string {
        // return if it's not a rule based portfolio
        if (!(portfolio instanceof RulesBasedPortfolio)) {
            return;
        }

        // return if there are no child adhoc portfolios
        if (!portfolio.compositionRules?.tradeRules?.some(rule => (rule as PortfolioRule).portfolioType === CompositionConstants.ADHOC_PORT)) {
            return;
        }

        // return if there are no risk columns in the column set
        if (!columns?.some((colConfig: ColumnConfig) => ColumnUtils.isRiskColumn(colConfig))) {
            return;
        }

        return NotificationConstants.CHILD_ADHOC_WITH_RISK_COLUMN;
    }

    /**
     * check if both lower and upper bounds are provided in efficient frontier format
     */
    static checkIfBothBoundsInEfficientFormat(lowerBounds: string | number[], upperBounds: string | number[]): boolean {
        return CompositionUtils.checkIfBoundInEfficientFormat(lowerBounds)
            && CompositionUtils.checkIfBoundInEfficientFormat(upperBounds);
    }

    /**
     * It checks for the first field (from the fixed set of listed ones) that has efficient frontier enabled on it
     * @param constraint
     */
    static checkIfConstraintInEfficientFormat(constraint: Constraint): boolean {
        return CompositionConstants.EFF_FRONT_ENABLED_FIELDS
            .map(field => constraint.optionValues[field])
            .some(effFrontVal => CompositionUtils.checkIfBoundInEfficientFormat(effFrontVal));
    }

    /**
     * check if a bound is in efficient format
     * @param bound
     */
    static checkIfBoundInEfficientFormat(bound: string | number[]): boolean {
        return isArray(bound) || CompositionUtils.validateIfStringIsEffFrontColonFormat(bound);
    }

    /**
     * Replaces instances of PortfolioHoldingChange in the portfolio's holdingChanges array with NewPortfolioHoldingChange in adhoc port group
     *
     * @param {Portfolio} portfolio
     */
    static replacePortfolioHoldingChangesForAdhocPortGroup(portfolio: Portfolio) {
        if (!(portfolio instanceof AdhocPortGroup) || isEmpty(portfolio.holdingChanges)) {
            return;
        }

        portfolio.holdingChanges = portfolio.holdingChanges.map(holdingChange => {
            if (holdingChange.getChangeType() === 'Portfolio') {
                let change = new NewPortfolioHoldingChange(holdingChange);
                change.changeInWeight = change.newWeight;
                return change;
            }
            return holdingChange;
        });
    }

    /**
     * check if the value is provided in efficient frontier format
     * @param value
     */
    static validateIfStringIsEffFrontColonFormat(value: string): boolean {
        return CompositionConstants.EFF_FRONT_COLON_REGEX.test(value);
    }

    /**
     * initialize list of stress scenario options
     */
    static initializeNamedScenarios(selectedStressScenario?: string): AuxSelectOptionGroup[] {
        return [...CoreDefinitionStore.namedScenarios].map(entry => ({
            label: entry[0],
            values: entry[1].map((namedScenario) => ({
                value: namedScenario.code,
                displayValue: namedScenario.name,
                isSelected: selectedStressScenario === namedScenario.code
            }))
        }));
    }
}
