import {TestBed} from '@angular/core/testing';
import {BatchReportingService} from './batch-reporting.service';
import {Observable, of, throwError} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioService} from '@services/portfolio';
import {NotificationService} from '@services/notification';
import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {BatchRowDownloadStatus} from '@enums/batch-reporting/batch-row-download-status.enum';
import {Workspace} from '@models/workspace/workspace.model';
import {BatchExportingStore, WorkspaceStore} from '../../../stores';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Report} from '@models/workspace/report.model';
import {ExportConstants} from '@constants/export.constants';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {BatchExportAction} from '@models/batch-reporting/batch-export-action.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {Http2BmsService} from '@services/bms';
import {EpnlSettings} from '@models/batch-reporting/epnl-settings.model';
import {ExportUtils} from '@utils/export/export.utils';
import {PortfolioUtils} from '@utils/portfolio.utils';
import {Widget} from '@models/widget/widget.model';
import {CoreCommonConstants, DateService, DateValue, TokenUtils, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';
import {BatchSchedule} from '@models/batch-reporting/scheduled-batch/batch-schedule.model';
import {BatchMonthlyFrequency} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-monthly-frequency.model';
import {FavoriteService} from '@services/favorite';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import moment from 'moment';
import 'moment-timezone/index';

describe('BatchReportingService', () => {
    let service: BatchReportingService;

    const portfolioServiceStub = {
        setPortfolioTitle: jest.fn(),
        fetchPortfolioInformation$: jest.fn((): Observable<any> => {
            return of(new Portfolio('PEP--HP', null, false, 'Perf Benchmark for PEP-AU'));
        })
    };

    const http2BmsServiceStub = {
        post$: jest.fn()
    };

    const notificationServiceStub = {
        openDialog: jest.fn(),
        success: jest.fn(),
        error: jest.fn()
    };

    const favoriteServiceStub = {
        saveFavorite$: jest.fn(() => of(null)),
        getAllFavorites$: jest.fn((): Observable<any> => {
            return of([BatchReportingTestUtils.createDummyScheduledBatchConfig()]);
        })
    };

    const dateServiceStub = {
        parseDateString$: jest.fn(() => of(new Date()))
    };

    BatchExportingStore.init();
    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: Http2BmsService, useValue: http2BmsServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: DateService, useValue: dateServiceStub}
            ]
        });
        service = TestBed.inject(BatchReportingService);
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        BatchExportingStore.init();
        WorkspaceStore.init();
        BatchExportingStore.currentBatchReport$.next(BatchReportingTestUtils.createDummyBatchReportConfig());
    });

    describe('Test convertBatchFileName', () => {
        // Test with a placeholder file name of '[PORTFOLIO] [DATE] [REPORT]'
        const placeholderFileName = ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.PORTFOLIO + ' ' + ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.DATE + ' ' + ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.REPORT;
        it('Test simple fileName', () => {
            const batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
            // Create a file name without placeholders
            const batchFileName = BatchReportingService.convertBatchFileName('TEST', batchRowConfig, false);
            // File names should match
            expect(batchFileName).toEqual('TEST');
        });

        it('Test convertBatchFileName without mergeInOneFile', () => {
            const batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
            const report = new Report();
            report.title = 'Report Title';
            // Create a file name without placeholders
            batchRowConfig.reports.push(report);
            const batchFileName = BatchReportingService.convertBatchFileName(placeholderFileName, batchRowConfig, false);
            expect(batchFileName).toEqual('PEP 01-04-2020 Report Title');
        });

        it('Test convertBatchFileName without mergeInOneFile and multiple reports', () => {
            const portfolio = new Portfolio('IP', new DateValue({
                date: '07/28/2018',
                calCode: 'GP_HK_STD',
                dateString: false,
                dateStringValue: ''
            }));
            BatchExportingStore.currentPortfolio$.next(portfolio);
            const batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
            const report1 = new Report();
            const report2 = new Report();
            // Create a file name without placeholders
            batchRowConfig.reports.push(report1);
            batchRowConfig.reports.push(report2);
            const batchFileName = BatchReportingService.convertBatchFileName(placeholderFileName, batchRowConfig, false);
            expect(batchFileName).toEqual('IP 28-07-2018 ');
        });

        it('Test convertBatchFileName with mergeInOneFile and run as PortGroup', () => {
            const batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
            batchRowConfig.portfolio.title = 'PEP, CORE-HQ';
            batchRowConfig.runAs = BatchExportRunAs.PORTGROUP;
            const report = new Report();
            report.title = 'Report Title';
            // Create a file name without placeholders
            batchRowConfig.reports.push(report);
            const batchFileName = BatchReportingService.convertBatchFileName(placeholderFileName, batchRowConfig, true);
            expect(batchFileName).toEqual('PEP  CORE-HQ 01-04-2020 Report Title');
        });

        it('Test convertBatchFileName with mergeInOneFile and run as Portfolios', () => {
            const batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
            // Make a custom port group ticker
            batchRowConfig.portfolio.title = 'PEP, CORE-HQ';
            const report = new Report();
            report.title = 'Report Title';
            // Create a file name without placeholders
            batchRowConfig.reports.push(report);
            const batchFileName = BatchReportingService.convertBatchFileName(placeholderFileName, batchRowConfig, true);
            // Should still only just grab the first ticker
            expect(batchFileName).toEqual('PEP 01-04-2020 Report Title');
        });
    });

    describe('Test getCurrentBatchRow$ subscription', () => {
        it('Test canceled batch', (done) => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            BatchExportingStore.currentBatchExportAction = new BatchExportAction(batchReport);
            BatchExportingStore.currentBatchExportAction.canceled = true;
            jest.spyOn(service, 'processBatchRow');
            BatchExportingStore.currentBatchRow$.next(batchReport.batchRowConfigs[0]);
            expect(service.processBatchRow).not.toHaveBeenCalled();
            done();
        });
    });

    it('Test downloadInProgress', () => {
        let downloadStatus: boolean;
        BatchExportingStore.batchDownloadStatus$
            .subscribe(value => downloadStatus = value);
        BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].downloadStatus = BatchRowDownloadStatus.NONE;
        service.updateBatchDownloadStatus();
        expect(downloadStatus).toBeFalsy();

        BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].downloadStatus = BatchRowDownloadStatus.IN_PROGRESS;
        service.updateBatchDownloadStatus();
        expect(downloadStatus).toBeTruthy();
    });

    it('Test fetchPortInfo$', (done) => {
        const portfolio = new Portfolio('PEP');
        service.fetchPortInfo$(portfolio, true, BatchExportRunAs.PORTGROUP).subscribe((port) => {
            const args: any = portfolioServiceStub.fetchPortfolioInformation$.mock.calls[0];
            expect(args[0]).toEqual(portfolio);
            expect(args[1]).toBeTruthy();
            expect(args[2]).toBeTruthy();
            expect(args[3]).toEqual(null);
            expect(args[4]).toEqual(null);
            expect(args[5]).toBeTruthy();
            expect(port.portName).toEqual('PEP--HP');
            done();
        });
    });

    describe('Test populateReportOptions', () => {
        it('Test populateReportOptions without EPNL enabled, no workspace reports, and no rowConfig reports', () => {
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(new Workspace());
            // Should be empty
            expect(service.populateReportOptions(BatchReportingTestUtils.createDummyBatchRowConfig(), [])).toEqual([]);
        });

        it('Test populateReportOptions with EPNL enabled, some workspace reports, and rowConfig reports', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);

            // Add some dummy reports in the workspace
            const newWorkspace = new Workspace();
            const newWorkpad = new FlatWorkpad();
            const report1 = new Report();
            report1.title = 'workpad report 1';
            const report2 = new Report();
            report2.title = 'workpad report 2';
            newWorkpad.reports.push(report1, report2);
            newWorkspace.workpads.push(newWorkpad);
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(newWorkspace);

            // Add some dummy reports into the BatchRowConfig
            const batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
            const report3 = new Report();
            report3.title = 'existing report 3';
            batchRowConfig.reports.push(report3);

            // Get the options
            const reportOptions = service.populateReportOptions(batchRowConfig, []);
            // There should be 3 groupings of options
            expect(reportOptions.length).toEqual(3);

            // 1. Should be EPNL
            expect(reportOptions[0].values[0].displayValue).toEqual(ExportConstants.EPNL_REPORT);
            // 2. Should be Workspace reports. Should be 2 total
            expect(reportOptions[1].values.length).toEqual(2);
            expect(reportOptions[1].values[0].displayValue).toEqual('workpad report 1');
            expect(reportOptions[1].values[1].displayValue).toEqual('workpad report 2');
            // 3. Should be reports coming from the BatchRowConfig. Should only be 1 report
            expect(reportOptions[2].values.length).toEqual(1);
            expect(reportOptions[2].values[0].displayValue).toEqual('existing report 3');
        });

        it('Test populateReportOptions with existingReportOptions', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);

            // Add some dummy reports in the workspace
            const newWorkspace = new Workspace();
            const newWorkpad = new FlatWorkpad();
            const report1 = new Report();
            report1.title = 'workpad report 1';
            const report2 = new Report();
            report2.title = 'workpad report 2';
            newWorkpad.reports.push(report1, report2);
            newWorkspace.workpads.push(newWorkpad);
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(newWorkspace);

            // Add some dummy reports into the BatchRowConfig
            const batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
            // Add EPNL option
            // Add a workspace report
            batchRowConfig.reports.push(report1);
            const report3 = new Report();
            report3.title = 'existing report 3';
            batchRowConfig.reports.push(report3);

            // Get the initial options
            const existingReportOptions = service.populateReportOptions(batchRowConfig, []);

            // Get the options
            const reportOptions = service.populateReportOptions(batchRowConfig, existingReportOptions);
            // There should be 3 groupings of options
            expect(reportOptions.length).toEqual(3);
            // 1. Should be EPNL
            expect(reportOptions[0].values[0].displayValue).toEqual(ExportConstants.EPNL_REPORT);
            expect(reportOptions[0].values[0].isSelected).toBeFalsy();
            // 2. Should be Workspace reports. Should be 2 total
            expect(reportOptions[1].values.length).toEqual(2);
            expect(reportOptions[1].values[0].displayValue).toEqual('workpad report 1');
            expect(reportOptions[1].values[0].isSelected).toBeTruthy();
            expect(reportOptions[1].values[1].displayValue).toEqual('workpad report 2');
            expect(reportOptions[1].values[1].isSelected).toBeFalsy();
            // 3. Should only be 1 report
            // Even though the BatchRowConfig has 3 reports, the 1st is accounted for in EPNL and the 2nd is accounted for in the workspace reports
            expect(reportOptions[2].values.length).toEqual(1);
            expect(reportOptions[2].values[0].displayValue).toEqual('existing report 3');
        });
    });

    it('Test cascadeDateToAllRows', () => {
        // Set up the batchReportConfig to have two batchRowConfigs
        BatchExportingStore.getCurrentBatchReport().batchRowConfigs.push(BatchReportingTestUtils.createDummyBatchRowConfig());
        let batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
        batchRowConfig.portfolio.datePicker.date = '';
        service.cascadeDateToAllRows(batchRowConfig);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].portfolio.datePicker.date).toEqual('04/01/2020');
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[1].portfolio.datePicker.date).toEqual('04/01/2020');
        batchRowConfig.portfolio.datePicker = null;
        service.cascadeDateToAllRows(batchRowConfig);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].portfolio.datePicker.date).toEqual('04/01/2020');
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[1].portfolio.datePicker.date).toEqual('04/01/2020');
        batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
        batchRowConfig.portfolio.datePicker.date = '05/25/2020';
        service.cascadeDateToAllRows(batchRowConfig);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].portfolio.datePicker.date).toEqual('05/25/2020');
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[1].portfolio.datePicker.date).toEqual('05/25/2020');
    });

    it('Test cascadeCurrencyToAllRows', () => {
        // Set up the batchReportConfig to have two batchRowConfigs
        BatchExportingStore.getCurrentBatchReport().batchRowConfigs.push(BatchReportingTestUtils.createDummyBatchRowConfig());
        const batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
        batchRowConfig.portfolio.currency = '';
        service.cascadeCurrencyToAllRows(batchRowConfig);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].portfolio.currency).toEqual('USD');
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[1].portfolio.currency).toEqual('USD');

        batchRowConfig.portfolio.currency = 'JPY';
        service.cascadeCurrencyToAllRows(batchRowConfig);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].portfolio.currency).toEqual('JPY');
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[1].portfolio.currency).toEqual('JPY');
    });

    it('Test cascadeReportOptionsToAllRows', () => {
        // Set up the batchReportConfig to have two batchRowConfigs
        BatchExportingStore.getCurrentBatchReport().batchRowConfigs.push(BatchReportingTestUtils.createDummyBatchRowConfig());
        let batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
        batchRowConfig.reports = null;
        service.cascadeReportOptionsToAllRows(batchRowConfig);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].reports).toEqual([]);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[1].reports).toEqual([]);

        batchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
        const report1 = new Report();
        const report2 = new Report();
        batchRowConfig.reports = [report1, report2];
        BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].reinitializeReportOptions = jest.fn();
        BatchExportingStore.getCurrentBatchReport().batchRowConfigs[1].reinitializeReportOptions = jest.fn();
        service.cascadeReportOptionsToAllRows(batchRowConfig);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0].reports.length).toEqual(2);
        expect(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[1].reports.length).toEqual(2);

        service.cascadeReportOptionsToAllRows(BatchExportingStore.getCurrentBatchReport().batchRowConfigs[0]);

        batchRowConfig.reports = null;
        service.cascadeReportOptionsToAllRows(batchRowConfig);
    });

    it('Test cancelCurrentBatch', () => {
        BatchExportingStore.currentBatchExportAction = new BatchExportAction(BatchExportingStore.getCurrentBatchReport());
        service.cancelCurrentBatch();
        expect(BatchExportingStore.currentBatchExportAction.canceled).toBeTruthy();
    });

    describe('Test runBatchExport', () => {
        it('Test runBatchExport with no rows', () => {
            BatchExportingStore.currentBatchExportAction = undefined;
            const batchReport = new BatchReportConfig();
            service.runBatchExport(batchReport);
            expect(BatchExportingStore.currentBatchExportAction).toBeUndefined();
        });

        it('Test runBatchExport with rows', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            jest.spyOn(service, 'formatFileNamePlaceholdersToUppercase');
            service.runBatchExport(batchReport);
            expect(service.numFailed).toEqual(0);
            expect(service.formatFileNamePlaceholdersToUppercase).toHaveBeenCalled();
            expect(BatchExportingStore.currentBatchExportAction).toBeDefined();
        });

        it('Test runBatchExport with rows and mergeInOneFile', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.mergeInOneFile = true;
            service.runBatchExport(batchReport);
            for (const batchRow of batchReport.getActiveBatchRowConfigs()) {
                expect(batchRow.downloadStatus).toEqual(BatchRowDownloadStatus.IN_PROGRESS);
            }
        });
    });

    describe('Test processBatchRow', () => {
        it('Test row with PDFExportConfig', () => {
            const batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            const report1 = new Report();
            report1.comparisonConfigId = 1;
            report1.widgets.push(new Widget());
            const report2 = new Report();
            // report2 should not be added since it doesn't have widgets
            batchRow.reports = [report1, report2];
            batchRow.exportConfig = new PDFExportConfig();

            const comparisonConfig = new ComparisonConfig();
            comparisonConfig.portComparisonList = ['PEP', 'IP'];

            const comparisonConfigMap = new Map<number, ComparisonConfig>();
            comparisonConfigMap.set(1, comparisonConfig);
            const workpad: FlatWorkpad = new FlatWorkpad({
                reports: [{}],
                portfolio: {ticker: 'PEP'},
                comparisonConfigMap: comparisonConfigMap
            });
            BatchExportingStore.currentWorkpad$.next(workpad);

            service.processBatchRow(batchRow);
            expect(batchRow.downloadStatus).toEqual(BatchRowDownloadStatus.IN_PROGRESS);
            expect(BatchExportingStore.batchExportQueue.length).toEqual(1);
            expect(BatchExportingStore.getBatchContainerStatus()).toEqual(BatchContainerStatus.PRELOAD);
        });

        it('Test row with PDFExportConfig and mergeInOneFile', () => {
            BatchExportingStore.getCurrentBatchReport().mergeInOneFile = true;
            const batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            const report1 = new Report();
            report1.comparisonConfigId = 1;

            report1.widgets.push(new Widget());
            const report2 = new Report();
            report2.comparisonConfigId = 2;
            report2.widgets.push(new Widget());
            batchRow.reports = [report1, report2];
            batchRow.exportConfig = new PDFExportConfig();
            BatchExportingStore.getCurrentBatchReport().batchRowConfigs.push(batchRow);

            const batchExportAction = new BatchExportAction(BatchExportingStore.getCurrentBatchReport());
            BatchExportingStore.currentBatchExportAction = batchExportAction;


            const comparisonConfig = new ComparisonConfig();
            comparisonConfig.portComparisonList = ['PEP', 'IP'];

            const comparisonConfigMap = new Map<number, ComparisonConfig>();
            comparisonConfigMap.set(1, comparisonConfig);
            comparisonConfigMap.set(2, comparisonConfig);
            const workpad: FlatWorkpad = new FlatWorkpad({
                reports: [{}],
                portfolio: {ticker: 'PEP'},
                comparisonConfigMap: comparisonConfigMap
            });
            BatchExportingStore.currentWorkpad$.next(workpad);

            service.processBatchRow(batchRow);
            expect(BatchExportingStore.batchExportQueue.length).toEqual(2);
            expect(BatchExportingStore.batchExportQueue[1].isLast).toBeTruthy();
        });

        it('Test row with ExcelExportConfig', () => {
            BatchExportingStore.batchExportQueue = [];
            const batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            const report1 = new Report();
            const report2 = new Report();
            batchRow.reports = [report1, report2];
            batchRow.exportConfig = new ExcelExportConfig();

            service.processBatchRow(batchRow);
            expect(batchRow.downloadStatus).toEqual(BatchRowDownloadStatus.IN_PROGRESS);
            expect(BatchExportingStore.batchExportQueue.length).toEqual(1);
        });
    });

    describe('Test getPortfoliosForBatchRow$', () => {
        it('Test getPortfoliosForBatchRow$ with batchRunAs PortGroup', (done) => {
            const batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            jest.spyOn(batchRow.portfolio, 'isInitialized').mockReturnValue(true);
            batchRow.runAs = BatchExportRunAs.PORTGROUP;
            service.getPortfoliosForBatchRow$(batchRow)
                .subscribe((portfolios) => {
                    expect(portfolios).toEqual([batchRow.portfolio]);
                    done();
                });
        });

        it('Test getPortfoliosForBatchRow$ with batchRunAs Portfolios and the portfolio is not a port group', (done) => {
            const batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            jest.spyOn(batchRow.portfolio, 'isInitialized').mockReturnValue(true);
            service.getPortfoliosForBatchRow$(batchRow)
                .subscribe((portfolios) => {
                    expect(portfolios).toEqual([batchRow.portfolio]);
                    done();
                });
        });

        it('Test getPortfoliosForBatchRow$ with batchRunAs Portfolios', (done) => {
            const batchRow = BatchReportingTestUtils.createDummyBatchRowConfig();
            batchRow.exportConfig = new PDFExportConfig();
            const portGroup = new Portfolio('CORE-HQ', new DateValue({
                date: '04/01/2020',
                calCode: 'GP_HK_STD',
                dateString: false,
                dateStringValue: ''
            }));
            batchRow.portfolio = portGroup;
            portGroup.isPortfolioGroup = true;
            const childPort1 = new Portfolio('GALIC-106');
            childPort1.datePicker = portGroup.datePicker;
            const childPort2 = new Portfolio('FFH-FIT');
            childPort2.datePicker = portGroup.datePicker;
            portGroup.portfolios = [childPort1, childPort2];
            jest.spyOn(service, 'fetchPortInfo$').mockReturnValue(of(portGroup));
            portfolioServiceStub.fetchPortfolioInformation$.mockImplementation((port) => {
                return of(port);
            });
            jest.spyOn(service, 'setBenchmarksOnBatchPortfolios').mockImplementationOnce(() => {
            });
            jest.spyOn(PortfolioUtils, 'copyPortfolioSettingsToPortfolios').mockImplementation(() => {
            });
            service.getPortfoliosForBatchRow$(batchRow)
                .subscribe((portfolios) => {
                    expect(portfolios).toEqual([childPort1, childPort2]);
                    done();
                });
        });
    });

    describe('Test setBenchmarksOnBatchPortfolios', () => {
        it('Test setBenchmarksOnBatchPortfolios with OTHER bench', () => {
            jest.spyOn(service, 'setBenchmarksOnBatchPortfolios').mockRestore();
            const portfolio = new Portfolio('PEP');
            const topLevelBenchmark = Benchmark.create(BenchmarkConstants.OTHER_BENCH, 1, 'TEST');
            service.setBenchmarksOnBatchPortfolios(topLevelBenchmark, [portfolio]);
            expect(portfolio.benchmark).toEqual(topLevelBenchmark);
        });

        it('Test setBenchmarksOnBatchPortfolios with NONE bench', () => {
            const portfolio = new Portfolio('PEP');
            const topLevelBenchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
            service.setBenchmarksOnBatchPortfolios(topLevelBenchmark, [portfolio]);
            expect(portfolio.benchmark).toEqual(topLevelBenchmark);
        });

        it('Test setBenchmarksOnBatchPortfolios with finding the benchmark', () => {
            const portfolio = new Portfolio('PEP');
            portfolio.benchmarks = [
                Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'Bench1'),
                Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, 'TEST')
            ];
            const topLevelBenchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, 'TEST');
            service.setBenchmarksOnBatchPortfolios(topLevelBenchmark, [portfolio]);
            expect(portfolio.benchmark).toEqual(portfolio.benchmarks[1]);
        });

        it('Test setBenchmarksOnBatchPortfolios with finding the benchmark and not found', () => {
            const portfolio = new Portfolio('PEP');
            portfolio.benchmarks = [
                Benchmark.create(BenchmarkConstants.BENCH_TYPE_MARKET, 1, 'MARKET'),
                Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'Bench1'),
                Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, 'TEST')
            ];
            // Pass in a top level benchmark with type of PERFORM
            const topLevelBenchmark = Benchmark.create(BenchmarkConstants.PERFORM, 1, 'TEST');
            service.setBenchmarksOnBatchPortfolios(topLevelBenchmark, [portfolio]);
            // Should default to the first NON market benchmark available
            expect(portfolio.benchmark).toEqual(portfolio.benchmarks[1]);
        });
    });

    describe('Test formatFileNamePlaceholdersToUppercase', () => {
        it('Test formatFileNamePlaceholdersToUppercase with setDefaultBatchReportFileName', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            service.setDefaultBatchReportFileName(batchReport);
            service.formatFileNamePlaceholdersToUppercase(batchReport);
            expect(batchReport.fileName).toEqual('[PORTFOLIO] [DATE] [REPORT]');
        });

        it('Test formatFileNamePlaceholdersToUppercase with fileName', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.fileName = 'TEST FILE NAME';
            service.formatFileNamePlaceholdersToUppercase(batchReport);
            expect(batchReport.fileName).toEqual('TEST FILE NAME');
        });

        it('Test formatFileNamePlaceholdersToUppercase with fileName with placeholders that are lowercase', () => {
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.fileName = '[report] [portfolio] [portfolio] test [date]';
            service.formatFileNamePlaceholdersToUppercase(batchReport);
            expect(batchReport.fileName).toEqual('[REPORT] [PORTFOLIO] [PORTFOLIO] test [DATE]');
        });
    });

    describe('Test epnl report download', () => {
        it('Test runEPNLBatchExport', () => {
            jest.spyOn(ExportUtils, 'download').mockReturnValue(null);
            http2BmsServiceStub.post$.mockReturnValueOnce(of({
                data: {
                    ReportLocation: 'location test', ReportName: 'report.pdf', ReportContent: 'Test Content'
                }
            }));
            http2BmsServiceStub.post$.mockReturnValueOnce(throwError('Test'));
            const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReport.batchRowConfigs.push(BatchReportingTestUtils.createDummyBatchRowConfig());
            batchReport.batchRowConfigs[0].isEpnlReport = true;
            batchReport.batchRowConfigs[0].portfolio.epnlSettings = new EpnlSettings();
            batchReport.batchRowConfigs[0].portfolio.benchmark = new Benchmark();
            batchReport.batchRowConfigs[1].isEpnlReport = true;
            batchReport.batchRowConfigs[1].portfolio.epnlSettings = new EpnlSettings();
            batchReport.batchRowConfigs[1].portfolio.benchmark = new Benchmark();
            service['runEPNLBatchExport'](batchReport);
            expect(batchReport.batchRowConfigs[0].downloadStatus).toEqual(BatchRowDownloadStatus.COMPLETED);
            expect(batchReport.batchRowConfigs[1].downloadStatus).toEqual(BatchRowDownloadStatus.FAILED);
        });
        it('Test getBenchmarkNameForEPNL', () => {
            const portfolio = new Portfolio();
            portfolio.benchmark = new Benchmark();
            portfolio.benchmark.name = BenchmarkConstants.BENCH_SECONDARY;
            portfolio.benchmark.type = 'RISK';
            portfolio.benchmark.order = 1;
            portfolio.benchmarks = [new Benchmark()];
            portfolio.benchmarks[0].name = 'Test Benchmark';
            portfolio.benchmarks[0].type = 'RISK';
            portfolio.benchmarks[0].order = 1;
            expect(service['getBenchmarkNameForEPNL'](portfolio)).toEqual('Test Benchmark');
            portfolio.benchmark.name = BenchmarkConstants.BENCH_PRIMARY;
            expect(service['getBenchmarkNameForEPNL'](portfolio)).toEqual('Test Benchmark');
            portfolio.benchmarks[0].order = 2;
            expect(service['getBenchmarkNameForEPNL'](portfolio)).toEqual(CoreCommonConstants.EMPTY_STRING);
            portfolio.benchmark.name = BenchmarkConstants.BENCH_AGGREGATE;
            expect(service['getBenchmarkNameForEPNL'](portfolio)).toEqual(BenchmarkConstants.BENCH_AGGREGATE);
        });
    });

    it('Test setDefaultBatchReportFileName', () => {
        const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
        batchReport.fileName = 'Test';
        service.setDefaultBatchReportFileName(batchReport);
        expect(batchReport.fileName).toEqual('Test');
    });

    it('Test loadAllScheduledBatchConfigs', () => {
        service.loadAllScheduledBatchConfigs();
        expect(BatchExportingStore.scheduledBatchMap.get(12345)).toBeDefined();
    });

    describe('Test updateBatchReportTitleInScheduledBatchConfig', () => {
        it('Test updateBatchReportTitleInScheduledBatchConfig with no re-save call', () => {
            jest.spyOn(favoriteServiceStub, 'saveFavorite$');
            const batchReportConfig = BatchReportingTestUtils.createDummyBatchReportConfig();

            service.updateBatchReportTitleInScheduledBatchConfig(batchReportConfig);
            expect(favoriteServiceStub.saveFavorite$).not.toHaveBeenCalled();

            batchReportConfig.id = 12345;
            service.updateBatchReportTitleInScheduledBatchConfig(batchReportConfig);
            expect(favoriteServiceStub.saveFavorite$).not.toHaveBeenCalled();
        });

        it('Test updateBatchReportTitleInScheduledBatchConfig', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            BatchExportingStore.scheduledBatchMap.set(12345, BatchReportingTestUtils.createDummyScheduledBatchConfig());
            jest.spyOn(favoriteServiceStub, 'saveFavorite$');

            const batchReportConfig = BatchReportingTestUtils.createDummyBatchReportConfig();
            batchReportConfig.id = 12345;
            batchReportConfig.title = 'Old Title';
            jest.spyOn(moment.tz, 'guess').mockReturnValue('America/New_York');

            service.updateBatchReportTitleInScheduledBatchConfig(batchReportConfig);
            expect(favoriteServiceStub.saveFavorite$).toHaveBeenCalled();
        });
    });
});

