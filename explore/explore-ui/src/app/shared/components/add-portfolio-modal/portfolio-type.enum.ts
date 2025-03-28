
export enum PortfolioType {
    PORTFOLIO,
    WHAT_IF,
    INDEX_RESEARCH,
    CUSTOM,
    EXPOSURE_BASED,
}

export class PortfolioTypeEnumUtils {
    /**
     * Get display name for given portfolio type
     * @param type enum
     */
    public static displayName(type: PortfolioType): string {
        let label: string;
        switch (type) {
            case PortfolioType.CUSTOM:
                label = 'Add Custom Portfolio';
                break;
            case PortfolioType.PORTFOLIO:
                label = 'Add Portfolio';
                break;
            case PortfolioType.WHAT_IF:
                label = 'Add What-if Portfolio';
                break;
            case PortfolioType.INDEX_RESEARCH:
                label = 'Add Index Research';
                break;
            case PortfolioType.EXPOSURE_BASED:
                label = 'Add Exposure Based Portfolio';
                break;
        }

        return label;
    }
}
