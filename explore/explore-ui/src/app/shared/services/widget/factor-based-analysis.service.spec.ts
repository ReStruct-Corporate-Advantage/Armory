import {ColumnSet, ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {ColumnConfig, CoreColumnUtils, DateScenario, DateValue, NamedScenario, OtherScenario, PerformanceSettings, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {NotificationConstants} from '@constants/notification.constants';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {Notification} from '@models/widget/notification.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {FactorBasedAnalysisService} from '@services/widget/factor-based-analysis.service';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {WidgetUtils} from '@utils/widget.utils';
import * as fbaResponseDataMock from '../../../../../mocks/fbaResponseDataMock.json';
import * as fbaResponseDataMock2 from '../../../../../mocks/fbaResponseDataMock2.json';

describe('FactorBasedAnalysisService Test', () => {
    let service: FactorBasedAnalysisService;
    let exploreDataRequestService: ExploreDataRequestService;
    let widgetInputs: Map<string, WidgetInput>;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new FactorBasedAnalysisService(exploreDataRequestService);
    });

    beforeEach((done) => {
        TestUtils.initialize(done);
        widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN, new Breakdown());
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, new Breakdown());
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.PRA], 'N');
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

    it('should check getMultiPortCompareUrl', () => {
        expect(service.getMultiPortCompareUrl()).toBe('getRiskFactorMultiPortCompareData');
    });

    describe('getAssetsCount Test', () => {
        it('should count number of assets to feed in footerDetails', () => {
            expect(service['getAssetsCount']({data: []})).toBe(0);
            expect(service['getAssetsCount'](fbaResponseDataMock)).toBe(0);
            expect(service['getAssetsCount'](fbaResponseDataMock2)).toBe(3);
        });
    });

    it('tests hasStressScenarios', () => {
        const columnConfig = new ColumnConfig();
        expect(service['hasStressScenario'](columnConfig)).toEqual(false);
        const scenarioColumnOption = new ScenarioColumnOption();
        scenarioColumnOption.nameScenarios = [];
        scenarioColumnOption.dateScenarios = [];
        scenarioColumnOption.otherScenarios = [];
        columnConfig.optionValues = [];
        columnConfig.optionValues.push(scenarioColumnOption);
        expect(service['hasStressScenario'](columnConfig)).toEqual(true);
        scenarioColumnOption.nameScenarios = [new NamedScenario()];
        scenarioColumnOption.dateScenarios = [];
        scenarioColumnOption.otherScenarios = [];
        columnConfig.optionValues = [];
        columnConfig.optionValues.push(scenarioColumnOption);
        expect(service['hasStressScenario'](columnConfig)).toEqual(false);
        scenarioColumnOption.nameScenarios = [];
        scenarioColumnOption.dateScenarios = [new DateScenario()];
        scenarioColumnOption.otherScenarios = [];
        columnConfig.optionValues = [];
        columnConfig.optionValues.push(scenarioColumnOption);
        expect(service['hasStressScenario'](columnConfig)).toEqual(false);
        scenarioColumnOption.nameScenarios = [];
        scenarioColumnOption.dateScenarios = [];
        scenarioColumnOption.otherScenarios = [new OtherScenario()];
        columnConfig.optionValues = [];
        columnConfig.optionValues.push(scenarioColumnOption);
        expect(service['hasStressScenario'](columnConfig)).toEqual(false);
        scenarioColumnOption.nameScenarios = [new NamedScenario()];
        scenarioColumnOption.dateScenarios = [new DateScenario()];
        scenarioColumnOption.otherScenarios = [new OtherScenario()];
        columnConfig.optionValues = [];
        columnConfig.optionValues.push(scenarioColumnOption);
        expect(service['hasStressScenario'](columnConfig)).toEqual(false);
    });

    it('tests validateInputs', () => {
        const widgetObj = new Widget(WidgetConfigType.PRA);
        const columnSet = new ColumnSet();
        widgetObj.dataStore.metaData.inputs.set('columns', columnSet);
        jest.spyOn<any, any>(service, 'hasStressScenario').mockReturnValue(true);
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP'), new Report()).message).toEqual(NotificationConstants.INVALID_PORTDATE_MESSAGE);
        columnSet.columns = [new ColumnConfig()];
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP'), new Report()).message).toEqual(NotificationConstants.NO_STRESS_SCENARIOS_SELECTED);
        jest.resetAllMocks();
        jest.spyOn<any, any>(service, 'hasStressScenario').mockReturnValue(false);
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP'), new Report()).message).toEqual(NotificationConstants.INVALID_PORTDATE_MESSAGE);
        columnSet.columns = undefined;
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP'), new Report()).message).toEqual(NotificationConstants.INVALID_PORTDATE_MESSAGE);
    });

    it('tests propagatePointColorToChildren', () => {
        const responseDataChildren = [
            {
                color: '#a',
                children: [
                    {
                        children: [
                            {
                                children: [{}]
                            }
                        ]
                    },
                    {}
                ]
            },
            {color: '#b'}
        ];
        service['propagatePointColorToChildren'](responseDataChildren as any);
        expect(responseDataChildren).toStrictEqual([{
            'color': '#a',
            'children': [{
                'children': [{'children': [{'color': '#a--restrict'}], 'color': '#a--restrict'}],
                'color': '#a--restrict'
            }, {'color': '#a--restrict'}]
        }, {'color': '#b'}]);
    });

    it('tests validateInputs for macro factor breakdown', () => {
        let port = new Portfolio('test_ticker', new DateValue({date: '03/10/2016', calCode: 'GreenPkg'}));
        port.benchmark = Benchmark.create('RISK', 1, 'TEST');
        port.portName = 'test_ticker';
        port.fullName = 'test_fullname';
        port.title = 'test_name';
        port.currency = 'USD';
        port.performanceSettings.attributionSettings.cannedMethod = 'FIXED_INCOME';
        port.portfolioRiskSettings = new RiskSettings();
        port.portId = 'test_ticker12345';
        const report: Report = new Report();
        const widgetObj = new Widget(WidgetConfigType.PRA);

        jest.spyOn(WidgetUtils, 'hasMacroFactorBreakdown').mockReturnValue(true);

        jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType').mockReturnValue(null);
        expect(service['validateInputs'](widgetObj, port, new Report())).toBe(null);

        jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType').mockReturnValue(new PerformanceSettings());
        const notification = service['validateInputs'](widgetObj, port, new Report()) as Notification;
        expect(notification).toBeDefined();
        expect(notification.message).toEqual(NotificationConstants.WIDGET_MACRO_FACTOR_BREAKDOWN_WITH_PERFORMANCE_COL_MSG);
    });

});
