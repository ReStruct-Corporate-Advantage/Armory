/**
 * Purpose of this Test file is to test the various methods of PDFPageFormat enum.
 */
import {PDFPageFormat} from './pdf-page-format.enum';
import {isEqual} from 'lodash';

describe('PDFPageFormat class tests', function () {
    it('Test getDisplayName function', function () {
        const pageFormat = PDFPageFormat.LETTER;
        // validating the values.
        expect(PDFPageFormat.getDisplayName(pageFormat)).toBe('Letter');
    });

    it('Test getAllPDFPageFormats function', function () {
        const expectedPageFormatList: { value: PDFPageFormat, label: string }[] = [
            {'value': PDFPageFormat.LETTER, 'label': 'Letter'},
            {'value': PDFPageFormat.LEGAL, 'label': 'Legal'},
            {'value': PDFPageFormat.A4, 'label': 'A4'},
            {'value': PDFPageFormat.A3, 'label': 'A3'},
            {'value': PDFPageFormat.A2, 'label': 'A2'},
            {'value': PDFPageFormat.A1, 'label': 'A1'}];

        const actualList: { value: PDFPageFormat, label: string }[] = PDFPageFormat.getAllPDFPageFormats();
        // validating the values.
        expect(isEqual(actualList[0], expectedPageFormatList[0])).toBeTruthy();
        expect(isEqual(actualList[1], expectedPageFormatList[1])).toBeTruthy();
        expect(isEqual(actualList[2], expectedPageFormatList[2])).toBeTruthy();
        expect(isEqual(actualList[3], expectedPageFormatList[3])).toBeTruthy();
        expect(isEqual(actualList[4], expectedPageFormatList[4])).toBeTruthy();
        expect(isEqual(actualList[5], expectedPageFormatList[5])).toBeTruthy();
    });
});
