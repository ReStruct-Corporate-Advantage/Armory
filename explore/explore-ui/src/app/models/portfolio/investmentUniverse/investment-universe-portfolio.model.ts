import {InvestmentUniverseItemBase} from './investment-universe-item-base.model';
import {AbstractConfig} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';
import {CustomFilter} from '@blk/explore-ui-breakdown';

/**
 * Investment Universe Portfolio Class for the portfolio row item.
 */
export class InvestmentUniversePortfolio extends InvestmentUniverseItemBase {
    portfolio: string;
    isBench = false;
    filter: CustomFilter;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super(data);
        if (!this.filter) {
            this.filter = new CustomFilter();
        }
    }

    /**
     * Return false if the passed in investment universe portfolio is not equal
     */
    equals(otherInvestmentUniversePortfolio: AbstractConfig): boolean {
        if (!(otherInvestmentUniversePortfolio instanceof InvestmentUniversePortfolio)) {
            return false;
        }

        if (!super.equals(otherInvestmentUniversePortfolio)) {
            return false;
        }

        if (!this.filter) {
            if (otherInvestmentUniversePortfolio.filter) {
                return false;
            }
        } else if (!this.filter.equals(otherInvestmentUniversePortfolio.filter)) {
            return false;
        }

        return (this.isBench === otherInvestmentUniversePortfolio.isBench && this.portfolio === otherInvestmentUniversePortfolio.portfolio);
    }

    /**
     * Serialize the content from InvestmentUniversePortfolio object
     */
    protected doSerialize(data: any): any {
        return {
            ...data,
            portfolio: this.portfolio,
            isBench: this.isBench,
            ...(!this.isFilterEmpty() ? {filter: this.filter.serialize()} : {})
        };
    }

    /**
     * Deserialize data into InvestmentUniversePortfolio object
     */
    protected doDeserialize(data: any): void {
        if (!data) {
            return;
        }

        this.portfolio = data.portfolio;
        this.isBench = data.isBench;
        if (data.filter && !isEmpty(Object.keys(data.filter))) {
            if (!this.filter) {
                this.filter = new CustomFilter();
            }
            this.filter.deserialize(data.filter);
        }
    }

    /**
     * check if filter is empty
     */
    isFilterEmpty(): boolean {
        return !this.filter || this.filter.isFilterEmpty();
    }
}
