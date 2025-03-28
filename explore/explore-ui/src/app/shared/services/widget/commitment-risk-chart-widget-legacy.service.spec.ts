import {ColumnSet} from '@blk/explore-ui-column-option';
import {DateValue, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {NotificationConstants} from '@constants/notification.constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';
import {CommitmentRiskChartWidgetLegacyService} from '@services/widget/commitment-risk-chart-widget-legacy.service';

describe('CommitmentRiskChartWidgetLegacyService Test', () => {
    let service: CommitmentRiskChartWidgetLegacyService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new CommitmentRiskChartWidgetLegacyService(exploreDataRequestService);
    });

    beforeEach((done) => {
        TestUtils.initialize(done);
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY], 'N');
    });

    it('tests validateInputs', () => {
        const widgetObj = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY);
        const columnSet = new ColumnSet();
        widgetObj.dataStore.metaData.inputs.set('columns', columnSet);
        // portfolio inputs are not valid
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP'), new Report()).message).not.toEqual(NotificationConstants.PRIVATE_FUND_SELECTION_ERROR_MSG);
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP', DateValue.newDate('12/31/2021')), new Report()).message).toEqual(NotificationConstants.PRIVATE_FUND_SELECTION_ERROR_MSG);
        widgetObj.dataStore.metaData.inputs.set(WidgetInputType.FUND_CUSIP, new FundCusip('BRS123'));
        expect(service['validateInputs'](widgetObj, new Portfolio('PEP', DateValue.newDate('12/31/2021')), new Report())).toBeNull();
    });

    /**
     * Tests createWidgetRequestParams for timeSeriesRequest flag
     */
    it('test createWidgetRequestParams', () => {
        const widgetObj = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY);
        const params = service['createWidgetRequestParams'](widgetObj, {}, new Portfolio('PEP', DateValue.newDate('12/31/2021')), widgetObj.dataStore.metaData.inputs, undefined, false);
        expect(params.timeSeriesRequest).toBeTruthy();
        expect(params.isLegacyRequest).toBeTruthy();
    });

    /**
     * Tests createWidgetRequestParams for timeSeriesRequest flag
     */
    it('test getWidgetSpecificData', () => {
        let seriesData = [{title: '30-Sep-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}
            , {title: '31-Dec-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}];
        let widgetData = service['getWidgetSpecificData'](seriesData);
        expect(widgetData.seriesTitles).toEqual(['0.10000', '0.25000', '0.50000', '0.75000', '0.90000']);
        expect(widgetData.timeInterval).toEqual(3);
        seriesData = [{title: '30-Sep-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}
            , {title: '31-Oct-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}];
        widgetData = service['getWidgetSpecificData'](seriesData);
        expect(widgetData.seriesTitles).toEqual(['0.10000', '0.25000', '0.50000', '0.75000', '0.90000']);
        expect(widgetData.timeInterval).toEqual(1);
        expect(service['getWidgetSpecificData'](undefined)).toBeUndefined();
    });

    it('Test modifyWidgetInputsForRequest', () => {
       const chartWidget = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY);
       chartWidget.dataStore.metaData.inputs.set(CommitmentHorizonSelectedTab.configType, new CommitmentHorizonSelectedTab({selectedTab: 'market_val'}));
       const widgetInputs = chartWidget.getCombinedInputs();
       service['modifyWidgetInputsForRequest'](widgetInputs, chartWidget, true);
       expect(chartWidget.getCombinedInputs().get(WidgetInputType.COLUMNS)).not.toBe(widgetInputs.get(WidgetInputType.COLUMNS));
       expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns.length).toEqual(1);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].columnTag).toEqual('market_val');
    });

});
