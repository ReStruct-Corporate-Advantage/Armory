import {ColumnConfig} from '@blk/explore-ui-core';
import {CustomAggregationColumnOption, OverrideDateColumnOption} from '@blk/explore-ui-column-option';
import {isNil} from 'lodash';

/**
 * Utility class that holds validation methods before making server request
 */
export class RequestValidationUtils {
    /**
     * Check if the widget holds decomposition column with the aggregation types other than 'Weighted average' and 'Score with short handling'.
     */
    static validateForDecompositionColumnWithAggregationType(column: ColumnConfig): boolean {
        let isDecompositionColumn: boolean;
        let aggregationType: number;

        for (const optionValue of column.optionValues) {
            if (optionValue instanceof OverrideDateColumnOption && optionValue.showAttribution) {
                isDecompositionColumn = true;
            }
            if (optionValue instanceof CustomAggregationColumnOption) {
                aggregationType = optionValue.subtotalType;
            }

            if (isDecompositionColumn && !isNil(aggregationType) && aggregationType !== 600 && aggregationType !== 2300) {
                return false;
            }
        }
        return true;
    }
}
