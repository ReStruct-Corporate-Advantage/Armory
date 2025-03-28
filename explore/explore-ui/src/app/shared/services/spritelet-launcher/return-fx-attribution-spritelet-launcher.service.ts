import {Widget} from '../../../models/widget/widget.model';
import {PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {ReportColumnService} from '../report-column/report-column.service';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AbstractReturnSpriteletLauncherService} from '@services/spritelet-launcher/abstract-return-spritelet-launcher.service';
import {GetContextMenuItemsParams, GetMainMenuItemsParams} from 'ag-grid-community';
import {ColumnSet} from '@blk/explore-ui-column-option';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a Return Fx Attribution Spritelet widget
 */
export class ReturnFXAttributionSpriteletLauncherService extends AbstractReturnSpriteletLauncherService {

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
        return this.getPerformanceDetailsSpriteletColumns(this.reportColumnService, PerformanceConstants.FX_ATTRIBUTION_REPORT, true);
    }

    /**
     * AbstactReturnSpriteletLauncherService.getTitlePrefix()
     */
    getTitlePrefix(): string {
        return PerformanceConstants.PERFORMANCE_DETAILS_LABEL;
    }

    /**
     * AbstactReturnSpriteletLauncherService.getWidgetTitle(GetContextMenuItemsParams | GetMainMenuItemsParams)
     */
    protected getWidgetTitle(widget: Widget, params: GetContextMenuItemsParams | GetMainMenuItemsParams): string {
        return this.getTitlePrefix() + PerformanceConstants.FX_ATTRIBUTION_TITLE;
    }

    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletType()
     */
    getSpriteletType(): WidgetConfigType {
        return WidgetConfigType.RETURNS_FX_ATTRIBUTION;
    }
    /**
     * AbstactReturnSpriteletLauncherService.getSpriteletActionKey()
     */
    getSpriteletActionKey(): string {
        return PerformanceConstants.SPRITELET_EVENTS.RETURN_FX_ATTRIBUTION;
    }

    /**
     * AbstactReturnSpriteletLauncherService.initializeSpritelet(Widget, GetContextMenuItemsParams | GetMainMenuItemsParams)
     */
    protected initializeSpritelet(spriteletWidget: Widget, params: GetContextMenuItemsParams | GetMainMenuItemsParams): void {
    }
}
