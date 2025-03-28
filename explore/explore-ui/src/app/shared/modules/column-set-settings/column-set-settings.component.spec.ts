import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, of, Subject, throwError} from 'rxjs';
import {
    ColumnOptionService,
    ColumnOptionUtils, ColumnSelectorOption,
    ColumnSet,
    LiquidityColumnOption,
    SECLiquiditySettings
} from '@blk/explore-ui-column-option';
import {ColumnSetSettingsComponent} from './column-set-settings.component';
import {WidgetConfigFactory} from '../../../factories/widget-config.factory';
import {Widget} from '@models/widget/widget.model';
import {UserMetaDataStore, WorkspaceStore} from '@stores/index';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {FavoriteService} from '@services/favorite';
import {FavoriteConstants} from '@constants/favorite.constants';
import {AppStore} from '../../../app.store';
import {ColumnUtils} from '@utils/index';
import {TestUtils} from '@utils/test.utils';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {HttpClient} from '@angular/common/http';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {WidgetSettingsStore} from '../../../modules/widget/widget-settings/widget-settings.store';
import {
    ColumnConfig,
    CoreUserMetaDataStore,
    ErrorTypeConstants, ExploreCheckbox,
    PortfolioDefaults, UIErrorParameters,
    UserMetaData,
    WidgetConfigType,
    WidgetInput
} from '@blk/explore-ui-core';
import {
    AuxFilterBarData,
    AuxFilterBarDataChangedInterface,
    AuxSearchFieldSearchValueChangedDetailInterface, AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import any = jasmine.any;

describe('ColumnSetSettingsComponent', () => {
    let component: ColumnSetSettingsComponent;
    let fixture: ComponentFixture<ColumnSetSettingsComponent>;
    let widget: Widget;
    const httpGetMockFn = jest.fn();
    const httpPostMockFn = jest.fn();

    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn(() => of([{
            colTag: 'pct_mv',
            use: 'PORT',
            options: []
        }]))
    };

    const httpMock = {
        get: httpGetMockFn,
        post: httpPostMockFn
    };

    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };

    const appStoreStub = {
        openLoadFavoriteModal$: new BehaviorSubject({
            type: null,
            treeType: null,
            displayName: null,
            loadEnterpriseTree: null,
            callback: null
        }),
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null))
    };

    const widgetSettingsStoreStub = {
        sourceDataUpdated$: new Subject(),
        columnSetUpdated$: new Subject()
    };

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentWorkpad(new FlatWorkpad(), new Portfolio());
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ColumnSetSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnOptionService, useValue: columnOptionsServiceMock},
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: AppStore, useValue: appStoreStub},
                {provide: WidgetSettingsStore, useValue: widgetSettingsStoreStub},
                {provide: HttpClient, useValue: httpMock}
            ]
        });

        fixture = TestBed.createComponent(ColumnSetSettingsComponent);
        component = fixture.componentInstance;
        component.widgetType = WidgetConfigType.RISK_EXPOSURE;
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.RISK_EXPOSURE, 'columns');
        component.inputs = widget.dataStore.metaData.inputs;
        component.isApplyButtonDisabled = {value: 0};

        component.ngOnInit();
    });

    describe('openSaveColumnSetModal/openLoadColumnSetModal Test', () => {
        beforeEach(() => {
            component.widgetInput = new ColumnSet();
            component.widgetType = WidgetConfigType.PIVOT;
            component.favoriteType = FavoriteConstants.CHART_REPORT;
            component.favoriteFolderType = FavoriteConstants.CHART_REPORT_FOLDER;
        });

        it('should trigger saveFavoriteAction$', () => {
            const saveFavoriteSpy = jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.openSaveColumnSetModal();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledTimes(1);
            const action = saveFavoriteSpy.mock.calls[0][0];
            expect(action).toBeDefined();
            expect(action.configToSave).toEqual(component.widgetInput);
            expect(action.displayName).toEqual(FavoriteConstants.COLUMN_SET_LOWER);
            expect(action.type).toEqual(FavoriteConstants.CHART_REPORT);
            expect(action.treeType).toEqual(FavoriteConstants.CHART_REPORT_FOLDER);
            expect(action.callback).toBeDefined();
        });

        it('should trigger openLoadFavoriteModal$', () => {
            jest.spyOn(component['appStore'].openLoadFavoriteModal$, 'next');
            component.openLoadColumnSetModal();

            expect(component['appStore'].openLoadFavoriteModal$.next).toHaveBeenCalledWith(
                new LoadFavoriteAction({
                    type: FavoriteConstants.CHART_REPORT,
                    treeType: FavoriteConstants.CHART_REPORT_FOLDER,
                    displayName: FavoriteConstants.COLUMN_SET_LOWER + 's',
                    callback: component.loadColumnSet,
                    headerDisplayName: FavoriteConstants.COLUMN_SET_LOWER
                })
            );
        });
    });

    describe('loadColumnSet Test', () => {
        it('should update current widgetInput and targetAreaColumns', async () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            component.widgetInput = new ColumnSet();
            component.widgetInput.columns = [new ColumnConfig({columnTitle: 'Market Value %'})];

            const expectedColumnSet = new ColumnSet();
            const columnConfig1 = new ColumnConfig({columnTitle: 'Market Value %'});
            const columnConfig2 = new ColumnConfig({columnTitle: 'Benchmark A Spread'});
            const columnConfig3 = new ColumnConfig({columnTitle: 'Active A Spread'});
            expectedColumnSet.columns.push(columnConfig1, columnConfig2, columnConfig3);
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(of(expectedColumnSet));
            jest.spyOn(ColumnUtils, 'updateColumnWithWidgetAndPortfolioSettings');
            await component.loadColumnSet(12345, 'Loading Column Set');
            expect(ColumnUtils.updateColumnWithWidgetAndPortfolioSettings).toHaveBeenCalledWith(component.selectedColumnConfig, WorkspaceStore.getCurrentPortfolio(), component.inputs, WidgetConfigType.RISK_EXPOSURE);
            expect(component.widgetInput.columns.length).toBe(3);
            expect(component.selectedColumnConfig).toBe(columnConfig3);
        });

        it('should handle error', async () => {
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(throwError('failed to load column set'));
            jest.spyOn(component['notificationService'], 'error');
            await component.loadColumnSet(12345, 'Loading Column Set');

            expect(component['notificationService'].error).toHaveBeenCalledWith('failed to load column set with id: 12345', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
        });
    });

    describe('openSaveCustomCalcModal Test', () => {
        it('should trigger saveFavoriteAction$', () => {
            component.selectedColumnConfig = new ColumnConfig();
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.openSaveCustomCalcModal();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    component.selectedColumnConfig,
                    FavoriteConstants.CUSTOM_CALC_COLUMN_LOWER,
                    undefined,
                    FavoriteConstants.CUSTOM_CALC_COLUMN_FOLDER
                )
            );
        });
    });

    describe('openLoadCustomCalcModal Test', () => {
        it('should trigger openLoadFavoriteModal$', () => {
            jest.spyOn(component['appStore'].openLoadFavoriteModal$, 'next');
            component.openLoadCustomCalcModal();

            expect(component['appStore'].openLoadFavoriteModal$.next).toHaveBeenCalledWith(
                new LoadFavoriteAction({
                    type: undefined,
                    treeType: FavoriteConstants.CUSTOM_CALC_COLUMN_FOLDER,
                    displayName: FavoriteConstants.CUSTOM_CALC_COLUMN_LOWER + 's',
                    callback: component.loadCustomCalcColumn,
                    headerDisplayName: FavoriteConstants.CUSTOM_CALC_COLUMN_LOWER
                })
            );
        });
    });

    describe('loadCustomCalcColumn Test', () => {
        it('should update current widgetInput and selectedColumnConfig', fakeAsync (() => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            component.selectedColumnConfig = new ColumnConfig({columnTitle: 'Custom Calculation'});
            component.widgetInput.columns.push(component.selectedColumnConfig);
            const expectedColumn = ColumnConfig.createColumn('custom_calc', 'ALL', 'key', 'Saved Custom Calculation');
            jest.spyOn(ColumnOptionUtils, 'updateColumnTitle').mockImplementation((column, option) => column.columnTitle = column.title);
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(of(expectedColumn));
            component.loadCustomCalcColumn(12345, 'Loading Column');
            tick(10);
            expect(component.widgetInput.columns.length).toBe(4);
            expect(component.widgetInput.columns[3]).toBe(expectedColumn);
            expect(component.selectedColumnConfig).toBe(expectedColumn);
        }));

        it('should handle error', async () => {
            jest.clearAllMocks();
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(throwError('failed to load column'));
            jest.spyOn(component['notificationService'], 'error');
            await component.loadCustomCalcColumn(12345, 'Loading Column');

            expect(component['notificationService'].error).toHaveBeenCalledWith('failed to load column with id: 12345', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
        });
    });

    describe('test updateColumnWithWidgetAndPortfolioSettings', () => {
        it('update SECLiquiditySettings - RATS with portfolioDefault',  () => {
            const columnConfig = ColumnConfig.createColumn('sec_cap_adj_mult', 'ALL', 'sec_cap_adj_mult', 'RATS column');
            const liquidityColumnOption = new LiquidityColumnOption();
            columnConfig.optionValues.push(liquidityColumnOption);
            liquidityColumnOption.secLiquiditySettings = new SECLiquiditySettings();

            const portfolio = new Portfolio();
            const portfolioDefaults = new PortfolioDefaults();
            portfolio.portfolioDefaults = portfolioDefaults;
            portfolioDefaults.liquidityDefaults = {'sec_22e4_rats': 0.04};
            ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(columnConfig, portfolio, new Map<string, WidgetInput>(), WidgetConfigType.RISK_EXPOSURE);

            expect(liquidityColumnOption.secLiquiditySettings.rats).toEqual(4);
        });
    });

    describe('test updateRecentColumnsPreference', () => {
        it('recent columns preference should be updated - recentColumn preference is null',  () => {
            const spyInstance = jest.spyOn(UserMetaDataStore, 'setPreferenceValue');
            const recentColumns = ['Market Value'];
            component.updateRecentColumnsPreference(recentColumns);
            expect(spyInstance).toHaveBeenCalled();
        });

        it('recent columns preference should be updated - recentColumn preference is not null',  () => {
            jest.spyOn(UserMetaDataStore, 'getPreferenceValue').mockReturnValue('{"commonColumns": ["Market Value"]}');
            const spyInstance = jest.spyOn(UserMetaDataStore, 'setPreferenceValue');
            const recentColumns = ['Market Value'];
            component.updateRecentColumnsPreference(recentColumns);
            expect(spyInstance).toHaveBeenCalled();
        });
    });


    describe('onFilterBarDataChanged', () => {
        beforeEach(() => {
            jest.spyOn(component, 'getFilteredAvailableColumns');
            jest.spyOn(component.sourceDataUpdated$, 'next');
        });

        it('should not perform any operations when event.detail is null', () => {
            const event = new CustomEvent<AuxFilterBarDataChangedInterface>('test', {detail: null});
            component.onFilterBarDataChanged(event);
            expect(component.getFilteredAvailableColumns).not.toHaveBeenCalled();
        });

        it('should not perform any operations when oldData.length is not equal to newData.length', () => {
            const event = new CustomEvent<AuxFilterBarDataChangedInterface>('test', {
                detail: {
                    change: [],
                    oldData: [{}],
                    newData: [{}, {}]
                }
            });
            component.onFilterBarDataChanged(event);
            expect(component.getFilteredAvailableColumns).not.toHaveBeenCalled();
        });

        it('should not perform any operations when when main categories updated by search', () => {
            component.searchString = 'test';
            jest.spyOn(component.sourceDataUpdated$, 'next');
            jest.spyOn(component, 'getFilteredAvailableColumns');
            const event = new CustomEvent<AuxFilterBarDataChangedInterface>('test', {
                detail: {
                    change: [],
                    oldData: [{data: [{}]}],
                    newData: [{data: [{}, {}]}]
                }
            });
            component.onFilterBarDataChanged(event);
            expect(component.getFilteredAvailableColumns).not.toHaveBeenCalled();
            expect(component.sourceDataUpdated$.next).not.toHaveBeenCalled();
        });

        it('should handle when changeLabel is equal to BaseColumnSetSettingsComponent.CATEGORIES', () => {
            const event = new CustomEvent<AuxFilterBarDataChangedInterface>('test', {
                detail: {
                    change: [{label: 'Categories'}],
                    oldData: [{data: [new ExploreCheckbox('test', false, false)]}],
                    newData: [{data: [new ExploreCheckbox('test', true, false)]}]
                }
            });
            component.onFilterBarDataChanged(event);
            expect(component.sourceDataUpdated$.next).toHaveBeenCalled();
        });

        it('should handle when changeLabel is equal to BaseColumnSetSettingsComponent.SUB_CATEGORIES', () => {
            const event = new CustomEvent<AuxFilterBarDataChangedInterface>('test', {
                detail: {
                    change: [{label: 'Subcategories'}],
                    oldData: [{data: []}, {data: [{options: [new ExploreCheckbox('test', false, false)]}]}],
                    newData: [{data: []}, {data: [{options: [new ExploreCheckbox('test', true, false)]}]}]
                }
            });
            component.onFilterBarDataChanged(event);
            expect(component.sourceDataUpdated$.next).toHaveBeenCalled();
        });

        it('should handle when changeLabel is equal to BaseColumnSetSettingsComponent.SUB_CATEGORIES_L2', () => {
            component.searchString = 'test';
            jest.spyOn(component.searchTermSubject$, 'next');
            const event = new CustomEvent<AuxFilterBarDataChangedInterface>('test', {
                detail: {
                    change: [{label: 'SubcategoriesL2'}],
                    oldData: [{data: []}, {data: []}, {data: [{options: [new ExploreCheckbox('test', false, false)]}]}],
                    newData: [{data: []}, {data: []}, {data: [{options: [new ExploreCheckbox('test', true, false)]}]}]
                }
            });
            component.onFilterBarDataChanged(event);
            expect(component.sourceDataUpdated$.next).toHaveBeenCalled();
            expect(component.searchTermSubject$.next).toHaveBeenCalled();
        });
    });

    describe('onResetAllClicked', () => {
        it('should reset all filters and update the source data', () => {
            component.searchString = 'test';
            jest.spyOn(component, 'resetAllFilters');
            jest.spyOn(component, 'getFilteredAvailableColumns');
            jest.spyOn(component.sourceDataUpdated$, 'next');
            component.onResetAllClicked();

            expect(component.resetAllFilters).toHaveBeenCalled();
            expect(component.getFilteredAvailableColumns).toHaveBeenCalledWith(true, true, true);
            expect(component.sourceDataUpdated$.next).toHaveBeenCalled();
        });
    });

    describe('columnSearchValueChanged', () => {

        beforeEach(() => {
            jest.spyOn(component.sourceDataUpdated$, 'next');
            jest.spyOn(component.searchTermSubject$, 'next');
        });

        it('should update searchString and call searchTermSubject$.next when searchValue is not null or empty', () => {
            component.searchString = 'col1';
            const event = new CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>('test', {
                detail: {
                    submitValue: {
                        searchValue: 'test'
                    }
                }
            });
            component.columnSearchValueChanged(event);
            expect(component.searchString).toEqual('test');
            expect(component.sourceDataUpdated$.next).not.toHaveBeenCalledWith();
            expect(component.searchTermSubject$.next).toHaveBeenCalledWith('test');
        });

        it('should update searchString and call searchTermSubject$.next when searchValue is null or empty', () => {
            component.searchString = 'col1';
            const event = new CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>('test', {
                detail: {
                    submitValue: {
                        searchValue: ''
                    }
                }
            });
            component.columnSearchValueChanged(event);
            expect(component.searchString).toEqual('');
            expect(component.sourceDataUpdated$.next).toHaveBeenCalledTimes(1);
            expect(component.searchTermSubject$.next).toHaveBeenCalledWith('');

            component.searchString = 'col1';
            component.filteredCategories = ['category1'];
            component.columnSearchValueChanged(event);
            expect(component.searchString).toEqual('');
            expect(component.sourceDataUpdated$.next).toHaveBeenCalledTimes(2);

            component.searchString = 'col1';
            component.filteredSubCategories = ['subcategory1'];
            component.columnSearchValueChanged(event);
            expect(component.searchString).toEqual('');
            expect(component.sourceDataUpdated$.next).toHaveBeenCalledTimes(3);
        });
    });

    describe('areAllFiltersEmpty', () => {
        it('should return true when all filters are empty', () => {
            component.filteredCategories = [];
            component.filteredSubCategories = [];
            component.filteredSubCategoriesL2 = [];

            const result = component.areAllFiltersEmpty();

            expect(result).toBeTruthy();
        });

        it('should return false when any filter is not empty', () => {
            component.filteredCategories = ['category1'];
            component.filteredSubCategories = [];
            component.filteredSubCategoriesL2 = [];

            let result = component.areAllFiltersEmpty();

            expect(result).toBeFalsy();

            component.filteredCategories = [];
            component.filteredSubCategories = ['subcategory1'];
            component.filteredSubCategoriesL2 = [];

            result = component.areAllFiltersEmpty();

            expect(result).toBeFalsy();

            component.filteredCategories = [];
            component.filteredSubCategories = [];
            component.filteredSubCategoriesL2 = ['subcategoryL21'];

            result = component.areAllFiltersEmpty();

            expect(result).toBeFalsy();
        });
    });

    describe('onSearchByChanged', () => {
        it('should update searchBy when event.detail.value.displayValue is not null or empty', () => {
            const event = new CustomEvent<AuxSelectSelectionChangedDetailInterface>('test', {
                detail: {
                    value: {
                        displayValue: 'test'
                    }
                }
            });
            component.onSearchByChanged(event);
            expect(component.searchBy).toEqual('test');
        });
    });

    describe('onChildFilteredDataChanged', () => {
        it('should not perform any operations when updatedCategories is empty', () => {
            const updatedCategories: ColumnSelectorOption[] = [];
            component.onChildFilteredDataChanged(updatedCategories);
            expect(component.categoriesData).toEqual([]);
        });

        it('should update categoriesData when filteredCategories are empty', () => {
            const updatedCategories: ColumnSelectorOption[] = [new ColumnSelectorOption('category1', 'category1', [])];
            component.filteredCategories = [];
            component.filteredSubCategories = [];
            component.filteredSubCategoriesL2 = [];
            component.onChildFilteredDataChanged(updatedCategories);
            expect(component.categoriesData.length).toEqual(1);
        });

        it('should update categoriesData when only filteredSubCategories are empty', () => {
            const child = new ColumnSelectorOption('subcategory1', 'subcategory1', []);
            child.match = true;
            const updatedCategories: ColumnSelectorOption[] = [new ColumnSelectorOption('category1', 'category1', [child])];
            component.filteredCategories = ['category1'];
            component.filteredSubCategories = [];
            component.filteredSubCategoriesL2 = [];
            component.onChildFilteredDataChanged(updatedCategories);
            expect(component.categoriesData.length).toEqual(2);
        });

        it('should update categoriesData when both filteredCategories and filteredSubCategories are not empty', () => {
            const child = new ColumnSelectorOption('subcategory1', 'subcategory1', []);
            child.match = true;
            const nestedChild = new ColumnSelectorOption('subcategoryL21', 'subcategoryL21', []);
            nestedChild.match = true;
            child.children = [nestedChild];
            const updatedCategories: ColumnSelectorOption[] = [new ColumnSelectorOption('category1', 'category1', [child])];
            component.filteredCategories = ['category1'];
            component.filteredSubCategories = ['subcategory1'];
            component.filteredSubCategoriesL2 = [];
            component.onChildFilteredDataChanged(updatedCategories);
            expect(component.categoriesData.length).toEqual(3);
        });
    });

    describe('isSubCategoriesUpdateRequired', () => {

        it('should return false when no subcategories are present to update', () => {
            const updatedSubCategories: AuxFilterBarData = {
                data: []
            } as AuxFilterBarData;
            const result = component.isSubCategoriesUpdateRequired(updatedSubCategories, 1);
            expect(result).toBe(false);
        });

        it('should return false when subcategories data is the same', () => {
            const updatedSubCategories: AuxFilterBarData = {
                data: [
                    {
                        options: [
                            {label: 'Subcategory1'},
                            {label: 'Subcategory2'}
                        ]
                    }
                ]
            } as AuxFilterBarData;

            component.categoriesData = [
                {},
                {
                    data: [
                        {
                            options: [
                                {label: 'Subcategory1'},
                                {label: 'Subcategory2'}
                            ]
                        }
                    ]
                }
            ] as AuxFilterBarData[];

            const result = component.isSubCategoriesUpdateRequired(updatedSubCategories, 1);
            expect(result).toBe(false);
        });

        it('should return true when subcategories data is different', () => {
            const updatedSubCategories: AuxFilterBarData = {
                data: [
                    {
                        options: [
                            {label: 'Subcategory1'},
                            {label: 'Subcategory3'}
                        ]
                    }
                ]
            } as AuxFilterBarData;

            component.categoriesData = [
                {},
                {
                    data: [
                        {
                            options: [
                                {label: 'Subcategory1'},
                                {label: 'Subcategory2'}
                            ]
                        }
                    ]
                }
            ] as AuxFilterBarData[];

            const result = component.isSubCategoriesUpdateRequired(updatedSubCategories, 1);
            expect(result).toBe(true);
        });
    });

});
