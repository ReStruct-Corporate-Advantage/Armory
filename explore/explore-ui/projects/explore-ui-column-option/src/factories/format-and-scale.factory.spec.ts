import {CoreTestUtils} from '@blk/explore-ui-core';
import {ColumnOptionInitializer} from '../column-option.initializer';
import {NumericDataFormatter} from '../models/data-formatter/numeric-data-formatter.model';
import {StringDataFormatter} from '../models/data-formatter/string-data-formatter.model';
import {LibColumnUtils} from '../utils';
import {FormatAndScaleFactory} from './format-and-scale.factory';

/**
 * Test cases for FormatAndScaleFactory class
 */
describe('FormatAndScaleFactory', () => {
    beforeAll(() => {
        ColumnOptionInitializer.initializeConfig();
        CoreTestUtils.initDefinitions();
    });

    /**
     * Test getFormatterToUse
     */
    it('getFormatterToUse', () => {
        // Numeric formatter
        let col: any = {columnTag: 'market_val'};
        let columnDef = LibColumnUtils.getColumnDefinition(col);
        let formatter = FormatAndScaleFactory.getFormatterToUse(columnDef.columnFormat, []);
        expect(formatter instanceof NumericDataFormatter).toBe(true);

        // Column doesn't have a formatter
        col = {columnTag: 'gics_1_sector'};
        columnDef = LibColumnUtils.getColumnDefinition(col);
        formatter = FormatAndScaleFactory.getFormatterToUse(columnDef.columnFormat, []);
        expect(formatter instanceof StringDataFormatter).toBe(true);
    });
});
