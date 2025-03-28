import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {AuxNotificationGroup} from '@blk/aladdin-angular-components';
import {
    AlertConstants,
    CommonUtils,
    CoreWidgetConstants, ErrorTypeConstants,
    ExploreDialogParam,
    SubscribableComponent, UIErrorParameters,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {URLConstants} from '@constants/url.constants';
import {UserPreference} from '@constants/user-preference.constants';
import {WidgetConstants} from '@constants/widget.constants';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {ReportActionType} from '@enums/report-action-type.enum';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Notification} from '@models/widget/notification.model';
import {Report} from '@models/workspace/report.model';
import {ExportService} from '@services/export/export.service';
import {NotificationService} from '@services/notification';
import {AppUtils} from '@utils/app.utils';
import {WidgetUtils} from '@utils/widget.utils';
import {GridApi} from 'ag-grid-community';
import {
    CompactType,
    DisplayGrid,
    GridsterComponent,
    GridsterConfig,
    GridsterItem,
    GridsterItemComponentInterface,
    GridsterPush,
    GridType
} from 'explore-angular-gridster2';
import {every, isEmpty, isEqual} from 'lodash';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../../app.store';
import {BatchExportingStore, UserMetaDataStore} from '../../../../stores';
import {WorkspaceStore} from '@stores/workspace.store';
import {RequestCancelerStore} from '../../../request-canceler/store/request-canceler.store';
import {WidgetComponent} from '../../../widget/widget.component';
import {ExploreWidgetPasteService} from '@services/widget-data/explore-widget-paste.service';
import {HttpRequestQueueService} from '@services/http-request-queue/http-request-queue.service';

/**
 * Report Presenter Component
 *
 * @example
 *  <ng-container *ngIf="(showReportPresenter$ | async)">
 *      <app-report-presenter [report]="(currentReport$ | async)"></app-report-presenter>
 *  </ng-container>
 */
@Component({
    selector: 'app-report-presenter',
    templateUrl: './report-presenter.component.html',
    styleUrls: ['./report-presenter.component.scss']
})
export class ReportPresenterComponent extends SubscribableComponent implements OnInit, OnChanges {
    static readonly HEIGHT_DEDUCTION_NAV_DRAWER_OPEN: number = 266;
    static readonly HEIGHT_DEDUCTION_NAV_DRAWER_CLOSED: number = 308;
    // Maximum # of times we are willing to check for widgets to be rendered for PDF exporting (after data has already loaded)
    static readonly PDF_EXPORT_RETRY_COUNT: number = 20;

    /** Report containing widgets to place in gridster grid */
    @Input() report: Report;
    @Input() showCompositionModel: boolean;
    @Input() isWhatIfPortfolio: boolean;
    // ngIf for paste widget modal
    @Input() openPasteWidgetModal: boolean;
    @Output() closePasteModal = new EventEmitter();
    // Flag used to determine if this component is used for Batch exporting
    @Input() isBatchExport?: boolean;
    // Flag to determine if it's a hard refresh (intended to be true in case of batch pdf)
    @Input() runHardRefresh?: boolean;
    // Counter to track how many times we are waiting for the widgets to be rendered (after data has already loaded)
    batchExportRetryCounter: number = 0;
    batchPDFDebugMode = false;

    portfolio: Portfolio;
    notificationIDArray: string[] = [];

    @ViewChild('reloadNotifier', {static: true}) reloadNotifier: AuxNotificationGroup;
    /** Reference to the gridster grid */
    @ViewChild(GridsterComponent, {static: false}) gridster: GridsterComponent;
    /** All of the WidgetComponents within the Report */
    @ViewChildren('widgetComponent') widgetComponents: QueryList<WidgetComponent>;

    // Gridster configuration
    gridsterOptions: GridsterConfig;
    // Controls the height of the gridster
    gridsterContainerHeight = 0;

