import {TestBed} from '@angular/core/testing';

import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {ColumnConfig, ColumnConstants, ColumnDefinition, CoreColumnUtils, NOTIFICATION_SERVICE_TOKEN, PortGroupSummaryChartLevel, PortGroupSummaryChartType, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet, FactorSettingsColumnOption} from '@blk/explore-ui-column-option';
import {PgsBarChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-bar-chart-spritelet-launcher.service';
import {RowNode} from 'ag-grid-community';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {Breakdown, ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';

describe('PgsBarChartSpriteletLauncherService', () => {
    let service: PgsBarChartSpriteletLauncherService;

    let parentWidget: Widget;
    let parentColumnSet: ColumnSet;
    let spriteletColumnEvent;
    let spriteletColumnEvent2;
    let spriteletRowEvent;

    let notificationServiceMock;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());

        notificationServiceMock = {
            error: jest.fn()
        };
        TestBed.configureTestingModule({
            providers: [
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock}
            ]
        });
        service = TestBed.inject(PgsBarChartSpriteletLauncherService);

        parentWidget = new Widget(WidgetConfigType.PGS);
        parentColumnSet = new ColumnSet({
            columns: [
                {
                    columnKey: 'portfolio',
                    columnTag: 'portfolio',
                    columnTitle: 'Portfolio',
                    optionValues: [],
                    positionColumnType: 'ALL'
                }, {
                    columnKey: 'nav_group_0',
                    columnTag: 'nav_group',
                    columnTitle: 'NAV',
                    optionValues: [],
                    positionColumnType: 'PORT'
                }, {
                    columnKey: 'pct_nav_group_1',
                    columnTag: 'pct_nav_group',
                    columnTitle: 'Port Group NAV %',
                    optionValues: [],
                    positionColumnType: 'PORT'
                }, {
                    columnKey: 'benchmark',
                    columnTag: 'benchmark',
                    columnTitle: 'Benchmark',
                    optionValues: [],
                    positionColumnType: 'PORT'
                }
            ]
        });
        parentWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, parentColumnSet);

        const node = new RowNode();
        node.field = 'level-2';
        node.key = 'RUB-R-AUD';
        node.level = 2;
        node.group = true;
        node.data = {
            'rowId': 172,
            'bgColorMap': {},
            'nav_group_0': 97400.32916294973,
            'pct_nav_group_1': 0.9119433675840956,
            '_ROOT_': 'RUBICONAGA',
            'level-1': 'RUB-RO',
            'level-2': 'RUB-R'
        };

        const node1 = new RowNode();
        node1.field = 'level-1';
        node1.key = 'RUB-RO';
        node1.level = 1;
        node1.group = true;
        node1.data = {
            'rowId': 171,
            'bgColorMap': {},
            'nav_group_0': 97400.32916294973,
            'pct_nav_group_1': 0.9119433675840956,
            '_ROOT_': 'RUBICONAGA',
            'level-1': 'RUB-RO'
        };

        const node2 = new RowNode();
        node2.field = 'level-0';
        node2.key = 'RUBICONAGA';
        node2.level = 0;
        node2.group = true;
        node2.data = {
            'rowId': 1,
            'bgColorMap': {},
            'nav_group_0': 10680523.88176044,
            'pct_nav_group_1': 100,
            '_ROOT_': 'RUBICONAGA'
        };

        const node3 = new RowNode();
        node3.field = '_ROOT_';
        node3.key = 'BGO';
        node3.level = 0;
        node3.group = false;
        node3.data = {
            'rowId': 171,
            'bgColorMap': {},
            'nav_group_0': 97400.32916294973,
            'pct_nav_group_1': 0.9119433675840956,
            '_ROOT_': 'BGO'
        };

        node.parent = node1;
        node1.parent = node2;
        node.__hasChildren = false;
        node1.__hasChildren = true;
        node2.__hasChildren = true;
        node3.__hasChildren = false;
        spriteletColumnEvent = {
            params: {
                column: {
                    getColId: () => 'nav_group_0',
                    getColDef: jest.fn(() => ({colTag: 'nav_group_0'}))
                },
                defaultItems: ['pinSubMenu', 'separator', 'autoSizeThis', 'autoSizeAll', 'separator', 'separator', 'resetColumns'],
                node,
                api: {
                    getDisplayedRowAtIndex: () => ({
                        data: {
                            'rowId': 172,
                            'bgColorMap': {},
                            'nav_group_0': 97400.32916294973,
                            'pct_nav_group_1': 0.9119433675840956,
                            '_ROOT_': 'RUBICONAGA',
                            'level-1': 'RUB-RO',
                            'level-2': 'RUB-R'
                        }
                    })
                }
            }
        };
        spriteletColumnEvent2 = {
            params: {
                column: {
                    getColId: () => 'nav_group_0',
                    getColDef: jest.fn(() => ({colTag: 'nav_group_0'}))
                },
                defaultItems: ['pinSubMenu', 'separator', 'autoSizeThis', 'autoSizeAll', 'separator', 'separator', 'resetColumns'],
                node: node3,
                api: {
                    getDisplayedRowAtIndex: () => ({
                        data: {
                            'rowId': 172,
                            'bgColorMap': {},
                            'nav_group_0': 97400.32916294973,
                            'pct_nav_group_1': 0.9119433675840956,
                            '_ROOT_': 'BGO'
                        }
                    })
                }
            }
        };
        spriteletRowEvent = {
            params: {
                column: {
                    getColId: () => 'ag-Grid-AutoColumn',
                    getColDef: () => ({field: 'portfolio'})
                },
                node
            }
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(TabularWidgetConstants.PGS_BAR_CHART_SPRITELET.ACTION_KEY.toString());
    });

    it('should launch a pgs bar chart from a column and specific cell for a portfolio', () => {
        service.launchSpritelet(parentWidget, spriteletColumnEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.PGS_BAR);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toBeFalsy();
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeUndefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(2);
        expect(metaDataColumns[1].columnKey).toBe('nav_group_0');
        expect(widgetResult.pgsChartInputs.portHierarchy.split(('->')).length).toBe(3);

        service.launchSpritelet(parentWidget, spriteletColumnEvent2);
        const newWidget = WorkspaceStore.getCurrentReport().widgets[1];
        expect(newWidget.pgsChartInputs.portHierarchy.split(('->')).length).toBe(1);
        expect(newWidget.pgsChartInputs.portHierarchy.split(('->'))[0]).toStrictEqual('BGO|');
    });

    it('should launch a pgs bar chart from a row', () => {
        service.launchSpritelet(parentWidget, spriteletRowEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.PGS_BAR);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toBeFalsy();
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeUndefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(3);
        expect(metaDataColumns[0].columnKey).toBe('portfolio');
    });

    it('should launch a pgs bar chart from with column level breakdowns', () => {
        let metaDataColumns = (parentWidget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        const breakdownOption = new ColumnBreakdown();
        breakdownOption.breakdown = Breakdown.getDefaultBreakdown();
        breakdownOption.breakdown.id = 171819;
        metaDataColumns.forEach(col => col.optionValues.push(breakdownOption));
        service.launchSpritelet(parentWidget, spriteletRowEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.PGS_BAR);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toBeFalsy();
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeUndefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.slice(1, metaDataColumns.length).every(col => col.optionValues.length === 1)).toBeTruthy();
        expect(metaDataColumns.length).toBe(3);
        expect(metaDataColumns[0].columnKey).toBe('portfolio');

        metaDataColumns = (parentWidget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        metaDataColumns[1].optionValues = [];
        service.launchSpritelet(parentWidget, spriteletRowEvent);
        expect(WorkspaceStore.getCurrentReport().widgets.length).toBe(1);
    });

    it('should launch a pgs bar chart from a column and specific cell', () => {
        spriteletRowEvent.params.node.data.portfolio = 'RUBICONAGA';
        service.launchSpritelet(parentWidget, spriteletRowEvent);
        let widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.PGS_BAR);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toBeFalsy();
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeUndefined();
        expect(widgetResult.dataStore.data.customVizConfig.queryKeys.length).toEqual(4);
        expect(widgetResult.dataStore.data.customVizConfig.groupBys.length).toEqual(1);

        spriteletRowEvent.params.node.level = 0;
        service.launchSpritelet(parentWidget, spriteletRowEvent);
        widgetResult = WorkspaceStore.getCurrentReport().widgets[1];
        expect(widgetResult.dataStore.data.customVizConfig.queryKeys.length).toEqual(2);
        expect(widgetResult.dataStore.data.customVizConfig.groupBys.length).toEqual(0);
    });

    it('should track telemetry when chart launched', () => {
        jest.spyOn(service, 'chartType');
        jest.spyOn(service, 'chartLevel');
        service.launchSpritelet(parentWidget, spriteletColumnEvent);
        expect(service.chartType).toReturnWith(PortGroupSummaryChartType.PORT_GROUP_SUMMARY_CHART_TYPE_BAR);
        expect(service.chartLevel).toReturnWith(PortGroupSummaryChartLevel.PORT_GROUP_SUMMARY_CHART_LEVEL_AT_THIS_LEVEL);
    });

    it('should show an error notification when launching a bar chart from a diversification column', () => {
        const portfolioColumn: ColumnConfig = ColumnConfig.createColumn('portfolio', 'ALL', 'portfolio');
        const diversificationColumn: ColumnConfig = ColumnConfig.createColumn('diversification_score_pg_rk', 'PORT', 'diversification_score_pg_rk');
        diversificationColumn.optionValues.push(new FactorSettingsColumnOption());

        const colSet = new ColumnSet();
        colSet.columns.push(
            portfolioColumn,
            diversificationColumn
        );

        jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockImplementation((_colTag: string) => {
            const definition = new ColumnDefinition();
            definition.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
            return definition;
        });

        parentWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, colSet);

        const node1 = new RowNode();
        node1.data = {
            'diversification_score_pg_rk|1st Risk Driver|Beta': 0.9158456223460026,
            'diversification_score_pg_rk|1st Risk Driver|Factor': 'FMI_EMEA_MARKET',
            'diversification_score_pg_rk|Diversification Score': 0.07160896670369132,
            'diversification_score_pg_rk|Diversification Score - Systematic': 0.07115861953651292,
            'nav_group_0': 4789703.041762633,
            'pct_nav_group_1': 100,
            '_ROOT_': 'E_TEA'
        };
        node1.__hasChildren = false;
        const event = {
            params: {
                column: {
                    getColDef: () => ({ colTag: 'diversification_score_pg_rk' }),
                    getColId: () => 'diversification_score_pg_rk'
                },
                node: node1
            }
        };

        service.launchSpritelet(parentWidget, event as unknown as SpriteletEvent);
        expect(notificationServiceMock.error).toHaveBeenCalledTimes(1);
    });
});
