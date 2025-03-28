import {Injectable} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {FilterIncludeKey, GroupByKey} from '@qbstr/data-cube';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {ColumnConfig, ColumnConstants, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {ROOT_LEVEL} from '@utils/qbstr';
import {WidgetConstants} from '@constants/widget.constants';
import {AbstractPgsChartSpriteletLauncherService} from '@services/spritelet-launcher/abstract-pgs-chart-spritelet-launcher.service';
import {ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Spritelet launcher responsible for launching a Time series chart from a PGS widget
 */
@Injectable({
    providedIn: 'root'
})
export class PgsTsChartSpriteletLauncherService extends AbstractPgsChartSpriteletLauncherService {
    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return TabularWidgetConstants.PGS_TS_CHART_SPRITELET.ACTION_KEY.toString();
    }

    /**
     * Set customVizConfig for chart widget that gets created
     * @param node
     * @param childWidget
     * @protected
     */
    public setCustomVizConfigSettings(node: any, childWidget: Widget, isSpriteletLaunch: boolean) {
        super.setCustomVizConfigSettings(node, childWidget, isSpriteletLaunch);
        const isLeafPortfolio = ColumnConstants.PORTFOLIO in node.data;
        const isPortfolio = node.level === 0 && !node.hasChildren(); // if node is portfolio and has no children (i.e. not a port group)
        const level = node.level + 1;
        // For leaf level portfolio click, we need to include the portfolio in the query key
        const filterKeyInclude = isLeafPortfolio ? node.data?.[ColumnConstants.PORTFOLIO] : node.data[this.LEVEL + (level - 1)];
        const filterKey = node.level === 0 ? new FilterIncludeKey(ROOT_LEVEL, [node.data[ROOT_LEVEL]]) : new FilterIncludeKey(this.LEVEL + level, [filterKeyInclude]);
        const groupByLevel = this.LEVEL + (isLeafPortfolio ? level : (level + 1)); // for leaf level portfolio click, groupBy needs to be at one lower level
        childWidget.dataStore.data = {
            ...childWidget.dataStore.data,
            customVizConfig: {
                ...childWidget.dataStore.data.customVizConfig,
                queryKeys: [new GroupByKey(WidgetConstants.DATE_GROUP_BY_LEVEL),
                    new GroupByKey(groupByLevel),
                    filterKey
                ],
                groupBys: [WidgetConstants.DATE_GROUP_BY_LEVEL, isPortfolio ? ColumnConstants.PORTFOLIO : groupByLevel]
            }
        };
    }

    /**
     * Updates the childWidget with all numerical columns from parent widget
     * @param childWidget  Widget whose inputs are being overridden
     * @param parentWidget widget from which event was triggered
     * @param params Event params that triggered the spritelet
     * @param isRowBased if event was triggered from row or column
     */
    protected setChildWidgetColumns(childWidget: Widget, parentWidget: Widget, params: any, isRowBased: boolean) {
        super.setChildWidgetColumns(childWidget, parentWidget, params, isRowBased);
        const columnSet: ColumnSet = childWidget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        this.removeColumnBreakdowns(columnSet.columns);
    }

    /**
     * For Time Series chart, breakdowns are not supported, so we remove any breakdown applied on columns and
     * send a warning to the user
     * @param columns
     * @protected
     */
    protected removeColumnBreakdowns(columns: ColumnConfig[]): boolean {
        let hasBreakdown = false;
        columns.forEach(col => col.optionValues = col.optionValues.filter(optionValue => {
            if (optionValue instanceof ColumnBreakdown && !optionValue.breakdown.isEmpty()) {
                hasBreakdown = true;
            }
            return !(optionValue instanceof ColumnBreakdown);
        }));
        if (hasBreakdown) {
            this.notificationService.warning('Column-level breakdowns are not supported in time series charts created from the Portfolio Group Summary widget. As such, the chart has been produced without the breakdown.');
        }
        return true;
    }

    /**
     * Gets the widget config type to spawn
     * @protected
     */
    protected getChildConfigType(): WidgetConfigType {
        return WidgetConfigType.PGS_TS;
    }

    /**
     * Gets columns with which child widget will load
     * @param columns
     * @param params
     * @protected
     */
    protected getColumns(columns: ColumnConfig[], params: any): ColumnConfig[] {
        return columns.filter(column => column.columnKey === params.column.getColId().split(CommonConstants.COLUMN_KEY_SPLITTER)[0]);
    }
}