export class BatchReportingTestUtils {
    static createDummyBatchReportConfig(): BatchReportConfig {
        const batchReportConfig = new BatchReportConfig();
        batchReportConfig.batchRowConfigs.push(BatchReportingTestUtils.createDummyBatchRowConfig());
        return batchReportConfig;
    }

    static createDummyBatchRowConfig(): BatchRowConfig {
        const batchRowConfig = new BatchRowConfig();
        batchRowConfig.portfolio = new Portfolio('PEP', new DateValue({
            date: '04/01/2020',
            calCode: 'GP_HK_STD',
            dateString: false,
            dateStringValue: ''
        }));
        batchRowConfig.portfolio.currency = 'USD';
        return batchRowConfig;
    }

    static createDummyScheduledBatchConfig(): ScheduledBatchConfig {
        const scheduledBatchConfig = new ScheduledBatchConfig();
        scheduledBatchConfig.batchReportConfigId = 12345;
        scheduledBatchConfig.author = 'rolin';
        scheduledBatchConfig.batchSchedules.push(BatchReportingTestUtils.createDummyBatchSchedule());
        return scheduledBatchConfig;
    }

    static createDummyBatchSchedule(): BatchSchedule {
        const batchSchedule = new BatchSchedule();
        batchSchedule.timeValue = '18:15';
        batchSchedule.timeZone = 'America/New_York';
        batchSchedule.frequency = new BatchMonthlyFrequency();
        batchSchedule.directory = 'batchFolder';
        batchSchedule.fileNamePrefix = 'Prefix';
        batchSchedule.dateLastUpdated = '04/08/2021';
        return batchSchedule;
    }
}
