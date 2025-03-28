import {ConfigTypeFactory, WidgetInputType} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../../initializers/config.initializer';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';

describe('Fund Cusip test case', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', () => {
        const fundCusip = new FundCusip();
        fundCusip.cusip = 'BRS123';
        // Convert the object to string and then back to json again.
        const serializedData: any = fundCusip.serialize();

        const newFundCusipInput = ConfigTypeFactory.createConfig(serializedData, WidgetInputType.FUND_CUSIP, false);
        // Validate that the before and after are the same.
        expect(newFundCusipInput.cusip).toBe('BRS123');
    });

    /**
     * Test case for method equals
     */
    it('Test equals', () => {
        const input1 = new FundCusip();
        const input2 = new FundCusip();
        expect(input1.equals(input2)).toBeTruthy();

        // Differ in useAbsolute boolean value
        input1.cusip = 'BRS123';

        input2.cusip = 'BRS124';
        expect(input1.equals(input2)).toBeFalsy();

        input2.cusip = 'BRS123';
        expect(input1.equals(input2)).toBeTruthy();
    });

    it('hasDataStoreInput test case', () => {
        const fundCusip = new FundCusip();
        expect(fundCusip.isDataStoreInput()).toBeTruthy();
    });


    it('addRequestParams test case', () => {
        const model = new FundCusip('BRS123');
        const requestParams = new Map <string, any>();
        model.addRequestParams(requestParams);
        expect(requestParams[WidgetInputType.FUND_CUSIP]).toEqual('BRS123');
    });

    it('Test shouldSkipSerialize', () => {
        const model = new FundCusip();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});
