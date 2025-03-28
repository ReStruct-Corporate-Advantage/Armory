import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OptimizationSettingsModalComponent} from './optimization-settings-modal.component';
import {OPTIMIZATION_SETTINGS_SERVICE} from './tokens/optimization-settings-service.token';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {OptimizationSettingsService} from './service/optimization-settings.service';
import {TestComponent, TestModule} from './test-data/mock-data.testutils';
import {ReactiveFormsModule} from '@angular/forms';
import {SettingsTab} from './models/settings-tab-data.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {NotificationService} from '@services/notification';
import {
    DUPLICATE_LABEL_MESSAGE, EMPTY_BREAKDOWN_SECTOR_CONSTRAINT_MESSAGE,
    EMPTY_FACTOR_TAG_OR_BLOCK_MESSAGE,
    EMPTY_FILTER_SECTOR_CONSTRAINT_MESSAGE,
    EMPTY_LABEL_MESSAGE,
    EMPTY_OBJECTIVE_MESSAGE,
    EMPTY_PORTFOLIO_MESSAGE,
    EMPTY_SECURITY_LIST_MESSAGE,
    OPTIMIZATION_EFFICIENT_FRONTIER_SECTOR_CONFIG_ERROR
} from '@optimization-settings/constants/optimization-notification-messages.constants';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {SETTING_NAME_INVESTMENT_UNIVERSE} from '@optimization-settings/constants/settings-tab-metadata.constants';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {OptimizationConstants} from '@constants/optimization.constants';
import {ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';

describe('OptimizationSettingsModalComponent', () => {
    let component: OptimizationSettingsModalComponent;
    let fixture: ComponentFixture<OptimizationSettingsModalComponent>;
    let optimizationSettingsService: OptimizationSettingsService;

    const mockSettings = [
        {
            name: 'Test',
            component: TestComponent,
            inputs: new Map([['test', {}]])
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestModule, ReactiveFormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [OptimizationSettingsModalComponent],
            providers: [
                {
                    provide: OPTIMIZATION_SETTINGS_SERVICE,
                    useValue: {
                        loadSettings: jest.fn(() => {
                            return mockSettings;
                        }),
                        saveSettings: jest.fn()
                    }
                },
                {
                    provide: NotificationService,
                    useValue: {
                        error: jest.fn(() => {})
                    }
                }
            ]
        });

        fixture = TestBed.createComponent(OptimizationSettingsModalComponent);
        component = fixture.componentInstance;
        optimizationSettingsService = TestBed.inject(OPTIMIZATION_SETTINGS_SERVICE);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('should assign values on init', () => {
        it('should set active index if exists', () => {
            const settingsTabs: SettingsTab[] = [{
                name: 'name1',
                type: 'type1',
                component: undefined
            }, {
                name: 'name2',
                type: 'type2',
                component: undefined
            }];
            jest.spyOn(optimizationSettingsService, 'loadSettings').mockReturnValue(settingsTabs);
            component.type = 'type2';

            component.ngOnInit();
            expect(component.settingsTabs).toEqual(settingsTabs);
            expect(component.settingsTabData).toEqual([{label: 'name1', uid: '0'}, {label: 'name2', uid: '1'}]);
            expect(component.activeIndex).toEqual(1);
        });

        it('should default to first if does not exist', () => {
            const settingsTabs: SettingsTab[] = [{
                name: 'name1',
                type: 'type1',
                component: undefined
            }, {
                name: 'name2',
                type: 'type2',
                component: undefined
            }];
            jest.spyOn(optimizationSettingsService, 'loadSettings').mockReturnValue(settingsTabs);
            component.type = 'type3';

            component.ngOnInit();
            expect(component.settingsTabs).toEqual(settingsTabs);
            expect(component.settingsTabData).toEqual([{label: 'name1', uid: '0'}, {label: 'name2', uid: '1'}]);
            expect(component.activeIndex).toEqual(0);
        });
    });

    describe('should close modal', () => {
        beforeEach(() => {
            component.settingsTabs = [
                {
                    inputs: new Map<string, any>()
                } as any,
                {
                    inputs: new Map<string, any>()
                } as any,
                {
                    inputs: new Map<string, any>()
                } as any
            ];
        });

        it('should close and save', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            // add something to investment universe that is enabled
            const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
            investmentUniverseSettings.investmentUniverse.push(new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true}));
            component.settingsTabs[0].inputs.set(SETTING_NAME_INVESTMENT_UNIVERSE, investmentUniverseSettings);
            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledWith(true);

        });

        it('should close without save', () => {
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');
            component.closeModal(false);

            expect(optimizationSettingsService.saveSettings).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledWith(false);
        });

        it('should show notification - no valid factor tag or block', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            const optoSettings: OptimizationSettings = new OptimizationSettings();
            optoSettings.factorConstraints = [
                new Constraint({
                    optionValues: {
                        quickFactorBlock: '',
                        factorTagList: 'a'
                    }
                }),
                new Constraint({
                    optionValues: {
                        quickFactorBlock: '',
                        factorTagList: ''
                    }
                })
            ];

            // add something to investment universe that is enabled
            optoSettings.investmentUniverseSettings.investmentUniverse.push(new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true}));
            component.settingsTabs[0].inputs.set(SETTING_NAME_INVESTMENT_UNIVERSE, optoSettings.investmentUniverseSettings);

            component.settingsTabs[2].inputs.set('parentConfig', optoSettings);
            jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});

            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(0);
            expect(component.notificationService.error).toHaveBeenCalledWith(EMPTY_FACTOR_TAG_OR_BLOCK_MESSAGE, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
        });


        it('should show notification - No objective key selected for one or more objectives', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            const objectiveSettings: ObjectiveSettings = new ObjectiveSettings();
            objectiveSettings.portfolioObjectives = [
                new PortfolioObjective({
                    weight: 1,
                    enabled: true,
                    key: 'MINIMIZE_RISK'
                }),
                new PortfolioObjective({
                    weight: 1,
                    enabled: true,
                    key: ''
                })
            ];

            // add something to investment universe that is enabled
            const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
            investmentUniverseSettings.investmentUniverse.push(new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true}));
            component.settingsTabs[0].inputs.set(SETTING_NAME_INVESTMENT_UNIVERSE, investmentUniverseSettings);

            component.settingsTabs[1].inputs.set('objectiveSettings', objectiveSettings);
            jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});

            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(0);
            expect(component.notificationService.error).toHaveBeenCalledWith(EMPTY_OBJECTIVE_MESSAGE, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
        });

        it('should show notification - No securities specified for one or more investment universe rows', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
            investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniverseSecurity({
                    label: 'label',
                    securities: []
                }),
                new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true})
            ];
            component.settingsTabs[0].inputs.set('investmentUniverseSettings', investmentUniverseSettings);
            jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});

            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(0);
            expect(component.notificationService.error).toHaveBeenCalledWith(EMPTY_SECURITY_LIST_MESSAGE, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
        });

        it('should show notification - No portfolio specified for one or more investment universe rows', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
            investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniversePortfolio({
                    label: 'label',
                    portfolio: ''
                }),
                new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true})
            ];
            component.settingsTabs[0].inputs.set('investmentUniverseSettings', investmentUniverseSettings);
            jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});

            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(0);
            expect(component.notificationService.error).toHaveBeenCalledWith(EMPTY_PORTFOLIO_MESSAGE, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
        });

        it('should show notification - Empty label for one or more investment universe rows', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
            investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniversePortfolio({
                    label: '',
                }),
                new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true})
            ];
            component.settingsTabs[0].inputs.set('investmentUniverseSettings', investmentUniverseSettings);
            jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});

            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(0);
            expect(component.notificationService.error).toHaveBeenCalledWith(EMPTY_LABEL_MESSAGE, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
        });

        it('should show notification - Duplicate label for one or more investment universe rows', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
            investmentUniverseSettings.investmentUniverse = [
                new InvestmentUniversePortfolio({ label: '2', portfolio: 'A', enabled: true}),
                new InvestmentUniversePortfolio({ label: '2', portfolio: 'B', enabled: true}),
                new InvestmentUniversePortfolio({ label: '3', portfolio: 'C', enabled: true}),
                new InvestmentUniversePortfolio({ label: '3', portfolio: 'D', enabled: true})
            ];
            component.settingsTabs[0].inputs.set('investmentUniverseSettings', investmentUniverseSettings);
            jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});

            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(0);
            expect(component.notificationService.error).toHaveBeenCalledWith(DUPLICATE_LABEL_MESSAGE, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
        });

        it('should show notification - No filter selected for one or more sector constraints', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            const optoSettings: OptimizationSettings = new OptimizationSettings();
            optoSettings.sectorConstraints = [
                new Constraint({
                    optionValues: {
                        sectorConstraintType: 'one'
                    }
                }),
                new Constraint({
                    optionValues: {
                        sectorConstraintType: 'one',
                        filter: new CustomFilter()
                    }
                }),
                new Constraint({
                    optionValues: {
                        sectorConstraintType: 'one'
                    }
                })
            ];
            component.settingsTabs[2].inputs.set('parentConfig', optoSettings);

            // add something to investment universe that is enabled
            const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
            investmentUniverseSettings.investmentUniverse.push(new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true}));
            component.settingsTabs[0].inputs.set(SETTING_NAME_INVESTMENT_UNIVERSE, investmentUniverseSettings);

            jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});

            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(0);
            expect(component.notificationService.error).toHaveBeenCalledWith(EMPTY_FILTER_SECTOR_CONSTRAINT_MESSAGE, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
        });

        it('should show notification - No breakdown selected for one or more all sector type constraints', () => {
            const saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
            saveSettingsSpy.mockReturnValue(true);
            const emitSpy = jest.spyOn(component.modalClosed, 'emit');

            const optoSettings: OptimizationSettings = new OptimizationSettings();
            optoSettings.sectorConstraints = [
                new Constraint({
                    optionValues: {
                        sectorConstraintType: 'all'
                    }
                })
            ];
            component.settingsTabs[2].inputs.set('parentConfig', optoSettings);

            // add something to investment universe that is enabled
            const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
            investmentUniverseSettings.investmentUniverse.push(new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true}));
            component.settingsTabs[0].inputs.set(SETTING_NAME_INVESTMENT_UNIVERSE, investmentUniverseSettings);

            jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});

            component.closeModal(true);

            expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
            expect(emitSpy).toHaveBeenCalledTimes(0);
            expect(component.notificationService.error).toHaveBeenCalledWith(EMPTY_BREAKDOWN_SECTOR_CONSTRAINT_MESSAGE, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
        });

        describe('Test Efficient Enabled Constraint', () => {
            let saveSettingsSpy;
            let emitSpy;
            const optoSettings: OptimizationSettings = new OptimizationSettings();
            optoSettings.efficientEnabledConstraints.add(
                new Constraint({
                    optionValues: {
                        ConstraintLowerBound: [1, 5, 10],
                        ConstraintUpperBound: [5, 10, 15]
                    }
                })
            );
            beforeEach(() => {
                saveSettingsSpy = jest.spyOn(optimizationSettingsService, 'saveSettings');
                saveSettingsSpy.mockReturnValue(true);
                emitSpy = jest.spyOn(component.modalClosed, 'emit');
                component.settingsTabs[2].inputs.set('parentConfig', optoSettings);

                // add something to investment universe that is enabled
                const investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
                investmentUniverseSettings.investmentUniverse.push(new InvestmentUniversePortfolio({label: 'a1', portfolio: 'port1', enabled: true}));
                component.settingsTabs[0].inputs.set(SETTING_NAME_INVESTMENT_UNIVERSE, investmentUniverseSettings);

                jest.spyOn(component.notificationService, 'error').mockImplementation(() => {});
            });


            it('should show notification - if both lower and upper bound are specified as array for efficient enabled sector constraints', () => {

                component.closeModal(true);

                expect(saveSettingsSpy).toHaveBeenCalledTimes(0);
                expect(emitSpy).toHaveBeenCalledTimes(0);
                expect(component.notificationService.error).toHaveBeenCalledWith(OPTIMIZATION_EFFICIENT_FRONTIER_SECTOR_CONFIG_ERROR, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
                expect(optoSettings.isEfficientFrontierEnabled).toBeFalsy();
            });

            it('if only lower or upper bound are specified as array for efficient enabled sector constraints', () => {
                optoSettings.efficientEnabledConstraints.clear();
                optoSettings.efficientEnabledConstraints.add(
                    new Constraint({
                        enabled: true,
                        optionValues: {
                            ConstraintLowerBound: 1,
                            ConstraintUpperBound: [2, 5, 10]
                        }
                    })
                );
                component.closeModal(true);

                expect(optoSettings.iterationType).toEqual(OptimizationConstants.PRE_DEFINED_ITERATION_TYPE);
                expect(optoSettings.iterations).toEqual(3);
                expect(saveSettingsSpy).toHaveBeenCalledTimes(1);
                expect(emitSpy).toHaveBeenCalledTimes(1);
                expect(optoSettings.isEfficientFrontierEnabled).toBeTruthy();
            });
        });

    });
});
