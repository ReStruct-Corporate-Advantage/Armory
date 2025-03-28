import {Component} from '@angular/core';
import {ReturnChartStyleSettingsModel} from '@models/widget/inputs/chart-settings/return-chart-style-settings.model';
import {AuxCheckboxChangedDetailInterface, AuxCheckboxInterface} from '@blk/aladdin-angular-components';
import {CommonConstants} from '@constants/index';
import {ExploreCheckbox} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';

@Component({
    selector: 'app-return-chart-style-settings',
    templateUrl: './return-chart-style-settings.component.html',
    styleUrls: ['./return-chart-style-settings.component.scss', '../chart-settings.component.scss']
})

export class ReturnChartStyleSettingsComponent extends BaseWidgetSettingComponent<ReturnChartStyleSettingsModel> {

    stackedStyleOptions: AuxCheckboxInterface[] = [];

    showBaseline: boolean;
    showDataMarker: boolean;

    /**
     * Initialize required fields
     */
    initializeComponent(): void {
        this.stackedStyleOptions = [new ExploreCheckbox(CommonConstants.PORTFOLIO, this.widgetInput.showPortfolio, false),
            new ExploreCheckbox(CommonConstants.BENCHMARK, this.widgetInput.showBenchmark, false),
            new ExploreCheckbox(CommonConstants.ACTIVE, this.widgetInput.showActive, false),
            new ExploreCheckbox(CommonConstants.PORTFOLIO_CUMULATIVE, this.widgetInput.showPortfolioCumulative, false),
            new ExploreCheckbox(CommonConstants.BENCHMARK_CUMULATIVE, this.widgetInput.showBenchmarkCumulative, false),
            new ExploreCheckbox(CommonConstants.ACTIVE_CUMULATIVE, this.widgetInput.showActiveCumulative, false)
        ];

        this.showBaseline = this.widgetInput.showBaseline;
        this.showDataMarker = this.widgetInput.showDataMarker;
    }

    /**
     * Update value of checkboxes, based on their label
     * @param value
     */
    updateStyleOptions(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        const checkboxValue = event.detail.value.checked;

        switch (event.detail.value.label) {
            case CommonConstants.PORTFOLIO :
                this.widgetInput.showPortfolio = checkboxValue;
                break;
            case CommonConstants.BENCHMARK :
                this.widgetInput.showBenchmark = checkboxValue;
                break;
            case CommonConstants.ACTIVE :
                this.widgetInput.showActive = checkboxValue;
                break;
            case CommonConstants.PORTFOLIO_CUMULATIVE :
                this.widgetInput.showPortfolioCumulative = checkboxValue;
                break;
            case CommonConstants.BENCHMARK_CUMULATIVE :
                this.widgetInput.showBenchmarkCumulative = checkboxValue;
                break;
            case CommonConstants.ACTIVE_CUMULATIVE :
                this.widgetInput.showActiveCumulative = checkboxValue;
                break;
        }
    }

    /**
     * Update the selected date-format option
     * @param selectedDateFormat
     */
    updateDateFormatValue(selectedDateFormat: string) {
        this.widgetInput.dateFormat = selectedDateFormat;
    }

    /**
     * Show Total Value change handler
     */
    onShowBaselineValueChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.showBaseline = event.detail.value.checked;
        this.showBaseline = this.widgetInput.showBaseline;
    }
    /**
     * Show Data Markers Value change handler
     */
    onShowDataMarkerValueChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.showDataMarker = event.detail.value.checked;
        this.showDataMarker = this.widgetInput.showDataMarker;
    }
}
