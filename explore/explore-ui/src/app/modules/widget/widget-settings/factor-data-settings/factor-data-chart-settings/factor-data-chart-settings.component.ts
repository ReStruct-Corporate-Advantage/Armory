import {ChangeDetectorRef, Component} from '@angular/core';
import {AuxRadioGroupChangedDetailInterface, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {BaseWidgetSettingComponent, ColumnOptionService, ColumnSet, SelectedColumnSelectorOption} from '@blk/explore-ui-column-option';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {isNil} from 'lodash';
import {
    ColumnConfig,
    ColumnType,
    ExploreRadioButton,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    FactorModelColumnDefinition
} from '@blk/explore-ui-core';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnUtils} from '@utils/column.utils';
import {WidgetConfigFactory} from '../../../../../factories';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {finalize, takeUntil} from 'rxjs/operators';
import {FactorTimeSeriesSelectedOption, FactorTimeSeriesUtil} from '@enums/factor-time-series-selected-option.enum';
import {FactorDataChartSettingsStore} from './stores/factor-data-chart-settings.store';
import {FactorDataRiskMatrixSettings} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {FactorDefinitionsService, ScenarioConstants} from '@blk/explore-ui-extended-column-option';
import {NotificationService} from '@services/notification';
import {CommonConstants} from '@constants/common.constants';

/**
 * Factor Data Widget - FactorDatChartSettingsComponent
 * renders the options to configure our factor data widget respective to time series or risk matrix mode
 */
@Component({
    selector: 'app-factor-data-chart-settings',
    templateUrl: './factor-data-chart-settings.component.html',
    styleUrls: ['./factor-data-chart-settings.component.scss']
})
export class FactorDataChartSettingsComponent extends BaseWidgetSettingComponent<FactorDataChartSettings> {

    readonly RiskSettingsColumnOptionKey = 'riskSettingsColumnSettings';
    public readonly COLUMN_TYPE = ColumnType;
    public readonly FACTOR_CHART_SETTINGS_STORE = FactorDataChartSettingsStore;

    isTimeSeriesMode: boolean;
    factorDataModes: ExploreRadioButton[];

    factorSelectedOption: FactorTimeSeriesSelectedOption;
    factorSelectOptions: ExploreSelectOptionGroup[];
    factorSelectOptionsForTimeSeries: ExploreSelectOptionGroup[];
    factorSelectOptionsForRiskMatrix: ExploreSelectOptionGroup[];

    columnOptionsFetched = false;
    isFactorDataLoaded = false;

    // For additional columnSet in case of TimeSeries Correlations and Regression Betas
    showAdditionalFactorSet = false;

    constructor(protected columnOptionService: ColumnOptionService, private changeDetectorRef: ChangeDetectorRef, protected factorDefinitionsService: FactorDefinitionsService, protected notificationService: NotificationService) {
        super();
    }

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        FactorDataChartSettingsStore.init();
        FactorDataChartSettingsStore.restrictedColumnOptions = this.restrictedColumnOptions;
        FactorDataChartSettingsStore.restrictedColumnOptionsForComparisonColumns = { sections: [ ...this.restrictedColumnOptions.sections, this.RiskSettingsColumnOptionKey ] };
        FactorDataChartSettingsStore.inputs = this.inputs;

        this.isTimeSeriesMode = this.widgetInput.isTimeSeriesMode;
        this.initializeFactorDataModes();
        this.initializeWidgetConfigInputs();
        this.initializeFactorSelectOptions();

