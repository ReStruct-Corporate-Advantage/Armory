import {
    CellRange, ColDef,
    GetContextMenuItemsParams,
    GetMainMenuItemsParams,
    GridApi,
    IRowNode,
    IsServerSideGroupOpenByDefaultParams,
    MenuItemDef,
    ShouldRowBeSkippedParams
} from 'ag-grid-community';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {EventEmitter} from '@angular/core';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {CommonConstants} from '@constants/common.constants';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {Widget} from '@models/widget/widget.model';
import {
    ClickElemConstants,
    ClickEventParameters, CoreColumnUtils,
    ExploreClickableElementType,
    TelemetryActionConstants,
    TelemetryService,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {Observable} from 'rxjs';
import {ExportUtils} from '@utils/export/export.utils';
import {AppUtils} from '@utils/app.utils';
import {ColumnUtils} from '@utils/column.utils';
import {RightClickHandlerUtils} from './utils/right-click-handler.utils';

/**
 * Base class for Table widgets right click context menu options
 */
export class BaseRightClickHandler {
    public static readonly AT_THIS_LEVEL: string = 'Rows At This Level';
    public static readonly COLLAPSE_ALL: string = 'Collapse All Levels';
    public static readonly UNDER_THIS_LEVEL: string = 'Rows Under This Level';
    public static readonly EXPAND_ALL: string = 'Expand All Levels';
    public static readonly EXPAND: string = 'Expand';
    public static readonly COLLAPSE: string = 'Collapse';
    public static readonly COPY: string = 'Copy';
    public static readonly COPY_WITH_COLUMN_HEADERS: string = 'Copy with Column Headers';

    // Need to create a hierarchy menu class in future
    public static readonly EXPAND_ALL_AT_THIS_LEVEL_SUB_MENU: string = BaseRightClickHandler.EXPAND.concat(' ').concat(BaseRightClickHandler.AT_THIS_LEVEL);
    public static readonly EXPAND_ALL_UNDER_THIS_LEVEL_SUB_MENU: string = BaseRightClickHandler.EXPAND.concat(' ').concat(BaseRightClickHandler.UNDER_THIS_LEVEL);
    public static readonly COLLAPSE_ALL_AT_THIS_LEVEL_SUB_MENU: string = BaseRightClickHandler.COLLAPSE.concat(' ').concat(BaseRightClickHandler.AT_THIS_LEVEL);
    public static readonly COLLAPSE_ALL_UNDER_THIS_LEVEL_SUB_MENU: string = BaseRightClickHandler.COLLAPSE.concat(' ').concat(BaseRightClickHandler.UNDER_THIS_LEVEL);

    rowDataPopulated$: Observable<string>;

    /**
     * Return the widget config types that would be registered to use this right click handler type
     */
    static getWidgetConfigTypes(): string[] {
        return [WidgetConfigType.PGS, WidgetConfigType.EXPOST_RETURNS, WidgetConfigType.EXPOST_STATS, WidgetConfigType.EXPOST_TIME_SERIES, WidgetConfigType.LOOK_THROUGH_SUMMARY, WidgetConfigType.COMMITMENT_RISK];
    }

    constructor() {
    }

    /**
     * AgGrid getMainMenuItems
     */
    getMainMenuItemsForAgGrid (params: GetMainMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): (string | MenuItemDef)[] {
        const defaultItemsFiltered = this.removeDefaultColumnMenuItems([...params.defaultItems]);

        // start by adding default items to menu
        let menuItems: (string | MenuItemDef)[] = [...defaultItemsFiltered];

        // add show column definition to first position
        this.addSpriteletLaunchMenuItem(menuItems, new SpriteletEvent(CommonConstants.COLUMN_DEFINITION_SPRITELET.ACTION_KEY, params, CommonConstants.COLUMN_DEFINITION_SPRITELET.CALLBACK_METHOD_NAME), CommonConstants.COLUMN_DEFINITION_SPRITELET.ACTION_LABEL, spriteletLaunched, false, true, true);

        // add remaining items at end
        menuItems = menuItems.concat(this.getWidgetSpecificMainMenuItems(params, requestConfig, spriteletLaunched));
        this.removeSeperatorsAtEnd(menuItems);
        return menuItems;
    }

    /**
     * We need to remove reset column from default columns
     */
    removeDefaultColumnMenuItems(menuItems: string[]): string[] {
        const itemsToRemove = ['columnChooser', 'resetColumns'];
        return menuItems.filter(item => !itemsToRemove.includes(item));
    }

    /**
     * This method is to remove seperators at end of menu items which are left when we removed reset column menu
     */
    removeSeperatorsAtEnd(menuItems: (string | MenuItemDef)[]) {
        while (menuItems[menuItems.length - 1] === CommonConstants.SEPARATOR) {
            menuItems.pop();
        }
    }

    /**
     * AgGrid getContextMenuItems
     */
    getContextMenuItemsForAgGrid (params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>, expandedState: ExpandedState, widget: Widget): MenuItemDef[] {
        let menuItems = [];

        // Add the expand/collapse menu items.
        menuItems = menuItems.concat(this.getExpandCollapseContextMenuOptions(params, expandedState));
        menuItems.push(CommonConstants.SEPARATOR);

        // Add Widget Specific context
        menuItems = menuItems.concat(this.getWidgetSpecificContextMenuItems(params, requestConfig, spriteletLaunched, widget));

        // Add Copy section
        menuItems = menuItems.concat(this.getCopySelectionMenuOptions(params.api));
        return menuItems;
    }

    /**
     * Get any widget specific context menu items
     */
    protected getWidgetSpecificContextMenuItems(params: GetContextMenuItemsParams , requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>, widget?: Widget): MenuItemDef[] {
        return [];
    }

    /**
     * Get any widget specific main menu items
     */
    protected getWidgetSpecificMainMenuItems(params: GetMainMenuItemsParams , requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        return [];
    }


    /**
     * Add a menuItem to the passed in collection to launch a spritelet
     */
    protected addSpriteletLaunchMenuItem(menuItems: (string | MenuItemDef)[], spriteletEvent: SpriteletEvent, actionName: string, spriteletLaunched: EventEmitter<SpriteletEvent>, disabled: boolean = false, appendAtTop: boolean = false, addSeperator: boolean = false) {
        const newMenuItem = {
            name: actionName,
            disabled,
            action: () => {
                spriteletLaunched.emit(spriteletEvent);
                this.telemetryDataPush(actionName);
                this.successfulNotification(actionName);

            }
        };
        if (appendAtTop) {
            if (addSeperator) {
                menuItems.splice(0, 0, CommonConstants.SEPARATOR);
            }
            menuItems.splice(0, 0, newMenuItem);
        } else {
            if (addSeperator) {
                menuItems.push(CommonConstants.SEPARATOR);
            }
            menuItems.push(newMenuItem);
        }
    }

    /**
     * Add a menuItem to the passed in collection to launch a spritelet
     */
    protected addSpriteletLaunchSubMenuItem(menuItem: MenuItemDef, spriteletEvent: SpriteletEvent, actionName: string, spriteletLaunched: EventEmitter<SpriteletEvent>, disabled: boolean = false) {
        (menuItem.subMenu as MenuItemDef[]).push({
            name: actionName,
            disabled,
            action: () => {
                spriteletLaunched.emit(spriteletEvent);
                this.telemetryDataPush(actionName);
            }
        });
    }

    /**
     * Get the Expand Collapse context menu items
     */
    private getExpandCollapseContextMenuOptions(params: GetContextMenuItemsParams, expandedState: ExpandedState): MenuItemDef[] {
        const isFirstLevel = !params.node.parent?.id;
        const isLastLevel = !params.node?.group;

        if (isFirstLevel) {
            return [
                this.controlExpandAndCollapse(BaseRightClickHandler.EXPAND, params, expandedState),
                this.controlExpandAndCollapse(BaseRightClickHandler.EXPAND_ALL, params, expandedState),
                this.controlExpandAndCollapse(BaseRightClickHandler.COLLAPSE_ALL, params, expandedState)
            ];
        } else if (isLastLevel) {
            return [
                this.controlExpandAndCollapse(BaseRightClickHandler.EXPAND_ALL, params, expandedState),
                this.controlExpandAndCollapse(BaseRightClickHandler.COLLAPSE_ALL, params, expandedState)
            ];
        } else {
            return [
                {
                    name: BaseRightClickHandler.EXPAND,
                    subMenu: [
                        this.controlExpandAndCollapse(BaseRightClickHandler.AT_THIS_LEVEL, params, expandedState, BaseRightClickHandler.EXPAND),
                        this.controlExpandAndCollapse(BaseRightClickHandler.UNDER_THIS_LEVEL, params, expandedState, BaseRightClickHandler.EXPAND)
                    ]
                },
                this.controlExpandAndCollapse(BaseRightClickHandler.EXPAND_ALL, params, expandedState),
                {
                    name: BaseRightClickHandler.COLLAPSE,
                    subMenu: [
                        this.controlExpandAndCollapse(BaseRightClickHandler.AT_THIS_LEVEL, params, expandedState, BaseRightClickHandler.COLLAPSE),
                        this.controlExpandAndCollapse(BaseRightClickHandler.UNDER_THIS_LEVEL, params, expandedState, BaseRightClickHandler.COLLAPSE)
                    ]
                },
                this.controlExpandAndCollapse(BaseRightClickHandler.COLLAPSE_ALL, params, expandedState)
            ];
        }
    }

    /**
     * Get copy and copy with column headers menu items
     */
    private getCopySelectionMenuOptions(gridApi: GridApi): MenuItemDef[] {
        const menuItems = [];
        menuItems.push(
            {
                name: BaseRightClickHandler.COPY,
                disabled: false,
                action: () => gridApi.copySelectedRangeToClipboard({includeHeaders: false})
            }
        );
        // This is custom implementation to copy group headers as well.
        // We are on old ag grid version as of now, in new version there is api call for copying selected rows with group headers
        menuItems.push(
            {
                name: BaseRightClickHandler.COPY_WITH_COLUMN_HEADERS,
                disabled: false,
                action: () => {
                    const selectedRanges = [];
                    for (const cellRange of gridApi.getCellRanges()) {
                        const rangeData = this.getDataInSelectedRange(gridApi, cellRange);
                        if (!!rangeData) {
                            selectedRanges.push(rangeData);
                        }
                    }
                    AppUtils.copyTextToClipboard(selectedRanges.join(CommonConstants.LINE_SEPARATOR));
                }
            }
        );
        return menuItems;
    }

    copySelectedRangeToClipboardIncludingHeaders(gridApi: GridApi) {
        const selectedRanges = [];
        for (const cellRange of gridApi.getCellRanges()) {
            const rangeData = this.getDataInSelectedRange(gridApi, cellRange);
            if (!!rangeData) {
                selectedRanges.push(rangeData);
            }
        }
        AppUtils.copyTextToClipboard(selectedRanges.join(CommonConstants.LINE_SEPARATOR));
    }

    /**
     * get the selected rows along with header(also group headers) for one selected range
     */
    getDataInSelectedRange(gridApi: GridApi, selectedRange: CellRange): string {
        return gridApi.getDataAsCsv({
            columnKeys: selectedRange.columns.map(column => column.getColId()),
            columnSeparator: '\t',
            suppressQuotes: true,
            processCellCallback: ExportUtils.processCellForExport,
            shouldRowBeSkipped: (params: ShouldRowBeSkippedParams) => {
                return !(params.node.rowIndex >= selectedRange.startRow.rowIndex && params.node.rowIndex <= selectedRange.endRow.rowIndex);
            }
        });
    }

    /**
     * Method for expand and collapse child nodes
     */
    private controlExpandAndCollapse(name: string, {api, node, context}, expandedState: ExpandedState, mainType?: string): MenuItemDef {
        return {
            name,
            action: () => {
                if (mainType) {
                    name = mainType.concat(' ').concat(name);
                }
                switch (name) {
                    // Collapse all at this level
                    case BaseRightClickHandler.COLLAPSE_ALL_AT_THIS_LEVEL_SUB_MENU: {
                        this.collapseAllRowsAtThisLevel(node, api, context);
                        break;
                    }
                    // Expand all at this level
                    case BaseRightClickHandler.EXPAND_ALL_AT_THIS_LEVEL_SUB_MENU: {
                        this.expandAllRowsAtThisLevel(node, api, context);
                        break;
                    }
                    // Expand all
                    case BaseRightClickHandler.EXPAND_ALL: {
                        if (expandedState) {
                            expandedState.allExpanded = true;
                        }
                        api.expandAll();
                        break;
                    }
                    // Collapse all
                    case BaseRightClickHandler.COLLAPSE_ALL: {
                        this.clearIsFutureRowExpandedCallback(context);
                        if (expandedState) {
                            expandedState.allExpanded = false;
                            expandedState.clearPaths();
                        }
                        api.collapseAll();
                        break;
                    }
                    // Expand under this level
                    case BaseRightClickHandler.EXPAND_ALL_UNDER_THIS_LEVEL_SUB_MENU: {
                        this.expandAllRowsUnderThisRow(node, api, context);
                        break;
                    }
                    // Expand
                    case BaseRightClickHandler.EXPAND: {
                        node.setExpanded(true);
                        break;
                    }
                    // Collapse
                    case BaseRightClickHandler.COLLAPSE:
                    case BaseRightClickHandler.COLLAPSE_ALL_UNDER_THIS_LEVEL_SUB_MENU: {
                        this.collapseAllRowsUnderThisRow(node, api, context);
                        break;
                    }
                }

                this.telemetryDataPush(name);
            }
        };
    }

    /**
     * Expands all nodes under a specific row group
     */
    private expandAllRowsUnderThisRow(selectedNode: IRowNode, gridApi: GridApi, context: any): void {
        // iterate through all rows already loaded in server store and expand the ones that are under the selected node
        gridApi.forEachNode(node => {
            if (node.isExpandable() && node.level >= selectedNode.level && this.isCurrentRowUnderSelectedRow(selectedNode, node)) {
                node.setExpanded(true);
            }
        });

        // set the function to be used in gridOptions.isServerSideGroupOpenByDefault to expand the future rows when they are loaded in server store
        context.isFutureRowExpanded = (params: IsServerSideGroupOpenByDefaultParams) => {
            return params.rowNode.isExpandable() && params.rowNode.level >= selectedNode.level && this.isCurrentRowUnderSelectedRow(selectedNode, params.rowNode);
        };
    }

    /**
     * Check if the node is the selected node or is under the selected node
     */
    private isCurrentRowUnderSelectedRow(selectedNode: IRowNode, node: IRowNode): boolean {
        let parentNode = node;
        while (parentNode) {
            if (parentNode.id === selectedNode.id) {
                return true;
            }
            parentNode = parentNode.parent;
        }
        return false;
    }

    /**
     * Expands all nodes at/above a specific row level
     */
    private expandAllRowsAtThisLevel(selectedNode: IRowNode, gridApi: GridApi, context: any): void {
        // iterate through all rows already loaded in server store and expand if they are at or above the selected node
        gridApi.forEachNode(node => {
            if (node.isExpandable() && node.level <= selectedNode.level) {
                node.setExpanded(true);
            }
        });

        // set the function to be used in gridOptions.isServerSideGroupOpenByDefault to expand the future rows when they are loaded in server store
        context.isFutureRowExpanded = (params: IsServerSideGroupOpenByDefaultParams) => {
            return params.rowNode.isExpandable() && params.rowNode.level <= selectedNode.level;
        };
    }

    /**
     * Collapses all nodes under a specific row group
     */
    private collapseAllRowsUnderThisRow(selectedNode: IRowNode, gridApi: GridApi, context: any): void {
        this.clearIsFutureRowExpandedCallback(context);
        // all relevant rows have already been loaded from the server so iterate all nodes and collapse that fall under the specific node
        gridApi.forEachNode(node => {
            if (node.isExpandable() && node.level >= selectedNode.level && this.isCurrentRowUnderSelectedRow(selectedNode, node)) {
                node.setExpanded(false);
            }
        });
    }

    /**
     * Collapses all nodes below all rows at the same level
     */
    private collapseAllRowsAtThisLevel(selectedNode: IRowNode, gridApi: GridApi, context: any): void {
        this.clearIsFutureRowExpandedCallback(context);
        // all relevant rows have already been loaded from the server so iterate all nodes and collapse any that are at or below the selected node
        gridApi.forEachNode(node => {
            if (node.isExpandable() && node.level >= selectedNode.level) {
                node.setExpanded(false);
            }
        });
    }

    /**
     * Clears the callback function used to expand future rows loaded from the server store
     */
    private clearIsFutureRowExpandedCallback(context: any): void {
        context.isFutureRowExpanded = () => false;
    }

    /**
     * Widget Right click Telemetry data push to SnowFlake
     */
    protected telemetryDataPush(label: string) {
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT, new ClickEventParameters(ExploreClickableElementType.MENU, label, ClickElemConstants.SOURCE.WIDGET, ClickElemConstants.CONTEXT_PATH.WIDGET_RIGHT_CLICK));
    }

    /**
     * Function to create a toaster notification when a spritelet is launched
     */
    protected successfulNotification(_actionName: string) {
        // This is implemented in the widget level handler
    }

    public addSpriteletMenuToTheTableMenu(option: {ACTION_NAME: string, ACTION_KEY: string}, menuItems: any[], params: GetContextMenuItemsParams, spriteletLaunched: EventEmitter<SpriteletEvent>) {
        this.addSpriteletLaunchSubMenuItem(
            RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.TABLE),
            new SpriteletEvent(option.ACTION_KEY, params),
            option.ACTION_NAME,
            spriteletLaunched
        );
    }

    public hasHVaRAndMCVaRColumn(colId: string, requestConfig: RequestAdapterConfig, params: GetContextMenuItemsParams): [boolean, boolean] {
        let hasMCVaRColumn = false;
        let hasHVaRColumn = false;
        if (ColumnUtils.checkIfColumnIsRowBasedForSpriteletLaunch(colId)) {
            for (const column of requestConfig.columns) {
                const colDef = CoreColumnUtils.getColumnDefByTag(column.columnTag);
                hasMCVaRColumn = hasMCVaRColumn || colDef?.isMCVaRColumn();
                hasHVaRColumn = hasHVaRColumn || colDef?.isHVaRColumn();
                if (hasHVaRColumn && hasMCVaRColumn) {
                    break;
                }
            }
        } else {
            const colDef = CoreColumnUtils.getColumnDefByTag((params.column.getColDef() as ColDef & {colTag: string}).colTag);
            hasMCVaRColumn = colDef?.isMCVaRColumn();
            hasHVaRColumn = colDef?.isHVaRColumn();
        }
        return [hasMCVaRColumn, hasHVaRColumn];
    }

    public hasIRRColumn(colId: string, requestConfig: RequestAdapterConfig, params: GetContextMenuItemsParams): boolean {
        if (ColumnUtils.checkIfColumnIsRowBasedForSpriteletLaunch(colId)) {
            return requestConfig.columns.some(column => {
                const columnDefinition = CoreColumnUtils.getColumnDefByTag(column.columnTag);
                return columnDefinition?.isIRRColumn();
            });
        }
        const colDef = CoreColumnUtils.getColumnDefByTag((params.column.getColDef() as ColDef & {colTag: string}).colTag);
        return colDef?.isIRRColumn();
    }
}
