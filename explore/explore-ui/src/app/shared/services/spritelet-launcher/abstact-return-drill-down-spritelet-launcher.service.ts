import {CalendarDateUtils, PerformanceSettings, PerformanceTimePeriod, TimePeriodShortName} from '@blk/explore-ui-core';
import {GetContextMenuItemsParams, GetMainMenuItemsParams} from 'ag-grid-community';
import {Widget} from '../../../models/widget/widget.model';
import {AbstractReturnSpriteletLauncherService} from './abstract-return-spritelet-launcher.service';

/**
 * Base class for all the Return Drill down spritelet launch events that are invoked from a Return Spritelet Time Series or Performance Details widget
 */
export abstract class AbstactReturnDrillDownSpriteletLauncherService extends AbstractReturnSpriteletLauncherService {

    /**
     * AbstactReturnSpriteletLauncherService.initializeSpritelet(Widget, GetContextMenuItemsParams | GetMainMenuItemsParams)
     */
    protected initializeSpritelet(spriteletWidget: Widget, params: GetContextMenuItemsParams | GetMainMenuItemsParams): void {
        const performanceSettings = new PerformanceSettings();
        performanceSettings.parentPerformanceSettings = spriteletWidget.dataStore.parentDataStore.metaData.inputs.get('performanceSettings') as PerformanceSettings;
        performanceSettings.timePeriod = new PerformanceTimePeriod();
        performanceSettings.timePeriod.shortName = TimePeriodShortName.CUSTOM;
        performanceSettings.timePeriod.numberOfPeriods = 1;
        const value = (params as GetContextMenuItemsParams).value;
        performanceSettings.timePeriod.fromDateValue = CalendarDateUtils.getDateInAladdinFormat(value, 1, 'day');
        performanceSettings.timePeriod.toDateValue = value;
        spriteletWidget.dataStore.metaData.inputs.set('performanceSettings', performanceSettings);
    }

    protected getWidgetTitle(widget: Widget, params: GetContextMenuItemsParams | GetMainMenuItemsParams): string {
        const contextMenuParams = params as GetContextMenuItemsParams;
        return this.getTitlePrefix() + (contextMenuParams.node.data.title ? contextMenuParams.node.data.title : contextMenuParams.value);
    }
}
