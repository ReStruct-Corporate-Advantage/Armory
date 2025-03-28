export enum DiversificationAdditionalAnalytics {
    R2,
    BETA,
    STANDALONE_RISK,
    RISK_CONTRIBUTION,
}

export class DiversificationAdditionalAnalyticsUtil {

    public static getDisplayName(analytic: DiversificationAdditionalAnalytics): string {
        switch (analytic) {
            case DiversificationAdditionalAnalytics.R2:
                return 'R-Squared';
            case DiversificationAdditionalAnalytics.BETA:
                return 'Beta';
            case DiversificationAdditionalAnalytics.STANDALONE_RISK:
                return 'Standalone Risk';
            case DiversificationAdditionalAnalytics.RISK_CONTRIBUTION:
                return 'Risk Contribution';
        }
    }
}
