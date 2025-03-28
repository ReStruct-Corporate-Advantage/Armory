import {isNil, isObject} from 'lodash';
import {CompositionConstants} from '@constants/composition.constants';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';

/**
 * Holding change object for portfolio add cash
 */
export class PortfolioNavSecurityHoldingChange extends PortfolioSecurityHoldingChange {
    order: number;

    constructor(data?: any) {
        super(data);
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Serialize child portfolio name
     */
    protected doSerialize(data: any): any {
        return {
            ...super.doSerialize(data),
            ...(!isNil(this.order) ? {order: this.order} : {})
        };
    }

    public getChangeType(): string {
        return CompositionConstants.HOLDING_CHANGE_TYPES.PORTFOLIO_NAV_SECURITY;
    }

    /**
     * Deserialize child portfolio name
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);
        if (!isNil(data?.order)) {
            this.order = data.order;
        }
    }

    /**
     * Compare if two PortfolioNavSecurityHoldingChanges are equal
     * @param change
     */
    hasSameAttributes(change: any): boolean {
        if (!(change instanceof PortfolioNavSecurityHoldingChange)) {
            return false;
        }
        return change.lineItem === this.lineItem && change.portfolioName === this.portfolioName && change.isNavNeutral === this.isNavNeutral && change.addedDuringWhatIfInitialization === this.addedDuringWhatIfInitialization && change.changeInWeight === this.changeInWeight && change.order === this.order;
    }
}
