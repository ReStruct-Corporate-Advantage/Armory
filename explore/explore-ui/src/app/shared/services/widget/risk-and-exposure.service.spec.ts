import {RiskAndExposureService} from './risk-and-exposure.service';
import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnConfig, ColumnDefinition, CoreColumnUtils, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ExploreResponse} from '@interfaces/response.interface';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {DateValue} from '@blk/explore-ui-core';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {PortfolioStore} from '@stores/portfolio.store';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';

describe('RiskAndExposureService Test', () => {
    let service: RiskAndExposureService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new RiskAndExposureService(exploreDataRequestService, null);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);
    });

    it('validate service', () => {
        validateService(service, [WidgetConfigType.RISK_EXPOSURE], 'N');
    });

    it('no data for selected date response - When top node data is null', () => {
        const response: ExploreResponse = {message: null, data: {data: {data: [null, null]}}};
        let widgetMessage = service['noDataResponse'](response);
        expect(widgetMessage).toBe('No data is available for the selected date');

        response.data.data = {children: [{data: [null, null]}, {data: [null, 1.09]}], data: [null, null]};
        widgetMessage = service['noDataResponse'](response);
        expect(widgetMessage).toBeUndefined();

        response.data.data.children[1].data = [null, null];
        widgetMessage = service['noDataResponse'](response);
        expect(widgetMessage).toBe('No data is available for the selected date');
    });

    describe('validateInputs', () => {

    });

    it('errors out widget R&E with style column, if portfolio name column is present in breakdown', () => {
        const widget: Widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const portfolio: Portfolio = new Portfolio('PEP', new DateValue({date: '20210405'}));
        const report: Report = new Report();
        const breakdown: Breakdown = new Breakdown({
            'breakdown': {
                'isConfigured': false,
                'breakdownTitle': 'Portfolio Name',
                'subSectors': [{
                    'breakdownRuleType': 'String',
                    'groupByColumn': {
                        'columnName': 'Portfolio Name',
                        'columnTag': 'portfolio_name',
                        'dataType': 'STRING',
                        'positionColumnType': 'ALL'
                    },
                    'useNoneBuckets': true
                }]
            }
        });
        const columnSet: ColumnSet = new ColumnSet({
                'configType': 'columnSet',
                'columns': [{
                    'columnTag': 'forecast_growth',
                    'columnKey': 'forecast_growth_e498dde5387f413',
                    'positionColumnType': 'ALL'
                }]
            }
        );
        const inputs: Map<string, any> = new Map<string, any>([[CoreRiskConstants.CONFIG_TYPE.BREAKDOWN, breakdown], [WidgetInputType.COLUMNS, columnSet]]);
        jest.spyOn(widget, 'getCombinedInputs').mockReturnValue(inputs).mockReturnValue(inputs);
        expect(service['validateInputs'](widget, portfolio, report).message).toBe('Style columns are not supported with Portfolio Name breakdown');
        jest.resetAllMocks();
    });

    it('test createWidgetRequestParams for active shares spritelet - override bench and currency', () => {
        const widget: Widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const portfolio: Portfolio = new Portfolio('PEP,ILB', new DateValue({date: '20210405'}));
        widget.dataStore.metaData.inputs.set(PortfolioOverrideInput.PORTFOLIO_OVERRIDE_INPUT, new PortfolioOverrideInput({portfolio: 'ILB', shortName: '', updateBenchAndCurrency: true}));
        const port = {
            'portName': 'ILB',
            'fullName': 'iShares Government Inflation ETF',
            'cusip': 'BRSCP4L70',
            'benchmarks': [
                {
                    'type': 'FWRD',
                    'order': 1,
                    'name': 'UBSAUGVILF'
                },
                {
                    'type': 'RISK',
                    'order': 1,
                    'name': 'UBSAUGVSIL'
                }
            ],
            'currency': 'AUD',
        };
        jest.spyOn(PortfolioStore, 'getPortfolioInfoFromCache').mockReturnValue({data : port});
        let requestParams: any = {
            benchmark: 'Test',
            benchSelection: 'Test',
            currency: 'GBP'
        };
        const inputs: Map<string, any> = new Map<string, any>([[PortfolioOverrideInput.PORTFOLIO_OVERRIDE_INPUT, new PortfolioOverrideInput({portfolio: 'ILB', shortName: '', updateBenchAndCurrency: true})]]);
        requestParams = service['createWidgetRequestParams'](widget, requestParams, portfolio, inputs, false, false);
        expect(requestParams.benchmark).toBe('UBSAUGVSIL');
        expect(requestParams.benchSelection).toBe('RISK');
        expect(requestParams.currency).toBe('AUD');
    });

    it('should correctly identify presence of Credit VaR columns', () => {
        const creditVarCol = ColumnConfig.createColumn('credit_var_column_tag', 'credit_var_column_key', 'ALL');
        const nonCreditVarCol = ColumnConfig.createColumn('non_credit_var_column_tag', 'non_credit_var_column_key', 'ALL');

        const columnSetWithCreditVaR: ColumnSet = new ColumnSet();
        columnSetWithCreditVaR.columns = [ creditVarCol, nonCreditVarCol ];

        const columnSetWithoutCreditVaR: ColumnSet = new ColumnSet();
        columnSetWithoutCreditVaR.columns = [ nonCreditVarCol, nonCreditVarCol ];

        // Mock the getColumnDefByTagAndUse method to return a ColumnDefinition with isCreditVaRColumn method that returns true for credit var column and false for non credit var column
        jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse').mockImplementation((columnTag, _positionColumnType) => {
            return {
                isCreditVaRColumn: () => columnTag === 'credit_var_column_tag'
            } as ColumnDefinition;
        });

        expect(service['isCreditVaRColumnsPresent'](columnSetWithCreditVaR)).toBe(true);
        expect(service['isCreditVaRColumnsPresent'](columnSetWithoutCreditVaR)).toBe(false);
    });

    it('should throw error notification for custom port group or what if portfolio when credit var columns are present', () => {
        const creditVarCol = ColumnConfig.createColumn('credit_var_column_tag', 'credit_var_column_key', 'ALL');
        const nonCreditVarCol = ColumnConfig.createColumn('non_credit_var_column_tag', 'non_credit_var_column_key', 'ALL');

        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns = [ creditVarCol, nonCreditVarCol ];

        // Mock the getColumnDefByTagAndUse method to return a ColumnDefinition with isCreditVaRColumn method that returns true for credit var column and false for non credit var column
        jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse').mockImplementation((columnTag, _positionColumnType) => {
            return {
                isCreditVaRColumn: () => columnTag === 'credit_var_column_tag'
            } as ColumnDefinition;
        });

        const widget: Widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
        const report: Report = new Report();

        let portfolio: Portfolio = new Portfolio('PEP', new DateValue({date: '20210405'}));

        expect(service['validateInputs'](widget, portfolio, report)).toBeNull();

        portfolio = new Portfolio('PEP , xyz', new DateValue({date: '20210405'}));

        expect(service['validateInputs'](widget, portfolio, report)).not.toBeNull();

        portfolio = new WhatIfPortfolio('PEP', new DateValue({date: '20210405'}));

        expect(service['validateInputs'](widget, portfolio, report)).not.toBeNull();
    });

    describe('determineIfDataPresent', () => {
        it('should return false if response.data.data is undefined', () => {
            const response: ExploreResponse = { data: { data: undefined } } as ExploreResponse;
            const result = service['determineIfDataPresent'](response);
            expect(result).toBe(false);
        });

        it('should return true if response.data.data contains non-nil items', () => {
            const response: ExploreResponse = { data: { data: { data: [1, null] } } } as ExploreResponse;
            const result = service['determineIfDataPresent'](response);
            expect(result).toBe(true);
        });

        it('should return false if response.data.data.data contains only nil items', () => {
            const response: ExploreResponse = { data: { data: { data: [null, null] } } } as ExploreResponse;
            const result = service['determineIfDataPresent'](response);
            expect(result).toBe(false);
        });

        it('should return true if response.data.data.children contains valid series data', () => {
            const response: ExploreResponse = { data: { data: { data: [null, null], children: [{ data: [1, null] }] } } } as ExploreResponse;
            jest.spyOn(service, 'checkForValidSeriesResponse').mockReturnValue(true);
            const result = service['determineIfDataPresent'](response);
            expect(result).toBe(true);
        });

        it('should return false if response.data.data.children does not contain valid series data', () => {
            const response: ExploreResponse = { data: { data: { data: [null, null], children: [{ data: [null, null] }] } } } as ExploreResponse;
            jest.spyOn(service, 'checkForValidSeriesResponse').mockReturnValue(false);
            const result = service['determineIfDataPresent'](response);
            expect(result).toBe(false);
        });
    });

});

