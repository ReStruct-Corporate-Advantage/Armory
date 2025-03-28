/**
 * Margin Analytics Calculation style
 */
export enum MarginAnalyticsCalculationStyle {
    PARENT_PROPORTIONAL = 'PARENT_PROPORTIONAL',
    LEVEL_PROPORTIONAL = 'LEVEL_PROPORTIONAL',
    MARGINAL_MARGIN = 'MARGINAL_MARGIN',
    STANDALONE = 'STANDALONE'
}

export namespace MarginAnalyticsCalculationStyle {
    export function getDisplayName(calculationStyle: MarginAnalyticsCalculationStyle): string {
        switch (calculationStyle) {
            case MarginAnalyticsCalculationStyle.PARENT_PROPORTIONAL:
                return 'Parent Proportional';
            case MarginAnalyticsCalculationStyle.LEVEL_PROPORTIONAL:
                return 'Level Proportional';
            case MarginAnalyticsCalculationStyle.MARGINAL_MARGIN:
                return 'Marginal Margin';
            case MarginAnalyticsCalculationStyle.STANDALONE:
                return 'Standalone';
        }
    }

    export function getAllCalculationStyles(): {value: MarginAnalyticsCalculationStyle, label: string}[] {
        const calculationStyles: MarginAnalyticsCalculationStyle[] = Object.keys(MarginAnalyticsCalculationStyle).map(k => MarginAnalyticsCalculationStyle[k]);
        return calculationStyles.map(logoPosition => ({
            value: logoPosition,
            label: getDisplayName(logoPosition)
        }));
    }
}
