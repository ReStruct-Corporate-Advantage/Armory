import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ReportAction} from '@interfaces/report-action-interface';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {ReportActionType} from '@enums/report-action-type.enum';
import {Breakdown, BreakdownBuilderSettings} from '@blk/explore-ui-breakdown';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {BatchExportingStore, WorkspaceStore} from './stores';
import {Widget} from '@models/widget/widget.model';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {CommonUtils} from '@blk/explore-ui-core';
import {DecisionLevelChangeInfo} from '@interfaces/decision-level-change-info.interface';

/**
 * App Store
 *  holds ui event data to be shared within AppComponent and it's child components
 */
@Injectable({
    providedIn: 'root'
})
export class AppStore {
    // Flag if Explore is running in AWC
    public static isAWC = false;

    // Flag if Explore is running in EBC (Electron Based Container)
    public static isEBC = false;

    // Flag if logic of EBC downloading mechanism is being used
    public static isEBCDownloaderEnabled: boolean = false;

    // Id to be used across one session/instance of Explore
    public static exploreSessionId: string = CommonUtils.generateUniqueIdAsString();

    // TODO: moving it from WorkspaceStore, but keeping it as static because updateShowCompositionModel is used in WorkpadUtils static method.
    static showCompositionModel$ = new BehaviorSubject<boolean>(undefined);

    static reportLoadingStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    static loadAllRequestSubject$ = new Subject<{widget: Widget, port: Portfolio}>();

    static expandModellingSubject$ = new Subject<boolean>();

    showEfficientFrontierPanel = new Subject<boolean>();

    exportDownloadingStatus$: BehaviorSubject<ExportDownloadingStatus> = new BehaviorSubject<ExportDownloadingStatus>(null);

    openExportOptionsModal$ = new BehaviorSubject<ExportComposite>(null);

    openReportGroupDateModal$ = new BehaviorSubject<ReportGroup>(null);

    openLoadFavoriteModal$ = new BehaviorSubject<LoadFavoriteAction>(new LoadFavoriteAction({
        type: null,
        treeType: null,
        displayName: null,
        callback: null,
        headerDisplayName: null
    }));

    openSetWorkspaceDateModal$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

    openBreakdownSettingsModal$: BehaviorSubject<{breakdown: Breakdown, breakdownBuilderSettings: BreakdownBuilderSettings, breakdownUpdatedCallback: Function}> = new BehaviorSubject<{breakdown: Breakdown, breakdownBuilderSettings: BreakdownBuilderSettings, breakdownUpdatedCallback: Function}>(null);

    saveFavoriteAction$ = new BehaviorSubject<SaveFavoriteAction>(new SaveFavoriteAction(null, null, null, null, null));

    deleteFavoriteAction$ = new BehaviorSubject<DeleteFavoriteAction>(new DeleteFavoriteAction(null, null, null, null));

    quickSaveLoadingStatus$ = new BehaviorSubject<boolean>(false);

    reportActionSubject$ = new Subject<ReportAction>();

    portfolioNameSubject$ = new Subject<string>();

    // to keep track of optimization spinner
    optimizationOngoing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // to keep track of efficient Frontier spinner
    efficientFrontierOngoing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // to call for composition payload update
    updateCompositionPayload$: Subject<Portfolio> = new Subject<Portfolio>();

    // to clear holding changes and refresh composition
    clearHoldingChangesAndRefreshComposition$: Subject<Portfolio> = new Subject<Portfolio>();

    // update benchmark option on benchmark selector component
    updateBenchmarkOption$: Subject<Portfolio> = new Subject<Portfolio>();

    // toggle between factor block and factor tag
    toggleFactorConstraintValue$: Subject<string> = new Subject<string>();

    // to subscribe and get status of load favorite modal being open or close
    isLoadFavoriteModalOpen$: Subject<ModalStateActionInfo> = new Subject<ModalStateActionInfo>();

    decisionLevelChangeInfo$: Subject<DecisionLevelChangeInfo[]> = new Subject<DecisionLevelChangeInfo[]>();

    /**
     * Get widget loading status$ with widgetId from the map
     */
    static getWidgetLoadingStatus$(widgetId: number, isBatchExport?: boolean): BehaviorSubject<boolean> {
        return isBatchExport ? BatchExportingStore.widgetLoadingStatusMap.get(widgetId) : WorkspaceStore.widgetLoadingStatusMap.get(widgetId);
    }

    /**
     * get show composition model observable
     */
    static getShowCompositionModel$(): Observable<boolean> {
        return AppStore.showCompositionModel$;
    }

    /**
     * get show composition model flag
     */
    static getShowCompositionModel(): boolean {
        return AppStore.showCompositionModel$.getValue();
    }

    /**
     * update showCompositionModel flag
     */
    static updateShowCompositionModel(showCompositionModel: boolean): void {
        AppStore.showCompositionModel$.next(showCompositionModel);
    }

    /**
     * update export downloading status flag
     */
    updateExportDownloadingStatus(downloadInProgress: boolean, exportComposite?: ExportComposite): void {
        this.exportDownloadingStatus$.next({downloadInProgress, exportComposite});
    }

    reloadReport() {
        // need to reload widgets after portfolio is updated
        // currentPortfolio$ is subscribed on ReportPresenterComponent and then portfolio is wrapped off and passed to WidgetComponent via data binding.
        // Without delay, by the time we subscribe to reportActionSubject$, portfolio is not updated immediately on WidgetComponent.
        // another way to solve this without delay is to use setTimeout (with no timeout is ok) which take nano second but is enough time for Angular @Input to update variable
        setTimeout(() =>  this.reportActionSubject$.next({hardRefresh: false, reportAction: ReportActionType.RELOAD_REPORT}), 5);
    }
}
