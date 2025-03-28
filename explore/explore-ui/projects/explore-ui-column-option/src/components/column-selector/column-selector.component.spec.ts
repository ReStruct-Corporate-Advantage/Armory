import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {
    ColumnConfig,
    ColumnDefinition,
    TelemetryColumnSearchParameters,
    TelemetryUtil,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {ColumnSet} from '../../models/column-set/column-set.model';
import {ColumnSelectorOption} from '../../models/ui/column-selector-option.model';
import {SelectedColumnSelectorOption} from '../../models/ui/selected-column-selector-option.model';
import {ColumnSelectorActionTypes, ColumnSelectorComponent} from './column-selector.component';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {BehaviorSubject, Subject} from 'rxjs';
import {cloneDeep} from 'lodash';
import {ColumnOptionUpdate} from '../../interfaces';

describe('ColumnSelectorComponent', () => {
    let component: ColumnSelectorComponent;
    let fixture: ComponentFixture<ColumnSelectorComponent>;
    let componentEl: HTMLElement;
    let eventMock: any;

    const column1 = ColumnConfig.createColumn('security_description', 'ALL', 'security_description_1', 'Security Description');
    const columnSelectorOption1: any = {
        'label': 'Security Description',
        'uid': '7aca32a0-e09b-4b71-bb1c-f89d937a46f3',
        'eventData': {
            'column': column1,
            'columnOptions': []
        },
        'isSelected': false,
        'nestedLevel': 0,
        'isDeletable': true,
        'key': 0,
        'match': false,
        'altSearchMatch': false,
        'isExpanded': false,
        'isHidden': false
    };

    const column2 = ColumnConfig.createColumn('cusip', 'ALL', 'cusip_0', 'CUSIP');
    const columnSelectorOption2: any = {
        'label': 'CUSIP',
        'uid': '2bcf3372-9f53-4191-bc20-d1980bf42999',
        'eventData': {
            'column': column2,
            'columnOptions': []
        },
        'isSelected': false,
        'nestedLevel': 0,
        'isDeletable': true,
        'key': 1,
        'match': false,
        'altSearchMatch': false,
        'isExpanded': false,
        'isHidden': false
    };

    const column3 = ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'Market Value %');
    const columnSelectorOption3: any = {
        'label': 'Market Value %',
        'uid': 'a4aaec91-1a50-4abe-8120-3697b1f418e9',
        'eventData': {
            'column': column3,
            'columnOptions': []
        },
        'isSelected': false,
        'nestedLevel': 0,
        'isDeletable': true,
        'key': 2,
        'match': false,
        'altSearchMatch': false,
        'isExpanded': false,
        'isHidden': false
    };

    const column4 = ColumnConfig.createColumn('acct_fees_contr', 'PORT', 'acct_fees_contr_d37a86199eeb432', 'Accounting Fees Contribution (1 MTD)');
    const columnSelectorOption4: any = {
        'label': 'Accounting Fees Contribution',
        'uid': '42b9ef66-4f6e-4a82-a5de-3c1c1bc2dc65',
        'type': 'column',
        'eventData': {
            'column': column4,
            'columnOptions': []
        },
        'isSelected': true,
        'key': 3,
        'nestedLevel': 0,
        'isExpanded': false,
        'isHidden': false,
        'isDeletable': true,
        'match': false
    };

    let targetAreaColumnsMock: any;

    const targetTreeListMock = {dataMoved: jest.fn()};

    const columnSelectorMock: any = {
        getSourceRef: () => Promise.resolve({dataMoved: jest.fn()}),
        getTargetRef: () => Promise.resolve({getData: jest.fn(() => targetAreaColumnsMock), dataMoved: jest.fn()}),
        getSourceSelection: () => Promise.resolve([]),
        getTargetSelection: () => Promise.resolve([]),
        changeTargetListItemLabel: () => Promise.resolve([]),
        targetData: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ColumnSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ColumnSelectorComponent);
        component = fixture.componentInstance;
        component.columnSet = new ColumnSet();
        component.columnSelector = columnSelectorMock;
        component.sourceDataUpdated$ = new Subject();
        component.columnSetUpdated$ = new Subject();
        component.columnOptionCopied$ = new Subject();
        component.columnOptionsFetched$ = new Subject();
        component.columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();
        component.selectedColumnConfig$ = new BehaviorSubject(null);
        component.searchTermSubject$ = new BehaviorSubject(null);
        component.searchQuery = new TelemetryColumnSearchParameters('Market Value', false, 4, TelemetryUtil.getDuration(3005));
        targetAreaColumnsMock = [
            columnSelectorOption1,
            columnSelectorOption2,
            columnSelectorOption3,
            columnSelectorOption4,
        ];
        componentEl = fixture.nativeElement;

        eventMock = {
            stopPropagation: () => {
            }, detail: {}
        };

        component.ngOnInit();
        component.ngAfterViewInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('test ngOnChanges', () => {
        it('should update isDescriptionSearch when Search by definition is selected 1', () => {
            let changes = {
                searchBy: {
                    currentValue: 'Search by definition',
                    previousValue: 'Search by name',
                }
            } as any;
            component.ngOnChanges(changes);
            expect(component.isDescriptionSearch).toBeTruthy();

            changes = {
                searchBy: {
                    currentValue: 'Search by name',
                    previousValue: 'Search by definition',
                }
            } as any;
            component.ngOnChanges(changes);
            expect(component.isDescriptionSearch).toBeFalsy();
        });

        it('should update isDescriptionSearch when Search by definition is selected 2', () => {
            let changes = {
                searchBy: {
                    currentValue: 'Search by name',
                    previousValue: 'Search by name',
                }
            } as any;
            component.ngOnChanges(changes);
            expect(component.isDescriptionSearch).toBeFalsy();

            changes = {
                searchBy: undefined
            } as any;
            component.ngOnChanges(changes);
            expect(component.isDescriptionSearch).toBeFalsy();
        });
    });

    it('should fill columnSelector with a data', () => {
        const columnSelectorEl = componentEl.querySelector('aux-column-selector');
        expect((columnSelectorEl as any).sourceData).toEqual(component.sourceData);
    });

    describe('sourceDataUpdated$ Test', () => {
        const sourceDataMock = [new ColumnSelectorOption('Position')];

        it('should subscribe on sourceDataUpdated$ and call updateSourceList', fakeAsync(() => {
            jest.spyOn(component, 'updateSourceList' as any);
            component.sourceDataUpdated$.next(sourceDataMock);
            tick(10);

            expect(component['updateSourceList']).toHaveBeenCalledWith(sourceDataMock);
            expect(component.sourceData).toEqual(sourceDataMock);
        }));
    });

    describe('updateTargetList Test - CREATE Workflow', () => {
        const columnSetMock = new ColumnSet();
        columnSetMock.columns = [column1, column2, column3];

        describe('First time initialize workflow', () => {
            it('should subscribe on columnSetUpdated$ and set targetData and emit targetSelectionChanged', fakeAsync(() => {
                jest.spyOn(component, 'updateTargetList' as any);
                jest.spyOn(component, 'initializeColumns' as any);
                jest.spyOn(component.targetSelectionChanged, 'emit');
                component.isFirstTimeInitialize = true;

                component.columnSetUpdated$.next(columnSetMock);
                tick(10);

                expect(component['updateTargetList']).toHaveBeenCalledWith('Create', null, columnSetMock);
                expect(component['initializeColumns']).toHaveBeenCalled();

                const targetData = component['createTargetAreaColumns'](columnSetMock);
                expect(component.targetData).toEqual(targetData);
                expect(component.targetSelectionChanged.emit).toHaveBeenCalledWith(targetData[targetData.length - 1]);
            }));
        });
    });

    describe('updateTargetList Test - UPDATE Workflow', () => {

        it('should call updateTargetList and update column label', fakeAsync(async () => {
            expect(targetAreaColumnsMock[3].label).toBe('Accounting Fees Contribution');
            jest.spyOn(component, 'updateTargetList' as any);
            jest.spyOn(component, 'updateColumn' as any);

            const columnToUpdate = [new SelectedColumnSelectorOption(ColumnConfig.createColumn('acct_fees_contr', 'PORT', 'acct_fees_contr_d37a86199eeb432', 'Accounting Fees Contribution (1 MTD)'), [])];
            await component['updateTargetList'](ColumnSelectorActionTypes.UPDATE, null, null, columnToUpdate);

            expect(component['updateColumn']).toHaveBeenCalled();

            expect(targetAreaColumnsMock[3].label).toBe('Accounting Fees Contribution (1 MTD)');
        }));

        it('should call updateTargetList and update column label - 2', async() => {
            expect(targetAreaColumnsMock[3].label).toBe('Accounting Fees Contribution (1 MTD)');
            jest.spyOn(component, 'updateTargetList' as any);
            jest.spyOn(component, 'updateColumn' as any);
            const updatedColumnConfig = ColumnConfig.createColumn('acct_fees_contr', 'PORT', 'acct_fees_contr_d37a86199eeb432', 'custom title');

            component.columnOptionUpdated$.next({column: updatedColumnConfig, isSaveUpdate: false});
            await component['updateTargetList'](ColumnSelectorActionTypes.UPDATE, null, null, updatedColumnConfig);

            expect(component['updateColumn']).toHaveBeenCalled();

            expect(targetAreaColumnsMock[3].label).toBe('custom title');
        });
    });

    describe('updateTargetList Test - SELECT Workflow', () => {
        const columnSetMock = new ColumnSet();
        columnSetMock.columns = [column1, column2, column3];

        beforeEach(() => {
            component.selectedColumnConfig$ = new BehaviorSubject<ColumnConfig>(new ColumnConfig());
        });

        it('should call updateTargetList with targetSelectionChangedHandler', () => {
            jest.spyOn(component, 'updateTargetList' as any);
            eventMock.detail = {value: [columnSelectorOption1]};
            component.targetSelectionChangedHandler(eventMock);

            expect(component['updateTargetList']).toHaveBeenCalledWith('Select', [columnSelectorOption1]);
        });

        it('should emit the selected column to fetch the column options', () => {
            jest.spyOn(component.targetSelectionChanged, 'emit');
            component['selectColumn'](columnSelectorOption1);

            expect(component.targetSelectionChanged.emit).toHaveBeenCalledWith(columnSelectorOption1);
        });
    });

    describe('updateTargetList Test - CLONE Workflow', () => {
        let columnToCloneConfig: ColumnConfig;
        let columnToClone: ColumnSelectorOption;
        beforeEach(() => {
            columnToCloneConfig = ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'Market Value %');
            columnToClone = new ColumnSelectorOption('Market Value %', '079cf49a-b963-4ed3-b081-f884a6b97d39', null, 'column', new SelectedColumnSelectorOption(columnToCloneConfig, []), false);

            component.singleColumnOnly = false;
            component.isFirstTimeInitialize = true;

            component.columnSet = new ColumnSet();
            component.columnSet.columns = [
                ColumnConfig.createColumn('security_description', 'ALL', 'security_description_1', 'Security Description'),
                columnToCloneConfig,
                ColumnConfig.createColumn('cusip', 'ALL', 'cusip_0', 'CUSIP'),
            ];

            component.targetData = component['createTargetAreaColumns'](component.columnSet);
        });

        it('should call updateTargetList with onContextMenuClick', () => {
            jest.spyOn(component, 'updateTargetList' as any);
            eventMock.detail = {value: columnToClone};
            component.onContextMenuClick(eventMock);

            expect(component['updateTargetList']).toHaveBeenCalledWith('Clone', columnToClone);
        });

        it('should add cloned column to end of ColumnSet - updateColumnSet', () => {
            component['updateColumnSet']('Clone', columnToClone);

            expect(component.columnSet.columns.length).toEqual(4);
            const newColumn = component.columnSet.columns[3];
            expect(newColumn.columnTag).toEqual(columnToCloneConfig.columnTag);
            expect(newColumn.columnKey).not.toEqual(columnToCloneConfig.columnKey);
        });

        it('should re-initialize targetData with the new cloned column included - initializeColumns', () => {
            component['updateColumnSet']('Clone', columnToClone);
            component['initializeColumns'](component.columnSet, undefined);

            expect(component.targetData.length).toEqual(4);
            const newColumn = component.targetData[3];
            expect(newColumn.label).toEqual(columnToCloneConfig.columnTitle);
            expect(newColumn.isSelected).toEqual(true);
        });
    });

    describe('updateTargetList Test - ADD Workflow', () => {
        let addedColumns: any;
        beforeEach(() => {
            addedColumns = [
                new ColumnSelectorOption('Average Factor Exposure', '079cf49a-b963-4ed3-b081-f884a6b97d39', null, 'column',
                    new ColumnDefinition({
                        'columnTag': 'exposure_contr',
                        'field': 'FAExposureContr',
                        'title': 'Average Factor Exposure',
                        'uses': 'PORT',
                        'isSubtotalable': true,
                        'reportTypes': [
                            'SINGLE',
                            'RETATT',
                            'BFRE',
                            'TREND'
                        ],
                        'columnReports': [
                            'factor_attrib_dd'
                        ],
                        'dataType': 'DOUBLE',
                        'columnType': 'PERFORMANCE',
                        'isNotSupportedInCustomCal': false,
                        'groups': [
                            'Performance',
                            'Exposures'
                        ],
                        'isGroupable': false,
                        'isStaticColumn': false,
                        'functionFlag': 65537,
                        'strippedName': 'Average Factor Exposure',
                        'columnFormat': {
                            'scalingOptions': {},
                            'decimalPlaces': 2,
                            'isUseThousandsSeparator': true,
                            'isScalable': true,
                            'scalingFactor': 0.0001
                        }
                    }), false
                ),
                new ColumnSelectorOption('Benchmark Average Factor Exposure', '163cc860-4443-4a66-9c72-820426b86027', null, 'column',
                    new ColumnDefinition({
                        'columnTag': 'bch_exposure_contr',
                        'field': 'BenchFAExposureContr',
                        'title': 'Benchmark Average Factor Exposure',
                        'uses': 'BENCH',
                        'isSubtotalable': true,
                        'reportTypes': [
                            'SINGLE',
                            'RETATT',
                            'BFRE',
                            'TREND'
                        ],
                        'columnReports': [
                            'factor_attrib_dd'
                        ],
                        'dataType': 'DOUBLE',
                        'columnType': 'PERFORMANCE',
                        'isNotSupportedInCustomCal': false,
                        'groups': [
                            'Performance',
                            'Exposures'
                        ],
                        'isGroupable': false,
                        'isStaticColumn': false,
                        'functionFlag': 65538,
                        'strippedName': 'Average Factor Exposure',
                        'columnFormat': {
                            'scalingOptions': {},
                            'decimalPlaces': 2,
                            'isUseThousandsSeparator': true,
                            'isScalable': true,
                            'scalingFactor': 1
                        }
                    }), false
                )
            ];
            addedColumns[0].key = 4;
            addedColumns[1].key = 5;
        });

        it('should call updateTargetList with itemMovedToTargetAreaHandler', () => {
            jest.spyOn(component, 'updateTargetList' as any);
            eventMock.detail = {value: addedColumns};
            component.itemMovedToTargetAreaHandler(eventMock);

            expect(component['updateTargetList']).toHaveBeenCalledWith('Add', addedColumns);
        });

        describe('addColumns Test', () => {
            let targetAreaColumnsCopy;

            beforeEach(() => {
                jest.spyOn(component.sourceItemMoved, 'emit');
                targetAreaColumnsCopy = cloneDeep(targetAreaColumnsMock);
            });

            it('should update targetAreaColumns, select the last added column, and emit the columns to fetch the column options (singleColumnOnly)', () => {
                component.singleColumnOnly = true;
                component.widgetType = WidgetConfigType.RISK_EXPOSURE;
                component.widgetRecentColumns =  ['Market Value'];
                let targetAreaColumns = [targetAreaColumnsCopy[0]];
                expect(targetAreaColumns[0].label).toBe('Security Description');

                targetAreaColumns = [...targetAreaColumnsCopy, ...addedColumns];
                component['addColumns'](addedColumns, targetAreaColumns, targetTreeListMock);

                expect(targetAreaColumns.length).toBe(1);
                expect(targetAreaColumns[0].label).toBe('Benchmark Average Factor Exposure');
                expect(targetAreaColumns[0].isSelected).toBeTruthy();
                expect(component.sourceItemMoved.emit).toHaveBeenCalledWith([addedColumns[addedColumns.length - 1]]);
            });

            it('should add columns to targetAreaColumns, select the last added column, and emit the columns to fetch the column options', () => {
                component.singleColumnOnly = false;
                let targetAreaColumns = targetAreaColumnsCopy;
                expect(targetAreaColumns.length).toBe(4);
                targetAreaColumns[0].isSelected = false;
                targetAreaColumns[1].isSelected = false;
                targetAreaColumns[2].isSelected = false;
                targetAreaColumns[3].isSelected = true;

                targetAreaColumns = [...targetAreaColumnsCopy, ...addedColumns];
                component['addColumns'](addedColumns, targetAreaColumns, targetTreeListMock);

                expect(targetAreaColumns.length).toBe(6);
                expect(targetAreaColumns[3].isSelected).toBeFalsy();
                expect(targetAreaColumns[5].isSelected).toBeTruthy();
                expect(component.sourceItemMoved.emit).toHaveBeenCalledWith(addedColumns);
            });
        });

        describe('updateColumnSet Test', () => {
            beforeEach(() => {
                component.columnSet = new ColumnSet();
                component.columnSet.columns = [ColumnConfig.createColumn('pct_notional_val', 'PORT', 'pct_notional_val_0', 'Notional Market Value %')];
            });
            it('should updateColumnSet (Add - singleColumnOnly)', () => {
                component.singleColumnOnly = true;

                component['updateColumnSet']('Add', [addedColumns[1]]);

                expect(component.columnSet.columns.length).toBe(1);
                expect(component.columnSet.columns[0].columnTitle).toBe('Benchmark Average Factor Exposure');
            });
            it('should updateColumnSet (Add)', () => {
                component.singleColumnOnly = false;

                component['updateColumnSet']('Add', addedColumns);

                expect(component.columnSet.columns.length).toBe(3);
                expect(component.columnSet.columns[0].columnTitle).toBe('Notional Market Value %');
                expect(component.columnSet.columns[1].columnTitle).toBe('Average Factor Exposure');
                expect(component.columnSet.columns[2].columnTitle).toBe('Benchmark Average Factor Exposure');
            });
        });
    });

    describe('updateTargetList Test - REMOVE Workflow', () => {
        it('should call updateTargetList with removeItemClickedHandler', () => {
            jest.spyOn(component, 'updateTargetList' as any);
            eventMock.detail = {value: columnSelectorOption4};
            component.removeItemClickedHandler(eventMock);

            expect(component['updateTargetList']).toHaveBeenCalledWith('Remove', columnSelectorOption4);
        });

        it('should call updateTargetList with RemoveAll', () => {
            jest.spyOn(component, 'updateTargetList' as any);
            component.removeItemClickedHandler(eventMock, true);

            expect(component['updateTargetList']).toHaveBeenCalledWith('RemoveAll');
        });

        it('should clear loaded favorite when Remove All clicked', async () => {
            component.columnSet = new ColumnSet();
            component.columnSet.columns = [
                ColumnConfig.createColumn('security_description', 'ALL', 'security_description_1', 'Security Description'),
                ColumnConfig.createColumn('cusip', 'ALL', 'cusip_0', 'CUSIP'),
                ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'Market Value %'),
            ];
            component.columnSet.id = 12345;
            component.columnSet.title = 'Column favorite';
            component.columnSet.owner = 'tilee';

            component.targetData = component['createTargetAreaColumns'](component.columnSet);

            jest.spyOn(component.targetItemRemoved, 'emit');
            await component.removeItemClickedHandler(eventMock, true);

            expect(component.columnSet.columns.length).toEqual(0);
            expect(component.columnSet.id).toBeUndefined();
            expect(component.columnSet.title).toBeUndefined();
            expect(component.columnSet.owner).toBeUndefined();
            expect(component.targetData.length).toEqual(0);
            expect(component.targetItemRemoved.emit).toHaveBeenCalledTimes(1);
        });

        describe('removeColumn Test', () => {
            let targetAreaColumnsCopy;
            beforeEach(() => {
                jest.spyOn(component.targetItemRemoved, 'emit');
                targetAreaColumnsCopy = cloneDeep(targetAreaColumnsMock);
                expect(targetAreaColumnsCopy.length).toBe(4);
                targetAreaColumnsCopy[0].isSelected = false;
                columnSelectorOption2.isSelected = targetAreaColumnsCopy[1].isSelected = true;
                targetAreaColumnsCopy[2].isSelected = false;
                columnSelectorOption4.isSelected = targetAreaColumnsCopy[3].isSelected = false;
            });

            it('should emit null to update options view if targetAreaColumns is empty', () => {
                component['removeColumn'](columnSelectorOption1, [], targetTreeListMock);

                expect(component.targetItemRemoved.emit).toHaveBeenCalledWith(null);
            });

            it('should select the very last column in targetAreaColumns, and emit it to fetch the column options if selected column is removed', () => {
                expect(targetAreaColumnsCopy[1].isSelected).toBeTruthy();
                expect(targetAreaColumnsCopy[1].label).toBe('CUSIP');
                targetAreaColumnsCopy[3].label = 'custom title';

                targetAreaColumnsCopy.splice(1, 1);
                component['removeColumn'](columnSelectorOption2, targetAreaColumnsCopy, targetTreeListMock);

                expect(targetAreaColumnsCopy[2].isSelected).toBeTruthy();
                expect(targetAreaColumnsCopy[2].label).toBe('custom title');
                expect(component.targetItemRemoved.emit).toHaveBeenCalledWith(targetAreaColumnsCopy[2]);
            });

            it('should NOT change the selected column, and NOT trigger the emitter if non-selected column is removed', () => {
                expect(targetAreaColumnsCopy[1].isSelected).toBeTruthy();
                expect(targetAreaColumnsCopy[1].label).toBe('CUSIP');

                targetAreaColumnsCopy.pop();
                component['removeColumn'](columnSelectorOption4, targetAreaColumnsCopy, targetTreeListMock);

                expect(targetAreaColumnsCopy[1].isSelected).toBeTruthy();
                expect(targetAreaColumnsCopy[1].label).toBe('CUSIP');
                expect(component.targetItemRemoved.emit).not.toHaveBeenCalled();
            });
        });

        describe('updateColumnSet Test', () => {
            beforeEach(() => {
                component.columnSet = new ColumnSet();
                component.columnSet.columns = [
                    ColumnConfig.createColumn('security_description', 'ALL', 'security_description_1', 'Security Description'),
                    ColumnConfig.createColumn('cusip', 'ALL', 'cusip_0', 'CUSIP'),
                    ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'Market Value %'),
                ];
            });

            it('should updateColumnSet (Remove)', () => {
                expect(component.columnSet.columns.length).toBe(3);
                component['updateColumnSet']('Remove', columnSelectorOption3);
                expect(component.columnSet.columns.length).toBe(2);
            });

            it('should updateColumnSet (RemoveAll)', () => {
                expect(component.columnSet.columns.length).toBe(3);
                component['updateColumnSet']('RemoveAll', []);
                expect(component.columnSet.columns.length).toBe(0);
            });
        });
    });

    describe('itemReOrderHandler Test', () => {
        it('should call updateTargetList with Reorder', () => {
            jest.useFakeTimers();
            jest.spyOn(component, 'updateTargetList' as any);
            component.itemReOrderHandler();
            jest.runOnlyPendingTimers();
            expect(component['updateTargetList']).toHaveBeenCalledWith('Reorder');
        });

        it('should call updateTargetList with ReorderDragAndDrop', () => {
            jest.useFakeTimers();
            jest.spyOn(component, 'updateTargetList' as any);
            component.itemReOrderHandler(true);
            jest.runOnlyPendingTimers();
            expect(component['updateTargetList']).toHaveBeenCalledWith('ReorderDragAndDrop');
        });

        describe('updateColumnSet Test', () => {
            it('should updateColumnSet (Reorder)', () => {
                component.columnSet = new ColumnSet();
                component.columnSet.columns = [
                    ColumnConfig.createColumn('security_description', 'ALL', 'security_description_1', 'Security Description'),
                    ColumnConfig.createColumn('cusip', 'ALL', 'cusip_0', 'CUSIP'),
                    ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'Market Value %'),
                ];

                expect(component.columnSet.columns.length).toBe(3);
                expect(component.columnSet.columns[0].columnTitle).toBe('Security Description');
                expect(component.columnSet.columns[1].columnTitle).toBe('CUSIP');
                expect(component.columnSet.columns[2].columnTitle).toBe('Market Value %');

                component['updateColumnSet']('Reorder', [columnSelectorOption1, columnSelectorOption3, columnSelectorOption2]);

                expect(component.columnSet.columns.length).toBe(3);
                expect(component.columnSet.columns[0].columnTitle).toBe('Security Description');
                expect(component.columnSet.columns[1].columnTitle).toBe('Market Value %');
                expect(component.columnSet.columns[2].columnTitle).toBe('CUSIP');
            });
        });
    });

    describe('searchData Test', () => {
        it('should search data and return filtered result', () => {
            const parent = {};
            component.showColumnCounter = true;
            const sourceData = [
                {'label': 'Absolute Market Value %', 'uid': 'abs_pct_market_val_PORT', 'children': null, 'type': 'column', 'eventData': {'uses': 'PORT'}, 'key': 0, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 9, 'matchEnd': 20},
                {'label': 'Benchmark Absolute Market Value %', 'uid': 'abs_pct_market_val_BENCH', 'children': null, 'type': 'column', 'eventData': {'uses': 'BENCH'}, 'key': 1, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 19, 'matchEnd': 30},
                {'label': 'Active Absolute Market Value %', 'uid': 'abs_pct_market_val_ACTIVE', 'children': null, 'type': 'column', 'eventData': {'uses': 'ACTIVE'}, 'key': 2, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 16, 'matchEnd': 27},
                {'label': 'Absolute Notional Market Value %', 'uid': 'abs_pct_notional_val_PORT', 'children': null, 'type': 'column', 'eventData': {'uses': 'PORT'}, 'key': 3, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 18, 'matchEnd': 29},
                {'label': 'Benchmark Absolute Notional Market Value %', 'uid': 'abs_pct_notional_val_BENCH', 'children': null, 'type': 'column', 'eventData': {'uses': 'BENCH'}, 'key': 4, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 28, 'matchEnd': 39},
                {'label': 'Active Absolute Notional Market Value %', 'uid': 'abs_pct_notional_val_ACTIVE', 'children': null, 'type': 'column', 'eventData': {'uses': 'ACTIVE'}, 'key': 5, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 25, 'matchEnd': 36},
                {'label': 'Accrued Interest', 'uid': 'acc_int_dollars_PORT', 'children': null, 'type': 'column', 'eventData': {'uses': 'PORT'}, 'key': 6, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': false, 'altSearchMatch': false, 'matchStart': null, 'matchEnd': null},
                {'label': 'Benchmark Accrued Interest', 'uid': 'acc_int_dollars_BENCH', 'children': null, 'type': 'column', 'eventData': {'uses': 'BENCH'}, 'key': 7, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': false, 'altSearchMatch': false, 'matchStart': null, 'matchEnd': null},
                {'label': 'Active Accrued Interest', 'uid': 'acc_int_dollars_ACTIVE', 'children': null, 'type': 'column', 'eventData': {'uses': 'ACTIVE'}, 'key': 8, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': false, 'altSearchMatch': false, 'matchStart': null, 'matchEnd': null},
                {'label': 'Total Transaction Cost Contribution', 'uid': 'liq_con_tcost_tot_p_ALL', 'children': null, 'type': 'column', 'eventData': {'uses': 'ALL'}, 'key': 19, 'parent': parent, 'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 0, 'matchEnd': 3},
                {'label': 'Monetary Total Transaction Cost', 'uid': 'liq_std_tcost_tot_a_ALL', 'children': null, 'type': 'column', 'eventData': {'uses': 'ALL'}, 'key': 13, 'parent': parent, 'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 9, 'matchEnd': 12},
                {'label': 'Standalone Total Transaction Cost', 'uid': 'liq_std_tcost_tot_p_ALL', 'children': null, 'type': 'column', 'eventData': {'uses': 'ALL'}, 'key': 18, 'parent': parent, 'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 11, 'matchEnd': 14}
            ];

            expect(component.columnCount).toEqual('');
            component.customSort('market value');
            expect(component['searchData'](sourceData as any, 'market value')).toEqual([
                {'children': null, 'eventData': {'uses': 'PORT'}, 'isExpanded': false, 'isHidden': false, 'key': 0, 'label': 'Absolute Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 1, 'matchEnd': 21, 'matchStart': 9, 'matchScore': 0.5, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_market_val_PORT'},
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 1, 'label': 'Benchmark Absolute Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 2, 'matchEnd': 31, 'matchStart': 19, 'matchScore': 0.5, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_market_val_BENCH'},
                {'children': null, 'eventData': {'uses': 'ACTIVE'}, 'isExpanded': false, 'isHidden': false, 'key': 2, 'label': 'Active Absolute Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 3, 'matchEnd': 28, 'matchStart': 16, 'matchScore': 0.5, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_market_val_ACTIVE'},
                {'children': null, 'eventData': {'uses': 'PORT'}, 'isExpanded': false, 'isHidden': false, 'key': 3, 'label': 'Absolute Notional Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 4, 'matchEnd': 30, 'matchStart': 18, 'matchScore': 0.4, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_notional_val_PORT'},
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 4, 'label': 'Benchmark Absolute Notional Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 5, 'matchEnd': 40, 'matchStart': 28, 'matchScore': 0.4, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_notional_val_BENCH'},
                {'children': null, 'eventData': {'uses': 'ACTIVE'}, 'isExpanded': false, 'isHidden': false, 'key': 5, 'label': 'Active Absolute Notional Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 6, 'matchEnd': 37, 'matchStart': 25, 'matchScore': 0.4, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_notional_val_ACTIVE'}
            ]);
            expect(component.columnCount).toEqual(' (6)');

            component.customSort('benchmark');
            expect(component['searchData'](sourceData as any, 'benchmark')).toEqual([
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 1, 'label': 'Benchmark Absolute Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 1, 'matchEnd': 9, 'matchStart': 0, 'matchScore': 0.2, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_market_val_BENCH'},
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 4, 'label': 'Benchmark Absolute Notional Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 2, 'matchEnd': 9, 'matchStart': 0, 'matchScore': 0.16666666666666666, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_notional_val_BENCH'},
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 7, 'label': 'Benchmark Accrued Interest', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 3, 'matchEnd': 9, 'matchStart': 0, 'matchScore': 0.3333333333333333, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'acc_int_dollars_BENCH'}
            ]);
            expect(component.columnCount).toEqual(' (3)');

            component.customSort('total');
            expect(component['searchData'](sourceData as any, 'total')).toEqual([
                {'children': null, 'eventData': {'uses': 'ALL'}, 'isExpanded': false, 'isHidden': false, 'key': 19, 'label': 'Total Transaction Cost Contribution', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 1, 'matchEnd': 5, 'matchStart': 0, 'matchScore': 0.25, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'liq_con_tcost_tot_p_ALL'},
                {'children': null, 'eventData': {'uses': 'ALL'}, 'isExpanded': false, 'isHidden': false, 'key': 13, 'label': 'Monetary Total Transaction Cost', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 2, 'matchEnd': 14, 'matchStart': 9, 'matchScore': 0.25, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'liq_std_tcost_tot_a_ALL'},
                {'children': null, 'eventData': {'uses': 'ALL'}, 'isExpanded': false, 'isHidden': false, 'key': 18, 'label': 'Standalone Total Transaction Cost', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 3, 'matchEnd': 16, 'matchStart': 11, 'matchScore': 0.25, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'liq_std_tcost_tot_p_ALL'}
            ]);
            expect(component.columnCount).toEqual(' (3)');

            component.sourceData = sourceData;
            expect(component['getSourceData']()).toEqual(sourceData);
            expect(component.columnCount).toEqual('');
        });

        it('should search data and return filtered result but not show measure counter ', () => {
            const parent = {'isExpanded': true};
            const sourceData = [
                {'label': 'Absolute Market Value %', 'uid': 'abs_pct_market_val_PORT', 'children': null, 'type': 'column', 'eventData': {'uses': 'PORT'}, 'key': 0, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 9, 'matchEnd': 20},
                {'label': 'Benchmark Absolute Market Value %', 'uid': 'abs_pct_market_val_BENCH', 'children': null, 'type': 'column', 'eventData': {'uses': 'BENCH'}, 'key': 1, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 19, 'matchEnd': 30},
                {'label': 'Active Absolute Market Value %', 'uid': 'abs_pct_market_val_ACTIVE', 'children': null, 'type': 'column', 'eventData': {'uses': 'ACTIVE'}, 'key': 2, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 16, 'matchEnd': 27},
                {'label': 'Absolute Notional Market Value %', 'uid': 'abs_pct_notional_val_PORT', 'children': null, 'type': 'column', 'eventData': {'uses': 'PORT'}, 'key': 3, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 18, 'matchEnd': 29},
                {'label': 'Benchmark Absolute Notional Market Value %', 'uid': 'abs_pct_notional_val_BENCH', 'children': null, 'type': 'column', 'eventData': {'uses': 'BENCH'}, 'key': 4, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 28, 'matchEnd': 39},
                {'label': 'Active Absolute Notional Market Value %', 'uid': 'abs_pct_notional_val_ACTIVE', 'children': null, 'type': 'column', 'eventData': {'uses': 'ACTIVE'}, 'key': 5, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 25, 'matchEnd': 36},
                {'label': 'Accrued Interest', 'uid': 'acc_int_dollars_PORT', 'children': null, 'type': 'column', 'eventData': {'uses': 'PORT'}, 'key': 6, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': false, 'altSearchMatch': false, 'matchStart': null, 'matchEnd': null},
                {'label': 'Benchmark Accrued Interest', 'uid': 'acc_int_dollars_BENCH', 'children': null, 'type': 'column', 'eventData': {'uses': 'BENCH'}, 'key': 7, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': false, 'altSearchMatch': false, 'matchStart': null, 'matchEnd': null},
                {'label': 'Active Accrued Interest', 'uid': 'acc_int_dollars_ACTIVE', 'children': null, 'type': 'column', 'eventData': {'uses': 'ACTIVE'}, 'key': 8, 'parent': parent,  'isExpanded': false, 'isHidden': false, 'match': false, 'altSearchMatch': false, 'matchStart': null, 'matchEnd': null},
                {'label': 'Total Transaction Cost Contribution', 'uid': 'liq_con_tcost_tot_p_ALL', 'children': null, 'type': 'column', 'eventData': {'uses': 'ALL'}, 'key': 19, 'parent': parent, 'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 0, 'matchEnd': 3},
                {'label': 'Monetary Total Transaction Cost', 'uid': 'liq_std_tcost_tot_a_ALL', 'children': null, 'type': 'column', 'eventData': {'uses': 'ALL'}, 'key': 13, 'parent': parent, 'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 9, 'matchEnd': 12},
                {'label': 'Standalone Total Transaction Cost', 'uid': 'liq_std_tcost_tot_p_ALL', 'children': null, 'type': 'column', 'eventData': {'uses': 'ALL'}, 'key': 18, 'parent': parent, 'isExpanded': false, 'isHidden': false, 'match': true, 'altSearchMatch': false, 'matchStart': 11, 'matchEnd': 14},
            ];
            component.showColumnCounter = false;
            component.customSort('benchmark');
            expect(component['searchData'](sourceData as any, 'benchmark')).toEqual([
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 1, 'label': 'Benchmark Absolute Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 1, 'matchEnd': 9, 'matchStart': 0, 'matchScore': 0.2, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_market_val_BENCH'},
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 4, 'label': 'Benchmark Absolute Notional Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 2, 'matchEnd': 9, 'matchStart': 0, 'matchScore': 0.16666666666666666, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_notional_val_BENCH'},
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 7, 'label': 'Benchmark Accrued Interest', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 3, 'matchEnd': 9, 'matchStart': 0, 'matchScore': 0.3333333333333333, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'acc_int_dollars_BENCH'}
            ]);
            expect(component.columnCount).toEqual('');

            component.sourceData = sourceData;
            expect(component['getSourceData']()).toEqual(sourceData);
            expect(component.columnCount).toEqual('');
            component.customSort('market value');
            expect(component['searchData'](sourceData as any, 'market value')).toEqual([
                {'children': null, 'eventData': {'uses': 'PORT'}, 'isExpanded': false, 'isHidden': false, 'key': 0, 'label': 'Absolute Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 1, 'matchEnd': 21, 'matchStart': 9, 'matchScore': 0.5, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_market_val_PORT'},
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 1, 'label': 'Benchmark Absolute Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 2, 'matchEnd': 31, 'matchStart': 19, 'matchScore': 0.5,  'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_market_val_BENCH'},
                {'children': null, 'eventData': {'uses': 'ACTIVE'}, 'isExpanded': false, 'isHidden': false, 'key': 2, 'label': 'Active Absolute Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 3, 'matchEnd': 28, 'matchStart': 16, 'matchScore': 0.5,  'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_market_val_ACTIVE'},
                {'children': null, 'eventData': {'uses': 'PORT'}, 'isExpanded': false, 'isHidden': false, 'key': 3, 'label': 'Absolute Notional Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 4, 'matchEnd': 30, 'matchStart': 18, 'matchScore': 0.4, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_notional_val_PORT'},
                {'children': null, 'eventData': {'uses': 'BENCH'}, 'isExpanded': false, 'isHidden': false, 'key': 4, 'label': 'Benchmark Absolute Notional Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 5, 'matchEnd': 40, 'matchStart': 28, 'matchScore': 0.4, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_notional_val_BENCH'},
                {'children': null, 'eventData': {'uses': 'ACTIVE'}, 'isExpanded': false, 'isHidden': false, 'key': 5, 'label': 'Active Absolute Notional Market Value %', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 6, 'matchEnd': 37, 'matchStart': 25, 'matchScore': 0.4, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'abs_pct_notional_val_ACTIVE'}
            ]);
            expect(component.columnCount).toEqual('');

            component.customSort('total');
            expect(component['searchData'](sourceData as any, 'total')).toEqual([
                {'children': null, 'eventData': {'uses': 'ALL'}, 'isExpanded': false, 'isHidden': false, 'key': 19, 'label': 'Total Transaction Cost Contribution', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 1, 'matchEnd': 5, 'matchStart': 0, 'matchScore': 0.25, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'liq_con_tcost_tot_p_ALL'},
                {'children': null, 'eventData': {'uses': 'ALL'}, 'isExpanded': false, 'isHidden': false, 'key': 13, 'label': 'Monetary Total Transaction Cost', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 2, 'matchEnd': 14, 'matchStart': 9, 'matchScore': 0.25, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'liq_std_tcost_tot_a_ALL'},
                {'children': null, 'eventData': {'uses': 'ALL'}, 'isExpanded': false, 'isHidden': false, 'key': 18, 'label': 'Standalone Total Transaction Cost', 'match': true, 'altSearchMatch': false, 'numericalColumnOrder': 3, 'matchEnd': 16, 'matchStart': 11, 'matchScore': 0.25, 'parent': {'isExpanded': true, 'match': true}, 'type': 'column', 'uid': 'liq_std_tcost_tot_p_ALL'}
            ]);
            expect(component.columnCount).toEqual('');
        });
    });

    describe('updateStatusTag', () => {
        it('should call markForCheck on changeDetectorRef', () => {
            jest.spyOn(component['changeDetectorRef'], 'markForCheck');
            component.updateStatusTag();
            expect(component['changeDetectorRef'].markForCheck).toHaveBeenCalled();
        });
    });

    it('tooltip event handler', fakeAsync(() => {
        const description = 'Credit Profile Direction - looking through a business cycle';
        const colDef = new ColumnDefinition();
        colDef.columnTag = 'galileo_CPD_G';

        const optionData: AuxAdvancedTreeListInterface = {
            label: 'item',
            eventData: colDef,
            isLearnLink: true
        };

        component.onTooltip(optionData).then((value: string) => {
            expect(value).toContain('Definition');
        });

        flush();
    }));

    it('search criteria changed', fakeAsync(() => {
        eventMock.detail = {
            value:
                {
                    displayValue: 'Search by definition'
                }
        };

        component.searchCriteriaChanged(eventMock);

        expect(component.isDescriptionSearch).toBeTruthy;

        flush();
    }));

    describe('updateColumnSelectorOptionModel Test', () => {
        it('should update targetAreaColumns', async() => {
            const columnSelectorOption = cloneDeep(columnSelectorOption1);
            columnSelectorOption.eventData.column.optionValues = [{
                'decimalPlaces': 2,
                'useThousandsSeparator': true,
                'scaling': 1,
                'configType': 'customColumnTitle'
            }];
            targetAreaColumnsMock = [columnSelectorOption];
            const columnSelectorOptionExpected = cloneDeep(columnSelectorOption);
            columnSelectorOptionExpected.eventData.column.optionValues[0].decimalPlaces = 4;
            expect(targetAreaColumnsMock[0]).not.toEqual(columnSelectorOptionExpected);

            await component['updateColumnSelectorOptionModel']([columnSelectorOptionExpected.eventData.column], columnSelectorOptionExpected.eventData.column.optionValues[0]);

            expect(targetAreaColumnsMock[0]).toEqual(columnSelectorOptionExpected);
            expect(targetAreaColumnsMock[0].eventData.column.optionValues[0].decimalPlaces).toEqual(4);
        });
    });
});
