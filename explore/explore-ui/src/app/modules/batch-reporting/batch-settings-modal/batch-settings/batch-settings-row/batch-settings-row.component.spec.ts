import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CoreDefinitionStore, DateValue} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {ExportConstants} from '@constants/export.constants';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {EpnlSettings} from '@models/batch-reporting/epnl-settings.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {FavoriteService} from '@services/favorite';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {AppStore} from '../../../../../app.store';
import {BatchExportingStore, DefinitionsStore} from '../../../../../stores';
import {BatchSettingsRowComponent} from './batch-settings-row.component';
import {CalendarTestUtils} from '../../../../../shared/components/date-picker-with-calendar/calendar-test.utils';

describe('BatchSettingsRowComponent', () => {
    let component: BatchSettingsRowComponent;
    let fixture: ComponentFixture<BatchSettingsRowComponent>;

    const portfolioSearchServiceStub = {};

    const batchReportingServiceStub = {
        populateReportOptions: jest.fn(),
        downloadInProgress: jest.fn(),
        fetchPortInfo$: jest.fn(),
        cascadeDateToAllRows: jest.fn(),
        cascadeCurrencyToAllRows: jest.fn(),
        cascadeReportOptionsToAllRows: jest.fn(),
        parseEPNLDate$: jest.fn()
    };

    const appStoreStub = {
        openLoadFavoriteModal$: new BehaviorSubject({
            type: null,
            treeType: null,
            displayName: 'Report',
            loadEnterpriseTree: null,
            callback: null
        }),
        isLoadFavoriteModalOpen$: new Subject()
    };

    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };
    BatchExportingStore.init();
    beforeAll(() => {
        DefinitionsStore.currency = ['USD', 'CAD', 'AUD', 'COP', 'YEN'];
        CoreDefinitionStore.calendars = CalendarTestUtils.getMockCalendars();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BatchSettingsRowComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub},
                {provide: BatchReportingService, useValue: batchReportingServiceStub},
                {provide: AppStore, useValue: appStoreStub},
                {provide: FavoriteService, useValue: favoriteServiceStub}
            ]
        });

        fixture = TestBed.createComponent(BatchSettingsRowComponent);
        component = fixture.componentInstance;
        component.rowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
        component.isSelected = true;
        BatchExportingStore.currentBatchReport$.next(BatchReportingTestUtils.createDummyBatchReportConfig());

        fixture.detectChanges();
    });

    it('Test ngOnChanges', () => {
        const newBatchRowConfig = BatchReportingTestUtils.createDummyBatchRowConfig();
        const emptyChanges = {};
        const changes = {rowConfig: new SimpleChange(component.rowConfig, newBatchRowConfig, true)};

        jest.spyOn(component, 'onPortfolioChanged').mockImplementationOnce(_a => {});
        component.ngOnChanges(emptyChanges);
        expect(component.onPortfolioChanged).not.toHaveBeenCalled();

        // Mock the changes event getting fired
        component.rowConfig = newBatchRowConfig;
        component.ngOnChanges(changes);
        expect(component.onPortfolioChanged).toHaveBeenCalled();
    });

    it('Test initialize portfolio method', () => {
        jest.spyOn(component, 'onPortfolioChanged').mockImplementationOnce(_a => {});
        component.portfolioSearch.initialSearchString = 'pep';
        const portSearchItem = new PortfolioSearchItem('PEP', 'PEP', 'USD');
        component.initializePortfolio(undefined);
        expect(component.onPortfolioChanged).not.toHaveBeenCalled();

        component.initializePortfolio(portSearchItem);
        expect(component.onPortfolioChanged).not.toHaveBeenCalled();

        component.portfolioSearch.initialSearchString = '';
        component.initializePortfolio(portSearchItem);
        expect(component.onPortfolioChanged).toHaveBeenCalled();
    });

    it('Test setRowConfigActive', () => {
        jest.spyOn(component.updateAllActiveRowsFlag, 'emit');
        component.setRowConfigActive(false);
        expect(component.rowConfig.active).toBeFalsy();
        expect(component.updateAllActiveRowsFlag.emit).toHaveBeenCalled();
    });

    it('Test reportsSelectedText', () => {
        expect(component.reportsSelectedText()).toEqual('0 reports selected');
        const report1 = new Report();
        report1.title = 'TEST TITLE';
        component.rowConfig.reports.push(report1);
        expect(component.reportsSelectedText()).toEqual('TEST TITLE');
        const report2 = new Report();
        component.rowConfig.reports.push(report2);
        expect(component.reportsSelectedText()).toEqual('2 reports selected');
    });

    describe('Test onPortfolioChanged', () => {
        const newPort = new Portfolio('PEP', new DateValue({
            date: '07/28/2018',
            calCode: 'GP_HK_STD',
            dateString: false,
            dateStringValue: ''
        }));
        it('Test onPortfolioChanged with null', () => {
            component.onPortfolioChanged(null);
            expect(batchReportingServiceStub.fetchPortInfo$).not.toHaveBeenCalled();
        });

        it('Test onPortfolioChanged', () => {
            const portfolio = new Portfolio('PEP', component.rowConfig.portfolio.datePicker);
            batchReportingServiceStub.fetchPortInfo$.mockReturnValue(of(newPort));
            component.onPortfolioChanged(portfolio);
            expect(batchReportingServiceStub.fetchPortInfo$).toHaveBeenCalled();
            expect(component.rowConfig.portfolio).toEqual(newPort);
        });

        it('Test onPortfolioChanged epnl settings preserve', () => {
            component.rowConfig.portfolio.epnlSettings = new EpnlSettings();
            component.rowConfig.portfolio.epnlSettings.calCode = 'US';
            const portfolio = new Portfolio('PEP', component.rowConfig.portfolio.datePicker);
            batchReportingServiceStub.fetchPortInfo$.mockReturnValue(of(newPort));
            component.onPortfolioChanged(portfolio);
            expect(batchReportingServiceStub.fetchPortInfo$).toHaveBeenCalled();
            const expectedEpnlSettings = new EpnlSettings();
            expectedEpnlSettings.calCode = newPort.datePicker.calCode;
            expect(component.rowConfig.portfolio.epnlSettings).toEqual(expectedEpnlSettings);
        });

        it('Test onPortfolioChanged portfolio settings are initialized', () => {
            newPort.performanceSettings.attributionSettings.cannedMethod = 'FIXED_INCOME';
            newPort.portfolioRiskSettings = new RiskSettings();
            const portfolio = new Portfolio('PEP', component.rowConfig.portfolio.datePicker);
            batchReportingServiceStub.fetchPortInfo$.mockReturnValue(of(newPort));
            component.onPortfolioChanged(portfolio);
            expect(batchReportingServiceStub.fetchPortInfo$).toHaveBeenCalled();
            expect(component.rowConfig.portfolio.performanceSettings.attributionSettings.cannedMethod).toEqual('FIXED_INCOME');
            expect(component.rowConfig.portfolio.portfolioRiskSettings).toBeDefined();
        });
    });

    describe('Test onCurrencyChanged', () => {
        it('Test onCurrencyChanged with invalid event', () => {
            const customEvent = new CustomEvent('build', {detail: {value: null}});
            component.onCurrencyChanged(customEvent as CustomEvent);
            expect(component.rowConfig.portfolio.currency).toEqual('USD');
        });

        it('Test onCurrencyChanged with matching currency', () => {
            component.rowConfig.portfolio.currency = 'USD';
            const customEvent = new CustomEvent('build', {detail: {value: {value: 'USD'}}});
            component.onCurrencyChanged(customEvent as CustomEvent);
            expect(component.rowConfig.portfolio.currency).toEqual('USD');
        });

        it('Test onCurrencyChanged with differency currency', () => {
            component.rowConfig.portfolio.currency = 'USD';
            const customEvent = new CustomEvent('build', {detail: {value: {value: 'JPY'}}});
            component.onCurrencyChanged(customEvent as CustomEvent);
            expect(component.rowConfig.portfolio.currency).toEqual('JPY');
        });
    });

    describe('Test onRunAsChanged', () => {
        it('Test RunAs changed', () => {
            component.rowConfig.runAs = BatchExportRunAs.PORTFOLIOS;
            component.onRunAsChanged(BatchExportRunAs.PORTGROUP);
            expect(component.rowConfig.runAs).toEqual(BatchExportRunAs.PORTGROUP);
        });
    });

    describe('Test onDateChanged', () => {
        const newPort = new Portfolio('PEP', new DateValue({
            date: '04/01/2018',
            calCode: 'GreenPkg',
            dateString: false,
            dateStringValue: ''
        }));

        it('Test Date changed', () => {
            batchReportingServiceStub.fetchPortInfo$.mockReturnValue(of(newPort));
            component.onDateChanged();
            expect(batchReportingServiceStub.fetchPortInfo$).toHaveBeenCalled();
            expect(component.rowConfig.portfolio).toEqual(newPort);
        });
    });

    describe('Test Benchmark changes for batch row portfolios', () => {
        it('add default benchmark options', () => {
            const benchmarkOptions = component.addBatchDefaultBenchmarkOptions();
            expect(benchmarkOptions.length).toBe(4);
        });

        it('Test updateBenchmark for row portfolio - with firstInit true, runAs Portfolio and compositePortgroup', () => {
            const oldBenchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, BenchmarkConstants.BENCH_PRIMARY);
            const portfolio = new Portfolio('CORE-HQ');
            portfolio.isPortfolioGroup = true;
            component.rowConfig.runAs = BatchExportRunAs.PORTFOLIOS;
            component.updateBenchmarksForRowPortfolio(oldBenchmark, true, portfolio);
            expect(portfolio.benchmarks.length).toBe(4);
            expect(portfolio.benchmark.order).toBe(1);
            expect(portfolio.benchmark.type).toBe('RISK');
            expect(portfolio.benchmark.name).toBe('Primary');
        });

        it('Test updateBenchmark for row portfolio - with firstInit false, and old benchmark', () => {
            const oldNoneBenchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
            const oldOtherBenchmark = Benchmark.create(BenchmarkConstants.OTHER_BENCH, 1, 'other');
            const oldPrimaryBenchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, 'random');
            const benchmarWithOrderThree = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 3, 'Primary');
            const portfolio = new Portfolio('CORE-HQ');
            portfolio.isPortfolioGroup = true;
            component.rowConfig.runAs = BatchExportRunAs.PORTFOLIOS;
            component.updateBenchmarksForRowPortfolio(oldNoneBenchmark, false, portfolio);
            expect(portfolio.benchmark).toStrictEqual(oldNoneBenchmark);

            component.updateBenchmarksForRowPortfolio(oldOtherBenchmark, false, portfolio);
            expect(portfolio.benchmark).toStrictEqual(oldOtherBenchmark);

            component.updateBenchmarksForRowPortfolio(oldPrimaryBenchmark, false, portfolio);
            expect(portfolio.benchmark).toStrictEqual(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, BenchmarkConstants.BENCH_SECONDARY));

            component.updateBenchmarksForRowPortfolio(benchmarWithOrderThree, false, portfolio);
            expect(portfolio.benchmark).toStrictEqual(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, BenchmarkConstants.BENCH_PRIMARY));
        });
    });

    describe('Test onExportAsChanged', () => {
        it('Tests changing to same exportConfig', () => {
            const customEvent = new CustomEvent('build', {detail: {value: {value: component.rowConfig.exportConfig}}});
            component.onExportAsChanged(customEvent as CustomEvent);
            // Nothing should happen
            expect(component.rowConfig.exportConfig).toEqual(customEvent.detail.value.value);
        });

        it('Tests changing from Excel to PDF', () => {
            // Set some value inside the exportConfig so we can test later
            component.rowConfig.exportConfig = new ExcelExportConfig();
            (component.rowConfig.exportConfig as ExcelExportConfig).exportToSingleSheet = true;
            const customEvent = new CustomEvent('build', {detail: {value: {value: component.exportAsOptions[0].values[1].value}}});
            component.onExportAsChanged(customEvent as CustomEvent);
            expect(component.rowConfig.exportConfig).toEqual(customEvent.detail.value.value);
            expect(component.rowConfig.exportConfig instanceof PDFExportConfig).toBeTruthy();
            expect(component.exportAsSelection.value instanceof PDFExportConfig).toBeTruthy();
            expect(component.exportAsSelection.isSelected).toBeTruthy();
            // When changing exportConfigs, we should persist whatever settings the user had before into the exportAsOptions
            expect((component.exportAsOptions[0].values[0].value as ExcelExportConfig).exportToSingleSheet).toBeTruthy();
        });

        it('Tests changing from PDF to Excel', () => {
            // Set some value inside the exportConfig so we can test later
            component.rowConfig.exportConfig = new PDFExportConfig();
            (component.rowConfig.exportConfig as PDFExportConfig).printAsIs = true;
            const customEvent = new CustomEvent('build', {detail: {value: {value: component.exportAsOptions[0].values[0].value}}});
            component.onExportAsChanged(customEvent as CustomEvent);
            expect(component.rowConfig.exportConfig).toEqual(customEvent.detail.value.value);
            expect(component.rowConfig.exportConfig instanceof ExcelExportConfig).toBeTruthy();
            expect(component.exportAsSelection.value instanceof ExcelExportConfig).toBeTruthy();
            expect(component.exportAsSelection.isSelected).toBeTruthy();
            // When changing exportConfigs, we should persist whatever settings the user had before into the exportAsOptions
            expect((component.exportAsOptions[0].values[1].value as PDFExportConfig).printAsIs).toBeTruthy();
        });
    });

    describe('Test portfolio settings modal', () => {
        it('Test openPortfolioSettingsModal', () => {
            expect(component.isPortfolioSettingsModalOpen).toBeFalsy();

            // Set the portname to be empty string
            component.rowConfig.portfolio.portName = '';
            component.openPortfolioSettingsModal();
            // Should still be nothing
            expect(component.isPortfolioSettingsModalOpen).toBeFalsy();

            // Set the portname to be PEP
            component.rowConfig.portfolio.portName = 'PEP';
            component.openPortfolioSettingsModal();
            // Values should now be properly set
            expect(component.isPortfolioSettingsModalOpen).toBeTruthy();
        });

        it('Test closePortfolioSettingsModal', () => {
            // Don't pass in a portfolio
            component.closePortfolioSettingsModal(null);
            expect(component.isPortfolioSettingsModalOpen).toBeFalsy();
            // Port name should still be the old portfolio
            expect(component.rowConfig.portfolio.portName).toEqual('PEP');

            const newPort = new Portfolio('IP');
            // Pass in a new portfolio
            component.closePortfolioSettingsModal(newPort);
            // Port name should be changed (this won't ever happen but we are testing that the new portfolio gets set onto the batch row)
            expect(component.rowConfig.portfolio.portName).toEqual('IP');
        });
    });

    it('Test onReportSelectionChanged', () => {
        component.rowConfig.runAs = BatchExportRunAs.PORTFOLIOS;
        component.rowConfig.exportConfig = new ExcelExportConfig();
        component.initializeExportAsOptions();
        const report1 = new Report();
        const report2 = new Report();
        let customEvent = new CustomEvent('build', {detail: {value: [{value: report1}, {value: report2}]}});
        component.onReportSelectionChanged(customEvent as CustomEvent);
        expect(component.rowConfig.reports.length).toEqual(2);
        expect(component.rowConfig.reports[0]).toEqual(report1);
        expect(component.rowConfig.reports[1]).toEqual(report2);
        expect(component.rowConfig.runAs).toEqual(BatchExportRunAs.PORTFOLIOS);
        expect(component.rowConfig.exportConfig instanceof ExcelExportConfig).toBeTruthy();
        // EPNL report selection
        customEvent = new CustomEvent('build', {
            detail: {
                value: [{
                    value: report1,
                    displayValue: ExportConstants.EPNL_REPORT
                }, {value: report2}]
            }
        });
        component.rowConfig.portfolio.datePicker.calCode = 'GB';
        component.onReportSelectionChanged(customEvent as CustomEvent);
        expect(component.rowConfig.runAs).toEqual(BatchExportRunAs.PORTGROUP);
        expect(component.rowConfig.exportConfig instanceof PDFExportConfig).toBeTruthy();
        expect(component.rowConfig.portfolio.epnlSettings.calCode).toEqual('GB');
    });

    it('Test contextMenus', () => {
        BatchExportingStore.getCurrentBatchReport().batchRowConfigs = [];
        jest.spyOn(component['batchReportingService'], 'cascadeDateToAllRows');
        jest.spyOn(component['batchReportingService'], 'cascadeCurrencyToAllRows');
        jest.spyOn(component['batchReportingService'], 'cascadeReportOptionsToAllRows');
        component.dateContextMenu.onItemClicked();
        expect(component['batchReportingService'].cascadeDateToAllRows).toHaveBeenCalled();
        component.currencyContextMenu.onItemClicked();
        expect(component['batchReportingService'].cascadeCurrencyToAllRows).toHaveBeenCalled();
        component.reportsContextMenu.onItemClicked();
        expect(component['batchReportingService'].cascadeReportOptionsToAllRows).toHaveBeenCalled();
    });

    describe('Test addFavoriteReportsToBatchRow', () => {
        it('Test addFavoriteReportsToBatchRow successful add', (done) => {
            const report = new Report();
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(of(report));
            jest.spyOn(component, 'populateReportOptions');
            component.addFavoriteReportsToBatchRow(123, 'test', false, 'rolin');
            expect(component.rowConfig.reports.includes(report)).toBeTruthy();
            expect(component.populateReportOptions).toHaveBeenCalled();
            done();
        });

        it('Test addFavoriteReportsToBatchRow with null favorite', (done) => {
            const numOfReports = component.rowConfig.reports.length;
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(of(null));
            jest.spyOn(component, 'populateReportOptions');
            component.addFavoriteReportsToBatchRow(123, 'test', false, 'rolin');
            expect(component.rowConfig.reports.length).toEqual(numOfReports);
            expect(component.populateReportOptions).not.toHaveBeenCalled();
            done();
        });
    });
});
