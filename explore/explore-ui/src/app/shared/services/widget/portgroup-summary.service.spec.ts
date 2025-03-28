import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {PortGroupSummaryService} from '@services/widget/portgroup-summary.service';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    AttributionSettings, DateValue,
    PerformanceSettings,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetUtils} from '@utils/widget.utils';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {GroupByKey} from '@qbstr/data-cube';
import {Widget} from '@models/widget/widget.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {Report} from '@models/workspace/report.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {AlertConstants} from '@blk/explore-ui-core';

describe('PortGroupSummaryService Test', () => {
    let service: PortGroupSummaryService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new PortGroupSummaryService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);
    });

    it('validate service', () => {
        const portfolio: Portfolio = new Portfolio('test_ticker');
        const attributionSettings = new AttributionSettings(undefined, 'EQUITY');
        portfolio.performanceSettings = new PerformanceSettings(undefined, undefined, attributionSettings);
        const expectedRequestParams = {performanceSettings: {}};
        expectedRequestParams.performanceSettings['cannedAttributionMethod'] = 'EQUITY';

        jest.spyOn(AbstractWidgetService.prototype, 'createRequestParams').mockReturnValue([{}]);
        expect(service.createRequestParams({} as any, {} as any, [portfolio], {} as any)[0]).toStrictEqual(expectedRequestParams);
        validateService(service, [WidgetConfigType.PGS], 'N');
    });

    it('createRequestConfig test case', () => {
        jest.spyOn(WidgetUtils, 'convertWidgetInputsToVizualisationColumnConfig').mockReturnValue({});
        jest.spyOn(WidgetUtils, 'assembleDefaultFilterValues').mockReturnValue({});
        const widgetInputs: any = new Map();
        widgetInputs.set('columns', new ColumnSet());
        let request: any = {portfolio: 'PEP',
            columns: [{columnTag: 'portfolio',
                columnKey: 'portfolio',
                optionValues : {'showShortNameForPortfolio': true, 'showShortNameForPortGroup': false}}],
            fullPortfolioName: 'BGF Pacific Equity Fund'
            };
        const response: any = {data: {}};
        let param = service['createRequestConfig'](widgetInputs, {} as any, response, request, false);
        expect(param.portfolio).toBeDefined();
        expect(param.portfolio).toEqual('PEP');

        request = {portfolio: 'PEP',
            columns: [{columnTag: 'portfolio',
                columnKey: 'portfolio',
                optionValues : {'showShortNameForPortfolio': false, 'showShortNameForPortGroup': true}}],
            fullPortfolioName: 'BGF Pacific Equity Fund'
        };
        param = service['createRequestConfig'](widgetInputs, {} as any, response, request, false);
        expect(param.portfolio).toBeDefined();
        expect(param.portfolio).toEqual('BGF Pacific Equity Fund');

        param = service['createRequestConfig'](widgetInputs, {} as any, response, request, true);
        expect(param.portfolio).toBeDefined();
        expect(param.portfolio).toEqual('Compare');
    });

    it('test the modifyInputs', () => {
        const originalColumns = new ColumnSet();
        const inputs = new Map<string, WidgetInput>();
        inputs.set(WidgetInputType.COLUMNS, originalColumns);
        service['modifyWidgetInputsForRequest'](inputs, null);

        const newColumns = inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        expect(newColumns === originalColumns).toBeFalsy();
        expect(newColumns.columns.length).toBe(1);
        expect(newColumns.columns[0].columnTag).toBe(PortGroupSummaryService.PORTFOLIO_COLUMN);
    });

    it('should test getPortfolioName', () => {
        const mockRequest = {
            columns: [
                {
                    columnKey: 'portfolio',
                    columnTag: 'portfolio',
                    optionValues: {showShortNameForPortfolio: false, showShortNameForPortGroup: true},
                    positionColumnType: 'ALL',
                    title: 'Portfolio'
                },
                {
                    columnKey: 'nav_group_0',
                    columnTag: 'nav_group',
                    positionColumnType: 'PORT',
                    title: 'NAV'
                },
                {
                    columnKey: 'portfolio_hidden',
                    columnTag: 'portfolio',
                    positionColumnType: 'ALL',
                    title: 'Portfolio',
                    visible: false
                }
            ],
            portfolio: 'CRAS-CES',
            portfolioIdentifier: 'CRAS-CES',
            fullPortfolioName: 'ALL FI CR&AS Credit Enhanced Strategies Portfolios'
        };
        expect(service.getPortfolioName(mockRequest, false, true)).toEqual('CRAS-CES');

        mockRequest.columns[0].optionValues.showShortNameForPortGroup = false;
        expect(service.getPortfolioName(mockRequest, false, true)).toEqual('ALL FI CR&AS Credit Enhanced Strategies Portfolios');

        mockRequest.portfolio = 'H2';
        mockRequest.portfolioIdentifier = 'H2';
        mockRequest.fullPortfolioName = 'BlackRock Corporate Bond Fund';
        expect(service.getPortfolioName(mockRequest, false, false)).toEqual('BlackRock Corporate Bond Fund');

        mockRequest.columns[0].optionValues.showShortNameForPortfolio = true;
        expect(service.getPortfolioName(mockRequest, false, false)).toEqual('H2');
    });

    it('validateInputs', () => {
        const widgetDef = new Widget();
        widgetDef.configType = WidgetConfigType.RISK_EXPOSURE;
        widgetDef.dataStore = new WidgetDataStore();
        widgetDef.pgsChartPortfolio = 'TR-MULTI';
        widgetDef.dataStore.data = {
            customVizConfig : {
                queryKeys: [new GroupByKey('level-0')], chartOrientation: 'column'
            }
        };
        const portfolio = new Portfolio('TR-MULTI', new DateValue({date: '11/03/2016'}));
        portfolio.title = 'TR-MULTI';
        portfolio.portId = 'TR-MULTI';
        const portfolio2 = new Portfolio('BGO', new DateValue({date: '11/03/2016'}));
        portfolio2.title = 'BGO';
        portfolio2.portId = 'BGO';
        const workpad = new ReportGroup();
        workpad.comparisonConfigMap.set(123, new ComparisonConfig({
            portComparisonList: ['TR-MULTI', 'BGO'],
        }));
        const reportObj = new Report({
            comparisonConfigId: 123
        });
        workpad.portfolios = [portfolio, portfolio2];
        jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(workpad);

        let notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).toBeNull();

        widgetDef.configType = WidgetConfigType.PGS_BAR;

        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification.message).toBe(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.PGS_CHART);

        jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(undefined);
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).toBeNull();
        portfolio.title = 'PEP';
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).not.toBeNull();

        widgetDef.dataStore.data = {
            requestConfig: {
                portfolio: 'TR-MULTI'
            },
            customVizConfig : {
                queryKeys: [new GroupByKey('level-0')], chartOrientation: 'column'
            }
        };
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).not.toBeNull();

        portfolio.title = 'TR-MULTI';
        notification = service['validateInputs'](widgetDef, portfolio, reportObj);
        expect(notification).toBeNull();
    });
});
