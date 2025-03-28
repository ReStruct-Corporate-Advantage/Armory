import {isObject} from 'lodash';
import {Deserialize} from '@blk/explore-ui-core';

/**
 * Used by the benchmark popovers to display the weight of each portfolio inside a benchmark
 */
export class IndexWeight implements Deserialize {
    portfolioPortName: string;
    portfolioFullName: string;
    portfolioCode: number;
    portfolioCusip: string;

    weight: number;

    // newWeight tracks the weight after any non nav neutral holding change is made
    newWeight: number;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserializes the config.
     */
    deserialize(data: any): void {
        this.weight = data.weight;
        this.portfolioPortName = data.portfolio.ticker;
        this.portfolioFullName = data.portfolio.fullName;
        this.portfolioCode = data.portfolio.code;
        this.portfolioCusip = data.portfolio.cusip;
        this.newWeight = data.newWeight;
    }
}
