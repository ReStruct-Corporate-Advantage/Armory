import {ConfigTypeFactory, Serializable, SerializeFavoriteType} from '@blk/explore-ui-core';
import {SectorConstants} from '../../constants/sector.constants';

/**
 * Model to hold the sector rule info for a breakdown
 */
export class SectorRuleInfo implements Serializable {
    protected subSector: any;

    protected sectorValue: any;

    protected sectorType: string;

    constructor(subSector?: any, sectorValue?: any) {
        this.subSector = subSector;
        this.sectorValue = sectorValue;
        this.sectorType = this.getSectorType();
    }

    /**
     * Get the sector type
     */
    protected getSectorType(): string {
        return SectorConstants.SECTOR_RULES_INFO.NORMAL_SECTOR;
    }

    /**
     * Serialization of sector rule info
     */
    serialize(): any {
        const serializedData: any = {};
        serializedData[SectorConstants.SECTOR_RULES_INFO.SUB_SECTOR] = this.subSector.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE);
        serializedData[SectorConstants.SECTOR_RULES_INFO.SECTOR_VALUE] = this.sectorValue;
        serializedData[SectorConstants.SECTOR_RULES_INFO.SECTOR_TYPE] = this.sectorType;

        return serializedData;
    }

    /**
     * Deserialization of sector rule info
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        // Decode the subsector into the correct config object.
        const subSector: any = data[SectorConstants.SECTOR_RULES_INFO.SUB_SECTOR];
        if (subSector && subSector.breakdownRuleType) {
            // TODO:  Need to figure out how to get a favoriteService injected or passed down here.
            this.subSector = ConfigTypeFactory.createConfig(subSector, subSector.breakdownRuleType + '_sector', false);
        }

        this.sectorValue = data[SectorConstants.SECTOR_RULES_INFO.SECTOR_VALUE];
        this.sectorType = data[SectorConstants.SECTOR_RULES_INFO.SECTOR_TYPE];
    }
}
