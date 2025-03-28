import {IndexWeight} from './index-weight.model';

/**
 * Contains the information placed inside the popovers of the benchmark selector and the portfolio header
 */
export class PortfolioTooltipInfo {

    portName: string;
    fullName: string;
    currency: string;
    type: string;
    indexWeights: Array<IndexWeight>;

    constructor() {}
}
