import {ExportConstants} from '../../constants';
import {PDFPageFormat} from '../../enums/export/pdf-page-format.enum';
import {PDFExportConfig} from './pdf-export-config.model';

/**
 * Represents the configuration of a PDF page's margin
 */
export class PDFPageMargin {

    static PIXELS = 'px';
    static INCHES = 'in';
    static NORMAL: PDFPageMargin = new PDFPageMargin(1, 1, 1, 1, PDFPageMargin.INCHES, false);

    static NARROW: PDFPageMargin = new PDFPageMargin(0.5, 0.5, 0.5, 0.5, PDFPageMargin.INCHES, false);
    static MODERATE: PDFPageMargin = new PDFPageMargin(1, 0.75, 1, 0.75, PDFPageMargin.INCHES, false);
    static WIDE: PDFPageMargin = new PDFPageMargin(1, 2, 1, 2, PDFPageMargin.INCHES, false);
    static CUSTOM: PDFPageMargin = new PDFPageMargin(0.5, 0.5, 0.5, 0.5, PDFPageMargin.INCHES, true);

    constructor(public top: number, public right: number, public bottom: number, public left: number,
                public units: string = PDFPageMargin.PIXELS, public isCustom: boolean = false) {
    }

    /**
     * Converts the PDFPageMargin from inches to pixels
     */
    static convertInchesTojsPDFPixels(exportConfig: PDFExportConfig, pdfDoc: any): PDFPageMargin {
        // Get the width of the pdfDoc in pixels that jsPDF created
        const jsPDFDocWidthInPixels = pdfDoc.internal.pageSize.getWidth();
        let pageFormatWidthLengthInInches;
        switch (exportConfig.pageFormat) {
            case PDFPageFormat.LETTER :
            case PDFPageFormat.LEGAL :
                pageFormatWidthLengthInInches = 8.5;
                break;
            case PDFPageFormat.A4 :
                pageFormatWidthLengthInInches = 8.26772;
                break;
            case PDFPageFormat.A3 :
                pageFormatWidthLengthInInches = 11.6929;
                break;
            case PDFPageFormat.A2 :
                pageFormatWidthLengthInInches = 16.5354;
                break;
            case PDFPageFormat.A1 :
                pageFormatWidthLengthInInches = 23.3858;
                break;
            default:
                console.log('Invalid PDFPageFormat passed in');
        }

        // Find the ratio of pixels per inch
        const jsPDFPixelsPerInch = jsPDFDocWidthInPixels / pageFormatWidthLengthInInches;

        // Update the values of the pageMargin
        exportConfig.pageMargin.top *= jsPDFPixelsPerInch;
        exportConfig.pageMargin.right *= jsPDFPixelsPerInch;
        exportConfig.pageMargin.bottom *= jsPDFPixelsPerInch;
        exportConfig.pageMargin.left *= jsPDFPixelsPerInch;
        exportConfig.pageMargin.units = PDFPageMargin.PIXELS;

        return exportConfig.pageMargin.isCustom ? PDFPageMargin.createCopy(exportConfig.pageMargin) : exportConfig.pageMargin;
    }

    /**
     * Returns a copy of the passed in PDFPageMargin
     */
    public static createCopy = (pageMargin: PDFPageMargin): PDFPageMargin => {
        return new PDFPageMargin(pageMargin.top, pageMargin.right, pageMargin.bottom, pageMargin.left, pageMargin.units, pageMargin.isCustom);
    }

    /**
     * Deserialize the json data into a PDFPageMargin
     */
    static deserialize(data: any): PDFPageMargin {
        return data.isCustom ? new PDFPageMargin(data.top, data.right, data.bottom, data.left, data.units, true) : PDFPageMargin[data.option];
    }


    /**
     * Helper function to convert a Prism PaperMargin favorite to an Explore one
     */
    static getExplorePDFPageMarginFromPrism(pageMargin: string): PDFPageMargin {
        const splitPrismMargin = pageMargin.split(':');
        const pageMarginOption = splitPrismMargin[0].toUpperCase();
        if (pageMarginOption === ExportConstants.PAGE_MARGIN_CUSTOM) {
            return new PDFPageMargin(parseFloat(splitPrismMargin[1]), parseFloat(splitPrismMargin[4]), parseFloat(splitPrismMargin[3]), parseFloat(splitPrismMargin[2]), PDFPageMargin.INCHES, true);
        } else {
            return PDFPageMargin[pageMarginOption];
        }
    }

    /**
     * Get display lebel from PDFPageMargin
     */
    static getLabel(margin): string {
        switch (margin) {
            case PDFPageMargin.NORMAL:
                return 'Normal';
            case PDFPageMargin.NARROW:
                return 'Narrow';
            case PDFPageMargin.MODERATE:
                return 'Moderate';
            case PDFPageMargin.WIDE:
                return 'Wide';
            case PDFPageMargin.CUSTOM:
                return 'Custom';
        }
        return 'Not specified';
    }

    /**
     * Serialize a PDFPageMargin
     */
    serialize(): any {
        const data: any = {
            isCustom: this.isCustom
        };

        // If it's custom, then save down the full configuration
        if (this.isCustom) {
            data.top = this.top;
            data.right = this.right;
            data.bottom = this.bottom;
            data.left = this.left;
            data.units = this.units;
        } else {
            // Else, just save down the option the user picked
            if (this === PDFPageMargin.NARROW) {
                data.option = ExportConstants.PAGE_MARGIN_NARROW;
            } else if (this === PDFPageMargin.MODERATE) {
                data.option = ExportConstants.PAGE_MARGIN_MODERATE;
            } else if (this === PDFPageMargin.WIDE) {
                data.option = ExportConstants.PAGE_MARGIN_WIDE;
            } else {
                // Default to Normal if we can't find anything else
                data.option = ExportConstants.PAGE_MARGIN_NORMAL;
            }
        }

        return data;
    }

    /**
     * Return true if the passed in otherPDFPageMargin  is equal to PDFPageMargin
     */
    equals(otherPDFPageMargin: PDFPageMargin): boolean {
        if (this.isCustom !== otherPDFPageMargin.isCustom) {
            return false;
        }
        if (this.units !== otherPDFPageMargin.units) {
            return false;
        }
        if (this.top !== otherPDFPageMargin.top) {
            return false;
        }
        if (this.bottom !== otherPDFPageMargin.bottom) {
            return false;
        }
        if (this.left !== otherPDFPageMargin.left) {
            return false;
        }
        return this.right === otherPDFPageMargin.right
    }
}

