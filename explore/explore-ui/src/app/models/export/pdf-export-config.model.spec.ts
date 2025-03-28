import {PDFPageMargin} from './pdf-page-margin.model';
import {PDFExportOrientation} from '@enums/export/pdf-export-orientation.enum';
import {PDFExportConfig} from './pdf-export-config.model';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';

/**
 * Test class for the PDFExportConfig model
 */
describe('Models/Export', function () {
    describe('PDFExportConfig tests', function () {

        /**
         * Validates default values for constructor
         */
        it('Validates default values from constructor', function () {
            const pdfExportConfig: PDFExportConfig = new PDFExportConfig();

            expect(pdfExportConfig.orientation).toEqual(PDFExportOrientation.PORTRAIT);
            expect(pdfExportConfig.layout).toEqual(PDFPageLayout.REPORT_AS_IS);
            expect(pdfExportConfig.pageFormat).toEqual(PDFPageFormat.LETTER);
            expect(pdfExportConfig.pageMargin).toEqual(PDFPageMargin.NORMAL);
            expect(pdfExportConfig.printAsIs).toBeTruthy();
            expect(pdfExportConfig.appendTimestamp).toBeFalsy();
        });

        /**
         * Tests serialize/deserialize methods
         */
        describe('Tests serialize/deserialize methods', function () {
            it('Tests Explore favorite serialize/deserialize methods', function () {
                const pdfExportConfig = new PDFExportConfig();

                pdfExportConfig.orientation = PDFExportOrientation.LANDSCAPE;
                pdfExportConfig.pageFormat = PDFPageFormat.A1;
                pdfExportConfig.layout = PDFPageLayout.W2X2;
                pdfExportConfig.pageMargin = PDFPageMargin.NARROW;

                // Serialize the PDFExportConfig
                let serialized: any = pdfExportConfig.serialize();

                // Construct a new PDFExportConfig via deserialization
                let deserialized: PDFExportConfig = new PDFExportConfig(serialized);

                // Test the equality of the PDFExportConfig objects
                testEquals(pdfExportConfig, deserialized);

                // Test with PDFPageLayout.REPORT_AS_IS
                pdfExportConfig.layout = PDFPageLayout.REPORT_AS_IS;
                serialized = pdfExportConfig.serialize();
                deserialized = new PDFExportConfig(serialized);
                // Test the equality of the PDFExportConfig objects
                testEquals(pdfExportConfig, deserialized);
            });

            it('Tests Prism favorite deserialize methods', function () {
                const prismFav = {
                    orientation: 0,
                    printAsIs: true,
                    pageFormat: 'Legal',
                    widgetLayout: 'MULTI_1_3',
                    pageMargin: 'WIDE:1:2:1:2'
                };

                const pdfExportConfig = new PDFExportConfig();

                pdfExportConfig.orientation = PDFExportOrientation.LANDSCAPE;
                pdfExportConfig.pageFormat = PDFPageFormat.LEGAL;
                pdfExportConfig.layout = PDFPageLayout.W1X3;
                pdfExportConfig.pageMargin = PDFPageMargin.WIDE;
                pdfExportConfig.printAsIs = true;

                const deserialized: PDFExportConfig = new PDFExportConfig();
                deserialized.deserialize(prismFav);

                // Test the equality of the PDFExportConfig objects
                testEquals(pdfExportConfig, deserialized);
            });
        });

        /**
         * Tests equality of two PDFExportConfig objects
         */
        function testEquals(first: PDFExportConfig, second: PDFExportConfig): void {
            expect(first.orientation).toEqual(second.orientation);
            expect(first.layout).toEqual(second.layout);
            expect(first.pageFormat).toEqual(second.pageFormat);
            expect(first.pageMargin).toEqual(second.pageMargin);
            expect(first.printAsIs).toEqual(second.printAsIs);
        }
    });
});
