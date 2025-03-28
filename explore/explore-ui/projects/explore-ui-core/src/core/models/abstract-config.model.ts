import {SerializeFavoriteType} from '../../favorite/enums';
/**
 * Class used as a base class for all the configuration items in Explore.
 */
export abstract class AbstractConfig {

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
    abstract serialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractConfig) => boolean): any;

    /**
     * Deserialize the json data into this object.
     */
     deserialize(_data: any): void {
        // keeping this blank so that implementation does not need to add this if not required
     }

    /**
     * To be implemented if required to remove fields during serialization for favorite change detection
     * NOTE: must set field to undefined rather than remove because lodash.isEqual() comparison
     * considers [key: undefined] vs NO [key: value] as NOT equal
     */
    removeFieldsForFavoriteChangeDetection(serializedObject: any): void {
        // by default do not remove anything
    }
}
