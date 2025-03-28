import {HoldingChange} from '../models/portfolio/composition/holding-change.model';
import {CompositionConstants} from '../constants';

/**
 * Utility class for conversion of holding changes and other functions
 */
export class HoldingChangeFactory {

    /**
     * private map to hold holding change types
     */
    private static changeTypes: Map<string, any> = new Map<string, any>();

    /**
     * Registers a change type with the factory.
     */
    static registerChangeType(name: string, configType: any) {
        HoldingChangeFactory.changeTypes.set(name, configType);
    }

    /**
     * Converts the serialized data blob to the appropriate holding change instance
     */
    static convertObjectToHoldingChange(change: any): HoldingChange {
        // If line item or change type is not defined, then return null
        if (!change || !change[CompositionConstants.LINE_ITEM] || !change[CompositionConstants.CHANGE_TYPE_KEY]) {
            return null;
        }

        // Create an instance of the holding change object
        const holdingChangeType = HoldingChangeFactory.changeTypes.get(change.changeType);
        const holdingChange = holdingChangeType ? new holdingChangeType() : null;

        // If holding change is null then return
        if (holdingChange == null) {
            console.error('Matching holding change type not found');
            return null;
        }

        // Deserialize the values from change into holding change
        holdingChange.deserialize(change);

        return holdingChange;
    }
}
