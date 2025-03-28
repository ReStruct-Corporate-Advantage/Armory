import {TestBed} from '@angular/core/testing';

import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {NOTIFICATION_SERVICE_TOKEN, PortGroupSummaryChartLevel, PortGroupSummaryChartType, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {RowNode} from 'ag-grid-community';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {PgsTsLeafChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-ts-leaf-chart-spritelet.launcher.service';

describe('PgsTsLeafChartSpriteletLauncherService', () => {
    let service: PgsTsLeafChartSpriteletLauncherService;

    let parentWidget: Widget;
    let parentColumnSet: ColumnSet;
    let spriteletColumnEvent;

    let notificationServiceMock;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());

        notificationServiceMock = {
            error: jest.fn(),
            warning: jest.fn()
        };
        TestBed.configureTestingModule({
            providers: [
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock}
            ]
        });
        service = TestBed.inject(PgsTsLeafChartSpriteletLauncherService);

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
        node.parent = node1;
        node1.parent = node2;
        node.__hasChildren = false;
        node1.__hasChildren = true;
        node2.__hasChildren = true;
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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(TabularWidgetConstants.PGS_TS_LEAF_CHART_SPRITELET.ACTION_KEY.toString());
    });

    it('should launch a pgs ts chart from a column and specific cell', () => {
        service.launchSpritelet(parentWidget, spriteletColumnEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.PGS_TS);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toBeFalsy();
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeUndefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnKey).toBe('nav_group_0');
    });

    it('should track telemetry when chart launched', () => {
        jest.spyOn(service, 'chartType');
        jest.spyOn(service, 'chartLevel');
        service.launchSpritelet(parentWidget, spriteletColumnEvent);
        expect(service.chartType).toReturnWith(PortGroupSummaryChartType.PORT_GROUP_SUMMARY_CHART_TYPE_TIME_SERIES);
        expect(service.chartLevel).toReturnWith(PortGroupSummaryChartLevel.PORT_GROUP_SUMMARY_CHART_LEVEL_INDIVIDUAL_PORTFOLIOS);
    });
});
