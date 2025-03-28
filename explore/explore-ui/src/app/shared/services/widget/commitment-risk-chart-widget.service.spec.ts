import {ColumnSet} from '@blk/explore-ui-column-option';
import {AlertConstants, DateValue, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {CommitmentRiskChartWidgetService} from '@services/widget/commitment-risk-chart-widget.service';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';
import {CommitmentRiskScenario} from '@models/widget/inputs/commitment-risk/commitment-risk-scenario.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';

describe('CommitmentRiskChartWidgetService Test', () => {
    let service: CommitmentRiskChartWidgetService;
    let exploreDataRequestService: ExploreDataRequestService;

    let widget: Widget;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
    });

    beforeEach((done) => {
        TestUtils.initialize(done);

        WorkspaceStore.init();
        WorkspaceStore.currentReport$.next(new Report());

        widget = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART);
        service = new CommitmentRiskChartWidgetService(exploreDataRequestService);
    });

    it('validate service', () => {
        validateService(service, [WidgetConfigType.COMMITMENT_RISK_CHART], 'N');
    });

    /**
     * Tests createWidgetRequestParams for timeSeriesRequest flag
     */
    it('test createWidgetRequestParams', () => {
        const params = service['createWidgetRequestParams'](widget, {}, new Portfolio('PEP', DateValue.newDate('12/31/2021')), widget.dataStore.metaData.inputs, undefined, false);
        expect(params.timeSeriesRequest).toBeTruthy();
    });

    /**
     * Tests createWidgetRequestParams for timeSeriesRequest flag
     */
    it('test getWidgetSpecificData', () => {
        let seriesData = [{title: '30-Sep-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}
            , {title: '31-Dec-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}];
        let widgetData = service['getWidgetSpecificData'](seriesData, widget);
        expect(widgetData.seriesTitles).toEqual(['0.10000', '0.25000', '0.50000', '0.75000', '0.90000']);
        expect(widgetData.timeInterval).toEqual(3);
        seriesData = [{title: '30-Sep-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}
            , {title: '31-Oct-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}];
        widgetData = service['getWidgetSpecificData'](seriesData, widget);
        expect(widgetData.seriesTitles).toEqual(['0.10000', '0.25000', '0.50000', '0.75000', '0.90000']);
        expect(widgetData.timeInterval).toEqual(1);
        expect(service['getWidgetSpecificData'](undefined, widget)).toBeUndefined();
    });

    it('test getWidgetSpecificData - scenario', () => {
        const seriesData = [{title: '30-Sep-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}
            , {title: '31-Dec-2019', children: [{title: '0.10000'}, {title: '0.25000'}, {title: '0.50000'}, {title: '0.75000'}, {title: '0.90000'}]}];
        const scenario = new CommitmentRiskScenario();
        scenario.scenario = 'glob_eqmkt_down';
        widget.dataStore.metaData.inputs.set(WidgetInputType.COMMITMENT_RISK_SCENARIO, scenario);
        const widgetData = service['getWidgetSpecificData'](seriesData, widget);
        expect(widgetData.scenario).toEqual('Global Equity Market Down');
    });

    it('Test modifyWidgetInputsForRequest', () => {
        const columns = new ColumnSet();
        columns.createColumnAndAdd('acrm_proj_nav', 'acrm_proj_contrib', 'acrm_proj_dist', 'acrm_proj_net_cash');
        widget.dataStore.metaData.inputs.set(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS, columns);
        widget.dataStore.metaData.inputs.set(CommitmentHorizonSelectedTab.configType, new CommitmentHorizonSelectedTab({selectedTab: 'acrm_proj_nav'}));
        const widgetInputs = widget.getCombinedInputs();
        service['modifyWidgetInputsForRequest'](widgetInputs, widget, true);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns).toHaveLength(1);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].columnTag).toEqual('acrm_proj_nav');
    });

    it('should not support comparison mode', () => {
        const comparison = new ComparisonConfig();
        comparison.portComparisonList.push('PEP', 'PEP - what-if');
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(WorkspaceStore.getCurrentReport().comparisonConfigId, comparison);

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK_CHART), new Portfolio('PEP'), WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });

    it('should not support custom portfolio groups', () => {
        const customPortGroup = new Portfolio('SNP500,SNP100', DateValue.newDate('05/08/2024'));

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK_CHART), customPortGroup, WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.CUSTOM_PORTGROUP_NOT_SUPPORT.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });

    it('should not support what-if portfolios', () => {
        const whatIfPortfolio = new WhatIfPortfolio('PEP - What-if', DateValue.newDate('05/08/2024'));

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK_CHART), whatIfPortfolio, WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.WHAT_IF_PORTFOLIO_NOT_SUPPORTED.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });
});
