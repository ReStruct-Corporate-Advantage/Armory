import {BatchExportingStore, WorkspaceStore} from '../../stores';
import {takeUntil} from 'rxjs/operators';
import {Workspace} from '@models/workspace/workspace.model';
import {FavoriteService} from '@services/favorite';
import {ExportConfig} from '@interfaces/export-config.interface';
import {AppStore} from '../../app.store';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {Breakdown, BreakdownBuilderSettings} from '@blk/explore-ui-breakdown';
import {Widget} from '@models/widget/widget.model';
import {Component, Input, OnInit} from '@angular/core';
import {ReportGroup} from '@models/workspace/report-group.model';
import {PDFExportAction} from '@models/export/pdf-export-action.model';
import {isNil} from 'lodash';
import {SubscribableComponent} from '@blk/explore-ui-core';

/**
 * Main Component
 *  displays the whole workspace
 *
 * @example
 *  <ng-template #showMain>
 *      <app-main [workspace]="workspace"></app-main>
 *  </ng-template>
 */
@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent extends SubscribableComponent implements OnInit {
    @Input() workspace: Workspace;

    // favorite modals
    isSaveFavoriteModalOpen = false;

    // Export
    isExportOptionsModalOpen = false;
    exportConfig: ExportConfig;
    exportComposite: ExportComposite;

    // Set Workspace Date
    isSetWorkspaceDateModalOpen = false;

    // Breakdown Settings
    isBreakdownSettingsModalOpen = false;

    isSetReportGroupDateModalOpen = false;
    reportGroup: ReportGroup;

    breakdownSettingsModalConfig: {
        breakdown: Breakdown,
        breakdownBuilderSettings: BreakdownBuilderSettings,
        breakdownUpdatedCallback: Function
    };

    currentWidget: Widget;

    /**
     * constructor
     */
    constructor(private favoriteService: FavoriteService, private appStore: AppStore) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // If we don't have any ongoing PDF export update export downloading status
        BatchExportingStore.getCurrentPDFExportAction$().pipe(takeUntil(this.ngUnsubscribe)).subscribe((ongoingPDFexportAction: PDFExportAction) => {
            if (isNil(ongoingPDFexportAction)) {
                // Set timeout because after batch container is ready it takes 2000ms to export it
                setTimeout(() => {
                    this.appStore.updateExportDownloadingStatus(false);
                }, 2000);
            }
        });

        // open reportGroupOptionsModal
        this.appStore.openReportGroupDateModal$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((reportGroup) => {
            if (!reportGroup) {
                this.isSetReportGroupDateModalOpen = false;
                return;
            }
            this.reportGroup = reportGroup;
            this.isSetReportGroupDateModalOpen = true;
        });

        // open exportOptionsModal with param on subscribe
        this.appStore.openExportOptionsModal$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((config) => {
            if (!config) {
                this.isExportOptionsModalOpen = false;
                return;
            }

            this.exportComposite = config;
            this.isExportOptionsModalOpen = true;
        });

        // open Set Workspace date on subscribe
        this.appStore.openSetWorkspaceDateModal$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((openSetWorkspaceDateModal) => {
            this.isSetWorkspaceDateModalOpen = openSetWorkspaceDateModal;
        });

        this.appStore.openBreakdownSettingsModal$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (breakdownSettingsModalConfig: {
                    breakdown: Breakdown,
                    breakdownBuilderSettings: BreakdownBuilderSettings,
                    breakdownUpdatedCallback: Function
                }) => {
                    this.isBreakdownSettingsModalOpen = !!breakdownSettingsModalConfig;
                    this.breakdownSettingsModalConfig = breakdownSettingsModalConfig;
                    this.currentWidget = WorkspaceStore.getCurrentWidget();
                }
            );
    }

    closeSetReportGroupDateModal(): void {
        this.appStore.openReportGroupDateModal$.next(null);
    }

    /**
     * Close export options modal, bound with emit event
     */
    closeExportOptionsModal(): void {
        this.appStore.openExportOptionsModal$.next(null);
    }

    /**
     * Close set workspace date modal, bound with emit event
     */
    closeSetWorkspaceDateModal(): void {
        this.appStore.openSetWorkspaceDateModal$.next(false);
    }

    /**
     * Close breakdown settings modal, bound with emit event
     */
    closeBreakdownSettingsModal(): void {
        this.appStore.openBreakdownSettingsModal$.next(null);
    }
}
