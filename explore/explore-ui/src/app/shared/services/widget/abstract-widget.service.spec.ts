import {fakeAsync, tick} from '@angular/core/testing';
import {ColumnSet, CustomAggregationColumnOption, OverrideDateColumnOption} from '@blk/explore-ui-column-option';
import {
    CalendarDateUtils, ChartWidgetInputConfigType,
    ColumnConfig,
    DateFormatConstants,
    DateValue,
    ErrorTypeConstants,
    ResponseData,
    UIErrorParameters,
    WidgetConfigInput,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType,
    CoreUserMetaDataStore,
    UserMetaData
} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {NotificationConstants} from '@constants/notification.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse, ExploreResponseConfig} from '@interfaces/response.interface';
import {
    Breakdown,
    ColumnBreakdown,
    ColumnSector,
    CustomFilter,
    MultiManagerBreakdownModel
} from '@blk/explore-ui-breakdown';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PublishStateItem} from '@models/publishState/publish-state-item.model';
import {PublishStateWrapper} from '@models/publishState/publish-state-wrapper.model';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {TopBottomFilterInput} from '@models/widget/inputs/top-bottom-filter-input.model';
import {Notification} from '@models/widget/notification.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Report} from '@models/workspace/report.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {HighlightUtils} from '@utils/highlight.utils';
import {ObjectUtils} from '@utils/object.utils';
import {WorkpadUtils} from '@utils/workpad.utils';
import {TestUtils} from '@utils/test.utils';
import {WidgetUtils} from '@utils/widget.utils';
import {cloneDeep, isNil} from 'lodash';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {AppStore} from '../../../app.store';
import {CommonConstants, CompositionConstants, DataRequestConstants} from '../../../constants';
import {WidgetConfigFactory} from '../../../factories';
import {WorkspaceStore} from '../../../stores';
import {AbstractWidgetService} from './abstract-widget.service';
import {beforAllDataServiceTest} from './functions-for-data-service.testutil';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {AxisSettings, AxisType} from '@models/widget/inputs/chart-settings/axis-settings.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';

