import {TestUtils} from '@utils/test.utils';
import {Subject} from 'rxjs';
import {Widget} from '@models/widget/widget.model';
import {BaseRightClickHandler} from './base-right-click.handler';
import {RequestAdapterConfig} from '../../../interfaces';
import {WidgetUtils} from '@utils/widget.utils';
import {
    ColumnConstants,
    ColumnDefinition,
    CoreColumnUtils,
    PerformanceConstants,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {CommonConstants} from '@constants/common.constants';
import {EventEmitter} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {CellRange, Column, GridApi} from 'ag-grid-community';
import {AppUtils} from '@utils/app.utils';
import {NotificationService} from '@services/notification';

describe('Base Right Click Handler Test', () => {

    let baseRightClickHandler;
    let requestConfig: RequestAdapterConfig;
    const notificationServiceStub = {
        success: jest.fn(),
    };

    beforeAll((done) => {
        TestBed.configureTestingModule({
            providers: [
                BaseRightClickHandler,
                {provide: NotificationService, useValue: notificationServiceStub},
            ],
        });
        TestUtils.initialize(done);
        baseRightClickHandler = TestBed.inject(BaseRightClickHandler);
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const cols = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        requestConfig = {columns: cols, portfolio: 'PEP'};
    });

    describe('test getContextMenuItemsForAgGrid for all Levels', () => {
        it('test getContextMenuItemsForAgGrid for Root Level', () => {
            const params = getParamsForRootNode();
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            expect(items[0].name).toBe('Expand');
            expect(items[1].name).toBe('Expand All Levels');
            expect(items[2].name).toBe('Collapse All Levels');
        });

        it('test getContextMenuItemsForAgGrid for 1 plus Level', () => {
            const params = getParamsForOnePlusLevelNode();
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            expect(items[0].name).toBe('Expand');
            expect(items[1].name).toBe('Expand All Levels');
            expect(items[2].name).toBe('Collapse');
            expect(items[3].name).toBe('Collapse All Levels');
        });

        it('test getContextMenuItemsForAgGrid for Leaf Level', () => {
            const params = getParamsForLeafNode();
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            expect(items[0].name).toBe('Expand All Levels');
            expect(items[1].name).toBe('Collapse All Levels');
        });
    });

    it('test Expand Clicked at Root level', () => {
        const params = getParamsForRootNode();
        const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[0].action();
        expect(params.node.expanded).toBeTruthy();
    });

    it('Test copySelectedRangeToClipboardIncludingHeaders', () => {
        const gridApi = {} as any as GridApi;
        const column1 = {} as Column;
        column1.getColId = jest.fn().mockReturnValue(1);
        const column2 = {} as Column;
        column2.getColId = jest.fn().mockReturnValue(2);
        const cellRange = {startRow: {rowIndex: 1}, endRow: {rowIndex: 4}, columns: [column1, column2]} as CellRange;
        gridApi.getCellRanges = jest.fn().mockReturnValue([cellRange]);
        gridApi.getDataAsCsv = jest.fn().mockReturnValue('CUSIP SECURITY DESC\r\nBRS123 sec1');
        jest.spyOn(AppUtils, 'copyTextToClipboard').mockReturnValue(true);
        baseRightClickHandler.copySelectedRangeToClipboardIncludingHeaders(gridApi);
        expect(AppUtils.copyTextToClipboard).toHaveBeenCalledWith('CUSIP SECURITY DESC\r\nBRS123 sec1');
        expect(gridApi.getDataAsCsv).toHaveBeenCalledWith(expect.objectContaining({
            columnKeys: [1, 2],
            columnSeparator: '\t',
            suppressQuotes: true
        }));
    });

    describe('Test COLLAPSE_ALL_UNDER_THIS_LEVEL/COLLAPSE_ALL_AT_THIS_LEVEL', () => {

        it('test Collapse All Under This Level', () => {
            /**
             * Before:
             * A - expanded, group, parent of B, C, E    < Collapse under this level
             * |-- B - NOT expanded, group
             * |-- C - expanded, group, parent of D
             * |-- |-- D - expanded, group
             * |-- E - expanded, group
             *
             * After:
             * A - NOT expanded, group, parent of B, C, E
             * |-- B - NOT expanded, group
             * |-- C - NOT expanded, group, parent of D
             * |-- |-- D - NOT expanded, group
             * |-- E - NOT expanded, group
             */
            const nodes = getMockNodes();
            const params = {
                node: nodes[0],
                api: {
                    forEachNode: (forEach: Function) => nodes.forEach((node) => forEach(node)),
                },
                context: {}
            };
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            const collapseMainMenu = items[2];
            collapseMainMenu.subMenu[1].action();

            nodes.forEach(node => expect(node.expanded).toEqual(false));
        });

        it('test Collapse All At This Level', () => {
            /**
             * Before: All node expanded
             *
             * After:
             * A - expanded, parent of B and C
             * |-- B - expanded, parent of D
             * |   |-- D - NOT expanded, leaf group    < Collapse at this level
             * |-- C - expanded, parent of E
             *     |-- E - NOT expanded, leaf group
             */
            const nodes = getMockNodes2();
            const params = {
                node: nodes[2],
                api: {
                    forEachNode: (forEach: Function) => nodes.forEach((node) => forEach(node)),
                },
                context: {}
            };

            nodes.forEach(node => expect(node.expanded).toEqual(true));

            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            const collapseMainMenu = items[2];
            collapseMainMenu.subMenu[0].action();

            nodes.filter(node => [2, 3, 5].includes(node.id)).forEach(node => expect(node.expanded).toEqual(true));
            nodes.filter(node => [4, 6].includes(node.id)).forEach(node => expect(node.expanded).toEqual(false));
        });
    });

    describe('Test EXPAND_ALL_AT_THIS_LEVEL/EXPAND_ALL_UNDER_THIS_LEVEL', () => {
        let originalCallback;

        beforeAll(() => {
            originalCallback = baseRightClickHandler.recursiveNodeExpandListenerCallback;
            baseRightClickHandler.rowDataPopulated$ = new Subject<string>();
        });

        it('test Expand All Under This Level', fakeAsync(() => {
            /**
             * Before:
             * A - expanded, parent of B, C, E     < Expand under this level
             * |-- B - not expanded, group
             * |-- C - expanded, group, parent of D
             * |-- | -- D - expanded, group
             * |-- E - expanded, group
             *
             * After:
             * A - expanded, parent of B, C, E
             * |-- B - expanded, group
             * |-- C - expanded, group, parent of D
             * |-- | -- D - expanded, group
             * |-- E - expanded, group
             */
            baseRightClickHandler.recursiveNodeExpandListenerCallback = jest.fn((node, callback) => {
                originalCallback(node, callback);
                tick(5);
                baseRightClickHandler.rowDataPopulated$.next(node.id);
            });
            const nodes = getMockNodes();
            const params = {
                node: nodes[0],
                api: {
                    forEachNode: (forEach: Function) => nodes.forEach((node) => forEach(node)),
                },
                context: {}
            };
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            const collapseMainMenu = items[0];
            collapseMainMenu.subMenu[1].action();

            nodes.forEach(node => expect(node.expanded).toEqual(true));
        }));

        it('test Expand All At This Level', fakeAsync(() => {
            /**
             * Before:
             * A - expanded, parent of B and C
             * |-- B - expanded, parent of D
             * |   |-- D - expanded, leaf group    < Expand at this level
             * |-- C - NOT expanded, parent of E
             *     |-- E - NOT expanded, leaf group
             *
             * After: All node expanded
             */
            baseRightClickHandler.recursiveNodeExpandListenerCallback = jest.fn((node, callback, levelOfNode) => {
                originalCallback(node, callback, levelOfNode);
                tick(5);
                baseRightClickHandler.rowDataPopulated$.next(node.id);
            });
            const nodes = getMockNodes2();
            const params = {
                node: nodes[2],
                api: {
                    forEachNode: (forEach: Function) => nodes.forEach((node) => forEach(node)),
                },
                context: {}
            };
            nodes[0].expanded = true;
            nodes[1].expanded = true;
            nodes[2].expanded = false;
            nodes[3].expanded = true;
            nodes[4].expanded = false;

            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            const collapseMainMenu = items[0];
            collapseMainMenu.subMenu[0].action();

            nodes.forEach(node => (expect(node.expanded).toEqual(true)));
        }));
    });

    describe('Test Expand All', () => {
        it('test Expand All for ROOT Node', () => {
            const params = getParamsForRootNode();
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            items[1].action();
            expect(params.api.expandAll).toHaveBeenCalled();
        });

        it('test Expand All for One Plus Level Nodes', () => {
            const params = getParamsForOnePlusLevelNode();
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            items[1].action();
            expect(params.api.expandAll).toHaveBeenCalled();
        });

        it('test Expand All for Leaf Node', () => {
            const params = getParamsForLeafNode();
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
            items[0].action();
            expect(params.api.expandAll).toHaveBeenCalled();
        });
    });

    describe('test Collapse All', () => {
        it('test Collapse All for ROOT Node', () => {
            const params = getParamsForRootNode();
            const expandedState = new ExpandedState();
            expandedState.allExpanded = true;
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null, expandedState);
            items[2].action();
            expect(params.api.collapseAll).toHaveBeenCalled();
            expect(expandedState.allExpanded).toBeFalsy();
        });

        it('test Collapse All for One Plus Level Nodes', () => {
            const params = getParamsForOnePlusLevelNode();
            const expandedState = new ExpandedState();
            expandedState.allExpanded = true;
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null, expandedState);
            items[3].action();
            expect(params.api.collapseAll).toHaveBeenCalled();
        });

        it('test Collapse All for Leaf Node', () => {
            const params = getParamsForLeafNode();
            const expandedState = new ExpandedState();
            expandedState.allExpanded = true;
            const items = baseRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null, expandedState);
            items[1].action();
            expect(params.api.collapseAll).toHaveBeenCalled();
        });
    });

    it('test Show Column Definition and remove reset column', () => {
        const params: any = {};
        params.defaultItems = [
            'pinSubMenu',
            'separator',
            'autoSizeThis',
            'autoSizeAll',
            'separator',
            'resetColumns'
        ];
        params.column = {
            getColId: () => PerformanceConstants.FX_ATTRIBUTION_COL_TAG
        };
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        jest.spyOn(eventEmitter, 'emit');
        const items = baseRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        items[0].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith(expect.objectContaining({
            actionName: CommonConstants.COLUMN_DEFINITION_SPRITELET.ACTION_KEY,
            params,
            callbackMethodName: CommonConstants.COLUMN_DEFINITION_SPRITELET.CALLBACK_METHOD_NAME
        }));
        expect(items[1]).toBe('separator');
        expect(items.indexOf('resetColumn')).toBe(-1);
        expect(items.pop()).toBe('autoSizeAll');
    });

    /**
     * Return Parameters for Root node
     */
    function getParamsForRootNode(): any {
        return {
            node: {
                parent: {},
                group: true,
                setExpanded(expanded: boolean) {
                    this.expanded = expanded;
                }
            },
            api: {
                expandAll: jest.fn(),
                collapseAll: jest.fn()
            },
            context: {}
        };
    }

    /**
     * Return Parameters for One Plus Level nodes
     */
    function getParamsForOnePlusLevelNode(): any {
        return {
            node: {
                parent: {id: 1},
                group: true,
                setExpanded(expanded: boolean) {
                    this.expanded = expanded;
                }
            },
            api: {
                expandAll: jest.fn(),
                collapseAll: jest.fn()
            },
            context: {}
        };
    }

    /**
     * Return Leaf Node
     */
    function getParamsForLeafNode(): any {
        return {
            node: {
                parent: {id: 1},
                group: false,
                setExpanded(expanded: boolean) {
                    this.expanded = expanded;
                }
            },
            api: {
                expandAll: jest.fn(),
                collapseAll: jest.fn()
            },
            context: {}
        };
    }

    /**
     * @return
     * A - expanded, parent of B, C, E
     * |-- B - not expanded, group
     * |-- C - expanded, group, parent of D
     * |-- | -- D - expanded, group
     * |-- E - expanded, group
     */
    function getMockNodes(): any[] {
        return ([{
            id: 2,
            level: 1,
            group: true,
            expanded: true,
            data: {title: 'A'},
            parent: {id: 1},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }, {
            id: 3,
            level: 2,
            group: true,
            expanded: false,
            data: {title: 'B'},
            parent: {id: 2},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }, {
            id: 4,
            level: 2,
            group: true,
            expanded: true,
            data: {title: 'C'},
            parent: {id: 2},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }, {
            id: 5,
            level: 3,
            group: true,
            expanded: true,
            data: {title: 'D'},
            parent: {id: 4, parent: {id: 2}},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }, {
            id: 6,
            level: 2,
            group: true,
            expanded: true,
            data: {title: 'E'},
            parent: {id: 2},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }
        ]);
    }

    /**
     * @return
     * A - expanded, parent of B and C
     * |-- B - expanded, parent of D
     * |   |-- D - expanded, leaf group
     * |-- C - expanded, parent of E
     *     |-- E - expanded, leaf group
     */
    function getMockNodes2(): any[] {
        return ([{
            id: 2,
            level: 1,
            group: true,
            expanded: true,
            data: {title: 'A'},
            parent: {id: 1},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }, {
            id: 3,
            level: 2,
            group: true,
            expanded: true,
            data: {title: 'B'},
            parent: {id: 2},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }, {
            id: 4,
            level: 3,
            group: true,
            expanded: true,
            data: {title: 'D'},
            parent: {id: 3, parent: {id: 2}},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }, {
            id: 5,
            level: 2,
            group: true,
            expanded: true,
            data: {title: 'C'},
            parent: {id: 2},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }, {
            id: 6,
            level: 3,
            group: true,
            expanded: true,
            data: {title: 'E'},
            parent: {id: 5, parent: {id: 2}},
            setExpanded (expanded: boolean) {
                this.expanded = expanded;
            },
            isExpandable: () => true,
        }
        ]);
    }

    it('test method hasIRRColumn', () => {
        jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockImplementation((_columnTag: string): ColumnDefinition => {
            const colDef = new ColumnDefinition();
            colDef.groups = ['Performance', 'Money Weighted Analytics', 'IRR'];
            return colDef;
        });
        const newRequestConfig = {
            columns: [
                { columnTag: 'irr_net_pct' },
            ]
        } as unknown as RequestAdapterConfig;
        expect(baseRightClickHandler.hasIRRColumn(ColumnConstants.ACTION_COL, newRequestConfig)).toBeTruthy();


        const params = {
            column: {
                getColDef: () => ({ colTag: 'irr_net_pct' })
            }
        };

        expect(baseRightClickHandler.hasIRRColumn('irr_net_pct', newRequestConfig, params)).toBeTruthy();


    });
});
