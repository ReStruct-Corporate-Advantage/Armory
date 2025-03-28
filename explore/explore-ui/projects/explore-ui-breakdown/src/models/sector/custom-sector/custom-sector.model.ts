import {Sector} from '../../../interfaces/sector.interface';
import {Rule} from '../../../interfaces/rule.interface';
import {isObject, isUndefined} from 'lodash';
import {SectorUtils} from '../../../utils/sector.utils';
import {CustomSectorRule} from './custom-sector-rule.model';
import {Breakdown} from '../../breakdown/breakdown.model';
import {LinkedFavoriteSector} from '../linked-favorite-sector.model';
import {SectorConstants} from '../../../constants/sector.constants';
import {
    AbstractFavoriteConfig,
    ConfigTypeFactory,
    FavoriteDisplayEnum,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {CustomFilter} from '../../filter/custom-filter.model';

/**
 * Class for the custom sector settings.
 */
export class CustomSector extends AbstractFavoriteConfig implements Sector {
// Sector implementation
    parent: Sector;
    children: Array<Sector> = [];

    includeOtherBucket = true;
    rule: Rule;

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
        return SectorConstants.ConfigType.CUSTOM_SECTOR;
    }

    /**
     * Get the sectorRuleType
     */
    get sectorRuleType(): string {
        return 'CustomSector';
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
     * Checks if this sector definition is valid.
     */
    isValid(): boolean {
        // For a custom sector to be valid it the rule assigned needs to be valid.
        return !isUndefined(this.rule) && this.rule.isValid();
    }

    /**
     * @inheritDoc
     */
    getTitle(): string {
        return this.title;
    }

    /**
     * @inheritDoc
     */
    getDataType(): string {
        return SectorConstants.SECTOR_DATA_TYPE.CUSTOM;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    protected doSerialize(isNested: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractFavoriteConfig) => boolean): any {
        const data: any = {
            breakdownRuleType: this.sectorRuleType,
            includeOtherBucket: this.includeOtherBucket
        };

        // Only serialise the rule if it is there.
        if (this.rule) {
            data.rule = this.rule.serialize(isNested, shouldSaveLinkedFav);
        }

        // if this is a custom sector then we don't want to save the children, because we don't want subsectors.
        if (data.breakdownRuleType === SectorConstants.ConfigType.CUSTOM_SECTOR) {
            this.children = [];
        }
        // Serialise the child nodes into the breakdown property.
        SectorUtils.serializeChildren(this, data, isNested, shouldSaveLinkedFav);

        return data;
    }

    /**
     * This function is used to deserialize the implementation favorite.
     */
    protected doDeserialize(data: any): void {

        // This is to handle old formats where data is stored inside data.data
        if (data.data) {
            data = data.data;
        }

        if (data.breakdown) {
            const breakdown: Breakdown = new Breakdown(data);
            if (breakdown && breakdown.children && breakdown.children[0] instanceof LinkedFavoriteSector) {
                const customSector: CustomSector = (breakdown.children[0] as LinkedFavoriteSector).sector as CustomSector;
                this.rule = customSector.rule;
            }
        } else if (data.rule) {
            if (data.rule && data.rule.favId) {
                // If there is a favId then this is returned as a custom sector object, so strip the rule out of it.
                const customSector: CustomSector = ConfigTypeFactory.createConfig(data.rule, SectorConstants.ConfigType.CUSTOM_SECTOR, false);
                const customSectorRule: CustomSectorRule = new CustomSectorRule();
                customSectorRule.equal = true;
                customSectorRule.customSector = customSector;
                this.rule = customSectorRule;
                if (!this.title) {
                    // Take the title of the favorited customSector
                    this.title = customSector.title;
                }
            } else if (data.rule.ruleType) {
                // Create the rule from the config type that it is.
                this.rule = ConfigTypeFactory.createConfig(data.rule, 'CustomSector' + data.rule.ruleType, false);
            }
        }

        // If we got here and the title is not set then we need to name sure there is something.
        // Was causing an issue loading an blank custom sector from Prism.
        if (!this.title) {
            this.title = ' ';
        }

        if (data.includeOtherBucket) {
            this.includeOtherBucket = data.includeOtherBucket;
        }

        // Deserialize the child sectors into this instance.
        SectorUtils.deserializeChildren(this, data);
    }

    /**
     * Function to copy the contents of another config object into this one.
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof CustomSector)) {
            return;
        }

        const sourceConfig: CustomSector = source;
        this.rule = sourceConfig.rule;
        this.children = sourceConfig.children;
        this.includeOtherBucket = sourceConfig.includeOtherBucket;
        this.lastUpdatedBy = sourceConfig.lastUpdatedBy;
        this.dateLastUpdated = sourceConfig.dateLastUpdated;
    }

    /**
     * Compare two object equality
     * @param ruleInput
     */
    equals(ruleInput: Sector): boolean {
        if (!(ruleInput instanceof CustomSector)) {
            return false;
        }

        return SectorUtils.isEqual(this, ruleInput);
    }

    /**
     * Gets the favorite type for this config.
     */
    protected getConfigType(): string {
        return 'CUSTOM_SECTOR';
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        // CustomFilter are actually just a wrapper around custom sector so we need a way to differentiate breakdown custom sectors from filters
        if (parent instanceof CustomFilter) {
            return FavoriteDisplayEnum.FILTER;
        }
        return FavoriteDisplayEnum.CUSTOM_SECTOR;
    }
}
