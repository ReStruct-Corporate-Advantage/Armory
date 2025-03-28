import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {SecondaryAxis} from './secondary-axis.model';
import {ChartWidgetInputConfigType, ConfigTypeFactory} from '@blk/explore-ui-core';


/**
 * Test cases for SecondaryAxis.ts
 */
describe('SecondaryAxis tests', function () {

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((function () {
        ConfigInitializer.registerChartWidgetInputConfigTypes();
    }));

    /**
     * Test serialize/deserialize
     */
    it('Test Serialize/Deserialize', function () {
        // Create secondaryAxis to serialize
        const secondaryAxis = new SecondaryAxis({secondaryAxisColumn: 'Notional Market Value %'});

        // Serialize
        let secondaryAxisSerialized: any = secondaryAxis.serialize();

        // Deserialize
        let secondaryAxisDeserialized: SecondaryAxis =
            ConfigTypeFactory.createConfig(secondaryAxisSerialized, ChartWidgetInputConfigType.SECONDARY_AXIS, true);

        // Validate
        expect(secondaryAxis.secondaryAxisColumn).toStrictEqual(secondaryAxisDeserialized.secondaryAxisColumn);

        secondaryAxisSerialized = {secondaryAxisColumn: {data: 'market_val_1'}};

        // Deserialize
        secondaryAxisDeserialized = ConfigTypeFactory.createConfig(secondaryAxisSerialized, ChartWidgetInputConfigType.SECONDARY_AXIS, true);

        // Validate
        expect(secondaryAxisDeserialized.secondaryAxisColumn).toBe('market_val_1');

        secondaryAxisSerialized = {secondaryAxisColumn: 'market_val_1'};

        // Deserialize
        secondaryAxisDeserialized = ConfigTypeFactory.createConfig(secondaryAxisSerialized, ChartWidgetInputConfigType.SECONDARY_AXIS, true);

        // Validate
        expect(secondaryAxisDeserialized.secondaryAxisColumn).toBe('market_val_1');
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const NOTIONAL_MARKET_VALUE_PCT = 'Notional Market Value %';
        const secondaryAxis1 = new SecondaryAxis({secondaryAxisColumn: NOTIONAL_MARKET_VALUE_PCT});
        let secondaryAxis2 = new SecondaryAxis({secondaryAxisColumn: 'NONE'});

        // Different values for secondaryAxisColumn
        expect(secondaryAxis1.equals(secondaryAxis2)).toBe(false);

        // Same values for secondaryAxisColumn
        secondaryAxis2 = new SecondaryAxis({secondaryAxisColumn: NOTIONAL_MARKET_VALUE_PCT});
        expect(secondaryAxis1.equals(secondaryAxis2)).toBe(true);
    });

    it('Test shouldSkipSerialize', () => {
        const secondaryAxis = new SecondaryAxis({secondaryAxisColumn: 'Notional Market Value %'});
        expect(secondaryAxis.shouldSkipSerialize()).toBe(false);
    });
});
