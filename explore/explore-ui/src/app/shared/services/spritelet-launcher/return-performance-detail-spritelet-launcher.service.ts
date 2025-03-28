import {AbstractReturnSeriesSpriteletLauncherService} from './abstract-return-series-spritelet-launcher.service';
import {Widget} from '../../../models/widget/widget.model';
import {PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {ReportColumnService} from '../report-column/report-column.service';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {ColumnSet} from '@blk/explore-ui-column-option';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a Return Performance Details Spritelet widget
 */
export class ReturnPerformanceDetailSpriteletLauncherService extends AbstractReturnSeriesSpriteletLauncherService {

    /**
     * constructor
     */
    constructor(private reportColumnService: ReportColumnService) {
        super();
    }

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletColumns(Widget)
     */
    getSpriteletColumns(widget: Widget): Observable<ColumnSet> {
        return this.getPerformanceDetailsSpriteletColumns(this.reportColumnService, PerformanceConstants.PERFORMANCE_DETAILS_REPORT, true);
    }

    /**
     * AbstactReturnSpriteletLauncherService.getTitlePrefix()
     */
    getTitlePrefix(): string {
        return PerformanceConstants.PERFORMANCE_DETAILS_LABEL;
    }

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletType()
     */
    getSpriteletType(): WidgetConfigType {
        return WidgetConfigType.RETURNS_PERF_DETAIL;
    }

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletActionKey()
     */
    getSpriteletActionKey(): string {
        return PerformanceConstants.SPRITELET_EVENTS.RETURN_PERF_DETAILS;
    }
}
