import {Serializable} from '@blk/explore-ui-core';
import {CompositionConstants} from '../../../constants';
import {isNil} from 'lodash';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';

/**
 * Abstract class for base rule
 */
export abstract class BaseRule implements Serializable {
    lineItem: string;
    newWeight: number;
    ruleUnit = 'PERCENT_NAV'; // initializing the default ruleUnit toBe NAV%
    savable = true;
    ruleType: string;
    addedDuringWhatIfInitialization: boolean;

    /**
     * Constructor
     */
    constructor(lineItem: string, newWeight: number, ruleUnit?: string, addedDuringWhatIfInitialization?: boolean) {
        this.lineItem = lineItem;
        this.newWeight = newWeight;
        this.ruleUnit = ruleUnit;
        this.addedDuringWhatIfInitialization = addedDuringWhatIfInitialization;
        this.savable = this.isSavable();
        this.ruleType = this.getRuleType();
    }

    /**
     * Serialize the rule
     */
    serialize(): any {
        return this.doSerialize({
            lineItem: this.lineItem,
            newWeight: this.newWeight,
            ruleType: this.ruleType,
            ruleUnit: this.ruleUnit,
            addedDuringWhatIfInitialization: this.addedDuringWhatIfInitialization,
            ...(!isNil((this as unknown as PortfolioRule).portfolioType) ? {portfolioType: (this as unknown as PortfolioRule).portfolioType} : {})
        });
    }

    /**
     * Deserializes the data and populates the instance with the attributes
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.lineItem = data[CompositionConstants.LINE_ITEM];
        this.newWeight = data[CompositionConstants.NEW_WEIGHT];
        this.addedDuringWhatIfInitialization = data.addedDuringWhatIfInitialization;
        if (!isNil(data[CompositionConstants.RULE_UNIT])) {
            this.ruleUnit = data[CompositionConstants.RULE_UNIT];
        }
        this.doDeserialize(data);
    }

    /**
     * Equals method to compare two rules
     */
    equals(obj: BaseRule): boolean {
        if (!obj) {
            return false;
        }

        if (this.ruleType !== obj.ruleType) {
            return false;
        }

        if (this.ruleUnit !== obj.ruleUnit) {
            return false;
        }

        return this.lineItem === obj.lineItem;
    }

    /**
     * This method will be implemented by the child class to serialize its specific attributes
     */
    protected abstract doSerialize(data: any): any;

    /**
     * This method will be implemented by the child class to deserialize its specific attributes
     */
    protected abstract doDeserialize(data: any): void;

    /**
     * This method would return a boolean indicating if this rule is savable or not
     */
    protected abstract isSavable(): boolean;

    /**
     * Returns the type of rule
     */
    protected abstract getRuleType(): string;
}
