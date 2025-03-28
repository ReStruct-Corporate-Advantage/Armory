import {Serializable} from '@blk/explore-ui-core';
import {isNil, isObject} from 'lodash';

/**
 * Base class for Holding change
 */
export abstract class HoldingChange implements Serializable {

    lineItem: string;  // The line item which was modified -> cusip or portfolio name
    changeInWeight: number;  // Change in weight of this line item
    newWeight: number;  // New weight of this line item
    isChildChange: boolean;
    isCashOffsetRequired: boolean;
    isOptoGeneratedChange: boolean; // Boolean to represent whether the holding change is generated via opto
    addedDuringWhatIfInitialization: boolean; // Boolean to represent whether the holding change is a part of initially added rules for adhoc port.

    protected constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Method to serialize the object into a json friendly saveable structure
     */
    serialize() {
        return this.doSerialize({
            lineItem: this.lineItem,
            changeInWeight: this.changeInWeight,
            newWeight: this.newWeight,
            isChildChange: this.isChildChange,
            isCashOffsetRequired: this.isCashOffsetRequired,
            isOptoGeneratedChange: this.isOptoGeneratedChange,
            addedDuringWhatIfInitialization: this.addedDuringWhatIfInitialization,
            changeType: this.getChangeType()
        });
    }

    /**
     * Method to deserialize the favorite data and populate the model properties
     */
    deserialize(data: any) {
        if (data.lineItem) {
            this.lineItem = data.lineItem;
        }

        if (data.newWeight != null) {
            this.newWeight = data.newWeight;
        }

        if (data.changeInWeight != null) {
            this.changeInWeight = data.changeInWeight;
        }

        if (data.addedDuringWhatIfInitialization) {
            this.addedDuringWhatIfInitialization = data.addedDuringWhatIfInitialization;
        }

        if (!isNil(data.isCashOffsetRequired)) {
            this.isCashOffsetRequired = data.isCashOffsetRequired;
        } else {
            // there will be no way to know if holding changes were generated via opto for legacy workspaces
            // setting this to true for all holding changes in legacy workspaces
            this.isCashOffsetRequired = true;
        }

        if(data.isOptoGeneratedChange) {
            this.isOptoGeneratedChange = data.isOptoGeneratedChange;
        }

        // Call the serialization of child classes
        this.doDeserialize(data);
    }

    /**
     * Checks if the object passed in and this are equal
     */
    isEqual(obj: any): boolean {
        if (!(obj instanceof HoldingChange)) {
            return false;
        }

        if (obj.isCashOffsetRequired !== this.isCashOffsetRequired) {
            return false;
        }

        if (obj.lineItem !== this.lineItem) {
            return false;
        }

        if (obj.changeInWeight !== this.changeInWeight) {
            return false;
        }

        if (obj.newWeight !== this.newWeight) {
            return false;
        }

        if (obj.isOptoGeneratedChange !== this.isOptoGeneratedChange) {
            return false;
        }

        return this.hasSameAttributes(obj);
    }

    /**
     * This method will be implemented by all the child models extending this class to check if their specific attrbutes are same for isEquals comparison
     */
    protected abstract hasSameAttributes(obj: any): boolean;

    /**
     * This method will be implemented by all the child models extending this class to serialize their specific properties
     */
    protected abstract doSerialize(data: any): any;

    /**
     * This method will be implemented by all the child models extending this class to deserialize the properties
     * from the data and set their specific properties
     */
    protected abstract doDeserialize(data: any): void;

    /**
     * Return the change type for this holding change
     */
    abstract getChangeType(): string;
}