    // height deduction of everything that is not the gridster area
    private HEIGHT_DEDUCTION: number = ReportPresenterComponent.HEIGHT_DEDUCTION_NAV_DRAWER_CLOSED;
    // triggers the recalculation of the gridster height and debounces the number of triggers
    private gridsterResizeDebouncer: Subject<GridAction>;

    // flag for when widgets are being dragged around the screen
    private draggingWidgets = false;

    widgetHiddenStatus$ = new BehaviorSubject<boolean>(false);

    /**
     * constructor
     */
    constructor(private changeDetectorRef: ChangeDetectorRef, private notificationService: NotificationService, private appStore: AppStore, private exportService: ExportService, private widgetPasteService: ExploreWidgetPasteService,
                private httpRequestQueueService: HttpRequestQueueService) {
        super();
        this.batchPDFDebugMode = CommonUtils.getURLParam(URLConstants.SHOW_BATCH_PDF_TOGGLE_BUTTON) === 'true';
    }

    /**
     * ngOnChange
     */
    ngOnInit(): void {
        const portfolioObservable = this.isBatchExport ? BatchExportingStore.getCurrentPortfolio$() : WorkspaceStore.getCurrentPortfolio$();

        portfolioObservable
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((port) => {
                if (!port) {
                    return;
                }
                if (this.portfolio && this.portfolio.portId !== port.portId) {
                    this.clearNotifications();
                }
                this.portfolio = port;
                this.changeDetectorRef.markForCheck();
            });

        this.gridsterOptions = {
            gridType: GridType.ScrollVertical,
            compactType: CompactType.CompactUp,
            margin: 8,
            outerMargin: false,
            useTransformPositioning: !this.isBatchExport, // transform css property has weird interactions when trying to export a report as-is
            disableScrollHorizontal: true,
            minCols: WidgetConstants.GRIDSTER_CONSTANTS.MIN_COLS,
            maxCols: WidgetConstants.GRIDSTER_CONSTANTS.MAX_COLS,
            minRows: WidgetConstants.GRIDSTER_CONSTANTS.MIN_ROWS,
            maxRows: WidgetConstants.GRIDSTER_CONSTANTS.MAX_ROWS,
            minItemCols: WidgetConstants.GRIDSTER_CONSTANTS.MIN_ITEM_COLS,
            maxItemCols: WidgetConstants.GRIDSTER_CONSTANTS.MAX_ITEM_COLS,
            minItemRows: WidgetConstants.GRIDSTER_CONSTANTS.MIN_ITEM_ROWS,
            maxItemRows: WidgetConstants.GRIDSTER_CONSTANTS.MAX_ITEM_ROWS,
            defaultItemCols: WidgetConstants.GRIDSTER_CONSTANTS.DEFAULT_ITEM_COLS,
            defaultItemRows: WidgetConstants.GRIDSTER_CONSTANTS.DEFAULT_ITEM_ROWS,
            mobileBreakpoint: WidgetConstants.GRIDSTER_CONSTANTS.MOBILE_BREAKPOINT,
            draggable: {
                delayStart: 100,
                enabled: true,
                // ignoreContentClass takes an array of classes with the customized gridster.
                ignoreContentClass: ['aux-inline-menu__container', 'widget-content'],
                start: () => {
                    if (this.draggingWidgets) {
                        // HACK DESCRIPTION
                        // If this.draggingWidgets is true, that means we somehow triggered dragStart a 2nd time (possible because of drag delay setTimeout)
                        // This causes gridster to enter into a bad state where it locks widgets and prevents further dragging and dropping to occur.
                        // It also causes the current widget to follow the cursor, even if the user isn't dragging anymore.
                        // We're throwing an error to prevent gridster code from continuing to execute the rest of the library's dragStart code
                        throw new Error('Prevent 2nd dragStart event');
                    }
                    this.draggingWidgets = true;
                },
                stop: () => {
                    this.draggingWidgets = false;
                    this.resizeGridContainer('WIDGET_DRAG');
                }
            },
            resizable: {
                enabled: true,
                start: () => {
                    const clarityDivs = Array.from(document.getElementsByClassName('clarity-container'));
                    clarityDivs.forEach((div) => {
                        div.classList.add('clarity-drag');
                    });
                },
                stop: () => {
                    const clarityDivs = Array.from(document.getElementsByClassName('clarity-container'));
                    clarityDivs.forEach((div) => {
                        div.classList.remove('clarity-drag');
                    });
                }
            },
            swap: false,
            pushItems: true,
            pushDirections: {north: true, east: false, south: true, west: false},
            disablePushOnDrag: false,
            disablePushOnResize: false,
            displayGrid: DisplayGrid.None,
            disableWindowResize: true,
            disableWarnings: false,
            scrollToNewItems: false,
            disableAutoPositionOnConflict: true,
            itemInitCallback: (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
                if (itemComponent.notPlaced) {
                    itemComponent.notPlaced = false;
                    const push = new GridsterPush(itemComponent);
                    push.pushItems(push.fromNorth);
                    push.checkPushBack();
                    push.setPushedItems();
                    itemComponent.setSize();
                    itemComponent.checkItemChanges(itemComponent.$item, itemComponent.item);
                    push.destroy();
                }
                this.resizeGridContainer('WIDGET_ADDED');
            },
            gridSizeChangedCallback: () => {
                // do not resize grid container while widgets are still being dragged
                if (!this.draggingWidgets) {
                    this.resizeGridContainer('GRID_SIZE_CHANGED');
                }
            },
            itemRemovedCallback: () => this.resizeGridContainer('WIDGET_REMOVED'),
        };

        // use a subject to debounce the number of times that we are resizing the gridster container height
        // each time the grid resizes, each widget will send a signal to resize and we really only need to do it once
        this.gridsterResizeDebouncer = new Subject<any>();
        this.gridsterResizeDebouncer.pipe(
            debounceTime(100),
            takeUntil(this.ngUnsubscribe)
        ).subscribe((gridAction: GridAction) => this.setGridContainerHeight(gridAction));

        // Subscribe to changes in the theme.
        UserMetaDataStore.getPreferenceSubject(UserPreference.THEME)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => {
                // Refresh the fba Bar chart to update the color of dots based on theme
                if (this.widgetComponents) {
                    this.widgetComponents.filter(widgetComponent => widgetComponent.widget.configType === WidgetConfigType.FACTOR_GRAPHING_BAR_CHART)
                        .forEach(widget => widget.refreshWidget());
                }
            });

