import {isObject} from 'lodash';
import {AbstractConfig, ConfigTypeFactory, SerializeFavoriteType} from '@blk/explore-ui-core';
import {Sector} from '../../interfaces/sector.interface';
import {Breakdown} from '../breakdown/breakdown.model';
import {CustomSector} from './custom-sector/custom-sector.model';
import {SectorUtils} from '../../utils/sector.utils';
import {SectorConstants} from '../../constants/sector.constants';

/**
 * Wrapper class for sectors that are favoritable (CustomSector & Breakdown)
 */
export class LinkedFavoriteSector extends AbstractConfig implements Sector {
    // Sector implementation
    parent: Sector;
    children: Array<Sector> = [];

    // Underlying sector model
    // As of now, that is either a Breakdown or CustomSector
    // TODO: Support for nested favorite breakdowns as sector
    sector: Breakdown | CustomSector;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type.
     */
    get configType(): string {
        return SectorConstants.ConfigType.LINKED_FAVORITE_SECTOR;
    }

    /**
     * Get the sectorRuleType
     */
    get sectorRuleType(): string {
        return 'LinkedFavoriteSector';
    }

    /**
     * Adds a child sector to this sector.
     */
    addChild(child: Sector): void {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }

    /**
     * Check if the underlying sector model is valid itself
     */
    isValid(): boolean {
        return this.sector.isValid();
    }

    /**
     * Serialize the config into json
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        // Start by serializing the underlying sector model
        const data: any = this.sector.serialize(isNested);
        // Serialize the child nodes into this node.
        SectorUtils.serializeChildren(this, data, isNested);
        return data;
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        // This is special handling of a nested favorite sector
        // We want to set the internal sector model by creating a config of that type (ex. deserialize a CustomSector into the correct model)
        this.sector = ConfigTypeFactory.createConfig(data, data.breakdownRuleType ? data.breakdownRuleType + '_sector' : data.configType, false);
        // We also want to deserialize any subSectors as part of this LinkedFavoriteSector's children
        SectorUtils.deserializeChildren(this, data);
    }

    /**
     * @inheritDoc
     */
    getTitle(): string {
        return this.sector?.getTitle();
    }

    /**
     * @inheritDoc
     */
    getDataType(): string {
        return this.sector?.getDataType();
    }
}
