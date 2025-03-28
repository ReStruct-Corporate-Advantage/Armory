import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TopBottomFilterSettingsComponent} from './top-bottom-filter-settings.component';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigFactory} from '../../../../factories';
import {TopBottomFilterInput} from '@models/widget/inputs/top-bottom-filter-input.model';
import {WorkspaceStore} from '../../../../stores';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    ColumnConfig,
    CoreColumnUtils,
    CoreDefinitionStore,
    DateScenario,
    DateValue,
    NamedScenario,
    OtherScenario,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {
    ClimateScenario,
    ClimateScenariosColumnOption,
    ColumnSet,
    CombinedClimateScenariosColumnOption,
    CustomTitleColumnOption,
    OverrideDateColumnOption,
    ScenarioColumnOption,
    TempAlignmentScenariosColumnOption,
    TransitionClimateScenariosColumnOption
} from '@blk/explore-ui-column-option';
import {cloneDeep} from 'lodash';

describe('TopBottomFilterSettingsComponent', () => {
    let component: TopBottomFilterSettingsComponent;
    let fixture: ComponentFixture<TopBottomFilterSettingsComponent>;
    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TopBottomFilterSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(TopBottomFilterSettingsComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);

        // widget contains cusip, desc, pct_mv, market_val, notional_mv columns
        (widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet).columns.push(ColumnConfig.createColumn('market_val', 'PORT', 'market_val_1', 'Market Value'));
        (widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet).columns.push(ColumnConfig.createColumn('notional_mv', 'PORT', 'notional_mv_1', 'Market Value'));

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.RISK_EXPOSURE, 'topBottomFilter');
        component.inputs = widget.dataStore.metaData.inputs;
        jest.spyOn(WidgetConfigFactory, 'getHideTopBottomSectorToggle').mockReturnValue(false);
    });

    it('check if component is initialized correctly', () => {
        jest.spyOn(component, 'getAllWidgetColumns');
        jest.spyOn(component, 'setupDisplayDataForColumns');
        jest.spyOn(component, 'clearTopBottomFilter');

        component.ngOnInit();

        expect(component.columns).not.toBeUndefined();
        expect(component.widgetInput).not.toBeUndefined();

        expect(component.getAllWidgetColumns).toHaveBeenCalled();
        expect(component.setupDisplayDataForColumns).toHaveBeenCalled();
        expect(component.clearTopBottomFilter).toHaveBeenCalled();
        expect(component.cols.length).toBe(3);

        component.widgetInput.columnTag = 'pct_mv';
        component.widgetInput.positionColumnType = 'PORT';
        component.widgetInput.columnKey = 'pct_mv_1';
        component.widgetInput.title = 'Market Value %';
        component.ngOnInit();

        expect(component.clearTopBottomFilter).toHaveBeenCalledTimes(1);
        expect(component.selectedColumn).toBe('Market Value %');
    });

    /**
     * For a treemap widget there is no columns attribute as it has an x and y column instead.
     */
    it('check initialization with no columns attribute', () => {
        // Init with the treemap.
        widget = new Widget(WidgetConfigType.TREEMAP);
        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.TREEMAP, 'topBottomFilter');
        component.inputs = widget.dataStore.metaData.inputs;
        component.ngOnInit();

        // Validate that the columns was created and populated with the default x and y from the inputs.
        expect(component.columns).not.toBeUndefined();
        expect(component.columns.columns.length).toBe(2);
    });

    /**
     * Validate that when the current top/bottom filter column does not exist that the controls still initializes.
     */
    it('check initialization with invalid top/bottom column', () => {
        // Set the input to have an invalid column.
        const input = component.getInput(TopBottomFilterInput.configType) as TopBottomFilterInput;
        input.columnTag = 'invalid_column';

        // Init the control.
        component.ngOnInit();

        // Validate that it created correctly.
        expect(component.cols.length).toBeGreaterThan(0);
        expect(component.selectedColumn).toBe('');
    });

    it('test setupDisplayDataForColumns', () => {
        component.ngOnInit();
        component.cols.push(ColumnConfig.createColumn('issuer_count', 'PORT', 'issuer_count', 'Direct Issuer Count'));
        component.setupDisplayDataForColumns();

        expect(component.displayDataForColumns[0].values.length).toBe(4);

        const col1 = component.displayDataForColumns[0].values[0];
        expect(col1.displayValue).toBe('Market Value %');
        expect(col1.value).toBe('pct_mv_1');
        expect(col1.isSelected).toBe(false);

        const col4 = component.displayDataForColumns[0].values[3];
        expect(col4.displayValue).toBe('Direct Issuer Count');
        expect(col4.value).toBe('issuer_count');
        expect(col4.isSelected).toBe(false);
    });

    it('test clearTopBottomFilter', () => {
        component.selectedColumn = 'Market Value %';

        component.ngOnInit();
        jest.spyOn(component.widgetInput, 'reset');

        component.clearTopBottomFilter();

        expect(component.widgetInput.reset).toHaveBeenCalled();
        expect(component.selectedColumn).toBe(null);
    });

    it('test updateFilterColumn', () => {
        jest.spyOn(component, 'clearTopBottomFilter');

        component.ngOnInit();

        // @ts-ignore
        component.updateFilterColumn({detail: {value: null}});

        expect(component.clearTopBottomFilter).toHaveBeenCalled();

        component.selectedColumn = 'Market Value %';
        component.widgetInput.columnTag = 'pct_mv';
        component.widgetInput.positionColumnType = 'PORT';
        component.widgetInput.columnKey = 'pct_mv_1';

        // @ts-ignore
        component.updateFilterColumn({detail: {value: {value: 'market_val_1', displayValue: 'Market Value'}}});

        expect(component.widgetInput.columnKey).toBe('market_val_1');
        expect(component.widgetInput.positionColumnType).toBe('PORT');
        expect(component.widgetInput.columnTag).toBe('market_val');
        expect(component.widgetInput.title).toBe('Market Value');
        expect(component.widgetInput.childColumnOptions.size).toEqual(0);
        expect(component.selectedColumn).toBe('Market Value');

        // With override date but no override date types
        const overrideDateColOptionModel = new OverrideDateColumnOption();
        component.columns.columns[2].optionValues.push(overrideDateColOptionModel);
        // @ts-ignore
        component.updateFilterColumn({detail: {value: {value: 'pct_mv_1', displayValue: 'Market Value %'}}});

        expect(component.widgetInput.columnKey).toBe('pct_mv_1');
        expect(component.widgetInput.positionColumnType).toBe('PORT');
        expect(component.widgetInput.columnTag).toBe('pct_mv');
        expect(component.widgetInput.title).toBe('Market Value %');
        expect(component.widgetInput.childColumnOptions.size).toEqual(0);
        expect(component.selectedColumn).toBe('Market Value %');


        // With override date
        overrideDateColOptionModel.overrideDateTypes = ['PRIOR_DAY'];
        component.columns.columns[2].columnTitle = 'Market Value % PRIOR_DAY';
        // @ts-ignore
        component.updateFilterColumn({detail: {value: {value: 'pct_mv_1', displayValue: 'Market Value % PRIOR_DAY'}}});

        expect(component.widgetInput.columnKey).toBe('pct_mv_1');
        expect(component.widgetInput.positionColumnType).toBe('PORT');
        expect(component.widgetInput.columnTag).toBe('pct_mv');
        expect(component.widgetInput.title).toBe('Market Value % PRIOR_DAY');
        expect(component.selectedColumn).toBe('Market Value % PRIOR_DAY');
        expect(component.widgetInput.childColumnOptions.size).toEqual(1);
        expect((component.widgetInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption)).toEqual(overrideDateColOptionModel);

        // With override custom date
        overrideDateColOptionModel.overrideDateTypes = ['CUSTOM'];
        overrideDateColOptionModel.customOverrideDateLabel = '12/31/2021';
        component.columns.columns[2].columnTitle = 'Market Value % 12/31/2021';
        // @ts-ignore
        component.updateFilterColumn({detail: {value: {value: 'pct_mv_1', displayValue: 'Market Value % 12/31/2021'}}});

        expect(component.widgetInput.columnKey).toBe('pct_mv_1');
        expect(component.widgetInput.positionColumnType).toBe('PORT');
        expect(component.widgetInput.columnTag).toBe('pct_mv');
        expect(component.widgetInput.title).toBe('Market Value % 12/31/2021');
        expect(component.selectedColumn).toBe('Market Value % 12/31/2021');
        expect(component.widgetInput.childColumnOptions.size).toEqual(1);
        expect((component.widgetInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption)).toEqual(overrideDateColOptionModel);
    });

    it('test getAllWidgetColumns', () => {
        component.ngOnInit();

        // With override date column option model but no override dates
        const overrideDateColOptionModel = new OverrideDateColumnOption();
        component.columns.columns[2].optionValues.push(overrideDateColOptionModel);
        let cols = component.getAllWidgetColumns();
        expect(cols.length).toBe(3);
        expect(cols[0].columnTitle).toBe('Market Value %');
        let overrideDateColOption = (cols[0].getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        expect(overrideDateColOption.overrideDateTypes.length).toBe(0);

        // With override dates
        overrideDateColOptionModel.overrideDateTypes = ['PRIOR_DAY', 'CUSTOM'];
        overrideDateColOptionModel.customOverrideDateLabel = '10-Feb-2016';
        cols = component.getAllWidgetColumns();

        expect(cols.length).toBe(4);
        expect(cols[0].columnTitle).toBe('Market Value % PRIOR_DAY');
        overrideDateColOption = (cols[0].getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        expect(overrideDateColOption.overrideDateTypes.length).toBe(1);
        expect(overrideDateColOption.overrideDateTypes[0]).toBe('PRIOR_DAY');
        expect(cols[1].columnTitle).toBe('Market Value % 10-Feb-2016');
        overrideDateColOption = (cols[1].getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        expect(overrideDateColOption.overrideDateTypes.length).toBe(1);
        expect(overrideDateColOption.overrideDateTypes[0]).toEqual('CUSTOM');
        expect(overrideDateColOption.customOverrideDateLabel).toEqual('10-Feb-2016');
    });

    it('test getTitleForTopBottomFilter', () => {
        const col = ColumnConfig.createColumn('pct_mv', 'PORT');
        col.columnTitle = 'Market Value %';
        expect(component.getTitleForTopBottomFilter(col)).toBe('Market Value %');

        // With override date column option model but no override dates
        const overrideDateColOptionModel = new OverrideDateColumnOption();
        col.optionValues.push(overrideDateColOptionModel);
        expect(component.getTitleForTopBottomFilter(col)).toBe('Market Value %');

        // With override date column option model but no override dates and with custom title
        const customTitleColOption = new CustomTitleColumnOption();
        customTitleColOption.customTitle = 'Column1';
        col.optionValues.push(customTitleColOption);
        expect(component.getTitleForTopBottomFilter(col)).toBe('Column1');

        // With override date and no custom title
        overrideDateColOptionModel.overrideDateTypes = ['PRIOR_DAY'];
        col.optionValues.splice(1, 1);
        expect(component.getTitleForTopBottomFilter(col)).toBe('Market Value % PRIOR_DAY');

        // With override date and custom title
        col.optionValues.push(customTitleColOption);
        expect(component.getTitleForTopBottomFilter(col)).toBe('Column1 PRIOR_DAY');
    });

    it('test onTopValueChanged and onBottomValueChanged', () => {
        const event = {detail: {value: '5'}};
        component.widgetInput = new TopBottomFilterInput();
        component.onTopValueChanged(event as CustomEvent);
        expect(component.widgetInput.top).toBe(5);

        component.onBottomValueChanged(event as CustomEvent);
        expect(component.widgetInput.bottom).toBe(5);
    });

    it('should test updateSelectedResultLevel', () => {
        component.widgetInput = new TopBottomFilterInput();
        component.widgetInput.sectorLevel = false;
        component.widgetInput.withinSectorLevel = false;

        // selecting BY_SECTOR_IN_THE_BREAKDOWN
        const event: any = {detail: {value: {label: component.BY_SECTOR_IN_THE_BREAKDOWN}}};
        component.updateSelectedResultLevel(event);
        expect(component.widgetInput.sectorLevel).toBe(true);
        expect(component.widgetInput.withinSectorLevel).toBe(false);

        // selecting WITHIN_EACH_SECTOR_IN_THE_BREAKDOWN
        event.detail.value.label = component.WITHIN_EACH_SECTOR_IN_THE_BREAKDOWN;
        component.updateSelectedResultLevel(event);
        expect(component.widgetInput.sectorLevel).toBe(false);
        expect(component.widgetInput.withinSectorLevel).toBe(true);

        // selecting BY_INDIVIDUAL_SECURITIES
        event.detail.value.label = component.BY_INDIVIDUAL_SECURITIES;
        component.updateSelectedResultLevel(event);
        expect(component.widgetInput.sectorLevel).toBe(false);
        expect(component.widgetInput.withinSectorLevel).toBe(false);
    });

    it('getAllWidgetColumns - child climate columns', () => {
        const scenario1 = new ClimateScenario();
        scenario1.scenarioPercentile = 'mean';
        scenario1.scenarioPercentileDisplayName = 'Average Risk';
        scenario1.scenarioType = 'RCP 4.5';
        scenario1.scenarioTypeDisplayName = 'Expected Emissions';
        scenario1.scenarioYear = '2020';
        scenario1.scenarioYearDisplayName = 'Today';
        const scenario2 = new ClimateScenario();
        scenario2.scenarioPercentile = '0.83';
        scenario2.scenarioPercentileDisplayName = 'Tail End Risk';
        scenario2.scenarioType = 'RCP 8.5';
        scenario2.scenarioTypeDisplayName = 'High Emissions';
        scenario2.scenarioYear = '2050';
        scenario2.scenarioYearDisplayName = '2050';
        const climateScenariosColumnOption = new ClimateScenariosColumnOption();
        climateScenariosColumnOption.climateScenario.push(scenario1, scenario2);

        // create mock climate column def into the store because it is not in definitions.json
        const climateColumnDef = cloneDeep(CoreColumnUtils.getColumnDefByTag('pct_mv'));
        climateColumnDef.columnTag = 'pc_prepay_rate_1y';
        // @ts-ignore
        CoreDefinitionStore.columns.push(climateColumnDef);

        const climateCol = ColumnConfig.createColumn('pc_prepay_rate_1y', 'PORT', 'pc_prepay_rate_1y_bee6a142a9084b3', 'Physical Climate Adj. 1 Year CPR');
        climateCol.optionValues.push(climateScenariosColumnOption);
        component.columns = new ColumnSet();
        component.columns.columns = [
            ColumnConfig.createColumn('pct_mv', 'ALL', 'pct_mv_1', 'Market Value %'),
            climateCol
        ];

        const cols = component.getAllWidgetColumns();

        expect(cols.length).toEqual(3);
        expect(cols[1].columnTitle).toEqual('Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today');
        let climateScenarioOption = (cols[1].getOptionValueByConfigType(ClimateScenariosColumnOption.CONFIG_TYPE)) as ClimateScenariosColumnOption;
        expect(climateScenarioOption.climateScenario.length).toEqual(1);
        expect(climateScenarioOption.climateScenario[0]).toEqual(scenario1);
        expect(cols[2].columnTitle).toEqual('Physical Climate Adj. 1 Year CPR High Emissions Tail End Risk 2050');
        climateScenarioOption = (cols[2].getOptionValueByConfigType(ClimateScenariosColumnOption.CONFIG_TYPE)) as ClimateScenariosColumnOption;
        expect(climateScenarioOption.climateScenario.length).toEqual(1);
        expect(climateScenarioOption.climateScenario[0]).toEqual(scenario2);
    });

    it('getAllWidgetColumns - both override date and child climate columns', () => {
        const scenario1 = new ClimateScenario();
        scenario1.scenarioPercentile = 'mean';
        scenario1.scenarioPercentileDisplayName = 'Average Risk';
        scenario1.scenarioType = 'RCP 4.5';
        scenario1.scenarioTypeDisplayName = 'Expected Emissions';
        scenario1.scenarioYear = '2020';
        scenario1.scenarioYearDisplayName = 'Today';
        const scenario2 = new ClimateScenario();
        scenario2.scenarioPercentile = '0.83';
        scenario2.scenarioPercentileDisplayName = 'Tail End Risk';
        scenario2.scenarioType = 'RCP 8.5';
        scenario2.scenarioTypeDisplayName = 'High Emissions';
        scenario2.scenarioYear = '2050';
        scenario2.scenarioYearDisplayName = '2050';
        const climateScenariosColumnOption = new ClimateScenariosColumnOption();
        climateScenariosColumnOption.climateScenario.push(scenario1, scenario2);

        const overrideDateColOptionModel = new OverrideDateColumnOption();
        overrideDateColOptionModel.overrideDateTypes = ['PRIOR_DAY', 'MONTH_END'];

        // create mock climate column def into the store because it is not in definitions.json
        const climateColumnDef = cloneDeep(CoreColumnUtils.getColumnDefByTag('pct_mv'));
        climateColumnDef.columnTag = 'pc_prepay_rate_1y';
        // @ts-ignore
        CoreDefinitionStore.columns.push(climateColumnDef);

        const climateCol = ColumnConfig.createColumn('pc_prepay_rate_1y', 'PORT', 'pc_prepay_rate_1y_bee6a142a9084b3', 'Physical Climate Adj. 1 Year CPR');
        climateCol.optionValues.push(climateScenariosColumnOption, overrideDateColOptionModel);
        component.columns = new ColumnSet();
        component.columns.columns = [
            ColumnConfig.createColumn('pct_mv', 'ALL', 'pct_mv_1', 'Market Value %'),
            climateCol
        ];

        const cols = component.getAllWidgetColumns();

        expect(cols.length).toEqual(5);

        expect(cols[1].columnTitle).toEqual('Physical Climate Adj. 1 Year CPR PRIOR_DAY Expected Emissions Average Risk Today');
        let overrideDateColOption = (cols[1].getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        expect(overrideDateColOption.overrideDateTypes.length).toBe(1);
        expect(overrideDateColOption.overrideDateTypes[0]).toBe('PRIOR_DAY');
        let climateScenarioOption = (cols[1].getOptionValueByConfigType(ClimateScenariosColumnOption.CONFIG_TYPE)) as ClimateScenariosColumnOption;
        expect(climateScenarioOption.climateScenario.length).toEqual(1);
        expect(climateScenarioOption.climateScenario[0]).toEqual(scenario1);

        expect(cols[2].columnTitle).toEqual('Physical Climate Adj. 1 Year CPR PRIOR_DAY High Emissions Tail End Risk 2050');
        overrideDateColOption = (cols[2].getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        expect(overrideDateColOption.overrideDateTypes.length).toBe(1);
        expect(overrideDateColOption.overrideDateTypes[0]).toBe('PRIOR_DAY');
        climateScenarioOption = (cols[2].getOptionValueByConfigType(ClimateScenariosColumnOption.CONFIG_TYPE)) as ClimateScenariosColumnOption;
        expect(climateScenarioOption.climateScenario.length).toEqual(1);
        expect(climateScenarioOption.climateScenario[0]).toEqual(scenario2);

        expect(cols[3].columnTitle).toEqual('Physical Climate Adj. 1 Year CPR MONTH_END Expected Emissions Average Risk Today');
        overrideDateColOption = (cols[3].getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        expect(overrideDateColOption.overrideDateTypes.length).toBe(1);
        expect(overrideDateColOption.overrideDateTypes[0]).toBe('MONTH_END');
        climateScenarioOption = (cols[3].getOptionValueByConfigType(ClimateScenariosColumnOption.CONFIG_TYPE)) as ClimateScenariosColumnOption;
        expect(climateScenarioOption.climateScenario.length).toEqual(1);
        expect(climateScenarioOption.climateScenario[0]).toEqual(scenario1);

        expect(cols[4].columnTitle).toEqual('Physical Climate Adj. 1 Year CPR MONTH_END High Emissions Tail End Risk 2050');
        overrideDateColOption = (cols[4].getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)) as OverrideDateColumnOption;
        expect(overrideDateColOption.overrideDateTypes.length).toBe(1);
        expect(overrideDateColOption.overrideDateTypes[0]).toBe('MONTH_END');
        climateScenarioOption = (cols[4].getOptionValueByConfigType(ClimateScenariosColumnOption.CONFIG_TYPE)) as ClimateScenariosColumnOption;
        expect(climateScenarioOption.climateScenario.length).toEqual(1);
        expect(climateScenarioOption.climateScenario[0]).toEqual(scenario2);
    });

    it('getAllWidgetColumns - child stress scenario columns', () => {
        const scenario1 = new NamedScenario();
        scenario1.enabled = true;
        scenario1.name = 'Stock Market Drop Global';
        scenario1.code = 'MS_WORLD';
        scenario1.description = '1% probability movement of MSCI World Market Down';

        const scenario2 = new DateScenario();
        scenario2.enabled = true;
        scenario2.id = 'date109912537';
        scenario2.fromDate = DateValue.newDate('11/04/2020');
        scenario2.toDate = DateValue.newDate('11/11/2020');

        const scenario3 = new OtherScenario();
        scenario3.enabled = true;
        scenario3.id = 'other1485591441';
        scenario3.name = 'MS_WORLD';
        scenario3.purpose = 'test world';

        const scenariosColumnOption = new ScenarioColumnOption();
        scenariosColumnOption.nameScenarios.push(scenario1);
        scenariosColumnOption.dateScenarios.push(scenario2);
        scenariosColumnOption.otherScenarios.push(scenario3);

        // create mock stress column def into the store because it is not in definitions.json
        const stressColumnDef = cloneDeep(CoreColumnUtils.getColumnDefByTag('pct_mv'));
        stressColumnDef.columnTag = 'rfv_strss_pnl_pt_abs';
        // @ts-ignore
        CoreDefinitionStore.columns.push(stressColumnDef);

        const stressCol = ColumnConfig.createColumn('rfv_strss_pnl_pt_abs', 'PORT', 'rfv_strss_pnl_pt_abs_6613e8066d4f498', 'Monetary Stress P&L');
        stressCol.optionValues.push(scenariosColumnOption);
        component.columns = new ColumnSet();
        component.columns.columns = [
            ColumnConfig.createColumn('pct_mv', 'ALL', 'pct_mv_1', 'Market Value %'),
            stressCol
        ];

        const cols = component.getAllWidgetColumns();

        expect(cols.length).toEqual(4);

        expect(cols[1].columnTitle).toEqual('Monetary Stress P&L Stock Market Drop Global');
        let stressScenarioOption = (cols[1].getOptionValueByConfigType(ScenarioColumnOption.CONFIG_TYPE)) as ScenarioColumnOption;
        expect(stressScenarioOption.nameScenarios).toHaveLength(1);
        expect(stressScenarioOption.nameScenarios[0]).toEqual(scenario1);
        expect(stressScenarioOption.dateScenarios).toHaveLength(0);
        expect(stressScenarioOption.otherScenarios).toHaveLength(0);

        expect(cols[2].columnTitle).toEqual('Monetary Stress P&L 11/04/2020-11/11/2020');
        stressScenarioOption = (cols[2].getOptionValueByConfigType(ScenarioColumnOption.CONFIG_TYPE)) as ScenarioColumnOption;
        expect(stressScenarioOption.nameScenarios).toHaveLength(0);
        expect(stressScenarioOption.dateScenarios).toHaveLength(1);
        expect(stressScenarioOption.dateScenarios[0]).toEqual(scenario2);
        expect(stressScenarioOption.otherScenarios).toHaveLength(0);

        expect(cols[3].columnTitle).toEqual('Monetary Stress P&L MS_WORLD test world');
        stressScenarioOption = (cols[3].getOptionValueByConfigType(ScenarioColumnOption.CONFIG_TYPE)) as ScenarioColumnOption;
        expect(stressScenarioOption.nameScenarios).toHaveLength(0);
        expect(stressScenarioOption.dateScenarios).toHaveLength(0);
        expect(stressScenarioOption.otherScenarios).toHaveLength(1);
        expect(stressScenarioOption.otherScenarios[0]).toEqual(scenario3);
    });

    it('getTitleForTopBottomFilter - child climate columns', () => {
        const scenario = new ClimateScenario();
        scenario.scenarioPercentile = 'mean';
        scenario.scenarioPercentileDisplayName = 'Average Risk';
        scenario.scenarioType = 'RCP 4.5';
        scenario.scenarioTypeDisplayName = 'Expected Emissions';
        scenario.scenarioYear = '2020';
        scenario.scenarioYearDisplayName = 'Today';
        const climateScenariosColumnOption = new ClimateScenariosColumnOption();
        climateScenariosColumnOption.climateScenario.push(scenario);

        const climateCol = ColumnConfig.createColumn('pc_prepay_rate_1y', 'PORT', 'pc_prepay_rate_1y_bee6a142a9084b3', 'Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today');
        climateCol.optionValues.push(climateScenariosColumnOption);

        const title = component.getTitleForTopBottomFilter(climateCol);
        expect(title).toEqual('Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today');
    });

    it('getTitleForTopBottomFilter - child climate columns with custom title', () => {
        const scenario = new ClimateScenario();
        scenario.scenarioPercentile = 'mean';
        scenario.scenarioPercentileDisplayName = 'Average Risk';
        scenario.scenarioType = 'RCP 4.5';
        scenario.scenarioTypeDisplayName = 'Expected Emissions';
        scenario.scenarioYear = '2020';
        scenario.scenarioYearDisplayName = 'Today';
        const climateScenariosColumnOption = new ClimateScenariosColumnOption();
        climateScenariosColumnOption.climateScenario.push(scenario);

        const customTitleColumnOption = new CustomTitleColumnOption();
        customTitleColumnOption.customTitle = 'Custom Climate Title';

        const climateCol = ColumnConfig.createColumn('pc_prepay_rate_1y', 'PORT', 'pc_prepay_rate_1y_bee6a142a9084b3', 'Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today');
        climateCol.optionValues.push(climateScenariosColumnOption, customTitleColumnOption);

        const title = component.getTitleForTopBottomFilter(climateCol);
        expect(title).toEqual('Custom Climate Title Expected Emissions Average Risk Today');
    });

    it('getTitleForTopBottomFilter - child stress scenario columns', () => {
        const scenario1 = new NamedScenario();
        scenario1.enabled = true;
        scenario1.name = 'Stock Market Drop Global';
        scenario1.code = 'MS_WORLD';
        scenario1.description = '1% probability movement of MSCI World Market Down';
        const scenariosColumnOption = new ScenarioColumnOption();
        scenariosColumnOption.nameScenarios.push(scenario1);

        const stressCol = ColumnConfig.createColumn('rfv_strss_pnl_pt_abs', 'PORT', 'rfv_strss_pnl_pt_abs_6613e8066d4f498', 'Monetary Stress P&L Stock Market Drop Global');
        stressCol.optionValues.push(scenariosColumnOption);

        const title = component.getTitleForTopBottomFilter(stressCol);
        expect(title).toEqual('Monetary Stress P&L Stock Market Drop Global');
    });

    it('getTitleForTopBottomFilter - both override date and child climate columns', () => {
        const scenario = new ClimateScenario();
        scenario.scenarioPercentile = 'mean';
        scenario.scenarioPercentileDisplayName = 'Average Risk';
        scenario.scenarioType = 'RCP 4.5';
        scenario.scenarioTypeDisplayName = 'Expected Emissions';
        scenario.scenarioYear = '2020';
        scenario.scenarioYearDisplayName = 'Today';
        const climateScenariosColumnOption = new ClimateScenariosColumnOption();
        climateScenariosColumnOption.climateScenario.push(scenario);

        const overrideDateColOptionModel = new OverrideDateColumnOption();
        overrideDateColOptionModel.overrideDateTypes = ['PRIOR_DAY'];

        const climateCol = ColumnConfig.createColumn('pc_prepay_rate_1y', 'PORT', 'pc_prepay_rate_1y_bee6a142a9084b3', 'Physical Climate Adj. 1 Year CPR PRIOR_DAY Expected Emissions Average Risk Today');
        climateCol.optionValues.push(climateScenariosColumnOption, overrideDateColOptionModel);

        const title = component.getTitleForTopBottomFilter(climateCol);
        expect(title).toEqual('Physical Climate Adj. 1 Year CPR PRIOR_DAY Expected Emissions Average Risk Today');
    });

    it('updateFilterColumn with climate scenario', () => {
        const scenario = new ClimateScenario();
        scenario.scenarioPercentile = 'mean';
        scenario.scenarioPercentileDisplayName = 'Average Risk';
        scenario.scenarioType = 'RCP 4.5';
        scenario.scenarioTypeDisplayName = 'Expected Emissions';
        scenario.scenarioYear = '2020';
        scenario.scenarioYearDisplayName = 'Today';
        const climateScenariosColumnOption = new ClimateScenariosColumnOption();
        climateScenariosColumnOption.climateScenario.push(scenario);

        const climateCol = ColumnConfig.createColumn('pc_prepay_rate_1y', 'PORT', 'pc_prepay_rate_1y_bee6a142a9084b3', 'Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today');
        climateCol.optionValues.push(climateScenariosColumnOption);

        component.cols = [climateCol];
        component.widgetInput = new TopBottomFilterInput();

        component.updateFilterColumn(new CustomEvent('AuxSelectSelectionChangedDetailInterface', {
            detail: {
                value: {
                    value: 'pc_prepay_rate_1y_bee6a142a9084b3',
                    displayValue: 'Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today'
                }
            },
            srcEvent: {}
        }));

        expect(component.widgetInput.columnTag).toEqual('pc_prepay_rate_1y');
        expect(component.widgetInput.positionColumnType).toEqual('PORT');
        expect(component.widgetInput.columnKey).toEqual('pc_prepay_rate_1y_bee6a142a9084b3');
        expect(component.widgetInput.title).toEqual('Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today');
        expect(component.widgetInput.childColumnOptions.size).toEqual(1);
        expect((component.widgetInput.childColumnOptions.get(ClimateScenariosColumnOption.CONFIG_TYPE) as ClimateScenariosColumnOption).climateScenario[0]).toEqual(scenario);
    });

    it('updateFilterColumn with stress scenario', () => {
        const scenario1 = new NamedScenario();
        scenario1.enabled = true;
        scenario1.name = 'Stock Market Drop Global';
        scenario1.code = 'MS_WORLD';
        scenario1.description = '1% probability movement of MSCI World Market Down';
        const scenariosColumnOption = new ScenarioColumnOption();
        scenariosColumnOption.nameScenarios.push(scenario1);

        const stressCol = ColumnConfig.createColumn('rfv_strss_pnl_pt_abs', 'PORT', 'rfv_strss_pnl_pt_abs_6613e8066d4f498', 'Monetary Stress P&L Stock Market Drop Global');
        stressCol.optionValues.push(scenariosColumnOption);

        component.cols = [stressCol];
        component.widgetInput = new TopBottomFilterInput();

        component.updateFilterColumn(new CustomEvent('AuxSelectSelectionChangedDetailInterface', {
            detail: {
                value: {
                    value: 'rfv_strss_pnl_pt_abs_6613e8066d4f498',
                    displayValue: 'Monetary Stress P&L Stock Market Drop Global'
                }
            },
            srcEvent: {}
        }));

        expect(component.widgetInput.columnTag).toEqual('rfv_strss_pnl_pt_abs');
        expect(component.widgetInput.positionColumnType).toEqual('PORT');
        expect(component.widgetInput.columnKey).toEqual('rfv_strss_pnl_pt_abs_6613e8066d4f498');
        expect(component.widgetInput.title).toEqual('Monetary Stress P&L Stock Market Drop Global');
        expect(component.widgetInput.childColumnOptions.size).toEqual(1);

        const namedScenario = (component.widgetInput.childColumnOptions.get(ScenarioColumnOption.CONFIG_TYPE) as ScenarioColumnOption).nameScenarios[0];
        expect(namedScenario).toEqual(scenario1);
    });

    it('returns any column option derived from ClimateScenarioColumnOption', () => {
        const column = ColumnConfig.createColumn('pc_prepay_rate_1y', 'PORT', 'pc_prepay_rate_1y_06f97c8b82f0432', 'Physical Climate Adj. 1 Year CPR');

        column.optionValues = [new ClimateScenariosColumnOption()];
        expect(TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(column) instanceof ClimateScenariosColumnOption).toEqual(true);

        column.optionValues = [new TransitionClimateScenariosColumnOption()];
        expect(TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(column) instanceof ClimateScenariosColumnOption).toEqual(true);

        column.optionValues = [new CombinedClimateScenariosColumnOption()];
        expect(TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(column) instanceof ClimateScenariosColumnOption).toEqual(true);

        column.optionValues = [new TempAlignmentScenariosColumnOption()];
        expect(TopBottomFilterSettingsComponent.getClimateScenarioColumnOption(column) instanceof ClimateScenariosColumnOption).toEqual(true);
    });

    it('should retain the child column when initialized with existing top/bottom filter', () => {
        const overrideDateColOptionModel = new OverrideDateColumnOption();
        overrideDateColOptionModel.overrideDateTypes = ['PRIOR_DAY', 'MONTH_END'];

        const col = ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'Market Value %');
        col.optionValues.push(overrideDateColOptionModel);

        const columnSet = new ColumnSet();
        columnSet.columns = [col];

        component.inputs.set('columns', columnSet);
        component.columns = columnSet;

        component.widgetInput = new TopBottomFilterInput();
        component.widgetInput.columnTag = 'pct_mv';
        component.widgetInput.columnKey = 'pct_mv_1';
        component.widgetInput.title = 'Market Value % MONTH_END';
        component.widgetInput.childColumnOptions.set(overrideDateColOptionModel.configType, overrideDateColOptionModel);
        component.widgetInput.top = 2;
        component.widgetInput.bottom = 0;

        component.initializeComponent();
        const selectedCol = component.selectedColumn;
        expect(selectedCol).toEqual('Market Value % MONTH_END');
    });
});
