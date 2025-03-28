import {BaseRule} from './base-rule.model';
import {CompositionConstants} from '../../../constants';

/**
 * Composition rule class for security modelling
 */
export class SecurityRule extends BaseRule {

    addToPortfolio: string;
    hasAssetValidationError: boolean;

    /**
     * Constructor
     */
    constructor(lineItem: string, newWeight: number, ruleUnit?: string, addedDuringWhatIfInitialization?: boolean, addToPortfolio?: string, hasAssetValidationError?: boolean) {
        super(lineItem, newWeight, ruleUnit, addedDuringWhatIfInitialization);
        this.addToPortfolio = addToPortfolio;
        this.hasAssetValidationError = hasAssetValidationError;
    }

    protected doSerialize(data: any): any {
        return {
            ...data,
            addToPortfolio: this.addToPortfolio,
            hasAssetValidationError: this.hasAssetValidationError
        };
    }

    protected doDeserialize(data: any): void {
        if (data.addToPortfolio) {
            this.addToPortfolio = data.addToPortfolio;
        }
        if (data.hasAssetValidationError) {
            this.hasAssetValidationError = data.hasAssetValidationError;
        }
    }

    protected isSavable(): boolean {
        return false;
    }

    /**
     * Returns the rule type for this rule
     */
    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.SECURITY;
    }
}
