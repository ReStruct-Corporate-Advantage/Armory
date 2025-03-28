import {Component, NO_ERRORS_SCHEMA, SimpleChanges, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {GridsterComponent, GridsterItemComponent} from 'explore-angular-gridster2';
import {ReportPresenterComponent} from './report-presenter.component';
import {WidgetComponent} from '../../../widget/widget.component';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {BatchExportingStore, UserMetaDataStore, WorkspaceStore} from '../../../../stores';
import {AppStore} from '../../../../app.store';
import {Notification} from '@models/widget/notification.model';
import {RequestCancelerStore} from '../../../request-canceler/store/request-canceler.store';
import {ReportActionType} from '@enums/report-action-type.enum';
import {WidgetUtils} from '@utils/widget.utils';
import {ReportAction} from '@interfaces/report-action-interface';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {NotificationService} from '@services/notification';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {UserPreference} from '@constants/user-preference.constants';
import {ExploreConstants} from '@constants/explore.constants';
import {ExportService} from '@services/export/export.service';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {
    CoreUserMetaDataStore,
    CoreWidgetConstants,
    DateValue,
    UserMetaData,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {ExploreWidgetPasteService} from '@services/widget-data/explore-widget-paste.service';
import {HttpRequestQueueService} from '@services/http-request-queue/http-request-queue.service';

jest.mock('explore-angular-gridster2');

@Component({
    template: `<app-report-presenter [isBatchExport]="true"></app-report-presenter>`
})
class TestHostComponent {
    @ViewChild(ReportPresenterComponent, null)
    childComponent: ReportPresenterComponent;
}

describe('ReportPresenterComponent', () => {
    let component: ReportPresenterComponent;
    let fixture: ComponentFixture<ReportPresenterComponent>;
    let userMetaData: UserMetaData;
    let httpRequestQueueServiceMock;

    const exportServiceStub = {
        setBatchContainerStatus: jest.fn()
    };

    beforeAll(() => {
        WorkspaceStore.init();
        BatchExportingStore.init();
        userMetaData = new UserMetaData();
        userMetaData.access = true;
        userMetaData.pricePopupAccess = true;
        userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        userMetaData.login = 'seakim';
        userMetaData.globalFavPerms = true;
        userMetaData.perfDataPerms = true;
        userMetaData.sharedFavPerms = true;
        userMetaData.preferences.set(UserPreference.THEME.name, ExploreConstants.THEME_LIGHT_MODE);
        CoreUserMetaDataStore.userMetaData = userMetaData;
    });

    beforeEach(() => {
        httpRequestQueueServiceMock = {
            cancelQueuedRequest: jest.fn()
        };

        TestBed.configureTestingModule({
            declarations: [ReportPresenterComponent, TestHostComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                NotificationService,
                {provide: ExportService, useValue: exportServiceStub},
                {provide: ExploreWidgetPasteService, useClass: WidgetPasteServiceStub},
                {provide: HttpRequestQueueService, useValue: httpRequestQueueServiceMock}
            ]
        });

        fixture = TestBed.createComponent(ReportPresenterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('onInit Test', () => {
        it('should create component', () => {
            expect(component).toBeTruthy();
        });

        it('Test portfolioObservable with Batch', () => {
            // Create a fake parente component that can pass in a isBatchExport @Input of true
            // so that the ReportPresenterComponent will subscribe to BatchExportingStore and NOT WorkspaceStore
            const parentComponentFixture = TestBed.createComponent(TestHostComponent);
            parentComponentFixture.detectChanges();

            const newComponent = parentComponentFixture.componentInstance.childComponent;

            const newBatchPortfolio = new Portfolio('IP', new DateValue({date: '07/28/2018'}));

            // Update the BatchExportingStore portfolio
            BatchExportingStore.currentPortfolio$.next(newBatchPortfolio);
            expect(newComponent.portfolio).toEqual(newBatchPortfolio);

            // Update the WorkspaceStore portfolio
            WorkspaceStore.currentPortfolio$.next(undefined);
            // Should still be the batch portfolio
            expect(newComponent.portfolio).toEqual(newBatchPortfolio);
        });

        it('should initialize grid options', () => {
            expect(component.gridsterOptions).toBeTruthy();
        });

        it('paste completed', () => {
            jest.spyOn(component, 'scrollPastedWidgetToView');
            component['widgetPasteService'].pasteComplete();
            expect(component.scrollPastedWidgetToView).toHaveBeenCalled();
        });

        it('should initialize gridster resizing callbacks', () => {
            jest.spyOn(component, 'resizeGridContainer').mockImplementation(() => {
            });

            // draggable call backs //
            component.gridsterOptions.draggable.start(undefined, undefined, undefined);
            expect(component['draggingWidgets']).toBe(true);

            jest.clearAllMocks();
            component.gridsterOptions.draggable.stop(undefined, undefined, undefined);
            expect(component['draggingWidgets']).toBe(false);
            expect(component.resizeGridContainer).toHaveBeenCalledTimes(1);

            //  gridSizeChangedCallback //
            jest.clearAllMocks();
            component['draggingWidgets'] = false;
            component.gridsterOptions.gridSizeChangedCallback(undefined);
            expect(component.resizeGridContainer).toHaveBeenCalledTimes(1);

            jest.clearAllMocks();
            component['draggingWidgets'] = true;
            component.gridsterOptions.gridSizeChangedCallback(undefined);
            expect(component.resizeGridContainer).toHaveBeenCalledTimes(0);

            // itemRemovedCallback //
            jest.clearAllMocks();
            component.gridsterOptions.itemRemovedCallback(undefined, undefined);
            expect(component.resizeGridContainer).toHaveBeenCalledTimes(1);
        });

        it('should create empty component with no report present', () => {
            expect(fixture.debugElement.nativeElement.querySelector('.report-presenter-area')).toMatchSnapshot();
        });

        it('should create 2 widgets', () => {
            component.report = new Report();
            const widget: Widget = new Widget();
            widget.id = 123;
            component.report.widgets.push(widget);
            const widget1: Widget = new Widget();
            widget1.id = 456;
            component.report.widgets.push(widget1);

            fixture.detectChanges();

            expect(fixture.debugElement.nativeElement.querySelector('.report-presenter-area')).toMatchSnapshot();
        });

        it('test widget refresh should be called for fba bar widget', () => {
            const widgetComponent = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            widgetComponent.widget = new Widget();
            widgetComponent.widget.configType = WidgetConfigType.RISK_EXPOSURE;
            component.widgetComponents.reset([widgetComponent]);
            jest.spyOn(widgetComponent, 'refreshWidget').mockImplementationOnce(() => {});
            UserMetaDataStore.getPreferenceSubject(UserPreference.THEME).next('dark');
            expect(widgetComponent.refreshWidget).not.toHaveBeenCalled();

            widgetComponent.widget.configType = WidgetConfigType.FACTOR_GRAPHING_BAR_CHART;
            component.widgetComponents.reset([widgetComponent]);
            UserMetaDataStore.getPreferenceSubject(UserPreference.THEME).next('light');
            expect(widgetComponent.refreshWidget).toHaveBeenCalled();
        });

        describe('clearNotifications Test', () => {
            beforeEach(() => {
                const currentPortfolio = new Portfolio('PEP');
                currentPortfolio.portId = 'PEP123';
                currentPortfolio.datePicker = DateValue.newDate('03/11/2016');
                WorkspaceStore.updateCurrentPortfolio(currentPortfolio);
                component.portfolio = currentPortfolio;
                component.isBatchExport = false;

                jest.spyOn(component, 'clearNotifications');
                component.ngOnInit();
            });

            it('should not clear notifications on date change', () => {
                const updatedPortfolio = new Portfolio('PEP');
                updatedPortfolio.portId = 'PEP123';
                updatedPortfolio.datePicker = DateValue.newDate('03/10/2016');

                WorkspaceStore.updateCurrentPortfolio(updatedPortfolio);

                expect(component.clearNotifications).not.toHaveBeenCalled();
            });

            it('should clear notifications on portfolio change', () => {
                const updatedPortfolio = new Portfolio('PEP');
                updatedPortfolio.portId = 'PEP456';
                updatedPortfolio.datePicker = DateValue.newDate('03/11/2016');

                WorkspaceStore.updateCurrentPortfolio(updatedPortfolio);

                expect(component.clearNotifications).toHaveBeenCalled();
            });
        });

    });

    describe('ngOnChanges Test', () => {
        it('tests isWhatIfPortfolioFlag', () => {
            const changes: any = {
                isWhatIfPortfolio: {
                    previousValue: false,
                    currentValue: true
                }
            };
            AppStore.showCompositionModel$ = new BehaviorSubject<boolean>(true);
            jest.spyOn(component, 'resizeGridAndWidgets').mockImplementationOnce(() => {
            });
            component.ngOnChanges(changes as SimpleChanges);
            expect(component.resizeGridAndWidgets).toHaveBeenCalledTimes(1);

            jest.resetAllMocks();
            changes.isWhatIfPortfolio.previousValue = true;
            component.ngOnChanges(changes as SimpleChanges);
            expect(component.resizeGridAndWidgets).toHaveBeenCalledTimes(0);

            jest.resetAllMocks();
            changes.isWhatIfPortfolio.previousValue = false;
            AppStore.showCompositionModel$.next(false);
            component.ngOnChanges(changes as SimpleChanges);
            expect(component.resizeGridAndWidgets).toHaveBeenCalledTimes(0);
        });

        it('tests showCompositionModel', () => {
            const changes: any = {
                showCompositionModel: {
                    previousValue: false,
                    currentValue: true
                }
            };
            jest.spyOn(component, 'resizeGridAndWidgets').mockImplementationOnce(() => {
            });
            component.ngOnChanges(changes as SimpleChanges);
            expect(component.resizeGridAndWidgets).toHaveBeenCalledTimes(1);

            jest.resetAllMocks();
            changes.showCompositionModel.previousValue = true;
            component.ngOnChanges(changes as SimpleChanges);
            expect(component.resizeGridAndWidgets).toHaveBeenCalledTimes(0);
        });

        it('tests - report reload is triggered', async () => {
            const widgetComponent = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            widgetComponent.widget = new Widget();
            widgetComponent.widget.configType = WidgetConfigType.RISK_EXPOSURE;
            component.widgetComponents.reset([widgetComponent]);
            const reloadFnSpy = jest.spyOn(component, 'reloadWidgetData').mockImplementationOnce(() => {});
            component['appStore'].reportActionSubject$ = new BehaviorSubject<ReportAction>({hardRefresh: false, reportAction: ReportActionType.RELOAD_REPORT, bypassBrowserCache: true});
            await component.ngOnInit();
            expect(reloadFnSpy).toHaveBeenCalledWith(false, true, undefined);
        });

        it('tests - cancel loading widget is triggered', async () => {
            const widgetComponent = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            widgetComponent.widget = new Widget();
            widgetComponent.widget.configType = WidgetConfigType.RISK_EXPOSURE;
            component.widgetComponents.reset([widgetComponent]);
            const reloadFnSpy = jest.spyOn(component, 'cancelLoadingWidget');
            reloadFnSpy.mockImplementationOnce(() => {});
            component['appStore'].reportActionSubject$ = new BehaviorSubject<ReportAction>({reportAction: ReportActionType.CANCEL_RELOAD});
            await component.ngOnInit();
            expect(reloadFnSpy).toHaveBeenCalled();
        });

        it('tests - cancel loading', () => {
            const widgetComponent = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            const widget = new Widget();
            widget.id = 1234;
            widget.configType = WidgetConfigType.RISK_EXPOSURE;
            widgetComponent.widget = widget;
            widgetComponent.isLoading$ = new BehaviorSubject<boolean>(true);
            component.widgetComponents.reset([widgetComponent]);
            const notificationSpy = jest.spyOn(Notification, 'createErrorNotification');
            RequestCancelerStore.setInProgressRequestsForWidgetID(1234, 'requestID1');
            component['appStore'].reportActionSubject$ = new BehaviorSubject<ReportAction>({reportAction: ReportActionType.CANCEL_RELOAD});
            jest.spyOn(WidgetUtils, 'errorOutWidget').mockImplementationOnce(() => {});
            component.cancelLoadingWidget();
            expect(RequestCancelerStore.requestsToCancel.size).toEqual(1);
            expect(RequestCancelerStore.requestsToCancel.has('requestID1')).toBeTruthy();
            expect(AppStore.reportLoadingStatus$.getValue()).toBeFalsy();
            expect(notificationSpy).toHaveBeenCalled();
        });

        it('tests - cancel loading - no need to cancel requests for widgets dependent on parentDataStore', () => {
            const widgetComponent = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            const widget = new Widget();
            widget.dataStore.parentDataStore = new WidgetDataStore();
            widgetComponent.widget = widget;
            widgetComponent.isLoading$ = new BehaviorSubject<boolean>(true);
            component.widgetComponents.reset([widgetComponent]);
            jest.spyOn(WidgetUtils, 'errorOutWidget').mockImplementationOnce((_a, _b) => {
            });
            const notificationSpy = jest.spyOn(Notification, 'createErrorNotification');
            const cancelSpy = jest.spyOn(RequestCancelerStore, 'setInProgressRequestsForWidgetID');
            component.cancelLoadingWidget();
            expect(cancelSpy).not.toHaveBeenCalled();
            expect(AppStore.reportLoadingStatus$.getValue()).toBeFalsy();
            expect(notificationSpy).toHaveBeenCalled();
        });

        it('should clear notifications on report change', () => {
            const changes: any = {
                report: {
                    previousValue: new Report({title: 'Report 1'}),
                    currentValue: new Report({title: 'Report 2'}),
                }
            };
            jest.spyOn(component, 'clearNotifications');
            component.ngOnChanges(changes as SimpleChanges);
            expect(component.clearNotifications).toHaveBeenCalled();
        });
    });

    describe('Test checkReportWidgetsHaveRendered', () => {
        let widgetComponents = [];
        beforeEach(() => {
            (component.widgetComponents as any) = {toArray: () => widgetComponents};
        });
        it('Test checkReportWidgetsHaveRendered with empty widgetComponents', () => {
            expect(component.checkReportWidgetsHaveRendered()).toBeFalsy();
        });

        it('Test checkReportWidgetsHaveRendered with all scenarios of widgetComponents', () => {
            const widget = new Widget();
            // Loading, with no data, no innerWidgetComponent
            let fakeComponent: any = {isLoading$: {getValue: () => true}, widgetPayload: false, widget};
            widgetComponents = [fakeComponent];
            expect(component.checkReportWidgetsHaveRendered()).toBeFalsy();

            // Loading, with data (shouldn't ever happen), no innerWidgetComponent
            fakeComponent = {isLoading$: {getValue: () => true}, widgetPayload: true, widget};
            widgetComponents = [fakeComponent];
            expect(component.checkReportWidgetsHaveRendered()).toBeFalsy();

            // NOT Loading, with no data, consider it 'rendered'
            fakeComponent = {isLoading$: {getValue: () => false}, widgetPayload: false, widget};
            widgetComponents = [fakeComponent];
            expect(component.checkReportWidgetsHaveRendered()).toBeTruthy();

            // NOT Loading, with data, with innerWidgetComponent, but no widgetRender
            fakeComponent = {isLoading$: {getValue: () => false}, widgetPayload: true, innerWidgetComponent: {}, widget};
            widgetComponents = [fakeComponent];
            expect(component.checkReportWidgetsHaveRendered()).toBeFalsy();

            // NOT Loading, with data, with innerWidgetComponent AND widgetRender (should check charting libraries)
            const fakeGridComponent = {
                isLoading$: {getValue: () => false},
                widgetPayload: true,
                innerWidgetComponent: {
                    widgetRender: {
                        _gridApi: {
                            isAnimationFrameQueueEmpty: () => true,
                            rowNodeBlockLoader: {
                                activeBlockLoadsCount: 0
                            }
                        }
                    }
                },
                chartingLib: CoreWidgetConstants.CHARTING_LIB.AG_GRID,
                widget
            };

            const fakeChartComponent = {
                isLoading$: {getValue: () => false},
                widgetPayload: true,
                innerWidgetComponent: {
                    widgetRender: {}, // Empty widgetRender object to be aux-data-viz component
                    chart: {
                        hasRendered: true
                    }
                },
                chartingLib: CoreWidgetConstants.CHARTING_LIB.HIGHCHART,
                widget
            };
            widgetComponents = [fakeGridComponent, fakeChartComponent];
            expect(component.checkReportWidgetsHaveRendered()).toBeTruthy();
            const fakeCommitmentRiskChartComponent = {
                isLoading$: {getValue: () => false},
                widgetPayload: true,
                innerWidgetComponent: {
                    widgetRender: {
                        widgetRender: {
                            chart: {
                                hasRendered: true
                            }
                        }
                    } // Empty widgetRender object to be aux-data-viz component
                },
                chartingLib: CoreWidgetConstants.CHARTING_LIB.HIGHCHART,
                widget
            };
            widget.configType = WidgetConfigType.COMMITMENT_RISK_CHART;
            widgetComponents = [fakeCommitmentRiskChartComponent];
            expect(component.checkReportWidgetsHaveRendered()).toBeTruthy();
            fakeCommitmentRiskChartComponent.innerWidgetComponent.widgetRender.widgetRender.chart.hasRendered = false;
            expect(component.checkReportWidgetsHaveRendered()).toBeFalsy();
            fakeCommitmentRiskChartComponent.innerWidgetComponent.widgetRender.widgetRender.chart = undefined;
            expect(component.checkReportWidgetsHaveRendered()).toBeFalsy();
            fakeCommitmentRiskChartComponent.innerWidgetComponent.widgetRender.widgetRender = undefined;
            expect(component.checkReportWidgetsHaveRendered()).toBeFalsy();
        });
    });

    describe('Grid Resizing Tests', () => {
        it('should trigger a grid resize when window size changes', () => {
            jest.spyOn(component, 'resizeGridAndWidgets');

            window.dispatchEvent(new Event('resize'));

            expect(component.resizeGridAndWidgets).toHaveBeenCalledTimes(1);
        });

        it('should resize the gridster container', () => {
            component.gridster = new GridsterComponent(undefined, undefined, undefined, undefined);
            component.gridster.curRowHeight = 50;
            component.gridster.rows = 10;
            component['setGridContainerHeight']('WINDOW_RESIZE');
            expect(component.gridsterContainerHeight).toBe(502);
        });

        it('should resize the gridster container using height override', () => {
            component.gridster = new GridsterComponent(undefined, undefined, undefined, undefined);
            component.gridster.curRowHeight = 50;
            component.gridster.rows = 10;
            component['setGridContainerHeight']('WINDOW_RESIZE');
            expect(component.gridsterContainerHeight).toBe(502);
        });

        it('should resize the gridster items and grid', fakeAsync(() => {
            component.gridsterOptions.api = {
                resize: jest.fn()
            };
            jest.spyOn(component, 'resizeGridContainer').mockImplementationOnce(() => {
            });
            component.resizeGridAndWidgets();
            tick(75);
            expect(component.resizeGridContainer).toHaveBeenCalledTimes(1);
        }));
    });

    describe('minimizeAllWidgets Test', () => {
        it('should minimize all widgets that are maximized', () => {
            const maximizedWidget = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            maximizedWidget.widget = new Widget();
            maximizedWidget.widget.isMaximized = true;
            jest.spyOn(maximizedWidget, 'minimizeWidget');

            const maximizedWidget2 = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            maximizedWidget2.widget = new Widget();
            maximizedWidget2.widget.isMaximized = true;
            jest.spyOn(maximizedWidget2, 'minimizeWidget');

            const minimizedWidget = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            minimizedWidget.widget = new Widget();
            minimizedWidget.widget.isMaximized = false;
            jest.spyOn(minimizedWidget, 'minimizeWidget');

            const widgetComponents: WidgetComponent[] = [];
            widgetComponents.push(maximizedWidget);
            widgetComponents.push(maximizedWidget2);
            widgetComponents.push(minimizedWidget);
            component.widgetComponents.reset(widgetComponents);

            fixture.detectChanges();

            component.minimizeAllWidgets();
            expect(maximizedWidget.minimizeWidget).toBeCalledTimes(1);
            expect(maximizedWidget2.minimizeWidget).toBeCalledTimes(1);
            expect(minimizedWidget.minimizeWidget).toBeCalledTimes(0);
        });
    });

    describe('open/close pasteWidgetModal Test', () => {
        beforeEach(() => {
            const widget = new Widget();
            widget.isMaximized = false;
            widget.dimensions = {
                cols: 4,
                rows: 6,
                x: 8,
                y: 0
            };
            const widgetComponent = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            widgetComponent.widget = widget;
            component.widgetComponents.reset([widgetComponent]);
            component.widgetComponents.last.gridsterItem = new GridsterItemComponent(null, null, null, null);
            component.widgetComponents.last.gridsterItem.$item = widget.dimensions;
            document.body.innerHTML = '<gridster-item id="widgetItem"></gridster-item>';
            component.widgetComponents.last.gridsterItem.el = document.getElementById('widgetItem') as HTMLElement;
            component.widgetComponents.last.gridsterItem.el.scrollIntoView = function () {
            };

            fixture.detectChanges();
        });

        it('should close pasteWidgetModal', () => {
            jest.spyOn(component.closePasteModal, 'emit');
            component.openPasteWidgetModal = true;
            component.closePasteWidgetModal();
            expect(component.openPasteWidgetModal).toBeFalsy();
            expect(component.closePasteModal.emit).toHaveBeenCalledWith(false);
        });

        describe('onReloadButtonClicked Test', () => {
            it('should reload widget data, close notification, and update widget hidden status', () => {
                jest.spyOn(component, 'reloadWidgetData').mockImplementationOnce(() => {});
                jest.spyOn(component.widgetHiddenStatus$, 'next');
                component.onReloadButtonClicked({});
                expect(component.reloadWidgetData).toHaveBeenCalledWith(false, undefined, false);
                expect(component.widgetHiddenStatus$.next).toHaveBeenCalledWith(false);
            });

            it('should reload widget data, close notification', () => {
                const widget = new Widget();
                const widgetComponent = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
                widgetComponent.widget = widget;
                component.widgetComponents.reset([widgetComponent]);
                component.notificationIDArray = ['foo'];
                component.reloadNotifier.close = jest.fn();
                jest.spyOn(widgetComponent, 'refreshWidget').mockImplementationOnce(() => {});
                component.reloadWidgetData(false, true);
                expect(component.reloadNotifier.close).toHaveBeenCalled();
                expect(widgetComponent.refreshWidget).toHaveBeenCalledWith(false, true, undefined);
            });
        });

        it('reloadPrompt event test', fakeAsync(() => {
            const notificationService: NotificationService = TestBed.inject(NotificationService);

            // Create a test widget component.
            const widgetComponent = new WidgetComponent(null, null, fixture.changeDetectorRef, null, null);
            widgetComponent.widgetPayload = {};
            component.widgetComponents.reset([widgetComponent]);

            // The open function did not exist, so just creating a fake one and then mocking it.
            component.reloadNotifier.open = (): Promise<void> => undefined;
            jest.spyOn(component.reloadNotifier, 'open').mockImplementation();
            jest.spyOn(widgetComponent, 'updateWidgetDerivedSettings').mockImplementation();

            // Trigger a notification that is not going to clear the widget contents.
            notificationService.widgetReloadPrompt$.next(Notification.createWarningNotification('test'));
            tick();
            expect(widgetComponent.widgetPayload).not.toBeUndefined();
            expect(component.reloadNotifier.open).toHaveBeenCalledTimes(1);
            expect(widgetComponent.updateWidgetDerivedSettings).not.toHaveBeenCalled();

            // Trigger the reload and ensure the widget payload is cleared.
            notificationService.invokeWidgetReloadPrompt();
            tick();
            expect(widgetComponent.widgetPayload).toBeUndefined();
            expect(component.reloadNotifier.open).toHaveBeenCalledTimes(2);
            expect(widgetComponent.updateWidgetDerivedSettings).toHaveBeenCalled();

            // Trigger the event again and ensure that the notification is not opened again.
            notificationService.invokeWidgetReloadPrompt();
            tick();
            expect(component.reloadNotifier.open).toHaveBeenCalledTimes(3);
            expect(component.notificationIDArray.length).toEqual(2);
            expect(widgetComponent.updateWidgetDerivedSettings).toHaveBeenCalledTimes(2);
        }));
    });

    describe('Test checkAndProceedWithPDFExport', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
        });

        // xit('Test checkAndProceedWithPDFExport with widgets not rendering and 0 retries', () => {
        //     jest.spyOn(component, 'checkReportWidgetsHaveRendered').mockReturnValue(false);
        //     component.checkAndProceedWithPDFExport();
        //     // Intentional no expect statement because recursive setTimeouts are causing timeout issues
        // });

        it('Test checkAndProceedWithPDFExport with widgets rendering', () => {
            jest.spyOn(component, 'checkReportWidgetsHaveRendered').mockReturnValue(true);
            component.batchExportRetryCounter = 0;
            BatchExportingStore.batchContainerStatus$.next(BatchContainerStatus.DATA_LOADED_PRE_RENDER);
            component.checkAndProceedWithPDFExport();
            jest.runAllTimers();
            expect(BatchExportingStore.getBatchContainerStatus()).toEqual(BatchContainerStatus.READY);
        });

        // NOTE: Ignoring, because for some reason, subsequent tests after a runAllTimers call will timeout
        xit('Test checkAndProceedWithPDFExport with widgets not rendering', () => {
            jest.spyOn(console, 'warn').mockImplementation(() => {});
            jest.spyOn(component, 'checkReportWidgetsHaveRendered').mockReturnValue(false);
            // Mock the last retry
            component.batchExportRetryCounter = ReportPresenterComponent.PDF_EXPORT_RETRY_COUNT;
            component.checkAndProceedWithPDFExport();
            jest.runAllTimers();
            expect(component.batchExportRetryCounter).toEqual(0);
            jest.clearAllTimers();
        });
    });
});

class WidgetPasteServiceStub {

    pasteCompleteSubject = new Subject<void>();

    pasteComplete() {
        this.pasteCompleteSubject.next();
    }

    getPasteCompleteObs(): Observable<void> {
        return this.pasteCompleteSubject.asObservable();
    }
}
