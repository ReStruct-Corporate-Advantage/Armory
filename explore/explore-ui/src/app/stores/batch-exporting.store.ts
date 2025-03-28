import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Workspace} from '@models/workspace/workspace.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {PDFExportAction} from '@models/export/pdf-export-action.model';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {BatchExportAction} from '@models/batch-reporting/batch-export-action.model';
import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';

export class BatchExportingStore {
    // Batch Workspace subjects
    static workspace$: BehaviorSubject<Workspace>;
    static currentWorkpad$: BehaviorSubject<BaseWorkpad>;
    static currentReport$: BehaviorSubject<Report>;
    static currentWidget$: BehaviorSubject<Widget>;
    static currentPortfolio$: BehaviorSubject<Portfolio>;

    // The batch container should start out as idle
    static batchContainerStatus$: BehaviorSubject<BatchContainerStatus>;
    static batchExportQueue: ExportComposite[] = [];
    static currentExportComposite: ExportComposite;
    static currentPDFExportAction$: BehaviorSubject<PDFExportAction>;
    static currentBatchExportAction: BatchExportAction;
    static currentBatchReport$: BehaviorSubject<BatchReportConfig>;
    static currentBatchRow$: BehaviorSubject<BatchRowConfig>;
    static batchDownloadStatus$: Subject<boolean>;
    static batchCanceller$: Subject<void>;

    static widgetLoadingStatusMap = new Map<number, BehaviorSubject<boolean>>();

    // Scheduled Batch
    static scheduledBatchMap = new Map<number|string, ScheduledBatchConfig>();
    static currentScheduledBatchConfig$: BehaviorSubject<ScheduledBatchConfig>;

    // maintain status for hard refresh on batch settings
    static runHardRefresh$: BehaviorSubject<boolean>;

    /**
     * initialize the Workspace store with default values
     */
    static init(): void {
        BatchExportingStore.workspace$ = new BehaviorSubject<Workspace>(new Workspace());
        BatchExportingStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(undefined);
        BatchExportingStore.currentReport$ = new BehaviorSubject<Report>(undefined);
        BatchExportingStore.currentWidget$ = new BehaviorSubject<Widget>(undefined);
        BatchExportingStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(undefined);
        BatchExportingStore.batchContainerStatus$ = new BehaviorSubject(BatchContainerStatus.IDLE);
        BatchExportingStore.currentPDFExportAction$ = new BehaviorSubject<PDFExportAction>(undefined);
        BatchExportingStore.currentBatchReport$ = new BehaviorSubject<BatchReportConfig>(undefined);
        BatchExportingStore.currentBatchRow$ = new BehaviorSubject<BatchRowConfig>(undefined);
        BatchExportingStore.batchDownloadStatus$ = new Subject<boolean>();
        BatchExportingStore.batchCanceller$ = new Subject();
        BatchExportingStore.batchExportQueue = [];

        // Scheduled Batch
        BatchExportingStore.currentScheduledBatchConfig$ = new BehaviorSubject<ScheduledBatchConfig>(undefined);

        // hard refresh
        BatchExportingStore.runHardRefresh$ = new BehaviorSubject<boolean>(false);
    }