describe('AbstractWidgetService Test', () => {
    const dummyIsSectorView = 'dummyIsSectorView';
    const dummyDataFormat = 'dummyIsSectorView';

    let service: AbstractWidgetService;
    let exploreDataRequestService: ExploreDataRequestService;
    let port: Portfolio;
    let widget: Widget;

    let exploreDataRequestServiceGetDataSpy;

    const requestToBeSent: any = {
        title: 'Risk and Exposure',
        type: 'agGrid',
        createNestedNoneBuckets: false,
        createNestedOtherBuckets: false,
        benchmark: 'TEST',
        benchmarkFullName: 'TEST',
        columns: [
            {
                columnTag: 'security_description',
                columnKey: 'security_description_1',
                positionColumnType: 'ALL',
                title: 'Security Description'
            },
            {columnTag: 'cusip', columnKey: 'cusip_0', positionColumnType: 'ALL', title: 'CUSIP'},
            {columnTag: 'pct_mv', columnKey: 'pct_mv_1', positionColumnType: 'PORT', title: 'Market Value %'},
            {
                columnTag: 'sec_group',
                columnKey: 'sec_group_hidden',
                positionColumnType: 'ALL',
                title: 'Security Group',
                visible: false
            },
            {
                columnTag: 'sec_type',
                columnKey: 'sec_type_hidden',
                positionColumnType: 'ALL',
                title: 'Security Type',
                visible: false
            }
        ],
        isSectorView: dummyIsSectorView,
        dataFormat: dummyDataFormat,
        portfolio: 'test_ticker',
        portId: expect.anything(),
        fullPortfolioName: 'test_fullname',
        portfolioIdentifier: 'test_name',
        forDate: '03/10/2016',
        currency: 'USD',
        holidayCalendar: 'GreenPkg',
        includeAliasPortfolios: false,
        breakdownTree: JSON.stringify({breakdown: {breakdownTitle: 'Security Group', subSectors: [{breakdownRuleType: 'String', groupByColumn: {columnName: 'Security Group', columnTag: 'sec_group', positionColumnType: 'ALL'}, useNoneBuckets: true}]}, title: 'Security Group'}),
        benchSelection: 'RISK',
        benchOrder: 1,
        layout: undefined,
        normalizedWidgetFilter: false,
        todayDate: CalendarDateUtils.checkOverrideAndGetToday().format(DateFormatConstants.MMDDYYYY_SLASH),
        portfolioPositionAggregationType: 'NONE',
        benchmarkPositionAggregationType: 'NONE',
        closedPositionAggregationType: 'NONE',
        isAnchorPortfolio: false,
        overrideDateSortByOldest: false,
        splitPositionTypes: 'XC,XF,XH,XS,SW,O',
        isLightLookthroughEnabled: false,
        isEnterpriseWorkspace: false,
        positionMode: 'AS_OF_W',
        isDisplayAtGroupNode: false,
        isTopBottomSectoring: false,
        isFavoriteWidget: undefined
    };

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();

        // Dummy service implementation
        service = new (class extends AbstractWidgetService {
            // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
            getStaticWidgetRequestParams(_widget?: Widget): any {
                return {
                    isSectorView: dummyIsSectorView,
                    dataFormat: dummyDataFormat
                };
            }

            // noinspection JSUnusedGlobalSymbols
            getWidgetConfigType(): string {
                // Use Risk and Exposure config for testing
                return WidgetConfigType.RISK_EXPOSURE;
            }

            // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
            protected modifyWidgetInputsForRequest(_widgetInputs: Map<string, WidgetInput>): void {
                // Empty
            }

            // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
            protected processResponse(
                _widget: Widget,
                requestAdapterConfig: RequestAdapterConfig,
                response: ExploreResponse,
                widgetPayload: WidgetPayload
            ): void {
                // Empty
            }

            protected supportsPointInTimePortfolio() {
                return false;
            }
        })(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.RISK_EXPOSURE], WidgetDataViewOption.HOLDINGS_VIEW);
    });

    beforeEach((done) => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        WorkspaceStore.init();
        const report = new Report();
        WorkspaceStore.updateCurrentReport(report);
        TestUtils.initialize(done);

        port = new Portfolio('test_ticker', new DateValue({date: '03/10/2016', calCode: 'GreenPkg'}));
        port.benchmark = Benchmark.create('RISK', 1, 'TEST');
        port.portName = 'test_ticker';
        port.fullName = 'test_fullname';
        port.title = 'test_name';
        port.currency = 'USD';
        port.performanceSettings.attributionSettings.cannedMethod = 'FIXED_INCOME';
        port.portfolioRiskSettings = new RiskSettings();
        port.portId = 'test_ticker12345';

        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);

        exploreDataRequestServiceGetDataSpy = jest.spyOn(service['exploreDataRequestService'], 'getData$');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    /**
     * Tests getBreakdown
     */
    it('getBreakdown', () => {
        const widgetInputs: Map<string, WidgetInput> = new Map<string, WidgetInput>();

        // No breakdown is defined
        expect(AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.BREAKDOWN_TREE)).toBeUndefined();

        // Empty breakdown is defined
        const breakdown: Breakdown = new Breakdown();
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, breakdown);
        expect(AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.BREAKDOWN_TREE)).toBeUndefined();

        // Non-empty breakdown
        const sector: ColumnSector = new ColumnSector();
        breakdown.addChild(sector);
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, breakdown);
        expect(AbstractWidgetService.getBreakdown(widgetInputs, WidgetInputType.BREAKDOWN_TREE)).toBeDefined();
    });

    /**
     * Tests createRequestParams
     */
    it('simple widget params generation', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        // Create request parameters
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        const requestParams: any = service['createRequestParams'](WorkspaceStore.getCurrentReport(), widget, [port], widget.dataStore.metaData.inputs);
        expect(requestParams).toStrictEqual([requestToBeSent]);
    });

    /**
     * Tests createRequestParams with deferred input
     */
    it('createRequestParams with portfolio override param', () => {
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        widget.dataStore.metaData.inputs.set('portfolioOverrideInput', new PortfolioOverrideInput({portfolio: 'TR-MARKET'}));
        const requestParams: any = service['createRequestParams'](WorkspaceStore.getCurrentReport(), widget, [port], widget.dataStore.metaData.inputs);
        expect(requestParams[0].portfolio).toEqual('TR-MARKET');
        expect(requestParams[0].portfolioIdentifier).toEqual('TR-MARKET');
    });

    it('createRequestParams contains createOptimizationCashBucket for WhatIfPortfolio', () => {
        const portfolio = new WhatIfPortfolio();
        portfolio.compositionSetting.isOptimizationCashSettingChecked = true;
        portfolio.modellingType = ModellingType.POSITION;
        const requestParams: any = [];
        service['enrichRequestParams'](requestParams, widget, portfolio, true, null);
        expect(requestParams.createOptimizationCashBucket).toEqual(true);
    });

    it('createRequestParams contains isFullySpecifiedPortfolio for Core Asset Optimization', () => {
        const portfolio = new PortfolioWithPositions();
        portfolio.compositionSetting.isOptimizationCashSettingChecked = true;
        portfolio.modellingType = ModellingType.POSITION;
        const requestParams: any = [];
        const widgetInputs = new Map<string, WidgetInput>();
        service['enrichRequestParams'](requestParams, widget, portfolio, true, widgetInputs);
        expect(requestParams.isFullySpecifiedPortfolio).toBeUndefined();

        const holdingChange = new PortfolioSecurityHoldingChange();
        holdingChange.isOptoGeneratedChange = true;
        portfolio.holdingChanges = [holdingChange];
        service['enrichRequestParams'](requestParams, widget, portfolio, true, widgetInputs);
        expect(requestParams.isFullySpecifiedPortfolio).toBeUndefined();

        portfolio.compositionSetting.compositionFilter = new CustomFilter('filter');
        widgetInputs.set('filter', new CustomFilter('filter'));
        service['enrichRequestParams'](requestParams, widget, portfolio, true, widgetInputs);
        expect(requestParams.isFullySpecifiedPortfolio).toBe('Y');
    });

    /**
     * Tests createRequestParams For Portfolio with PortFolioRiskSettings
     */
    it('createRequestParams For Portfolio with PortFolioRiskSettings', () => {
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());

        const port1 = new Portfolio('test_tickerTest', new DateValue({date: '03/10/2016', calCode: 'GreenPkg'}));
        port1.benchmark = Benchmark.create('RISK', 1, 'TEST');
        port1.portName = 'test_tickerTest';
        port1.fullName = 'test_fullnameTest';
        port1.title = 'test_name_test';
        port1.currency = 'USD';
        port1.performanceSettings.attributionSettings.cannedMethod = 'FIXED_INCOME';
        port1.portfolioRiskSettings = new RiskSettings();
        port1.portfolioRiskSettings.economyRiskSettings.weightingScheme = 'MTC';
        port1.portId = 'test_ticker54321';

        const requestParams: any = service['createRequestParams'](WorkspaceStore.getCurrentReport(), widget, [port1, port], widget.dataStore.metaData.inputs);

        expect(requestParams[0].portfolio).toEqual('test_tickerTest');
        expect(requestParams[0].riskSettings).not.toBeUndefined();
        expect(requestParams[0].riskSettings.CovMatrix).toEqual('MTC');

        expect(requestParams[1].portfolio).toEqual('test_ticker');
        expect(requestParams[1].riskSettings).toBeUndefined();
    });

    /**
     * Tests createRequestParams for loadAllRequests
     */
    it('createRequestParams for loadAll Requests', () => {
        const mockWidget = new Widget();
        mockWidget.configType = WidgetConfigType.RISK_EXPOSURE;
        const fnSpy = jest.spyOn(WidgetUtils, 'updateWidgetWithPortfolioSettings');
        fnSpy.mockImplementationOnce((_a, _b) => {
        });
        // for a loadAll Request
        service['createWidgetRequestParams'](mockWidget, {}, port, mockWidget.dataStore.metaData.inputs, undefined, true);
        expect(fnSpy).toHaveBeenCalled();
    });

    /**
     * Tests extractDataAndStore
     */
    describe('extractDataAndStore Test', () => {
        it('should test extractDataAndStore', () => {
            jest.spyOn(service, 'handleResponse' as any);
            jest.spyOn(service['exploreDataRequestService'], 'getData$').mockReturnValue(of({}));
            jest.spyOn(service, 'checkIsNullQC').mockImplementation(() => {
            });
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new ReportGroup());
            jest.spyOn(WorkspaceStore.getCurrentWorkpad(), 'getAllPortfolios');
            const request = new ExploreDataRequest([requestToBeSent]);
            request.isBatchExport = undefined;
            request.widgetId = widget.id;
            request.hardRefresh = undefined;
            request.reportTitle = undefined;
            request.widgetTitle = widget.displayTitle;
            request.workspaceTitle = WorkspaceStore.getWorkspace().title;
            request.workspaceOwner = WorkspaceStore.getWorkspace().owner;
            jest.spyOn(service, 'createFinalDataRequest').mockReturnValue(request);
            jest.spyOn(request, 'getCacheKey').mockImplementationOnce(() => '');
            service.extractDataAndStore({
                widget,
                portfolio: port,
                report: WorkspaceStore.getCurrentReport(),
                allPortfolios: [],
                omitData: false,
                isBatchExport: false,
                hardRefresh: false,
                bypassBrowserCache: true
            });

            expect(service['exploreDataRequestService'].getData$).toHaveBeenCalledTimes(1);
            expect(service['exploreDataRequestService'].getData$).toHaveBeenCalledWith(expect.objectContaining({
                isBatchExport: false,
                widgetId: widget.id
            }), false, DataRequestConstants.DATA_REQUEST_URL.BASE, true, false);

            /** commenting this out since getData$ does not have actual implementation configured, hence it will never hit handleResponse */
            // service['exploreDataRequestService'].getData$(new ExploreDataRequest([requestToBeSent]), false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
            //     expect(service['handleResponse']).toHaveBeenCalledWith(requestToBeSent, expect.anything(), expect.anything(), expect.anything(), expect.anything());
            //     expect(service.checkIsNullQC).toHaveBeenCalledTimes(1);
            // });
            // tick();
        });

        it('should test extractDataAndStore with debug Context', () => {
            jest.spyOn(service, 'handleResponse' as any);
            jest.spyOn(service['exploreDataRequestService'], 'getData$').mockClear();
            jest.spyOn(service['exploreDataRequestService'], 'getData$').mockReturnValue(of({}));
            jest.spyOn(service, 'checkIsNullQC').mockImplementation(() => {
            });
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new ReportGroup());
            jest.spyOn(WorkspaceStore.getCurrentWorkpad(), 'getAllPortfolios');
            const request = new ExploreDataRequest([requestToBeSent]);
            request.isBatchExport = undefined;
            request.widgetId = widget.id;
            request.hardRefresh = undefined;
            request.debugContext = true;
            request.reportTitle = undefined;
            request.widgetTitle = widget.displayTitle;
            request.workspaceTitle = WorkspaceStore.getWorkspace().title;
            request.workspaceOwner = WorkspaceStore.getWorkspace().owner;
            jest.spyOn(service, 'createFinalDataRequest').mockReturnValue(request);
            jest.spyOn(request, 'getCacheKey');
            service.extractDataAndStore({
                widget,
                portfolio: port,
                report: WorkspaceStore.getCurrentReport(),
                allPortfolios: [],
                omitData: false,
                isBatchExport: false,
                hardRefresh: false,
                bypassBrowserCache: true,
                debugContext: true
            });

            expect(service['exploreDataRequestService'].getData$).toHaveBeenCalledTimes(1);
            expect(service['exploreDataRequestService'].getData$).toHaveBeenCalledWith(expect.objectContaining({
                isBatchExport: false,
                widgetId: widget.id,
                debugContext: true
            }), false, DataRequestConstants.DATA_REQUEST_URL.BASE, true, false);

            /** commenting this out since getData$ does not have actual implementation configured, hence it will never hit handleResponse */
            // service['exploreDataRequestService'].getData$(new ExploreDataRequest([requestToBeSent]), false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
            //     expect(service['handleResponse']).toHaveBeenCalledWith(requestToBeSent, expect.anything(), expect.anything(), expect.anything(), expect.anything());
            //     expect(service.checkIsNullQC).toHaveBeenCalledTimes(1);
            // });
            // tick();
        });

        describe('Load All Test', () => {
            beforeEach(() => {
                jest.spyOn(service, 'handleResponse' as any);
                jest.spyOn(AppStore.loadAllRequestSubject$, 'next');
                WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new ReportGroup());
                jest.spyOn(WorkspaceStore.getCurrentWorkpad(), 'getAllPortfolios');
            });

            it('should test extractDataAndStore - for load all requests', fakeAsync(() => {
                service.extractDataAndStore({
                    widget,
                    portfolio: port,
                    report: WorkspaceStore.getCurrentReport(),
                    allPortfolios: null,
                    omitData: true,
                });
                service['exploreDataRequestService'].getData$(new ExploreDataRequest([requestToBeSent]), false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
                    expect(AppStore.loadAllRequestSubject$.next).toHaveBeenCalled();
                    expect(service['handleResponse']).not.toHaveBeenCalled();
                });
                tick();
            }));

            it('should test extractDataAndStore - for load all requests with comparison on', fakeAsync(() => {
                const port2 = cloneDeep(port);
                port2.portName = 'IP';
                port2.portId = 'IP_1';
                const port3 = cloneDeep(port);
                port3.portName = 'CORE-HQ';
                port3.portId = 'CORE-HQ_1';
                const allPortfolios = [port, port2, port3];
                const report = WorkspaceStore.getCurrentReport();
                report.comparisonConfigId = 1;

                const workpad: FlatWorkpad = new FlatWorkpad();
                const comparisonConfig: ComparisonConfig = new ComparisonConfig();
                comparisonConfig.portComparisonList = ['test_ticker12345', 'IP_1', 'CORE-HQ_1'];
                workpad.comparisonConfigMap.set(report.comparisonConfigId, comparisonConfig);
                WorkspaceStore.currentWorkpad$.next(workpad);
                service.extractDataAndStore({
                    widget,
                    portfolio: port,
                    report,
                    allPortfolios,
                    omitData: true,
                });
                service['exploreDataRequestService'].getData$(new ExploreDataRequest([requestToBeSent]), true, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
                    expect(AppStore.loadAllRequestSubject$.next).toHaveBeenCalledTimes(3);
                    expect(service['handleResponse']).not.toHaveBeenCalled();
                });
                tick();
            }));
        });

        it('test extractDataAndStore - handleResponse is called with right parameters', fakeAsync(() => {
            jest.spyOn(service, 'handleResponse' as any);
            jest.spyOn(service['exploreDataRequestService'], 'getData$').mockReturnValue(of({}));
            const serverRequest = new ExploreDataRequest([requestToBeSent]);
            jest.spyOn(serverRequest, 'getCacheKey').mockReturnValue(undefined);
            jest.spyOn(service, 'createFinalDataRequest').mockReturnValue(serverRequest);
            jest.spyOn(AppStore.loadAllRequestSubject$, 'next');
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new ReportGroup());
            jest.spyOn(WorkspaceStore.getCurrentWorkpad(), 'getAllPortfolios');

            service.extractDataAndStore({widget, portfolio: port, report: WorkspaceStore.getCurrentReport()});
            service['exploreDataRequestService'].getData$(serverRequest, false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe(() => {
                expect(service['handleResponse']).toHaveBeenCalledWith(requestToBeSent, expect.anything(), expect.anything(), expect.anything(), false);
            });
            tick();
        }));

        it('should handle error', () => {
            jest.spyOn(service['exploreDataRequestService'], 'getData$').mockReturnValue(throwError('Error: Http failure response'));
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new ReportGroup());
            jest.spyOn(WorkspaceStore.getCurrentWorkpad(), 'getAllPortfolios');
            service.extractDataAndStore({widget, portfolio: port, report: WorkspaceStore.getCurrentReport()});

            expect(widget.dataStore.data).toEqual({notification: Notification.createErrorNotification('Error: Http failure response', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_DATA_ERROR)});
        });

        it('should handle cancelled response', fakeAsync(() => {
            WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
            jest.spyOn(service, 'handleResponse' as any);
            jest.spyOn(service['exploreDataRequestService'], 'getData$').mockReturnValue(of({message: DataRequestConstants.CANCELLED_RESPONSE}));
            service.extractDataAndStore({widget, portfolio: port, report: WorkspaceStore.getCurrentReport()});
            service['exploreDataRequestService'].getData$(new ExploreDataRequest([requestToBeSent]), false, DataRequestConstants.DATA_REQUEST_URL.BASE).subscribe((response) => {
                console.log(response);
                expect(service['handleResponse']).not.toHaveBeenCalled();
            });
            tick();
        }));

        it('should test extractDataAndStore for BatchExport', () => {
            jest.spyOn(service, 'handleResponse' as any);
            jest.spyOn(service['exploreDataRequestService'], 'getData$').mockReturnValue(of({}));
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new ReportGroup());
            jest.spyOn(WorkspaceStore.getCurrentWorkpad(), 'getAllPortfolios');
            jest.spyOn(service['exploreDataRequestService'], 'getData$').mockClear();
            service.extractDataAndStore({widget, portfolio: port, report: WorkspaceStore.getCurrentReport(), allPortfolios: [], omitData: false, isBatchExport: true, hardRefresh: false, bypassBrowserCache: false});

            expect(service['exploreDataRequestService'].getData$).toHaveBeenCalledTimes(1);
            expect(service['exploreDataRequestService'].getData$).toHaveBeenCalledWith(expect.objectContaining({
                isBatchExport: true,
                widgetId: widget.id
            }), false, DataRequestConstants.DATA_REQUEST_URL.BASE, false, false);
        });
    });

    /**
     * Tests createWidgetRequestParams for the invalid scenario (the test on extractDataAndStore tests it for the valid scenario)
     */
    it('test createWidgetRequestParams - invalid scenario', () => {
        // Set widget's config type to the unknown type - error should be thrown
        widget.configType = 'invalidConfigType' as any;

        // Mock widgetConfigFactory
        const isCreateNestedNoneBucketsSpy = jest.spyOn(WidgetConfigFactory, 'isCreateNestedNoneBuckets');
        isCreateNestedNoneBucketsSpy.mockImplementation(
            jest.fn(() => {
                return false;
            })
        );

        const isCreateNestedOtherBucketsSpy = jest.spyOn(WidgetConfigFactory, 'isCreateNestedOtherBuckets');
        isCreateNestedOtherBucketsSpy.mockImplementation(
            jest.fn(() => {
                return false;
            })
        );

        const getSettingsThatCanModifyWidgetTitleSpy = jest.spyOn(WidgetConfigFactory, 'getSettingsThatCanModifyWidgetTitle');
        getSettingsThatCanModifyWidgetTitleSpy.mockImplementation(
            jest.fn(() => {
                return [];
            })
        );

        // Run the method
        const requestParams: any = {};

        service['createWidgetRequestParams'](widget, requestParams, port, widget.dataStore.metaData.inputs);

        // Validate
        expect(requestParams.type).toStrictEqual(widget.configType);
    });

    describe('handleResponse Tests', () => {

        beforeEach(() => {
            jest.spyOn(HighlightUtils, 'applyHighlighting');
        });

        it('noDataResponse Test', () => {
            let exploreResponse: ExploreResponse = new (class implements ExploreResponse {
                data = undefined;
                message = 'Unexpected error';
            })();
            expect(service['noDataResponse'](exploreResponse)).toBe('No data in the response, response.message =Unexpected error');

            exploreResponse = new (class implements ExploreResponse {
                data = undefined;
            })();
            expect(service['noDataResponse'](exploreResponse)).toBe('No data in the response');
        });

        it('handleResponse - no data in the response from the backend server', () => {
            const exploreResponse: ExploreResponse = new (class implements ExploreResponse {
                data = undefined;
                message = 'Unexpected error';
            })();

            runHandleResponseAndValidate(exploreResponse, 0, false);
            // no data so no highlighting
            expect(HighlightUtils.applyHighlighting).not.toHaveBeenCalled();
        });

        it('handleResponse - has data in the response from the backend server', () => {
            // Create response
            const exploreResponseConfig: ExploreResponseConfig = new (class implements ExploreResponseConfig {
                columnHeaderDetails = null;
                columns = null;
            })();

            const responseData: ResponseData = new (class implements ResponseData {
                data = null;
            })();

            const exploreResponse: ExploreResponse = new (class implements ExploreResponse {
                data = ObjectUtils.mergeObjectKeys(exploreResponseConfig, responseData);
            })();

            runHandleResponseAndValidate(exploreResponse, 1, true);
            expect(HighlightUtils.applyHighlighting).toHaveBeenCalledTimes(1);
        });

        /**
         * @param exploreResponse explore response
         * @param expectedNumberOfCalls how many times the processResponse widget.dataStore.data are expected to be called.
         * @param shouldHaveNoNotification indicates whether there should be no notification in the
         * widget's data store's data. (A notifications will be set if there is no data in the response).
         */
        function runHandleResponseAndValidate(
            exploreResponse: ExploreResponse,
            expectedNumberOfCalls: number,
            shouldHaveNoNotification: boolean
        ): void {
            // Spy on the setting the widget data store
            const widgetDataStoreSpy = jest.spyOn(widget['dataStore'], 'data', 'set');

            // Don't do anything on the process response
            const processResponseSpy = jest.spyOn<any, any>(service, 'processResponse');
            processResponseSpy.mockImplementation(
                jest.fn(() => {
                    // Do nothing
                })
            );

            // Handle response
            service['handleResponse'](requestToBeSent, exploreResponse, widget, widget.dataStore.metaData.inputs, false);

            // Validate
            expect(processResponseSpy).toHaveBeenCalledTimes(expectedNumberOfCalls);

            expect(widgetDataStoreSpy).toHaveBeenCalledTimes(1);
            const widgetPayload: WidgetPayload = widgetDataStoreSpy.mock.calls[0][0];
            expect(isNil(widgetPayload.notification)).toStrictEqual(shouldHaveNoNotification);
        }
    });

    /**
     * Testing the method to get the portfolio risk settings
     */
    it('Test portfolio risk settings method', () => {
        const portfolio: Portfolio = new Portfolio('test_ticker');
        const riskSettingsData = {
            'configType': 'RISK_SETTINGS',
            'economyRiskSettings': {'dateObject': {'calCode': 'GreenPkg', 'dateString': false, 'date': 'May 18, 2018'}},
            'exposureRiskSettings': {},
            'advancedRiskSettings': {},
        };
        const riskSettings = new RiskSettings(riskSettingsData);
        const fbaWidget = new Widget(WidgetConfigType.PRA);
        fbaWidget.dataStore.metaData.inputs.set('riskSettings', riskSettings);

        const portRiskSettingsData = {
            'configType': 'RISK_SETTINGS',
            'economyRiskSettings': {
                'riskHorizon': 4,
                'weightingScheme': 'DLY',
                'decayFactor': 0.98282,
                'confidenceLevelSD': 1,
                'period': 252
            },
            'exposureRiskSettings': {'riskModel': 'DEFAULT'},
            'advancedRiskSettings': {}
        };
        portfolio.portfolioRiskSettings = new RiskSettings(portRiskSettingsData);
        const requestParams = {};
        service['createWidgetRequestParams'](fbaWidget, requestParams, portfolio, fbaWidget.dataStore.metaData.inputs);
        const expectedResult = {
            EconomyDate: 'May 18, 2018',
            Calendar: 'GreenPkg',
            ConfidenceLevelInStdDeviation: 1,
            CovMatrix: 'DLY',
            DecayFactor: 0.98282,
            EconomyDate: 'May 18, 2018',
            ModelMapping: 'DEFAULT',
            Period: 252,
            RiskHorizon: 4
        };

        expect(requestParams['riskSettings']).toEqual(expectedResult);
    });

    it('tests supportsPointInTimePortfolio', () => {
        expect(service['supportsPointInTimePortfolio']).toBeTruthy();
    });

    describe('test validateInputs', () => {
        let report: Report;
        let widgetObj: Widget;

        beforeEach(() => {
            report = new Report();
            widgetObj = new Widget(WidgetConfigType.RISK_EXPOSURE);
        });

        it('test validateInputs with supportsPointInTimePortfolio', () => {
            expect(service['validateInputs'](widgetObj, new Portfolio(), report) instanceof Notification).toBe(true);
        });

        it('should validateInputs with DecompositionColumnWithAggregationType', () => {
            const columnSet = new ColumnSet();
            widgetObj.dataStore.metaData.inputs.set('columns', columnSet);

            const column = new ColumnConfig();
            columnSet.columns.push(column);

            const overrideDateColumnOption = new OverrideDateColumnOption();
            overrideDateColumnOption.showAttribution = true;

            const customAggregationColumnOption = new CustomAggregationColumnOption();
            customAggregationColumnOption.subtotalType = 0;

            column.optionValues.push(overrideDateColumnOption);
            column.optionValues.push(customAggregationColumnOption);

            expect(service['validateInputs'](widgetObj, port, report) instanceof Notification).toBe(true);

            customAggregationColumnOption.subtotalType = 2300;

            expect(service['validateInputs'](widgetObj, port, report)).toBe(null);

        });

        it('tests validateInputs', () => {
            expect(service['validateInputs'](widgetObj, new Portfolio(), new Report()).message).toEqual(NotificationConstants.INVALID_PORTNAME_MESSAGE);
            expect(service['validateInputs'](widgetObj, new Portfolio('PEP'), new Report()).message).toEqual(NotificationConstants.INVALID_PORTDATE_MESSAGE);
            expect(service['validateInputs'](widgetObj, port, new Report())).toBe(null);

            jest.spyOn<any, any>(service, 'isInputValidForColumnBreakdown').mockReturnValue(false);
            expect(service['validateInputs'](widgetObj, new Portfolio(), report) instanceof Notification).toBe(true);
            jest.resetAllMocks();

            const columnSet = new ColumnSet();
            widgetObj.dataStore.metaData.inputs.set('columns', columnSet);
            expect(service['validateInputs'](widgetObj, port, new Report()) instanceof Notification).toBeTruthy();

            expect(service['validateInputs'](new Widget(WidgetConfigType.SCATTER), port, new Report())).toBe(null);

            // test validateInputs method for what-if portfolio (Adhoc)
            const whatIfPg: Portfolio = new RulesBasedPortfolio('adhoc', 'adhoc', new DateValue({date: '20180904'}));
            (whatIfPg as RulesBasedPortfolio).compositionRules.tradeRules = [new PortfolioRule(undefined, undefined, undefined, undefined, CompositionConstants.ADHOC_PORT)];
            (whatIfPg as WhatIfPortfolio).holdingChanges = [new NewSecurityHoldingChange()];
            expect(service['validateInputs'](widgetObj, whatIfPg, new Report()).message).toEqual(CommonConstants.NOTIFICATION_MESSAGE.DOES_NOT_SUPPORT_PORT_GROUP_WITH_POSITION_PORTFOLIOS);
        });
    });


    it('tests isInputValidForColumnBreakdown', () => {
        const widgetObj = new Widget();
        expect(service['isInputValidForColumnBreakdown'](widgetObj)).toBe(true);

        const topBottomFilter: TopBottomFilterInput = new TopBottomFilterInput();
        widgetObj.dataStore.metaData.inputs.set(CommonConstants.CONFIG_TYPE.TOP_BOTTOM_FILTER, topBottomFilter);
        expect(service['isInputValidForColumnBreakdown'](widgetObj)).toBe(true);

        topBottomFilter.top = 2;
        topBottomFilter.columnTag = 'abc';
        topBottomFilter.columnKey = 'abc_234';
        const columnSet: ColumnSet = new ColumnSet();
        widgetObj.dataStore.metaData.inputs.set(CommonConstants.CONFIG_TYPE.COLUMNS, columnSet);
        expect(service['isInputValidForColumnBreakdown'](widgetObj)).toBe(true);

        const columnBreakdown: ColumnBreakdown = new ColumnBreakdown();
        const columnConfig: ColumnConfig = new ColumnConfig({columnTag: 'abc', columnKey: 'abc_123'});
        columnConfig.optionValues.push(columnBreakdown);
        columnSet.columns.push(columnConfig);
        expect(service['isInputValidForColumnBreakdown'](widgetObj)).toBe(true);

        topBottomFilter.columnTag = 'abc';
        expect(service['isInputValidForColumnBreakdown'](widgetObj)).toBe(true);

        columnBreakdown.breakdown = new Breakdown();
        columnBreakdown.breakdown.children.push(new ColumnSector());
        // As now we're comparing from columnKey, they have different columnKey so input is valid
        expect(service['isInputValidForColumnBreakdown'](widgetObj)).toBe(true);

        topBottomFilter.columnKey = 'abc_123';
        // If top bottom filter and colConfig have same column key then return false
        expect(service['isInputValidForColumnBreakdown'](widgetObj)).toBe(false);
        columnBreakdown.multiManagerData = new MultiManagerBreakdownModel();
        columnBreakdown.breakdown = new Breakdown();
        expect(service['isInputValidForColumnBreakdown'](widgetObj)).toBe(true);
    });

    describe('addIdentifierColumn Test', () => {
        it('should update the column if identifierColumn already exists in the column list', () => {
            const requestParam: any = {columns: [{columnTag: 'cusip'}]};
            service.addIdentifierColumn(requestParam);
            // column has already cusip column so set identifierColumn to true
            expect(requestParam.columns[0].identifierColumn).toBeTruthy();
        });
        it('should add identifierColumn to the end if not existing already (order matter in qbstr)', () => {
            const requestParam: any = {columns: [{columnTag: 'dummy_name'}]};
            service.addIdentifierColumn(requestParam);
            // cusip col is not present so add whole identifier column
            expect(requestParam.columns[0].identifierColumn).toBeFalsy();
            expect(requestParam.columns[requestParam.columns.length - 1].identifierColumn).toBeTruthy();
        });
    });

    it('createFinalDataRequest for compare to mode test case', () => {
        const portfolio = new Portfolio();
        portfolio.portId = 'PEP1234';
        portfolio.datePicker = new DateValue({
            calCode: 'GREEN_PKG',
            dateString: true,
            dateStringValue: 'T-10',
            date: '10-Mar-2019'
        });
        const portfolio1 = new Portfolio();
        portfolio1.portId = 'WhatIfPEP1234';
        portfolio1.datePicker = new DateValue({
            calCode: 'GREEN_PKG',
            dateString: true,
            dateStringValue: 'T-10',
            date: '10-Mar-2019'
        });
        const report = new Report('report 1');
        report.comparisonConfigId = 1;
        const comparisonConfig: ComparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['PEP1234', 'WhatIfPEP1234'];
        const modifiedWidgetInputs = new Map<string, WidgetInput>();
        const allPortfolios: Portfolio[] = [portfolio, portfolio1];
        const reportGroup: ReportGroup = new ReportGroup({
            reports: [report],
            portfolios: allPortfolios
        });
        reportGroup.comparisonConfigMap.set(report.comparisonConfigId, comparisonConfig);
        WorkspaceStore.currentWorkpad$.next(reportGroup);

        const portfoliosToCompare = WorkpadUtils.getPortfoliosToCompare(report, allPortfolios);

        jest.spyOn(service, 'addIdentifierColumn').mockReturnValue();
        const requestParam = service.createFinalDataRequest(widget, portfoliosToCompare, report, modifiedWidgetInputs);
        expect(requestParam.requestParams.length).toEqual(2);
    });

    it('createFinalDataRequest export request', () => {
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const configInput = new class implements WidgetConfigInput {
            inputConfigType: string;
            inputName: string;
            inputTitle: string;
            valueField?: string;
            columnFilters?: any[];
            default?: any;
            hiddenColumns?: any[];
            groupByColumnFilters?: any[];
            customColumnFilters?: any[];
            max?: number;
            isOpen?: boolean;
            otherNames?: string[];
            disableNormalized?: boolean;
            includeNoBreakdown?: boolean;
            hideTopColumnGroup?: boolean;
            showFavorite?: boolean;
            mandateSettingType?: string;
            oldProps?: string[];
            hideFundSectoringTabs?: boolean;
            hideTitle?: boolean;
        };

        configInput.inputConfigType = WidgetInputType.COLUMNS;
        configInput.inputName = 'columns';
        const column = new ColumnConfig();
        column.columnTag = 'test-hidden';
        column.columnKey = 'test-hidden';
        configInput.hiddenColumns = [column];
        widget.widgetConfigInputs = [];
        widget.widgetConfigInputs.push(configInput);
        const portfolio = new Portfolio();

        const report = new Report();
        report.comparisonConfig = new ComparisonConfig();
        report.comparisonConfig.portComparisonList = ['PEP1234', 'WhatIfPEP1234'];
        const modifiedWidgetInputs = new Map<string, WidgetInput>();
        const columnSet = new ColumnSet();
        columnSet.createColumnAndAdd('test', 'test');
        modifiedWidgetInputs.set('columns', columnSet);

        WorkspaceStore.currentWorkpad$.next(new ReportGroup({
            reports: [report],
            portfolios: [{portId: 'PEP1234'}, {portId: 'WhatIfPEP1234'}]
        }));

        // Save only dateStringValue in case of relative dates
        portfolio.datePicker = new DateValue({
            calCode: 'GREEN_PKG',
            dateString: true,
            dateStringValue: 'T-10',
            date: '10-Mar-2019'
        });
        const portfoliosToCompare = [portfolio];

        jest.spyOn(service, 'addIdentifierColumn').mockReturnValue();
        let requestParam = service.createFinalDataRequest(widget, portfoliosToCompare, report, modifiedWidgetInputs, true);

        // Hidden column will part of it
        expect(requestParam.requestParams[0].columns.length).toBe(2);
        // last column will be hidden column
        expect(requestParam.requestParams[0].columns[1].columnTag).toBe('test-hidden');
        expect(requestParam.requestParams[0].columns[1].visible).toBe(false);
        expect(requestParam.requestParams[0].columns[0].columnTag === 'test').toBe(true);

        requestParam = service.createFinalDataRequest(widget, portfoliosToCompare, report, modifiedWidgetInputs);
        expect(requestParam.requestParams[0].columns.length).toBe(2);
    });

    it('createRequestConfig test case', () => {
        jest.spyOn(WidgetUtils, 'convertWidgetInputsToVizualisationColumnConfig').mockReturnValue({});
        jest.spyOn(WidgetUtils, 'assembleDefaultFilterValues').mockReturnValue({});
        const widgetInputs: any = new Map();
        widgetInputs.set('columns', new ColumnSet());
        let request: any = {portfolio: 'PEP'};
        const response: any = {data: {columns: {}}};
        let param = service['createRequestConfig'](widgetInputs, {} as any, response, request, false);
        expect(param.portfolio).toBeDefined();
        expect(param.portfolio).toEqual('PEP');

        request = {portfolioIdentifier: 'WhatIf PEP', portfolio: 'PEP'};
        param = service['createRequestConfig'](widgetInputs, {} as any, response, request, false);
        expect(param.portfolio).toBeDefined();
        expect(param.portfolio).toEqual('WhatIf PEP');

        param = service['createRequestConfig'](widgetInputs, {} as any, response, request, true);
        expect(param.portfolio).toBeDefined();
        expect(param.portfolio).toEqual('Compare');
    });

    it('checkIsNullQC test case', () => {
        const portfolio = new Portfolio('PEP');
        const publishStateWrapper = new PublishStateWrapper();
        publishStateWrapper.publishedStateResults.push(new PublishStateItem('PEP', 0, '2020-04-01T05:40:52.000Z'));
        portfolio.publishStateWrapperSubject$.next(publishStateWrapper);

        const data = {
            footerDetails: {
                PUBLISH_TIME: '2020-04-01T05:50:52.000Z'
            }
        };

        service.checkIsNullQC(portfolio, data);
        expect(portfolio.publishStateWrapperSubject$.getValue().isNullQC).toBeTruthy();

    });

    it('clearDataFromCache test case', () => {
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        jest.spyOn(service, 'createFinalDataRequest');
        jest.spyOn(service['exploreDataRequestService'], 'clearDataFromCache');
        service.clearDataFromCache(widget, port, WorkspaceStore.getCurrentReport(), []);
        expect(service.createFinalDataRequest).toHaveBeenCalled();
        expect(service['exploreDataRequestService'].clearDataFromCache).toHaveBeenCalled();
    });

    describe('getYAxisOverrideInputs Test', () => {
        let widgetInputs: Map<string, WidgetInput>;
        let primaryAxisSettings, secondaryAxisSettings;
        beforeEach(() => {
            jest.spyOn(service, 'getYAxisOverrideInputs');
            widgetInputs = new Map<string, WidgetInput>();

            primaryAxisSettings = new AxisSettings();
            primaryAxisSettings.axisType = AxisType.PRIMARY;

            secondaryAxisSettings = new AxisSettings();
            secondaryAxisSettings.axisType = AxisType.SECONDARY;
        });
        it('getYAxisOverrideInputs test with data', () => {
            primaryAxisSettings.axisTitle = 'abc';
            secondaryAxisSettings.axisTitle = 'xyz';
            widgetInputs.set(ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS, primaryAxisSettings);
            widgetInputs.set(ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS, secondaryAxisSettings);
            const data = service.getYAxisOverrideInputs(widgetInputs);
            expect(service.getYAxisOverrideInputs).toHaveBeenCalled();
            expect(data.primaryYAxisOverride).toEqual('abc');
            expect(data.secondaryYAxisOverride).toEqual('xyz');
        });

        it('getYAxisOverrideInputs test with nulls', () => {
            widgetInputs.set(ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS, primaryAxisSettings);
            widgetInputs.set(ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS, secondaryAxisSettings);
            const data = service.getYAxisOverrideInputs(widgetInputs);
            expect(service.getYAxisOverrideInputs).toHaveBeenCalled();
            expect(data.primaryYAxisOverride).toBeUndefined();
            expect(data.secondaryYAxisOverride).toBeUndefined();
        });
    });
});
