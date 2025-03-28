import {TokenConstants} from "@blk/explore-ui-core";

/**
 * Constants fot Risk related variables
 */
export class RiskConstants {
    static readonly PRA_GROUPING_TYPE = {
        FACTOR: 'byFactor',
        SECTOR: 'sectorOnly',
        SECTOR_TO_FACTOR: 'sector2Factor',
        PORTFOLIO_GROUP: 'portfolioGroup'
    };

    static readonly MATCHING_RISK_CATEGORIES_KEY = 'matchingRiskCategories';

    static readonly MATCHING_RISK_CATEGORIES = {
        DEPENDS_ON_ECONOMY: 'DEPENDS_ON_ECONOMY',
        DEPENDS_ON_EXPOSURE: 'DEPENDS_ON_EXPOSURE',
        BELONGS_TO_FACTOR_REPORT: 'BELONGS_TO_FACTOR_REPORT',
        BELONGS_TO_SECTOR_REPORT: 'BELONGS_TO_SECTOR_REPORT',
        BELONGS_TO_SECTOR_TO_FACTOR_REPORT: 'BELONGS_TO_SECTOR_TO_FACTOR_REPORT',
        BELONGS_TO_SECTOR_TO_SECURITY_REPORT: 'BELONGS_TO_SECTOR_TO_SECURITY_REPORT',
        BELONGS_TO_PORTFOLIO_REPORT: 'BELONGS_TO_PORTFOLIO_REPORT',
        IS_STRESS: 'IS_STRESS',
        SUPPORTS_BREAKDOWN: 'SUPPORTS_BREAKDOWN',
        IS_SUBTOTAL_ABLE: 'IS_SUBTOTAL_ABLE'
    };

    static readonly PRA_QUICK_COLUMN_SET = [
        {label: 'Analytical VAR', value: 'PRISM_VAR_COLS_AVAR'},
        {label: 'Stress P&L', value: 'PRISM_VAR_COLS_STRS'},
        {label: 'Historical VAR', value: 'PRISM_VAR_COLS_HVAR', token: TokenConstants.EXPLORE_ENABLE_RAS_HVAR_COLS}
    ];

    static readonly PRA_GROUPING_SET = [
        {
            label: 'Factor',
            value: RiskConstants.PRA_GROUPING_TYPE['FACTOR'],
            matchingRiskCategory: RiskConstants.MATCHING_RISK_CATEGORIES['BELONGS_TO_FACTOR_REPORT']
        },
        {
            label: 'Sector Only',
            value: RiskConstants.PRA_GROUPING_TYPE['SECTOR'],
            matchingRiskCategory: RiskConstants.MATCHING_RISK_CATEGORIES['BELONGS_TO_SECTOR_REPORT']
        },
        {
            label: 'Sector to Factor',
            value: RiskConstants.PRA_GROUPING_TYPE['SECTOR_TO_FACTOR'],
            matchingRiskCategory: RiskConstants.MATCHING_RISK_CATEGORIES['BELONGS_TO_SECTOR_TO_FACTOR_REPORT']
        },
        {
            label: 'Portfolio Group',
            value: RiskConstants.PRA_GROUPING_TYPE['PORTFOLIO_GROUP'],
            matchingRiskCategory: RiskConstants.MATCHING_RISK_CATEGORIES['BELONGS_TO_PORTFOLIO_REPORT']
        }
    ];

    static readonly RISK_SETTINGS = 'riskSettings';
}
