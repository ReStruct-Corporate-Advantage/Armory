import {SectorRuleInfo} from '../models/sector/sector-rule-info.model';
import {SectorConstants} from '../constants/sector.constants';
import {isNil} from 'lodash';
/**
 * Utility methods and other helper methods related to rules will be in this service
 */
export class SectorRuleInfoFactory {

    /**
     * private map to hold rule types
     */
    private static sectorRuleInfoTypes: Map<string, any> = new Map<string, any>();

    /**
     * Registers a rule type with the factory.
     */
    static registerSectorRuleInfoType(name: string, configType: any) {
        SectorRuleInfoFactory.sectorRuleInfoTypes.set(name, configType);
    }

    /**
     * Create a rule object based on the rule data
     */
    static createSectorRuleInfoBasedOnType(ruleInfoData: any): SectorRuleInfo {
        const ruleType = SectorRuleInfoFactory.sectorRuleInfoTypes.get(ruleInfoData[SectorConstants.SECTOR_RULES_INFO.SECTOR_TYPE]);
        if (isNil(ruleType)) {
            console.error('Matching sector rule info type not found');
            return null;
        }

        const ruleInfo: SectorRuleInfo = new ruleType();
        ruleInfo.deserialize(ruleInfoData);
        return ruleInfo;
    }
}
