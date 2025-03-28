import {Injectable} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigType, ColumnConstants, ColumnConfig} from '@blk/explore-ui-core';
import {FilterIncludeKey, GroupByKey} from '@qbstr/data-cube';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {ROOT_LEVEL} from '@utils/qbstr';
import {CommonConstants} from '@constants/common.constants';
import {AbstractPgsChartSpriteletLauncherService} from '@services/spritelet-launcher/abstract-pgs-chart-spritelet-launcher.service';
import {isNil} from 'lodash';
import {ColumnBreakdown} from '@blk/explore-ui-breakdown';

/**
 * Spritelet launcher responsible for launching a Risk and Exposure from a PGS widget
 */
@Injectable({
    providedIn: 'root'
})
export class PgsBarChartSpriteletLauncherService extends AbstractPgsChartSpriteletLauncherService {

    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return TabularWidgetConstants.PGS_BAR_CHART_SPRITELET.ACTION_KEY.toString();
    }

    public setCustomVizConfigSettings(node: any, childWidget: Widget, isSpriteletLaunch: boolean) {
        super.setCustomVizConfigSettings(node, childWidget, isSpriteletLaunch);
        const isLeafLevelClick = ColumnConstants.PORTFOLIO in node.data;
        let queryKeys = [];
        let groupBys = null;
        if (node.level !== 0) {
            if (!node.hasChildren()) {
                queryKeys.push(new FilterIncludeKey(ColumnConstants.PORTFOLIO, [node.data.portfolio]));
            }
            for (let i = node.level; i > 0; i--) {
                queryKeys.push(new FilterIncludeKey(this.LEVEL + i, [node.data[this.LEVEL + i]]));
            }
        } else if (node.level === 0 && isLeafLevelClick) {
            queryKeys = [new GroupByKey(ROOT_LEVEL)];
            groupBys = [];
        }

        if (isLeafLevelClick && node.level !== 0) {
            groupBys = [ColumnConstants.PORTFOLIO];
        }

        childWidget.dataStore.data = {
            ...childWidget.dataStore.data,
            customVizConfig: {
                ...childWidget.dataStore.data.customVizConfig,
                queryKeys: [
                    new FilterIncludeKey(ROOT_LEVEL, [node.data[ROOT_LEVEL]]),
                    ...queryKeys
                ],
                leafLevels: [ColumnConstants.PORTFOLIO],
                ...(!isNil(groupBys) ? {groupBys} : {})
            }
        };
    }

    /**
     * Checks if column breakdowns are valid or not
     * Valid cases are when all columns have the same breakdown applied
     * or no breakdown applied on any column
     * @param columns
     * @protected
     */
    protected checkIfValidBreakdown(columns: ColumnConfig[]): boolean {
        const columnBreakdowns = columns.flatMap(col => col.optionValues.filter(optionValue => optionValue instanceof ColumnBreakdown) as ColumnBreakdown[]);

        if (columnBreakdowns.length === columns.length) { // all columns have breakdown applied
            return columnBreakdowns.every(colBreakdown => colBreakdown.equals(columnBreakdowns[0])); // if all breakdowns are the same, return true

        }
        // if no breakdown applied on any column, return true
        return columnBreakdowns.every(colBreakdown => colBreakdown.breakdown.isEmpty());
    }

    protected getChildConfigType(): WidgetConfigType {
        return WidgetConfigType.PGS_BAR;
    }

    protected getColumns(columns: ColumnConfig[], params: any): ColumnConfig[] {
        return columns.filter(column => column.columnKey === params?.column?.getColId().split(CommonConstants.COLUMN_KEY_SPLITTER)[0] || column.columnKey === ColumnConstants.PORTFOLIO);
    }
}
