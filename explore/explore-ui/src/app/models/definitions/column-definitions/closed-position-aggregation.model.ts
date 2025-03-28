import {GenericColumnDefinition} from '@blk/explore-ui-core';

export class ClosedPositionAggregation extends GenericColumnDefinition {

    constructor(data?: any) {
        super(data);
    }

    /**
     * Convert closed position mappings received from backend into appropriate models
     */
    static createClosedPositionAggregationMapping(data: any): Array<ClosedPositionAggregation> {
        const closedPositionAggregationType: Array<ClosedPositionAggregation> = [];
        for (const closedPositionType of data.closedPositionAggregationTypes) {
            closedPositionAggregationType.push(new GenericColumnDefinition(closedPositionType));
        }

        return closedPositionAggregationType;
    }
}
