import {Component} from '@angular/core';
import {RiskAndExposureAdditionalSettings} from '../../../../models/widget/inputs/risk-and-exposure-additional-settings.model';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';

/**
 * A component for the display settings in the Risk and Exposure widget.
 * @example
 *     <app-risk-exposure-settings *ngSwitchCase="'riskAndExposureAdditionalSettings'"
 *                                 [widgetConfigInput]="widgetConfigInput"
 *                                 [inputs]="inputs">
 *     </app-risk-exposure-settings>
 */
@Component({
    selector: 'app-risk-exposure-settings',
    templateUrl: './risk-and-exposure-settings.component.html'
})
export class RiskAndExposureSettingsComponent extends BaseWidgetSettingComponent<RiskAndExposureAdditionalSettings> {
    benchmarkPositionAggregationTypes: ExploreSelectOptionGroup[];
    portfolioPositionAggregationTypes:  ExploreSelectOptionGroup[];
    closedPositionAggregationTypes:  ExploreSelectOptionGroup[];

    private defaultAggregationTypes:  ExploreSelectOptionGroup;

    /**
     * Creates a new instance
     */
    constructor() {
        super();
    }

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.initializeDefaultAggregationTypes();

        // Set benchmark position agg types
        this.benchmarkPositionAggregationTypes = this.getAggregationTypes(this.widgetInput.benchmarkPositionAggregationType, this.widgetConfigInput.default.benchmarkPositionAggregationType);

        // Set portfolio position agg types
        this.portfolioPositionAggregationTypes = this.getAggregationTypes(this.widgetInput.portfolioPositionAggregationType, this.widgetConfigInput.default.portfolioPositionAggregationType);

        // Set closed position agg types
        this.closedPositionAggregationTypes = this.getAggregationTypes(this.widgetInput.closedPositionAggregationType, this.widgetConfigInput.default.closedPositionAggregationType, true);
    }

    /**
     * Assigns a collection of the aggregation types to the given aggregationTypes.
     * @param aggType type to select
     * @param defaultAggType type to select if the given aggType is undefined
     */
    private getAggregationTypes(aggType: string, defaultAggType: string, removeExclude?: boolean): ExploreSelectOptionGroup[] {
        const selectedAggType: string = aggType ? aggType : defaultAggType;

        const items = [new ExploreSelectOptionGroup()];
        // dropdown common for all options NONE, SINGLE, ROW GROUP
        // for benchmark and portfolio dropdowns we need to keep EXCLUDE option in dropdown
        items[0].values = this.defaultAggregationTypes.values
            .filter(defaultAggregationType => !(removeExclude && defaultAggregationType.value === 'EXCLUDE'))
            .map(defaultAggregationType  => new ExploreSelectOption(defaultAggregationType.displayValue, defaultAggregationType.value, defaultAggregationType.value === selectedAggType));
        return items;
    }

    /**
     * Initializes default aggregation types
     */

    initializeDefaultAggregationTypes(): void {
        this.defaultAggregationTypes = new ExploreSelectOptionGroup();
        this.defaultAggregationTypes.values.push(new ExploreSelectOption('None', 'NONE'));
        this.defaultAggregationTypes.values.push(new ExploreSelectOption('Single Row', 'SINGLE_ROW'));
        this.defaultAggregationTypes.values.push(new ExploreSelectOption('Group', 'GROUP'));
        this.defaultAggregationTypes.values.push(new ExploreSelectOption('Exclude', 'EXCLUDE'));
    }

    /**
     * Sets benchmarkPositionAggregationType to the given one
     * @param benchmarkPositionAggregationType a benchmarkPositionAggregationType to set to
     */
    setBenchmarkPositionAggregationType(benchmarkPositionAggregationType: string) {
        this.widgetInput.benchmarkPositionAggregationType = benchmarkPositionAggregationType;
    }

    /**
     * Sets portfolioPositionAggregationType to the given one
     * @param portfolioPositionAggregationType a portfolioPositionAggregationType to set to
     */
    setPortfolioPositionAggregationType(portfolioPositionAggregationType: string) {
        this.widgetInput.portfolioPositionAggregationType = portfolioPositionAggregationType;
    }

    /**
     * Sets closedPositionAggregationType to the given one
     * @param closedPositionAggregationType a closedPositionAggregationType to set to
     */
    setClosedPositionAggregationType(closedPositionAggregationType: string) {
        this.widgetInput.closedPositionAggregationType = closedPositionAggregationType;
    }
}
