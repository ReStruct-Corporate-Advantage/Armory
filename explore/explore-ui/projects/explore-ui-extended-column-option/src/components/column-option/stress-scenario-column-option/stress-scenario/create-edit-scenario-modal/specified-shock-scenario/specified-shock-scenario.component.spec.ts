import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SpecifiedShockScenarioComponent} from './specified-shock-scenario.component';
import {FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN} from '../../../../../../tokens';
import {StressScenarioService} from '../../../../../../services/stress-scenario.service';
import {BehaviorSubject, of} from 'rxjs';
import {ScenarioTypeEnum} from '../../../../../../enums/scenario-type.enum';
import {StressScenario} from '../../../../../../models/stress-scenario.model';
import {ColumnConfig, CoreColumnUtils} from '@blk/explore-ui-core';
import {ImpliedShockScenario} from '../../../../../../models/scenario-types/implied-shock-scenario.model';
import {RiskSettings} from '@blk/explore-ui-risk';
import {GridApi} from 'ag-grid-community';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('SpecifiedShockScenarioComponent', () => {
    let component: SpecifiedShockScenarioComponent;
    let fixture: ComponentFixture<SpecifiedShockScenarioComponent>;

    const factorColumnSetSettingsServiceMock = {
        getWidgetConfigInputForBreakdown: jest.fn(() => {
            return { default: 'breakdown' };
        }),
        createSpecifiedShocksRequest: jest.fn(() => ({})),
        createAuxGridColDefs: jest.fn(() => {
            return [];
        }),
        getSpecifiedScenarioDataUrl: jest.fn(() => 'url'),
    };


    const stressScenarioServiceMock = {
        fetchSpecifiedScenarioData$: jest.fn(() => of({response: { data: {} }}) )
    };

    const data = {
        ColumnDefinitions: [
            {
                columnTag: 'rfv_ftitle',
            },
            {
                columnTag: 'rfv_factor_tag_rk',
            },
            {
                columnTag: 'rfv_stress_shok_rk',
            },
            {
                columnTag: 'rfv_factor_shock_unit_rk',
            },
            {
                columnTag: 'rfv_fms_title',
            },
            {
                columnTag: 'rfv_fms_ftag',
            },
        ]
    };

    beforeAll(() => {
        CoreColumnUtils.createColumnDefinitions(data);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ SpecifiedShockScenarioComponent ],
            providers: [
                { provide: FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN, useValue: factorColumnSetSettingsServiceMock },
                { provide: StressScenarioService, useValue: stressScenarioServiceMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(SpecifiedShockScenarioComponent);
        component = fixture.componentInstance;

        component.showSpinner$ = new BehaviorSubject<boolean>(false);
        component.scenario = new StressScenario({
            scenType: ScenarioTypeEnum.SPECIFIED_SHOCK
        });

        component.column = new ColumnConfig();

        component['gridApi'] = {} as GridApi;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('test for create from scratch flow', () => {

        beforeEach(() => {
            component.scenario.specifiedShockScenario.isSavedSpecifiedScenario = false;
        });

        it('should initialize component', () => {
            // @ts-ignore
            const spy = jest.spyOn(component, 'initializeComponent');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
            expect(component['isCreateNewScenarioFlow']).toBeTruthy();
            expect(component.requestColumns).toBeDefined();
            expect(component.gridOptions).toBeDefined();
        });
    });

    describe('test for view as specified and edit a saved specified scenario', () => {

        beforeEach(() => {
            component.scenario.specifiedShockScenario.isSavedSpecifiedScenario = false;
            component.scenario.convertToSpecifiedShock = true;
            component.scenario.impliedShockScenario = new ImpliedShockScenario();
            component.column = new ColumnConfig();
            component.column.optionValues.push(new RiskSettings());
        });

        it('should initialize component', () => {
            // @ts-ignore
            const spy = jest.spyOn(component, 'initializeComponent');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
            expect(component['isCreateNewScenarioFlow']).toBeFalsy();
            expect(component.requestColumns).toBeDefined();
            expect(component.gridOptions).toBeDefined();
        });

        it('should test fetchSpecifiedScenarioData$', () => {
            const response: any = {
                'data': {
                    'data': {
                        'data': [
                            'Parent 1',
                            null,
                            null,
                            null,
                        ],
                        'rowId': 0,
                        'children': [
                            {
                                'data': [
                                    'Rates',
                                    null,
                                    null,
                                    null,
                                ],
                                'title': 'Rates',
                                'rowId': 1,
                                'children': [
                                    {
                                        'data': [
                                            'Tsy 3m',
                                            'USD_3m',
                                            4.5989,
                                            'bps',
                                        ],
                                        'rowId': 2
                                    },
                                ]
                            },
                        ]
                    },
                }
            };

            component['setRequestColumns']();

            const columns = component.requestColumns;

            response.data.columns = component.requestColumns.columns.map(col => col.columnKey);
            response.data.columnHeaderDetails = {};
            response.data.columnHeaderDetails.columnKeyToTagMap = {};
            response.data.columnHeaderDetails.columnKeyToDisplayNameMap = {};
            response.data.possibleColumnGroups = [];
            component.requestColumns.columns.forEach(col => {
                response.data.columnHeaderDetails.columnKeyToTagMap[col.columnKey] = col.columnTag;
                response.data.columnHeaderDetails.columnKeyToDisplayNameMap[col.columnKey] = col.columnTitle;
            });

            jest.spyOn(component['factorColumnSetSettingsService'], 'createAuxGridColDefs').mockImplementationOnce((_a, _b) => {
                return columns.columns.map(col => ({
                    field: col.columnKey,
                    colTag: col.columnTag,
                }));
            });

            jest.spyOn(component['stressScenarioService'], 'fetchSpecifiedScenarioData$').mockImplementationOnce((_a, _b) => of(response));
            // @ts-ignore
            jest.spyOn(component, 'setRequestColumns').mockImplementationOnce(() => {
                component.requestColumns = columns;
            });

            component.ngOnInit();

            const expectedRowData = [
                {
                    'rfv_ftitle_97d2866d9f5a450': 'Rates',
                    'rfv_factor_tag_rk_b87bb0086c3345b': null,
                    'rfv_stress_shok_rk_b9ff6d518b8d43b': null,
                    'rfv_factor_shock_unit_rk_5bd80429993c4e7': null,
                    'level': [
                        'Rates_null'
                    ],
                    'actionCol': {
                        'inlineMenuData': [
                            [
                                {
                                    'label': 'Remove'
                                }
                            ]
                        ]
                    },
                    'rowId': 1
                },
                {
                    'rfv_ftitle_97d2866d9f5a450': 'Tsy 3m',
                    'rfv_factor_tag_rk_b87bb0086c3345b': 'USD_3m',
                    'rfv_stress_shok_rk_b9ff6d518b8d43b': 4.5989,
                    'rfv_factor_shock_unit_rk_5bd80429993c4e7': 'bps',
                    'level': [
                        'Rates_null',
                        'Tsy 3m_USD_3m'
                    ],
                    'actionCol': {
                        'inlineMenuData': [
                            [
                                {
                                    'label': 'Remove'
                                }
                            ]
                        ]
                    },
                    'rowId': 2
                }
            ];

            expect(component.gridOptions.columnDefs.length).toEqual(5);
            expect(component.gridOptions.rowData.length).toEqual(expectedRowData.length);
            expect(component.gridOptions.rowData[0].level).toEqual(expectedRowData[0].level);
            expect(component.gridOptions.rowData[1].level).toEqual(expectedRowData[1].level);


        });
    });

    it('test method validateStressScenario', () => {
        const spy = jest.spyOn(component.scenarioValidatedEmitter, 'emit');
        // @ts-ignore
        jest.spyOn(component, 'getFactorsForSaveRequest').mockReturnValue([]);

        component['validateStressScenario']();

        expect(spy).toHaveBeenCalledWith(false);
        // @ts-ignore
        jest.spyOn(component, 'getFactorsForSaveRequest').mockReturnValue([new ColumnConfig()]);

        component['validateStressScenario']();

        expect(spy).toHaveBeenCalledWith(true);
    });

    it('test method removeRow', () => {
        const params = { rowId: 1 };
        const rowNode = {
            allLeafChildren: [
                { data: { rowId: '1' } },
                { data: { rowId: '2' } },
            ]
        };

        fixture.detectChanges();

        component['gridApi'].getRowNode = jest.fn().mockReturnValue(rowNode as any);

        component['gridApi'].applyTransaction = jest.fn();
        const spy = jest.spyOn(component['gridApi'], 'applyTransaction');

        component['removeRow'](params);

        const expectedRemovedNodes = {
            remove: [
                { rowId: '1' },
                { rowId: '2' },
            ]
        };

        expect(spy).toHaveBeenCalledWith(expectedRemovedNodes);
    });

});
