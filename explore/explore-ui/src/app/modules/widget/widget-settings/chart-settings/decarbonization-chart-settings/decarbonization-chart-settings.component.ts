import {ChangeDetectorRef, Component} from '@angular/core';
import {
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    ColumnOptionMetaDataInterface,
    CommonUtils,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent, TempAlignmentScenariosColumnOption} from '@blk/explore-ui-column-option';
import {DecarbonizationChartSettings} from '@models/widget/inputs/decarbonization-chart-settings.model';
import {isEmpty} from 'lodash';
import {DecarbPortfolioTarget} from '@models/widget/inputs/decarb-portfolio-target-model';
import {URLConstants} from '@constants/url.constants';

@Component({
    selector: 'app-decarbonization-chart-settings',
    templateUrl: './decarbonization-chart-settings.component.html',
    styleUrls: ['./decarbonization-chart-settings.component.scss']
})
/**
 * Component for the Decarbonization Chart Settings
 */
export class DecarbonizationChartSettingsComponent extends BaseWidgetSettingComponent<DecarbonizationChartSettings> {

    emissionsMetric: ExploreSelectOptionGroup[];
    emissionsScope: ExploreSelectOptionGroup[];
    aggregationMethod: ExploreSelectOptionGroup[];
    targetTypeOptions: ExploreSelectOptionGroup[] = [
        {values: TempAlignmentScenariosColumnOption.TARGET_TYPE_OPTIONS.map(option => ({...option}))}
    ];
    /** Array of scenario type options group */
    scenarioTypeOptions: ExploreSelectOptionGroup[] = [
        {values: TempAlignmentScenariosColumnOption.SCENARIO_TYPE_OPTIONS.map(option => ({...option}))}
    ];
    /** Array of scenario timeframe options group */
    startYearOptions: ExploreSelectOptionGroup[] = [];

    /** Array of aggregation options group */
    aggregationMethodOptions: ExploreSelectOptionGroup[] = [];
    /** Available year values to convert to options */
    availableYears: string[] = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2035', '2040', '2045'];

    taScenarioOption: ColumnOptionMetaDataInterface;
    aggregationOption: ColumnOptionMetaDataInterface;

    colTagMap = {
        RevenueIntensity_s12: 'ta_rev_int_s12',
        RevenueIntensity_s123: 'ta_rev_intens_proj',
        EVICIntensity_s12: 'ta_evic_int_s12',
        EVICIntensity_s123: 'ta_evic_int_s123',
        IntensityGDP: 'TA_SOV_SCOPE1_INTENSITY_GDP',
        IntensityGDPPPP: 'TA_SOV_SCOPE1_INTENSITY_GDP_PPP',
        IntensityCAPITA: 'TA_SOV_SCOPE1_INTENSITY_PER_CAPITA',
        IntensitySOVDEBT: 'TA_SOV_SCOPE1_INTENSITY_SOV_DEBT',
        FinancedEmissions_s12: 'financed_emis_s12',
        FinancedEmissions_s123: 'financed_emis_s123'
    };
    selectedEmissionMetric: string;
    selectedEmissionScope: string;

    yearSliderMin = DecarbonizationChartSettings.MIN_SCENARIO_YEAR;
    yearSliderMax = DecarbonizationChartSettings.MAX_SCENARIO_YEAR;

    portfolioTargets: DecarbPortfolioTarget[];
    isSovsMetricsSelected = false;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        if (this.widgetInput.portfolioTargets && this.widgetInput.portfolioTargets.length > 0) {
            this.portfolioTargets = this.widgetInput.portfolioTargets;
        } else {
            this.portfolioTargets = this.widgetInput.portfolioTargets = DecarbonizationChartSettings.DEFAULT_PORTFOLIO_TARGETS;
        }

        this.resetTargetsDeleteButtonsAndLabels();
        const selectedMetricAndScope = Object.keys(this.colTagMap).find(key => this.colTagMap[key] === (this.widgetInput.columnTag)).split('_');

        this.initEmissionMetric(selectedMetricAndScope[0]);
        this.initScenarioTypeOptions();
        this.initStartYearOptions();

