import {PublishStateItem} from './publish-state-item.model';
import {PublishStateConstants} from '../../constants/publish-state.constants';

/**
 * Test class for the publish state controller
 */
describe('Publish state model tests', function () {
    let model: PublishStateItem;

    /**
     * Functions to test the methods
     */
    it('Should return the correct published date', function () {

        // test if it returns the correct value for unpublished
        expect(new PublishStateItem('PEP', 0, '2020-04-01T05:40:52.000Z').publishDate).toBe(PublishStateConstants.NOT_APPLICABLE);

        // test if it returns the correct value for published
        model = new PublishStateItem('PEP', -1, '2020-04-01T05:40:52.000Z');
        expect(model.publishDate).not.toBe('Invalid date');
    });

    it('Should correctly determine if its published or not', function () {

        // test if it returns the correct value for unpublished
        model = new PublishStateItem('PEP', 0, '2020-04-01T05:40:52.000Z');
        expect(model.isUnpublished()).toBeTruthy();

        // test if it returns the correct value for published
        model = new PublishStateItem('PEP', -1, '2020-04-01T05:40:52.000Z');
        expect(model.isUnpublished()).toBeFalsy();
    });

    it('Should return correct publish state', function () {

        // test if it returns the correct value for unpublished
        model = new PublishStateItem('PEP', 0, '2020-04-01T05:40:52.000Z');
        expect(model.publishState).toBe(PublishStateConstants.PRELIM_RISK);

        // test if it returns the correct value for unlocked published
        model = new PublishStateItem('PEP', -1, '2020-04-01T05:40:52.000Z');
        expect(model.publishState).toBe(PublishStateConstants.RISK_RELEASED);

        // test if it returns the correct value for pre published
        model = new PublishStateItem('PEP', -2, '2020-04-01T05:40:52.000Z');
        expect(model.publishState).toBe(PublishStateConstants.PRELIM_RISK);

        // test if it returns the correct value for locked published
        model = new PublishStateItem('PEP', 1, '2020-04-01T05:40:52.000Z');
        expect(model.publishState).toBe(PublishStateConstants.RISK_RELEASED);

        // test if it returns unknown for unknown publish state value
        model = new PublishStateItem('PEP', 10, '2020-04-01T05:40:52.000Z');
        expect(model.publishState).toBe(PublishStateConstants.UNKNOWN);
    });

    it('Should return correct ticker', function () {
        model = new PublishStateItem('PEP', -1, '2020-04-01T05:40:52.000Z');
        expect(model.portfolioName).toBe('PEP');
    });
});
