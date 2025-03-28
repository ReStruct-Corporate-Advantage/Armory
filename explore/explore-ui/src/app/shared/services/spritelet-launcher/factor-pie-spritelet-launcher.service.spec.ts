import {TestBed} from '@angular/core/testing';

import {FactorPieSpriteletLauncherService} from './factor-pie-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('FactorPieSpriteletLauncherService', () => {
    let service: FactorPieSpriteletLauncherService;

    let widget: Widget;
    let spriteletColumnEvent;
    let spriteletRowEvent;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());

        TestBed.configureTestingModule({});
        service = TestBed.inject(FactorPieSpriteletLauncherService);

        widget = new Widget(WidgetConfigType.PRA);

        const metaData = new WidgetDataStoreMetaData();
        const columnSet = new ColumnSet({
            columns: [
                {
                    columnKey: 'rfv_ftitle',
                    columnTag: 'rfv_ftitle',
                    columnTitle: ' Title',
                    displayWidth: undefined,
                    optionValues: [],
                    positionColumnType: 'ALL'
                }, {
                    columnKey: 'rfv_exp_port_35',
                    columnTag: 'rfv_exp_port',
                    columnTitle: 'Factor Exposure',
                    displayWidth: undefined,
                    optionValues: [],
                    positionColumnType: 'PORT'
                }, {
                    columnKey: 'rfv_exp_bench_756',
                    columnTag: 'rfv_exp_bench',
                    columnTitle: 'Benchmark Factor Exposure',
                    displayWidth: undefined,
                    optionValues: [],
                    positionColumnType: 'BENCH'
                }
            ]
        });
        metaData.inputs.set('columns', columnSet);

        const dataStore = new WidgetDataStore();
        dataStore.metaData = metaData;
        dataStore.data = {
            widgetConfigType: WidgetConfigType.PRA
        };
        widget.dataStore = dataStore;

        spriteletColumnEvent = {
            params: {
                column: {
                    getColId: () => 'rfv_exp_port_35'
                },
                defaultItems: ['pinSubMenu', 'separator', 'autoSizeThis', 'autoSizeAll', 'separator', 'separator', 'resetColumns']
            }
        };

        spriteletRowEvent = {
            params: {
                column: {
                    getColId: () => 'ag-Grid-AutoColumn'
                },
                node: {
                    field: 'level-1',
                    key: 'STYLE',
                    level: 1,
                    group: true,
                    parent: {
                        field: '_ROOT_',
                        key: 'PEP',
                        level: 0,
                        group: true
                    }
                }
            }
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART.toString());
    });

    it('should launch a factor pie chart from a column', () => {
        service.launchSpritelet(widget, spriteletColumnEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);

        expect(widgetResult.dataStore.isDependentOnParentForData).toBe(true);

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnKey).toBe('rfv_exp_port_35');
    });

    it('should launch a factor pie chart from a column with date Override', () => {
        spriteletColumnEvent.params.column = {
            getColId: () => 'rfv_exp_port_35|11/08/2019'
        };
        service.launchSpritelet(widget, spriteletColumnEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);

        expect(widgetResult.dataStore.isDependentOnParentForData).toBe(true);
        expect(widgetResult.dataStore.data.customVizConfig['selectedColumnKey']).toBe('rfv_exp_port_35|11/08/2019');
        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnKey).toBe('rfv_exp_port_35');
    });

    it('should launch a factor pie chart from a row', () => {
        service.launchSpritelet(widget, spriteletRowEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);

        expect(widgetResult.dataStore.isDependentOnParentForData).toBe(true);

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnKey).toBe('rfv_exp_bench_756');
    });
});
