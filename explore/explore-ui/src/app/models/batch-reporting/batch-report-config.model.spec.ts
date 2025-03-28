import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {Report} from '@models/workspace/report.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {WorkspaceStore} from '../../stores';
import {ComparisonConfig} from '../config/comparison-config.model';
import {FlatWorkpad} from '../workspace/flat-workpad.model';
import {CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

describe('BatchReportConfig model tests', () => {
    let batchReportConfig: BatchReportConfig;

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        WorkspaceStore.init();
        batchReportConfig = new BatchReportConfig();
        batchReportConfig.addBatchRowConfig();
        batchReportConfig.batchRowConfigs[0].portfolio.datePicker.dateStringValue = '';
        batchReportConfig.batchRowConfigs[0].portfolio.datePicker.dateString = false;

    });

    it('Test addBatchRowConfig', () => {
        expect(batchReportConfig.batchRowConfigs.length).toEqual(1);

        batchReportConfig.addBatchRowConfig();
        // Should add a BatchRowConfig to the BatchReportConfig
        expect(batchReportConfig.batchRowConfigs.length).toEqual(2);
    });

    it('Test allBatchRowConfigsActive', () => {
        // Add two BatchRowConfigs. They should be active by default
        batchReportConfig.addBatchRowConfig();

        // Should return true
        expect(batchReportConfig.allBatchRowConfigsActive()).toBeTruthy();

        // Set the last row to inactive
        batchReportConfig.batchRowConfigs[1].active = false;
        // Should return false
        expect(batchReportConfig.allBatchRowConfigsActive()).toBeFalsy();
    });

    it('Test getActiveBatchRowConfigs and getActiveBatchRowEpnlConfigs', () => {
        const batchRow = batchReportConfig.batchRowConfigs[0];
        // Add another BatchRowConfig and set it as an EPNL report
        batchReportConfig.addBatchRowConfig();
        batchReportConfig.batchRowConfigs[1].isEpnlReport = true;

        // Add another row and set it to inactive
        batchReportConfig.addBatchRowConfig();
        batchReportConfig.batchRowConfigs[2].active = false;
        // There should be 3 rows total
        expect(batchReportConfig.batchRowConfigs.length).toEqual(3);

        // Test getting the active BatchRowConfigs that are not EPNL
        expect(batchReportConfig.getActiveBatchRowConfigs().length).toEqual(1);
        expect(batchReportConfig.getActiveBatchRowConfigs()[0]).toBe(batchRow);

        // Test getting the active BatchRowConfigs that are EPNL
        const batchRowEpnl = batchReportConfig.batchRowConfigs[1];
        expect(batchReportConfig.getActiveBatchRowEpnlConfigs().length).toEqual(1);
        expect(batchReportConfig.getActiveBatchRowEpnlConfigs()[0]).toBe(batchRowEpnl);
    });

    it('Test getActivePDFBatchRowConfigs', () => {
        // Add another BatchRowConfig and set the exportConfig to be PDF
        batchReportConfig.addBatchRowConfig();
        batchReportConfig.batchRowConfigs[1].exportConfig = new PDFExportConfig();

        expect(batchReportConfig.getActivePDFBatchRowConfigs().length).toEqual(1);
        expect(batchReportConfig.getActivePDFBatchRowConfigs()[0]).toBe(batchReportConfig.batchRowConfigs[1]);
    });

    it('Test allActiveBatchRowConfigsFilled', () => {
        expect(batchReportConfig.allActiveBatchRowConfigsFilled()).toBeFalsy();

        // Edit the BatchRowConfig so that it is considered valid
        const batchRow = batchReportConfig.batchRowConfigs[0];
        batchRow.portfolio.portName = 'IP';
        batchRow.portfolio.currency = 'USD';
        batchRow.reports.push(new Report());

        expect(batchReportConfig.allActiveBatchRowConfigsFilled()).toBeTruthy();
    });

    it('Test getNumOfReports', () => {
        expect(batchReportConfig.getNumOfReports()).toEqual(0);
        // Add two reports to the first BatchRowConfig
        batchReportConfig.batchRowConfigs[0].reports = [new Report(), new Report()];

        // Add another BatchRowConfig and add a Report
        batchReportConfig.addBatchRowConfig();
        batchReportConfig.batchRowConfigs[1].reports.push(new Report());
        expect(batchReportConfig.getNumOfReports()).toEqual(3);
    });

    it('Test serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        batchReportConfig.fileName = 'Test filename';
        batchReportConfig.downloadDirectory = 'test directory';
        batchReportConfig.mergeInOneFile = true;
        // Add a report to the BatchRowConfig
        const batchRow = batchReportConfig.batchRowConfigs[0];
        const report1: Report = new Report();
        report1.title = "report 1";
        batchRow.reports.push(report1);

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['PEP', 'IP'];

        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);
        const workpad: FlatWorkpad = new FlatWorkpad({
            reports: [{}],
            portfolio: {ticker: 'PEP'},
            comparisonConfigMap: comparisonConfigMap
        });
        WorkspaceStore.currentWorkpad$.next(workpad);

        const serializedBatchReport = batchReportConfig.serialize(false);
        const newBatchReport = new BatchReportConfig(serializedBatchReport);

        expect(newBatchReport.batchRowConfigs.length).toEqual(batchReportConfig.batchRowConfigs.length);
        expect(newBatchReport.fileName).toEqual(batchReportConfig.fileName);
        expect(newBatchReport.downloadDirectory).toEqual(batchReportConfig.downloadDirectory);
        expect(newBatchReport.mergeInOneFile).toEqual(batchReportConfig.mergeInOneFile);
        expect(newBatchReport.batchRowConfigs[0].portfolio.datePicker.date).toEqual(batchRow.portfolio.datePicker.date);
        expect(newBatchReport.batchRowConfigs[0].reports.length).toEqual(batchRow.reports.length);
    });
});
