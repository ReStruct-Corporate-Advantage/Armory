import {isEmpty, isEqual, isNil, isUndefined} from 'lodash';
import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {LiquidityConstants} from '../liquidity.constants';
import {CoreDefinitionStore, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Advanced liquidity settings
 */
export class AdvancedLiquiditySettings extends AbstractLiquiditySettings {

    modelSelectionMapping: Map<string, string>;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>): void {
        super.initialize(defaultSettings);
        this.modelSelectionMapping = new Map<string, string>();
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const assetClassModelMapping = {};
        this.modelSelectionMapping.forEach(function(value, key) {
            if (value !== LiquidityConstants.DEFAULT_MODEL_SELECTION) {
                assetClassModelMapping[key] = value;
            }
        });
        return {
            modelSelectionMapping: assetClassModelMapping
        };
    }

    /**
     * Deserialize the data into this object
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        const descriptionToPurposeMap: Map<string, string> = new Map<string, string>();
        CoreDefinitionStore.assetClassModelMapping.forEach( modelMapping => {
            let modelMappingArray: string[] = [];
            modelMappingArray = modelMapping.text.split(':');
            if (modelMappingArray.length === 2) {
                descriptionToPurposeMap.set(modelMappingArray[0], modelMappingArray[1]);
            }
        });
        if (data.modelSelectionMapping) {
            this.modelSelectionMapping = new Map<string, string>();
            for (const key of Object.keys(data.modelSelectionMapping)) {
                // For backward compatibility when the value of modelSelectionMapping used to be modelDescription
                // We check if we have a value in the descriptionToPurposeMap corresponding to the value of modelSelectionMapping to handle the old favorites, when the value of modelSelectionMapping was modelDescription
                // If we don't have a value in the descriptionToPurposeMap corresponding to the value of modelSelectionMapping it means that modelSelectionMapping has modelPurpose as value
                if (!isUndefined(descriptionToPurposeMap.get(data.modelSelectionMapping[key]))) {
                    this.modelSelectionMapping.set(key, descriptionToPurposeMap.get(data.modelSelectionMapping[key]));
                } else {
                    const purposeValues = [...descriptionToPurposeMap.values()];
                    if (purposeValues.includes(data.modelSelectionMapping[key])) {
                        this.modelSelectionMapping.set(key, data.modelSelectionMapping[key]);
                    } else {
                        this.modelSelectionMapping.set(key, LiquidityConstants.DEFAULT_MODEL_SELECTION);
                    }
                }
            }
        }
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof AdvancedLiquiditySettings)) {
            return false;
        }

        return (isEqual(this.modelSelectionMapping, option.modelSelectionMapping));
    }

    /**
     * Get params that are to be sent as a part of the request param
     */
    addRequestParams(requestParam: any): void {
        if (!isEmpty(this.modelSelectionMapping)) {
            requestParam.modelSelectionMapping = {};
            this.modelSelectionMapping.forEach(function(value, key) {
                // No need to send the default string to liquidity server
                if (value !== LiquidityConstants.DEFAULT_MODEL_SELECTION) {
                    requestParam.modelSelectionMapping[key] = value;
                }
            });
        }
    }
}


