import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractChartsWidgetService} from '@services/widget/abstract-charts-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {
    ColumnConfig,
    ExploreSelectOption,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {AggregationColumnOption, ClimateScenario, ColumnSet, TempAlignmentScenariosColumnOption} from '@blk/explore-ui-column-option';
import {Injectable} from '@angular/core';
import {DecarbonizationChartSettings} from '@models/widget/inputs/decarbonization-chart-settings.model';
import {cloneDeep} from 'lodash';

/**
 * Service to retrieve data for the Decarbonization Chart widget
 */
@Injectable()
export class DecarbonizationChartWidgetDataService extends AbstractChartsWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to 'talk' to the backend server
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.DECARBONIZATION_WIDGET], WidgetDataViewOption.SECTOR_VIEW);
    }

    /**
     * Add columns as per the decarbonizationChartSettings
     * @param widgetInputs original widgetInputs
     */
    static applyWidgetDecarbonizationSettings(widgetInputs: Map<string, WidgetInput>): void {
         // get the chart columns and clone because it may get modified
         const widgetColumns = cloneDeep(widgetInputs.get(WidgetInputType.COLUMNS)) as ColumnSet;
        const decarbonizationChartSettings = widgetInputs.get('decarbonizationChartSettings') as DecarbonizationChartSettings;
        // Guardrail for no columns in the request
        if (widgetColumns && widgetColumns.columns.length && decarbonizationChartSettings) {
            widgetColumns.columns = DecarbonizationChartWidgetDataService.getDecarbWidgetColumns(decarbonizationChartSettings);
            widgetInputs.set(WidgetInputType.COLUMNS, widgetColumns);
        }
    }

    /**
     * get decarbonization widget columns
     */
    private static getDecarbWidgetColumns(settings: DecarbonizationChartSettings): ColumnConfig[] {
        const columns: ColumnConfig[] = [];

        const scenario = TempAlignmentScenariosColumnOption.SCENARIO_TYPE_OPTIONS.filter(scenarioTypeOption => scenarioTypeOption.value === (settings.selectedScenario))[0];

        const defaultColumn = DecarbonizationChartWidgetDataService.getDefaultDecarbColumn(settings);
        defaultColumn.columnKey = defaultColumn.columnTag + '-base';
        const tempAlignOptionValue = new TempAlignmentScenariosColumnOption();
        const startYear = Number(settings.emissionStartYear);
        for (let i = startYear; i <= Number(DecarbonizationChartSettings.MAX_SCENARIO_YEAR); i++) {
            tempAlignOptionValue.climateScenario.push(DecarbonizationChartWidgetDataService.getClimateScenario(scenario, String(i)));
        }
        if (!settings.emissionTargetType) {
            tempAlignOptionValue.hideTargets = true;
        } else {
            tempAlignOptionValue.targetTypes = [settings.emissionTargetType];
        }
        defaultColumn.optionValues.push(tempAlignOptionValue);
        columns.push(defaultColumn);

        settings.portfolioTargets?.forEach((target, i) => {
            if (target.isValid()) {
                const portfolioTargetColumn = DecarbonizationChartWidgetDataService.getDefaultDecarbColumn(settings);
                portfolioTargetColumn.columnKey = portfolioTargetColumn.columnTag + '-portfolioTarget_' + (i + 1);
                const tempAlignOptionValueForPortfolioTarget = new TempAlignmentScenariosColumnOption();
                for (let j = Number(target.startYear); j <= Number(target.targetYear); j++) {
                    tempAlignOptionValueForPortfolioTarget.climateScenario.push(DecarbonizationChartWidgetDataService.getClimateScenario(scenario, String(j)));
                }
                tempAlignOptionValueForPortfolioTarget.decarbonizationReductionTarget = target.reductionPercent;
                if (!settings.emissionTargetType) {
                    tempAlignOptionValueForPortfolioTarget.hideTargets = true;
                } else {
                    tempAlignOptionValueForPortfolioTarget.targetTypes = [settings.emissionTargetType];
                }
                portfolioTargetColumn.optionValues.push(tempAlignOptionValueForPortfolioTarget);
                columns.push(portfolioTargetColumn);
            }
        });

        return columns;
    }

    private static getDefaultDecarbColumn(settings: DecarbonizationChartSettings): ColumnConfig {
        const column = new ColumnConfig({columnTag: settings.columnTag, positionColumnType: settings.positionColumnType});
        const aggMethodOptionValue = new AggregationColumnOption();
        aggMethodOptionValue.value = settings.aggregationMethod;
        column.optionValues.push(aggMethodOptionValue);
        return column;
    }

    private static getClimateScenario(scenario: ExploreSelectOption, scenarioyear: string): ClimateScenario {
        return new ClimateScenario({
            scenarioType: scenario.value,
            scenarioTypeDisplayName: scenario.displayValue,
            scenarioPercentile: 'mean',
            scenarioPercentileDisplayName: 'mean',
            scenarioYear: scenarioyear,
            scenarioYearDisplayName: scenarioyear
        });
    }

    /**
     * Modifies some of the inputs (see DecarbonizationChartWidgetDataService.applyWidgetDecarbonizationSettings)
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, _widget: Widget): void {
        DecarbonizationChartWidgetDataService.applyWidgetDecarbonizationSettings(widgetInputs);
    }
}
