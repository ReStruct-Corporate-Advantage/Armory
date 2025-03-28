import {cloneDeep, isNil} from 'lodash';
import {AppUtils} from '../../utils/app.utils';
import {
    AbstractConfig,
    ConfigTypeFactory,
    isWidgetInput, legacyWidgetInputConfigTypes,
    SerializeFavoriteType,
    WidgetInput
} from '@blk/explore-ui-core';

/**
 * Model for meta data of the widget data store
 */
export class WidgetDataStoreMetaData extends AbstractConfig {
    /**
     * inputs that are needed for request creation of a widget.. The key of the map is the input name as appears in the widgets.json and the value is the input itself
     */
    inputs: Map<string, WidgetInput> =  new Map<string, WidgetInput>();

    /**
     * Parent data stores' meta data
     */
    parentMetaData: WidgetDataStoreMetaData;

    /**
     * constructor
     */
    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize The saved Data
     */
    public deserialize(data?: any): void {
        // Old favourites don't have "inputs" collection, instead they have key/value pairs stored directly in the data.
        // E.g. "data.expandedState".
        // That's why if data.inputs key exists, we use it as inputs collection, otherwise - use data as inputs.
        const inputs = data.inputs ? data.inputs : data;
        Object.keys(inputs).forEach(key => {
            const value = inputs[key];
            if (this.isLegacyWidgetInput(key)) {
                this.deserializeLegacyWidgetInput(key, value);
            } else {
                this.deserializeWidgetInput(key, value);
            }
        });
    }

    /**
     * Deserialize widgetInput
     */
    deserializeWidgetInput = (widgetInputConfigType: string, serializedConfig: any): void => {
        const config = ConfigTypeFactory.createConfig(serializedConfig, serializedConfig?.configType || widgetInputConfigType, false);
        if (isWidgetInput(config)) {
            this.inputs.set(widgetInputConfigType, config);
        } else {
            console.warn('Unknown data store input', widgetInputConfigType, config);
        }
    }

    /**
     * Deserialize legacy widgetInput for favorite backward compatibility
     */
    private deserializeLegacyWidgetInput(widgetInputConfigType: string, serializedConfig: any): void {
        const configModel = ConfigTypeFactory.getConfigTypeFromKey(widgetInputConfigType);
        // ALL config models that handle legacy widgetInputs MUST have static deserializeLegacyWidgetInput function implemented.
        if (configModel.deserializeLegacyWidgetInput) {
            configModel.deserializeLegacyWidgetInput(serializedConfig, this.deserializeWidgetInput);
        }
    }

    /**
     * Check if widgetInputConfigType is a legacy widget input config type.
     */
    private isLegacyWidgetInput(widgetInputConfigType: string): boolean {
        return Object.values(legacyWidgetInputConfigTypes).includes(widgetInputConfigType);
    }

    /**
     * Serialize data  for saving
     */
    public serialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractConfig) => boolean): any {
        const dataToSave: any = {};
        dataToSave.inputs = {};
        this.inputs.forEach( (value: WidgetInput, key: string) => {
            if (value.shouldSkipSerialize()) {
                return;
            }
            dataToSave.inputs[key] = value.serialize(isNested, shouldSaveLinkedFav);
        });
        return dataToSave;
    }

    /**
     * Copy Metadata
     */
    public copy(metaData: WidgetDataStoreMetaData): void {
        this.inputs = cloneDeep(metaData.inputs);
        if (metaData.parentMetaData) {
            this.parentMetaData = new WidgetDataStoreMetaData();
            this.parentMetaData.copy(metaData.parentMetaData);
        }
    }

    /**
     * Compares two dataStores for equality
     */
    equals(metaData: WidgetDataStoreMetaData) {
        if ((this.parentMetaData && !metaData.parentMetaData ) || (!this.parentMetaData && metaData.parentMetaData)) {
            return false;
        }
        let isParentMetaDataEqual = true;
        if (this.parentMetaData && metaData.parentMetaData) {
            isParentMetaDataEqual = this.parentMetaData.equals((metaData.parentMetaData));
        }

        if (!isParentMetaDataEqual) {
            return false;
        }
        // Compare inputs
        if (this.inputs.size !== metaData.inputs.size) {
            return false;
        }
        let areAllInputsEqual = true;
        this.inputs.forEach((value: WidgetInput, key: string) => {
            if (!value.equals(metaData.inputs.get(key))) {
                areAllInputsEqual = false;
            }
        });
        return areAllInputsEqual;
    }

    /**
     * checks if parent meta data is empty or not
     */
    dependentOnParentForMetaData(): boolean {
        return !isNil(this.parentMetaData);
    }
}
