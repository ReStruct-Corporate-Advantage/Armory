import {
    AuxDynamicPositionEnum,
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {TopBottomFilterInput} from '@models/widget/inputs/top-bottom-filter-input.model';
import {cloneDeep, isEmpty, isNil} from 'lodash';
import {WidgetConfigFactory} from '../../../../factories';
import {
    AbstractScenario,
    ColumnConfig,
    DateScenario,
    ExploreRadioButton,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    NamedScenario,
    OtherScenario,
    OverrideDateConstants,
    WidgetInput
} from '@blk/explore-ui-core';
import {
    BaseWidgetSettingComponent,
    ClimateScenario,
    ClimateScenariosColumnOption,
    ColumnSet,
    CombinedClimateScenariosColumnOption,
    CustomTitleColumnOption,
    LibColumnUtils,
    OverrideDateColumnOption,
    ScenarioColumnOption,
    TempAlignmentScenariosColumnOption,
    TransitionClimateScenariosColumnOption
} from '@blk/explore-ui-column-option';
import {CommonConstants} from '@constants/common.constants';

/**
 * Top Bottom Filter component
 */
@Component({
    selector: 'app-top-bottom-filter-settings',
    templateUrl: './top-bottom-filter-settings.component.html',
    styleUrls: ['./top-bottom-filter-settings.component.scss']
})
export class TopBottomFilterSettingsComponent extends BaseWidgetSettingComponent<TopBottomFilterInput> {
    columns: ColumnSet;
    hideTopBottomSectorToggle = false;
    selectedColumn: string;
    cols: ColumnConfig[];
    displayDataForColumns: ExploreSelectOptionGroup[];
    resultLevelRadioGroups: ExploreRadioButton[];

    readonly BY_INDIVIDUAL_SECURITIES = 'By individual securities';
    readonly BY_SECTOR_IN_THE_BREAKDOWN = 'By sector in the breakdown';
    readonly WITHIN_EACH_SECTOR_IN_THE_BREAKDOWN = 'Within each sector in the breakdown';
    readonly SHOW_RESULTS = 'Show results';
    readonly addReportGroupMessage = CommonConstants.PORT_REPORT_GRP_INFO;
    readonly iconLoc = AuxDynamicPositionEnum.RIGHT_CENTER;

    /**
     * Creates suffix to append to column title for override date child column
     */
    private static getOverrideDateChildTitleSuffix(overrideDate: OverrideDateColumnOption): string {
        const overrideDateType = overrideDate.overrideDateTypes[0];
        const title = (overrideDateType === OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CUSTOM) ? overrideDate.customOverrideDateLabel : overrideDateType;
        return ' ' + title;
    }

    /**
     * Creates suffix to append to column title for climate child column
     */
    private static getClimateChildTitleSuffix(scenario: ClimateScenario): string {
        return ' ' + [scenario.scenarioTypeDisplayName, scenario.scenarioPercentileDisplayName, scenario.scenarioYearDisplayName].join(' ');
    }

    /**
     * Creates suffix to append to column title for stress scenario child column
     */
    private static getRiskStressScenarioChildTitleSuffix(scenario: AbstractScenario): string {
        if (scenario instanceof NamedScenario) {
            return ' ' + scenario.name;
        } else if (scenario instanceof DateScenario) {
            return ' ' + scenario.fromDate.date + '-' + scenario.toDate.date;
        } else if (scenario instanceof OtherScenario) {
            return ' ' + [scenario.name, scenario.purpose].join(' ');
        }
        return '';
    }

    /**
     * Returns any column option that has ClimateScenariosColumnOption as its underlying class
     */
    static getClimateScenarioColumnOption(column: ColumnConfig): ClimateScenariosColumnOption {
        return column.getOptionValueByConfigType(ClimateScenariosColumnOption.CONFIG_TYPE) as ClimateScenariosColumnOption ??
            column.getOptionValueByConfigType(TransitionClimateScenariosColumnOption.CONFIG_TYPE) as TransitionClimateScenariosColumnOption ??
            column.getOptionValueByConfigType(CombinedClimateScenariosColumnOption.CONFIG_TYPE) as CombinedClimateScenariosColumnOption ??
            column.getOptionValueByConfigType(TempAlignmentScenariosColumnOption.CONFIG_TYPE) as TempAlignmentScenariosColumnOption;
    }

    /**
     * Returns portfolio risk stress scenario column option
     */
    static getRiskStressScenarioColumnOption(column: ColumnConfig): ScenarioColumnOption {
        return (column.getOptionValueByConfigType(ScenarioColumnOption.CONFIG_TYPE) ??
            column.getOptionValueByConfigType(ScenarioColumnOption.ALT_CONFIG_TYPE)) as ScenarioColumnOption;
    }

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent() {
        this.hideTopBottomSectorToggle = WidgetConfigFactory.getHideTopBottomSectorToggle(this.widgetType);
        // Get the columns that are to be displayed for this widget.
        this.columns = this.getInput('columns') as ColumnSet;

        // Not all widgets have an input of columns.
        // So if this is not defined then we need to look at all the inputs and take all of them that have a ColumnSet.
        // The example here is a treemap widget where we specify a column for both x and y, also a scatter plot would
        // have the same issue.
        if (isNil(this.columns)) {
            this.columns = new ColumnSet();
            this.inputs.forEach((input: WidgetInput) => {
                if (input instanceof ColumnSet) {
                    this.columns.columns.push(...input.columns);
                }
            });
        }

        this.resultLevelRadioGroups = [
            new ExploreRadioButton(this.BY_INDIVIDUAL_SECURITIES, !this.widgetInput.sectorLevel && !this.widgetInput.withinSectorLevel, false),
            new ExploreRadioButton(this.BY_SECTOR_IN_THE_BREAKDOWN, !!this.widgetInput.sectorLevel, false),
            new ExploreRadioButton(this.WITHIN_EACH_SECTOR_IN_THE_BREAKDOWN, !this.widgetInput.sectorLevel && !!this.widgetInput.withinSectorLevel, false)
        ];

        this.cols = this.getAllWidgetColumns();

        // If the filter rule is already saved as part of the widget populate the select dropdown with the saved column
        if (this.widgetInput && this.widgetInput.columnTag) {
            // Populate the top bottom filter with the saved values
            this.selectedColumn = this.getTitleForTopBottomFilter(this.cols.find((col: ColumnConfig) => {
                return col.columnTag === this.widgetInput.columnTag
                    && col.columnKey === this.widgetInput.columnKey
                    && (this.widgetInput.title ? this.widgetInput.title.includes(this.getTitleSuffix(col)) : true);
            }));
        } else {
            // Reset
            this.clearTopBottomFilter();
        }
        this.setupDisplayDataForColumns();
    }

    /**
     *
     */
    setupDisplayDataForColumns() {
        this.displayDataForColumns = [new ExploreSelectOptionGroup()];
        this.cols.forEach((col: ColumnConfig) => {
            this.displayDataForColumns[0].values.push(new ExploreSelectOption(this.getTitleForTopBottomFilter(col), col.columnKey, this.getTitleForTopBottomFilter(col) === this.selectedColumn));
        });
    }

    /**
     * Clear the top bottom filter rule
     */
    clearTopBottomFilter() {
        this.widgetInput.reset();
        this.selectedColumn = null;
    }

    /**
     * Function call when a filter column is selected
     */
    updateFilterColumn($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil($event.detail.value)) {
            this.clearTopBottomFilter();
            return;
        }
        const colKey = ($event.detail.value as AuxSelectOption).value;
        const colTitle = ($event.detail.value as AuxSelectOption).displayValue;
        const chosenCol = this.cols.find((col: ColumnConfig) => {
            return colKey === col.columnKey && colTitle === col.columnTitle;
        });

        // Set the column tag
        this.widgetInput.columnTag = chosenCol.columnTag;
        // Set the position column type
        this.widgetInput.positionColumnType = chosenCol.positionColumnType;
        // Set the column key
        this.widgetInput.columnKey = colKey;

        // set the override date in case of filter is added on col with override date
        const overrideDateColOption: OverrideDateColumnOption = (chosenCol.getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        if (overrideDateColOption?.overrideDateTypes.length === 1) {
            // add or update the override date for top/bottom filter
            this.widgetInput.childColumnOptions.set(OverrideDateColumnOption.CONFIG_TYPE, cloneDeep(overrideDateColOption));
        } else {
            // remove override date for top/bottom filter if new column no longer contains override date
            this.widgetInput.childColumnOptions.delete(OverrideDateColumnOption.CONFIG_TYPE);
        }

        // set the climate scenario in case of filter is added on some climate column.
        const climateScenarioColOption: ClimateScenariosColumnOption = TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(chosenCol);
        if (climateScenarioColOption?.climateScenario.length === 1) {
            // add or update the climate scenario for top/bottom filter
            const topBottomClimateScenario: ClimateScenariosColumnOption = this.widgetInput.childColumnOptions.get(ClimateScenariosColumnOption.CONFIG_TYPE) as ClimateScenariosColumnOption ?? new ClimateScenariosColumnOption();
            // we will save full column option, but top/bottom filter only concerned with value of climateScenario[0]
            topBottomClimateScenario.climateScenario = cloneDeep(climateScenarioColOption.climateScenario);
            this.widgetInput.childColumnOptions.set(ClimateScenariosColumnOption.CONFIG_TYPE, topBottomClimateScenario);
        } else {
            // remove climate scenario for top/bottom filter if new column no longer contains climate scenario
            this.widgetInput.childColumnOptions.delete(ClimateScenariosColumnOption.CONFIG_TYPE);
        }

        // set the scenario in case of filter is added on a stress column
        const stressScenarioColOption: ScenarioColumnOption = TopBottomFilterSettingsComponent.getRiskStressScenarioColumnOption(chosenCol);
        if (stressScenarioColOption?.isValid()) {
            // add or update the stress scenario for top/bottom filter
            const topBottomScenario: ScenarioColumnOption = this.widgetInput.childColumnOptions.get(ScenarioColumnOption.CONFIG_TYPE) as ScenarioColumnOption ?? new ScenarioColumnOption();
            topBottomScenario.nameScenarios = cloneDeep(stressScenarioColOption.nameScenarios);
            topBottomScenario.dateScenarios = cloneDeep(stressScenarioColOption.dateScenarios);
            topBottomScenario.otherScenarios = cloneDeep(stressScenarioColOption.otherScenarios);
            this.widgetInput.childColumnOptions.set(ScenarioColumnOption.CONFIG_TYPE, topBottomScenario);
        } else {
            // remove scenario for top/bottom filter if new column no longer contains stress scenario
            this.widgetInput.childColumnOptions.delete(ScenarioColumnOption.CONFIG_TYPE);
        }

        this.widgetInput.title = chosenCol.columnTitle;
        this.selectedColumn = this.getTitleForTopBottomFilter(chosenCol);
    }

    /**
     * Returns a list of column with child columns added
     */
    getAllWidgetColumns(): ColumnConfig[] {
        const allColumns: ColumnConfig[] = [];
        this.columns.columns.filter(col => LibColumnUtils.doesColumnPassAllFilters(this.widgetConfigInput.columnFilters, col))
            .forEach((col: ColumnConfig) => {
                let columnsWithSplits: ColumnConfig[] = [col];

                const overrideDateColOption: OverrideDateColumnOption = col.getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption;
                if (overrideDateColOption) {
                    columnsWithSplits = this.getOverrideDateChildColumns(col);
                }

                const climateScenariosColOption: ClimateScenariosColumnOption = TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(col);
                if (climateScenariosColOption) {
                    columnsWithSplits = this.getClimateChildColumns(columnsWithSplits, col);
                }

                const stressScenarioColOption: ScenarioColumnOption = TopBottomFilterSettingsComponent.getRiskStressScenarioColumnOption(col);
                if (stressScenarioColOption) {
                    columnsWithSplits = this.getStressScenarioChildColumns(columnsWithSplits, col);
                }

                allColumns.push(...columnsWithSplits);
            });
        return allColumns;
    }

    /**
     * Takes a single column and spawns all the child columns related to override date if present
     * @param currentColumn Parent column
     * @private
     */
    private getOverrideDateChildColumns(currentColumn: ColumnConfig): ColumnConfig[] {
        let overrideDateColOption: OverrideDateColumnOption = (currentColumn.getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        const overrideDateTypes: string[] = overrideDateColOption.overrideDateTypes;
        if (isEmpty(overrideDateTypes)) {
            return [currentColumn];
        }

        // create a copy of the column for each overrideDateType
        return overrideDateTypes.map((overrideDateType: string) => {
            const overrideColumn: ColumnConfig = cloneDeep(currentColumn);
            overrideDateColOption = overrideColumn.getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption;
            overrideDateColOption.overrideDateTypes = [overrideDateType];
            overrideColumn.columnTitle += TopBottomFilterSettingsComponent.getOverrideDateChildTitleSuffix(overrideDateColOption);
            return overrideColumn;
        });
    }

    /**
     * Takes a list of columns with either parent column or override date child columns and spawns child columns with Climate Scenarios if present
     * @param columnsWithChildren All columns related to a single column (may include those spawned with override date)
     * @param originalColumn Original parent column
     * @private
     */
    private getClimateChildColumns(columnsWithChildren: ColumnConfig[], originalColumn: ColumnConfig): ColumnConfig[] {
        const climateScenariosColOption: ClimateScenariosColumnOption = TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(originalColumn);
        if (!climateScenariosColOption.climateScenario) {
            return columnsWithChildren;
        }

        // takes existing column(s) (either single column, or columns with override date children) and replaces with additional column for each climate scenario
        const columnsWithClimateSplits: ColumnConfig[] = [];
        for (const column of columnsWithChildren) {
            const scenarioColumns = climateScenariosColOption.climateScenario.map((scenario: ClimateScenario): ColumnConfig => {
                const columnCopy: ColumnConfig = cloneDeep(column);
                const climateScenarioColOption: ClimateScenariosColumnOption = TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(columnCopy);
                climateScenarioColOption.climateScenario = [scenario];
                columnCopy.columnTitle += TopBottomFilterSettingsComponent.getClimateChildTitleSuffix(scenario);
                return columnCopy;
            });
            columnsWithClimateSplits.push(...scenarioColumns);
        }
        return columnsWithClimateSplits;
    }

    /**
     * Takes list of all columns and spawns child columns for each stress scenario child column if present
     * @param columnsWithChildren All columns related to a single column (may include those spawned with override date)
     * @param originalColumn Original parent column
     * @private
     */
    private getStressScenarioChildColumns(columnsWithChildren: ColumnConfig[], originalColumn: ColumnConfig): ColumnConfig[] {
        const scenarioColOption: ScenarioColumnOption = TopBottomFilterSettingsComponent.getRiskStressScenarioColumnOption(originalColumn);
        if (!scenarioColOption.isValid()) {
            return columnsWithChildren;
        }

        // takes existing column(s) (either single column, or columns with already spawned children) and replaces with additional column for each stress scenario
        const columnsWithStressScenarioSplits: ColumnConfig[] = [];
        for (const column of columnsWithChildren) {
            const namedScenarioColumns = scenarioColOption.nameScenarios.map((scenario: NamedScenario): ColumnConfig => {
                const columnCopy: ColumnConfig = cloneDeep(column);
                const namedScenarioColOption: ScenarioColumnOption = TopBottomFilterSettingsComponent.getRiskStressScenarioColumnOption(columnCopy);
                namedScenarioColOption.nameScenarios = [scenario];
                namedScenarioColOption.dateScenarios = [];
                namedScenarioColOption.otherScenarios = [];
                columnCopy.columnTitle += TopBottomFilterSettingsComponent.getRiskStressScenarioChildTitleSuffix(scenario);
                return columnCopy;
            });
            columnsWithStressScenarioSplits.push(...namedScenarioColumns);

            const dateScenarioColumns = scenarioColOption.dateScenarios.map((scenario: DateScenario): ColumnConfig => {
                const columnCopy: ColumnConfig = cloneDeep(column);
                const dateScenarioColOption: ScenarioColumnOption = TopBottomFilterSettingsComponent.getRiskStressScenarioColumnOption(columnCopy);
                dateScenarioColOption.nameScenarios = [];
                dateScenarioColOption.dateScenarios = [scenario];
                dateScenarioColOption.otherScenarios = [];
                columnCopy.columnTitle += TopBottomFilterSettingsComponent.getRiskStressScenarioChildTitleSuffix(scenario);
                return columnCopy;
            });
            columnsWithStressScenarioSplits.push(...dateScenarioColumns);

            const otherScenarioColumns = scenarioColOption.otherScenarios.map((scenario: OtherScenario): ColumnConfig => {
                const columnCopy: ColumnConfig = cloneDeep(column);
                const otherScenarioColOption: ScenarioColumnOption = TopBottomFilterSettingsComponent.getRiskStressScenarioColumnOption(columnCopy);
                otherScenarioColOption.nameScenarios = [];
                otherScenarioColOption.dateScenarios = [];
                otherScenarioColOption.otherScenarios = [scenario];
                columnCopy.columnTitle += TopBottomFilterSettingsComponent.getRiskStressScenarioChildTitleSuffix(scenario);
                return columnCopy;
            });
            columnsWithStressScenarioSplits.push(...otherScenarioColumns);
        }
        return columnsWithStressScenarioSplits;
    }

    /**
     * Return the title of the column for the top bottom filter.
     */
    getTitleForTopBottomFilter(col: ColumnConfig): string {
        // If there is no column then just return a blank.  This can happen if the user deleted the column that was selected.
        if (isNil(col)) {
            return '';
        }

        // suffix to be appended to child columns
        const suffix = this.getTitleSuffix(col);

        const customTitleOption = col.getOptionValueByConfigType(CustomTitleColumnOption.CONFIG_TYPE) as CustomTitleColumnOption;
        // if a custom column title exists, use it, otherwise use the standard column title
        const title = (customTitleOption?.customTitle && !/^\s*$/.test(customTitleOption.customTitle)) ? customTitleOption.customTitle : col.columnTitle;

        // title may already contain the suffix (if already existing top/bottom filter)
        return title.endsWith(suffix) ? title : title + suffix;
    }

    /**
     * Creates the title suffix to append to a column title for child columns
     * @param col
     */
    getTitleSuffix(col: ColumnConfig): string {
        // suffix to be appended to child columns
        let suffix = '';

        const overrideDateColOption: OverrideDateColumnOption = col.getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption;
        if (overrideDateColOption?.overrideDateTypes && !isEmpty(overrideDateColOption?.overrideDateTypes)) {
            suffix += TopBottomFilterSettingsComponent.getOverrideDateChildTitleSuffix(overrideDateColOption);
        }

        const climateScenarioColOption: ClimateScenariosColumnOption = TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(col);
        if (climateScenarioColOption?.climateScenario && !isEmpty(climateScenarioColOption?.climateScenario)) {
            const scenario = climateScenarioColOption.climateScenario[0];
            suffix += TopBottomFilterSettingsComponent.getClimateChildTitleSuffix(scenario);
        }

        const stressScenarioColOption: ScenarioColumnOption = TopBottomFilterSettingsComponent.getRiskStressScenarioColumnOption(col);
        if (stressScenarioColOption?.isValid()) {
            const scenario = stressScenarioColOption.nameScenarios[0] ?? stressScenarioColOption.dateScenarios[0] ?? stressScenarioColOption.otherScenarios[0];
            suffix += TopBottomFilterSettingsComponent.getRiskStressScenarioChildTitleSuffix(scenario);
        }
        return suffix;
    }

    onTopValueChanged($event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.widgetInput.top = Number($event.detail.value);
    }

    onBottomValueChanged($event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.widgetInput.bottom = Number($event.detail.value);
    }

    /**
     * Update selected result level.
     */
    updateSelectedResultLevel(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        switch (event.detail.value.label) {
            case this.BY_INDIVIDUAL_SECURITIES:
                this.widgetInput.sectorLevel = false;
                this.widgetInput.withinSectorLevel = false;
                break;
            case this.BY_SECTOR_IN_THE_BREAKDOWN:
                this.widgetInput.sectorLevel = true;
                this.widgetInput.withinSectorLevel = false;
                break;
            case this.WITHIN_EACH_SECTOR_IN_THE_BREAKDOWN:
                this.widgetInput.sectorLevel = false;
                this.widgetInput.withinSectorLevel = true;
        }
    }
}
