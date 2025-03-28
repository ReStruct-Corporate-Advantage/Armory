import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {ColumnConfig,CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';
import {OptimizationConstants} from '@constants/optimization.constants';
import {isEqual} from 'lodash';

/**
 * Test cases for StressScenarioPortfolioObjective.ts
 */
describe('Alpha Score Portfolio Objective tests', () => {

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });
    /**
     * Test case for method save
     */
    it('Test serialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const alphaScorePortfolioObjective = new AlphaScorePortfolioObjective({
            key: OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
            weight: 0.5,
            alphaScoreMeasure: new ColumnConfig({columnTitle: 'x', columnTag: 'x'}),
        });

        expect(
            alphaScorePortfolioObjective.serialize()
        ).toEqual({
            weight: 0.5,
            enabled: true,
            isUploadAlpha: false,
            key: OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
            alphaScoreMeasure: {'columnTag': 'x','title': undefined},
            type: 'ALPHA_SCORE',
        });

        alphaScorePortfolioObjective.isUploadAlpha = true;
        alphaScorePortfolioObjective.uploadedAlpha.set('cusipA', 2.0);
        expect(
            alphaScorePortfolioObjective.serialize()
        ).toEqual({
            weight: 0.5,
            enabled: true,
            key: OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
            type: 'ALPHA_SCORE',
            isUploadAlpha: true
        });

        alphaScorePortfolioObjective.isUploadAlpha = true;
        alphaScorePortfolioObjective.uploadedAlpha.clear();
        expect(
            alphaScorePortfolioObjective.serialize()
        ).toEqual({
            weight: 0.5,
            enabled: true,
            key: OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
            type: 'ALPHA_SCORE',
            isUploadAlpha: true
        });
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', () => {
        const portfolioObjective = new AlphaScorePortfolioObjective({
            weight: 0.5,
            enabled: false,
            key: OptimizationConstants.MAXIMIZE_ALPHA_SCORE,
            type: OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
            alphaScoreMeasure: {'columnTag': 'x'}
        });

        expect(portfolioObjective.key).toEqual(OptimizationConstants.MAXIMIZE_ALPHA_SCORE);
        expect(portfolioObjective.weight).toEqual(0.5);
        expect(portfolioObjective.enabled).toEqual(false);
        expect(portfolioObjective.alphaScoreMeasure).toEqual({'columnTag': 'x', 'optionValues': []});
    });

    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const data: any = {
            weight: 0.5,
            enabled: false,
            key: OptimizationConstants.MAXIMIZE_ALPHA_SCORE,
            type: OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
            alphaScoreMeasure: {'columnTag': 'x'}
        };
        const portfolioObjective1 = new AlphaScorePortfolioObjective();
        portfolioObjective1.deserialize(data);

        const portfolioObjective2 = new AlphaScorePortfolioObjective();
        portfolioObjective2.deserialize(data);

        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(true);

        // Unequal keys
        portfolioObjective2.key = 'abc';
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Unequal weight
        portfolioObjective2.key = 'MINIMIZE_RISK';
        portfolioObjective2.weight = 1.0;
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Unequal enabled
        portfolioObjective2.weight = 0.5;
        portfolioObjective2.enabled = true;
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Unequal alpha score
        portfolioObjective2.enabled = false;
        portfolioObjective2.alphaScoreMeasure = new ColumnConfig({columnTitle: 'x', columnTag: 'x'});
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        // Upload Alpha Equals

        const uploadedAlpha: any = {
            weight: 0.5,
            enabled: false,
            key: OptimizationConstants.MAXIMIZE_ALPHA_SCORE,
            type: OptimizationConstants.ALPHA_SCORE_PORTFOLIO_OBJECTIVE,
        };
        portfolioObjective1.deserialize(uploadedAlpha);
        portfolioObjective2.deserialize(uploadedAlpha);
        portfolioObjective1.uploadedAlpha.set('abc', 2.0).set('xyz', 3.0);
        portfolioObjective1.isUploadAlpha = true;
        portfolioObjective2.uploadedAlpha.set('abc', 2.0).set('xyz', 3.0);
        portfolioObjective2.isUploadAlpha = true;

        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(true);

        portfolioObjective1.uploadedAlpha.delete('abc');
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);

        portfolioObjective2.uploadedAlpha.delete('abc');
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(true);

        portfolioObjective1.isUploadAlpha = false;
        expect(portfolioObjective1.equals(portfolioObjective2)).toBe(false);
    });

    it('Test getUploadedRequestObject', () => {
        const portfolioObjective1 = new AlphaScorePortfolioObjective();
        portfolioObjective1.uploadedAlpha.set('abc', 2.0).set('xyz', 3.0);
        const uploadedAlphaObject = portfolioObjective1.getUploadedRequestObject();
        const expectAlphaObject = {
            'abc': 2.0,
            'xyz': 3.0
        };
        expect(isEqual(uploadedAlphaObject, expectAlphaObject)).toBe(true);
    });

    it('tests isValid', () => {
        const portfolioObjective1 = new AlphaScorePortfolioObjective();
        expect(portfolioObjective1.isValid()).toBeFalsy();

        portfolioObjective1.key = 'A';
        expect(portfolioObjective1.isValid()).toBeFalsy();

        portfolioObjective1.uploadedAlpha.set('abc', 2.0).set('xyz', 3.0);
        expect(portfolioObjective1.isValid()).toBeFalsy();

        portfolioObjective1.uploadedAlpha.clear();
        portfolioObjective1.alphaScoreMeasure = new ColumnConfig();
        expect(portfolioObjective1.isValid()).toBeTruthy();
    });
});
