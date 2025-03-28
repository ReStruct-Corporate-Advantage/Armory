import {TestBed} from '@angular/core/testing';
import {ExploreConstants} from '@constants/explore.constants';
import {MandateSettings} from '@models/mandate/mandate-settings.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Widget} from '@models/widget/widget.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Report} from '@models/workspace/report.model';
import {BehaviorSubject, of} from 'rxjs';
import {WorkspaceStore} from '@stores/workspace.store';
import {PortfolioService} from '@services/portfolio';
import {ReportService} from './report.service';
import {WorkpadService} from './workpad.service';
import {cloneDeep} from 'lodash';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {CommonUtils, DateValue, FavoriteType} from '@blk/explore-ui-core';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';

describe('WorkpadService', () => {
    let service: WorkpadService;

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn()
    };

    const reportServiceStub = {
        addCuratedReports$: jest.fn()
    };

    const workpad1 = new FlatWorkpad();
    const workpad2 = new ReportGroup();
    const port1 = new Portfolio('PEP');
    port1.benchmark = new Benchmark();
    const port2 = new Portfolio('IP');
    const port3 = new Portfolio('CORE-HQ');
    const report1 = new Report();
    const report2 = new Report();

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: ReportService, useValue: reportServiceStub}
            ]
        });
        service = TestBed.inject(WorkpadService);
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue(-0.999999);

        workpad1.portfolio = port1;
        workpad1.reports = [report1];
        workpad2.portfolios = [port2, port3];
        workpad2.reports = [report2];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createFlatWorkpad Test', () => {
        it('should create a flatWorkpad', () => {
            WorkspaceStore.init();
            jest.spyOn(service['reportService'], 'addCuratedReports$').mockReturnValue(of({}));
            let newFlatWorkpad = service.createFlatWorkpad(port1);
            WorkspaceStore.updateCurrentWorkpad(newFlatWorkpad);
            newFlatWorkpad.activeReport = newFlatWorkpad.reports[0];
            expect(WorkspaceStore.getCurrentWorkpad()).toStrictEqual(newFlatWorkpad);
            expect(WorkspaceStore.getCurrentPortfolio()).toStrictEqual(port1);
            expect(newFlatWorkpad.reports.length).toBe(1);
            expect(newFlatWorkpad.reports[0].title.startsWith(ExploreConstants.NEW_REPORT_TITLE)).toBeTruthy();

            // Add some curated views and make sure the correct path is taken.
            port1.mandateSettings = new MandateSettings();
            port1.mandateSettings.settings.set(FavoriteType.CURATED_REPORTS, ['1', '2']);
            newFlatWorkpad = service.createFlatWorkpad(port1);
            delete newFlatWorkpad.reports[0].key;
            delete WorkspaceStore.getCurrentWorkpad().reports[0].key;
            expect(WorkspaceStore.getCurrentPortfolio()).toStrictEqual(port1);
            expect(service['reportService'].addCuratedReports$).toHaveBeenCalled();
        });
    });

    describe('fetchAllPortfolios$ Test', () => {
        it('should fetch all portfolio in a workpad', () => {
            const reportGroup = new ReportGroup();
            const portfolio = new Portfolio('PEP');
            const customPortfolio = new AdhocPortfolio('Custom Portfolio', undefined, new AdhocPortParams());
            const portfolio2 = new Portfolio('IP');
            reportGroup.portfolios = [portfolio, customPortfolio];
            const report = new Report('report 1');
            report.comparisonConfigId = 1;
            reportGroup.reports.push(report);

            const comparisonConfig: ComparisonConfig = new ComparisonConfig();
            comparisonConfig.portComparisonList = [portfolio.portId, customPortfolio.portId];

            reportGroup.comparisonConfigMap.set(report.comparisonConfigId, comparisonConfig);

            jest.spyOn(service['portfolioService'], 'fetchPortfolioInformation$');
            service['fetchAllPortfolios$'](reportGroup);
            expect(service['portfolioService'].fetchPortfolioInformation$).toHaveBeenCalledWith(portfolio, {isLightVersion: true, includeMandate: true});
            expect(service['portfolioService'].fetchPortfolioInformation$).toHaveBeenCalledWith(customPortfolio, {isLightVersion: true, includeMandate: true}, false, customPortfolio.adhocParams);
            expect(service['portfolioService'].fetchPortfolioInformation$).toHaveBeenCalledTimes(2);
        });

        it('Test fetchAllPortfolios$ retains port date', () => {
            const reportGroup = new ReportGroup();
            const date = new DateValue();
            date.date = '05/05/2020';
            date.calCode = 'GreenPkg';
            date.dateString = false;
            reportGroup.portfolios = [new Portfolio('PEP', date)];
            jest.spyOn(service['portfolioService'], 'fetchPortfolioInformation$');
            service['fetchAllPortfolios$'](reportGroup);
            expect(service['portfolioService'].fetchPortfolioInformation$).toHaveBeenCalledWith(reportGroup.portfolios[0], {isLightVersion: true, includeMandate: true});
        });
    });

    describe('updatePortInfoOnDateChange Tests', () => {
        const newDateObject: DateValue = new DateValue({
            date: '01/24/2020',
            calCode: 'GP_HK_STD',
            dateString: true,
            dateStringValue: 'T-5'
        });
        const expectedPortfolio1: Portfolio = new Portfolio(
            'PEP',
            new DateValue({date: '01/24/2020', calCode: 'GP_HK_STD', dateString: true, dateStringValue: 'T-5'})
        );
        const expectedPortfolio2: Portfolio = new Portfolio(
            'IP',
            new DateValue({date: '01/24/2020', calCode: 'GP_HK_STD', dateString: true, dateStringValue: 'T-5'})
        );

        beforeEach(() => {
            WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(port1);
            WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(undefined);
            WorkspaceStore.currentWidget$ = new BehaviorSubject<Widget>(undefined);

            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad').mockClear();
            jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio').mockClear();
            jest.spyOn(WorkspaceStore, 'updateCurrentReport').mockClear();
        });

        it('should update the current portfolio information on date change of a portfolio, and update current object state ONLY ONCE', () => {
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad1);

            const portObject = cloneDeep(port1);
            portObject.datePicker = newDateObject;

            portfolioServiceStub.fetchPortfolioInformation$.mockReturnValueOnce(of(expectedPortfolio1));
            service.updatePortInfoOnDateChange([port1], newDateObject);

            expect(portfolioServiceStub.fetchPortfolioInformation$).toHaveBeenCalledWith(portObject, {isLightVersion: true, includeMandate: true}, undefined, undefined, undefined);
            expect(WorkspaceStore.getCurrentPortfolio()).toEqual(expectedPortfolio1);
            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(1);
        });

        it('should update only that portfolio in the report group whose date has been changed and update current object state ONLY ONCE', () => {
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad2);
            portfolioServiceStub.fetchPortfolioInformation$
                .mockReturnValueOnce(of(expectedPortfolio2));

            port2.benchmark = new Benchmark();
            service.updatePortInfoOnDateChange([port2], newDateObject);

            expect(WorkspaceStore.getCurrentWorkpad().getAllPortfolios()).toEqual([expectedPortfolio2, port3]);
            expect(WorkspaceStore.getCurrentPortfolio()).toEqual(expectedPortfolio2);
            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(1);
        });

        it('should update the current portfolio information but retain the benchmark information on date change of a portfolio', () => {
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad1);
            const benchmark = new Benchmark({type: 'Other'});

            const portObject = cloneDeep(port1);
            portObject.benchmark = benchmark;

            portfolioServiceStub.fetchPortfolioInformation$.mockReturnValueOnce(of(expectedPortfolio1));
            service.updatePortInfoOnDateChange([portObject], newDateObject);

            expect(WorkspaceStore.getCurrentPortfolio().benchmark).toEqual(benchmark);
        });

        it('should clear holding changes for rule based portfolio in the report group whose date has been changed and update current object state ONLY ONCE', () => {
            const holdingChanges = [new PortfolioSecurityHoldingChange({isNavNeutral: true})];
            const tradeRules = [new SecurityRule("ABC",50)];
            // old port
            const oldPort: RulesBasedPortfolio = new RulesBasedPortfolio(
                'IP',
                'IP',
                new DateValue({
                    date: '01/23/2020',
                    calCode: 'GP_HK_STD',
                    dateString: true,
                    dateStringValue: 'T-5'
                })
            );
            oldPort.compositionRules.tradeRules = tradeRules;
            oldPort.holdingChanges = cloneDeep(holdingChanges);
            oldPort.benchmark = new Benchmark();

            //portfolioservice input port with cleared existing holding changes
            const ruleBasedPort = cloneDeep(oldPort);
            ruleBasedPort.datePicker = newDateObject;
            ruleBasedPort.compositionRules.tradeRules = tradeRules;
            ruleBasedPort.holdingChanges = [];

            //expected port
            const expectedPort: RulesBasedPortfolio = cloneDeep(oldPort);
            ruleBasedPort.datePicker = newDateObject;
            expectedPort.compositionRules.tradeRules = tradeRules;
            expectedPort.holdingChanges = cloneDeep(holdingChanges); // new holding chnages

            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad2);
            workpad2.portfolios = [expectedPort];
            WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(expectedPort);
            portfolioServiceStub.fetchPortfolioInformation$.mockReturnValueOnce(of(expectedPort));

            service.updatePortInfoOnDateChange([oldPort], newDateObject);

            expect(portfolioServiceStub.fetchPortfolioInformation$).toHaveBeenCalledWith(ruleBasedPort, {isLightVersion: true, includeMandate: true}, undefined, undefined, ruleBasedPort.compositionRules.tradeRules);

            expect(WorkspaceStore.getCurrentWorkpad().getAllPortfolios()).toEqual([expectedPort]);
            expect(WorkspaceStore.getCurrentPortfolio()).toEqual(expectedPort);
            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
            expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(1);
        });
    });
});
