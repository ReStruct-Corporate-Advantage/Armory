import {FactorTimeSeriesService} from './factor-time-series.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {
    ChartWidgetInputConfigType,
    ColumnConstants,
    DateFormatConstants,
    WidgetConfigType,
    WidgetDisplayInputConfigType,
    WidgetInput
} from '@blk/explore-ui-core';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {Widget} from '@models/widget/widget.model';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {ChartType} from '@qbstr/highcharts-api';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {FilterIncludeKey, GroupByKey} from '@qbstr/data-cube';
import {Report} from '@models/workspace/report.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {BehaviorSubject} from 'rxjs';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';

describe('FactorTimeSeriesService', () => {
    let service: FactorTimeSeriesService;
    let exploreDataRequestService: ExploreDataRequestService;
    let widgetInputs: Map<string, WidgetInput>;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new FactorTimeSeriesService(exploreDataRequestService);
    });

    beforeEach((done) => {
        TestUtils.initialize(done);
        widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN, new Breakdown());
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, new Breakdown());

        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new FlatWorkpad());
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES], 'N');
    });

    it('Test modifyWidgetInputsForRequest no riskSetting)', function () {
        service['modifyWidgetInputsForRequest'](widgetInputs, null);
        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN)).toBeTruthy();
        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toBeTruthy();
    });

    it('Test modifyWidgetInputsForRequest disable breakdown as false)', function () {

        const riskColumnSettings: RiskColumnSettings = new RiskColumnSettings();
        riskColumnSettings.disableFactorBreakdown = false;
        riskColumnSettings.disableSectorBreakdown = false;
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS, riskColumnSettings);
        service['modifyWidgetInputsForRequest'](widgetInputs, null);
        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN)).toBeTruthy();
        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toBeTruthy();
    });

    it('Test modifyWidgetInputsForRequest disableSectorBreakdown as true)', function () {
        const riskColumnSettings: RiskColumnSettings = new RiskColumnSettings();
        riskColumnSettings.disableFactorBreakdown = false;
        riskColumnSettings.disableSectorBreakdown = true;
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS, riskColumnSettings);
        service['modifyWidgetInputsForRequest'](widgetInputs, null);
        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN)).toBeFalsy();
        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toBeTruthy();
    });

    it('Test modifyWidgetInputsForRequest disableFactorBreakdown as true)', function () {
        const riskColumnSettings: RiskColumnSettings = new RiskColumnSettings();
        riskColumnSettings.disableFactorBreakdown = true;
        riskColumnSettings.disableSectorBreakdown = false;
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS, riskColumnSettings);
        service['modifyWidgetInputsForRequest'](widgetInputs, null);

        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN)).toBeTruthy();
        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toBeFalsy();
    });

    it('Test modifyWidgetInputsForRequest disable both breakdowns)', function () {
        const riskColumnSettings: RiskColumnSettings = new RiskColumnSettings();
        riskColumnSettings.disableFactorBreakdown = true;
        riskColumnSettings.disableSectorBreakdown = true;
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS, riskColumnSettings);
        service['modifyWidgetInputsForRequest'](widgetInputs, null);

        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN)).toBeFalsy();
        expect(widgetInputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toBeFalsy();
    });

    it('validateInputs - valid scenarios', () => {
        const notification = service['validateInputs'](new Widget(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES), null, new Report());
        expect(notification).toBeNull();
    });

    it('validateInputs - comparison mode', () => {
        const report = new Report('report');
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(report.comparisonConfigId, new ComparisonConfig({portComparisonList: ['PEP', 'PEP_1']}));
        const notification = service['validateInputs'](new Widget(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES), null, report);
        expect(notification.isEmpty()).toEqual(false);
    });

    it('creates customVizConfig - ROOT', () => {
        const timeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.chartType = ChartType.BAR;
        timeSeriesSettings.dateFormat = DateFormatConstants.ALADDIN_DATE_FORMAT_NAME;
        timeSeriesSettings.includeTotalValues = true;
        timeSeriesSettings.periods = 3;
        timeSeriesSettings.frequency = 'MONTH_END';

        const factorPathInput = new FactorPathInput();
        factorPathInput.path = [{level: '_ROOT_', value: 'PEP'}];

        const gridLines = new GridLines();
        gridLines.showGridLines = true;

        const widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);
        widgetInputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, timeSeriesSettings);
        widgetInputs.set(FactorPathInput.configType, factorPathInput);
        widget.dataStore.metaData.inputs = widgetInputs;
        widget.displayInputs.set(WidgetDisplayInputConfigType.SHOW_GRID_LINES, gridLines);

        const comboChartSettings = new ComboChartColumnSettings();
        comboChartSettings.columns = [new ComboChartColumn({colKey: 'pct_mv', chartType: ColumnSeriesChartType.BAR, secondaryAxis: false})];
        widget.displayInputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, comboChartSettings);

        const customVizConfig = service['customVizConfig'](widget, widgetInputs, 'PEP');

        expect(customVizConfig.showGridLines).toEqual(true);
        expect(customVizConfig.showTotal).toEqual(true);
        expect(customVizConfig.dateFormat).toEqual(DateFormatConstants.ALADDIN_DATE_FORMAT_NAME);
        expect(customVizConfig.queryKeys).toEqual([new FilterIncludeKey('_ROOT_', ['PEP'])]);
        expect(customVizConfig.leafLevels).toBeUndefined();
        expect(customVizConfig.seriesNameFieldOverride).toEqual(ColumnConstants.FBA_TITLE);
        expect(customVizConfig.comboChartColumns).toEqual(comboChartSettings.columns);
    });

    it('creates customVizConfig - factor group', () => {
        const timeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.chartType = ChartType.BAR;
        timeSeriesSettings.dateFormat = DateFormatConstants.ALADDIN_DATE_FORMAT_NAME;
        timeSeriesSettings.includeTotalValues = true;
        timeSeriesSettings.periods = 3;
        timeSeriesSettings.frequency = 'MONTH_END';

        const factorPathInput = new FactorPathInput();
        factorPathInput.path = [
            {level: '_ROOT_', value: 'PEP'},
            {level: 'level-1', value: 'COUNTRY'}
        ];

        const gridLines = new GridLines();
        gridLines.showGridLines = true;

        const widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);
        widgetInputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, timeSeriesSettings);
        widgetInputs.set(FactorPathInput.configType, factorPathInput);
        widget.dataStore.metaData.inputs = widgetInputs;
        widget.displayInputs.set(WidgetDisplayInputConfigType.SHOW_GRID_LINES, gridLines);

        const comboChartSettings = new ComboChartColumnSettings();
        comboChartSettings.columns = [new ComboChartColumn({colKey: 'pct_mv', chartType: ColumnSeriesChartType.BAR, secondaryAxis: false})];
        widget.displayInputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, comboChartSettings);

        const customVizConfig = service['customVizConfig'](widget, widgetInputs, 'PEP');

        expect(customVizConfig.showGridLines).toEqual(true);
        expect(customVizConfig.showTotal).toEqual(true);
        expect(customVizConfig.dateFormat).toEqual(DateFormatConstants.ALADDIN_DATE_FORMAT_NAME);
        expect(customVizConfig.queryKeys).toEqual([
            new FilterIncludeKey('_ROOT_', ['PEP']),
            new GroupByKey('level-1'),
            new FilterIncludeKey('level-2', ['COUNTRY'])
        ]);
        expect(customVizConfig.leafLevels).toEqual([ColumnConstants.FBA_BLOCK_PATH]);
        expect(customVizConfig.seriesNameFieldOverride).toEqual(ColumnConstants.FBA_TITLE);
        expect(customVizConfig.comboChartColumns).toEqual(comboChartSettings.columns);
    });

    it('creates customVizConfig - lowest factor level', () => {
        const timeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.chartType = ChartType.BAR;
        timeSeriesSettings.dateFormat = DateFormatConstants.ALADDIN_DATE_FORMAT_NAME;
        timeSeriesSettings.includeTotalValues = true;
        timeSeriesSettings.periods = 3;
        timeSeriesSettings.frequency = 'MONTH_END';

        const factorPathInput = new FactorPathInput();
        factorPathInput.path = [
            {level: '_ROOT_', value: 'PEP'},
            {level: 'level-1', value: 'COUNTRY'},
            {level: 'rfv_block_path', value: '15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_STYLE:FMI_WRLD_MARKET'}
        ];

        const gridLines = new GridLines();
        gridLines.showGridLines = true;

        const widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);
        widgetInputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, timeSeriesSettings);
        widgetInputs.set(FactorPathInput.configType, factorPathInput);
        widget.dataStore.metaData.inputs = widgetInputs;
        widget.displayInputs.set(WidgetDisplayInputConfigType.SHOW_GRID_LINES, gridLines);

        const comboChartSettings = new ComboChartColumnSettings();
        comboChartSettings.columns = [new ComboChartColumn({colKey: 'pct_mv', chartType: ColumnSeriesChartType.BAR, secondaryAxis: false})];
        widget.displayInputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, comboChartSettings);

        const customVizConfig = service['customVizConfig'](widget, widgetInputs, 'PEP');

        expect(customVizConfig.showGridLines).toEqual(true);
        expect(customVizConfig.showTotal).toEqual(false);
        expect(customVizConfig.dateFormat).toEqual(DateFormatConstants.ALADDIN_DATE_FORMAT_NAME);
        expect(customVizConfig.queryKeys).toEqual([
            new FilterIncludeKey('_ROOT_', ['PEP']),
            new GroupByKey('level-1'),
            new FilterIncludeKey('level-2', ['COUNTRY']),
            new FilterIncludeKey('rfv_block_path', ['15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_STYLE:FMI_WRLD_MARKET'])
        ]);
        expect(customVizConfig.leafLevels).toEqual([ColumnConstants.FBA_BLOCK_PATH]);
        expect(customVizConfig.seriesNameFieldOverride).toEqual(ColumnConstants.FBA_TITLE);
        expect(customVizConfig.comboChartColumns).toEqual(comboChartSettings.columns);
    });

    it('creates customVizConfig - lowest factor level - backwards compatibility where FactorPathInput keyed by rfv_ftitle', () => {
        const timeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.chartType = ChartType.BAR;
        timeSeriesSettings.dateFormat = DateFormatConstants.ALADDIN_DATE_FORMAT_NAME;
        timeSeriesSettings.includeTotalValues = true;
        timeSeriesSettings.periods = 3;
        timeSeriesSettings.frequency = 'MONTH_END';

        const factorPathInput = new FactorPathInput();
        factorPathInput.path = [
            {level: '_ROOT_', value: 'PEP'},
            {level: 'level-1', value: 'COUNTRY'},
            {level: 'rfv_ftitle', value: 'Market'}
        ];

        const gridLines = new GridLines();
        gridLines.showGridLines = true;

        const widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);
        widgetInputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, timeSeriesSettings);
        widgetInputs.set(FactorPathInput.configType, factorPathInput);
        widget.dataStore.metaData.inputs = widgetInputs;
        widget.displayInputs.set(WidgetDisplayInputConfigType.SHOW_GRID_LINES, gridLines);

        const comboChartSettings = new ComboChartColumnSettings();
        comboChartSettings.columns = [new ComboChartColumn({colKey: 'pct_mv', chartType: ColumnSeriesChartType.BAR, secondaryAxis: false})];
        widget.displayInputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, comboChartSettings);

        const customVizConfig = service['customVizConfig'](widget, widgetInputs, 'PEP');

        expect(customVizConfig.showGridLines).toEqual(true);
        expect(customVizConfig.showTotal).toEqual(false);
        expect(customVizConfig.dateFormat).toEqual(DateFormatConstants.ALADDIN_DATE_FORMAT_NAME);
        expect(customVizConfig.queryKeys).toEqual([
            new FilterIncludeKey('_ROOT_', ['PEP']),
            new GroupByKey('level-1'),
            new FilterIncludeKey('level-2', ['COUNTRY']),
            new FilterIncludeKey('rfv_ftitle', ['Market'])
        ]);
        expect(customVizConfig.leafLevels).toEqual([ColumnConstants.FBA_TITLE]);
        expect(customVizConfig.seriesNameFieldOverride).toEqual(ColumnConstants.FBA_TITLE);
        expect(customVizConfig.comboChartColumns).toEqual(comboChartSettings.columns);
    });
});
