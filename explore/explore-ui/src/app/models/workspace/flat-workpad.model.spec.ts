import {Report} from './report.model';
import {Portfolio} from '../portfolio/portfolio.model';
import {FlatWorkpad} from './flat-workpad.model';
import {WorkspaceStore} from '../../stores';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {ConfigTypeFactory, DateValue} from '@blk/explore-ui-core';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

describe('FlatWorkpad', () => {
    let flatWorkpad: FlatWorkpad;
    let report: Report;
    let portfolio: Portfolio;

    beforeEach( () => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        flatWorkpad = new FlatWorkpad();
        report = new Report();
        flatWorkpad.reports = [report];
        portfolio = new Portfolio();
        flatWorkpad.portfolio = portfolio;
    });

    describe('supportsObject Test', () => {
        it('should return true if supportsObject', () => {
            expect(FlatWorkpad.supportsObject({configType: 'workpad', isReportGroup: false})).toBeTruthy();
            expect(FlatWorkpad.supportsObject({configType: 'workpads', isReportGroup: false})).toBeTruthy();
            expect(FlatWorkpad.supportsObject({configType: 'WORKPAD', isReportGroup: false})).toBeTruthy();
            expect(FlatWorkpad.supportsObject({reports: [], isReportGroup: false})).toBeTruthy();
        });
    });

    describe('configType Test', () => {
        it('should return flat-workpad', () => {
            expect(FlatWorkpad.configType).toBe('flat-workpad');
        });
    });

    describe('getConfigType Test', () => {
        it('should return FlatWorkpad.configType', () => {
            expect(flatWorkpad.getConfigType()).toEqual(FlatWorkpad.configType);
        });
    });


    describe('doSerialize/doDeserialize Test', () => {
        it('serialize/deserialize', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            WorkspaceStore.init();
            const data = flatWorkpad.serialize();
            const newFlatWorkpad = new FlatWorkpad(data);
            WorkspaceStore.currentWorkpad$.next(newFlatWorkpad);
            expect(newFlatWorkpad.reports.length).toBe(1);
        });
    });

    describe('setPortfolio Test', () => {
        it('should add ONE portfolio to flatWorkpad', () => {
            const newPortfolio = new Portfolio();
            flatWorkpad['setPortfolio'](newPortfolio);
            expect(flatWorkpad.portfolio).toBe(newPortfolio);
        });
    });

    describe('addReports Test', () => {
        it('should add ONE report to flatWorkpad', () => {
            flatWorkpad.addReports(new Report());
            expect(flatWorkpad.reports.length).toBe(2);
        });

        it('should add MANY portfolios to flatWorkpad', () => {
            flatWorkpad.addReports([new Report(), new Report()]);
            expect(flatWorkpad.reports.length).toBe(3);
        });
    });

    describe('removeReport Test', () => {
        it('should remove report from flatWorkpad', () => {
            flatWorkpad.removeReport(report);
            expect(flatWorkpad.reports.length).toBe(0);
        });
    });

    describe('replaceReport Test', () => {
        it('should replace oldReport with newReport', () => {
            const oldReport = new Report('old report');
            const newReport = new Report('new report');
            flatWorkpad.reports = [oldReport];

            flatWorkpad.replaceReport(newReport, oldReport);
            expect(flatWorkpad.reports[0].title).toBe('new report');
        });
    });

    describe('workspaceDate Test', () => {
        it('should set workspaceDate for Rule Based Portfolios when saved as part of workspace', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const newPortfolio = new AdhocPortGroup('test', undefined, new AdhocPortParams());
            newPortfolio.datePicker = new DateValue();
            newPortfolio.datePicker.date = '01/02/2020';
            flatWorkpad['setPortfolio'](newPortfolio);
            expect(flatWorkpad.portfolio).toBe(newPortfolio);
            ConfigTypeFactory.createConfig = jest.fn().mockReturnValue(newPortfolio);
            const workpad2 = new FlatWorkpad(flatWorkpad.serialize());
            expect(workpad2.portfolio.datePicker.date).toBe('01/02/2020');
        });
    });
});