        if (selectedMetricAndScope[0] === 'FinancedEmissions') {
            this.initEmissionScope(selectedMetricAndScope[1]);
            this.initAggregationOptionsforFinancedEmissions();
            this.initTargetTypeOptions();
        } else if (this.checkIfSovsMetricsSelected(selectedMetricAndScope[0])) {
            this.isSovsMetricsSelected = true;
            this.initAggregationOptions();
        } else {
            this.initEmissionScope(selectedMetricAndScope[1]);
            this.initAggregationOptions();
            this.initTargetTypeOptions();
        }
    }

    private initEmissionMetric(selectedMetric: string): void {
        this.emissionsMetric = [{
            values: [
                new ExploreSelectOption('Revenue Intensity', 'RevenueIntensity', selectedMetric === 'RevenueIntensity'),
                new ExploreSelectOption('EVIC Intensity', 'EVICIntensity', selectedMetric === 'EVICIntensity'),
                new ExploreSelectOption('Intensity $/GDP', 'IntensityGDP', selectedMetric === 'IntensityGDP' ),
                new ExploreSelectOption('Intensity $/GDP PPP', 'IntensityGDPPPP', selectedMetric === 'IntensityGDPPPP'),
                new ExploreSelectOption('Intensity Per Capita', 'IntensityCAPITA', selectedMetric === 'IntensityCAPITA'),
                new ExploreSelectOption('Intensity $/Sov Debt', 'IntensitySOVDEBT', selectedMetric === 'IntensitySOVDEBT'),
                new ExploreSelectOption('Financed emissions', 'FinancedEmissions', selectedMetric === 'FinancedEmissions'),
            ]
        }];
        this.selectedEmissionMetric = selectedMetric;
        this.cdr.detectChanges();
    }

    private initEmissionScope(selectedScope = 's12'): void {
        this.emissionsScope = [{
            values: [
                new ExploreSelectOption('Scope 1,2', 's12', selectedScope === 's12'),
                new ExploreSelectOption('Scope 1,2,3', 's123', selectedScope === 's123')
            ]
        }];
        this.selectedEmissionScope = selectedScope;
        this.cdr.detectChanges();
    }

    /**
     * Initializes the target type options.
     */
    private initTargetTypeOptions(): void {
        const targetTypeOptionValues = this.targetTypeOptions[0].values.map(option => ({...option, isSelected: option.value === (this.widgetInput.emissionTargetType)}));
        if (!targetTypeOptionValues.some(option => option.isSelected)) {
            targetTypeOptionValues[0].isSelected = true;
        }
        this.targetTypeOptions = [{values: targetTypeOptionValues}];
        this.cdr.detectChanges();
    }

    /**
     * Initializes the target type options.
     */
    private initScenarioTypeOptions(): void {
        const scenarioTypeOptionValues = this.scenarioTypeOptions[0].values.map(option => ({...option, isSelected: option.value === (this.widgetInput.selectedScenario)}));
        if (!scenarioTypeOptionValues.some(option => option.isSelected)) {
            scenarioTypeOptionValues[0].isSelected = true;
        }
        this.scenarioTypeOptions = [{values: scenarioTypeOptionValues}];
        this.cdr.detectChanges();
    }

    /**
     * Initializes the timeframe scenario options and selects the timeframe options for loaded scenarios.
     */
    private initStartYearOptions(): void {
        const selectOptionGroup = new ExploreSelectOptionGroup();
        if (!isEmpty(this.availableYears)) {
            for (const year of this.availableYears) {
                selectOptionGroup.values.push(
                    new ExploreSelectOption(
                        year,
                        year,
                        year === (this.widgetInput.emissionStartYear)
                    )
                );
            }
        }
        this.startYearOptions = [selectOptionGroup];
        this.cdr.detectChanges();
    }

    /**
     * Initializes the aggregation options and selects the aggregation method.
     */
    private initAggregationOptions(): void {
        const selectedAggMethod = this.widgetInput.aggregationMethod;
        this.aggregationMethodOptions = [{
            values: [
                new ExploreSelectOption('Delta Notional MV/Delta Notional MV, null value excluded', 1401, selectedAggMethod === 1401),
                new ExploreSelectOption('Wt Avg', 2300, selectedAggMethod === 2300),
                new ExploreSelectOption('None', 0, selectedAggMethod === 0)
            ]
        }];
        this.cdr.detectChanges();
    }

    private initAggregationOptionsforFinancedEmissions(): void {
        const selectedAggMethod = this.widgetInput.aggregationMethod;
        this.aggregationMethodOptions = [{
            values: [
                new ExploreSelectOption('Sum', 2, selectedAggMethod === 2)
            ]
        }];
        this.cdr.detectChanges();
    }

    openDecarbonizationModelOverview(): void {
        const origin: string = CommonUtils.isLocalHost() ? URLConstants.DEV_URL : CommonUtils.getLocation().origin;
        window.open(origin + '/acs/literature/aladdin-product-update/ac-product-update-nov-2023.pdf', '_blank');
    }

    /**
     * Update the columnTag when Emission metric is changed.
     */
    updateColTagOnEmissionMetricChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const value = (event.detail.value as AuxSelectOption)?.value;
        if (value) {
            this.selectedEmissionMetric = value;
            if (this.checkIfSovsMetricsSelected(value)) {
                this.isSovsMetricsSelected = true;
                this.widgetInput.aggregationMethod = 1401;
                this.initAggregationOptions();
                this.widgetInput.columnTag = this.colTagMap[value];
                this.widgetInput.emissionTargetType = undefined;
            } else {
                this.isSovsMetricsSelected = false;
                this.initEmissionScope();
                this.widgetInput.columnTag = this.colTagMap[value + '_' + this.selectedEmissionScope];
                this.widgetInput.emissionTargetType = 'TA_METRIC_CODE_PRIORITY';
                this.initTargetTypeOptions();
                if (value === 'FinancedEmissions') {
                    this.widgetInput.aggregationMethod = 2;
                    this.initAggregationOptionsforFinancedEmissions();
                } else {
                    this.widgetInput.aggregationMethod = 1401;
                    this.initAggregationOptions();
                }
            }
        }
    }

    /**
     * Update the columnTag when Emission Scope is changed.
     */
    updateColTagOnEmissionScopeChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const value = (event.detail.value as AuxSelectOption)?.value;
        if (this.selectedEmissionMetric && value) {
            this.selectedEmissionScope = value;
            this.widgetInput.columnTag = this.colTagMap[this.selectedEmissionMetric + '_' + value];
        }
    }

    /**
     * Update the target types when selection is changed.
     */
    updateAggregationMethod(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.aggregationMethod = (event.detail.value as AuxSelectOption)?.value;
    }

    /**
     * Update the target types when selection is changed.
     */
    updateTargetsTypes(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.emissionTargetType = (event.detail.value as AuxSelectOption)?.value;
    }

    /**
     * Update the timeframes when selection is changed
     */
    updateTimeframe(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.emissionStartYear = (event.detail.value as AuxSelectOption)?.value;
    }

    /**
     * Update the type when selection is changed
     */
    updateScenarioType(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.selectedScenario = (event.detail.value as AuxSelectOption)?.value;
    }

    deletePortfolioTarget(index: number): void {
        this.portfolioTargets.splice(index, 1);
        this.resetTargetsDeleteButtonsAndLabels();

    }

    addPortfolioTarget(): void {
        this.portfolioTargets.push(new DecarbPortfolioTarget({label: '', startYear: DecarbonizationChartSettings.MIN_SCENARIO_YEAR, targetYear: DecarbonizationChartSettings.MAX_SCENARIO_YEAR}));
        this.resetTargetsDeleteButtonsAndLabels();
    }

    reductionTargetValueChanged($event: any, index: number): void {
        if (!$event?.detail?.value) {
            this.portfolioTargets[index].reductionPercent = undefined;
        } else {
            this.portfolioTargets[index].reductionPercent = $event.detail.value as number;
        }
    }

    onStartYearChange($event: any, index: number) {
        this.portfolioTargets[index].startYear = $event.detail.value;
    }

    onTargetYearChange($event: any, index: number) {
        this.portfolioTargets[index].targetYear = $event.detail.value;
    }

    private resetTargetsDeleteButtonsAndLabels(): void {
        for (let i = 0; i < this.portfolioTargets?.length; i++) {
            this.portfolioTargets[i].label = 'Portfolio Target ' + (i + 1);
            this.portfolioTargets[i].showDeleteButton = this.portfolioTargets.length > 1;
        }
    }

    checkIfSovsMetricsSelected(selectedMetricAndScope: string): boolean {
        return selectedMetricAndScope === 'IntensityGDP' ||
               selectedMetricAndScope === 'IntensityGDPPPP' ||
               selectedMetricAndScope === 'IntensityCAPITA' ||
               selectedMetricAndScope === 'IntensitySOVDEBT';
    }
}
