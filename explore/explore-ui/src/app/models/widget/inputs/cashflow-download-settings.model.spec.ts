import {ConfigInitializer} from '../../../initializers/config.initializer';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {CashflowDownloadSettings} from '@models/widget/inputs/cashflow-download-settings.model';

/**
 * CashflowDownloadSettings tests
 */
describe('CashflowDownloadSettings test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const cashflowDownloadSettings: CashflowDownloadSettings = new CashflowDownloadSettings({cashFlowDownload: true});

        // Convert the object to string and then back to json again.
        const serializedData: any = cashflowDownloadSettings.serialize();

        const newCashflowDownloadSettings: CashflowDownloadSettings = ConfigTypeFactory.createConfig(serializedData, CashflowDownloadSettings.configType, false);
        // Validate that the before and after are the same.
        expect(newCashflowDownloadSettings.cashFlowDownload).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const model1 = new CashflowDownloadSettings();
        const model2 = new ReturnSpriteletInput();
        expect(model1.equals(model2)).toBeFalsy();

        const model3 = new CashflowDownloadSettings();
        // Different cashFlowDownload
        model1.cashFlowDownload = true;
        model3.cashFlowDownload = false;
        expect(model1.equals(model3)).toBeFalsy();

        model1.cashFlowDownload = false;
        expect(model1.equals(model3)).toBeTruthy();
    });

    it('hasDataStoreInput test case', () => {
        const model = new CashflowDownloadSettings();
        expect(model.isDataStoreInput()).toBeTruthy();
    });

    it('Test shouldSkipSerialize', () => {
        const model = new CashflowDownloadSettings();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });

    it('addRequestParams test case', () => {
        const model = new CashflowDownloadSettings();
        model.cashFlowDownload = true;

        const requestParams = {};

        model.addRequestParams(requestParams);
        expect(requestParams['cashflowDownload']).toBeTruthy();
    });

});

