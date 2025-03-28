import {BehaviorSubject} from 'rxjs';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Workspace} from '@models/workspace/workspace.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {Widget} from '@models/widget/widget.model';
import {BatchExportingStore} from './batch-exporting.store';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {PDFExportAction} from '@models/export/pdf-export-action.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';

describe('BatchExportingStore', () => {
    const workspace = new Workspace();
    const workpad = new FlatWorkpad();
    const portfolio = new Portfolio('PEP');
    const report = new Report('report');
    const widget = new Widget();

    beforeEach(() => {
        BatchExportingStore.workspace$ = new BehaviorSubject<Workspace>(workspace);
        BatchExportingStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad);
        BatchExportingStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(portfolio);
        BatchExportingStore.currentReport$ = new BehaviorSubject<Report>(report);
        BatchExportingStore.currentWidget$ = new BehaviorSubject<Widget>(widget);
    });

    describe('Getters Test', () => {
        it('should test every getter', () => {
            const subscription1 = BatchExportingStore.getWorkspace$().subscribe((workspaceReceived: Workspace) => {
                expect(workspaceReceived).toEqual(workspace);
            });
            const subscription2 = BatchExportingStore.getCurrentWorkpad$().subscribe((workpadReceived: FlatWorkpad) => {
                expect(workpadReceived).toEqual(workpad);
            });
            const subscription3 = BatchExportingStore.getCurrentPortfolio$().subscribe((portfolioReceived: Portfolio) => {
                expect(portfolioReceived).toEqual(portfolio);
            });
            const subscription4 = BatchExportingStore.getCurrentReport$().subscribe((reportReceived: Report) => {
                expect(reportReceived).toEqual(report);
            });
            const subscription5 = BatchExportingStore.getCurrentWidget$().subscribe((widgetReceived: Widget) => {
                expect(widgetReceived).toEqual(widget);
            });

            expect(BatchExportingStore.getWorkspace()).toEqual(workspace);
            expect(BatchExportingStore.getCurrentWorkpad()).toEqual(workpad);
            expect(BatchExportingStore.getCurrentPortfolio()).toEqual(portfolio);
            expect(BatchExportingStore.getCurrentReport()).toEqual(report);
            expect(BatchExportingStore.getCurrentWidget()).toEqual(widget);

            subscription1.unsubscribe();
            subscription2.unsubscribe();
            subscription3.unsubscribe();
            subscription4.unsubscribe();
            subscription5.unsubscribe();
        });
    });

    it('Test clearStore', () => {
        BatchExportingStore.init();
        BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.LOADING);
        BatchExportingStore.currentPDFExportAction$.next(new PDFExportAction(null, null, null, null, null));
        BatchExportingStore.currentBatchRow$.next(BatchReportingTestUtils.createDummyBatchRowConfig());
        const exportComposite = new ExportComposite();
        BatchExportingStore.batchExportQueue = [exportComposite];

        BatchExportingStore.clearStore();
        expect(BatchExportingStore.getBatchContainerStatus()).toEqual(BatchContainerStatus.IDLE);
        expect(BatchExportingStore.getCurrentPDFExportAction()).toEqual(null);
        expect(BatchExportingStore.getCurrentBatchRow()).toEqual(null);
        expect(BatchExportingStore.batchExportQueue).toEqual([]);
    });
});
