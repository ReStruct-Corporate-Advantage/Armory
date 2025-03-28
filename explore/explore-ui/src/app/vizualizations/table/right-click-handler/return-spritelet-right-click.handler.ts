import {BaseRightClickHandler} from './base-right-click.handler';
import {RequestAdapterConfig} from '../../../interfaces';
import {SpriteletEvent} from '../../../models/spritelets/spritelet-event.model';
import {CommonConstants} from '../../../constants';
import {GetContextMenuItemsParams, MenuItemDef} from 'ag-grid-community';
import {EventEmitter, Injectable} from '@angular/core';
import {PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {RightClickHandlerUtils} from './utils/right-click-handler.utils';

/**
 * Right click handler for ReturnSpritelet (non drilldown) widgets
 */
@Injectable()
export class ReturnSpriteletRightClickHandler extends BaseRightClickHandler {

    /**
     * BaseRightClickHandler.getWidgetConfigTypes()
     */
    static getWidgetConfigTypes(): string[] {
        return [WidgetConfigType.RETURNS_PERF_DETAIL, WidgetConfigType.RETURNS_TIME_SERIES];
    }

    /**
     * getWidgetConfigTypes.getWidgetSpecificContextMenuItems(GetContextMenuItemsParams, Map<string, WidgetInput>, string)
     */
    protected getWidgetSpecificContextMenuItems(params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const menuItems = [];
        if (!params.node.parent) {
            return menuItems;
        }
        this.addSpriteletLaunchSubMenuItem(RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.TABLE), new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_TIME_SERIES, params), PerformanceConstants.SHOW_DETAIL, spriteletLaunched);
        this.addSpriteletLaunchSubMenuItem(RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.TABLE), new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_PERF_DETAILS, params), PerformanceConstants.SHOW_PERFORMANCE_DETAILS, spriteletLaunched);
        menuItems.push(CommonConstants.SEPARATOR);
        return menuItems;
    }
}
