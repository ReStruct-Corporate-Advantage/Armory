import {isObject} from 'lodash';
import {AbstractConfig} from '@blk/explore-ui-core';

/**
 * Base Class for Investment Universe Row Item
 */
export abstract class InvestmentUniverseItemBase extends AbstractConfig {
    id: string;
    enabled = true;
    type: string;
    label: string;
    isFrozen = false;

    /**
     * Constructor
     */
    protected constructor(data?: any) {
        super();
        if (isObject(data)) {
            if ((data as any).id) {
                this.id = (data as any).id;
            }
            this.deserialize(data);
        }
    }

    /**
     * Return false if the passed in investment universe item base is not equal
     */
    equals(otherInvestmentUniverseItemBase: AbstractConfig): boolean {
        if (!(otherInvestmentUniverseItemBase instanceof InvestmentUniverseItemBase)) {
            return false;
        }

        if (this.enabled !== otherInvestmentUniverseItemBase.enabled) {
            return false;
        }

        if (this.type !== otherInvestmentUniverseItemBase.type) {
            return false;
        }

        if (this.label !== otherInvestmentUniverseItemBase.label) {
            return false;
        }

        return this.isFrozen === otherInvestmentUniverseItemBase.isFrozen;
    }

    /**
     * Serialize data from InvestmentUniverseItemBase object
     */
    serialize(): any {
        return this.doSerialize({
            enabled: this.enabled,
            type: this.type,
            label: this.label,
            isFrozen: this.isFrozen
        });
    }

    /**
     * Deserialize data into InvestmentUniverseItemBase object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.enabled = data.enabled;
        this.type = data.type;
        this.label = data.label;
        this.isFrozen = data.isFrozen;

        this.doDeserialize(data);
    }

    /**
     * abstract doDeserialize
     */
    protected abstract doDeserialize(data: any): void;

    /**
     * abstract doSerialize
     */
    protected abstract doSerialize(data: any): any;
}
