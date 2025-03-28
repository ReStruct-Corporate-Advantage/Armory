import {ColumnDefinition} from './column-definition.model';

/**
 * This class represents the column definition for{@link RiskFactorViewDataRequestColumn} representing for Explore.
 * This extends the base class column definition bean and adds information to the
 * dependency of the definitions on the various report types
 */
export class PortfolioRiskColumnCategoryDefinition extends ColumnDefinition {
    matchingRiskCategories: string[];

    deserialize(col: any): void {
        super.deserialize(col);
        this.matchingRiskCategories = col.matchingRiskCategories;
    }
}
