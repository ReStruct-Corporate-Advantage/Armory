import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {ExplorePivotTableComponent, LIST_CELL_RENDERER} from './explore-pivot-table.component';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {pivotResponse} from '@mocks/test-data/qbstr-test-data';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WIDGET_RIGHT_CLICK_HANDLER} from '../../../modules/widget/widget.injectable.tokens';
import {BaseRightClickHandler} from '../right-click-handler/base-right-click.handler';
import {RightClickHandlerRegistry} from '../right-click-handler/right-click-handler.registry';
import {AggregationKey, createQK, GroupByKey} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import {TestScheduler} from 'rxjs/testing';
import {of} from 'rxjs';
import {ListCellRenderer} from './list-cell-renderer';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';

describe('ExplorePivotTableComponent', () => {
    let component: ExplorePivotTableComponent;
    let fixture: ComponentFixture<ExplorePivotTableComponent>;
    let widgetPayload: WidgetPayload;
    let scheduler: TestScheduler;
    const jestMock = jest.fn();

    beforeAll((done) => {
        TestUtils.initialize(done);
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    formatter: {format: val => val},
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isHidden: false,
                    isSubtotalable: false,
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: val => val},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    formatter: {format: val => val},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isHidden: false,
                    isSubtotalable: false
                },
            ]
        };
        widgetPayload = {
            widgetConfigType: WidgetConfigType.PIVOT
        };
        widgetPayload.breakdownLevels = ['_ROOT_', 'level-1', 'level-2', 'level-3'];
        widgetPayload.requestConfig = request;
        widgetPayload.responseConfig = pivotResponse.data as any;
        widgetPayload.responseConfig.columns = ['cusip_0', 'security_description_1', 'pct_mv_1'];
        widgetPayload.cube = new SimpleCube([]);
        widgetPayload.cube.set(createQK([new GroupByKey(ROOT_LEVEL)]), [{'level-2': 'TEST-1'}]);
        widgetPayload.customVizConfig = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2'
        };
        scheduler = new TestScheduler((a, e) => {
            expect(a).toEqual(e);
        });
    });


    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExplorePivotTableComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: BaseRightClickHandler,
                    multi: true
                },
                {
                    provide: RightClickHandlerRegistry, useClass: RightClickHandlerRegistry
                }
            ]
        });

        fixture = TestBed.createComponent(ExplorePivotTableComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;
        component.cube = new SimpleCube([]);
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        // component.cube.set(createQK([new GroupByKey(ROOT_LEVEL)]), [{'level-2': 'TEST-1'}]);
        fixture.detectChanges();
        scheduler = new TestScheduler((a, e) => expect(a).toEqual(e));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onSortChanged callback test case', () => {
        const sortEvent = {
            api: {
                refreshServerSide: (params) => {},
                getColumnState: () => [
                    {colId: 'ag-Grid-AutoColumn', width: 149, hide: false, pinned: 'left', sort: 'asc'},
                    {colId: 'pct_mv', width: 101, hide: false, pinned: null, sort: 'desc'}
                ]
            }
        } as any;
        jest.spyOn(sortEvent.api, 'refreshServerSide');
        component['onSortChanged'](sortEvent);
        expect(component.widget.dataStore.metaData.inputs.has('sortedColumns')).toBeTruthy();
        expect(component.widget.dataStore.metaData.inputs.get('sortedColumns')).toEqual(new SortedColumns({
            sortedColumns: [
                new SortedColumn({colId: 'security_description_1', sort: 'asc'}),
                new SortedColumn({colId: 'pct_mv', sort: 'desc'})
            ]
        }));
        expect(sortEvent.api.refreshServerSide).toHaveBeenCalled();
    });

    it('setSortedColumns test case', () => {
        const param = {
            api: {
                getColumnState: jest.fn(() => {
                    return [
                        {colId: 'ag-Grid-AutoColumn', width: 149, hide: false, pinned: 'left', sort: null},
                        {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
                        {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
                        {colId: 'pct_mv', width: 101, hide: false, pinned: null, sort: null}
                    ];
                }),
                applyColumnState: jest.fn()
            }
        } as any;
        component.widget.dataStore.metaData.inputs.set('sortedColumns', {
            sortedColumns: [{
                colId: 'pct_mv',
                sort: 'desc'
            }, {colId: 'security_description_1', sort: 'asc'}]
        } as unknown as WidgetInput);
        component['setSortedColumns'](param);
        expect(param.api['applyColumnState']).toHaveBeenCalled();

        // make one field undefined
        component.widget.dataStore = undefined;
        expect(component['setSortedColumns'](param)).toBeUndefined();
    });


    it('should test group cell renderer', () => {
        const renderer: HTMLElement = component['pivotGroupCellRenderer']({value: 3} as any);
        expect(renderer.tagName).toEqual('DIV');
        expect(renderer.style['_values']).toEqual({width: '100%', height: '100%'});
        expect(renderer.innerHTML).toEqual('3');
    });

    it('should test list cell renderer list', () => {
        const listCellRenderer: ListCellRenderer = new ListCellRenderer();
        listCellRenderer.init({
            value: [{name: 'test', value: 3}],
            vizPivotColumnObject: {formatter: {format: val => val}}
        } as any);
        const renderer: HTMLElement = listCellRenderer.getGui();
        expect(renderer.tagName).toEqual('TABLE');
        expect(renderer.innerHTML).toEqual(`<tbody><tr><td style=\"text-align: left;\">${'test'}</td><td style=\"text-align: right;\">${3}</td></tr></tbody>`);
    });

    it('should test list cell renderer no lost', () => {
        const listCellRenderer: ListCellRenderer = new ListCellRenderer();
        listCellRenderer.init({
            value: 3,
            colDef: {field: 'test'},
            vizPivotColumnObject: {formatter: {format: val => val}}
        } as any);
        const renderer: HTMLElement = listCellRenderer.getGui();
        expect(renderer.tagName).toEqual('TABLE');
        expect(renderer.innerHTML).toEqual(`<tbody><tr><td style=\"text-align: right;\">${3}</td></tr></tbody>`);
    });

    it('should generate data for pivot table', () => {
        const colDefs = [
            {headerName: 'test-1 \\ test-2', field: 'level-1', cellRenderer: component['pivotGroupCellRenderer']},
            {field: 'val-1-total', pinned: 'right', cellRenderer: undefined},
            {field: 'val-2', cellRenderer: LIST_CELL_RENDERER}
        ];
        expect(component['generateDataForPivotTable'](colDefs)).toBeTruthy();
    });

    it('should generate flatDataForPivotTable', () => {
        component['vizPivotColumnMap'] = {
            num: {formatter: {format: val => val}}
        };
        component.cube['underlyingCube'].set(createQK([new GroupByKey('level-1')]), [{'level-1': 'test-1', num: 1, bgColorMap: {}}, {'level-1': 'test-2', num: 2, bgColorMap: {}}]);
        const res = component['flatDataForPivotTable']([
            [{
                'level-1': 'test-1',
                'level-2': 'test-1',
                'level-3': 'test-1',
                num: 1,
                bgColorMap: {}
            }],
            [{
                'level-1': 'test-2',
                'level-2': 'test-2',
                'level-3': 'test-2',
                num: 2,
                bgColorMap: {}
            }]], [new AggregationKey('num', 'accumulator')]);

        expect(res).toEqual([
            {'level-1': 'test-1', num: [{name: 'test-1', value: 1}], 'bgColorMap': {}},
            {'level-1': 'test-2', num: [{name: 'test-2', value: 2}], 'bgColorMap': {}}
        ]);
    });

    it('should generate flatDataForPivotTable benchmark', () => {
        component['vizPivotColumnMap'] = {
            'num-1|AU': {columnKey: 'testNum', formatter: {format: val => val}},
            'num-2|AU': {columnKey: 'testNum|BENCH', formatter: {format: val => val}},
            'num-3|AU': {columnKey: 'testNum|ACTIVE', formatter: {format: val => val}}
        } as any;
        component.cube['underlyingCube'].set(createQK([new GroupByKey('level-1')]), [{'level-1': 'test-1', num: 1}, {'level-1': 'test-2', num: 2}]);
        const res = component['flatDataForPivotTable']([[{
            'level-1': 'test-1',
            'level-2': 'test-1',
            'level-3': 'test-1',
            'num-1|AU': 1,
            'num-2|AU': 1,
            'num-3|AU': 1
        }]], [new AggregationKey('num-1|AU', 'bencActiveAgg')]);

        expect(res).toEqual([
            {
                'level-1': 'test-1',
                'num-1|AU': [
                    {
                        'name': 'Pf',
                        'value': 1,
                    },
                    {
                        'name': 'Bm',
                        'value': 1,
                    },
                    {
                        'name': 'Act',
                        'value': 1,
                    },
                ],
            },
        ]);
    });

    it('should generate flatDataForPivotTable total', () => {
        component['vizPivotColumnMap'] = {
            num: {formatter: {format: val => val}}
        };
        component.cube.set(createQK([new GroupByKey('level-1')]), [{'level-1': 'test-1', num: 3}]);
        const res = component['flatDataForPivotTable']([[{
            'level-1': 'test-1',
            'level-2': 'test-1',
            'level-3': 'test-1',
            num: 1
        }]], [new AggregationKey('num', 'totalAgg')]);

        expect(res).toEqual([{'level-1': 'test-1', num: 3}]);
    });

    it('should prepare pivotColumns no col defs', () => {
        const colDefs = [];
        component['customVizConfig'] = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2'
        };
        const res = component['preparePivotColumns'](colDefs);
        expect(res).toEqual([
            {headerName: 'test-1 \\ test-2', field: 'level-1', cellRenderer: component['pivotGroupCellRenderer']}
        ]);
    });

    it('should prepare pivotColumns', () => {
        component['requestConfig'].splitColumns = [{
            'val-1-total': {
                columnKey: 'val-1',
                formatter: (val) => val
            },
            'val-2': {
                columnKey: 'val-1',
                formatter: (val) => val
            }
        }] as any[];
        const colDefs = [{
            headerName: 'VALS',
            children: [
                {
                    field: 'val-1-total'
                },
                {
                    field: 'val-2'
                }]
        }];
        component['customVizConfig'] = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2'
        };
        const res = component['preparePivotColumns'](colDefs);
        for (const item of res) {
            if (item.cellStyle) {
                item.cellStyle = jestMock;
            }
        }
        expect(res).toEqual([
            {headerName: 'test-1 \\ test-2', field: 'level-1', cellRenderer: component['pivotGroupCellRenderer']},
            {field: 'val-1-total', pinned: 'right', cellRenderer: undefined, cellRendererParams: undefined, cellStyle: jestMock},
            {field: 'val-2', cellRenderer: LIST_CELL_RENDERER, 'cellRendererParams': {vizPivotColumnObject: undefined}, cellStyle: jestMock}
        ]);
    });

    it('should prepare pivotColumns active bench', () => {
        component['customVizConfig'] = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2',
            portBenchActiveEnabled: true
        };
        component['requestConfig'].splitColumns = [{
            'val-1-total': {
                columnKey: 'val-1',
                formatter: (val) => val
            },
            'val-2': {
                columnKey: 'val-1',
                formatter: (val) => val
            }
        }] as any[];
        const colDefs = [{
            headerName: 'VALS',
            children: [
                {
                    field: 'val-1-total'
                },
                {
                    field: 'val-2'
                }]
        }];
        component['customVizConfig'] = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2'
        };
        const res = component['preparePivotColumns'](colDefs);
        for (const item of res) {
            if (item.cellStyle) {
                item.cellStyle = jestMock;
            }
        }
        expect(res).toEqual([
            {headerName: 'test-1 \\ test-2', field: 'level-1', cellRenderer: component['pivotGroupCellRenderer']},
            {field: 'val-1-total', pinned: 'right', cellRenderer: undefined, cellRendererParams: undefined, cellStyle: jestMock},
            {field: 'val-2', cellRenderer: LIST_CELL_RENDERER, 'cellRendererParams': {vizPivotColumnObject: undefined}, cellStyle: jestMock}
        ]);
    });

    it('should test cgrid config #1', () => {
        component['rightClickHandler'] = {} as any;
        widgetPayload.customVizConfig = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2',
            cellBreakdown: 'test-3'

        };
        component['generateColumnDefinitions'] = jest.fn();
        component['preparePivotColumns'] = jest.fn();
        component['generateDataForPivotTable'] = jest.fn(() => of([]));

        component['prepareGridConfig'](widgetPayload);

        expect(component['preparePivotColumns']).toHaveBeenCalled();
        expect(component['generateDataForPivotTable']).toHaveBeenCalled();
    });

    it('should test cgrid config #2', () => {
        component['rightClickHandler'] = {} as any;
        widgetPayload.customVizConfig = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2'
        };
        component['generateColumnDefinitions'] = jest.fn();
        component['preparePivotColumns'] = jest.fn();
        component['generateDataForPivotTable'] = jest.fn(() => of([]));

        component['prepareGridConfig'](widgetPayload);

        expect(component['preparePivotColumns']).toHaveBeenCalled();
        expect(component['generateDataForPivotTable']).toHaveBeenCalled();
    });

    it('should test cgrid config #3', () => {
        component['rightClickHandler'] = {} as any;
        widgetPayload.customVizConfig = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2',
            portBenchActiveEnabled: true
        };
        component['generateColumnDefinitions'] = jest.fn();
        component['preparePivotColumns'] = jest.fn();
        component['generateDataForPivotTable'] = jest.fn(() => of([]));

        component['prepareGridConfig'](widgetPayload);

        expect(component['preparePivotColumns']).toHaveBeenCalled();
        expect(component['generateDataForPivotTable']).toHaveBeenCalled();
    });

    it('should getRowHeight', () => {
        const params = {
            node: {
                data: {a: 'a', val: [1], val2: [1, 2]}
            }
        } as any;
        const result = component['getRowHeight'](params);
        // 2 rows + 1 row spacer + cell padding
        expect(result).toEqual(46);
    });

    it('should get bench or active #1', () => {
        expect(component.getBenchOrActive({columnKey: 'port'} as any)).toEqual('Pf');
    });

    it('should get bench or active #2', () => {
        expect(component.getBenchOrActive({columnKey: 'port|ACTIVE'} as any)).toEqual('Act');
    });

    it('should get bench or active #3', () => {
        expect(component.getBenchOrActive({columnKey: 'port|BENCH'} as any)).toEqual('Bm');
    });

    it('should generate generateDataForPivotTable bench', () => {
        component['customVizConfig'] = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2',
            portBenchActiveEnabled: true
        };

        component['vizPivotColumnMap'] = {
            'num-1|AU': {columnKey: 'testNum', formatter: {format: val => val}},
            'num-2|AU': {columnKey: 'testNum|BENCH', formatter: {format: val => val}},
            'num-3|AU': {columnKey: 'testNum|ACTIVE', formatter: {format: val => val}}
        } as any;
        const data = [{
            'level-1': 'test-1',
            'level-2': 'test-1',
            'level-3': 'test-1',
            'num-1|AU': 1,
            'num-2|AU': 1,
            'num-3|AU': 1
        }];
        component.cube.set(createQK([new GroupByKey('level-1')]), data);
        component.cube.set(createQK([new GroupByKey('level-2')]), data);
        const colDefs = [{field: 'first'}, {field: 'num-1|AU'}, {field: 'num-2|AU'}, {field: 'num-3|AU'}];

        scheduler.run(() => {
            expect(component['generateDataForPivotTable'](colDefs)).toEqual([
                {
                    'level-1': 'test-1',
                    'num-1|AU': [
                        {
                            'name': 'Pf',
                            'value': 1,
                        },
                        {
                            'name': 'Bm',
                            'value': 1,
                        },
                        {
                            'name': 'Act',
                            'value': 1,
                        },
                    ],
                    'num-2|AU': [
                        {
                            'name': 'Pf',
                            'value': 1,
                        },
                        {
                            'name': 'Bm',
                            'value': 1,
                        },
                        {
                            'name': 'Act',
                            'value': 1,
                        },
                    ],
                    'num-3|AU': [
                        {
                            'name': 'Pf',
                            'value': 1,
                        },
                        {
                            'name': 'Bm',
                            'value': 1,
                        },
                        {
                            'name': 'Act',
                            'value': 1,
                        },
                    ],
                },
            ]);
        });
    });

    it('should generate generateDataForPivotTable 2 ', () => {
        component['customVizConfig'] = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2',
            cellBreakdown: 'test-3',

        };
        component['vizPivotColumnMap'] = {
            'num-1|AU': {columnKey: 'testNum', formatter: {format: val => val}},
            'num-2|AU': {columnKey: 'testNum|BENCH', formatter: {format: val => val}},
            'num-3|AU': {columnKey: 'testNum|ACTIVE', formatter: {format: val => val}}
        } as any;
        const data = [{
            'level-1': 'test-1',
            'level-2': 'test-1',
            'level-3': 'test-1',
            'num-1|AU': 1,
            'num-2|AU': 1,
            'num-3|AU': 1
        }];
        component.cube.set(createQK([new GroupByKey('level-1')]), data);
        component.cube.set(createQK([new GroupByKey('level-2')]), data);
        const colDefs = [{field: 'first'}, {field: 'num-1|AU'}, {field: 'num-2|AU'}, {field: 'num-3|AU'}];

        scheduler.run(() => {
            expect(component['generateDataForPivotTable'](colDefs)).toEqual([
                {
                    'level-1': 'test-1',
                    'num-1|AU': [
                        {
                            'name': 'test-1',
                            'value': 1,
                        },
                    ],
                    'num-2|AU': [
                        {
                            'name': 'test-1',
                            'value': 1,
                        },
                    ],
                    'num-3|AU': [
                        {
                            'name': 'test-1',
                            'value': 1,
                        },
                    ],
                },
            ]);
        });
    });

    it('should check grid ready', () => {
        scheduler.run(() => {
            component['setSortedColumns'] = jest.fn();
            expect(component['gridReady']({api: {gridPanel: {eAllCellContainers: {forEach: jest.fn()}}, setColumnDefs: jest.fn()}, columnApi: {autoSizeColumn: jest.fn()}}));
        });
    });

    it('should prepare pivotColumns different header names', () => {
        const colDefs = [];
        component['customVizConfig'] = {
            rowBreakdown: '<test-1>',
            columnBreakdown: '<test-2>'
        };
        expect(component['preparePivotColumns'](colDefs)).toEqual([
            {headerName: '&lt' + 'test-1' + '&gt \\ &lt' + 'test-2' + '&gt', field: 'level-1', cellRenderer: component['pivotGroupCellRenderer']}
        ]);

        component['customVizConfig'] = {
            rowBreakdown: '<test-1>',
            columnBreakdown: 'test-2'
        };
        expect(component['preparePivotColumns'](colDefs)).toEqual([
            {headerName: '&lt' + 'test-1' + '&gt \\ ' + 'test-2', field: 'level-1', cellRenderer: component['pivotGroupCellRenderer']}
        ]);

        component['customVizConfig'] = {
            rowBreakdown: 'test-1',
            columnBreakdown: '<test-2>'
        };
        expect(component['preparePivotColumns'](colDefs)).toEqual([
            {headerName: 'test-1' + ' \\ &lt' + 'test-2' + '&gt', field: 'level-1', cellRenderer: component['pivotGroupCellRenderer']}
        ]);

        component['customVizConfig'] = {
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-2'
        };
        expect(component['preparePivotColumns'](colDefs)).toEqual([
            {headerName: 'test-1 \\ test-2', field: 'level-1', cellRenderer: component['pivotGroupCellRenderer']}
        ]);
    });

    describe('data$ subscription Test', () => {
        let params;
        const data = [
            {
                'pct_notional_val_0|Total': 1.2584234365216476,
                'pct_notional_val_0|AU': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': 0.17219952867571336
                    },
                    {
                        'name': 'MARGIN',
                        'value': 3.190003611824434e-7
                    }
                ],
                'pct_notional_val_0|CN': [
                    {
                        'name': 'None',
                        'value': 0.0014615343938707117
                    }
                ],
                'pct_notional_val_0|EU': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': -0.024955467777852448
                    },
                    {
                        'name': 'None',
                        'value': 0.024945051879694036
                    }
                ],
                'pct_notional_val_0|GB': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': 0.00009463228567276527
                    },
                    {
                        'name': 'None',
                        'value': -0.00009463228567276528
                    }
                ],
                'pct_notional_val_0|HK': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': 0.22594613440866085
                    },
                    {
                        'name': 'None',
                        'value': -0.22594753612934576
                    }
                ],
                'pct_notional_val_0|ID': [],
                'pct_notional_val_0|IN': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': 0.000008729921355814247
                    }
                ],
                'pct_notional_val_0|JP': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': 0.6131713322278144
                    }
                ],
                'pct_notional_val_0|KR': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': 0.1093345740708388
                    }
                ],
                'pct_notional_val_0|PH': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': -0.05566463983960507
                    }
                ],
                'pct_notional_val_0|TH': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': 0.0005983547114444968
                    }
                ],
                'pct_notional_val_0|TW': [],
                'pct_notional_val_0|US': [
                    {
                        'name': 'CASH & EQUIVALEN',
                        'value': 0.2158273490322589
                    },
                    {
                        'name': 'None',
                        'value': 0.20149817194643838
                    }
                ],
                'level-1': 'CASH',
                'bgColorMap': {}
            },
            {
                'pct_notional_val_0|Total': 1.8055791687080838,
                'pct_notional_val_0|AU': [],
                'pct_notional_val_0|CN': [],
                'pct_notional_val_0|EU': [],
                'pct_notional_val_0|GB': [],
                'pct_notional_val_0|HK': [],
                'pct_notional_val_0|ID': [],
                'pct_notional_val_0|IN': [],
                'pct_notional_val_0|JP': [],
                'pct_notional_val_0|KR': [],
                'pct_notional_val_0|PH': [],
                'pct_notional_val_0|TH': [],
                'pct_notional_val_0|TW': [],
                'pct_notional_val_0|US': [
                    {
                        'name': 'MLMILFUS',
                        'value': 1.8055791687080838
                    }
                ],
                'level-1': 'FUND',
                'bgColorMap': {}
            }
        ];
        beforeEach(() => {
            component.cube = new SimpleCube([]);
            component['colDefs'][1] = {
                'colTag': 'pct_notional_val',
                'field': 'pct_notional_val_0|Total',
                'headerTooltip': 'Total Notional Market Value %',
                'aggFunc': 'sum',
                'hide': false,
                'type': 'auxNumberColumn',
                'filter': 'agNumberColumnFilter',
                'filterParams': {
                    'suppressAndOrCondition': true
                },
                'width': 54,
                'pinned': 'right'
            };
            params = {
                api: {
                    gridPanel: {
                        eAllCellContainers: [{addEventListener: jest.fn()}]
                    },
                    setRowData: jest.fn(),
                    autoSizeColumns: jest.fn(),
                    getColumns: jest.fn()
                }
            };
            jest.spyOn<any>(component, 'setBottomPinnedDataTotalRow');
        });
        it('should check the widget is NOT from favorite, and call autoSizeColumn', fakeAsync(() => {
            component['setSortedColumns'] = jest.fn();
            component['gridReady'](params as any);

            tick();

            expect(component['setBottomPinnedDataTotalRow']).not.toHaveBeenCalled();
            expect(params.api.autoSizeColumns).toHaveBeenCalled();
        }));
    });

    describe('onColumnResized Test', () => {
        it('should trigger columnResized$', () => {
            jest.spyOn(component['columnResized$'], 'next');

            const event = new Event('ColumnResizedEvent');
            component.config['onColumnResized'](event as any);

            expect(component['columnResized$'].next).toHaveBeenCalled();
        });
    });

    describe('updateColumnState Test', () => {
        it('should set columnState in displayInputs', () => {
            component['columnState'].columns = [];
            const event = {
                api: {
                    getColumnState: () => [
                        {
                            'colId': 'level-1',
                            'hide': false,
                            'aggFunc': null,
                            'width': 122,
                            'pivotIndex': null,
                            'pinned': null,
                            'rowGroupIndex': null
                        },
                        {
                            'colId': 'pct_notional_val_0|Total',
                            'hide': false,
                            'aggFunc': 'sum',
                            'width': 54,
                            'pivotIndex': null,
                            'pinned': 'right',
                            'rowGroupIndex': null
                        }
                    ]
                }
            };

            component['updateColumnState'](event as any);

            const colState = component.widget.getColumnState();
            expect(colState.columns[0].width).toBe(122);
            expect(colState.columns[0].pinned).toBeNull();
            expect(colState.columns[1].width).toBe(54);
            expect(colState.columns[1].pinned).toBe('right');
        });
    });
});
