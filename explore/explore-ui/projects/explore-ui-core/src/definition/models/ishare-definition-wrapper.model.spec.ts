import {IShareDefinitionWrapper} from './ishare-definition-wrapper.model';

/**
 * Test Case file of Ishare Definition Wrapper Details
 */
describe('Ishare Definition Wrapper Test case file', () => {

    it('Deserialize test', () => {
        const data = [{
            "name": "Core ETFs",
            "data": [{
                "cusip": "464287150",
                "name": "ITOT - iShares Core S&P Total U.S. Stock Market ETF",
                "ticker": "ITOT"
            },
                {
                    "cusip": "464287200",
                    "name": "IVV - iSha Core S&P 500 ETFres",
                    "ticker": "IVV"
                }
            ]
        },
            {
                "name": "Equity",
                "data": [{
                    "name": "US Market Cap/Style",
                    "data": [{
                        "name": "Broad Market",
                        "data": [{
                            "cusip": "464287689",
                            "name": "IWV - iShares Russell 3000 ETF",
                            "ticker": "IWV"
                        },
                            {
                                "cusip": "464287846",
                                "name": "IYY - iShares Dow Jones U.S. ETF",
                                "ticker": "IYY"
                            }
                        ]
                    }]
                }]
            }
        ];
        const iShareDefinitionWrapper1 = new IShareDefinitionWrapper();
        iShareDefinitionWrapper1.deserialize(data[0]);
        expect(iShareDefinitionWrapper1.iShareDefinitions.length).toBe(2);
        expect(iShareDefinitionWrapper1.iShareDefinitions[0].cusip).toBe('464287150');
        expect(iShareDefinitionWrapper1.iShareDefinitions[0].title).toBe('ITOT - iShares Core S&P Total U.S. Stock Market ETF');
        expect(iShareDefinitionWrapper1.iShareDefinitions[0].columnTag).toBe('ITOT');
        expect(iShareDefinitionWrapper1.iShareDefinitions[1].cusip).toBe('464287200');
        expect(iShareDefinitionWrapper1.iShareDefinitions[1].title).toBe('IVV - iSha Core S&P 500 ETFres');
        expect(iShareDefinitionWrapper1.iShareDefinitions[1].columnTag).toBe('IVV');


        const iShareDefinitionWrapper2 = new IShareDefinitionWrapper();
        iShareDefinitionWrapper2.deserialize(data[1]);
        expect(iShareDefinitionWrapper2.iShareDefinitions.length).toBe(2);
        expect(iShareDefinitionWrapper2.iShareDefinitions[0].cusip).toBe('464287689');
        expect(iShareDefinitionWrapper2.iShareDefinitions[0].title).toBe('IWV - iShares Russell 3000 ETF');
        expect(iShareDefinitionWrapper2.iShareDefinitions[0].columnTag).toBe('IWV');
        expect(iShareDefinitionWrapper2.iShareDefinitions[1].cusip).toBe('464287846');
        expect(iShareDefinitionWrapper2.iShareDefinitions[1].title).toBe('IYY - iShares Dow Jones U.S. ETF');
        expect(iShareDefinitionWrapper2.iShareDefinitions[1].columnTag).toBe('IYY');

    });
});
