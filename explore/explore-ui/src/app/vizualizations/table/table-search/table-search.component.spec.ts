import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TableSearchComponent} from './table-search.component';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {Widget} from '@models/widget/widget.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {TestUtils} from '@utils/test.utils';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {AuxSearchFieldSearchValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('TableSearchComponent', () => {
    let component: TableSearchComponent;
    let fixture: ComponentFixture<TableSearchComponent>;

    let widgetPayload: WidgetPayload;
    let columnSet: ColumnSet;

    const rowsLoaded$Mock = new Subject<string[]>();
    const isTableSearchActive$Mock = new BehaviorSubject<boolean>(true);

    beforeAll((done) => {
        TestUtils.initialize(done);
        const request: RequestAdapterConfig = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    originalColumnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    originalColumnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    originalColumnTitle: 'pct_mv_1',
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
            responseConfig: data1.data as any,
            cube: new TreeCube('PEP', request.columns, data1.data)
        };

        columnSet = new Widget(WidgetConfigType.RISK_EXPOSURE).dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TableSearchComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(TableSearchComponent);
        component = fixture.componentInstance;
        component.columnSet = columnSet;
        component.data = widgetPayload;
        component.rowsLoaded$ = rowsLoaded$Mock.asObservable();
        component.isTableSearchActive$ = isTableSearchActive$Mock;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.selectBoxColumns.data.length).toBeDefined();
        expect(component.treeCube).toBeDefined();
    });

    it('should populate select box with columns', () => {
        expect(component.selectBoxColumns).toEqual({
            data: [
                {
                    values: [
                        {displayValue: 'Security Description', value: 'security_description_1'},
                        {displayValue: 'CUSIP', value: 'cusip_0'},
                        {displayValue: 'Market Value %', value: 'pct_mv_1'}
                    ]
                }
            ]
        });
    });

    it('should toggle wrap search button', () => {
        const previousValue = component.isWrap;
        component.toggleIsWrap();
        expect(component.isWrap).not.toEqual(previousValue);
    });

    it('should clear all search data when closed', () => {
        component.searchTerm = 'test';
        component.currentMatchIndex = 5;
        component.matches = [{rowId: 2 as any, isLeafNode: true, columnKey: 'column', path: [1, 2, 3] as any[]}];
    });

    it('should update the search value when it changes', () => {
        expect(component.searchTerm).toEqual('');
        const mockEvent = new CustomEvent('valueChanged', {
            detail: {
                type: 'valueChanged',
                submitValue: {
                    searchValue: 'china'
                }
            } as AuxSearchFieldSearchValueChangedDetailInterface
        });
        component.onSearchValueChanged(mockEvent);
        expect(component.searchTerm).toEqual('china');
    });


    it('should update the search column when it changes', () => {
        expect(component.columnSelected).toBeNull();
        const mockEvent = new CustomEvent('selectionChanged', {
            detail: {
                type: 'selectionChanged',
                submitValue: {
                    parameter: {
                        value: 'security_description_1'
                    }
                }
            } as AuxSearchFieldSearchValueChangedDetailInterface
        });
        component.onSearchValueChanged(mockEvent);
        expect(component.columnSelected).toEqual('security_description_1');
    });

    describe('Search Process', () => {
        const getRowNodeMock = jest.fn();
        const ensureIndexVisibleMock = jest.fn();
        const ensureColumnVisibleMock = jest.fn();
        const getSelectedRowsMock = jest.fn(() => []);

        const setExpandedMock = jest.fn();
        const setSelectedMock = jest.fn();

        const baseRowNodeMock = {
            isExpandable: () => true,
            setExpanded: setExpandedMock,
            setSelected: setSelectedMock
        };

        beforeEach(() => {
            component.gridApi = {
                getRowNode: getRowNodeMock,
                ensureIndexVisible: ensureIndexVisibleMock,
                ensureColumnVisible: ensureColumnVisibleMock,
                getSelectedRows: getSelectedRowsMock
            } as any;
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should start a search on the table when search clicked and display the first result', () => {
            getRowNodeMock.mockReturnValue({id: 1, rowIndex: 0, ...baseRowNodeMock});
            component.searchTerm = 'china';

            expect(component.isSearchInProgress).toEqual(false);

            const mockEvent = new CustomEvent('submitted', {});
            component.onSearchClicked(mockEvent as CustomEvent);

            expect(component.isSearchInProgress).toEqual(true);
            expect(component.currentMatchIndex).toEqual(0);
            expect(component.matches).toHaveLength(3);
            expect(component.matches[0].rowId).toEqual(11);
            expect(component.matches[0].columnKey).toEqual('security_description_1');
            expect(component.matches[0].path).toEqual([1, 8, 9]);

            // 4 nodes in total (path nodes + match node)
            expect(getRowNodeMock).toHaveBeenCalledTimes(4);
            expect(getRowNodeMock).toHaveBeenNthCalledWith(1, '1');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(2, '8');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(3, '9');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(4, '11');
            expect(ensureIndexVisibleMock).toHaveBeenCalledTimes(4);
            // 3 groups to expand
            expect(setExpandedMock).toHaveBeenCalledTimes(3);
            // select match
            expect(setSelectedMock).toHaveBeenCalledTimes(1);
            expect(ensureColumnVisibleMock).toHaveBeenCalledTimes(1);
            expect(ensureColumnVisibleMock).toHaveBeenCalledWith('security_description_1');
        });

        it('should move to the next match when the "Next" button is pressed', () => {
            getRowNodeMock.mockReturnValue({id: 1, rowIndex: 0, ...baseRowNodeMock});
            component.searchTerm = 'china';
            const mockEvent = new CustomEvent('submitted', {});
            component.onSearchClicked(mockEvent as CustomEvent);
            jest.clearAllMocks();

            expect(component.isSearchInProgress).toEqual(true);
            expect(component.currentMatchIndex).toEqual(0);

            component.showNextResult();

            expect(component.currentMatchIndex).toEqual(1);

            // 4 nodes in total (path nodes + match node)
            expect(getRowNodeMock).toHaveBeenCalledTimes(4);
            expect(getRowNodeMock).toHaveBeenNthCalledWith(1, '1');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(2, '8');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(3, '9');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(4, '13');
            expect(ensureIndexVisibleMock).toHaveBeenCalledTimes(4);
            // 3 groups to expand
            expect(setExpandedMock).toHaveBeenCalledTimes(3);
            // select match
            expect(setSelectedMock).toHaveBeenCalledTimes(1);
            expect(ensureColumnVisibleMock).toHaveBeenCalledTimes(1);
            expect(ensureColumnVisibleMock).toHaveBeenCalledWith('security_description_1');
        });

        it('should move to the previous result when "Previous" clicked and wrap around when wrap search is enabled', () => {
            getRowNodeMock.mockReturnValue({id: 1, rowIndex: 0, ...baseRowNodeMock});
            component.searchTerm = 'china';
            const mockEvent = new CustomEvent('submitted', {});
            component.onSearchClicked(mockEvent as CustomEvent);
            jest.clearAllMocks();

            expect(component.isSearchInProgress).toEqual(true);
            expect(component.currentMatchIndex).toEqual(0);

            component.showPreviousResult();

            expect(component.currentMatchIndex).toEqual(2);

            // 4 nodes in total (path nodes + match node)
            expect(getRowNodeMock).toHaveBeenCalledTimes(4);
            expect(getRowNodeMock).toHaveBeenNthCalledWith(1, '1');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(2, '44');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(3, '45');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(4, '46');
            expect(ensureIndexVisibleMock).toHaveBeenCalledTimes(4);
            // 3 groups to expand
            expect(setExpandedMock).toHaveBeenCalledTimes(3);
            // select match
            expect(setSelectedMock).toHaveBeenCalledTimes(1);
            expect(ensureColumnVisibleMock).toHaveBeenCalledTimes(1);
            expect(ensureColumnVisibleMock).toHaveBeenCalledWith('security_description_1');
        });

        it('should not show as search in progress if no matches and Next/Previous should be disabled', () => {
            component.searchTerm = 'no_results_term';

            expect(component.isSearchInProgress).toEqual(false);

            const mockEvent = new CustomEvent('submitted', {});
            component.onSearchClicked(mockEvent as CustomEvent);

            expect(component.isSearchInProgress).toEqual(false);
            expect(component.currentMatchIndex).toEqual(0);
            expect(component.matches).toHaveLength(0);
            expect(component.isPreviousEnabled).toEqual(false);
            expect(component.isNextEnabled).toEqual(false);

            expect(getRowNodeMock).toHaveBeenCalledTimes(0);
            expect(ensureIndexVisibleMock).toHaveBeenCalledTimes(0);
            expect(setExpandedMock).toHaveBeenCalledTimes(0);
            expect(setSelectedMock).toHaveBeenCalledTimes(0);
            expect(ensureColumnVisibleMock).toHaveBeenCalledTimes(0);
        });

        it('should wait for rowsLoaded$ to be called before continuing to traverse path when data needs to be loaded', () => {
            getRowNodeMock
                .mockReturnValueOnce({id: 1, rowIndex: 0, ...baseRowNodeMock})
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce({id: 9, rowIndex: 8, ...baseRowNodeMock})
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce({id: 10, rowIndex: 9, ...baseRowNodeMock})
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce({id: 11, rowIndex: 11, ...baseRowNodeMock});
            component.searchTerm = 'china';

            expect(component.isSearchInProgress).toEqual(false);

            const mockEvent = new CustomEvent('submitted', {});

            // first node already loaded, others will need to be loaded
            component.onSearchClicked(mockEvent as CustomEvent);

            expect(component.isSearchInProgress).toEqual(true);
            expect(component.currentMatchIndex).toEqual(0);

            // 4 nodes in total (path nodes + match node)
            expect(getRowNodeMock).toHaveBeenCalledTimes(2);
            expect(getRowNodeMock).toHaveBeenNthCalledWith(1, '1');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(2, '8');
            expect(ensureIndexVisibleMock).toHaveBeenCalledTimes(1);
            expect(setExpandedMock).toHaveBeenCalledTimes(1);

            // simulate rows being loaded
            rowsLoaded$Mock.next([8] as any[]);
            expect(getRowNodeMock).toHaveBeenCalledTimes(4);
            expect(getRowNodeMock).toHaveBeenNthCalledWith(3, '8');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(4, '9');
            expect(ensureIndexVisibleMock).toHaveBeenCalledTimes(2);
            expect(setExpandedMock).toHaveBeenCalledTimes(2);


            // simulate rows being loaded
            rowsLoaded$Mock.next([9] as any[]);
            expect(getRowNodeMock).toHaveBeenCalledTimes(6);
            expect(getRowNodeMock).toHaveBeenNthCalledWith(5, '9');
            expect(getRowNodeMock).toHaveBeenNthCalledWith(6, '11');
            expect(ensureIndexVisibleMock).toHaveBeenCalledTimes(3);
            expect(setExpandedMock).toHaveBeenCalledTimes(3);

            // simulate rows being loaded
            rowsLoaded$Mock.next([11] as any[]);
            expect(getRowNodeMock).toHaveBeenCalledTimes(7);
            expect(getRowNodeMock).toHaveBeenNthCalledWith(7, '11');
            expect(ensureIndexVisibleMock).toHaveBeenCalledTimes(4);
            expect(setExpandedMock).toHaveBeenCalledTimes(3);
            expect(setSelectedMock).toHaveBeenCalledTimes(1);
            expect(ensureColumnVisibleMock).toHaveBeenCalledTimes(1);
            expect(ensureColumnVisibleMock).toHaveBeenCalledWith('security_description_1');
        });

        it('should disable Previous button when wrap is disabled and on first search result', () => {
            getRowNodeMock.mockReturnValue({id: 1, rowIndex: 0, ...baseRowNodeMock});
            component.isWrap = false;
            component.searchTerm = 'china';
            const mockEvent = new CustomEvent('submitted', {});
            component.onSearchClicked(mockEvent as CustomEvent);

            expect(component.isPreviousEnabled).toEqual(false);
            expect(component.isNextEnabled).toEqual(true);
        });

        it('should unselect all rows and disabled next when wrap is disabled and at end of search results', () => {
            getRowNodeMock.mockReturnValue({id: 1, rowIndex: 0, ...baseRowNodeMock});
            component.isWrap = false;
            component.searchTerm = 'china';
            const mockEvent = new CustomEvent('submitted', {});
            component.onSearchClicked(mockEvent as CustomEvent);
            component.showNextResult();
            component.showNextResult();
            component.showNextResult();

            expect(component.isPreviousEnabled).toEqual(true);
            expect(component.isNextEnabled).toEqual(false);
            expect(getSelectedRowsMock).toHaveBeenCalled();
        });
    });
});
