import {PortfolioSecurityHoldingChange} from './portfolio-security-holding-change.model';
import {CompositionConstants} from '../../../constants';
import {isObject} from 'lodash';

/**
 * Holding change model for new securities added to the portfolio
 */
export class NewSecurityHoldingChange extends PortfolioSecurityHoldingChange {

    analyticsId: string;  // GPX Analytics ID for the new security
    isValid: boolean;  // If this holding change is valid or not.

    constructor(data?: any) {
        super(data);
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return the change type for this holding change
     */
    getChangeType(): string {
        return CompositionConstants.HOLDING_CHANGE_TYPES.NEW_SECURITY;
    }

    /**
     * Serialization of analytics ID
     */
    protected doSerialize(data: any): any {
        return {
            ...super.doSerialize(data),
            analyticsId: this.analyticsId
        };
    }

    /**
     * Deserialization of analytics ID
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);

        if (data.analyticsId && data.analyticsId !== 0) {
            this.analyticsId = data.analyticsId;
            this.isValid = true;
        } else {
            this.isValid = false;
        }
    }

    /**
     * Check if the passed object for attributes same as this one
     */
    protected hasSameAttributes(obj: any): boolean {
        if (!(obj instanceof NewSecurityHoldingChange)) {
            return false;
        }

        return (obj.analyticsId === this.analyticsId);
    }
}
