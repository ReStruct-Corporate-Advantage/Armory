import {isEqual} from 'lodash';
import {AbstractConfig} from '@blk/explore-ui-core';
import {InvestmentUniverseItemBase} from './investment-universe-item-base.model';

/**
 * Investment Universe Security Class for the security search or upload row item.
 */
export class InvestmentUniverseSecurity extends InvestmentUniverseItemBase {
    securities: string[];

    /**
     * Constructor
     */
    constructor(data?: any) {
        super(data);
    }

    /**
     * Return false if the passed in investment universe security is not equal
     */
    equals(otherInvestmentUniverseSecurity: AbstractConfig): boolean {
        if (!(otherInvestmentUniverseSecurity instanceof InvestmentUniverseSecurity)) {
            return false;
        }

        if (!super.equals(otherInvestmentUniverseSecurity)) {
            return false;
        }

        return (isEqual(this.securities, otherInvestmentUniverseSecurity.securities));
    }

    /**
     * Deserialize the content into InvestmentUniverseSecurity object
     */
    protected doDeserialize(data: any): void {
        this.securities = data.securities;
    }

    /**
     * Serialize the content from InvestmentUniverseSecurity object
     */
    protected doSerialize(data: any): any {
        return {
            ...data,
            securities: this.securities
        };
    }
}
