import {AbstractSpriteletLauncherService} from './abstract-spritelet-launcher.service';
import {Widget} from '../../../models/widget/widget.model';
import {SpriteletEvent} from '../../../models/spritelets/spritelet-event.model';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {WorkspaceStore} from '../../../stores';
import {GetContextMenuItemsParams, GetMainMenuItemsParams} from 'ag-grid-community';
import {ReportColumnService} from '@services/report-column/report-column.service';
import {ColumnConfig, ColumnConstants, UseType, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Base class for all returns widgets related spritelet launcher services
 */
export abstract class AbstractReturnSpriteletLauncherService extends AbstractSpriteletLauncherService {

    /**
     * AbstractSpriteletLauncherService.launchSpritelet(Widget, SpriteletEvent)
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent, callback: (any) => void): void {
        const report = WorkspaceStore.getCurrentReport();
        this.getSpriteletColumns(widget).subscribe((columnSet: ColumnSet) => {
                const params = event.params;
                const spriteletType = this.getSpriteletType();
                const spriteletWidget = new Widget(spriteletType);
                spriteletWidget.title = this.getWidgetTitle(widget, params);
                spriteletWidget.displayTitle = spriteletWidget.title;
                let parentDataStore = widget.dataStore;
                if (widget.dataStore.parentDataStore) {
                    parentDataStore = widget.dataStore.parentDataStore;
                }
                spriteletWidget.dataStore.parentDataStore = parentDataStore;
                spriteletWidget.dataStore.metaData.inputs.set('columns', columnSet);
                spriteletWidget.dataStore.isDependentOnParentForMetaData = true;
                spriteletWidget.showSettings = false;
                this.initializeSpritelet(spriteletWidget, params);

                this.addSpriteletWidgetToReport(widget, spriteletWidget, report);
                callback(undefined);
            });
    }

    protected getWidgetTitle(widget: Widget, params: GetContextMenuItemsParams | GetMainMenuItemsParams): string {
        const contextMenuParams = params as GetContextMenuItemsParams;

        // For root node, always return portfolio name
        if (contextMenuParams.node.level === 0) {
            const portfolio = WorkspaceStore.getCurrentPortfolio();
            return this.getTitlePrefix() + portfolio?.title;
        }

        if (contextMenuParams.node.data.title) {
            return this.getTitlePrefix() + contextMenuParams.node.data.title;
        }

        const widgetColSet = widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const descColumn = widgetColSet.columns.find((col) => ColumnConstants.PNL_SEC_DESC === col.columnTag);
        let hiddenDescColumn = null;
        if (!descColumn) {
            hiddenDescColumn = widget.dataStore.data.requestConfig.columns.find(col => (col.isHidden && ColumnConstants.PNL_SEC_DESC === col.columnTag));
        }
        const descColumnKey = descColumn ? descColumn.columnKey : hiddenDescColumn.columnKey;
        const title = contextMenuParams.node.data[descColumnKey] ? contextMenuParams.node.data[descColumnKey] : contextMenuParams.value;
        return this.getTitlePrefix() + title;
    }

    /**
     * Add Set of columns required for performance details Spritelet
     */
    protected getPerformanceDetailsSpriteletColumns(reportColumnService: ReportColumnService, reportName: string, addDateColumn?: boolean): Observable<ColumnSet> {
        return reportColumnService.getColumnListFromReport(reportName).pipe(map((columns: Array<ColumnConfig>): any => {
                const columnSet = new ColumnSet();
                columnSet.columns = columns;
                if (addDateColumn) {
                    columnSet.columns.unshift(ColumnConfig.createColumn(ColumnConstants.DATE, UseType.ALL, ColumnConstants.DATE));
                }
                return columnSet;
            })
        );
    }

    /**
     * Get column set for the newly launched spritelet widget
     */
    protected abstract getSpriteletColumns(widget: Widget): Observable<ColumnSet>;

    /**
     * Get title prefix for the spritelet widget title
     */
    protected abstract getTitlePrefix(): string;

    /**
     * Get config type of the spritelet widget to be launched
     */
    protected abstract getSpriteletType(): WidgetConfigType;

    /**
     * Initialize settings of the spritelet widget
     */
    protected abstract initializeSpritelet(spriteletWidget: Widget, params: GetContextMenuItemsParams | GetMainMenuItemsParams): void;
}
