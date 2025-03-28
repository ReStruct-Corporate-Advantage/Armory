import {Benchmark} from './benchmark.model';
import * as portMockJson from '../../../../mocks/portMock.json';
import * as benchMockJson from '../../../../mocks/benchMock.json';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {CompositionRule} from '@models/portfolio/composition/composition-rule.model';
import {DateValue} from '@blk/explore-ui-core';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';

describe('Benchmark', () => {
    it('test serialize/deserialize', () => {
        const benchMock: any = JSON.parse(JSON.stringify(benchMockJson));
        benchMock['portfolio'] = portMockJson;
        const bench: Benchmark = new Benchmark(benchMock);
        const serializedBench: any = bench.serialize();
        expect(new Benchmark(serializedBench).equals(bench)).toBeTruthy();
    });

    it('tests addRequestParams', () => {
        const requestParams = {};
        const benchMark: Benchmark = new Benchmark();
        benchMark.portfolio = new RulesBasedPortfolio('PEP', 'Rule Based Pep 1', new DateValue({data: '09/04/2018'}));
        benchMark.portfolio.isBench = true;
        benchMark.portfolio.id = 126;
        (benchMark.portfolio as RulesBasedPortfolio).holdingChanges = [new PortfolioSecurityHoldingChange({lineItem: 'abc', changeInWeight: 23, newWeight: 43, isCashOffsetRequired: true})];
        (benchMark.portfolio as RulesBasedPortfolio).compositionRules = new CompositionRule();
        (benchMark.portfolio as RulesBasedPortfolio).compositionRules.tradeRules = [new SecurityRule('037833100', 0)];
        benchMark.addRequestParams(requestParams);
        expect(requestParams).toStrictEqual({
            benchSelection: undefined,
            benchOrder: undefined,
            benchmarkHoldingChanges: [{
                lineItem: 'abc',
                isCashOffsetRequired: true,
                isOptoGeneratedChange: undefined,
                changeInWeight: 23,
                newWeight: 43,
                changeType: 'Security',
                newMV: undefined,
                newNotional: undefined,
                newQuantity: undefined,
                newParValue: undefined,
                newCurrentFace: undefined,
                newDeltaAdjNMV: undefined,
                newAdjNMV: undefined,
                changeInMarketValue: undefined,
                changeInNotional: undefined,
                changeInQuantity: undefined,
                changeInParValue: undefined,
                changeInCurrentFace: undefined,
                changeInDeltaAdjNMV: undefined,
                changeInWeightRelToMainPort: undefined,
                addedDuringWhatIfInitialization: undefined,
                tradeSize: undefined,
                portfolioName: undefined,
                isNavNeutral: undefined,
                isNotionalCash: undefined,
                convertFlag: undefined,
                requiresBenchData: undefined,
                secDesc: undefined,
                isChildChange: undefined
            }],
            benchmarkRules: '[{\"lineItem\":\"037833100\",\"newWeight\":0,\"ruleType\":\"Security\"}]'
        });
    });

    it ('tests addRequestParams - adhoc port', () => {
        const benchMark: Benchmark = new Benchmark();
        benchMark.portfolio = new AdhocPortfolio();
        (benchMark.portfolio as AdhocPortfolio).adhocParams = new AdhocPortParams({
            name: 'a',
            date: DateValue.newRelativeDate('T-1'),
            fullName: 'b',
            currency: 'c',
            portMktNotional: 1,
            isPortGroup: false
        });

        const reqParams: any = {};
        benchMark.addRequestParams(reqParams);
        expect(reqParams).toStrictEqual({
            benchSelection: undefined,
            benchOrder: undefined,
            benchmarkHoldingChanges: [],
            benchmarkAdhocParams: {
                name: 'a',
                fullName: 'b',
                currency: 'c',
                date: { dateString: true, dateStringValue: 'T-1' },
                portMktNotional: 1,
                isPortGroup: false
            }
        });
    });
});
