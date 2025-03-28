import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {EfficientFrontierTableComponent} from './efficient-frontier-table.component';
import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {OptimizationDataService} from '../../../optimization/services/optimization-data.service';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {NotificationService} from '@services/notification';
import {OptimizationRunService} from '../../../optimization/services/optimization-run.service';
import {CompositionDataService} from '../../../main/composition-modelling/services/composition-data.service';
import {LoadingService} from '../../../loading/service/loading.service';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {LatestOptimizationRunDetails} from '@models/portfolio/optimization/latest-optimization-run-details';
import {Workspace} from '@models/workspace/workspace.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {
    AlertConstants,
    ErrorTypeConstants,
    ExploreDialogParam,
    NumericColumnFormat,
    UIErrorParameters,
    CoreUserMetaDataStore,
    UserMetaData
} from '@blk/explore-ui-core';
import {Constraint} from '@models/portfolio/constraints/constraint.model';

describe('EfficientFrontierTableComponent', () => {
    let component: EfficientFrontierTableComponent;
    let fixture: ComponentFixture<EfficientFrontierTableComponent>;
    let notificationService: NotificationService;
    let optimizationRunService: OptimizationRunService;
    const composition = {};

    const trade: any = {
        'additionalSuccessfulOptimizationDetails': [{
            'expectedSpecificVolatility': ['2.406996E-4', '2.406996E-4'],
            'benchmarkAssetCount': 18,
            'portfolioAssetCount': 19,
            'constraintBoundValues': {'max_total_risk': 1},
            'spreadTcostOfTrades': '1.094350E-9',
            'marketImpactTcostOfTrades': '0.000000E0',
            'expectedReturn': ['7.482802E-7', '7.482802E-7'],
            'tcostOfTrades': '1.094350E-9',
            'universeAssetCount': 19,
            'turnover': '1.094350E-09',
            'expectedVolatility': ['6.242770E-4', '6.242770E-4'],
            'expectedFactorVolatility': ['5.760082E-4', '5.760082E-4'],
            'CLASS_TYPE': 'com.bfm.prism.composition.AdditionalSuccessfulOptimizationDetails'
        }],
        'holdingChanges': [{
            'requiresBenchData': false,
            'convertFlag': 'N',
            'newWeight': 12.301062044206924,
            'isNotionalCash': false,
            'newDeltaAdjNMV': 14490586.803028122,
            'changeInCurrentFace': 324264.15179323964,
            'changeType': 'Security',
            'newParValue': 12434264.15179324,
            'newNotional': 14490586.803028122,
            'changeInQuantity': 324264.15179323964,
            'changeInMarketValue': 377889.49802812,
            'lineItem': 'BRSE35UJ1',
            'changeInWeight': 0.32079047068864774,
            'newMV': 14490586.803028122,
            'changeInDeltaAdjNMV': 377889.49802812,
            'changeInWeightRelToMainPort': 0.32079047068864774,
            'isNavNeutral': true,
            'changeInNotional': 377889.49802812,
            'tradeSize': 0.32079047068864774,
            'secDesc': 'AUSTRALIA (COMMONWEALTH OF) RegS',
            'newQuantity': 12434264.15179324,
            'newCurrentFace': 12434264.15179324,
            'portfolioName': 'ILB',
            'changeInParValue': 324264.15179323964
        }, {
            'requiresBenchData': true,
            'convertFlag': 'N',
            'newWeight': 0.6442198817270371,
            'isNotionalCash': false,
            'newDeltaAdjNMV': 758887.6539971957,
            'changeInCurrentFace': 506737.57190508494,
            'changeType': 'Security',
            'newParValue': 506737.57190508494,
            'newNotional': 758887.6539971957,
            'changeInQuantity': 506737.57190508494,
            'changeInMarketValue': 758887.6539971957,
            'lineItem': 'BRSA3KHK8',
            'changeInWeight': 0.6442198817270371,
            'newMV': 758887.6539971957,
            'changeInDeltaAdjNMV': 758887.6539971957,
            'changeInWeightRelToMainPort': 0.6442198817270371,
            'isNavNeutral': true,
            'changeInNotional': 758887.6539971957,
            'tradeSize': 0.6442198817270371,
            'secDesc': 'AUSTRALIAN CAPITAL TERRITORY',
            'newQuantity': 506737.57190508494,
            'newCurrentFace': 506737.57190508494,
            'portfolioName': 'ILB',
            'changeInParValue': 506737.57190508494
        }]
    };

    beforeAll(() => WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(undefined));

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        TestBed.configureTestingModule({
            declarations: [EfficientFrontierTableComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{
                provide: NotificationService,
                useValue: {
                    error: jest.fn(),
                    success: jest.fn()
                }
            }, {
                provide: OptimizationDataService,
                useValue: {
                    loadOptimizationSettings$: jest.fn(),
                    saveOptimizationSettings: jest.fn(),
                    restoreDefaultOptimizationSettings: jest.fn(),
                    appStore: {
                        efficientFrontierOngoing$: {
                            next: jest.fn(() => {}),
                            asObservable: jest.fn(() => of(false))
                        },
                        updateCompositionPayload$: {
                            next: jest.fn(() => {})
                        }
                    }
                }
            }, {
                provide: OptimizationRunService,
                useValue: {
                    run$: jest.fn(),
                    efficientFrontierRun$: jest.fn()
                }
            }, {
                provide: CompositionDataService,
                useValue: {
                    fetchHoldingChangesFollowedByCompositionData$: jest.fn(() => of(composition)),
                    fetchCompositionDataForColumns$: jest.fn(() => of(composition))
                }
            }, {
                provide: ChangeDetectorRef,
                useValue: {
                    markForCheck: jest.fn(() => {})
                }
            }, {
                provide: LoadingService,
                useValue: {
                    isLoading$: jest.fn(() => of(false))
                }
            }]
        });

        fixture = TestBed.createComponent(EfficientFrontierTableComponent);
        component = fixture.componentInstance;
        component.portfolio = new PortfolioWithPositions('What-if ILB 1');
        component.efficientFrontierStatus = {
            completionFlag: true,
            spinnerFlag: false
        };
        notificationService = TestBed.inject(NotificationService);
        optimizationRunService = TestBed.inject(OptimizationRunService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test enableDisableIteration', () => {
        const optoRunDetails = new LatestOptimizationRunDetails();
        expect(optoRunDetails.isSelected).toBeFalsy();
        component.enableDisableIteration(optoRunDetails);
        expect(optoRunDetails.isSelected).toBeTruthy();
    });

    it('test formatValueToBps', () => {
        let valueToFormat: any = 0.0932567;
        let formattedValue = component.formatValueToBps(valueToFormat);
        expect(formattedValue).toEqual('9.3257');

        // when value to format is an array
        valueToFormat = [0, 0.0932567];
        formattedValue = component.formatValueToBps(valueToFormat);
        expect(formattedValue).toEqual('9.3257');

        // when value to format is not a number
        valueToFormat = 'abc';
        formattedValue = component.formatValueToBps(valueToFormat);
        expect(formattedValue).toEqual('abc');

        // when value to format is null
        valueToFormat = null;
        formattedValue = component.formatValueToBps(valueToFormat);
        expect(formattedValue).toEqual(undefined);
    });

    it('test getColumnName', () => {
        let colName = 'Returns (Active) - Alpha Score';
        component.portfolio.optimizationSettings.objectiveSettings.objectivesType = OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE;
        component.portfolio.optimizationSettings.objectiveSettings.portfolioObjectives = [new StressScenarioPortfolioObjective()];
        expect(component.getColumnName(colName)).toEqual('Returns (Absolute) - Stress Scenario');

        // should not change the Systematic Risk (Active)
        colName = 'Systematic Risk (Active)';
        expect(component.getColumnName(colName)).toEqual('Systematic Risk (Active)');
    });

    it('test enableDisableAll', () => {
        const optoRunDetails = [new LatestOptimizationRunDetails(), new LatestOptimizationRunDetails(), new LatestOptimizationRunDetails()];
        component.portfolio.latestOptimizationRunDetails = optoRunDetails;

        // case when select all is checked
        optoRunDetails.forEach(details => details.isSelected = false);
        component.enableDisableAll(true);
        expect(optoRunDetails[0].isSelected).toBeTruthy();
        expect(optoRunDetails[1].isSelected).toBeTruthy();
        expect(optoRunDetails[2].isSelected).toBeTruthy();

        // case when some iterations are Infeasible
        optoRunDetails[0].solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_INFEASIBLE;
        component.enableDisableAll(true);
        expect(optoRunDetails[0].isSelected).toBeFalsy();
        expect(optoRunDetails[1].isSelected).toBeTruthy();
        expect(optoRunDetails[2].isSelected).toBeTruthy();

        // case when select all is unChecked
        optoRunDetails.forEach(details => details.isSelected = true);
        component.enableDisableAll(false);
        expect(optoRunDetails[0].isSelected).toBeFalsy();
        expect(optoRunDetails[1].isSelected).toBeFalsy();
        expect(optoRunDetails[2].isSelected).toBeFalsy();
    });

    it('test isAllSolutionsInfeasible', () => {
        const optoRunDetails = [new LatestOptimizationRunDetails(), new LatestOptimizationRunDetails()];
        component.portfolio.latestOptimizationRunDetails = optoRunDetails;
        optoRunDetails[0].solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_INFEASIBLE;
        optoRunDetails[1].solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_OPTIMAL;

        expect(component.isAllSolutionsInfeasible()).toBeFalsy();

        optoRunDetails[1].solverStatus = LatestOptimizationRunDetails.SOLVER_STATUS_INFEASIBLE;
        expect(component.isAllSolutionsInfeasible()).toBeTruthy();
    });

    describe('efficient frontier trades tests', () => {
        it('should create what-if portfolio for given trade', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            // workspace setup
            const workspace: Workspace = new Workspace();

            // workpad setup
            const workpad: BaseWorkpad = new FlatWorkpad();
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad);
            (workpad as FlatWorkpad).portfolio = new PortfolioWithPositions();
            workspace.workpads = [workpad];

            // current port setup
            const currentPort = new PortfolioWithPositions();
            currentPort.optimizationSettings.portfolioConstraints = [new Constraint({
                'constraintTag': 'max_total_risk',
                'optionValues': {
                    'ConstraintValue': '1:10'
                }
            })];

            (workpad as FlatWorkpad).portfolio = currentPort;

            // spies
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(currentPort);

            // index is 0
            const port1: WhatIfPortfolio = component['createWhatIfPortfoliosForTrades'](trade, 'what-if port 1_4', currentPort);
            expect(port1.title).toBe('what-if port 1_4');
            expect((port1 as PortfolioWithPositions).optimizationSettings.portfolioConstraints[0].optionValues.ConstraintValue).toBe(1);
            expect(port1.holdingChanges.length).toBe(2);

            // index > 0
            const port2: WhatIfPortfolio = component['createWhatIfPortfoliosForTrades'](trade, 'what-if port 1_1', currentPort);
            expect(port2.title).toBe('what-if port 1_1');
            expect((port1 as PortfolioWithPositions).optimizationSettings.portfolioConstraints[0].optionValues.ConstraintValue).toBe(1);
            expect(port1.holdingChanges.length).toBe(2);

            // efficient enabled for factor constraint on lower bound
            currentPort.optimizationSettings.portfolioConstraints = [];

            const scalingOptions: Map<string, number> = new Map<string, number>();
            scalingOptions.set('Percent (%)', 0.01);
            scalingOptions.set('Basis Point (bp)', 0.0001);
            const numericColumnFormat: NumericColumnFormat = new NumericColumnFormat();
            numericColumnFormat.scalingOptions = scalingOptions;
            numericColumnFormat.isUseThousandsSeparator = true;
            numericColumnFormat.decimalPlaces = 1;
            numericColumnFormat.scalingFactor = 0.01;

            currentPort.optimizationSettings.factorConstraints = [new Constraint({
                constraintTag: 'rfv_exp_port_cons',
                optionValues: {
                    ConstraintLowerBound: '10:50'
                },
                columnFormat: numericColumnFormat
            })];

            trade.additionalSuccessfulOptimizationDetails[0].constraintBoundValues['rfv_exp_port_cons'] = 0.5;
            const port_ef: WhatIfPortfolio = component['createWhatIfPortfoliosForTrades'](trade, 'what-if port 1_1', currentPort);
            expect((port_ef as PortfolioWithPositions).optimizationSettings.factorConstraints[0].optionValues.ConstraintLowerBound).toBe (50);

            trade.additionalSuccessfulOptimizationDetails[0].constraintBoundValues['rfv_exp_port_cons'] = 0.4552;
            const port_ef1: WhatIfPortfolio = component['createWhatIfPortfoliosForTrades'](trade, 'what-if port 1_1', currentPort);
            expect((port_ef1 as PortfolioWithPositions).optimizationSettings.factorConstraints[0].optionValues.ConstraintLowerBound).toBe (45.52);

            // efficient enabled for sector constraint on upper bound
            currentPort.optimizationSettings.sectorConstraints = [new Constraint({
                constraintTag: 'market_val',
                optionValues: {
                    ConstraintUpperBound: '1:10'
                }
            })];
            currentPort.optimizationSettings.factorConstraints = [];
            trade.additionalSuccessfulOptimizationDetails[0].constraintBoundValues['market_val'] = 1;
            const port3: WhatIfPortfolio = component['createWhatIfPortfoliosForTrades'](trade, 'what-if port 1_1', currentPort);
            expect((port3 as PortfolioWithPositions).optimizationSettings.sectorConstraints[0].optionValues.ConstraintUpperBound).toBe (1);

            // efficient enabled for sector constraint on Lower bound
            currentPort.optimizationSettings.sectorConstraints[0].optionValues = {ConstraintLowerBound: [1, 5, 10]};
            const port4: WhatIfPortfolio = component['createWhatIfPortfoliosForTrades'](trade, 'what-if port 1_2', currentPort);
            expect((port4 as PortfolioWithPositions).optimizationSettings.sectorConstraints[0].optionValues.ConstraintLowerBound).toBe (1);

            // efficient enabled for sector constraint on Lower bound and upper bound is non efficient
            currentPort.optimizationSettings.sectorConstraints[0].optionValues = {ConstraintLowerBound: [1, 5, 10], ConstraintUpperBound: 15};
            const port5: WhatIfPortfolio = component['createWhatIfPortfoliosForTrades'](trade, 'what-if port 1_2', currentPort);
            expect((port5 as PortfolioWithPositions).optimizationSettings.sectorConstraints[0].optionValues.ConstraintLowerBound).toBe (1);

            // efficient enabled for sector constraint on Upper bound and Lower bound is non efficient
            currentPort.optimizationSettings.sectorConstraints[0].optionValues = {ConstraintLowerBound: 1, ConstraintUpperBound: [1, 5, 10]};
            const port6: WhatIfPortfolio = component['createWhatIfPortfoliosForTrades'](trade, 'what-if port 1_2', currentPort);
            expect((port6 as PortfolioWithPositions).optimizationSettings.sectorConstraints[0].optionValues.ConstraintUpperBound).toBe (1);

            expect((WorkspaceStore.currentWorkpad$.getValue() as ReportGroup).portfolios.length).toBe(9);
        });

        it('tests onEfficientFrontierRun - should emit on success', fakeAsync(() => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            // workspace setup
            const workspace: Workspace = new Workspace();

            // workpad setup
            const workpad: BaseWorkpad = new FlatWorkpad();
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad);
            (workpad as FlatWorkpad).portfolio = new PortfolioWithPositions();
            workspace.workpads = [workpad];

            component.portfolio = new PortfolioWithPositions();
            const latestOptimizationRunDetails = new LatestOptimizationRunDetails();
            latestOptimizationRunDetails.isSelected = true;
            component.portfolio.latestOptimizationRunDetails = [latestOptimizationRunDetails];
            const port = component.portfolio as PortfolioWithPositions;
            const trades = [trade];

            // test for success on receiving good response
            jest.spyOn(optimizationRunService, 'efficientFrontierRun$').mockReturnValue(of({
                portfolio: port,
                efficientFrontierTradesData: trades
            }));
            notificationService['openDialog'] = jest.fn();
            jest.spyOn(notificationService, 'openDialog');
            jest.spyOn(component, 'updateStatusFlagsAndStore');
            jest.spyOn(component, 'createWhatIfPortfoliosForTrades').mockImplementation(() => new WhatIfPortfolio());

            component.onEfficientFrontierRun();
            tick();

            expect(notificationService.openDialog).not.toHaveBeenCalled();
            expect(component.portfolio.iterationIndexList).toEqual([0]);
            expect(component['updateStatusFlagsAndStore']).toHaveBeenCalledWith(port, true, false);
            expect(component.createWhatIfPortfoliosForTrades).toHaveBeenCalledTimes(1);

            // test for failure message on receiving bad response
            jest.spyOn(optimizationRunService, 'efficientFrontierRun$').mockReturnValue(throwError({
                portfolio: port,
                error: new Error('received bad response')
            }));
            component.onEfficientFrontierRun();
            tick();

            expect(component['updateStatusFlagsAndStore']).toHaveBeenCalledWith(port, true, false);
            expect(component.createWhatIfPortfoliosForTrades).toHaveBeenCalledTimes(1);
            expect(notificationService.error).toHaveBeenCalledWith('ERROR: received bad response', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_EFFICIENT_FRONTIER_RUN_ERROR, true);
        }));

        it('tests onEfficientFrontierRun - on server failure', fakeAsync(() => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            notificationService['openDialog'] = jest.fn();
            jest.spyOn(notificationService, 'openDialog');
            jest.spyOn(component, 'updateStatusFlagsAndStore');
            jest.spyOn(component, 'createWhatIfPortfoliosForTrades');
            jest.spyOn(optimizationRunService, 'efficientFrontierRun$').mockImplementation(() => throwError(new Error('server failure')));

            component.onEfficientFrontierRun();
            tick();
            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.GENERATE_WHAT_IF_AND_TRADES,
                AlertConstants.BODY.NO_PORT_SELECTED_WHAT_IF_AND_TRADES,
                AlertConstants.BTN.OK
            ));
            expect(component.createWhatIfPortfoliosForTrades).toHaveBeenCalledTimes(0);
        }));
    });
});
