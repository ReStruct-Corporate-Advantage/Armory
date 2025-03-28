import {HttpClient} from '@angular/common/http';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ColumnSet, ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {
    AlertConstants,
    AttributionSettings,
    ColumnConfig,
    CoreUserMetaDataStore, CoreWidgetConfigStore,
    DateValue,
    ExploreDialogParam,
    ExpostSettings,
    PerformanceConstants,
    PerformanceSettings,
    TimePeriod,
    WidgetConfig,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {RequestAdapterConfig, VizualizationColumnConfig} from '@interfaces/request.interface';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExpostTimeSeriesSettings} from '@models/expostSettings/expost-time-series-settings.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PriceChartInputs} from '@models/price-chart-inputs/price-chart-inputs.model';
import {CustomFilter, CustomSector, GroupRule, NormalizedFlag} from '@blk/explore-ui-breakdown';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {BarChartAdditionalSettings} from '@models/widget/inputs/chart-settings/bar-chart-additional-settings.model';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {MinValFilter} from '@models/widget/inputs/min-val-filter.model';
import {TopBottomFilterInput} from '@models/widget/inputs/top-bottom-filter-input.model';
import {Notification} from '@models/widget/notification.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Report} from '@models/workspace/report.model';
import {QueryKeyEntryType} from '@qbstr/data-cube';
import {ChartType} from '@qbstr/highcharts-api';
import {Http2BmsService} from '@services/bms';
import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {SpriteletLauncherServiceRegistry} from '@services/spritelet-launcher/spritelet-launcher-service.registry';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {ExportUtils} from '@utils/export/export.utils';
import {TestUtils} from '@utils/test.utils';
import {WidgetUtils} from '@utils/widget.utils';
import {GridsterItemComponent} from 'explore-angular-gridster2';
import {cloneDeep} from 'lodash';
import {BehaviorSubject, of} from 'rxjs';
import {CommonConstants, ExportConstants, TabularWidgetConstants, WidgetConstants, WorkspaceMenuItemsConstants} from '../../constants';
import {BatchExportingStore, WorkspaceStore} from '../../stores';
import {WidgetComponent} from './widget.component';
import {ExportService} from '@services/export/export.service';
import {TestScheduler} from 'rxjs/testing';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {ShowAsChartInput} from '@models/widget/inputs/show-as-chart-input.model';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {HttpRequestQueueService} from '@services/http-request-queue/http-request-queue.service';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {
    ExportHubJob,
    ExportHubJobWidget
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {ExportHubUtils} from '../export-hub/utils/export-hub.utils';
import {ExportHubStore} from '@stores/export-hub.store';
import {ApiModelConversionService} from '@services/portfolio-analytics-api/api-model-conversion.service';

jest.mock('explore-angular-gridster2');

describe('WidgetComponent', () => {
    let component: WidgetComponent;
    let fixture: ComponentFixture<WidgetComponent>;

    const httpGetMockFn = jest.fn();
    const httpPostMockFn = jest.fn();

    const httpMock = {
        get: httpGetMockFn,
        post: httpPostMockFn
    };

    let httpRequestQueueServiceMock;

    const riskAndExposureServiceMock = {
        extractDataAndStore: jest.fn(),
        getWidgetConfigTypes: jest.fn(() => [WidgetConfigType.RISK_EXPOSURE])
    };

    const exportServiceMock = {
        processPDF: jest.fn(),
    };

    const returnTimeSeriesSpriteletLauncher = {
        launchSpritelet: jest.fn(),
        getSpriteletActionKey: jest.fn(() => PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES)
    };

    const columnDefinitionSpriteletLauncher = {
        launchSpritelet: jest.fn(),
        getSpriteletActionKey: jest.fn(() => CommonConstants.COLUMN_DEFINITION_SPRITELET.ACTION_KEY)
    };

    const priceChartSpriteletLauncher = {
        launchSpritelet: jest.fn(),
        getSpriteletActionKey: jest.fn(() => TabularWidgetConstants.PRICE_CHART_SPRITELET.ACTION_KEY)
    };

    const exportHubStoreStub = {
        openScheduleJobModal: jest.fn()
    };

    const apiModelConversionServiceMock = {
        convertExploreModelToApiModel$: jest.fn(() => of({
            message: 'test'
        })),
        getGenerateApiRequestPayload: jest.fn()
    };

    let testScheduler: TestScheduler;
    let openMockFn;
    let closeMockFn;

    beforeAll((done) => {
        WorkspaceStore.init();
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        httpRequestQueueServiceMock = {
            cancelQueuedRequest: jest.fn()
        };

        TestBed.configureTestingModule({
            declarations: [WidgetComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                Http2BmsService,
                {provide: HttpClient, useValue: httpMock},
                {
                    provide: AbstractWidgetService, useValue: riskAndExposureServiceMock,
                    deps: [Http2BmsService],
                    multi: true
                },
                {
                    provide: WidgetServiceRegistry, useClass: WidgetServiceRegistry
                },
                {
                    provide: AbstractSpriteletLauncherService, useValue: returnTimeSeriesSpriteletLauncher,
                    multi: true
                },
                {
                    provide: AbstractSpriteletLauncherService, useValue: columnDefinitionSpriteletLauncher,
                    multi: true
                },
                {
                    provide: AbstractSpriteletLauncherService, useValue: priceChartSpriteletLauncher,
                    multi: true
                },
                {
                    provide: SpriteletLauncherServiceRegistry, useClass: SpriteletLauncherServiceRegistry
                },
                {
                    provide: ApiModelConversionService, useValue: apiModelConversionServiceMock
                },
                {provide: ExportService, useValue: exportServiceMock},
                {provide: HttpRequestQueueService, useValue: httpRequestQueueServiceMock},
                {provide: ExportHubStore, useValue: exportHubStoreStub}
            ],
            imports: [AladdinAngularComponentsModule]
        });

        testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

        fixture = TestBed.createComponent(WidgetComponent);
        component = fixture.componentInstance;

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        oldWorkspaceWorkpad = WorkspaceStore.currentWorkpad$;
        oldBatchExportingWorkpad = BatchExportingStore.currentWorkpad$;

        fixture.detectChanges();
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
    });

    let oldWorkspaceWorkpad;
    let oldBatchExportingWorkpad;

    afterEach(() => {
        WorkspaceStore.currentWorkpad$ = oldWorkspaceWorkpad;
        BatchExportingStore.currentWorkpad$ = oldBatchExportingWorkpad;
    });

    function getMetaData() {
        const metaData = new WidgetDataStoreMetaData();
        const cols = [
            {
                'columnTag': 'security_description',
                'positionColumnType': 'ALL',
                'columnKey': 'security_description_1'
            },
            {
                'columnTag': 'cusip',
                'positionColumnType': 'ALL',
                'columnKey': 'cusip_0'
            },
            {
                'columnTag': 'pct_mv',
                'positionColumnType': 'PORT',
                'columnKey': 'pct_mv_1'
            }
        ];
        metaData.inputs.set('columns', new ColumnSet(cols));
        return metaData;
    }

    function getMetaDataWithParentMetaData() {
        const metaData = getMetaData();
        metaData.parentMetaData = new WidgetDataStoreMetaData();

        const cols = [
            {
                'columnTag': 'security_description',
                'positionColumnType': 'ALL',
                'columnKey': 'security_description_1'
            },
            {
                'columnTag': 'cusip',
                'positionColumnType': 'ALL',
                'columnKey': 'cusip_0'
            }
        ];
        metaData.parentMetaData.inputs.set('columns-parent', new ColumnSet(cols));
        return metaData;
    }

    it('Test the correct widgetLoadingStatusMap is populated', () => {
        let port = new Portfolio();
        port.datePicker = new DateValue();
        component.portfolio = port;
        component.report = new Report('test-report');

        WorkspaceStore.currentWorkpad$ = {
            getValue: jest.fn(() => [port])
        } as any;

        BatchExportingStore.currentWorkpad$ = {
            getValue: jest.fn(() => [port])
        } as any;

        expect(WorkspaceStore.widgetLoadingStatusMap.size).toEqual(0);
        expect(BatchExportingStore.widgetLoadingStatusMap.size).toEqual(0);

        component.ngOnInit();

        expect(WorkspaceStore.widgetLoadingStatusMap.size).toEqual(1);
        expect(WorkspaceStore.widgetLoadingStatusMap.get(component.widget.id).getValue()).toBeTruthy();

        component.isBatchExport = true;
        // Test with a widget that is dependent on a parent for data
        component.widget.dataStore.isDependentOnParentForData = true;
        component.widget.dataStore.parentDataStore = new WidgetDataStore();
        component.ngOnInit();
        expect(BatchExportingStore.widgetLoadingStatusMap.size).toEqual(0);

        // Test with a widget that is NOT dependent on a parent for data
        component.widget.dataStore.isDependentOnParentForData = false;
        component.ngOnInit();
        expect(BatchExportingStore.widgetLoadingStatusMap.size).toEqual(1);
        expect(BatchExportingStore.widgetLoadingStatusMap.get(component.widget.id).getValue()).toBeTruthy();

        port = new PortfolioWithPositions();
        port.datePicker = new DateValue({date: 20240805});
        (port as PortfolioWithPositions).compositionSetting.isApplyFilterToNewWidgetsChecked = true;
        const compositionFilter = new CustomFilter();
        compositionFilter.customSector = new CustomSector();
        compositionFilter.customSector.rule = new GroupRule();
        (port as PortfolioWithPositions).compositionSetting.compositionFilter = compositionFilter;
        component.portfolio = port;

        WorkspaceStore.currentWorkpad$ = {
            getValue: jest.fn(() => [port])
        } as any;

        BatchExportingStore.currentWorkpad$ = {
            getValue: jest.fn(() => [port])
        } as any;

        jest.spyOn(component, 'refreshWidget').mockImplementation(() => {});
        component.ngOnInit();
        expect(component.widget.dataStore.metaData.inputs.get(WidgetInputType.FILTER)).toBe(compositionFilter);

        (port as PortfolioWithPositions).compositionSetting.isNormalized = new NormalizedFlag(true);
        component.ngOnInit();
        expect(component.widget.dataStore.metaData.inputs.get(FavoriteConstants.NORMALIZED_FLAG)['data']).toBe(true);
    });

    it('Test deleteWidgetFromReport', () => {
        const report: Report = new Report();
        jest.spyOn(WorkspaceStore, 'getCurrentReport').mockReturnValue(report);
        const spy = jest.spyOn(report, 'deleteWidget').mockImplementation(_a => {});
        component.deleteWidgetFromReport();
        expect(spy).toHaveBeenCalled();
    });

    it('Test onRefreshButtonClick', () => {
        jest.spyOn(component, 'refreshWidget').mockReturnValue(null);
        component.onRefreshButtonClick({ctrlKey: true} as any as MouseEvent);
        expect(component.refreshWidget).toHaveBeenCalled();
    });

    it('Test onRefreshButtonClick with debugContext', () => {
        jest.spyOn(component, 'refreshWidget').mockReturnValue(null);
        component.onRefreshButtonClick({ctrlKey: true, shiftKey: true} as any as MouseEvent);
        expect(component.refreshWidget).toHaveBeenCalledWith(true, undefined, true);
    });

    it('should open dialog with params', () => {
        jest.spyOn(component['notificationService'], 'openDialog');
        let event = {ctrlKey: false};
        component['deleteWidget'](event as MouseEvent);

        expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
            new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.REMOVE_WIDGET,
                AlertConstants.BODY.REMOVE_WIDGET,
                AlertConstants.BTN.REMOVE,
                AlertConstants.BTN.CANCEL,
                component.deleteWidgetFromReport
            ));

        const report: Report = new Report();
        jest.spyOn(WorkspaceStore, 'getCurrentReport').mockReturnValue(report);
        const spy = jest.spyOn(report, 'deleteWidget');
        event = {ctrlKey: true};
        component['deleteWidget'](event as MouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    describe('openWidgetSettingsModal/closeWidgetSettingsModal Test', () => {
        it('should open and close widgetSettingsModal', () => {
            component.openWidgetSettingsModal();
            expect(component.isWidgetSettingsModalOpen).toBeTruthy();

            component.closeWidgetSettingsModal();
            expect(component.isWidgetSettingsModalOpen).toBeFalsy();
        });
    });

    describe('onMoreMenuItemClicked Test', () => {
        it('should call correct more menu item', () => {
            const menuOption = {
                element: {
                    eventData: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF
                }
            };
            jest.spyOn(component, 'onExportItemClicked');
            component.onMoreMenuItemClicked(menuOption);
            expect(component.onExportItemClicked).toHaveBeenCalledTimes(1);

            menuOption.element.eventData = WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL;
            component.onMoreMenuItemClicked(menuOption);
            expect(component.onExportItemClicked).toHaveBeenCalledTimes(2);

            menuOption.element.eventData = 'refresh';
            jest.spyOn(component, 'refreshWidget').mockImplementationOnce((_a, _b, _c) => {});
            component.onMoreMenuItemClicked(menuOption);
            expect(component.refreshWidget).toHaveBeenCalled();

            menuOption.element.eventData = 'settings';
            jest.spyOn(component, 'openWidgetSettingsModal');
            component.onMoreMenuItemClicked(menuOption);
            expect(component.openWidgetSettingsModal).toHaveBeenCalled();

            menuOption.element.eventData = 'minimize';
            jest.spyOn(component, 'minimizeWidget');
            component.onMoreMenuItemClicked(menuOption);
            expect(component.minimizeWidget).toHaveBeenCalled();

            menuOption.element.eventData = 'maximize';
            jest.spyOn(component, 'maximizeWidget').mockImplementationOnce(() => {});
            component.onMoreMenuItemClicked(menuOption);
            expect(component.maximizeWidget).toHaveBeenCalled();

            menuOption.element.eventData = 'delete';
            jest.spyOn(component, 'deleteWidget');
            component.onMoreMenuItemClicked(menuOption);
            expect(component.deleteWidget).toHaveBeenCalled();

            menuOption.element.eventData = 'tabularView';
            jest.spyOn(component, 'launchTabularView');
            component.onMoreMenuItemClicked(menuOption);
            expect(component.launchTabularView).toHaveBeenCalled();

            menuOption.element.eventData = 'chartingLibChanged';
            jest.spyOn(component, 'changeChartingLib');
            component.onMoreMenuItemClicked(menuOption);
            expect(component.changeChartingLib).toHaveBeenCalled();

            menuOption.element.eventData = 'search';
            jest.spyOn(component, 'toggleTableSearch');
            component.onMoreMenuItemClicked(menuOption);
            expect(component.toggleTableSearch).toHaveBeenCalled();

            menuOption.element.eventData = 'showFootnotes';
            jest.spyOn(component, 'showFootnote').mockImplementationOnce(() => {});
            component.isFootnoteChecked = false;
            component.onMoreMenuItemClicked(menuOption);
            expect(component.showFootnote).toHaveBeenCalled();

            menuOption.element.eventData = 'unknown';
            jest.spyOn(console, 'warn');
            component.onMoreMenuItemClicked(menuOption);
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('maximizeWidget Test', () => {
        beforeEach(() => {
            const widgetToMaximize = new Widget();
            widgetToMaximize.isMaximized = false;
            widgetToMaximize.dimensions = {
                cols: 4,
                rows: 6,
                x: 8,
                y: 0
            };
            component.widget = widgetToMaximize;

            component.gridsterItem = new GridsterItemComponent(null, null, null, null);
            component.gridsterItem.$item = widgetToMaximize.dimensions;
            document.body.innerHTML = '<gridster-item id="widgetItem"></gridster-item>';
            component.gridsterItem.el = document.getElementById('widgetItem') as HTMLElement;
            component.gridsterItem.el.scrollIntoView = function () {
            };

            fixture.detectChanges();
        });

        it('should maximize widget and minimize all others', () => {
            jest.spyOn(component.minimizeAllWidgets, 'emit');
            component.maximizeWidget();
            expect(component.widget.isMaximized).toBe(true);
            expect(component.minimizeAllWidgets.emit).toHaveBeenCalled();
        });

        it('widget tilte changes', () => {
            component.headerInputValueChanged('test');
            expect(component.widget.title).toBe('test');
            expect(component.widgetTitle).toBe('test');
        });
    });

    describe('minimizeWidget Test', () => {
        beforeEach(() => {
            const widgetToMinimize = new Widget();
            widgetToMinimize.isMaximized = true;
            widgetToMinimize.dimensions = {
                cols: 24,
                rows: 18,
                x: 0,
                y: 0
            };
            widgetToMinimize.originalDimensions = {
                cols: 4,
                rows: 6,
                x: 8,
                y: 0
            };
            component.widget = widgetToMinimize;

            component.gridsterItem = new GridsterItemComponent(null, null, null, null);
            component.gridsterItem.$item = widgetToMinimize.dimensions;
            document.body.innerHTML = '<gridster-item id="widgetItem"></gridster-item>';
            component.gridsterItem.el = document.getElementById('widgetItem') as HTMLElement;
            component.gridsterItem.el.scrollIntoView = function () {
            };

            fixture.detectChanges();
        });

        it('should minimize this widget', () => {
            jest.spyOn(component, 'resizePush').mockReturnValue(true);
            component.minimizeWidget(true);
            expect(component.resizePush).toBeCalled();
            expect(component.widget.isMaximized).toBe(false);
        });

        it('should not minimize if no original settings', () => {
            component.widget.originalDimensions = undefined;
            jest.spyOn(component, 'resizePush');
            component.minimizeWidget(undefined);
            expect(component.resizePush).toBeCalledTimes(0);
            expect(component.widget.isMaximized).toBe(true);
        });
    });

    it('test correct chartinglib is assigned', () => {
        const port = new Portfolio();
        port.benchmark = Benchmark.create('RISK', 1, 'TEST');
        port.portName = 'test_ticker';
        port.fullName = 'test_fullname';
        port.title = 'test_name';
        port.currency = 'USD';
        port.datePicker = new DateValue();
        component.widget = new Widget(WidgetConfigType.EXPOST_TIME_SERIES);
        component.portfolio = port;
        component.report = new Report('test-report');

        jest.spyOn(component, 'refreshWidget').mockImplementation();
        // jest.spyOn(ExpostTimeSeriesSettings, 'updateDerivedSettings').mockImplementation();
        // init component
        component.ngOnInit();
        expect(component.chartingLib).toBe('agGrid');
        (component.widget.getCombinedInputs().get(ExpostTimeSeriesSettings.configType) as ExpostTimeSeriesSettings).showAsChart = true;
        (component.widget.getCombinedInputs().get(ExpostTimeSeriesSettings.configType) as ExpostTimeSeriesSettings).expostSettings = new ExpostSettings();
        (component.widget.getCombinedInputs().get(ExpostTimeSeriesSettings.configType) as ExpostTimeSeriesSettings).expostSettings.samplingPeriod = new TimePeriod();

        component.ngOnInit();
        expect(component.chartingLib).toBe('hc');
    });

    it('test export options', () => {
        component.portfolio = new Portfolio();
        component.widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
        component.ngOnInit();
        expect(component.exportOptions).toEqual(ExportConstants.EXPORT_OPTION_PDF_IMG);

        component.widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_BAR_CHART);
        component.ngOnInit();
        expect(component.exportOptions).toEqual(ExportConstants.EXPORT_OPTION_PDF_IMG);

        component.widget = new Widget(WidgetConfigType.BAR);
        component.ngOnInit();
        expect(component.exportOptions).toEqual(ExportConstants.EXPORT_OPTION_PDF_EXCEL_IMG);


        CoreUserMetaDataStore.userMetaData.apiAccess = true;
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        component.ngOnInit();
        expect(component.exportOptions).toEqual([[
            ...(ExportConstants.EXPORT_OPTION_PDF_EXCEL[0]),
            ExportConstants.GENERATE_API_REQUEST_OPTION
        ]]);
    });

    it('should only show API request option when ExploreApiRequest token is enabled', () => {
        component.portfolio = new Portfolio();
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);

        CoreUserMetaDataStore.userMetaData.apiAccess = false;
        component.ngOnInit();
        expect(component.exportOptions[0]).toHaveLength(2);

        CoreUserMetaDataStore.userMetaData.apiAccess = true;
        component.ngOnInit();
        expect(component.exportOptions[0]).toHaveLength(3);
        expect(component.exportOptions[0][2]).toEqual(ExportConstants.GENERATE_API_REQUEST_OPTION);
    });

    it('test changeChartingLib', () => {
        testScheduler.run(({flush}) => {
            const port = new Portfolio();
            port.benchmark = Benchmark.create('RISK', 1, 'TEST');
            port.portName = 'test_ticker';
            port.fullName = 'test_fullname';
            port.title = 'test_name';
            port.currency = 'USD';
            port.datePicker = new DateValue();
            component.widget = new Widget(WidgetConfigType.EXPOST_TIME_SERIES);
            component.portfolio = port;
            component.report = new Report('test-report');

            jest.spyOn(component, 'refreshWidget').mockImplementation();
            jest.spyOn(component, 'updateWidgetDerivedSettings');

            // init component
            component.ngOnInit();

            flush();

            const timeSeriesSettings = component.widget.getCombinedInputs().get(ExpostTimeSeriesSettings.configType) as ExpostTimeSeriesSettings;
            expect(component.chartingLib).toBe('agGrid');
            expect(timeSeriesSettings.showAsChart).toBeFalsy();
            component.changeChartingLib();
            expect(timeSeriesSettings.showAsChart).toBeTruthy();
            expect(component.chartingLib).toBe('hc');
        });
    });

    it('test data subscription', () => {
        testScheduler.run(({flush}) => {
            const port = new Portfolio();
            port.benchmark = Benchmark.create('RISK', 1, 'TEST');
            port.portName = 'test_ticker';
            port.fullName = 'test_fullname';
            port.title = 'test_name';
            port.currency = 'USD';
            port.datePicker = new DateValue();

            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            component.portfolio = port;
            component.report = new Report('test-report');
            component.notificationIDArray = ['foo'];

        const workpad = new FlatWorkpad();
        workpad.portfolio = port;
        workpad.reports.push(component.report);
        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentReport$.next(component.report);
        WorkspaceStore.currentPortfolio$.next(component.portfolio);


            jest.spyOn(component, 'updateWidgetDerivedSettings');

            // init component
            component.ngOnInit();

            openMockFn = jest.fn();
            closeMockFn = jest.fn();
            component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

            component.widget.dataStore.data = {
                widgetConfigType: 'test',
                notification: Notification.createErrorNotification('error found')
            };

            flush();

            expect(component.chartingLib).toBe('agGrid');
            expect(component.showGridTransitionControl).toBeUndefined();
            expect(component.updateWidgetDerivedSettings).toHaveBeenCalled();

            expect(closeMockFn).toHaveBeenCalled();
            expect(openMockFn).toHaveBeenCalled();
        });
    });

    it('test data subscription with compare mode', () => {
        testScheduler.run(({flush}) => {
            const port1 = new Portfolio();
            port1.benchmark = Benchmark.create('RISK', 1, 'TEST');
            port1.portName = 'test_ticker_1';
            port1.fullName = 'test_fullname_1';
            port1.title = 'test_name_1';
            port1.currency = 'USD';
            port1.datePicker = new DateValue();

            const port2 = new Portfolio();
            port2.benchmark = Benchmark.create('RISK', 1, 'TEST');
            port2.portName = 'test_ticker_2';
            port2.fullName = 'test_fullname_2';
            port2.title = 'test_name_2';
            port2.currency = 'USD';
            port2.datePicker = new DateValue();


            component.widget = new Widget(WidgetConfigType.PIE);
            component.portfolio = port1;
            component.report = new Report('test-report');
            component.report.comparisonConfig = new ComparisonConfig();
            component.report.comparisonConfig.portComparisonList = [port1.portId, port2.portId];

            const workpad = new ReportGroup();
            workpad.portfolios.push(port1);
            workpad.portfolios.push(port2);
            WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(port1);
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad);

            jest.spyOn(component, 'updateWidgetDerivedSettings');

            openMockFn = jest.fn();
            closeMockFn = jest.fn();
            component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

            // init component
            component.ngOnInit();

            flush();

            component.widget.dataStore.data = {
                widgetConfigType: WidgetConfigType.PIE,
                responseConfig: {
                    splitColumnKeys: {
                        'col': [{
                            header: 'Port1',
                            originalKey: '',
                            updatedKeySuffix: '',
                            updatedKey: ''
                        }, {header: 'Port2', originalKey: '', updatedKeySuffix: '', updatedKey: ''}]
                    }
                }
            };

            expect(closeMockFn).toHaveBeenCalled();
            expect(component.showCompareTabs).toBeTruthy();
            expect(component.compareTabs.length).toBe(2);
            expect(component.compareTabs[0]).toBe('Port1');
            expect(component.compareTabs[1]).toBe('Port2');
            expect(component.widgetPayload.customVizConfig.header).toBe('Port1');
        });
    });

    it('rendering with pie and split column keys - not compare mode', () => {
        component.report = new Report();
        component.portfolio = new Portfolio();
        component.widget = new Widget(WidgetConfigType.PIE);

        const payload: WidgetPayload = {
            widgetConfigType: WidgetConfigType.PIE,
            responseConfig: {
                splitColumnKeys: {
                    krd_123: [
                        {header: '3M', originalKey: 'krd_123|3M', updatedKeySuffix: '3M', updatedKey: 'krd_123|3M'},
                        {header: '1Y', originalKey: 'krd_123|1Y', updatedKeySuffix: '1Y', updatedKey: 'krd_123|1Y'},
                        {header: '2Y', originalKey: 'krd_123|2Y', updatedKeySuffix: '2Y', updatedKey: 'krd_123|2Y'}
                    ]
                }
            }
        };

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(component.showCompareTabs).toBeTruthy();
        expect(component.compareTabs).toStrictEqual(['3M', '1Y', '2Y']);
    });

    it('rendering with pie and split column keys - not compare mode - test active tab selections', () => {
        component.report = new Report();
        component.portfolio = new Portfolio();
        component.widget = new Widget(WidgetConfigType.PIE);
        component.compareTabs = ['3M', '1Y', '2Y'];
        component.compareTabsData = [
            {
              label: '3M',
              uid: '0',
              eventData: '3M',
            },
            {
              label: '1Y',
              uid: '1',
              eventData: '1Y',
            },
            {
              label: '2Y',
              uid: '2',
              eventData: '2Y',
            },
          ];

        component.activeCompareTab = '1';

        const payload: WidgetPayload = {
            widgetConfigType: WidgetConfigType.PIE,
            responseConfig: {
                splitColumnKeys: {
                    krd_123: [
                        {header: '3M', originalKey: 'krd_123|3M', updatedKeySuffix: '3M', updatedKey: 'krd_123|3M'},
                        {header: '1Y', originalKey: 'krd_123|1Y', updatedKeySuffix: '1Y', updatedKey: 'krd_123|1Y'},
                        {header: '2Y', originalKey: 'krd_123|2Y', updatedKeySuffix: '2Y', updatedKey: 'krd_123|2Y'}
                    ]
                }
            }
        };

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(component.showCompareTabs).toBeTruthy();
        expect(component.compareTabs).toStrictEqual(['3M', '1Y', '2Y']);
        expect(component.activeCompareTab).toEqual('1');
    });

    it('rendering with scatter and breakdown/no breakdown configured - not compare mode', () => {
        component.report = new Report();
        component.portfolio = new Portfolio();
        component.widget = new Widget(WidgetConfigType.SCATTER);

        const payload: WidgetPayload = {
            widgetConfigType: WidgetConfigType.SCATTER,
            breakdownLevels: ['_ROOT_', 'level-1'],
            requestConfig: {
                portfolio: 'PEP',
                columns: [
                    {
                        columnKey: 'market_val_0',
                        columnTitle: 'Market Value',
                        formatter: undefined,
                        dataType: 'DOUBLE',
                        columnTag: 'market_val',
                        isHidden: false,
                        isSubtotalable: true
                    }
                ] as any
            },
            responseConfig: {splitColumnKeys: null}
        };

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(component.showCompareTabs).toBeFalsy();
        expect(component.compareTabs).toBeFalsy();

        // when no breakdown configured
        payload.breakdownLevels = ['_ROOT_'];
        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(component.showCompareTabs).toBeFalsy();
        expect(component.compareTabs).toBeFalsy();
    });

    it('rendering with scatter and breakdown/no breakdown configured - compare mode', () => {
        const comparisonConfig: ComparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['PEP', 'IP'];

        const workpad: FlatWorkpad = new FlatWorkpad();
        workpad.comparisonConfigMap.set(1, comparisonConfig);
        WorkspaceStore.currentWorkpad$.next(workpad);

        component.report = new Report('report 1');
        component.report.comparisonConfigId = 1;
        component.portfolio = new Portfolio('PEP');
        component.widget = new Widget(WidgetConfigType.SCATTER);

        const payload: WidgetPayload = {
            widgetConfigType: WidgetConfigType.SCATTER,
            breakdownLevels: ['_ROOT_', 'level-1'],
            requestConfig: {
                portfolio: 'PEP',
                columns: [
                    {
                        columnKey: 'market_val_0',
                        columnTitle: 'Market Value',
                        formatter: undefined,
                        dataType: 'DOUBLE',
                        columnTag: 'market_val',
                        isHidden: false,
                        isSubtotalable: true
                    }
                ] as any
            },
            responseConfig: {
                splitColumnKeys: {
                    market_val_0: [
                        {
                            header: 'PEP',
                            originalKey: 'market_val_0',
                            updatedKeySuffix: 'PEP',
                            updatedKey: 'market_val_0|PEP'
                        },
                        {
                            header: 'IP',
                            originalKey: 'market_val_0',
                            updatedKeySuffix: 'IP',
                            updatedKey: 'market_val_0|IP'
                        }
                    ]
                }
            }
        };

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(workpad.isCompareMode(component.report.comparisonConfigId)).toBeTruthy();
        expect(component.showCompareTabs).toBeTruthy();
        expect(component.compareTabs).toBeTruthy();

        // when no breakdown configured
        payload.breakdownLevels = ['_ROOT_'];
        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(workpad.isCompareMode(component.report.comparisonConfigId)).toBeTruthy();
        expect(component.showCompareTabs).toBeFalsy();
    });

    it('rendering with treemap and breakdown/no breakdown configured - compare mode', () => {
        const comparisonConfig: ComparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['PEP', 'IP'];

        const workpad: FlatWorkpad = new FlatWorkpad();
        workpad.comparisonConfigMap.set(1, comparisonConfig);
        WorkspaceStore.currentWorkpad$.next(workpad);
        component.report = new Report('report 1');
        component.report.comparisonConfigId = 1;
        component.portfolio = new Portfolio('PEP');
        component.widget = new Widget(WidgetConfigType.TREEMAP);

        const payload: WidgetPayload = {
            widgetConfigType: WidgetConfigType.TREEMAP,
            breakdownLevels: ['_ROOT_', 'level-1'],
            requestConfig: {
                portfolio: 'PEP',
                columns: [
                    {
                        columnKey: 'market_val_0',
                        columnTitle: 'Market Value',
                        formatter: undefined,
                        dataType: 'DOUBLE',
                        columnTag: 'market_val',
                        isHidden: false,
                        isSubtotalable: true
                    }
                ] as any
            },
            responseConfig: {
                splitColumnKeys: {
                    market_val_0: [
                        {
                            header: 'PEP',
                            originalKey: 'market_val_0',
                            updatedKeySuffix: 'PEP',
                            updatedKey: 'market_val_0|PEP'
                        },
                        {
                            header: 'IP',
                            originalKey: 'market_val_0',
                            updatedKeySuffix: 'IP',
                            updatedKey: 'market_val_0|IP'
                        }
                    ]
                }
            }
        };

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(workpad.isCompareMode(component.report.comparisonConfigId)).toBeTruthy();
        expect(component.showCompareTabs).toBeTruthy();
        expect(component.compareTabs).toBeTruthy();

        // when no breakdown configured
        payload.breakdownLevels = ['_ROOT_'];
        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(workpad.isCompareMode(component.report.comparisonConfigId)).toBeTruthy();
        expect(component.showCompareTabs).toBeFalsy();
    });

    it('rendering with scatter and split column keys - not compare mode', () => {
        const workpad: FlatWorkpad = new FlatWorkpad();
        WorkspaceStore.currentWorkpad$.next(workpad);
        component.report = new Report('report 1');
        component.portfolio = new Portfolio();
        component.widget = new Widget(WidgetConfigType.SCATTER);

        const payload: WidgetPayload = {
            widgetConfigType: WidgetConfigType.SCATTER,
            breakdownLevels: ['_ROOT_', 'level-1'],
            responseConfig: {
                splitColumnKeys: {
                    krd_123: [
                        {header: '3M', originalKey: 'krd_123|3M', updatedKeySuffix: '3M', updatedKey: 'krd_123|3M'},
                        {header: '1Y', originalKey: 'krd_123|1Y', updatedKeySuffix: '1Y', updatedKey: 'krd_123|1Y'},
                        {header: '2Y', originalKey: 'krd_123|2Y', updatedKeySuffix: '2Y', updatedKey: 'krd_123|2Y'}
                    ]
                }
            }
        };

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(workpad.isCompareMode(component.report.key)).toBeFalsy();
        expect(component.showCompareTabs).toBeFalsy();
        expect(component.compareTabs).toBeFalsy();
    });

    it('rendering with slope graph having single column', () => {
        component.report = new Report();
        component.portfolio = new Portfolio('PEP');
        component.widget = new Widget(WidgetConfigType.SLOPE_GRAPH);

        const payload: WidgetPayload = {
            widgetConfigType: WidgetConfigType.SLOPE_GRAPH,
            requestConfig: {
                portfolio: 'PEP',
                columns: [
                    {
                        columnKey: 'market_val_0',
                        columnTitle: 'Market Value',
                        formatter: undefined,
                        dataType: 'DOUBLE',
                        columnTag: 'market_val',
                        isHidden: false,
                        isSubtotalable: true
                    }
                ] as any
            },
            responseConfig: {splitColumnKeys: null}
        };

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(component.showCompareTabs).toBeFalsy();
        expect(component.compareTabs).toBeFalsy();
    });

    it('rendering with slope graph having multiple column', () => {
        component.report = new Report();
        component.portfolio = new Portfolio('PEP');
        component.widget = new Widget(WidgetConfigType.SLOPE_GRAPH);

        const payload: WidgetPayload = {
            widgetConfigType: WidgetConfigType.SLOPE_GRAPH,
            requestConfig: {
                portfolio: 'PEP',
                columns: [
                    {
                        columnKey: 'market_val_0',
                        columnTitle: 'Market Value',
                        formatter: undefined,
                        dataType: 'DOUBLE',
                        columnTag: 'market_val',
                        isHidden: false,
                        isSubtotalable: true
                    },
                    {
                        columnKey: 'market_val_1',
                        columnTitle: 'Benchmark Market Value',
                        formatter: undefined,
                        dataType: 'DOUBLE',
                        columnTag: 'market_val',
                        isHidden: false,
                        isSubtotalable: true
                    }
                ] as any
            },
            responseConfig: {splitColumnKeys: null}
        };

        openMockFn = jest.fn();
        closeMockFn = jest.fn();
        component.widgetLevelNotification = {open: openMockFn, close: closeMockFn} as any;

        component.updateWidgetPayloadOrDisplayNotification(payload);

        expect(component.showCompareTabs).toBeTruthy();
        expect(component.compareTabs).toStrictEqual(['Market Value', 'Benchmark Market Value']);
    });

    it('onComparePortTabSelected', () => {
        component.portfolio = new Portfolio();
        component.widget = new Widget(WidgetConfigType.PIE);
        jest.spyOn(component, 'updateWidgetPayloadOrDisplayNotification').mockImplementation();
        jest.spyOn(component, 'updateWidgetDerivedSettings').mockImplementation();

        component.widgetPayload = {};
        component.onComparePortTabSelected({detail: {eventData: 'PEP'}});
        expect(component.widgetPayload.customVizConfig.header).toBe('PEP');
        expect(component.updateWidgetPayloadOrDisplayNotification).toHaveBeenCalled();
    });

    it('updateWidgetDerivedSettings', () => {
        component.portfolio = new Portfolio();
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        jest.spyOn(WidgetUtils, 'updateWidgetWithPortfolioSettings').mockImplementationOnce((_a, _b) => {});
        component.updateWidgetDerivedSettings();
        expect(WidgetUtils.updateWidgetWithPortfolioSettings).toHaveBeenCalledWith(component.widget, component.portfolio);
        expect(component.widgetTitle).toBe(component.widget.displayTitle);
    });

    it('refreshWidget', () => {
        testScheduler.run(({flush}) => {
            const port = new Portfolio();
            port.benchmark = Benchmark.create('RISK', 1, 'TEST');
            port.portName = 'test_ticker';
            port.fullName = 'test_fullname';
            port.title = 'test_name';
            port.currency = 'USD';
            port.datePicker = new DateValue();

            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            component.portfolio = port;
            component.report = new Report('test-report');

            const reportGroup = new ReportGroup();
            // taking single portfolio
            reportGroup.portfolios = [port];
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<ReportGroup>(reportGroup);

            // init component
            component.ngOnInit();
            const componentSpy = jest.spyOn(component, 'refreshWidget');

            flush();

            component.widget.dataStore.metaData = getMetaDataWithParentMetaData();
            expect(componentSpy).toBeCalled();
        });
    });

    describe('Child spritelet widget (dependent on parent data store) tests ', () => {

        let parentColumnSet: ColumnSet;
        let parentMetaData: WidgetDataStoreMetaData;
        let parentDataStore: WidgetDataStore;

        let parentColumns: VizualizationColumnConfig[];
        let parentRequestConfig: RequestAdapterConfig;
        let parentPayload: WidgetPayload;

        beforeEach(() => {
            jest.spyOn(component, 'updateWidgetPayloadOrDisplayNotification').mockImplementation(() => {
            });
            parentColumnSet = new ColumnSet();
            parentColumnSet.createColumnAndAdd('rfv_ftitle', 'rfv_ftitle_143887758efa4ef', undefined, 'Title');
            parentColumnSet.createColumnAndAdd('rfv_exp_port', 'rfv_exp_port_35', 'PORT', 'Benchmark Factor Exposure');
            parentColumnSet.createColumnAndAdd('rfv_exp_bench', 'rfv_exp_bench_756', 'BENCH', 'Benchmark Factor Exposure');

            parentMetaData = new WidgetDataStoreMetaData();
            parentMetaData.inputs.set(WidgetInputType.COLUMNS, parentColumnSet);

            parentDataStore = new WidgetDataStore();
            parentDataStore.metaData = parentMetaData;

            parentColumns = [
                {
                    columnTag: 'rfv_ftitle',
                    columnKey: 'rfv_ftitle_143887758efa4ef',
                    columnTitle: 'Title',
                    dataType: 'STRING',
                    isHidden: false,
                    isSubtotalable: false,
                    formatter: undefined
                },
                {
                    columnTag: 'rfv_exp_port',
                    columnKey: 'rfv_exp_port_35',
                    columnTitle: 'Factor Exposure',
                    dataType: 'DOUBLE',
                    isHidden: false,
                    isSubtotalable: true,
                    formatter: undefined
                },
                {
                    columnTag: 'rfv_exp_bench',
                    columnKey: 'rfv_exp_bench_756',
                    columnTitle: 'Benchmark Factor Exposure',
                    dataType: 'DOUBLE',
                    isHidden: false,
                    isSubtotalable: true,
                    formatter: undefined
                }
            ] as any;
            parentRequestConfig = {
                columns: parentColumns,
                portfolio: 'PEP'
            };
            parentPayload = {
                requestConfig: parentRequestConfig,
                customVizConfig: {}
            };

            component.widgetPayload = parentPayload;
            component.portfolio = new Portfolio('PEP');
            component.widgetPayload.responseConfig = {};
        });

        it('refreshWidget test', () => {
            const port = new Portfolio();
            port.datePicker = new DateValue();
            component.portfolio = port;
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            component.report = new Report('test-report');

            const reportGroup = new ReportGroup();
            // taking single portfolio
            reportGroup.portfolios = [port];
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<ReportGroup>(reportGroup);
            component.refreshWidget(false, true);

            // this.widget, this.portfolio, this.report, allPortfolios, omitData, this.isBatchExport, hardRefresh, bypassBrowserCache
            expect(riskAndExposureServiceMock.extractDataAndStore).toHaveBeenCalledWith({widget: component.widget, portfolio: component.portfolio, report: component.report, allPortfolios: [component.portfolio], omitData: null, isBatchExport: false, hardRefresh: false, bypassBrowserCache: true, debugContext: undefined});

        });

        it('refreshWidget with debugContext test', () => {
            const port = new Portfolio();
            port.datePicker = new DateValue();
            component.portfolio = port;
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            component.report = new Report('test-report');

            const reportGroup = new ReportGroup();
            // taking single portfolio
            reportGroup.portfolios = [port];
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<ReportGroup>(reportGroup);
            component.refreshWidget(false, true, true);

            // this.widget, this.portfolio, this.report, allPortfolios, omitData, this.isBatchExport, hardRefresh, bypassBrowserCache
            expect(riskAndExposureServiceMock.extractDataAndStore).toHaveBeenCalledWith({widget: component.widget, portfolio: component.portfolio, report: component.report, allPortfolios: expect.arrayContaining([component.portfolio]), omitData: null, isBatchExport: false, hardRefresh: false, bypassBrowserCache: true, debugContext: true});

        });

        it('should override the columns', () => {
            const childColumnSet = new ColumnSet();
            childColumnSet.columns.push(ColumnConfig.createColumn('rfv_exp_bench', 'BENCH', 'rfv_exp_bench_11111', 'Benchmark Factor Exposure'));

            const childMetaData = new WidgetDataStoreMetaData();
            childMetaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

            const childWidget = new Widget(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
            childWidget.dataStore.isDependentOnParentForData = true;
            childWidget.dataStore.parentDataStore = parentDataStore;
            childWidget.dataStore.metaData = childMetaData;

            component.widget = childWidget;

            component.refreshWidget();

            expect(component.widgetPayload.requestConfig.portfolio).toBe('PEP');
            expect(component.widgetPayload.requestConfig.columns).toBe(parentColumns);
            expect(component.widgetPayload.customVizConfig.columns).toBeTruthy();
            expect(component.widgetPayload.customVizConfig.columns.length).toBe(1);
            expect(component.widgetPayload.customVizConfig.columns[0].columnKey).toBe('rfv_exp_bench_756');
        });

        it('should override the columns when splitKeys are present', () => {
            const childColumnSet = new ColumnSet();
            childColumnSet.columns.push(ColumnConfig.createColumn('rfv_stress_pnl_por', 'PORT', 'rfv_stress_pnl_por_123', 'Stress PnL'));

            const childMetaData = new WidgetDataStoreMetaData();
            childMetaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

            const childWidget = new Widget(WidgetConfigType.FACTOR_GRAPHING_BAR_CHART);
            childWidget.dataStore.isDependentOnParentForData = true;
            childWidget.dataStore.parentDataStore = parentDataStore;
            childWidget.dataStore.metaData = childMetaData;

            component.widget = childWidget;

            component.widgetPayload.responseConfig = {
                columns: ['rfv_stress_pnl_por_123|Stock Market Drop Global', 'rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution'],
                splitColumnKeys: {
                    rfv_stress_pnl_por_123: [{
                        header: 'Stock Market Drop Global',
                        originalKey: 'rfv_stress_pnl_por_123|Stock Market Drop Global',
                        updatedKey: 'rfv_stress_pnl_por_123|Stock Market Drop Global',
                        updatedKeySuffix: 'Stock Market Drop Global'
                    },
                        {
                            header: 'Greece Debt Crisis - Near-Term Resolution',
                            originalKey: 'rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution',
                            updatedKey: 'rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution',
                            updatedKeySuffix: 'Greece Debt Crisis - Near-Term Resolution'
                        }]
                }
            };

            component.refreshWidget();

            expect(component.widgetPayload.requestConfig.portfolio).toBe('PEP');
            expect(component.widgetPayload.requestConfig.columns).toBe(parentColumns);
            expect(component.widgetPayload.customVizConfig.columns).toBeTruthy();
            expect(component.widgetPayload.customVizConfig.columns.length).toBe(2);
            expect(component.widgetPayload.customVizConfig.columns[0].columnKey).toBe('rfv_stress_pnl_por_123|Stock Market Drop Global');
            expect(component.widgetPayload.customVizConfig.columns[1].columnKey).toBe('rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution');
        });

        it('should set additonal bar chart settings', () => {
            const childMetaData = new WidgetDataStoreMetaData();

            const childColumnSet = new ColumnSet();
            childColumnSet.columns.push(ColumnConfig.createColumn('rfv_stress_pnl_por', 'PORT', 'rfv_stress_pnl_por_123', 'Stress PnL'));
            childMetaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

            const barChartAdditionalSettings = new BarChartAdditionalSettings();
            barChartAdditionalSettings.isStacked = true;
            barChartAdditionalSettings.stackByImmediateChild = true;
            barChartAdditionalSettings.showSelected = true;
            barChartAdditionalSettings.selectedChartType = ChartType.LINE;
            childMetaData.inputs.set(BarChartAdditionalSettings.configType, barChartAdditionalSettings);

            const childWidget = new Widget(WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART);
            childWidget.dataStore.isDependentOnParentForData = true;
            childWidget.dataStore.parentDataStore = parentDataStore;
            childWidget.dataStore.metaData = childMetaData;

            component.widget = childWidget;

            component.refreshWidget();

            expect(component.widgetPayload.requestConfig.portfolio).toBe('PEP');
            expect(component.widgetPayload.customVizConfig.isStacked).toBeTruthy();
            expect(component.widgetPayload.customVizConfig.stackByImmediateChild).toBeTruthy();
            expect(component.widgetPayload.customVizConfig.showSelected).toBeFalsy();
            expect(component.widgetPayload.customVizConfig.selectedChartType).toBe(ChartType.LINE);
        });

        it('should override the columns when splitKeys are present - praPie Chart', () => {
            const childColumnSet = new ColumnSet();
            childColumnSet.columns.push(ColumnConfig.createColumn('rfv_stress_pnl_por', 'PORT', 'rfv_stress_pnl_por_123', 'Stress PnL'));

            const childMetaData = new WidgetDataStoreMetaData();
            childMetaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

            const childWidget = new Widget(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
            childWidget.dataStore.isDependentOnParentForData = true;
            childWidget.dataStore.parentDataStore = parentDataStore;
            childWidget.dataStore.metaData = childMetaData;

            component.widget = childWidget;

            component.widgetPayload.responseConfig = {
                columns: ['rfv_stress_pnl_por_123|Stock Market Drop Global', 'rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution'],
                splitColumnKeys: {
                    rfv_stress_pnl_por_123: [{
                        header: 'Stock Market Drop Global',
                        originalKey: 'rfv_stress_pnl_por_123|Stock Market Drop Global',
                        updatedKey: 'rfv_stress_pnl_por_123|Stock Market Drop Global',
                        updatedKeySuffix: 'Stock Market Drop Global'
                    },
                        {
                            header: 'Greece Debt Crisis - Near-Term Resolution',
                            originalKey: 'rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution',
                            updatedKey: 'rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution',
                            updatedKeySuffix: 'Greece Debt Crisis - Near-Term Resolution'
                        }]
                }
            };

            // selectedColumnKey is not specified
            component.refreshWidget();
            expect(component.widgetPayload.requestConfig.portfolio).toBe('PEP');
            expect(component.widgetPayload.requestConfig.columns).toBe(parentColumns);
            expect(component.widgetPayload.customVizConfig.columns).toBeTruthy();
            expect(component.widgetPayload.customVizConfig.columns.length).toBe(1);
            expect(component.widgetPayload.customVizConfig.columns[0].columnKey).toBe('rfv_stress_pnl_por_123|Stock Market Drop Global');

            // When selectedColumnKey is specified in customVizConfig
            childWidget.dataStore.data = {customVizConfig: {selectedColumnKey: 'rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution'}};
            component.refreshWidget();

            expect(component.widgetPayload.customVizConfig.columns).toBeTruthy();
            expect(component.widgetPayload.customVizConfig.columns.length).toBe(1);
            expect(component.widgetPayload.customVizConfig.columns[0].columnKey).toBe('rfv_stress_pnl_por_123|Greece Debt Crisis - Near-Term Resolution');
        });


        it('should generate new composite keys from the parent breakdown path', () => {
            const childWidget = new Widget(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
            childWidget.dataStore.isDependentOnParentForData = true;
            childWidget.dataStore.parentDataStore = parentDataStore;
            childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, new ColumnSet());
            const factorPathInput = childWidget.dataStore.metaData.inputs.get(FactorPathInput.configType) as FactorPathInput;
            factorPathInput.path.push({
                level: '_ROOT_',
                value: 'PEP'
            });
            factorPathInput.path.push({
                level: 'level-1',
                value: 'COUNTRY'
            });

            component.widget = childWidget;

            component.refreshWidget();
            expect(component.widgetPayload.customVizConfig.queryKeys).toBeTruthy();
            expect(component.widgetPayload.customVizConfig.queryKeys.length).toBe(2);
            expect(component.widgetPayload.customVizConfig.queryKeys[0].type).toBe(QueryKeyEntryType.FILTER_INCLUDE);
            expect(component.widgetPayload.customVizConfig.queryKeys[0].field).toBe('_ROOT_');
            expect(component.widgetPayload.customVizConfig.queryKeys[0].includes[0]).toBe('PEP');
            expect(component.widgetPayload.customVizConfig.queryKeys[1].type).toBe(QueryKeyEntryType.FILTER_INCLUDE);
            expect(component.widgetPayload.customVizConfig.queryKeys[1].field).toBe('level-1');

            // scenario where portfolio may have been switched
            // we change the value in request config and check if the composition key
            // at root level got the new ticker
            component.widgetPayload.requestConfig.portfolio = 'BELSH';
            component.refreshWidget();
            expect(component.widgetPayload.customVizConfig.queryKeys[0].includes[0]).toBe('BELSH');
        });

        it('should add the leaf level', () => {
            const childWidget = new Widget(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
            childWidget.dataStore.isDependentOnParentForData = true;
            childWidget.dataStore.includeLeafLevel = true;
            childWidget.dataStore.parentDataStore = parentDataStore;
            childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, new ColumnSet());
            component.widget = childWidget;

            component.refreshWidget();
            expect(component.widgetPayload.customVizConfig.leafLevels).toBeTruthy();
            expect(component.widgetPayload.customVizConfig.leafLevels.length).toBe(1);
            expect(component.widgetPayload.customVizConfig.leafLevels[0]).toBe('rfv_ftitle_143887758efa4ef');
        });

        it('check title is updated when spritelet is opened', () => {
            const childWidget = new Widget(WidgetConfigType.RETURNS_DRILLDOWN_PERF_DETAIL);
            childWidget.dataStore.isDependentOnParentForData = true;
            childWidget.dataStore.parentDataStore = parentDataStore;

            component.widget = childWidget;
            component.widget.title = 'TEST';
            component.ngOnInit();
            expect(component.widgetTitle).toBe(component.widget.title);
        });
    });

    it('onChanges test', () => {
        // Init the widget with a portfolio and widget.
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        component.portfolio = new Portfolio('ILB', new DateValue({date: '11/03/2016'}));
        component.ngOnInit();

        // create a so we can see what is happening.
        jest.spyOn(component, 'updateWidgetDerivedSettings').mockImplementation();
        jest.spyOn(component, 'refreshWidget').mockImplementation();

        // Change the portfolio
        component.portfolio = new Portfolio('PEP', new DateValue({date: '11/03/2016'}));
        const portChange = {
            portfolio: new SimpleChange(null, component.portfolio, true)
        };
        component.ngOnChanges(portChange);
        expect(component.updateWidgetDerivedSettings).toHaveBeenCalledTimes(1);

        // Now change a different input and ensure that
        const widgetChange = {
            widget: new SimpleChange(null, null, true)
        };
        component.ngOnChanges(widgetChange);
        expect(component.updateWidgetDerivedSettings).toHaveBeenCalledTimes(1);
    });

    it('copyWidget', () => {
        document.execCommand = jest.fn();
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        component.portfolio = new Portfolio('ILB', new DateValue({date: '11/03/2016'}));
        const report: Report = new Report({'title': 'TEST REPORT'});
        jest.spyOn(WorkspaceStore, 'getCurrentReport').mockReturnValue(report);
        component.ngOnInit();
        component.widget.dataStore.metaData = getMetaDataWithParentMetaData();
        component.report = report;
        const element = document.createElement('textarea');
        element.setAttribute('style', 'border: none; opacity: 0');
        const spy1 = jest.spyOn(document.body, 'appendChild');
        const spy2 = jest.spyOn(document.body, 'removeChild');
        component.copyWidget();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('widgetSpriteletLaunched test', () => {
        // Init the widget with a portfolio and widget.
        component.widget = new Widget(WidgetConfigType.RETURNS);
        component.portfolio = new Portfolio('ILB', new DateValue({date: '11/03/2016'}));
        jest.spyOn(component, 'updateWidgetDerivedSettings').mockImplementation();
        component.ngOnInit();

        // create a so we can see what is happening.
        jest.spyOn(returnTimeSeriesSpriteletLauncher, 'launchSpritelet');
        component.widgetSpriteletLaunched(new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES, null));
        // Change the portfolio
        expect(returnTimeSeriesSpriteletLauncher.launchSpritelet).toHaveBeenCalled();

        jest.spyOn(columnDefinitionSpriteletLauncher, 'launchSpritelet');
        const event = new SpriteletEvent(CommonConstants.COLUMN_DEFINITION_SPRITELET.ACTION_KEY, null, CommonConstants.COLUMN_DEFINITION_SPRITELET.CALLBACK_METHOD_NAME);
        component.widgetSpriteletLaunched(event);
        // Change the portfolio
        expect(columnDefinitionSpriteletLauncher.launchSpritelet).toHaveBeenCalledWith(component.widget, event, component.setShowColumnDefinitionForColumn);
    });

    it('check widget title gets updated on meta data update', async () => {
        // Init the widget with a portfolio and widget.
        component.widget = new Widget(WidgetConfigType.RETURNS);
        const performanceSettings = new PerformanceSettings();
        performanceSettings.timePeriod = new TimePeriod('Month To Date', 1, 'WTD');
        performanceSettings.attributionSettings = new AttributionSettings();
        performanceSettings.attributionSettings.cannedMethod = 'FIXED_INCOME';
        component.widget.dataStore.metaData.inputs.set('performanceSettings', performanceSettings);
        component.portfolio = new Portfolio('ILB', new DateValue({date: '11/03/2016'}));
        jest.spyOn(component, 'updateWidgetDerivedSettings');
        // updating portfolio in workpad
        const reportGroup = new ReportGroup();
        reportGroup.portfolios = [component.portfolio];
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<ReportGroup>(reportGroup);

        component.ngOnInit();
        expect(component.widgetTitle).toBe('Return Analysis - Month To Date');

        const newPerformanceSettings = new PerformanceSettings();
        newPerformanceSettings.timePeriod = new TimePeriod('Week To Date', 1, 'WTD');
        const metaData = cloneDeep(component.widget.dataStore.metaData);
        metaData.inputs.set('performanceSettings', newPerformanceSettings);
        await (component.widget.dataStore.metaData = metaData);
        expect(component.widgetTitle).toBe('Return Analysis - Week To Date');
    });

    it('check onDestroy clears out the data store data', async () => {
        // Init the widget with a portfolio and widget.
        component.widget = new Widget(WidgetConfigType.RETURNS);
        await (component.widget.dataStore.data = {widgetConfigType: WidgetConfigType.RETURNS});
        component.portfolio = new Portfolio('ILB', new DateValue({date: '11/03/2016'}));
        component.ngOnDestroy();
        expect(component.widget.dataStore.data).toBe(null);
    });

    it('check onDestroy does not clear out the data store data for PGS chart widget', async () => {
        // Init the widget with a portfolio and widget.
        component.widget = new Widget(WidgetConfigType.PGS_BAR);
        await (component.widget.dataStore.data = {widgetConfigType: WidgetConfigType.RETURNS});
        component.portfolio = new Portfolio('ILB', new DateValue({date: '11/03/2016'}));
        component.ngOnDestroy();
        expect(component.widget.dataStore.data).toBeTruthy();
    });

    it('check onDestroy clears out the data store data', async () => {
        jest.spyOn(component, 'widgetSpriteletLaunched');
        component.launchTabularView();
        expect(component.widgetSpriteletLaunched).toHaveBeenCalledWith(expect.objectContaining({
            actionName: WidgetConstants.TABULAR_VIEW_SPRITELET.ACTION_KEY,
            params: null
        }));
    });

    it('check price popup chart open/close', () => {
        jest.spyOn(component, 'setShowPriceChart');
        jest.spyOn(priceChartSpriteletLauncher, 'launchSpritelet');
        const event = new SpriteletEvent(TabularWidgetConstants.PRICE_CHART_SPRITELET.ACTION_KEY, null, TabularWidgetConstants.PRICE_CHART_SPRITELET.CALLBACK_METHOD_NAME);
        component.widgetSpriteletLaunched(event);
        expect(priceChartSpriteletLauncher.launchSpritelet).toHaveBeenCalledWith(component.widget, event, component.setShowPriceChart);
    });

    it('set priceChartInputs', () => {
        const priceChartInputs = new PriceChartInputs('cusip', 'Label');
        expect(component.priceChartInputs).toBeUndefined();
        component.setShowPriceChart(priceChartInputs);
        expect(component.priceChartInputs).not.toBeUndefined();
        expect(component.priceChartInputs.cusip).toBe('cusip');
        expect(component.priceChartInputs.label).toBe('Label');
    });

    it('toggleTableSearch', () => {
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        expect(component.isTableSearchActive$.value).toEqual(false);
        component.toggleTableSearch();
        expect(component.isTableSearchActive$.value).toEqual(true);
    });

    it('should open and close the API request modal', () => {
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        expect(component.isWidgetApiRequestModalOpen).toEqual(false);

        component.onExportItemClicked(WorkspaceMenuItemsConstants.LABELS.GENERATE_API_REQUEST);
        expect(component.isWidgetApiRequestModalOpen).toEqual(true);

        component.closeWidgetApiRequestModal();
        expect(component.isWidgetApiRequestModalOpen).toEqual(false);
    });

    it('should throw warning for time series comparison onExportItemClicked', () => {
        jest.spyOn(component['notificationService'], 'warning');
        component.report = new Report();
        component.widget = new Widget(WidgetConfigType.TIME_SERIES);
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject(new ReportGroup());

        const currentWorkpad = WorkspaceStore.getCurrentWorkpad();
        currentWorkpad.isCompareMode = jest.fn(() => true);

        component.onExportItemClicked(WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_IMAGE);
        expect(component['notificationService'].warning).toHaveBeenCalledWith('Image exporting is not currently supported in time series comparison mode.', 'UI_VALIDATION_ERROR', 'UI_ERROR');

        component.onExportItemClicked(WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL);
        expect(component['notificationService'].warning).toHaveBeenCalledWith('Excel exporting is not currently supported in time series comparison mode.', 'UI_VALIDATION_ERROR', 'UI_ERROR');
    });

    describe('test updateSettingsForFactorDataWidget', () => {
        beforeEach(() => {
            const inputs = new Map();
            const factorDataChartSettings = new FactorDataChartSettings();
            factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.FACTOR_LEVELS;
            const showAsChartInput = new ShowAsChartInput();
            inputs.set(FactorDataChartSettings.configType, factorDataChartSettings);
            inputs.set(ShowAsChartInput.configType, showAsChartInput);
            component.widget = new Widget(WidgetConfigType.FACTOR_DATA);
            component.widget.dataStore = new WidgetDataStore();
            component.widget.dataStore.metaData.inputs = inputs;
            component.widgetInitialized = true;
            component.showAsChartControl = false;
        });

        it('test when widgetInitialized = false', () => {
            component.widgetInitialized = false;
            component.suppressRootNode = false;
            (component.widget.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings).isDefaultWidgetSettingsModalOpen = true;

            component['updateSettingsForFactorDataWidget']();

            expect(component.suppressRootNode).toBeTruthy();
            expect(component.isWidgetSettingsModalOpen).toBeTruthy();
            expect((component.widget.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings).isDefaultWidgetSettingsModalOpen).not.toBeTruthy();
        });

        it('test for risk matrix mode', () => {
            (component.widget.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings).isTimeSeriesMode = false;
            (component.widget.dataStore.metaData.inputs.get(ShowAsChartInput.configType) as ShowAsChartInput).showAsChart = true;

            component['updateSettingsForFactorDataWidget']();

            expect(component.showAsChartControl).not.toBeTruthy();
            expect((component.widget.dataStore.metaData.inputs.get(ShowAsChartInput.configType) as ShowAsChartInput).showAsChart).not.toBeTruthy();

        });

        it('test for when switched from risk matrix to time series mode', () => {
            (component.widget.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings).isTimeSeriesMode = true;
            (component.widget.dataStore.metaData.inputs.get(ShowAsChartInput.configType) as ShowAsChartInput).showAsChart = false;

            component['updateSettingsForFactorDataWidget']();

            expect(component.showAsChartControl).toBeTruthy();
            expect((component.widget.dataStore.metaData.inputs.get(ShowAsChartInput.configType) as ShowAsChartInput).showAsChart).toBeTruthy();

        });

    });

    describe('isHardRefreshRequired', () => {
        it('should return true if isBatchExport and runHardRefresh are true', () => {
            component.isBatchExport = true;
            component.runHardRefresh = true;
            expect(component.isHardRefreshRequired()).toBe(true);
        });

        it('should return false if WidgetInputType.COLUMNS is not set', () => {
            expect(component.isHardRefreshRequired()).toBe(false);
        });

        it('should return false if scenarioColumnOptions length is zero', () => {
            const columnSet = new ColumnSet();
            columnSet.columns = [];
            component.widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
            expect(component.isHardRefreshRequired()).toBe(false);
        });

        it('should return true if scenarioColumnOption.refreshRequired is true', () => {
            const columnSet = new ColumnSet();
            const scenarioColumnOption = new ScenarioColumnOption();
            scenarioColumnOption.refreshRequired = true;
            // @ts-ignore
            columnSet.columns = [{ optionValues: [scenarioColumnOption] }];
            component.widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
            expect(component.isHardRefreshRequired()).toBe(true);
        });

        it('should return false if scenarioColumnOption.refreshRequired is false', () => {
            const columnSet = new ColumnSet();
            const scenarioColumnOption = new ScenarioColumnOption();
            scenarioColumnOption.refreshRequired = false;
            // @ts-ignore
            columnSet.columns = [{ optionValues: [scenarioColumnOption] }];
            component.widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
            expect(component.isHardRefreshRequired()).toBe(false);
        });
    });

    it('setWidgetHeaderFilterIcon test case', () => {
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        let widgetInputs: Map<string, WidgetInput> = component.widget.dataStore.metaData.inputs;
        expect(component.showFilterIcon).toBeFalsy();

        widgetInputs.set(WidgetInputType.TOP_BOTTOM_FILTER, new TopBottomFilterInput({columnTag: 'pc_mvt', top: 1}));
        component.setWidgetHeaderFilterIcon();
        expect(component.showFilterIcon).toBeTruthy();

        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widgetInputs = component.widget.dataStore.metaData.inputs;
        widgetInputs.set(WidgetInputType.MIN_VAL_FILTER, new MinValFilter({columnTag: 'pc_mvt', value: 1}));
        component.setWidgetHeaderFilterIcon();
        expect(component.showFilterIcon).toBeTruthy();

        component.widget = new Widget(WidgetConfigType.PRA);
        component.setWidgetHeaderFilterIcon();
        expect(component.showFilterIcon).toBeFalsy();

        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widgetInputs = component.widget.dataStore.metaData.inputs;
        jest.spyOn(widgetInputs.get(WidgetInputType.FILTER) as CustomFilter, 'isFilterEmpty').mockReturnValue(false);
        component.setWidgetHeaderFilterIcon();
        expect(component.showFilterIcon).toBeTruthy();
    });

    it('onExportItemClicked test case', () => {
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        component.exportForWidget = 'Export Widget';
        component.chartingLib = 'aggrid';
        const exportComposite = new ExportComposite();
        const fnSpy = jest.spyOn(component['appStore'].openExportOptionsModal$, 'next');
        const exportFnSpy = jest.spyOn(ExportUtils, 'getExportComposite').mockReturnValue(exportComposite);
        component.onExportItemClicked(WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF);
        expect(exportFnSpy).toHaveBeenCalledWith(WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF, component.exportForWidget, component.widget, component.chartingLib);
        expect(fnSpy).toHaveBeenCalledWith(exportComposite);
    });

    it('should schedule job export correctly', () => {
        const mockWidget = new Widget();
        mockWidget.displayTitle = 'Test Widget';
        mockWidget.title = 'Widget Title';
        component.widget = mockWidget;

        jest.spyOn(ExportHubUtils, 'encodeWidgetSettingsForScheduledJob').mockReturnValue('settings');
        const mockWidgetConfig = new WidgetConfig();
        mockWidgetConfig.title = 'Widget Title';
        jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockReturnValue(mockWidgetConfig);
        component.onExportItemClicked(WorkspaceMenuItemsConstants.LABELS.SCHEDULE_JOB);

        const scheduledJob = exportHubStoreStub.openScheduleJobModal.mock.calls[0][0] as ExportHubJob;
        expect(scheduledJob.getJobWidgetsList().length).toBe(1);
        const jobWidget = scheduledJob.getJobWidgetsList()[0] as ExportHubJobWidget;
        expect(jobWidget.getTitle()).toBe('Test Widget');
        expect(jobWidget.getWidgetType()).toBe('Widget Title');
        expect(jobWidget.getWidgetSetting()).toBe('settings');

        jest.spyOn(ExportUtils, 'checkGenerateApiRequestSupported').mockReturnValue([false, 'Error Message']);
        jest.spyOn(component['notificationService'], 'error');
        component.onExportItemClicked(WorkspaceMenuItemsConstants.LABELS.SCHEDULE_JOB);
        expect(component['notificationService'].error).toHaveBeenCalled();
    });
});
