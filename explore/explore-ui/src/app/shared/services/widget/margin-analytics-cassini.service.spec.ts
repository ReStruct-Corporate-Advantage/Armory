import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {
    AlertConstants,
    ColumnConfig,
    ColumnConstants,
    CommonUtils, CoreDefinitionStore, DateValue, TokenConstants,
    UseType,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {MarginAnalyticsCassiniService} from '@services/widget/margin-analytics-cassini.service';
import {ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';
import {MarginAnalyticsCassiniSettings} from '@models/widget/inputs/margin-analytics-cassini-settings.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {Widget} from '@models/widget/widget.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';

describe('MarketAnalyticsCassiniService Test', () => {
    let service: MarginAnalyticsCassiniService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
    });

    beforeEach((done) => {
        TestUtils.initialize(done);

        WorkspaceStore.init();
        WorkspaceStore.currentReport$.next(new Report());
        service = new MarginAnalyticsCassiniService(exploreDataRequestService);
    });

    it('validate service', () => {
        validateService(service, [WidgetConfigType.CASSINI_MARGIN_ANALYTICS], 'N');
    });

    it('test the modifyInputs', () => {
        const originalColumns = new ColumnSet();
        const inputs = new Map<string, WidgetInput>();
        service['modifyWidgetInputsForRequest'](inputs, null);
        // nothing changes
        expect(inputs.size).toBe(0);
        inputs.set(WidgetInputType.COLUMNS, originalColumns);
        originalColumns.columns.push(ColumnConfig.createColumn(ColumnConstants.SECURITY_DESCRIPTION, UseType.ALL, ColumnConstants.SECURITY_DESCRIPTION + '_' + CommonUtils.generateUniqueIdAsString()));
        inputs.set(MarginAnalyticsCassiniSettings.MARGIN_ANALYTICS_CASSINI_SETTING_CONFIG_TYPE, new MarginAnalyticsCassiniSettings({groupingStyle: 'Trade_Level'}));
        service['modifyWidgetInputsForRequest'](inputs, null);
        expect((originalColumns.columns[0].optionValues[0] as CustomTitleColumnOption).customTitle).toEqual('Trade Level');
    });

    it('should not support comparison mode', () => {
        const comparison = new ComparisonConfig();
        comparison.portComparisonList.push('PEP', 'PEP - what-if');
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(WorkspaceStore.getCurrentReport().comparisonConfigId, comparison);

        const notification = service['validateInputs'](new Widget(WidgetConfigType.CASSINI_MARGIN_ANALYTICS), new Portfolio('PEP'), WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.MARGIN_ANALYTICS);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });

    it('should not support custom scratch portfolios', () => {
        const adhocPortfolio = new AdhocPortfolio('Custom Port', DateValue.newDate('12/31/2021'));

        const notification = service['validateInputs'](new Widget(WidgetConfigType.CASSINI_MARGIN_ANALYTICS), adhocPortfolio, WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.CUSTOM_PORTGROUP_NOT_SUPPORT.MARGIN_ANALYTICS);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });

    it('should not support what-if portfolios', () => {
        const whatIfPortfolio = new WhatIfPortfolio('PEP - What-if', DateValue.newDate('12/31/2021'));

        const notification = service['validateInputs'](new Widget(WidgetConfigType.CASSINI_MARGIN_ANALYTICS), whatIfPortfolio, WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.WHAT_IF_PORTFOLIO_NOT_SUPPORTED.MARGIN_ANALYTICS);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });
});

