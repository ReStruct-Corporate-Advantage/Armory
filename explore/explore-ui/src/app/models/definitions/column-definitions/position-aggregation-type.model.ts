import {GenericColumnDefinition} from '@blk/explore-ui-core';

export class PositionAggregationType extends GenericColumnDefinition {

    constructor(data?: any) {
        super(data);
    }

    /**
     * Convert position Aggregation mappings received from backend into appropriate models
     */
    static createPositionAggregationMapping(data: any): Array<PositionAggregationType> {
        const positionAggregationType: Array<PositionAggregationType> = [];
        for (const positionType of data.closedPositionAggregationTypes) {
            positionAggregationType.push(new GenericColumnDefinition(positionType));
        }

        return positionAggregationType;
    }
}
