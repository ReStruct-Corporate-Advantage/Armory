import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject, isNil} from 'lodash';

/**
 * Model for suppress root node setting. Decides if the
 * root node is hidden in widget.
 */
export class SuppressRootNodeSetting extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    static readonly SUPPRESS_ROOT_NODE_AGGREGATION = 'suppressRootNodeAggregation';

    suppressRootNodeAggregation = false;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.suppressRootNodeAggregation = data.suppressRootNodeAggregation;
    }

    equals(data: AbstractConfig): boolean {
        return data instanceof SuppressRootNodeSetting && this.suppressRootNodeAggregation === data.suppressRootNodeAggregation;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            suppressRootNodeAggregation: this.suppressRootNodeAggregation
        };
    }

    static get configType(): string {
        return SuppressRootNodeSetting.SUPPRESS_ROOT_NODE_AGGREGATION;
    }

    addRequestParams(requestParams: any, paramName?: string, isExportRequest?: boolean): void {
        requestParams.suppressRootNodeAggregation = this.suppressRootNodeAggregation;
        if (requestParams.portTreeDecisionLevel > 0) {
            requestParams.suppressRootNodeAggregation = true;
        }
    }

}
