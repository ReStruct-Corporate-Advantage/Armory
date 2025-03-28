import {PortfolioHoldingChange} from './portfolio-holding-change.model';
import {CompositionConstants} from '../../../constants';
import {isObject} from 'lodash';

/**
 * Holding change object for new portfolios added to the portfolio
 */
export class NewPortfolioHoldingChange extends PortfolioHoldingChange {

    /**
     * Default constructor
     */
    constructor(data?: any) {
        super(data);
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Get the change type for this holding change
     */
    public getChangeType(): string {
        return CompositionConstants.HOLDING_CHANGE_TYPES.NEW_PORTFOLIO;
    }

    /**
     * Check if the passed object for attributes are the same as this one
     */
    protected hasSameAttributes(obj: any): boolean {
        return (obj instanceof NewPortfolioHoldingChange);
    }
}
