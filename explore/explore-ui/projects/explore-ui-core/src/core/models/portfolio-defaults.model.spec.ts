import {PortfolioDefaults} from './portfolio-defaults.model';

describe('Portfolio Defaults Model', () => {
    it('should be created - without data', () => {
        expect(new PortfolioDefaults()).toBeTruthy();
    });

    it('should be created - with empty data', () => {
        const portfolioDefaults: PortfolioDefaults = new PortfolioDefaults({});
        expect(portfolioDefaults).toBeTruthy();
        expect(portfolioDefaults.defaultVarType).toBeUndefined();
        expect(portfolioDefaults.calendar).toBeUndefined();
        expect(portfolioDefaults.defaultModelCode).toBeUndefined();
        expect(portfolioDefaults.defaultDecay).toBeUndefined();
    });

    it('should be created - with data', () => {
        const portDefaultsNoData: PortfolioDefaults = new PortfolioDefaults({
            defaultVarType: 'DLY',
            calendar: 'GP_HK_STD',
            defaultModelCode: 'DEFAULT',
            defaultDecay: 0.982820599,
            liquidityDefaults: {
                'sec_22e4_scen1': 10,
                'sec_22e4_scen2': 5
            }
        });
        expect(portDefaultsNoData).toBeTruthy();
        expect(portDefaultsNoData.defaultVarType).toBe('DLY');
        expect(portDefaultsNoData.calendar).toBe('GP_HK_STD');
        expect(portDefaultsNoData.defaultModelCode).toBe('DEFAULT');
        expect(portDefaultsNoData.defaultDecay).toBe(0.982820599);
        expect(portDefaultsNoData.liquidityDefaults).toStrictEqual({
            'sec_22e4_scen1': 10,
            'sec_22e4_scen2': 5
        });
    });
});
