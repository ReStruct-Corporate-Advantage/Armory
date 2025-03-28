/**
 * Enum for table pdf scaling options
 */
export enum TablePDFScaling {
    NO_SCALING = 0, // No data scaling
    FIT_ALL_COLS = 1, // Fit all columns to page
    FIT_ALL_ROWS = 2, // Fit all rows to page
    FIT_PAGE = 3 // Fit everything to page
}

// tslint:disable-next-line:no-namespace
export namespace TablePDFScaling {
    export function getLabel(scaling: TablePDFScaling): string {
        switch (scaling) {
            case TablePDFScaling.NO_SCALING:
                return 'No Scaling';
            case TablePDFScaling.FIT_ALL_COLS:
                return 'Fit all columns on one page';
            case TablePDFScaling.FIT_ALL_ROWS:
                return 'Fit all rows to page';
            case TablePDFScaling.FIT_PAGE:
                return 'Fit everything to page';
        }
    }

    export function getAllTablePDFScalings(): { value: TablePDFScaling, label: string }[] {
        const pdfScalings: TablePDFScaling[] = Object.keys(TablePDFScaling).map(k => TablePDFScaling[k]).filter(v => typeof v === 'number') as number[];
        return pdfScalings.map(scaling => ({
            value: scaling,
            label: getLabel(scaling)
        }));
    }
}
