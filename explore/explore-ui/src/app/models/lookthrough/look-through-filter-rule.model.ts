import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isObject, isUndefined} from 'lodash';
import {CustomSector, ColumnSectorRule} from '@blk/explore-ui-breakdown';
import {LookthroughConstants} from '@blk/explore-ui-look-through-settings';

/**
 * Class for containing Look-through rule
 */
export class LookthroughFilterRule extends AbstractConfig {

    /**
     * To set whether the rule is disabled OR enabled
     */
    enabled = true;
    /**
     * Display name for the filter
     */
    displayName = 'New Look-through Rule';
    /**
     * Look-through filter / custom Sector
     */
    customSector: CustomSector;
    /**
     * Look-through type
     */
    ltType = LookthroughConstants.LT_TYPE_FULL;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        this.initializeDefaults();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Method to initialize the default value of customSector
     */
    private initializeDefaults(): void {
        this.customSector = new CustomSector();
        this.customSector.rule = new ColumnSectorRule();
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return LookthroughConstants.LT_FILTER_RULE;
    }

    /**
     * Method to copy the contents of another config object into this one.
     */
    copyFrom(sourceConfig: AbstractConfig): void {
        if (!(sourceConfig instanceof  LookthroughFilterRule)) {
            return;
        }
        this.ltType = sourceConfig.ltType;
        this.customSector = sourceConfig.customSector;
        this.enabled = sourceConfig.enabled;
        this.displayName = sourceConfig.displayName;
    }

    /**
     * Deserialize the data content into LookthroughFilterRule object
     */
    deserialize(data: any): void {
        if (data.enabled) {
            this.enabled = data.enabled;
        }
        if (data.displayName) {
            this.displayName = data.displayName;
        }
        // for old favorites customSector is stored inside data.filter.customSector and
        // for new it will be inside data.customSector else it will be a boolean
        if (data.filter || data.customSector) {
            this.customSector = isUndefined(data.filter) ? new CustomSector(data.customSector) : new CustomSector(data.filter);
        }
        if (data.ltType) {
            this.ltType = data.ltType;
        }
    }

    /**
     * Serialize the LookthroughFilterRule object
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data = {};
        if (this.enabled) {
            data['enabled'] = this.enabled;
        }
        if (this.displayName) {
            data['displayName'] = this.displayName;
        }
        if (this.ltType) {
            data['ltType'] = this.ltType;
        }
        if (this.customSector) {
            data['customSector'] = this.customSector.serialize(isNested);
        }
        return data;
    }

    /**
     * Serialize the data in a form that can be sent as part of data request
     */
    serializeForDataRequest(): any {
        const serializedRule: any = {'ltType': this.ltType};
        if (this.customSector && this.customSector.isValid()) {
            serializedRule['ltContainerRule'] = JSON.stringify(this.transformToBreakdwonTree());
        }
        return serializedRule;
    }

    /**
     * convert To BreakdwonTree format as currently backend expect breakdown tree object.
     */
    private transformToBreakdwonTree(): any {
        const data: any = {
            breakdown: {
                subSectors: []
            }
        };
        data.breakdown.subSectors.push(this.customSector.serialize());
        return data;
    }

    /**
     * Checks if the filter is empty.
     */
    isEmpty(): boolean {
        // If there is no custom sector or rule then it is empty.
        if (!this.customSector || !this.customSector.rule) {
            return true;
        }

        // If the rule is a column rule then we want to make sure that a column is specified.
        if (this.customSector.rule instanceof ColumnSectorRule) {
            const columnRule: ColumnSectorRule = this.customSector.rule;
            return isUndefined(columnRule.columnTag) || columnRule.columnTag === '';
        }

        // All other scenarios it is not empty.
        return false;
    }

    /**
     * checks if the rule is customized
     */
    isCustomizedRule(): boolean {
        return !(this.isEmpty() && this.ltType === LookthroughConstants.LT_TYPE_FULL) && this.enabled;
    }
}
