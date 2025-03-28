import {HttpClient} from '@angular/common/http';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
    ColumnOptionResponse,
    ColumnOptionService,
    ColumnSet,
    CustomTitleColumnOption,
    LibColumnUtils,
    SelectedColumnSelectorOption
} from '@blk/explore-ui-column-option';
import {ColumnConfig, PortfolioRiskColumnCategoryDefinition, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {Widget} from '@models/widget/widget.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {FavoriteService} from '@services/favorite';
import {TestUtils} from '@utils/test.utils';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {AppStore} from '../../../app.store';
import {WidgetConfigFactory} from '../../../factories';
import {WorkspaceStore} from '@stores/index';
import {WidgetSettingsStore} from '../../../modules/widget/widget-settings/widget-settings.store';

import {FactorBasedColumnSetSettingsComponent} from './factor-based-column-set-settings.component';
import {isFunction} from 'lodash';

describe('FactorBasedColumnSetSettingsComponent', () => {
    let component: FactorBasedColumnSetSettingsComponent;
    let fixture: ComponentFixture<FactorBasedColumnSetSettingsComponent>;
    let widget: Widget;

    const widgetSettingsStoreStub = {
        sourceDataUpdated$: new Subject(),
        columnSetUpdated$: new Subject(),
        quickColumnSetChanged$: new Subject(),
        groupingTypeChanged$: new Subject(),
        customTitleChanged$: new Subject()
    };

    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn(() => of([{
            colTag: 'pct_mv',
            use: 'PORT',
            options: []
        }])),
        fetchAndPopulateColumnOptions$: jest.fn((_selectedColumns, _additionalColumnOptions, _restrictedColumnOptions, _columnCallback?) => {
            return of([]);
        }),
    };

    const httpMock = {
        get: jest.fn(),
        post: jest.fn()
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
            declarations: [FactorBasedColumnSetSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnOptionService, useValue: columnOptionsServiceMock},
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: AppStore, useValue: appStoreStub},
                {provide: WidgetSettingsStore, useValue: widgetSettingsStoreStub},
                {provide: HttpClient, useValue: httpMock}
            ]
        });

        fixture = TestBed.createComponent(FactorBasedColumnSetSettingsComponent);
        component = fixture.componentInstance;
        component.widgetType = WidgetConfigType.PRA;
        widget = new Widget(WidgetConfigType.PRA);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.PRA, 'columns');
        component.inputs = widget.dataStore.metaData.inputs;
        component.isApplyButtonDisabled = {value: 0};

        jest.spyOn(WorkspaceStore, 'getCurrentWidget').mockReturnValue(widget);

        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('initializeComponent Test', () => {
        it('should set component groupType to BELONGS_TO_FACTOR_REPORT by default', () => {
            expect(component['groupingType']).toBe('BELONGS_TO_FACTOR_REPORT');
        });
        it('should subscribe on groupingTypeChanged$ and call onGroupingTypeChanged', fakeAsync(() => {
            jest.spyOn<any>(component, 'onGroupingTypeChanged');
            component['widgetSettingsStore'].groupingTypeChanged$.next('BELONGS_TO_SECTOR_REPORT');
            tick(10);

            expect(component['onGroupingTypeChanged']).toHaveBeenCalledWith('BELONGS_TO_SECTOR_REPORT');
        }));
        it('should subscribe on quickColumnSetChanged$ and call onColumnSetChanged', fakeAsync(() => {
            jest.spyOn<any, string>(component, 'onColumnSetChanged').mockImplementationOnce(_a => {});
            component['widgetSettingsStore'].quickColumnSetChanged$.next('PRISM_VAR_COLS_STRS');
            tick(10);

            expect(component['onColumnSetChanged']).toHaveBeenCalledWith('PRISM_VAR_COLS_STRS');
        }));
    });

    describe('Risk Quick Columnset Test', () => {
        const columns: ColumnConfig[] = [];
        beforeEach(() => {
            const columnConfig1 = new ColumnConfig({columnTitle: 'x', columnTag: 'x'});
            const columnConfig2 = new ColumnConfig({columnTitle: 'y', columnTag: 'y'});
            const columnConfig3 = new ColumnConfig({columnTitle: 'z', columnTag: 'z'});
            columns.push(columnConfig1, columnConfig2, columnConfig3);
            jest.spyOn(component['reportColumnService'], 'getColumnListFromReport').mockReturnValue(of(columns));
            const dummyColumnDef: PortfolioRiskColumnCategoryDefinition = new PortfolioRiskColumnCategoryDefinition();
            (dummyColumnDef as PortfolioRiskColumnCategoryDefinition).matchingRiskCategories = [
                'BELONGS_TO_FACTOR_REPORT'
            ];
            jest.spyOn(LibColumnUtils, 'getColumnDefinition').mockReturnValue(dummyColumnDef);
            const riskColumnSettings: RiskColumnSettings = new RiskColumnSettings();
            riskColumnSettings.groupingTypeSelected = {
                'label': 'Factor',
                'matchingRiskCategory': 'BELONGS_TO_FACTOR_REPORT',
                'value': 'byFactor'
            };
            riskColumnSettings.columnSetSelected = {
                'label': 'Analytical VAR',
                'value': 'PRISM_VAR_COLS_AVAR'
            };

            const colOptionResponse: ColumnOptionResponse[] = [
                createDummyColumnOption('x', undefined),
                createDummyColumnOption('y', undefined),
                createDummyColumnOption('z', undefined)
            ];
            columnOptionsServiceMock.fetchColumnOptions$.mockReturnValue(of(colOptionResponse));

            component.inputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS, riskColumnSettings);
        });

        function createDummyColumnOption(colTag: string, use: string): ColumnOptionResponse {
            return {
                colTag,
                use,
                options: [
                    {
                        columnOptionKey: CustomTitleColumnOption.CONFIG_TYPE,
                        columnOptionTitle: 'test',
                        columnOptionConfigType: 'test',
                        columnOptionAttributes: []
                    }
                ]
            };
        }

        it('Test onGroupingTypeChanged', () => {
            const originalFilter = component.widgetConfigInput.columnFilters;
            component.widgetConfigInput.columnFilters = [
                {
                    type: '=',
                    key: 'columnReports',
                    value: ['prism_var_factors', 'factor_attrib_dd', 'factor_attrib_resid']
                },
                {
                    type: '!=',
                    key: 'columnType',
                    value: ['FACTOR_ATTRIBUTES', 'custom_calc']
                },
                {
                    type: '!=',
                    key: 'columnReports',
                    value: ['prism_invisible']
                }
            ];

            const expectedCategories = ['Risk Factor Attributes', 'Return Attribution', 'Analytical Var', 'Matrix', 'Stress Testing'];
            component['onGroupingTypeChanged']('BELONGS_TO_FACTOR_REPORT');

            const availableColumns = component['getAvailableColumns']();
            expect(availableColumns.length).toBe(5);

            availableColumns.forEach((columnSelectorOption, index) => {
                expect(columnSelectorOption.label).toBe(expectedCategories[index]);
            });

            component.widgetConfigInput.columnFilters = originalFilter;
        });

        it('test method updateColumnOptionsOnColumnSet', () => {
            const fetchAndPopulateSpy = columnOptionsServiceMock.fetchAndPopulateColumnOptions$.mockImplementationOnce((selectedColumns: SelectedColumnSelectorOption[], _additionalColumnOptions, _restrictedColumnOptions, _columnCallback) => {
                selectedColumns.forEach(selectedColumn => {
                    selectedColumn.column.optionValues = [ new CustomTitleColumnOption() ] ;
                });
                return of([]);
            });

            component.widgetInput.columns = [];
            component['updateColumnOptionsOnColumnSet']();
            expect(fetchAndPopulateSpy).not.toHaveBeenCalled();

            component.widgetInput.columns = [ new ColumnConfig({
                columnTag: 'dummy_col'
            }) ];
            component['updateColumnOptionsOnColumnSet']();
            expect(fetchAndPopulateSpy).toHaveBeenCalledTimes(1);
            expect(component.widgetInput.columns.length).toBe(1);
            expect(component.widgetInput.columns[0].optionValues.length).toBe(1);
        });
    });


    it('Remove top level grouping', () => {
        // Set the control to be for the EX-Post statistics widget.
        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.EXPOST_STATS, 'columns');

        // Now enable the option and check that more top level groups are returned.
        component.widgetConfigInput.hideTopColumnGroup = true;
        const availableColumns = component['getAvailableColumns']();
        expect(availableColumns.length).toBeGreaterThan(1);
    });

    it('should filter on parents columns for child spritelet widgets', () => {
        widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
        const childColumnSet = new ColumnSet();
        childColumnSet.columns.push(ColumnConfig.createColumn('rfv_std_port', 'PORT', 'rfv_std_port_776'));
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

        const parentColumnSet = new ColumnSet();
        parentColumnSet.columns.push(
            ColumnConfig.createColumn('rfv_factor_vol', 'ALL', 'rfv_factor_vol_5'),
            ColumnConfig.createColumn('rfv_std_port', 'PORT', 'rfv_std_port_776'),
            ColumnConfig.createColumn('rfv_std_bench', 'BENCH', 'rfv_std_bench_5633'),
            ColumnConfig.createColumn('rfv_std_active', 'ACTIVE', 'rfv_std_active_63456')
        );
        const parentDataStore = new WidgetDataStore();
        parentDataStore.metaData.inputs.set(WidgetInputType.COLUMNS, parentColumnSet);
        component.parentColumnSet = parentColumnSet;
        widget.dataStore.parentDataStore = parentDataStore;
        widget.dataStore.isDependentOnParentForData = true;

        component.widgetType = widget.configType;
        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART, WidgetInputType.COLUMNS);
        component.inputs = widget.dataStore.metaData.inputs;
        component.widgetInput = childColumnSet;
        component.parentInputs = parentDataStore.metaData.inputs;

        const availableColumns = component['getAvailableColumns']();
        expect(availableColumns.length).toBe(2);
        expect(availableColumns[0].label).toBe('Risk Factor Attributes');
        expect(availableColumns[0].type).toBe('group');
        expect(availableColumns[0].children).toEqual(
            [
                expect.objectContaining({uid: 'rfv_factor_vol_ALL', type: 'column'})
            ]
        );
        expect(availableColumns[1].label).toBe('Analytical Var');
        expect(availableColumns[1].type).toBe('group');
        expect(availableColumns[1].children).toEqual(
            [
                expect.objectContaining({uid: 'rfv_std_port_PORT', type: 'column'}),
                expect.objectContaining({uid: 'rfv_std_bench_BENCH', type: 'column'}),
                expect.objectContaining({uid: 'rfv_std_active_ACTIVE', type: 'column'})
            ]
        );
    });
});
