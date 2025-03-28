import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
    ColumnConfig,
    CoreTestUtils,
    CoreWidgetConfigStore,
    WidgetConfig,
    WidgetConfigType,
} from '@blk/explore-ui-core';
import {of} from 'rxjs';
import {isEqual, isFunction} from 'lodash';
import {ColumnOptionInitializer} from '../../column-option.initializer';
import {CustomTitleColumnOption} from '../../models/column-option/custom-title-column-option.model';
import {ColumnSelectorOption} from '../../models/ui/column-selector-option.model';
import {SelectedColumnSelectorOption} from '../../models/ui/selected-column-selector-option.model';
import {ColumnOptionService} from '../../services/column-option.service';
import {ColumnOptionTestUtils} from '../../test-utils/column-option-test.utils';
import * as riskExposureConfig from '../../test-utils/widget-configs/risk-and-exposure-widget.json';
import {BaseColumnSetSettingsComponent} from './base-column-set-settings.component';
import {CustomCalculationConstants} from '../../constants/custom-calculation.constants';

describe('BaseColumnSetSettingsComponent', () => {
    let component: BaseColumnSetSettingsComponent;
    let fixture: ComponentFixture<BaseColumnSetSettingsComponent>;
    let columnOptionsServiceMock;

    const TEST_COLUMN_CONFIG = new ColumnConfig({
        columnTag: 'dummy_col'
    });

    const TEST_SELECTED_COL_SELECTOR_OPT = new SelectedColumnSelectorOption(TEST_COLUMN_CONFIG, []);

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionInitializer.registerColumnConfigTypes();
        ColumnOptionInitializer.registerColumnOptionTypes();
    });

    beforeEach(() => {
        columnOptionsServiceMock = {
            fetchColumnOptions$: jest.fn(() => of([{
                colTag: 'pct_mv',
                use: 'PORT',
                options: [],
                columnOptionType: 'ColumnOption'
            }])),
            fetchAndPopulateColumnOptions$: jest.fn(
                (selectedColumns, additionalColumnOptions, restrictedColumnOptions, columnCallback?) => {
                    // For the purposes of this test, invoke the callback if it is a function so we capture coverage
                    if (isFunction(columnCallback)) {
                        columnCallback(TEST_COLUMN_CONFIG);
                    }

                    return of([TEST_SELECTED_COL_SELECTOR_OPT]);
                }),

            setColumnOptionMap: jest.fn(),
            copyButtonClickEvent: jest.fn()
        };

        TestBed.configureTestingModule({
            declarations: [BaseColumnSetSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnOptionService, useValue: columnOptionsServiceMock},
            ]
        });

        fixture = TestBed.createComponent(BaseColumnSetSettingsComponent);
        component = fixture.componentInstance;

        const widgetConfig = new WidgetConfig(riskExposureConfig);
        component.widgetConfigInput = widgetConfig.inputCategories[0].inputs[0];
        component.widgetType = WidgetConfigType.RISK_EXPOSURE;
        CoreWidgetConfigStore.chartConfig.set(WidgetConfigType.RISK_EXPOSURE, widgetConfig);
        component.inputs = ColumnOptionTestUtils.getWidgetInputMap();

        component.isApplyButtonDisabled = {value: 0};

        fixture.detectChanges();
    });

    afterEach(() => {
        columnOptionsServiceMock.fetchColumnOptions$.mockReset();
        columnOptionsServiceMock.fetchAndPopulateColumnOptions$.mockReset();
        columnOptionsServiceMock.setColumnOptionMap.mockReset();
        columnOptionsServiceMock.copyButtonClickEvent.mockReset();
    });

    describe('initializeComponent Test', () => {
        it('Test ngOnInit', () => {
            expect(component.widgetInput).not.toBeUndefined();
            expect(component.selectDropdownProps).not.toBeUndefined();
        });

        it('should trigger columnOptionUpdated$', fakeAsync(() => {
            component.selectedColumnConfig = new ColumnConfig();
            component.selectedColumnConfig.optionValues.push(new CustomTitleColumnOption({customTitle: 'customTitle'}));
            component.columnOptionUpdated$.next({column: ColumnConfig.createColumn('pct_mv'), isSaveUpdate: false});
            tick(10);
            // First titleMod was Market Value % , now it is customTitle
            expect(component.titleMod).toBe('customTitle');
        }));
    });

    describe('onTargetItemRemoved Test', () => {
        it('should trigger selectedColumnConfig$ with null', () => {
            jest.spyOn(component.selectedColumnConfig$, 'next');
            component.onTargetItemRemoved(null);

            expect(component.selectedColumnConfig$.next).toHaveBeenCalledWith(null);
        });
        it('should call onTargetSelectionChanged with selectedColumn', () => {
            jest.spyOn(component, 'onTargetSelectionChanged');
            const selectedColumn = new ColumnSelectorOption('CUSIP');
            selectedColumn.eventData = new SelectedColumnSelectorOption(new ColumnConfig(), []);
            component.onTargetItemRemoved(selectedColumn);

            expect(component.onTargetSelectionChanged).toHaveBeenCalledWith(selectedColumn);
        });
    });

    describe('isColumnOptionRequired Test', () => {
        it('should set selectedColumnConfig', () => {
            const columnSelectorOption: SelectedColumnSelectorOption = new SelectedColumnSelectorOption(ColumnConfig.createColumn(CustomCalculationConstants.CUSTOM_CALCULATION), []);
            component.singleSelectionAllowed = true;
            const isColOptionRequired: boolean = component['isColumnOptionRequired']([columnSelectorOption]);
            expect(isColOptionRequired).toBeFalsy();
            expect(component.selectedColumnConfig).not.toBeUndefined();
        });
    });

    describe('onTargetSelectionChanged Test', () => {
        it('should fetch column options when target selection changing', fakeAsync(() => {
            // Arrange
            const columnConfigMock = ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1');
            const columnSelectorOptionMock: ColumnSelectorOption = {
                label: 'test',
                eventData: new SelectedColumnSelectorOption(columnConfigMock, [])
            };

            const columnOptionsFetchedNextSpy = jest.spyOn(component.columnOptionsFetched$, 'next');
            const selectedColumnConfigNextSpy = jest.spyOn(component.selectedColumnConfig$, 'next');

            // Act
            component.onTargetSelectionChanged(columnSelectorOptionMock);
            tick(100);

            // Assert
            expect(columnOptionsServiceMock.fetchAndPopulateColumnOptions$).toHaveBeenCalledTimes(1);

            // Assert side-effects
            expect(component.selectedColumnConfig).toBe(TEST_COLUMN_CONFIG);
            expect(columnOptionsFetchedNextSpy).toHaveBeenCalledWith([TEST_SELECTED_COL_SELECTOR_OPT]);
            expect(selectedColumnConfigNextSpy).toHaveBeenCalledWith(TEST_COLUMN_CONFIG);
        }));

        it('should not fetch column option if selected column already have options', () => {
            const columnConfigMock = ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1');
            const columnSelectorOptionMock: ColumnSelectorOption = {
                label: 'test',
                eventData: new SelectedColumnSelectorOption(columnConfigMock, [
                    {
                        columnOptionConfigType: 'aggregation',
                        columnOptionKey: 'aggregation',
                        columnOptionTitle: 'Aggregation',
                        columnOptionAttributes: []
                    }
                ])
            };

            component.onTargetSelectionChanged(columnSelectorOptionMock);

            expect(columnOptionsServiceMock.fetchAndPopulateColumnOptions$).not.toHaveBeenCalled();
        });
    });

    describe('onColumnsAddedToTargetArea Test', () => {
        const columnConfig = new ColumnConfig({
            optionValues: [],
            columnTag: 'pct_mv',
            columnKey: 'pct_mv_1',
            positionColumnType: 'PORT',
            columnTitle: 'Market Value %'
        });

        const column = new SelectedColumnSelectorOption(columnConfig, []);

        const columnSelectorOption: ColumnSelectorOption = {
            'label': 'Market Value %',
            'uid': 'a4aaec91-1a50-4abe-8120-3697b1f418e9',
            'eventData': column,
            'isSelected': false,
            'key': 2,
            'match': false,
            'isExpanded': false,
        };

        it('should call fetchAndPopulateColumnOptions with columns to fetch', fakeAsync(() => {
            component.onColumnsAddedToTargetArea([columnSelectorOption]);
            tick(100);

            expect(columnOptionsServiceMock.fetchAndPopulateColumnOptions$).toHaveBeenCalledTimes(1);
        }));
    });

    describe('copyButtonClickEventHandler Test', () => {
        it('should set sourceColumnOptionMetaDataForCopy', () => {
            const columnOptionForCopy = {
                'columnOptionAttributes': [
                    {
                        'title': 'Compare Type',
                        'key': 'compareType',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    },
                    {
                        'title': 'Compare Value',
                        'key': 'compareValue',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    },
                    {
                        'title': 'Highlight Color',
                        'key': 'highlightColor',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    }
                ],
                'columnOptionConfigType': 'highlight',
                'columnOptionTitle': 'Highlight',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.HighlightColumnOptions',
                'columnOptionKey': 'highlight'
            };
            component.copyButtonClickEventHandler(columnOptionForCopy);
            expect(isEqual(component.sourceColumnOptionMetaDataForCopy, columnOptionForCopy)).toBeTruthy();
        });
    });


    describe('getFilteredAvailableColumns', () => {
        it('should handle all categories updated', () => {
            component.filteredCategories = ['Category1', 'Category2'];
            component.filteredSubCategories = ['SubCategory1', 'SubCategory2'];
            component.filteredSubCategoriesL2 = ['SubCategoryL21', 'SubCategoryL22'];

            const result = component.getFilteredAvailableColumns(true, true, true);

            expect(component.categoriesData.length).toEqual(1);
            expect(result.length).toEqual(13);
        });

        it('should handle only main categories updated', () => {
            component.filteredCategories = ['Mortgage', 'Research'];

            let result = component.getFilteredAvailableColumns(true, false, false);

            expect(component.filteredCategories).not.toBeUndefined();
            expect(component.filteredSubCategories).toBeUndefined();
            expect(component.filteredSubCategoriesL2).toBeUndefined();
            expect(component.categoriesData.length).toEqual(2);
            expect(result.length).toEqual(2);

            // test when user has clicked on clear filter for categories
            component.filteredCategories = [];
            result = component.getFilteredAvailableColumns(true, false, false);
            expect(component.filteredCategories.length).toBe(0);
            expect(component.filteredSubCategories.length).toBe(0);
            expect(component.filteredSubCategoriesL2.length).toBe(0);
            expect(component.categoriesData.length).toEqual(1);
            expect(result.length).toEqual(13);
        });

        it('should handle only sub categories L1 updated', () => {
            component.filteredCategories = ['Mortgage', 'Research'];
            component.filteredSubCategories = ['Pool Characteristics', 'Approval Lists'];

            let result = component.getFilteredAvailableColumns(false, true, false);

            expect(component.filteredCategories).not.toBeUndefined();
            expect(component.filteredSubCategories).not.toBeUndefined();
            expect(component.filteredSubCategoriesL2).toBeUndefined();
            expect(component.categoriesData.length).toEqual(2);
            expect(result.length).toEqual(2);

            // test when user has clicked on clear filter for sub categories
            component.filteredSubCategories = [];
            result = component.getFilteredAvailableColumns(false, true, false);
            expect(component.filteredCategories.length).toBe(2);
            expect(component.filteredSubCategories.length).toBe(0);
            expect(component.filteredSubCategoriesL2.length).toBe(0);
            expect(component.categoriesData.length).toEqual(2);
            expect(result.length).toEqual(2);
        });

        it('should handle only sub categories L2 updated', () => {
            component.filteredCategories = ['Mortgage', 'Research'];
            component.filteredSubCategories = ['Pool Characteristics', 'Approval Lists'];
            component.filteredSubCategoriesL2 = ['Lp Data', 'Mps'];

            const result = component.getFilteredAvailableColumns(false, false, true);

            expect(component.filteredCategories).not.toBeUndefined();
            expect(component.filteredSubCategories).not.toBeUndefined();
            expect(component.filteredSubCategoriesL2).not.toBeUndefined();
            expect(component.categoriesData.length).toEqual(1);
            expect(result.length).toEqual(2);
        });
    });
});
