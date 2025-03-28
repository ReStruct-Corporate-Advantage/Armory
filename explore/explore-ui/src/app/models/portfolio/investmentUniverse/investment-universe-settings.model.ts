import {isEmpty} from 'lodash';
import {InvestmentUniverseConstants} from '../../../constants/investment-universe.constants';
import {InvestmentUniverseSecurity} from './investment-universe-security.model';
import {AbstractConfig} from '@blk/explore-ui-core';
import {InvestmentUniverseItemBase} from './investment-universe-item-base.model';
import {InvestmentUniversePortfolio} from './investment-universe-portfolio.model';

/**
 * Model class for representing a entire set of Investment Universe
 */
export class InvestmentUniverseSettings extends AbstractConfig {

    /**
     * List of Investment Universe Row Items
     */
    investmentUniverse: InvestmentUniverseItemBase[] = [];

    /**
     * Return data to be saved for this Investment Universe Settings
     */
    serialize(): any {
        return {
            'investmentUniverse': this.investmentUniverse
                .map(item => item.serialize())
        };
    }

    /**
     * Set attributes from the passed in data on this Investment Universe Settings
     */
    deserialize(data: any): void {
        if (!data || isEmpty(data.investmentUniverse)) {
            return;
        }

        this.investmentUniverse = data.investmentUniverse
            .map(item => {
                const universeItem = item.type === InvestmentUniverseConstants.PORTFOLIO || item.type === InvestmentUniverseConstants.BENCHMARK
                    ? new InvestmentUniversePortfolio() : new InvestmentUniverseSecurity();
                universeItem.deserialize(item);
                return universeItem;
            });
    }


    /**
     *  Return false if the passed in investmentUniverseSettings settings is not equal to this
     */
    equals(otherInvestmentUniverseSettings: AbstractConfig): boolean {
        if (!(otherInvestmentUniverseSettings instanceof InvestmentUniverseSettings)) {
            return false;
        }

        if (this.investmentUniverse.length !== otherInvestmentUniverseSettings.investmentUniverse.length) {
            return false;
        }

        for (let i = 0; i < this.investmentUniverse.length; i++) {
            if (!this.investmentUniverse[i].equals(otherInvestmentUniverseSettings.investmentUniverse[i])) {
                return false;
            }
        }

        return true;
    }
}
