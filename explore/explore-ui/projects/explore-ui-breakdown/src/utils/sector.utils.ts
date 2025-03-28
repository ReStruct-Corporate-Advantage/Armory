import {AbstractFavoriteConfig, ConfigTypeFactory} from '@blk/explore-ui-core';
import {Sector} from '../interfaces/sector.interface';
import {SectorConstants} from '../constants/sector.constants';
import {isEmpty, isEqual, isNil, omit} from 'lodash';
import {FundSectoringRecordKey} from '../interfaces/fund-sectoring-record-key.interface';
import {CustomSector} from '../models/sector/custom-sector/custom-sector.model';

export class SectorUtils {
    /**
     * Utility function to serialize the child sectors.
     */
    static serializeChildren(sector: Sector, data: any, isNested: boolean | number, shouldSaveLinkedFav?: (config: AbstractFavoriteConfig) => boolean): void {

        if (sector.children && sector.children.length > 0) {
            data.subSectors = [];
            sector.children.forEach((child: Sector) => {
                data.subSectors.push(child.serialize(isNested, shouldSaveLinkedFav));
            });
        }
    }

    /**
     * get fund sectoring record key using node name
     */
    static getRecordKeyFromMap(assignedRecordsMapping: Map<FundSectoringRecordKey, CustomSector[]>, nodeName: string): FundSectoringRecordKey {
        const allRecords: FundSectoringRecordKey [] = Array.from(assignedRecordsMapping.keys());
        return allRecords.find((recordKey: FundSectoringRecordKey) => {
            return recordKey.nodeName === nodeName;
        });
    }

    /**
     * Compare Two sector objects excluding parent property starting top to down sector tree
     */
    static isEqual(sector1: Sector, sector2: Sector): boolean {
        if (sector1 === sector2) {
            return true;
        }
        if (isNil(sector1) || isNil(sector2)) {
            return isNil(sector1) && isNil(sector2);
        }
        if (!isEqual(omit(sector1, 'children', 'parent'), omit(sector2, 'children', 'parent'))) {
            return false;
        }
        if (sector1.children === sector2.children) {
            return true;
        }
        if (isEmpty(sector1.children) || isEmpty(sector2.children)) {
            return isEmpty(sector1.children) && isEmpty(sector2.children);
        }
        if (sector1.children.length !== sector2.children.length) {
            return false;
        }
        for (let i = 0; i < sector1.children.length; i++) {
            if (!SectorUtils.isEqual(sector1.children[i], sector2.children[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Utility function to deserialize the child sectors.
     */
    static deserializeChildren(sector: Sector, data: any): void {

        // Recreate the subSectors to ensure they are refreshed.
        sector.children = [];

        // Only bother if there is any subsectors.
        if (!data || !data.subSectors) {
            return;
        }

        // Deserialise all the child sectors.
        data.subSectors.forEach((childData: any) => {
            // All child sectors should have a type, so grab that out so we can pass it to the deserialize method.
            // If there is no sector type then just skip it as we don't know what it is.
            let sectorType: string = childData.breakdownRuleType;
            if (childData.breakdownRuleType) {
                // TODO:  Not sure if I need to add the _sector to it, but not sure I want something called string.
                //        Think about breakdowns with this since it has a type already.
                sectorType = sectorType + '_sector';
            } else if (childData.configType) {
                sectorType = childData.configType;
            } else {
                // Skip any others.
                return;
            }
            if (SectorUtils.isConfigTypeForLinkedFavoriteSector(sectorType)) {
                // If the sector is a nested favorite, create the wrapper LinkedFavoriteSector as the child
                const linkedFavoriteSector: Sector = ConfigTypeFactory.createConfig(childData, SectorConstants.ConfigType.LINKED_FAVORITE_SECTOR, true);

                sector.children.push(linkedFavoriteSector);
            } else {
                // Deserialize the sector.
                const childSector: Sector = ConfigTypeFactory.createConfig(childData, sectorType, false);
                sector.children.push(childSector);
            }
        });
    }

    /**
     * Check if a given sector type is used for a LinkedFavoriteSector
     */
    static isConfigTypeForLinkedFavoriteSector(sectorType: string): boolean {
        return (ConfigTypeFactory.haveSameConfigType(SectorConstants.ConfigType.CUSTOM_SECTOR, sectorType)) || (ConfigTypeFactory.haveSameConfigType(SectorConstants.ConfigType.BREAKDOWN, sectorType));
    }
}
