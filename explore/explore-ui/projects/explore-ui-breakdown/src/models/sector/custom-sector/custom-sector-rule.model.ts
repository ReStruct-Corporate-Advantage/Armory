import {CustomSector} from './custom-sector.model';
import {isObject, isUndefined} from 'lodash';
import {AbstractConfig, ConfigTypeFactory, SerializeFavoriteType} from '@blk/explore-ui-core';
import {Rule} from '../../../interfaces/rule.interface';
import {SectorConstants} from '../../../constants/sector.constants';

/**
 * Class for the custom sector rule.
 */
export class CustomSectorRule extends AbstractConfig implements Rule {
    private setDataType: any;
    equal = true;
    customSector: CustomSector;

    /**
     * Constructor.
     */
    constructor(data?: any, instvar?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
        this.setDataType = instvar;
    }

    /**
     * Gets the config type for custom sector rule group.
     */
    get configType(): string {
        return SectorConstants.ConfigType.CUSTOM_SECTOR_RULE;
    }

    /**
     * Gets the name of the rule type for this rule.
     */
    get ruleType(): string {
        return 'CustomSector';
    }


    /**
     * Toggles between true/false for this rule.
     */
    toggleEquals(): void {
        this.equal = this.equal === false;
    }

    /**
     * Gets a user friendly display of the rule.
     */
    getDisplayText(): string {
        let text: string = 'Sector ' + (this.equal ? 'Equals ' : 'Does Not Equal ');
        text += this.customSector.title;
        return text;
    }

    /**
     * Serialize the config to json.
     * isNested an optional parameter to indicate that the favorite is a nested one.
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            ruleType: this.ruleType,
            equals: this.equal
        };

        // Add the custom sector if it is there.
        if (this.customSector) {
            data.customSector = this.customSector.serialize(isNested);
        }

        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        this.equal = data.equals;

        if (data.customSector) {
            this.customSector = ConfigTypeFactory.createConfig(data.customSector, SectorConstants.ConfigType.CUSTOM_SECTOR, false);
        }
    }

    /**
     * Checks if this rule definition is valid.
     */
    isValid(): boolean {
        // For a custom sector rule it needs to have the equals set and the custom sector needs to be valid.
        return !isUndefined(this.equal) && !isUndefined(this.customSector) && this.customSector.isValid();
    }

    /**
     * return equal if both objects are equal otherwise return false
     * @param ruleInput
     */
    equals(ruleInput: Rule): boolean {
        if (!(ruleInput instanceof CustomSectorRule)) {
            return false;
        }
        if (this.equal !== ruleInput.equal) {
            return false;
        }

        return this.customSector.equals(ruleInput.customSector);
    }
}
