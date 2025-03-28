/**
 * Enum for logo position options
 */
export enum PDFLogoPosition {
    TOP_RIGHT = 0,
    TOP_LEFT = 1,
    BOTTOM_RIGHT = 2,
    BOTTOM_LEFT = 3
}

export namespace PDFLogoPosition {
    export function getDisplayName(logoPosition: PDFLogoPosition): string {
        switch (logoPosition) {
            case PDFLogoPosition.TOP_RIGHT:
                return 'Top right';
            case PDFLogoPosition.TOP_LEFT:
                return 'Top left';
            case PDFLogoPosition.BOTTOM_RIGHT:
                return 'Bottom right';
            case PDFLogoPosition.BOTTOM_LEFT:
                return 'Bottom left';
        }
    }

    export function getAllPDFLogoPosition(): { value: PDFLogoPosition, label: string }[] {
        const logoPositions: PDFLogoPosition[] = Object.keys(PDFLogoPosition).map(k => PDFLogoPosition[k]).filter(v => typeof v === 'number') as number[];
        return logoPositions.map(logoPosition => ({
            value: logoPosition,
            label: getDisplayName(logoPosition)
        }));
    }
}
