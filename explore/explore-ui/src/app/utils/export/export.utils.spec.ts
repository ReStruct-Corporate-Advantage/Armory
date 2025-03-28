import {ExportUtils} from '@utils/export/export.utils';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {BatchExportingStore, WorkspaceStore} from '../../stores';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {ExportConstants, ExportLevel} from '@constants/export.constants';
import {WorkspaceMenuItemsConstants} from '@constants/workspace-menu-items.constants';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {ColumnConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {ProcessCellForExportParams} from 'ag-grid-community';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';

/**
 * Tests for ExportUtils class
 */
describe('ExportUtils', () => {
    describe('Test processDownload', () => {
        beforeEach(() => {
            jest.spyOn(ExportUtils, 'download').mockImplementation(() => {});
        });

        it('Test processDownload with canceled batch', () => {
            jest.spyOn(BatchExportingStore, 'isBatchCanceled').mockReturnValueOnce(true);
            ExportUtils.processDownload({}, [], 'target:\\directory');
            expect(ExportUtils.download).not.toHaveBeenCalled();
        });

        it('Test processDownload with no fileParts', () => {
            ExportUtils.processDownload({}, null, 'target:\\directory');
            expect(ExportUtils.download).not.toHaveBeenCalled();
        });

        it('Test processDownload with canceled batch catch', () => {
            BatchExportingStore.currentBatchExportAction = null;
            ExportUtils.processDownload({}, [], 'target:\\directory', 'test', true);
            expect(ExportUtils.download).not.toHaveBeenCalled();
        });

        it('Test processDownload with no fileName', () => {
            ExportUtils.processDownload({}, ['FileName|test'], 'target:\\directory', '', false);
            expect(ExportUtils.download).toHaveBeenCalled();
        });

        it('Test processDownload with fileName', () => {
            ExportUtils.processDownload({type: 'EXCEL'}, ['test'], 'target:\\directory', 'testName', false);
            expect(ExportUtils.download).toHaveBeenCalledWith('test', 'testName', 'EXCEL', 'target:\\directory', false);
        });
    });

    it('Test getUniqueTimestamp', () => {
        // Regex that matches 13 digits exactly
        const regexTest = /\d{13}/g;
        expect(regexTest.test('123')).toBeFalsy();

        // The timestamp generated should be exactly 13 digits
        const timestamp = ExportUtils.getUniqueTimestamp();
        expect(regexTest.test(timestamp.toString())).toBeTruthy();
    });

    it('Test getExportType', () => {
        // Test Widget export
        let exportComposite = new ExportComposite();
        const exposureWidget = new Widget();
        exposureWidget.configType = WidgetConfigType.RISK_EXPOSURE;
        exportComposite.widget = exposureWidget;
        expect(ExportUtils.getExportType(exportComposite)).toEqual(ExportLevel.WIDGET);

        // Test Report export
        exportComposite = new ExportComposite();
        expect(ExportUtils.getExportType(exportComposite)).toEqual(ExportLevel.REPORT);

        // Test Report Group export
        exportComposite = new WorkpadExportComposite();
        expect(ExportUtils.getExportType(exportComposite)).toEqual(ExportLevel.REPORT_GROUP);

        // Test Workspace export
        exportComposite = new WorkspaceExportComposite();
        expect(ExportUtils.getExportType(exportComposite)).toEqual(ExportLevel.WORKSPACE);
    });

    describe('createDefaultWidgetPDFExportConfig Test', () => {
        beforeAll((done) => {
            WorkspaceStore.init();
            TestUtils.initialize(done);
        });

        it('should create default widget PDF Export config', () => {
            const expectedConfig = new PDFExportConfig();
            expectedConfig.appendTimestamp = true;
            expectedConfig.layout = PDFPageLayout.W1X1;
            expectedConfig.exportLevel = ExportLevel.WIDGET;
            expect(ExportUtils.createDefaultWidgetPDFExportConfig(new Widget(WidgetConfigType.BAR))).toEqual(expectedConfig);
        });

        it('should openExportModal with defaultWidgetPDFExportConfig', () => {
            const widget = new Widget();
            const exportComposite = new ExportComposite();
            exportComposite.widget = widget;
            const dummyPdfConfig = new PDFExportConfig();
            exportComposite.exportConfig = dummyPdfConfig;
            const report = new Report();
            report.title = "report 1";
            exportComposite.report = report;
            WorkspaceStore.currentReport$.next(report);
            const comparisonConfig = new ComparisonConfig();
            const comparisonConfigMap = new Map<number, ComparisonConfig>();
            comparisonConfigMap.set(report.key, comparisonConfig);
            const workpad: FlatWorkpad = new FlatWorkpad({
                reports: [{}],
                portfolio: {ticker: 'PEP'},
                comparisonConfigMap: comparisonConfigMap
            });

            WorkspaceStore.currentWorkpad$.next(workpad);
            jest.spyOn<any>(ExportUtils, 'createDefaultWidgetPDFExportConfig').mockReturnValue(dummyPdfConfig);
            const receivedComposite = ExportUtils.getExportComposite('Export to PDF', 'Export Widget', widget);
            expect(receivedComposite).toEqual(exportComposite);
        });

        it('should set export level to Simple Table', () => {
            const widget = new Widget();
            const exportComposite = new ExportComposite();
            exportComposite.widget = widget;
            const dummyPdfConfig = new PDFExportConfig();
            exportComposite.exportConfig = dummyPdfConfig;
            const receivedComposite = ExportUtils.getExportComposite('Export to PDF', 'Grid', widget, undefined, 'dummyTableData', 'dummyOutlineData');
            expect(receivedComposite.exportConfig instanceof TablePDFExportConfig).toBeTruthy();
            expect(receivedComposite.outlineData).toBe('dummyOutlineData');
            expect(receivedComposite.tableData).toBe('dummyTableData');
        });

        describe('Excel Export config Test for widget', () => {
            it('should create export config for widget level excel export', () => {
                const exportComposite = new ExportComposite();
                const widget = new Widget(WidgetConfigType.BAR);
                exportComposite.widget = widget;
                const dummyExcelConfig = new ExcelExportConfig();
                dummyExcelConfig.appendTimestamp = true;
                exportComposite.exportConfig = dummyExcelConfig;
                exportComposite.exportConfig.exportLevel = ExportLevel.WIDGET;
                const report = new Report();
                exportComposite.report = report;
                WorkspaceStore.currentReport$.next(report);
                const receivedComposite = ExportUtils.getExportComposite('Export to Excel', 'Export Widget', widget, undefined, undefined, undefined);

                expect(receivedComposite).toEqual(exportComposite);
            });
        });
    });

    describe('Test getExportComposite', () => {
        describe('Test getExportComposite for Comparison requests', () => {
            beforeAll(() => {
                WorkspaceStore.init();
            });
            const report = new Report();
            report.title = "report 1";
            report.comparisonConfigId = 1;
            it('Test getExportComposite for PDF with no comparison', () => {
                WorkspaceStore.currentReport$.next(report);
                const comparisonConfig = new ComparisonConfig();
                const comparisonConfigMap = new Map<number, ComparisonConfig>();
                comparisonConfigMap.set(report.comparisonConfigId, comparisonConfig);
                const workpad: FlatWorkpad = new FlatWorkpad({
                    reports: [{}],
                    portfolio: {ticker: 'PEP'},
                    comparisonConfigMap: comparisonConfigMap
                });
                WorkspaceStore.currentWorkpad$.next(workpad);

                const exportComposite = ExportUtils.getExportComposite(WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF, ExportConstants.EXPORT_PDF_REPORT);
                // There shouldn't be any portfolios (needed for comparison)
                expect(exportComposite.portfolios).toEqual([]);
            });

            it('Test getExportComposite for PDF with comparison', () => {
                const comparisonConfig = new ComparisonConfig();
                comparisonConfig.portComparisonList = ['PEP', 'IP'];
                const comparisonConfigMap = new Map<number, ComparisonConfig>();
                comparisonConfigMap.set(report.comparisonConfigId, comparisonConfig);

                WorkspaceStore.currentReport$.next(report);
                const port1 = new Portfolio();
                const port2 = new Portfolio();
                const reportGroup = new ReportGroup();
                reportGroup.comparisonConfigMap = comparisonConfigMap;
                reportGroup.addPortfolios([port1, port2]);
                WorkspaceStore.currentWorkpad$.next(reportGroup);
                const exportComposite = ExportUtils.getExportComposite(WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF, ExportConstants.EXPORT_PDF_REPORT);
                // There shouldn't be any portfolios (needed for comparison)
                expect(exportComposite.portfolios.length).toEqual(2);
            });
        });
    });

    describe('Test sanitizeFileName', () => {
        it('Test sanitizeFileName with illegal characters', () => {
            const illegalFileName = 'testing?:\\/|<>"*file.name';
            expect(ExportUtils.sanitizeFileName(illegalFileName)).toEqual('testing_________filename');
        });
    });

    describe('Test EBC downloadSettingsUpdate', () => {
        it('Test downloadSettingsUpdate which overwrites download settings in EBC', () => {
            const downloadFromURL: URL = new URL('blob:http://localhost:4100/6fbb3375-023b-413f-94f3-cac193a556b6')
            const downloadTo: string = 'target:\\directory\\path';
            const expectOutputSettings = {
                "downloadFrom": new URL(downloadFromURL.href).pathname,
                "downloadSettingOptions": {
                    "downloadTo": downloadTo,
                    "overwriteDownloads": false
                }
            };
            expect(ExportUtils.downloadSettingsUpdate(downloadFromURL, downloadTo)).toEqual(expectOutputSettings);
        });
    });

    it('Test processCellForExport', () => {
        const rowGroupColumn = {
            getColId: () => ColumnConstants.AUTO_GRP_COLUMN,
            getColDef: () => ({ field: 'security_description_1', valueFormatter: undefined})
        } as any;

        // row group, first column
        const rowGroupData = {
            [ColumnConstants.AUTO_GRP_COLUMN]: 'CASH',
            rowId: 2,
            _ROOT_: 'PEP',
            hasChildNodes: true,
            security_description_1: null,
            cusip_0: null,
            pct_mv_1: -1.9554493711603116,
            sec_group_hidden: null,
            title: 'CASH',
            'level-1': 2,
            sectorOrder: 0
        };
        const cellCopyParams = {
            value: 2,
            node: {
                data: rowGroupData
            },
            column: rowGroupColumn
        } as ProcessCellForExportParams;
        expect(ExportUtils.processCellForExport(cellCopyParams)).toEqual('CASH');

        const valueFormatter  = (params) => {
            return params.value + '%';
        };

        // row group, not first column
        cellCopyParams.column = {
            getColId: () => 'pct_mv_1',
            getColDef: () => ({ field: 'pct_mv_1', valueFormatter: undefined})
        } as any;
        cellCopyParams.value = -1.9554493711603116;
        expect(ExportUtils.processCellForExport(cellCopyParams)).toEqual(-1.9554493711603116);


        // with formatter
        cellCopyParams.column = {
            getColId: () => 'pct_mv_1',
            getColDef: () => ({ field: 'pct_mv_1', valueFormatter})
        } as any;
        cellCopyParams.value = -1.9554493711603116;
        expect(ExportUtils.processCellForExport(cellCopyParams)).toEqual(-1.9554493711603116 + '%');

        // child row, first column
        cellCopyParams.node.data = {
            rowId: 3,
            _ROOT_: 'PEP',
            hasChildNodes: false,
            security_description_1: 'AUD CASH(Alpha Committed)',
            cusip_0: 'AUD_CCASH',
            pct_mv_1: 0.08786579691730016,
            sec_group_hidden: 'CASH',
            'level-1': 2
        };
        cellCopyParams.column = rowGroupColumn;
        cellCopyParams.value = 'AUD CASH(Alpha Committed)';
        expect(ExportUtils.processCellForExport(cellCopyParams)).toEqual('AUD CASH(Alpha Committed)');
    });

    it('Test checkGenerateApiRequestSupported', () => {
        let port = new AdhocPortfolio();
        expect(ExportUtils.checkGenerateApiRequestSupported(port)[0]).toBeFalsy();
        port = new AdhocPortGroup();
        expect(ExportUtils.checkGenerateApiRequestSupported(port)[0]).toBeFalsy();
        port = new WhatIfPortfolio();
        expect(ExportUtils.checkGenerateApiRequestSupported(port)[0]).toBeFalsy();
    });
});
