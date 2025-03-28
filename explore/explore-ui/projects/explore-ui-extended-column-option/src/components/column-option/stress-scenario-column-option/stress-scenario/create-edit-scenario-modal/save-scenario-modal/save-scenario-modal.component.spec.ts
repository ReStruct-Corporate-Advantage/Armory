import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaveScenarioModalComponent } from './save-scenario-modal.component';
import {of, throwError} from 'rxjs';
import {StressScenarioService} from '../../../../../../services/stress-scenario.service';
import {CoreUserMetaDataStore, ExploreDialogParam, NOTIFICATION_SERVICE_TOKEN, UserMetaData} from '@blk/explore-ui-core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {StressScenario} from '../../../../../../models/stress-scenario.model';
import {ScenarioCategoryEnum} from '../../../../../../enums/scenario-category.enum';

describe('SaveScenarioModalComponent', () => {
    let component: SaveScenarioModalComponent;
    let fixture: ComponentFixture<SaveScenarioModalComponent>;

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.globalFavPerms = false;
    });

    beforeEach(async () => {
        const notificationServiceStub = {
            error: jest.fn(),
        };
        const stressScenarioServiceStub = {
            fetchScenario$: jest.fn(() => of(null)),
            saveScenario$: jest.fn(() => of({})),
        };

        await TestBed.configureTestingModule({
            declarations: [ SaveScenarioModalComponent ],
            providers: [
                {provide: StressScenarioService, useValue: stressScenarioServiceStub},
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(SaveScenarioModalComponent);
        component = fixture.componentInstance;
        component.scenario = new StressScenario();
        fixture.detectChanges();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.selections).toBeDefined();
    });

    it('test method onScenarioNameChanged', () => {
        component.scenarioName = 'ABC';
        component.onScenarioNameChanged({
            detail: {
                srcEvent: {
                    target: {
                        value: 'Xy1 Z-X._P'
                    }
                }
            }
        } as unknown as CustomEvent);
        expect(component.scenarioName).toBe('Xy1 Z-X._P');
    });

    it('test for isSaveButtonDisabled', () => {
        component.scenario.scenName = undefined;
        component.onScenarioNameChanged({
            detail: {
                srcEvent: {
                    target: {
                        value: 'Xy1 Z-X._P'
                    }
                }
            }
        } as unknown as CustomEvent);
        expect(component.isSaveButtonDisabled).toBeFalsy();


        component.scenario.scenName = 'ABC';
        component.onScenarioNameChanged({
            detail: {
                srcEvent: {
                    target: {
                        value: 'Xy1 Z-X._P'
                    }
                }
            }
        } as unknown as CustomEvent);
        expect(component.isSaveButtonDisabled).toBeTruthy();
    });

    it('test method onScenarioDescChanged', () => {
        expect(component.scenarioDesc).toBeUndefined();
        component.onScenarioDescChanged({
            detail: {
                srcEvent: {
                    target: {
                        value: 'XYZ'
                    }
                }
            }
        } as unknown as CustomEvent);
        expect(component.scenarioDesc).toBe('XYZ');
    });

    it('test method onTypeChanged', () => {
        component.type = 'xyz';
        component.onTypeChanged({
            value: 'abc',
            displayValue: undefined,
        });
        expect(component.type).toBe('abc');
    });

    describe('test method onSaveButtonClicked', () => {

        it('test method onSaveButtonClicked for invalid name', () => {
            component.scenarioName = 'ABC$';

            component.onSaveButtonClicked();

            expect(component.validator[0].validate(component.scenarioName)).toBeFalsy();
            expect(component['stressScenarioService'].fetchScenario$).not.toHaveBeenCalled();
            expect(component['stressScenarioService'].saveScenario$).not.toHaveBeenCalled();
        });

        it('test method onSaveButtonClicked for SaveAs button', () => {
            component.scenarioName = 'ABC';

            component.onSaveButtonClicked(true);

            expect(component['stressScenarioService'].fetchScenario$).toHaveBeenCalled();
            expect(component['stressScenarioService'].saveScenario$).toHaveBeenCalled();
        });

        it('test method onSaveButtonClicked for Save button', () => {
            component.scenarioName = 'ABC';

            component.onSaveButtonClicked();

            expect(component['stressScenarioService'].fetchScenario$).not.toHaveBeenCalled();
            expect(component['stressScenarioService'].saveScenario$).toHaveBeenCalled();
        });
    });

    it('test method closeDialog', () => {
        component.promptDialog$.next({} as unknown as ExploreDialogParam);
        component.closeDialog();
        expect(component.promptDialog$.getValue()).toBeNull();
    });

    describe('test method verifyAndSaveScenario', () => {

        it('test when scenario exists', () => {
            jest.spyOn(component['stressScenarioService'], 'fetchScenario$').mockImplementationOnce((_params: any) => {
                return of(new StressScenario());
            });
            expect(component.promptDialog$.getValue()).toBeNull();
            component['verifyAndSaveScenario']();
            expect(component.promptDialog$.getValue()).not.toBeNull();
            // would be called when clicked on Ok
            expect(component['stressScenarioService'].saveScenario$).not.toHaveBeenCalled();
        });

        it('test when scenario does not exists', () => {
            jest.spyOn(component['stressScenarioService'], 'fetchScenario$').mockImplementationOnce((_params: any) => {
                return of(null);
            });
            expect(component.promptDialog$.getValue()).toBeNull();
            component['verifyAndSaveScenario']();
            expect(component.promptDialog$.getValue()).toBeNull();
            expect(component['stressScenarioService'].saveScenario$).toHaveBeenCalled();
        });

        it('test when fetchScenario$ errors out', () => {
            jest.spyOn(component['stressScenarioService'], 'fetchScenario$').mockImplementationOnce((_params: any) => {
                return throwError(() => new Error());
            });
            expect(component.promptDialog$.getValue()).toBeNull();
            component['verifyAndSaveScenario']();
            expect(component.promptDialog$.getValue()).toBeNull();
            expect(component['notificationService'].error).toHaveBeenCalled();
        });
    });

    it('test method setIsSaveButtonDisabledBasedOnCategory', () => {
        component.scenario.scenCategory = ScenarioCategoryEnum.ALADDIN_SCENARIOS;
        component.isSaveButtonDisabledBasedOnCategory = false;
        component['setIsSaveButtonDisabledBasedOnCategory']();
        expect(component.isSaveButtonDisabledBasedOnCategory).toBeTruthy();

        component.scenario.scenCategory = ScenarioCategoryEnum.TEAM_SCENARIOS;
        component.isSaveButtonDisabledBasedOnCategory = false;
        component['setIsSaveButtonDisabledBasedOnCategory']();
        expect(component.isSaveButtonDisabledBasedOnCategory).toBeTruthy();

        component.scenario.scenCategory = ScenarioCategoryEnum.MY_SCENARIOS;
        component.isSaveButtonDisabledBasedOnCategory = false;
        component['setIsSaveButtonDisabledBasedOnCategory']();
        expect(component.isSaveButtonDisabledBasedOnCategory).toBeFalsy();

        component.scenario.scenCategory = ScenarioCategoryEnum.ENTERPRISE_SCENARIOS;
        component.isSaveButtonDisabledBasedOnCategory = false;
        component['setIsSaveButtonDisabledBasedOnCategory']();
        expect(component.isSaveButtonDisabledBasedOnCategory).toBeTruthy();

        component.scenario.scenCategory = ScenarioCategoryEnum.MY_SCENARIOS;
        component.scenario.convertToSpecifiedShock = true;
        component.isSaveButtonDisabledBasedOnCategory = false;
        component['setIsSaveButtonDisabledBasedOnCategory']();
        expect(component.isSaveButtonDisabledBasedOnCategory).toBeTruthy();
    });
});
