import {Widget} from '../../../models/widget/widget.model';
import {Report} from '../../../models/workspace/report.model';
import {DataRequestConstants} from '../../../constants';
import {beforAllDataServiceTest, runValidateInputsAndCheckItFailsOnComparisonMode, validateService} from './functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {AbstractExpostWidgetDataService} from '@services/widget/abstract-expost-widget-data.service';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {DateValue, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';

describe('AbstractExpostWidgetDataService Test', () => {
    let service: AbstractExpostWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;
    let report: Report;
    let widget: Widget;
    let portfolio: Portfolio;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();

        // Dummy service implementation
        service = new class extends AbstractExpostWidgetDataService {

            // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
            protected modifyWidgetInputsForRequest(_widgetInputs: Map<string, WidgetInput>): void {
                // Empty
            }

        }(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.EXPOST_RETURNS], WidgetDataViewOption.HOLDINGS_VIEW);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);

        report = new Report();
        widget = new Widget();
        portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2016'}));
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.EXPOST_RETURNS], 'N');
    });

    /**
     *
     */
    it('validateInputs - invalid scenario - comparison report', () => {
        runValidateInputsAndCheckItFailsOnComparisonMode(service);
    });

    /**
     *
     */
    it('validateInputs - invalid scenario - portfolio is a custom port group', () => {
        portfolio.portName = 'ILB,PEP';
        const notification = service['validateInputs'](widget, portfolio, report);
        expect(notification).not.toBeNull();
    });

    /**
     *
     */
    it('validateInputs - valid scenario', () => {
        const notification = service['validateInputs'](widget, portfolio, report);
        expect(notification).toBeNull();
    });
});

