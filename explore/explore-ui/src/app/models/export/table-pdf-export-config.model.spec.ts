import {TablePDFExportConfig} from './table-pdf-export-config.model';
import {TablePDFScaling} from '@enums/export/table-pdf-scaling.enum';
import {PDFExportOrientation} from '@enums/export/pdf-export-orientation.enum';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {PDFPageMargin} from './pdf-page-margin.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';

/**
 * Test class for the TablePDFExportConfig model
 */
describe('Models/Export', function () {
    describe('TablePDFExportConfig tests', function () {

        /**
         * Validates default values for constructor
         */
        it('Validates default values from constructor', function () {
            const exportConfig = new TablePDFExportConfig();

            expect(exportConfig.fullyExpanded).toBeTruthy();
            expect(exportConfig.visibleOnly).toBeFalsy();
            expect(exportConfig.customLevel).toBeFalsy();
            expect(exportConfig.customLevelDepth).toEqual(0);
            expect(exportConfig.scaling).toEqual(TablePDFScaling.NO_SCALING);
        });

        /**
         * Tests the serialize method
         */
        it('Test serialize/deserialize method', function () {
            const exportConfig = new TablePDFExportConfig();

            exportConfig.orientation = PDFExportOrientation.LANDSCAPE;
            exportConfig.pageFormat = PDFPageFormat.A4;
            exportConfig.scaling = TablePDFScaling.FIT_ALL_COLS;
            exportConfig.pageMargin = new PDFPageMargin(1, 1.5, 2, 1, PDFPageMargin.INCHES, true);
            exportConfig.logoConfig.logoImageFile = 'imagedata';

            let serialized = exportConfig.serialize();

            let deserializedExportConfig = new TablePDFExportConfig(serialized);
            expect(deserializedExportConfig.fullyExpanded).toBeTruthy();
            expect(deserializedExportConfig.visibleOnly).toBeFalsy();
            expect(deserializedExportConfig.customLevel).toBeFalsy();
            expect(deserializedExportConfig.customLevelDepth).toEqual(0);
            expect(deserializedExportConfig.scaling).toEqual(TablePDFScaling.FIT_ALL_COLS);

            deserializedExportConfig = new TablePDFExportConfig(new PDFExportConfig());
            expect(deserializedExportConfig.fullyExpanded).toBeTruthy();
            expect(deserializedExportConfig.visibleOnly).toBeFalsy();
            expect(deserializedExportConfig.customLevel).toBeFalsy();
            expect(deserializedExportConfig.customLevelDepth).toEqual(0);
            expect(deserializedExportConfig.scaling).toEqual(TablePDFScaling.NO_SCALING);

            const expectedData = {
                configType: 'TablePDFExportConfig',
                orientation: 0,
                pageFormat: 'A4',
                fullyExpanded: true,
                visibleOnly: false,
                customLevel: false,
                customLevelDepth: 0,
                type: 'application/pdf',
                scaling: 'FIT_ALL_COLS',
                pageMargin: 'CUSTOM:1:1.5:2:1',
                appendTimestamp: false,
                logoConfig: {
                    'logoImageFile': 'imagedata',
                    'logoPosition': 0,
                    'logoPresent': false
                }
            };

            expect(serialized).toEqual(expectedData);

            // Test with a non-custom pageMargin
            exportConfig.pageMargin = PDFPageMargin.NARROW;
            serialized = exportConfig.serialize();

            expectedData.pageMargin = 'NARROW:0.5:0.5:0.5:0.5';
            expect(serialized).toEqual(expectedData);

            // Test out units that have already been converted to pixels
            exportConfig.pageMargin = PDFPageMargin.NARROW;
            exportConfig.pageMargin.units = PDFPageMargin.PIXELS;
            expectedData.pageMargin = 'NARROW:0.5:0.5:0.5:0.5';
            serialized = exportConfig.serialize();
            expect(serialized).toEqual(expectedData);

            exportConfig.pageMargin = PDFPageMargin.MODERATE;
            exportConfig.pageMargin.units = PDFPageMargin.PIXELS;
            expectedData.pageMargin = 'MODERATE:1:0.75:1:0.75';
            serialized = exportConfig.serialize();
            expect(serialized).toEqual(expectedData);

            exportConfig.pageMargin = PDFPageMargin.WIDE;
            exportConfig.pageMargin.units = PDFPageMargin.PIXELS;
            expectedData.pageMargin = 'WIDE:1:2:1:2';
            serialized = exportConfig.serialize();
            expect(serialized).toEqual(expectedData);

            exportConfig.pageMargin = PDFPageMargin.NORMAL;
            exportConfig.pageMargin.units = PDFPageMargin.PIXELS;
            expectedData.pageMargin = 'NORMAL:1:1:1:1';
            serialized = exportConfig.serialize();
            expect(serialized).toEqual(expectedData);
        });
    });
});
