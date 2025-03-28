import {AbstractReturnSeriesSpriteletLauncherService} from './abstract-return-series-spritelet-launcher.service';
import {ColumnConfig, PerformanceConstants, UseType, WidgetConfigType, ColumnConstants} from '@blk/explore-ui-core';
import {Observable, of} from 'rxjs';
import {Widget} from '@models/widget/widget.model';
import {Injectable} from '@angular/core';
import {WidgetUtils} from '@utils/widget.utils';
import {ColumnSet} from '@blk/explore-ui-column-option';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a Return Time Series Spritelet widget
 */
export class ReturnTimeSeriesSpriteletLauncherService extends AbstractReturnSeriesSpriteletLauncherService {
    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletColumns(Widget)
     */
    protected getSpriteletColumns(widget: Widget): Observable<ColumnSet> {
        const columns = WidgetUtils.getTimeSeriesSpriteletColumns(widget.dataStore.metaData.inputs.get('columns') as ColumnSet);
        columns.columns.unshift(ColumnConfig.createColumn(ColumnConstants.DATE, UseType.ALL, ColumnConstants.DATE));
        return of(columns);
    }

    /**
     * AbstactReturnSpriteletLauncherService.getTitlePrefix()
     */
    protected getTitlePrefix(): string {
        return PerformanceConstants.TIME_SERIES_LABEL;
    }

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletType()
     */
    protected getSpriteletType(): WidgetConfigType {
        return WidgetConfigType.RETURNS_TIME_SERIES;
    }

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletActionKey()
     */
    getSpriteletActionKey(): string {
        return PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES;
    }
}
