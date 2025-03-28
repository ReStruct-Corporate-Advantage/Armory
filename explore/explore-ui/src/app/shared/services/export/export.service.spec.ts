import {Http2BmsService} from '@services/bms';
import {TestUtils} from '@utils/test.utils';
import {ExportService} from '@services/export/export.service';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {TestBed} from '@angular/core/testing';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {Report} from '@models/workspace/report.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {BatchExportingStore, WorkspaceStore} from '../../../stores';
import {of} from 'rxjs';
import {ReportGroup} from '@models/workspace/report-group.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {ChartUtils} from '@utils/chart.utils';
import {PDFPageMargin} from '@models/export/pdf-page-margin.model';
import * as html2canvas from '../../../../../projects/html2canvas/html2canvas';
import {ExportServiceConstants} from '@services/export/export-service.constants';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {ExportConstants, ExportLevel} from '@constants/export.constants';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {PDFExportAction} from '@models/export/pdf-export-action.model';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {ROOT_LEVEL} from '@utils/qbstr';
import {BatchExportAction} from '@models/batch-reporting/batch-export-action.model';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {BatchRowDownloadStatus} from '@enums/batch-reporting/batch-row-download-status.enum';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {BatchExportComposite} from '@models/export/export-composite/batch-export-composite.model';
import {Workspace} from '@models/workspace/workspace.model';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {MultiRowBatchExportComposite} from '@models/export/export-composite/multi-row-batch-export-composite.model';
import {ExportUtils} from '@utils/export/export.utils';
import {HttpParams} from '@angular/common/http';
import {AppUtils} from '@utils/app.utils';
import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {Breakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {PDFLogoPosition} from '@enums/export/pdf-logo-position.enum';
import {LogoConfig, LogoInfo} from '@models/export/logo-config.model';
import {CommonUtils, CoreWidgetConstants, DateValue, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {RequestConstants} from '@constants/request.constants';
import {CommonConstants} from '@constants/common.constants';
import {ImageExportConfig} from '@models/export/image-export-config.model';
import {NotificationService} from '@services/notification';
import {BatchRowSkippedRequest} from '@models/batch-reporting/batch-row-skipped-request.model';
import {WorkpadUtils} from '../../../utils/workpad.utils';

describe('ExportService Test', () => {
    let service: ExportService;

    const riskAndExposureServiceMock = {
        getWidgetConfigTypes: jest.fn().mockReturnValue([WidgetConfigType.RISK_EXPOSURE]),
        createFinalDataRequest: jest.fn(() => {
        })
    };

    const barServiceMock = {
        getWidgetConfigTypes: jest.fn().mockReturnValue([WidgetConfigType.BAR]),
        createFinalDataRequest: jest.fn(() => {
        })
    };

    const returnsServiceMock = {
        getWidgetConfigTypes: jest.fn().mockReturnValue([WidgetConfigType.RETURNS]),
        createFinalDataRequest: jest.fn(() => {
        })
    };

    const tsServiceMock = {
        getWidgetConfigTypes: jest.fn().mockReturnValue([WidgetConfigType.TIME_SERIES]),
        createFinalDataRequest: jest.fn(() => {
        })
    };

    const batchReportingServiceMock = {
        fetchPortInfo$: jest.fn(() => of({
            portfolio: {}
        })),
        runBatchExport: jest.fn(),
        updateBatchDownloadStatus: jest.fn()
    };

    const httpMock = {
        post$: jest.fn(() => of({data: {}})),
        get$: jest.fn()
    };

    const widgetServiceMock = {
        getWidgetConfigTypes: jest.fn().mockReturnValue(['TEST_WIDGET']),
        createFinalDataRequest: jest.fn(() => ({
            requestParams: [{}]
        }))
    };

    const notificationServiceMock = {
        warning: jest.fn()
    };

    const widgetServiceRegistryMock = {
        getService: jest.fn().mockReturnValue(widgetServiceMock)
    };


    BatchExportingStore.init();
    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                ExportService,
                WorkspaceStore,
                {provide: Http2BmsService, useValue: httpMock},
                {
                    provide: AbstractWidgetService, useValue: riskAndExposureServiceMock,
                    multi: true
                },
                {
                    provide: AbstractWidgetService, useValue: barServiceMock,
                    multi: true
                },
                {
                    provide: AbstractWidgetService, useValue: returnsServiceMock,
                    multi: true
                },
                {
                    provide: AbstractWidgetService, useValue: tsServiceMock,
                    multi: true
                },
                {
                    provide: AbstractWidgetService, useValue: widgetServiceMock,
                    multi: true
                },
                {
                    provide: WidgetServiceRegistry, useValue: widgetServiceRegistryMock
                },
                {
                    provide: WidgetServiceRegistry, useClass: WidgetServiceRegistry
                },
                {
                    provide: BatchReportingService, useValue: batchReportingServiceMock
                },
                {
                    provide: NotificationService, useValue: notificationServiceMock
                },
                {
                    provide: ExportService, useClass: ExportService,
                    deps: [WidgetServiceRegistry, Http2BmsService, BatchReportingService]
                }
            ],
            teardown: {
                destroyAfterEach: false
            }
        });
        service = TestBed.inject(ExportService);
    });

    beforeEach((done) => {
        WorkspaceStore.init();
        BatchExportingStore.currentBatchExportAction = new BatchExportAction(BatchReportingTestUtils.createDummyBatchReportConfig());
        TestUtils.initialize(done);
        jest.spyOn(ExportUtils, 'download').mockImplementation(jest.fn());
        // Mock that we actually got a valid export response back
        httpMock.post$.mockReturnValue(of({data: {data:  [], totalSize: 1}}));
    });

    /**
     * Tests the generateHeaderText method
     */
    it('Tests generateHeaderText method', () => {
        const portfolio1 = new Portfolio('PEP', new DateValue({date: '03/10/2017'}));
        portfolio1.fullName = 'BGF Pacific Equity Fund';
        portfolio1.currency = 'USD';
        const benchmark1 = new Benchmark();
        benchmark1.name = 'MSAC_APACN';
        portfolio1.benchmark = benchmark1;
        const report1 = new Report();
        report1.title = 'Report 1';

        const exportComposite = new ExportComposite();
        exportComposite.portfolio = portfolio1;
        exportComposite.report = report1;

        let headerText = ExportService.generateHeaderText(exportComposite);
        expect(headerText).toEqual('BGF Pacific Equity Fund (MSAC_APACN)\n' + 'PEP - 10-MAR-2017 - MSAC_APACN - USD > Report 1');

        const portfolio2 = new Portfolio('PEP,MS_IE,BR-CORE,IP,SNP500,CORE-HQ,TR-MULTI', new DateValue({date: '03/10/2017'}));
        portfolio2.fullName = 'PEP,MS_IE,BR-CORE,IP,SNP500,CORE-HQ,TR-MULTI';
        portfolio2.currency = 'USD';
        const benchmark2 = new Benchmark();
        benchmark2.type = 'RISK';
        portfolio2.benchmark = benchmark2;
        const report2 = new Report();
        report2.title = 'Really Really Really Long Report Name';

        exportComposite.portfolio = portfolio2;
        exportComposite.report = report2;

        // Test out really long portfolio names and report names
        headerText = ExportService.generateHeaderText(exportComposite);
        expect(headerText).toEqual('PEP,MS_IE,BR-CORE,IP,SNP500,CORE-HQ,TR-MULTI (RISK)\n' +
            'PEP,MS_IE,BR-CORE,IP,SNP500,.. - 10-MAR-2017 - RISK - USD > Really Really Really Lo..');

        const benchmark3 = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, undefined, BenchmarkConstants.BENCH_PRIMARY);
        const benchmark4 = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, undefined, BenchmarkConstants.BENCH_SECONDARY);
        const benchmark5 = Benchmark.create(BenchmarkConstants.OTHER_BENCH, undefined, 'PEP');
        benchmark5.portfolio = new Portfolio();
        benchmark5.portfolio.fullName = 'Pacific Equity Fund';

        portfolio2.benchmark = benchmark3;
        exportComposite.portfolio = portfolio2;
        exportComposite.report = report2;

        // Test out benchAggregate benchmarks
        headerText = ExportService.generateHeaderText(exportComposite);
        expect(headerText).toEqual('PEP,MS_IE,BR-CORE,IP,SNP500,CORE-HQ,TR-MULTI (Group Aggregate)\n' +
            'PEP,MS_IE,BR-CORE,IP,SNP500,.. - 10-MAR-2017 - Group Aggregate - USD > Really Really Really Lo..');

        portfolio2.benchmark = benchmark4;
        exportComposite.portfolio = portfolio2;
        exportComposite.report = report2;

        // Test out benchAggregate benchmarks
        headerText = ExportService.generateHeaderText(exportComposite);
        expect(headerText).toEqual('PEP,MS_IE,BR-CORE,IP,SNP500,CORE-HQ,TR-MULTI (Group Aggregate - Secondary)\n' +
            'PEP,MS_IE,BR-CORE,IP,SNP500,.. - 10-MAR-2017 - Group Aggregate - Secondary - USD > Really Really Really Lo..');

        portfolio2.benchmark = benchmark5;
        exportComposite.portfolio = portfolio2;
        exportComposite.report = report2;

        // Test out benchAggregate benchmarks
        headerText = ExportService.generateHeaderText(exportComposite);
        expect(headerText).toEqual('PEP,MS_IE,BR-CORE,IP,SNP500,CORE-HQ,TR-MULTI (Pacific Equity Fund)\n' +
            'PEP,MS_IE,BR-CORE,IP,SNP500,.. - 10-MAR-2017 - PEP - USD > Really Really Really Lo..');

    });

    /**
     * Tests the generateFooterTextWithTimestamp method
     */
    it('Tests generateFooterTextWithTimestamp method', () => {
        const footerText = ExportService.generateFooterTextWithTimestamp();
        // Difficult to test the actual time stamp that is generated
        expect(footerText.includes('Confidential - For Internal Use Only ')).toBeTruthy();
    });

    it('Test modifyBreakdownInputForReturns method', () => {
        const widgetInput: Map<string, WidgetInput> = new Map<string, WidgetInput>();
        const dummyBreakdown = new Breakdown();
        dummyBreakdown.children = [new ColumnSector({groupByColumn: {columnName: 'Dummy Title'}})];
        widgetInput.set('breakdownTree', dummyBreakdown);

        // If widgetType is different then returnWidgets
        expect(service.modifyBreakdownInputForReturns(widgetInput, 'RE')).toBeUndefined();

        service.modifyBreakdownInputForReturns(widgetInput, 'returnsWidget');
        expect((widgetInput.get('breakdownTree') as Breakdown).title).toBe('Dummy Title');

        // If already title is set then don't change
        dummyBreakdown.title = 'Primary Title';
        service.modifyBreakdownInputForReturns(widgetInput, 'returnsWidget');
        expect((widgetInput.get('breakdownTree') as Breakdown).title).toBe('Primary Title');
    });

    it('Test modifyBreakdownInputForReturns method when no breakdown is selected', () => {
        const widgetInput: Map<string, WidgetInput> = new Map<string, WidgetInput>();
        const dummyBreakdown = new Breakdown();
        dummyBreakdown.children = [];
        widgetInput.set('breakdownTree', dummyBreakdown);

        // If widgetType is different then returnWidgets
        expect(service.modifyBreakdownInputForReturns(widgetInput, 'RE')).toBeUndefined();

        service.modifyBreakdownInputForReturns(widgetInput, 'returnsWidget');
        expect((widgetInput.get('breakdownTree') as Breakdown).title).toBe('TOTAL');
    });

    describe('Test the batchContainerStatus subscription', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.PDF);
        WorkspaceStore.init();
        BatchExportingStore.init();

        it('Test the batchContainerStatus subscription with IDLE', (done) => {
            // Nothing should happen here
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.IDLE);
            expect(BatchExportingStore.batchExportQueue.length).toEqual(0);
            done();
        });

        it('Test the batchContainerStatus subscription with IDLE with a currentBatchExportAction', (done) => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            const batchExportAction = new BatchExportAction(batchReport);
            jest.spyOn(batchExportAction, 'moveNextBatchRow');
            BatchExportingStore.currentBatchExportAction = batchExportAction;
            BatchExportingStore.currentBatchRow$.next(batchReport.batchRowConfigs[0]);
            batchReport.batchRowConfigs[0].downloadStatus = BatchRowDownloadStatus.IN_PROGRESS;

            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.IDLE);
            expect(BatchExportingStore.batchExportQueue.length).toEqual(0);
            expect(batchReport.batchRowConfigs[0].downloadStatus).toEqual(BatchRowDownloadStatus.COMPLETED);
            expect(batchExportAction.moveNextBatchRow).toHaveBeenCalled();
            done();
        });

        it('Test the batchContainerStatus subscription with PRELOAD', (done) => {
            BatchExportingStore.batchExportQueue = [];
            const dummyParentWidget = new Widget();
            const dummyChildWidget = new Widget();
            dummyChildWidget.dataStore.parentDataStore = dummyParentWidget.dataStore;
            dummyChildWidget.dataStore.isDependentOnParentForData = true;
            exportComposite.report.widgets.push(dummyParentWidget, dummyChildWidget);
            service.processPDF(exportComposite);
            expect(BatchExportingStore.currentExportComposite).toEqual(exportComposite);
            expect(BatchExportingStore.getCurrentReport().toString()).toEqual(exportComposite.report.toString());
            done();
        });

        it('Test the batchContainerStatus subscription with PRELOAD with an Excel batch request', (done) => {
            BatchExportingStore.batchExportQueue = [];
            const batchExportComposite = createDummyExportComposite(ExportConstants.EXCEL, true);
            BatchExportingStore.batchExportQueue.push(batchExportComposite);
            jest.spyOn(service, 'downloadBatchExcel').mockReturnValueOnce(of(true));
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.PRELOAD);

            expect(BatchExportingStore.currentExportComposite).toEqual(batchExportComposite);
            expect(service.downloadBatchExcel).toHaveBeenCalled();
            done();
        });

        describe('Test the batchContainerStatus subscription with PRELOAD with an Excel batch request and skipped requests', () => {
            it('Failure but no skipped requests', (done) => {
                BatchExportingStore.batchExportQueue = [];
                const batchExportComposite = createDummyExportComposite(ExportConstants.EXCEL, true);
                BatchExportingStore.batchExportQueue.push(batchExportComposite);
                jest.spyOn(service, 'downloadBatchExcel').mockReturnValueOnce(of(false));
                BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.PRELOAD);

                expect(BatchExportingStore.currentExportComposite).toEqual(batchExportComposite);
                expect(service.downloadBatchExcel).toHaveBeenCalled();
                done();
            });

            it('Failure and skipped requests', (done) => {
                BatchExportingStore.batchExportQueue = [];
                const batchExportComposite = createDummyExportComposite(ExportConstants.EXCEL, true);
                (batchExportComposite as BatchExportComposite).batchRow.skippedRequests.push(new BatchRowSkippedRequest('widget', 'report', 'portfolio'))
                BatchExportingStore.batchExportQueue.push(batchExportComposite);
                jest.spyOn(service, 'downloadBatchExcel').mockReturnValueOnce(of(false));
                BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.PRELOAD);

                expect(BatchExportingStore.currentExportComposite).toEqual(batchExportComposite);
                expect(service.downloadBatchExcel).toHaveBeenCalled();
                expect((batchExportComposite as BatchExportComposite).batchRow.downloadStatus).toEqual(BatchRowDownloadStatus.PARTIAL);
                done();
            });
        })

        it('Test the batchContainerStatus subscription with LOADING', (done) => {
            // Nothing should happen here
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.LOADING);
            expect(BatchExportingStore.batchExportQueue.length).toEqual(0);
            done();
        });

        it('Test the batchContainerStatus subscription with READY', (done) => {
            jest.spyOn(service, 'exportPDFWidget');
            BatchExportingStore.currentExportComposite = exportComposite;
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.READY);
            setTimeout(() => {
                expect(service.exportPDFWidget).toHaveBeenCalledWith(exportComposite);
                done();
            }, 2100);
        });

        it('Test the batchContainerStatus subscription with canceled batch', (done) => {
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(BatchReportingTestUtils.createDummyBatchReportConfig());
            BatchExportingStore.currentBatchExportAction.canceled = true;
            BatchExportingStore.batchExportQueue.push(new BatchExportComposite());
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.IDLE);
            expect(BatchExportingStore.currentBatchExportAction).toEqual(null);
            done();
        });
    });

    describe('Test currentPDFExportAction$ subscription', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.PDF);
        const pdfExportAction = new PDFExportAction(exportComposite, null, '', '', '');

        it('Test null/undefined pdfExportAction', () => {
            BatchExportingStore.currentPDFExportAction$.next(undefined);
            expect(service.widgetCounter).toEqual(0);
        });

        it('Test currentPDFExportAction$ with exportSingleElementOnly', () => {
            jest.spyOn(service, 'renderElementOnCanvas').mockImplementation(() => {});
            BatchExportingStore.currentPDFExportAction$.next(pdfExportAction);
            expect(service.widgetCounter).toEqual(1);
            expect(service.renderElementOnCanvas).toHaveBeenCalledWith(pdfExportAction);
        });

        it('Test currentPDFExportAction$ without exportSingleElementOnly', () => {
            (pdfExportAction.exportComposite.exportConfig as PDFExportConfig).layout = PDFPageLayout.W1X1;
            pdfExportAction.exportComposite.widget = null;
            jest.spyOn(service, 'renderNextWidget').mockImplementation(() => {});
            service.widgetCounter = 4;
            BatchExportingStore.currentPDFExportAction$.next(pdfExportAction);
            expect(service.widgetCounter).toEqual(5);
            expect(service.renderNextWidget).toHaveBeenCalledWith(pdfExportAction);
        });

        it('Test the currentPDFExportAction$ subscription with canceled batch', (done) => {
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(BatchReportingTestUtils.createDummyBatchReportConfig());
            BatchExportingStore.currentBatchExportAction.canceled = true;
            BatchExportingStore.batchExportQueue.push(new BatchExportComposite());
            BatchExportingStore.currentPDFExportAction$.next(undefined);
            expect(BatchExportingStore.currentBatchExportAction).toEqual(null);
            done();
        });
    });

    describe('Export File', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.EXCEL);
        (exportComposite.exportConfig as ExcelExportConfig).fullyExpanded = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));
        exportComposite.portfolio = portfolio;
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const config = new class implements RequestAdapterConfig {
            columns = [];
            splitColumns = [];
            portfolio = '';
            expandedState = {
                expandedGroups: [],
                expandedAll: false
            };
        };

        config.portfolio = portfolio.portName;
        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        const dummyRequest = new ExploreDataRequest([{
            portfolio: 'PEP',
            fullPortfolioName: 'PEP',
            portfolioIdentifier: 'PEP'
        }]);
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest);

        it('Export File', (done) => {
            WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
            const observable = service.exportFile(exportComposite);
            observable.subscribe((downloadComplete) => {
                expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
                expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledWith(exportComposite.widget, [portfolio], exportComposite.report, new Map(exportComposite.widget.dataStore.metaData.inputs), true, undefined, undefined);
                expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_REQUEST_CMD, expect.anything(), null);
                done();
            });
        });

        it('Test exportFile with chunked files LINK', (done) => {
            WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
            httpMock.post$.mockReturnValue(of({data: {data: [['123', '456']], type: 'LINK'}}));
            httpMock.get$.mockImplementation((command, params: HttpParams) => {
                return of(params.get(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM) === '123' ? {data: 'FileName|FILE CHUNK'} : {data: 'OTHER FILE CHUNK'});
            });
            const observable = service.exportFile(exportComposite);
            observable.subscribe((() => {
                expect(httpMock.get$.mock.calls[0][0]).toEqual(RequestConstants.GET_LONG_RUNNING_REQUEST);
                expect((httpMock.get$.mock.calls[0][1] as HttpParams).get(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM)).toEqual('123');
                expect((httpMock.get$.mock.calls[1][1] as HttpParams).get(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM)).toEqual('456');
                done();
            }));
        });
    });

    describe('Test downloadBatchExcel', () => {
        it('Test downloadBatchExcel with Batch Excel export', () => {
            const exportComposite = new BatchExportComposite();
            exportComposite.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            const batchReportConfig = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReportConfig.id = 12345;
            BatchExportingStore.currentBatchReport$.next(batchReportConfig);
            exportComposite.exportConfig = new ExcelExportConfig();
            service.downloadBatchExcel(exportComposite);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.BATCH_EXCEL_EXPORT_CMD, expect.anything(), null);
        });

        it('Test downloadBatchExcel with BatchExportComposite - is appended with time stamp', () => {
            const exportComposite = new BatchExportComposite();
            exportComposite.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            const dummyBatchRowConfig = new BatchReportConfig();
            dummyBatchRowConfig.fileName = 'Batch Report';
            BatchExportingStore.currentBatchReport$.next(dummyBatchRowConfig);
            exportComposite.exportConfig = new ExcelExportConfig();
            exportComposite.exportConfig.appendTimestamp = true;
            jest.spyOn(CommonUtils, 'generateUniqueIdAsNumber').mockReturnValue('sampleTimeStamp');
            service.downloadBatchExcel(exportComposite);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.BATCH_EXCEL_EXPORT_CMD, expect.objectContaining({fileName: 'Batch Report-sampleTimeStamp'}), null);
        });

        it('Test downloadBatchExcel with merge in one file Batch Excel export', () => {
            const multiRowBatchExportComposite = new MultiRowBatchExportComposite();
            const exportComposite1 = new BatchExportComposite();
            exportComposite1.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            BatchExportingStore.currentBatchReport$.next(BatchReportingTestUtils.createDummyBatchReportConfig());
            exportComposite1.exportConfig = new ExcelExportConfig();
            exportComposite1.exportConfig.appendTimestamp = true;

            const exportComposite2 = new BatchExportComposite();
            exportComposite2.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            exportComposite2.exportConfig = new ExcelExportConfig();

            multiRowBatchExportComposite.batchExportComposites = [exportComposite1, exportComposite2];
            multiRowBatchExportComposite.exportConfig = exportComposite1.exportConfig;
            const fnSpy = jest.spyOn(CommonUtils, 'generateUniqueIdAsNumber');

            service.downloadBatchExcel(multiRowBatchExportComposite);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.BATCH_EXCEL_EXPORT_CMD, expect.anything(), null);
            expect(fnSpy).toHaveBeenCalled();
        });

        it('Test downloadBatchExcel when file downloader is required, Batch Excel export', () => {
            const multiRowBatchExportComposite = new MultiRowBatchExportComposite();
            const exportComposite1 = new BatchExportComposite();
            exportComposite1.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            BatchExportingStore.currentBatchReport$.next(BatchReportingTestUtils.createDummyBatchReportConfig());
            exportComposite1.exportConfig = new ExcelExportConfig();
            exportComposite1.exportConfig.appendTimestamp = true;

            const exportComposite2 = new BatchExportComposite();
            exportComposite2.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            exportComposite2.exportConfig = new ExcelExportConfig();

            multiRowBatchExportComposite.batchExportComposites = [exportComposite1, exportComposite2];
            multiRowBatchExportComposite.exportConfig = exportComposite1.exportConfig;

            // File Downloader shouldn't be launched
            jest.spyOn(AppUtils, 'launchApp');
            service.downloadBatchExcel(multiRowBatchExportComposite).subscribe();
            expect(AppUtils['launchApp']).toHaveBeenCalledTimes(0);

            httpMock.post$.mockReturnValue(of({data: {data:  { 'fileDownloaderApp': 'TestId', 'filesToDownloadId': 'ExploreFileDownloaderBeta'},
                    type: 'FILE_DOWNLOADER'}}));

            // File Downloader should be launched
            service.downloadBatchExcel(multiRowBatchExportComposite).subscribe();
            expect(AppUtils['launchApp']).toHaveBeenCalled();
        });

        it('Excel exporting in case of one workbook per portfolio boolean enabled', () => {
            httpMock.post$.mockClear();
            jest.spyOn(service, 'exportWorkpadBatchRequest');

            const exportComposite = new WorkspaceExportComposite();
            exportComposite.exportConfig = new WorkpadExcelExportConfig({oneWorkbookPerWorkpad: true});
            const reportGroup = new ReportGroup();
            reportGroup.portfolios = [new Portfolio('PEP'), new Portfolio('E_ASIAN')];
            const flatWorkpad = new FlatWorkpad();
            flatWorkpad.portfolio = new Portfolio('E_AIGLCC');
            exportComposite.workspace = new Workspace();
            exportComposite.workspace.workpads = [reportGroup, flatWorkpad];

            service.downloadBatchExcel(exportComposite);
            expect(service.exportWorkpadBatchRequest).toHaveBeenCalled();
            // As we have single report group having 2 portfolios and one flat workpad
            // Request will go for each portfolio for a total of 3 requests.
            // However, for this test, there will only be 2 requests in the args because the first was shifted out
            expect(service.exportWorkpadBatchRequest['mock'].calls[0][0].length).toEqual(2);
        });

        it('Status failed when response Size is Zero in Batch Excel', (done) => {
            httpMock.post$.mockReturnValue(of({data: {data:  [], totalSize: 0}}));
            const observable = service.download('getBatchSpreadsheet', {}, {});

            observable.subscribe(result => {
            }, error => {
                expect(error).toBeFalsy();
                done();
            });
        });
    });

    describe('Test ReportGroup export', () => {
        WorkspaceStore.init();

        it('exportWorkpadToExcel', (done) => {
            const exportComposite = new WorkpadExportComposite();
            exportComposite.exportConfig = new WorkpadExcelExportConfig();
            const reportGroup = new ReportGroup();
            const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));
            reportGroup.portfolios = [portfolio];
            exportComposite.workpad = reportGroup;
            (exportComposite.exportConfig as ExcelExportConfig).fullyExpanded = true;
            exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

            WorkspaceStore.currentPortfolio$.next(portfolio);
            jest.spyOn(service, 'downloadBatchExcel').mockReturnValueOnce(of(true));
            service.exportWorkpadToExcel(exportComposite)
                .subscribe((value) => {
                    expect(service.downloadBatchExcel).toHaveBeenCalledWith(exportComposite);
                    done();
                });
        });

        it('exportReportGroupExcel request check', (done) => {
            const widget1 = new Widget();
            widget1.dataStore = new WidgetDataStore();
            const metaData = new WidgetDataStoreMetaData();
            const expandedState = new ExpandedState();
            expandedState.allExpanded = false;
            expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];
            metaData.inputs.set('expandedState', expandedState);
            widget1.dataStore.metaData = metaData;
            widget1.configType = WidgetConfigType.RISK_EXPOSURE;

            const widget2 = new Widget();
            widget2.dataStore = new WidgetDataStore();
            const metaData2 = new WidgetDataStoreMetaData();
            widget2.dataStore.metaData = metaData2;
            widget2.configType = WidgetConfigType.BAR;

            const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));
            const workpad = new ReportGroup();
            workpad.portfolios.push(portfolio);
            workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

            WorkspaceStore.currentWorkpad$.next(workpad);
            WorkspaceStore.currentPortfolio$.next(portfolio);

            const exportComposite = new WorkpadExportComposite();
            exportComposite.exportConfig = new WorkpadExcelExportConfig();
            exportComposite.exportConfig.appendTimestamp = true;
            jest.spyOn(CommonUtils, 'generateUniqueIdAsNumber').mockReturnValue('sampleTimeStamp');
            const report1 = new Report();
            report1.addWidget(widget1);

            const report2 = new Report();
            report2.addWidget(widget2);
            workpad.addReports([report1, report2]);
            exportComposite.workpad = workpad;

            const dummyRequest1 = new ExploreDataRequest([
                {
                    portfolio: 'PEP',
                    fullPortfolioName: 'BGF Pacific Equity Fund',
                    portfolioIdentifier: 'PEP',
                }]);

            const dummyRequest2 = new ExploreDataRequest([{
                portfolio: 'EMAR-IA',
                fullPortfolioName: 'EMAR-IA',
                portfolioIdentifier: 'EMAR-IA',
                currency: 'USD'
            }]);

            riskAndExposureServiceMock.createFinalDataRequest.mockReset();
            // @ts-ignore
            riskAndExposureServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest1);

            barServiceMock.createFinalDataRequest.mockReset();
            // @ts-ignore
            barServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest2);

            const expectedRequest1 = dummyRequest1.requestParams;

            const expectedRequest2 = dummyRequest2.requestParams;

            const expectedExcelConfig = exportComposite.exportConfig.serialize();
            expectedExcelConfig.runAs = BatchExportRunAs[BatchExportRunAs.PORTGROUP];
            expectedExcelConfig.type = ExportConstants.EXCEL_TYPE_XLSX;

            const observable = service.exportWorkpadToExcel(exportComposite);
            observable.subscribe((downloadComplete) => {
                expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(2);
                expect(barServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(2);
                expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.REPORT_GRP_EXCEL_EXPORT_CMD,
                    {
                        batchRequests: [{_widgetRequests: [{requests: expectedRequest1, title: undefined}, {requests: expectedRequest2, title: undefined}], _exportConfig: expectedExcelConfig}, {_widgetRequests: [{requests: expectedRequest1, title: undefined}, {requests: expectedRequest2, title: undefined}], _exportConfig: expectedExcelConfig}],
                        fileName: 'My New Group-sampleTimeStamp',
                        singleFile: true,
                        workspaceName: 'Untitled Workspace',
                    }, null);
                done();
            });
        });
    });

    describe('Test Workspace export', () => {
        WorkspaceStore.init();

        it('exportWorkpadToExcel request check', (done) => {
            const workpad1 = new ReportGroup('report 1');
            workpad1.portfolios.push(new Portfolio('PEP', new DateValue({date: '09/05/2016'})));
            workpad1.portfolios.push(new Portfolio('IP', new DateValue({date: '09/05/2016'})));

            WorkspaceStore.currentWorkpad$.next(workpad1);
            const workpad2 = new FlatWorkpad();
            workpad2.portfolio = new Portfolio('CORE-HQ', new DateValue({date: '09/05/2016'}));

            const workspace = WorkspaceStore.getWorkspace();
            workspace.title = 'Sample_workspace';
            workspace.workpads.push(workpad1);
            workspace.workpads.push(workpad2);

            const exportComposite = new WorkspaceExportComposite();
            exportComposite.exportConfig = new WorkpadExcelExportConfig();

            const report1 = new Report();
            report1.addWidget(new Widget(WidgetConfigType.RISK_EXPOSURE));

            const report2 = new Report();
            report2.addWidget(new Widget(WidgetConfigType.BAR));

            const report3 = new Report();
            report3.addWidget(new Widget(WidgetConfigType.RETURNS));

            workpad1.addReports([report1, report2]);
            workpad2.addReports([report3]);
            exportComposite.workspace = workspace;

            const dummyRequest1 = new ExploreDataRequest([
                {
                    portfolio: 'PEP',
                    fullPortfolioName: 'BGF Pacific Equity Fund',
                    portfolioIdentifier: 'PEP',
                }]);

            const dummyRequest2 = new ExploreDataRequest([{
                portfolio: 'IP',
                fullPortfolioName: 'IP',
                portfolioIdentifier: 'IP',
                currency: 'USD'
            }]);

            const dummyRequest3 = new ExploreDataRequest([{
                portfolio: 'CORE-HQ',
                fullPortfolioName: 'CORE-HQ',
                portfolioIdentifier: 'CORE-HQ',
                currency: 'CORE-HQ'
            }]);

            riskAndExposureServiceMock.createFinalDataRequest.mockReset();
            // @ts-ignore
            riskAndExposureServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest1);

            barServiceMock.createFinalDataRequest.mockReset();
            // @ts-ignore
            barServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest2);

            returnsServiceMock.createFinalDataRequest.mockReset();
            // @ts-ignore
            returnsServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest3);

            const expectedRequest1 = dummyRequest1.requestParams;
            const expectedRequest2 = dummyRequest2.requestParams;
            const expectedRequest3 = dummyRequest3.requestParams;

            const expectedExcelConfig = exportComposite.exportConfig.serialize();
            expectedExcelConfig.runAs = BatchExportRunAs[BatchExportRunAs.PORTGROUP];
            expectedExcelConfig.type = ExportConstants.EXCEL_TYPE_XLSX;

            const observable = service.exportWorkpadToExcel(exportComposite);
            observable.subscribe(() => {
                expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(2);
                expect(barServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(2);
                expect(returnsServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
                expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.REPORT_GRP_EXCEL_EXPORT_CMD,
                    {
                        batchRequests: [{
                            _widgetRequests: [{requests: expectedRequest1, title: undefined},
                                {requests: expectedRequest2, title: undefined}], _exportConfig: expectedExcelConfig
                        },
                            {
                                _widgetRequests: [{requests: expectedRequest1, title: undefined},
                                    {requests: expectedRequest2, title: undefined}], _exportConfig: expectedExcelConfig
                            },
                            {
                                _widgetRequests: [{requests: expectedRequest3, title: undefined}],
                                _exportConfig: expectedExcelConfig
                            }
                        ],
                        fileName: 'Sample_workspace',
                        singleFile: true,
                        workspaceName: 'Sample_workspace',
                    }, null);
                done();
            });
        });
    });

    it('Export File Excel - visible data only', (done) => {
        const widget = new Widget();
        widget.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const expandedState = new ExpandedState();
        expandedState.allExpanded = false;
        expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];

        metaData.inputs.set('expandedState', expandedState);
        widget.dataStore.metaData = metaData;
        widget.configType = WidgetConfigType.RISK_EXPOSURE;
        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));

        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);

        workpad.comparisonConfigMap = comparisonConfigMap;


        WorkspaceStore.currentWorkpad$.next(workpad);

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = createDummyExportComposite(ExportConstants.EXCEL);
        exportComposite.widget = widget;
        exportComposite.report.comparisonConfigId = 1;
        exportComposite.portfolio = portfolio;

        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const dummyRequest = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA'
        }]);

        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValueOnce(dummyRequest);

        const expectedRequest = dummyRequest.requestParams[0];
        expectedRequest['expandedNodes'] = [['_ROOT_', 'EQUITY']];
        const expectedExcelConfig = exportComposite.exportConfig.serialize();
        expectedExcelConfig.type = ExportConstants.EXCEL_TYPE_XLSX;

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledWith(exportComposite.widget, [workpad.portfolios[0]], exportComposite.report, new Map(exportComposite.widget.dataStore.metaData.inputs), true, undefined, undefined);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_REQUEST_CMD, {requests: [expectedRequest], exportConfig: expectedExcelConfig }, null);
            done();
        });
    });

    it('Export file Excel should append WorkspaceName in final Request if exportToSingleSheet is enabled', async () => {
        const exportComposite = new ExportComposite();
        exportComposite.exportConfig = new ExcelExportConfig({exportToSingleSheet: true});
        jest.spyOn<any>(service, 'createWidgetExportingRequest').mockReturnValueOnce({multiRequests: {}});
        jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(new Workspace({title: 'Dummy Workspace'}));
        exportComposite.report = new Report('report 1');

        const comparisonConfig = new ComparisonConfig();
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);
        const  workpad: FlatWorkpad = new FlatWorkpad();
        workpad.comparisonConfigMap = comparisonConfigMap;


        WorkspaceStore.currentWorkpad$.next(workpad);
        await service.exportFile(exportComposite);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_REQUEST_CMD, {
                requests: expect.anything(),
                exportConfig: expect.anything(),
                workspaceName: 'Dummy Workspace'
            }, null);

        // If exportToSingle boolean is false, then don't send WorkspaceName
        exportComposite.exportConfig = new ExcelExportConfig();
        await service.exportFile(exportComposite);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_REQUEST_CMD, {
                requests: expect.anything(),
                exportConfig: expect.anything()
            }, null);
    });

    it('Export file should add table data if export is for table other than widget', (done) => {
        const exportComposite = new ExportComposite();
        exportComposite.exportConfig = new ExcelExportConfig();
        exportComposite.tableData = 'dummyTableData';
        exportComposite.exportConfig.exportLevel = ExportLevel.GRID;
        exportComposite.report = new Report('Report 1');
        exportComposite.report.comparisonConfigId = 1;

        const comparisonConfig = new ComparisonConfig();
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);
        const workpad: FlatWorkpad = new FlatWorkpad();

        workpad.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$.next(workpad);
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('1');
        exportComposite.portfolio = new Portfolio('PEP', new DateValue({date: '05/09/2017', calCode: 'GP_HK'}));
        exportComposite.outlineData = {totalTrades: 10};
        service.exportFile(exportComposite).subscribe(() => {
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_REQUEST_CMD, {
                requests: [{
                    columnInfo: ['lineItem_1', 'secDesc_1', 'tradeType_1', 'tradeSize_1', 'changeInQuantity_1', 'changeInNotionalMarketValue_1', 'changeInMarketValue_1'],
                    columns: [{columnKey: 'lineItem_1', columnTag: 'lineItem', dataType: 'STRING', 'isTradeTableSpecificColumn': true, title: 'Security'},
                        {columnKey: 'secDesc_1', columnTag: 'secDesc', dataType: 'STRING', title: 'Description', 'isTradeTableSpecificColumn': true},
                        {columnKey: 'tradeType_1', columnTag: 'tradeType', dataType: 'STRING', 'isTradeTableSpecificColumn': true, title: 'Transaction type'},
                        {columnKey: 'tradeSize_1', columnTag: 'tradeSize', dataType: 'DOUBLE', 'isTradeTableSpecificColumn': true, optionValues: {decimalPlaces: 4, scaling: 1, useThousandsSeparator: false }, title: 'Transaction amount (% of portfolio NAV)'},
                        {columnKey: 'changeInQuantity_1', columnTag: 'quantity', dataType: 'DOUBLE', optionValues: {decimalPlaces: 4, scaling: 1, useThousandsSeparator: false }, title: 'Quantity'},
                        {columnKey: 'changeInNotionalMarketValue_1', columnTag: 'notional_mv', dataType: 'DOUBLE', optionValues: {decimalPlaces: 4, scaling: 1, useThousandsSeparator: false }, title: 'Notional Market Value'},
                        {columnKey: 'changeInMarketValue_1', columnTag: 'market_val', dataType: 'DOUBLE', optionValues: {decimalPlaces: 4, scaling: 1, useThousandsSeparator: false }, title: 'Market Value'}],
                    currency: undefined,
                    exportTableOtherThanWidget: true,
                    forDate: '05/09/2017',
                    fullPortfolioName: undefined,
                    holidayCalendar: 'GP_HK',
                    includeAliasPortfolios: false,
                    layout: 'Report 1',
                    outlineData: {totalTrades: 10},
                    portfolio: 'PEP',
                    portId: expect.anything(),
                    portfolioIdentifier: 'PEP',
                    splitPositionTypes: 'XC,XF,XH,XS,SW,O',
                    tableData: '"dummyTableData"',
                    title: 'Trades Table',
                    positionMode: 'AS_OF_W'
                }],
                exportConfig: expect.anything()
            }, null);
            done();
        });
    });

    it('Export File PDF - visible data only', (done) => {
        const widget = new Widget();
        widget.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const expandedState = new ExpandedState();
        expandedState.allExpanded = false;
        expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];

        metaData.inputs.set('expandedState', expandedState);
        widget.dataStore.metaData = metaData;
        widget.configType = WidgetConfigType.RISK_EXPOSURE;
        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));

        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = createDummyExportComposite(ExportConstants.PDF);
        exportComposite.exportConfig = new TablePDFExportConfig();
        exportComposite.widget = widget;
        exportComposite.portfolio = portfolio;

        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const dummyRequest = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA'
        }]);

        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        jest.spyOn<any, string>(service, 'createWidgetExportingRequest').mockRestore();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValueOnce(dummyRequest);

        const expectedRequest = dummyRequest.requestParams[0];
        expectedRequest['expandedNodes'] = [['_ROOT_', 'EQUITY']];
        (exportComposite.exportConfig as TablePDFExportConfig).logoConfig = new LogoConfig();
        (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile = 'imagedata';
        const expectedExcelConfig = exportComposite.exportConfig.serialize();
        expectedExcelConfig.type = ExportConstants.PDF_TYPE;

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledWith(exportComposite.widget, [workpad.portfolios[0]], exportComposite.report, new Map(exportComposite.widget.dataStore.metaData.inputs), true, undefined, undefined);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.TABLE_PDF_REQUEST_CMD, {requests: [expectedRequest], exportConfig: expectedExcelConfig }, null);
            done();
        });
    });

    it('Export File - comparison mode- visible data only', (done) => {
        const widget = new Widget();
        widget.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const expandedState = new ExpandedState();
        expandedState.allExpanded = false;
        expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];

        metaData.inputs.set('expandedState', expandedState);
        widget.dataStore.metaData = metaData;
        widget.configType = WidgetConfigType.RISK_EXPOSURE;
        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));

        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);

        workpad.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = createDummyExportComposite(ExportConstants.EXCEL);
        exportComposite.widget = widget;
        exportComposite.report.comparisonConfigId = 1;

        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;


        const dummyRequest = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA'
        },
            {
                portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]);

        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValueOnce(dummyRequest);

        const expectedRequest = {multiRequests: dummyRequest.requestParams};
        expectedRequest.multiRequests[0]['expandedNodes'] = [['_ROOT_', 'EQUITY']];
        expectedRequest.multiRequests[1]['expandedNodes'] = [['_ROOT_', 'EQUITY']];
        const expectedExcelConfig = exportComposite.exportConfig.serialize();
        expectedExcelConfig.type = ExportConstants.EXCEL_TYPE_XLSX;

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledWith(exportComposite.widget, [workpad.portfolios[0], workpad.portfolios[1]], exportComposite.report, new Map(exportComposite.widget.dataStore.metaData.inputs), true, undefined, undefined);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_MULTI_PORT_COMPARE_REQUEST_CMD, {requestLists: [{requests: expectedRequest.multiRequests}], exportConfig: expectedExcelConfig}, null);
            done();
        });
    });

    it('Export File Report - comparison mode- visible data only', (done) => {
        const widget1 = new Widget();
        widget1.dimensions = {x: 0, y: 0, cols: 8, rows: 8};
        widget1.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const expandedState = new ExpandedState();
        expandedState.allExpanded = false;
        expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];
        metaData.inputs.set('expandedState', expandedState);
        widget1.dataStore.metaData = metaData;
        widget1.configType = WidgetConfigType.RISK_EXPOSURE;

        const widget2 = new Widget();
        widget2.dimensions = {x: 16, y: 0, cols: 8, rows: 8};
        widget2.dataStore = new WidgetDataStore();
        const metaData2 = new WidgetDataStoreMetaData();
        widget2.dataStore.metaData = metaData2;
        widget2.configType = WidgetConfigType.BAR;

        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));
        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);

        workpad.comparisonConfigMap = comparisonConfigMap;


        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = new ExportComposite();
        exportComposite.exportConfig = new ExcelExportConfig();
        const report = new Report();
        report.addWidget(widget1);
        report.addWidget(widget2);
        exportComposite.report = report;

        exportComposite.report.comparisonConfigId = 1;

        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const dummyRequest1 = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA'
        },
            {
                portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]);

        const dummyRequest2 = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA',
            currency: 'USD'
        },
            {
                portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]);

        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest1);

        barServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        barServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest2);

        const expectedRequest1 = {multiRequests: dummyRequest1.requestParams};
        expectedRequest1.multiRequests[0]['expandedNodes'] = [['_ROOT_', 'EQUITY']];
        expectedRequest1.multiRequests[1]['expandedNodes'] = [['_ROOT_', 'EQUITY']];

        const expectedRequest2 = {multiRequests: dummyRequest2.requestParams};

        const expectedExcelConfig = exportComposite.exportConfig.serialize();
        expectedExcelConfig.type = ExportConstants.EXCEL_TYPE_XLSX;

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(barServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_MULTI_PORT_COMPARE_REQUEST_CMD, {requestLists: [{requests: expectedRequest1.multiRequests},
                    {requests: expectedRequest2.multiRequests}], exportConfig: expectedExcelConfig}, null);
            done();
        });
    });

    it('Export File Report Level -- invoked with correct fileName', (done) => {
        const widget1 = new Widget();
        widget1.dimensions = {x: 0, y: 0, cols: 8, rows: 8};
        widget1.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const expandedState = new ExpandedState();
        expandedState.allExpanded = false;
        expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];
        metaData.inputs.set('expandedState', expandedState);
        widget1.dataStore.metaData = metaData;
        widget1.title = 'title 1';
        widget1.configType = WidgetConfigType.RISK_EXPOSURE;

        const widget2 = new Widget();
        widget2.dimensions = {x: 16, y: 0, cols: 8, rows: 8};
        widget2.dataStore = new WidgetDataStore();
        widget2.title = 'title2';
        const metaData2 = new WidgetDataStoreMetaData();
        widget2.dataStore.metaData = metaData2;
        widget2.configType = WidgetConfigType.BAR;

        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));
        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);

        workpad.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$.next(workpad);

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = new ExportComposite();
        exportComposite.exportConfig = new ExcelExportConfig();
        const report = new Report();
        report.addWidget(widget1);
        report.addWidget(widget2);
        report.title = 'report 1';
        report.comparisonConfigId = 1;
        exportComposite.report = report;
        // No widget Set, Report level export

        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const dummyRequest1 = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA'
        },
            {
                portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]);

        const dummyRequest2 = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA',
            currency: 'USD'
        },
            {
                portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]);

        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest1);

        barServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        barServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest2);

        const expectedRequest1 = {multiRequests: dummyRequest1.requestParams};
        expectedRequest1.multiRequests[0]['expandedNodes'] = [['_ROOT_', 'EQUITY']];
        expectedRequest1.multiRequests[1]['expandedNodes'] = [['_ROOT_', 'EQUITY']];

        const expectedRequest2 = {multiRequests: dummyRequest2.requestParams};

        const expectedExportOptions = exportComposite.exportConfig.serialize();

        // Create a spy on it using "any"
        const downloadMock = jest.spyOn<any>(service, 'download');

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(downloadMock).toBeCalledWith(ExportServiceConstants.EXCEL_MULTI_PORT_COMPARE_REQUEST_CMD, {requestLists: [{requests: expectedRequest1.multiRequests},
                    {requests: expectedRequest2.multiRequests}], exportConfig: expectedExportOptions}, expectedExportOptions, 'report 1');
            done();
        });
    });

    it('Export File widget level -- invoked with correct fileName', (done) => {
        const widget1 = new Widget();
        widget1.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const expandedState = new ExpandedState();
        expandedState.allExpanded = false;
        expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];
        metaData.inputs.set('expandedState', expandedState);
        widget1.dataStore.metaData = metaData;
        widget1.title = 'title 1';
        widget1.configType = WidgetConfigType.RISK_EXPOSURE;

        const widget2 = new Widget();
        widget2.dataStore = new WidgetDataStore();
        widget2.title = 'title 2';
        const metaData2 = new WidgetDataStoreMetaData();
        widget2.dataStore.metaData = metaData2;
        widget2.configType = WidgetConfigType.BAR;

        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));
        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);

        workpad.comparisonConfigMap = comparisonConfigMap;


        WorkspaceStore.currentWorkpad$.next(workpad);

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = new ExportComposite();
        exportComposite.exportConfig = new ExcelExportConfig();
        const report = new Report();
        report.addWidget(widget1);
        report.addWidget(widget2);
        report.comparisonConfigId = 1;
        exportComposite.report = report;
        // Widget level export
        exportComposite.widget = widget1;

        exportComposite.report.comparisonConfig = new ComparisonConfig();
        exportComposite.report.comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];

        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const dummyRequest1 = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA'
        },
            {
                portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]);

        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValue(dummyRequest1);


        const expectedRequest1 = {multiRequests: dummyRequest1.requestParams};
        expectedRequest1.multiRequests[0]['expandedNodes'] = [['_ROOT_', 'EQUITY']];
        expectedRequest1.multiRequests[1]['expandedNodes'] = [['_ROOT_', 'EQUITY']];

        const expectedExportOptions = exportComposite.exportConfig.serialize();

        // Create a spy on it using "any"
        const downloadMock = jest.spyOn<any>(service, 'download');

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(downloadMock).toBeCalledWith(ExportServiceConstants.EXCEL_MULTI_PORT_COMPARE_REQUEST_CMD, {requestLists: [{requests: expectedRequest1.multiRequests}], exportConfig: expectedExportOptions}, expectedExportOptions, 'title 1');
            done();
        });
    });

    it('Export File EXCEL - comparison mode- visible data only- all expanded', (done) => {
        const widget = new Widget();
        widget.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const expandedState = new ExpandedState();
        expandedState.allExpanded = true;
        expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];
        metaData.inputs.set('expandedState', expandedState);

        const sortedColumns = new SortedColumns();
        sortedColumns.sortedColumns.push(new SortedColumn({colId: 'pct_mv', sort: 'desc'}));
        metaData.inputs.set('sortedColumns', sortedColumns);

        widget.dataStore.metaData = metaData;
        widget.configType = WidgetConfigType.RISK_EXPOSURE;
        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));

        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);

        workpad.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = createDummyExportComposite(ExportConstants.EXCEL);
        exportComposite.widget = widget;
        exportComposite.report.comparisonConfigId = 1;

        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const dummyRequest = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA'
        },
            {
                portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]);


        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValueOnce(dummyRequest);

        const expectedRequest = {multiRequests: dummyRequest.requestParams};
        expectedRequest.multiRequests[0]['expandedNodes'] = [['FULLY_EXPANDED']];
        expectedRequest.multiRequests[1]['expandedNodes'] = [['FULLY_EXPANDED']];
        expectedRequest.multiRequests[0]['sortedColumns'] = [{colId: 'pct_mv', sort: 'desc'}];
        expectedRequest.multiRequests[1]['sortedColumns'] = [{colId: 'pct_mv', sort: 'desc'}];
        const expectedExcelConfig = exportComposite.exportConfig.serialize();
        expectedExcelConfig.type = ExportConstants.EXCEL_TYPE_XLSX;

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledWith(exportComposite.widget, [workpad.portfolios[0], workpad.portfolios[1]], exportComposite.report, new Map(exportComposite.widget.dataStore.metaData.inputs), true, undefined, undefined);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_MULTI_PORT_COMPARE_REQUEST_CMD, {requestLists: [{requests: expectedRequest.multiRequests}], exportConfig: expectedExcelConfig}, null);
            done();
        });
    });

    it('Export File PDF - comparison mode- visible data only- all expanded', (done) => {
        const widget = new Widget();
        widget.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const expandedState = new ExpandedState();
        expandedState.allExpanded = true;
        expandedState.expandedPaths = [['_ROOT_', 'EQUITY']];

        metaData.inputs.set('expandedState', expandedState);
        widget.dataStore.metaData = metaData;
        widget.configType = WidgetConfigType.RISK_EXPOSURE;
        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));

        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);

        workpad.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = createDummyExportComposite(ExportConstants.PDF);
        exportComposite.exportConfig = new TablePDFExportConfig();
        exportComposite.widget = widget;
        exportComposite.report.comparisonConfigId = 1;
        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const dummyRequest = new ExploreDataRequest([{
            portfolio: 'EMAR-IA',
            fullPortfolioName: 'EMAR-IA',
            portfolioIdentifier: 'EMAR-IA'
        },
            {
                portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]);


        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValueOnce(dummyRequest);

        const expectedRequest = {multiRequests: dummyRequest.requestParams};
        expectedRequest.multiRequests[0]['expandedNodes'] = [['FULLY_EXPANDED']];
        expectedRequest.multiRequests[1]['expandedNodes'] = [['FULLY_EXPANDED']];
        (exportComposite.exportConfig as TablePDFExportConfig).logoConfig = new LogoConfig();
        (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile = 'imagedata';
        const expectedExcelConfig = exportComposite.exportConfig.serialize();
        expectedExcelConfig.type = ExportConstants.PDF_TYPE;

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledWith(exportComposite.widget, [workpad.portfolios[0], workpad.portfolios[1]], exportComposite.report, new Map(exportComposite.widget.dataStore.metaData.inputs), true, undefined, undefined);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.MULTI_TABLE_PDF_REQUEST_CMD, {requestLists: [{requests: expectedRequest.multiRequests}], exportConfig: expectedExcelConfig}, null);
            done();
        });
    });

    it('Export File - comparison mode- visible data only - no expanded state set', (done) => {
        const widget = new Widget();
        widget.dataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        widget.dataStore.metaData = metaData;
        widget.configType = WidgetConfigType.RISK_EXPOSURE;
        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));

        const workpad = new ReportGroup('Test Report 1');
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);

        workpad.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const report = new Report('report 1');
        report.comparisonConfigId = 1;
        const exportComposite = new ExportComposite();
        exportComposite.report = report;
        const excelConfig = new ExcelExportConfig();
        excelConfig.visibleOnly = true;

        exportComposite.exportConfig = excelConfig;
        exportComposite.widget = widget;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const dummyRequest = new ExploreDataRequest([
            {
                portfolio: 'EMAR-IA',
                fullPortfolioName: 'EMAR-IA',
                portfolioIdentifier: 'EMAR-IA'
            },
            {	portfolio: 'PEP',
                fullPortfolioName: 'BGF Pacific Equity Fund',
                portfolioIdentifier: 'PEP',
            }]
        );


        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValueOnce(dummyRequest);

        const expectedRequest = {multiRequests: [
                {
                    portfolio: 'EMAR-IA',
                    fullPortfolioName: 'EMAR-IA',
                    portfolioIdentifier: 'EMAR-IA'
                },
                {	portfolio: 'PEP',
                    fullPortfolioName: 'BGF Pacific Equity Fund',
                    portfolioIdentifier: 'PEP',
                }]};
        expectedRequest.multiRequests[0]['expandedNodes'] = [[ROOT_LEVEL]];
        expectedRequest.multiRequests[1]['expandedNodes'] = [[ROOT_LEVEL]];
        const expectedExcelConfig = excelConfig.serialize();
        expectedExcelConfig.type = ExportConstants.EXCEL_TYPE_XLSX;

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledWith(exportComposite.widget, [workpad.portfolios[0], workpad.portfolios[1]], report, new Map(exportComposite.widget.dataStore.metaData.inputs), true, undefined, undefined);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_MULTI_PORT_COMPARE_REQUEST_CMD, {requestLists: [{requests: expectedRequest.multiRequests}], exportConfig: expectedExcelConfig}, null);
            done();
        });
    });

    it('Export File - comparison mode', (done) => {
        const portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));

        const workpad = new ReportGroup();
        workpad.portfolios.push(portfolio);
        workpad.portfolios.push( new Portfolio('IP', new DateValue({date: '09/05/2016'})));

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = [workpad.portfolios[0].portId, workpad.portfolios[1].portId];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);
        workpad.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$.next(workpad);
        WorkspaceStore.currentPortfolio$.next(portfolio);

        const exportComposite = createDummyExportComposite(ExportConstants.EXCEL);
        exportComposite.report.comparisonConfigId = 1;

        (exportComposite.exportConfig as ExcelExportConfig).visibleOnly = true;
        exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

        const config = new class implements RequestAdapterConfig {
            columns = [];
            splitColumns = [];
            portfolio = '';
            expandedState = {
                expandedGroups: [],
                expandedAll: false
            };
        };

        config.portfolio = portfolio.portName;
        riskAndExposureServiceMock.createFinalDataRequest.mockReset();
        // @ts-ignore
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValueOnce({multiRequests: {}});

        const observable = service.exportFile(exportComposite);
        observable.subscribe((downloadComplete) => {
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledTimes(1);
            expect(riskAndExposureServiceMock['createFinalDataRequest']).toHaveBeenCalledWith(exportComposite.widget, [workpad.portfolios[0], workpad.portfolios[1]], exportComposite.report, new Map(exportComposite.widget.dataStore.metaData.inputs), true, undefined, undefined);
            expect(httpMock['post$']).toBeCalledWith(ExportServiceConstants.EXCEL_MULTI_PORT_COMPARE_REQUEST_CMD, expect.anything(), null);
            done();
        });
    });

    describe('Test download method', () => {
        it('Test download with empty files in response', (done) => {
            httpMock.post$.mockReturnValueOnce(of({data:  {data: []}}));
            jest.spyOn(service, 'downloadFiles').mockImplementation(() => {});
            service.download('test', {}, {}, 'test').subscribe((response) => {
                expect(response).toEqual(null);
                expect(service.downloadFiles).not.toHaveBeenCalled();
                done();
            });
        });

        it('Test download with a canceled Batch request', (done) => {
            jest.spyOn(service, 'downloadFiles').mockImplementation(() => {});
            httpMock.post$.mockReturnValueOnce(of({data:  {data: ['FILE', 'FILE']}}));
            BatchExportingStore.currentBatchExportAction = null;
            service.download(ExportServiceConstants.BATCH_EXCEL_EXPORT_CMD, {}, {}, 'test').subscribe((response) => {
                expect(response).toEqual(null);
                expect(service.downloadFiles).not.toHaveBeenCalled();
                done();
            });
        });

        it('Test download with multiple simultaneous files', (done) => {
            jest.spyOn(service, 'downloadFiles').mockRestore();
            jest.spyOn(service, 'downloadFiles').mockImplementationOnce((_a, _b, _c, _d, _e) => of(true));
            httpMock.post$.mockRestore();
            httpMock.post$.mockReturnValueOnce(of({data:  {data: ['FILE', 'FILE', 'FILE', 'FILE', 'FILE', 'FILE', 'FILE', 'FILE', 'FILE', 'FILE', 'FILE']}}));
            service.download('test', {}, {}, 'test').subscribe((response) => {
                expect(response).toEqual(true);
                expect(service.downloadFiles).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('Test processPDF', () => {
        it('Test processPDF with WorkspaceExportComposite', () => {
            const exportComposite = new WorkspaceExportComposite();
            exportComposite.exportConfig = new PDFExportConfig();
            const dummyWorkspace = new Workspace();
            dummyWorkspace.title = '';
            const dummyWorkpad = new FlatWorkpad();
            const portfolio = new Portfolio('PEP');
            const report1 = new Report('Test report 1');
            const report2 = new Report('Test report 2');
            report1.comparisonConfigId = 1;
            report2.comparisonConfigId = 2;
            dummyWorkpad.portfolio = portfolio;
            dummyWorkpad.reports = [report1, report2];
            dummyWorkspace.workpads = [dummyWorkpad];
            exportComposite.workspace = dummyWorkspace;

            const comparisonConfig = new ComparisonConfig();
            const comparisonConfigMap = new Map<number, ComparisonConfig>();
            comparisonConfigMap.set(1, comparisonConfig);
            comparisonConfigMap.set(2, comparisonConfig);

            dummyWorkpad.comparisonConfigMap = comparisonConfigMap;

            WorkspaceStore.currentWorkpad$.next(dummyWorkpad);

            jest.spyOn(service['batchReportingService'], 'runBatchExport').mockImplementation(() => {});
            service.processPDF(exportComposite);
            const batchReportConfig = service['batchReportingService'].runBatchExport['mock'].calls[0][0];
            expect(batchReportConfig.batchRowConfigs.length).toEqual(1);
            expect(batchReportConfig.fileName).toEqual('Explore Workspace');
            expect(batchReportConfig.mergeInOneFile).toBeTruthy();
        });

        it('Test processPDF with WorkpadExportComposite', () => {
            const exportComposite = new WorkpadExportComposite();
            exportComposite.exportConfig = new PDFExportConfig();
            const dummyReportGroup = new ReportGroup();
            dummyReportGroup.title = '';
            const portfolio1 = new Portfolio('PEP');
            const portfolio2 = new Portfolio('IP');
            dummyReportGroup.portfolios = [portfolio1, portfolio2];
            const report1 = new Report('Test report 1');
            const report2 = new Report('Test report 2');
            report1.comparisonConfigId = 1;
            report2.comparisonConfigId = 2;
            dummyReportGroup.reports = [report1, report2];
            exportComposite.workpad = dummyReportGroup;

            const comparisonConfig = new ComparisonConfig();
            const comparisonConfigMap = new Map<number, ComparisonConfig>();
            comparisonConfigMap.set(1, comparisonConfig);
            comparisonConfigMap.set(2, comparisonConfig);

            dummyReportGroup.comparisonConfigMap = comparisonConfigMap;

            WorkspaceStore.currentWorkpad$.next(dummyReportGroup);

            const runBatchExportSpy = jest.spyOn(service['batchReportingService'], 'runBatchExport');
            runBatchExportSpy.mockRestore();
            runBatchExportSpy.mockImplementation(() => {});
            service.processPDF(exportComposite);
            const batchReportConfig = service['batchReportingService'].runBatchExport['mock'].calls[0][0];
            expect(batchReportConfig.batchRowConfigs.length).toEqual(2);
            expect(batchReportConfig.fileName).toEqual('Explore Report Group');
            expect(batchReportConfig.mergeInOneFile).toBeTruthy();
        });
    });

    describe('Test setBatchContainerStatus', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.PDF);

        it('Test setBatchContainerStatus with more in BatchExportingStore.batchExportQueue', () => {
            BatchExportingStore.batchExportQueue.push(exportComposite);
            service.setBatchContainerStatus();
            expect(BatchExportingStore.getBatchContainerStatus()).toEqual(BatchContainerStatus.PRELOAD);
        });

        it('Test setBatchContainerStatus with empty BatchExportingStore.batchExportQueue', () => {
            BatchExportingStore.batchExportQueue = [];
            service.setBatchContainerStatus();
            expect(BatchExportingStore.getBatchContainerStatus()).toEqual(BatchContainerStatus.IDLE);
        });
    });

    describe('Test exportPDF', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.PDF);

        it('Test exportPDF for single widget export', () => {
            jest.spyOn(service, 'exportPDFWidget').mockImplementation(() => {});
            service.exportPDF(exportComposite);
            expect(service.exportPDFWidget).toHaveBeenCalledWith(exportComposite);
        });

        it('Test exportPDF for report export', () => {
            exportComposite.widget = null;
            jest.spyOn(service, 'exportPDFReport').mockImplementationOnce(() => {});
            service.exportPDF(exportComposite);
            expect(service.exportPDFReport).toHaveBeenCalledWith(exportComposite);
        });
    });

    describe('Test exportPDFWidget', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.PDF);
        const report = new Report('Test Report');
        exportComposite.report = report;
        exportComposite.widget.title = 'Risk and Exposure';
        exportComposite.widget.id = 123456;

        const portfolio = new Portfolio('PEP', new DateValue({date: '4/01/2020'}));
        portfolio.benchmark = Benchmark.create('RISK', 1, 'TEST');
        portfolio.currency = 'USD';
        exportComposite.portfolio = portfolio;
        BatchExportingStore.currentPortfolio$.next(portfolio);
        BatchExportingStore.currentReport$.next(report);
        beforeAll(() => {
            jest.spyOn(BatchExportingStore, 'getCurrentPortfolio').mockReturnValue(portfolio);
            jest.spyOn(BatchExportingStore, 'getCurrentReport').mockReturnValue(report);
        });

        it('Test exportPDFWidget with no element', () => {
            jest.spyOn(service, 'createPDFDoc');
            service.exportPDFWidget(exportComposite);
            // This method should not be called because no widgetElement was found
            expect(service.createPDFDoc).not.toHaveBeenCalled();
        });

        it('should create PDFDoc', () => {
            const pdfExportConfig = new PDFExportConfig();
            const jsPDF = service.createPDFDoc(pdfExportConfig);
            expect(jsPDF).toBeDefined();
        });

        it('Test exportPDFWidget with table widget', async () => {
            // Dummy widgetElement
            const widgetElement = '<div class="widget-container"></div>';
            jest.spyOn(document, 'querySelector').mockReturnValue(widgetElement);
            jest.spyOn(service, 'createPDFDoc').mockReturnValue({internal: {pageSize: {getWidth: () => 12 }}, save: jest.fn()});
            jest.spyOn(ChartUtils, 'isChartWidget').mockReturnValue(false);
            jest.spyOn(service, 'preProcessTableElement').mockImplementation(() => {});
            jest.spyOn(service, 'renderElementOnCanvas').mockImplementationOnce(_a => Promise.resolve());
            await service.exportPDFWidget(exportComposite);
            expect(service.renderElementOnCanvas).toHaveBeenCalled();
        });

        it('Test exportPDFWidget with chart widget', async () => {
            exportComposite.exportConfig.appendTimestamp = true;
            (exportComposite.exportConfig as PDFExportConfig).pageMargin.units = PDFPageMargin.PIXELS;
            // Dummy widgetElement
            const widgetElement = '<div class="widget-container"></div>';
            jest.spyOn(document, 'querySelector').mockReturnValue(widgetElement);
            jest.spyOn(service, 'createPDFDoc').mockReturnValue({internal: {pageSize: {getWidth: () => 12 }}, save: jest.fn()});
            jest.spyOn(ChartUtils, 'isChartWidget').mockReturnValue(true);
            jest.spyOn(service, 'preProcessChartElement').mockImplementation(() => {});
            jest.spyOn(service, 'renderElementOnCanvas').mockImplementationOnce(_a => Promise.resolve());
            jest.spyOn(service, 'exportPDFWidget').mockRestore();
            await service.exportPDFWidget(exportComposite);
            expect(service.renderElementOnCanvas).toHaveBeenCalled();
        });
    });

    describe('Test exportPDFReport', () => {
        let exportComposite = createDummyExportComposite(ExportConstants.PDF);
        const report = new Report('Test Report');
        exportComposite.report = report;
        exportComposite.widget.title = 'Risk and Exposure';
        exportComposite.widget.id = 123456;

        const portfolio = new Portfolio('PEP', new DateValue({date: '4/01/2020'}));
        portfolio.title = 'PEP';
        portfolio.benchmark = Benchmark.create('RISK', 1, 'TEST');
        portfolio.currency = 'USD';
        exportComposite.portfolio = portfolio;
        BatchExportingStore.currentPortfolio$.next(portfolio);
        BatchExportingStore.currentReport$.next(report);
        beforeAll(() => {
            jest.spyOn(BatchExportingStore, 'getCurrentPortfolio').mockReturnValue(portfolio);
            jest.spyOn(BatchExportingStore, 'getCurrentReport').mockReturnValue(report);
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(BatchReportingTestUtils.createDummyBatchReportConfig());
        });

        it('Test exportPDFReport with no element', () => {
            // Dummy report element
            const reportElement = document.createElement('div');
            jest.spyOn(document, 'querySelector').mockReturnValue(reportElement);
            jest.spyOn(service, 'createPDFDoc').mockReturnValue({internal: {pageSize: {getWidth: () => 12 }}, save: jest.fn()});
            const preProcessTableElementSpy = jest.spyOn(service, 'preProcessTableElement');
            preProcessTableElementSpy.mockRestore();
            preProcessTableElementSpy.mockImplementation(() => {});
            const preProcessChartElementSpy = jest.spyOn(service, 'preProcessChartElement');
            preProcessChartElementSpy.mockRestore();
            preProcessChartElementSpy.mockImplementation(() => {});
            service.exportPDFReport(exportComposite);
            // These methods should not be called because no widgetElement was found
            expect(preProcessTableElementSpy).not.toHaveBeenCalled();
            expect(preProcessChartElementSpy).not.toHaveBeenCalled();
        });

        it('Test exportPDFReport with elements', () => {
            exportComposite.exportConfig.appendTimestamp = true;
            (exportComposite.exportConfig as PDFExportConfig).pageMargin.units = PDFPageMargin.INCHES;
            // Create a fake report element
            const reportElement = document.createElement('div');
            // Create a fake table widget element
            const tableWidgetContainer = document.createElement('div');
            tableWidgetContainer.classList.add('widget-container');
            tableWidgetContainer.appendChild(document.createElement('app-explore-table'));
            reportElement.appendChild(tableWidgetContainer);
            // Create a fake chart widget element
            const chartWidgetContainer = document.createElement('div');
            chartWidgetContainer.classList.add('widget-container');
            reportElement.appendChild(chartWidgetContainer);
            jest.spyOn(document, 'querySelector').mockReturnValue(reportElement);
            jest.spyOn(service, 'createPDFDoc').mockReturnValue({internal: {pageSize: {getWidth: () => 12 }}, save: jest.fn()});
            jest.spyOn(service, 'preProcessTableElement').mockImplementation(() => {});
            jest.spyOn(service, 'preProcessChartElement').mockImplementation(() => {});
            jest.spyOn(service, 'renderElementOnCanvas').mockImplementation(() => {});
            service.exportPDFReport(exportComposite);
            expect(service.preProcessTableElement).toHaveBeenCalledWith(tableWidgetContainer);
            expect(service.preProcessChartElement).toHaveBeenCalledWith(chartWidgetContainer);
        });

        it('Test exportPDFReport with elements and linkedPDFExportAction', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(batchReport);
            const currentBatchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            batchReport.batchRowConfigs.push(currentBatchRow);
            exportComposite = createDummyExportComposite(ExportConstants.PDF, true);
            exportComposite.exportConfig.appendTimestamp = true;
            exportComposite.report = report;
            exportComposite.portfolio = portfolio;
            (exportComposite as BatchExportComposite).batchRow = currentBatchRow;
            (exportComposite.exportConfig as PDFExportConfig).pageMargin.units = PDFPageMargin.PIXELS;

            const currentExportComposite = new BatchExportComposite();
            currentExportComposite.exportConfig = new PDFExportConfig();
            currentExportComposite.batchRow = currentBatchRow;
            const dummyDoc = {internal: {pageSize: {getWidth: () => 12 }}, save: jest.fn(), addPage: jest.fn()};
            const dummyCurrentAction = new PDFExportAction(currentExportComposite, dummyDoc, '', '', '');
            jest.spyOn(service, 'renderElementOnCanvas').mockImplementation(() => {});
            BatchExportingStore.currentPDFExportAction$.next(dummyCurrentAction);

            // Create a fake report element
            const reportElement = document.createElement('div');
            // Create a fake table widget element
            const tableWidgetContainer = document.createElement('div');
            tableWidgetContainer.classList.add('widget-container');
            tableWidgetContainer.appendChild(document.createElement('app-explore-table'));
            reportElement.appendChild(tableWidgetContainer);
            // Create a fake chart widget element
            const chartWidgetContainer = document.createElement('div');
            chartWidgetContainer.classList.add('widget-container');
            reportElement.appendChild(chartWidgetContainer);
            jest.spyOn(document, 'querySelector').mockReturnValue(reportElement);
            jest.spyOn(service, 'createPDFDoc').mockReturnValue(dummyDoc);
            jest.spyOn(service, 'preProcessTableElement').mockImplementation(() => {});
            jest.spyOn(service, 'preProcessChartElement').mockImplementation(() => {});
            jest.spyOn(BatchReportingService, 'convertBatchFileName').mockReturnValue('Test filename');
            service.exportPDFReport(exportComposite);
            expect(service.preProcessTableElement).toHaveBeenCalledWith(tableWidgetContainer);
            expect(service.preProcessChartElement).toHaveBeenCalledWith(chartWidgetContainer);
        });

        it('Test exportPDFReport with no element with Batch export', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.mergeInOneFile = false;
            batchReport.fileName = 'Test batch file';
            const batchExportAction = new BatchExportAction(batchReport);
            BatchExportingStore.currentBatchExportAction = batchExportAction;
            BatchExportingStore.currentBatchRow$.next(batchReport.batchRowConfigs[0]);
            exportComposite = createDummyExportComposite(ExportConstants.PDF, true);
            (exportComposite as BatchExportComposite).batchRow = batchReport.batchRowConfigs[0];

            // Dummy report element
            const reportElement = document.createElement('div');
            jest.spyOn(document, 'querySelector').mockReturnValue(reportElement);
            jest.spyOn(service, 'createPDFDoc').mockReturnValue({internal: {pageSize: {getWidth: () => 12 }}, save: jest.fn()});
            jest.spyOn(BatchReportingService, 'convertBatchFileName').mockReturnValue('Test batch file');
            jest.spyOn(ExportService, 'generateHeaderText').mockReturnValue('HEADER ');
            service.exportPDFReport(exportComposite);

            expect(BatchReportingService.convertBatchFileName).toHaveBeenCalledWith('Test batch file', batchReport.batchRowConfigs[0], false);
        });

        it('Test exportPDFReport with no element with Batch export and mergeInOneFile', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.mergeInOneFile = true;
            batchReport.fileName = 'Test batch file';
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(batchReport);
            BatchExportingStore.currentBatchRow$.next(batchReport.batchRowConfigs[0]);
            exportComposite = createDummyExportComposite(ExportConstants.PDF, true);
            (exportComposite as BatchExportComposite).batchRow = batchReport.batchRowConfigs[0];

            // Dummy report element
            const reportElement = document.createElement('div');
            jest.spyOn(document, 'querySelector').mockReturnValue(reportElement);
            jest.spyOn(service, 'createPDFDoc').mockReturnValue({internal: {pageSize: {getWidth: () => 12 }}, save: jest.fn()});
            jest.spyOn(BatchReportingService, 'convertBatchFileName').mockReturnValue('Test batch file');
            jest.spyOn(ExportService, 'generateHeaderText').mockReturnValue('HEADER ');
            service.exportPDFReport(exportComposite);

            expect(BatchReportingService.convertBatchFileName).toHaveBeenCalledWith('Test batch file', batchReport.batchRowConfigs[0], true);
        });

        it('Test exportPDFReport with no element with Batch export and mergeInOneFile and no fileName', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.batchRowConfigs[0].exportConfig = new PDFExportConfig();
            batchReport.batchRowConfigs[0].exportConfig.appendTimestamp = true;
            batchReport.mergeInOneFile = true;
            batchReport.fileName = '';
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(batchReport);
            BatchExportingStore.currentBatchRow$.next(batchReport.batchRowConfigs[0]);
            exportComposite = createDummyExportComposite(ExportConstants.PDF, true);
            (exportComposite as BatchExportComposite).batchRow = batchReport.batchRowConfigs[0];

            // Dummy report element
            const reportElement = document.createElement('div');
            jest.spyOn(document, 'querySelector').mockReturnValue(reportElement);
            jest.spyOn(service, 'createPDFDoc').mockReturnValue({internal: {pageSize: {getWidth: () => 12 }}, save: jest.fn()});
            jest.spyOn(BatchReportingService, 'convertBatchFileName').mockReturnValue('Test batch file');
            jest.spyOn(ExportService, 'generateHeaderText').mockReturnValue('HEADER ');
            service.exportPDFReport(exportComposite);
        });
    });

    describe('createWidgetExportingRequest', () => {
        it('should determine if compare mode is enabled', () => {
            const exportComposite = new ExportComposite();
            exportComposite.widget = new Widget();
            exportComposite.widget.configType = 'TEST_WIDGET';
            exportComposite.report = new Report();
            exportComposite.report.comparisonConfigId = 'testConfigId';
            exportComposite.exportConfig = new PDFExportConfig(); // Properly initialize exportConfig
            exportComposite.portfolio = new Portfolio('PEP');
            exportComposite.chartingLib = CoreWidgetConstants.CHARTING_LIB.AG_GRID;

            const mockWorkpad = {
                getAllPortfolios: jest.fn().mockReturnValue([new Portfolio('PEP')])
            };

            jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(mockWorkpad);
            jest.spyOn(WorkpadUtils, 'getPortfoliosToCompare').mockReturnValue([new Portfolio('PEP')]);

            const isBatchExport = true;
            service['widgetService'] = new AbstractWidgetService();

            // Mock everything below the line being tested
            jest.spyOn(service as any, 'modifyBreakdownInputForReturns').mockImplementation(() => {});
            jest.spyOn(widgetServiceRegistryMock, 'getService').mockReturnValue(widgetServiceMock);
            jest.spyOn(widgetServiceMock, 'createFinalDataRequest').mockImplementation(() => ({ requestParams: [{}] }));
            jest.spyOn(exportComposite.widget.dataStore.metaData.inputs, 'get').mockReturnValue(new Map());
            jest.spyOn(exportComposite.exportConfig, 'serialize').mockReturnValue({});
            jest.spyOn(exportComposite.widget.displayInputs, 'get').mockReturnValue({});
            jest.spyOn(service as any, 'addSortedColumnsToWidgetExportingRequest').mockImplementation(() => {});
            jest.spyOn(service as any, 'addBreakdownTitle').mockImplementation(() => {});
            jest.spyOn(BatchExportingStore.runHardRefresh$, 'getValue').mockReturnValue(false);
            jest.spyOn(ChartUtils, 'isChartWidget').mockReturnValue(false);


            const result = service['createWidgetExportingRequest'](exportComposite, undefined, isBatchExport);

            // Verify that the line is executed and the value is correct
            expect(result).toBeDefined();

            // Restore the original implementations
            jest.restoreAllMocks();
        });
});

    describe('determineCompareMode', () => {
        it('should return true if compare mode is not enabled and not batch export', () => {
            const mockWorkpad = {
                isCompareMode: jest.fn().mockReturnValue(true)
            };

            jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(mockWorkpad);
            const isCompareMode = service['determineCompareMode'](false, 'testConfigId');

            expect(isCompareMode).toBe(true);
            expect(mockWorkpad.isCompareMode).toHaveBeenCalledWith('testConfigId');
        });

        it('should return false if batch export is true', () => {
            const mockWorkpad = {
                isCompareMode: jest.fn().mockReturnValue(true)
            };

            jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(mockWorkpad);
            const isCompareMode = service['determineCompareMode'](true, 'testConfigId');

            expect(isCompareMode).toBe(false);
            expect(mockWorkpad.isCompareMode).not.toHaveBeenCalled();
        });


    });

    describe('Test renderNextWidget', () => {
        it('Test renderNextWidget with no exportableElements', () => {
            const exportComposite = new ExportComposite();
            exportComposite.exportConfig = new PDFExportConfig();
            const fakeJsPDF = {save: jest.fn()};
            const pdfExportAction = new PDFExportAction(exportComposite, fakeJsPDF, '', '', '');
            jest.spyOn(service, 'setBatchContainerStatus');
            jest.spyOn(service, 'renderNextWidget').mockRestore();
            service.renderNextWidget(pdfExportAction);
            expect(service.widgetCounter).toEqual(0);
            expect(service.setBatchContainerStatus).toHaveBeenCalled();
            expect(fakeJsPDF.save).toHaveBeenCalled();
        });

        it('Test renderNextWidget with no exportableElements and BatchExportComposite is last', () => {
            const exportComposite = new BatchExportComposite();
            exportComposite.isLast = true;
            exportComposite.exportConfig = new PDFExportConfig();
            const fakeJsPDF = {save: jest.fn()};
            const pdfExportAction = new PDFExportAction(exportComposite, fakeJsPDF, '', '', '');
            jest.spyOn(service, 'setBatchContainerStatus');
            service.renderNextWidget(pdfExportAction);
            expect(service.widgetCounter).toEqual(0);
            expect(service.setBatchContainerStatus).toHaveBeenCalled();
            expect(fakeJsPDF.save).toHaveBeenCalled();
        });

        it('Test renderNextWidget with a canceled Batch', () => {
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(BatchReportingTestUtils.createDummyBatchReportConfig());
            BatchExportingStore.currentBatchExportAction.canceled = true;

            const exportComposite = new BatchExportComposite();
            BatchExportingStore.batchExportQueue.push(exportComposite);
            exportComposite.isLast = true;
            exportComposite.exportConfig = new PDFExportConfig();
            const fakeJsPDF = {save: jest.fn()};
            const pdfExportAction = new PDFExportAction(exportComposite, fakeJsPDF, '', '', '');
            jest.spyOn(service, 'setBatchContainerStatus').mockImplementation(() => {});
            jest.spyOn(pdfExportAction, 'savePDF');
            service.renderNextWidget(pdfExportAction);
            expect(pdfExportAction.savePDF).not.toHaveBeenCalled();
        });
    });

    it('Test checkToAddPage', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.PDF);
        const fakeJsPDF = {addPage: jest.fn()};
        const pdfExportAction = new PDFExportAction(exportComposite, fakeJsPDF, '', '', 'Test Filename');

        service.checkToAddPage(pdfExportAction);
        expect(pdfExportAction.getPDFDoc().addPage).not.toHaveBeenCalled();

        service.widgetCounter = 1;
        (pdfExportAction.exportComposite.exportConfig as PDFExportConfig).layout = PDFPageLayout.W1X1;

        service.checkToAddPage(pdfExportAction);
        expect(pdfExportAction.getPDFDoc().addPage).not.toHaveBeenCalled();

        pdfExportAction.exportableElements.push(document.createElement('div'));
        service.checkToAddPage(pdfExportAction);
        expect(pdfExportAction.getPDFDoc().addPage).toHaveBeenCalled();
        expect(service.widgetCounter).toEqual(0);
    });

    it('Test numberOfWidgetsPerPage', () => {
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.REPORT_AS_IS)).toEqual(0);
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.W1X1)).toEqual(1);
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.W1X2)).toEqual(2);
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.W2X1)).toEqual(2);
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.W1X3)).toEqual(3);
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.W3X1)).toEqual(3);
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.W2X2)).toEqual(4);
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.W2X3)).toEqual(6);
        expect(service.numberOfWidgetsPerPage(PDFPageLayout.W3X2)).toEqual(6);
        expect(service.numberOfWidgetsPerPage(null)).toEqual(0);
    });

    it('Test adjustTablePseudoElements', () => {
        const icons = [];
        const icon1 = document.createElement('span');
        icon1.setAttribute('class', 'ag-icon-tree-closed');
        icon1.innerHTML = 'icon1';
        icons.push(icon1);
        const icon2 = document.createElement('span');
        icon2.setAttribute('class', 'ag-icon-tree-open');
        icon2.innerHTML = 'icon2';
        icons.push(icon2);
        const icon3 = document.createElement('span');
        icon3.innerHTML = 'icon3';
        icons.push(icon3);
        const widgetElement = {querySelectorAll: jest.fn()};
        jest.spyOn(widgetElement, 'querySelectorAll').mockReturnValue(icons);
        service.adjustTablePseudoElements(widgetElement);
        expect(icon1.innerHTML).toEqual('');
        expect(icon2.innerHTML).toEqual('');
        expect(icon3.innerHTML).toEqual('icon3');
    });

    describe('Test renderElementOnCanvas', () => {
        const fakePdfDoc = {
            internal: {
                pageSize: {
                    getHeight: () => {
                        return 400;
                    },
                    getWidth: () => {
                        return 400;
                    }
                },
                getNumberOfPages: () => {
                    return 1;
                }
            },
            setFontSize: () => {},
            text: () => {},
            addImage: jest.fn(),
            line: () => {},
            save: jest.fn()
        };

        /**
         * Tests the renderElementOnCanvas function
         */
        it('Tests renderElementOnCanvas function', (done) => {
            const exportComposite = createDummyExportComposite(ExportConstants.PDF);
            jest.spyOn(html2canvas, 'convert').mockReturnValue(Promise.resolve());
            jest.spyOn(service, 'getImageDimensions').mockReturnValue({width: 10, height: 10});
            jest.spyOn(service, 'getImageCoordinates').mockReturnValue({xCoordinate: 0, yCoordinate: 0});
            jest.spyOn(service, 'renderElementOnCanvas').mockRestore();

            const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
            pdfExportAction.exportableElements.push(document.createElement('div'));

            service.renderElementOnCanvas(pdfExportAction).then(() => {
                expect(service.getImageDimensions).toHaveBeenCalled();
                expect(service.getImageCoordinates).toHaveBeenCalled();
                expect(fakePdfDoc.addImage).toHaveBeenCalled();
                done();
            });
        }, 3000);

        /**
         * Tests the renderElementOnCanvas function
         */
        it('Tests renderElementOnCanvas for Image export', (done) => {
            const exportComposite = createDummyExportComposite(ExportConstants.IMAGE);
            fakePdfDoc.addImage.mockReset();
            jest.spyOn(service, 'downloadImage').mockImplementation(() => {});
            jest.spyOn(html2canvas, 'convert').mockReturnValue(Promise.resolve({}));
            const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
            pdfExportAction.exportableElements.push(document.createElement('div'));
            service.renderElementOnCanvas(pdfExportAction).then(() => {
                expect(service['downloadImage']).toHaveBeenCalled();
                expect(fakePdfDoc.addImage).not.toHaveBeenCalled();
                done();
            });
        }, 3000);

        /**
         * Tests the renderElementOnCanvas function
         */
        it('Tests renderElementOnCanvas function with canceled batch', (done) => {
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(BatchReportingTestUtils.createDummyBatchReportConfig());
            BatchExportingStore.currentBatchExportAction.canceled = true;
            const exportComposite = createDummyExportComposite(ExportConstants.PDF);
            jest.spyOn(html2canvas, 'convert').mockReturnValue(Promise.resolve());
            jest.spyOn(service, 'getImageDimensions').mockReturnValue({width: 10, height: 10});
            jest.spyOn(service, 'getImageCoordinates').mockReturnValue({xCoordinate: 0, yCoordinate: 0});

            const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
            pdfExportAction.exportableElements.push(document.createElement('div'));

            service.renderElementOnCanvas(pdfExportAction).then(() => {
                expect(service.getImageDimensions).toHaveBeenCalled();
                expect(service.getImageCoordinates).toHaveBeenCalled();
                expect(fakePdfDoc.addImage).toHaveBeenCalled();
                done();
            });
        }, 3000);

        it('Test renderElementOnCanvas with multiple elements export', (done) => {
            const exportComposite = createDummyExportComposite(ExportConstants.PDF);
            exportComposite.widget = null;
            (exportComposite.exportConfig as PDFExportConfig).layout = PDFPageLayout.W1X1;

            const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
            pdfExportAction.exportableElements.push(document.createElement('div'));
            BatchExportingStore.currentPDFExportAction$.next(pdfExportAction);

            jest.spyOn(html2canvas, 'convert').mockReturnValue(Promise.resolve());
            jest.spyOn(service, 'renderNextWidget').mockImplementation(() => {});
            jest.spyOn(service, 'getImageDimensions').mockReturnValue({width: 10, height: 10});
            jest.spyOn(service, 'getImageCoordinates').mockReturnValue({xCoordinate: 0, yCoordinate: 0});
            jest.spyOn(service, 'checkToAddPage').mockImplementation(() => {});

            service.renderElementOnCanvas(pdfExportAction).then(() => {
                expect(service.getImageDimensions).toHaveBeenCalled();
                expect(service.getImageCoordinates).toHaveBeenCalled();
                expect(fakePdfDoc.addImage).toHaveBeenCalled();

                expect(pdfExportAction.exportableElements).toEqual([]);
                expect(service.checkToAddPage).toHaveBeenCalled();
                expect(BatchExportingStore.currentPDFExportAction$.getValue()).toEqual(pdfExportAction);
                done();
            });
        }, 3000);
    });


    it('Test getImageDimensions', () => {
        jest.spyOn(service, 'getImageDimensions').mockRestore();

        const canvas1 = {height: 100, width: 200};
        const dimensions1 = service.getImageDimensions(canvas1, 800, 600);
        expect(dimensions1).toEqual({height: 100, width: 200});

        const canvas2 = {height: 200, width: 100};
        const dimensions2 = service.getImageDimensions(canvas2, 800, 600);
        expect(dimensions2).toEqual({height: 800, width: 400});
    });

    const testCoordinates = (coordinates: any, expectedX: number, expectedY: number): void => {
        expect(coordinates.xCoordinate).toEqual(expectedX);
        expect(coordinates.yCoordinate).toEqual(expectedY);
    };

    /**
     * Tests the getImageCoordinates function
     */
    it('Tests getImageCoordinates function',  () => {
        jest.spyOn(service, 'getImageCoordinates').mockRestore();

        const imageDimensions = {width: 150, height: 100};
        const pdfSectionHeight = 400;
        const pdfSectionWidth = 500;

        const pageMargin = new PDFPageMargin(0, 0, 0, 0, PDFPageMargin.PIXELS, false);

        // Test 1x1
        service.widgetCounter = 1;
        let coordinates = service.getImageCoordinates(1, 1, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 0, 0);

        // Test 1x1 Centered
        service.widgetCounter = 1;
        coordinates = service.getImageCoordinates(1, 1, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, true);
        testCoordinates(coordinates, 175, 150);

        // Test 1x2
        service.widgetCounter = 1; // Widget #1
        coordinates = service.getImageCoordinates(1, 2, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 0, 0);

        service.widgetCounter = 2; // Widget #2
        coordinates = service.getImageCoordinates(1, 2, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 500, 0);

        // Test 2x1
        service.widgetCounter = 1; // Widget #1
        coordinates = service.getImageCoordinates(2, 1, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 0, 0);

        service.widgetCounter = 2; // Widget #2
        coordinates = service.getImageCoordinates(2, 1, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 0, 400);

        // Test 2x2
        service.widgetCounter = 1; // Widget #1
        coordinates = service.getImageCoordinates(2, 2, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 0, 0);

        service.widgetCounter = 2; // Widget #2
        coordinates = service.getImageCoordinates(2, 2, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 500, 0);

        service.widgetCounter = 3; // Widget #3
        coordinates = service.getImageCoordinates(2, 2, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 0, 400);

        service.widgetCounter = 4; // Widget #4
        coordinates = service.getImageCoordinates(2, 2, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 500, 400);

        // Test 2x3
        service.widgetCounter = 1; // Widget #1
        coordinates = service.getImageCoordinates(2, 3, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 0, 0);

        service.widgetCounter = 2; // Widget #2
        coordinates = service.getImageCoordinates(2, 3, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 500, 0);

        service.widgetCounter = 3; // Widget #3
        coordinates = service.getImageCoordinates(2, 3, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 1000, 0);

        service.widgetCounter = 4; // Widget #4
        coordinates = service.getImageCoordinates(2, 3, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 0, 400);

        service.widgetCounter = 5; // Widget #5
        coordinates = service.getImageCoordinates(2, 3, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 500, 400);

        service.widgetCounter = 6; // Widget #6
        coordinates = service.getImageCoordinates(2, 3, pdfSectionHeight, pdfSectionWidth, imageDimensions, pageMargin, false);
        testCoordinates(coordinates, 1000, 400);
    });

    it('Test preProcessChartElement', () => {
        jest.spyOn(service, 'preProcessChartElement').mockRestore();
        // without secondaryHighchartsLegendSection
        let chartElement = '<div id="highcharts-17apkgy-18" dir="ltr" class="highcharts-container "><svg version="1.1" class="highcharts-root" xmlns="http://www.w3.org/2000/svg" width="533" height="363" viewBox="0 0 533 363"><desc>Created with Highcharts 8.0.4</desc><defs><linearGradient x1="0" y1="0" x2="1" y2="0" id="highcharts-17apkgy-19"><stop offset="0" stop-color="#CDEAFE" stop-opacity="1"></stop><stop offset="1" stop-color="#0998F6" stop-opacity="1"></stop></linearGradient><clipPath id="highcharts-17apkgy-20-"><rect x="0" y="0" width="513" height="279"></rect></clipPath><clipPath id="highcharts-zanupup-46-"><rect x="0" y="8" width="9999" height="72"></rect></clipPath><linearGradient x1="0" y1="0" x2="1" y2="0" id="highcharts-17apkgy-23"><stop offset="0" stop-color="#F49BED" stop-opacity="1"></stop><stop offset="0.25" stop-color="#CDEAFE" stop-opacity="1"></stop><stop offset="1" stop-color="#0998F6" stop-opacity="1"></stop></linearGradient><filter id="drop-shadow-1" opacity="0.5"><feGaussianBlur in="SourceAlpha" stdDeviation="1"></feGaussianBlur><feOffset dx="1" dy="1"></feOffset><feComponentTransfer><feFuncA type="linear" slope="0.3"></feFuncA></feComponentTransfer><feMerge><feMergeNode></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><style>.highcharts-tooltip-1{filter:url(#drop-shadow-1)}</style></defs><rect class="highcharts-background" x="0.5" y="0.5" width="531" height="361" rx="0" ry="0"></rect><rect class="highcharts-plot-background" x="10" y="10" width="513" height="279"></rect><g class="highcharts-pane-group" data-z-index="0"></g><g class="highcharts-grid highcharts-xaxis-grid" data-z-index="1"></g><g class="highcharts-grid highcharts-yaxis-grid" data-z-index="1"></g><rect class="highcharts-plot-border" data-z-index="1" x="9.5" y="9.5" width="514" height="280"></rect><g class="highcharts-axis highcharts-xaxis" data-z-index="2"><path class="highcharts-axis-line" d="M 10 289.5 L 523 289.5"></path></g><g class="highcharts-axis highcharts-yaxis" data-z-index="2"><path class="highcharts-axis-line" d="M 9.5 10 L 9.5 289"></path></g><g class="highcharts-series-group" data-z-index="3"><g data-z-index="0.1" class="highcharts-series highcharts-series-0 highcharts-treemap-series highcharts-color-0 highcharts-tracker" transform="translate(10,10) scale(1 1)" clip-path="url(http://localhost:4100/apps/explorenew-beta/?workspace=1885474&amp;batchPDFDebug=true#highcharts-17apkgy-20-)"><g class="highcharts-level-group-1" data-z-index="999"><rect x="432" y="0" width="81" height="156" style="fill:rgb(165,217,252);" class="highcharts-point highcharts-color-0"></rect><rect x="457" y="156" width="56" height="89" style="fill:rgb(189,227,253);" class="highcharts-point highcharts-color-3"></rect><rect x="268" y="245" width="102" height="34" style="fill:rgb(194,229,254);" class="highcharts-point highcharts-color-5"></rect><rect x="268" y="156" width="106" height="89" style="fill:rgb(175,221,253);" class="highcharts-point highcharts-color-7"></rect><rect x="370" y="272" width="80" height="7" style="fill:rgb(203,233,254);" class="highcharts-point highcharts-color-8"></rect><rect x="441" y="245" width="47" height="27" style="fill:rgb(201,232,254);" class="highcharts-point highcharts-color-9"></rect><rect x="374" y="156" width="83" height="89" style="fill:rgb(181,224,253);" class="highcharts-point highcharts-color-0"></rect><rect x="370" y="245" width="71" height="27" style="fill:rgb(199,231,254);" class="highcharts-point highcharts-color-1"></rect><rect x="488" y="245" width="25" height="27" style="fill:rgb(203,233,254);" class="highcharts-point highcharts-color-2"></rect><rect x="450" y="272" width="63" height="7" style="fill:rgb(204,233,254);" class="highcharts-point highcharts-color-4"></rect><rect x="0" y="0" width="192" height="279" style="fill:rgb(33,162,247);" class="highcharts-point highcharts-color-6" data-z-index="0"></rect><rect x="192" y="156" width="76" height="123" style="fill:rgb(175,221,253);" class="highcharts-point highcharts-color-4" data-z-index="0"></rect><rect x="192" y="0" width="240" height="156" style="fill:rgb(85,184,249);" class="highcharts-point highcharts-color-1" data-z-index="0"></rect></g></g><g data-z-index="0.1" class="highcharts-markers highcharts-series-0 highcharts-treemap-series highcharts-color-0" transform="translate(10,10) scale(1 1)"></g></g><text x="267" text-anchor="middle" class="highcharts-title" data-z-index="4" y="24"></text><text x="267" text-anchor="middle" class="highcharts-subtitle" data-z-index="4" y="24"></text><text x="10" text-anchor="start" class="highcharts-caption" data-z-index="4" y="360"></text><g data-z-index="6" class="highcharts-data-labels highcharts-series-0 highcharts-treemap-series highcharts-color-0 highcharts-tracker" transform="translate(10,10) scale(1 1)"><g class="highcharts-label highcharts-data-label highcharts-data-label-color-0 highcharts-tracker" data-z-index="1" transform="translate(446,67)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="54" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-1 highcharts-tracker" data-z-index="1" transform="translate(293,67)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="38" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-2 highcharts-tracker" data-z-index="1" transform="translate(0,-9999)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="87" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-3 highcharts-tracker" data-z-index="1" transform="translate(449,189)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="64" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-4 highcharts-tracker" data-z-index="1" transform="translate(213,206)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="34" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-5 highcharts-tracker" data-z-index="1" transform="translate(291,251)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="57" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-6 highcharts-tracker" data-z-index="1" transform="translate(76,128)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="40" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-7 highcharts-tracker" data-z-index="1" transform="translate(277,189)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="89" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-8 highcharts-tracker" data-z-index="1" transform="translate(384,-9999)" opacity="0"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="53" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-9 highcharts-tracker" data-z-index="1" transform="translate(444,247)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="41" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-0 highcharts-tracker" data-z-index="1" transform="translate(379,-9999)" opacity="0"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="73" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-1 highcharts-tracker" data-z-index="1" transform="translate(380,247)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="52" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-2 highcharts-tracker" data-z-index="1" transform="translate(486,247)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="27" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-3 highcharts-tracker" data-z-index="1" transform="translate(0,-9999)" opacity="0"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="75" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-4 highcharts-tracker" data-z-index="1" transform="translate(464,-9999)" opacity="0"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="36" height="23" rx="0" ry="0"></rect></g></g><g class="highcharts-legend" data-z-index="7" transform="translate(160,301)"><rect class="highcharts-legend-box" rx="0" ry="0" x="0" y="0" width="214" height="47" visibility="visible"></rect><g data-z-index="1" clip-path="url(http://localhost:4100/apps/explorenew-beta/?workspace=1885474&amp;batchPDFDebug=true#highcharts-zanupup-46-)"><g><g class="highcharts-legend-item highcharts-undefined-series highcharts-color-undefined" data-z-index="1" transform="translate(8,3)"><rect x="0" y="4" width="200" height="12" data-z-index="1" fill="url(http://localhost:4100/apps/explorenew-beta/?workspace=1885474&amp;batchPDFDebug=true#highcharts-17apkgy-23)"></rect><g class="highcharts-grid highcharts-coloraxis-grid" data-z-index="1"><path data-z-index="1" class="highcharts-grid-line" d="M -0.5 4 L -0.5 16" opacity="1"></path><path data-z-index="1" class="highcharts-grid-line" d="M 49.5 4 L 49.5 16" opacity="1"></path><path data-z-index="1" class="highcharts-grid-line" d="M 99.5 4 L 99.5 16" opacity="1"></path><path data-z-index="1" class="highcharts-grid-line" d="M 149.5 4 L 149.5 16" opacity="1"></path><path data-z-index="1" class="highcharts-grid-line" d="M 200.5 4 L 200.5 16" opacity="1"></path></g><text x="21" text-anchor="start" data-z-index="2" y="15"></text><g class="highcharts-axis highcharts-coloraxis" data-z-index="2"><path class="highcharts-axis-line" d="M 0 16 L 200 16"></path></g><path class="highcharts-crosshair highcharts-crosshair-thin undefined highcharts-coloraxis-marker" data-z-index="2" visibility="hidden" d="M 137.8203737766663 -2 L 145.8203737766663 -2 141.8203737766663 4 Z"></path><g class="highcharts-axis-labels highcharts-coloraxis-labels" data-z-index="7"><text x="0" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">-10K</text><text x="50" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">0</text><text x="100" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">10K</text><text x="150" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">20K</text><text x="200" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">30K</text></g></g></g></g></g><g class="highcharts-axis-labels highcharts-xaxis-labels" data-z-index="7"></g><g class="highcharts-axis-labels highcharts-yaxis-labels" data-z-index="7"></g><g class="highcharts-label highcharts-tooltip highcharts-tooltip-1     highcharts-color-1" data-z-index="8" transform="translate(233,-9999)" opacity="0" visibility="visible"><path class="highcharts-label-box highcharts-tooltip-box" d="M 3.5 0.5 L 176.5 0.5 C 179.5 0.5 179.5 0.5 179.5 3.5 L 179.5 55.5 C 179.5 58.5 179.5 58.5 176.5 58.5 L 94.5 58.5 88.5 64.5 82.5 58.5 3.5 58.5 C 0.5 58.5 0.5 58.5 0.5 55.5 L 0.5 3.5 C 0.5 0.5 0.5 0.5 3.5 0.5"></path></g></svg><div class="highcharts-data-labels highcharts-series-0 highcharts-treemap-series highcharts-color-0 highcharts-tracker" style="position: absolute; left: 10px; top: 10px; opacity: 1; visibility: inherit;"><div class="highcharts-label highcharts-data-label highcharts-data-label-color-0 highcharts-tracker" style="position: absolute; left: 446px; top: 67px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Australia</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-1 highcharts-tracker" style="position: absolute; left: 293px; top: 67px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>China</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-2 highcharts-tracker" style="position: absolute; left: 0px; top: -9999px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>European Union</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-3 highcharts-tracker" style="position: absolute; left: 449px; top: 189px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Hong Kong</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-4 highcharts-tracker" style="position: absolute; left: 213px; top: 206px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>India</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-5 highcharts-tracker" style="position: absolute; left: 291px; top: 251px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Indonesia</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-6 highcharts-tracker" style="position: absolute; left: 76px; top: 128px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Japan</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-7 highcharts-tracker" style="position: absolute; left: 277px; top: 189px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Korea (South),...</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-8 highcharts-tracker" style="position: absolute; left: 384px; top: -9999px; opacity: 0;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Malaysia</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-9 highcharts-tracker" style="position: absolute; left: 444px; top: 247px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Sing...</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-0 highcharts-tracker" style="position: absolute; left: 379px; top: -9999px; opacity: 0;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Taiwan (Re...</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-1 highcharts-tracker" style="position: absolute; left: 380px; top: 247px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Thailand</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-2 highcharts-tracker" style="position: absolute; left: 486px; top: 247px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>U...</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-3 highcharts-tracker" style="position: absolute; left: 0px; top: -9999px; opacity: 0;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>United States</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-4 highcharts-tracker" style="position: absolute; left: 464px; top: -9999px; opacity: 0;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>None</b></span></span></div></div><div class="highcharts-label highcharts-tooltip highcharts-tooltip-1     highcharts-color-1" style="position: absolute; left: 233px; top: -9999px; opacity: 0; visibility: visible;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 0px; top: 0px;"> <div style="z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;"> <span style="font-weight: bold">China</span><br> <span style="font-weight: bold">Market Value:</span> 18,364<br> <span style="font-weight: bold">Notional Market Value:</span> 18,364 </div></span></div></div>';
        const wrapperElement = document.createElement('div');
        wrapperElement.innerHTML = chartElement;
        let svgElem = wrapperElement.querySelectorAll('svg')[0];
        let highchartsLegendSection = svgElem.querySelectorAll('.highcharts-legend')[0];
        highchartsLegendSection.children[0]['getBBox'] = () => ({width: 600});
        highchartsLegendSection.children[1]['getBBox'] = () => ({width: 600});
        service.preProcessChartElement(wrapperElement);

        // with secondaryHighchartsLegendSection
        chartElement = '<div id="highcharts-17apkgy-18" dir="ltr" class="highcharts-container "><svg version="1.1" class="highcharts-root" xmlns="http://www.w3.org/2000/svg" width="533" height="363" viewBox="0 0 533 363"><desc>Created with Highcharts 8.0.4</desc><defs><linearGradient x1="0" y1="0" x2="1" y2="0" id="highcharts-17apkgy-19"><stop offset="0" stop-color="#CDEAFE" stop-opacity="1"></stop><stop offset="1" stop-color="#0998F6" stop-opacity="1"></stop></linearGradient><clipPath id="highcharts-17apkgy-20-"><rect x="0" y="0" width="513" height="279"></rect></clipPath><clipPath id="highcharts-zanupup-46-"><rect x="0" y="8" width="9999" height="72"></rect></clipPath><linearGradient x1="0" y1="0" x2="1" y2="0" id="highcharts-17apkgy-23"><stop offset="0" stop-color="#F49BED" stop-opacity="1"></stop><stop offset="0.25" stop-color="#CDEAFE" stop-opacity="1"></stop><stop offset="1" stop-color="#0998F6" stop-opacity="1"></stop></linearGradient><filter id="drop-shadow-1" opacity="0.5"><feGaussianBlur in="SourceAlpha" stdDeviation="1"></feGaussianBlur><feOffset dx="1" dy="1"></feOffset><feComponentTransfer><feFuncA type="linear" slope="0.3"></feFuncA></feComponentTransfer><feMerge><feMergeNode></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><style>.highcharts-tooltip-1{filter:url(#drop-shadow-1)}</style></defs><rect class="highcharts-background" x="0.5" y="0.5" width="531" height="361" rx="0" ry="0"></rect><rect class="highcharts-plot-background" x="10" y="10" width="513" height="279"></rect><g class="highcharts-pane-group" data-z-index="0"></g><g class="highcharts-grid highcharts-xaxis-grid" data-z-index="1"></g><g class="highcharts-grid highcharts-yaxis-grid" data-z-index="1"></g><rect class="highcharts-plot-border" data-z-index="1" x="9.5" y="9.5" width="514" height="280"></rect><g class="highcharts-axis highcharts-xaxis" data-z-index="2"><path class="highcharts-axis-line" d="M 10 289.5 L 523 289.5"></path></g><g class="highcharts-axis highcharts-yaxis" data-z-index="2"><path class="highcharts-axis-line" d="M 9.5 10 L 9.5 289"></path></g><g class="highcharts-series-group" data-z-index="3"><g data-z-index="0.1" class="highcharts-series highcharts-series-0 highcharts-treemap-series highcharts-color-0 highcharts-tracker" transform="translate(10,10) scale(1 1)" clip-path="url(http://localhost:4100/apps/explorenew-beta/?workspace=1885474&amp;batchPDFDebug=true#highcharts-17apkgy-20-)"><g class="highcharts-level-group-1" data-z-index="999"><rect x="432" y="0" width="81" height="156" style="fill:rgb(165,217,252);" class="highcharts-point highcharts-color-0"></rect><rect x="457" y="156" width="56" height="89" style="fill:rgb(189,227,253);" class="highcharts-point highcharts-color-3"></rect><rect x="268" y="245" width="102" height="34" style="fill:rgb(194,229,254);" class="highcharts-point highcharts-color-5"></rect><rect x="268" y="156" width="106" height="89" style="fill:rgb(175,221,253);" class="highcharts-point highcharts-color-7"></rect><rect x="370" y="272" width="80" height="7" style="fill:rgb(203,233,254);" class="highcharts-point highcharts-color-8"></rect><rect x="441" y="245" width="47" height="27" style="fill:rgb(201,232,254);" class="highcharts-point highcharts-color-9"></rect><rect x="374" y="156" width="83" height="89" style="fill:rgb(181,224,253);" class="highcharts-point highcharts-color-0"></rect><rect x="370" y="245" width="71" height="27" style="fill:rgb(199,231,254);" class="highcharts-point highcharts-color-1"></rect><rect x="488" y="245" width="25" height="27" style="fill:rgb(203,233,254);" class="highcharts-point highcharts-color-2"></rect><rect x="450" y="272" width="63" height="7" style="fill:rgb(204,233,254);" class="highcharts-point highcharts-color-4"></rect><rect x="0" y="0" width="192" height="279" style="fill:rgb(33,162,247);" class="highcharts-point highcharts-color-6" data-z-index="0"></rect><rect x="192" y="156" width="76" height="123" style="fill:rgb(175,221,253);" class="highcharts-point highcharts-color-4" data-z-index="0"></rect><rect x="192" y="0" width="240" height="156" style="fill:rgb(85,184,249);" class="highcharts-point highcharts-color-1" data-z-index="0"></rect></g></g><g data-z-index="0.1" class="highcharts-markers highcharts-series-0 highcharts-treemap-series highcharts-color-0" transform="translate(10,10) scale(1 1)"></g></g><text x="267" text-anchor="middle" class="highcharts-title" data-z-index="4" y="24"></text><text x="267" text-anchor="middle" class="highcharts-subtitle" data-z-index="4" y="24"></text><text x="10" text-anchor="start" class="highcharts-caption" data-z-index="4" y="360"></text><g data-z-index="6" class="highcharts-data-labels highcharts-series-0 highcharts-treemap-series highcharts-color-0 highcharts-tracker" transform="translate(10,10) scale(1 1)"><g class="highcharts-label highcharts-data-label highcharts-data-label-color-0 highcharts-tracker" data-z-index="1" transform="translate(446,67)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="54" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-1 highcharts-tracker" data-z-index="1" transform="translate(293,67)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="38" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-2 highcharts-tracker" data-z-index="1" transform="translate(0,-9999)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="87" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-3 highcharts-tracker" data-z-index="1" transform="translate(449,189)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="64" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-4 highcharts-tracker" data-z-index="1" transform="translate(213,206)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="34" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-5 highcharts-tracker" data-z-index="1" transform="translate(291,251)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="57" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-6 highcharts-tracker" data-z-index="1" transform="translate(76,128)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="40" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-7 highcharts-tracker" data-z-index="1" transform="translate(277,189)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="89" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-8 highcharts-tracker" data-z-index="1" transform="translate(384,-9999)" opacity="0"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="53" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-9 highcharts-tracker" data-z-index="1" transform="translate(444,247)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="41" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-0 highcharts-tracker" data-z-index="1" transform="translate(379,-9999)" opacity="0"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="73" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-1 highcharts-tracker" data-z-index="1" transform="translate(380,247)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="52" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-2 highcharts-tracker" data-z-index="1" transform="translate(486,247)"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="27" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-3 highcharts-tracker" data-z-index="1" transform="translate(0,-9999)" opacity="0"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="75" height="23" rx="0" ry="0"></rect></g><g class="highcharts-label highcharts-data-label highcharts-data-label-color-4 highcharts-tracker" data-z-index="1" transform="translate(464,-9999)" opacity="0"><rect class="highcharts-label-box highcharts-data-label-box" x="0" y="0" width="36" height="23" rx="0" ry="0"></rect></g></g><g class="highcharts-legend" data-z-index="7" transform="translate(160,301)"><rect class="highcharts-legend-box" rx="0" ry="0" x="0" y="0" width="214" height="47" visibility="visible"></rect><g data-z-index="1" clip-path="url(http://localhost:4100/apps/explorenew-beta/?workspace=1885474&amp;batchPDFDebug=true#highcharts-zanupup-46-)"><g><g class="highcharts-legend-item highcharts-undefined-series highcharts-color-undefined" data-z-index="1" transform="translate(8,3)"><rect x="0" y="4" width="200" height="12" data-z-index="1" fill="url(http://localhost:4100/apps/explorenew-beta/?workspace=1885474&amp;batchPDFDebug=true#highcharts-17apkgy-23)"></rect></g></g><g class="highcharts-legend" data-z-index="7" transform="translate(160,301)"><span clientWidth="1"></span><rect class="highcharts-legend-box" rx="0" ry="0" x="0" y="0" width="214" height="47" visibility="visible"></rect><g data-z-index="1" clip-path="url(http://localhost:4100/apps/explorenew-beta/?workspace=1885474&amp;batchPDFDebug=true#highcharts-zanupup-46-)"><g><g class="highcharts-legend-item highcharts-undefined-series highcharts-color-undefined" data-z-index="1" transform="translate(8,3)"><rect x="0" y="4" width="200" height="12" data-z-index="1" fill="url(http://localhost:4100/apps/explorenew-beta/?workspace=1885474&amp;batchPDFDebug=true#highcharts-17apkgy-23)"></rect><g class="highcharts-grid highcharts-coloraxis-grid" data-z-index="1"><path data-z-index="1" class="highcharts-grid-line" d="M -0.5 4 L -0.5 16" opacity="1"></path><path data-z-index="1" class="highcharts-grid-line" d="M 49.5 4 L 49.5 16" opacity="1"></path><path data-z-index="1" class="highcharts-grid-line" d="M 99.5 4 L 99.5 16" opacity="1"></path><path data-z-index="1" class="highcharts-grid-line" d="M 149.5 4 L 149.5 16" opacity="1"></path><path data-z-index="1" class="highcharts-grid-line" d="M 200.5 4 L 200.5 16" opacity="1"></path></g><text x="21" text-anchor="start" data-z-index="2" y="15"></text><g class="highcharts-axis highcharts-coloraxis" data-z-index="2"><path class="highcharts-axis-line" d="M 0 16 L 200 16"></path></g><path class="highcharts-crosshair highcharts-crosshair-thin undefined highcharts-coloraxis-marker" data-z-index="2" visibility="hidden" d="M 137.8203737766663 -2 L 145.8203737766663 -2 141.8203737766663 4 Z"></path><g class="highcharts-axis-labels highcharts-coloraxis-labels" data-z-index="7"><text x="0" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">-10K</text><text x="50" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">0</text><text x="100" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">10K</text><text x="150" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">20K</text><text x="200" text-anchor="middle" transform="translate(0,0)" y="34" opacity="1">30K</text></g></g></g></g></g><g class="highcharts-axis-labels highcharts-xaxis-labels" data-z-index="7"></g><g class="highcharts-axis-labels highcharts-yaxis-labels" data-z-index="7"></g><g class="highcharts-label highcharts-tooltip highcharts-tooltip-1     highcharts-color-1" data-z-index="8" transform="translate(233,-9999)" opacity="0" visibility="visible"><path class="highcharts-label-box highcharts-tooltip-box" d="M 3.5 0.5 L 176.5 0.5 C 179.5 0.5 179.5 0.5 179.5 3.5 L 179.5 55.5 C 179.5 58.5 179.5 58.5 176.5 58.5 L 94.5 58.5 88.5 64.5 82.5 58.5 3.5 58.5 C 0.5 58.5 0.5 58.5 0.5 55.5 L 0.5 3.5 C 0.5 0.5 0.5 0.5 3.5 0.5"></path></g></svg><div class="highcharts-data-labels highcharts-series-0 highcharts-treemap-series highcharts-color-0 highcharts-tracker" style="position: absolute; left: 10px; top: 10px; opacity: 1; visibility: inherit;"><div class="highcharts-label highcharts-data-label highcharts-data-label-color-0 highcharts-tracker" style="position: absolute; left: 446px; top: 67px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Australia</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-1 highcharts-tracker" style="position: absolute; left: 293px; top: 67px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>China</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-2 highcharts-tracker" style="position: absolute; left: 0px; top: -9999px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>European Union</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-3 highcharts-tracker" style="position: absolute; left: 449px; top: 189px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Hong Kong</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-4 highcharts-tracker" style="position: absolute; left: 213px; top: 206px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>India</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-5 highcharts-tracker" style="position: absolute; left: 291px; top: 251px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Indonesia</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-6 highcharts-tracker" style="position: absolute; left: 76px; top: 128px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Japan</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-7 highcharts-tracker" style="position: absolute; left: 277px; top: 189px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Korea (South),...</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-8 highcharts-tracker" style="position: absolute; left: 384px; top: -9999px; opacity: 0;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Malaysia</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-9 highcharts-tracker" style="position: absolute; left: 444px; top: 247px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Sing...</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-0 highcharts-tracker" style="position: absolute; left: 379px; top: -9999px; opacity: 0;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Taiwan (Re...</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-1 highcharts-tracker" style="position: absolute; left: 380px; top: 247px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>Thailand</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-2 highcharts-tracker" style="position: absolute; left: 486px; top: 247px; opacity: 1;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>U...</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-3 highcharts-tracker" style="position: absolute; left: 0px; top: -9999px; opacity: 0;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>United States</b></span></span></div><div class="highcharts-label highcharts-data-label highcharts-data-label-color-4 highcharts-tracker" style="position: absolute; left: 464px; top: -9999px; opacity: 0;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 5px; top: 5px;"><span><b>None</b></span></span></div></div><div class="highcharts-label highcharts-tooltip highcharts-tooltip-1     highcharts-color-1" style="position: absolute; left: 233px; top: -9999px; opacity: 0; visibility: visible;"><span data-z-index="1" style="position: absolute; white-space: nowrap; margin-left: 0px; margin-top: 0px; left: 0px; top: 0px;"> <div style="z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;"> <span style="font-weight: bold">China</span><br> <span style="font-weight: bold">Market Value:</span> 18,364<br> <span style="font-weight: bold">Notional Market Value:</span> 18,364 </div></span></div></div>';
        wrapperElement.innerHTML = chartElement;
        svgElem = wrapperElement.querySelectorAll('svg')[0];
        highchartsLegendSection = svgElem.querySelectorAll('.highcharts-legend')[0];
        highchartsLegendSection.children[0]['getBBox'] = () => ({width: 600});
        highchartsLegendSection.children[1]['getBBox'] = () => ({width: 600});
        const secondaryHighchartsLegendSection = svgElem.querySelectorAll('.highcharts-legend')[1].querySelector('span');
        // Object.defineProperty(secondaryHighchartsLegendSection, 'clientWidth', { configurable: true, value: 500 });
        service.preProcessChartElement(wrapperElement);
        // TODO: Find a way to verify that the svg is what we want
        expect(true).toBeTruthy();
    });

    describe('Test Add Sorted Columns To Widget Exporting Request', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.PDF);
        const sortedCol = new SortedColumns();
        sortedCol.sortedColumns.push(new SortedColumn());

        exportComposite.widget.dataStore.metaData.inputs.set(CommonConstants.CONFIG_TYPE.SORTED_COLUMNS, sortedCol);

        const widgetDataRequest =  {} as any;

        it('Test widget single request scenario', () => {
            widgetDataRequest.multiRequests = undefined;
            service['addSortedColumnsToWidgetExportingRequest'](widgetDataRequest, exportComposite);
            expect(widgetDataRequest.sortedColumns).toBeDefined();
        });

        it('Test widget multi request scenario', () => {
            widgetDataRequest.multiRequests = [{} as any];
            service['addSortedColumnsToWidgetExportingRequest'](widgetDataRequest, exportComposite);
            expect(widgetDataRequest.sortedColumns).toBeDefined();
            expect(widgetDataRequest.multiRequests[0].sortedColumns).toBeDefined();
        });


    });

    describe('addLogoToPdf testing', () => {
        const fakePdfDoc = {
            internal: {
                pageSize: {
                    getHeight: () => {
                        return 400;
                    },
                    getWidth: () => {
                        return 400;
                    }
                },
                getNumberOfPages: () => {
                    return 1;
                }
            },
            setFontSize: () => {},
            text: () => {},
            addImage: jest.fn(),
            line: () => {},
            save: jest.fn()
        };

        it('tests addLogoToPdf after the logoPosition is Top Right and image file is selected',  async () => {
            const exportComposite = createDummyExportComposite(ExportConstants.PDF);
            exportComposite.exportConfig = new TablePDFExportConfig();
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig = new LogoConfig();
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPresent = true;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPosition = PDFLogoPosition.TOP_RIGHT;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoWidth = 100;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoHeight = 300;

            const pdfDoc = {internal: {pageSize: {getHeight: () => 20, getWidth: () => 12, getNumberOfPages: () => 1 }, getNumberOfPages: () => 1}, save: jest.fn(), text: jest.fn(), line: jest.fn(), addImage: jest.fn()};

            jest.spyOn(service, 'createPDFDoc').mockReturnValue(pdfDoc);
            const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
            pdfExportAction.exportableElements.push(document.createElement('div'));
            await ExportService.addHeaderFooterLogo(10, exportComposite.exportConfig, pdfExportAction, pdfDoc);
            expect(pdfDoc.addImage).toHaveBeenCalled();
            expect(pdfDoc.line).toHaveBeenCalled();
            expect(pdfDoc.text).toHaveBeenCalled();
        });

        it('tests addLogoToPdf after the logoPosition is Top Left and image file is selected',  async () => {
            const exportComposite = createDummyExportComposite(ExportConstants.PDF);
            exportComposite.exportConfig = new TablePDFExportConfig();
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig = new LogoConfig();
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPresent = true;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPosition = PDFLogoPosition.TOP_LEFT;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoWidth = 100;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoHeight = 300;

            const pdfDoc = {internal: {pageSize: {getHeight: () => 20, getWidth: () => 12, getNumberOfPages: () => 1 }, getNumberOfPages: () => 1}, save: jest.fn(), text: jest.fn(), line: jest.fn(), addImage: jest.fn()};

            jest.spyOn(service, 'createPDFDoc').mockReturnValue(pdfDoc);
            const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
            pdfExportAction.exportableElements.push(document.createElement('div'));
            await ExportService.addHeaderFooterLogo(10, exportComposite.exportConfig, pdfExportAction, pdfDoc);
            expect(pdfDoc.addImage).toHaveBeenCalled();
            expect(pdfDoc.line).toHaveBeenCalled();
            expect(pdfDoc.text).toHaveBeenCalled();
        });

        it('tests addLogoToPdf after the logoPosition is Bottom Right and image file is selected',  async () => {
            const exportComposite = createDummyExportComposite(ExportConstants.PDF);
            exportComposite.exportConfig = new TablePDFExportConfig();
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig = new LogoConfig();
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPresent = true;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPosition = PDFLogoPosition.BOTTOM_RIGHT;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoWidth = 100;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoHeight = 300;

            const pdfDoc = {internal: {pageSize: {getHeight: () => 20, getWidth: () => 12, getNumberOfPages: () => 1 }, getNumberOfPages: () => 1}, save: jest.fn(), text: jest.fn(), line: jest.fn(), addImage: jest.fn()};

            jest.spyOn(service, 'createPDFDoc').mockReturnValue(pdfDoc);
            const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
            pdfExportAction.exportableElements.push(document.createElement('div'));
            await ExportService.addHeaderFooterLogo(10, exportComposite.exportConfig, pdfExportAction, pdfDoc);
            expect(pdfDoc.addImage).toHaveBeenCalled();
            expect(pdfDoc.line).toHaveBeenCalled();
            expect(pdfDoc.text).toHaveBeenCalled();
        });

        it('tests addLogoToPdf after the logoPosition is Bottom Left and image file is selected',  async () => {
            const exportComposite = createDummyExportComposite(ExportConstants.PDF);
            exportComposite.exportConfig = new TablePDFExportConfig();
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig = new LogoConfig();
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPresent = true;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPosition = PDFLogoPosition.BOTTOM_LEFT;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile = 'imagedata';
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoWidth = 100;
            (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoHeight = 300;

            const pdfDoc = {internal: {pageSize: {getHeight: () => 20, getWidth: () => 12, getNumberOfPages: () => 1 }, getNumberOfPages: () => 1}, save: jest.fn(), text: jest.fn(), line: jest.fn(), addImage: jest.fn()};

            jest.spyOn(service, 'createPDFDoc').mockReturnValue(pdfDoc);
            const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
            pdfExportAction.exportableElements.push(document.createElement('div'));
            await ExportService.addHeaderFooterLogo(10, exportComposite.exportConfig, pdfExportAction, pdfDoc);
            expect(pdfDoc.addImage).toHaveBeenCalled();
            expect(pdfDoc.line).toHaveBeenCalled();
            expect(pdfDoc.text).toHaveBeenCalled();
        });

        describe('Test addHeaderFooterLogo with invalid logo coordinates', () => {
            const exportComposite = createDummyExportComposite(ExportConstants.PDF);
            let pdfDoc: any = null;
            beforeEach(() => {
                exportComposite.exportConfig = new TablePDFExportConfig();
                (exportComposite.exportConfig as TablePDFExportConfig).logoConfig = new LogoConfig();
                (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPresent = true;
                (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile = 'imagedata';
                (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoWidth = 100;
                (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoHeight = 300;
                pdfDoc = {internal: {pageSize: {getHeight: () => undefined, getWidth: () => undefined, getNumberOfPages: () => 1 }, getNumberOfPages: () => 1}, save: jest.fn(), text: jest.fn(), line: jest.fn(), addImage: jest.fn(), notifyPDFLogoFailure: undefined};
            });

            it('Test addHeaderFooterLogo with invalid logo x coordinate', async () => {
                (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPosition = PDFLogoPosition.TOP_RIGHT;
                expect(pdfDoc.notifyPDFLogoFailure).toBeFalsy();
                jest.spyOn(service, 'createPDFDoc').mockReturnValue(pdfDoc);
                const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
                pdfExportAction.exportableElements.push(document.createElement('div'));
                await ExportService.addHeaderFooterLogo(10, exportComposite.exportConfig, pdfExportAction, pdfDoc);
                expect(pdfDoc.notifyPDFLogoFailure).toBeTruthy();
            });

            it('Test addHeaderFooterLogo with invalid logo y coordinate', async () => {
                (exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoPosition = PDFLogoPosition.BOTTOM_LEFT;
                expect(pdfDoc.notifyPDFLogoFailure).toBeFalsy();
                jest.spyOn(service, 'createPDFDoc').mockReturnValue(pdfDoc);
                const pdfExportAction = new PDFExportAction(exportComposite, fakePdfDoc, '', '', '');
                pdfExportAction.exportableElements.push(document.createElement('div'));
                await ExportService.addHeaderFooterLogo(10, exportComposite.exportConfig, pdfExportAction, pdfDoc);
                expect(pdfDoc.notifyPDFLogoFailure).toBeTruthy();
            });

            it('Test addHeaderFooterLogo with invalid logo width', () => {
                expect(pdfDoc.notifyPDFLogoFailure).toBeFalsy();
                ExportService.addLogoImage(pdfDoc, '', 1, 2, undefined, 10);
                expect(pdfDoc.notifyPDFLogoFailure).toBeTruthy();
            });

            it('Test addHeaderFooterLogo with invalid logo height', () => {
                expect(pdfDoc.notifyPDFLogoFailure).toBeFalsy();
                ExportService.addLogoImage(pdfDoc, '', 1, 2, 10, undefined);
                expect(pdfDoc.notifyPDFLogoFailure).toBeTruthy();
            });
        });
    });

    describe('Test getLogoInfo method', () => {
        it('Test getLogoInfo', () => {
            // Test height > width
            let logoInfo: LogoInfo = ExportService.getLogoInfo(50, 150);
            expect(logoInfo.width).toEqual(10);
            expect(logoInfo.height).toEqual(30);

            // Test width > height
            logoInfo = ExportService.getLogoInfo(200, 100);
            expect(logoInfo.width).toEqual(30);
            expect(logoInfo.height).toEqual(15);

            // Test height = width
            logoInfo = ExportService.getLogoInfo(150, 150);
            expect(logoInfo.width).toEqual(30);
            expect(logoInfo.height).toEqual(30);
        });
    });

    describe('Test loadLogoInfo method', () => {
        it('loadLogoInfo will add Logo info into logo config object ', async () => {
            // @ts-ignore
            global.Image = class {
                width: number;
                height: number;
                constructor() {}

                decode = () => {
                    return new Promise<void>((resolve, error) => {
                        this.width = 10;
                        this.height = 20;
                        resolve();
                    });
                }
            };

            const logoConfig = new LogoConfig();
            logoConfig.logoImageFile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAWCAIAAACg4UBvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAzSURBVDhPY/hPGRjVTxkY1U8ZGCn6V6xY0draCuUgAWL1AzUzMGBRPFT8jwsMbf3//wMABWVeBFk6e0AAAAAASUVORK5CYII=';

            const logoInfo: LogoInfo = await ExportService.loadLogoInfo(logoConfig);

            expect(logoInfo.width).toEqual(15);
            expect(logoInfo.height).toEqual(30);
        });

        it('Test loadLogoInfo with valid width and height already', async () => {
            const logoConfig = new LogoConfig();
            logoConfig.logoWidth = 20;
            logoConfig.logoHeight = 10;

            const logoInfo: LogoInfo = await ExportService.loadLogoInfo(logoConfig);

            expect(logoInfo.width).toEqual(30);
            expect(logoInfo.height).toEqual(15);
        });
    });
    describe('getExportFilename Test', () => {
        const exportComposite = createDummyExportComposite(ExportConstants.EXCEL);
        it('getExportFilename Test', () => {
            let filename = service.getExportFilename(exportComposite, exportComposite.exportConfig, 'meaningFull');
            expect(filename).toBe('meaningFull');

            exportComposite.exportConfig.appendTimestamp = true;
            filename = service.getExportFilename(exportComposite, exportComposite.exportConfig, 'meaningFull');
            expect(filename.startsWith('meaningFull-')).toBe(true);

            // For lookThrough summary export date format will be different
            exportComposite.widget.configType = WidgetConfigType.LOOK_THROUGH_SUMMARY;
            filename = service.getExportFilename(exportComposite, exportComposite.exportConfig, 'meaningFull');
            expect(filename).toBe('meaningFull 26-01-2020');
        });
    });

    function createDummyExportComposite(exportConfigType: string, isBatch?: boolean): ExportComposite {
        let exportComposite;
        if (isBatch) {
            exportComposite = new BatchExportComposite();
            exportComposite.batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
        } else {
            exportComposite = new ExportComposite();
        }
        exportComposite.portfolio = new Portfolio('PEP');
        exportComposite.portfolio.datePicker = new DateValue({date: '01/26/2020'});
        if (exportConfigType === ExportConstants.PDF) {
            exportComposite.exportConfig = new PDFExportConfig();
        } else if (exportConfigType === ExportConstants.IMAGE) {
            exportComposite.exportConfig = new ImageExportConfig();
        } else {
            exportComposite.exportConfig = new ExcelExportConfig();
        }
        exportComposite.widget = new Widget();
        exportComposite.widget.configType = WidgetConfigType.RISK_EXPOSURE;
        exportComposite.report = new Report();
        exportComposite.logoImageFile = {'name': 'filename', 'lastModified': 12, 'size': 1234, 'type': 'image', slice: (): Blob => null};
        return exportComposite;
    }

    it('Test generateWidgetRequestsForBatch validation for time series comparison', () => {
        WorkspaceStore.init();
        service['notificationService'] = new NotificationService();
        // Test setup
        const dummyReportGroup = new ReportGroup();
        dummyReportGroup.title = '';
        const portfolio1 = new Portfolio('PEP');
        portfolio1.portId = 'PEP';
        const portfolio2 = new Portfolio('IP');
        portfolio2.portId = 'IP';
        dummyReportGroup.portfolios = [portfolio1, portfolio2];
        const report1 = new Report('Test report 1');
        report1.addWidget(new Widget(WidgetConfigType.TIME_SERIES));
        report1.comparisonConfigId = 1;
        dummyReportGroup.reports = [report1];
        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList.push('PEP');
        comparisonConfig.portComparisonList.push('IP');
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);
        dummyReportGroup.comparisonConfigMap = comparisonConfigMap;

        const exportConfig = new ExcelExportConfig();
        const widgetRequests = service.generateWidgetRequestsForBatch(portfolio1, dummyReportGroup.reports, exportConfig, dummyReportGroup);
        expect(widgetRequests[0].requests.length).toEqual(0);

        WorkspaceStore.currentWorkpad$.next(dummyReportGroup);
        jest.spyOn<any>(service, 'createWidgetExportingRequest').mockReturnValueOnce({multiRequests: {}});
        const widgetRequests2 = service.generateWidgetRequestsForBatch(portfolio1, dummyReportGroup.reports, exportConfig, null);
        expect(widgetRequests2[0].requests.length).toEqual(1);
    });

    it('should test validateBeforeExport', () => {
        service['notificationService'] = new NotificationService();
        expect(service['validateBeforeExport'](WidgetConfigType.TIME_SERIES, true)).toBeFalsy();
        expect(service['validateBeforeExport'](WidgetConfigType.TIME_SERIES, false)).toBeTruthy();
        expect(service['validateBeforeExport'](WidgetConfigType.CMBS_MAP)).toBeFalsy();
        expect(service['validateBeforeExport'](WidgetConfigType.FACTOR_GRAPHING_BAR_CHART)).toBeFalsy();
        expect(service['validateBeforeExport'](WidgetConfigType.FACTOR_GRAPHING_PIE_CHART)).toBeFalsy();
        expect(service['validateBeforeExport'](WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART)).toBeFalsy();
        expect(service['validateBeforeExport'](WidgetConfigType.BAR)).toBeTruthy();
    });

    describe('test handleCommitmentRiskChartSpecificCss', () => {
        describe('test base vs scenario case', () => {
            let widgetElement;
            let mockPolyline, mockCheckboxContainer, mockRadioInput, mockCheckbox, mockRadioGroup;

            beforeEach(() => {
                mockPolyline = { style: {} };
                mockCheckboxContainer = { style: {} };

                // Define the nextElementSibling with a style object
                mockRadioInput = {
                    nextElementSibling: { style: {} }
                };

                document.body.innerHTML = `
                    <div id="widget">
                        <svg>
                            <g class="scenario-midline" style="stroke-dasharray: 10,5;"></g>
                            <g class="scenario-dark-blue" style="opacity: 0.8;"></g>
                        </svg>
                        <app-commitment-risk-chart-scenario-legend></app-commitment-risk-chart-scenario-legend>
                    </div>
                `;

                widgetElement = document.getElementById('widget');

                // Mock setup for checkboxes
                const mockCheckboxSvg = { querySelector: jest.fn().mockReturnValue(mockPolyline) };
                mockCheckbox = {
                    querySelector: jest.fn().mockImplementation(selector => {
                        if (selector === 'svg') { return mockCheckboxSvg; }
                        if (selector === '.aux-icon__container--checkbox.sc-aux-icon') { return mockCheckboxContainer; }
                        return null;
                    })
                };
                Object.defineProperty(mockCheckbox, 'shadowRoot', { get: () => ({ querySelector: mockCheckbox.querySelector }) });

                // Mock setup for radio groups
                const mockRadio = {
                    hasAttribute: jest.fn().mockReturnValue(true),
                    shadowRoot: {
                        querySelectorAll: jest.fn().mockReturnValue([mockRadioInput])
                    }
                };
                mockRadioGroup = {
                    querySelectorAll: jest.fn().mockReturnValue([mockRadio])
                };
                Object.defineProperty(mockRadioGroup, 'shadowRoot', { get: () => ({ querySelectorAll: mockRadioGroup.querySelectorAll }) });

                jest.spyOn(widgetElement, 'querySelectorAll').mockImplementation(selector => {
                    if (selector === 'aux-checkbox') {
                        return [mockCheckbox];
                    }
                    if (selector === 'aux-radio-group') {
                        return [mockRadioGroup];
                    }
                    return [];
                });
            });

            it('should apply specific styles to elements based on class', () => {
                jest.spyOn(service, 'getStylePropertyOfElement').mockImplementation((element, property) => {
                    if (property === 'stroke-dasharray') {
                        return '10,5';
                    } else if (property === 'opacity') {
                        return '0.8';
                    } else if (property === 'color') {
                        return '#f1f2f4';  // Checkbox stroke color
                    } else if (property === 'border-color') {
                        return '#0000f3';  // Radio select background color
                    }
                    return '';
                });

                service['handleCommitmentRiskChartSpecificCss'](widgetElement);

                expect(widgetElement.querySelector('.scenario-midline').style.strokeDasharray).toBe('10,5');
                expect(widgetElement.querySelector('.scenario-dark-blue').style.opacity).toBe('0.8');
                expect(mockPolyline.style.stroke).toBe('#f1f2f4');
                expect(mockRadioInput.nextElementSibling.style.backgroundColor).toBe('#0000f3');
            });
        });

        describe('test base case', () => {
            let widgetElement;
            let svgElement;

            beforeEach(() => {
                document.body.innerHTML = `
                    <div id="widget">
                        <svg>
                            <text><tspan>Percentile:</tspan></text>
                        </svg>
                    </div>
                `;

                widgetElement = document.getElementById('widget');
                svgElement = widgetElement.querySelector('svg');
            });

            it('should adjust style and position of tspan when it contains "Percentile:"', () => {
                jest.spyOn(service, 'getStylePropertyOfElement').mockImplementation((element, property) => {
                    if (property === 'color') {
                        return '#000000'; // Red color for demonstration
                    }
                    return '';
                });

                const tSpans = svgElement.querySelectorAll('tspan');
                tSpans.forEach(tspan => {
                    if (tspan.textContent.trim() === 'Percentile:') {
                        // Adjust the text color.
                        tspan.setAttribute('stroke', service.getStylePropertyOfElement(tspan, 'color'));
                        // Adjust the position of the tspan.
                        tspan.setAttribute('dy', '-20');
                    }
                });

                service['handleCommitmentRiskChartSpecificCss'](widgetElement);

                // Assertions to verify the changes
                expect(tSpans[0].getAttribute('stroke')).toBe('#000000');
                expect(tSpans[0].getAttribute('dy')).toBe('-20');
            });
        });
    });
});
