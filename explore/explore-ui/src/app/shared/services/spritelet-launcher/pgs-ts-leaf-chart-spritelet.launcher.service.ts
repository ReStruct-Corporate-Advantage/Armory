import {Injectable} from '@angular/core';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {ColumnConstants} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {FilterExcludeKey, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {PgsTsChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-ts-chart-spritelet-launcher.service';
import {WidgetConstants} from '@constants/widget.constants';

/**
 * Spritelet launcher responsible for launching a Time series chart from a PGS widget
 */
@Injectable({
    providedIn: 'root'
})
export class PgsTsLeafChartSpriteletLauncherService extends PgsTsChartSpriteletLauncherService {
    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return TabularWidgetConstants.PGS_TS_LEAF_CHART_SPRITELET.ACTION_KEY.toString();
    }

    public setCustomVizConfigSettings(node: any, childWidget: Widget, isSpriteletLaunch: boolean) {
        super.setCustomVizConfigSettings(node, childWidget, isSpriteletLaunch);
        const queryKeys: QueryKeyEntry[] = [new GroupByKey(WidgetConstants.DATE_GROUP_BY_LEVEL), new FilterExcludeKey(ColumnConstants.PORTFOLIO, [])];
        const groupBys = [WidgetConstants.DATE_GROUP_BY_LEVEL, ColumnConstants.PORTFOLIO];
        if (node.level === 0 && !node.hasChildren()) {
            return; // Already taken care of by super
        }
        childWidget.dataStore.data = {
            ...childWidget.dataStore.data,
            customVizConfig: {
                ...childWidget.dataStore.data.customVizConfig,
                queryKeys,
                groupBys
            }
        };
    }
}
