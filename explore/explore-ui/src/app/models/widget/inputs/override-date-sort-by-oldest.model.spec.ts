import {ConfigInitializer} from '../../../initializers/config.initializer';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {OverrideDateSortByOldest} from '@models/widget/inputs/override-date-sort-by-oldest.model';

/**
 * OverrideDateSortByOldest Input tests
 */
describe('OverrideDateSortByOldest test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function () {
        const overrideDateSortByOldest = new OverrideDateSortByOldest();
        overrideDateSortByOldest.sortByOldest = true;

        // convert the object to string and then back to json again.
        const serializedData: any = overrideDateSortByOldest.serialize();
        const newOverrideDateSortByOldest: OverrideDateSortByOldest = ConfigTypeFactory.createConfig(serializedData, OverrideDateSortByOldest.CONFIG_TYPE, false);

        // validate that the before and after are the same.
        expect(newOverrideDateSortByOldest.sortByOldest).toBe(overrideDateSortByOldest.sortByOldest);
    });

    it('Test deserialize no data', function () {
        const overrideDateSortByOldest = new OverrideDateSortByOldest();
        overrideDateSortByOldest.deserialize(undefined);

        expect(overrideDateSortByOldest.sortByOldest).toBeFalsy();
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const overrideDateSortByOldest = new OverrideDateSortByOldest();
        expect(overrideDateSortByOldest.isDataStoreInput()).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const overrideDateSortByOldest1 = new OverrideDateSortByOldest();
        overrideDateSortByOldest1.sortByOldest = true;

        const overrideDateSortByOldest2 = new OverrideDateSortByOldest();
        expect(overrideDateSortByOldest1.equals(overrideDateSortByOldest2)).toBeFalsy();

        const overrideDateSortByOldest3 = new OverrideDateSortByOldest();
        overrideDateSortByOldest3.sortByOldest = false;
        expect(overrideDateSortByOldest1.equals(overrideDateSortByOldest3)).toBeFalsy();

        overrideDateSortByOldest3.sortByOldest = true;
        expect(overrideDateSortByOldest1.equals(overrideDateSortByOldest3)).toBeTruthy();
    });

    it('addRequestParams test case', () => {
        const model = new OverrideDateSortByOldest({
            sortByOldest: true
        });
        const requestParams = new Map <string, any>();
        model.addRequestParams(requestParams);
        expect(requestParams[OverrideDateSortByOldest.CONFIG_TYPE]).toEqual(true);
    });

    it('Test shouldSkipSerialize', () => {
        const model = new OverrideDateSortByOldest();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});

