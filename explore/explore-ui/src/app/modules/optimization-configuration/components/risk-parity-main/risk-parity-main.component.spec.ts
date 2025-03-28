import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {RiskParityMainComponent} from '@optimization-configuration/components/risk-parity-main/risk-parity-main.component';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {OptimizationDataService} from '../../../optimization/services/optimization-data.service';
import {OptimizationRunService} from '../../../optimization/services/optimization-run.service';
import {Http2BmsService} from '@services/bms';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {OptimizationCompositeService} from '../../../optimization/services/optimization-composite-service';
import {CompositionDataService} from '../../../main/composition-modelling/services/composition-data.service';
import {LoadingService} from '../../../loading/service/loading.service';

describe('RiskParitycomponent', () => {
    let component: RiskParityMainComponent;
    let fixture: ComponentFixture<RiskParityMainComponent>;
    let optimizationDataService: OptimizationDataService;
    let optimizationRunService: OptimizationRunService;
    let http2BmsService: Http2BmsService;
    const composition = {};

    beforeAll(() => WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(undefined));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RiskParityMainComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: OptimizationCompositeService,
                    useValue: {
                        getOptimizationDataService: jest.fn().mockReturnValue({
                            restoreDefaultOptimizationSettings: jest.fn(),
                            updateRiskParitySettings: jest.fn(),
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
                        getOptimizationService: jest.fn().mockReturnValue({
                            getRiskParityOptimizationSummaries$: jest.fn(() => of([])),
                            getRunUpdateNotification: jest.fn()
                        }),
                        getExploreOptimizationSettingsService: jest.fn().mockReturnValue({
                            loadRiskParitySettings: jest.fn()
                        }),
                    }
                }, {
                    provide: CompositionDataService,
                    useValue: {
                        fetchHoldingChangesFollowedByCompositionData$: jest.fn(() => of(composition)),
                        fetchCompositionDataForColumns$: jest.fn(() => of(composition))
                    }
                },  {
                    provide: LoadingService,
                    useValue: {
                        isLoading$: jest.fn(() => of(false))
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
                }
            ]
        });

        fixture = TestBed.createComponent(RiskParityMainComponent);
        component = fixture.componentInstance;
        component.currentPort = new PortfolioWithPositions('TestPf');
        component.currentPort.riskParitySettings = new RiskParitySettings();
        component.optimizationStatus = {
            completionFlag: true,
            spinnerFlag: false
        };
        jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockImplementation(function() {
            const port = new PortfolioWithPositions();
            port.riskParitySettings = new RiskParitySettings({riskParityCase: 0});
            port.benchmark = new Benchmark();
            return port;
        });
        optimizationDataService = TestBed.inject(OptimizationDataService);
        optimizationRunService = TestBed.inject(OptimizationRunService);
        http2BmsService = TestBed.inject(Http2BmsService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close', () => {
        const emitSpy = jest.spyOn(component.close, 'emit');
        component.onClose();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('initializeRiskParityOptions', () => {
        component.initializeRiskParityOptions();
        expect(component.riskParityOptions.length).toEqual(2);
    });

    it('on restore default', () => {
        const spy = jest.spyOn(component['optimizationDataService'], 'updateRiskParitySettings');
        component.onRestoreDefault();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('on edit', () => {
        component.onEdit('screening');
        expect(component.type).toEqual('screening');
        expect(component.launchOptimizationSettings).toBeTruthy();
    });

    it('on modal closed', () => {
        component.onModalClosed();
        expect(component.launchOptimizationSettings).toBeFalsy();
    });

    it('on risk parity option changed', () => {
        const spy = jest.spyOn(component, 'initializeRiskParityOptions');
        component.onRiskParityOptionchanged(0);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit resetComposition', () => {
        jest.spyOn(component.resetComposition, 'emit');
        component.onResetComposition();
        expect(component.resetComposition.emit).toHaveBeenCalled();
    });

});
