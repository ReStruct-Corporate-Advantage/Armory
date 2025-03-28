import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ApiRequestModalComponent} from './api-request-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestUtils} from '@utils/test.utils';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {
    CoreUserMetaDataStore,
    DateValue,
    ExploreRadioButton,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {UserPreference} from '@constants/user-preference.constants';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {ApiModelConversionService} from '@services/portfolio-analytics-api/api-model-conversion.service';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {of, throwError} from 'rxjs';


describe('ApiRequestModalComponent', () => {
    let component: ApiRequestModalComponent;
    let fixture: ComponentFixture<ApiRequestModalComponent>;

    let portfolio: Portfolio;
    let widgetColumns: ColumnSet;
    let widgetBreakdown: Breakdown;
    let widgetMetaData: WidgetDataStoreMetaData;
    let widget: Widget;

    const riskAndExposureServiceMock = {
        extractDataAndStore: jest.fn(),
        getWidgetConfigTypes: jest.fn(() => [WidgetConfigType.RISK_EXPOSURE]),
        createFinalDataRequest: jest.fn()
    };

    const pgsWidgetServiceMock = {
        extractDataAndStore: jest.fn(),
        getWidgetConfigTypes: jest.fn(() => [WidgetConfigType.PGS]),
        createFinalDataRequest: jest.fn()
    };

    const timeSeriesWidgetServiceMock = {
        extractDataAndStore: jest.fn(),
        getWidgetConfigTypes: jest.fn(() => [WidgetConfigType.TIME_SERIES]),
        createFinalDataRequest: jest.fn()
    };

    const apiModelConversionServiceMock = {
        convertExploreModelToApiModel$: jest.fn(),
        getGenerateApiRequestPayload: jest.fn()
    };

    beforeAll((done) => {
        WorkspaceStore.init();
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ApiRequestModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: AbstractWidgetService, useValue: riskAndExposureServiceMock,
                    multi: true
                },
                {
                    provide: AbstractWidgetService, useValue: pgsWidgetServiceMock,
                    multi: true
                },
                {
                    provide: AbstractWidgetService, useValue: timeSeriesWidgetServiceMock,
                    multi: true
                },
                {
                    provide: WidgetServiceRegistry, useClass: WidgetServiceRegistry
                },
                {
                    provide: ApiModelConversionService, useValue: apiModelConversionServiceMock
                }
            ]
        });
    });


    it('Test RiskAndExposure service invocation', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetColumns.id = 1234;
        widgetBreakdown = new Breakdown();
        widgetBreakdown.id = 5678;
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget.dataStore.metaData = widgetMetaData;

        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'Json');

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        riskAndExposureServiceMock['createFinalDataRequest']
            .mockReturnValue(dataRequest);

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(of({}));

        const expected = {
            'ltFilterRuleFavId': undefined,
            'prismWebRequest': {},
            'breakdownFavId' : 5678,
            'columnSetFavId' : 1234
        };
        apiModelConversionServiceMock['getGenerateApiRequestPayload']
            .mockReturnValue(expected);

        component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(apiModelConversionServiceMock.convertExploreModelToApiModel$)
            .toHaveBeenCalledWith(expected, 'Generating API Request');

    });

    it('Test RiskAndExposure service invocation and failure response', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetColumns.id = 1234;
        widgetBreakdown = new Breakdown();
        widgetBreakdown.id = 5678;
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget.dataStore.metaData = widgetMetaData;

        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'Json');

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        riskAndExposureServiceMock['createFinalDataRequest']
            .mockReturnValue(dataRequest);

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(throwError({
                isResponseChunked: false,
                data: null,
                message: 'Custom Calculation is not supported as json request body. Save the columnSet as Favorite to proceed',
                CLASS_TYPE: 'com.bfm.explore.messaging.response.ExploreWebResponse',
                status: 'FAILURE'
            }));

        const expected = {
            'ltFilterRuleFavId': undefined,
            'prismWebRequest': {},
            'breakdownFavId' : 5678,
            'columnSetFavId' : 1234
        };
        apiModelConversionServiceMock['getGenerateApiRequestPayload']
            .mockReturnValue(expected);

        component.ngOnInit();
        expect(apiModelConversionServiceMock.convertExploreModelToApiModel$)
            .toHaveBeenCalledWith(expected, 'Generating API Request');
        expect(component.isGenerateApiRequestErrored).toBe(true);
        expect(component.errorMessage).toBe('Custom Calculation is not supported as json request body. Save the columnSet as Favorite to proceed');

    });

    it('Test timeseries service invocation', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetColumns.id = 1234;
        widgetBreakdown = new Breakdown();
        widgetBreakdown.id = 5678;
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        let dataStore = new WidgetDataStore();
        dataStore.metaData = widgetMetaData;
        widget = new Widget(WidgetConfigType.TIME_SERIES, null, dataStore);


        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'Json');

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        timeSeriesWidgetServiceMock['createFinalDataRequest']
            .mockReturnValue(dataRequest);

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(of({}));

        component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(apiModelConversionServiceMock.convertExploreModelToApiModel$).toHaveBeenCalled();
    });

    it('Test PGS service invocation', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetColumns.id = 1234;
        widgetBreakdown = new Breakdown();
        widgetBreakdown.id = 5678;
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        const dataStore = new WidgetDataStore();
        dataStore.metaData = widgetMetaData;
        widget = new Widget(WidgetConfigType.PGS, null, dataStore);


        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'Json');

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        pgsWidgetServiceMock['createFinalDataRequest']
            .mockReturnValue(dataRequest);

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(of({}));

        component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(apiModelConversionServiceMock.convertExploreModelToApiModel$).toHaveBeenCalled();
    });

    it('Test PGS service invocation - ATX Access is False', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetColumns.id = 1234;
        widgetBreakdown = new Breakdown();
        widgetBreakdown.id = 5678;
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        const dataStore = new WidgetDataStore();
        dataStore.metaData = widgetMetaData;
        widget = new Widget(WidgetConfigType.PGS, null, dataStore);


        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;
        CoreUserMetaDataStore.userMetaData.atxAccess = false;

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        pgsWidgetServiceMock['createFinalDataRequest']
            .mockReturnValue(dataRequest);

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(of({}));

        component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(component.apiRequestFormats.length).toBe(2);
        expect(component.apiRequestFormats).toContainEqual(new ExploreRadioButton(ApiRequestModalComponent.API_REQUEST_FORMAT_JSON.label, true, false, ApiRequestModalComponent.API_REQUEST_FORMAT_JSON.eventData));
        expect(component.apiRequestFormats).toContainEqual(new ExploreRadioButton(ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON.label, false, false, ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON.eventData));
    });

    it('Test PGS service invocation - ATX Access is False and permission has changed from last save', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetColumns.id = 1234;
        widgetBreakdown = new Breakdown();
        widgetBreakdown.id = 5678;
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        const dataStore = new WidgetDataStore();
        dataStore.metaData = widgetMetaData;
        widget = new Widget(WidgetConfigType.PGS, null, dataStore);


        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;

        // Previous saved prefernce is ATX but now ATX perm is false
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'ATX');
        CoreUserMetaDataStore.userMetaData.atxAccess = false;

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        pgsWidgetServiceMock['createFinalDataRequest']
            .mockReturnValue(dataRequest);

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(of({}));

        component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(component.apiRequestFormats.length).toBe(2);
        expect(component.apiRequestFormats).toContainEqual(new ExploreRadioButton(ApiRequestModalComponent.API_REQUEST_FORMAT_JSON.label, true, false, ApiRequestModalComponent.API_REQUEST_FORMAT_JSON.eventData));
        expect(component.apiRequestFormats).toContainEqual(new ExploreRadioButton(ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON.label, false, false, ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON.eventData));
    });

    it('Test Risk And Exposure service invocation with ATX option', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('ILB', DateValue.newDate('9/13/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetBreakdown = new Breakdown();
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        const dataStore = new WidgetDataStore();
        dataStore.metaData = widgetMetaData;
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE, null, dataStore);

        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'ATX');
        CoreUserMetaDataStore.userMetaData.atxAccess = true;

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        pgsWidgetServiceMock['createFinalDataRequest'].mockReturnValue(dataRequest);

        const obj = {
            'portfolioTicker': 'ILB',
            'reportingDate': {
                'year': '2021',
                'day': '13',
                'month': '9'
            },
            'reportingCurrencyCode': 'AUD',
            'benchmarkConfig': {
                'benchmarkType': 'RISK',
                'benchmarkOrder': 'PORTFOLIO_ANALYTICS_BENCHMARK_ORDER_PRIMARY',
                'benchmarkTicker': 'UBSAUGVSIL'
            },
            'breakdownConfig': {
                'columnSet': {
                    'columnFields': [
                        {
                            'columnName': 'sec_group',
                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                        }
                    ]
                }
            },
            'columnConfig': {
                'columnSet': {
                    'columnFields': [
                        {
                            'columnName': 'security_description',
                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                        },
                        {
                            'columnName': 'cusip',
                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                        },
                        {
                            'columnName': 'pct_mv',
                            'columnType': 'COLUMN_TYPE_PORTFOLIO'
                        }
                    ]
                }
            },
            'splitPositionConfig': {
                'splitPositionConfigType': 'SPLIT_POSITION_CONFIG_TYPE_CUSTOM',
                'splitPositionTypes': [
                    'SPLIT_POSITION_TYPE_FX_CSWAP',
                    'SPLIT_POSITION_TYPE_FX_FWRD',
                    'SPLIT_POSITION_TYPE_FX_HEDGE',
                    'SPLIT_POSITION_TYPE_FX_SPOT',
                    'SPLIT_POSITION_TYPE_SWAP_CSWAP',
                    'SPLIT_POSITION_TYPE_OPTION_CUROTC'
                ]
            },
            'lookThroughConfig': {
                'lookThroughPortfolio': false,
                'lookThroughBenchmark': false,
                'lookThroughSecurityConfig': 'LOOK_THROUGH_SECURITY_CONFIG_UNSPECIFIED',
                'lookThroughProxyConfig': 'LOOK_THROUGH_PROXY_CONFIG_UNSPECIFIED'
            },
            'isSectorView': false,
            'calendar': 'GP_REG_AUSTRALIA_STD'
        };


        const expectedData = {
            data: JSON.stringify(obj)
        };

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(of(expectedData));

        component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(apiModelConversionServiceMock.convertExploreModelToApiModel$).toHaveBeenCalled();
        expect(JSON.parse(component.apiRequestJson)).toEqual(
            {
                'atxActivation': {
                    'tryItOut': {
                        'schemaId': '/agraph.analytics.portfolio_analytics.reporting.v1.PortfolioAnalyticsAPI',
                        'restMethod': 'POST',
                        'url': '/analytics/portfolio-analytics/reporting/v1/portfolios:computePortfolioAnalytics',
                        'parameters': {},
                        'body': {
                            'portfolioTicker': 'ILB',
                            'reportingDate': '2021-09-13',
                            'reportingCurrencyCode': 'AUD',
                            'benchmarkConfig': {
                                'benchmarkType': 'RISK',
                                'benchmarkOrder': 'PORTFOLIO_ANALYTICS_BENCHMARK_ORDER_PRIMARY',
                                'benchmarkTicker': 'UBSAUGVSIL'
                            },
                            'breakdownConfig': {
                                'columnSet': {
                                    'columnFields': [
                                        {
                                            'columnName': 'sec_group',
                                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                                        }
                                    ]
                                }
                            },
                            'columnConfig': {
                                'columnSet': {
                                    'columnFields': [
                                        {
                                            'columnName': 'security_description',
                                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                                        },
                                        {
                                            'columnName': 'cusip',
                                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                                        },
                                        {
                                            'columnName': 'pct_mv',
                                            'columnType': 'COLUMN_TYPE_PORTFOLIO'
                                        }
                                    ]
                                }
                            },
                            'splitPositionConfig': {
                                'splitPositionConfigType': 'SPLIT_POSITION_CONFIG_TYPE_CUSTOM',
                                'splitPositionTypes': [
                                    'SPLIT_POSITION_TYPE_FX_CSWAP',
                                    'SPLIT_POSITION_TYPE_FX_FWRD',
                                    'SPLIT_POSITION_TYPE_FX_HEDGE',
                                    'SPLIT_POSITION_TYPE_FX_SPOT',
                                    'SPLIT_POSITION_TYPE_SWAP_CSWAP',
                                    'SPLIT_POSITION_TYPE_OPTION_CUROTC'
                                ]
                            },
                            'lookThroughConfig': {
                                'lookThroughPortfolio': false,
                                'lookThroughBenchmark': false,
                                'lookThroughSecurityConfig': 'LOOK_THROUGH_SECURITY_CONFIG_UNSPECIFIED',
                                'lookThroughProxyConfig': 'LOOK_THROUGH_PROXY_CONFIG_UNSPECIFIED'
                            },
                            'isSectorView': false,
                            'calendar': 'GP_REG_AUSTRALIA_STD'
                        }
                    }
                }
            }
        );
    });

    it('Test PGS service invocation with ATX option', () => {
            fixture = TestBed.createComponent(ApiRequestModalComponent);
            component = fixture.componentInstance;
            portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
            portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
            widgetMetaData = new WidgetDataStoreMetaData();
            widgetColumns = new ColumnSet();
            widgetColumns.id = 1234;
            widgetBreakdown = new Breakdown();
            widgetBreakdown.id = 5678;
            widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
            widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
            const dataStore = new WidgetDataStore();
            dataStore.metaData = widgetMetaData;
            widget = new Widget(WidgetConfigType.PGS, null, dataStore);

            component.isOpen = true;
            component.portfolio = portfolio;
            component.widget = widget;
            component.widgetMetaData = widgetMetaData;
            CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'ATX');
            CoreUserMetaDataStore.userMetaData.atxAccess = true;

            WorkspaceStore.currentReport$.next(new Report());

            const dataRequest = new ExploreDataRequest();
            dataRequest.requestParams =  [{}];
            pgsWidgetServiceMock['createFinalDataRequest'].mockReturnValue(dataRequest);

            const obj = {
                'portfolioTicker': 'ILB',
                'reportingDate': {
                    'year': '2021',
                    'day': '13',
                    'month': '9'
                },
                'reportingCurrencyCode': 'AUD',
                'benchmarkConfig': {
                    'benchmarkType': 'RISK',
                    'benchmarkOrder': 'PORTFOLIO_ANALYTICS_BENCHMARK_ORDER_PRIMARY',
                    'benchmarkTicker': 'UBSAUGVSIL'
                },
                'columnConfig': {
                    'columnSet': {
                        'columnFields': [
                            {
                                'columnName': 'portfolio',
                                'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                            },
                            {
                                'columnName': 'nav_group',
                                'columnType': 'COLUMN_TYPE_PORTFOLIO'
                            },
                            {
                                'columnName': 'pct_nav_group',
                                'columnType': 'COLUMN_TYPE_PORTFOLIO'
                            }
                        ]
                    }
                },
                'splitPositionConfig': {
                    'splitPositionConfigType': 'SPLIT_POSITION_CONFIG_TYPE_CUSTOM',
                    'splitPositionTypes': [
                        'SPLIT_POSITION_TYPE_FX_CSWAP',
                        'SPLIT_POSITION_TYPE_FX_FWRD',
                        'SPLIT_POSITION_TYPE_FX_HEDGE',
                        'SPLIT_POSITION_TYPE_FX_SPOT',
                        'SPLIT_POSITION_TYPE_SWAP_CSWAP',
                        'SPLIT_POSITION_TYPE_OPTION_CUROTC'
                    ]
                },
                'lookThroughConfig': {
                    'lookThroughPortfolio': false,
                    'lookThroughBenchmark': false,
                    'lookThroughSecurityConfig': 'LOOK_THROUGH_SECURITY_CONFIG_UNSPECIFIED',
                    'lookThroughProxyConfig': 'LOOK_THROUGH_PROXY_CONFIG_UNSPECIFIED'
                },
                'calendar': 'GP_REG_AUSTRALIA_STD'
            };


            const expectedData = {
                data: JSON.stringify(obj)
            };

            apiModelConversionServiceMock['convertExploreModelToApiModel$']
                .mockReturnValue(of(expectedData));

            component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(apiModelConversionServiceMock.convertExploreModelToApiModel$).toHaveBeenCalled();
            expect(JSON.parse(component.apiRequestJson)).toEqual(
                {
                    'atxActivation': {
                        'tryItOut': {
                            'schemaId': '/agraph.analytics.portfolio_analytics.reporting.v1.PortfolioAnalyticsAPI',
                            'restMethod': 'POST',
                            'url': '/analytics/portfolio-analytics/reporting/v1/portfolios:computePortfolioSummaryAnalytics',
                            'parameters': {},
                            'body': {
                                'portfolioTicker': 'ILB',
                                'reportingDate': '2021-09-13',
                                'reportingCurrencyCode': 'AUD',
                                'benchmarkConfig': {
                                    'benchmarkType': 'RISK',
                                    'benchmarkOrder': 'PORTFOLIO_ANALYTICS_BENCHMARK_ORDER_PRIMARY',
                                    'benchmarkTicker': 'UBSAUGVSIL'
                                },
                                'columnConfig': {
                                    'columnSet': {
                                        'columnFields': [
                                            {
                                                'columnName': 'portfolio',
                                                'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                                            },
                                            {
                                                'columnName': 'nav_group',
                                                'columnType': 'COLUMN_TYPE_PORTFOLIO'
                                            },
                                            {
                                                'columnName': 'pct_nav_group',
                                                'columnType': 'COLUMN_TYPE_PORTFOLIO'
                                            }
                                        ]
                                    }
                                },
                                'splitPositionConfig': {
                                    'splitPositionConfigType': 'SPLIT_POSITION_CONFIG_TYPE_CUSTOM',
                                    'splitPositionTypes': [
                                        'SPLIT_POSITION_TYPE_FX_CSWAP',
                                        'SPLIT_POSITION_TYPE_FX_FWRD',
                                        'SPLIT_POSITION_TYPE_FX_HEDGE',
                                        'SPLIT_POSITION_TYPE_FX_SPOT',
                                        'SPLIT_POSITION_TYPE_SWAP_CSWAP',
                                        'SPLIT_POSITION_TYPE_OPTION_CUROTC'
                                    ]
                                },
                                'lookThroughConfig': {
                                    'lookThroughPortfolio': false,
                                    'lookThroughBenchmark': false,
                                    'lookThroughSecurityConfig': 'LOOK_THROUGH_SECURITY_CONFIG_UNSPECIFIED',
                                    'lookThroughProxyConfig': 'LOOK_THROUGH_PROXY_CONFIG_UNSPECIFIED'
                                },
                                'calendar': 'GP_REG_AUSTRALIA_STD'
                            }
                        }
                    }
                }
            );
        });


    it('Test TimeSeries service invocation with ATX option', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('ILB', DateValue.newDate('9/13/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetBreakdown = new Breakdown();
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        const dataStore = new WidgetDataStore();
        dataStore.metaData = widgetMetaData;
        widget = new Widget(WidgetConfigType.TIME_SERIES, null, dataStore);

        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'ATX');
        CoreUserMetaDataStore.userMetaData.atxAccess = true;

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        pgsWidgetServiceMock['createFinalDataRequest'].mockReturnValue(dataRequest);

        const obj = {
            'portfolioTicker': 'ILB',
            'timeSeriesPeriodSetting': {
                'timeSeriesPeriodFrequency': {
                    'reportingDate': {
                        'year': '2021',
                        'day': '13',
                        'month': '9'
                    },
                    'periodFrequency': 'PERIOD_FREQUENCY_DAILY',
                    'periodNumber': 10
                }
            },
            'reportingCurrencyCode': 'AUD',
            'benchmarkConfig': {
                'benchmarkType': 'RISK',
                'benchmarkOrder': 'PORTFOLIO_ANALYTICS_BENCHMARK_ORDER_PRIMARY',
                'benchmarkTicker': 'UBSAUGVSIL'
            },
            'breakdownConfig': {
                'columnSet': {
                    'columnFields': [
                        {
                            'columnName': 'sec_group',
                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                        }
                    ]
                }
            },
            'columnConfig': {
                'columnSet': {
                    'columnFields': [
                        {
                            'columnName': 'pct_notional_val',
                            'columnType': 'COLUMN_TYPE_PORTFOLIO'
                        }
                    ]
                }
            },
            'splitPositionConfig': {
                'splitPositionConfigType': 'SPLIT_POSITION_CONFIG_TYPE_CUSTOM',
                'splitPositionTypes': [
                    'SPLIT_POSITION_TYPE_FX_CSWAP',
                    'SPLIT_POSITION_TYPE_FX_FWRD',
                    'SPLIT_POSITION_TYPE_FX_HEDGE',
                    'SPLIT_POSITION_TYPE_FX_SPOT',
                    'SPLIT_POSITION_TYPE_SWAP_CSWAP',
                    'SPLIT_POSITION_TYPE_OPTION_CUROTC'
                ]
            },
            'lookThroughConfig': {
                'lookThroughPortfolio': false,
                'lookThroughBenchmark': false,
                'lookThroughSecurityConfig': 'LOOK_THROUGH_SECURITY_CONFIG_UNSPECIFIED',
                'lookThroughProxyConfig': 'LOOK_THROUGH_PROXY_CONFIG_UNSPECIFIED'
            },
            'calendar': 'GP_REG_AUSTRALIA_STD'
        };


        const expectedData = {
            data: JSON.stringify(obj)
        };

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(of(expectedData));

        component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(apiModelConversionServiceMock.convertExploreModelToApiModel$).toHaveBeenCalled();
        expect(JSON.parse(component.apiRequestJson)).toEqual(
            {
                'atxActivation': {
                    'tryItOut': {
                        'schemaId': '/agraph.analytics.portfolio_analytics.reporting.v1.PortfolioAnalyticsAPI',
                        'restMethod': 'POST',
                        'url': '/analytics/portfolio-analytics/reporting/v1/portfolios:computePortfolioTimeSeriesAnalytics',
                        'parameters': {},
                        'body': {
                            'portfolioTicker': 'ILB',
                            'timeSeriesPeriodSetting': {
                                'timeSeriesPeriodFrequency': {
                                    'reportingDate': '2021-09-13',
                                    'periodFrequency': 'PERIOD_FREQUENCY_DAILY',
                                    'periodNumber': 10
                                }
                            },
                            'reportingCurrencyCode': 'AUD',
                            'benchmarkConfig': {
                                'benchmarkType': 'RISK',
                                'benchmarkOrder': 'PORTFOLIO_ANALYTICS_BENCHMARK_ORDER_PRIMARY',
                                'benchmarkTicker': 'UBSAUGVSIL'
                            },
                            'breakdownConfig': {
                                'columnSet': {
                                    'columnFields': [
                                        {
                                            'columnName': 'sec_group',
                                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                                        }
                                    ]
                                }
                            },
                            'columnConfig': {
                                'columnSet': {
                                    'columnFields': [
                                        {
                                            'columnName': 'pct_notional_val',
                                            'columnType': 'COLUMN_TYPE_PORTFOLIO'
                                        }
                                    ]
                                }
                            },
                            'splitPositionConfig': {
                                'splitPositionConfigType': 'SPLIT_POSITION_CONFIG_TYPE_CUSTOM',
                                'splitPositionTypes': [
                                    'SPLIT_POSITION_TYPE_FX_CSWAP',
                                    'SPLIT_POSITION_TYPE_FX_FWRD',
                                    'SPLIT_POSITION_TYPE_FX_HEDGE',
                                    'SPLIT_POSITION_TYPE_FX_SPOT',
                                    'SPLIT_POSITION_TYPE_SWAP_CSWAP',
                                    'SPLIT_POSITION_TYPE_OPTION_CUROTC'
                                ]
                            },
                            'lookThroughConfig': {
                                'lookThroughPortfolio': false,
                                'lookThroughBenchmark': false,
                                'lookThroughSecurityConfig': 'LOOK_THROUGH_SECURITY_CONFIG_UNSPECIFIED',
                                'lookThroughProxyConfig': 'LOOK_THROUGH_PROXY_CONFIG_UNSPECIFIED'
                            },
                            'calendar': 'GP_REG_AUSTRALIA_STD'
                        }
                    }
                }
            }
        );
    });

    it('Test TimeSeries service invocation with ATX TimeSeries range option', () => {
        fixture = TestBed.createComponent(ApiRequestModalComponent);
        component = fixture.componentInstance;
        portfolio = new Portfolio('ILB', DateValue.newDate('9/13/2021'));
        portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
        widgetMetaData = new WidgetDataStoreMetaData();
        widgetColumns = new ColumnSet();
        widgetBreakdown = new Breakdown();
        widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
        widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
        const dataStore = new WidgetDataStore();
        dataStore.metaData = widgetMetaData;
        widget = new Widget(WidgetConfigType.TIME_SERIES, null, dataStore);

        component.isOpen = true;
        component.portfolio = portfolio;
        component.widget = widget;
        component.widgetMetaData = widgetMetaData;
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.API_REQUEST_FORMAT.name, 'ATX');
        CoreUserMetaDataStore.userMetaData.atxAccess = true;

        WorkspaceStore.currentReport$.next(new Report());

        const dataRequest = new ExploreDataRequest();
        dataRequest.requestParams =  [{}];
        pgsWidgetServiceMock['createFinalDataRequest'].mockReturnValue(dataRequest);

        const obj = {
            'portfolioTicker': 'ILB',
            'timeSeriesPeriodSetting': {
                'timeSeriesRangeFrequency': {
                    'reportingStartDate': {
                        'year': '2021',
                        'day': '01',
                        'month': '9'
                    },
                    'reportingEndDate': {
                        'year': '2021',
                        'day': '13',
                        'month': '9'
                    },
                    'periodFrequency': 'PERIOD_FREQUENCY_DAILY'
                }
            },
            'reportingCurrencyCode': 'AUD',
            'benchmarkConfig': {
                'benchmarkType': 'RISK',
                'benchmarkOrder': 'PORTFOLIO_ANALYTICS_BENCHMARK_ORDER_PRIMARY',
                'benchmarkTicker': 'UBSAUGVSIL'
            },
            'breakdownConfig': {
                'columnSet': {
                    'columnFields': [
                        {
                            'columnName': 'sec_group',
                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                        }
                    ]
                }
            },
            'columnConfig': {
                'columnSet': {
                    'columnFields': [
                        {
                            'columnName': 'pct_notional_val',
                            'columnType': 'COLUMN_TYPE_PORTFOLIO'
                        }
                    ]
                }
            },
            'splitPositionConfig': {
                'splitPositionConfigType': 'SPLIT_POSITION_CONFIG_TYPE_CUSTOM',
                'splitPositionTypes': [
                    'SPLIT_POSITION_TYPE_FX_CSWAP',
                    'SPLIT_POSITION_TYPE_FX_FWRD',
                    'SPLIT_POSITION_TYPE_FX_HEDGE',
                    'SPLIT_POSITION_TYPE_FX_SPOT',
                    'SPLIT_POSITION_TYPE_SWAP_CSWAP',
                    'SPLIT_POSITION_TYPE_OPTION_CUROTC'
                ]
            },
            'lookThroughConfig': {
                'lookThroughPortfolio': false,
                'lookThroughBenchmark': false,
                'lookThroughSecurityConfig': 'LOOK_THROUGH_SECURITY_CONFIG_UNSPECIFIED',
                'lookThroughProxyConfig': 'LOOK_THROUGH_PROXY_CONFIG_UNSPECIFIED'
            },
            'calendar': 'GP_REG_AUSTRALIA_STD'
        };


        const expectedData = {
            data: JSON.stringify(obj)
        };

        apiModelConversionServiceMock['convertExploreModelToApiModel$']
            .mockReturnValue(of(expectedData));

        component.ngOnInit();
        expect(apiModelConversionServiceMock.getGenerateApiRequestPayload).toHaveBeenCalled();
        expect(apiModelConversionServiceMock.convertExploreModelToApiModel$).toHaveBeenCalled();
        expect(JSON.parse(component.apiRequestJson)).toEqual(
            {
                'atxActivation': {
                    'tryItOut': {
                        'schemaId': '/agraph.analytics.portfolio_analytics.reporting.v1.PortfolioAnalyticsAPI',
                        'restMethod': 'POST',
                        'url': '/analytics/portfolio-analytics/reporting/v1/portfolios:computePortfolioTimeSeriesAnalytics',
                        'parameters': {},
                        'body': {
                            'portfolioTicker': 'ILB',
                            'timeSeriesPeriodSetting': {
                                'timeSeriesRangeFrequency': {
                                    'reportingStartDate': '2021-09-01',
                                    'reportingEndDate': '2021-09-13',
                                    'periodFrequency': 'PERIOD_FREQUENCY_DAILY'
                                }
                            },
                            'reportingCurrencyCode': 'AUD',
                            'benchmarkConfig': {
                                'benchmarkType': 'RISK',
                                'benchmarkOrder': 'PORTFOLIO_ANALYTICS_BENCHMARK_ORDER_PRIMARY',
                                'benchmarkTicker': 'UBSAUGVSIL'
                            },
                            'breakdownConfig': {
                                'columnSet': {
                                    'columnFields': [
                                        {
                                            'columnName': 'sec_group',
                                            'columnType': 'COLUMN_TYPE_UNSPECIFIED'
                                        }
                                    ]
                                }
                            },
                            'columnConfig': {
                                'columnSet': {
                                    'columnFields': [
                                        {
                                            'columnName': 'pct_notional_val',
                                            'columnType': 'COLUMN_TYPE_PORTFOLIO'
                                        }
                                    ]
                                }
                            },
                            'splitPositionConfig': {
                                'splitPositionConfigType': 'SPLIT_POSITION_CONFIG_TYPE_CUSTOM',
                                'splitPositionTypes': [
                                    'SPLIT_POSITION_TYPE_FX_CSWAP',
                                    'SPLIT_POSITION_TYPE_FX_FWRD',
                                    'SPLIT_POSITION_TYPE_FX_HEDGE',
                                    'SPLIT_POSITION_TYPE_FX_SPOT',
                                    'SPLIT_POSITION_TYPE_SWAP_CSWAP',
                                    'SPLIT_POSITION_TYPE_OPTION_CUROTC'
                                ]
                            },
                            'lookThroughConfig': {
                                'lookThroughPortfolio': false,
                                'lookThroughBenchmark': false,
                                'lookThroughSecurityConfig': 'LOOK_THROUGH_SECURITY_CONFIG_UNSPECIFIED',
                                'lookThroughProxyConfig': 'LOOK_THROUGH_PROXY_CONFIG_UNSPECIFIED'
                            },
                            'calendar': 'GP_REG_AUSTRALIA_STD'
                        }
                    }
                }
            }
        );
    });

});
