/**
 * Enum for pdf export orientation options
 */
export enum PDFExportOrientation {
    LANDSCAPE = 0, // Horizontal orientation for PDF exports
    PORTRAIT = 1 // Vertical orientation for PDF exports
}

// tslint:disable-next-line:no-namespace
export namespace PDFExportOrientation {

    /**
     * returns the display name corresponding to each PDFExportOrientation.
     */
    export function getDisplayLabel(orientation: PDFExportOrientation): string {
        switch (orientation) {
            case PDFExportOrientation.LANDSCAPE :
                return 'Landscape';
            case PDFExportOrientation.PORTRAIT :
                return 'Portrait';
        }
    }

    export function getJsPDFOrientation(orientation: PDFExportOrientation): 'landscape' | 'portrait' {
        return PDFExportOrientation.LANDSCAPE === orientation ? 'landscape' : 'portrait';
    }

    /**
     * Get PDF export orientation list with its values and label
     */
    export function getAllPDFExportOrientations(): { value: PDFExportOrientation, label: string }[] {
        const orientations: PDFExportOrientation[] = Object.keys(PDFExportOrientation).map(k => PDFExportOrientation[k]).filter(v => typeof v === 'number') as number[];
        return orientations.map(item => ({
            value: item,
            label: getDisplayLabel(item)
        }));
    }
}
