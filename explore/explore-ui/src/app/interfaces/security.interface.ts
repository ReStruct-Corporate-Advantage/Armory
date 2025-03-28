import {SecuritySearchItem} from '@interfaces/security-search-item.interface';

/**
 * Defines attributes of a security
 */
export interface Security extends SecuritySearchItem {
    currentValue: number;
    newValue: number;
    isPort?: boolean;
    alpha?: number;
    riskContributionPercentage?: number;
    addToPortfolio?: string;
}
