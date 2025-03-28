import {BaseRightClickHandler} from './base-right-click.handler';
import {RequestAdapterConfig, VizualizationColumnConfig} from '../../../interfaces';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {CommonConstants, WidgetConstants, TabularWidgetConstants} from '../../../constants';
import {ColDef, GetContextMenuItemsParams, MenuItemDef} from 'ag-grid-community';
import {EventEmitter, Injectable} from '@angular/core';
import {
    WidgetConfigType,
    CoreWidgetConfigStore,
    ColumnConstants, CoreColumnUtils
} from '@blk/explore-ui-core';
import {RightClickHandlerUtils} from './utils/right-click-handler.utils';
import {isNil} from 'lodash';
import {ColumnUtils} from '@utils/column.utils';
import {FactorSettingsColumnOption} from '@blk/explore-ui-column-option';

/**
 * Right click handler for PGS widget
 */
@Injectable()
export class PgsRightClickHandler extends BaseRightClickHandler {

    /**
     * BaseRightClickHandler.getWidgetConfigTypes()
     */
    static getWidgetConfigTypes(): string[] {
        return [WidgetConfigType.PGS];
    }

    /**
     * getWidgetConfigTypes.getWidgetSpecificContextMenuItems(GetContextMenuItemsParams, Map<string, WidgetInput>, string)
     */
    protected getWidgetSpecificContextMenuItems(params: GetContextMenuItemsParams, requestConfig: RequestAdapterConfig, spriteletLaunched: EventEmitter<SpriteletEvent>): MenuItemDef[] {
        const menuItems = [];
        if (!params.node.parent) {
            return menuItems;
        }

        this.addSpriteletLaunchSubMenuItem(
            RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.TABLE),
            new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params),
            WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_NAME,
            spriteletLaunched
        );

        const [hasMCVaRColumn, hasHVaRColumn] = this.hasHVaRAndMCVaRColumn(params.column.getColId(), requestConfig, params);
        if (hasHVaRColumn) {
            this.addSpriteletMenuToTheTableMenu(WidgetConstants.HVAR_PNLS_TS, menuItems, params, spriteletLaunched);
        }
        if (hasMCVaRColumn) {
            this.addSpriteletMenuToTheTableMenu(WidgetConstants.MCVAR_SIMULATION_PNLS, menuItems, params, spriteletLaunched);
        }

        this.checkAndAddDiversificationScoreTimeSeriesOption(menuItems, params, spriteletLaunched, requestConfig);

        this.addActiveShareMenuItem(menuItems, params, spriteletLaunched, requestConfig, params.column.getColId());

        if (params?.column?.getUserProvidedColDef()?.type !== ColumnConstants.AUX_TEXT_COLUMN) {
            const barChartConfig = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.PGS_BAR);
            this.addSpriteletLaunchSubMenuItem(
                RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.CHART),
                new SpriteletEvent(TabularWidgetConstants.PGS_BAR_CHART_SPRITELET.ACTION_KEY, params),
                barChartConfig.title + ' at selected level',
                spriteletLaunched
            );

            const timeSeriesConfig = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.PGS_TS);
            this.addSpriteletLaunchSubMenuItem(
                RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.CHART),
                new SpriteletEvent(TabularWidgetConstants.PGS_TS_CHART_SPRITELET.ACTION_KEY, params),
                timeSeriesConfig.title + ' at selected level',
                spriteletLaunched
            );

            if (params.node.level === 0) {
                this.addSpriteletLaunchSubMenuItem(
                    RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.CHART),
                    new SpriteletEvent(TabularWidgetConstants.PGS_LEAF_BAR_CHART_SPRITELET.ACTION_KEY, params),
                    barChartConfig.title + ' for all individual portfolios',
                    spriteletLaunched
                );

                this.addSpriteletLaunchSubMenuItem(
                    RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.CHART),
                    new SpriteletEvent(TabularWidgetConstants.PGS_TS_LEAF_CHART_SPRITELET.ACTION_KEY, params),
                    timeSeriesConfig.title + ' for all individual portfolios',
                    spriteletLaunched
                );
            }
        }
        menuItems.push(CommonConstants.SEPARATOR);
        return menuItems;
    }

    /**
     * Adds active shares spritelet options to the context menu
     *
     * @param menuItems
     * @param params
     * @param spriteletLaunched
     * @param requestConfig
     * @param colId
     * @private
     */
    private addActiveShareMenuItem(
        menuItems: any[],
        params: GetContextMenuItemsParams,
        spriteletLaunched: EventEmitter<SpriteletEvent>,
        requestConfig: RequestAdapterConfig,
        colId: string
    ): void {
        const colDef = CoreColumnUtils.getColumnDefByTag((params.column.getColDef() as ColDef & {colTag: string}).colTag);
        const isActiveSharesPresent = !isNil(requestConfig.columns.find(col => col.columnTag === ColumnConstants.ACTIVE_SHARES));
        // Add active shares spritelet launch option only if the column is active shared, or it's 3 dot context menu
        if (isActiveSharesPresent && (colDef?.columnTag === 'active_shares' || colId === ColumnConstants.ACTION_COL)) {
            this.addSpriteletLaunchSubMenuItem(
                RightClickHandlerUtils.getSubMenu(menuItems, RightClickHandlerUtils.TABLE),
                new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params, null, WidgetConstants.ACTIVE_SHARES_SPRITELET.ACTION_NAME),
                WidgetConstants.ACTIVE_SHARES_SPRITELET.ACTION_NAME,
                spriteletLaunched
            );
        }
    }

    private checkAndAddDiversificationScoreTimeSeriesOption(
        menuItems: any[],
        params: GetContextMenuItemsParams,
        spriteletLaunched: EventEmitter<SpriteletEvent>,
        requestConfig: RequestAdapterConfig
    ): void {
        const isActionCol = ColumnUtils.checkIfColumnIsRowBasedForSpriteletLaunch(params.column.getColId());
        if (isActionCol) {
            // If it is action column check if the request has any diversification column, and if so add the submenu
            let hasDiversificationScoreColumn = false;
            for (const column of requestConfig.columns) {
                hasDiversificationScoreColumn = this.isDiversificationColumn(column);
                if (hasDiversificationScoreColumn) {
                    break;
                }
            }
            if (hasDiversificationScoreColumn) {
                this.addSpriteletMenuToTheTableMenu(WidgetConstants.DIVERSIFICATION_SCORE_TIMESERIES, menuItems, params, spriteletLaunched);
            }
        } else {
            // It is a column right click handler, check if it is a diversification score column and then add the sub menu
            // The column in params doesn't have factorSettingsConfigType so we need to look up for the column from requestCofnig
            const matchingCol = requestConfig.columns.find(col => col.columnTag === ((params.column.getColDef() as ColDef & {colTag: string}).colTag));
            if (matchingCol && this.isDiversificationColumn(matchingCol)) {
                this.addSpriteletMenuToTheTableMenu(WidgetConstants.DIVERSIFICATION_SCORE_TIMESERIES, menuItems, params, spriteletLaunched);
            } else {
                console.warn('No matching column found in requestConfig', params.column.getColDef());
            }
        }
    }

    private isDiversificationColumn(column: VizualizationColumnConfig): boolean {
        return Object.getOwnPropertyNames(column).includes(FactorSettingsColumnOption.CONFIG_TYPE);
    }
}
