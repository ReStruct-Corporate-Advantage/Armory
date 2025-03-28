import {ConfigInitializer} from '../../../initializers/config.initializer';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {ShowAsChartInput} from '@models/widget/inputs/show-as-chart-input.model';
import {ConfigTypeFactory, CoreWidgetConstants} from '@blk/explore-ui-core';

/**
 * ShowAsChartInput tests
 */
describe('ShowAsChartInput test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const showAsChartInput: ShowAsChartInput = new ShowAsChartInput();
        showAsChartInput.showAsChart = true;

        // Convert the object to string and then back to json again.
        const serializedData: any = showAsChartInput.serialize();

        const newShowAsChartInput: ShowAsChartInput = ConfigTypeFactory.createConfig(serializedData, ShowAsChartInput.configType, false);
        // Validate that the before and after are the same.
        expect(newShowAsChartInput.showAsChart).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const model1 = new ShowAsChartInput();
        const model2 = new ReturnSpriteletInput();
        expect(model1.equals(model2)).toBeFalsy();

        const model3 = new ShowAsChartInput();
        // Different pnlID
        model1.showAsChart = true;
        model3.showAsChart = false;
        expect(model1.equals(model3)).toBeFalsy();

        model1.showAsChart = false;
        expect(model1.equals(model3)).toBeTruthy();
    });

    it('Test getChartingLib', function () {
        const model1 = new ShowAsChartInput();
        expect(model1.getChartingLib()).toBe(CoreWidgetConstants.CHARTING_LIB.AG_GRID);
        model1.showAsChart = true;
        expect(model1.getChartingLib()).toBe(CoreWidgetConstants.CHARTING_LIB.HIGHCHART);
    });

    it('Test toggleChartingLib', function () {
        const model1 = new ShowAsChartInput();
        expect(model1.getChartingLib()).toBe(CoreWidgetConstants.CHARTING_LIB.AG_GRID);
        model1.toggleChartingLib();
        expect(model1.showAsChart).toBeTruthy();
        expect(model1.getChartingLib()).toBe(CoreWidgetConstants.CHARTING_LIB.HIGHCHART);
    });

    it('Test shouldSkipSerialize', () => {
        const model = new ShowAsChartInput();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});

