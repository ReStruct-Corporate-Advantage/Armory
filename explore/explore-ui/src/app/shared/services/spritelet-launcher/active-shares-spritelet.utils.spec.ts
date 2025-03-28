import {Widget} from '@models/widget/widget.model';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ActiveSharesSpriteletUtils} from '@services/spritelet-launcher/active-shares-spritelet.utils';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {TestUtils} from '@utils/test.utils';

/**
 * Test cases for ActiveSharesSpriteletUtils
 */
describe('ActiveSharesSpriteletUtils', () => {

    beforeEach( (done) => {
        TestUtils.initialize(done);
    });

    it('test updateInputsForActiveSharesSpritelet', () => {
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        ActiveSharesSpriteletUtils.updateInputsForActiveSharesSpritelet(widget);
        const columnSet = widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const activeSharesColumnConfig = columnSet.columns.find(col => col.columnTag === 'active_shares');
        expect(columnSet.columns.length).toBe(6);
        expect(activeSharesColumnConfig).not.toBeUndefined();
    });

});
