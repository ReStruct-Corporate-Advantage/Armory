import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {InvestmentUniversePortfolio} from './investment-universe-portfolio.model';
import {ColumnSectorRule, CustomSector, SectorConstants} from '@blk/explore-ui-breakdown';
import {ConfigTypeFactory, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {CustomFilter} from '@blk/explore-ui-breakdown';

/**
 * Test cases for InvestmentUniversePortfolio.ts
 */
describe('Investment Universe Portfolio tests', () => {

    const rule = {
        'colPositionColumnType': 'ALL',
        'colTag': 'sec_group',
        'colTitle': 'Security Group',
        'colType': 'String',
        'compType': 'EQUALS',
        'compValues': ['EQUITY', 'BND'],
        'compValuesLabel': ['EQUITY', 'BOND'],
        'customSectorType': 'Fund',
        'ruleType': 'Rule'
    };

    beforeAll(() => ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.COLUMN_SECTOR_RULE, ColumnSectorRule));
    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });
    /**
     * Test case for method save
     */
    it('Test serialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const investmentUniversePortfolio = new InvestmentUniversePortfolio({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: 'IP',
            isFrozen: true,
            filter: new CustomSector({rule})
        });
        investmentUniversePortfolio.portfolio = 'IP';
        investmentUniversePortfolio.isBench = false;

        const investmentUniversePortfolioToSave = investmentUniversePortfolio.serialize();
        const expectedDataToSave = {
            ...getData(),
            filter: {
                'breakdown': {
                    'subSectors': [{
                        'breakdownRuleType': 'CustomSector',
                        'includeOtherBucket': true,
                        rule,
                        'title': ' '
                    }]
                },
                'title': ' '
            }
        };
        expect(JSON.stringify(investmentUniversePortfolioToSave)).toEqual(JSON.stringify(expectedDataToSave));
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', () => {
        const investmentUniversePortfolio = new InvestmentUniversePortfolio({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: 'IP',
            isFrozen: true,
            portfolio: 'IP',
            isBench: false,
            filter: new CustomSector({rule})
        });

        expect(investmentUniversePortfolio.id).toEqual('123');
        expect(investmentUniversePortfolio.enabled).toEqual(true);
        expect(investmentUniversePortfolio.type).toEqual(InvestmentUniverseConstants.PORTFOLIO);
        expect(investmentUniversePortfolio.label).toEqual('IP');
        expect(investmentUniversePortfolio.isFrozen).toEqual(true);
        expect(investmentUniversePortfolio.portfolio).toEqual('IP');
        expect(investmentUniversePortfolio.isBench).toEqual(false);
        expect(investmentUniversePortfolio.isBench).toEqual(false);
        expect(investmentUniversePortfolio.filter.isFilterEmpty()).toBeFalsy();
    });


    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const investmentUniversePortfolio1 = new InvestmentUniversePortfolio({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: 'IP',
            isFrozen: true
        });
        investmentUniversePortfolio1.portfolio = 'IP';
        investmentUniversePortfolio1.isBench = false;

        const investmentUniversePortfolio2 = new InvestmentUniversePortfolio({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: 'IP',
            isFrozen: true,
            filter: new CustomSector({rule})
        });
        investmentUniversePortfolio2.portfolio = 'IP';
        investmentUniversePortfolio2.isBench = false;

        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);

        investmentUniversePortfolio1.filter = new CustomFilter();
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);

        investmentUniversePortfolio1.filter.deserialize({filter: new CustomSector({rule})});
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(true);

        investmentUniversePortfolio2.label = '453543453';
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);

        investmentUniversePortfolio2.enabled = false;
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);

        investmentUniversePortfolio2.type = InvestmentUniverseConstants.SECURITY;
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);

        investmentUniversePortfolio2.isFrozen = false;
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);

        investmentUniversePortfolio2.id = '243234234234';
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);

        investmentUniversePortfolio2.portfolio = 'PEP';
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);

        investmentUniversePortfolio2.isBench = true;
        expect(investmentUniversePortfolio1.equals(investmentUniversePortfolio2)).toBe(false);
    });


    function getData() {
        return {
            'enabled': true,
            'type': 'Portfolio',
            'label': 'IP',
            'isFrozen': true,
            'portfolio': 'IP',
            'isBench': false
        };
    }
});
