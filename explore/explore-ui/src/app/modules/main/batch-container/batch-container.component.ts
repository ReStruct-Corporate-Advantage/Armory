import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Report} from '@models/workspace/report.model';
import {BatchExportingStore} from '../../../stores';
import {takeUntil} from 'rxjs/operators';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {SubscribableComponent} from '@blk/explore-ui-core';

/**
 * Batch Container Component
 * It holds a report-presenter component and is hidden in the background for PDF exporting purposes
 */
@Component({
    selector: 'app-batch-container',
    templateUrl: './batch-container.component.html',
    styleUrls: ['./batch-container.component.scss']
})
export class BatchContainerComponent extends SubscribableComponent implements OnInit {
    batchReport: Report;
    runHardRefresh?: boolean; // gets set to either true or false depending on how user clicks run button

    constructor(private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        // Upon initialization, subscribe to the BatchExportingStore's current report so it can update the binding
        // passed to the report presenter
        BatchExportingStore.getCurrentReport$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((report) => {
                this.batchReport = report;
                if (report) {
                    // Mark the Angular change detection to pick up the report binding into the component
                    this.changeDetectorRef.markForCheck();
                    // Sort the widgets based on their x/y coordinates so we export them in the correct order
                    report.getWidgetsInOrder();
                    // The report coming in should be a deep copy
                    // Set the status of the batch container to be loading
                    BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.LOADING);
                }
            });

        // this will be pushed in from the batch settings modal
        // we pass it down the line to widget component via report presenter.
        BatchExportingStore.runHardRefresh$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(runHardRefresh => this.runHardRefresh = runHardRefresh);
    }
}
