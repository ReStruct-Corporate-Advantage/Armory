import {AlertConstants, ColumnConstants, DateValue, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {
    ColumnSet,
    NumericColumnFormatColumnOption,
    NumericDataFormatter,
    StringDataFormatter
} from '@blk/explore-ui-column-option';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {Report} from '@models/workspace/report.model';
import {CommitmentRiskExcludedFundsWidgetService} from '@services/widget/commitment-risk-excluded-funds-widget.service';

describe('CommitmentRiskExcludedFundsWidgetService Test', () => {
    let service: CommitmentRiskExcludedFundsWidgetService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
    });

    beforeEach((done) => {
        TestUtils.initialize(done);

        WorkspaceStore.init();
        WorkspaceStore.currentReport$.next(new Report());

        service = new CommitmentRiskExcludedFundsWidgetService(exploreDataRequestService);
    });

    it('validate service', () => {
        validateService(service, [WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS], 'N');
    });

    it('should add "Has Supported APACS Asset Type" column for export request', () => {
        const widget = new Widget(WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS);
        const widgetInputs = widget.getCombinedInputs();

        service['modifyWidgetInputsForRequest'](widgetInputs, widget, true);

        const columnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        expect(columnSet.columns).toHaveLength(1);
        expect(columnSet.columns[0].columnTag).toEqual(ColumnConstants.ACRM_SUPPORTED_APACS_ASSET_TYPE);
    });

    it('should not add "Has Supported APACS Asset Type" column for non-export request', () => {
        const widget = new Widget(WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS);
        const widgetInputs = widget.getCombinedInputs();

        service['modifyWidgetInputsForRequest'](widgetInputs, widget, false);

        const columnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        expect(columnSet.columns).toHaveLength(0);
    });

    it('should use TreeCube for commitment risk table', () => {
        const columns: VizualizationColumnConfig[] = [
            {
                columnKey: 'acrm_ex_sec_desc',
                columnTag: 'acrm_ex_sec_desc',
                columnTitle: 'Security Description',
                originalColumnTitle: 'Security Description',
                dataType: 'STRING',
                formatter: new StringDataFormatter(),
                isSubtotalable: false,
                isHidden: false
            },
            {
                columnKey: 'acrm_ex_cusip',
                columnTag: 'acrm_ex_cusip',
                columnTitle: 'Cusip',
                originalColumnTitle: 'Cusip',
                dataType: 'STRING',
                formatter: new StringDataFormatter(),
                isSubtotalable: false,
                isHidden: false
            },
            {
                columnKey: 'acrm_ex_mv',
                columnTag: 'acrm_ex_mv',
                columnTitle: 'Market Value',
                originalColumnTitle: 'Market Value',
                dataType: 'STRING',
                formatter: new NumericDataFormatter(null, [new NumericColumnFormatColumnOption({decimalPlaces: 2, scaling: 1, useThousandsSeparator: true})]),
                numericColumnFormatColumnOption: new NumericColumnFormatColumnOption({decimalPlaces: 2, scaling: 1, useThousandsSeparator: true}),
                isSubtotalable: false,
                isHidden: false
            } as any
        ];
        const requestAdapterConfig = {
            columnFilters: {
                'acrm_ex_mv': {filterType: 'number', type: 'lessThan', filter: 2}
            },
            columns,
            isCompareMode: false,
            portfolio: 'SPE7US-C',
            splitColumns: columns
        } as any;

        const response = {
            data: {
                columnHeaderDetails: {
                    columnKeyToDisplayNameMap: {acrm_ex_sec_desc: 'Security Description', acrm_ex_cusip: 'Cusip', acrm_ex_mv: 'Market Value'},
                    columnKeyToTagMap: {acrm_ex_sec_desc: 'acrm_ex_sec_desc', acrm_ex_cusip: 'acrm_ex_cusip', acrm_ex_mv: 'acrm_ex_mv'}
                },
                columns: ['acrm_ex_sec_desc', 'acrm_ex_cusip', 'acrm_ex_mv'],
                data: {data: [null, null, null]}
            }
        };

        const treeCube = service['createCube'](requestAdapterConfig, response);
        expect(treeCube.cube instanceof TreeCube).toBeTruthy();
        expect((treeCube.cube as TreeCube)['columnFormatters']['acrm_ex_mv'] instanceof NumericDataFormatter).toBeTruthy();
    });

    it('should not support comparison mode', () => {
        const comparison = new ComparisonConfig();
        comparison.portComparisonList.push('PEP', 'PEP - what-if');
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(WorkspaceStore.getCurrentReport().comparisonConfigId, comparison);

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS), new Portfolio('PEP'), WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });

    it('should not support custom portfolio groups', () => {
        const customPortGroup = new Portfolio('SNP500,SNP100', DateValue.newDate('05/08/2024'));

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS), customPortGroup, WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.CUSTOM_PORTGROUP_NOT_SUPPORT.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });

    it('should not support what-if portfolios', () => {
        const whatIfPortfolio = new WhatIfPortfolio('PEP - What-if', DateValue.newDate('05/08/2024'));

        const notification = service['validateInputs'](new Widget(WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS), whatIfPortfolio, WorkspaceStore.getCurrentReport());

        expect(notification.message).toEqual(AlertConstants.NOTIFICATION.WHAT_IF_PORTFOLIO_NOT_SUPPORTED.COMMITMENT_RISK);
        expect(notification.notificationStyle).toEqual(AlertConstants.NOTIFICATION_STYLE.ERROR);
    });
});
