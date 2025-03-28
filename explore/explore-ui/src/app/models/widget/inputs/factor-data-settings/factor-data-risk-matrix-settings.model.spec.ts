import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {FactorDataRiskMatrixSettings} from './factor-data-risk-matrix-settings.model';


/**
 * Test cases for FactorDataRiskMatrixSettings.model.ts
 */
describe('FactorDataRiskMatrixSettings tests', function () {

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test serialize/deserialize
     */
    it('Test Serialize/Deserialize', function () {
        // Create factorDataChartSettings to serialize
        const factorDataRiskMatrixSettings = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: '03/15/2021', showChangeInUpperTriangle: true});

        // Serialize
        const factorDataRiskMatrixSettingsSerialized: any = factorDataRiskMatrixSettings.serialize();

        // Deserialize
        const factorDataChartSettingsDeserialized: FactorDataRiskMatrixSettings =
            ConfigTypeFactory.createConfig(factorDataRiskMatrixSettingsSerialized, FactorDataRiskMatrixSettings.configType, true);

        // Validate
        expect(factorDataRiskMatrixSettings.isTriangularMatrix).toStrictEqual(factorDataChartSettingsDeserialized.isTriangularMatrix);
        expect(factorDataRiskMatrixSettings.comparisonDate).toStrictEqual(factorDataChartSettingsDeserialized.comparisonDate);
        expect(factorDataRiskMatrixSettings.showChangeInUpperTriangle).toStrictEqual(factorDataChartSettingsDeserialized.showChangeInUpperTriangle);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const factorDataRiskMatrixSettings1 = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: '03/15/2021', showChangeInUpperTriangle: true});
        let factorDataRiskMatrixSettings2 = new FactorDataRiskMatrixSettings({ isTriangularMatrix: false, comparisonDate: '03/15/2021', showChangeInUpperTriangle: true});

        // Different isTriangularMatrix
        expect(factorDataRiskMatrixSettings1.equals(factorDataRiskMatrixSettings2)).toBe(false);

        // Different comparisonDate
        factorDataRiskMatrixSettings2 = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: '03/20/2021', showChangeInUpperTriangle: true});
        expect(factorDataRiskMatrixSettings1.equals(factorDataRiskMatrixSettings2)).toBe(false);

        // Different showChangeInUpperTriangle
        factorDataRiskMatrixSettings2 = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: '03/15/2021', showChangeInUpperTriangle: false});
        expect(factorDataRiskMatrixSettings1.equals(factorDataRiskMatrixSettings2)).toBe(false);

        // Same settings
        factorDataRiskMatrixSettings2 = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: '03/15/2021', showChangeInUpperTriangle: true});
        expect(factorDataRiskMatrixSettings1.equals(factorDataRiskMatrixSettings2)).toBe(true);
    });
    /**
     * Test case for method equals
     */
    it('Test addRequestParams', function () {
        const factorDataRiskMatrixSettings = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: '03/15/2021', showChangeInUpperTriangle: true});
        const optionValues = {} as any;
        factorDataRiskMatrixSettings.addRequestParams(optionValues);
        expect(optionValues.factorDataRiskMatrixSettings).not.toBeNull();
        expect(optionValues.factorDataRiskMatrixSettings.isTriangularMatrix).toBeTruthy();
        expect(optionValues.factorDataRiskMatrixSettings.comparisonDate).toBe('03/15/2021');
        expect(optionValues.factorDataRiskMatrixSettings.showChangeInUpperTriangle).toBeTruthy();
    });

    it('Test shouldSkipSerialize', () => {
        const factorDataRiskMatrixSettings = new FactorDataRiskMatrixSettings({ isTriangularMatrix: true, comparisonDate: '03/15/2021', showChangeInUpperTriangle: true});
        expect(factorDataRiskMatrixSettings.shouldSkipSerialize()).toBe(false);
    });
});