        // To disable the Done button on WidgetSettingsModal when columnSets are empty
        FactorDataChartSettingsStore.isApplyButtonDisabled$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.isApplyButtonDisabled.value = this.isColumnSetEmpty() ? 1 : 0;
                this.changeDetectorRef.markForCheck();
            });

        this.updateFactorPermissions();
    }

    /**
     * Check whether columnSets present are empty
     * @private
     */
    private isColumnSetEmpty(): boolean {
        return ((FactorDataChartSettingsStore.inputs.get(ColumnType.COLUMNS) as ColumnSet).columns.length === 0)
            || (this.showAdditionalFactorSet && (FactorDataChartSettingsStore.inputs.get(ColumnType.FACTOR_COMPARISON_COLUMNS) as ColumnSet).columns.length === 0);
    }

    private initializeFactorDataModes(): void {
        const factorDataModeOptions = [
            { label: 'Risk matrix', eventData: false },
            { label: 'Time series', eventData: true },
        ];
        this.factorDataModes = factorDataModeOptions.map(mode => new ExploreRadioButton(mode.label, this.widgetInput.isTimeSeriesMode === mode.eventData, false, mode.eventData));
    }

    /**
     * Initialize the factorSelectOptions list based on isTimeSeriesMode.
     * This method is called by initializeComponent
     * @private
     */
    private initializeFactorSelectOptions(): void {
        const timeSeriesValues = [
            FactorTimeSeriesSelectedOption.FACTOR_LEVELS,
            FactorTimeSeriesSelectedOption.FACTOR_RETURNS,
            FactorTimeSeriesSelectedOption.CUMULATIVE_RETURNS,
            FactorTimeSeriesSelectedOption.VOLATILITIES,
            FactorTimeSeriesSelectedOption.CORRELATIONS,
            FactorTimeSeriesSelectedOption.REGRESSION_BETAS,
        ];
        const riskMatrixValues = [
            FactorTimeSeriesSelectedOption.CORRELATIONS,
            FactorTimeSeriesSelectedOption.REGRESSION_BETAS
        ];

        const timeSeriesDisplayValues = timeSeriesValues.map(option => FactorTimeSeriesUtil.getDisplayName(option));
        const riskMatrixDisplayValues = riskMatrixValues.map(option => FactorTimeSeriesUtil.getDisplayName(option));

        this.factorSelectOptionsForTimeSeries = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(timeSeriesValues, timeSeriesDisplayValues, this.widgetInput.factorTimeSeriesSelectedOption);
        this.factorSelectOptionsForRiskMatrix = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(riskMatrixValues, riskMatrixDisplayValues, this.widgetInput.factorTimeSeriesSelectedOption);

        this.factorSelectOptions = this.isTimeSeriesMode ? this.factorSelectOptionsForTimeSeries : this.factorSelectOptionsForRiskMatrix;
        this.updateFactorSelectedOption(this.widgetInput.factorTimeSeriesSelectedOption);
    }

    /**
     * Update the factorSelectOptions list based on isTimeSeriesMode and sets the default selected option on this list.
     * This method is called only by onFactorDataModeChanged
     * @private
     */
    private updateFactorSelectOptions(): void {
        this.factorSelectOptions = this.isTimeSeriesMode ? this.factorSelectOptionsForTimeSeries : this.factorSelectOptionsForRiskMatrix;
        this.factorSelectOptions[0].values.forEach(option => option.isSelected = false );
        this.factorSelectOptions[0].values[0].isSelected = true;
        this.updateFactorSelectedOption(this.factorSelectOptions[0].values[0].value);
    }

    /**
     * Called when this.factorSelectedOption is updated
     * This method updates particular settings based on new factorSelectedOption
     * @param value
     * @private
     */
    private updateFactorSelectedOption(value: FactorTimeSeriesSelectedOption): void {
        this.factorSelectedOption = value;
        this.widgetInput.factorTimeSeriesSelectedOption = value;
        this.updateFactorTitlesOnModeChanged();
        this.updateHideRiskSettingsFlag();
        this.setShowAdditionalFactorSet();
        FactorDataChartSettingsStore.isApplyButtonDisabled$.next(true);
        FactorDataChartSettingsStore.factorTimeSeriesSelectedOption.next(this.factorSelectedOption);
        FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).next(true);
        FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.FACTOR_COMPARISON_COLUMNS).next(this.showAdditionalFactorSet);
    }

    private updateFactorTitlesOnModeChanged(): void {
        const showFactorLevelPermissionColumn = ColumnUtils.checkToShowFactorLevelPermissionColumn(this.widgetInput.factorTimeSeriesSelectedOption);

        if (showFactorLevelPermissionColumn) {
            return;
        }

        const columns = (FactorDataChartSettingsStore.inputs.get(ColumnType.COLUMNS) as ColumnSet)?.columns;
        columns?.filter(column => column.columnTitle.includes(ScenarioConstants.NO_PERMISSION_TITLE, 0)).forEach(column => {
            column.columnTitle = column.columnTitle.replace(ScenarioConstants.NO_PERMISSION_TITLE, CommonConstants.EMPTY_STRING);
            // Adding in map to reflect the permission again when showFactorLevelPermissionColumn is true
            FactorDataChartSettingsStore.factorTagToPermissionMap.set(column.columnTag, 'N');
        });
    }

    /**
     * This method will hide risk settings column option for below cases,
     * Case 1: Risk Matrix mode - every option
     * Case 2: Time Series mode - Factor Levels, Factor Returns, Cumulative Returns
     * and fetches the column options accordingly
     * @private
     */
    private updateHideRiskSettingsFlag(): void {
        const hideColumnRiskSettings = ColumnUtils.checkToHideColumnRiskSettingsFactorDataWidget(this.isTimeSeriesMode, this.factorSelectedOption);
        FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(ColumnType.COLUMNS).next(hideColumnRiskSettings);
        const riskSettingsOptionIndex: number = FactorDataChartSettingsStore.restrictedColumnOptions.sections.findIndex(value => value === this.RiskSettingsColumnOptionKey);

        if (hideColumnRiskSettings && riskSettingsOptionIndex === -1) {
            FactorDataChartSettingsStore.restrictedColumnOptions.sections.push(this.RiskSettingsColumnOptionKey);
        } else if (!hideColumnRiskSettings && riskSettingsOptionIndex !== -1)  {
            FactorDataChartSettingsStore.restrictedColumnOptions.sections.splice(riskSettingsOptionIndex, 1);
        }
        this.initializeColumnOptionValues();
    }

    /**
     * Update column with derived settings and
     * initialises the FxFactorOptionsColumnOption.fxCrossCurrency to portfolio currency
     */
    updateColumnWithDerivedSettings = (column: ColumnConfig) => {
        ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(column, WorkspaceStore.getCurrentPortfolio(), FactorDataChartSettingsStore.inputs, this.widgetType);
        ColumnUtils.updateFxFactorColumn(column, WorkspaceStore.getCurrentPortfolio());
        const riskSettings = column.optionValues.find(optionValue => optionValue.configType === CoreRiskConstants.RISK_SETTINGS) as RiskSettings;
        if (riskSettings) {
            riskSettings.setSettingsSource(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
        }
    };

    private initializeColumnOptionValues() {
        const columnSet = FactorDataChartSettingsStore.inputs.get(ColumnType.COLUMNS) as ColumnSet;
        if (isNil(columnSet)) {
            return;
        }
        const columns = columnSet.columns;
        const columnSelectorOptions = columns.map(col =>
            new SelectedColumnSelectorOption(col, null)
        );
        // To let columnsOptions being fetched and set on the factors table properly.
        this.columnOptionsFetched = false;
        this.isApplyButtonDisabled.value++;

        this.columnOptionService.fetchAndPopulateColumnOptions$(
            columnSelectorOptions,
            [],
            FactorDataChartSettingsStore.restrictedColumnOptions,
            this.updateColumnWithDerivedSettings.bind(this))
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((populatedColumns) => {
                    for (let i = 0; i < columns.length; i++) {
                        columns[i].optionValues = populatedColumns[i].column.optionValues;
                    }
                    (FactorDataChartSettingsStore.inputs.get(ColumnType.COLUMNS) as ColumnSet).columns = columns;
                },
                () => {
                    console.error('Error fetching factor column options');
                },
                () => {
                    this.columnOptionsFetched = true;
                    this.isApplyButtonDisabled.value--;
                    this.changeDetectorRef.markForCheck();
                }
            );
    }

    /**
     * mode switched between TimeSeries and RiskMatrix
     * @param event
     */
    onFactorDataModeChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (event?.detail?.value && event.detail.value.eventData !== this.isTimeSeriesMode) {
            this.isTimeSeriesMode = event.detail.value.eventData;
            this.widgetInput.isTimeSeriesMode = this.isTimeSeriesMode;
            this.initializeSettingsBasedOnTimeSeriesMode();
            this.updateFactorSelectOptions();
        }
    }

    /**
     * factorSelectedOption changed from aux-select
     * @param event
     */
    onFactorSelectedOptionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (event?.detail?.value && (event.detail.value as ExploreSelectOption).value !== this.factorSelectedOption) {
            this.updateFactorSelectedOption((event.detail.value as ExploreSelectOption).value);
        }
    }

    private initializeWidgetConfigInputs(): void {
        FactorDataChartSettingsStore.timeSeriesWidgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(this.widgetType, TimeSeriesSettings.INPUT_CONFIG_NAME);
        FactorDataChartSettingsStore.columnsWidgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(this.widgetType, ColumnType.COLUMNS);
        FactorDataChartSettingsStore.comparisonColumnsWidgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(this.widgetType, ColumnType.FACTOR_COMPARISON_COLUMNS);
        FactorDataChartSettingsStore.riskMatrixWidgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(this.widgetType, FactorDataRiskMatrixSettings.configType);
        FactorDataChartSettingsStore.highlightWidgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(this.widgetType, FactorDataHighlightSettings.configType);
    }

    /**
     * Sets whether to show or hide the right-side columnSet
     * @private
     */
    private setShowAdditionalFactorSet(): void {
        if (this.isTimeSeriesMode && (this.factorSelectedOption === FactorTimeSeriesSelectedOption.CORRELATIONS || this.factorSelectedOption === FactorTimeSeriesSelectedOption.REGRESSION_BETAS)) {
            if (isNil(FactorDataChartSettingsStore.inputs.get(ColumnType.FACTOR_COMPARISON_COLUMNS))) {
                FactorDataChartSettingsStore.inputs.set(ColumnType.FACTOR_COMPARISON_COLUMNS, new ColumnSet());
            }
            this.showAdditionalFactorSet = true;
        } else {
            FactorDataChartSettingsStore.inputs.delete(ColumnType.FACTOR_COMPARISON_COLUMNS);
            this.showAdditionalFactorSet = false;
        }
    }

    /**
     * Reset the settings to default
     * @private
     */
    private initializeSettingsBasedOnTimeSeriesMode(): void {
        if (this.isTimeSeriesMode) {
            const timeSeriesSettings = new TimeSeriesSettings(FactorDataChartSettingsStore.timeSeriesWidgetConfigInput.default);
            this.inputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, timeSeriesSettings);

            // Delete settings specific to Risk Matrix mode
            this.inputs.delete(FactorDataRiskMatrixSettings.configType);
            this.inputs.delete(FactorDataHighlightSettings.configType);

        } else {
            const factorDataRiskMatrixSettings = new FactorDataRiskMatrixSettings(FactorDataChartSettingsStore.riskMatrixWidgetConfigInput.default);
            this.inputs.set(FactorDataRiskMatrixSettings.configType, factorDataRiskMatrixSettings);

            const factorDataHighlightSettings = new FactorDataHighlightSettings(FactorDataChartSettingsStore.highlightWidgetConfigInput.default);
            this.inputs.set(FactorDataHighlightSettings.configType, factorDataHighlightSettings);

            // Delete settings specific to Time Series mode
            this.inputs.delete(TimeSeriesSettings.INPUT_CONFIG_NAME);
        }
    }

    private updateFactorPermissions(): void {
        const cols = (FactorDataChartSettingsStore.inputs.get(ColumnType.COLUMNS) as ColumnSet).columns;
        const factorTags = cols.map(col => col.columnTag);

        if (factorTags.length === 0) {
            this.isFactorDataLoaded = true;
            this.changeDetectorRef.markForCheck();
            return;
        }

        this.isFactorDataLoaded = false;
        this.changeDetectorRef.markForCheck();

        this.factorDefinitionsService.fetchFactorDefinitionsForFactorTags$(factorTags)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    this.isFactorDataLoaded = true;
                    this.changeDetectorRef.markForCheck();
                })
            ).subscribe({
                next: (factors: FactorModelColumnDefinition[]) => {
                    const filteredFactors = factors.filter(factor => !factor.viewLevels);
                    filteredFactors.forEach(factor => FactorDataChartSettingsStore.factorTagToPermissionMap.set(factor.columnTag, 'N'));
                },
                error: () => {
                    this.notificationService?.error('Unable to fetch factor definitions');
                },
            });
    }
}
