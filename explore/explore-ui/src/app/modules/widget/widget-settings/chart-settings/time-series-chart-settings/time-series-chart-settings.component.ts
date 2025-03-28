import {Component} from '@angular/core';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {AuxCheckboxChangedDetailInterface, AuxRadioGroupChangedDetailInterface, AuxRadioInterface} from '@blk/aladdin-angular-components';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {CommonConstants} from '@constants/common.constants';
import {MultiOverrideDateSettings, WidgetConfigType, WidgetDisplayInputConfigType} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {isUndefined} from 'lodash';
import {COMPARE_MODE_VALUE, COMPARE_MODE_PERCENT} from '../../factor-data-settings/factor-data.constants';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';

@Component({
    selector: 'app-time-series-chart-settings',
    templateUrl: './time-series-chart-settings.component.html',
    styleUrls: ['./time-series-chart-settings.component.scss', '../chart-settings.component.scss']
})
/**
 * Component for the Time Series Chart Settings
 */
export class TimeSeriesChartSettingsComponent extends BaseWidgetSettingComponent<TimeSeriesSettings> {
    // max number of periods that factor time series spritelet can display
    readonly FACTOR_TIME_SERIES_MAX_PERIODS: number = 12;

    readonly WidgetConfigType = WidgetConfigType;

    // Classes used in html
    readonly CLASSNAME_FACTOR_ALIGN_ELEMENTS = 'align-elements';
    readonly CLASSNAME_FACTOR_CHART_TYPE_STYLE = 'chart-type-style';
    readonly CLASSNAME_DATE = 'ts-settings-outer-div ts-settings-mod-div';
    readonly CLASSNAME_DATE_FORMAT = 'ts-settings-outer-div ts-settings-main-div';
    readonly CLASSNAME_CHART_TYPE_STYLE = 'ts-settings-main-div';

    readonly chartTypes = [
        { label : 'Line', value : 'line' },
        { label : 'Bar', value : 'bar' },
    ];

    multiOverrideDateSettings: MultiOverrideDateSettings;
    chartTypeOptions: AuxRadioInterface[] = [];
    showTotalLine: boolean;
    showBaseline: boolean;
    dateFormat: string;
    totalSelectionEnabled: boolean;
    baselineSelectionEnabled: boolean;
    showDataMarker: boolean;
    isFactorDataWidget: boolean;
    maxNumberOfPeriodsOverride: number;
    showAppendReportDate: boolean;
    compareModeOptions: AuxRadioInterface[] = [];

    classNameForMultiOverrideDate: string;
    classNameForDateFormatDropdown: string;
    classNameForChartTypeDiv: string;
    classNameForChartTypeLabel: string;

    gridLines: GridLines;

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.initializeDefaultTimeSeriesSettings();
        this.initializeFactorDataDependentVariables();

