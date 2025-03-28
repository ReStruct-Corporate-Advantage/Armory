import {Injectable} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {FilterExcludeKey, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {PgsBarChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-bar-chart-spritelet-launcher.service';
import {ColumnConstants} from '@blk/explore-ui-core';
import {ROOT_LEVEL} from '@utils/qbstr';

/**
 * Spritelet launcher responsible for launching a Risk and Exposure from a PGS widget
 */
@Injectable({
    providedIn: 'root'
})
export class PgsLeafBarChartSpriteletLauncherService extends PgsBarChartSpriteletLauncherService {
    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return TabularWidgetConstants.PGS_LEAF_BAR_CHART_SPRITELET.ACTION_KEY.toString();
    }

    public setCustomVizConfigSettings(node: any, childWidget: Widget, isSpriteletLaunch: boolean) {
        super.setCustomVizConfigSettings(node, childWidget, isSpriteletLaunch);
        let queryKeys: QueryKeyEntry[] = [new FilterExcludeKey(ColumnConstants.PORTFOLIO, [])];
        let groupBys = [ColumnConstants.PORTFOLIO];
        if (node.level === 0 && !node.hasChildren()) {
            queryKeys = [new GroupByKey(ROOT_LEVEL)];
            groupBys = [];
        }
        childWidget.dataStore.data = {
            ...childWidget.dataStore.data,
            customVizConfig: {
                ...childWidget.dataStore.data.customVizConfig,
                queryKeys,
                leafLevels: [ColumnConstants.PORTFOLIO],
                groupBys
            }
        };
    }
}
