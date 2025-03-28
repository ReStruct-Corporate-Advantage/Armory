import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {SlopeGraphWidgetDataService} from '@services/widget/slope-graph-widget-data.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('SlopeGraphWidgetDataService Test', () => {
    let service: SlopeGraphWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new SlopeGraphWidgetDataService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.SLOPE_GRAPH], 'Y');
    });
});

