import {ConfigInitializer} from '../../../initializers/config.initializer';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {SuppressRootNodeSetting} from '@models/widget/inputs/suppress-root-node-setting.model';

/**
 * SuppressRootNodeSetting Input tests
 */
describe('SuppressRootNodeSetting test', function () {
    let suppressRootNodeSetting ;
    beforeAll((function () {
        suppressRootNodeSetting = new SuppressRootNodeSetting();
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function () {
        const suppressRootNodeSetting = new SuppressRootNodeSetting();
        suppressRootNodeSetting.suppressRootNodeAggregation = true;

        // convert the object to string and then back to json again.
        const serializedData: any = suppressRootNodeSetting.serialize();
        const newSuppressRootNodeSetting: SuppressRootNodeSetting = ConfigTypeFactory.createConfig(serializedData, SuppressRootNodeSetting.configType, false);

        // validate that the before and after are the same.
        expect(newSuppressRootNodeSetting.suppressRootNodeAggregation).toBe(suppressRootNodeSetting.suppressRootNodeAggregation);
    });

    it('Test deserialize no data', function () {
        const suppressRootNodeSetting = new SuppressRootNodeSetting();
        suppressRootNodeSetting.deserialize(undefined);

        expect(suppressRootNodeSetting.suppressRootNodeAggregation).toBeFalsy();
    });

    /**
     * Test isDataStoreInput
     */
    it('Test isDataStoreInput', () => {
        const suppressRootNodeSetting = new SuppressRootNodeSetting();
        expect(suppressRootNodeSetting.isDataStoreInput()).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const suppressRootNodeSetting1 = new SuppressRootNodeSetting();
        suppressRootNodeSetting1.suppressRootNodeAggregation = true;

        const suppressRootNodeSetting2 = new SuppressRootNodeSetting();
        expect(suppressRootNodeSetting1.equals(suppressRootNodeSetting2)).toBeFalsy();

        const suppressRootNodeSetting3 = new SuppressRootNodeSetting();
        suppressRootNodeSetting3.suppressRootNodeAggregation = false;
        expect(suppressRootNodeSetting1.equals(suppressRootNodeSetting3)).toBeFalsy();

        suppressRootNodeSetting3.suppressRootNodeAggregation = true;
        expect(suppressRootNodeSetting1.equals(suppressRootNodeSetting3)).toBeTruthy();
    });

    it('should override suppressRootNodeAggregation to true if portTreeDecisionLevel is greater than 0', () => {
        const requestParams: any = { portTreeDecisionLevel: 1 };
        suppressRootNodeSetting.suppressRootNodeAggregation = false;

        suppressRootNodeSetting.addRequestParams(requestParams);

        expect(requestParams.suppressRootNodeAggregation).toBe(true);
    });

    it('should not override suppressRootNodeAggregation if portTreeDecisionLevel is 0', () => {
        const requestParams: any = { portTreeDecisionLevel: 0 };
        suppressRootNodeSetting.suppressRootNodeAggregation = true;

        suppressRootNodeSetting.addRequestParams(requestParams);

        expect(requestParams.suppressRootNodeAggregation).toBe(true);
    });

    it('should handle undefined portTreeDecisionLevel', () => {
        const requestParams: any = {};
        suppressRootNodeSetting.suppressRootNodeAggregation = true;

        suppressRootNodeSetting.addRequestParams(requestParams);

        expect(requestParams.suppressRootNodeAggregation).toBe(true);
    });

    it('Test shouldSkipSerialize', () => {
        const suppressRootNodeSetting = new SuppressRootNodeSetting();
        expect(suppressRootNodeSetting.shouldSkipSerialize()).toBeFalsy();
    });
});

