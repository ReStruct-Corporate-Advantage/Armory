import {Serializable} from '@blk/explore-ui-core';
import {isNil, isObject} from 'lodash';
import {CoreRiskConstants} from '../core-risk.constants';

/**
 * This abstract class will be extended by model which is a subset of Risk Setting Properties
 */
export abstract class AbstractRiskSettings implements Serializable {
    parentRiskSettings: AbstractRiskSettings;
    name: string;

    protected constructor(parentRiskSettings?: AbstractRiskSettings, name?: string) {
        this.name = name;
        this.parentRiskSettings = parentRiskSettings;
    }

    /**
     * Method that knows how to create request params
     */
    abstract addRequestData(requestRiskSettingsData: any, defaultRiskSettings: AbstractRiskSettings, addDefaultValues?: boolean): void;

    /**
     * Deserialize values from the saved values
     */
    abstract deserialize(data: any): void;

    /**
     * Serialize the attribution settings to be saved
     */
    abstract serialize(): any;

    /**
     * Method to check if a value exists on the model at the model level(not parent)
     */
    doesValueExist(key: string): boolean {
        // We have to check the property directly. The logic for getting the value from the parent is embedded in the getter,
        // so cannot do this[key] since that will always return the value.
        return !isNil(this['_' + key]);
    }

    /**
     * based on a key(property name), gets the name of the source
     */
    getSourceName(key: string): string {
        if (this.doesValueExist(key)) {
            return this.name;
        }
        if (this.parentRiskSettings) {
            return this.parentRiskSettings.getSourceName(key);
        }
    }

    getSourceDisplayName(key: string): string {
        const srcName = this.getSourceName(key);
        return CoreRiskConstants.RISK_SETTINGS_HIERARCHY_DISPLAY_NAME[srcName] || srcName;
    }

    /**
     * Indicates whether the given property belongs to port or Org default
     */
    isDefaultSetting(key: string): boolean {
        const source: string = this.getSourceName(key);
        return source === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT ||
            source === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT;
    }

    /**
     * Method to reset the value for a given property key
     */
    resetValue(key: string): void {
        this[key] = null;
    }

    /**
     * Returns the formatted value of the parent's field
     * @param key  Field name
     */
    getFormattedParentValue(key: string): string {
        // NOT IMPLEMENTED
        return '';
    }

    /**
     * Gets all properties values wherever they are set whether in parent or self
     */
    getAllSettings(): any {
        const data: any = {};
        if (isObject(this['propertyList'])) {
            Object.keys(this['propertyList']).forEach(key => {
                const property = this['propertyList'][key];
                data[property] = this.getPropertyValue(property);
            });
        }
        return data;
    }

    /**
     * Gets value for property wherever they are set whether in parent or self
     */
    private getPropertyValue(property: string): any {
        if (this.doesValueExist(property)) {
            return this['_' + property];
        }
        return (this.parentRiskSettings as this)?.getPropertyValue(property);
    }
}
