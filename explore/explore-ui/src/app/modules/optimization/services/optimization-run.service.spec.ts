import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
    AlertConstants,
    ColumnConfig,
    ConfigTypeFactory,
    CoreUserMetaDataStore,
    DateValue,
    ErrorTypeConstants,
    NumericColumnFormat,
    SerializeFavoriteType,
    TelemetryActionConstants,
    TelemetryRiskBudgetingParameters,
    TelemetryService,
    TelemetryTierDefinitionRiskBudgetingParameters,
    UIErrorParameters,
    UserMetaData
} from '@blk/explore-ui-core';
import {ExposureSettings, RiskSettings} from '@blk/explore-ui-risk';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {OptimizationConstants} from '@constants/optimization.constants';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Breakdown, ColumnSectorRule, CustomFilter, CustomSector, SectorConstants} from '@blk/explore-ui-breakdown';
import {SCEN_CODE} from '@optimization-settings/constants/optimization-keys.constants';
import {
    DEFAULT_EFFICIENT_FRONTIER_ERROR_MESSAGE,
    DEFAULT_OPTIMIZATION_ERROR_MESSAGE,
    OPTIMIZATION_EFFICIENT_FRONTIER_PARTIAL_SUCCESS_MESSAGE,
    OPTIMIZATION_EFFICIENT_FRONTIER_SUCCESS_MESSAGE,
    OPTIMIZATION_ERROR_MESSAGE,
    OPTIMIZATION_NO_HOLDINGS_MESSAGE,
    OPTIMIZATION_SUCCESS_MESSAGE
} from '@optimization-settings/constants/optimization-notification-messages.constants';
import {
    SUB_TYPE_FACTOR_CONSTRAINTS,
    SUB_TYPE_PORTFOLIO_CONSTRAINTS,
    SUB_TYPE_SECTOR_CONSTRAINTS,
    SUB_TYPE_SECURITY_CONSTRAINTS
} from '@optimization-settings/constants/optimization-types.constants';
import {ONE_TYPE, RELATIVE} from '@optimization-settings/constraints-settings/constants/sector-constraint.constants';
import {
    ConstraintOptionValueKey
} from '@optimization-settings/constraints-settings/enums/constraint-option-value-key.enum';
import {Http2BmsService} from '@services/bms/http2bms.service';
import {NotificationService} from '@services/notification';
import {of, throwError} from 'rxjs';
import {CommonConstants} from '../../../constants';
import {HoldingChangeFactory} from '../../../factories/holding-change.factory';
import {OptimizationDataService} from './optimization-data.service';
import {OptimizationRunService} from './optimization-run.service';
import {
    ClimateScenario,
    CustomAggregationColumnOption,
    TempAlignmentScenariosColumnOption
} from '@blk/explore-ui-column-option';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {compressedResponseForRunOptimization} from '@mocks/test-data/optimization-response-test-data';
import {
    CollapsedLookthroughColumnOption
} from '@models/columns/column-options/collapsed-lookthrough-column-option.model';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {Security} from '@interfaces/security.interface';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {Workspace} from '@models/workspace/workspace.model';
import {
    ConstraintOptionSecurityListSubsectionEnum
} from '@optimization-settings/constraints-settings/enums/constraint-option-security-list-subsection.enum';
import {OptimizationTypeEnum} from '@enums/optimization-type.enum';

