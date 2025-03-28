import {InvestmentUniverseItemBase} from '../investmentUniverse/investment-universe-item-base.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {StressScenarioPortfolioObjective} from '../objectives/stress-scenario-portfolio-objective.model';
import {InvestmentUniversePortfolio} from '../investmentUniverse/investment-universe-portfolio.model';
import {OptimizationSettings} from './optimization-settings.model';
import {PortfolioObjective} from '../objectives/portfolio-objective.model';
import {Constraint} from '../constraints/constraint.model';
import {cloneDeep} from 'lodash';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {DefinitionsStore} from '@stores/definitions.store';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {ALL_TYPE} from '@optimization-settings/constraints-settings/constants/sector-constraint.constants';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

/**
 * Test cases for ObjectiveSettings.ts
 */
describe('Optimization Settings tests', () => {
    const data = {
        investmentUniverseSettings: {
            investmentUniverse: [
                {
                    enabled: true,
                    type: InvestmentUniverseConstants.PORTFOLIO,
                    label: 'LEH_MBS',
                    isFrozen: true,
                    portfolio: 'IP',
                    isBench: false
                },
                {
                    enabled: true,
                    type: InvestmentUniverseConstants.BENCHMARK,
                    label: 'LEHMBSFWD',
                    isFrozen: false,
                    portfolio: 'IP',
                    isBench: true
                }
            ]
        },
        objectiveSettings: {
            objectivesType: OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE,
            portfolioObjectives: [
                {
                    weight: 0.5,
                    enabled: true,
                    key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
                    type: OptimizationConstants.STRESS_SCENARIO_PORTFOLIO_OBJECTIVE,
                    stressScenario: 'BRExit'
                }
            ]
        },
        portfolioConstraints: [
            {
                constraintTag: 'sell_only',
                constraintType: 'PORTFOLIO_CONSTRAINT',
                title: 'Sell Only',
                group: 'Trade'
            },
            {
                constraintTag: 'initial_cash',
                constraintType: 'PORTFOLIO_CONSTRAINT',
                title: 'Initial Cash',
                group: 'Positions'
            }
        ],
        securityConstraints: [
            {
                constraintTag: 'sec_no_buy',
                constraintType: 'SECURITY_CONSTRAINT',
                title: 'Do not Sell',
                group: 'Trade'
            },
            {
                constraintTag: 'sec_no_trade',
                constraintType: 'SECURITY_CONSTRAINT',
                title: 'Do not Buy',
                group: 'Trade'
            }
        ],
        sectorConstraints: [
            {
                constraintTag: 'sect_pct_mv',
                constraintType: 'SECTOR_CONSTRAINT',
                title: 'Market Value',
                group: 'Risk'
            },
            {
                constraintTag: 'pct_mv',
                constraintType: 'SECTOR_CONSTRAINT',
                title: 'Active Market Value',
                group: 'Risk',
                positionType: 'ACTIVE'
            }
        ],
        factorConstraints: [
            {
                constraintTag: 'rfv_exp_port',
                constraintType: 'FACTOR_CONSTRAINT',
                title: 'Factor Exposure',
                group: 'Risk'
            },
            {
                constraintTag: 'rfv_exp_active',
                constraintType: 'FACTOR_CONSTRAINT',
                title: 'Active Factor Exposure',
                group: 'Risk'

            }
        ],
        optimizationAdvancedRiskSettings: {
            name: '',
            _excludeBlock: 'FX'
        },
        selectedYAxis: 'expectedYReturn'
    };
    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });
    /**
     * Test case for method save
     */
    it('Test save', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const optimizationSettings = new OptimizationSettings();
        const objectiveSettings = optimizationSettings.objectiveSettings;
        const investmentUniverseSettings = optimizationSettings.investmentUniverseSettings;
        const portfolioConstraints = optimizationSettings.portfolioConstraints;
        const securityConstraints = optimizationSettings.securityConstraints;
        const sectorConstraints = optimizationSettings.sectorConstraints;
        const factorConstraints = optimizationSettings.factorConstraints;
        const optimizationAdvancedRiskSettings = optimizationSettings.optimizationAdvancedRiskSettings;

        objectiveSettings.portfolioObjectives.push(
            new StressScenarioPortfolioObjective({
                key: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO,
                weight: 0.5,
                stressScenario: 'BRExit'
            })
        );
        objectiveSettings.portfolioObjectives.push(new StressScenarioPortfolioObjective());

        investmentUniverseSettings.investmentUniverse.push(
            new InvestmentUniversePortfolio({
                id: '123',
                enabled: true,
                type: InvestmentUniverseConstants.PORTFOLIO,
                label: 'LEH_MBS',
                isFrozen: true,
                portfolio: 'IP',
                isBench: false
            })
        );
        investmentUniverseSettings.investmentUniverse.push(
            new InvestmentUniversePortfolio({
                id: '456',
                enabled: true,
                type: InvestmentUniverseConstants.BENCHMARK,
                label: 'LEHMBSFWD',
                isFrozen: true,
                portfolio: 'IP',
                isBench: true
            })
        );

        portfolioConstraints.push(
            new Constraint({
                constraintTag: 'sell_only',
                constraintType: 'PORTFOLIO_CONSTRAINT',
                title: 'Sell Only',
                group: 'Trade',
                restrictedConstraints: [],
                enabled: true,
                isFrozen: true,
                optionValues: {},
                relaxationValue: 0
            })
        );
        portfolioConstraints.push(
            new Constraint({
                constraintTag: 'initial_cash',
                constraintType: 'PORTFOLIO_CONSTRAINT',
                title: 'Initial Cash',
                group: 'Positions',
                restrictedConstraints: [],
                enabled: true,
                isFrozen: true,
                optionValues: {},
                relaxationValue: 0
            })
        );

        securityConstraints.push(
            new Constraint({
                constraintTag: 'sec_no_buy',
                constraintType: 'SECURITY_CONSTRAINT',
                title: 'Do not Sell',
                group: 'Trade',
                restrictedConstraints: [],
                enabled: true,
                isFrozen: true,
                optionValues: {},
                relaxationValue: 0
            })
        );
        securityConstraints.push(
            new Constraint({
                constraintTag: 'sec_no_trade',
                constraintType: 'SECURITY_CONSTRAINT',
                title: 'Do not Buy',
                group: 'Trade',
                restrictedConstraints: [],
                enabled: true,
                isFrozen: true,
                optionValues: {},
                relaxationValue: 0
            })
        );

        sectorConstraints.push(
            new Constraint({
                constraintTag: 'sect_pct_mv',
                constraintType: 'SECTOR_CONSTRAINT',
                title: 'Market Value',
                group: 'Risk',
                restrictedConstraints: [],
                enabled: true,
                isFrozen: true,
                optionValues: {},
                relaxationValue: 0
            })
        );
        sectorConstraints.push(
            new Constraint({
                constraintTag: 'sect_act_wt_cont',
                constraintType: 'SECTOR_CONSTRAINT',
                title: 'Active Market Value',
                group: 'Risk',
                restrictedConstraints: [],
                enabled: true,
                isFrozen: true,
                optionValues: {},
                relaxationValue: 0
            })
        );

        factorConstraints.push(
            new Constraint({
                constraintTag: 'rfv_exp_port',
                constraintType: 'FACTOR_CONSTRAINT',
                title: 'Factor Exposure',
                group: 'Risk',
                restrictedConstraints: [],
                enabled: true,
                isFrozen: true,
                optionValues: {},
                relaxationValue: 0
            })
        );
        factorConstraints.push(
            new Constraint({
                constraintTag: 'rfv_exp_active',
                constraintType: 'FACTOR_CONSTRAINT',
                title: 'Active Factor Exposure',
                group: 'Risk',
                restrictedConstraints: [],
                enabled: true,
                isFrozen: true,
                optionValues: {},
                relaxationValue: 0
            })
        );
        optimizationAdvancedRiskSettings.excludeBlock = 'FX';

        const expectedOptimizationSettings = {
            investmentUniverseSettings: {
                investmentUniverse: [
                    {
                        'enabled': true,
                        'isBench': false,
                        'isFrozen': true,
                        'label': 'LEH_MBS',
                        'portfolio': 'IP',
                        'type': 'Portfolio'
                    },
                    {
                        'enabled': true,
                        'isBench': false,
                        'isFrozen': true,
                        'label': 'LEHMBSFWD',
                        'portfolio': 'IP',
                        'type': 'Benchmark'
                    }
                ]
            },
            objectiveSettings: {
                objectivesType: 'Active',
                portfolioObjectives: [
                    {
                        weight: 0.5,
                        enabled: true,
                        key: 'MAXIMIZE_ALPHA_STRESS_SCENARIO',
                        stressScenario: 'BRExit',
                        type: 'STRESS_SCENARIO'
                    }
                ],
                'riskParityEnabled': false
            },
            portfolioConstraints: [
                {
                    columnFormat: undefined,
                    dataType: undefined,
                    isRelaxable: undefined,
                    positionType: undefined,
                    constraintTag: 'sell_only',
                    constraintType: 'PORTFOLIO_CONSTRAINT',
                    enabled: true,
                    group: 'Trade',
                    isFrozen: true,
                    optionValues: {},
                    relaxationValue: 0
                },
                {
                    columnFormat: undefined,
                    dataType: undefined,
                    isRelaxable: undefined,
                    positionType: undefined,
                    constraintTag: 'initial_cash',
                    constraintType: 'PORTFOLIO_CONSTRAINT',
                    enabled: true,
                    group: 'Positions',
                    isFrozen: true,
                    optionValues: {},
                    relaxationValue: 0
                }
            ],
            securityConstraints: [
                {
                    columnFormat: undefined,
                    dataType: undefined,
                    isRelaxable: undefined,
                    positionType: undefined,
                    constraintTag: 'sec_no_buy',
                    constraintType: 'SECURITY_CONSTRAINT',
                    enabled: true,
                    group: 'Trade',
                    isFrozen: true,
                    optionValues: {},
                    relaxationValue: 0
                },
                {
                    columnFormat: undefined,
                    dataType: undefined,
                    isRelaxable: undefined,
                    positionType: undefined,
                    constraintTag: 'sec_no_trade',
                    constraintType: 'SECURITY_CONSTRAINT',
                    enabled: true,
                    isFrozen: true,
                    group: 'Trade',
                    optionValues: {},
                    relaxationValue: 0
                }
            ],
            sectorConstraints: [
                {
                    columnFormat: undefined,
                    dataType: undefined,
                    isRelaxable: undefined,
                    positionType: undefined,
                    constraintTag: 'sect_pct_mv',
                    constraintType: 'SECTOR_CONSTRAINT',
                    enabled: true,
                    isFrozen: true,
                    group: 'Risk',
                    optionValues: {},
                    relaxationValue: 0
                },
                {
                    columnFormat: undefined,
                    dataType: undefined,
                    isRelaxable: undefined,
                    positionType: undefined,
                    constraintTag: 'sect_act_wt_cont',
                    constraintType: 'SECTOR_CONSTRAINT',
                    enabled: true,
                    isFrozen: true,
                    group: 'Risk',
                    optionValues: {},
                    relaxationValue: 0
                }
            ],
            factorConstraints: [
                {
                    columnFormat: undefined,
                    dataType: undefined,
                    isRelaxable: undefined,
                    positionType: undefined,
                    constraintTag: 'rfv_exp_port',
                    constraintType: 'FACTOR_CONSTRAINT',
                    enabled: true,
                    group: 'Risk',
                    isFrozen: true,
                    optionValues: {},
                    relaxationValue: 0
                },
                {
                    columnFormat: undefined,
                    dataType: undefined,
                    isRelaxable: undefined,
                    positionType: undefined,
                    constraintTag: 'rfv_exp_active',
                    constraintType: 'FACTOR_CONSTRAINT',
                    enabled: true,
                    isFrozen: true,
                    group: 'Risk',
                    optionValues: {},
                    relaxationValue: 0
                }
            ],
            optimizationAdvancedRiskSettings : {
                excludeBlock: 'FX',
                'riskMatrix': 1
            },
            mipTimeLimit: undefined,
            title: undefined
        };

        expect(optimizationSettings.serialize(false)).toEqual(expectedOptimizationSettings);

        // when efficient frontier is enabled
        optimizationSettings.isEfficientFrontierEnabled = true;
        optimizationSettings.efficientEnabledConstraints.add(new Constraint({
            constraintTag: 'max_turnover',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            title: 'Maximum Turnover',
            group: 'Positions',
            restrictedConstraints: [],
            enabled: true,
            isFrozen: true,
            optionValues: {},
            relaxationValue: 0
        }));

        expectedOptimizationSettings.isEfficientFrontierEnabled = true;
        expectedOptimizationSettings['iterations'] = 10;
        expectedOptimizationSettings['efficientEnabledConstraints'] = [{
            constraintTag: 'max_turnover',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            enabled: true,
            isFrozen: true,
            group: 'Positions',
            optionValues: {},
            relaxationValue: 0
        }];

        expect(optimizationSettings.serialize(false)).toEqual(expectedOptimizationSettings);
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', () => {
        const constraintDef1: OptimizationConstraint = new OptimizationConstraint({
            constraintType: 'SECTOR_CONSTRAINT',
            columnTag: 'pct_mv',
            aliasConstraintTag : 'sect_pct_mv',
            title: 'Market Value',
            uses : 'PORT',
            group: 'Risk'
        });
        const constraintDef2: OptimizationConstraint = new OptimizationConstraint({
            constraintType: 'SECTOR_CONSTRAINT',
            title: 'Active Market Value',
            group: 'Risk',
            uses : 'ACTIVE',
            columnTag: 'sect_act_wt_cont'
        });

        DefinitionsStore.optimizationConstraint = [constraintDef1, constraintDef2];
        const oldSectorConstraints = cloneDeep(data.sectorConstraints);
        data.sectorConstraints.push(new Constraint({
                title: 'title',
                columnTag: 'sect_act_wt_cont',
                constraintType: 'SECTOR_CONSTRAINT',
                optionValues: {
                    sectorConstraintType: ALL_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: {}
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            }).serialize(),
            new Constraint({
                title: 'title',
                columnTag: 'sect_act_wt_cont',
                constraintType: 'SECTOR_CONSTRAINT',
                optionValues: {
                    sectorConstraintType: ALL_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            }).serialize(),
            new Constraint({
                title: 'title',
                columnTag: 'sect_act_wt_cont',
                constraintType: 'SECTOR_CONSTRAINT',
                optionValues: {
                    sectorConstraintType: ALL_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: '{}'
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            }).serialize(),
            new Constraint({
                title: 'title',
                columnTag: 'sect_act_wt_cont',
                constraintType: 'SECTOR_CONSTRAINT',
                optionValues: {
                    sectorConstraintType: ALL_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: null
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            }).serialize());

        const optimizationSettings = new OptimizationSettings();
        optimizationSettings.deserialize(cloneDeep(data));

        const objectiveSettings = optimizationSettings.objectiveSettings;
        expect(objectiveSettings.objectivesType).toEqual(OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE);
        expect(objectiveSettings.portfolioObjectives.length).toEqual(1);
        const portfolioObjective = objectiveSettings.portfolioObjectives[0];

        expect(portfolioObjective instanceof StressScenarioPortfolioObjective).toBe(true);
        expect(portfolioObjective.key).toEqual(OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO);
        expect(portfolioObjective.weight).toEqual(0.5);
        expect(portfolioObjective.enabled).toEqual(true);
        expect((<StressScenarioPortfolioObjective>portfolioObjective).stressScenario).toEqual('BRExit');

        const investmentUniverseSettings = optimizationSettings.investmentUniverseSettings;
        expect(investmentUniverseSettings.investmentUniverse.length).toEqual(2);
        let investmentUniverseItem = investmentUniverseSettings.investmentUniverse[1];

        expect(investmentUniverseItem instanceof InvestmentUniverseItemBase).toBe(true);
        expect(investmentUniverseItem.type).toEqual(InvestmentUniverseConstants.BENCHMARK);
        expect(investmentUniverseItem.enabled).toEqual(true);
        expect(investmentUniverseItem.isFrozen).toEqual(false);
        expect((<InvestmentUniversePortfolio>investmentUniverseItem).portfolio).toEqual('IP');

        investmentUniverseItem = investmentUniverseSettings.investmentUniverse[0];

        expect(investmentUniverseItem instanceof InvestmentUniverseItemBase).toBe(true);
        expect(investmentUniverseItem.type).toEqual(InvestmentUniverseConstants.PORTFOLIO);
        expect(investmentUniverseItem.enabled).toEqual(true);
        expect(investmentUniverseItem.isFrozen).toEqual(true);
        expect((<InvestmentUniversePortfolio>investmentUniverseItem).portfolio).toEqual('IP');

        const portfolioConstraints = optimizationSettings.portfolioConstraints;
        expect(portfolioConstraints.length).toEqual(2);
        const portfolioConstraint = portfolioConstraints[0];
        expect(portfolioConstraint instanceof Constraint).toBe(true);
        expect(portfolioConstraint.constraintTag).toEqual('sell_only');
        expect(portfolioConstraint.constraintType).toEqual('PORTFOLIO_CONSTRAINT');

        const securityConstraints = optimizationSettings.securityConstraints;
        expect(securityConstraints.length).toEqual(2);
        const securityConstraint = securityConstraints[0];
        expect(securityConstraint instanceof Constraint).toBe(true);
        expect(securityConstraint.constraintTag).toEqual('sec_no_buy');
        expect(securityConstraint.constraintType).toEqual('SECURITY_CONSTRAINT');

        const sectorConstraints = optimizationSettings.sectorConstraints;
        expect(sectorConstraints.length).toEqual(6);
        let sectorConstraint = sectorConstraints[0];
        expect(sectorConstraint instanceof Constraint).toBe(true);
        // constraintTag should be new tag instead of alisTag; as this is absent in constraintDefinitions with columnTag but present with aliasTag
        expect(sectorConstraint.constraintTag).toEqual('pct_mv');
        expect(sectorConstraint.constraintType).toEqual('SECTOR_CONSTRAINT');
        expect(sectorConstraint.positionType).toEqual('PORT');
        sectorConstraint = sectorConstraints[1];
        expect(sectorConstraint instanceof Constraint).toBe(true);
        // constraintTag should be columnTag as this is present in constraintDefinitions with columnTag
        expect(sectorConstraint.constraintTag).toEqual('pct_mv');
        expect(sectorConstraint.constraintType).toEqual('SECTOR_CONSTRAINT');
        expect(sectorConstraint.positionType).toEqual('ACTIVE');

        expect(sectorConstraints[2].optionValues.sectorConstraintType).toEqual('portfolio');
        expect(sectorConstraints[3].optionValues.sectorConstraintType).toEqual('portfolio');
        expect(sectorConstraints[4].optionValues.sectorConstraintType).toEqual('portfolio');
        data.sectorConstraints = oldSectorConstraints;

        // when efficient frontier is enabled
        const newData = cloneDeep(data);

        const efficientEnabledConstarint = {
            constraintTag: 'max_turnover',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            enabled: true,
            isFrozen: true,
            optionValues: {
                ConstraintLowerBound: 1,
                ConstraintUpperBound: [2, 5, 10]
            },
            relaxationValue: 0
        };
        newData.portfolioConstraints.push(efficientEnabledConstarint as any);
        newData['isEfficientFrontierEnabled'] = true;
        newData['iterations'] = 10;
        newData['selectedYAxis'] = 'expectedReturn';
        newData['efficientEnabledConstraints'] = [efficientEnabledConstarint];

        const newOptimizationSettings = new OptimizationSettings();
        newOptimizationSettings.deserialize(cloneDeep(newData));
        expect(newOptimizationSettings.isEfficientFrontierEnabled).toBe(true);
        expect(newOptimizationSettings.iterations).toEqual(10);
        expect(newOptimizationSettings.efficientEnabledConstraints.size).toEqual(1);
        expect([...newOptimizationSettings.efficientEnabledConstraints][0].constraintTag).toEqual('max_turnover');
    });

    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const dataToDeserialize = cloneDeep(data);
        dataToDeserialize.investmentUniverseSettings.investmentUniverse[1].isFrozen = true;
        dataToDeserialize.objectiveSettings.objectivesType = OptimizationConstants.ACTIVE_OBJECTIVE_TYPE;
        const optimizationSettings1 = new OptimizationSettings(dataToDeserialize);

        const optimizationSettings2 = new OptimizationSettings();
        optimizationSettings2.deserialize(dataToDeserialize);

        const objectiveSettings1 = optimizationSettings1.objectiveSettings;
        const objectiveSettings2 = optimizationSettings2.objectiveSettings;

        const investmentUniverseSettings1 = optimizationSettings1.investmentUniverseSettings;
        const investmentUniverseSettings2 = optimizationSettings2.investmentUniverseSettings;

        expect(objectiveSettings1.equals(objectiveSettings2)).toBe(true);

        expect(investmentUniverseSettings1.equals(investmentUniverseSettings2)).toBe(true);

        // Unequal objective type
        objectiveSettings2.objectivesType = OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE;
        expect(objectiveSettings1.equals(objectiveSettings2)).toBe(false);

        // Unequal number of PortfolioObjectives
        objectiveSettings2.objectivesType = OptimizationConstants.ACTIVE_OBJECTIVE_TYPE;
        objectiveSettings2.portfolioObjectives.push(new PortfolioObjective());
        expect(objectiveSettings1.equals(objectiveSettings2)).toBe(false);

        investmentUniverseSettings2.investmentUniverse.push(
            new InvestmentUniversePortfolio({
                id: '123',
                enabled: true,
                type: InvestmentUniverseConstants.PORTFOLIO,
                label: 'LEH_MBS',
                isFrozen: true
            })
        );
        expect(investmentUniverseSettings1.equals(investmentUniverseSettings2)).toBe(false);

        // Unequal PortfolioObjectives
        objectiveSettings2.portfolioObjectives.splice(1, 1);
        const portfolioObjective1 = objectiveSettings1.portfolioObjectives[0];
        const portfolioObjective2 = objectiveSettings2.portfolioObjectives[0];

        // Unequal PortfolioObjectives
        investmentUniverseSettings2.investmentUniverse.splice(1, 1);

        // Unequal keys
        portfolioObjective2.key = 'abc';
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Unequal weight
        portfolioObjective2.key = 'MINIMIZE_RISK';
        portfolioObjective2.weight = 1.0;
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Unequal enabled
        portfolioObjective2.weight = 0.5;
        portfolioObjective2.enabled = true;
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Unequal stress scenario
        portfolioObjective2.enabled = false;
        (<StressScenarioPortfolioObjective>portfolioObjective2).stressScenario = 'US Election';
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        const portfolioConstraints1 = optimizationSettings1.portfolioConstraints;
        const portfolioConstraints2 = optimizationSettings2.portfolioConstraints;
        for (let i = 0; i < portfolioConstraints1.length; i++) {
            expect(portfolioConstraints1[i].equals(portfolioConstraints2[i])).toBe(true);
        }

        const securityConstraints1 = optimizationSettings1.securityConstraints;
        const securityConstraints2 = optimizationSettings2.securityConstraints;
        for (let i = 0; i < securityConstraints1.length; i++) {
            expect(securityConstraints1[i].equals(securityConstraints2[i])).toBe(true);
        }

        const sectorConstraints1 = optimizationSettings1.sectorConstraints;
        const sectorConstraints2 = optimizationSettings2.sectorConstraints;
        for (let i = 0; i < sectorConstraints1.length; i++) {
            expect(sectorConstraints1[i].equals(sectorConstraints2[i])).toBe(true);
        }

        portfolioConstraints1[0].constraintType = 'ABC';
        expect(portfolioConstraints1[0].equals(portfolioConstraints2[0])).toBe(false);

        portfolioConstraints1[0].constraintType = portfolioConstraints2[0].constraintType;
        portfolioConstraints1[0].constraintTag = 'ffsd';
        expect(portfolioConstraints1[0].equals(portfolioConstraints2[0])).toBe(false);

        portfolioConstraints1[0].constraintTag = portfolioConstraints2[0].constraintTag;
        portfolioConstraints1[0].title = 'sfdsd';
        expect(portfolioConstraints1[0].equals(portfolioConstraints2[0])).toBe(false);

        portfolioConstraints1[0].title = portfolioConstraints2[0].title;
        portfolioConstraints1[0].group = 'fgfvrg';
        expect(portfolioConstraints1[0].equals(portfolioConstraints2[0])).toBe(false);

        sectorConstraints1[0].title = securityConstraints2[0].title;
        sectorConstraints1[0].group = 'fgfvrg';
        expect(sectorConstraints1[0].equals(securityConstraints2[0])).toBe(false);
    });

    it('tests equals - with negative scenarios', () => {
        const dataToDeserialize = cloneDeep(data);
        dataToDeserialize.investmentUniverseSettings.investmentUniverse[0].isFrozen = false;
        dataToDeserialize.investmentUniverseSettings.investmentUniverse[1].isFrozen = false;
        dataToDeserialize.objectiveSettings.objectivesType = OptimizationConstants.ACTIVE_OBJECTIVE_TYPE;
        DefinitionsStore.optimizationConstraint = [new OptimizationConstraint({'constraintType': 'SECTOR_CONSTRAINT', 'constraintTag': 'pct_mv', 'title': 'Active Market Value', 'uses': 'ACTIVE', 'group': 'Risk'})];
        const optimizationSettings1 = new OptimizationSettings(dataToDeserialize);
        const optimizationSettings2 = new OptimizationSettings();

        expect(optimizationSettings1.equals(optimizationSettings2)).toBe(false);

        optimizationSettings2.objectiveSettings = new ObjectiveSettings(dataToDeserialize.objectiveSettings);
        expect(optimizationSettings1.equals(optimizationSettings2)).toBe(false);

        optimizationSettings2.investmentUniverseSettings = new InvestmentUniverseSettings();
        optimizationSettings2.investmentUniverseSettings.deserialize(dataToDeserialize.investmentUniverseSettings);
        expect(optimizationSettings1.equals(optimizationSettings2)).toBe(false);

        optimizationSettings2.portfolioConstraints = [
            new Constraint(dataToDeserialize.portfolioConstraints[0]),
            new Constraint(dataToDeserialize.portfolioConstraints[1])
        ];
        expect(optimizationSettings1.equals(optimizationSettings2)).toBe(false);

        optimizationSettings2.securityConstraints = [
            new Constraint(dataToDeserialize.securityConstraints[0]),
            new Constraint(dataToDeserialize.securityConstraints[1])
        ];
        expect(optimizationSettings1.equals(optimizationSettings2)).toBe(false);

        optimizationSettings2.sectorConstraints = [
            new Constraint(dataToDeserialize.sectorConstraints[0]),
            new Constraint(dataToDeserialize.sectorConstraints[1])
        ];
        expect(optimizationSettings1.equals(optimizationSettings2)).toBe(false);

        optimizationSettings2.factorConstraints = [
            new Constraint(dataToDeserialize.factorConstraints[0]),
            new Constraint(dataToDeserialize.factorConstraints[1])
        ];

        expect(optimizationSettings1.equals(optimizationSettings2)).toBe(true);
    });

    it('tests setDefaultObjective', () => {
        const optimizationSettings: OptimizationSettings = new OptimizationSettings();
        expect(optimizationSettings.objectiveSettings.portfolioObjectives.length).toBe(0);
        optimizationSettings.setDefaultObjective();
        expect(optimizationSettings.objectiveSettings.portfolioObjectives.length).toBe(1);
        expect(optimizationSettings.objectiveSettings.portfolioObjectives[0].weight).toBe(1.0);
        expect(optimizationSettings.objectiveSettings.portfolioObjectives[0].key).toBe('MINIMIZE_RISK');
    });

    it('tests copyFrom', () => {
        const optimizationSettings1 = new OptimizationSettings(data);
        const optimizationSettings2 = new OptimizationSettings();
        optimizationSettings2.copyFrom(optimizationSettings1);
        expect(optimizationSettings2.equals(optimizationSettings1)).toBe(true);
    });
});