        // resize the grid when the navigation drawer is opened/closed
        UserMetaDataStore.getPreferenceSubject(UserPreference.NAVIGATION_DRAWER_OPEN)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => {
                // widget grid height changes because of save banner
                this.HEIGHT_DEDUCTION = (value === 'true') ? ReportPresenterComponent.HEIGHT_DEDUCTION_NAV_DRAWER_OPEN : ReportPresenterComponent.HEIGHT_DEDUCTION_NAV_DRAWER_CLOSED;
                this.resizeGridAndWidgets();
            });

        this.notificationService.widgetReloadPrompt$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((notification) => {
            if (this.widgetComponents && this.widgetComponents.length > 0) {
                // only show the notification if it is not already in the list.
                if (this.notificationIDArray.indexOf(notification.id) === -1) {
                    this.notificationIDArray.push(notification.id);
                }

                this.reloadNotifier.open(notification.toPlainObj());

                // Clear all the widget payloads so it clears the widget contents.
                // NOTE:  Am not going this in the if above as the notification can be there and a single widget have been reloaded.
                if (notification.message === CommonConstants.WIDGET_RELOAD_MESSAGE) {
                    // Reattach parent settings
                    this.widgetComponents.forEach((widget) => {
                        widget.widgetPayload = undefined;
                        widget.updateWidgetDerivedSettings();
                    });
                }
            }
        });

        this.appStore.reportActionSubject$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((reportAction) => {
            if (this.widgetComponents && this.widgetComponents.length > 0) {
                if (reportAction.reportAction === ReportActionType.RELOAD_REPORT) {
                    this.reloadWidgetData(reportAction.hardRefresh, reportAction.bypassBrowserCache, reportAction.debugContext);
                } else {
                    this.cancelLoadingWidget();
                }
            }
        });

        if (this.isBatchExport) {
            // Subscribe to the BatchContainerStatus only if this is the batch report presenter for PDF exports
            BatchExportingStore.getBatchContainerStatus$()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((batchStatus: BatchContainerStatus) => {
                    if (batchStatus === BatchContainerStatus.DATA_LOADED_PRE_RENDER) {
                        if (!this.report || isEmpty(this.report.widgets)) {
                            // This should never occur, but if we somehow don't have a report or widgets in the report, get out of here
                            console.warn('PDF Export - No Report or Widgets found in BatchReportContainer: ', BatchExportingStore.currentExportComposite);
                            this.exportService.setBatchContainerStatus();
                            return;
                        }
                        // If we're here, that means the data has loaded and we need to check if all the widgets have rendered
                        // Checks every 2 seconds
                        this.checkAndProceedWithPDFExport();
                    }
                });
        }
        this.widgetPasteService.getPasteCompleteObs().pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.scrollPastedWidgetToView();
                this.changeDetectorRef.markForCheck();
            });
    }

    /**
     * OnChanges hook
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.isWhatIfPortfolio) {
            // if showCompositionModel flag is set and isWhatIfPortfolio flag has changed, resize the grid
            if (
                !isEqual(changes.isWhatIfPortfolio.previousValue, changes.isWhatIfPortfolio.currentValue) &&
                AppStore.getShowCompositionModel()
            ) {
                this.resizeGridAndWidgets();
            }
        }

        if (changes.showCompositionModel) {
            // if showCompositionModel flag has changed, resize the grid
            if (!isEqual(changes.showCompositionModel.previousValue, changes.showCompositionModel.currentValue)) {
                this.resizeGridAndWidgets();
            }
        }

        if (changes.report) {
            if (!isEqual(changes.report.previousValue, changes.report.currentValue)) {
                this.clearNotifications();
            }
        }
    }

    /**
     * Checks every 2 seconds whether or not to proceed with the PDF Export
     */
    checkAndProceedWithPDFExport(): void {
        setTimeout(() => {
            if (this.batchExportRetryCounter === ReportPresenterComponent.PDF_EXPORT_RETRY_COUNT) {
                // If we hit the limit of retries for the widgets to all be rendered, there might be some other issue
                // Reset the counter and move on to the next ExportComposite
                this.batchExportRetryCounter = 0;
                this.exportService.setBatchContainerStatus();
                console.warn('PDF Export - Widgets failed at the rendering step: ', BatchExportingStore.currentExportComposite, this.widgetComponents.toArray());
                this.changeDetectorRef.markForCheck();
                return;
            }
            // Increment the retry counter
            this.batchExportRetryCounter++;

            // Check if the widget components have all rendered
            if (this.checkReportWidgetsHaveRendered()) {
                // Reset the counter if all widgets have been rendered
                this.batchExportRetryCounter = 0;
                BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.READY);
            } else {
                // If not, recursively call to check again
                this.checkAndProceedWithPDFExport();
            }
        }, 2000);
    }

    /**
     * Checks if the widget components have rendered with their respective rendering libraries (ag-grid/highcharts)
     */
    checkReportWidgetsHaveRendered(): boolean {
        // widgetComponents should be a collection of our WidgetComponents from ViewChildren
        // Internally, each WidgetComponent has a ViewChild on the inner nested component
        const widgetComponents = this.widgetComponents.toArray();

        if (this.batchPDFDebugMode) {
            console.log('Checking if report widgets have rendered. Attempt #', this.batchExportRetryCounter, widgetComponents);
        }

        return !isEmpty(widgetComponents) && every(widgetComponents, (component) => {
            // 'component' here would be an inner component such as:
            // ExploreTableComponent for tabular widgets
            // OR
            // ExploreBarChartComponent, ExplorePieChartComponent, etc.. for chart widgets
            //
            // Internally, each of these components has a ViewChild on another inner nested component (attribute widgetRender)
            // Tabular widgets have a ViewChild onto the aux-grid component from Design System, which has direct access to the gridApi of ag-grid
            // Chart widgets have a ViewChild onto the qbstr chart component (like BarChartComponent from @qbstr) which has direct access to the Highcharts chart object

            // If the WidgetComponent is not loading and there is no widgetPayload and the widget is not dependent on a parent dataStore, that means we failed to get data back, consider the widget 'rendered'
            if (!component.isLoading$.getValue() && !component.widgetPayload && !component.widget.dataStore.isDependentOnParentForData) {
                return true;
            }

            // If the ViewChild references aren't there or isLoading is still true, then return false so we can check again
            if (!component.innerWidgetComponent || !(component.innerWidgetComponent as any).widgetRender || component.isLoading$.getValue()) {
                return false;
            }
            let widgetRender = (component.innerWidgetComponent as any).widgetRender;

            // As we have encapsulated commitment risk chart and tables in commitment-risk-container,
            // to access chart we need to get nested reference of widgetRender
            if (component.widget.configType === WidgetConfigType.COMMITMENT_RISK_CHART || component.widget.configType === WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY) {
                return widgetRender.widgetRender?.chart?.hasRendered;
            }
            // to access ag grid we need to get nested reference of widgetRender
            if (component.widget.configType === WidgetConfigType.COMMITMENT_RISK || component.widget.configType === WidgetConfigType.COMMITMENT_RISK_LEGACY) {
                widgetRender = widgetRender.widgetRender;
            }

            if (component.chartingLib === CoreWidgetConstants.CHARTING_LIB.AG_GRID) {
                const api: GridApi = widgetRender._gridApi;

                // If the explore window is not active (or the screen is locked) we need to manipulate the elements to make sure they still render properly
                if (document.visibilityState === 'hidden') {
                    // Force the aux-widget component to be visible
                    // (When the window is not active, the widget doesn't get the .hydrated class which causes css visibility to be 'hidden')
                    widgetRender.el.style.visibility = 'visible';

                    if (!api.isAnimationFrameQueueEmpty()) {
                        // Flush out animation queues as we don't need them while rendering on a non-active tab
                        api.flushAllAnimationFrames();
                    }
                }

                // If it's ag-grid, we can check the rendered status through the ag-grid object
                return api.isAnimationFrameQueueEmpty();
            } else {
                // If it's highcharts, we can check the status through the highcharts object
                return (component.innerWidgetComponent as any).chart?.hasRendered;
            }
        });
    }

    /**
     * Emits an event that signals to resize gridster container
     */
    resizeGridContainer(gridAction: GridAction): void {
        this.gridsterResizeDebouncer.next(gridAction);
    }

    /**
     * Resize the widgets (gridster-items) and gridster
     */
    @HostListener('window:resize')
    resizeGridAndWidgets(): void {
        if (this.gridsterOptions && this.gridsterOptions.api) {
            // resize the widgets
            this.gridsterOptions.api.resize();

            // give enough time for widgets to resize then resize grid container
            setTimeout(() => this.resizeGridContainer('WINDOW_RESIZE'), 75);
        }
    }

    /**
     * Resizes the parent container of the gridster.  Called when window resizes or number of rows are changed.
     *
     * Needed because gridster requires the parent to have a defined height but we also want infinite rows in the grid.
     */
    private setGridContainerHeight(gridAction: GridAction): void {
        // area that is visible without scrolling
        const visibleHeight = window.innerHeight - this.HEIGHT_DEDUCTION;

        // height of each row in grid
        const rowHeight = this.gridster.curRowHeight;
        // number of visible rows in the grid
        const rows = this.gridster.rows;
        // height that the gridster takes
        const gridsterHeight = rowHeight * rows;

        // set the gridster container height to either the visible screen height or the total height the widgets need, whichever is larger
        this.gridsterContainerHeight = Math.max(gridsterHeight, visibleHeight);
        this.changeDetectorRef.markForCheck();

        // Sometimes on window resize the widgets will overflow due to the scrollbar appearing.
        // This happens because set the height after the widgets are resized.  This can add a vertical scrollbar which reduces the width.
        // To fix, just resize again so it uses width minus scrollbar.  No need to update height because the widgets would only shrink.
        if (gridAction === 'WINDOW_RESIZE' && this.gridsterOptions.api) {
            this.gridsterOptions.api.resize();
        }
    }

    /**
     * Minimizes all widgets in the report
     */
    minimizeAllWidgets(): void {
        this.widgetComponents.forEach((widgetComponent: WidgetComponent) => {
            if (widgetComponent.widget.isMaximized) {
                widgetComponent.minimizeWidget();
            }
        });
    }

    /**
     * close the PasteWidgetModal
     */
    closePasteWidgetModal(): void {
        this.openPasteWidgetModal = false;
        this.closePasteModal.emit(this.openPasteWidgetModal);
        this.scrollPastedWidgetToView();
    }

    scrollPastedWidgetToView() {
        // scroll report to the new pasted widget
        setTimeout(() => {
            this.widgetComponents.last?.gridsterItem.el.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }, 300);
    }

    /**
     * reload data for all the widgets present in the report
     */
    reloadWidgetData(hardRefresh?: boolean, bypassBrowserCache?: boolean, debugContext?: boolean): void {
        this.widgetComponents.forEach((widget) => widget.refreshWidget(hardRefresh, bypassBrowserCache, debugContext));
        this.clearNotifications();
    }

    /**
     * Clears all the current notifications.
     */
    clearNotifications(): void {
        this.notificationIDArray.forEach(notification => this.reloadNotifier.close(notification));
        this.notificationIDArray = [];
    }

    /**
     * when reload button is clicked - reload widget data and close reload banner
     */
    onReloadButtonClicked(event: any): void {
        this.reloadWidgetData(AppUtils.isCtrlPressed(event), undefined, AppUtils.isCtrlPressed(event) && AppUtils.isShiftPressed(event));
        this.widgetHiddenStatus$.next(false);
    }

    /**
     * Cancel loading all the widgets of this report.
     */
    cancelLoadingWidget(): void {
        let isAnyLoadingRequestCancelled = false;
        this.widgetComponents.forEach((widget) => {
            // if loading status for the widget is false, then update to true
            if (!widget.isLoading$.getValue()) {
                return;
            }

            // Get the inProgressRequests of the widget and put it in requests to cancel set.
            // no need to cancel request for widget that is dependent on a parent data store for data as there is no call to the backend.
            if (!widget.widget.dataStore.parentDataStore) {
                // cancel the request in the case it's queued
                this.httpRequestQueueService.cancelQueuedRequest(widget.widget.id);
                // cancel the request in the case the HTTP call is in progress
                RequestCancelerStore.setRequestsToCancelForWidgetID(widget.widget.id);
            }
            // Error out the widget
            WidgetUtils.errorOutWidget(widget, AlertConstants.NOTIFICATION.LOADING_INTERRUPTED);
            isAnyLoadingRequestCancelled = true;
        });
        if (isAnyLoadingRequestCancelled) {
            Notification.createErrorNotification(AlertConstants.NOTIFICATION.LOADING_INTERRUPTED, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CANCEL_LOADING_WIDGET_ERROR);
            // set the loading of the report to false
            AppStore.reportLoadingStatus$.next(false);
        }
    }

    /**
     * Notify max report size reached
     */
    notifyMaxReportSizeReached(): void {
        this.notificationService.openDialog(new ExploreDialogParam(
            'alert',
            'Maximum report size',
            'You have hit the maximum space for this report. If you want to add another widget please make the widgets smaller, or delete other widgets.',
            'Ok'
        ));
    }
}

type GridAction = 'WINDOW_RESIZE' | 'WIDGET_DRAG' | 'WIDGET_REMOVED' | 'GRID_SIZE_CHANGED' | 'WIDGET_ADDED';
