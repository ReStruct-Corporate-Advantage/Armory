import {isEmpty, isObject} from 'lodash';
import {Deserialize} from '@blk/explore-ui-core';

/**
 * Model class to hold look-through settings tree sent from server
 */
export class LookthroughHolding implements Deserialize {
    cusip: string;
    secType: string;
    secDesc: string;
    lookthroughType: string;
    secGroup: string;
    fullName: string;
    displayName: string[];
    additionalInfo: string;
    lookthroughHoldings: LookthroughHolding[];

    constructor(data?: any, ignoreLookthroughHoldings?: boolean) {
        if (isObject(data)) {
            this.deserialize(data, ignoreLookthroughHoldings);
        }
    }

    /**
     * Function to transform displayName property per row in the rowData to create hierarchical tree data
     */
    transformDisplayName(parentRowItem?: any, topLevel?: string): void {
        if (topLevel) {
            this.displayName = [topLevel, ...this.displayName];
        }
        if (parentRowItem) {
            this.displayName.unshift(...parentRowItem.displayName);
        }
        if (!isEmpty(this.lookthroughHoldings)) {
            this.lookthroughHoldings.forEach((rowItem: LookthroughHolding) => rowItem.transformDisplayName(this));
        } else {
            this.displayName[this.displayName.length - 1] = this.displayName[this.displayName.length - 1].concat('-*-*-*').concat(this.cusip);
        }
    }

    /**
     * Implemented function
     */
    deserialize(data: any, ignoreLookthroughHoldings?: boolean): void {
        if (!data) {
            return;
        }

        if (data.cusip) {
            this.cusip = data.cusip;
        }
        if (data.secType) {
            this.secType = data.secType;
        }
        if (data.secDesc) {
            this.secDesc = data.secDesc;
        }
        if (data.lookthroughType) {
            this.lookthroughType = data.lookthroughType;
        }
        if (data.secGroup) {
            this.secGroup = data.secGroup;
        }
        if (data.additionalInfo) {
            this.additionalInfo = data.additionalInfo;
        }
        if (data.portfolio) {
            this.fullName = data.portfolio.fullName;
            this.displayName = [data.portfolio.displayName];
        } else {
            if (data.fullName) {
                this.fullName = data.fullName;
            }
            if (data.displayName) {
                this.displayName = data.displayName;
            }
        }
        if (!isEmpty(data.lookthroughHoldings) && !ignoreLookthroughHoldings) {
            this.lookthroughHoldings = [];
            data.lookthroughHoldings.forEach(lookthroughHolding => this.lookthroughHoldings.push(new LookthroughHolding(lookthroughHolding)));
        }
    }
}