describe('OptimizationRunService', () => {
    let service: OptimizationRunService;
    let optimizationDataService: OptimizationDataService;
    let http2BmsService: Http2BmsService;
    let notificationService: NotificationService;

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        TestBed.configureTestingModule({
            providers: [{
                provide: OptimizationDataService,
                useValue: {
                    getPortfolioWithPositions$: jest.fn()
                }
            }, {
                provide: Http2BmsService,
                useValue: {
                    post$: jest.fn()
                }
            }, {
                provide: NotificationService,
                useValue: {
                    success: jest.fn(),
                    warning: jest.fn()
                }
            }]
        });

        service = TestBed.inject(OptimizationRunService);
        optimizationDataService = TestBed.inject(OptimizationDataService);
        http2BmsService = TestBed.inject(Http2BmsService);
        notificationService = TestBed.inject(NotificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('should run', () => {
        it('should throw error if not portfolio', (done: any) => {
            jest.spyOn(optimizationDataService, 'getPortfolioWithPositions$').mockReturnValue(of(undefined));
            service.run$().subscribe(() => {
            }, (error: any) => {
                expect(error).toEqual(new Error(DEFAULT_OPTIMIZATION_ERROR_MESSAGE));
                done();
            });
        });

        it('should run if portfolio', fakeAsync(() => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.optimizationSettings=new OptimizationSettings();
            portfolio.optimizationSettings.investmentUniverseSettings=new InvestmentUniverseSettings();
            portfolio.benchmark=new Benchmark();

            portfolio.portfolioRiskSettings = new RiskSettings();
            portfolio.datePicker={};
            jest.spyOn(optimizationDataService, 'getPortfolioWithPositions$').mockReturnValue(of(portfolio));
            const postSpy = jest.spyOn(http2BmsService, 'post$');
            const response = {
                status: 'status',
                data: {},
                message: 'message'
            };
            postSpy.mockReturnValue(of(response));
            const processOptimizationResultsSpy = jest.spyOn(service, 'processOptimizationResults');
            processOptimizationResultsSpy.mockReturnValue(true);
            const getOptimizationConstraintSettingsSpy = jest.spyOn(service, 'getOptimizationConstraintSettings');
            getOptimizationConstraintSettingsSpy.mockReturnValue({});
            const getOptimizationInvestmentUniverseSettingsSpy = jest.spyOn(service, 'getOptimizationInvestmentUniverseSettings');
            getOptimizationInvestmentUniverseSettingsSpy.mockReturnValue({});
            const getOptimizationObjectiveSettingsSpy = jest.spyOn(service, 'getOptimizationObjectiveSettings');
            const telemetryInvestUniverseSpy=jest.spyOn(service,'getInvestmentUniverseTelemetry');
            getOptimizationObjectiveSettingsSpy.mockReturnValue({});
            WorkspaceStore.init();
            (service.run$().subscribe((value: boolean) => expect(value).toBe(true)));
            tick();
            expect(getOptimizationConstraintSettingsSpy).toHaveBeenCalledTimes(1);
            expect(getOptimizationInvestmentUniverseSettingsSpy).toHaveBeenCalledTimes(1);
            expect(getOptimizationObjectiveSettingsSpy).toHaveBeenCalledTimes(1);
            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(postSpy).toHaveBeenCalledWith('getOptimizationResponse', expect.anything(), expect.anything());
            expect(processOptimizationResultsSpy).toHaveBeenCalledTimes(1);
            expect(processOptimizationResultsSpy).toHaveBeenCalledWith(response, portfolio);
            expect(telemetryInvestUniverseSpy).toHaveBeenCalledWith(portfolio);


            // #2 - getOptimizationResponse fail scenario
            postSpy.mockReturnValue(throwError(new Error('error')));
            service.run$().subscribe({
                next: null,
                error: err => {
                    expect(err.error.message).toBe('error');
                    expect(err.portfolio === portfolio).toBeTruthy();
                }
            });
            tick();
        }));
    });
    describe('should process type in investment universe', () => {
        it('should test for Portfolio', () => {
            expect(service.typeInInvestmentUniverse('Portfolio')).toEqual(1);
        });
        it('should test for Benchmark', () => {
            expect(service.typeInInvestmentUniverse('Benchmark')).toEqual(2);
        });
        it('should test for Security', () => {
            expect(service.typeInInvestmentUniverse('Security')).toEqual(3);
        });
    });


    describe('should process optimization results', () => {
        it('should throw error on failure status with default message if none provided', () => {
            expect(() => service.processOptimizationResults({
                status: CommonConstants.RESPONSE_STATUS_FAILURE,
                data: {},
                message: undefined
            }, undefined)).toThrowError(DEFAULT_OPTIMIZATION_ERROR_MESSAGE);
        });

        it('should throw error on failure status', () => {
            const message = 'error';
            expect(() => service.processOptimizationResults({
                status: CommonConstants.RESPONSE_STATUS_FAILURE,
                data: {},
                message
            }, undefined)).toThrowError(message);
        });

        it('should throw error if no data', () => {
            const message = 'error';
            expect(() => service.processOptimizationResults({
                status: 'success',
                data: undefined,
                message
            }, undefined)).toThrowError(message);
        });

        it('should throw error if no holding changes', () => {
            const message = 'error';
            expect(() => service.processOptimizationResults({
                status: 'success',
                data: {},
                message
            }, undefined)).toThrowError(message);
        });

        it('should throw error based on status - BOUNDED if no holding changes', () => {
            const message = undefined;
            const expectedMessage = OPTIMIZATION_ERROR_MESSAGE + CommonConstants.SINGLE_SPACE  + 'Optimization run status: SOLVER_ERROR. The process was completed successfully, '
                + 'but there was no feasible solution with your bounds / constraints. <br>SOLVER_ERROR may be caused by missing data, bad case setup, or in rare cases, problem within the solver itself.'
                + ' <br>These statuses usually indicate software or model issues that require attention from support teams.';
            expect(() => service.processOptimizationResults({
                status: 'success',
                data: {optoRunStatus : 'SOLVER,SUCCESS\nBOUNDED,false\n'},
                message
            }, undefined)).toThrowError(expectedMessage);
        });

        it('should throw error based on status - INFEASIBLE if no holding changes', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            const holdingChange: HoldingChange = new PortfolioSecurityHoldingChange();
            const convertObjectToHoldingChangeSpy = jest.spyOn(HoldingChangeFactory, 'convertObjectToHoldingChange').mockReturnValue(holdingChange);
            const expectedMessage = OPTIMIZATION_SUCCESS_MESSAGE + CommonConstants.SINGLE_SPACE  + 'Optimization run status: INFEASIBLE' +
                CommonConstants.DOT + '\n' + 'Infeasible results indicate that the optimizer could not find a solution within the given constraints. <br>The first step ' +
                'in rectifying this is to try to relax select constraints as the boundaries might be too tight for finding a solution.';

            expect(service.processOptimizationResults({
                status: 'success',
                data: {
                    holdingChanges: [{}],
                    additionalSuccessfulOptimizationDetails: [],
                    optoRunStatus : 'SOLVER,SUCCESS\nINFEASIBLE,false\n'
                },
                message: ''
            }, portfolio)).toEqual(portfolio);
            expect(notificationService.warning).toHaveBeenCalledTimes(1);
            expect(notificationService.warning).toHaveBeenCalledWith(expectedMessage, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SHOW_EFFICIENT_FRONTIER_WARNING);
            convertObjectToHoldingChangeSpy.mockRestore();
        });

        it('should throw error if empty holding changes with default message if none provided', () => {
            expect(() => service.processOptimizationResults({
                status: 'success',
                data: {
                    holdingChanges: [],
                    additionalSuccessfulOptimizationDetails: []
                },
                message: undefined
            }, undefined)).toThrowError(DEFAULT_OPTIMIZATION_ERROR_MESSAGE);
            expect(notificationService.warning).toHaveBeenCalledTimes(1);
            expect(notificationService.warning).toHaveBeenCalledWith(OPTIMIZATION_NO_HOLDINGS_MESSAGE, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PROCESS_OPTIMIZATION_RESULTS_WARNING);
        });

        it('should throw error if empty holding changes', () => {
            const message = 'error';
            expect(() => service.processOptimizationResults({
                status: 'success',
                data: {
                    holdingChanges: [],
                    additionalSuccessfulOptimizationDetails: []
                },
                message
            }, undefined)).toThrowError(message);
            expect(notificationService.warning).toHaveBeenCalledTimes(1);
            expect(notificationService.warning).toHaveBeenCalledWith(OPTIMIZATION_NO_HOLDINGS_MESSAGE, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PROCESS_OPTIMIZATION_RESULTS_WARNING);
        });

        it('should throw error if no optimization settings', () => {
            const message = 'error';
            const portfolio = new PortfolioWithPositions();
            portfolio.optimizationSettings = undefined;
            expect(() => service.processOptimizationResults({
                status: 'success',
                data: {
                    holdingChanges: [],
                    additionalSuccessfulOptimizationDetails: []
                },
                message
            }, portfolio)).toThrowError(message);
            expect(notificationService.warning).toHaveBeenCalledTimes(1);
            expect(notificationService.warning).toHaveBeenCalledWith(OPTIMIZATION_NO_HOLDINGS_MESSAGE, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PROCESS_OPTIMIZATION_RESULTS_WARNING);
        });

        it('should add holding changes if present', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            const holdingChange: HoldingChange = new PortfolioSecurityHoldingChange();
            const convertObjectToHoldingChangeSpy = jest.spyOn(HoldingChangeFactory, 'convertObjectToHoldingChange').mockReturnValue(holdingChange);

            expect(service.processOptimizationResults({
                status: 'success',
                data: {
                    holdingChanges: [{}],
                    optoFinalHoldings: [{}],
                    additionalSuccessfulOptimizationDetails: []
                },
                message: ''
            }, portfolio)).toEqual(portfolio);
            expect(portfolio.holdingChanges).toEqual([holdingChange]);
            convertObjectToHoldingChangeSpy.mockRestore();
        });

        it('should decompress', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            const holdingChange: HoldingChange = new PortfolioSecurityHoldingChange();
            const convertObjectToHoldingChangeSpy = jest.spyOn(HoldingChangeFactory, 'convertObjectToHoldingChange').mockReturnValue(holdingChange);
            const expectedMessage = OPTIMIZATION_SUCCESS_MESSAGE + CommonConstants.SINGLE_SPACE  + 'Optimization run status: OPTIMAL' +
                CommonConstants.DOT + '\n' + 'The best possible solution (globally optimal) to the defined problem.';
            service.processOptimizationResults({
                status: 'success',
                data: {compressedResponse: compressedResponseForRunOptimization},
                message: ''
            }, portfolio);
            expect(portfolio.holdingChanges).toEqual([holdingChange]);
            expect(notificationService.success).toHaveBeenCalledWith(expectedMessage);
            convertObjectToHoldingChangeSpy.mockRestore();
        });

        it('should send efficient frontier success only for efficient frontier run', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.optimizationSettings.isEfficientFrontierEnabled = true;
            const holdingChange: HoldingChange = new PortfolioSecurityHoldingChange();
            const convertObjectToHoldingChangeSpy = jest.spyOn(HoldingChangeFactory, 'convertObjectToHoldingChange').mockReturnValue(holdingChange);

            // when one of the iteration is Infeasible
            expect(service.processOptimizationResults({
                status: 'success',
                data: {
                    holdingChanges: [],
                    additionalSuccessfulOptimizationDetails: [{'portfolioCount': 126, 'solverStatus': 'INFEASIBLE'}]
                },
                message: ''
            }, portfolio)).toEqual(portfolio);
            expect(portfolio.holdingChanges).toEqual([]);
            expect(notificationService.warning).toHaveBeenCalledTimes(1);
            expect(notificationService.warning).toHaveBeenCalledWith(OPTIMIZATION_EFFICIENT_FRONTIER_PARTIAL_SUCCESS_MESSAGE, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SHOW_EFFICIENT_FRONTIER_WARNING);

            // when all the iterations are Optimal
            expect(service.processOptimizationResults({
                status: 'success',
                data: {
                    holdingChanges: [],
                    additionalSuccessfulOptimizationDetails: [{'portfolioCount': 126, 'solverStatus': 'OPTIMAL'}]
                },
                message: ''
            }, portfolio)).toEqual(portfolio);
            expect(portfolio.holdingChanges).toEqual([]);
            expect(notificationService.success).toHaveBeenCalledTimes(1);
            expect(notificationService.success).toHaveBeenCalledWith(OPTIMIZATION_EFFICIENT_FRONTIER_SUCCESS_MESSAGE);

            portfolio.optimizationSettings.isEfficientFrontierEnabled = false;
            expect(service.processOptimizationResults({
                status: 'success',
                data: {
                    holdingChanges: [new PortfolioSecurityHoldingChange()],
                    additionalSuccessfulOptimizationDetails: [{'portfolioCount': 126}]
                },
                message: ''
            }, portfolio)).toEqual(portfolio);
            expect(portfolio.holdingChanges).toEqual([new PortfolioSecurityHoldingChange()]);
            expect(notificationService.success).toHaveBeenCalledTimes(2);
            expect(notificationService.success).toHaveBeenCalledWith(OPTIMIZATION_SUCCESS_MESSAGE);
        });
    });

    it('should get optimization constraint settings', () => {
        const optimizationSettings: OptimizationSettings = new OptimizationSettings();
        optimizationSettings.portfolioConstraints = [{
            enabled: true,
            constraintType: SUB_TYPE_PORTFOLIO_CONSTRAINTS
        }, {
            enabled: false,
            constraintType: SUB_TYPE_PORTFOLIO_CONSTRAINTS
        }];
        optimizationSettings.securityConstraints = [{
            enabled: true,
            constraintType: SUB_TYPE_SECURITY_CONSTRAINTS
        }, {
            enabled: false,
            constraintType: SUB_TYPE_SECURITY_CONSTRAINTS
        }];
        optimizationSettings.sectorConstraints = [{
            enabled: true,
            optionValues: {
                sectorConstraintType: 'type'
            },
            constraintType: SUB_TYPE_SECTOR_CONSTRAINTS
        }, {
            enabled: false,
            constraintType: SUB_TYPE_SECTOR_CONSTRAINTS
        }];
        optimizationSettings.factorConstraints = [{
            enabled: true,
            optionValues: {
                quickFactorBlock: 'abc'
            },
            constraintType: SUB_TYPE_FACTOR_CONSTRAINTS
        }, {
            enabled: false,
            constraintType: SUB_TYPE_FACTOR_CONSTRAINTS
        }];
        jest.spyOn(service, 'createPortfolioConstraint').mockImplementation((portfolioConstraint) => portfolioConstraint);
        jest.spyOn(service, 'createSecurityConstraint').mockImplementation((securityConstraint) => securityConstraint);
        jest.spyOn(service, 'createSectorConstraint').mockImplementation((sectorConstraint) => sectorConstraint);
        jest.spyOn(service, 'createFactorConstraint').mockImplementation((factorConstraint) => factorConstraint);

        expect(service.getOptimizationConstraintSettings(optimizationSettings)).toEqual({
            factorConstraints: [{
                enabled: true,
                optionValues: {
                    quickFactorBlock: 'abc'
                },
                constraintType: SUB_TYPE_FACTOR_CONSTRAINTS
            }],
            portfolioConstraints: [{enabled: true, constraintType: SUB_TYPE_PORTFOLIO_CONSTRAINTS}],
            securityConstraints: [{enabled: true, constraintType: SUB_TYPE_SECURITY_CONSTRAINTS}],
            sectorConstraints: [{
                enabled: true,
                optionValues: {
                    sectorConstraintType: 'type'
                },
                constraintType: SUB_TYPE_SECTOR_CONSTRAINTS
            }]
        });
    });

    describe('test getOptimizationInvestmentUniverseSettings', () => {
        const optimizationSettings: OptimizationSettings = new OptimizationSettings();
        const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
        portfolio.benchmark = {
            name: 'benchname'
        };
        portfolio.benchmark.portfolio = new AdhocPortfolio('abc', undefined, new AdhocPortParams({
            name: 'Adhoc IP',
            fullName: 'Adhoc International Paper',
            currency: 'JPY',
            portMktNotional: 300000,
            date: {date: '01/01/2020', dateString: false},
            holdingChanges: [{'lineItem': 'cusip'}]
        }));
        portfolio.benchmark.portfolio.currency = 'USD';
        portfolio.portName = 'portname';
        const port2 = 'portfolio2';
        const sec2 = ['security2'];
        optimizationSettings.investmentUniverseSettings.investmentUniverse = [
            new InvestmentUniversePortfolio({
                type: InvestmentUniverseConstants.PORTFOLIO,
                label: 'port1',
                portfolio: 'portfolio1',
                enabled: false
            }),
            new InvestmentUniversePortfolio({
                type: InvestmentUniverseConstants.PORTFOLIO,
                label: 'port2',
                portfolio: port2,
                enabled: true
            }),
            new InvestmentUniverseSecurity({
                type: InvestmentUniverseConstants.SECURITY,
                label: 'sec1',
                securities: ['security1'],
                enabled: false
            }),
            new InvestmentUniverseSecurity({
                type: InvestmentUniverseConstants.SECURITY,
                label: 'sec2',
                securities: sec2,
                enabled: true
            })
        ];

        it('should get optimization investment universe settings', () => {
            portfolio.benchmark.portfolio['holdingChanges'] = [new NewSecurityHoldingChange({'lineItem' : 'cusip'})];
            expect(service.getOptimizationInvestmentUniverseSettings(optimizationSettings, portfolio)).toEqual({
                portfolios: {
                    port2: {
                        name: 'portfolio2'
                    }
                },
                securities: {
                    sec2
                },
                benchmark: {
                    name: 'benchname',
                    adhocParams: {
                        'currency': 'JPY',
                        'date': {
                            'date': '01/01/2020',
                            'dateString': false
                        },
                        'fullName': 'Adhoc International Paper',
                        'name': 'Adhoc IP',
                        'portMktNotional': 300000
                    },
                    holdingChanges: [{'changeType': 'NewSecurity', 'lineItem': 'cusip', 'isCashOffsetRequired': true}],
                    sendPortfolio: false
                },
                mainPortfolio: {
                    name: 'portname',
                    sendPortfolio: false
                }
            });
        });

        it('should get optimization investment universe settings - with filters included', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.COLUMN_SECTOR_RULE, ColumnSectorRule);

            const rule = {
                'colTag': 'sec_group',
                'compType': 'EQUALS',
                'colType': 'String',
                'ruleType': 'Rule',
                'colTitle': 'Security Group',
                'colPositionColumnType': 'ALL',
                'compValues': ['EQUITY', 'BND'],
                'compValuesLabel': ['EQUITY', 'BOND'],
                'customSectorType': 'Fund'
            };

            optimizationSettings.investmentUniverseSettings.investmentUniverse.push(
                new InvestmentUniversePortfolio({
                    type: InvestmentUniverseConstants.PORTFOLIO,
                    label: InvestmentUniverseConstants.PORTFOLIO,
                    portfolio: 'portname',
                    enabled: true,
                    isFrozen: true,
                    filter: new CustomSector({rule})
                }),
                new InvestmentUniversePortfolio({
                    type: InvestmentUniverseConstants.BENCHMARK,
                    label: InvestmentUniverseConstants.BENCHMARK,
                    portfolio: 'benchname',
                    enabled: true,
                    isFrozen: true,
                    filter: new CustomSector({rule})
                })
            );
            expect(service.getOptimizationInvestmentUniverseSettings(optimizationSettings, portfolio)).toEqual({
                portfolios: {
                    port2: {
                        name: 'portfolio2'
                    }
                },
                securities: {
                    sec2
                },
                benchmark: {
                    filter: JSON.stringify({breakdown:{subSectors:[{breakdownRuleType:'CustomSector',includeOtherBucket:true,rule:{colPositionColumnType:'ALL',colTag:'sec_group',colTitle:'Security Group',colType:'String',compType:'EQUALS',compValues:['EQUITY','BND'],compValuesLabel:['EQUITY','BOND'],customSectorType:'Fund',ruleType:'Rule'},
                    title:' '}]},title: ' '}),
                    name: 'benchname',
                    adhocParams: {
                        'currency': 'JPY',
                        'date': {
                            'date': '01/01/2020',
                            'dateString': false
                        },
                        'fullName': 'Adhoc International Paper',
                        'isPortGroup': undefined,
                        'name': 'Adhoc IP',
                        'portMktNotional': 300000
                    },
                    holdingChanges: [
                        {
                            'addedDuringWhatIfInitialization': undefined,
                            'analyticsId': undefined,
                            'changeInCurrentFace': undefined,
                            'changeInDeltaAdjNMV': undefined,
                            'changeInMarketValue': undefined,
                            'changeInNotional': undefined,
                            'changeInParValue': undefined,
                            'changeInQuantity': undefined,
                            'changeInWeight': undefined,
                            'changeInWeightRelToMainPort': undefined,
                            'changeType': 'NewSecurity',
                            'convertFlag': undefined,
                            'isCashOffsetRequired': true,
                            'isChildChange': undefined,
                            'isNavNeutral': undefined,
                            'isNotionalCash': undefined,
                            'lineItem': 'cusip',
                            'newCurrentFace': undefined,
                            'newDeltaAdjNMV': undefined,
                            'newMV': undefined,
                            'newNotional': undefined,
                            'newParValue': undefined,
                            'newQuantity': undefined,
                            'newWeight': undefined,
                            'portfolioName': undefined,
                            'requiresBenchData': undefined,
                            'secDesc': undefined,
                            'tradeSize': undefined
                        }
                    ],
                    sendPortfolio: true
                },
                mainPortfolio: {
                    filter: JSON.stringify({breakdown:{subSectors:[{breakdownRuleType:'CustomSector',includeOtherBucket:true,rule:{colPositionColumnType:'ALL',colTag:'sec_group',colTitle:'Security Group',colType:'String',compType:'EQUALS',compValues:['EQUITY','BND'],compValuesLabel:['EQUITY','BOND'],customSectorType:'Fund',ruleType:'Rule'},
                    title:' '}]},title:' '}),
                    name: 'portname',
                    sendPortfolio: true
                }
            });
        });
    });

    it('should get optimization objective settings', () => {
        const optimizationSettings: OptimizationSettings = new OptimizationSettings();
        optimizationSettings.objectiveSettings.portfolioObjectives = [
            new StressScenarioPortfolioObjective({
                key: 'key1',
                weight: 1,
                stressScenario: {[SCEN_CODE]: 'scen1'},
                enabled: true
            }),
            new StressScenarioPortfolioObjective({
                key: 'key2',
                weight: 2,
                stressScenario: {[SCEN_CODE]: 'scen2'},
                enabled: false
            }),
            new PortfolioObjective({key: 'key3', weight: 3, enabled: true})
        ];

        expect(service.getOptimizationObjectiveSettings(optimizationSettings)).toEqual({
            portfolioObjectives: [{
                portfolioObjectiveType: 'key3',
                weight: 3
            }],
            stressScenarioPortfolioObjectives: [{
                portfolioObjectiveType: 'key1',
                weight: 1,
                stressScenario: 'scen1'
            }],
            objectivesType: OptimizationConstants.ACTIVE_OBJECTIVE_TYPE
        });

        const alphaScoreData = {
            key: 'key3',
            weight: 3,
            enabled: true,
            alphaScoreMeasure: {
                'columnTag': 'pct_mv',
                'positionColumnType': 'PORT',
                'columnKey': 'pct_mv_1'
            }
        };
        const alphaObjective: AlphaScorePortfolioObjective = new AlphaScorePortfolioObjective(alphaScoreData);
        optimizationSettings.objectiveSettings.portfolioObjectives = [alphaObjective];
        expect(service.getOptimizationObjectiveSettings(optimizationSettings)).toEqual({
            'alphaScorePortfolioObjectives': {
                isUploadAlpha: false,
                portfolioObjectiveType: 'key3',
                'rawAlphaScoreMeasure': {
                    'columnKey': 'pct_mv_1',
                    'columnTag': 'pct_mv',
                    'positionColumnType': 'PORT',
                },
                weight: 3
            },
            objectivesType: OptimizationConstants.ACTIVE_OBJECTIVE_TYPE,
            'portfolioObjectives': [],
            'stressScenarioPortfolioObjectives': []
        });

        // upload Alpha
        alphaObjective.alphaScoreMeasure = undefined;
        alphaObjective.uploadedAlpha.set('abc', 2.0).set('xyz', 3.0);
        alphaObjective.isUploadAlpha = true;
        optimizationSettings.objectiveSettings.portfolioObjectives = [alphaObjective];
        expect(service.getOptimizationObjectiveSettings(optimizationSettings)).toEqual({
            'alphaScorePortfolioObjectives': {
                isUploadAlpha: true,
                portfolioObjectiveType: 'key3',
                weight: 3,
                uploadedAlpha: {abc: 2.0, xyz: 3.0}
            },
            objectivesType: OptimizationConstants.ACTIVE_OBJECTIVE_TYPE,
            'portfolioObjectives': [],
            'stressScenarioPortfolioObjectives': []
        });
    });

    describe('should create portfolio constraint', () => {
        it('with undefined option values', () => {
            const constraint: Constraint = new Constraint();
            constraint.optionValues = undefined;
            constraint.constraintTag = 'constraintTag';
            expect(service.createPortfolioConstraint(constraint)).toEqual({
                optimizationPortfolioConstraint: 'constraintTag',
                constraintValue: null,
                unitType: null,
                isRelaxable: undefined
            });
        });

        it('with no option values', () => {
            const constraint: Constraint = new Constraint();
            constraint.optionValues = {};
            constraint.constraintTag = 'constraintTag';
            expect(service.createPortfolioConstraint(constraint)).toEqual({
                optimizationPortfolioConstraint: 'constraintTag',
                constraintValue: null,
                unitType: null,
                isRelaxable: undefined
            });
        });

        it('with option values', () => {
            const constraint: Constraint = new Constraint();
            constraint.optionValues = {
                ConstraintUnit: 'unit',
                [ConstraintOptionValueKey.VALUE]: 'value',
                [ConstraintOptionValueKey.LONG_POSITION_LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.LONG_POSITION_UPPER_BOUND]: 2,
                [ConstraintOptionValueKey.SHORT_POSITION_LOWER_BOUND]: 3,
                [ConstraintOptionValueKey.SHORT_POSITION_UPPER_BOUND]: 4,
                [ConstraintOptionValueKey.LOWER_BOUND]: 5,
                [ConstraintOptionValueKey.UPPER_BOUND]: 6
            };
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            expect(service.createPortfolioConstraint(constraint)).toEqual({
                optimizationPortfolioConstraint: 'constraintTag',
                constraintValue: 'value',
                unitType: 'unit',
                [ConstraintOptionValueKey.LONG_POSITION_LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.LONG_POSITION_UPPER_BOUND]: 2,
                [ConstraintOptionValueKey.SHORT_POSITION_LOWER_BOUND]: 3,
                [ConstraintOptionValueKey.SHORT_POSITION_UPPER_BOUND]: 4,
                [ConstraintOptionValueKey.LOWER_BOUND]: 5,
                [ConstraintOptionValueKey.UPPER_BOUND]: 6,
                isRelaxable: true,
                relaxationValue: 1
            });
        });

        it('with efficient frontier enabled', () => {
            const constraint: Constraint = new Constraint();
            constraint.optionValues = {
                ConstraintUnit: 'unit',
                [ConstraintOptionValueKey.VALUE]: [50, 100, 150],
            };
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            expect(service.createPortfolioConstraint(constraint)).toEqual({
                optimizationPortfolioConstraint: 'constraintTag',
                constraintValue: '50,100,150',
                unitType: 'unit',
                isRelaxable: true,
                relaxationValue: 1
            });
        });
    });

    describe('should create portfolio constraint', () => {
        it('with undefined option values', () => {
            const constraint: Constraint = new Constraint();
            constraint.optionValues = undefined;
            constraint.constraintTag = 'constraintTag';
            expect(service.createPortfolioConstraint(constraint)).toEqual({
                optimizationPortfolioConstraint: 'constraintTag',
                constraintValue: null,
                unitType: null,
                isRelaxable: undefined
            });
        });

        it('with no option values', () => {
            const constraint: Constraint = new Constraint();
            constraint.optionValues = {};
            constraint.constraintTag = 'constraintTag';
            expect(service.createPortfolioConstraint(constraint)).toEqual({
                optimizationPortfolioConstraint: 'constraintTag',
                constraintValue: null,
                unitType: null,
                isRelaxable: undefined
            });
        });

        it('with option values', () => {
            const constraint: Constraint = new Constraint();
            constraint.optionValues = {
                ConstraintUnit: 'unit',
                [ConstraintOptionValueKey.VALUE]: 'value',
                [ConstraintOptionValueKey.LONG_POSITION_LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.LONG_POSITION_UPPER_BOUND]: 2,
                [ConstraintOptionValueKey.SHORT_POSITION_LOWER_BOUND]: 3,
                [ConstraintOptionValueKey.SHORT_POSITION_UPPER_BOUND]: 4,
                [ConstraintOptionValueKey.LOWER_BOUND]: 5,
                [ConstraintOptionValueKey.UPPER_BOUND]: 6
            };
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            expect(service.createPortfolioConstraint(constraint)).toEqual({
                optimizationPortfolioConstraint: 'constraintTag',
                constraintValue: 'value',
                unitType: 'unit',
                [ConstraintOptionValueKey.LONG_POSITION_LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.LONG_POSITION_UPPER_BOUND]: 2,
                [ConstraintOptionValueKey.SHORT_POSITION_LOWER_BOUND]: 3,
                [ConstraintOptionValueKey.SHORT_POSITION_UPPER_BOUND]: 4,
                [ConstraintOptionValueKey.LOWER_BOUND]: 5,
                [ConstraintOptionValueKey.UPPER_BOUND]: 6,
                isRelaxable: true,
                relaxationValue: 1
            });
        });
    });

    describe('should create risk parity request', () => {
        it('create risk parity request', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const portfolio = new PortfolioWithPositions('PEP');
            // portfolio.riskParitySettings.setDefaultObjective();
            portfolio.riskParitySettings.filter = new CustomFilter();
            portfolio.riskParitySettings.filter.customSector = new CustomSector();
            portfolio.riskParitySettings.filter = new CustomFilter();
            portfolio.riskParitySettings.filter.customSector = new CustomSector();

            const columnSectorRule = new ColumnSectorRule();
            columnSectorRule.columnName = 'CUSIP';
            columnSectorRule.columnTag = 'cusip';
            columnSectorRule.comparisonType = 'Equals';
            portfolio.riskParitySettings.filter.customSector.rule = columnSectorRule;
            portfolio.riskParitySettings.filter.title = 'abc';

            portfolio.riskParitySettings.investmentUniverseSettings = new InvestmentUniverseSettings();

            const investmentUniversePortfolio = new InvestmentUniversePortfolio({
                id: '123',
                enabled: true,
                type: InvestmentUniverseConstants.PORTFOLIO,
                label: 'LEH_MBS',
                isFrozen: true
            });
            investmentUniversePortfolio.portfolio = 'IP';
            investmentUniversePortfolio.isBench = false;

            const investmentUniversePortfolio2 = new InvestmentUniversePortfolio({
                id: '456',
                enabled: true,
                type: InvestmentUniverseConstants.BENCHMARK,
                label: 'LEHMBSFWD',
                isFrozen: false
            });
            investmentUniversePortfolio.portfolio = 'IP';
            columnSectorRule.columnName = 'SECURITYGROUP';
            columnSectorRule.columnTag = 'secgroup';
            columnSectorRule.comparisonType = 'Equals';
            investmentUniversePortfolio2.filter = new CustomFilter();
            investmentUniversePortfolio2.filter.customSector = new CustomSector();
            investmentUniversePortfolio2.filter = new CustomFilter();
            investmentUniversePortfolio2.filter.customSector = new CustomSector();
            investmentUniversePortfolio2.filter.customSector.rule = columnSectorRule;
            investmentUniversePortfolio2.filter.title = 'abc';

            const investmentUniversePortfolio3 = new InvestmentUniversePortfolio({
                id: '456',
                enabled: true,
                type: InvestmentUniverseConstants.PORTFOLIO,
                label: 'TEST',
                isFrozen: false
            });
            investmentUniversePortfolio.portfolio = 'IP';
            investmentUniversePortfolio.isBench = true;

            portfolio.riskParitySettings.investmentUniverseSettings.investmentUniverse.push(investmentUniversePortfolio);
            portfolio.riskParitySettings.investmentUniverseSettings.investmentUniverse.push(investmentUniversePortfolio2);
            portfolio.riskParitySettings.investmentUniverseSettings.investmentUniverse.push(investmentUniversePortfolio3);
            portfolio.riskParitySettings.securityConstraints = new Map<string, Security>();
            portfolio.riskParitySettings.securityConstraints.set('abc', {riskContributionPercentage: 67});
            portfolio.portfolioRiskSettings = new RiskSettings();
            portfolio.benchmark = new Benchmark({name: 'bench'});
            portfolio.datePicker = new DateValue();
            const workspace = new Workspace();
            workspace.id = 12345;
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            const telemetryTrackSpy = jest.spyOn(TelemetryService, 'track');
            service.trackRiskBudgetingRunViaTelemetry(portfolio.riskParitySettings);
            expect(telemetryTrackSpy).toHaveBeenLastCalledWith(TelemetryActionConstants.USER_BEHAVIOUR.RISK_BUDGETING_DETAILS, new TelemetryRiskBudgetingParameters({'isScreeningEnabled': true, 'isSecurityConstraintApplied': true, 'riskBudgetingCase': 1, 'tierDefinitionInfo': new TelemetryTierDefinitionRiskBudgetingParameters({'definitionType': 'NAME', 'tierOne': undefined, 'tierThreeRatio': 0, 'tierTwo': undefined, 'tierTwoRatio': 0})}));
            expect(service.createOptoRequest(portfolio, false, false, false, true)).toEqual({
                'downloadROSrequest': false,
                'holdingChanges': [],
                'riskParitySettings': {
                    'investmentUniverseSettings': {
                        'benchmark': {
                            'name': 'NoneBenchName',
                            'sendPortfolio': false
                        },
                        'mainPortfolio': {
                            'name': 'PEP',
                            'sendPortfolio': false
                        },
                        'portfolios': {
                            'LEHMBSFWD': {
                                'filter': JSON.stringify({breakdown:{subSectors:[{breakdownRuleType:'CustomSector',includeOtherBucket:true,rule:{ruleType:'RuleGroup',ruleGroup:'AND',subRules:[{colTag:'secgroup',colTitle:'SECURITYGROUP',compType:'Equals',customSectorType:'Attributes',ruleType:'Rule'},{colTag:'secgroup','colTitle':'SECURITYGROUP',compType:'Does Not Equal',customSectorType:'Attributes',ruleType:'Rule'}]},
                                }]},title:'abc'})
                            },
                            'TEST': {
                                'filter': JSON.stringify({breakdown:{subSectors:[{breakdownRuleType:'CustomSector',includeOtherBucket:true,rule:{colTag:'secgroup',colTitle:'SECURITYGROUP',compType:'Does Not Equal',customSectorType:'Attributes',ruleType:'Rule'}}]},"title":"abc"})
                            }
                        },
                        'securities': {},
                    },
                    'objectiveSettings': {
                        'objectivesType': 'Active',
                        'portfolioObjectives': [
                            {
                                'portfolioObjectiveType': 'MINIMIZE_IDIO_RISK',
                                'weight': 1
                            },
                            {
                                'portfolioObjectiveType': 'MINIMIZE_SYSTEMATIC_RISK',
                                'weight': 1
                            }
                        ],
                        'stressScenarioPortfolioObjectives': []
                    },
                    'portfolioRiskSettings': {'riskMatrix': 1},
                    'riskParityCase': 0,
                    'securityConstraints': {'abc': 0.67},
                    'tierType': 0
                },
                'rules': null
            });
        });
    });

    describe('should create security constraint', () => {
        it('with no option values', () => {
            const constraint: Constraint = new Constraint();
            constraint.optionValues = {};
            constraint.constraintTag = 'constraintTag';
            expect(service.createSecurityConstraint(constraint)).toEqual({
                associatedListName: undefined,
                constraintValue: null,
                isRelaxable: undefined,
                optimizationSecurityConstraint: 'constraintTag',
                unitType: null
            });
        });

        it('with option values', () => {
            const constraint: Constraint = new Constraint();
            constraint.title = 'Market Value %',
                constraint.optionValues = {
                    securityList: 'securityList',
                    ConstraintUnit: 'unit',
                    [ConstraintOptionValueKey.VALUE]: 'value',
                    [ConstraintOptionValueKey.LOWER_BOUND]: 1,
                    [ConstraintOptionValueKey.UPPER_BOUND]: 2
                };
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            let data = {
                scalingFactor: 0.01
            };
            constraint.columnFormat = new NumericColumnFormat(data);
            expect(service.createSecurityConstraint(constraint)).toEqual({
                associatedListName: 'securityList',
                constraintValue: 'value',
                isRelaxable: true,
                optimizationSecurityConstraint: 'constraintTag',
                relaxationValue: 1,
                unitType: 'unit',
                [ConstraintOptionValueKey.LOWER_BOUND]: 0.01,
                [ConstraintOptionValueKey.UPPER_BOUND]: 0.02,
            });

            const securities = new Map<string, Security>();
            const constraint1: Constraint = new Constraint();
            constraint1.title = 'Performance';
            securities.set('Cusip', {currentValue: 0, cusip: '', newValue: 0});
            constraint1.optionValues = {
                securityList: 'securityList',
                ConstraintUnit: 'unit',
                [ConstraintOptionValueKey.VALUE]: 'value',
                [ConstraintOptionValueKey.LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.UPPER_BOUND]: 2,
                selectedSecurities: securities
            };
            constraint1.isRelaxable = true;
            constraint1.relaxationValue = 1;
            constraint1.constraintTag = 'constraintTag';
            data = {
                scalingFactor: null
            };
            constraint1.columnFormat = new NumericColumnFormat(data);
            expect(service.createSecurityConstraint(constraint1)).toEqual({
                associatedListName: 'securityList',
                optimizationSecurityConstraint: 'constraintTag',
                constraintValue: 'value',
                unitType: 'unit',
                [ConstraintOptionValueKey.LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.UPPER_BOUND]: 2,
                isRelaxable: true,
                relaxationValue: 1
            });

            const filter = new CustomFilter();
            const constraint2: Constraint = new Constraint();
            constraint2.title = 'Market Value %';
            filter.title = 'Test Filter';
            constraint2.optionValues = {
                securityConstraintSubsection: ConstraintOptionSecurityListSubsectionEnum.FILTER,
                securityConstraintFilter: filter,
                ConstraintUnit: 'unit',
                [ConstraintOptionValueKey.VALUE]: 'value',
                [ConstraintOptionValueKey.LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.UPPER_BOUND]: 2,
                selectedSecurities: securities
            };
            constraint2.isRelaxable = true;
            constraint2.relaxationValue = 1;
            constraint2.constraintTag = 'constraintTag';
            data = {
                scalingFactor: null
            };
            constraint2.columnFormat = new NumericColumnFormat(data);
            expect(service.createSecurityConstraint(constraint2)).toEqual({
                filter: '{"title":"Test Filter"}',
                optimizationSecurityConstraint: 'constraintTag',
                constraintValue: 'value',
                unitType: 'unit',
                [ConstraintOptionValueKey.LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.UPPER_BOUND]: 2,
                isRelaxable: true,
                relaxationValue: 1
            });
            constraint2.optionValues.securityConstraintFilter = {title: 'Test Filter'};
            expect(service.createSecurityConstraint(constraint2)).toEqual({
                filter: '{"title":"Test Filter"}',
                optimizationSecurityConstraint: 'constraintTag',
                constraintValue: 'value',
                unitType: 'unit',
                [ConstraintOptionValueKey.LOWER_BOUND]: 1,
                [ConstraintOptionValueKey.UPPER_BOUND]: 2,
                isRelaxable: true,
                relaxationValue: 1
            });
        });
    });

    describe('should create sector constraint', () => {
        it('with no option values', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const constraint: Constraint = new Constraint();
            const breakdown: Breakdown = new Breakdown();
            constraint.optionValues = {
                breakdownTree: breakdown,
                filter: breakdown,
                sectorConstraintType: 'all'
            };
            expect(service.createSectorConstraint(constraint)).toEqual({
                boundRelativeTo: null,
                boundType: null,
                upperBound: null,
                upperBoundOperator: null,
                lowerBound: null,
                lowerBoundOperator: null,
                breakdownTree: JSON.stringify(breakdown.serializeFullContent()),
                filterCriteria: JSON.stringify(breakdown.serializeFullContent()),
                optimizationSectorConstraint: null,
                positionColumnType: null,
                isFilter: true,
                isBreakdown: true,
                isRelaxable: undefined,
                missingDataHandling: null,
                optionValues: null
            });
        });

        it('with option values', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const constraint: Constraint = new Constraint();
            const breakdown: Breakdown = new Breakdown();
            const colConfig = new ColumnConfig();
            constraint.title = 'Market Value %',
                constraint.optionValues = {
                    sectorConstraintType: ONE_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    filter: breakdown,
                    stressPnlSetting: 'A::B',
                    ConstraintMissingData: 'applyDNTConstraint'
                };
            constraint.columnConfig = colConfig;
            const colOption = new TempAlignmentScenariosColumnOption();
            colOption.initialize();
            colConfig.optionValues = [colOption];
            let data = {
                scalingFactor: 0.01
            };
            constraint.columnFormat = new NumericColumnFormat(data);
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            constraint.positionType = 'PORT';
            expect(service.createSectorConstraint(constraint)).toEqual({
                boundRelativeTo: null,
                boundType: null,
                upperBoundOperator: null,
                upperBound: 0.02,
                lowerBoundOperator: null,
                lowerBound: 0.01,
                filterCriteria: JSON.stringify(breakdown.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE)),
                breakdownTree: null,
                optimizationSectorConstraint: 'constraintTag',
                positionColumnType: 'PORT',
                isFilter: true,
                isBreakdown: false,
                isRelaxable: true,
                relaxationValue: 1,
                missingDataHandling: 'applyDNTConstraint',
                scenarioList: [
                    {
                        scenCode: 'A::B',
                        type: 'NamedScenario'
                    }
                ],
                optionValues: {
                    "optionValues": {
                        "scenarioOptions": [],
                        "targetTypes": [
                            "TA_METRIC_CODE_PRIORITY"
                        ]
                    }
                },
            });

            const constraint1: Constraint = new Constraint();
            const breakdown1: Breakdown = new Breakdown();
            const option = new CollapsedLookthroughColumnOption();
            option.lookthroughSettings.ltSecurityTypes.push('FUND');
            option.lookthroughSettings.ltSecurityTypes.push('ETF');
            const serialized = option.serialize();
            constraint1.title = 'Performance',
                constraint1.optionValues = {
                    sectorConstraintType: ONE_TYPE,
                    RelativeAbsolute: RELATIVE,
                    PortBench: 'PORTFOLIO',
                    LowerBoundOperators: '+(ADDITION)',
                    UpperBoundOperators: 'X(MULTIPLICATION)',
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    ConstraintMissingData: 'setValueZero',
                    filter: breakdown,
                    collapsedLookthroughColumnOption: new CollapsedLookthroughColumnOption(serialized)
                };
            constraint1.isRelaxable = true;
            constraint1.relaxationValue = 1;
            constraint1.constraintTag = 'constraintTag';
            data = {
                scalingFactor: 0.001
            };
            constraint1.columnFormat = new NumericColumnFormat(data);
            constraint1.optionValues.customAggregation = new CustomAggregationColumnOption({subtotalType: 2, weightType: 'PORT'});
            expect(service.createSectorConstraint(constraint1)).toEqual({
                boundRelativeTo: 'PORTFOLIO',
                boundType: RELATIVE,
                upperBoundOperator: 'X(MULTIPLICATION)',
                upperBound: 0.002,
                lowerBoundOperator: '+(ADDITION)',
                lowerBound: 0.001,
                missingDataHandling: 'setValueZero',
                collapsedLT: {
                    'ltSecurityTypes': 'FUND,ETF'
                },
                filterCriteria: JSON.stringify(breakdown1.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE)),
                breakdownTree: null,
                optimizationSectorConstraint: 'constraintTag',
                positionColumnType: null,
                isFilter: true,
                isBreakdown: false,
                isRelaxable: true,
                relaxationValue: 1,
                subtotalType: 2,
                weightType: 'PORT',
                excludeNullValues: true,
                optionValues: null
            });
        });

        it('with option values efficient enabled using range 1:4', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const constraint: Constraint = new Constraint();
            const breakdown: Breakdown = new Breakdown();
            constraint.title = 'Performance',
                constraint.optionValues = {
                    sectorConstraintType: ONE_TYPE,
                    RelativeAbsolute: RELATIVE,
                    PortBench: 'PORTFOLIO',
                    LowerBoundOperators: '+(ADDITION)',
                    UpperBoundOperators: 'X(MULTIPLICATION)',
                    ConstraintLowerBound: '1:4',
                    filter: breakdown,
                    breakdownTree: breakdown,
                };
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            expect(service.createSectorConstraint(constraint)).toEqual({
                boundRelativeTo: 'PORTFOLIO',
                boundType: RELATIVE,
                upperBoundOperator: 'X(MULTIPLICATION)',
                lowerBoundOperator: '+(ADDITION)',
                lowerBound: '1:4',
                upperBound: null,
                filterCriteria: JSON.stringify(breakdown.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE)),
                breakdownTree: null,
                missingDataHandling: null,
                optimizationSectorConstraint: 'constraintTag',
                positionColumnType: null,
                isFilter: true,
                isBreakdown: false,
                isRelaxable: true,
                relaxationValue: 1,
                optionValues: null
            });
        });

        it('with valid deprecated active sector constraints', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const constraint: Constraint = new Constraint();
            const breakdown: Breakdown = new Breakdown();
            constraint.title = 'Performance';
            constraint.optionValues = {
                sectorConstraintType: ONE_TYPE,
                RelativeAbsolute: 'ABSOLUTE',
                LowerBoundOperators: 'ADDITION',
                UpperBoundOperators: 'ADDITION',
                ConstraintLowerBound: '-5',
                ConstraintUpperBound: '5'
            };
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            constraint.positionType = 'ACTIVE';
            expect(service.createSectorConstraint(constraint)).toEqual({
                boundRelativeTo: 'Benchmark',
                boundType: RELATIVE,
                upperBoundOperator: 'ADDITION',
                lowerBoundOperator: 'ADDITION',
                lowerBound: -5,
                upperBound: 5,
                filterCriteria: null,
                breakdownTree: null,
                missingDataHandling: null,
                optimizationSectorConstraint: 'constraintTag',
                positionColumnType: 'PORT',
                isFilter: true,
                isBreakdown: false,
                isRelaxable: true,
                relaxationValue: 1,
                optionValues: null
            });
        });

        it('with option values containing climate constraints', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const constraint: Constraint = new Constraint();
            const breakdown: Breakdown = new Breakdown();
            const tempOptionValues = new TempAlignmentScenariosColumnOption();
            tempOptionValues.climateScenario = [new ClimateScenario()];
            tempOptionValues.climateScenario[0].scenarioType = '4 Degree';
            tempOptionValues.climateScenario[0].scenarioTypeDisplayName = 'Targets Not Applied';
            tempOptionValues.climateScenario[0].scenarioYear = '2040';
            tempOptionValues.climateScenario[0].scenarioYearDisplayName = '2040';
            tempOptionValues.targetTypes = ['TA_METRIC_CODE_PRIORITY'];
            constraint.title = 'Temperature Alignment',
                constraint.optionValues = {
                    taClimateScenarioSettings: tempOptionValues,
                    sectorConstraintType: ONE_TYPE,
                    RelativeAbsolute: RELATIVE,
                    PortBench: 'PORTFOLIO',
                    LowerBoundOperators: '+(ADDITION)',
                    UpperBoundOperators: 'X(MULTIPLICATION)',
                    ConstraintLowerBound: '1:4',
                    filter: breakdown
                };
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            expect(service.createSectorConstraint(constraint)).toEqual({
                boundRelativeTo: 'PORTFOLIO',
                boundType: RELATIVE,
                upperBoundOperator: 'X(MULTIPLICATION)',
                lowerBoundOperator: '+(ADDITION)',
                missingDataHandling: null,
                lowerBound: '1:4',
                upperBound: null,
                scenarioOptions: [
                    {
                        'scenarioType': '4 Degree',
                        'scenarioTypeDisplayName': 'Targets Not Applied',
                        'scenarioYear': '2040',
                        'scenarioYearDisplayName': '2040',
                        'scenarioPercentile': 'mean',
                    }
                ],
                targetTypes: ['TA_METRIC_CODE_PRIORITY'],
                filterCriteria: JSON.stringify(breakdown.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE)),
                breakdownTree: null,
                optimizationSectorConstraint: 'constraintTag',
                positionColumnType: null,
                isFilter: true,
                isBreakdown: false,
                isRelaxable: true,
                relaxationValue: 1,
                optionValues: null
            });
        });

        it('with option values efficient enabled using array [1,3,5]', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const constraint: Constraint = new Constraint();
            const breakdown: Breakdown = new Breakdown();
            constraint.title = 'Performance',
                constraint.optionValues = {
                    sectorConstraintType: ONE_TYPE,
                    RelativeAbsolute: RELATIVE,
                    PortBench: 'PORTFOLIO',
                    LowerBoundOperators: '+(ADDITION)',
                    UpperBoundOperators: 'X(MULTIPLICATION)',
                    ConstraintUpperBound: [1, 3, 5],
                    filter: breakdown
                };
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            expect(service.createSectorConstraint(constraint)).toEqual({
                boundRelativeTo: 'PORTFOLIO',
                boundType: RELATIVE,
                upperBoundOperator: 'X(MULTIPLICATION)',
                lowerBoundOperator: '+(ADDITION)',
                lowerBound: null,
                upperBound: '1,3,5',
                missingDataHandling: null,
                filterCriteria: JSON.stringify(breakdown.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE)),
                breakdownTree: null,
                optimizationSectorConstraint: 'constraintTag',
                positionColumnType: null,
                isFilter: true,
                isBreakdown: false,
                isRelaxable: true,
                relaxationValue: 1,
                optionValues: null
            });
        });
    });

    describe('should create factor constraint', () => {
        it('with no option values', () => {
            const constraint: Constraint = new Constraint();
            expect(service.createFactorConstraint(constraint)).toEqual({
                upperBound: null,
                lowerBound: null,
                quickFactorBlock: null,
                factors: null,
                optimizationFactorConstraint: null
            });
        });

        it('with option values', () => {
            const constraint: Constraint = new Constraint();

            // quick factor block non-empty
            constraint.optionValues = {
                quickFactorBlock: 'abc',
                ConstraintLowerBound: 1,
                ConstraintUpperBound: 2,
            };
            let data = {
                scalingFactor: 0.01
            };
            constraint.columnFormat = new NumericColumnFormat(data);
            constraint.isRelaxable = true;
            constraint.relaxationValue = 1;
            constraint.constraintTag = 'constraintTag';
            constraint.positionType = 'PORT';
            expect(service.createFactorConstraint(constraint)).toEqual({
                upperBound: 0.02,
                lowerBound: 0.01,
                quickFactorBlock: 'abc',
                factors: null,
                optimizationFactorConstraint: 'constraintTag',
                isRelaxable: true,
                relaxationValue: 1,
                positionColumnType: 'PORT'
            });

            const constraint1: Constraint = new Constraint();
            constraint1.optionValues = {
                quickFactorBlock: 'abc',
                ConstraintLowerBound: 1,
                ConstraintUpperBound: 2,
            };
            data = {
                scalingFactor: 0.001
            };
            constraint1.columnFormat = new NumericColumnFormat(data);
            constraint1.isRelaxable = true;
            constraint1.relaxationValue = 1;
            constraint1.constraintTag = 'constraintTag';
            expect(service.createFactorConstraint(constraint1)).toEqual({
                upperBound: 0.002,
                lowerBound: 0.001,
                quickFactorBlock: 'abc',
                factors: null,
                optimizationFactorConstraint: 'constraintTag',
                isRelaxable: true,
                relaxationValue: 1
            });

            // factor tag list non-empty
            constraint.optionValues.quickFactorBlock = '';
            constraint.optionValues.factorTagList = ', ,abc,,bcd   ';
            expect(service.createFactorConstraint(constraint)).toEqual({
                upperBound: 0.02,
                lowerBound: 0.01,
                quickFactorBlock: null,
                factors: [', ,abc,,bcd'],
                optimizationFactorConstraint: 'constraintTag',
                isRelaxable: true,
                relaxationValue: 1,
                positionColumnType: 'PORT'
            });
        });
    });

    describe('should get bench name', () => {
        it('should return none if none bench', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.benchmark = {
                name: BenchmarkConstants.NONE_BENCH
            };
            expect(service.getBenchName(portfolio)).toBe(BenchmarkConstants.NoneBenchName);
        });

        it('should return aggregate if group aggreagte', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.benchmark = {
                name: BenchmarkConstants.GROUP_AGGREGATE
            };
            expect(service.getBenchName(portfolio)).toBe(BenchmarkConstants.BENCH_AGGREGATE);
        });

        it('should return aggregate sec if group aggreate sec', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.benchmark = {
                name: BenchmarkConstants.GROUP_AGGREGATE_SEC
            };
            expect(service.getBenchName(portfolio)).toBe(BenchmarkConstants.BENCH_AGGREGATE_SEC);
        });

        it('should return bench name otherwise', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.benchmark = {
                name: 'bench name'
            };
            expect(service.getBenchName(portfolio)).toBe('bench name');
        });

        // test case for portfolio filter
        it('should have filter and filter Target)', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.datePicker = new DateValue();
            portfolio.datePicker.date = '01/02/2020';
            portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
            portfolio.portfolioRiskSettings = new RiskSettings();
            portfolio.portfolioRiskSettings.exposureRiskSettings = new ExposureSettings();
            portfolio.portfolioRiskSettings.exposureRiskSettings.riskModel = 'DEFAULT';
            portfolio.filter = new CustomFilter({'title': 'abc'});
            portfolio.filter.customSector = new CustomSector();
            const rule: ColumnSectorRule = new ColumnSectorRule();
            rule.columnTag = 'sec_group';
            rule.comparisonType = 'equals';
            rule.comparisonValues = ['ABS'];
            portfolio.filter.customSector.rule = rule;
            portfolio.applyFilterTo = 'BOTH';

            const  request  = service.createOptoRequest(portfolio);
            expect(request.filter).toMatch(JSON.stringify({breakdown:{subSectors:[{breakdownRuleType:'CustomSector',includeOtherBucket:true,rule:{colTag:'sec_group',compType:'equals',compValues:['ABS'],customSectorType:'Attributes',ruleType:'Rule'}}]}, "title":"abc"}));
            expect(request.filterTargetType).toEqual('BOTH');
        });
    });

    describe('Composite Asset tests', () => {
        it('should create opto request', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.datePicker = new DateValue();
            portfolio.datePicker.date = '01/02/2020';
            portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
            portfolio.portfolioRiskSettings = new RiskSettings();
            portfolio.portfolioRiskSettings.exposureRiskSettings = new ExposureSettings();
            portfolio.portfolioRiskSettings.exposureRiskSettings.riskModel = 'DEFAULT';
            portfolio.filter = new CustomFilter({'title': 'abc'});
            portfolio.filter.customSector = new CustomSector();
            const rule: ColumnSectorRule = new ColumnSectorRule();
            rule.columnTag = 'sec_group';
            rule.comparisonType = 'equals';
            rule.comparisonValues = ['ABS'];
            portfolio.filter.customSector.rule = rule;
            portfolio.applyFilterTo = 'BOTH';
            portfolio.optimizationType = OptimizationTypeEnum.MEAN_VARIANCE_SECTOR;
            portfolio.optimizationSettings.breakdownTree = new Breakdown('test tree');

            const  request  = service.createOptoRequest(portfolio);
            expect(request.optimizationSettings.breakdownTree).toEqual(JSON.stringify(portfolio.optimizationSettings.breakdownTree.serialize()));
            expect(request.optimizationSettings.isCompositeAsset).toBeTruthy();
        });
    });

    describe('efficient frontier run tests', () => {
        it('should throw error if not portfolio', done => {
            jest.spyOn(optimizationDataService, 'getPortfolioWithPositions$').mockReturnValue(of(undefined));
            service.efficientFrontierRun$().subscribe(
                () => {
                },
                (error: any) => {
                    expect(error.error).toEqual(new Error(DEFAULT_EFFICIENT_FRONTIER_ERROR_MESSAGE));
                    done();
                });
        });

        it('test for different responses - efficient frontier trades', fakeAsync(() => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            const postSpy = jest.spyOn(http2BmsService, 'post$');

            jest.spyOn(optimizationDataService, 'getPortfolioWithPositions$').mockReturnValue(of(portfolio));
            jest.spyOn(service, 'createOptoRequest').mockReturnValue({
                optimizationSettings: {
                    efficientFrontier: {
                        iterations: 10
                    }
                }
            });

            // error
            postSpy.mockReturnValue(throwError(new Error('dummy error')));
            service.efficientFrontierRun$()
                .subscribe(
                    value => {
                    },
                    error => expect(error.message === 'dummy error').toBeTruthy());
            tick();

            // null
            postSpy.mockReturnValue(of(null));
            service.efficientFrontierRun$()
                .subscribe(
                    value => {
                    },
                    error => expect(error.error.message === AlertConstants.EFFICIENT_FRONTIER_BAD_RESPONSE).toBeTruthy());
            tick();

            // empty trades
            postSpy.mockReturnValue(of({}));
            service.efficientFrontierRun$()
                .subscribe(
                    value => {
                    },
                    error => expect(error.error.message === AlertConstants.EFFICIENT_FRONTIER_BAD_RESPONSE).toBeTruthy()
                );
            tick();

            // server failure message
            postSpy.mockReturnValue(of({data: {optoRunStatus: ''}, message: 'server failure', status: 'FAILURE'}));
            service.efficientFrontierRun$()
                .subscribe(
                    value => {
                    },
                    error => expect(error.error.message === 'server failure').toBeTruthy()
                );
            tick();

            // non empty trades
            const efficientFrontierTrades = {data: [{}]};
            postSpy.mockReturnValue(of(efficientFrontierTrades));
            service.efficientFrontierRun$()
                .subscribe(value => expect(value.portfolio === portfolio && value.efficientFrontierTradesData === efficientFrontierTrades.data).toBeTruthy());
            tick();
        }));
    });
});
