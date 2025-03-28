import {AbstractFavoriteConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
/**
 * Defines all the attributes of a sector.
 */
export interface Sector {
    parent: Sector;
    children: Sector[];
    sectorRuleType: string;

    /**
     * Serializes the sector configuration.
     */
    serialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractFavoriteConfig) => boolean): any;

    /**
     * Adds a child node to this sector.
     */
    addChild(child: Sector): void;

    /**
     * Checks if this sector definition is valid.
     */
    isValid(): boolean;

    /**
     * returns the title of sector
     */
    getTitle(): string;

    /**
     * return data type of sector i.e. Date, String, Numeric, Custom, Time Span and Breakdown
     */
    getDataType(): string;

}
