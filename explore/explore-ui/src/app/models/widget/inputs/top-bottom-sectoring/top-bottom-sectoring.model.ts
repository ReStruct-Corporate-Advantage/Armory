import {
    AbstractConfig,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';

/**
 * data model for holding top-down sectoring info
 */
export class TopBottomSectoring extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    isTopBottomSectoring = false;
    displayAtGroupNode = false;

    constructor(data?: any) {
        super();
        if (!!data) {
            this.deserialize(data);
        }
    }

    equals(widgetInput: WidgetInput): boolean {
        return widgetInput instanceof TopBottomSectoring
            && this.isTopBottomSectoring === widgetInput.isTopBottomSectoring
            && this.displayAtGroupNode === widgetInput.displayAtGroupNode;
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.isTopBottomSectoring = !!data.isTopBottomSectoring;
        this.displayAtGroupNode = !!data.displayAtGroupNode;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties to be saved in favorites
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            isTopBottomSectoring: !!this.isTopBottomSectoring,
            displayAtGroupNode: !!this.displayAtGroupNode
        };
    }

    /**
     * See RequestParamsCreator.addRequestParams
     */
    addRequestParams(requestParams: any): void {
        requestParams.isTopBottomSectoring = this.isTopBottomSectoring;
        requestParams.isDisplayAtGroupNode = this.displayAtGroupNode;
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return WidgetInputType.TOP_BOTTOM_SECTORING;
    }

    getConfigType() {
        return WidgetInputType.TOP_BOTTOM_SECTORING;
    }

    removeFieldsForFavoriteChangeDetection(_serializedObject: any): void {
        // no implementation
    }
}
