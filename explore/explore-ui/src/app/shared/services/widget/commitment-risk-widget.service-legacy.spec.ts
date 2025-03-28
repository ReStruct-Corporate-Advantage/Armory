import {DateValue, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet} from '@blk/explore-ui-column-option';
import statsColumnsLegacy from '@assets/widget-configs/commitment-risk-stats-columns-legacy.json';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {NotificationConstants} from '@constants/notification.constants';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {CommitmentRiskWidgetLegacyService} from '@services/widget/commitment-risk-widget-legacy.service';

describe('CommitmentRiskWidgetLegacyService Test', () => {
    let service: CommitmentRiskWidgetLegacyService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new CommitmentRiskWidgetLegacyService(exploreDataRequestService);
    });

    beforeEach((done) => {
        TestUtils.initialize(done);
    });

    it('tests validateInputs', () => {
        const widgetObj = new Widget(WidgetConfigType.COMMITMENT_RISK_LEGACY);
        const columnSet = new ColumnSet();
        widgetObj.dataStore.metaData.inputs.set('columns', columnSet);
        // portfolio inputs are not valid
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP'), new Report()).message).not.toEqual(NotificationConstants.PRIVATE_FUND_SELECTION_ERROR_MSG);
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP', DateValue.newDate('12/31/2021')), new Report()).message).toEqual(NotificationConstants.PRIVATE_FUND_SELECTION_ERROR_MSG);
        widgetObj.dataStore.metaData.inputs.set(WidgetInputType.FUND_CUSIP, new FundCusip('BRS123'));
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP', DateValue.newDate('12/31/2021')), new Report())).toBeNull();
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.COMMITMENT_RISK_LEGACY], 'N');
    });

    /**
     *
     */
    it('Test modifyWidgetInputsForRequest', () => {
        const widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, new Breakdown());
        service['modifyWidgetInputsForRequest'](widgetInputs, new Widget(WidgetConfigType.COMMITMENT_RISK_LEGACY));
        expect(widgetInputs.get(WidgetInputType.BREAKDOWN_TREE)).toBeUndefined();
        const columnSet = new ColumnSet(statsColumnsLegacy);
        expect(widgetInputs.get(WidgetInputType.COLUMNS)).toEqual(columnSet);
    });

    it('Test createWidgetRequestParams', () => {
        const widget = new Widget(WidgetConfigType.COMMITMENT_RISK_LEGACY);
        const widgetInputs = new Map<string, WidgetInput>();
        const portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
        const params = service['createWidgetRequestParams'](widget, {}, portfolio, widgetInputs);
        expect(params.isLegacyRequest).toBeTruthy();
    });

});
