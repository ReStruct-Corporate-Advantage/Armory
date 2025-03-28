import {AbstractConfig, SerializeFavoriteType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {isObject, isUndefined} from 'lodash';

/**
 * Model for CommitmentHorizonSelectedTab
 */
export class CommitmentHorizonSelectedTab extends AbstractConfig implements WidgetInput {

    // tab uid
    selectedTab: string;

    /**
     * Constructor to create an instance of CommitmentHorizonSelectedTab
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (isUndefined(data)) {
            return;
        }
        this.selectedTab = data.selectedTab;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties into a plain javascript style object to be saved in favorites
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            'selectedTab': this.selectedTab,
        };
    }

    /**
     * comparing items of CommitmentHorizonSelectedTab
     */
    equals(data: AbstractConfig): boolean {
        return data instanceof CommitmentHorizonSelectedTab ? this.selectedTab === data.selectedTab : false;
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return WidgetInputType.COMMITMENT_RISK_SELECTED_TAB;
    }

}
