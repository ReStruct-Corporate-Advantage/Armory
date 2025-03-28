import {Component, Input, OnInit} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {PgsStackedBarChartSettingsModel} from '@models/widget/inputs/chart-settings/pgs-stacked-bar-chart-settings.model';
import {WidgetInput, ChartWidgetInputConfigType} from '@blk/explore-ui-core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-pgs-stacked-bar-chart-settings',
    templateUrl: './pgs-stacked-bar-chart-settings.component.html'
})

/**
 * Component for PGS bar chart stacked breakdown settigs
 */
export class PgsStackedBarChartSettingsComponent extends BaseWidgetSettingComponent<PgsStackedBarChartSettingsModel> implements OnInit {
    @Input()
    inputs: Map<string, WidgetInput>;
    isDisabled: boolean;
    isStackedBarChart: boolean;
    widgetInput: PgsStackedBarChartSettingsModel;
    breakdownOrientationOptions: Array<AuxRadioInterface> = [];

    ngOnInit(): void {
        this.widgetInput = this.inputs.get(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS) as PgsStackedBarChartSettingsModel;
        this.isStackedBarChart = this.widgetInput.isStackedBarChart;
        this.initializeBreakdownOrientationOptions();
    }

    initializeComponent(): void {
        this.isStackedBarChart = (this.getInput(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS) as PgsStackedBarChartSettingsModel).isStackedBarChart;
        this.isDisabled = false;
    }

    /**
     * Radio button change handler
     */
    onRadioGroupChanged(option: AuxRadioInterface): void {
        this.isStackedBarChart = option.eventData;
        this.widgetInput.isStackedBarChart = this.isStackedBarChart;
    }

    initializeBreakdownOrientationOptions(): void {
        this.breakdownOrientationOptions = [
            {
                label: 'Horizontal breakdown',
                eventData: false,
                checked: !this.isStackedBarChart
            },
            {
                label: 'Stacked breakdown',
                eventData: true,
                checked: this.isStackedBarChart === true
            }
        ];
    }
}
