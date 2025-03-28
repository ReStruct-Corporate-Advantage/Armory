import {AbstactReturnDrillDownSpriteletLauncherService} from './abstact-return-drill-down-spritelet-launcher.service';
import {Widget} from '../../../models/widget/widget.model';
import {Observable, of} from 'rxjs';
import {PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {Injectable} from '@angular/core';
import {WidgetUtils} from '@utils/widget.utils';
import {ColumnSet} from '@blk/explore-ui-column-option';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a Return Time Series Drill down Spritelet widget
 */
export class ReturnDrillDownTimeSeriesSpriteletLauncherService extends AbstactReturnDrillDownSpriteletLauncherService {

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletColumns(Widget)
     */
    getSpriteletColumns(widget: Widget): Observable<ColumnSet> {
        return of(WidgetUtils.getTimeSeriesSpriteletColumns(widget.dataStore.parentDataStore.metaData.inputs.get('columns') as ColumnSet));
    }

    /**
     * AbstactReturnSpriteletLauncherService.getTitlePrefix()
     */
    getTitlePrefix(): string {
        return PerformanceConstants.DETAILS_LABEL;
    }

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletType()
     */
    getSpriteletType(): WidgetConfigType {
        return WidgetConfigType.RETURNS_DRILLDOWN_TIME_SERIES;
    }

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletActionKey()
     */
    getSpriteletActionKey(): string {
        return PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_TIME_SERIES;
    }
}
