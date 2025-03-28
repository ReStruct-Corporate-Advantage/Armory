import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {BehaviorSubject, of, Subject, throwError} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { ManageScenarioComponent } from './manage-scenario.component';
import {StressScenarioService} from '../../../../../../services/stress-scenario.service';
import {
    DateService,
    DateStore,
    DateValue,
    ExploreDialogParam,
    NamedScenario,
    NOTIFICATION_SERVICE_TOKEN
} from '@blk/explore-ui-core';
import {CellClassParams, GridApi, ICellRendererParams, IRowNode, RowNode} from 'ag-grid-community';
import {AuxSearchFieldSearchValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {cloneDeep} from 'lodash';
import {ScenarioResponse} from '../../../../../../interfaces/scenario-response.interface';
import { ScenarioColumnOption } from '@blk/explore-ui-column-option';

describe('ManageScenarioComponent', () => {
    let component: ManageScenarioComponent;
    let fixture: ComponentFixture<ManageScenarioComponent>;

    const dateServiceStub = {
        midNightRefresh$: new Subject(),
        parseDateString$: jest.fn(() => {
            return of(new Date('12/01/2014'));
        }),
    };
    const notificationServiceStub = {
        error: jest.fn(),
    };

    const stressScenarioServiceStub = {
        fetchScenarios$: jest.fn(() => {
            return of([]);
        }),
    };

    const scenarioParams: ScenarioResponse = {
        'level': 'My Scenarios@@@Demo Scenario',
        'scenarioName': 'Demo Scenario',
        'scenarioDesc': '1983003430.23',
        'scenarioCode': 's272::DEV',
        'scenarioPurpose': 's272',
        'scenarioCreatedDate': '03:12:01'
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                ManageScenarioComponent,
            ],
            providers: [
                {provide: StressScenarioService, useValue: stressScenarioServiceStub},
                {provide: DateService, useValue: dateServiceStub},
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ManageScenarioComponent);
        component = fixture.componentInstance;

        DateStore.updateCurrentDate(DateValue.newDate('03/15/2022'));
        component.lookBackDate = DateValue.newDate('03/15/2021');
        component.optionValue = new ScenarioColumnOption();
        component.showSpinner$ = new BehaviorSubject<boolean>(false);
        component.promptDialog$ = new BehaviorSubject<ExploreDialogParam>(null);

        const gridApiMock: Partial<GridApi> = {
            expandAll: jest.fn(),
            onFilterChanged: jest.fn(),
            collapseAll: jest.fn(),
            deselectAll: jest.fn(),
            getSelectedRows: jest.fn(),
            getSelectedNodes: jest.fn(() => []),
            getRowNode: jest.fn(),
            setRowData: jest.fn(),
            refreshCells: jest.fn(),
            updateGridOptions: jest.fn()
        };

        // Assign the mock object to component['gridApi']
        component['gridApi'] = gridApiMock as GridApi;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test method updateAddScenariosButtonLabel', () => {
        component.newSelectedScenariosCount = 0;
        component['updateAddScenariosButtonLabel']();
        expect(component.addScenarioLabel).toBe('Add Scenarios (#)');

        component.newSelectedScenariosCount = 5;
        component['updateAddScenariosButtonLabel']();
        expect(component.addScenarioLabel).toBe('Add Scenarios (5)');
    });

    it('test method onDateChange', () => {
        component['loadScenarios'] = jest.fn();
        const newLookBackDate = DateValue.newDate('09/15/2021');
        component.onDateChange(newLookBackDate);
        expect(component.lookBackDate).toEqual(newLookBackDate);
    });

    it('test method onSearchValueChanged', () => {
        expect(component['searchTerm']).toBeUndefined();
        const event = {
            detail: { submitValue: { searchValue: 'ABc' }}
        } as CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>;

        component.onSearchValueChanged(event);
        expect(component['searchTerm']).toBe('abc');
    });

    it('test method defaultExpandNodes', () => {
        const rowNode = {
            setExpanded: jest.fn()
        } as unknown as RowNode;
        jest.spyOn(rowNode, 'setExpanded');
        jest.spyOn(component['gridApi'], 'getRowNode').mockReturnValue(rowNode);
        component['defaultExpandNodes']();
        expect(rowNode.setExpanded).toHaveBeenCalledWith(true);
    });

    describe('test method loadScenarios', () => {

        beforeEach(() => {
            component['previousLookBackDate'] = undefined;
        });

        it('test method loadScenarios with absolute lookBack Date', () => {
            component['loadScenarios']();
            expect(component['previousLookBackDate']).toEqual(component.lookBackDate.date);
        });

        it('test method loadScenarios with relative lookBack Date for success', () => {
            component.lookBackDate = DateValue.newRelativeDate('T-1');
            component['loadScenarios']();
            expect(component['previousLookBackDate']).toEqual('12/01/2014');
        });

        it('test method loadScenarios with relative lookBack Date for error', () => {
            jest.spyOn(component['dateService'], 'parseDateString$').mockReturnValue(throwError(() => 'Error'));
            component.lookBackDate = DateValue.newRelativeDate('T-1');
            component['loadScenarios']();
            expect(component['previousLookBackDate']).toBeUndefined();
        });
    });

    describe('test method loadScenariosHelper', () => {

        it('test method loadScenariosHelper for success', fakeAsync(() => {
            const scenarioData: any[] = [
                cloneDeep(scenarioParams)
            ];
            component.optionValue.nameScenarios = [ new NamedScenario({ scenName: 'Demo Scenario', scenCode: 's272::DEV'})];
            jest.spyOn(component['stressScenarioService'], 'fetchScenarios$').mockReturnValue(
                of(cloneDeep(scenarioData))
            );

            const rowData: any[] = [{
                'level': 'My Scenarios@@@Demo Scenario::s272::DEV',
                'scenarioName': 'Demo Scenario',
                'scenarioDesc': '1983003430.23',
                'scenarioCode': 's272::DEV',
                'scenarioCreatedDate': '03:12:01',
                'scenarioSelected': true,
                'scenarioPurpose': undefined,
            }];
            component['getActionColMenuOptions'](rowData[0]);
            component['markScenarioAsSelected'](rowData[0]);

            const spy = jest.spyOn(component['gridApi'], 'updateGridOptions').mockImplementationOnce((gridOptions) => {
                expect(gridOptions.rowData.length).toBe(rowData.length);
                expect(JSON.stringify(gridOptions.rowData)).toEqual(JSON.stringify(rowData));
            });

            component['loadScenariosHelper']('12/01/2014');

            tick();
            expect(spy).toHaveBeenCalled();
        }));

        it('test method loadScenariosHelper for error', () => {
            jest.spyOn(component['stressScenarioService'], 'fetchScenarios$').mockReturnValue(
                throwError(() => 'Error')
            );
            jest.spyOn(component['gridApi'], 'updateGridOptions');

            component['loadScenariosHelper']('12/01/2014');

            expect(component['gridApi'].updateGridOptions).not.toHaveBeenCalled();
        });
    });

    it('test method doesExternalFilterPass', () => {
        const rowNode = {
            data: {
                scenarioName: 'Demo Scenario',
                scenarioCreator: 'xyz abc',
                scenarioCode: 'abc',
            }
        } as IRowNode;

        component['searchTerm'] = 'em';
        expect(component['doesExternalFilterPass'](rowNode)).toBeTruthy();

        component['searchTerm'] = 'eo';
        expect(component['doesExternalFilterPass'](rowNode)).toBeFalsy();
    });

    it('test method callbackToAddScenarioClicked', () => {
        const scenarioResponseParams = cloneDeep(scenarioParams);
        component['getActionColMenuOptions'](scenarioResponseParams);

        const rowNode = {
            isSelected: () => true,
            setSelected: jest.fn(),
            data: scenarioResponseParams,
            setData: jest.fn(),
        } as unknown as IRowNode;

        jest.spyOn(component['gridApi'], 'getRowNode').mockReturnValue(rowNode);

        expect(component.optionValue.nameScenarios.length).toBe(0);

        component['callbackToAddScenarioClicked'](scenarioResponseParams);

        expect(rowNode.data.scenarioSelected).toBeTruthy();
        expect(component.optionValue.nameScenarios.length).toBe(1);
        expect(component.optionValue.nameScenarios[0].code).toBe(scenarioResponseParams.scenarioCode);
    });

    describe('test methods for scenario row checkbox', () => {
        let params: ICellRendererParams;

        beforeEach(() => {
            params = {
                node: {
                    data: cloneDeep(scenarioParams),
                    isSelected: () => false,
                    setSelected: jest.fn(),
                }
            } as unknown as ICellRendererParams;
        });

        it('test method checkBoxCellRenderer - should not create checkbox for category row', () => {
            params.node.data.scenarioCode = undefined;
            expect(component['checkBoxCellRenderer'](params)).toBeUndefined();
        });

        it('test method checkBoxCellRenderer - should create checkbox for scenario row', () => {
            params.node.data.scenarioSelected = false;
            const result = component['checkBoxCellRenderer'](params);

            expect(result).not.toBeUndefined();
            expect(result.children.length).toBe(1);
            const checkboxIcon = result.children.item(0) as HTMLAuxCheckboxElement;
            expect(checkboxIcon.isDisabled).toBeFalsy();
            expect(checkboxIcon.isChecked).toBeFalsy();
        });

        it('test method checkBoxCellRenderer - should check and disable the checkbox for already added scenario', () => {
            params.node.data.scenarioSelected = true;
            const result = component['checkBoxCellRenderer'](params);

            expect(result).not.toBeUndefined();
            expect(result.children.length).toBe(1);
            const checkboxIcon = result.children.item(0) as HTMLAuxCheckboxElement;
            expect(checkboxIcon.isDisabled).toBeTruthy();
            expect(checkboxIcon.isChecked).toBeTruthy();
        });

        it('test method onCheckBoxChanged', () => {
            expect(component.newSelectedScenariosCount).toBe(0);

            component['onCheckBoxChanged'](true, params);
            expect(component.newSelectedScenariosCount).toBe(1);

            component['onCheckBoxChanged'](false, params);
            expect(component.newSelectedScenariosCount).toBe(0);
        });

        describe('test for single select use case', () => {
            beforeEach(() => {
                component.allowNamedScenarioSingleSelection = true;
            });

            it('test method checkBoxCellRenderer - should create radio button for scenario row', () => {
                params.node.data.scenarioSelected = false;
                const result = component['checkBoxCellRenderer'](params);

                expect(result).not.toBeUndefined();
                expect(result.children.length).toBe(1);
                const radioIcon = result.children.item(0) as HTMLAuxRadioElement;
                expect(radioIcon.isDisabled).toBeFalsy();
                expect(radioIcon.isChecked).toBeFalsy();
            });

            it('test method checkBoxCellRenderer - should check the radio button for already added scenario', () => {
                params.node.data.scenarioSelected = true;
                jest.spyOn(params.node, 'isSelected').mockImplementationOnce(() => true);

                const result = component['checkBoxCellRenderer'](params);

                expect(result).not.toBeUndefined();
                expect(result.children.length).toBe(1);
                const radioIcon = result.children.item(0) as HTMLAuxRadioElement;
                expect(radioIcon.isDisabled).toBeFalsy();
                expect(radioIcon.isChecked).toBeTruthy();
            });

            it('test method onCheckBoxChanged', () => {
                expect(component.newSelectedScenariosCount).toBe(0);

                params.api = component['gridApi'];

                component['onCheckBoxChanged'](true, params);
                expect(component.newSelectedScenariosCount).toBe(1);

                component['onCheckBoxChanged'](false, params);
                expect(component.newSelectedScenariosCount).toBe(0);
            });
        });

    });

    describe('test method getRowId', () => {
        it('test for empty params', () => {
            const val = component['getRowId'](undefined);
            expect(val).toBeDefined();
            expect(val).not.toBeNull();
            expect(val.length).toBeGreaterThan(0);
        });
        it('test for scenario category row', () => {
            const params = cloneDeep(scenarioParams);
            params.level = 'My Scenarios';
            params.scenarioCode = undefined;
            expect(component['getRowId'](params)).toEqual('My Scenarios');
        });

        it('test for scenario row', () => {
            const params = cloneDeep(scenarioParams);
            expect(component['getRowId'](params)).toEqual('My Scenarios@@@Demo Scenario@@@s272::DEV');
        });
    });

    describe('test method addSelectedScenariosToList', () => {
        it('test method for single select use case', () => {
            component.allowNamedScenarioSingleSelection = true;
            component.optionValue.nameScenarios = [
                new NamedScenario({
                    scenName: 'ABC',
                    scenCode: 'ABC::XYZ',
                    scenCategory: 'Aladdin Scenarios',
                }),
            ];
            const rows = [ cloneDeep(scenarioParams) ];
            jest.spyOn(component.closeManageScenarioModal, 'emit');
            expect(component.optionValue.nameScenarios.length).toBe(1);
            component['addSelectedScenariosToList'](rows);
            expect(component.optionValue.nameScenarios.length).toBe(1);
            expect(component.closeManageScenarioModal.emit).toHaveBeenCalled();
        });

        it('test method for multi select use case', () => {
            const rows = [ cloneDeep(scenarioParams) ];
            jest.spyOn(component.closeManageScenarioModal, 'emit');
            expect(component.optionValue.nameScenarios.length).toBe(0);
            component['addSelectedScenariosToList'](rows);
            expect(component.optionValue.nameScenarios.length).toBe(1);
            expect(component.closeManageScenarioModal.emit).toHaveBeenCalled();
        });
    });

    describe('test method getActionColMenuOptions', () => {
        it('test for single select use case', () => {
            component.allowNamedScenarioSingleSelection = true;
            const options: any = {};
            component['getActionColMenuOptions'](options);
            expect(options.actionCol.inlineMenuData[0].length).toBe(1);
        });
        it('test for multiple select use case', () => {
            const options: any = {};
            component['getActionColMenuOptions'](options);
            expect(options.actionCol.inlineMenuData[0].length).toBe(2);
        });
    });

    describe('test autoGroupColumnDef', () => {
        it('test autoGroupColumnDef cellStyle', () => {
            expect(component.gridOptions).toBeDefined();
            expect(component.gridOptions.autoGroupColumnDef).toBeDefined();
            const cellStyle = component.gridOptions.autoGroupColumnDef.cellStyle;
            let params = {
                data: {
                    level: 'Team Scenarios'
                }
            } as CellClassParams;
            // @ts-ignore
            expect(cellStyle(params)).toStrictEqual({ 'font-weight': 'bold' });

            params = {
                data: undefined
            } as CellClassParams;
            // @ts-ignore
            expect(cellStyle(params)).toBeNull();
        });

        it('test autoGroupColumnDef tooltipValueGetter', () => {
            expect(component.gridOptions).toBeDefined();
            expect(component.gridOptions.autoGroupColumnDef).toBeDefined();
            const tooltipValueGetterMethod = component.gridOptions.autoGroupColumnDef.tooltipValueGetter;
            let params = {
                node: {
                    data: {
                        scenarioCode: 'x1::y1',
                    }
                },
                value: 'This is scenario name'
            } as any;
            // @ts-ignore
            expect(tooltipValueGetterMethod(params)).toStrictEqual('This is scenario name');

            params = {
                node: {
                    data: {
                        level: 'Team Scenarios',
                    }
                },
                value: 'This is scenario name'
            } as any;
            // @ts-ignore
            expect(tooltipValueGetterMethod(params)).toBeUndefined();
        });
    });

    it('test method getDataPath', () => {
        let data = { level: undefined } as ScenarioResponse;
        let result = component['getDataPath'](data);
        expect(result).toBeDefined();
        expect(result.length).toBe(0);

        data = {
            level: 'ABC@@@XYZ'
        } as ScenarioResponse;
        result = component['getDataPath'](data);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);
    });

    it('test method onGridReady', () => {
        // @ts-ignore
        const spy = jest.spyOn(component, 'loadScenarios').mockImplementationOnce(jest.fn());
        component['onGridReady']({ api: component['gridApi'] } as any);
        expect(spy).toHaveBeenCalled();
    });

    it('test method onRowDataUpdated ', fakeAsync(() => {
        const collapseAllSpy = jest.spyOn(component['gridApi'], 'collapseAll');
        component['onRowDataUpdated'](undefined);
        expect(collapseAllSpy).toHaveBeenCalled();
    }));

    describe('test getColumnDefs', () => {
        it('test getColumnDefs for Description', () => {
            const colDefs = component['getColumnDefs']();
            const scenarioDescColDef = colDefs[1];
            const tooltipValueGetter = scenarioDescColDef.tooltipValueGetter;
            expect(tooltipValueGetter).toBeDefined();
            expect(tooltipValueGetter({ value: 'This is scenario description' } as any)).toEqual('This is scenario description');
        });
    });

});
