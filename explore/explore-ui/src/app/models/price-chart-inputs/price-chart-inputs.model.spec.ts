import {PriceChartInputs} from './price-chart-inputs.model';
import {TestUtils} from '@utils/test.utils';

/**
 * Test cases for PriceChartInputs model
 */
describe('PriceChartInputs', () => {

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Test set data
     */
    it('set cusip and label', () => {
        const priceChartInputs = new PriceChartInputs('cusip', 'label');
        expect(priceChartInputs.cusip).toBe('cusip');
        expect(priceChartInputs.label).toBe('label');
    });
});
