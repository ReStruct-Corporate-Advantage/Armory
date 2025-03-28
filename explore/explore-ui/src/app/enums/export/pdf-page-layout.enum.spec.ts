import {PDFPageLayout} from './pdf-page-layout.enum';
import {isEqual} from 'lodash';

describe('PDFPageLayout class tests', function () {

    it('Test getPDFLayoutLabel function', function () {
        const pageLayout = PDFPageLayout.REPORT_AS_IS;
        // validating the values.
        expect(PDFPageLayout.getPDFLayoutLabel(pageLayout)).toBe('Report As Is');
    });

    it('Test getAllPDFPageLayouts function', function () {
        const expectedPageLayoutList: { value: PDFPageLayout, label: string }[] = [
            {'value': PDFPageLayout.REPORT_AS_IS, 'label': 'Report As Is'},
            {'value': PDFPageLayout.W1X1, 'label': 'Single Widget'},
            {'value': PDFPageLayout.W1X2, 'label': 'Multi Widget 1x2'},
            {'value': PDFPageLayout.W2X1, 'label': 'Multi Widget 2x1'},
            {'value': PDFPageLayout.W1X3, 'label': 'Multi Widget 1x3'},
            {'value': PDFPageLayout.W3X1, 'label': 'Multi Widget 3x1'},
            {'value': PDFPageLayout.W2X2, 'label': 'Multi Widget 2x2'},
            {'value': PDFPageLayout.W2X3, 'label': 'Multi Widget 2x3'},
            {'value': PDFPageLayout.W3X2, 'label': 'Multi Widget 3x2'}];

        const actualList: { value: PDFPageLayout, label: string }[] = PDFPageLayout.getAllPDFPageLayouts();
        // validating the values.
        expect(isEqual(actualList, expectedPageLayoutList)).toBeTruthy();
    });


    it('Tests PDFPageLayout getExplorePDFPageLayoutFromPrism function', function () {
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('SINGLE')).toEqual(PDFPageLayout.W1X1);
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('MULTI_1_2')).toEqual(PDFPageLayout.W1X2);
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('MULTI_2_1')).toEqual(PDFPageLayout.W2X1);
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('MULTI_1_3')).toEqual(PDFPageLayout.W1X3);
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('MULTI_3_1')).toEqual(PDFPageLayout.W3X1);
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('MULTI_2_2')).toEqual(PDFPageLayout.W2X2);
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('MULTI_2_3')).toEqual(PDFPageLayout.W2X3);
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('MULTI_3_2')).toEqual(PDFPageLayout.W3X2);
        expect(PDFPageLayout.getExplorePDFPageLayoutFromPrism('test')).toEqual(PDFPageLayout.W1X1);
    });
});
