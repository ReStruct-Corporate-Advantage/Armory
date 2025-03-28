import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {NamedScenario} from '../../../definition/models/scenario/named-scenario.model';
import {ExploreSelectOption} from '../../../ui/models/explore-select-option.model';
import {ExploreSelectionTree} from '../../../ui/models/explore-selection-tree.model';
import {NamedScenarioComponent} from './named-scenario.component';
import {DateValue} from '../../../date/models/date-value/date-value.model';
import {UserScenariosConstants} from '../../constants';
import {UserScenarioService} from '../../services/user-scenario.service';
import {BehaviorSubject, of, Subject, throwError} from 'rxjs';
import {DateStore} from '../../../date/stores';
import {DateService} from '../../../date/services/date.service';
import {NOTIFICATION_SERVICE_TOKEN} from '../../../ui/tokens';
import {AlertConstants} from '../../../ui/constants/alert.constants';

describe('Named scenario multi select component', () => {
    let component: NamedScenarioComponent;
    let fixture: ComponentFixture<NamedScenarioComponent>;
    const scenario: NamedScenario = new NamedScenario();
    const defaultLookBackDate = DateValue.newRelativeDate('T-' + 8000);
    const showSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    const mockResponse = new Map<string, NamedScenario[]>();
    mockResponse.set(UserScenariosConstants.USER_DEFINED_SCENARIOS, [
        new NamedScenario({
            scenName: 'JKSTDABS',
            scenCode: 'JKSTDABS::DEV',
        })]);
    const userScenarioServiceStub = {
        fetchUserScenarios$: jest.fn(() => of(mockResponse))
    };
    const dateServiceStub = {
        midNightRefresh$: new Subject(),
        parseDateString$: jest.fn(() => {
            return of(new Date('12/1/2014'));
        }),
    };
    const notificationServiceStub = {
        error: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                NamedScenarioComponent,
            ],
            providers: [
                {provide: UserScenarioService, useValue: userScenarioServiceStub},
                {provide: DateService, useValue: dateServiceStub},
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        // Create the component.
        fixture = TestBed.createComponent(NamedScenarioComponent);
        component = fixture.componentInstance;

        DateStore.currentDate$.next(defaultLookBackDate);

        // Mock the list of scenarios.
        const scenarios = new Map<string, NamedScenario[]>();
        scenario.code = 'GLOBAL';
        scenario.name = 'Global Description';
        scenario.enabled = true;
        scenarios.set('Macroeconomic Scenarios', [scenario]);
        jest.spyOn(component, 'getFetchedScenarios').mockReturnValue(scenarios);
        // Add the required parameters.
        component.scenarios = [scenario];
        component.lookBackDate = defaultLookBackDate;
        component.showSpinner$ = showSpinner$;
        fixture.detectChanges();
    });

    it('The control initializes correctly', () => {
        expect(component.scenarios.length).toBe(1);
        expect(component.scenarios).toEqual([scenario]);
        expect(component.availableScenariosForPicklist.length).toBe(1);
        expect(component.selectedScenarios.length).toBe(1);
        expect(component.selectedScenarios[0].eventData).toEqual(scenario);

        // Calling ngOnInit again doesn't add duplicate scenarios
        component.ngOnInit();

        expect(component.scenarios.length).toBe(1);
        expect(component.scenarios).toEqual([scenario]);
        expect(component.availableScenariosForPicklist.length).toBe(1);
        expect(component.selectedScenarios.length).toBe(1);
        expect(component.lookBackDate).toEqual(defaultLookBackDate);

        // Ensure that the components have also been created.
        expect(component.auxPickList).toBeDefined();
    });

    it('Test updated scenario list from the picklist', () => {
        const item = new ExploreSelectionTree(scenario.name);
        item.eventData = scenario;
        component.updateScenarioListFromPicklist([item]);
        expect(component.scenarios.length).toBe(2);
        expect(component.scenarios[1]).toEqual(scenario);
    });

    it('Test updated scenario list from the combobox', () => {
        const sampleScenario = new NamedScenario({code: 'sampleCode', description: 'sampleDesc', name: 'sampleName'});
        const item = new ExploreSelectOption(sampleScenario.name, sampleScenario);
        component.updateScenarioListFromCombobox(item);
        expect(component.scenarios.length).toBe(1);
        expect(component.scenarios[0]).toEqual(sampleScenario);
    });

    it('The control initializes correctly - for single name scenario selection', () => {
        component.allowNamedScenarioSingleSelection = true;
        component.scenarios = [scenario];
        component.ngOnInit();
        expect(component.availableScenariosForCombobox.length).toBe(1);
    });

    it('On lookBackDate change', () => {
        jest.spyOn(component['userScenarioService'], 'fetchUserScenarios$');

        const date = DateValue.newRelativeDate('T-' + 2000);
        component.onDateChange(date);
        expect(component.lookBackDate).toEqual(date);
        expect(component['userScenarioService'].fetchUserScenarios$).toHaveBeenCalled();

        component.onDateChange(date);
        expect(component.lookBackDate).toEqual(date);
        expect(component['userScenarioService'].fetchUserScenarios$).toHaveBeenCalled();
    });

    it('test loadScenarios method with absolute date', () => {
        component.lookBackDate = DateValue.newDate('02/15/2021');
        component['loadScenarios'](false);
        expect(component.prevLookBackDate).toBe('02/15/2021');
    });

    it('test loadScenarios method when component is again rendered after columns switch', () => {
        component.lookBackDate = DateValue.newDate('02/15/2021');
        component.ngOnInit();
    });

    it('test for parse relative date errors', () => {
        jest.spyOn(component['notificationService'], 'error');
        jest.spyOn(component['dateService'], 'parseDateString$').mockReturnValue(throwError(''));

        component['setDefaultLookBackDateAndLoadScenarios']();
        expect(component['notificationService'].error).toHaveBeenCalledWith(AlertConstants.DATE_SERVICE_ERROR);

        component.lookBackDate = DateValue.newRelativeDate('T-' + 2000);
        component['loadScenarios'](true);
        expect(component['notificationService'].error).toHaveBeenCalledWith(AlertConstants.DATE_SERVICE_ERROR);
    });

    it('test for fetchUserScenarios$ errors', () => {
        jest.spyOn(component['notificationService'], 'error');
        jest.spyOn(component['userScenarioService'], 'fetchUserScenarios$').mockReturnValue(throwError(''));

        component.lookBackDate = DateValue.newDate('02/15/2021');
        component['loadScenarios'](false);
        expect(component['notificationService'].error).toHaveBeenCalledWith(UserScenariosConstants.FETCH_SCENARIOS_ERROR + '02/15/2021');
    });
});
