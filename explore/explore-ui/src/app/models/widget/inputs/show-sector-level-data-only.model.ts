import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isNil} from 'lodash';

/**
 * WidgetInput model to show sector level data only
 */
export class ShowSectorLevelDataOnlyModel extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    static readonly CONFIG_TYPE = 'sectorLevelDataOnly';
    static readonly REQUEST_PARAM = 'isSectorView';

    isSectorView: boolean;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        this.deserialize(data);
    }

    /**
     * Return config value
     */
    static get configType(): string {
        return ShowSectorLevelDataOnlyModel.CONFIG_TYPE;
    }

    getConfigType() {
        return ShowSectorLevelDataOnlyModel.CONFIG_TYPE;
    }

    /**
     * Equals method to test whether two object are equal or not
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof ShowSectorLevelDataOnlyModel)) {
            return false;
        }
        return this.isSectorView === widgetInput.isSectorView;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    addRequestParams(requestParams: any, paramName?: string): void {
        if (this.isSectorView) {
            requestParams[ShowSectorLevelDataOnlyModel.REQUEST_PARAM] = 'Y';
        }
    }

    shouldSkipSerialize(): boolean {
        // If the value is false/undefined then just skip serializing since that's the default behavior anyway
        return !this.isSectorView;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.isSectorView;
    }

    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.isSectorView = data;
    }
}
