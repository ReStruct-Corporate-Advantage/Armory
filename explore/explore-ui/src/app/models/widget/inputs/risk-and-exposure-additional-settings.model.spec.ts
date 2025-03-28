/**
 * Created by aaanand on 7/28/2017.
 */

import {ConfigInitializer} from '../../../initializers/config.initializer';
import {RiskAndExposureAdditionalSettings} from './risk-and-exposure-additional-settings.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';

/**
 * Test cases for RiskAndExposureAdditionalSettings.ts
 */
describe('RiskAndExposureAdditionalSettings tests', function () {
    /**
     * Performs required initialisation before any test is run
     */
    beforeAll(function () {
        ConfigInitializer.registerWidgetInputTypes();
    });

    /**
     * Test case for method equal
     */
    it('Test equal', function () {
        const riskAndExposureAdditionalSettings1 = new RiskAndExposureAdditionalSettings({
            closedPositionAggregationType: 'GROUP',
            benchmarkPositionAggregationType: 'NONE',
            portfolioPositionAggregationType: 'EXCLUDE'
        });
        let riskAndExposureAdditionalSettings2 = new RiskAndExposureAdditionalSettings({
            closedPositionAggregationType: 'NONE',
            benchmarkPositionAggregationType: 'GROUP',
            portfolioPositionAggregationType: 'NONE'
        });

        // Different closed position aggregation type, benchmark position aggregation type and portfolio position aggregation type
        expect(riskAndExposureAdditionalSettings1.equals(riskAndExposureAdditionalSettings2)).toBe(false);

        // Different closed position aggregation type, benchmark position aggregation type
        riskAndExposureAdditionalSettings2 = new RiskAndExposureAdditionalSettings({
            closedPositionAggregationType: 'NONE',
            benchmarkPositionAggregationType: 'GROUP',
            portfolioPositionAggregationType: 'EXCLUDE'
        });
        expect(riskAndExposureAdditionalSettings1.equals(riskAndExposureAdditionalSettings2)).toBe(false);

        // Different closed position aggregation type
        riskAndExposureAdditionalSettings2 = new RiskAndExposureAdditionalSettings({
            closedPositionAggregationType: 'NONE',
            benchmarkPositionAggregationType: 'NONE',
            portfolioPositionAggregationType: 'EXCLUDE'
        });
        expect(riskAndExposureAdditionalSettings1.equals(riskAndExposureAdditionalSettings2)).toBe(false);

        // Same closed position aggregation type, benchmark position aggregation type and portfolio position aggregation type
        riskAndExposureAdditionalSettings2 = new RiskAndExposureAdditionalSettings({
            closedPositionAggregationType: 'GROUP',
            benchmarkPositionAggregationType: 'NONE',
            portfolioPositionAggregationType: 'EXCLUDE'
        });
        expect(riskAndExposureAdditionalSettings1.equals(riskAndExposureAdditionalSettings2)).toBe(true);
    });

    /**
     * Test serialize/deserialize
     */
    it('Test Serialize/Deserialize', function () {
        // Create settings to serialise
        const riskAndExposureAdditionalSettings = new RiskAndExposureAdditionalSettings({
            closedPositionAggregationType: 'GROUP',
            benchmarkPositionAggregationType: 'NONE',
            portfolioPositionAggregationType: 'EXCLUDE'
        });
        // Serialise
        const riskAndExposureAdditionalSettingsSerialized: any = riskAndExposureAdditionalSettings.serialize();
        // Deserialise
        const riskAndExposureAdditionalSettingsDeserialised: RiskAndExposureAdditionalSettings = ConfigTypeFactory.createConfig(
            riskAndExposureAdditionalSettingsSerialized,
            RiskAndExposureAdditionalSettings.configType,
            true
        );

        // Validate
        expect(riskAndExposureAdditionalSettings.closedPositionAggregationType).toStrictEqual(
            riskAndExposureAdditionalSettingsDeserialised.closedPositionAggregationType
        );
        expect(riskAndExposureAdditionalSettings.benchmarkPositionAggregationType).toStrictEqual(
            riskAndExposureAdditionalSettingsDeserialised.benchmarkPositionAggregationType
        );
        expect(riskAndExposureAdditionalSettings.portfolioPositionAggregationType).toStrictEqual(
            riskAndExposureAdditionalSettingsDeserialised.portfolioPositionAggregationType
        );
    });

    /**
     * Test Deserialize old favorite.
     */
    it('Test Deserialize Old Favorite', function () {
        const data = {
            inputType: 'riskAndExposureAdditionalSettings',
            data: {
                benchmarkPositionAggregationType: 'GROUP',
                closedPositionAggregationType: 'SINGLE_ROW',
                portfolioPositionAggregationType: 'NONE'
            }
        };

        const deserializedObject: RiskAndExposureAdditionalSettings = ConfigTypeFactory.createConfig(
            data,
            RiskAndExposureAdditionalSettings.configType,
            true
        );

        expect(deserializedObject).toBeDefined();
        expect(deserializedObject).not.toBeNull();
        expect(deserializedObject.benchmarkPositionAggregationType).toEqual('GROUP');
        expect(deserializedObject.closedPositionAggregationType).toEqual('SINGLE_ROW');
        expect(deserializedObject.portfolioPositionAggregationType).toEqual('NONE');
    });

    /**
     * Test Deserialize old favorite, for some reason the old favorites had the data in there twice, but one of them, was wrong.
     */
    it('Test Deserialize Old Favorite - with nested data', function () {
        const data = {
            data: {
                benchmarkPositionAggregationType: 'NONE',
                closedPositionAggregationType: 'NONE',
                portfolioPositionAggregationType: 'NONE'
            },
            benchmarkPositionAggregationType: 'EXCLUDE',
            closedPositionAggregationType: 'SINGLE_ROW',
            portfolioPositionAggregationType: 'GROUP'
        };

        const deserializedObject: RiskAndExposureAdditionalSettings = ConfigTypeFactory.createConfig(
            data,
            RiskAndExposureAdditionalSettings.configType,
            true
        );

        expect(deserializedObject).toBeDefined();
        expect(deserializedObject).not.toBeNull();
        expect(deserializedObject.benchmarkPositionAggregationType).toEqual('EXCLUDE');
        expect(deserializedObject.closedPositionAggregationType).toEqual('SINGLE_ROW');
        expect(deserializedObject.portfolioPositionAggregationType).toEqual('GROUP');
    });

    /**
     * Tests addRequestParams method
     */
    it('Test addRequestParams', function () {
        const settings = new RiskAndExposureAdditionalSettings();
        const requestParams: any = {};

        settings.addRequestParams(requestParams, undefined);

        expect(requestParams.benchmarkPositionAggregationType).toStrictEqual(settings.benchmarkPositionAggregationType);
        expect(requestParams.closedPositionAggregationType).toStrictEqual(settings.closedPositionAggregationType);
        expect(requestParams.portfolioPositionAggregationType).toStrictEqual(settings.portfolioPositionAggregationType);
    });

    it('Test shouldSkipSerialize', () => {
        const settings = new RiskAndExposureAdditionalSettings();
        expect(settings.shouldSkipSerialize()).toBeFalsy();
    });
});
