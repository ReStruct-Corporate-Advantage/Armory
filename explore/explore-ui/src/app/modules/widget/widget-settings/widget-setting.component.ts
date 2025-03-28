import {Component, Input} from '@angular/core';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {CoreFavoriteConstants, DateStore, TokenConstants, TokenUtils, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent, LiquidityStore} from '@blk/explore-ui-column-option';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {PerformanceAttributionSettingsService} from '../../performance-settings/services/performance-attribution-settings.service';
import {PerformanceTimePeriodSettingsService} from '../../performance-settings/services/performance-time-period-settings.service';

/**
 * Component representing each individual widget setting corresponding to an widgetInput in widgetInput categories in the widget config
 * This component is only used as a shell/proxy component that delegates to the ACTUAL widget setting components like column, filter, etc.
 * The template just holds a container with switch cases for the actual component to be used
 */
@Component({
    selector: 'app-widget-setting',
    templateUrl: './widget-setting.component.html'
})
export class WidgetSettingComponent extends BaseWidgetSettingComponent<WidgetInput> {

    // data store for the current widget
    @Input() widgetDataStore: WidgetDataStore;

    // if current widget is a child spritelet, the parent widget's inputs
    parentInputs: Map<string, WidgetInput>;

    portfolio: Portfolio;

    readonly customCalcFavoriteType = CoreFavoriteConstants.CUSTOM_CALC_COLUMN;

    readonly WidgetInputType = WidgetInputType;

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        // if this is a child spritelet widget, take the parent widget's inputs as some widget settings are dependent
        if (this.widgetDataStore?.isDependentOnParentForData || this.widgetDataStore?.isDependentOnParentForMetaData) {
            this.parentInputs = this.widgetDataStore.parentDataStore.metaData.inputs;
        }
        this.portfolio = WorkspaceStore.getCurrentPortfolio();
        this.setPortfolioContextForColumnOptions();
    }

    /**
     * The libraries (ExploreUiCore and ExploreUiColumnOption) do not know about Portfolio
     * Set portfolio context for column options
     */
    setPortfolioContextForColumnOptions(): void {
        // For PerformanceColumnOption
        PerformanceTimePeriodSettingsService.portfolio = this.portfolio;
        PerformanceAttributionSettingsService.portfolioAssetType = this.portfolio.assetType;

        // For LiquiditySettingsColumnOption
        LiquidityStore.liquidityDefaults = this.portfolio.portfolioDefaults?.liquidityDefaults;

        // For OverrideDateColumnOption and TimeSeriesChartSettings
        DateStore.updateMultiFrequencyMaxPeriodsMap(this.portfolio.multiFrequencyMaxPeriodsMap);
    }

    protected readonly TokenUtils = TokenUtils;
    protected readonly TokenConstants = TokenConstants;
}
