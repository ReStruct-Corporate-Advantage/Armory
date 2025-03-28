import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isNil, isObject, isUndefined} from 'lodash';

/**
 * Grid state model
 */
export class FootnoteState extends AbstractConfig implements WidgetInput {
    static readonly CONFIG_TYPE = 'footnoteState';
    showFootnote: boolean;

    /**
     * constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return FootnoteState.CONFIG_TYPE;
    }

    getConfigType() {
        return FootnoteState.CONFIG_TYPE;
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (isUndefined(data)) {
            return;
        }

        // old explore favorite holds it as infoOpen
        this.showFootnote = data.showFootnote || data.infoOpen || false;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties into a plain javascript style object to be saved in favorites
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {showFootnote: this.showFootnote};
    }

    /**
     * equals
     */
    equals(data: any): boolean {
        return data && !isNil(data.showFootNote) && data.showFootNote === this.showFootnote;
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }
}
