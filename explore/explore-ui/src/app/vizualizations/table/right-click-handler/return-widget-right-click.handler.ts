import {SecurityBasedWidgetRightClickHandler} from './security-based-widget-right-click.handler';
import {GetContextMenuItemsParams, MenuItemDef} from 'ag-grid-community';
import {RequestAdapterConfig} from '../../../interfaces';
import {CommonConstants} from '../../../constants';
import {EventEmitter, Injectable} from '@angular/core';
import {SpriteletEvent} from '../../../models/spritelets/spritelet-event.model';
import {ColumnConstants, PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {RightClickHandlerUtils} from './utils/right-click-handler.utils';
import {isNil} from 'lodash';

/**
 * Right Click handler for Returns Widget
 */
@Injectable()
export class ReturnWidgetRightClickHandler extends SecurityBasedWidgetRightClickHandler {

    /**
     * BaseRightClickHandler.getWidgetConfigTypes()
     */
    static getWidgetConfigTypes(): string[] {
        return [WidgetConfigType.RETURNS];
    }

    /**
     * SecurityBasedWidgetRightClickHandler.processCusip(string)
     */
    protected doProcessCusip(cusip: string): string {
        // In case there is no cusip column present, we will hit a hidden column key.
        // Therefore, we will need to parse it grabbing the cusip from the last value of the string
        // An example of how the hidden value stores the cusip in the hidden column for RA widgets is like this: SECURITY_GROUP.CASH.XAUD00001
        if (!isNil(cusip) && cusip.length > 9) {
            const cusipParts: string[] = cusip.split('.');
            cusip = cusipParts[cusipParts.length - 1];
        }
        return cusip;
    }

    /**
     * BaseRightClickHandler.getWidgetSpecificContextMenuItems(GetContextMenuItemsParams, Map<string, WidgetInput>, string)
     */
    protected getWidgetSpecificContextMenuItems(params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const menuItems = [];
        // if a row corresponds to a residual, we don't want to show 'open performance details' in the context dots or the right click menu
        const residualNodeSelected = params.node.data.pnl_id === 'Security Group.Unassigned.USD_RESID' || params.node.data.pnl_id === 'Security Group.Unassigned.NULL';
        if (!residualNodeSelected) {
            this.addSpriteletLaunchMenuItem(menuItems, new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_PERF_DETAILS, params), PerformanceConstants.SHOW_PERFORMANCE_DETAILS, spriteletLaunched);
        }
        this.addSpriteletLaunchSubMenuItem(RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.CHART), new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES, params), PerformanceConstants.SHOW_TIME_SERIES, spriteletLaunched);
        this.addPriceChartIfEnabled(params, requestConfig, spriteletLaunched, menuItems);
        RightClickHandlerUtils.addToSubMenu(menuItems, RightClickHandlerUtils.LAUNCH, super.getSecurityBasedWidgetSpecificContextMenuItems(params, requestConfig, spriteletLaunched));
        if (menuItems.length > 0) {
            menuItems.push(CommonConstants.SEPARATOR);
        }
        return menuItems;
    }

    /**
     * BaseRightClickHandler.getWidgetSpecificMainMenuItems(GetContextMenuItemsParams, Map<string, WidgetInput>, string)
     */
    protected getWidgetSpecificMainMenuItems(params: GetContextMenuItemsParams , requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const menuItems = [];
        const managerSelectionCol = requestConfig.columns.find(col =>  PerformanceConstants.MANAGER_SELECTION_COL_TAG === col.columnTag || ColumnConstants.MANAGER_TRACKING === col.columnTag);
        const fxAttributionCol = requestConfig.columns.find(col =>  PerformanceConstants.FX_ATTRIBUTION_COL_TAG === col.columnTag);

        if (managerSelectionCol && params.column.getColId() === managerSelectionCol.columnKey) {
            this.addSpriteletLaunchMenuItem(menuItems, new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_MANAGER_SELECTION, params), PerformanceConstants.MANAGER_SELECTION_LABEL, spriteletLaunched);
        } else if (fxAttributionCol && params.column.getColId() === fxAttributionCol.columnKey) {
            this.addSpriteletLaunchMenuItem(menuItems, new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_FX_ATTRIBUTION, params), PerformanceConstants.FX_ATTRIBUTION_LABEL, spriteletLaunched);
        }
        return menuItems;
    }
    /**
     * Toast notification when a widget is launched successfully
     * @param actionName
     */
    protected successfulNotification(actionName: string) {
        if (actionName === PerformanceConstants.SHOW_PERFORMANCE_DETAILS) {
            this.notificationService.success('Performance Details widget added!');
        }
    }
}
