import {ConfigTypeFactory, WidgetInputType} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../../initializers/config.initializer';
import {CollapsedColumns} from '@models/widget/inputs/collapsed-columns.model';
import { log } from 'console';
import { WidgetInput } from '../../../../../dist/libs/@blk/explore-ui-core/widget-config/interfaces/widget-input.interface';
import { each } from 'lodash';

describe('Collapsed Columns test case', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', () => {
        const widgetInputs: Map<string, WidgetInput> = new Map<string, WidgetInput>();
        const collapsedColumns = new CollapsedColumns();
        expect(collapsedColumns.equals(widgetInputs)).toBeFalsy();

        const collapsedColumnsWidgetInput = new CollapsedColumns();
        expect(collapsedColumns.equals(collapsedColumnsWidgetInput)).toBeFalsy();
    });

    it('hasDataStoreInput test case', () => {
        const collapsedColumns = new CollapsedColumns();
        expect(collapsedColumns.isDataStoreInput()).toBeTruthy();
    });

    it('Test shouldSkipSerialize', () => {
        const model = new CollapsedColumns();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });

    it('addRequestParams test case', () => {
        const columns = new Set<string>();
        columns.add('pnl_price');

        const model = new CollapsedColumns(columns);
        const requestParams = new Map <string, any>();
        const paramName = WidgetInputType.COLLAPSED_COLUMNS;
        model.addRequestParams(requestParams, paramName, true);
        expect(requestParams[paramName].collapsedColumns).toEqual(undefined);
        model.addRequestParams(requestParams, paramName, true, true);
        expect(requestParams[paramName].collapsedColumns).toEqual(undefined);
    });

});
