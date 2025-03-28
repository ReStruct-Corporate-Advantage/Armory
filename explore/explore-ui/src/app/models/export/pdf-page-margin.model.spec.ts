import {PDFPageMargin} from './pdf-page-margin.model';
import {PDFExportConfig} from './pdf-export-config.model';
import {jsPDF} from 'jspdf';
import {PDFExportOrientation} from '../../enums/export/pdf-export-orientation.enum';
import {PDFPageFormat} from '../../enums/export/pdf-page-format.enum';

describe('Models/Export', function () {
    describe('PDFPageMargin tests', function () {

        /**
         * Tests equals method
         */
        it('Tests PDFPageMargin equals method', function () {
            let PDFPageMargin1 = PDFPageMargin.NORMAL;
            let PDFPageMargin2 = PDFPageMargin.NORMAL;
            expect(PDFPageMargin1.equals(PDFPageMargin2)).toBeTruthy();

            PDFPageMargin2 = PDFPageMargin.MODERATE;
            expect(PDFPageMargin2.equals(PDFPageMargin1)).toBeFalsy();

            PDFPageMargin2 = PDFPageMargin.NARROW;
            expect(PDFPageMargin2.equals(PDFPageMargin1)).toBeFalsy();

            PDFPageMargin2 = PDFPageMargin.CUSTOM;
            expect(PDFPageMargin2.equals(PDFPageMargin1)).toBeFalsy();
        });

        it('Tests serialize/deserialize function', function () {

            const customPageMargin = new PDFPageMargin(1, 1.5, 2, 1, PDFPageMargin.INCHES, true);

            let data = customPageMargin.serialize();

            // First test a custom page margin
            let deserialized: PDFPageMargin = PDFPageMargin.deserialize(data);

            expect(deserialized.top).toEqual(1);
            expect(deserialized.right).toEqual(1.5);
            expect(deserialized.bottom).toEqual(2);
            expect(deserialized.left).toEqual(1);
            expect(deserialized.units).toEqual(PDFPageMargin.INCHES);
            expect(deserialized.isCustom).toBeTruthy();

            // Test the Narrow margins options
            const narrowPageMargin = PDFPageMargin.NARROW;
            data = narrowPageMargin.serialize();
            deserialized = PDFPageMargin.deserialize(data);
            expect(deserialized).toEqual(PDFPageMargin.NARROW);

            // Test the Moderate margins options
            const moderatePageMargin = PDFPageMargin.MODERATE;
            data = moderatePageMargin.serialize();
            deserialized = PDFPageMargin.deserialize(data);
            expect(deserialized).toEqual(PDFPageMargin.MODERATE);

            // Test the Wide margins options
            const widePageMargin = PDFPageMargin.WIDE;
            data = widePageMargin.serialize();
            deserialized = PDFPageMargin.deserialize(data);
            expect(deserialized).toEqual(PDFPageMargin.WIDE);

            // Test the Normal margins options
            const normalPageMargin = PDFPageMargin.NORMAL;
            data = normalPageMargin.serialize();
            deserialized = PDFPageMargin.deserialize(data);
            expect(deserialized).toEqual(PDFPageMargin.NORMAL);
        });

        /**
         * Tests PDFPageMargin getExplorePDFPageMarginFromPrism function
         */
        it('Tests PDFPageMargin getExplorePDFPageMarginFromPrism function', function () {
            expect(PDFPageMargin.getExplorePDFPageMarginFromPrism('NORMAL:1:1:1:1')).toEqual(PDFPageMargin.NORMAL);
            expect(PDFPageMargin.getExplorePDFPageMarginFromPrism('NARROW:0.5:0.5:0.5:0.5')).toEqual(PDFPageMargin.NARROW);
            expect(PDFPageMargin.getExplorePDFPageMarginFromPrism('MODERATE:1:0.75:1:0.75')).toEqual(PDFPageMargin.MODERATE);
            expect(PDFPageMargin.getExplorePDFPageMarginFromPrism('WIDE:1:2:1:2')).toEqual(PDFPageMargin.WIDE);

            const customPrismPageMargin = PDFPageMargin.getExplorePDFPageMarginFromPrism('CUSTOM:1:4:3:2');

            expect(customPrismPageMargin.top).toEqual(1);
            expect(customPrismPageMargin.right).toEqual(2);
            expect(customPrismPageMargin.bottom).toEqual(3);
            expect(customPrismPageMargin.left).toEqual(4);
            expect(customPrismPageMargin.units).toEqual(PDFPageMargin.INCHES);
            expect(customPrismPageMargin.isCustom).toBeTruthy();
        });

        /**
         * Tests PDFPageMargin convertInchesTojsPDFPixels function
         */
        it('Tests PDFPageMargin convertInchesTojsPDFPixels function', function () {

            // test for page format LETTER
            const pdfExportConfig = new PDFExportConfig();
            pdfExportConfig.pageFormat = PDFPageFormat.LETTER;
            let pdfPageMarginInPx1 = new PDFPageMargin(54, 54, 54, 54, 'px', false);
            validateConvertInchesToJsPDFPixels(pdfExportConfig, pdfPageMarginInPx1);

            // test for page format LEGAL
            pdfExportConfig.pageFormat = PDFPageFormat.LEGAL;
            validateConvertInchesToJsPDFPixels(pdfExportConfig, pdfPageMarginInPx1);

            // test for page format A4
            pdfExportConfig.pageFormat = PDFPageFormat.A4;
            pdfPageMarginInPx1 = new PDFPageMargin(54.00037737127043, 54.00037737127043, 54.00037737127043, 54.00037737127043, 'px', false);
            validateConvertInchesToJsPDFPixels(pdfExportConfig, pdfPageMarginInPx1);

            // test for page format A3
            pdfExportConfig.pageFormat = PDFPageFormat.A3;
            pdfPageMarginInPx1 = new PDFPageMargin(54.000076969785084, 54.000076969785084, 54.000076969785084, 54.000076969785084, 'px', false);
            validateConvertInchesToJsPDFPixels(pdfExportConfig, pdfPageMarginInPx1);

            // test for page format A2
            pdfExportConfig.pageFormat = PDFPageFormat.A2;
            pdfPageMarginInPx1 = new PDFPageMargin(54.000054428680286, 54.000054428680286, 54.000054428680286, 54.000054428680286, 'px', false);
            validateConvertInchesToJsPDFPixels(pdfExportConfig, pdfPageMarginInPx1);

            // test for page format A1
            pdfExportConfig.pageFormat = PDFPageFormat.A1;
            pdfPageMarginInPx1 = new PDFPageMargin(54.000076969785084, 54.000076969785084, 54.000076969785084, 54.000076969785084, 'px', true);
            validateConvertInchesToJsPDFPixels(pdfExportConfig, pdfPageMarginInPx1);
        });

        /**
         * Creates a jsPDF document with the exportConfig passed in
         */
        function createPDFDoc(exportConfig: PDFExportConfig): any {
            // Grab the PDF options from the export config
            const pdfOptions = {
                orientation: PDFExportOrientation[exportConfig.orientation].toLowerCase(),
                format: PDFPageFormat[exportConfig.pageFormat].toLowerCase(),
                unit: 'px'
            };
            return new jsPDF(pdfOptions);
        }

        /**
         * Function to validate conversion of Inches To jsPDF Pixels
         */
        function validateConvertInchesToJsPDFPixels(pdfExportConfig: PDFExportConfig, pdfPageMarginInPx1: PDFPageMargin) {
            pdfExportConfig.pageMargin = new PDFPageMargin(1, 1, 1, 1, PDFPageMargin.INCHES, false);
            if(pdfExportConfig.pageFormat === PDFPageFormat.A1) {
                pdfExportConfig.pageMargin.isCustom = true;
            }
            const pdfPageMarginInPx2 = PDFPageMargin.convertInchesTojsPDFPixels(pdfExportConfig, createPDFDoc(pdfExportConfig));
            expect(pdfPageMarginInPx2).toEqual(pdfPageMarginInPx1);
        }
    });
});
