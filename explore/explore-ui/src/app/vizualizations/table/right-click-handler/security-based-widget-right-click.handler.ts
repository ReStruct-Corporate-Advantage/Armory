import {BaseRightClickHandler} from './base-right-click.handler';
import {CommonConstants, TabularWidgetConstants, URLConstants, WidgetConstants} from '../../../constants';
import {AppUtils} from '../../../utils';
import {GetContextMenuItemsParams, IRowNode, MenuItemDef} from 'ag-grid-community';
import {Http2BmsResponse, RequestAdapterConfig, VizualizationColumnConfig} from '../../../interfaces';
import {EventEmitter, Injectable, Injector} from '@angular/core';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {WorkspaceStore} from '../../../stores';
import {
    AlertConstants,
    ColumnConstants,
    CommonUtils,
    ErrorTypeConstants,
    ExploreDialogParam,
    TokenConstants,
    TokenUtils,
    UIErrorParameters,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {NotificationService} from '@services/notification';
import {catchError, take} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {throwError} from 'rxjs';
import {RightClickHandlerUtils} from './utils/right-click-handler.utils';

/**
 * Right click handler that gives additional right click context menu options for security based widgets
 */
@Injectable()
export class SecurityBasedWidgetRightClickHandler extends BaseRightClickHandler {

    protected notificationService: NotificationService;
    private httpClient: HttpClient;

    constructor(private injector: Injector) {
        super();
        this.notificationService = injector.get(NotificationService);
        this.httpClient = injector.get(HttpClient);
    }

    /**
     * BaseRightClickHandler.getWidgetConfigTypes()
     */
    static getWidgetConfigTypes(): string[] {
        return [WidgetConfigType.RISK_EXPOSURE];
    }

    /**
     * Launches Applications like Sec Master, AnSer and AladdinResearch
     */
    launchApp(appName: string, cusip: string | string[], modelView?: string) {
        const origin: string = CommonUtils.isLocalHost() ? URLConstants.DEV_URL : CommonUtils.getLocation().origin;
        let url: string;

        switch (appName) {
            case TabularWidgetConstants.LAUNCH_SEC_MASTER: {
                url = origin + '/LaunchApp/SM2?close_window=1&cusip=' + cusip;
                // Opens up a new window for the given URL
                window.open(url, 'SecMaster', 'height=200,width=200');
                break;
            }
            case TabularWidgetConstants.LAUNCH_ANSER: {
                const isMultiCusipSelection: boolean = Array.isArray(cusip) ? cusip.length > 1 : false;
                if (isMultiCusipSelection) {
                    let cusipString = '';
                    for (let index = 0; index < cusip.length; index++) {
                        cusipString = cusipString + '&cusip' + index + '=' + cusip[index];
                    }
                    // URl PA tab in Anser.
                    url = origin + '/LaunchApp/Anser?close_window=1' + cusipString;
                } else {
                    // URL for SA tab in Anser.
                    url = origin + '/LaunchApp/Anser?close_window=1&cusip=' + cusip;
                }
                // Opens up a new window for the given URL
                window.open(url, 'AnSer', 'height=200,width=200');
                break;
            }
            case TabularWidgetConstants.LAUNCH_ALADDIN_RESEARCH: {
                // Opens up a new window for the given URL
                window.open(origin + '/apps/aladdin-research/#/profile/' + cusip);
                break;
            }
            case TabularWidgetConstants.LAUNCH_CLARITY_AI: {
                const exploreDialogParam = new ExploreDialogParam(AlertConstants.TYPE.PROMPT, 'Launch Clarity AI ESG Summary',
                    'To view sustainability data for this security\'s issuer, ' +
                    'click Confirm to launch a new window within Clarity AI\'s web-based application.',
                    'Confirm',
                    'Cancel',
                    (cusipParam: string) =>  {
                        this.notificationService.warning('Launching Clarity AI ESG Summary', ErrorTypeConstants.UI_VALIDATION_WARNING);
                        const esgAppName = (CommonUtils.isExploreBeta() || CommonUtils.isExploreGamma()) ? 'esg-beta' : 'esg';
                        this.httpClient.get(AppUtils.getBaseUrl(false) + `${esgAppName}/CLARITY_AI_LINK?cusip.__string=${cusipParam}`)
                            .pipe(
                                take(1),
                                catchError(error => {
                                    this.notificationService.error('Error occurred while trying to launch Clarity AI.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_LAUNCH_APP_CLARITY_AI_WARNING, true);
                                    console.error('Error occurred while trying to launch Clarity AI.', error);
                                    return throwError(error);
                                })
                            )
                            .subscribe((response: Http2BmsResponse<string>) => {
                                if ('SUCCESS' === response?.return_val && !!response.output) {
                                    window.open(response.output, '_blank');
                                } else {
                                    this.notificationService.error('Clarity AI ESG Data is unavailable for this security.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_LAUNCH_APP_CLARITY_AI_ERROR, true);
                                    console.error(response?.message);
                                }
                            });
                    },
                    null,
                    cusip
                );
                this.notificationService.openDialog(exploreDialogParam);
                break;
            }
            case TabularWidgetConstants.LAUNCH_ALADDIN_CLIMATE: {
                window.open(this.getAladdinClimateLaunchUrl(origin, cusip, modelView));
                break;
            }
        }
    }

    /**
     * Launches Aladdin View
     */
    launchAladdinView(curatedLink: string) {
        const origin: string = CommonUtils.isLocalHost() ? URLConstants.DEV_URL : CommonUtils.getLocation().origin;
        // Opens up a new window for the given URL
        window.open(origin + '/aladdinview/permalink?tool=' + curatedLink);
    }

    /**
     * BaseRightClickHandler.getWidgetConfigTypes()
     */
    getWidgetConfigTypes(): string[] {
        return [WidgetConfigType.RISK_EXPOSURE];
    }

    /**
     * getWidgetConfigTypes.getWidgetSpecificContextMenuItems(GetContextMenuItemsParams, Map<string, WidgetInput>, string)
     */
    protected getWidgetSpecificContextMenuItems(params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const mainMenuItems = [];
        this.addHVaRorMCVaROptions(mainMenuItems, params, requestConfig, spriteletLaunched);
        this.addPriceChartIfEnabled(params, requestConfig, spriteletLaunched, mainMenuItems);
        const menuItems = this.getSecurityBasedWidgetSpecificContextMenuItems(params, requestConfig, spriteletLaunched);
        RightClickHandlerUtils.addToSubMenu(mainMenuItems, RightClickHandlerUtils.LAUNCH, menuItems);
        this.addIRROptions(mainMenuItems, params, requestConfig, spriteletLaunched);
        if (mainMenuItems.length > 0) {
            mainMenuItems.push(CommonConstants.SEPARATOR);
        }
        return mainMenuItems;
    }

    protected addPriceChartIfEnabled(params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>, mainMenuItems: any): void {
        const cusipColKey = this.getCusipColumnKey(requestConfig.columns);
        if (cusipColKey && params.node.data[cusipColKey] !== null && !params.node.group) {
            if (AppUtils.isPricePopupFeatureEnabled()) {
                this.addSpriteletLaunchSubMenuItem(
                    RightClickHandlerUtils.getSubMenu(mainMenuItems, RightClickHandlerUtils.CHART),
                    new SpriteletEvent(TabularWidgetConstants.PRICE_CHART_SPRITELET.ACTION_KEY,
                        params,
                        TabularWidgetConstants.PRICE_CHART_SPRITELET.CALLBACK_METHOD_NAME),
                    TabularWidgetConstants.PRICE_CHART_SPRITELET.ACTION_LABEL,
                    spriteletLaunched
                );
            }
        }
    }

    /**
     * Base method that encodes the cusip and lets this and the child classes do additional processing
     */
    protected processCusip(cusip: string): string {
        // Encode special character like # in cusip so correct URL is formed for launching external apps
        return encodeURIComponent(this.doProcessCusip(cusip));
    }

    /**
     * Performs any additional processing required on cusip before it can be consumed
     * @param cusip
     * @protected
     */
    protected doProcessCusip(cusip: string): string {
        // do nothing
        return cusip;
    }

    /**
     * Get cusip column key from widget inputs
     */
    protected getCusipColumnKey(columns: VizualizationColumnConfig[]): string {

        // column key for cusip
        const hiddenColumn = columns.find(col => col.isHidden);
        let hiddenColumnKey = null;
        if (hiddenColumn) {
            hiddenColumnKey = hiddenColumn.columnKey;
        }

        const cusipColumn =  columns.find(col => ColumnConstants.CUSIP === col.columnTag || ColumnConstants.PNL_CUSIP_IDENTIFIER_COLUMN.columnTag === col.columnTag);

        return cusipColumn ? cusipColumn.columnKey : hiddenColumnKey;
    }

    /**
     * Get security description column key from widget inputs
     */
    private getDescColumnKey(columns: VizualizationColumnConfig[]): string {
        const descColumn = columns.find(col => ColumnConstants.SECURITY_DESCRIPTION === col.columnTag || ColumnConstants.PNL_SEC_DESC === col.columnTag);
        return descColumn ? descColumn.columnKey : null;
    }


    /**
     * Context menu for Aladdin View
     */
    private getSubmenuForAladdinView(cusip: string, portGroupName: string): MenuItemDef[] {
        // Custom Options present in the dropdown list of the Aladdin View
        return [
            {
                name: TabularWidgetConstants.ALADDIN_VIEW.POSITION_VIEW_ALL_PORT,
                action: () => {
                    this.launchAladdinView(TabularWidgetConstants.ALADDIN_VIEW.TOOL_NAME_POSITION + TabularWidgetConstants.ALADDIN_VIEW.CUSIP_TRADES + cusip + TabularWidgetConstants.ALADDIN_VIEW.POSITION_QUERY);
                    this.telemetryDataPush(TabularWidgetConstants.ALADDIN_VIEW.POSITION_VIEW_ALL_PORT);
                },
            },
            {
                name: TabularWidgetConstants.ALADDIN_VIEW.POSITIONS_VIEW_RELATED_FUNDS,
                action: () => {
                    this.launchAladdinView(TabularWidgetConstants.ALADDIN_VIEW.TOOL_NAME_POSITION + TabularWidgetConstants.ALADDIN_VIEW.CUSIP_TRADES + cusip + TabularWidgetConstants.ALADDIN_VIEW.POSITION_QUERY + TabularWidgetConstants.PORT_GROUP_NAME + portGroupName);
                    this.telemetryDataPush(TabularWidgetConstants.ALADDIN_VIEW.POSITIONS_VIEW_RELATED_FUNDS);
                },
            },
            {
                name: TabularWidgetConstants.ALADDIN_VIEW.TRADE_VIEW_YESTERDAY_TRADE,
                action: () => {
                    this.launchAladdinView(TabularWidgetConstants.ALADDIN_VIEW.TOOL_NAME_TRADES + TabularWidgetConstants.ALADDIN_VIEW.CUSIP_TRADES + cusip + TabularWidgetConstants.ALADDIN_VIEW.YESTERDAY_TRADE_QUERY + TabularWidgetConstants.PORT_GROUP_NAME + portGroupName);
                    this.telemetryDataPush(TabularWidgetConstants.ALADDIN_VIEW.TRADE_VIEW_YESTERDAY_TRADE);
                },
            },
            {
                name: TabularWidgetConstants.ALADDIN_VIEW.TRADE_VIEW_ALL_IN_FUND,
                action: () => {
                    this.launchAladdinView(TabularWidgetConstants.ALADDIN_VIEW.TOOL_NAME_TRADES + TabularWidgetConstants.ALADDIN_VIEW.CUSIP_TRADES + cusip + TabularWidgetConstants.ALADDIN_VIEW.FUND_TRADE_QUERY + TabularWidgetConstants.PORT_GROUP_NAME + portGroupName);
                    this.telemetryDataPush(TabularWidgetConstants.ALADDIN_VIEW.TRADE_VIEW_ALL_IN_FUND);
                },
            }
        ];
    }

    /**
     * Returns context menu for launching different Applications
     */
    private getContextMenuForApplications(name: string, cusip: string|string[], modelView?: string): MenuItemDef {
        return {
            name,
            action: () => {
                this.launchApp(name, cusip, modelView);
                this.telemetryDataPush(name);
            }
        };
    }

    /**
     * Get the list of selected cusips from the selected rows.
     */
    private getSelectedCusips(params: GetContextMenuItemsParams, cusipColKey: string): string[] {
        const selectedRows = params.api.getSelectedNodes();
        let cusipList: string[] = [];
        if (selectedRows.length > 0) {
            // If we selected nodes, check to see if the one we right clicked on is among the selected nodes
            const rightClickedNodeIsSelected = this.lookThroughSelectedNodes(cusipColKey, selectedRows, params, cusipList);
            // if the node we right clicked on is not among the selected nodes, we will only return the one we right clicked on
            if (!rightClickedNodeIsSelected) {
                cusipList = [];
                cusipList.push(this.processCusip(params.node.data[cusipColKey]));
                return cusipList;
            }
        } else {
            // if no nodes are selected, we use the node that we right clicked on
            // and if the context dots in the action column are selected, we will use that row node
            const actionColClicked = params.column.getColId() === ColumnConstants.ACTION_COL;
            if (actionColClicked || (cusipColKey && params.node.data[cusipColKey] !== null && !params.node.group)) {
                cusipList.push(this.processCusip(params.node.data[cusipColKey]));
            }
        }
        return cusipList;
    }

    lookThroughSelectedNodes(cusipColKey: string, selectedRows: IRowNode[], params: GetContextMenuItemsParams, cusipList: string[]) {
        let nodeExistsInSelected = false;
        for (const row of selectedRows) {
            if (cusipColKey && row.data[cusipColKey] !== null && !row.group) {
                cusipList.push(this.processCusip(row.data[cusipColKey]));
                // if the current node has the same cusip as the one we right clicked on, set flag to true and return all the selected nodes.
                if (row.data[cusipColKey] === params.node.data[cusipColKey]) {
                   nodeExistsInSelected = true;
                }
            }
        }
        return nodeExistsInSelected;
    }

    protected getSecurityBasedWidgetSpecificContextMenuItems(params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const menuItems = [];

        const cusipColKey = this.getCusipColumnKey(requestConfig.columns);
        if (cusipColKey && params.node.data[cusipColKey] !== null && !params.node.group) {
            let cusip: string = params.node.data[cusipColKey];
            cusip = this.processCusip(cusip);

            // Add an option for opening this security in AladdinResearch.
            if (AppUtils.isAladdinResearchEnabled()) {
                menuItems.push(this.getContextMenuForApplications(TabularWidgetConstants.LAUNCH_ALADDIN_RESEARCH, cusip));
            }

            // Add an option for opening this security in Security Master.
            if (AppUtils.isSecurityMasterEnabled()) {
                menuItems.push(this.getContextMenuForApplications(TabularWidgetConstants.LAUNCH_SEC_MASTER, cusip));
            }

            // Add an option for opening this security in Aladdin View.
            if (AppUtils.isAladdinViewEnabled()) {
                const AladdinViewMenuItem = {
                    name: TabularWidgetConstants.ALADDIN_VIEW.LAUNCH_ALADDIN_VIEW,
                    // returns the subMenu for Aladdin View
                    subMenu: this.getSubmenuForAladdinView(cusip, WorkspaceStore.getCurrentPortfolio().portName)
                };
                menuItems.push(AladdinViewMenuItem);
            }
            if (TokenUtils.isFeatureEnabled(TokenConstants.CLARITY_PREMIUM_ACCESS) && TokenUtils.isFeatureEnabled(TokenConstants.CLARITY_AI_LINK_OUT_ACCESS)) {
                menuItems.push(this.getContextMenuForApplications(TabularWidgetConstants.LAUNCH_CLARITY_AI, cusip));
            }
            if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_CLIMATE_ENABLED) && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_CLIMATE_LINKOUT_ENABLED)) {
                // Action Columns do not exist in requestConfig so getModelViewForClimate is set to be undefined for them
                this.addAladdinClimateToMenu(params, requestConfig, menuItems, cusip);
            }
        }

        // Add an option for opening this security in AnSer.
        this.addAnserToMenu(params, cusipColKey, menuItems);
        this.addCashFlowModelingWidgetMenu(requestConfig, params, menuItems, spriteletLaunched);
        return menuItems;
    }

    /**
     * Adds an option for opening the security in Anser to the context menu
     * @param params
     * @param cusipColKey
     * @param menuItems
     */
    addAnserToMenu(params: GetContextMenuItemsParams, cusipColKey: string, menuItems: any[]): void {
        if (AppUtils.isAnSerEnabled()) {
            const cusipList: string[] = this.getSelectedCusips(params, cusipColKey);
            if (cusipList.length > 0) {
                menuItems.push(this.getContextMenuForApplications(TabularWidgetConstants.LAUNCH_ANSER, cusipList));
            }
        }
    }

    /**
     * Adds an option for opening the security in Aladdin Climate to the context menu
     * @param params
     * @param requestConfig
     * @param menuItems
     * @param cusip
     */
    addAladdinClimateToMenu(params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, menuItems: any[], cusip: string): void {
        const actionColClicked = params.column.getColId() === ColumnConstants.ACTION_COL;
        const modelView = actionColClicked ? undefined : this.getModelViewForClimate(requestConfig, params);
        menuItems.push(this.getContextMenuForApplications(TabularWidgetConstants.LAUNCH_ALADDIN_CLIMATE, cusip, modelView));
    }

    /**
     * Method to add context menu to launch commitment risk widget if the security group is FUND and security type is PRIVATE
     * @param requestConfig
     * @param params
     * @param menuItems
     * @param spriteletLaunched
     */
    private addCashFlowModelingWidgetMenu(requestConfig: RequestAdapterConfig, params: GetContextMenuItemsParams, menuItems: MenuItemDef[], spriteletLaunched: EventEmitter<SpriteletEvent>) {
        if (!(TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY) || TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_COMMITMENT_RISK))) {
            return;
        }
        const secGroupColumn = requestConfig.columns.find(col => ColumnConstants.SEC_GROUP === col.columnTag);
        const secGroupKey = secGroupColumn ? secGroupColumn.columnKey : undefined;

        const secTypeColumn = requestConfig.columns.find(col =>  ColumnConstants.SEC_TYPE === col.columnTag);
        const secTypeKey = secTypeColumn ? secTypeColumn.columnKey : undefined;

        if (secGroupKey && secTypeKey && params.node.data[secGroupKey] === 'FUND' && params.node.data[secTypeKey] === 'PRIVATE') {
            this.addSpriteletLaunchMenuItem(menuItems, new SpriteletEvent(WidgetConstants.COMMITMENT_RISK_SPRITELET.ACTION_KEY, params), WidgetConstants.COMMITMENT_RISK_SPRITELET.ACTION_NAME, spriteletLaunched);
        }
    }

     /**
      * Method to get model view (TR/TA/PR) to launch Aladdin Climate Application
      * @param requestConfig
      * @param params
      */
    private getModelViewForClimate(requestConfig: RequestAdapterConfig, params: GetContextMenuItemsParams) {
        const column = requestConfig.columns.find(col => col.columnTag === params.column.getColDef()['colTag']);
        if (column['tClimateScenarioSettings']) {
            return 'TR';
        } else if (column['pClimateScenarioSettings']) {
            return 'PR';
        } else if (column['taClimateScenarioSettings']) {
            return 'TA';
        }
    }

    /**
     * Method to get the URL to launch Aladdin Climate App
     * @param origin
     * @param cusip
     * @param modelView
     */
    private getAladdinClimateLaunchUrl(origin: string, cusip: string | string[], modelView: string) {
        const climateAppName = (CommonUtils.isExploreBeta() || CommonUtils.isExploreGamma()) ? 'aladdin-climate-beta' : 'aladdin-climate';
        return `${origin}/apps/${climateAppName}/#/entity/${cusip}?lookup=true${
            modelView ? '&modelView=' + modelView : ''
          }`;
    }

    private addHVaRorMCVaROptions(menuItems: any[], params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): void {
        if (!params.node.parent) {
            return;
        }

        const [hasMCVaRColumn, hasHVaRColumn] = this.hasHVaRAndMCVaRColumn(params.column.getColId(), requestConfig, params);

        // Can only add the option of HVaR and MCVaR timeseries at either root level or the security level
        const canAddToThisLevel = params.node.level === 0 || params.node.group === false;

        if (canAddToThisLevel && hasHVaRColumn) {
            this.addSpriteletMenuToTheTableMenu(WidgetConstants.HVAR_PNLS_TS, menuItems, params, spriteletLaunched);
        }
        if (canAddToThisLevel && hasMCVaRColumn) {
            this.addSpriteletMenuToTheTableMenu(WidgetConstants.MCVAR_SIMULATION_PNLS, menuItems, params, spriteletLaunched);
        }
    }

    private addIRROptions(menuItems: any[], params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): void {
        // Can only add the option of IRR cash flows download at root level
        const canAddToThisLevel = params.node.level === 0;

        if (!canAddToThisLevel || !TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_IRR)) {
            return;
        }

        const hasIRRColumn = this.hasIRRColumn(params.column.getColId(), requestConfig, params);

        if (hasIRRColumn) {
            this.addSpriteletLaunchMenuItem(menuItems, new SpriteletEvent(WidgetConstants.DOWNLOAD_CASHFLOW_SPRITELET.ACTION_KEY, params, undefined, WidgetConstants.DOWNLOAD_CASHFLOW_SPRITELET.ACTION_TYPE), WidgetConstants.DOWNLOAD_CASHFLOW_SPRITELET.ACTION_NAME, spriteletLaunched);
        }
    }

}
