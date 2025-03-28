import {BaseRule} from './base-rule.model';
import {isEmpty, isEqual} from 'lodash';
import {CompositionConstants} from '@constants/composition.constants';

/**
 * Composition rule at the sector level
 */
export class BreakdownTreeRule extends BaseRule {

    breakdownTree: string;
    sectorPath: string[];
    /**
     * constructor
     */
    constructor(sectorName: string, newWeight: number, breakdownTree: string, sectorPath: string[], ruleUnit?: string,) {
        super(sectorName, newWeight, ruleUnit);
        this.breakdownTree = breakdownTree;
        this.sectorPath = sectorPath;
    }

    /**
     * Equals method to compare two breakdown rules
     */
    equals(obj: BaseRule): boolean {
        if (!(obj instanceof BaseRule)) {
            return false;
        }

        if (!super.equals(obj)) {
            return false;
        }

        if (!(obj instanceof BreakdownTreeRule)) {
            return false;
        }

        return (obj.breakdownTree === this.breakdownTree) && isEqual(obj.sectorPath, this.sectorPath);
    }

    /**
     * Serialization of attributes of the breakdown rule object
     */
    protected doSerialize(data: any): any {
        return {
            ...data,
            breakdownTree: this.breakdownTree ? this.breakdownTree : '',
            sectorPath: this.sectorPath ? this.sectorPath : []
        }
    }

    /**
     * Deserialization of the attributes of the breakdown rule object
     */
    protected doDeserialize(data: any): void {
        if (isEmpty(data[CompositionConstants.BREAKDOWN_TREE_STRING])) {
            return;
        }

        // If not initialized
        if (!this.breakdownTree) {
            this.breakdownTree = '';
        }
        this.breakdownTree = data[CompositionConstants.BREAKDOWN_TREE_STRING];

        if(isEmpty(this.sectorPath)) {
            this.sectorPath = [];
        }
        this.sectorPath = data[CompositionConstants.SECTOR_PATH]
    }

    protected isSavable(): boolean {
        return true;
    }

    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.BREAKDOWN_TREE;
    }
}
