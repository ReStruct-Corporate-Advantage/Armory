/**
 * Enum for pdf page layout options
 */
export enum PDFPageLayout {
    REPORT_AS_IS = 0, // Report as-is
    W1X1 = 1, // Single Widget
    W1X2 = 2, // Multi Widget 1 X 2 (1 row, 2 columns)
    W2X1 = 3, // Multi Widget 2 X 1 (2 rows, 1 column)
    W1X3 = 4, // Multi Widget 1 X 3 (1 row, 3 columns)
    W3X1 = 5, // Multi Widget 3 X 1 (3 rows, 1 column)
    W2X2 = 6, // Multi Widget 2 X 2 (2 rows, 2 columns)
    W2X3 = 7, // Multi Widget 2 X 3 (2 rows, 3 columns)
    W3X2 = 8 // Multi Widget 3 X 2 (3 rows, 2 columns)
}

export namespace PDFPageLayout {

    /**
     * Helper method to convert Prism PrintWidgetLayout favorites into Explore ones
     */
    export function getExplorePDFPageLayoutFromPrism(widgetLayout: string): PDFPageLayout {
        switch (widgetLayout) {
            case 'SINGLE' :
                return PDFPageLayout.W1X1;
            case 'MULTI_1_2' :
                return PDFPageLayout.W1X2;
            case 'MULTI_2_1' :
                return PDFPageLayout.W2X1;
            case 'MULTI_1_3' :
                return PDFPageLayout.W1X3;
            case 'MULTI_3_1' :
                return PDFPageLayout.W3X1;
            case 'MULTI_2_2' :
                return PDFPageLayout.W2X2;
            case 'MULTI_2_3' :
                return PDFPageLayout.W2X3;
            case 'MULTI_3_2' :
                return PDFPageLayout.W3X2;
            default:
                return PDFPageLayout.W1X1;
        }
    }

    /**
     * returns the display name corresponding to each PDFPageFormat.
     */
    export function getPDFLayoutLabel(pageLayout: PDFPageLayout): string {
        switch (pageLayout) {
            case PDFPageLayout.REPORT_AS_IS :
                return 'Report As Is';
            case PDFPageLayout.W1X1 :
                return 'Single Widget';
            case PDFPageLayout.W1X2 :
                return 'Multi Widget 1x2';
            case PDFPageLayout.W2X1 :
                return 'Multi Widget 2x1';
            case PDFPageLayout.W1X3 :
                return 'Multi Widget 1x3';
            case PDFPageLayout.W3X1 :
                return 'Multi Widget 3x1';
            case PDFPageLayout.W2X2 :
                return 'Multi Widget 2x2';
            case PDFPageLayout.W2X3 :
                return 'Multi Widget 2x3';
            case PDFPageLayout.W3X2 :
                return 'Multi Widget 3x2';
        }
    }

    /**
     * Get PDF Page Layout list with its values and label
     */
    export function getAllPDFPageLayouts(): { value: PDFPageLayout, label: string }[] {
        const pageLayouts: PDFPageLayout[] = Object.keys(PDFPageLayout).map(k => PDFPageLayout[k]).filter(v => typeof v === 'number') as number[];
        return pageLayouts.map(item => ({
                value: item,
                label: getPDFLayoutLabel(item)
            }));
    }
}
