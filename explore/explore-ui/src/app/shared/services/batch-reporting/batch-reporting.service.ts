import {Injectable} from '@angular/core';
import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {forkJoin, Observable, of, Subject, throwError} from 'rxjs';
import {
    AlertConstants,
    CalendarDateUtils,
    CoreCommonConstants,
    DateFormatConstants,
    DateService,
    DateValue,
    ErrorTypeConstants,
    ExploreDialogParam,
    TokenConstants,
    TokenUtils,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {BenchmarkConstants, ExportConstants, RequestConstants} from '../../../constants';
import {PortfolioService} from '../portfolio';
import {NotificationService} from '../notification';
import {catchError, concatMap, map, mergeMap, takeUntil} from 'rxjs/operators';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {AuxSelectOption, AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {BatchExportingStore, WorkspaceStore} from '../../../stores';
import {cloneDeep, find, isEmpty, some} from 'lodash';
import {BatchRowDownloadStatus} from '@enums/batch-reporting/batch-row-download-status.enum';
import {BatchExportAction} from '@models/batch-reporting/batch-export-action.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {BatchExportComposite} from '@models/export/export-composite/batch-export-composite.model';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {MultiRowBatchExportComposite} from '@models/export/export-composite/multi-row-batch-export-composite.model';
import {Http2BmsService} from '@services/bms';
import {ExportUtils} from '@utils/export/export.utils';
import {PortfolioUtils} from '@utils/portfolio.utils';
import {Report} from '@models/workspace/report.model';
import {FavoriteService} from '@services/favorite';
import {FavoriteConstants} from '@constants/favorite.constants';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';
import {isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';

@Injectable({
    providedIn: 'root'
})
export class BatchReportingService {

    static batchSettingsModalOpen$: Subject<boolean> = new Subject();
    static batchSchedulerModalOpen$: Subject<boolean> = new Subject();
    static scheduledBatchOverviewModalOpen$: Subject<boolean> = new Subject();
    numFailed: number;

    static convertBatchFileName(originalFileName: string, batchRow: BatchRowConfig, isMergeInOneFile: boolean): string {
        // Get the [PORTFOLIO] name to use in the file name
        const portfolio: Portfolio = (!isMergeInOneFile && BatchExportingStore.getCurrentPortfolio()) ? BatchExportingStore.getCurrentPortfolio() : batchRow.portfolio;
        let portfolioTitle = portfolio.getDisplayTitle();
        const portfolioCurrency = portfolio.currency;
        const benchmark = portfolio.benchmark ? portfolio.benchmark.name : '';

        // Adjust the portfolio ticket if this is a mergeInOneFile request
        // Run As Portfolios
        // 		- Single portfolio 'PEP -> ticker 'PEP'
        // 		- PortGroup 'CORE-HQ' -> ticker 'CORE-HQ'
        // 		- Custom Port Group 'PEP, CORE-HQ' -> first ticker 'PEP'
        //
        // Run As PortGroup
        // 		- Single portfolio 'PEP' -> ticker 'PEP'
        // 		- PortGroup 'CORE-HQ' -> ticker 'CORE-HQ'
        // 		- Custom Port Group 'PEP, CORE-HQ' -> full ticker but replace commas with empty space 'PEP  CORE-HQ'
        if (isMergeInOneFile) {
            portfolioTitle = batchRow.runAs === BatchExportRunAs.PORTFOLIOS ? portfolioTitle.split(',')[0] : portfolioTitle.replace(',', ' ');
        }

        // Date format hardcoded for now to match Prism
        const date = CalendarDateUtils.getDateInFormat(portfolio.datePicker.date, DateFormatConstants.DDMMYYYY_DASH);
        // If there is only one report, use the title of that report. Else, do nothing (empty string)
        const report = batchRow && batchRow.reports.length === 1 ? batchRow.reports[0].title : '';

        // Replace the filename with the special placeholders. Also replaces any periods with an empty string
        return originalFileName
            .replace(ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.PORTFOLIO, portfolioTitle)
            .replace(ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.DATE, date)
            .replace(ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.REPORT, report)
            .replace(ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.BENCHMARK, benchmark)
            .replace(ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.CURRENCY, portfolioCurrency)
            .replace(/\./g, '');
    }

    /**
     * Converts an ExportComposite into a BatchReportConfig for batch processing
     */
    static convertExportCompositeToBatchReportConfig(exportComposite: ExportComposite): BatchReportConfig {
        const batchReport = new BatchReportConfig();
        batchReport.mergeInOneFile = true;

        if (exportComposite instanceof WorkspaceExportComposite) {
            batchReport.fileName = exportComposite.workspace.title ? exportComposite.workspace.title : 'Explore Workspace';
            for (const workpad of exportComposite.workspace.workpads) {
                const workpadExportComposite = new WorkpadExportComposite();
                workpadExportComposite.workpad = workpad;
                workpadExportComposite.exportConfig = exportComposite.exportConfig;
                batchReport.batchRowConfigs.push(...BatchReportingService.convertWorkpadExportCompositeToBatchRowConfigs(workpadExportComposite));
            }
        } else if (exportComposite instanceof WorkpadExportComposite) {
            batchReport.fileName = (exportComposite.workpad as ReportGroup).title ? (exportComposite.workpad as ReportGroup).title : 'Explore Report Group';
            batchReport.batchRowConfigs.push(...BatchReportingService.convertWorkpadExportCompositeToBatchRowConfigs(exportComposite));
        }

        return batchReport;
    }

    /**
     * Converts a WorkpadExportComposite into a collection of BatchRowConfigs
     */
    static convertWorkpadExportCompositeToBatchRowConfigs(exportComposite: WorkpadExportComposite): BatchRowConfig[] {
        // Clone the workpad
        const workpad = cloneDeep(exportComposite.workpad);
        // Get the portfolio(s) of the workpad to iterate on
        const portfolios = workpad instanceof FlatWorkpad ? [workpad.portfolio] : [...(workpad as ReportGroup).portfolios];
        // Check if any of the reports have comparisons
        const hasComparisonInReports = some(workpad.reports, (report: Report) => workpad.hasComparisonPortfolios(report.comparisonConfigId));
        const batchRows: BatchRowConfig[] = [];

        // Create a BatchRowConfig for each of the report group portfolios
        for (const portfolio of portfolios) {
            const batchRowConfig = new BatchRowConfig();
            batchRowConfig.runAs = BatchExportRunAs.PORTGROUP;
            batchRowConfig.portfolio = portfolio;
            batchRowConfig.reports = workpad.reports;
            if (hasComparisonInReports) {
                // If any of the reports have comparisons, then add all of the portfolios onto the BatchRowConfig for later processing
                batchRowConfig.portfolios = portfolios;
            }
            batchRowConfig.exportConfig = exportComposite.exportConfig;
            batchRows.push(batchRowConfig);
        }

        return batchRows;
    }

    constructor(protected portfolioService: PortfolioService, protected notificationService: NotificationService, protected http2BmsService: Http2BmsService, protected favoriteService: FavoriteService, protected dateService: DateService) {
        BatchExportingStore.getCurrentBatchRow$()
            .subscribe((currentBatchRow: BatchRowConfig) => {
                // If the user canceled the batch, then we don't want to proceed
                if (BatchExportingStore.isBatchCanceled()) {
                    return;
                }
                if (currentBatchRow) {
                    this.processBatchRow(currentBatchRow);
                    this.updateBatchDownloadStatus();
                } else {
                    // If there are no more batch rows, then we are done
                    // reset the hard refresh flag for next time
                    BatchExportingStore.runHardRefresh$.next(false);
                }
            });
    }

    /**
     * Updates the batchDownloadStatus Subject based on if any batch rows are in progress
     */
    updateBatchDownloadStatus(): void {
        const batchReportConfig = BatchExportingStore.getCurrentBatchReport();
        BatchExportingStore.batchDownloadStatus$.next(batchReportConfig && some(batchReportConfig.batchRowConfigs, (row: BatchRowConfig) => row.downloadStatus === BatchRowDownloadStatus.IN_PROGRESS));
    }

    fetchPortInfo$(portfolio: Portfolio, isLightOverride: boolean, runAs: BatchExportRunAs, disableLoading = true): Observable<Portfolio> {
        return this.portfolioService.fetchPortfolioInformation$(portfolio, { isLightVersion: isLightOverride && runAs === BatchExportRunAs.PORTGROUP, includeMandate: true }, disableLoading, isAdhocPort(portfolio) ? portfolio.adhocParams : null, null, true)
            .pipe(
                map((updatedPort: Portfolio) => {
                    return updatedPort;
                }),
                catchError(error => {
                    console.error('Fetch portfolio information error', error);
                    this.notificationService.openDialog(
                        new ExploreDialogParam(
                            AlertConstants.TYPE.ALERT,
                            AlertConstants.HEADER.PORT_INFO_MISSING,
                            AlertConstants.BODY.PORT_INFO_MISSING,
                            AlertConstants.BTN.OK
                        ));
                    return throwError(error);
                })
            );
    }

    /**
     * Creates options for the batch row reports aux-select component
     * The options will be displayed in sections as follows:
     *
     * EPNL (if the token is enabled)
     * Reports that are currently in the Workspace
     * Favorite Reports
     */
    populateReportOptions(rowConfig: BatchRowConfig, existingReportOptions: AuxSelectOptionGroup[]): AuxSelectOptionGroup[] {
        // Initialize holders for the existing report options
        let existingWorkspaceReportOptions: AuxSelectOptionGroup;
        // If the existing report options aren't empty, then we set them to variables to access them later
        // We do this so we can keep track of what was previously selected by the user
        if (!isEmpty(existingReportOptions)) {
            for (const option of existingReportOptions) {
                if (option.auxId === ExportConstants.WORKSPACE_REPORT) {
                    // Link the existing workspace report options
                    existingWorkspaceReportOptions = option;
                }
            }
        }

        // Reinitialize empty options that we will fill (constructed based on the BatchRowConfig)
        const reportOptions = [];

        // Create a copy of the BatchRowConfig reports to keep track of
        // In case some of those reports are actually reports already in the workspace, then we don't want to add them
        // to the favorite reports section as it would show up twice (one in workspace reports and once in the favorites)
        const rowConfigReports = [...rowConfig.reports];

        // EPNL SECTION (Add an EPNL option if enabled)
        if (TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_EPNL)) {
            const epnlOption: AuxSelectOptionGroup = {
                values: [{
                    displayValue: ExportConstants.EPNL_REPORT,
                    value: ExportConstants.EPNL_REPORT,
                    isSelected: rowConfig.isEpnlReport
                }], auxId: ExportConstants.EPNL_REPORT
            };
            // Add it to the aux-select options
            reportOptions.push(epnlOption);
        }

        // WORKSPACE REPORTS (Try adding workspace reports if available)
        const workspaceReportOptions = {values: [], awId: ExportConstants.WORKSPACE_REPORT};
        // Loop through each workpad of the workspace
        for (const workpad of WorkspaceStore.getWorkspace().workpads) {
            // Loop through each report of each workpad
            for (const report of workpad.reports) {
                // Create an aux-select option for the report
                const workspaceReportOption: AuxSelectOption = {displayValue: report.title, value: report};
                // Check if the report exists in the BatchRowConfig reports
                const reportIndex = rowConfigReports.indexOf(report);
                if (reportIndex >= 0) {
                    // If the BatchRowConfig has a workspace report, remove it from the tracker so we don't add it twice
                    rowConfigReports.splice(reportIndex, 1);
                    workspaceReportOption.isSelected = true;
                } else if (existingWorkspaceReportOptions) {
                    // Fallback logic. It for some reason the workspace report isn't part of the BatchRowConfig reports
                    // check it against the existing options
                    for (const option of existingWorkspaceReportOptions.values) {
                        if (option.value === report) {
                            workspaceReportOption.isSelected = option.isSelected;
                        }
                    }
                }
                // Add it to the aux-select options
                workspaceReportOptions.values.push(workspaceReportOption);
            }
        }
        // If there are actually workspace report options, only then add it to the aux-select group options
        if (workspaceReportOptions.values.length) {
            reportOptions.push(workspaceReportOptions);
        }

        // FAVORITE REPORTS (Add reports remaining reports that are in the BatchRowConfig)
        const rowConfigReportOptions = {values: []};
        for (const selectedReport of rowConfigReports) {
            rowConfigReportOptions.values.push({
                displayValue: selectedReport.title,
                value: selectedReport,
                isSelected: true
            });
        }
        // If there are actually favorite = report options, only then add it to the aux-select group options
        if (rowConfigReportOptions.values.length) {
            reportOptions.push(rowConfigReportOptions);
        }
        return reportOptions;
    }

    /**
     * Callback to cascade a given date to all batch rows
     */
    cascadeDateToAllRows(rowConfig: BatchRowConfig): void {
        if (!rowConfig.portfolio.datePicker || !rowConfig.portfolio.datePicker.date) {
            return;
        }
        for (const row of BatchExportingStore.getCurrentBatchReport().batchRowConfigs) {
            if (row.portfolio && row.portfolio.datePicker) {
                row.portfolio.datePicker = cloneDeep(rowConfig.portfolio.datePicker);
            }
        }
    }

    /**
     * Callback to cascade a given currency to all batch rows
     */
    cascadeCurrencyToAllRows(rowConfig: BatchRowConfig): void {
        if (!rowConfig.portfolio.currency) {
            return;
        }
        for (const row of BatchExportingStore.getCurrentBatchReport().batchRowConfigs) {
            if (row.portfolio && row.portfolio.currency) {
                row.portfolio.currency = rowConfig.portfolio.currency;
            }
        }
    }

    /**
     * Callback to cascade selected report options to all batch rows
     */
    cascadeReportOptionsToAllRows(rowConfig: BatchRowConfig): void {
        if (!rowConfig.reports) {
            return;
        }
        for (const row of BatchExportingStore.getCurrentBatchReport().batchRowConfigs) {
            if (row === rowConfig) {
                continue;
            }
            if (row.reports) {
                row.reports = [...rowConfig.reports];
                row.reinitializeReportOptions();
            }
        }
    }

    /**
     * Cancels the current running batch export
     */
    cancelCurrentBatch(): void {
        BatchExportingStore.currentBatchExportAction.canceled = true;
        BatchExportingStore.batchCanceller$.next();
        // Set any in progress rows to canceled
        for (const batchRow of BatchExportingStore.currentBatchExportAction.batchReportConfig.batchRowConfigs) {
            batchRow.downloadStatus = batchRow.downloadStatus === BatchRowDownloadStatus.IN_PROGRESS ? BatchRowDownloadStatus.CANCELED : batchRow.downloadStatus;
        }
        this.updateBatchDownloadStatus();
        BatchExportingStore.clearStore();
        BatchExportingStore.runHardRefresh$.next(false); // setting to false in case user cancels the batch
    }

    /**
     * Runs batch export for epnl reports
     */
    private runEPNLBatchExport(batchReportConfig: BatchReportConfig) {
        const epnlRows = batchReportConfig.getActiveBatchRowEpnlConfigs();
        if (epnlRows.length <= 0) {
            return;
        }
        const epnlReportRequests: Observable<any>[] = [];
        epnlRows.forEach((epnlRow: BatchRowConfig) => {
            epnlReportRequests.push(this.createEPNLReportRequest(epnlRow));
        });
        forkJoin(epnlReportRequests).pipe(takeUntil(BatchExportingStore.batchCanceller$))
            .subscribe((responses: any[]) => {
                for (let i = 0; i < responses.length; i++) {
                    this.processEPNLReportResponse(responses[i], epnlRows[i]);
                }
            });
    }

    /**
     * Handles response for epnl request and downloads the epnl report pdf
     */
    private processEPNLReportResponse(response: any, epnlRow: BatchRowConfig): void {
        if (response && !response.isError && response.data
            && response.data.ReportLocation && response.data.ReportName
            && response.data.ReportContent) {
            ExportUtils.download(response.data.ReportContent, response.data.ReportName, 'application/pdf', undefined, false);
            epnlRow.downloadStatus = BatchRowDownloadStatus.COMPLETED;
            this.notificationService.success('EPNL Report Request Completed!');
        } else {
            this.notificationService.error('Error generating EPNL Report', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PROCESS_EPNL_REPORT_RESPONSE_ERROR );
            epnlRow.downloadStatus = BatchRowDownloadStatus.FAILED;
        }
    }

    /**
     * Creates a http request to download epnl report
     */
    private createEPNLReportRequest(epnlRow: BatchRowConfig): Observable<any> {
        epnlRow.downloadStatus = BatchRowDownloadStatus.IN_PROGRESS;
        // Parse date strings to make sure we pass in the correct dates for the EPNL request
        const startDateObs = this.parseEPNLDate$(epnlRow.portfolio.epnlSettings.calCode, epnlRow.portfolio.epnlSettings.fromDate);
        const endDateObs = this.parseEPNLDate$(epnlRow.portfolio.epnlSettings.calCode, epnlRow.portfolio.epnlSettings.toDate);
        return forkJoin([startDateObs, endDateObs]).pipe(
            concatMap((dates: string[]) => {
                return this.http2BmsService.post$(RequestConstants.GET_EPNL_RESPONSE, {
                    portfolio: epnlRow.portfolio.portName,
                    benchmark: this.getBenchmarkNameForEPNL(epnlRow.portfolio),
                    enableBirtSummary: epnlRow.portfolio.epnlSettings.enableBirtSummary,
                    enableHideLinks: epnlRow.portfolio.epnlSettings.enableHideLinks,
                    calCode: epnlRow.portfolio.epnlSettings.calCode,
                    portfolioRiskSettings: epnlRow.portfolio.portfolioRiskSettings ? epnlRow.portfolio.portfolioRiskSettings.getRequestParams() : {},
                    startDate: dates[0],
                    endDate: dates[1]
                });
            }),
            catchError(_err => of({isError: true}))
        );
    }

    /**
     * Parses the date to be used for the EPNL DateValue object (start or end)
     */
    public parseEPNLDate$(calCode: string, date: DateValue): Observable<string> {
        return date.dateString ?
            this.dateService.parseDateString$(calCode, date.dateStringValue)
                .pipe(map((response: Date) => {
                    return CalendarDateUtils.getDateInFormat(response, DateFormatConstants.MMDDYYYY_SLASH);
                }))
            : of(date.date);
    }

    /**
     * Returns the benchmark name for EPNL reports
     */
    private getBenchmarkNameForEPNL(portfolio: Portfolio): string {
        // If the name is Primary or Secondary, try to find the actual benchmark portfolio's name
        if (portfolio.benchmark.name === BenchmarkConstants.BENCH_SECONDARY || portfolio.benchmark.name === BenchmarkConstants.BENCH_PRIMARY) {
            // Iterate through the portfolio's benchmarks and find one matching of type and order (ex. 'RISK' 1)
            const bench: Benchmark = find(portfolio.benchmarks, function(item: any) {
                return item.type === portfolio.benchmark.type && item.order === portfolio.benchmark.order;
            });
            // If we found a matching benchmark, use that benchmark's name
            return bench ? bench.name : CoreCommonConstants.EMPTY_STRING;
        }
        // Return the name by default
        return portfolio.benchmark.name;
    }

    /**
     * Starts off the batch export process for a BatchReportConfig
     */
    runBatchExport(batchReportConfig: BatchReportConfig): void {
        if (!batchReportConfig.batchRowConfigs.length) {
            return;
        }
        this.numFailed = 0;
        // Format the file name's placeholders to be case insensitive
        this.formatFileNamePlaceholdersToUppercase(batchReportConfig);

        this.runEPNLBatchExport(batchReportConfig);

        const batchExportAction = new BatchExportAction(batchReportConfig);

        BatchExportingStore.currentBatchExportAction = batchExportAction;

        // If there are no active items, just get out of here
        if (!batchExportAction.remainingActiveBatchRows.length) {
            return;
        }
        // reset status labels during export
        for (const batchRow of batchReportConfig.batchRowConfigs) {
            batchRow.downloadStatus = BatchRowDownloadStatus.NONE;
        }

        if (batchReportConfig.mergeInOneFile) {
            // Set the download status of all rows to be in progress
            for (const batchRow of batchReportConfig.getActiveBatchRowConfigs()) {
                batchRow.downloadStatus = BatchRowDownloadStatus.IN_PROGRESS;
            }
            // Take the Excel BatchRowConfigs from the BatchExportAction's remainingActiveBatchRows
            // We need to separate them so the Excel rows can be processed in a single request to the server, without affecting the PDF flow
            const excelBatchRows = batchExportAction.splitExcelRowsForMergeInOneFileProcessing();
            if (excelBatchRows.length) {
                const multiRowBatchExportComposite = new MultiRowBatchExportComposite();
                multiRowBatchExportComposite.batchExportComposites = excelBatchRows.map((batchRow) => {
                    const batchExportComposite = new BatchExportComposite();
                    batchExportComposite.batchRow = batchRow;
                    batchExportComposite.exportConfig = batchRow.exportConfig;
                    batchExportComposite.portfolio = batchRow.portfolio;
                    return batchExportComposite;
                });
                // Just take the first exportConfig and set it onto the MultiRowBatchExportComposite
                multiRowBatchExportComposite.exportConfig = excelBatchRows[0].exportConfig;
                BatchExportingStore.batchExportQueue.push(multiRowBatchExportComposite);
                if (BatchExportingStore.getBatchContainerStatus() === BatchContainerStatus.IDLE) {
                    // Only set the batch container status to PRELOAD if it's currently IDLE.
                    // Because if it's not IDLE, then an export is currently running and we'll get to the newly added ExportComposite eventually
                    BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.PRELOAD);
                }
            }
        } else {
            this.setDefaultBatchReportFileName(batchReportConfig);
        }
        batchExportAction.moveNextBatchRow();
        this.updateBatchDownloadStatus();
    }

    /**
     * Processes a BatchRowConfig and creates ExportComposites for each portfolio/report combo
     */
    processBatchRow(batchRow: BatchRowConfig): void {
        batchRow.downloadStatus = BatchRowDownloadStatus.IN_PROGRESS;
        batchRow.skippedRequests = [];
        this.getPortfoliosForBatchRow$(batchRow)
            .subscribe((portfolios: Portfolio[]) => {
                // If the user canceled the batch, then we don't want to proceed
                if (BatchExportingStore.isBatchCanceled()) {
                    return;
                }
                const batchRowExportComposites: ExportComposite[] = [];

                if (batchRow.exportConfig instanceof PDFExportConfig) {
                    this.processBatchRowPDF(batchRow, portfolios, batchRowExportComposites);
                    if (isEmpty(batchRowExportComposites)) {
                        batchRow.downloadStatus = BatchRowDownloadStatus.FAILED;
                        return;
                    }
                    // Set the last exportComposite of the BatchRowConfig to be last ONLY if
                    // This is not a merge in one file
                    batchRowExportComposites[batchRowExportComposites.length - 1].isLast = !BatchExportingStore.currentBatchExportAction.batchReportConfig.mergeInOneFile;

                    // If it is merge in one file, then this is the last of the PDF batchRows within the BatchReportConfig
                    if (BatchExportingStore.currentBatchExportAction.batchReportConfig.mergeInOneFile) {
                        const activePDFBatchRows = BatchExportingStore.currentBatchExportAction.batchReportConfig.getActivePDFBatchRowConfigs();
                        batchRowExportComposites[batchRowExportComposites.length - 1].isLast = activePDFBatchRows[activePDFBatchRows.length - 1] === batchRow;
                    }
                } else if (batchRow.exportConfig instanceof ExcelExportConfig) {
                    const batchExportComposite = new BatchExportComposite();
                    batchExportComposite.batchRow = batchRow;
                    batchExportComposite.exportConfig = batchRow.exportConfig;
                    batchExportComposite.portfolio = batchRow.portfolio;
                    batchRowExportComposites.push(batchExportComposite);
                }
                BatchExportingStore.batchExportQueue = [...BatchExportingStore.batchExportQueue, ...batchRowExportComposites];
                if (BatchExportingStore.getBatchContainerStatus() === BatchContainerStatus.IDLE) {
                    // Only set the batch container status to PRELOAD if it's currently IDLE.
                    // Because if it's not IDLE, then an export is currently running and we'll get to the newly added ExportComposites eventually
                    BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.PRELOAD);
                }
            });
    }

    /**
     * ProcessBatchRow method for PDFExportConfig
     */
    processBatchRowPDF(batchRow: BatchRowConfig, portfolios: Portfolio[], batchRowExportComposites: ExportComposite[]): void {
        for (const portfolio of portfolios) {
            for (const report of batchRow.reports) {
                // If the report doesn't have any widgets, don't create a BatchExportComposite for it
                if (isEmpty(report.widgets)) {
                    continue;
                }
                const exportComposite = new BatchExportComposite();
                exportComposite.report = report;
                exportComposite.exportConfig = batchRow.exportConfig;
                exportComposite.portfolio = portfolio;
                if (BatchExportingStore.getCurrentWorkpad()?.hasComparisonPortfolios(report.comparisonConfigId)) {
                    // If this report has a valid ComparisonConfig, then add all of the portfolios onto the exportComposite so the proper data request can be made
                    exportComposite.portfolios = batchRow.portfolios;
                }
                exportComposite.batchRow = batchRow;
                batchRowExportComposites.push(exportComposite);
            }
        }
    }

    /**
     * Sets the portfolios onto a batchRow for processing
     */
    getPortfoliosForBatchRow$(batchRow: BatchRowConfig): Observable<Portfolio[]> {
        // Set a flag for if we only need the main portfolio from the BatchRowConfig
        // Based on if it's run as PortGroup, BatchRow request for Excel or it's a normal portfolio (not portGroup or composite)
        const needMainBatchPortfolioOnly: boolean = batchRow.runAs === BatchExportRunAs.PORTGROUP || batchRow.exportConfig instanceof ExcelExportConfig || !batchRow.portfolio.isCompositeOrPortGroup();
        // If the portfolio is initialized and we only need that portfolio, then return an observable with the lone port
        if (batchRow.portfolio.isInitialized() && needMainBatchPortfolioOnly) {
            return of([batchRow.portfolio]);
        }
        // If not, fetch port info. Make a non-light port info request for the child portfolios only if we need to
        return this.fetchPortInfo$(batchRow.portfolio, needMainBatchPortfolioOnly, batchRow.runAs)
            .pipe(
                mergeMap((mainPortfolio: Portfolio) => {
                    // If we only need the main portfolio, return that porfolio in an observable
                    if (needMainBatchPortfolioOnly) {
                        return of([mainPortfolio]);
                    }
                    // Go through all of the child portfolios and grab only the leaf level portfolios
                    const leafPorts = PortfolioUtils.getAllLeafLevelPortfolios(mainPortfolio);
                    const portInfoObservables: Observable<Portfolio>[] = [];
                    // Get port info and create a Portfolio object for each
                    for (const leafPort of leafPorts) {
                        leafPort.datePicker = cloneDeep(batchRow.portfolio.datePicker);
                        portInfoObservables.push(this.portfolioService.fetchPortfolioInformation$(leafPort, { isLightVersion: true, includeMandate: false }, true)
                            .pipe(
                                catchError((error) => of(error))
                            )
                        );
                    }
                    return forkJoin(portInfoObservables)
                        .pipe(
                            mergeMap((portfolios: Portfolio[]) => {
                                this.setBenchmarksOnBatchPortfolios(cloneDeep(batchRow.portfolio.benchmark), portfolios);
                                PortfolioUtils.copyPortfolioSettingsToPortfolios(batchRow.portfolio, portfolios);
                                return of(portfolios);
                            })
                        );
                })
            );
    }

    /**
     * Loops through the portfolios passed in to set the benchmark based on the Benchmark passed in
     */
    setBenchmarksOnBatchPortfolios(topLevelBenchmark: Benchmark, portfolios: Portfolio[]): void {
        for (const portfolio of portfolios) {
            if (topLevelBenchmark.type.toUpperCase() === BenchmarkConstants.OTHER_BENCH.toUpperCase()) {
                // We check for both upper case because there are Prism favorites that return type as 'OTHER' when we expect 'Other' in Explore

                // If the old benchmark is an 'other' benchmark, just set that
                topLevelBenchmark.type = BenchmarkConstants.OTHER_BENCH;
                portfolio.benchmark = topLevelBenchmark;
            } else if (topLevelBenchmark.type.toUpperCase() === BenchmarkConstants.NONE_BENCH.toUpperCase() || (portfolio.benchmarks && !portfolio.benchmarks.length)) {
                // We check for both upper case because there are Prism favorites that return type as 'NONE' when we expect 'None' in Explore

                // If the old benchmark is an 'none' benchmark, just set that
                // Or if there are no benchmarks to even iterate on, just default to 'None' benchmark
                portfolio.benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
            } else {
                // Iterate through the portfolio's benchmarks and find one matching of type and order (ex. 'RISK' 1)
                const bench: any = find(portfolio.benchmarks, (item: Benchmark) => {
                    return item.type === topLevelBenchmark.type && item.order === topLevelBenchmark.order;
                });
                // If we found a matching benchmark, we can use the old benchmark with the correct name
                // We do this because of the case where users switch between runAs Portfolios and PortGroup
                if (bench) {
                    portfolio.benchmark = bench;
                } else {
                    // Else just set the default bench
                    portfolio.setDefaultBenchmark();
                }
            }
        }
    }

    /**
     * Format the batchReportConfig's filename so we can case-insensitively handle
     */
    formatFileNamePlaceholdersToUppercase(batchReportConfig: BatchReportConfig): void {
        // We're going to check if the user typed any placeholders and ensure they are properly uppercase
        // Ex. [portfolio] will be replaced with [PORTFOLIO]
        const regex = /\[portfolio\]|\[date\]|\[report\]|\[bench\]|\[currency\]/gi;

        function upperCase(match: string) {
            return match.toUpperCase();
        }

        batchReportConfig.fileName = batchReportConfig.fileName.replace(regex, upperCase);
    }

    /**
     * Set a default file name of '[PORTFOLIO] [DATE] [REPORT]'
     */
    setDefaultBatchReportFileName(batchReportConfig: BatchReportConfig): void {
        if (!batchReportConfig.fileName) {
            batchReportConfig.fileName = ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.PORTFOLIO + ' ' + ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.DATE + ' ' + ExportConstants.BATCH_FILE_NAME_PLACEHOLDER.REPORT;
        }
    }

    /**
     * Loads all the ScheduleBatchConfig favorites
     */
    loadAllScheduledBatchConfigs(): void {
        this.favoriteService.getAllFavorites$(FavoriteConstants.ADMIN_USER, ScheduledBatchConfig.configType)
            .subscribe((scheduledBatchConfigs: ScheduledBatchConfig[]) => {
                for (const scheduledBatchConfig of scheduledBatchConfigs) {
                    // Add the schedules to the map keyed with the batch report config's id, NOT the actual schedule favorite id
                    BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig.batchReportConfigId, scheduledBatchConfig);
                }
            });
    }

    updateBatchReportTitleInScheduledBatchConfig(batchReportConfig: BatchReportConfig): void {
        const scheduledBatchConfig = BatchExportingStore.scheduledBatchMap.get(batchReportConfig?.id);

        // If you don't find a matching schedule OR you find a schedule but the titles are the same, then do nothing
        if (!scheduledBatchConfig || scheduledBatchConfig.title === batchReportConfig.title) {
            return;
        }
        // Set the new title onto the schedule
        scheduledBatchConfig.title = batchReportConfig.title;
        // Save the schedule so the title gets updated
        this.favoriteService.saveFavorite$(scheduledBatchConfig.createFavorite(scheduledBatchConfig.getConfigType()), FavoriteConstants.ADMIN_USER);
    }
}