    /**
     * Clears out the store
     * Used in the event of cancel batch
     */
    static clearStore(): void {
        // Clear out the ExportComposite queue
        BatchExportingStore.batchExportQueue = [];
        // Clear out the current PDFExportAction
        BatchExportingStore.currentPDFExportAction$.next(null);
        // Clear out the current BatchRow
        BatchExportingStore.currentBatchRow$.next(null);
        // Reset the BatchContainerStatus
        BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.IDLE);
    }

    /**
     * Returns true if the current batch process has been canceled by the user
     */
    static isBatchCanceled(): boolean {
        if (BatchExportingStore.currentBatchExportAction && BatchExportingStore.currentBatchExportAction.canceled) {
            BatchExportingStore.currentBatchExportAction = null;
            return true;
        }
        // If there is nothing in the queue then it doesn't matter if it is cancelled or not.
        if (!BatchExportingStore.batchExportQueue || BatchExportingStore.batchExportQueue.length === 0) {
            return false;
        }

        return false;
    }

    /**
     * Get Workspace observable
     */
    static getWorkspace$(): Observable<Workspace> {
        return BatchExportingStore.workspace$;
    }

    /**
     * Get Workspace
     */
    static getWorkspace(): Workspace {
        return BatchExportingStore.workspace$.getValue();
    }

    /**
     * Get current Workpad observable
     */
    static getCurrentWorkpad$(): Observable<BaseWorkpad> {
        return BatchExportingStore.currentWorkpad$;
    }

    /**
     * Get current Workpad
     */
    static getCurrentWorkpad(): BaseWorkpad {
        return BatchExportingStore.currentWorkpad$.getValue();
    }

    /**
     * Get current Report observable
     */
    static getCurrentReport$(): Observable<Report> {
        return BatchExportingStore.currentReport$;
    }

    /**
     * Get current Report
     */
    static getCurrentReport(): Report {
        return BatchExportingStore.currentReport$.getValue();
    }

    /**
     * Get current Widget observable
     */
    static getCurrentWidget$(): Observable<Widget> {
        return BatchExportingStore.currentWidget$;
    }

    /**
     * Get current Widget
     */
    static getCurrentWidget(): Widget {
        return BatchExportingStore.currentWidget$.getValue();
    }

    /**
     * Get current Portfolio observable
     */
    static getCurrentPortfolio$(): Observable<Portfolio> {
        return BatchExportingStore.currentPortfolio$;
    }

    /**
     * Get current Portfolio
     */
    static getCurrentPortfolio(): Portfolio {
        return BatchExportingStore.currentPortfolio$.getValue();
    }

    /**
     * Gets the current Portfolio and any other portfolios in the current ExportComposite (for comparison requests)
     */
    static getPortfoliosForExport(): Portfolio[] {
        return BatchExportingStore.currentWorkpad$.getValue() && BatchExportingStore.currentWorkpad$.getValue().hasComparisonPortfolios(BatchExportingStore.currentExportComposite.report.comparisonConfigId) ? BatchExportingStore.currentExportComposite.portfolios : [BatchExportingStore.getCurrentPortfolio()];
    }

    /**
     * Get BatchContainerStatus observable
     */
    static getBatchContainerStatus$(): Observable<BatchContainerStatus> {
        return BatchExportingStore.batchContainerStatus$;
    }

    /**
     * Get BatchContainerStatus
     */
    static getBatchContainerStatus(): BatchContainerStatus {
        return BatchExportingStore.batchContainerStatus$.getValue();
    }

    /**
     * Get current PDFExportAction observable
     */
    static getCurrentPDFExportAction$(): Observable<PDFExportAction> {
        return BatchExportingStore.currentPDFExportAction$;
    }

    /**
     * Get current PDFExportAction
     */
    static getCurrentPDFExportAction(): PDFExportAction {
        return BatchExportingStore.currentPDFExportAction$.getValue();
    }

    /**
     * Get current BatchReportConfig observable
     */
    static getCurrentBatchReport$(): Observable<BatchReportConfig> {
        return BatchExportingStore.currentBatchReport$;
    }

    /**
     * get current BatchReportConfig
     */
    static getCurrentBatchReport(): BatchReportConfig {
        return BatchExportingStore.currentBatchReport$.getValue();
    }

    /**
     * Get current BatchRowConfig observable
     */
    static getCurrentBatchRow$(): Observable<BatchRowConfig> {
        return BatchExportingStore.currentBatchRow$;
    }

    /**
     * get current BatchRowConfig
     */
    static getCurrentBatchRow(): BatchRowConfig {
        return BatchExportingStore.currentBatchRow$.getValue();
    }

    /**
     * Get current ScheduledBatchConfig observable
     */
    static getCurrentScheduledBatchConfig$(): Observable<ScheduledBatchConfig> {
        return BatchExportingStore.currentScheduledBatchConfig$;
    }

    /**
     * get current ScheduledBatchConfig
     */
    static getCurrentScheduledBatchConfig(): ScheduledBatchConfig {
        return BatchExportingStore.currentScheduledBatchConfig$.getValue();
    }
}
