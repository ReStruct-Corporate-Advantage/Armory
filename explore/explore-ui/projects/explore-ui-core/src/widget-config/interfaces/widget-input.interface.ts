import {isObject, isEmpty} from 'lodash';
import {SerializeFavoriteType} from '../../favorite/enums';
import {TelemetryGenericEventParameters} from '../../telemetry/generic-event';
import {CoreCommonConstants} from '../../core/constants';
import {AbstractConfig} from '../../core/models/abstract-config.model';

/**
 * This interface will be implemented by all inputs within a widget (both display inputs and data store inputs)
 * Interface implemented by all widget inputs including those in the data store
 */
export interface WidgetInput {
    /**
     * Return true if the input is a data store input rather than a display input
     */
    isDataStoreInput(): boolean;

    /**
     * Serialize the config to json.
     * @param isNested an optional parameter to indicate that the favorite is a nested one.
     *    When boolean:
     *        true = when the nested config is a favorite it will serialize a link to the favorite
     *        false = Save the full content of the favorite.
     *
     *    When number:
     *        0 = false handling above.
     *        1 = true handling above.
     *        2 = Always save the full favorite content without any links.  Will happen for anything other than 0 and 1.
     * @param shouldSaveLinkedFav - optional custom logic to be provided to override the default logic to save linked favorite
     */
    serialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractConfig) => boolean): any;

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void;

    /**
     * compares this widget input with the one passed in
     */
    equals(widgetInput: WidgetInput): boolean;

    /**
     * Get configType of widgetInput
     */
    getConfigType?(): string;

    /**
     * Defined in AbstractConfig
     */
    removeFieldsForFavoriteChangeDetection(serializedObject: any): void;

    getTrackableProperties?(): any;

    /**
     * Method to check if the WidgetInput should be skipped in the serialization
     * Mostly for the case when the input is not set or is set to default value and we don't need to pollute the favorite content
     */
    shouldSkipSerialize(): boolean;
}

/**
 * Utility method to check if the object is an instance of this.
 */
export function isWidgetInput(object: any): object is WidgetInput {
    return isObject(object) && 'isDataStoreInput' in object;
}

/**
 * generic method to add WidgetInput parameters to telemetry
 */
export function populateTelemetryGenericEventParameters(object: WidgetInput, inputKey: string, eventParameters: TelemetryGenericEventParameters, isOriginal: boolean): void {
    for (const [key, value] of Object.entries(object.getTrackableProperties())) {
        const widgetInputKey = inputKey + '_' + key;
        const original = widgetInputKey + '_' + CoreCommonConstants.ORIGINAL;
        if (isOriginal) {
            eventParameters.details.set(original, value?.toString() ?? '');
        } else {
            if (eventParameters.details.get(original) === value?.toString() || (eventParameters.details.get(original) === '' && isEmpty(value))) {
                eventParameters.details.delete(original);
            } else {
                eventParameters.details.set(widgetInputKey, value?.toString() ?? '');
            }
        }
    }
}

