import {ColumnConfig} from '@blk/explore-ui-core';
import {CustomAggregationColumnOption, OverrideDateColumnOption} from '@blk/explore-ui-column-option';
import {RequestValidationUtils} from '@utils/request-validation.utils';

describe('RequestValidationUtils', () => {
    it('should validateForDecompositionColumnWithAggregationType', () => {
        const column = new ColumnConfig();
        column.columnTag = 'eq_fin_th_ws_343';
        column.columnKey = 'eq_fin_th_ws_343_eece76c3ba1c465';

        expect(RequestValidationUtils.validateForDecompositionColumnWithAggregationType(column)).toBeTruthy();

        const overrideDateColumnOption = new OverrideDateColumnOption();
        overrideDateColumnOption.showAttribution = true;

        const customAggregationColumnOption = new CustomAggregationColumnOption();
        customAggregationColumnOption.subtotalType = 2300;

        column.optionValues.push(overrideDateColumnOption);
        column.optionValues.push(customAggregationColumnOption);

        expect(RequestValidationUtils.validateForDecompositionColumnWithAggregationType(column)).toBeTruthy();

        customAggregationColumnOption.subtotalType = 0;

        expect(RequestValidationUtils.validateForDecompositionColumnWithAggregationType(column)).toBeFalsy();
    });
});

