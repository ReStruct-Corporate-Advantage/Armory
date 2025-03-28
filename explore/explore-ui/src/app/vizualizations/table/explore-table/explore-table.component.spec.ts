import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {SecurityBasedWidgetRightClickHandler} from '../right-click-handler/security-based-widget-right-click.handler';

import {ExploreTableComponent} from './explore-table.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {TestUtils} from '@utils/test.utils';
import {WIDGET_RIGHT_CLICK_HANDLER} from '../../../modules/widget/widget.injectable.tokens';
import {BaseRightClickHandler} from '../right-click-handler/base-right-click.handler';
import {RightClickHandlerRegistry} from '../right-click-handler/right-click-handler.registry';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {ROOT_LEVEL} from '@utils/qbstr';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import * as tableUtils from '../../../vizualizations/table/table.utils';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {ColumnState, TableColumnState, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CommonConstants} from '@constants/common.constants';
import {CollapsedColumns} from '@models/widget/inputs/collapsed-columns.model';
import {RangeSelectionChangedEvent} from 'ag-grid-community';

describe('ExploreTableComponent', () => {
    let component: ExploreTableComponent;
    let fixture: ComponentFixture<ExploreTableComponent>;
    let widgetPayload: WidgetPayload;

    const flatWorkpad1 = new FlatWorkpad();
    const reportGroup1 = new ReportGroup();

    beforeAll((done) => {
        WorkspaceStore.init();
        WorkspaceStore.getWorkspace().workpads = [flatWorkpad1, reportGroup1];
        TestUtils.initialize(done);
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true
                }
            ]
        };
        widgetPayload = {
            widgetConfigType: WidgetConfigType.RISK_EXPOSURE,
            breakdownLevels: [],
            requestConfig: request,
            responseConfig: data1.data as any
        };
    });


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ExploreTableComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: BaseRightClickHandler,
                    multi: true
                },
                {
                    provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: SecurityBasedWidgetRightClickHandler,
                    multi: true
                },
                {
                    provide: RightClickHandlerRegistry, useClass: RightClickHandlerRegistry
                }
            ]
        });

        fixture = TestBed.createComponent(ExploreTableComponent);
        component = fixture.componentInstance;
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        component.widgetPayload = widgetPayload;
        fixture.detectChanges();
    });

    afterEach(() => {
        jest.clearAllMocks();
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('init expanded for composition table', () => {
        component.widget = undefined;
        const genColDefSpy = jest.spyOn(tableUtils, 'generateColumnDefinitions');
        genColDefSpy.mockReturnValue([]);

        // #1 - customViz defined
        component['_widgetPayload$'].next({customVizConfig: {expandedState: new ExpandedState({expandedPaths: [[ROOT_LEVEL]]})}} as any);
        expect(component['expandedState']['_expandedPaths'].get(ROOT_LEVEL)[0]).toBe(ROOT_LEVEL);

        // #2 - customViz undefined
        component['expandedState'] = undefined;
        component['_widgetPayload$'].next({} as any);
        expect(component['expandedState']).toBeFalsy();

        genColDefSpy.mockRestore();
    });

    it('undefined autoGroupColumn', () => {
        component.widget = undefined;
        const genColDefSpy = jest.spyOn(tableUtils, 'generateColumnDefinitions');
        genColDefSpy.mockReturnValue([]);
        component.config = undefined;
        component['_widgetPayload$'].next(widgetPayload);
        expect(component.config.autoGroupColumnDef).toBeUndefined();
        genColDefSpy.mockRestore();
    });

    describe('autoSizeColumns Test', () => {
        let params;
        beforeEach(() => {
            component.cube = new SimpleCube([]);
            params = {
                api: {
                    moveColumns: () => {
                    },
                    getAllGridColumns: () => [{getColId: jest.fn()}],
                    autoSizeColumns: jest.fn(),
                    autoSizeAllColumns: jest.fn(),
                    getColumns: () => [{colId: 'firstColumn'}],
                    getColumnState: jest.fn(),
                    destroy: jest.fn(),
                    isDestroyed: () => false,
                    getAllDisplayedColumns: jest.fn()
                }
            };
            component.gridApiHandle = params.api;
            jest.spyOn<any, string>(component, 'setSortedColumns').mockImplementationOnce(_a => {});
            jest.spyOn<any, string>(component, 'updateColumnState').mockImplementationOnce((_a, _b) => {});
        });

        it('should check the widget is NOT from favorite, and call autoSizeAllColumns', fakeAsync(() => {
            component['columnState'] = new ColumnState();
            component['onFirstDataRendered'](params as any);
            tick(200);

            expect(component.gridApiHandle.autoSizeAllColumns).toHaveBeenCalled();
            expect(component['updateColumnState']).toHaveBeenCalled();
        }));

        it('should check if the widget is from favorite, and not to call autoSizeAllColumns', fakeAsync(() => {
            component['columnState'] = new ColumnState();
            component['columnState'].columns.push(new TableColumnState('firstColumn', 100));
            component['onFirstDataRendered'](params as any);
            tick(200);

            expect(params.api.autoSizeAllColumns).not.toHaveBeenCalled();
            expect(params.api.autoSizeColumns).not.toHaveBeenCalled();
            expect(component['updateColumnState']).toHaveBeenCalled();
        }));

        it('should call autoSizeColumns if the column width from old favorite is 0', fakeAsync(() => {
            component['columnState'] = new ColumnState();
            component['columnState'].columns.push(new TableColumnState('firstColumn', 0));
            component['onFirstDataRendered'](params as any);
            tick(200);

            expect(params.api.autoSizeAllColumns).not.toHaveBeenCalled();
            expect(params.api.autoSizeColumns).toHaveBeenCalledWith(['ag-Grid-AutoColumn']);
            expect(component['updateColumnState']).toHaveBeenCalled();
        }));
    });

    it('tests onFilterChanged', () => {
        component.gridApiHandle = {
            destroy: jest.fn(),
            isDestroyed: jest.fn().mockReturnValue(true),
            getColumn: jest.fn().mockReturnValue({getColDef: jest.fn().mockReturnValue({field: ''})} as any)
        };
        const filterEvent = {
            api: {
                getFilterModel: () => {},
                getColumn: () => ({getColDef: jest.fn().mockReturnValue({field: ''})})
            }
        } as any;
        const getFilterModelSpy = jest.spyOn(filterEvent.api, 'getFilterModel');
        jest.spyOn(component['widgetColumns'], 'updateColumnFiltersFromGrid');

        getFilterModelSpy.mockReturnValue({});
        component['onFilterChanged'](filterEvent);
        expect(component['widgetColumns'].updateColumnFiltersFromGrid).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
        getFilterModelSpy.mockReturnValue({'a': {}});
        component['onFilterChanged'](filterEvent);
        expect(component['widgetColumns'].updateColumnFiltersFromGrid).toHaveBeenCalledTimes(1);

        // widgetColumns undefined, function should not throw error
        jest.clearAllMocks();
        component['widgetColumns'] = undefined;
        component['onFilterChanged'](filterEvent);
    });

    it('tests onRowClicked - with ctrl key pressed', () => {
        const onRowClickedEvent = {
            'event': {
                ctrlKey: true, shiftKey: false
            },
            'node': {
                'setSelected': () => {
                }
            },
            'api': {
                'deselectAll': () => {
                }
            },
        } as any;

        const rowClickedSpy = jest.spyOn(onRowClickedEvent.node, 'setSelected');
        const deselectRowSpy = jest.spyOn(onRowClickedEvent.api, 'deselectAll');
        component['onRowClicked'](onRowClickedEvent);
        expect(deselectRowSpy).not.toHaveBeenCalled();
        expect(rowClickedSpy).toHaveBeenCalledTimes(1);
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

    it('onColumnGroupOpened test case', () => {
        const collapsedColumns = new CollapsedColumns(new Set(['price_contr']));
        component.widget.dataStore.metaData.inputs.set('collapsedColumns', collapsedColumns);

        let columnGroup = {
            getColGroupDef: jest.fn().mockReturnValue({ children: [{ colId: 'price_contr', columnGroupShow: 'open' }]}),
            children: [{ colId: 'price_contr', columnGroupShow: 'open' }],
            isExpanded: jest.fn().mockReturnValue(true)
        };

        let columnGroupOpenedEvent = {
            widget: component.widget,
            columnGroup,
            context: null,
            type: 'null',
            api: {}
        } as any;

        expect(collapsedColumns.collapsedColumns.size).toEqual(1);
        component.onColumnGroupOpened(columnGroupOpenedEvent);
        expect(collapsedColumns.collapsedColumns.size).toEqual(1);
        columnGroup.isExpanded = jest.fn().mockReturnValue(false);
        expect(collapsedColumns.collapsedColumns.size).toEqual(1);
        columnGroup = {
            children: [],
            isExpanded: jest.fn().mockReturnValue(true),
            getColGroupDef: jest.fn().mockReturnValue({ children: []})
        };
        columnGroupOpenedEvent = {
            widget: component.widget,
            columnGroup,
            context: null,
            type: 'null',
            api: {}
        };
        component.onColumnGroupOpened(columnGroupOpenedEvent);
        expect(collapsedColumns.collapsedColumns.size).toEqual(1);
        component.widget.dataStore.metaData.inputs.set('collapsedColumns', new Set([]));
        component.onColumnGroupOpened(columnGroupOpenedEvent);
        expect(collapsedColumns.collapsedColumns.size).toEqual(1);
    });

    it('onFindCollapsedColumns test case', () => {
        const collapsedColumns = new CollapsedColumns(new Set(['price_contr']));
        component.widget.dataStore.metaData.inputs.set('collapsedColumns', collapsedColumns);

        const columnGroup = {
            children: [{ colId: 'price_contr', columnGroupShow: 'open' }],
            isExpanded: jest.fn().mockReturnValue(true)
        };

        let columnGroupOpenedEvent = {
            widget: component.widget,
            columnGroup,
            context: null,
            type: 'null',
            api: {}
        };

        expect(collapsedColumns.collapsedColumns.size).toEqual(1);
        component.findCollapsedColumns();
        expect(collapsedColumns.collapsedColumns.size).toEqual(1);
        component.widget.dataStore.metaData.inputs.set('collapsedColumns', new Set([]));
        columnGroupOpenedEvent = {
            widget: component.widget,
            columnGroup,
            context: null,
            type: 'null',
            api: {}
        };
        component.findCollapsedColumns();
        expect(collapsedColumns.collapsedColumns.size).toEqual(1);
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
        const mockedColumnState = [
            {'colId': 'ag-Grid-AutoColumn', 'hide': false, 'aggFunc': null, 'width': 280, 'pivotIndex': null, 'pinned': 'left', 'rowGroupIndex': null},
            {'colId': '_ROOT_', 'hide': true, 'aggFunc': null, 'width': 100, 'pivotIndex': null, 'pinned': null, 'rowGroupIndex': 0},
            {'colId': 'level-1', 'hide': true, 'aggFunc': null, 'width': 100, 'pivotIndex': null, 'pinned': null, 'rowGroupIndex': 1},
            {'colId': 'security_description_1', 'hide': true, 'aggFunc': null, 'width': 280, 'pivotIndex': null, 'pinned': null, 'rowGroupIndex': null},
            {'colId': 'cusip_0', 'hide': false, 'aggFunc': null, 'width': 300, 'pivotIndex': null, 'pinned': null, 'rowGroupIndex': null},
            {'colId': 'pct_mv_1', 'hide': false, 'aggFunc': 'sum', 'width': 250, 'pivotIndex': null, 'pinned': 'right', 'rowGroupIndex': null}
        ];
        beforeEach(() => {
            const params = {
                api: {
                    moveColumns: jest.fn(),
                    getAllGridColumns: () => [{getColId: jest.fn()}],
                    autoSizeColumns: jest.fn(),
                    autoSizeAllColumns: jest.fn(),
                    getColumns: () => [{colId: 'firstColumn'}],
                    getColumnState: jest.fn().mockReturnValue(mockedColumnState),
                    destroy: jest.fn(),
                    isDestroyed: () => false,
                }
            } as any;
            component.gridApiHandle = params.api;
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        });

        it('should update Column State', () => {
            component['columnState'].columns = [];
            const event = {
                api: {
                    getColumnState: () => {
                        return mockedColumnState;
                    }
                }
            };

            component['updateColumnState'](event as any);

            const colState = component.widget.getColumnState();
            expect(colState.columns[3].width).toBe(280);

            expect(colState.columns[4].pinned).toBeNull();
            expect(colState.columns[4].width).toBe(300);
            expect(colState.columns[5].pinned).toBe('right');
            expect(colState.columns[5].width).toBe(250);
        });

        it('updateColumnState should not run into error - no widget & auto column (flat data)', () => {
            component['columnState'].columns = [];
            const event = {
                api: {
                    getColumnState: () => {
                        return [
                            {'colId': '_ROOT_', 'hide': true, 'aggFunc': null, 'width': 100, 'pivotIndex': null, 'pinned': null, 'rowGroupIndex': 0},
                            {'colId': 'level-1', 'hide': true, 'aggFunc': null, 'width': 100, 'pivotIndex': null, 'pinned': null, 'rowGroupIndex': 1},
                            {'colId': 'security_description_1', 'hide': true, 'aggFunc': null, 'width': 10, 'pivotIndex': null, 'pinned': null, 'rowGroupIndex': null},
                            {'colId': 'cusip_0', 'hide': false, 'aggFunc': null, 'width': 300, 'pivotIndex': null, 'pinned': null, 'rowGroupIndex': null},
                            {'colId': 'pct_mv_1', 'hide': false, 'aggFunc': 'sum', 'width': 250, 'pivotIndex': null, 'pinned': 'right', 'rowGroupIndex': null}
                        ];
                    }
                }
            };
            component['updateColumnState'](event as any);
        });
    });

    describe('column move tests', () => {
        it('tests onColumnMoved', () => {
            component['onColumnMoved']({} as any);
            expect(component['draggedColumn']).toBeUndefined();

            component['onColumnMoved']({column: {getColId: () => 'abc'}} as any);
            expect(component['draggedColumn']).toMatch('abc');
        });

        it('tests onDragStopped', () => {
            component['initialColOrder'] = ['a|b', 'b|c'];
            const event = {
                api: {
                    getAllGridColumns: () => [{ getColDef: jest.fn().mockReturnValue({field: 'a|b'}), getColId: jest.fn().mockReturnValue('a|b')}],
                    getAllDisplayedColumns: () => [{ getColDef: jest.fn().mockReturnValue({field: 'cusip_0'}), getColId: jest.fn().mockReturnValue('cusip_0')}],
                }
            } as any;
            component.widget.dataStore.metaData.inputs['columns'] = {columnKey: 'cusip_0'};
            const params = getMockParams();
            params.api.getAllGridColumns = () => [{ getColDef: jest.fn().mockReturnValue({field: 'a|b'}), getColId: jest.fn().mockReturnValue('a|b')}];

            component['gridReady'](params as any);

            component['draggedColumn'] = 'a';
            component['onDragStopped'](event);
            expect(component.gridApiHandle.getAllDisplayedColumns).toHaveBeenCalledTimes(1);
            expect(component.gridApiHandle.moveColumns).toHaveBeenCalledTimes(0);

            component['draggedColumn'] = 'a|b';
            component['onDragStopped'](event);
            expect(component.gridApiHandle.moveColumns).toHaveBeenCalledTimes(1);


            component.widget.configType = WidgetConfigType.EXPOST_STATS;
            component['onDragStopped'](event);
            expect(component.widget.dataStore.metaData.inputs.get('expostSortedColumns')).toBeTruthy();

            // widget undefined - composition table scenario
            jest.clearAllMocks();
            component.widget = undefined;
            component['onDragStopped'](event);
            expect(component.gridApiHandle.moveColumns).toHaveBeenCalledTimes(0);
        });
    });

    describe('onGridReady Test', () => {
        it('should re-assign autoGroupColumnDef on update next column defs', () => {
            const params = getMockParams();
            jest.spyOn(params.api, 'updateGridOptions');
            component['gridReady'](params as any);

            component['setColDefSubject$'].next([{
                field: 'security_description_1',
                filter: 'agDateColumnFilter',
                headerName: 'Security Description',
                type: 'auxDateColumn'
            }]);

            expect(params.api.updateGridOptions).toHaveBeenCalledTimes(3);
            expect(params.api.updateGridOptions).toHaveBeenNthCalledWith(1, {columnDefs: []});
            expect(params.api.updateGridOptions).toHaveBeenNthCalledWith(2, {
                autoGroupColumnDef: {
                    cellClass: 'auto-column-align',
                    cellStyle: expect.anything(),
                    field: 'security_description_1',
                    filter: 'agDateColumnFilter',
                    filterParams: {
                        maxNumConditions: 1,
                        suppressAndOrCondition: true
                    },
                    headerValueGetter: expect.anything(),
                    pinned: 'left',
                    type: 'auxDateColumn',
                    width: undefined
                }});
            jest.clearAllMocks();

            component['setColDefSubject$'].next([{
                field: 'security_description_1',
                filter: 'agTextColumnFilter',
                filterParams: {
                    maxNumConditions: 1,
                    suppressAndOrCondition: true,
                },
                headerName: 'Security Description',
                pinned: 'null',
                type: 'auxTextColumn'
            }] as any);

            expect(params.api.updateGridOptions).toHaveBeenCalledTimes(3);
            expect(params.api.updateGridOptions).toHaveBeenNthCalledWith(2, {
                autoGroupColumnDef: {
                    cellClass: 'auto-column-align',
                    cellStyle: expect.anything(),
                    field: 'security_description_1',
                    filter: 'agTextColumnFilter',
                    filterParams: {
                        maxNumConditions: 1,
                        suppressAndOrCondition: true
                    },
                    headerValueGetter: expect.anything(),
                    pinned: 'null',
                    type: 'auxTextColumn',
                    width: undefined
                }});
            jest.clearAllMocks();

            component['setColDefSubject$'].next([{
                field: 'security_description_1',
                filter: 'agTextColumnFilter',
                filterParams: {
                    maxNumConditions: 1,
                    suppressAndOrCondition: true,
                },
                headerName: 'Security Description',
                pinned: 'undefined',
                type: 'auxTextColumn'
            }] as any);

            expect(params.api.updateGridOptions).toHaveBeenCalledTimes(3);
            expect(params.api.updateGridOptions).toHaveBeenNthCalledWith(2, {
                autoGroupColumnDef: {
                    cellClass: 'auto-column-align',
                    cellStyle: expect.anything(),
                    field: 'security_description_1',
                    filter: 'agTextColumnFilter',
                    filterParams: {
                        maxNumConditions: 1,
                        suppressAndOrCondition: true
                    },
                    headerValueGetter: expect.anything(),
                    pinned: 'undefined',
                    type: 'auxTextColumn',
                    width: undefined
                }});
            jest.clearAllMocks();

            component['setColDefSubject$'].next([{
                field: 'security_description_1',
                filter: 'agTextColumnFilter',
                filterParams: {
                    maxNumConditions: 1,
                    suppressAndOrCondition: true,
                },
                headerName: 'Security Description',
                pinned: 'left',
                type: 'auxTextColumn'
            }]);

            expect(params.api.updateGridOptions).toHaveBeenCalledTimes(3);
            expect(params.api.updateGridOptions).toHaveBeenNthCalledWith(2, {
                autoGroupColumnDef: {
                    cellClass: 'auto-column-align',
                    cellStyle: expect.anything(),
                    field: 'security_description_1',
                    filter: 'agTextColumnFilter',
                    filterParams: {
                        maxNumConditions: 1,
                        suppressAndOrCondition: true
                    },
                    headerValueGetter: expect.anything(),
                    pinned: 'left',
                    type: 'auxTextColumn',
                    width: undefined
                }});
        });

        it('test scenario when requestConfig is not empty', () => {
            component['requestConfig'] = {
                portfolio: 'PEP',
                columns: [
                    {
                        columnKey: 'security_description_1',
                        columnTitle: 'security_description_1',
                        originalColumnTitle: 'Security Description',
                        formatter: {format: () => ''},
                        dataType: 'STRING',
                        columnTag: 'security_description_1',
                        isHidden: false,
                        isSubtotalable: false
                    }
                ]
            };
            const autoGroupColumnDef = component['config'].autoGroupColumnDef;
            expect(autoGroupColumnDef.cellClass).toEqual('auto-column-align');
            expect(autoGroupColumnDef.field).toEqual('security_description_1');
            expect(autoGroupColumnDef['colTag']).toEqual('security_description_1');
            expect(autoGroupColumnDef.filter).toEqual('agTextColumnFilter');
            expect(autoGroupColumnDef.filterParams).toEqual({maxNumConditions: 1, suppressAndOrCondition: true});
            expect(autoGroupColumnDef.headerValueGetter instanceof Function).toBeTruthy();
            expect(autoGroupColumnDef.pinned).toEqual('left');
            expect(autoGroupColumnDef.type).toEqual('auxTextColumn');
            expect(autoGroupColumnDef.width).toEqual(125);
        });
    });

    it('ctrlS and ctrlD should call prevent default', () => {
        const params = {event: {ctrlKey: true, key: 't', preventDefault: jest.fn()}};
        component.preventDefaultForCtrlDAndS(params);
        expect(params.event.preventDefault).not.toHaveBeenCalled();

        // will prevent browser default pop up
        params.event.key = 's';
        component.preventDefaultForCtrlDAndS(params);
        expect(params.event.preventDefault).toHaveBeenCalled();
    });

    function getMockParams(): any {
        return {
            api: {
                destroy: () => {},
                isDestroyed: () => false,
                getColumnState: jest.fn(() => {
                    return [
                        {colId: 'ag-Grid-AutoColumn', width: 149, hide: false, pinned: 'left', sort: 'asc'},
                        {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: 'asc'},
                        {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
                        {colId: 'pct_mv', width: 101, hide: false, pinned: null, sort: 'desc'}
                    ];
                }),
                moveColumns: jest.fn(),
                applyColumnState: jest.fn(),
                getAllGridColumns: () => [],
                getAllDisplayedColumns: jest.fn().mockReturnValue([]),
                updateGridOptions: jest.fn()
            },
            data: {
                bgColorMap: {
                    security_description_1: 123,
                },
                fgColorMap: {
                    security_description_1: 234,
                },
            },
            context: {
                [CommonConstants.INITIAL_SCALING_INFO]: {}
            },
        };
    }


    it('test getActionColMenuOptions', () => {

        const menuData = component.getActionColMenuOptions({ node: {} });

        expect(menuData).not.toBeUndefined();
        expect(Object.keys(menuData).length).toBe(2);

        component.gridApiHandle = {};

        let actionExecuted = false;

        const event = {
            detail: {
                element: {
                    eventData: {
                        action: () => { actionExecuted = true; },
                    }
                }
            }
        };

        menuData.inlineMenuItemClicked(event);
        expect(actionExecuted).toBeTruthy();

        component.gridApiHandle = undefined;

    });

    it('should test handleCollapsableColumns', () => {
        widgetPayload.responseConfig = {
            collapsableColumns: new Set([
                'pay-down',
                'total_fx',
                'fxcarry_pnl',
                'total_fin',
                'total_comm',
                'sec_lending',
                'total_wht',
                'acct_fees',
                'tradeprice_gl',
                'paydn_contr',
                'fx_contr',
                'fxcarry_contr',
                'comm_contr',
                'sec_lending_contr',
                'wht_contr',
                'acct_fees_contr',
                'tradeprice_contr',
                'beg_int',
                'end_int',
                'price_contr',
                'income_contr',
                'prin_contr'
            ])
        };

        const colDefs = [
            {
                'field': '_ROOT_',
                'hide': true,
                'rowGroup': true
            },
            {
                'colTag': 'date',
                'field': 'date',
                'headerName': 'Date',
                'headerTooltip': 'Date',
                'hide': true,
                'type': 'auxDateColumn',
                'filter': 'agDateColumnFilter',
                'filterParams': {
                    'maxNumConditions': 1
                },
                'width': 124,
                'pinned': 'left'
            },
            {
                'colTag': 'pnl_sec_desc',
                'field': 'pnl_sec_desc',
                'headerName': 'Description',
                'headerTooltip': 'Description',
                'hide': false,
                'type': 'auxTextColumn',
                'filter': 'agTextColumnFilter',
                'filterParams': {
                    'maxNumConditions': 1
                },
                'width': 82,
                'pinned': null
            },
            {
                'headerName': 'P&L',
                'children': [
                    {
                        'colTag': 'total_pnl',
                        'field': 'total_pnl',
                        'headerTooltip': 'Total P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 109,
                        'pinned': null
                    },
                    {
                        'colTag': 'price_gl',
                        'field': 'price_gl',
                        'headerTooltip': 'Price P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 106,
                        'pinned': null
                    },
                    {
                        'colTag': 'total_int',
                        'field': 'total_int',
                        'headerTooltip': 'Income P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 102,
                        'pinned': null
                    },
                    {
                        'colTag': 'paydown',
                        'field': 'paydown',
                        'headerTooltip': 'Paydown P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'total_fx',
                        'field': 'total_fx',
                        'headerTooltip': 'FX P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'fxcarry_pnl',
                        'field': 'fxcarry_pnl',
                        'headerTooltip': 'FX Carry P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'total_fin',
                        'field': 'total_fin',
                        'headerTooltip': 'Financing P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'total_comm',
                        'field': 'total_comm',
                        'headerTooltip': 'Commissions P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'sec_lending',
                        'field': 'sec_lending',
                        'headerTooltip': 'Security Lending P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'total_wht',
                        'field': 'total_wht',
                        'headerTooltip': 'Withholding Tax P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'acct_fees',
                        'field': 'acct_fees',
                        'headerTooltip': 'Accounting Fees P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'tradeprice_gl',
                        'field': 'tradeprice_gl',
                        'headerTooltip': 'Trade P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'total_prin',
                        'field': 'total_prin',
                        'headerTooltip': 'Principal P&L',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 106,
                        'pinned': null
                    }
                ]
            },
            {
                'headerName': 'Contribution',
                'children': [
                    {
                        'colTag': 'price_contr',
                        'field': 'price_contr',
                        'headerTooltip': 'Price Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 74,
                        'pinned': null
                    },
                    {
                        'colTag': 'income_contr',
                        'field': 'income_contr',
                        'headerTooltip': 'Income Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'paydn_contr',
                        'field': 'paydn_contr',
                        'headerTooltip': 'Paydown Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'fx_contr',
                        'field': 'fx_contr',
                        'headerTooltip': 'FX Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'fxcarry_contr',
                        'field': 'fxcarry_contr',
                        'headerTooltip': 'FX Carry Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'comm_contr',
                        'field': 'comm_contr',
                        'headerTooltip': 'Commissions Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'sec_lending_contr',
                        'field': 'sec_lending_contr',
                        'headerTooltip': 'Security Lending Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'wht_contr',
                        'field': 'wht_contr',
                        'headerTooltip': 'Withholding Tax Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'acct_fees_contr',
                        'field': 'acct_fees_contr',
                        'headerTooltip': 'Accounting Fees Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'tradeprice_contr',
                        'field': 'tradeprice_contr',
                        'headerTooltip': 'Trade Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'prin_contr',
                        'field': 'prin_contr',
                        'headerTooltip': 'Principal Contribution',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    }
                ]
            },
            {
                'headerName': 'Beginning',
                'children': [
                    {
                        'colTag': 'beg_origface',
                        'field': 'beg_origface',
                        'headerTooltip': 'Begin Orig Face',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'beg_currface',
                        'field': 'beg_currface',
                        'headerTooltip': 'Begin Curr Face',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'beg_price',
                        'field': 'beg_price',
                        'headerTooltip': 'Begin Price',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'beg_fx_rate',
                        'field': 'beg_fx_rate',
                        'headerTooltip': 'Begin FX Rate',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'beg_market_val',
                        'field': 'beg_market_val',
                        'headerTooltip': 'Begin Market Value',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'beg_int',
                        'field': 'beg_int',
                        'headerTooltip': 'Begin Interest',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    }
                ]
            },
            {
                'headerName': 'Ending',
                'children': [
                    {
                        'colTag': 'end_origface',
                        'field': 'end_origface',
                        'headerTooltip': 'End Orig Face',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'end_currface',
                        'field': 'end_currface',
                        'headerTooltip': 'End Curr Face',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'end_price',
                        'field': 'end_price',
                        'headerTooltip': 'End Price',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'end_fx_rate',
                        'field': 'end_fx_rate',
                        'headerTooltip': 'End FX Rate',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'end_market_val',
                        'field': 'end_market_val',
                        'headerTooltip': 'End Market Value',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    },
                    {
                        'colTag': 'end_int',
                        'field': 'end_int',
                        'headerTooltip': 'End Interest',
                        'aggFunc': 'sum',
                        'hide': false,
                        'type': 'auxNumberColumn',
                        'filter': 'agNumberColumnFilter',
                        'filterParams': {
                            'maxNumConditions': 1
                        },
                        'width': 125,
                        'pinned': null
                    }
                ]
            }
        ];

        component['handleCollapsableColumns'](colDefs as any, widgetPayload);
        expect(colDefs[4].headerName).toEqual('Contribution');
        for (const child of colDefs[4].children) {
            if (child.colTag === 'prin_contr') {
                expect(child['columnGroupShow']).toBeUndefined();
            } else {
                expect(child['columnGroupShow']).toEqual('open');
            }
        }
    });

    it('should clear range selection if initiated from action column', () => {
        const mockEvent = {
            api: {
                getCellRanges: jest.fn().mockReturnValue([
                    { startColumn: { getColId: jest.fn().mockReturnValue('actionCol') } }
                ]),
                clearRangeSelection: jest.fn()
            }
        } as unknown as RangeSelectionChangedEvent;

        component['onRangeSelectionChanged'](mockEvent);

        expect(mockEvent.api.clearRangeSelection).toHaveBeenCalled();
    });

    it('should not clear range selection if not initiated from action column', () => {
        const mockEvent = {
            api: {
                getCellRanges: jest.fn().mockReturnValue([
                    { startColumn: { getColId: jest.fn().mockReturnValue('someOtherCol') } }
                ]),
                clearRangeSelection: jest.fn()
            }
        } as unknown as RangeSelectionChangedEvent;

        component['onRangeSelectionChanged'](mockEvent);

        expect(mockEvent.api.clearRangeSelection).not.toHaveBeenCalled();
    });
});
