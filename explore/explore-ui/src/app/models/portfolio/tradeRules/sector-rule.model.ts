import {BaseRule} from './base-rule.model';
import {SectorRuleInfo, SectorRuleInfoFactory} from '@blk/explore-ui-breakdown';
import {CompositionConstants} from '../../../constants';
import {isEmpty, isEqual, isNull} from 'lodash';

/**
 * Composition rule at the sector level
 */
export class SectorRule extends BaseRule {
    sectorRulesInfo: SectorRuleInfo[];

    /**
     * constructor
     */
    constructor(sectorName: string, newWeight: number, sectorRulesInfo: SectorRuleInfo[], ruleUnit?: string) {
        super(sectorName, newWeight, ruleUnit);
        this.sectorRulesInfo = sectorRulesInfo;
    }

    /**
     * Equals method to compare two sector rules
     */
    equals(obj: BaseRule): boolean {
        if (!(obj instanceof BaseRule)) {
            return false;
        }

        if (!super.equals(obj)) {
            return false;
        }

        if (!(obj instanceof SectorRule)) {
            return false;
        }

        return isEqual(this.sectorRulesInfo, obj.sectorRulesInfo);
    }

    /**
     * Serialization of attributes of the sector rule object
     */
    protected doSerialize(data: any): any {
        return {
            ...data,
            sectorRulesInfo: this.sectorRulesInfo ? this.sectorRulesInfo.map(ruleInfo => ruleInfo.serialize()) : undefined
        };
    }

    /**
     * Deserialization of the attributes of the sector rule object
     */
    protected doDeserialize(data: any): void {
        if (isEmpty(data[CompositionConstants.SECTOR_RULES_INFO_STRING])) {
            return;
        }

        // If not initialized
        if (!this.sectorRulesInfo) {
            this.sectorRulesInfo = [];
        }

        data[CompositionConstants.SECTOR_RULES_INFO_STRING].forEach(ruleInfoData => {
            const ruleInfo: SectorRuleInfo = SectorRuleInfoFactory.createSectorRuleInfoBasedOnType(ruleInfoData);
            if (!isNull(ruleInfo)) {
                this.sectorRulesInfo.push(ruleInfo);
            }
        });
    }

    protected isSavable(): boolean {
        return true;
    }

    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.SECTOR;
    }
}
