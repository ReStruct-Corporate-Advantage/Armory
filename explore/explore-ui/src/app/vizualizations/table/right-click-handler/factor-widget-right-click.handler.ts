import {ColumnConstants, CoreWidgetConfigStore, TokenConstants, TokenUtils, WidgetConfigType} from '@blk/explore-ui-core';
import {BaseRightClickHandler} from './base-right-click.handler';
import {GetContextMenuItemsParams, GetMainMenuItemsParams, MenuItemDef, RowNode} from 'ag-grid-community';
import {RequestAdapterConfig, VizualizationColumnConfig} from '@interfaces/request.interface';
import {EventEmitter, Injectable} from '@angular/core';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {WidgetConstants} from '@constants/widget.constants';
import {CommonConstants} from '@constants/common.constants';
import {Widget} from '@models/widget/widget.model';
import {WidgetUtils} from '@utils/widget.utils';
import {RightClickHandlerUtils} from './utils/right-click-handler.utils';

/**
 *  Right-click handler for grid of Factor Based Analysis widget
 */
@Injectable()
export class FactorWidgetRightClickHandler extends BaseRightClickHandler {

    /**
     * BaseRightClickHandler.getWidgetConfigTypes()
     */
    static getWidgetConfigTypes(): string[] {
        return [WidgetConfigType.PRA];
    }

    /**
     * Get any widget specific main menu items (column items)
     */
    protected getWidgetSpecificMainMenuItems(params: GetMainMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const menuItems: MenuItemDef[] = [];

        const columnKey: string = params.column.getColId().split(CommonConstants.COLUMN_KEY_SPLITTER)[0];
        const selectedColumn = requestConfig.columns.find((column: VizualizationColumnConfig) => column.columnKey === columnKey);

        // should only spawn charts from numerical columns
        if (selectedColumn && selectedColumn.dataType !== ColumnConstants.COLUMN_DATA_TYPE.STRING) {
            const subMenuItems = this.getChartTransitionItems(params, spriteletLaunched);
            menuItems.push({
                name: WidgetConstants.OPEN_CHART,
                subMenu: subMenuItems
            });
        }

        return menuItems;
    }

    /**
     * Creates menu items for each type of chart the widget can transform to based on json config
     */
    private getChartTransitionItems(params: GetMainMenuItemsParams | GetContextMenuItemsParams, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const chartMenuItems: MenuItemDef[] = [];

        const chartTransitions: WidgetConfigType[] = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.PRA).chartTransition;
        chartTransitions.forEach((childWidgetType: WidgetConfigType) => {
            const childWidgetConfig = CoreWidgetConfigStore.getChartConfigForType(childWidgetType);

            this.addSpriteletLaunchMenuItem(chartMenuItems, new SpriteletEvent(childWidgetType, params), childWidgetConfig.title, spriteletLaunched);
        });

        return chartMenuItems;
    }

    /**
     * Creates menu items for each type of chart the widget can transform to based on json config
     */
    private getFactorDataChartTransitionItems(params: GetMainMenuItemsParams | GetContextMenuItemsParams, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const factorChartMenuItems: MenuItemDef[] = [];

        const factorDataOptions: any[] = WidgetConstants.FACTOR_DATA_OPTIONS;
        factorDataOptions.forEach((childWidgetOption: any) => {
            const childWidgetType = WidgetConfigType.FACTOR_DATA;
            this.addSpriteletLaunchMenuItem(factorChartMenuItems, new SpriteletEvent(childWidgetType, params, childWidgetOption.ACTION_KEY), childWidgetOption.ACTION_NAME, spriteletLaunched);
        });

        return factorChartMenuItems;
    }

    /**
     * Get any widget specific context menu items
     */
    protected getWidgetSpecificContextMenuItems(params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>, widget: Widget): MenuItemDef[] {
        const menuItems = [];

        const childMenuItemsForFactorWidget: MenuItemDef[] = [];
        // only add RiskMatrix option if group node
        if (params.node.group) {
            this.addSpriteletLaunchMenuItem(childMenuItemsForFactorWidget, new SpriteletEvent(WidgetConfigType.FACTOR_DATA, params, WidgetConstants.RISK_MATRIX.ACTION_KEY), WidgetConstants.RISK_MATRIX.ACTION_NAME, spriteletLaunched);
        }
        childMenuItemsForFactorWidget.push(...this.getFactorDataChartTransitionItems(params, spriteletLaunched));
        RightClickHandlerUtils.addToSubMenu(menuItems, RightClickHandlerUtils.PLOT_FACTOR_DATA, childMenuItemsForFactorWidget);

        this.addSpriteletLaunchSubMenuItem(
            RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.TABLE),
            new SpriteletEvent(WidgetConstants.FACTOR_SECURITY_CONTRIBUTION.ACTION_KEY, params),
            WidgetConstants.FACTOR_SECURITY_CONTRIBUTION.ACTION_NAME,
            spriteletLaunched,
            WidgetUtils.hasMacroFactorBreakdown(widget)
        );

        // only add chart transitions if group node
        if (params.node.group) {
            RightClickHandlerUtils.addToSubMenu(menuItems, RightClickHandlerUtils.CHART, this.getChartTransitionItems(params, spriteletLaunched));
        } else {
            // FACTOR_GRAPHING_TIME_SERIES should always be included since it can be launched from leaf level
            const factorTimeSeriesConfig = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);
            this.addSpriteletLaunchSubMenuItem(
                RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.CHART),
                new SpriteletEvent(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES, params),
                factorTimeSeriesConfig.title,
                spriteletLaunched,
                WidgetUtils.hasMacroFactorBreakdown(widget)
            );
        }

        menuItems.push(CommonConstants.SEPARATOR);

        return menuItems;
    }

    /**
     * Returns true if node has children and is non-leaf
     * (This method overridden from Base-right-click handler to avoid getAllChildNodes asynchronous delay)
     */
    protected hasChildren(node: RowNode): boolean {
        return node.group && node.hasChildren();
    }
}
