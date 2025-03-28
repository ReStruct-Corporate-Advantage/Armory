import {ConfigInitializer} from '../../../initializers/config.initializer';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';

/**
 * PortfolioOverrideInput tests
 */
describe('PortfolioOverrideInput test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const portfolioOverrideInput: PortfolioOverrideInput = new PortfolioOverrideInput();
        // Convert the object to string and then back to json again.
        let serializedData: any = portfolioOverrideInput.serialize();
        expect(serializedData).not.toBeDefined();
        portfolioOverrideInput.portfolio = 'PEP';
        portfolioOverrideInput.updateBenchAndCurrency = false;
        serializedData = portfolioOverrideInput.serialize();
        expect(Object.keys(serializedData).length).toBe(1);

        portfolioOverrideInput.updateBenchAndCurrency = true;
        serializedData = portfolioOverrideInput.serialize();
        expect(Object.keys(serializedData).length).toBe(2);

        const newPortfolioOverrideInput: PortfolioOverrideInput = ConfigTypeFactory.createConfig(serializedData, PortfolioOverrideInput.configType, false);
        // Validate that the before and after are the same.
        expect(newPortfolioOverrideInput.portfolio).toBe('PEP');
        expect(newPortfolioOverrideInput.updateBenchAndCurrency).toBeTruthy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const model1: PortfolioOverrideInput = new PortfolioOverrideInput();
        const model2: PortfolioOverrideInput = new PortfolioOverrideInput();
        expect(model1.equals(model2)).toBeTruthy();

        // Different portfolio
        model1.portfolio = 'PEP';
        model2.portfolio = 'IP';
        expect(model1.equals(model2)).toBeFalsy();

        // Different portfolio
        model2.portfolio = 'PEP';
        model2.updateBenchAndCurrency = true;
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same now
        model1.updateBenchAndCurrency  = true;
        expect(model1.equals(model2)).toBeTruthy();
    });

    /**
     * Test case for addRequestParams
     */
    it('Test addRequestParams', function() {
        const portfolioOverrideInput: PortfolioOverrideInput = new PortfolioOverrideInput();
        const requestParams: any = {};
        portfolioOverrideInput.addRequestParams(requestParams);
        expect(Object.keys(requestParams).length).toBe(0);

        portfolioOverrideInput.portfolio = 'PEP';
        portfolioOverrideInput.addRequestParams(requestParams);
        expect(Object.keys(requestParams).length).toBe(2);
        expect(requestParams.portfolio).toBe(portfolioOverrideInput.portfolio);
        expect(requestParams.portfolioIdentifier).toBe(portfolioOverrideInput.portfolio);
    });

    /**
     * Test case for getModifiedWidgetTitleDetails
     */
    it('Test getModifiedWidgetTitleDetails', function() {
        const portfolioOverrideInput: PortfolioOverrideInput = new PortfolioOverrideInput();
        let details = portfolioOverrideInput.getModifiedWidgetTitleDetails(null);
        expect(details).toBe('');
        portfolioOverrideInput.portfolio = 'PEP';
        details = portfolioOverrideInput.getModifiedWidgetTitleDetails(null);
        expect(details).toBe('PEP');
    });

    it('Test shouldSkipSerialize', () => {
        const model = new PortfolioOverrideInput();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});

