import {SectorRuleInfo} from '../sector-rule-info.model';

export class CustomSectorRuleInfo extends SectorRuleInfo {
    /**
     * Get the sector type
     */
    protected getSectorType(): string {
        return 'CustomSector';
    }
}
