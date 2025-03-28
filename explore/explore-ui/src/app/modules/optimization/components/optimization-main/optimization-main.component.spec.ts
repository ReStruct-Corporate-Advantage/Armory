import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {OptimizationMainComponent} from './optimization-main.component';
import {OptimizationDataService} from '../../services/optimization-data.service';
import {NotificationService} from '@services/notification';
import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, of, Subject, throwError} from 'rxjs';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {
    OPTIMIZATION_LOAD_FAIL_MESSAGE,
    OPTIMIZATION_RESTORE_DEFAULT_MESSAGE
} from '@optimization-settings/constants/optimization-notification-messages.constants';
import {OptimizationRunService} from '../../services/optimization-run.service';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {WorkspaceStore} from '../../../../stores';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {OptimizationStatusStore} from '../../stores/optimization-status.store';
import {Http2BmsService} from '@services/bms';
import {ExportUtils} from '@utils/export/export.utils';
import {compressedResponseForDownloadAPIRequest} from '@mocks/test-data/optimization-response-test-data';
import {CompositionUtils} from '@utils/composition.utils';
import {OptimizationCompositeService} from '../../services/optimization-composite-service';
import {CompositionDataService} from '../../../main/composition-modelling/services/composition-data.service';
import {LoadingService} from '../../../loading/service/loading.service';
import {ErrorTypeConstants, TokenUtils, UIErrorParameters} from '@blk/explore-ui-core';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {AppUtils} from '@utils/app.utils';
import {OptimizationTypeEnum} from '@enums/optimization-type.enum';

