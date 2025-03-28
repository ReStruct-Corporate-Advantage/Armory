import {BehaviorSubject} from 'rxjs';
import {WorkspaceStore} from './workspace.store';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Workspace} from '@models/workspace/workspace.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {Widget} from '@models/widget/widget.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {TestUtils} from '@utils/test.utils';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {ComparisonConfig} from '@models/config/comparison-config.model';

describe('WorkspaceStore', () => {
    const workspace = new Workspace();
    const flatWorkpad1 = new FlatWorkpad();
    const flatWorkpad2 = new FlatWorkpad();
    const reportGroup = new ReportGroup();
    const portfolio1 = new Portfolio('PEP');
    const portfolio2 = new Portfolio('IP');
    const report1 = new Report('report1');
    const report2 = new Report('report2');
    const report3 = new Report('report3');

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        workspace.workpads = [flatWorkpad1, flatWorkpad2, reportGroup];
        flatWorkpad1.portfolio = portfolio1;
        flatWorkpad1.reports = [report1];
        flatWorkpad2.portfolio = portfolio2;
        flatWorkpad2.reports = [report2];
        reportGroup.portfolios = [portfolio1, portfolio2];
        reportGroup.reports = [report3];
        reportGroup.isUserCreated = false;

        WorkspaceStore.workspace$ = new BehaviorSubject<Workspace>(workspace);
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(flatWorkpad1);
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(portfolio1);
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(report1);
        WorkspaceStore.currentWidget$ = new BehaviorSubject<Widget>(undefined);
    });

    describe('Getters Test', () => {
        it('should test every getter', () => {
            const subscription1 = WorkspaceStore.getWorkspace$().subscribe((workspaceReceived: Workspace) => {
                expect(workspaceReceived).toEqual(workspace);
            });
            const subscription2 = WorkspaceStore.getCurrentWorkpad$().subscribe((workpadReceived: FlatWorkpad) => {
                expect(workpadReceived).toEqual(flatWorkpad1);
            });
            const subscription3 = WorkspaceStore.getCurrentPortfolio$().subscribe((portfolio: Portfolio) => {
                expect(portfolio).toEqual(portfolio1);
            });
            const subscription4 = WorkspaceStore.getCurrentReport$().subscribe((report: Report) => {
                expect(report).toEqual(report1);
            });

            expect(WorkspaceStore.getWorkspace()).toEqual(workspace);
            expect(WorkspaceStore.getCurrentWorkpad()).toEqual(flatWorkpad1);
            expect(WorkspaceStore.getCurrentPortfolio()).toEqual(portfolio1);
            expect(WorkspaceStore.getCurrentReport()).toEqual(report1);

            subscription1.unsubscribe();
            subscription2.unsubscribe();
            subscription3.unsubscribe();
            subscription4.unsubscribe();
        });
    });

    describe('init Test', () => {
        it('should initialize the object states', () => {
            WorkspaceStore.init();

            expect(WorkspaceStore.getWorkspace()).toEqual(new Workspace());
            expect(WorkspaceStore.getCurrentWorkpad()).toBeUndefined();
            expect(WorkspaceStore.getCurrentPortfolio()).toBeUndefined();
            expect(WorkspaceStore.getCurrentReport()).toBeUndefined();
            expect(WorkspaceStore.getCurrentWidget()).toBeUndefined();
        });
    });

    describe('Workspace Test', () => {
        describe('newWorkspace Test', () => {
            it('should reset workspace to blank workspace', () => {
                jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementationOnce((workpad, portfolio, report) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio, report));
                expect(WorkspaceStore.getCurrentWorkpad()).toEqual(flatWorkpad1);
                expect(WorkspaceStore.getCurrentPortfolio()).toEqual(portfolio1);
                expect(WorkspaceStore.getCurrentReport()).toEqual(report1);

                WorkspaceStore.newWorkspace();

                expect(WorkspaceStore.getCurrentWorkpad()).toBeUndefined();
                expect(WorkspaceStore.getCurrentPortfolio()).toBeUndefined();
                expect(WorkspaceStore.getCurrentReport()).toBeUndefined();
            });
        });

        describe('updateWorkspace Test', () => {
            it('should updateWorkspace and also update workpad, portfolio, report ONLY ONCE while updating workspace', () => {
                jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementationOnce((workpad, portfolio, report) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio, report));
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio');
                jest.spyOn(WorkspaceStore, 'updateCurrentReport');

                WorkspaceStore.updateWorkspace(workspace);

                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(1);
            });

            it('should updateWorkspace and DO NOT update workpad, portfolio, report if null is passed', () => {
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentReport').mockClear();

                WorkspaceStore.updateWorkspace();

                expect(WorkspaceStore.updateCurrentWorkpad).not.toHaveBeenCalled();
                expect(WorkspaceStore.updateCurrentPortfolio).not.toHaveBeenCalled();
                expect(WorkspaceStore.updateCurrentReport).not.toHaveBeenCalled();
            });
        });
    });

    describe('refreshWorkspace Test', () => {
        it('should updateWorkspace after save ', () => {
            WorkspaceStore.refreshWorkspace();
            expect(WorkspaceStore.refreshWorkspace).toBeDefined();
        });
});

    describe('Workpad Test', () => {
        describe('updateCurrentWorkpad Test', () => {
            it('should update WorkspaceStore currentWorkpad with a FlatWorkpad', () => {
                const workpad = new FlatWorkpad();
                workpad.reports.push(new Report());
                workpad.reports[0].widgets.push(new Widget(WidgetConfigType.RETURNS));
                WorkspaceStore.updateCurrentWorkpad(workpad);
                WorkspaceStore.updateCurrentWorkpad(flatWorkpad1);

                expect(WorkspaceStore.getCurrentWorkpad()).toStrictEqual(flatWorkpad1);
                expect(workpad.reports[0].widgets[0].configType).toBe(WidgetConfigType.RETURNS);
                expect(flatWorkpad1.reports[0].widgets.length).toBe(0);
            });

            it('should update WorkspaceStore currentWorkpad with a Report Group', () => {
                WorkspaceStore.updateCurrentWorkpad(reportGroup);

                expect(WorkspaceStore.getCurrentWorkpad()).toStrictEqual(reportGroup);
            });

            it('should update currentPortfolio and currentReport while updating currentWorkpad', () => {
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentReport').mockClear();

                WorkspaceStore.updateCurrentWorkpad(flatWorkpad1);

                expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentPortfolio).toHaveBeenCalledWith(portfolio1);
                expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledTimes(1);
                expect(WorkspaceStore.updateCurrentReport).toHaveBeenCalledWith(report1);
            });

            it('should NOT update currentPortfolio and currentReport if null is passed', () => {
                jest.spyOn(WorkspaceStore, 'updateCurrentPortfolio').mockClear();
                jest.spyOn(WorkspaceStore, 'updateCurrentReport').mockClear();

                WorkspaceStore.updateCurrentWorkpad(flatWorkpad1, null, null);

                expect(WorkspaceStore.updateCurrentPortfolio).not.toHaveBeenCalled();
                expect(WorkspaceStore.updateCurrentReport).not.toHaveBeenCalled();
            });
        });

        describe('addWorkpadsAndUpdateCurrent Test', () => {
            it('should add workpad to workspace and update WorkspaceStore.currentWorkpad', () => {
                jest.spyOn(WorkspaceStore.getWorkspace(), 'addWorkpads');

                WorkspaceStore.addWorkpadsAndUpdateCurrent(flatWorkpad1);

                expect(WorkspaceStore.getWorkspace().addWorkpads).toHaveBeenCalledWith(flatWorkpad1);
                expect(WorkspaceStore.getCurrentWorkpad()).toStrictEqual(flatWorkpad1);
            });
        });

        describe('removeWorkpadAndUpdateCurrent Test', () => {
            beforeEach(() => {
                jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementation((workpad, portfolio, report) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio, report));
            });
            it('should remove workpad and update current workpad if current workpad removed', () => {
                WorkspaceStore.removeWorkpadAndUpdateCurrent(flatWorkpad1);

                expect(WorkspaceStore.getCurrentWorkpad()).toEqual(flatWorkpad2);
            });

            it('should remove workpad and update current workpad to undefined if no valid workpad', () => {
                workspace.workpads = [flatWorkpad1, flatWorkpad2];
                flatWorkpad2.reports = [];

                WorkspaceStore.removeWorkpadAndUpdateCurrent(flatWorkpad1);

                expect(WorkspaceStore.getCurrentWorkpad()).toBeUndefined();
            });

            it('should remove workpad and not update current workpad if non current workpad removed', () => {
                WorkspaceStore.removeWorkpadAndUpdateCurrent(flatWorkpad2);

                expect(WorkspaceStore.getCurrentWorkpad()).toEqual(flatWorkpad1);
            });
        });
    });


    describe('Portfolio Test', () => {
        describe('updateCurrentPortfolio Test', () => {
            it('should update WorkspaceStore current Portfolio', () => {
                WorkspaceStore.updateCurrentPortfolio(portfolio2);

                expect(WorkspaceStore.getCurrentPortfolio()).toBe(portfolio2);
            });
        });

        describe('addPortfolioAndUpdateCurrent Test', () => {
            it('should add ONE portfolio to flatWorkpad and update WorkspaceStore current Portfolio', () => {
                jest.spyOn(flatWorkpad1, 'addPortfolios');
                WorkspaceStore.addPortfoliosAndUpdateCurrent(flatWorkpad1, portfolio1);

                expect(flatWorkpad1.addPortfolios).toHaveBeenCalledWith(portfolio1, undefined);
                expect(WorkspaceStore.getCurrentPortfolio()).toStrictEqual(portfolio1);
            });

            it('should add MANY portfolios to reportGroup and update WorkspaceStore current Portfolio', () => {
                const portfolios = [portfolio1, portfolio2];
                jest.spyOn(reportGroup, 'addPortfolios');
                WorkspaceStore.addPortfoliosAndUpdateCurrent(reportGroup, portfolios);

                expect(reportGroup.addPortfolios).toHaveBeenCalledWith(portfolios, undefined);
                const currPort$ = WorkspaceStore.getCurrentPortfolio$().subscribe(currentPort => expect(currentPort).toEqual(portfolio1));
                currPort$.unsubscribe();
            });
        });

        describe('removePortfolioAndUpdateCurrent Test', () => {
            beforeEach(() => {
                jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate').mockImplementation((workpad, portfolio, report) => WorkspaceStore.updateCurrentWorkpad(workpad, portfolio, report));
            });
            it('should remove portfolio and update WorkspaceStore current Portfolio with portfolio in same report', () => {
                reportGroup.portfolios = [portfolio1, portfolio2];
                WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(portfolio1);
                jest.spyOn(reportGroup, 'removePortfolio');
                jest.spyOn(WorkspaceStore, 'updatePortfolioInComparisonConfig');
                WorkspaceStore.removePortfolioAndUpdateCurrent(reportGroup, portfolio1);

                expect(reportGroup.removePortfolio).toHaveBeenCalledWith(portfolio1);
                expect(WorkspaceStore.updatePortfolioInComparisonConfig).toHaveBeenCalledWith(portfolio1);
                expect(WorkspaceStore.getCurrentPortfolio()).toStrictEqual(portfolio2);
            });
            it('should remove portfolio and update WorkspaceStore.currentPortfolio when no other portfolio in same report', () => {
                reportGroup.portfolios = [portfolio1];
                flatWorkpad1.portfolio = portfolio2;
                WorkspaceStore.getWorkspace().workpads = [reportGroup, flatWorkpad1];
                WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(portfolio1);
                jest.spyOn(reportGroup, 'removePortfolio');
                WorkspaceStore.removePortfolioAndUpdateCurrent(reportGroup, portfolio1);

                expect(reportGroup.removePortfolio).toHaveBeenCalledWith(portfolio1);
                expect(WorkspaceStore.getCurrentPortfolio()).toStrictEqual(portfolio2);
            });
            it('should remove Whatif portfolio and convert report group to flat workpad', () => {
                const whatIfPortfolio = new WhatIfPortfolio('What-If PEP');
                whatIfPortfolio.parentPortfolio = portfolio1;
                reportGroup.portfolios = [portfolio1, whatIfPortfolio];
                flatWorkpad1.portfolio = portfolio2;
                WorkspaceStore.getWorkspace().workpads = [flatWorkpad1, reportGroup];
                WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(whatIfPortfolio);
                jest.spyOn(reportGroup, 'removePortfolio');
                WorkspaceStore.removePortfolioAndUpdateCurrent(reportGroup, whatIfPortfolio);

                expect(reportGroup.removePortfolio).toHaveBeenCalledWith(whatIfPortfolio);
                expect(WorkspaceStore.getCurrentPortfolio()).toStrictEqual(portfolio1);
                const expectedFlatWorkpad = new FlatWorkpad();
                expectedFlatWorkpad.portfolio = portfolio1;
                expectedFlatWorkpad.reports = reportGroup.reports;
                expectedFlatWorkpad.activeReport = reportGroup.activeReport;
                expect(WorkspaceStore.getWorkspace().workpads[1]).toStrictEqual(expectedFlatWorkpad);
            });

            it('should remove Whatif portfolio but retain user created report', () => {
                const whatIfPortfolio = new WhatIfPortfolio('What-If PEP');
                whatIfPortfolio.parentPortfolio = portfolio1;
                reportGroup.portfolios = [portfolio1, whatIfPortfolio];
                reportGroup.isUserCreated = true;
                flatWorkpad1.portfolio = portfolio2;
                WorkspaceStore.getWorkspace().workpads = [flatWorkpad1, reportGroup];
                WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(whatIfPortfolio);
                jest.spyOn(reportGroup, 'removePortfolio');
                WorkspaceStore.removePortfolioAndUpdateCurrent(reportGroup, whatIfPortfolio);

                expect(reportGroup.removePortfolio).toHaveBeenCalledWith(whatIfPortfolio);
                expect(WorkspaceStore.getCurrentPortfolio()).toStrictEqual(portfolio1);
                expect(WorkspaceStore.getWorkspace().workpads[1]).toStrictEqual(reportGroup);
            });
        });
    });

    describe('Report Test', () => {
        describe('updateCurrentReport Test', () => {
            it('should update WorkspaceStore current Report', () => {
                WorkspaceStore.updateCurrentReport(report2);
                expect(WorkspaceStore.getCurrentReport()).toStrictEqual(report2);
                expect(WorkspaceStore.getCurrentWorkpad().activeReport).toStrictEqual(report2);
            });
        });

        describe('addReportsAndUpdateCurrent Test', () => {
            beforeEach(() => {
                WorkspaceStore.currentWorkpad$.next(flatWorkpad1);
            });

            it('should add report to workpad and update WorkspaceStore current Report', () => {
                WorkspaceStore.addReportsAndUpdateCurrent(flatWorkpad1, report1);

                expect(WorkspaceStore.getCurrentReport()).toStrictEqual(report1);
            });

            it('should add MANY reports to workpad and update WorkspaceStore current Report', () => {
                WorkspaceStore.addReportsAndUpdateCurrent(flatWorkpad1, [report1, report2]);

                expect(WorkspaceStore.getCurrentReport()).toStrictEqual(report1);
            });
        });

        describe('removeReportAndUpdateCurrent Test', () => {
            it('should remove report and update WorkspaceStore current Report', () => {
                flatWorkpad1.reports = [report1, report2];
                jest.spyOn(flatWorkpad1, 'removeReport');

                WorkspaceStore.removeReportAndUpdateCurrent(report1, flatWorkpad1);

                expect(flatWorkpad1.removeReport).toHaveBeenCalledWith(report1);
                expect(flatWorkpad1.reports.length).toBe(1);
                expect(WorkspaceStore.getCurrentReport()).toStrictEqual(report2);
            });

            it('should remove report and add a new blank one if none left', () => {
                flatWorkpad1.reports = [report1];
                jest.spyOn(flatWorkpad1, 'removeReport');

                WorkspaceStore.removeReportAndUpdateCurrent(report1, flatWorkpad1);

                expect(flatWorkpad1.removeReport).toHaveBeenCalledWith(report1);
                expect(flatWorkpad1.reports.length).toBe(1);
                expect(WorkspaceStore.getCurrentReport()).not.toStrictEqual(report1);
                expect(WorkspaceStore.getCurrentReport().widgets).toBeNull();
            });
        });

        describe('replaceCurrentReport Test', () => {
            it('should replace current report with new one', () => {
                flatWorkpad1.portfolio = portfolio1;
                flatWorkpad1.reports = [report1];
                jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(flatWorkpad1);
                jest.spyOn(WorkspaceStore, 'getCurrentReport').mockReturnValue(report1);
                jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');

                WorkspaceStore.replaceCurrentReport(report2);

                expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledWith(flatWorkpad1, undefined, report2);
            });
        });

        describe('updatePortfolioInComparisonConfig Test', () => {
            it('updatePortfolioInComparisonConfig Test', () => {
                jest.restoreAllMocks();
                jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(new FlatWorkpad());
                WorkspaceStore.updatePortfolioInComparisonConfig(null, null);

                const report = new Report('report 1');
                report.comparisonConfigId = 1;
                const reports = [report];
                const config: ComparisonConfig = new ComparisonConfig();
                config.portComparisonList = ['IP_1', 'PEP_2'];
                config.portAnchorId =  'PEP_2';

                const reportGroupToUse = new ReportGroup();
                reportGroupToUse.reports = reports;
                reportGroupToUse.comparisonConfigMap.set(report.comparisonConfigId, config);
                jest.restoreAllMocks();
                jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(reportGroupToUse);
                const oldPortfolio = new Portfolio();
                oldPortfolio.portId = 'PEP_2';
                const newPortfolio = new Portfolio();
                newPortfolio.portId = 'BR-CORE_3';
                WorkspaceStore.updatePortfolioInComparisonConfig(oldPortfolio, newPortfolio);
                const comparisonConfig: ComparisonConfig = reportGroupToUse.comparisonConfigMap.get(reports[0].comparisonConfigId);
                expect(comparisonConfig.portComparisonList[1]).toBe('BR-CORE_3');
                expect(comparisonConfig.portAnchorId).toBe('BR-CORE_3');

                WorkspaceStore.updatePortfolioInComparisonConfig(newPortfolio);
                expect(reportGroupToUse.comparisonConfigMap.get(reports[0].comparisonConfigId).portComparisonList.length).toBe(1);
                expect(reportGroupToUse.comparisonConfigMap.get(reports[0].comparisonConfigId).portAnchorId).toBe(undefined);

            });
        });

        describe('getPortfolioLoadingStatus$ Test', () => {
            it('getPortfolioLoadingStatus$ Test', () => {
                const newPortfolio = new Portfolio();
                newPortfolio.portId = '12345';
                WorkspaceStore.getPortfolioLoadingStatus$(newPortfolio);
                expect(WorkspaceStore.portfolioLoadingStatusMap.size).toBe(1);
                expect(WorkspaceStore.portfolioLoadingStatusMap.get('12345').getValue().isLoading).toBe(false);
            });
        });
    });
});