        this.gridLines = this.inputs.get(WidgetDisplayInputConfigType.SHOW_GRID_LINES) as GridLines;
    }

    private initializeFactorDataDependentVariables(): void {
        this.isFactorDataWidget = this.widgetType === WidgetConfigType.FACTOR_DATA;
        this.maxNumberOfPeriodsOverride = (this.widgetType === WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES)
            ? this.FACTOR_TIME_SERIES_MAX_PERIODS : undefined;

        this.showAppendReportDate = !this.isFactorDataWidget;
        this.classNameForMultiOverrideDate = this.isFactorDataWidget ? this.CLASSNAME_FACTOR_ALIGN_ELEMENTS : this.CLASSNAME_DATE;
        this.classNameForDateFormatDropdown = this.isFactorDataWidget ? this.CLASSNAME_FACTOR_ALIGN_ELEMENTS : this.CLASSNAME_DATE_FORMAT;
        this.classNameForChartTypeDiv = this.isFactorDataWidget ? this.CLASSNAME_FACTOR_ALIGN_ELEMENTS : '';
        this.classNameForChartTypeLabel = this.isFactorDataWidget ? this.CLASSNAME_FACTOR_CHART_TYPE_STYLE : this.CLASSNAME_CHART_TYPE_STYLE;
        this.initializeCompareModeOptions();
    }

    /**
     * Initializes default time series Settings
     */
    initializeDefaultTimeSeriesSettings(): void {
        this.multiOverrideDateSettings = new MultiOverrideDateSettings(this.widgetInput.frequency, this.widgetInput.periods, undefined, undefined, this.widgetInput.appendReportDate);
        this.initializeChartTypeOptions();
        this.showTotalLine = this.widgetInput.includeTotalValues;
        this.showBaseline = this.widgetInput.showBaseline;
        this.dateFormat = this.widgetInput.dateFormat;
        this.totalSelectionEnabled = this.isTotalSelectionEnabled();
        this.baselineSelectionEnabled = this.isBaselineSelectionEnabled();
        this.showDataMarker = this.widgetInput.showDataMarker;
    }

    /**
     * Initialize the chart type options
     */
    private initializeChartTypeOptions(): void {
        this.chartTypeOptions = this.chartTypes.map(option => {
            return {
                label: option.label,
                eventData: option.value,
                checked: this.widgetInput.chartType === option.value,
            };
        });
    }

    /**
     * Initialize the comparison mode options in case of Factor Data Widget
     */
    private initializeCompareModeOptions(): void {
        const compareModes = [
            { label : 'Percentage', value : COMPARE_MODE_PERCENT },
            { label : 'Value', value : COMPARE_MODE_VALUE },
        ];
        if (isUndefined(this.widgetInput.compareMode)) {
            this.widgetInput.compareMode = compareModes[0].value;
        }
        this.compareModeOptions = compareModes.map(option => {
            return {
                label: option.label,
                eventData: option.value,
                checked: this.widgetInput.compareMode === option.value,
            };
        });
    }

    /**
     * Chart type change handler
     */
    onChartTypeChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.widgetInput.chartType = event.detail.value.eventData;
    }

    /**
     * Comparison mode change handler
     */
    onCompareModeChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.widgetInput.compareMode = event.detail.value.eventData;
    }

    /**
     * On toggle changed
     */
    onToggleChanged(): void {
        this.widgetInput.compareModeToggle = !this.widgetInput.compareModeToggle;
        if (!this.widgetInput.compareModeToggle) {
            this.initializeCompareModeOptions();
        }
    }

    /**
     * is Show Total Line Checkbox handler, when no breakdown is applied, should be disabled
     */
    isTotalSelectionEnabled() {
        if (this.widgetType === WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES) {
            // disable total line checkbox for factor time series spritelet launched at lowest level
            const factorPathInput: FactorPathInput = this.inputs.get(FactorPathInput.configType) as FactorPathInput;
            return !factorPathInput.isFactorTimeSeriesLeafLevelPath();
        } else {
            const breakdown: Breakdown = this.inputs ? this.inputs.get(CommonConstants.CONFIG_TYPE.BREAKDOWN_TREE) as Breakdown : undefined;
            return breakdown && !breakdown.isEmpty();
        }
    }

    /**
     * is Show baseline Checkbox handler, when no breakdown is applied, should be disabled.
     * TODO: confirm if condition is the same as total line
     */
    isBaselineSelectionEnabled() {
        return this.isTotalSelectionEnabled();
    }

    /**
     * Show Total Value change handler
     */
    onShowTotalValueChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.includeTotalValues = event.detail.value.checked;
        this.showTotalLine = this.widgetInput.includeTotalValues;
    }

    /**
     * Show Total Value change handler
     */
    onShowDataMarkerChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.showDataMarker = event.detail.value.checked;
        this.showDataMarker = this.widgetInput.showDataMarker;
    }

    /**
     * Show Total Value change handler
     */
    onShowBaselineValueChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.showBaseline = event.detail.value.checked;
        this.showBaseline = this.widgetInput.showBaseline;
    }

    /**
     * When user is trying to change Frequency or Observation this function get called to update the values
     */
    onMultiOverrideDateSettingsChange(): void {
        this.widgetInput.frequency = this.multiOverrideDateSettings.multiOverrideDateTypeFrequency;
        this.widgetInput.periods = this.multiOverrideDateSettings.numberOfObservations;
        this.widgetInput.appendReportDate = this.multiOverrideDateSettings.appendReportDate;
    }

    /**
     * Update the selected date-format option
     */
    updateDateFormatValue(selectedDateFormat: string) {
        this.widgetInput.dateFormat = selectedDateFormat;
    }
}
