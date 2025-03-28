/**
 * Test cases for NumericColumnFormat model class
 */
import {NumericColumnFormat} from './numeric-column-format.model';

describe('NumericColumnFormat', () => {
    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const format: any = {'scalingOptions': {'Thousands (m)': 1000, 'Millions (mm)': 1000000, 'None': 1, 'Billions (mmm)': 1000000000},
            'scalable': true, 'scalingFactor': 1, 'useThousandsSeparator': true, 'decimalPlaces': 0, 'configType': NumericColumnFormat.CONFIG_TYPE};
        const colFormat = new NumericColumnFormat();
        const data: any = colFormat.deserialize(format);
        expect(colFormat.isScalable).toBe(true);
        expect(colFormat.scalingFactor).toBe(1);
        expect(colFormat.isUseThousandsSeparator).toBe(true);
        expect(colFormat.decimalPlaces).toBe(0);
        expect(colFormat.scalingOptions.size).toBe(4);
        expect(colFormat.scalingOptions.get('Thousands (m)')).toBe(1000);
        expect(colFormat.scalingOptions.get('Millions (mm)')).toBe(1000000);
        expect(colFormat.scalingOptions.get('None')).toBe(1);
        expect(colFormat.scalingOptions.get('Billions (mmm)')).toBe(1000000000);
    });
});
