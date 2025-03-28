import {WorkspaceStore} from '../stores';
import {ReportGroup} from '../models/workspace/report-group.model';
import {Portfolio} from '../models/portfolio/portfolio.model';
import {FlatWorkpad} from '../models/workspace/flat-workpad.model';
import {CompositionConstants} from '../constants';
import {WhatIfPortfolio} from '../models/portfolio/what-if-portfolio.model';
import {TestUtils} from '@utils/test.utils';
import {WorkpadUtils} from './workpad.utils';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {ComparisonConfig} from '../models/config/comparison-config.model';
import {Report} from '../models/workspace/report.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {WorkpadType} from '@enums/workpad-type.enum';

/**
 * Test cases for class WorkpadUtils
 */
describe('WorkpadUtils', () => {

    beforeAll((done: any) => {
        WorkspaceStore.init();
        TestUtils.initialize(done);
    });

    describe('tests dragPortfolioFromReportGroupToWorkspace', () => {
        it('Single report group with dummy portfolios - Drop on TOP of the same report group', () => {
            const reportGroup = getDummyReportGroup();
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue({workpads: [reportGroup]});

            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(1);
            confirmInitialPositionsOfReportGroupInWorkspace(0);

            WorkpadUtils.dragPortfolioFromReportGroupToWorkspace(0, 0, 0, WorkpadType.REPORT_GROUP, 'TOP');
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(2);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios().length).toBe(1);
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios().length).toBe(2);

            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].getDisplayTitle()).toBe('PEP');

            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios()[0].getDisplayTitle()).toBe('SNP500');
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios()[1].getDisplayTitle()).toBe('OBSID');
        });
        it('Single report group with dummy portfolios - Drop BOTTOM of the report group', () => {
            const reportGroup = getDummyReportGroup();
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue({workpads: [reportGroup]});

            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(1);
            confirmInitialPositionsOfReportGroupInWorkspace(0);

            WorkpadUtils.dragPortfolioFromReportGroupToWorkspace(0, 0, 0, WorkpadType.REPORT_GROUP, 'BOTTOM');
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(2);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios().length).toBe(2);
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios().length).toBe(1);

            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].getDisplayTitle()).toBe('SNP500');
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[1].getDisplayTitle()).toBe('OBSID');
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios()[0].getDisplayTitle()).toBe('PEP');
        });
        it('drop on top of a dummy flat workpad', () => {
            const flatWorkpad = getDummyFlatWorkpad();
            const reportGroup = getDummyReportGroup();

            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue({workpads: [flatWorkpad, reportGroup]});
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(2);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios().length).toBe(1);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].getDisplayTitle()).toBe('BIMP');
            confirmInitialPositionsOfReportGroupInWorkspace(1);

            WorkpadUtils.dragPortfolioFromReportGroupToWorkspace(1, 1, 0, WorkpadType.FLAT);

            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(3);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios().length).toBe(1);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].getDisplayTitle()).toBe('SNP500');
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios().length).toBe(1);
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios()[0].getDisplayTitle()).toBe('BIMP');

            expect(WorkspaceStore.getWorkspace().workpads[2].getAllPortfolios().length).toBe(2);
            expect(WorkspaceStore.getWorkspace().workpads[2].getAllPortfolios()[0].getDisplayTitle()).toBe('PEP');
            expect(WorkspaceStore.getWorkspace().workpads[2].getAllPortfolios()[1].getDisplayTitle()).toBe('OBSID');
        });
        it('drop below bottom of a dummy flat workpad', () => {
            const flatWorkpad = getDummyFlatWorkpad();
            const reportGroup = getDummyReportGroup();

            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue({workpads: [reportGroup, flatWorkpad]});
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(2);
            confirmInitialPositionsOfReportGroupInWorkspace(0);

            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios().length).toBe(1);
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios()[0].getDisplayTitle()).toBe('BIMP');

            WorkpadUtils.dragPortfolioFromReportGroupToWorkspace(2, 0, 1, WorkpadType.FLAT);

            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(3);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios().length).toBe(2);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].getDisplayTitle()).toBe('PEP');
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[1].getDisplayTitle()).toBe('SNP500');
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios().length).toBe(1);
            expect(WorkspaceStore.getWorkspace().workpads[1].getAllPortfolios()[0].getDisplayTitle()).toBe('BIMP');

            expect(WorkspaceStore.getWorkspace().workpads[2].getAllPortfolios().length).toBe(1);
            expect(WorkspaceStore.getWorkspace().workpads[2].getAllPortfolios()[0].getDisplayTitle()).toBe('OBSID');
        });

        function getDummyReportGroup(): ReportGroup {
            const reportGroup = new ReportGroup();
            reportGroup.addPortfolios(new Portfolio('PEP'));
            reportGroup.addPortfolios(new Portfolio('SNP500'));
            reportGroup.addPortfolios(new Portfolio('OBSID'));
            return reportGroup;
        }

        function getDummyFlatWorkpad(): FlatWorkpad {
            const flatWorkpad = new FlatWorkpad();
            flatWorkpad.portfolio = new Portfolio('BIMP');
            return flatWorkpad;
        }

        function confirmInitialPositionsOfReportGroupInWorkspace(idx: number) {
            expect(WorkspaceStore.getWorkspace().workpads[idx].getAllPortfolios().length).toBe(3);

            expect(WorkspaceStore.getWorkspace().workpads[idx].getAllPortfolios()[0].getDisplayTitle()).toBe('PEP');
            expect(WorkspaceStore.getWorkspace().workpads[idx].getAllPortfolios()[1].getDisplayTitle()).toBe('SNP500');
            expect(WorkspaceStore.getWorkspace().workpads[idx].getAllPortfolios()[2].getDisplayTitle()).toBe('OBSID');
        }
    });

    describe('tests addWhatIfPortfolio', () => {
        it('report group with portfolio object', () => {
            WorkspaceStore.currentWorkpad$.next(new ReportGroup({
                reports: [{}],
                portfolios: [{ticker: 'PEP'}]
            }));
            WorkspaceStore.currentPortfolio$.next(WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0]);
            WorkpadUtils.addWhatIfPortfolioAndShowComposition();
            expect(WorkspaceStore.getCurrentWorkpad().getAllPortfolios().length).toBe(2);
            const port: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0];
            const whatIfPort: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[1];
            expect(whatIfPort.title === 'What-if PEP 1').toBeTruthy();
            addWhatIfCommonChecks(port, whatIfPort);
        });

        it('flat workpad with portfolio object', () => {
            WorkspaceStore.currentWorkpad$.next(new FlatWorkpad({
                reports: [{}],
                portfolio: {ticker: 'PEP'}
            }));
            WorkspaceStore.currentPortfolio$.next(WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0]);
            WorkpadUtils.addWhatIfPortfolioAndShowComposition();
            expect(WorkspaceStore.getCurrentWorkpad().getAllPortfolios().length).toBe(2);
            const port: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0];
            const whatIfPort: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[1];
            expect(whatIfPort.title === 'What-if PEP 1').toBeTruthy();
            addWhatIfCommonChecks(port, whatIfPort);
        });

        it('flat workpad with rule based portfolio object', () => {
            WorkspaceStore.currentWorkpad$.next(new FlatWorkpad({
                reports: [{}],
                portfolio: {ticker: 'PEP', configType: CompositionConstants.WHATIF_RULES.TYPE}
            }));
            WorkspaceStore.currentPortfolio$.next(WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0]);
            WorkpadUtils.addWhatIfPortfolioAndShowComposition();
            expect(WorkspaceStore.getCurrentWorkpad().getAllPortfolios().length).toBe(2);
            const port: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0];
            const whatIfPort: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[1];
            expect(whatIfPort.title === 'What-if PEP-Portfolio with Rules/Filter 1').toBeTruthy();
            addWhatIfCommonChecks(port, whatIfPort);
        });

        it('flat workpad with Adhoc portfolio object', () => {
            WorkspaceStore.currentWorkpad$.next(new FlatWorkpad({
                reports: [{}],
                portfolio: {
                    portfolio: 'test_ticker',
                    fullPortfolioName: 'test_fullname',
                    portfolioIdentifier: 'test_name',
                    forDate: '03/10/2016',
                    currency: 'USD',
                    holidayCalendar: 'GreenPkg',
                    includeAliasPortfolios: false,
                    splitPositionTypes: '',
                    date: '01/01/2020',
                    adhocParams: {
                        name: 'Adhoc IP',
                        fullName: 'Adhoc International Paper',
                        currency: 'JPY',
                        portMktNotional: 300000,
                        date: {date: '01/01/2020', dateString: false}
                    },
                    configType:'adhocPortfolio'
                }
            }));
            WorkspaceStore.currentPortfolio$.next(WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0]);
            WorkpadUtils.addWhatIfPortfolioAndShowComposition();
            expect(WorkspaceStore.getCurrentWorkpad().getAllPortfolios().length).toBe(2);
            const port: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0];
            const whatIfPort: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[1];
            expect(whatIfPort instanceof AdhocPortfolio).toBeTruthy();
            addWhatIfCommonChecks(port, whatIfPort);
        });

        it('flat workpad with portfolio with positions object', () => {
            WorkspaceStore.currentWorkpad$.next(new FlatWorkpad({
                reports: [{}],
                portfolio: {
                    ticker: 'PEP',
                    type: CompositionConstants.WHATIF_POS.TYPE,
                    date: '09/05/2018',
                    title: 'position based PEP'
                }
            }));
            WorkspaceStore.currentPortfolio$.next(WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0]);
            WorkpadUtils.addWhatIfPortfolioAndShowComposition();
            expect(WorkspaceStore.getCurrentWorkpad().getAllPortfolios().length).toBe(2);
            const port: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[0];
            const whatIfPort: Portfolio = WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[1];
            expect(whatIfPort.title === 'What-if position based PEP 1').toBeTruthy();
            addWhatIfCommonChecks(port, whatIfPort);
        });

        function addWhatIfCommonChecks(port, whatIfPort) {
            expect(port.portName === whatIfPort.portName).toBeTruthy();
            expect(port === (whatIfPort as WhatIfPortfolio).parentPortfolio).toBeTruthy();
            expect(WorkspaceStore.getCurrentPortfolio() === whatIfPort).toBeTruthy();
        }
    });

    it('getPortfoliosToCompare test case', () => {
        const report = new Report();
        report.title = "report 1"
        report.comparisonConfigId = 1;
        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['PEP1234567', 'WhatIfPEP1234567'];
        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(report.comparisonConfigId, comparisonConfig);
        const workpad: FlatWorkpad = new FlatWorkpad({
            reports: [{}],
            portfolio: {ticker: 'PEP'},
        });
        workpad.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$.next(workpad);
        // List of different portfolios
        const port1 = new Portfolio();
        port1.portId = 'PEP1234567';
        const port2 = new Portfolio();
        port2.portId = 'PEP345678';
        const whatIfPort = new PortfolioWithPositions();
        whatIfPort.portId = 'WhatIfPEP1234567';

        const portfolios: Portfolio[] = [port1, whatIfPort, port2];
        const multiPortfolioData = WorkpadUtils.getPortfoliosToCompare(report, portfolios);
        expect(multiPortfolioData.length).toBe(2);
        expect(multiPortfolioData[0]).toStrictEqual(port1);
        expect(multiPortfolioData[1]).toStrictEqual(whatIfPort);
        // port 2 not there in config so multiPortfolioData will not contain port2
        expect(multiPortfolioData.includes(port2)).toBeFalsy();
    });
});
