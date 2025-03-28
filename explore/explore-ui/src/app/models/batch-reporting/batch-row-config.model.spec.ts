import {Report} from '@models/workspace/report.model';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {ExportConstants} from '@constants/export.constants';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {CalendarDateUtils, ConfigTypeFactory, DateValue, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {ComparisonConfig} from '../config/comparison-config.model';
import {FlatWorkpad} from '../workspace/flat-workpad.model';
import {WorkspaceStore} from '../../stores';

describe('BatchRowConfig model tests', () => {
    let batchRowConfig: BatchRowConfig;

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        WorkspaceStore.init();
        batchRowConfig = new BatchRowConfig();
        batchRowConfig.portfolio = new Portfolio('IP', CalendarDateUtils.getDefaultDateObject());
        batchRowConfig.portfolio.benchmark = new Benchmark();
    });

    it('Test exportAs', () => {
        // Should be Excel at by default
        expect(batchRowConfig.exportAs).toEqual(ExportConstants.EXCEL);
        // Change it to PDF and verify
        batchRowConfig.exportConfig = new PDFExportConfig();
        expect(batchRowConfig.exportAs).toEqual(ExportConstants.PDF);
    });

    it('Test isValid', () => {
        batchRowConfig = new BatchRowConfig();
        // Should be false without a portfolio
        expect(batchRowConfig.isValid()).toBeFalsy();

        // Add a blank portfolio
        batchRowConfig.portfolio = new Portfolio('');
        // Should be false without a portName
        expect(batchRowConfig.isValid()).toBeFalsy();

        // Add a portName
        batchRowConfig.portfolio.portName = 'PEP';
        // Should be false without a benchmark
        expect(batchRowConfig.isValid()).toBeFalsy();

        // Add a benchmark
        batchRowConfig.portfolio.benchmark = new Benchmark();
        // Should be false without a currency
        expect(batchRowConfig.isValid()).toBeFalsy();

        // Add a currency
        batchRowConfig.portfolio.currency = 'USD';
        // Should be false without a datePicker
        expect(batchRowConfig.isValid()).toBeFalsy();

        // Add a datePicker
        batchRowConfig.portfolio.datePicker = new DateValue();
        // Should be false without a date in the datePicker
        expect(batchRowConfig.isValid()).toBeFalsy();
        batchRowConfig.portfolio.datePicker.date = '04/01/2020';
        // Should be false still without reports
        expect(batchRowConfig.isValid()).toBeFalsy();

        // Add a report
        batchRowConfig.reports.push(new Report());
        // Should be true
        expect(batchRowConfig.isValid()).toBeTruthy();
    });

    it('Test isEffectivelyEmpty', () => {
        batchRowConfig = new BatchRowConfig();
        // Should be considered effectively empty without a portfolio
        expect(batchRowConfig.isEffectivelyEmpty()).toBeTruthy();

        // Add a blank portfolio
        batchRowConfig.portfolio = new Portfolio('');
        // Should be considered effectively empty without a portfolio name
        expect(batchRowConfig.isEffectivelyEmpty()).toBeTruthy();

        // Add a report
        batchRowConfig.reports.push(new Report());
        // Should NOT be considered effectively empty because there is a report
        expect(batchRowConfig.isEffectivelyEmpty()).toBeFalsy();

        // Add a portName
        batchRowConfig.portfolio.portName = 'PEP';
        batchRowConfig.reports = [];
        // Should NOT be considered effectively empty because there is a portfolio
        expect(batchRowConfig.isEffectivelyEmpty()).toBeFalsy();
    });

    it('Test serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        ConfigTypeFactory.registerConfigType('portfolio', Portfolio);
        batchRowConfig.runAs = BatchExportRunAs.PORTGROUP;
        batchRowConfig.active = false;
        batchRowConfig.isEpnlReport = true;
        // Add a report to the BatchRowConfig
        const report1: Report = new Report();
        report1.comparisonConfigId = 1;
        batchRowConfig.reports.push(report1);
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

        const serializedBatchRow = batchRowConfig.serialize();
        const newBatchRow = new BatchRowConfig(serializedBatchRow);

        expect(newBatchRow.runAs).toEqual(batchRowConfig.runAs);
        expect(newBatchRow.active).toEqual(batchRowConfig.active);
        expect(newBatchRow.isEpnlReport).toEqual(batchRowConfig.isEpnlReport);
        expect(newBatchRow.portfolio.portName).toEqual(batchRowConfig.portfolio.portName);
        expect(newBatchRow.reports.length).toEqual(batchRowConfig.reports.length);
    });
});
