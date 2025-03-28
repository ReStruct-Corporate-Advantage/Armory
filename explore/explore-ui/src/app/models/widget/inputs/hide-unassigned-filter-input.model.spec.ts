import {ConfigInitializer} from '../../../initializers/config.initializer';
import {HideUnassignedFilterInput} from '@models/widget/inputs/hide-unassigned-filter-input.model';
import {ConfigTypeFactory, WidgetInputType} from '@blk/explore-ui-core';


describe('Hide Unassigned Filter Input model test case', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function () {
        const hideUnassignedFilter = new HideUnassignedFilterInput();
        hideUnassignedFilter.hideUnassignedFilter = true;

        // convert the object to string and then back to json again.
        const serializedData: any = hideUnassignedFilter.serialize();
        const newHideUnassignedFilterInput: HideUnassignedFilterInput = ConfigTypeFactory.createConfig(serializedData, WidgetInputType.HIDE_UNASSIGNED_FILTER, false);

        // validate that the before and after are the same.
        expect(newHideUnassignedFilterInput.hideUnassignedFilter).toBe(hideUnassignedFilter.hideUnassignedFilter);
    });

    it('Test deserialize no data', function () {
        const hideUnassignedFilter = new HideUnassignedFilterInput();
        hideUnassignedFilter.deserialize(undefined);

        expect(hideUnassignedFilter.hideUnassignedFilter).toBeFalsy();
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const hideUnassignedFilter = new HideUnassignedFilterInput();
        expect(hideUnassignedFilter.isDataStoreInput()).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const hideUnassignedFilter1 = new HideUnassignedFilterInput();
        hideUnassignedFilter1.hideUnassignedFilter = true;

        const hideUnassignedFilter2 = new HideUnassignedFilterInput();
        expect(hideUnassignedFilter1.equals(hideUnassignedFilter2)).toBeFalsy();

        const hideUnassignedFilter3 = new HideUnassignedFilterInput();
        hideUnassignedFilter3.hideUnassignedFilter = false;
        expect(hideUnassignedFilter1.equals(hideUnassignedFilter3)).toBeFalsy();

        hideUnassignedFilter3.hideUnassignedFilter = true;
        expect(hideUnassignedFilter1.equals(hideUnassignedFilter3)).toBeTruthy();
    });

    it('addRequestParams test case', () => {
        const model = new HideUnassignedFilterInput({
            hideUnassignedFilter: true
        });
        const requestParams = new Map <string, any>();
        model.addRequestParams(requestParams);
        expect(requestParams[WidgetInputType.HIDE_UNASSIGNED_FILTER]).toEqual(true);
    });

    it('Test reset', () => {
        const hideUnassignedFilter = new HideUnassignedFilterInput();
        hideUnassignedFilter.hideUnassignedFilter = true;
        expect(hideUnassignedFilter.hideUnassignedFilter).toBeTruthy();
        hideUnassignedFilter.reset();
        expect(hideUnassignedFilter.hideUnassignedFilter).toBeFalsy();
    });

    it('Test shouldSkipSerialize', () => {
        const model = new HideUnassignedFilterInput();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});
