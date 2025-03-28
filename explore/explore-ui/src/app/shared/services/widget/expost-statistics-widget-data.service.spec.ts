import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {ExpostStatisticsWidgetDataService} from '@services/widget/expost-statistics-widget-data.service';
import {Widget} from '@models/widget/widget.model';
import {ExpostStatsRequestAdapterConfig, isExpostStatsConfig, RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('ExpostStatisticsWidgetDataService test', () => {
    let service: ExpostStatisticsWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new ExpostStatisticsWidgetDataService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    /**
     * @see validateService
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.EXPOST_STATS], undefined);
    });

    it('test createRequestConfig', () => {
        const widget = new Widget(WidgetConfigType.EXPOST_STATS);
        const response: ExploreResponse = {
            data: {
                columns : ['sec_desc', 'PortfolioExpostStats_1 Month_1 Year_false_false', 'BenchExpostStats_1 Month_1 Year_false_false', 'AciveExpostStats_1 Month_1 Year_false_false'],
                data: null
            }
        };
        const request = {
            portfolio: 'PEP'
        };

        const requestConfig: RequestAdapterConfig = service['createRequestConfig'](widget.getCombinedInputs(), widget, response, request);
        expect(isExpostStatsConfig(requestConfig)).toBeTruthy();
        expect(requestConfig.portfolio).toBe('PEP');
        expect(requestConfig.columns.length).toBe(4);
        expect((requestConfig as ExpostStatsRequestAdapterConfig).columnFormatters.size).toBe(21);
    });
});

