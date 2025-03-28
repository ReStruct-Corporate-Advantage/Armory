import {ColumnSet} from '@blk/explore-ui-column-option';
import {ColumnConfig, PerformanceSettings, WidgetConfigType, WidgetInput, WidgetInputType, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {ExploreResponse} from '@interfaces/response.interface';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FactorBlockInput} from '@models/widget/inputs/factor-block-input.model';
import {Widget} from '@models/widget/widget.model';
import {NotificationService} from '@services/notification';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {SecurityContributionDataService} from './security-contribution-data.service';

describe('SecurityContributionDataService', () => {
    let service: SecurityContributionDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    let widgetInputs: Map<string, WidgetInput>;
    let factorBlockInput: FactorBlockInput;
    let widget: Widget;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new SecurityContributionDataService(exploreDataRequestService, new NotificationService());
    });

    beforeEach((done) => {
        TestUtils.initialize(done);
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        widget = new Widget(WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION);
        widget.dataStore.isDependentOnParentForMetaData = true;

        factorBlockInput = new FactorBlockInput();
        factorBlockInput.isBlock = true;
        factorBlockInput.blockPath = '779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should validate service', () => {
        validateService(service, [WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION], undefined);
    });

    it('should add security contribution default columns from config', () => {
        widgetInputs = new Map<string, WidgetInput>();
        const columnSet = new ColumnSet({
            columns: [
                ColumnConfig.createColumn('rfv_ftitle', 'ALL', 'rfv_ftitle', ' Title'),
                ColumnConfig.createColumn('rfv_factor_type', 'ALL', 'rfv_factor_type_2', 'Factor Type'),
                ColumnConfig.createColumn('rfv_factor_vol', 'ALL', 'rfv_factor_vol_5', 'Factor Vol'),
                ColumnConfig.createColumn('rfv_contrib_port', 'PORT', 'rfv_contrib_port_4', 'Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_bench', 'BENCH', 'rfv_contrib_bench_674', 'Benchmark Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_active', 'ACTIVE', 'rfv_contrib_active_645', 'Active Risk Contribution')
            ]
        });
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        widgetInputs.set(FactorBlockInput.configType, factorBlockInput);
        widgetInputs.set(RiskSettings.CONFIG_TYPE, new RiskSettings());
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, new Breakdown());
        widgetInputs.set(PerformanceSettings.CONFIG_TYPE, new PerformanceSettings());

        widget.dataStore.metaData.inputs = widgetInputs;

        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        const columnSetResult = widgetInputs.get('columns') as ColumnSet;
        expect(columnSetResult.columns.length).toBe(8);
    });

    it('should reject columns that have a risk settings applied', () => {
        const riskSettings = new RiskSettings();
        riskSettings.getRequestParams = jest.fn().mockReturnValue({
            economyRiskSettings: {},
            exposureRiskSettings: {},
            advancedRiskSettings: {}
        });

        widgetInputs = new Map<string, WidgetInput>();
        const columnSet = new ColumnSet({
            columns: [
                ColumnConfig.createColumn('rfv_ftitle', 'ALL', 'rfv_ftitle', ' Title'),
                ColumnConfig.createColumn('rfv_factor_type', 'ALL', 'rfv_factor_type_2', 'Factor Type'),
                ColumnConfig.createColumn('rfv_factor_vol', 'ALL', 'rfv_factor_vol_5', 'Factor Vol'),
                ColumnConfig.createColumn('rfv_contrib_port', 'PORT', 'rfv_contrib_port_4', 'Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_bench', 'BENCH', 'rfv_contrib_bench_674', 'Benchmark Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_active', 'ACTIVE', 'rfv_contrib_active_645', 'Active Risk Contribution')
            ]
        });
        columnSet.columns[3].optionValues = [riskSettings];
        columnSet.columns[4].optionValues = [riskSettings];
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        widgetInputs.set(FactorBlockInput.configType, factorBlockInput);
        widget.dataStore.metaData.inputs = widgetInputs;

        jest.spyOn(service['notificationService'], 'warning');

        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        const columnSetResult = widgetInputs.get('columns') as ColumnSet;
        expect(columnSetResult.columns.length).toBe(6);
        expect(service['notificationService'].warning).toHaveBeenCalledTimes(1);
    });

    it('should add factorBlockPath to request params', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        widgetInputs = new Map<string, WidgetInput>();
        const columnSet = new ColumnSet({
            columns: [
                ColumnConfig.createColumn('rfv_ftitle', 'ALL', 'rfv_ftitle', ' Title'),
                ColumnConfig.createColumn('rfv_factor_type', 'ALL', 'rfv_factor_type_2', 'Factor Type'),
                ColumnConfig.createColumn('rfv_factor_vol', 'ALL', 'rfv_factor_vol_5', 'Factor Vol'),
                ColumnConfig.createColumn('rfv_contrib_port', 'PORT', 'rfv_contrib_port_4', 'Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_bench', 'BENCH', 'rfv_contrib_bench_674', 'Benchmark Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_active', 'ACTIVE', 'rfv_contrib_active_645', 'Active Risk Contribution')
            ]
        });
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        widgetInputs.set(FactorBlockInput.configType, factorBlockInput);
        widgetInputs.set(RiskSettings.CONFIG_TYPE, new RiskSettings());
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, new Breakdown());
        widgetInputs.set(PerformanceSettings.CONFIG_TYPE, new PerformanceSettings());

        widget.dataStore.metaData.inputs = widgetInputs;

        const requestParams = service['createWidgetRequestParams'](widget, {}, new Portfolio(), widgetInputs);
        expect(requestParams['factorBlockPath']).toBe('779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY');
        expect(requestParams['factorBreakdownTree']).toMatch(JSON.stringify({breakdown: {}}));
    });

    it('should add only response columns in request config', () => {
        widgetInputs = new Map<string, WidgetInput>();
        const columnSet = new ColumnSet({
            columns: [
                ColumnConfig.createColumn('cusip', 'ALL', 'cusip_0', 'Cusip'),
                ColumnConfig.createColumn('security_description', 'ALL', 'security_description_0', 'Security Description'),
                ColumnConfig.createColumn('rfv_ftitle', 'ALL', 'rfv_ftitle', ' Title'),
                ColumnConfig.createColumn('rfv_factor_type', 'ALL', 'rfv_factor_type_2', 'Factor Type'),
                ColumnConfig.createColumn('rfv_factor_vol', 'ALL', 'rfv_factor_vol_5', 'Factor Vol'),
                ColumnConfig.createColumn('rfv_contrib_port', 'PORT', 'rfv_contrib_port_4', 'Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_bench', 'BENCH', 'rfv_contrib_bench_674', 'Benchmark Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_active', 'ACTIVE', 'rfv_contrib_active_645', 'Active Risk Contribution')
            ]
        });
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        widgetInputs.set(FactorBlockInput.configType, factorBlockInput);
        widgetInputs.set(RiskSettings.CONFIG_TYPE, new RiskSettings());
        widgetInputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, new Breakdown());
        widgetInputs.set(PerformanceSettings.CONFIG_TYPE, new PerformanceSettings());

        widget.dataStore.metaData.inputs = widgetInputs;

        const response: ExploreResponse = {
            data: {
                columns: ['cusip_0', 'security_description_0', 'rfv_contrib_port_4', 'rfv_contrib_bench_674', 'rfv_contrib_active_645'],
                data: {data: []}
            }
        };

        const requestConfig = service['createRequestConfig'](widgetInputs, widget, response, {portfolio: 'port'}, false);
        expect(requestConfig.columns.length).toBe(5);
    });
});
