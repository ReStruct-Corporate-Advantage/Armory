import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../../initializers/config.initializer';
import {MinValFilter} from '@models/widget/inputs/min-val-filter.model';

describe('Min val filter test case', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', () => {
        const minValFilterInput: MinValFilter = new MinValFilter();
        minValFilterInput.value = 0.02;
        minValFilterInput.columnKey = 'pct_mv_1';
        minValFilterInput.positionColumnType = 'PORT';
        minValFilterInput.columnTag = 'pct_mv';
        minValFilterInput.useAbsolute = true;

        // Convert the object to string and then back to json again.
        let serializedData: any = minValFilterInput.serialize();

        let newMinValFilterInput: MinValFilter = ConfigTypeFactory.createConfig(serializedData, MinValFilter.CONFIG_TYPE, false);
        // Validate that the before and after are the same.
        expect(newMinValFilterInput.value).toBe(0.02);
        expect(newMinValFilterInput.columnKey).toBe('pct_mv_1');
        expect(newMinValFilterInput.positionColumnType).toBe('PORT');
        expect(newMinValFilterInput.columnTag).toBe('pct_mv');
        expect(newMinValFilterInput.useAbsolute).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', () => {
        const input1: MinValFilter = new MinValFilter();
        const input2: MinValFilter = new MinValFilter();
        expect(input1.equals(input2)).toBeTruthy();

        // Differ in useAbsolute boolean value
        input1.value = 0.02;
        input1.columnKey = 'pct_mv_1';
        input1.positionColumnType = 'PORT';
        input1.columnTag = 'pct_mv';
        input1.useAbsolute = true;

        input2.value = 0.02;
        input2.columnKey = 'pct_mv_1';
        input2.positionColumnType = 'PORT';
        input2.columnTag = 'pct_mv';
        input2.useAbsolute = false;
        expect(input1.equals(input2)).toBeFalsy();

        // Changing value for 'value' field
        input2.value = 0.002;
        expect(input1.equals(input2)).toBeFalsy();

        // Everything same now
        input2.value = 0.02;
        input2.useAbsolute = true;
        expect(input1.equals(input2)).toBeTruthy();
    });

    it('hasDataStoreInput test case', () => {
        const minValCtrl: MinValFilter = new MinValFilter();
        expect(minValCtrl.isDataStoreInput()).toBeTruthy();
    });

    it('isValidMinValFilter test case', () => {
        const minValCtrl: MinValFilter = new MinValFilter();
        expect(MinValFilter.isValidMinValFilter(minValCtrl)).toBeFalsy();

        minValCtrl.value = 1;
        expect(MinValFilter.isValidMinValFilter(minValCtrl)).toBeFalsy();

        minValCtrl.columnTag = 'pc_mvt';
        expect(MinValFilter.isValidMinValFilter(minValCtrl)).toBeTruthy();
    });

    it('addRequestParams test case', () => {
        const model: MinValFilter = new MinValFilter();
        model.value = 10.00;
        model.columnKey = 'pct_mv_1';
        model.positionColumnType = 'PORT';
        model.columnTag = 'pct_mv';
        model.useAbsolute = false;
        const requestParams = new Map <string, any>();
        model.addRequestParams(requestParams, 'minValFilter');
        expect(requestParams['minValFilter']).toEqual({
            'value': 10.00,
            'columnKey': 'pct_mv_1',
            'positionColumnType': 'PORT',
            'columnTag': 'pct_mv',
            'useAbsolute': false
        });
    });

    it('Test shouldSkipSerialize', () => {
        const model: MinValFilter = new MinValFilter();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});
