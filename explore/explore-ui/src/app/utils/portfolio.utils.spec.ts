import {DateValue, ExpostSettings} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioUtils} from './portfolio.utils';

describe('PortfolioUtils', () => {
    describe('updateConfigType Test', () => {
        it('should set data`s configType to "portfolio"', () => {
            const portData: any = {
                ticker: 'FIGACY-AGG',
                currency: 'USD',
                splitPositionTypes: 'O,SW,XC,XF,XH,XS',
                lookthroughSettings: {
                    isLookThroughEnabled: false,
                    ltSecurityTypes: 'FUTURE_INDEX,FUND,ETF',
                    ltProxies: 'RISK_PROXY,FUND'
                },
                benchmark: {type: 'RISK', order: 1},
                datePicker: {calCode: 'GreenPkg', dateString: true, dateStringValue: 'T-1'},
                filter: {}
            };
            PortfolioUtils.updateConfigType(portData);

            expect(portData.configType).toBe('portfolio');
        });

        it('should set data`s configType to "adhocportgroup"', () => {
            const portData: any = {
                ticker: 'FIGACY-AGG',
                currency: 'USD',
                splitPositionTypes: 'O,SW,XC,XF,XH,XS',
                lookthroughSettings: {
                    isLookThroughEnabled: false,
                    ltSecurityTypes: 'FUTURE_INDEX,FUND,ETF',
                    ltProxies: 'RISK_PROXY,FUND'
                },
                benchmark: {type: 'RISK', order: 1},
                datePicker: {calCode: 'GreenPkg', dateString: true, dateStringValue: 'T-1'},
                filter: {},
                isWhatIfPortfolio: true,
                adhocParams: {isPortGroup: true}
            };
            PortfolioUtils.updateConfigType(portData);

            expect(portData.configType).toBe('adhocPortGroup');
        });

        it('should set data`s configType to "what-ifportfolio"', () => {
            const portData: any = {
                ticker: 'FIGACY-AGG',
                currency: 'USD',
                splitPositionTypes: 'O,SW,XC,XF,XH,XS',
                lookthroughSettings: {
                    isLookThroughEnabled: false,
                    ltSecurityTypes: 'FUTURE_INDEX,FUND,ETF',
                    ltProxies: 'RISK_PROXY,FUND'
                },
                benchmark: {type: 'RISK', order: 1},
                datePicker: {calCode: 'GreenPkg', dateString: true, dateStringValue: 'T-1'},
                filter: {},
                isWhatIfPortfolio: true,
                modellingType: 0
            };
            PortfolioUtils.updateConfigType(portData);

            expect(portData.configType).toBe('WHATIF_RULES');
        });
    });

    it('Test getAllLeafLevelPortfolios', () => {
        // Top level port
        const portfolio1 = new Portfolio('Port 1');
        // 3 child portfolios
        const portfolio2 = new Portfolio('Port 2');
        const portfolio3 = new Portfolio('Port 3');
        const portfolio4 = new Portfolio('Port 4');
        portfolio1.portfolios = [portfolio2, portfolio3, portfolio4];
        // First child of portfolio2
        const portfolio5 = new Portfolio('Port 5');
        portfolio2.portfolios = [portfolio5];
        // First child of portfolio3
        const portfolio6 = new Portfolio('Port 6');
        portfolio3.portfolios = [portfolio6];

        const leafLevelPorts = PortfolioUtils.getAllLeafLevelPortfolios(portfolio1);
        expect(leafLevelPorts.length).toEqual(3);
        expect(leafLevelPorts[0]).toEqual(portfolio5);
        expect(leafLevelPorts[1]).toEqual(portfolio6);
        expect(leafLevelPorts[2]).toEqual(portfolio4);
    });

    it('Test copyPortfolioSettingsToPortfolios', () => {
        const originalPort = new Portfolio('PEP', new DateValue({
            date: '04/01/2020',
            calCode: 'GP_HK_STD',
            dateString: false,
            dateStringValue: ''
        }));
        originalPort.expostSettings = new ExpostSettings();
        originalPort.portfolioRiskSettings = new RiskSettings();
        originalPort.applyFilterTo = 'TEST applyFilterTo';

        const otherPort = new Portfolio('IP');
        // Test that the otherPort should default to certain things
        expect(otherPort.expostSettings).toBeUndefined();
        expect(otherPort.portfolioRiskSettings).toBeUndefined();
        expect(otherPort.applyFilterTo).toEqual('BOTH');
        PortfolioUtils.copyPortfolioSettingsToPortfolios(originalPort, [otherPort]);
        expect(otherPort.expostSettings).toEqual(originalPort.expostSettings);
        expect(otherPort.portfolioRiskSettings).toEqual(originalPort.portfolioRiskSettings);
        expect(otherPort.applyFilterTo).toEqual(originalPort.applyFilterTo);
    });

    it('tests revertBenchmark', () => {
        const port = new Portfolio();
        port.benchmark = new Benchmark();
        PortfolioUtils.revertBenchmark(port, new Benchmark({
            name: 'abc',
            type: 'other',
            order: 2
        }));
        expect(port.benchmark.name).toBe('abc');
        expect(port.benchmark.type).toBe('other');
        expect(port.benchmark.order).toBe(2);

        // no previous benchmark
        PortfolioUtils.revertBenchmark(port, null);
        expect(port.benchmark.name).toBeUndefined();
        expect(port.benchmark.type).toBe('None');
        expect(port.benchmark.order).toBeUndefined();
    });


    it('should encode and decode portfolio object', () => {
        const mockSerializedPortfolio = new Portfolio();
        mockSerializedPortfolio.portName = 'Test Portfolio';
        const base64String = PortfolioUtils.encodePortfolio(mockSerializedPortfolio);
        const decodedPortfolio = PortfolioUtils.decodePortfolio(base64String);

        expect(decodedPortfolio.portName).toBe('Test Portfolio');
    });
});
