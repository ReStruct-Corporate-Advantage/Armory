import {Component} from '@angular/core';
import {Breakdown, BreakdownBuilderSettings} from '@blk/explore-ui-breakdown';
import {CoreWidgetConfigStore, FavoriteType, WidgetConfigType} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';

/**
 * Component to define widget level breakdown settings
 */
@Component({
    selector: 'app-widget-level-breakdown-settings',
    templateUrl: './widget-level-breakdown-settings.component.html',
    styleUrls: ['./widget-level-breakdown-settings.scss']
})
export class WidgetLevelBreakdownSettingsComponent extends BaseWidgetSettingComponent<Breakdown> {
    breakdownBuilderSettings: BreakdownBuilderSettings;

    initializeComponent(): void {
        this.breakdownBuilderSettings = new BreakdownBuilderSettings();
        this.breakdownBuilderSettings.columnFilter = this.widgetConfigInput.groupByColumnFilters;
        this.breakdownBuilderSettings.customSectorColumnFilter = this.widgetConfigInput.customColumnFilters;
        this.breakdownBuilderSettings.fieldToUse = this.widgetConfigInput.valueField;
        this.breakdownBuilderSettings.inputName = this.widgetConfigInput.inputName;
        this.breakdownBuilderSettings.favoriteType = this.favoriteType;
        this.breakdownBuilderSettings.favoriteFolderType = this.favoriteFolderType;
        this.breakdownBuilderSettings.widgetType = this.widgetType;
        this.breakdownBuilderSettings.showFundSectoringTabs = !this.widgetConfigInput.hideFundSectoringTabs;
        this.breakdownBuilderSettings.includeNoBreakdownOption = this.widgetConfigInput.includeNoBreakdown;
        this.breakdownBuilderSettings.includePerformanceBreakdown = CoreWidgetConfigStore.getChartConfigForType(this.widgetType).includePerformanceBreakdown;
        this.breakdownBuilderSettings.restrictBreakdownToSingleLevel = CoreWidgetConfigStore.getChartConfigForType(this.widgetType).restrictBreakdownToSingleLevel;
        if (this.breakdownBuilderSettings.widgetType === WidgetConfigType.PRA && this.breakdownBuilderSettings.favoriteType === FavoriteType.FACTOR_BREAKDOWN) {
            this.breakdownBuilderSettings.includeNoBreakdownOption = false;
        }
    }

}
