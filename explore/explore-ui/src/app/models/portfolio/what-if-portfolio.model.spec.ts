import {ActiveSectorRule} from './tradeRules/active-sector-rule.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {SecurityRule} from './tradeRules/security-rule.model';
import {RulesBasedPortfolio} from './rule-based-portfolio.model';
import {PortfolioSecurityHoldingChange} from './composition/portfolio-security-holding-change.model';
import {HoldingChange} from './composition/holding-change.model';
import {BaseRule} from './tradeRules/base-rule.model';
import {ActiveSecurityRule} from './tradeRules/active-security-rule.model';
import {PortfolioWithPositions} from './portfolio-with-positions.model';
import {NewPortfolioHoldingChange} from './composition/new-portfolio-holding-change.model';
import {WhatIfPortfolio} from './what-if-portfolio.model';
import {BreakdownInitializer, CustomSector} from '@blk/explore-ui-breakdown';
import {IndexWeight} from './index-weight.model';
import {ConfigInitializer} from '../../initializers/config.initializer';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';
import {ConfigTypeFactory, DateValue, PortfolioDefaults, SerializeFavoriteType, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {CompositionConstants} from '@constants/composition.constants';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {
    PortfolioNavSecurityHoldingChange
} from '@models/portfolio/composition/portfolio-nav-securities-holding-change.model';
import {CompositionConfig} from '@models/portfolio/composition/composition-config.model';
import moment from 'moment';
import 'moment-timezone/index';

describe('WhatIfPortfolio tests', () => {

    beforeAll(() => {
        ConfigInitializer.registerPortfolioTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    /**
     * Test case for method setModellingType
     */
    it('setModellingType', () => {
        const port = new RulesBasedPortfolio();
        port.setModellingType(0);
        expect(port.modellingType === ModellingType.SECTOR).toBe(true);

        port.setModellingType(1);
        expect(port.modellingType === ModellingType.POSITION).toBe(true);

        port.setModellingType(2);
        expect(port.modellingType === ModellingType.PORTFOLIO).toBe(true);
    });

    /**
     * Test case for method isCompositionAtPortfolioLevel
     */
    it('isCompositionAtPortfolioLevel', () => {
        const port = new RulesBasedPortfolio();
        port.setModellingType(0);
        expect(port.isCompositionAtPortfolioLevel()).toBe(false);

        port.setModellingType(1);
        expect(port.isCompositionAtPortfolioLevel()).toBe(false);

        port.setModellingType(2);
        expect(port.isCompositionAtPortfolioLevel()).toBe(true);
    });

    /**
     * Test case for method addHolingChanges
     */
    it('addHoldingChanges', () => {
        const port = new RulesBasedPortfolio();
        const holdingChange1 = new PortfolioSecurityHoldingChange();
        holdingChange1.lineItem = 'ABC';
        holdingChange1.changeInWeight = 2.0;
        holdingChange1.newWeight = 3.0;
        const holdingChanges: Array<HoldingChange> = [];
        holdingChanges.push(holdingChange1);
        port.addHoldingChanges(holdingChanges);

        expect(port.holdingChanges.length).toBe(1);
        expect(port.holdingChanges[0].isEqual(holdingChange1)).toBe(true);

        const holdingChange2 = new PortfolioSecurityHoldingChange();
        holdingChange2.lineItem = 'DEF';
        holdingChange2.changeInWeight = 5.0;
        holdingChange2.newWeight = 8.0;
        holdingChanges.push(holdingChange2);
        port.addHoldingChanges(holdingChanges);

        expect(port.holdingChanges.length).toBe(2);
        expect(port.holdingChanges[0].isEqual(holdingChange1)).toBe(true);
        expect(port.holdingChanges[1].isEqual(holdingChange2)).toBe(true);

        const holdingChange3 = new PortfolioSecurityHoldingChange();
        holdingChange3.lineItem = 'ABC';
        holdingChange3.changeInWeight = 5.0;
        holdingChange3.newWeight = 8.0;
        holdingChanges.push(holdingChange3);
        port.addHoldingChanges(holdingChanges);

        const holdingChange4 = new PortfolioHoldingChange();
        holdingChange4.lineItem = 'PORT';
        port.addHoldingChanges([...holdingChanges, holdingChange4]);

        const holdingChange5 = new PortfolioHoldingChange();
        holdingChange5.lineItem = 'PORT';
        holdingChange5.id = 123;
        holdingChange5.changeInWeight = 5.0;
        holdingChange5.newWeight = 13.0;
        port.addHoldingChanges([...holdingChanges, holdingChange4, holdingChange5]);

        const holdingChange6 = new PortfolioHoldingChange();
        holdingChange6.lineItem = 'PORT';
        holdingChange6.id = 123;
        holdingChange6.changeInWeight = 2.0;
        holdingChange6.newWeight = 10.0;
        port.addHoldingChanges([...holdingChanges, holdingChange4, holdingChange5, holdingChange6]);

        const holdingChange7 = new PortfolioNavSecurityHoldingChange();
        holdingChange7.lineItem = 'TEST PORT';
        holdingChange7.changeInWeight = 2.0;
        holdingChange7.newWeight = 10.0;
        holdingChange7.order = 7;

        const holdingChange8 = new PortfolioNavSecurityHoldingChange();
        holdingChange8.lineItem = 'TEST PORT';
        holdingChange8.changeInWeight = 2.0;
        holdingChange8.newWeight = 10.0;
        holdingChange8.order = 8;
        port.addHoldingChanges([...holdingChanges, holdingChange4, holdingChange5, holdingChange6, holdingChange7, holdingChange8]);

        expect(port.holdingChanges.length).toBe(6);
        expect(port.holdingChanges[0].isEqual(holdingChange2)).toBe(true);
        expect(port.holdingChanges[1].isEqual(holdingChange3)).toBe(true);
        expect(port.holdingChanges[2].isEqual(holdingChange4)).toBe(true);
        expect(port.holdingChanges[3].isEqual(holdingChange6)).toBe(true);
        expect(port.holdingChanges[4].isEqual(holdingChange7)).toBe(true);
        expect(port.holdingChanges[5].isEqual(holdingChange8)).toBe(true);
    });

    /**
     * Test case for method getPortfolioTitleForSideBar
     */
    it('getPortfolioTitleForSideBar', () => {
        const port = new WhatIfPortfolio();
        port.portName = 'What-if PEP';
        expect(port.getPortfolioTitleForSideBar()).toEqual('What-if PEP');
        port.fullName = 'PEP Full Name';
        expect(port.getPortfolioTitleForSideBar()).toEqual('(What-if) PEP Full Name');
        port.title = 'Saved Title';
        port.id = 123;
        expect(port.getPortfolioTitleForSideBar()).toEqual('(What-if) Saved Title');
    });

    /**
     * Test case for method removeHoldingChangeBasedOnLineItem
     */
    it('removeHoldingChangeBasedOnLineItem', () => {
        const port = new RulesBasedPortfolio();
        const holdingChange1 = new PortfolioSecurityHoldingChange({
            lineItem: 'ABC',
            changeInWeight: 2.0,
            newWeight: 3.0
        });
        port.addHoldingChanges([holdingChange1]);

        expect(port.holdingChanges.length).toBe(1);
        expect(port.holdingChanges[0].isEqual(holdingChange1)).toBe(true);

        port.removeHoldingChangeBasedOnLineItem('DEF');
        expect(port.holdingChanges.length).toBe(1);

        port.removeHoldingChangeBasedOnLineItem('ABC');
        expect(port.holdingChanges.length).toBe(0);
    });

    it('should add holdingChanges to requestParams', () => {
        // Arrange
        const portfolio = new WhatIfPortfolio();
        const portfolioDefaults = new PortfolioDefaults();

        const holdingChange1 = new PortfolioHoldingChange();
        const holdingChange2 = new PortfolioHoldingChange();
        holdingChange1.addedDuringWhatIfInitialization = false;
        holdingChange1.lineItem = 'testLineItem1';
        holdingChange2.addedDuringWhatIfInitialization = true;
        holdingChange2.lineItem = 'testLineItem2';
        portfolio.holdingChanges = [holdingChange1, holdingChange2];
        portfolio.portName = 'testPortfolio';
        portfolio.datePicker = new DateValue({date: '01/01/2020'});
        portfolioDefaults.calendar = 'GP_BLK_USIE';
        portfolio.portfolioDefaults = portfolioDefaults;
        const requestParams:any = {
        };

        // Act
        portfolio.addRequestParams(requestParams);

        // Assert
        expect(requestParams.holdingChanges).toBeDefined();
        expect(requestParams.holdingChanges.length).toBe(2);
        expect(requestParams.holdingChanges[0].lineItem).toBe('testLineItem1');
        expect(requestParams.holdingChanges[0].addedDuringWhatIfInitialization).toBe(false);
        expect(requestParams.holdingChanges[1].lineItem).toBe('testLineItem2');
        expect(requestParams.holdingChanges[1].addedDuringWhatIfInitialization).toBe(true);
        expect(requestParams.portfolio).toBe('testPortfolio');
        expect(requestParams.forDate).toBe('01/01/2020');

    });

    /**
     * Test case for method addNewPortfolioWeightsToCompositeIndexWeights
     */
    it('addNewPortfolioWeightsToCompositeIndexWeights', () => {
        const port = new RulesBasedPortfolio();

        port.indexWeights = [
            new IndexWeight({
                portfolio: {
                    ticker: 'LEH_MBS',
                    code: 322
                },
                weight: .5
            }),
            new IndexWeight({
                portfolio: {
                    ticker: 'PEP'
                },
                weight: .3
            })
        ];

        port.addNewPortfolioWeightsToCompositeIndexWeights([
            new NewPortfolioHoldingChange({
                lineItem: 'ABC',
                changeInWeight: 20.0,
                newWeight: 3.0
            }),
            new NewPortfolioHoldingChange({
                lineItem: 'ABC'.concat(CompositionConstants.FAV_ID_DELIMITER).concat('123'),
                changeInWeight: 40.0,
                newWeight: 3.0
            }),
            new PortfolioSecurityHoldingChange({
                lineItem: 'DEF',
                changeInWeight: 2.0,
                newWeight: 3.0
            })
        ]);

        expect(port.indexWeights.length).toBe(3);
        expect(port.indexWeights[0].portfolioPortName).toBe('LEH_MBS');
        expect(port.indexWeights[1].portfolioPortName).toBe('ABC');
        expect(port.indexWeights[2].portfolioPortName).toBe('ABC'.concat(CompositionConstants.FAV_ID_DELIMITER).concat('123'));
        expect(port.indexWeights[1].weight).toBe(.2);
        expect(port.indexWeights[2].weight).toBe(.4);
    });



    /**
     * Test case for method resetCompositeIndexWeights
     */
    it('resetCompositeIndexWeights', () => {
        const port = new RulesBasedPortfolio();

        port.indexWeights = [
            new IndexWeight({
                portfolio: {
                    ticker: 'LEH_MBS',
                    code: 322
                },
                weight: .5
            }),
            new IndexWeight({
                portfolio: {
                    ticker: 'PEP'
                },
                weight: .3
            })
        ];

        port.resetCompositeIndexWeights();

        expect(port.indexWeights.length).toBe(1);
        expect(port.indexWeights[0].portfolioPortName).toBe('LEH_MBS');
    });

    /**
     * Test case for method isCompositionBreakdownSpecified
     */
    it('isCompositionBreakdownSpecified', () => {
        const port = new RulesBasedPortfolio();
        expect(port.isCompositionBreakdownSpecified()).toBe(false);

        port.compositionSetting.breakdownTree.children = [new CustomSector()];
        expect(port.isCompositionBreakdownSpecified()).toBe(true);
    });

    /**
     * Test case for method getSavedPortfolioType
     */
    it('getSavedPortfolioType', () => {
        const port = new RulesBasedPortfolio();

        expect(port.getSavedPortfolioType()).toBe(null);

        port.id = 12;
        expect(port.getSavedPortfolioType()).toBe(port.type);
    });

    /**
     * Test case for method isPositionBasedPortfolio
     */
    it('isPositionBasedPortfolio', () => {
        const port = new PortfolioWithPositions();

        expect(port.isPositionBasedPortfolio()).toBe(false);

        port.id = 12;
        expect(port.isPositionBasedPortfolio()).toBe(true);
    });

    /**
     * Test case for method doDeserialize for a What if portfolio
     */
    it('doDeserialize', () => {
        expect(ConfigTypeFactory.createConfig({configType: WhatIfPortfolio.configType}, WhatIfPortfolio.configType, false) instanceof WhatIfPortfolio)
            .toBe(true);
    });

    /**
     * Test case for method addHoldingChangesForAddedSecurities for a What if portfolio
     */
    it('doAddHoldingChangesForAddedSecurities', () => {
        const port = new PortfolioWithPositions();
        port.holdingChanges = [new NewSecurityHoldingChange(), new NewSecurityHoldingChange(), new NewSecurityHoldingChange(), new PortfolioSecurityHoldingChange()];
        port.addHoldingChangesForAddedSecurities();
        // only new Security holding change are retained
        expect(port.holdingChangesGeneratedForAddedSecurities.length).toBe(3);
    });

    /**
     * Test case for the hasBenchmarkRelatedRules method
     */
    it('hasBenchmarkRelatedRules', () => {
        const securityRule1: SecurityRule = new SecurityRule('cusipA', 0.1);
        const securityRule2: SecurityRule = new SecurityRule('cusipB', 0.9);

        const activeSecurityRule: ActiveSecurityRule = new ActiveSecurityRule('cusipX', 0.2);
        const activeSectorRule: ActiveSectorRule = new ActiveSectorRule('CASH', 0.2, []);

        // A WhatIf port has valid rules but none is a benchmark related - expect hasBenchmarkRelatedRules to return false
        runAndValidateHasBenchmarkRelatedRules(securityRule1, securityRule2, false);

        // A WhatIf port has valid rules with one being an ActiveSecurity - expect hasBenchmarkRelatedRules to return true
        runAndValidateHasBenchmarkRelatedRules(securityRule1, activeSecurityRule, true);

        // A WhatIf port has valid rules with one being an ActiveSector - expect hasBenchmarkRelatedRules to return true
        runAndValidateHasBenchmarkRelatedRules(securityRule1, activeSectorRule, true);
    });

    function runAndValidateHasBenchmarkRelatedRules(rule1: BaseRule, rule2: BaseRule, isItExpectedToHaveBenchmarkRules: boolean) {
        // Create a WhatIf port (of any type as the hasBenchmarkRelatedRules method is the base method)
        const port: WhatIfPortfolio = new PortfolioWithPositions();

        // Check that the port with the undefined rules has no benchmark related rules
        expect(port.hasBenchmarkRelatedRules()).toBe(false);

        // Check that the port with the empty rules has no benchmark related rules
        const rules: Array<BaseRule> = [];
        port.setPassedRulesForEachDate(rules);
        expect(port.hasBenchmarkRelatedRules()).toBe(false);

        // Add given rules to the rules collection
        rules.push(rule1);
        rules.push(rule2);
        port.setPassedRulesForEachDate(rules);

        // Check that hasBenchmarkRelatedRules returns expected result for the given rules
        expect(port.hasBenchmarkRelatedRules()).toBe(isItExpectedToHaveBenchmarkRules);
    }

    it('test clearHoldingChanges', () => {
        const port = new RulesBasedPortfolio();
        port.setModellingType(0);
        const holdingChange1 = new PortfolioSecurityHoldingChange([{
            lineItem: 'ABC',
            changeInWeight: 2.0,
            newWeight: 3.0,
            isNavNeutral: true
        },
            {
                lineItem: 'ABC',
                changeInWeight: 2.0,
                newWeight: 3.0,
                isNavNeutral: false
            }]);
        port.addHoldingChanges([holdingChange1]);
        port.clearHoldingChanges();
        expect(port.holdingChanges.length).toBe(1);
        const port1 = new RulesBasedPortfolio();
        port1.setModellingType(2);
        const holdingChange2 = new PortfolioHoldingChange({
            lineItem: 'DEF',
            changeInWeight: 3.0,
            newWeight: 4.0
        });
        port1.addHoldingChanges([holdingChange2]);
        port1.clearHoldingChanges();
        expect(port1.holdingChanges.length).toBe(0);
    });

    it('tests createFavorite', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        let port: WhatIfPortfolio = new RulesBasedPortfolio('abc');
        jest.spyOn(moment.tz, 'guess').mockReturnValue('America/New_York');
        expect(port.createFavorite('WHATIF_RULES').description).toBe('abc');

        port = new PortfolioWithPositions('abc', new DateValue({'date': '01/01/2015'}));
        expect(port.createFavorite('WHATIF_POS').description).toBe('abc-#-01/01/2015');
    });

    it('does not serialize specific fields when checking for favorite changes', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new WhatIfPortfolio('abc');
        port.portId = 'abc';
        port.cusip = 'abc1234';
        port.isIndexResearchPortfolio = true;

        let serializedPort = port.serialize(SerializeFavoriteType.FAVORITE_CHANGE_DETECTION);
        expect(serializedPort.portId).toBeUndefined();
        expect(serializedPort.cusip).toBeUndefined();
        expect(serializedPort.isIndexResearchPortfolio).toBeUndefined();

        port.compositionConfig = new CompositionConfig(port, true);
        serializedPort = port.serialize(SerializeFavoriteType.FAVORITE_CHANGE_DETECTION);
        expect(serializedPort.compositionConfig).toBeUndefined();
    });
});

