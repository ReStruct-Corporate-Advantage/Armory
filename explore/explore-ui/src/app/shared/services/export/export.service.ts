import jsPDF from 'jspdf';
import {convert} from '../../../../../projects/html2canvas/html2canvas';
import * as momentTz from 'moment-timezone';
import compositionConfigJson from '@assets/composition-config/CompositionConfig.json';
import {Injectable} from '@angular/core';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {BatchExportingStore, WorkspaceStore} from '../../../stores';
import {Http2BmsService} from '@services/bms';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {concat, forkJoin, Observable, of, throwError} from 'rxjs';
import {concatMap, delay, flatMap, takeUntil} from 'rxjs/operators';
import {AppUtils} from '@utils/app.utils';
import {ExportUtils} from '@utils/export/export.utils';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {cloneDeep, flattenDeep, isEmpty, isNil, isUndefined, map, some} from 'lodash';
import {PDFPageMargin} from '@models/export/pdf-page-margin.model';
import {PDFExportOrientation} from '@enums/export/pdf-export-orientation.enum';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {ChartUtils} from '@utils/chart.utils';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {ExportServiceConstants} from './export-service.constants';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {PDFExportAction} from '@models/export/pdf-export-action.model';
import {ROOT_LEVEL} from '@utils/qbstr';
import {BatchRowDownloadStatus} from '@enums/batch-reporting/batch-row-download-status.enum';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {BatchExportComposite} from '@models/export/export-composite/batch-export-composite.model';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExportConfig} from '@interfaces/export-config.interface';
import {MultiRowBatchExportComposite} from '@models/export/export-composite/multi-row-batch-export-composite.model';
import {ExcelExportComposite, isExcelExportComposite} from '@interfaces/excel-export-composite.interface';
import {ExportConstants, ExportLevel} from '@constants/export.constants';
import {HttpParams} from '@angular/common/http';
import {ArrayUtils} from '@utils/array.utils';
import {CommonConstants} from '@constants/common.constants';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {Widget} from '@models/widget/widget.model';
import {Breakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {ExploreConstants} from '@constants/explore.constants';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {PDFLogoPosition} from '@enums/export/pdf-logo-position.enum';
import {URLConstants} from '@constants/url.constants';
import {CompositionConstants} from '@constants/composition.constants';
import {NotificationService} from '@services/notification';
import {
    CalendarDateUtils,
    ColumnConstants,
    CommonUtils,
    CoreCommonConstants,
    DateFormatConstants,
    ErrorTypeConstants,
    UIErrorParameters,
    WidgetConfigType,
    WidgetInput,
    WidgetType
} from '@blk/explore-ui-core';
import {AppStore} from '../../../app.store';
import {WorkpadUtils} from '@utils/workpad.utils';
import {RequestConstants} from '@constants/request.constants';
import {ImageExportConfig} from '@models/export/image-export-config.model';
import {LogoConfig, LogoInfo} from '@models/export/logo-config.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {BatchRowSkippedRequest} from '@models/batch-reporting/batch-row-skipped-request.model';

const WIDGET_CONFIGS_EXPORT_EXCEL_SKIP = [WidgetConfigType.CMBS_MAP, WidgetConfigType.FACTOR_GRAPHING_BAR_CHART, WidgetConfigType.FACTOR_GRAPHING_PIE_CHART,
    WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART];
const PDF_LOGO_SIZE = 30;
@Injectable({
    providedIn: 'root'
})
/**
 * Service for export files
 */
export class ExportService {
    private static readonly PNG_FILE_FORMAT = 'PNG';
    widgetCounter = 0; // Counter to keep track of how many widgets are in progress
    batchPDFDebugMode = false;

    /**
     * Generates header text for a PDF
     */
    static generateHeaderText(exportComposite: ExportComposite): string {
        const portTicker = exportComposite.portfolio.getDisplayTitle().length > 30 ? exportComposite.portfolio.getDisplayTitle().slice(0, 28) + '..' : exportComposite.portfolio.getDisplayTitle();
        let benchmark = exportComposite.portfolio.benchmark.name ? exportComposite.portfolio.benchmark.name : exportComposite.portfolio.benchmark.type;
        // If benchmark type is benchAggregate, we want to show it as Group Aggregate or Group Aggregate-Secondary based on benchmark.name
        if (exportComposite.portfolio.benchmark.type === BenchmarkConstants.BENCH_AGGREGATE) {
            benchmark = exportComposite.portfolio.benchmark.name === BenchmarkConstants.BENCH_PRIMARY ? BenchmarkConstants.GROUP_AGGREGATE : BenchmarkConstants.GROUP_AGGREGATE_DASH_SEC;
        }
        // If there is an HTML less than character, replace it with '<' for the PDF
        // We only add '&lt' to properly render < within HTML for batch flows
        let reportTitle = exportComposite.report.title.replace('&lt', '<');
        reportTitle = reportTitle.length > 25 ? reportTitle.slice(0, 23) + '..' : reportTitle;
        // Fetch full name of benchmark if available
        const benchmarkFullName = exportComposite.portfolio.benchmark.portfolio ? exportComposite.portfolio.benchmark.portfolio.fullName : benchmark;
        const fullNameHeader = exportComposite.portfolio.fullName + ' (' + benchmarkFullName + ')';
        return fullNameHeader + '\n' + portTicker + ' - ' + CalendarDateUtils.getDateInFormat(exportComposite.portfolio.datePicker.date, DateFormatConstants.DDMMMYYYY_DASH).toUpperCase() + ' - ' + benchmark + ' - ' + exportComposite.portfolio.currency + ' > ' + reportTitle;
    }

    /**
     * Scales logo width or height based on the dimensions passed in
     */
    static getLogoInfo(w: number, h: number): LogoInfo {
        // Default to 30x30 dimensions for the logo
        let width: number = PDF_LOGO_SIZE;
        let height: number = PDF_LOGO_SIZE;
        if (h > w) {
            // If the height is greater than the width, scale down the width so the proportions are maintained
            width = PDF_LOGO_SIZE * (w / h);
        } else if (w > h) {
            // If the width is greater than the height, scale down the height so the proportions are maintained
            height = PDF_LOGO_SIZE * (h / w);
        }
        return new LogoInfo(width, height);
    }

    /**
     * Loads a base64 encoded image and gets the width/height information
     */
    static async loadLogoInfo(logoConfig: LogoConfig): Promise<LogoInfo> {
        // If the logo doesn't have a valid height & width, load the image and set it onto the logoConfig
        if (!logoConfig.hasValidWidthAndHeight()) {
            const logoImg = new Image();
            logoImg.src = logoConfig.logoImageFile;

            try {
                await logoImg.decode();
                logoConfig.logoWidth = logoImg.width;
                logoConfig.logoHeight = logoImg.height;
            } catch (e) {
                console.error('Issue when loading logo image: ', e);
            }
        }

        return Promise.resolve(ExportService.getLogoInfo(logoConfig.logoWidth, logoConfig.logoHeight));
    }

    /**
     * Generates footer text for a PDF with timestamp
     */
    static generateFooterTextWithTimestamp(): string {
        // Create a moment object with time zones
        const now = momentTz.tz(momentTz.tz.guess());
        return 'Confidential - For Internal Use Only ' + now.format('MMM D YYYY HH:mm:ss zz');
    }

    /**
     * Adding header , footer to the PDF report. Function also has the option to append the logo to any corner of the PDF the user wishes to
     */
    static async addHeaderFooterLogo(fontSize, exportConfig, pdfExportAction, pdfDoc): Promise<void> {
        const logoPosition = exportConfig.logoConfig.logoPosition;
        const pageNumber = pdfDoc.internal.getNumberOfPages().toString();
        const pdfDocWidth = pdfDoc.internal.pageSize.getWidth();
        const pdfDocHeight = pdfDoc.internal.pageSize.getHeight();

        function headerFooterLine() {
            return pdfDoc.line(exportConfig.pageMargin.left, exportConfig.pageMargin.top, pdfDocWidth - exportConfig.pageMargin.right, exportConfig.pageMargin.top, 'S'),
                pdfDoc.line(exportConfig.pageMargin.left, pdfDocHeight - exportConfig.pageMargin.bottom, pdfDocWidth - exportConfig.pageMargin.right, pdfDocHeight - exportConfig.pageMargin.bottom, 'S');
        }

        function footerContent() {
            // when logo is not in bottom left corner, the footer text always remains at bottom left
            return pdfDoc.text(exportConfig.pageMargin.left, pdfDocHeight - (exportConfig.pageMargin.bottom - fontSize / 1.25), pdfExportAction.footerText),
                pdfDoc.text(exportConfig.pageMargin.left, pdfDocHeight - (exportConfig.pageMargin.bottom - fontSize * 1.75), 'Powered by BlackRock Solutions \xAE');
        }

        function headerContent() {
            // when logo is not in top left corner , the header text always remains at top left
            return pdfDoc.text(exportConfig.pageMargin.left, exportConfig.pageMargin.top - fontSize, pdfExportAction.headerText);
        }

        if (exportConfig.logoConfig.logoPresent) {
            const logoInfo: LogoInfo = await ExportService.loadLogoInfo(exportConfig.logoConfig);
            if (logoPosition === PDFLogoPosition.TOP_LEFT) {
                // Case 2 where logo is at top left - headertext at top right - pagenumber at bottom right - footer at bottom left
                ExportService.addLogoImage(pdfDoc, exportConfig.logoConfig.logoImageFile, exportConfig.pageMargin.left, exportConfig.pageMargin.top - logoInfo.height - PDF_LOGO_SIZE / 3, logoInfo.width, logoInfo.height);
                pdfDoc.text(pdfDocWidth - exportConfig.pageMargin.right - 2 * (pdfExportAction.headerText.length), exportConfig.pageMargin.top - fontSize, pdfExportAction.headerText);
                headerFooterLine();
                footerContent();
                pdfDoc.text(pdfDocWidth - exportConfig.pageMargin.right - (18 + 5 * pageNumber.length), pdfDocHeight - (exportConfig.pageMargin.bottom - fontSize * 1.75), 'Page ' + pageNumber);
            } else if (logoPosition === PDFLogoPosition.BOTTOM_LEFT) {
                // Case 4 where logo is at bottom left - headertext at top left - pagenumber at top right - footer at bottom right
                headerContent();
                pdfDoc.text(pdfDocWidth - exportConfig.pageMargin.right - (18 + 5 * pageNumber.length), exportConfig.pageMargin.top - fontSize, 'Page ' + pageNumber);
                headerFooterLine();
                pdfDoc.text(pdfDocWidth - exportConfig.pageMargin.right - 3 * (pdfExportAction.footerText.length), pdfDocHeight - (exportConfig.pageMargin.bottom - fontSize / 1.25), pdfExportAction.footerText);
                pdfDoc.text(pdfDocWidth - exportConfig.pageMargin.right - 3 * (pdfExportAction.footerText.length), pdfDocHeight - (exportConfig.pageMargin.bottom - fontSize * 1.75), 'Powered by BlackRock Solutions \xAE');
                ExportService.addLogoImage(pdfDoc, exportConfig.logoConfig.logoImageFile, exportConfig.pageMargin.left, pdfDocHeight - exportConfig.pageMargin.bottom + PDF_LOGO_SIZE / 3, logoInfo.width, logoInfo.height);
            } else if (logoPosition === PDFLogoPosition.BOTTOM_RIGHT) {
                // Case 3 where logo is at bottom right - headertext at top left - pagenumber at top right - footer at bottom left
                headerContent();
                pdfDoc.text(pdfDocWidth - exportConfig.pageMargin.right - (18 + 5 * pageNumber.length), exportConfig.pageMargin.top - fontSize, 'Page ' + pageNumber);
                headerFooterLine();
                footerContent();
                ExportService.addLogoImage(pdfDoc, exportConfig.logoConfig.logoImageFile, pdfDocWidth - exportConfig.pageMargin.right - logoInfo.width, pdfDocHeight - exportConfig.pageMargin.bottom + PDF_LOGO_SIZE / 3, logoInfo.width, logoInfo.height);
            } else if (logoPosition === PDFLogoPosition.TOP_RIGHT) {
                // Case 1 where logo is at top right - headertext at top left - pagenumber at bottom right - footer at bottom left
                headerContent();
                ExportService.addLogoImage(pdfDoc, exportConfig.logoConfig.logoImageFile, pdfDocWidth - exportConfig.pageMargin.right - logoInfo.width, exportConfig.pageMargin.top - logoInfo.height - PDF_LOGO_SIZE / 3, logoInfo.width, logoInfo.height);
                headerFooterLine();
                footerContent();
                pdfDoc.text(pdfDocWidth - exportConfig.pageMargin.right - (18 + 5 * pageNumber.length), pdfDocHeight - (exportConfig.pageMargin.bottom - fontSize * 1.75), 'Page ' + pageNumber);
            }
        } else {
            // Case when logo attachment option is not selected
            headerContent();
            headerFooterLine();
            footerContent();
            pdfDoc.text(pdfDocWidth - exportConfig.pageMargin.right - (18 + 5 * pageNumber.length), pdfDocHeight - (exportConfig.pageMargin.bottom - fontSize * 1.75), 'Page ' + pageNumber);
        }

        return new Promise<void>((resolve) => {
            resolve();
        });
    }

    /**
     * Wrapper method to add logo image to the pdf
     */
    static addLogoImage(pdfDoc: any, logoImageFile: string, x: number, y: number, width: number, height: number): void {
        // Check if the provided image + coordinates are valid
        if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
            // If they're not valid, set a flag so that when we save the PDF, we warn the user that there was an issue with adding the logo.
            pdfDoc.notifyPDFLogoFailure = true;
            return;
        }
        pdfDoc.addImage(logoImageFile, ExportService.PNG_FILE_FORMAT, x, y, width, height);
    }

    constructor(protected widgetServiceRegistry: WidgetServiceRegistry, protected http2BmsService: Http2BmsService, protected batchReportingService: BatchReportingService, protected notificationService: NotificationService) {
        this.batchPDFDebugMode = CommonUtils.getURLParam(URLConstants.SHOW_BATCH_PDF_TOGGLE_BUTTON) === 'true';
        // Subscribe to changes in the BatchContainerStatus
        BatchExportingStore.getBatchContainerStatus$()
            .subscribe((batchStatus: BatchContainerStatus) => {
                // If the user canceled the batch, then we don't want to proceed
                if (BatchExportingStore.isBatchCanceled() || (BatchExportingStore.currentBatchExportAction && BatchExportingStore.currentBatchExportAction.canceled)) {
                    return;
                }
                if (batchStatus === BatchContainerStatus.PRELOAD) {
                    this.batchExportPreloadSequence();
                } else if (batchStatus === BatchContainerStatus.READY) {
                    if (!BatchExportingStore.isBatchCanceled()) {
                        this.batchPDFDebugLog('Batch Container is READY. Current ExportComposite:', BatchExportingStore.currentExportComposite);
                        this.exportPDF(BatchExportingStore.currentExportComposite);
                    }
                    BatchExportingStore.currentReport$.next(undefined);
                } else if (batchStatus === BatchContainerStatus.IDLE) {
                    // If the status is idle, that means that we are done with all ExportComposites in the batchExportQueue;
                    if (BatchExportingStore.currentBatchExportAction && !BatchExportingStore.currentBatchExportAction.canceled && BatchExportingStore.getCurrentBatchRow()) {
                        // Only set the status to COMPLETED if the current status of the row is IN_PROGRESS
                        // (This is the last step of the batch process. The status will get updated in between, so if it's in progress, that means it went on without issue)
                        if (BatchExportingStore.getCurrentBatchRow().downloadStatus === BatchRowDownloadStatus.IN_PROGRESS) {
                            BatchExportingStore.getCurrentBatchRow().downloadStatus = BatchRowDownloadStatus.COMPLETED;
                        }
                        this.batchReportingService.updateBatchDownloadStatus();
                        // If there is a current BatchExportAction then move the next batch row into action
                        BatchExportingStore.currentBatchExportAction.moveNextBatchRow();
                    }
                }
            });

        // Subscribe to the PDFExportAction observable so we know when to process PDF export actions
        BatchExportingStore.getCurrentPDFExportAction$()
            .subscribe((pdfExportAction: PDFExportAction) => {
                // If the user canceled the batch, then we don't want to proceed
                if (BatchExportingStore.isBatchCanceled()) {
                    return;
                }
                if (!pdfExportAction) {
                    return;
                } else if (pdfExportAction.exportSingleElementOnly() && !(pdfExportAction.exportComposite instanceof BatchExportComposite)) {
                    this.widgetCounter = 1;
                    this.renderElementOnCanvas(pdfExportAction);
                } else {
                    // Increment the widgetCounter by 1
                    // This will help us keep track of what multiple of widget we are on, for processing multi-widget page layouts
                    this.widgetCounter++;
                    this.renderNextWidget(pdfExportAction);
                }
            });
    }

    /**
     * Callback when batch container is in PRELOAD step
     */
    batchExportPreloadSequence(): void {
        const currentExportComposite = BatchExportingStore.batchExportQueue.shift();
        // Take the first ExportComposite in the queue
        BatchExportingStore.currentExportComposite = currentExportComposite;
        BatchExportingStore.currentPortfolio$.next(currentExportComposite.portfolio);
        BatchExportingStore.currentWorkpad$.next(WorkspaceStore.getCurrentWorkpad());
        // If it's an Excel Batch export composite, catch it here
        const isExcel = currentExportComposite.exportConfig instanceof ExcelExportConfig;
        const isBatch = currentExportComposite instanceof BatchExportComposite;
        if (currentExportComposite instanceof MultiRowBatchExportComposite || (isBatch && isExcel)) {
            this.downloadBatchExcel(currentExportComposite)
                .subscribe((success: boolean) => {
                    if (success) {
                        this.updateBatchExportCompositeStatuses(currentExportComposite, BatchRowDownloadStatus.COMPLETED);
                    } else if (isBatch && currentExportComposite.batchRow.skippedRequests.length) {
                        // If we're here, the observable chain emitted false (failure of some sort)
                        // If it's batch AND there are skipped widgets in the batch row, then set the status to PARTIAL
                        this.updateBatchExportCompositeStatuses(currentExportComposite, BatchRowDownloadStatus.PARTIAL);
                    }
                }, (error: boolean) => {
                    this.updateBatchExportCompositeStatuses(currentExportComposite, BatchRowDownloadStatus.FAILED);
                });
            return;
        }
        const newReport = cloneDeep(BatchExportingStore.currentExportComposite.report);
        // Need to recreate data stores other wise the subscriptions get copied over and get invoked on original widget when performing export to pdf
        // Create a map to store the newly created widget dataStores for future potential linking of parent dataStores
        const newDataStores = new Map<string, WidgetDataStore>();
        // Create dataStore copies for each widget
        newReport.widgets.forEach((widget: Widget) => {
            // TEMPORARILY SKIP CMBS MAP && FACTOR ANALYSIS GRAPH FROM EXPORT FOR EXCEL
            if (WIDGET_CONFIGS_EXPORT_EXCEL_SKIP.includes(widget.configType) && isExcel) {
                const widgetMessage = widget.configType === WidgetConfigType.CMBS_MAP ? 'Map' : 'Factor Based Graph';
                this.notificationService.warning(`Export of the ${widgetMessage} Widget is currently not supported and will not be included.`, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_BATCH_CONTAINER_STATUS_WARNING);
                return;
            }
            const dataStore = new WidgetDataStore();
            dataStore.copy(widget.dataStore);
            widget.dataStore = dataStore;
            newDataStores.set(dataStore.name, dataStore);
        });
        // After all new dataStores have been created, loop once more to correctly attach parent dataStores
        newReport.widgets.forEach((widget: Widget) => {
            if (widget.dataStore.isDependentOnParentForData) {
                widget.dataStore.parentDataStore = newDataStores.get(widget.dataStore.parentDataStore.name);
            }
        });
        // TEMPORARILY SKIP CMBS MAP && FACTOR ANALYSIS GRAPH FROM EXPORT FOR EXCEL
        if (isExcel) {
            newReport.widgets = newReport.widgets.filter((widget: Widget) => !WIDGET_CONFIGS_EXPORT_EXCEL_SKIP.includes(widget.configType));
        }
        this.batchPDFDebugLog('Preparing to load report into batch container. Current ExportComposite:', currentExportComposite);
        // Set the report in the batch exporting store so that the batch-container can pass it to the report-presenter
        BatchExportingStore.currentReport$.next(newReport);
    }

    /**
     * Updates the batch row statuses
     */
    updateBatchExportCompositeStatuses(exportComposite: MultiRowBatchExportComposite|BatchExportComposite, status: BatchRowDownloadStatus): void {
        const batchComposites = exportComposite instanceof MultiRowBatchExportComposite ? exportComposite.batchExportComposites : [exportComposite];
        for (const batchExportComposite of batchComposites) {
            batchExportComposite.batchRow.downloadStatus = status;
        }
        // When we're done with the Batch Row, set the container status so we may move onto the next ExportComposite in the queue
        this.setBatchContainerStatus();
        this.batchReportingService.updateBatchDownloadStatus();
    }

    /**
     * Batch PDF logger method. Only logs if the batch pdf debug url param is true
     */
    batchPDFDebugLog(message: string, ...loggableObjects: any): void {
        if (!this.batchPDFDebugMode) {
            return;
        }
        console.log(message, loggableObjects);
    }

    /**
     * Callback to export Batch Excel files
     */
    public downloadBatchExcel(exportComposite: ExportComposite): Observable<boolean> {
        let exportURL: string;
        let fileName: string;
        const finalRequest: any = {};
        const batchRequests: any[] = [];
        const exportOptions = exportComposite.exportConfig.serialize();
        const appendTimestamp = this.getAppendTimestamp(exportComposite, exportOptions);

        if (exportComposite instanceof MultiRowBatchExportComposite) {
            if (!BatchExportingStore.currentBatchExportAction) {
                return of(false);
            }
            for (const batchExportComposite of exportComposite.batchExportComposites) {
                const batchRowExportOptions = batchExportComposite.exportConfig.serialize();
                batchRowExportOptions.runAs = BatchExportRunAs[batchExportComposite.batchRow.runAs];
                batchRequests.push({
                    _widgetRequests: this.generateWidgetRequestsForBatch(batchExportComposite.batchRow.portfolio, batchExportComposite.batchRow.reports, batchExportComposite.exportConfig),
                    _exportConfig: batchRowExportOptions
                });
            }
            exportURL = ExportServiceConstants.BATCH_EXCEL_EXPORT_CMD;
            fileName = BatchExportingStore.getCurrentBatchReport().fileName ? BatchExportingStore.getCurrentBatchReport().fileName : 'Explore Merged Batch Report';
            finalRequest.singleFile = true;
            finalRequest.downloadDir = BatchExportingStore.getCurrentBatchReport().downloadDirectory;
        } else if (exportComposite instanceof BatchExportComposite) {
            if (!BatchExportingStore.currentBatchExportAction) {
                return of(false);
            }
            exportOptions.runAs = BatchExportRunAs[exportComposite.batchRow.runAs];
            exportURL = ExportServiceConstants.BATCH_EXCEL_EXPORT_CMD;
            batchRequests.push({
                _widgetRequests: this.generateWidgetRequestsForBatch(exportComposite.batchRow.portfolio, exportComposite.batchRow.reports, exportComposite.exportConfig),
                _exportConfig: exportOptions
            });
            fileName = BatchExportingStore.getCurrentBatchReport().fileName;
            finalRequest.singleFile = false;
            finalRequest.downloadDir = BatchExportingStore.getCurrentBatchReport().downloadDirectory;
        } else if (isExcelExportComposite(exportComposite)) {
            const isRequestPerWorkpad = (exportComposite.exportConfig as WorkpadExcelExportConfig).oneWorkbookPerWorkpad;
            return isRequestPerWorkpad ? this.requestPerWorkpad(exportComposite, exportOptions, appendTimestamp) : this.mergeInSingleRequest(exportComposite, exportOptions, appendTimestamp);
        }

        finalRequest.fileName = appendTimestamp ? fileName + '-' + CommonUtils.generateUniqueIdAsNumber() : fileName;
        finalRequest.batchRequests = batchRequests;

        // If it's a favorite batch report, add the id, owner, and title to the request so we can log it in the servers
        if (BatchExportingStore.getCurrentBatchReport().id) {
            finalRequest.id = BatchExportingStore.getCurrentBatchReport().id.toString();
            finalRequest.owner = BatchExportingStore.getCurrentBatchReport().owner;
            finalRequest.title = BatchExportingStore.getCurrentBatchReport().title;
        }

        return this.download(exportURL, finalRequest, exportOptions, finalRequest.fileName);
    }

    /**
     * Gets the appendTimestamp flag for a batch excel download
     */
    public getAppendTimestamp(exportComposite: ExportComposite, exportOptions: any): boolean {
        let appendTimestamp = exportComposite instanceof MultiRowBatchExportComposite ? false : exportOptions.appendTimestamp;
        if (exportComposite instanceof MultiRowBatchExportComposite) {
            for (const batchExportComposite of exportComposite.batchExportComposites) {
                if (!appendTimestamp) {
                    // If any one of the export configs has appendTimestamp set to true, then we will append it to the file(s)
                    appendTimestamp = batchExportComposite.exportConfig.appendTimestamp;
                }
            }
        }
        return appendTimestamp;
    }

    /**
     * Request to server will be one per workpad, in case of 'one Workbook per Workpad' boolean enabled
     */
    requestPerWorkpad(exportComposite: ExportComposite & ExcelExportComposite, exportOptions: any, appendTimestamp: boolean): Observable<boolean> {
        const exportRequests = [];
        exportComposite.getWorkpads().forEach(workpad => {
            workpad.getAllPortfolios().forEach(portfolio => {
                const batchRequests: any[] = [];
                // we need to additionally send workpad to check if the corresponding reports in workpad have comparison mode on.
                batchRequests.push({
                    _widgetRequests: this.generateWidgetRequestsForBatch(portfolio, workpad.reports, exportComposite.exportConfig, workpad),
                    _exportConfig: exportOptions
                });
                exportRequests.push(this.addParamsToWorkpadLevelExport(exportOptions, exportComposite, appendTimestamp, batchRequests, true));
            });
        });

        return this.exportWorkpadBatchRequest(exportRequests, exportOptions);
    }

    /**
     * Make the request to the server and download the file for a workpad export request
     * Recursive function to sequentially process each export request while waiting for the previous download to finish first
     */
    exportWorkpadBatchRequest(exportRequests: any[], exportOptions: any): Observable<boolean> {
        if (exportRequests.length) {
            const finalRequest = exportRequests.shift();
            return this.download(ExportServiceConstants.REPORT_GRP_EXCEL_EXPORT_CMD, finalRequest, exportOptions, finalRequest.fileName)
                .pipe(
                    concatMap(response => {
                        // Once the download is done, recursively call to process the remaining requests
                        return this.exportWorkpadBatchRequest(exportRequests, exportOptions);
                    })
                );
        }
        return of(true);
    }

    /**
     * Create request for all portfolios and workpad in a single request
     */
    mergeInSingleRequest(exportComposite: ExportComposite & ExcelExportComposite, exportOptions: any, appendTimestamp: boolean): Observable<boolean> {
        const batchRequests: any[] = [];
        exportComposite.getWorkpads().forEach(workpad => {
            const portfolios = workpad.getAllPortfolios();
            for (const portfolio of portfolios) {
                batchRequests.push({
                    // we need to additionally send workpad to check if the corresponding reports in workpad have comparison mode on.
                    _widgetRequests: this.generateWidgetRequestsForBatch(portfolio, workpad.reports, exportComposite.exportConfig, workpad),
                    _exportConfig: exportOptions
                });
            }
        });
        const finalRequest = this.addParamsToWorkpadLevelExport(exportOptions, exportComposite, appendTimestamp, batchRequests);
        return this.download(ExportServiceConstants.REPORT_GRP_EXCEL_EXPORT_CMD, finalRequest, exportOptions, finalRequest.fileName);
    }

    /**
     * Get Excel file name while exporting
     * In case of unsaved workspace - return with 'New Workspace' for saved workspace - return 'Workspace name'
     * In the end if its a oneWorkbookPerPortfolio request then add portfolio & date to fileName
     * Saved workspace - return 'Workspace name + portfolio & date'
     */
    getExcelFileName(exportComposite: ExportComposite, isOneWorkbookPerPortReq?: boolean): string {
        const fileName: string = (exportComposite instanceof WorkspaceExportComposite) ?
            (exportComposite.workspace.title === ExploreConstants.UNTITLED_WORKSPACE ? ExploreConstants.NEW_WORKSPACE_TITLE : exportComposite.workspace.title)
            : ((exportComposite as WorkpadExportComposite).workpad as ReportGroup).title;

        return isOneWorkbookPerPortReq ? fileName + '-[PORTFOLIO]([DATE])' : fileName;
    }

    /**
     * Add param to final request in case of exporting to excel
     */
    addParamsToWorkpadLevelExport(exportOptions: any, exportComposite: ExportComposite & ExcelExportComposite, appendTimestamp: boolean, batchRequests: any[], isOneWorkbookPerPortReq?: boolean): any {
        const finalRequest: any = {};
        exportOptions.runAs = BatchExportRunAs[BatchExportRunAs.PORTGROUP];
        const fileName = this.getExcelFileName(exportComposite, isOneWorkbookPerPortReq);
        finalRequest.singleFile = true;
        finalRequest.workspaceName = WorkspaceStore.getWorkspace().title;
        finalRequest.fileName = appendTimestamp ? fileName + '-' + CommonUtils.generateUniqueIdAsNumber() : fileName;
        finalRequest.batchRequests = batchRequests;

        return finalRequest;
    }

    /**
     * Creates widget requests for a Batch export
     */
    public generateWidgetRequestsForBatch(portfolio: Portfolio, reports: Report[], exportConfig: ExportConfig, workpad?: BaseWorkpad): any[] {
        const widgetRequests: any[] = [];
        const isExcel = exportConfig instanceof ExcelExportConfig;
        // create a copy of the reports to prevent settings modification based on portfolio selected
        const copyReports = cloneDeep(reports);
        for (const report of copyReports) {
            const req: any[] = [];
            report.getWidgetsInOrder().forEach(widget => {
                // TEMPORARILY SKIP CMBS MAP && FACTOR ANALYSIS GRAPH FROM EXPORT FOR EXCEL
                if (isExcel && !this.validateBeforeExport(widget.configType, workpad?.isCompareMode(report.comparisonConfigId))) {
                    return;
                }

                const subComposite = new ExportComposite();
                subComposite.portfolio = portfolio;
                subComposite.report = report;
                subComposite.widget = widget;
                subComposite.exportConfig = exportConfig;
                // Pass in true for isBatchExport only if it's truly for the batch export
                // A workspace level export (which will use a WorkpadExcelExportConfig) is NOT considered to be a batch export even though it leverages the batch export code flow
                req.push(this.createWidgetExportingRequest(subComposite, workpad?.getAllPortfolios(), !(exportConfig instanceof WorkpadExcelExportConfig)));
            });
            widgetRequests.push({requests: req, title: report.title});
        }
        return widgetRequests;
    }

    private validateBeforeExport(widgetConfigType: WidgetConfigType, isCompareMode?: boolean): boolean {
        let widgetMessage: string;
        if (widgetConfigType === WidgetConfigType.TIME_SERIES) {
            widgetMessage = isCompareMode ? 'time series comparison mode' : null;
        } else if (WIDGET_CONFIGS_EXPORT_EXCEL_SKIP.includes(widgetConfigType)) {
            if (widgetConfigType === WidgetConfigType.CMBS_MAP) {
                widgetMessage = 'Map';
            } else {
                widgetMessage = 'Factor Based Graph';
            }
        }
        if (widgetMessage) {
            this.notificationService.warning(`Excel exporting is not currently supported in ${widgetMessage}; this widget will be excluded from the overall export.`, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GENERATE_WIDGET_REQUESTS_FOR_BATCH_WARNING);
            return false;
        }
        return true;
    }

    /**
     * Function to trigger download for ReportGroups or workspace
     */
    public exportWorkpadToExcel(exportComposite: ExportComposite): Observable<boolean> {
        if (!isExcelExportComposite(exportComposite)) {
            return of(false);
        }

        const portfolios = [];
        exportComposite.getWorkpads().forEach((workpad) => {
            portfolios.push(workpad.getAllPortfolios());
        });

        // chain all portfolios requests together, we will only trigger the download when all portfolios are populated
        const observableQueue = flattenDeep(portfolios).map((port) => this.batchReportingService.fetchPortInfo$(port, false, BatchExportRunAs.PORTGROUP));
        return forkJoin(observableQueue).pipe(flatMap(value => this.downloadBatchExcel(exportComposite)));
    }

    /**
     * Gets the widgets to export
     */
    public getWidgetsToExport(exportComposite: ExportComposite, exportOptions: any): Widget[] {
        let widgets: Widget[];
        if (isUndefined(exportComposite.widget) && exportComposite.report &&  exportComposite.report.widgets) {
            // Sort the widgets so they're in the order arranged
            widgets = exportComposite.report.getWidgetsInOrder();
        } else {
            // Else, it's a single widget export
            widgets = [exportComposite.widget];
            if (exportComposite.exportConfig instanceof ExcelExportConfig) {
                // We want to forcibly set exportToSingleSheet for an ExcelExportConfig to be false,
                // but we're only doing it in the serialized export options so we don't change the user preferences
                exportOptions['exportToSingleSheet'] = false;
            }
        }
        return widgets;
    }

    /**
     * Creates widget requests for exporting
     */
    public createWidgetRequestsForExporting(exportComposite: ExportComposite, exportOptions: any): any[] {
        const widgetRequests = [];
        const widgets = this.getWidgetsToExport(exportComposite, exportOptions);
        if (!isNil(exportComposite.tableData)) {
            const widgetRequest: any = {};
            widgetRequest.exportTableOtherThanWidget = true;
            widgetRequest.tableData = JSON.stringify(exportComposite.tableData);
            widgetRequest.outlineData = exportComposite.outlineData;
            widgetRequest.layout = exportComposite.report.title;
            exportComposite.portfolio.addRequestParams(widgetRequest);
            if (exportComposite.outlineData && exportComposite.outlineData.totalTrades) {
                this.updateWidgetRequestForTradeTable(widgetRequest);
            }
            if (widgetRequest.columns) {
                widgetRequest.columnInfo = widgetRequest.columns.map(column => column.columnKey);
            }
            widgetRequests.push(widgetRequest);
        }

        if (!isNil(widgets[0]) && exportComposite.exportConfig.exportLevel !== ExportLevel.GRID) {
            widgets.forEach(widget => {
                // TEMPORARILY SKIP CMBS MAP && FACTOR ANALYSIS GRAPH FROM EXPORT FOR EXCEL
                if (!this.validateBeforeExport(widget.configType, WorkspaceStore.getCurrentWorkpad()?.isCompareMode(exportComposite.report.comparisonConfigId))) {
                    return;
                }

                const subComposite = new ExportComposite();
                subComposite.portfolio = exportComposite.portfolio;
                subComposite.widget = widget;
                subComposite.report = exportComposite.report;
                subComposite.exportConfig = exportComposite.exportConfig;
                const widgetRequest = this.createWidgetExportingRequest(subComposite);
                widgetRequests.push(widgetRequest.multiRequests ? {requests: widgetRequest.multiRequests} :  widgetRequest);
            });
        }
        return widgetRequests;
    }

    /**
     * Method to send export request and download file
     */
    public exportFile(exportComposite: ExportComposite): Observable<boolean> {
        // If the user canceled the batch, then we don't want to proceed
        if (BatchExportingStore.isBatchCanceled()) {
            return of(false);
        }

        const exportOptions = exportComposite.exportConfig.serialize();
        const widgetRequests = this.createWidgetRequestsForExporting(exportComposite, exportOptions);
        let command;
        let finalRequest;
        if (WorkspaceStore.getCurrentWorkpad().isCompareMode(exportComposite.report.comparisonConfigId) && exportComposite.exportConfig.exportLevel !== ExportLevel.GRID) {
            command = (exportComposite.exportConfig instanceof TablePDFExportConfig) ? ExportServiceConstants.MULTI_TABLE_PDF_REQUEST_CMD : ExportServiceConstants.EXCEL_MULTI_PORT_COMPARE_REQUEST_CMD;
            finalRequest = {requestLists: widgetRequests, exportConfig: exportOptions};
        } else {
            command = (exportComposite.exportConfig instanceof TablePDFExportConfig) ? ExportServiceConstants.TABLE_PDF_REQUEST_CMD : ExportServiceConstants.EXCEL_REQUEST_CMD;
            finalRequest = {requests: widgetRequests, exportConfig: exportOptions};
        }

        // Add workspaceName to request in case of export to single sheet
        if (exportComposite.exportConfig instanceof ExcelExportConfig && exportComposite.exportConfig.exportToSingleSheet) {
            finalRequest.workspaceName = WorkspaceStore.getWorkspace().title;
        }

        // If widget is present use widget title else use report title
        const title = exportComposite.widget ? exportComposite.widget.title : exportComposite.report.title;
        const fileName = this.getExportFilename(exportComposite, exportOptions, title);
        return this.download(command, finalRequest, exportOptions, fileName);
    }

    /**
     * This method returns filename to be downloaded
     */
    public getExportFilename(exportComposite: ExportComposite, exportOptions: ExportConfig, title: string): string {
        if (!isUndefined(exportComposite.widget) && WidgetConfigType.LOOK_THROUGH_SUMMARY === exportComposite.widget.configType) {
            return title + ' ' + CommonUtils.getDateInLTFormat(exportComposite.portfolio.datePicker.date);
        } else if (exportOptions.appendTimestamp) {
            return title + '-' + CommonUtils.generateUniqueIdAsNumber();
        }
        return title;
    }

    /**
     * Update widget request as per trade table
     */
    public updateWidgetRequestForTradeTable(widgetRequest: any) {
        widgetRequest.exportTableOtherThanWidget = true;
        widgetRequest.title = CompositionConstants.TRADES_TABLE;
        widgetRequest.columns = compositionConfigJson['defaultTradeTableColumnDefinitions'].map(tradeColumn => {
            let dataType: string;
            if (tradeColumn.type === ColumnConstants.AUX_TEXT_COLUMN) {
                dataType = CompositionConstants.TRADE_TABLE_DATA_TYPE.STRING;
            } else if (tradeColumn.type === ColumnConstants.AUX_NUMBER_COLUMN) {
                dataType = CompositionConstants.TRADE_TABLE_DATA_TYPE.DOUBLE;
            }
            return {
                columnKey: tradeColumn.field + CommonConstants.UNDERSCORE + CommonUtils.generateUniqueIdAsString(),
                columnTag: !isNil(tradeColumn.colTag) ? tradeColumn.colTag : tradeColumn.field,
                ...(!!isNil(tradeColumn.colTag) ? {isTradeTableSpecificColumn: true} : {}),
                ...(!!isNil(tradeColumn.optionValues) ? {} : {optionValues: tradeColumn.optionValues}),
                dataType,
                title: tradeColumn.headerName
            };
        });
    }

    /**
     * add breakdown title if the breakdown is empty
     */
    public addBreakdownTitle(widgetType: string, widgetDataRequest: any): void {
        if (widgetType === WidgetType.RETURN_ANALYSIS && !widgetDataRequest.breakdownTree) {
            const breakdownTree = {
                breakdown: {
                    breakdownTitle: 'TOTAL'
                }
            };
            widgetDataRequest.breakdownTree = JSON.stringify(breakdownTree);
        }
    }

    /**
     * Generic callback to begin the PDF export process
     * @exportComposite - The composite will determine what is exported (widget, report, etc..)
     */
    processPDF(exportComposite: ExportComposite): void {
        // TODO: We'll need to figure out what to do if a batch is running and the user tries to export
        // We'll probably just have to push the regular ExportComposite to the front of the line
        if (exportComposite instanceof WorkspaceExportComposite || exportComposite instanceof WorkpadExportComposite) {
            // If the exportComposite is for a Workspace or Workpad, then process it as a BatchReport
            const workspaceBatchConfig = BatchReportingService.convertExportCompositeToBatchReportConfig(exportComposite);
            this.batchReportingService.runBatchExport(workspaceBatchConfig);
        } else {
            // Add the ExportComposite to the queue
            BatchExportingStore.batchExportQueue.push(exportComposite);
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.PRELOAD);
        }
    }

    /**
     * Updates the BatchContainerStatus
     */
    setBatchContainerStatus(): void {
        if (BatchExportingStore.batchExportQueue.length) {
            this.batchPDFDebugLog('Last ExportComposite is done. Moving onto the next.');
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.PRELOAD);
        } else {
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.IDLE);
        }
    }

    /**
     * Generic callback to begin the PDF export process
     * @exportComposite - The composite will determine what is exported (widget, report, etc..)
     */
    exportPDF(exportComposite: ExportComposite): void {
        if (exportComposite.widget) {
            // If the ExportComposite has a widget, then export just the widget
            this.exportPDFWidget(exportComposite);
        } else {
            // If not, then export the report
            this.exportPDFReport(exportComposite);
        }
    }

    /**
     * Export a widget to PDF
     */
    exportPDFWidget(exportComposite: ExportComposite): void {
        const exportConfig = exportComposite.exportConfig as PDFExportConfig;

        // Get the widgetId and escape it so that we can use a css selector to query it
        // Example: 12345 -> //31//32//33//34//35 (digits need //3 before it)
        const escapedWidgetId = exportComposite.widget.id.toString().replace(/(\d)/g, '\\3$1');
        // Get the widget element by finding the app-widget component with the correct id within the batch-container
        const widgetElement = document.querySelector('.batch-container app-widget#' + escapedWidgetId + '>.widget-container');

        if (!widgetElement) {
            console.log('Widget element with id ' + exportComposite.widget.id + ' not found in batch-container');
            return;
        }

        let fileName = exportComposite.exportConfig.appendTimestamp ? exportComposite.widget.title + '-' + ExportUtils.getUniqueTimestamp() : exportComposite.widget.title;
        // Handle file names that have periods in them and replace them all with an empty string
        fileName = fileName.replace(/\./g, '') + (exportComposite.exportConfig instanceof ImageExportConfig ? '.png' : '.pdf');

        const headerText = ExportService.generateHeaderText(exportComposite);
        const footerText = ExportService.generateFooterTextWithTimestamp();

        // Create a jsPDF doc
        const pdfDoc: any = this.createPDFDoc(exportConfig);

        if (exportConfig.pageMargin.units === PDFPageMargin.INCHES) {
            exportConfig.pageMargin = PDFPageMargin.convertInchesTojsPDFPixels(exportConfig, pdfDoc);
        }

        if (ChartUtils.isChartWidget(exportComposite.widget)) {
            this.preProcessChartElement(widgetElement);
        } else {
            this.preProcessTableElement(widgetElement);
        }

        // Create the PDFExportAction
        const pdfExportAction = new PDFExportAction(exportComposite, pdfDoc, headerText, footerText, fileName);
        // Update the exportableElements of the PDFExportAction
        pdfExportAction.exportableElements.push(widgetElement);

        this.batchPDFDebugLog('Export PDF Widget - Done pre-processing the widget. Current PDFExportAction:', pdfExportAction);
        BatchExportingStore.currentPDFExportAction$.next(pdfExportAction);
    }

    /**
     * Export a report to PDF
     */
    exportPDFReport(exportComposite: ExportComposite): void {
        const exportConfig = exportComposite.exportConfig as PDFExportConfig;
        // Grab the invisible report-container element
        const reportContainerElement = document.querySelector('.batch-container .report-presenter-area');

        // Get the file name for the PDF. If it's for Batch, take it from the Batch
        let fileName;
        if (exportComposite instanceof BatchExportComposite) {
            if (!BatchExportingStore.currentBatchExportAction) {
                return;
            }
            fileName = BatchReportingService.convertBatchFileName(BatchExportingStore.currentBatchExportAction.batchReportConfig.fileName, BatchExportingStore.getCurrentBatchRow(), BatchExportingStore.currentBatchExportAction.batchReportConfig.mergeInOneFile);
        } else {
            fileName = exportComposite.report.title;
        }
        if (BatchExportingStore.currentBatchExportAction && BatchExportingStore.currentBatchExportAction.batchReportConfig.mergeInOneFile) {
            // If the user didn't specify a file name, give it a default
            fileName = fileName ? fileName : 'Explore Merged Batch Report';
            // If any one of the export configs has appendTimestamp set to true, then we will append it to the file(s)
            fileName = some(BatchExportingStore.currentBatchExportAction.batchReportConfig.getActivePDFBatchRowConfigs(), (row: BatchRowConfig) => row.exportConfig.appendTimestamp) ? fileName + '-' + ExportUtils.getUniqueTimestamp() : fileName;
        } else {
            fileName = exportConfig.appendTimestamp ? fileName + '-' + ExportUtils.getUniqueTimestamp() : fileName;
        }

        // Handle file names that have periods in them and replace them all with an empty string
        fileName = fileName.replace(/\./g, '') + '.pdf';

        const headerText = ExportService.generateHeaderText(exportComposite);
        const footerText = ExportService.generateFooterTextWithTimestamp();

        const widgetElements = Array.from(reportContainerElement.querySelectorAll('.widget-container'));
        if (!widgetElements.length) {
            // If no widget elements found, get out of here
            console.log('No Widget elements found!');
            return;
        }
        // Loop through each widget element to preprocess it for exporting
        for (const widgetElement of widgetElements) {
            if (widgetElement.querySelector('app-explore-table')) {
                this.preProcessTableElement(widgetElement);
            } else {
                this.preProcessChartElement(widgetElement);
            }
        }

        // If this exportComposite shares the same batchRow as the current PDFExportAction, then take the pdfDoc from it
        // Else, just create a new one
        const pdfDoc = this.getPDFDoc(exportComposite);

        if (exportConfig.pageMargin.units === PDFPageMargin.INCHES) {
            exportConfig.pageMargin = PDFPageMargin.convertInchesTojsPDFPixels(exportConfig, pdfDoc);
        }

        const pdfExportAction = new PDFExportAction(exportComposite, pdfDoc, headerText, footerText, fileName);
        // Check to see if we need to link the PDFExportAction
        // If we don't need to link, then we'll check to save the PDF of the previous PDFExportAction
        pdfExportAction.linkPDFExportAction(this.batchPDFDebugMode);

        if (exportComposite instanceof BatchExportComposite && pdfExportAction.linkedPDFExportAction) {
            pdfExportAction.getPDFDoc().addPage(PDFPageFormat[exportConfig.pageFormat].toLowerCase(), PDFExportOrientation.getJsPDFOrientation(exportConfig.orientation));
        }

        if (exportConfig.layout === PDFPageLayout.REPORT_AS_IS) {
            // If the export request is for report as-is, then use the entire report container element
            pdfExportAction.exportableElements = [reportContainerElement];
        } else {
            // Else, use the collection of widget elements so we can export individually
            pdfExportAction.exportableElements = widgetElements;
        }

        this.batchPDFDebugLog('Export PDF Report - Done pre-processing all widgets. Current PDFExportAction:', pdfExportAction);

        BatchExportingStore.currentPDFExportAction$.next(pdfExportAction);
    }

    /**
     * Renders the first widgetElement in a collection of widgetElements onto a PDF
     */
    renderNextWidget(pdfExportAction: PDFExportAction): void {
        // If there are no exportable elements, check if it's a batch export
        if (!pdfExportAction.exportableElements || pdfExportAction.exportableElements.length === 0) {
            this.widgetCounter = 0;
            this.setBatchContainerStatus();
            if (!(pdfExportAction.exportComposite instanceof BatchExportComposite) || pdfExportAction.exportComposite.isLast) {
                // If the user canceled the batch, then we don't want to proceed
                if (BatchExportingStore.isBatchCanceled()) {
                    return;
                }
                pdfExportAction.savePDF(this.batchPDFDebugMode);
                if (pdfExportAction.getPDFDoc().notifyPDFLogoFailure) {
                    this.notificationService.warning('Please try again if you want to include the logo.', ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_RENDER_NEXT_WIDGET_WARNING);
                }
                BatchExportingStore.currentPDFExportAction$.next(null);
            }
            return;
        }
        this.renderElementOnCanvas(pdfExportAction);
    }

    /**
     * Check whether we should add a page to the PDF doc
     */
    checkToAddPage(pdfExportAction: PDFExportAction): void {
        const exportConfig = pdfExportAction.exportComposite.exportConfig as PDFExportConfig;
        if (this.widgetCounter !== this.numberOfWidgetsPerPage(exportConfig.layout) || pdfExportAction.exportableElements.length === 0) {
            return;
        }
        pdfExportAction.getPDFDoc().addPage(PDFPageFormat[exportConfig.pageFormat].toLowerCase(), PDFExportOrientation.getJsPDFOrientation(exportConfig.orientation));
        // Reset the counter
        this.widgetCounter = 0;
    }

    /**
     * Determines the number of widgets on each page based on the PDFPageLayout enum
     */
    numberOfWidgetsPerPage(pageLayout: PDFPageLayout): number {
        switch (pageLayout) {
            case PDFPageLayout.REPORT_AS_IS :
                return 0;
            case PDFPageLayout.W1X1 :
                return 1;
            case PDFPageLayout.W1X2 :
            case PDFPageLayout.W2X1 :
                return 2;
            case PDFPageLayout.W1X3 :
            case PDFPageLayout.W3X1 :
                return 3;
            case PDFPageLayout.W2X2 :
                return 4;
            case PDFPageLayout.W2X3 :
            case PDFPageLayout.W3X2 :
                return 6;
            default:
                return 0;
        }

        // TODO: Decide which method is better? Using hard coded values or multiplying the numbers together?
        // TODO: The multiplication way is better for the future (in case we want to add more layouts), but maybe we don't need to if there are only so few
        // let scalar = reduce(PDFPageLayout[pageLayout].match(/\d/g), (memo: any, num: string) => {
        //     return memo + parseInt(num);
        // }, 0);
    }

    /**
     * Goes through the table widget element to make it html2canvas ready
     */
    preProcessTableElement(widgetElement): void {
        const pinnedColumnCells = widgetElement.querySelectorAll('.ag-pinned-left-header .ag-header-cell, .ag-pinned-left-header .ag-header-group-cell, .ag-pinned-left-cols-container .ag-cell-last-left-pinned');
        for (const pinnedCell of pinnedColumnCells) {
            pinnedCell.setAttribute('border-right', this.getStylePropertyOfElement(pinnedCell, 'border-right'));
        }

        this.adjustTablePseudoElements(widgetElement);
    }

    /**
     * AUX uses pseudo elements which don't show up in html2canvas render
     * This method inserts expanded/collapsed chevron arrows in aux-grid tables directly into the DOM
     */
    adjustTablePseudoElements(widgetElement): void {
        const icons = widgetElement.querySelectorAll(':not(.ag-hidden) > .ag-icon-tree-open, :not(.ag-hidden) > .ag-icon-tree-closed');
        for (const iconSpan of icons) {
            // Set the width to explictly be 'auto' because ag-grid v31 added a fixed width for ag-icon class (16px)
            // And adding the chevron below without changing the width css property will cause it to overlap with the text
            // We want the added character to shift the text over (which would shift back once we render through html2canvas
            // because the icon is drawn with pseudo elements)
            iconSpan.style.width = 'auto';
            if (iconSpan.classList.contains('ag-icon-tree-closed')) {
                // Insert the ag-icon-tree-closed string into the span directly
                // This character was taken from aw-grid.css
                iconSpan.innerHTML = '';
            } else if (iconSpan.classList.contains('ag-icon-tree-open')) {
                // Insert the ag-icon-tree-open string into the span directly
                // This character was taken from aw-grid.css
                iconSpan.innerHTML = '';
            }
        }
    }

    /**
     * Creates a new jsPDF document based on the PDFExportConfig passed in
     */
    createPDFDoc(exportConfig: PDFExportConfig): any {
        // Grab the PDF options from the export config
        const orientation = PDFExportOrientation.getJsPDFOrientation(exportConfig.orientation);
        const format = PDFPageFormat[exportConfig.pageFormat].toLowerCase();

        return new jsPDF(orientation, 'px', format);
    }

    getPDFDoc(exportComposite: ExportComposite): any {
        // Get the current PDFExportAction
        const currentPDFExportAction = BatchExportingStore.getCurrentPDFExportAction();
        // If the exportComposite shares the same batchRow AND portfolio as the current PDFExportAction, then return the pdfDoc from it
        if (exportComposite instanceof BatchExportComposite && currentPDFExportAction && currentPDFExportAction.exportComposite instanceof BatchExportComposite && exportComposite.hasSameBatchRowConfigAndPortfolio(currentPDFExportAction.exportComposite)) {
            return currentPDFExportAction.getPDFDoc();
        }
        // Else, just create a new one
        return this.createPDFDoc(exportComposite.exportConfig as PDFExportConfig);
    }

    /**
     * Takes the an HTML element and uses html2canvas to take a snapshot of it
     * Places the image onto a jsPDF document
     */
    renderElementOnCanvas(pdfExportAction: PDFExportAction): Promise<void> {
        const element = pdfExportAction.exportableElements[0];
        const exportConfig = pdfExportAction.exportComposite.exportConfig as PDFExportConfig;
        const pdfDoc: any = pdfExportAction.getPDFDoc();

        const options = {
            // This is the scaling option you can configure with html2canvas
            // It defaults to window.devicePixelRatio (which is normally 1)
            // https://html2canvas.hertzen.com/configuration
            //
            // Scaling up will increase resolutions of the renders as well as the file size
            // A higher number will also cause Explore to hang due to memory issues.
            // A scale of 2 seems to be good in terms of resolution, download speed/size, and minimal Explore hang-ups
            scale: 2
        };
        this.batchPDFDebugLog('Rendering element onto canvas. Current PDFExportAction:', pdfExportAction);
        return convert(element, options).then(async (image: any) => {
            if (pdfExportAction.exportComposite.exportConfig instanceof ImageExportConfig) {
                this.downloadImage(image, pdfExportAction.fileName);
                BatchExportingStore.currentPDFExportAction$.next(null);
                this.setBatchContainerStatus();
                return;
            }

            // TODO: make this configurable from the exportConfig
            const fontSize = 10;

            // If there is a specified widget layout, then we need to adjust the image dimensions accordingly
            //
            // In the PDFPageLayout enum, the first value represents the number of rows
            // And the second value represents the number of columns
            //
            // For example, W1X3 means there is 1 row with 3 columns for widgets
            // That means, we need to adjust the width of the images by 3 (so we can fit 3 widgets side by side)
            // We then also need to adjust the height based on the imageRatio (to not stretch the image)
            //
            // We can apply the same principle if we need to adjust the height first (like in W2X1)
            // We will adjust the height of the images by 2 (so we can fit 2 widgets on top of each other)
            // Then adjust the width with the imageRatio
            //
            // We will achieve this by subdividing the PDF page first to figure out the height and width of each section

            // Get the number of rows for the PDF (also == # of widgets in a column)
            const numberOfRows = exportConfig.layout === PDFPageLayout.REPORT_AS_IS ? 1 : parseInt(PDFPageLayout[exportConfig.layout].match(/\d/g)[0], 10);
            // Get the number of columns for a PDF (also == # of widgets in a row)
            const numberOfColumns = exportConfig.layout === PDFPageLayout.REPORT_AS_IS ? 1 : parseInt(PDFPageLayout[exportConfig.layout].match(/\d/g)[1], 10);

            const pdfDocHeight = pdfDoc.internal.pageSize.getHeight();
            const pdfDocWidth = pdfDoc.internal.pageSize.getWidth();

            // Get the height of a widget section within a page
            const heightOfWidgetSection = (pdfDocHeight - exportConfig.pageMargin.top - exportConfig.pageMargin.bottom) / numberOfRows;
            // Get the width of a widget section within a page
            const widthOfWidgetSection = (pdfDocWidth - exportConfig.pageMargin.left - exportConfig.pageMargin.right) / numberOfColumns;

            const imageDimensions = this.getImageDimensions(image, heightOfWidgetSection, widthOfWidgetSection);

            const coordinates = this.getImageCoordinates(numberOfRows, numberOfColumns, heightOfWidgetSection, widthOfWidgetSection, imageDimensions, exportConfig.pageMargin, true);

            pdfDoc.setFontSize(fontSize);

            // Calling the addHeaderFooterLogo() so that the PDF header, footer, and logo (if needed) is attached here
            await ExportService.addHeaderFooterLogo(fontSize, exportConfig, pdfExportAction, pdfDoc);

            pdfDoc.addImage(image, ExportService.PNG_FILE_FORMAT, coordinates.xCoordinate, coordinates.yCoordinate, imageDimensions.width, imageDimensions.height, CommonUtils.generateUniqueIdAsNumber(), 'SLOW');
            if (pdfExportAction.exportSingleElementOnly() && !(pdfExportAction.exportComposite instanceof BatchExportComposite)) {
                // If the user canceled the batch, then we don't want to proceed
                if (BatchExportingStore.isBatchCanceled()) {
                    return;
                }
                this.widgetCounter = 0;
                this.batchPDFDebugLog('Element rendered and PDFExportAction is done. Now saving PDF. Current PDFExportAction:', pdfExportAction);
                pdfExportAction.savePDF(this.batchPDFDebugMode);
                if (pdfExportAction.getPDFDoc().notifyPDFLogoFailure) {
                    this.notificationService.warning('Please try again if you want to include the logo.', ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_RENDER_ELEMENTS_ON_CANVAS_WARNING);
                }
                BatchExportingStore.currentPDFExportAction$.next(null);
                this.setBatchContainerStatus();
            } else {
                // Remove the element from the list
                pdfExportAction.exportableElements.shift();
                // Add a page to the PDF if necessary
                this.checkToAddPage(pdfExportAction);
                this.batchPDFDebugLog('Element rendered. Moving onto next element in the PDFExportAction. Current PDFExportAction:', pdfExportAction);
                // Proceed with the same PDFExportAction again for the remaining elements
                BatchExportingStore.currentPDFExportAction$.next(pdfExportAction);
            }
        }, (error: any) => {
            console.error('PDF export failed with: ', error, 'Current PDFExportAction:', pdfExportAction);
            this.setBatchContainerStatus();
        });
    }

    /**
     * Download imae as png
     * @param image
     * @param fileName
     */
    private downloadImage(image: any, fileName: string) {
        const imageURL = image.toDataURL('image/png');
        const imageDownloadLink = document.createElement('a');
        imageDownloadLink.href = imageURL;
        imageDownloadLink.download = fileName;
        document.body.appendChild(imageDownloadLink);
        imageDownloadLink.click();
        document.body.removeChild(imageDownloadLink);
    }

    /**
     * Determines the dimensions of the image given the section within the PDF it needs to be placed
     */
    getImageDimensions(canvas: any, pdfSectionHeight: number, pdfSectionWidth: number): any {
        let newHeight;
        let newWidth;

        const pdfSectionRatio = pdfSectionHeight / pdfSectionWidth;

        // Get the dimensions of the canvas element
        const imageHeight = canvas.height;
        const imageWidth = canvas.width;
        const imageRatio = imageHeight / imageWidth;

        if (imageRatio > pdfSectionRatio) {
            newHeight = Math.min(pdfSectionHeight, imageRatio * pdfSectionWidth);
            newWidth = newHeight / imageRatio;
        } else {
            newWidth = Math.min(pdfSectionWidth, imageWidth);
            newHeight = newWidth * imageRatio;
        }

        return {height: newHeight, width: newWidth};
    }

    /**
     * Determines which coordinates an image should be placed onto a PDF page.
     * xCoordinate starts from the left of the page
     * yCoordinate starts from the top of the page
     * (0, 0) would mean top left corner
     */
    getImageCoordinates(numberOfRows: number, numberOfColumns: number, pdfSectionHeight: number, pdfSectionWidth: number, imageDimensions: any, pageMargin: PDFPageMargin, centerImage: boolean): any {
        // TODO: Figure out margins properly. Right now we don't differentiate between top/bottom right/left margins

        // Determine the xCoordinate of where the widget should be placed based on the width of each widget section, the widget number (1st, 2nd, 3rd, etc..), and how many columns there are (how many widgets should be in a row)
        let xCoordinate = pdfSectionWidth * ((this.widgetCounter - 1) % numberOfColumns) + pageMargin.left;
        // Determine the yCoordinate of where the widget should be placed based on the height of each widget section, the widget number (1st, 2nd, 3rd, etc..), and how many columns there are (how many widgets should be in a row)
        let yCoordinate = pdfSectionHeight * (Math.ceil(this.widgetCounter / numberOfColumns) - 1) + pageMargin.top;

        if (centerImage) {
            // Center image in the section
            xCoordinate += (pdfSectionWidth - imageDimensions.width) / 2;
            yCoordinate += (pdfSectionHeight - imageDimensions.height) / 2;
        }

        return {xCoordinate, yCoordinate};
    }

    /**
     * Pre-processes an SVG to add the proper fonts and fill colors onto the SVG element
     */
    preProcessChartElement(widgetElement): void {
        const svgElements = widgetElement.querySelectorAll('svg');
        const isMapWidget = !!widgetElement.querySelector('app-explore-cmbs-map-chart');

        if (widgetElement.querySelector('explore-commitment-risk-chart')) {
            this.handleCommitmentRiskChartSpecificCss(widgetElement);
        }

        for (const svgElement of svgElements) {
            // Set the font-family at the top level svg so it can get inherited
            svgElement.setAttribute('style', 'font-family:Roboto;font-size:12px;');
            // Find all rectangles
            const rects = svgElement.querySelectorAll('rect');
            this.preProcessChartRectangles(rects, isMapWidget);

            // Find all text elements
            const textElements = svgElement.querySelectorAll('text');
            for (const textElem of textElements) {
                // Explicitly set the fill color onto the text element (was causing an issue where dark mode widgets weren't getting filled with white text)
                textElem.setAttribute('fill', this.getStylePropertyOfElement(textElem, 'fill'));
            }

            // Get the highcharts legend section
            const highchartsLegendSection = svgElement.querySelectorAll('.highcharts-legend')[0];
            this.preProcessChartLegend(highchartsLegendSection, isMapWidget, widgetElement);

            // Get the highcharts axis labels
            const highchartsAxisLabels = svgElement.querySelectorAll('.highcharts-axis-labels');
            this.preProcessChartAxisLabels(highchartsAxisLabels);

            const boldedTspanElements = svgElement.querySelectorAll('tspan.highcharts-strong');
            for (const tspan of boldedTspanElements) {
                tspan.setAttribute('font-weight', 'bold');
            }

            // Find all the series (sector) path elements or any data-label-connector paths, or any gridlines
            const paths = svgElement.querySelectorAll('path');
            this.preProcessChartSVGPaths(paths);

            // Get the <defs> tags within the svg. In here we will define <style>
            const defs = svgElement.querySelectorAll('defs')[0];
            // if defs, add the style
            if (defs) {
                // Create a style tag and add in the base64 encoded fonts for Roboto font-family
                const style = document.createElement('style');
                style.append('@font-face {font-family: \'Roboto\'; font-style: normal; font-weight: 400; src: local(\'Roboto\'), local(\'Roboto-Regular\'), local(\'Roboto-Bold\'), url(data:font/woff2;base64,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) format(\'woff2\');unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}');
                // Add back <style> tags
                defs.append(style);
            }
        }
    }

    private handleCommitmentRiskChartSpecificCss(widgetElement: HTMLElement): void {
        // Find the SVG element for other manipulations
        const svgElement = widgetElement.querySelector('svg');

        if (widgetElement.querySelector('app-commitment-risk-chart-scenario-legend')) {
            svgElement.querySelectorAll('.scenario-midline').forEach(el => {
                // Apply dashed style for scenario-midline
                el['style'].strokeDasharray = this.getStylePropertyOfElement(el, 'stroke-dasharray');
            });
            svgElement.querySelectorAll('.scenario-dark-blue').forEach(el => {
                // Adjust the opacity of scenario-dark-blue area.
                el['style'].opacity = this.getStylePropertyOfElement(el, 'opacity');
            });

            widgetElement.querySelectorAll('aux-checkbox').forEach(checkbox => {
                const svg = checkbox.shadowRoot.querySelector('svg');
                const polyline = svg.querySelector('polyline');
                // Adjust the color of the checkbox check icon.
                polyline.style.stroke = this.getStylePropertyOfElement(checkbox.shadowRoot.querySelector('.aux-icon__container--checkbox.sc-aux-icon'), 'color');
            });

            widgetElement.querySelectorAll('aux-radio-group').forEach(radioGroup => {
                const radios = radioGroup.shadowRoot.querySelectorAll('aux-radio');
                radios.forEach(radio => {
                    if (!radio.hasAttribute('is-checked')) {
                        return;
                    }
                    const radioInputs = radio.shadowRoot.querySelectorAll('input[type="radio"]');
                    radioInputs.forEach(radioInput => {
                        // Fill in selected radio button.
                        const radioSelect = radioInput.nextElementSibling;
                        radioSelect['style'].backgroundColor = this.getStylePropertyOfElement(radioSelect, 'border-color');
                    });
                });
            });
        } else {
            const tSpans = svgElement.querySelectorAll('tspan');
            tSpans.forEach(tspan => {
                if (tspan.textContent.trim() === 'Percentile:') {
                    // Adjust the text color.
                    tspan.setAttribute('stroke', this.getStylePropertyOfElement(tspan, 'color'));
                    // Adjust the position of the tspan.
                    tspan.setAttribute('dy', '-20');
                }
            });
        }
    }

    /**
     * Pre-processes <rect> elements of an SVG to fill colors correctly
     */
    preProcessChartRectangles(rects: any[], isMapWidget: boolean): void {
        for (const rect of rects) {
            const fillValue = this.getStylePropertyOfElement(rect, 'fill');
            // Default to a 'none' fill
            let fillValueToUse = 'none';
            if (fillValue.includes('url')) {
                // If the fill value is a gradient, modify the gradient url
                fillValueToUse = 'url(' + fillValue.match(/#highcharts-\w*-\w*/g)[0] + ')';
            } else if (rect.classList.contains('highcharts-point') || (isMapWidget && rect.classList.contains('highcharts-legend-box'))) {
                // If the rectangle is for a legend point, we want to fill it with the color it's supposed to be filled with
                fillValueToUse = fillValue;
            }
            rect.setAttribute('fill', fillValueToUse);

            if (rect.classList.contains('highcharts-internal-node-interactive')) {
                // Set the fill opacity for certain tree-map nodes
                rect.setAttribute('fill-opacity', this.getStylePropertyOfElement(rect, 'fill-opacity'));
            }

            // If the rect has an actual stroke color, then set that onto the rect
            const strokeValue = this.getStylePropertyOfElement(rect, 'stroke');
            const strokeWidthValue = this.getStylePropertyOfElement(rect, 'stroke-width');
            if (strokeValue !== 'none' && strokeWidthValue !== '0px') {
                rect.setAttribute('stroke', strokeValue);
                rect.setAttribute('stroke-width', strokeWidthValue);
            }
        }
    }

    /**
     * Pre-processes the highcharts legend
     */
    preProcessChartLegend(highchartsLegendSection: any, isMapWidget: boolean, widgetElement: any): void {
        if (!highchartsLegendSection) {
            return;
        }

        // Grab all the legend text elements
        const highchartsLegendItems = highchartsLegendSection.querySelectorAll('.highcharts-legend-item');
        for (const highchartsLegendItem of highchartsLegendItems) {
            const legendTexts = highchartsLegendItem.querySelectorAll('text');
            for (const text of legendTexts) {
                // Apply a bold font-weight onto them all
                text.setAttribute('font-weight', 'bold');
                const textTspans = text.querySelectorAll('tspan');
                for (const tspan of textTspans) {
                    tspan.setAttribute('font-weight', 'bold');
                }
            }
        }

        // Adjust the clip-path of the <g> holding the legends so that any overflow doesn't overlap with legend navigation arrows
        const clipPathURLMatches = this.getStylePropertyOfElement(highchartsLegendSection.children[1], 'clip-path').match(/#highcharts-\w*-\w*-/g);
        if (clipPathURLMatches) {
            highchartsLegendSection.children[1].setAttribute('clip-path', 'url(' + clipPathURLMatches[0] + ')');
        }

        // There might be legend navigation arrows if there are a lot of sectors
        const highchartsNavArrowCircles = highchartsLegendSection.querySelectorAll('circle');
        for (const circle of highchartsNavArrowCircles) {
            // Make sure the fill-opacity of the circle is set properly for the PDF, or else they may show up as black circles
            circle.setAttribute('fill-opacity', this.getStylePropertyOfElement(circle, 'fill-opacity'));
        }

        // CENTER ALIGN THE LEGEND BOX (only for non-cmbs-map charts)
        if (!isMapWidget) {
            // We do this because using {width: '100%'} doesn't respect center alignment in highcharts configuration for some reason
            //
            // The svg structure will look like this:
            // <g class="highcharts-legend"> *** THIS IS THE LEGEND GROUP IN THE SVG ***
            //   <rect fill="none" class="highcharts-legend-box"></rect> *** THIS REPRESENTS THE BOX OF THE LEGEND ***
            //   <g data-z-index="1"></g> *** THIS REPRESENTS THE GROUP OF ACTUAL LEGEND ITEMS *** (We need to center align the group here
            // </g>
            //
            // To center align the child group, we'll need to place it half the difference between the box width and the legend items width
            // For example, the width of the legend box is 600. The width of the legend items is 400
            // We'll place the legend items 100 pixels from the left ((600 - 400) / 2)
            const widthOfRect = highchartsLegendSection.children[0].getBBox().width; // Ex: 600
            const widthOfLegendItems = highchartsLegendSection.children[1].getBBox().width; // Ex: 400
            const widthAdjustment = (widthOfRect - widthOfLegendItems) / 2; // Ex: 100
            // Add a transform attribute onto the SVG element
            //   <g data-z-index="1" transform="translate(100,0)"></g>
            highchartsLegendSection.children[1].setAttribute('transform', 'translate(' + widthAdjustment + ',0)');

            // In certain situations (positive/negative custom colors bar chart), we may have a legend that's created by labelFormatter.
            // That legend will not be in the svg, but will be inside a <div>. There will still be a .highcharts-legend svg
            // element, hence we need to get the second element
            // Each measure in the legend will be it's own nested <div> and <span> that we need to calculate the total width for proper centering
            const secondaryHighchartsLegendSection = widgetElement.querySelectorAll('.highcharts-legend')[1];
            this.adjustSecondaryHighchartsLegendWidth(secondaryHighchartsLegendSection, widthOfRect);
        }
    }

    /**
     * Adjusts the secondary highcharts legend so it's centered for pdf exports
     */
    adjustSecondaryHighchartsLegendWidth(legendSection: any, widthOfRect: number): void {
        if (!legendSection) {
            return;
        }
        // Set placeholder values to keep track of what adjustments we need to make.
        // There are many placeholders because the css is not all in one element. These html elements are positioned 'absolutely'
        // and use top/left to adjust the spacing
        //
        // The leftmost adjustment accounts for "padding" on the left side (8px for example).
        // This is because the leftmost legend isn't flush to the container
        let firstLeftmostAdjustment: number;
        // This if the 'left' property of the farthest right legend item. Left meaning how far this element is pushed from the left
        let lastRightmostAdjustment = 0;
        // This tracks the width of the actual legend item <span>
        let widthToAddToAdjustment = 0;
        // Get the individual legend items in this secondary legend section
        // These will be <div> elements with a left style on them. These <div> will also hold the <span> that has the width of the actual legend item
        const highchartsLegendItems = legendSection.querySelectorAll('.highcharts-legend-item');
        for (const individualLegendDiv of highchartsLegendItems) {
            // Grab the 'left' numerical value from the <div>. (If the <div> has left: '200px', we will use 200)
            const leftStyle = this.getStylePropertyOfElement(individualLegendDiv, 'left');
            const leftAdjustment = + leftStyle?.split('px')[0];
            // Set the left adjustment
            if (!firstLeftmostAdjustment || leftAdjustment < firstLeftmostAdjustment) {
                firstLeftmostAdjustment = leftAdjustment;
            }
            // Set the right adjustment
            if (leftAdjustment > lastRightmostAdjustment) {
                lastRightmostAdjustment = leftAdjustment;
                // If this is the last, rightmost element, also store the actual width of the inner <span> legend item
                widthToAddToAdjustment = individualLegendDiv.querySelector('span').clientWidth;
            }
        }
        // Get the full width of this legend section so we can center it
        const secondaryLegendWidth = lastRightmostAdjustment + widthToAddToAdjustment - firstLeftmostAdjustment;
        // Find the middle point of the legend area
        const secondaryWidthAdjustment = (widthOfRect - secondaryLegendWidth) / 2;
        // Since the labelFormatter legends are positioned absolutely with left/top, just adjust the left to center it
        legendSection.style.left = secondaryWidthAdjustment + 'px';
    }

    /**
     * Pre-process the highcharts axis labels
     */
    preProcessChartAxisLabels(highchartsAxisLabels: any[]): void {
        if (!highchartsAxisLabels) {
            return;
        }

        for (const highchartsAxisLabel of highchartsAxisLabels) {
            const axisTexts = highchartsAxisLabel.querySelectorAll('text');
            for (const text of axisTexts) {
                // Apply a font-size onto them all
                // font-size for the axis labels is 0.9em coming from highcharts.scss which is equivalent to 10.8px at run time
                text.setAttribute('font-size', '10.8px');
            }
        }
    }

    /**
     * Pre-process all <path> elements of an SVG to fill colors properly
     */
    preProcessChartSVGPaths(paths: any[]): void {
        for (const path of paths) {
            const fillValue = this.getStylePropertyOfElement(path, 'fill');
            if (path.classList.contains('highcharts-grid-line')) {
                // Fill the grid lines
                // NOTE: There's an issue where y-axis grid lines are not being rendered onto the widget, but they show up on the PDF
                path.setAttribute('stroke', this.getStylePropertyOfElement(path, 'stroke'));
            } else if (path.classList.contains('highcharts-data-label-connector') || path.classList.contains('highcharts-axis-line') || path.classList.contains('highcharts-graph') || path.classList.contains('highcharts-tracker-line')) {
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', this.getStylePropertyOfElement(path, 'stroke'));
                path.setAttribute('stroke-dasharray', this.getStylePropertyOfElement(path, 'stroke-dasharray')); // for line styling classes 'custom-stroke-dotted' and 'custom-stroke-dashed' in line charts
            } else if (fillValue.includes('url')) {
                // If the fill value is a gradient, modify the gradient url
                path.setAttribute('fill', 'url(' + fillValue.match(/#highcharts-\w*-\w*/g)[0] + ')');
            } else {
                path.setAttribute('fill', fillValue);
            }

            // Set stroke width for line chart
            if (path.classList.contains('highcharts-graph') && (path.parentElement && (path.parentElement.classList.contains('lineChart') || path.parentElement.classList.contains('noncumulative')))) {
                path.setAttribute('stroke-width', this.getStylePropertyOfElement(path, 'stroke-width'));
            }

            // Some paths may be a bit transparent. We want to carry that over into the PDF
            const fillOpacity = this.getStylePropertyOfElement(path, 'fill-opacity');
            if (fillOpacity !== '1') {
                path.setAttribute('fill-opacity', fillOpacity);
                path.setAttribute('stroke', this.getStylePropertyOfElement(path, 'stroke'));
                path.setAttribute('stroke-width', this.getStylePropertyOfElement(path, 'stroke-width'));
            }
        }
    }

    /**
     * Helper method to get the style value for an element
     */
    getStylePropertyOfElement(svgElement, property): string {
        return window.getComputedStyle(svgElement, null).getPropertyValue(property);
    }

    /**
     * For export to excel for RA widget if breakdown title is empty, set it and create final request
     * This is for _ADMIN folder report group and for widgetExcel where breakdown title is set it as an empty string
     * Get title from ColumnSector and set it to breakdown.title
     * If we have selected no breakdown set title as 'TOTAL'
     */
    modifyBreakdownInputForReturns(widgetInputs: Map<string, WidgetInput>, widgetType: string) {
        if (widgetType !== WidgetConfigType.RETURNS) {
            return;
        }

        const breakdown: Breakdown = widgetInputs.get('breakdownTree') as Breakdown;
        if (breakdown && isEmpty(breakdown.title) && !isEmpty(breakdown.children) && (breakdown.children[0] instanceof ColumnSector)) {
            breakdown.title = (breakdown.children[0] as ColumnSector).columnName;
        }

        // If we have selected no breakdown then set 'TOTAL' as a title
        if (breakdown && isEmpty(breakdown.title) && isEmpty(breakdown.children)) {
            breakdown.title = 'TOTAL';
        }
    }

    /**
     * Determines the compare mode based on the batch export flag and comparison configuration ID.
     * If the operation is for batch export, compare mode is not supported and the method returns false.
     * Otherwise, it checks the current workpad's compare mode status for the given comparison configuration ID.
     *
     * @param {boolean} isBatchExport - Flag indicating if the operation is for batch export.
     * @param {number} comparisonConfigId - The ID of the comparison configuration.
     * @returns {boolean} - Returns true if compare mode is enabled and it's not a batch export; otherwise, false.
     */
    private determineCompareMode(isBatchExport: boolean, comparisonConfigId: number): boolean {
        const currentWorkpad = WorkspaceStore.getCurrentWorkpad();
        return !isBatchExport && currentWorkpad.isCompareMode(comparisonConfigId);
    }

    /**
     * Function to create exporting request for widget
     */
    private createWidgetExportingRequest(exportComposite: ExportComposite, allPortfolios?: Portfolio[], isBatchExport?: boolean) {
        const widgetService = this.widgetServiceRegistry.getService(exportComposite.widget.configType);
        const isCompareMode = this.determineCompareMode(isBatchExport, exportComposite.report.comparisonConfigId);

        // Create empty  request params
        const modifiedWidgetInputs: Map<string, WidgetInput> = new Map(exportComposite.widget.dataStore.metaData.inputs);

        this.modifyBreakdownInputForReturns(modifiedWidgetInputs, exportComposite.widget.configType);

        const portfolios = isCompareMode
            ? WorkpadUtils.getPortfoliosToCompare(exportComposite.report, allPortfolios || WorkspaceStore.getCurrentWorkpad().getAllPortfolios())
            : [exportComposite.portfolio];

        const exploreWidgetDataRequest = widgetService.createFinalDataRequest(exportComposite.widget, portfolios, exportComposite.report, modifiedWidgetInputs, true, undefined, isBatchExport);

        const widgetDataRequest = isCompareMode ? {multiRequests: exploreWidgetDataRequest.requestParams} : exploreWidgetDataRequest.requestParams[0];

        const exportOptions = exportComposite.exportConfig.serialize();
        // TODO - add token support
        if (exportOptions.visibleOnly || (exportComposite.exportConfig instanceof ExcelExportConfig && exportComposite.exportConfig.isGroupingEnabled)) {
            const expandedState = exportComposite.widget.displayInputs.get(ExpandedState.CONFIG_TYPE) as ExpandedState || (new ExpandedState({expandedPaths: [[ROOT_LEVEL]]}));
            const expandedNodes = expandedState.allExpanded ? [['FULLY_EXPANDED']] : expandedState.expandedPaths;
            if (widgetDataRequest.multiRequests) {
                for (const req of widgetDataRequest.multiRequests) {
                    req.expandedNodes = expandedNodes;
                }
            } else {
                widgetDataRequest.expandedNodes = expandedNodes;
            }
        }

        // Add sorted columns to the widget request for table widgets
        if (!ChartUtils.isChartWidget(exportComposite.widget)) {
            this.addSortedColumnsToWidgetExportingRequest(widgetDataRequest, exportComposite);
        }

        // TODO - add token support for exportOption type returned in serliaze method. It decides the file download type

        // add breakdown title
        this.addBreakdownTitle(exportComposite.widget.configType, widgetDataRequest);

        // add widget config type
        widgetDataRequest.widgetConfigType = exportComposite.widget?.configType;

        // set the refresh flag to true if user request for hard refresh
        if (BatchExportingStore.runHardRefresh$.getValue()) {
            widgetDataRequest.refreshCachedResponse = true;
        }

        return widgetDataRequest;
    }

    private addSortedColumnsToWidgetExportingRequest(widgetDataRequest: any, exportComposite: ExportComposite) {
        const sortedColumns = exportComposite.widget.dataStore.metaData.inputs.get(CommonConstants.CONFIG_TYPE.SORTED_COLUMNS) as SortedColumns;
        if (sortedColumns && !isEmpty(sortedColumns.sortedColumns)) {
            widgetDataRequest.sortedColumns = sortedColumns.serialize().sortedColumns;
        }

        if (widgetDataRequest.multiRequests && sortedColumns) {
            for (const req of widgetDataRequest.multiRequests) {
                req.sortedColumns = sortedColumns.serialize().sortedColumns;
            }
        }
    }

    /**
     * function to download files
     */
    download(command: string, finalRequest: any, exportOptions: any, fileName?: string): Observable<boolean> {
        const isBatchRequest = command === ExportServiceConstants.BATCH_EXCEL_EXPORT_CMD;
        // If we keep the downloadDir then we need to follow the file downloader process to make the downloads
        // By removing the downloadDir / making it null we can follow the normal export/download method and
        const targetDirectory = finalRequest.downloadDir?.trim();
        if (AppStore.isEBCDownloaderEnabled && isBatchRequest && !isEmpty(targetDirectory)) {
            // We do not want to populate the downloadDir in case of EbC and want the response.data.type to be DOWNLOAD_TYPE_LINK
            // This way we can let the export happen in a normal way rather than launching the file downloader in EbC
            finalRequest.downloadDir = '';
        }

        // Extract data from the backend server and store it in the data store
        return this.http2BmsService.post$(command, finalRequest, null).pipe(
            takeUntil(BatchExportingStore.batchCanceller$),
            flatMap((response) => {
                const isResponseValid: boolean = (response.data && response.data.totalSize !== 0);
                // Throw an observable error if response is not valid
                if (!isResponseValid) {
                    return throwError(false);
                }
                const files: string[] = response.data.data;
                // For each of the file parts, we need to send a request to the server to get the chunked file data and combine
                if (response.data.type === ExportConstants.DOWNLOAD_TYPE_LINK) {
                    const fileDownloads = map(files, (file) => {
                        const linkedLongRunningRequests = map(file, (requestId) => {
                            let params: HttpParams = new HttpParams();
                            params = params.set(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM, requestId);
                            return this.http2BmsService.get$(RequestConstants.GET_LONG_RUNNING_REQUEST, params);
                        });
                        return forkJoin(linkedLongRunningRequests).pipe(flatMap((fileParts) => {
                                let rawData: string = CoreCommonConstants.EMPTY_STRING;
                                fileParts.forEach(filePart => {
                                    rawData += filePart.data ? filePart.data : filePart;
                                });
                                return of(rawData);
                            })
                        );
                    });
                    return forkJoin(fileDownloads).pipe(flatMap((linkFiles) => {
                            return this.downloadFiles(linkFiles, exportOptions, targetDirectory, fileName, isBatchRequest);
                        })
                    );
                }

                if (response.data.type === ExportConstants.DOWNLOAD_TYPE_FILE_DOWNLOADER) {
                    // Launch File Downloader app using the File Downloader app and the id
                    // of the record where the file is stored
                    AppUtils.launchApp(files['fileDownloaderApp'], 'filesToDownloadId=' + files['filesToDownloadId']);
                    return of(true);
                }

                if (isEmpty(files) || (isBatchRequest && !BatchExportingStore.currentBatchExportAction)) {
                    return of(null);
                }

                return this.downloadFiles(files, exportOptions, targetDirectory, fileName, isBatchRequest).pipe(concatMap((res) => {
                    // If this is batch AND there are skipped requests returned from the server, add them to the BatchRowConfig for later processing
                    // We will display this info to the user in a Batch Row Download Status popover ("PARTIAL") so they know what combos got skipped
                    if (isBatchRequest && response.data.skippedRequests?.length) {
                        for (const skippedRequest of response.data.skippedRequests) {
                            BatchExportingStore.currentBatchExportAction.currentActiveBatchRow.skippedRequests.push(new BatchRowSkippedRequest(skippedRequest.title, skippedRequest.report, skippedRequest.portfolio));
                        }
                        return of(false);
                    }
                    return of(true);
                }));
            }));
    }

    /**
     * Groups multiple files to be downloaded at the same time
     * Adds in a delay to avoid Chrome issue of simultaneous downloads over 10
     */
    downloadFiles(files: string[], exportOptions: any, targetDirectory: string, fileName?: string, isBatchRequest?: boolean): Observable<boolean> {
        // The browser can only download 10 files within a short time period. If the browser sees more than 10 files
        // downloaded at the same time it silently ignores the rest of them.
        // So we need a way to ensure that when we hit a total number that we
        // pause for a second to make the browser think all is ok.

        // For every 10 files we need to build in a 1 second sleep.
        concat(...ArrayUtils.splitArrayIntoChunks(files, 10).map((filesChunk: string[]) => of(filesChunk)
            .pipe(delay(1000))))
            .subscribe((filesChunk: string[]) => {
                filesChunk.forEach(file => ExportUtils.processDownload(exportOptions, file, targetDirectory, fileName, isBatchRequest));
            });
        return of(true);
    }
}
