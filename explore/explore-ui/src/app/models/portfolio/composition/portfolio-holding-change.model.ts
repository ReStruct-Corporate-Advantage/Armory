import {HoldingChange} from './holding-change.model';
import {CompositionConstants} from '../../../constants';
import {isEmpty, isNumber, isObject, isNil} from 'lodash';

/**
 * Holding change model for Portfolio level composition changes
 */
export class PortfolioHoldingChange extends HoldingChange {
    childPortfolioName: string;  // Portfolio name at which the modelling was done
    childPortfolioFullName?: string;
    id?: number;
    title?: string;

    replacementCount?: number;

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
     * Return the change type for this holding change
     */
    public getChangeType(): string {
        return CompositionConstants.HOLDING_CHANGE_TYPES.PORTFOLIO;
    }

    /**
     * Serialize child portfolio name
     */
    protected doSerialize(data: any): any {
        return {
            ...data,
            ...(isNumber(this.id) ? {favId: this.id} : {}),
            ...(!isEmpty(this.title) ? {title: this.title} : {}),
            childPortfolioName: this.childPortfolioName,
            portfolioFullName: this.childPortfolioFullName,
            replacementCount: this.replacementCount
        };
    }

    /**
     * Deserialize child portfolio name
     */
    protected doDeserialize(data: any): void {
        if (data.childPortfolioName) {
            this.childPortfolioName = data.childPortfolioName;
        }
        if (data.portfolioFullName) {
            this.childPortfolioFullName = data.portfolioFullName;
        }
        if (isNumber(data.favId)) {
            this.id = data.favId;
        }
        if (!isEmpty(data.title)) {
            this.title = data.title;
        }
        if (!isNil(data.replacementCount)) {
            this.replacementCount = data.replacementCount;
        }
    }

    /**
     * Check if the passed object for attributes same as this one
     */
    protected hasSameAttributes(obj: any): boolean {
        if (!(obj instanceof PortfolioHoldingChange)) {
            return false;
        }

        return (obj.childPortfolioName === this.childPortfolioName) && (obj.replacementCount === this.replacementCount);
    }


    /**
     * append favorite id to the name
     * @param name - lineItem or childPortfolioName
     */
    getWithFavTitle(name: string): string {
        return !isEmpty(name) && !isEmpty(this.title)
            ? name.concat(CompositionConstants.FAV_ID_DELIMITER).concat(CompositionConstants.OPENING_SMALL_BRACKET + this.title + CompositionConstants.CLOSING_SMALL_BRACKET)
            : name;
    }
}
