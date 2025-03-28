import {
    AlertConstants,
    ColumnConstants,
    DateValue,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {CommitmentRiskWidgetService} from '@services/widget/commitment-risk-widget.service';
import {
    ColumnSet,
    HorizonYearColumnOption,
    NumericColumnFormatColumnOption,
    NumericDataFormatter,
    StringDataFormatter
} from '@blk/explore-ui-column-option';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {Report} from '@models/workspace/report.model';

describe('CommitmentRiskWidgetService Test', () => {
    let service: CommitmentRiskWidgetService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
    });

    beforeEach((done) => {
        TestUtils.initialize(done);

        WorkspaceStore.init();
        WorkspaceStore.currentReport$.next(new Report());

        service = new CommitmentRiskWidgetService(exploreDataRequestService);
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.COMMITMENT_RISK], 'N');
    });

    it('Test modifyWidgetInputsForRequest - portfolio view', () => {
        const widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS, new ColumnSet());
        widgetInputs.set(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS, new ColumnSet());

        service['modifyWidgetInputsForRequest'](widgetInputs, new Widget(WidgetConfigType.COMMITMENT_RISK));

        expect(widgetInputs.has(WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS)).toEqual(false);
        expect(widgetInputs.has(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS)).toEqual(false);
        const columnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        expect(columnSet.columns).toHaveLength(1);
        expect(columnSet.columns[0].columnTag).toEqual(ColumnConstants.SEC_DESC);
    });

    it('Test modifyWidgetInputsForRequest - fund view', () => {
        const widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS, new ColumnSet());
        widgetInputs.set(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS, new ColumnSet());
        const fundCusip = new FundCusip();
        fundCusip.cusip = 'ABCDE123';
        widgetInputs.set(WidgetInputType.FUND_CUSIP, fundCusip);

        service['modifyWidgetInputsForRequest'](widgetInputs, new Widget(WidgetConfigType.COMMITMENT_RISK));

        expect(widgetInputs.has(WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS)).toEqual(false);
        expect(widgetInputs.has(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS)).toEqual(false);
        const columnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        expect(columnSet.columns).toHaveLength(1);
        expect(columnSet.columns[0].columnTag).toEqual(ColumnConstants.PERCENTILES);
    });

    it('Test addToRequestParamFromWidgetInputConfig - hidden columns', () => {
        const widget = new Widget(WidgetConfigType.COMMITMENT_RISK);
        const requestParams = {
            columns: []
        };

        service['addToRequestParamFromWidgetInputConfig'](widget.widgetConfigInputs, WidgetInputType.COLUMNS, requestParams, undefined);

        expect(requestParams.columns).toHaveLength(1);
        expect(requestParams.columns[0].columnTag).toEqual(ColumnConstants.PERCENTILES);
        expect(requestParams.columns[0].visible).toEqual(false);
    });

    it('should use TreeCube for commitment risk table', () => {
        const columns: VizualizationColumnConfig[] = [
            {
                columnKey: 'percentiles',
                columnTag: 'percentiles',
                columnTitle: 'Percentiles',
                originalColumnTitle: 'Percentiles',
                dataType: 'STRING',
                formatter: new StringDataFormatter(),
                isSubtotalable: false,
                isHidden: false
            },
            {
                columnKey: 'sec_desc',
                columnTag: 'sec_desc',
                columnTitle: 'Description',
                originalColumnTitle: 'Description',
                dataType: 'STRING',
                formatter: new StringDataFormatter(),
                isSubtotalable: false,
                isHidden: false
            },
            {
                columnKey: 'acrm_hrzn_dpi',
                columnTag: 'acrm_hrzn_dpi',
                columnTitle: 'DPI',
                originalColumnTitle: 'DPI',
                dataType: 'STRING',
                formatter: new NumericDataFormatter(null, [new NumericColumnFormatColumnOption({decimalPlaces: 2, scaling: 1, useThousandsSeparator: true})]),
                horizonOptions: new HorizonYearColumnOption({horizonList: [5]}),
                numericColumnFormatColumnOption: new NumericColumnFormatColumnOption({decimalPlaces: 2, scaling: 1, useThousandsSeparator: true}),
                isSubtotalable: false,
                isHidden: false
            } as any
        ];
        const requestAdapterConfig = {
            columnFilters: {
                'acrm_hrzn_dpi|5 Year': {filterType: 'number', type: 'lessThan', filter: 2}
            },
            columns,
            isCompareMode: false,
            portfolio: 'SPE7US-C',
            splitColumns: columns
        } as any;

        const response = {
            data: {
                columnHeaderDetails: {
                    columnKeyToDisplayNameMap: {sec_desc: 'Description', percentiles: 'Percentiles', acrm_hrzn_dpi: 'DPI'},
                    columnKeyToTagMap: {sec_desc: 'sec_desc', percentiles: 'percentiles', acrm_hrzn_dpi: 'acrm_hrzn_dpi'}
                },
                columns: ['percentiles', 'sec_desc', 'acrm_hrzn_dpi|5 Year'],
                data: {data: [null, null, null]}
            }
        };

        const treeCube = service['createCube'](requestAdapterConfig, response);
        expect(treeCube.cube instanceof TreeCube).toBeTruthy();
        expect((treeCube.cube as TreeCube)['columnFormatters']['acrm_hrzn_dpi|5 Year'] instanceof NumericDataFormatter).toBeTruthy();
    });

    it('should not support comparison mode', () => {
        const comparison = new ComparisonConfig();
        comparison.portComparisonList.push('PEP', 'PEP - what-if');
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(WorkspaceStore.getCurrentReport().comparisonConfigId, comparison);

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK), new Portfolio('PEP'), WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });

    it('should not support custom portfolio groups', () => {
        const customPortGroup = new Portfolio('SNP500,SNP100', DateValue.newDate('05/08/2024'));

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK), customPortGroup, WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.CUSTOM_PORTGROUP_NOT_SUPPORT.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });

    it('should not support what-if portfolios', () => {
        const whatIfPortfolio = new WhatIfPortfolio('PEP - What-if', DateValue.newDate('05/08/2024'));

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK), whatIfPortfolio, WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.WHAT_IF_PORTFOLIO_NOT_SUPPORTED.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });
});