describe('OptimizationMainComponent', () => {
    let component: OptimizationMainComponent;
    let fixture: ComponentFixture<OptimizationMainComponent>;
    let optimizationDataService: OptimizationDataService;
    let notificationService: NotificationService;
    let optimizationRunService: OptimizationRunService;
    let http2BmsService: Http2BmsService;
    const composition = {};

    beforeAll(() => WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(undefined));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OptimizationMainComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{
                provide: OptimizationCompositeService,
                useValue: {
                    getOptimizationDataService: jest.fn().mockReturnValue({
                        loadOptimizationSettings$: jest.fn(),
                        saveOptimizationSettings: jest.fn(),
                        restoreDefaultOptimizationSettings: jest.fn(),
                        appStore: {
                            optimizationOngoing$: {
                                next: jest.fn(() => {}),
                                asObservable: jest.fn(() => of(false))
                            },
                            updateCompositionPayload$: {
                                next: jest.fn(() => {})
                            }
                        }
                    }),
                    getOptimizationRunService: jest.fn().mockReturnValue({
                        run$: jest.fn(),
                        efficientFrontierRun$: jest.fn(),
                        createOptoRequest: jest.fn(() => {})
                    }),
                    getExploreOptimizationSettingsService: jest.fn().mockReturnValue({
                        loadRiskParitySettings: jest.fn()
                    })
                }}, {
                provide: CompositionDataService,
                useValue: {
                    fetchHoldingChangesFollowedByCompositionData$: jest.fn(() => of(composition)),
                    fetchCompositionDataForColumns$: jest.fn(() => of(composition))
                }
            }, {
                provide: LoadingService,
                useValue: {
                    isLoading$: jest.fn(() => of(false))
                }
            }, {
                provide: NotificationService,
                useValue: {
                    error: jest.fn(),
                    success: jest.fn(),
                    openDialog: jest.fn()
                }
            }, {
                provide: ChangeDetectorRef,
                useValue: {
                    markForCheck: jest.fn(() => {})
                }
            }, {
                provide: Http2BmsService,
                useValue: {
                    post$: jest.fn(() => of('demoData'))
                }
            }]
        });

        fixture = TestBed.createComponent(OptimizationMainComponent);
        component = fixture.componentInstance;
        component.optimizationStatus = {
            completionFlag: true,
            spinnerFlag: false
        };
        optimizationDataService = TestBed.inject(OptimizationDataService);
        notificationService = TestBed.inject(NotificationService);
        optimizationRunService = TestBed.inject(OptimizationRunService);
        http2BmsService = TestBed.inject(Http2BmsService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('should test mean variance or risk parity based on token value', () => {
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
        component.ngOnInit();
        WorkspaceStore.currentPortfolio$.next(new WhatIfPortfolio('test port'));
        expect(component.optimizationOptions.length).toBe(2);
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        component.ngOnInit();
        WorkspaceStore.currentPortfolio$.next(new WhatIfPortfolio('test port'));
        expect(component.optimizationOptions.length).toBe(3);
    });

    it('should test notification for workspace with deprecated active sector constraint', () => {
        const appUtilsSpy = jest.spyOn(AppUtils, 'alertNotification');
        component.ngOnInit();
        const portfolio = new PortfolioWithPositions();
        portfolio.optimizationSettings = new OptimizationSettings();
        portfolio.optimizationSettings.sectorConstraints = [new Constraint({
            positionType: 'ACTIVE',
            constraintTag: 'duration'
        })];
        WorkspaceStore.currentPortfolio$.next(portfolio);
        expect(appUtilsSpy).toHaveBeenCalled();

        // Notification shouldn't be triggered second time
        component.ngOnInit();
        WorkspaceStore.currentPortfolio$.next(portfolio);
        expect(appUtilsSpy).toBeCalledTimes(1);
        jest.clearAllMocks();
    });

    it('should test notification for workspace with active market value sector constraint', () => {
        const appUtilsSpy = jest.spyOn(AppUtils, 'alertNotification');
        component.ngOnInit();
        const portfolio = new PortfolioWithPositions();
        portfolio.optimizationSettings = new OptimizationSettings();
        portfolio.optimizationSettings.sectorConstraints = [new Constraint({
            positionType: 'ACTIVE',
            constraintTag: 'pct_mv'
        })];
        WorkspaceStore.currentPortfolio$.next(portfolio);
        expect(appUtilsSpy).not.toHaveBeenCalled();
    });


    it('initialize optimizationStatus from status store', () => {
        component.optimizationStatus = null;

        // #1 return back since it's not a whatIf instance
        let currentPort: Portfolio = new Portfolio();
        OptimizationStatusStore.setOptimizationsStatus(currentPort, {spinnerFlag: true, completionFlag: false});
        WorkspaceStore.currentPortfolio$.next(currentPort);
        expect(component.optimizationStatus).toBe(null);

        // #2 finds a whatIf but no entry in the store
        currentPort = new WhatIfPortfolio();
        WorkspaceStore.currentPortfolio$.next(currentPort);
        expect(component.optimizationStatus.spinnerFlag).toBe(false);
        expect(component.optimizationStatus.completionFlag).toBe(true);

        // #3 finds whatIf with an entry in the store
        OptimizationStatusStore.setOptimizationsStatus(currentPort, {spinnerFlag: true, completionFlag: false});
        WorkspaceStore.currentPortfolio$.next(currentPort);
        expect(component.optimizationStatus.spinnerFlag).toBe(true);
        expect(component.optimizationStatus.completionFlag).toBe(false);
    });

    it('should close', () => {
        const emitSpy = jest.spyOn(component.close, 'emit');
        component.onClose();
        expect(emitSpy).toHaveBeenCalledTimes(1);

    });

    it('should save', () => {
        const saveOptimizationSettingsSpy = jest.spyOn(component['optimizationDataService'], 'saveOptimizationSettings');
        component.onSave();
        expect(saveOptimizationSettingsSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit resetComposition', () => {
        jest.spyOn(component.resetComposition, 'emit');
        component.onResetComposition();
        expect(component.resetComposition.emit).toHaveBeenCalled();
    });

    describe('should load', () => {
        it('should do nothing when successful', fakeAsync(() => {
            const loadSpy = jest.spyOn(component['optimizationDataService'], 'loadOptimizationSettings$');
            const errorSpy = jest.spyOn(notificationService, 'error');
            loadSpy.mockReturnValue(of(new OptimizationSettings()));
            component.onLoad();
            tick();
            expect(loadSpy).toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();
        }));

        it('should do throw alert notification when loading deprecated active sector constraint', fakeAsync(() => {
            const loadSpy = jest.spyOn(component['optimizationDataService'], 'loadOptimizationSettings$');
            const errorSpy = jest.spyOn(notificationService, 'error');
            const appUtilsSpy = jest.spyOn(AppUtils, 'alertNotification');
            const optoSettings = new OptimizationSettings();
            optoSettings.sectorConstraints = [new Constraint({
                positionType: 'ACTIVE',
            })];
            loadSpy.mockReturnValue(of(optoSettings));
            component.onLoad();
            tick();
            expect(loadSpy).toHaveBeenCalled();
            expect(appUtilsSpy).toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();
        }));

        it('should display notification when error', fakeAsync(() => {
            const loadSpy = jest.spyOn(component['optimizationDataService'], 'loadOptimizationSettings$');
            const errorSpy = jest.spyOn(notificationService, 'error');
            loadSpy.mockReturnValue(throwError(new Error('test')));
            component.onLoad();
            tick();
            expect(loadSpy).toHaveBeenCalled();
            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenCalledWith(OPTIMIZATION_LOAD_FAIL_MESSAGE, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_LOAD_OPTIMIZATION_SETTINGS_ERROR);
        }));
    });

    it('should restore default', () => {
        const restoreDefaultOptimizationSettingsSpy = jest.spyOn(component['optimizationDataService'], 'restoreDefaultOptimizationSettings');
        const notificationSpy = jest.spyOn(notificationService, 'success');
        component.onRestoreDefault();
        expect(restoreDefaultOptimizationSettingsSpy).toHaveBeenCalledTimes(1);
        expect(notificationSpy).toHaveBeenCalledTimes(1);
        expect(notificationSpy).toHaveBeenCalledWith(OPTIMIZATION_RESTORE_DEFAULT_MESSAGE);
    });

    describe('should download ROS request', () => {
        it('should show error', fakeAsync(() => {
            const notificationSpy = jest.spyOn(notificationService, 'error');
            jest.spyOn(http2BmsService, 'post$').mockImplementation(() => throwError({
                error: new Error('error')
            }));
            component.onDownloadROSRequest(false);
            expect(notificationSpy).toHaveBeenCalledTimes(1);
            expect(notificationSpy).toHaveBeenCalledWith('Failed to download Risk Optimization Server request', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_DOWNLOAD_ROS_REQUEST_ERROR);
        }));

        it('should download the ROS request', fakeAsync(() => {
            const exportUtilsDownloadSpy = jest.spyOn(ExportUtils, 'download');
            jest.spyOn(http2BmsService, 'post$').mockImplementation(() => of({data: {compressedResponse: compressedResponseForDownloadAPIRequest}}));
            exportUtilsDownloadSpy.mockImplementation(() => {});
            component.currentPort = new PortfolioWithPositions();
            component.currentPort.portName = 'PEP';
            (component.currentPort as PortfolioWithPositions).date = '13/05/2020';
            component.onDownloadROSRequest(false);
            expect(exportUtilsDownloadSpy).toHaveBeenCalledTimes(1);
            flush();
            jest.clearAllMocks();
        }));

        it('should not download the ROS request when invalid deprecated active constraint', fakeAsync(() => {
            const exportUtilsDownloadSpy = jest.spyOn(ExportUtils, 'download');
            const notificationSpy = jest.spyOn(notificationService, 'openDialog');
            component.currentPort = new PortfolioWithPositions();
            component.currentPort.portName = 'PEP';
            (component.currentPort as PortfolioWithPositions).optimizationSettings = new OptimizationSettings();
            jest.spyOn(http2BmsService, 'post$').mockImplementation(() => of({data: {compressedResponse: compressedResponseForDownloadAPIRequest}}));
            exportUtilsDownloadSpy.mockImplementation(() => {});
            (component.currentPort as PortfolioWithPositions).optimizationSettings.sectorConstraints = [new Constraint({
                positionType: 'PORT',
                constraintTag: 'duration',
                optionValues: {
                    RelativeAbsolute: 'RELATIVE'
                }
            })];
            (component.currentPort as PortfolioWithPositions).date = '13/05/2020';
            component.onDownloadROSRequest(false);
            expect(notificationSpy).toHaveBeenCalledTimes(0);
            expect(exportUtilsDownloadSpy).toHaveBeenCalledTimes(1);

            (component.currentPort as PortfolioWithPositions).optimizationSettings.sectorConstraints = [new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'duration',
                optionValues: {
                    RelativeAbsolute: 'RELATIVE'
                }
            })];
            (component.currentPort as PortfolioWithPositions).date = '13/05/2020';
            component.onDownloadROSRequest(false);
            expect(notificationSpy).toHaveBeenCalledTimes(1);
            expect(exportUtilsDownloadSpy).toHaveBeenCalledTimes(1);
            flush();
        }));
    });

    describe('should run', () => {
        it('should show emit on success', fakeAsync(() => {
            const port = new PortfolioWithPositions();
            jest.spyOn(component['optimizationRunService'], 'run$').mockReturnValue(of(port));
            jest.spyOn(CompositionUtils, 'updateStatusFlagsAndStore');
            const notificationSpy = jest.spyOn(notificationService, 'success');

            component.onRun({mipTimeLimit: 60});
            tick();
            expect(CompositionUtils['updateStatusFlagsAndStore']).toHaveBeenCalledTimes(2);
            expect(component['optimizationDataService'].appStore.updateCompositionPayload$.next).toHaveBeenCalledWith(port);
            expect(component['compositionDataService'].fetchHoldingChangesFollowedByCompositionData$).toHaveBeenCalledWith(port);
            expect(port.composition === composition).toBeTruthy();
        }));

        it('should show error on failure - optimization run fails', fakeAsync(() => {
            const port = new PortfolioWithPositions();
            jest.spyOn(CompositionUtils, 'updateStatusFlagsAndStore');
            jest.spyOn(component['optimizationRunService'], 'run$').mockImplementation(() => throwError({
                error: new Error('error'),
                portfolio: port
            }));
            const notificationSpy = jest.spyOn(notificationService, 'error');

            component.onRun({mipTimeLimit: 60});
            tick();
            expect(notificationSpy).toHaveBeenCalledTimes(1);
            expect(notificationSpy).toHaveBeenCalledWith('ERROR: error',  ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_RUN_ERROR, true);
            expect(CompositionUtils['updateStatusFlagsAndStore']).toHaveBeenCalledTimes(4);
            expect(component['optimizationDataService'].appStore.updateCompositionPayload$.next).not.toHaveBeenCalled();
        }));

        it('should show error on failure - compositionData fetch fails', fakeAsync(() => {
            const port = new PortfolioWithPositions();
            jest.spyOn(CompositionUtils, 'updateStatusFlagsAndStore');
            jest.spyOn(component['optimizationRunService'], 'run$').mockReturnValue(of(port));
            jest.spyOn(component['compositionDataService'], 'fetchHoldingChangesFollowedByCompositionData$')
                .mockImplementation(() => throwError(new Error('error')));
            const notificationSpy = jest.spyOn(notificationService, 'error');

            component.onRun({mipTimeLimit: 60});
            tick();
            expect(notificationSpy).toHaveBeenCalledTimes(1);
            expect(notificationSpy).toHaveBeenCalledWith('ERROR: error', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_RUN_ERROR, true);
            expect(CompositionUtils['updateStatusFlagsAndStore']).toHaveBeenCalledTimes(6);
            expect(component.optimizationDataService.appStore.updateCompositionPayload$.next).not.toHaveBeenCalled();
        }));

        it('should show error modal when deprecated active constraints and block optimization run', fakeAsync(() => {
            const port = new PortfolioWithPositions();
            jest.spyOn(CompositionUtils, 'updateStatusFlagsAndStore');
            jest.spyOn(component['optimizationRunService'], 'run$');
            jest.spyOn(component['compositionDataService'], 'fetchHoldingChangesFollowedByCompositionData$')
                .mockImplementation(() => throwError(new Error('error')));
            const notificationSpy = jest.spyOn(notificationService, 'openDialog');
            port.optimizationSettings = new OptimizationSettings();
            port.optimizationSettings.sectorConstraints = [new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'duration',
                optionValues: {
                    RelativeAbsolute: 'RELATIVE'
                }
            })];
            component.currentPort = port;
            component.onRun({mipTimeLimit: 60});
            tick();
            expect(notificationSpy).toHaveBeenCalledTimes(1);
            expect(notificationSpy).toHaveBeenCalledWith({'header': 'Sector and portfolio constraints', 'message': 'We do not support this constraint set-up. Please use a \"non-active\" column. For more details, refer to Aladdin Product Update 2024.6', 'primaryButtonLabel': 'Ok', 'type': 'alert'});
            expect(CompositionUtils['updateStatusFlagsAndStore']).toHaveBeenCalledTimes(6);
            expect(component.optimizationRunService.run$).not.toHaveBeenCalled();
            expect(component.optimizationDataService.appStore.updateCompositionPayload$.next).not.toHaveBeenCalled();
        }));
    });

    describe('cancel optimization request', () => {
        it('should call cancelOptimization$ when onCancelOptimization is called', () => {
            // const port = new PortfolioWithPositions();
            component['optimizationRunService'].cancelOptimization$ = new Subject<void>();
            jest.spyOn(component['optimizationRunService'].cancelOptimization$, 'next');
            jest.spyOn(CompositionUtils, 'updateStatusFlagsAndStore');
            component.onCancelOptimization();
            expect(component['optimizationRunService'].cancelOptimization$.next).toHaveBeenCalled();
            expect(CompositionUtils['updateStatusFlagsAndStore']).toHaveBeenCalled();
        });
    });

    describe('should test optimizationCaseChanged', () => {
        it('should test optimizationCaseChanged', fakeAsync(() => {
            component.currentPort = new PortfolioWithPositions();
            component.onOptimizationCaseChanged(OptimizationTypeEnum.MEAN_VARIANCE_SECTOR);
            expect((component.currentPort as PortfolioWithPositions).optimizationType).toEqual(OptimizationTypeEnum.MEAN_VARIANCE_SECTOR);

            component.onOptimizationCaseChanged(OptimizationTypeEnum.MEAN_VARIANCE);
            expect((component.currentPort as PortfolioWithPositions).optimizationType).toEqual(OptimizationTypeEnum.MEAN_VARIANCE);

            component.onOptimizationCaseChanged(OptimizationTypeEnum.RISK_BUDGETING);
            expect((component.currentPort as PortfolioWithPositions).optimizationType).toEqual(OptimizationTypeEnum.RISK_BUDGETING);
        }));
    });
});
