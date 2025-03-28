import {AbstractFavoriteConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
/**
 * Defines all the attributes of a rule.
 */
export interface Rule {
    /**
     * The type of the rule.
     */
    ruleType: string;

    /**
     * Serializes the rule config.
     */
    serialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractFavoriteConfig) => boolean): any;

    /**
     * Checks if this sector definition is valid.
     */
    isValid(): boolean;

    /**
     * Check if rule is equal
     */
    equals(ruleInput: Rule): boolean;
}
