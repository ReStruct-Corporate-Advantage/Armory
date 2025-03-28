/**
 * Enum for pdf page format options
 */
export enum PDFPageFormat {
    LETTER = 0, // Letter page size - 8.5" x 11"
    LEGAL = 1, // Legal page size - 8.5" x 14"
    A4 = 2, // A4 page size - 8.26772" x 11.6929" (210mm x 297mm)
    A3 = 3, // A3 page size - 11.6929" x 16.5354" (297mm x 420mm)
    A2 = 4, // A2 page size - 16.5354" x 23.3858" (420mm x 594mm)
    A1 = 5 // A1 page size - 23.3858" x 33.1102" (594mm x 841mm)
}

export namespace PDFPageFormat {

    /**
     * returns the display name corresponding to each PDFPageFormat.
     */
    export function getDisplayName(pageFormat: PDFPageFormat): string {
        switch (pageFormat) {
            case PDFPageFormat.LETTER:
                return 'Letter';
            case PDFPageFormat.LEGAL:
                return 'Legal';
            case PDFPageFormat.A4:
                return 'A4';
            case PDFPageFormat.A3:
                return 'A3';
            case PDFPageFormat.A2:
                return 'A2';
            case PDFPageFormat.A1:
                return 'A1';
        }
    }

    /**
     * Get PDF Page Format list with its values and label
     */
    export function getAllPDFPageFormats(): { value: PDFPageFormat, label: string }[] {
        const pageFormats: PDFPageFormat[] = Object.keys(PDFPageFormat).map(k => PDFPageFormat[k]).filter(v => typeof v === 'number') as number[];
        return pageFormats.map(pageFormat => ({
                value: pageFormat,
                label: getDisplayName(pageFormat)
            }));
    }
}
