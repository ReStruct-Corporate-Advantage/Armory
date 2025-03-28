import {Report} from './report.model';
import {ReportGroup} from './report-group.model';
import {Portfolio} from '../portfolio/portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ConfigInitializer} from '../../initializers/config.initializer';
import {ComparisonConfig} from '../config/comparison-config.model';
import {WorkspaceStore} from '../../stores';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {CalendarDateUtils, ConfigTypeFactory, DateValue, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

describe('ReportGroup', () => {
    let reportGroup: ReportGroup;
    let reportGroup2: ReportGroup;
    let report: Report;
    let portfolio: Portfolio;

    beforeEach( () => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        const comparisonConfigMap: Map<number, ComparisonConfig> = new Map<number, ComparisonConfig>();
        const comparisonConfig: ComparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['PEP12345', 'CORE-HQ54321'];
        comparisonConfig.portAnchorId = 'PEP12345';
        comparisonConfigMap.set(1, comparisonConfig);

        reportGroup = new ReportGroup();
        reportGroup.title = 'My ReportGroup';
        reportGroup.isOpen = true;
        report = new Report();
        report.title = 'Report 1';
        reportGroup.reports = [report];
        reportGroup.comparisonConfigMap = comparisonConfigMap;
        portfolio = new Portfolio();
        reportGroup.portfolios = [portfolio];

        reportGroup2 = new ReportGroup();
        reportGroup2.title = 'My Second ReportGroup';
        reportGroup2.isOpen = true;
        reportGroup2.reports = [report];
        const whatIfPortfolio = new WhatIfPortfolio();
        whatIfPortfolio.parentPortfolio = portfolio;
        reportGroup2.portfolios = [portfolio, whatIfPortfolio];

        WorkspaceStore.init();
        WorkspaceStore.currentWorkpad$.next(reportGroup);
    });

    describe('supportsObject Test', () => {
        it('should return true if supportsObject', () => {
            expect(ReportGroup.supportsObject({configType: 'workpad', isReportGroup: true})).toBeTruthy();
            expect(ReportGroup.supportsObject({configType: 'workpads', isReportGroup: true})).toBeTruthy();
            expect(ReportGroup.supportsObject({configType: 'WORKPAD', isReportGroup: true})).toBeTruthy();
            expect(ReportGroup.supportsObject({reports: [], isReportGroup: true})).toBeTruthy();
        });
    });

    describe('configType Test', () => {
        it('should return report-group', () => {
            expect(ReportGroup.configType).toBe('report-group');
        });
    });

    describe('getConfigType Test', () => {
        it('should return ReportGroup.configType', () => {
            expect(reportGroup.getConfigType()).toEqual(ReportGroup.configType);
        });
    });


    describe('doSerialize/doDeserialize Test', () => {
        it('serialize/deserialize', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const data = reportGroup.serialize();
            const newReportGroup = new ReportGroup(data);
            expect(newReportGroup.title).toBe('My ReportGroup');
            expect(newReportGroup.isOpen).toBe(true);
            expect(newReportGroup.comparisonConfigMap.size).toBe(1);
        });

        it('serialize/deserialize with what-if portfolio in report group', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            ConfigInitializer.initializeConfig();
            const data2 = reportGroup2.serialize();
            expect(data2.portfolios[1].parentPortfolioIdx).toBe(0);
            const newReportGroup = new ReportGroup(data2);
            expect(newReportGroup.isOpen).toBe(true);
            expect((newReportGroup.portfolios[1] as WhatIfPortfolio).parentPortfolio).not.toBeUndefined();
        });

        it('serialize/deserialize with comparison', () => {
            const comparisonWorkpad: ReportGroup = new ReportGroup();
            const comparisonConfig = new ComparisonConfig();
            comparisonConfig.portComparisonList = ['PEP', 'IP'];
            const comparisonConfigMap = new Map<number, ComparisonConfig>();
            comparisonConfigMap.set(1, comparisonConfig);
            comparisonWorkpad.comparisonConfigMap = comparisonConfigMap;

            const data = comparisonWorkpad.serialize();
            const newReportGroup = new ReportGroup(data);

            expect(newReportGroup.comparisonConfigMap).toEqual(comparisonConfigMap);
        });

        it('serialize/deserialize workspace favorites 1', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const comparisonWorkpad: ReportGroup = new ReportGroup();
            const ruleBasedPortfolio: RulesBasedPortfolio = new RulesBasedPortfolio();
            ruleBasedPortfolio.datePicker = DateValue.newDate('04/04/2018') ;
            comparisonWorkpad.addPortfolios([ruleBasedPortfolio]);
            const workpad: ReportGroup = new ReportGroup();
            jest.spyOn(ConfigTypeFactory, 'createConfig').mockReturnValue(ruleBasedPortfolio);
            workpad.deserialize(comparisonWorkpad.serialize());
            expect(workpad.getAllPortfolios()[0].datePicker).toEqual(ruleBasedPortfolio.datePicker);
            ruleBasedPortfolio.deserialize(workpad.getAllPortfolios()[0].serialize());
            expect(ruleBasedPortfolio.datePicker).toEqual(DateValue.newDate('04/04/2018'));
            jest.clearAllMocks();
        });

        it('serialize/deserialize workspace favorites 2', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            CalendarDateUtils.maxSelectableDate = '1';
            const comparisonWorkpad: ReportGroup = new ReportGroup();
            const ruleBasedPortfolio: RulesBasedPortfolio = new RulesBasedPortfolio();
            comparisonWorkpad.addPortfolios([ruleBasedPortfolio]);
            const workpad: ReportGroup = new ReportGroup();
            jest.spyOn(ConfigTypeFactory, 'createConfig').mockReturnValue(ruleBasedPortfolio);
            workpad.deserialize(comparisonWorkpad.serialize());
            expect(workpad.getAllPortfolios()[0].datePicker).toEqual(undefined);
            ruleBasedPortfolio.deserialize(workpad.getAllPortfolios()[0].serialize());
            expect(ruleBasedPortfolio.datePicker.dateStringValue).toEqual(DateValue.newRelativeDate('T-1').dateStringValue);
            jest.clearAllMocks();
        });
    });

    describe('addPortfolios Test', () => {
        it('should add ONE portfolio to reportGroup', () => {
            reportGroup.addPortfolios(new Portfolio());
            expect(reportGroup.portfolios.length).toBe(2);
            expect(reportGroup.comparisonConfigMap.size).toBe(1);
        });

        it('should add MANY portfolios to reportGroup', () => {
            reportGroup.addPortfolios([new Portfolio(), new Portfolio()]);
            expect(reportGroup.portfolios.length).toBe(3);
        });
    });

    describe('removePortfolio Test', () => {
        it('should remove portfolio from reportGroup', () => {
            reportGroup.removePortfolio(portfolio);
            expect(reportGroup.portfolios.length).toBe(0);
        });
    });

    describe('replacePortfolios Test', () => {
        it('should change the selected portfolio', () => {
            reportGroup.replacePortfolios(new Portfolio('PEP'), portfolio);
            expect(reportGroup.portfolios[0].portName).toBe('PEP');
        });

        it('Want to replace current Portfolio in a list of many portfolios', () => {
            const port1 = new Portfolio('PEP');
            const port2 = new Portfolio('Old Portfolio');
            const port3 = new Portfolio('New Portfolio');
            reportGroup.portfolios = [port1, port2];
            reportGroup.replacePortfolios(port3, port2);
            expect(reportGroup.portfolios.length).toBe(2);
            expect(reportGroup.portfolios[1]).toStrictEqual(port3);
            expect(reportGroup.portfolios.includes(port2)).toBeFalsy();
        });
    });

    describe('addReports Test', () => {
        it('should add ONE report to reportGroup', () => {
            reportGroup.addReports(new Report());
            expect(reportGroup.reports.length).toBe(2);
        });

        it('should add MANY portfolios to reportGroup', () => {
            reportGroup.addReports([new Report(), new Report()]);
            expect(reportGroup.reports.length).toBe(3);
        });
    });

    describe('removeReport Test', () => {
        it('should remove report from reportGroup', () => {
            reportGroup.removeReport(report);
            expect(reportGroup.reports.length).toBe(0);
        });
    });

    describe('comparison config Test', () => {
        it('Test hasComparisonPortfolios', () => {
            const comparisonWorkpad: ReportGroup = new ReportGroup();
            expect(comparisonWorkpad.hasComparisonPortfolios(1)).toBeFalsy();

            const comparisonConfig = new ComparisonConfig();
            comparisonConfig.portComparisonList = ['PEP', 'IP'];
            comparisonWorkpad.comparisonConfigMap.set(1, comparisonConfig);

            expect(comparisonWorkpad.hasComparisonPortfolios(1)).toBeTruthy();
        });

        describe('Test updateComparisonConfigMap', () => {
            const comparisonWorkpad: ReportGroup = new ReportGroup();
            it('Test updateComparisonConfigMap with invalid legacy comparison config', () => {
                // Blank report
                const legacyReport = new Report();
                comparisonWorkpad.updateComparisonConfigMap(legacyReport);
                expect(comparisonWorkpad.hasComparisonPortfolios(legacyReport.comparisonConfigId)).toBeFalsy();

                legacyReport.comparisonConfigLegacyPlaceholder = null;
                comparisonWorkpad.updateComparisonConfigMap(legacyReport);
                expect(comparisonWorkpad.hasComparisonPortfolios(legacyReport.comparisonConfigId)).toBeFalsy();

                legacyReport.comparisonConfigLegacyPlaceholder = new ComparisonConfig();
                comparisonWorkpad.updateComparisonConfigMap(legacyReport);
                expect(comparisonWorkpad.hasComparisonPortfolios(legacyReport.comparisonConfigId)).toBeFalsy();

                // Only 1 portfolio. Not considered valid
                legacyReport.comparisonConfigLegacyPlaceholder.portComparisonList = ['PEP'];
                comparisonWorkpad.updateComparisonConfigMap(legacyReport);
                expect(comparisonWorkpad.hasComparisonPortfolios(legacyReport.comparisonConfigId)).toBeFalsy();

                // 2 portfolios, but the workpad doesn't have the matching portfolios
                legacyReport.comparisonConfigLegacyPlaceholder.portComparisonList = ['PEP_1', 'H2_2'];
                comparisonWorkpad.updateComparisonConfigMap(legacyReport);
                expect(comparisonWorkpad.hasComparisonPortfolios(legacyReport.comparisonConfigId)).toBeFalsy();
            });

            it('Test updateComparisonConfigMap with valid legacy comparison config', () => {
                const legacyReport = new Report();
                legacyReport.comparisonConfigLegacyPlaceholder = new ComparisonConfig();
                legacyReport.comparisonConfigLegacyPlaceholder.portComparisonList = ['PEP_1', 'H2_2'];

                const port1 = new Portfolio('PEP');
                port1.portId = 'PEP_1';
                const port2 = new Portfolio('H2');
                port2.portId = 'H2_2';
                comparisonWorkpad.addPortfolios([port1, port2]);
                comparisonWorkpad.updateComparisonConfigMap(legacyReport);
                expect(comparisonWorkpad.hasComparisonPortfolios(legacyReport.comparisonConfigId)).toBeTruthy();
            });
        });
    });
});
