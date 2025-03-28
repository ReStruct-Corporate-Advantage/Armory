import {ComponentFixture, TestBed} from '@angular/core/testing';
import {StressScenarioComponent} from './stress-scenario.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {DateScenario, NamedScenario, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {StressScenarioService} from '../../../../services/stress-scenario.service';
import {StressScenario} from '../../../../models/stress-scenario.model';
import {ScenarioResponse} from '../../../../interfaces/scenario-response.interface';
import {ScenarioCategoryEnum} from '../../../../enums/scenario-category.enum';
import {cloneDeep} from 'lodash';
import {ScenarioTypeEnum} from '../../../../enums/scenario-type.enum';

describe('StressScenariosComponent', () => {
    let component: StressScenarioComponent;
    let fixture: ComponentFixture<StressScenarioComponent>;

    const notificationServiceStub = {
        error: jest.fn(),
    };

    const stressScenarioServiceStub = {
        fetchScenario$: jest.fn(() => {
            return of(new StressScenario());
        }),
        fetchScenarioCategories$: jest.fn(() => {
            return of({ 'ABC': 'Aladdin Scenarios' });
        })
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ StressScenarioComponent ],
            providers: [
                {provide: StressScenarioService, useValue: stressScenarioServiceStub},
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(StressScenarioComponent);
        component = fixture.componentInstance;

        component.optionValue = new ScenarioColumnOption();
        component.showSpinnerOnScenarioColumnOption$ = new BehaviorSubject<boolean>(false);
        component.optionValue.nameScenarios = [
            new NamedScenario({
                scenName: 'ABC XYZ',
                scenCode: 'ABC',
                scenCategory: 'Aladdin Scenarios',
            }),
        ];
        component.optionValue.dateScenarios = [
            new DateScenario({
                data: {
                    fromDate: {
                        date: '03/15/2021'
                    },
                    toDate: {
                        date: '03/30/2021',
                    }
                }
            })
        ];

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test method openAddStressScenariosModal', () => {
        component.isOpenAddScenarios = false;
        component.openAddStressScenariosModal();
        expect(component.isOpenAddScenarios).toBeTruthy();
    });

    it('test method closeAddStressScenariosModal', () => {
        component.isOpenAddScenarios = true;
        component.closeAddStressScenariosModal();
        expect(component.isOpenAddScenarios).toBeFalsy();
    });

    it('test method deleteSelectedScenario', () => {
        component.optionValue.nameScenarios = [
            new NamedScenario({ scenName: 'ABC'}),
            new NamedScenario({ scenName: 'XYZ'}),
            new NamedScenario({ scenName: 'TYE'}),
        ];
        component.deleteNamedScenario(1);
        expect(component.optionValue.nameScenarios.length).toBe(2);
        expect(component.optionValue.nameScenarios[1].name).toBe('TYE');
    });

    it('test method openEditStressScenarioModal', () => {
        expect(component.optionValue.nameScenarios.length).toBe(1);
        expect(component.isOpenEditScenarioModal).toBeFalsy();
        component.openEditStressScenarioModal(0);
        expect(component.updatedOptionValue.nameScenarios.length).toBe(1);
        expect(component.isOpenEditScenarioModal).toBeTruthy();
    });

    it('test method openEditStressScenarioModal for fetchScenario failure', () => {
        expect(component.optionValue.nameScenarios.length).toBe(1);
        expect(component.isOpenEditScenarioModal).toBeFalsy();
        jest.spyOn(component['stressScenarioService'], 'fetchScenario$').mockImplementationOnce((_params: any) => {
            return throwError(() => new Error('Error'));
        });
        component.openEditStressScenarioModal(0);
        expect(component.updatedOptionValue.nameScenarios.length).toBe(1);
        expect(component.isOpenEditScenarioModal).toBeFalsy();
    });

    describe('test method onCreateOrEditScenarioModalFromManageScenarios', () => {
        it('test for create new scenario', () => {
            expect(component.isOpenEditScenarioModal).toBeFalsy();
            component.onCreateOrEditScenarioModalFromManageScenarios(undefined);
            expect(component.selectedScenario).toEqual(new StressScenario());
            expect(component.updatedOptionValue.nameScenarios.length).toBe(1);
            expect(component.isOpenEditScenarioModal).toBeTruthy();
        });

        it('test for edit scenario which is not already selected', () => {
            const params: ScenarioResponse = {
                level: 'Aladdin Scenarios@@@PGS',
                scenarioName: 'PGS',
                scenarioCode: 'PGS::XYZ'
            };
            expect(component.isOpenEditScenarioModal).toBeFalsy();

            component.onCreateOrEditScenarioModalFromManageScenarios(params);

            const expectedScenario: StressScenario = new StressScenario();
            expectedScenario.scenCategory = ScenarioCategoryEnum.ALADDIN_SCENARIOS;
            expectedScenario.scenCode = 'PGS';

            expect(component.selectedScenario).toEqual(expectedScenario);
            expect(component.updatedOptionValue.nameScenarios.length).toBe(1);
            expect(component.isOpenEditScenarioModal).toBeTruthy();
        });

        it('test for edit scenario which is already selected', () => {
            const params: ScenarioResponse = {
                level: 'Aladdin Scenarios@@@ABC',
                scenarioName: 'ABC',
                scenarioCode: 'ABC::XYZ',
                scenarioSelected: true,
            };
            expect(component.isOpenEditScenarioModal).toBeFalsy();

            component.onCreateOrEditScenarioModalFromManageScenarios(params);

            const expectedScenario: StressScenario = new StressScenario();
            expectedScenario.scenCategory = ScenarioCategoryEnum.ALADDIN_SCENARIOS;
            expectedScenario.scenCode = 'ABC';

            expect(component.selectedScenario).toEqual(expectedScenario);
            expect(component.updatedOptionValue.nameScenarios.length).toBe(1);
            expect(component.isOpenEditScenarioModal).toBeTruthy();
        });
    });

    describe('test method onCreateEditScenarioModalClosed', () => {
        it('test for save and add button clicked for scenario is not Date Range', () => {
            expect(component.optionValue.nameScenarios.length).toBe(1);
            component.selectedScenario = new StressScenario();
            component.updatedOptionValue = cloneDeep(component.optionValue);
            component.onCreateEditScenarioModalClosed(true);
            expect(component.optionValue.nameScenarios.length).toBe(2);
        });
        it('test for save and add button clicked for scenario is Date Range', () => {
            expect(component.optionValue.dateScenarios.length).toBe(1);
            component.selectedScenario = new StressScenario({ scenType: ScenarioTypeEnum.DATE_RANGE});
            component.updatedOptionValue = cloneDeep(component.optionValue);
            component.onCreateEditScenarioModalClosed(true);
            expect(component.optionValue.dateScenarios.length).toBe(2);
        });
        it('test for cancel clicked', () => {
            expect(component.optionValue.nameScenarios.length).toBe(1);
            component.onCreateEditScenarioModalClosed(false);
            expect(component.optionValue.nameScenarios.length).toBe(1);
        });
    });

    it('test deleteDateScenario', () => {
        expect(component.optionValue.dateScenarios.length).toBe(1);
        component.deleteDateScenario(0);
        expect(component.optionValue.dateScenarios.length).toBe(0);
    });

    it('test openEditStressScenarioModalForDateRange', () => {
        expect(component.optionValue.dateScenarios.length).toBe(1);
        expect(component.isOpenEditScenarioModal).toBeFalsy();
        component.openEditStressScenarioModalForDateRange(0);
        expect(component.updatedOptionValue.dateScenarios.length).toBe(0);
        expect(component.optionValue.dateScenarios.length).toBe(1);
        expect(component.isOpenEditScenarioModal).toBeTruthy();

        const expectedScenario = new StressScenario({
            scenName: component.optionValue.dateScenarios[0].name,
            scenType: ScenarioTypeEnum.DATE_RANGE
        });
        expectedScenario.dateScenario = component.optionValue.dateScenarios[0];

        expect(component.selectedScenario).toEqual(expectedScenario);
    });

    describe('test method setScenarioCategories', () => {
        it('test setScenarioCategories for success', () => {
            component.optionValue.nameScenarios = [
                new NamedScenario({
                    scenName: 'ABC XYZ',
                    scenCode: 'ABC',
                }),
            ];
            component['setScenarioCategories']();
            expect(component.optionValue.nameScenarios[0].category).toEqual('Aladdin Scenarios');
        });
        it('test setScenarioCategories for error', () => {
            component.optionValue.nameScenarios = [
                new NamedScenario({
                    scenName: 'ABC XYZ',
                    scenCode: 'ABC',
                }),
            ];
            jest.spyOn(component['stressScenarioService'], 'fetchScenarioCategories$').mockImplementationOnce(() => throwError(() => 'error'));
            const errorNotifySpy = jest.spyOn(component['notificationService'], 'error');
            component['setScenarioCategories']();
            expect(component.optionValue.nameScenarios[0].category).toBeUndefined();
            expect(errorNotifySpy).toHaveBeenCalled();
        });
    });

});
