import {
    AuxButtonSizeEnum,
    AuxButtonTypeEnum,
    AuxInlineMenuInterface,
    AuxInlineMenuItemClickedDetailInterface,
    AuxToggleChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ExportConstants, ExportLevel} from '../../../../constants';
import {
    CoreFavoriteConstants, CoreFavoriteStore,
    CoreFavoriteUtils,
    CoreFavoriteVersioningStore,
    CoreUserMetaDataStore,
    FavoriteType,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryReportActionParameters,
    TelemetryService,
    TokenConstants,
    TokenUtils,
    WidgetCopyPasteEnum
} from '@blk/explore-ui-core';
import {WorkspaceStore} from '../../../../stores';
import {AppStore} from '../../../../app.store';
import {AppUtils} from '@utils/app.utils';
import {NotificationService} from '@services/notification';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {ReportActionType} from '@enums/report-action-type.enum';
import {ReportAction} from '@interfaces/report-action-interface';
import {BehaviorSubject, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {ExportUtils} from '@utils/export/export.utils';
import {CancelService} from '@services/cancel/cancel.service';
import {FavoriteConstants} from '@constants/favorite.constants';
import {Report} from '@models/workspace/report.model';
import {ExploreWidgetPasteService} from '@services/widget-data/explore-widget-paste.service';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {ReportService} from '@services/workspace';

/**
 *  Report Bar Component
 *
 * @example
 *  <ng-container *ngIf="(showReportPresenter$ | async); else showTemplateSelector">
 *      <app-report-bar [title]="currentReport.title"></app-report-bar>
 *  </ng-container>
 */
@Component({
    selector: 'app-report-bar',
    templateUrl: './report-bar.component.html',
    styleUrls: ['./report-bar.component.scss']
})
export class ReportBarComponent extends SubscribableComponent implements OnInit {

    coreFavoriteUtils = CoreFavoriteUtils;

    @Input() title: string;
    @Input() owner: string;
    @Input() isWhatIfPortfolio = false;
    @Input() showCompositionModel = false;
    @Input() deleteReport: Function;
    @Input() removeReportFromReportPanel: Function;
    loadFavoriteReport: Function;

    @Output() showComposition = new EventEmitter();
    @Output() openPasteModal = new EventEmitter();
    @Output() updateAuxTabBar$ = new EventEmitter<void>();

    isReportLoading$: BehaviorSubject<boolean>;
    exportingInProgress: boolean;

    isSaveReportModalOpen = false;

    isWidgetGalleryModalOpen = false;

    readonly exportLevel = ExportConstants.EXPORT_PDF_REPORT;
    readonly REPORT_ACTION_TYPE = ReportActionType;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    reportBarMenuOptions: AuxInlineMenuInterface[][];
    readonly DELETE_REPORT = 'Delete Report';
    readonly SAVE_REPORT = 'Save Report';
    readonly reportGroupMenuIconType = 'action';
    readonly VIEW_USAGE = 'View Usage';
    readonly REPORT_PREV_VERSION_MESSAGE = 'You are currently viewing a previous version of this report';

    isCompareModalOpen = false;
    isComparisonApplicable = false;
    isCompareModeOn = false;
    currentReport: Report;
    currentReport$: Observable<Report>;

    /**
     * constructor
     */
    constructor(private appStore: AppStore, private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef, private cancelService: CancelService, private reportService: ReportService, private widgetPasteService: ExploreWidgetPasteService) {
        super();
        this.isReportLoading$ = AppStore.reportLoadingStatus$;
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.loadFavoriteReport = this.reportService.loadFavoriteReportVersion;

        // Check if downloading is in progress for report or not
        this.appStore.exportDownloadingStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((downloadStatus: ExportDownloadingStatus) => {
            this.exportingInProgress = !!(ExportUtils.isExportDownloadingStatusValid(downloadStatus) && downloadStatus.exportComposite.report && !downloadStatus.exportComposite.widget && downloadStatus.exportComposite.exportConfig.exportLevel !== ExportLevel.GRID);
            this.changeDetectorRef.detectChanges();
        });

        WorkspaceStore.getCurrentWorkpad$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((workpad: BaseWorkpad) => {
                this.isComparisonApplicable = workpad?.getAllPortfolios().length >= 2;
            });

            this.currentReport$ = WorkspaceStore.getCurrentReport$();
            WorkspaceStore.getCurrentReport$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((report: Report) => {
                this.currentReport = report;
                this.setReportBarMenuOptions();
                if (!this.isComparisonApplicable) {
                    return;
                }
                const comparisonConfig = this.getComparisonConfig(report);
                this.isCompareModeOn = !!comparisonConfig;
            });
    }

    private setReportBarMenuOptions(): void {
        this.reportBarMenuOptions = [[{label: this.SAVE_REPORT}, {label: this.DELETE_REPORT, isDisabled: false}]];
        // Show Delete link only to enterprise owner and for latest version
        if (this.currentReport && this.currentReport.id && this.currentReport.latestFavoriteVersion && this.currentReport.currentFavoriteVersion &&
            TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS)
            && this.currentReport.owner === CoreFavoriteConstants.ADMIN) {
             if (this.currentReport.latestFavoriteVersion !== this.currentReport.currentFavoriteVersion) {
                // disable delete option for previous versions
                this.reportBarMenuOptions[0][1] = {label: this.DELETE_REPORT, isDisabled: true};
            }
        }
        // Show View Usage link only to enterprise owner
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_FAVORITE_USERS) && this.currentReport.id
            && this.currentReport.owner === CoreFavoriteConstants.ADMIN) {
            const userPermGroup = CoreUserMetaDataStore.userMetaData.userPermissionGroups;
            // Show View Usage link to the enterprise user only if
            // 1. Selected favorite doesn't have any permission group
            // 2. User has a permission group which matches the selected favorite's perm group.
            if (!this.currentReport.userPermGrps || this.currentReport.userPermGrps?.length === 0 ||
                userPermGroup?.some((value) => this.currentReport.userPermGrps?.includes(value))) {
                this.reportBarMenuOptions[0].splice(2, 0, {label: this.VIEW_USAGE});
            }
        }
        if (CoreFavoriteUtils.showFavStatusTagMenu(this.currentReport)) {
            this.reportBarMenuOptions[0].splice(1, 0, {label: 'Update Status'});
        }
    }

    private getComparisonConfig(report?: Report): ComparisonConfig {
        report ??= WorkspaceStore.getCurrentReport();
        return report?.comparisonConfigId && WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.get(report.comparisonConfigId);
    }

    /**
     * Open saveFavoriteModal
     */
    openSaveFavoriteModal(): boolean {
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                this.currentReport,
                FavoriteConstants.REPORT_PASCAL,
                FavoriteConstants.LAYOUT,
                FavoriteConstants.LAYOUT_FOLDER
            ));

        return false;
    }

    openDeleteFavoriteModal(): boolean {
        this.appStore.deleteFavoriteAction$.next(
            new DeleteFavoriteAction(
                this.currentReport,
                FavoriteConstants.REPORT_PASCAL,
                FavoriteConstants.LAYOUT,
                FavoriteConstants.LAYOUT_FOLDER,
                this.removeReportFromReportPanel
            ));

        return false;
    }

    /**
     * On toggle changed
     */
    onToggleChanged(event: CustomEvent<AuxToggleChangedDetailInterface>): void {
        this.showComposition.emit(event.detail.value.checked);
    }

    /**
     * Open widget gallery modal
     */
    openWidgetGalleryModal(): void {
        this.isWidgetGalleryModalOpen = true;
    }

    /**
     * Close widget gallery modal
     */
    closeWidgetGalleryModal(): void {
        this.isWidgetGalleryModalOpen = false;
    }

    /**
     * emit call open paste widget modal event
     */
    callOpenPasteWidgetModal(event): void {
        navigator.clipboard.readText().then(
            async text => {
                await this.widgetPasteService.pasteWidget(text, this.currentReport);
                this.widgetPasteService.pasteComplete();
            }
        )
            .catch(() => {
                    this.openPasteModal.emit(true);
                    this.trackWidgetCopiedViaTelemetry(WidgetCopyPasteEnum.PASTE_WIDGET_MODAL_OPENED);
                }
            );
        event.preventDefault();
    }

    private trackWidgetCopiedViaTelemetry(actionType: string) {
        const reportUserActionParameters = new TelemetryReportActionParameters({actionType, widgetTypes: [],
            reportTitle: this.currentReport.title, reportId: this.currentReport.id, reportOwner: this.currentReport.owner, isWhatIfPortfolio: this.isWhatIfPortfolio});
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.WIDGET_COPY_PASTE, reportUserActionParameters);
    }

    /**
     * Refreshes all the widgets of the current report
     * Triggers report reload or cancel
     */
    setReportAction(event: any): void {
        const reportAction = event.target.label;
        const reportReloadInfo: ReportAction = {reportAction};
        if (reportAction === ReportActionType.RELOAD_REPORT) {
            this.telemetryTrackReportAction('RELOAD_REPORT');
            reportReloadInfo.hardRefresh = AppUtils.isCtrlPressed(event);
            reportReloadInfo.debugContext = AppUtils.isCtrlPressed(event) && AppUtils.isShiftPressed(event);
        }
        this.appStore.reportActionSubject$.next(reportReloadInfo);

        if (reportAction === ReportActionType.CANCEL_RELOAD) {
            this.telemetryTrackReportAction('CANCEL_RELOAD_REPORT');
            this.cancelService.cancelAll();
        }

        // To prevent redirection to home page.
        event.preventDefault();
    }

    /**
     * track reloaded or cancelled report with telemetry
     */
    telemetryTrackReportAction(reportAction: string): void {
        const widgetTypes = [];
        if (this.currentReport.widgets) {
            this.currentReport.widgets.forEach((widget, i) => {
                widgetTypes[i] = widget.configType ? widget.configType.toString() : 'unknown';
            });
            const telemetryReportUserActionParameters = new TelemetryReportActionParameters({actionType: reportAction, widgetTypes,
                reportTitle: this.currentReport.title, reportId: this.currentReport.id, reportOwner: this.currentReport.owner, isWhatIfPortfolio: this.isWhatIfPortfolio});
            TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.RELOAD_OR_CANCEL_REPORT, telemetryReportUserActionParameters);
        }
    }

    onReportBarMenuClicked(event: CustomEvent<AuxInlineMenuItemClickedDetailInterface>): void {
        if (event.detail?.element?.label === this.SAVE_REPORT) {
            this.openSaveFavoriteModal();
        } else if (event.detail?.element?.label === this.DELETE_REPORT) {
            this.openDeleteFavoriteModal();
        } else if (event.detail?.element?.label === this.VIEW_USAGE) {
            CoreFavoriteVersioningStore.viewUsageTypeAction$.next({id: this.currentReport.id, type: FavoriteType.REPORT, isOpen: true});
        } else if (event.detail?.element?.label === 'Update Status') {
            this.onUpdateStatusMenuClick();
        }
    }

    /**
     * function to open the Compare modal
     */
    openCompareModal(): void {
        this.isCompareModalOpen = true;
    }

    /**
     * Close compare modal, bound with eventEmitter from CompareModalComponent
     */
    closeCompareModal(applyClicked: boolean): void {
        if (typeof applyClicked === 'boolean') {
            this.isCompareModeOn = this.getComparisonConfig()?.portComparisonList.length > 0;
            this.updateAuxTabBar$.emit();
        }
        this.isCompareModalOpen = false;
    }

    /**
     * Method is triggered when any of menu is clicked/selected
     */
    onUpdateStatusMenuClick(): void {
        CoreFavoriteStore.favStatusUpdateAction$.next({favorite: this.currentReport, favoriteType: FavoriteConstants.LAYOUT});
    }
}
