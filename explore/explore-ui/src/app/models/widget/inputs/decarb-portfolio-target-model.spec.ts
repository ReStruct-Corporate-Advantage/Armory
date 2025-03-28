import {ConfigInitializer} from '../../../initializers/config.initializer';
import {DecarbPortfolioTarget} from '@models/widget/inputs/decarb-portfolio-target-model.ts';

describe('Decarb portfolio target test case', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });
    const portfolioTargetsData = {
        label:'Portfolio 1',
        reductionPercent:20,
        startYear:'2018',
        targetYear:'2050'
    }

    it('Test constructor and deserialize method', () => {
        const portfolioTargets = new DecarbPortfolioTarget();
        jest.spyOn(portfolioTargets, 'deserialize');
        expect(portfolioTargets.deserialize).not.toHaveBeenCalled();

        const portfolioTargetsWithData = new DecarbPortfolioTarget(portfolioTargetsData);
        expect(portfolioTargetsWithData.label).toEqual('Portfolio 1');
        expect(portfolioTargetsWithData.reductionPercent).toEqual(20);
        expect(portfolioTargetsWithData.startYear).toEqual('2018');
        expect(portfolioTargetsWithData.targetYear).toEqual('2050');
    });

    /**
     * Test case for method equals
     */
    it('Test equals', () => {
        const portfolioTargets = new DecarbPortfolioTarget(portfolioTargetsData);
        const portfolioTargetsWithoutData= new DecarbPortfolioTarget();
        expect(portfolioTargets.equals(portfolioTargetsWithoutData)).toBeFalsy();

        const portfolioTargets2 = new DecarbPortfolioTarget({...portfolioTargetsData, showDeleteButton: true});
        expect(portfolioTargets2.equals(portfolioTargets)).toBeTruthy();
    });

    it('Test Serialize', () => {
        const portfolioTargets = new DecarbPortfolioTarget();
        const portfolioTargetsWithData = new DecarbPortfolioTarget(portfolioTargetsData);
        expect(portfolioTargets.serialize()).toBeUndefined();
        expect(portfolioTargetsWithData.serialize()).toEqual(portfolioTargetsData);
    });
});
