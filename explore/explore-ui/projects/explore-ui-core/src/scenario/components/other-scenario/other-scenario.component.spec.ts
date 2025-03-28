import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {NamedScenario} from '../../../definition/models/scenario/named-scenario.model';
import {OtherScenarioComponent} from './other-scenario.component';
import {OtherScenario} from '../../models/other-scenario.model';

describe('Other Scenario Component', () => {
    let component: OtherScenarioComponent;
    let fixture: ComponentFixture<OtherScenarioComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                OtherScenarioComponent,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        // Create the component.
        fixture = TestBed.createComponent(OtherScenarioComponent);
        component = fixture.componentInstance;

        // Add the required parameters.
        component.scenarios = [];

        const namedScenario = new NamedScenario();
        namedScenario.code = 'GLOBAL::P100';
        component.namedScenarios = [namedScenario];

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('The control initializes correctly', () => {
        expect(component.scenarios.length).toBe(0);
    });

    it('Add scenario', () => {
        component.addScenario();
        expect(component.scenarios.length).toBe(1);
        expect(component.scenarios[0].enabled).toBeTruthy();
        expect(component.scenarios[0].name).toBe('GLOBAL');
        expect(component.scenarios[0].purpose).toBe('P100');
    });

    it('Name change event', () => {
        const event = new CustomEvent<string>('');
        event.initCustomEvent('checked', true, true, {value:'New Name'});

        // Trigger event to set the date.
        const scenario = new OtherScenario();
        component.onNameChanged(scenario, event);

        // Validate that the name has changed.
        expect(scenario.name).toBe('New Name');
    });

    it('Purpose change event', () => {
        const event = new CustomEvent<string>('');
        event.initCustomEvent('checked', true, true, {value:'New Purpose'});

        // Trigger event to set the date.
        const scenario = new OtherScenario();
        component.onPurposeChanged(scenario, event);

        // Validate that the purpose has changed.
        expect(scenario.purpose).toBe('New Purpose');
    });

    it('Scenario enabled change', () => {
        const event = new CustomEvent<any>('');
        event.initCustomEvent('checked', true, true, {
            value: {
                checked: false
            }
        });

        // Create the scenario to test.
        const scenario = new OtherScenario();
        expect(scenario.enabled).toBeTruthy();

        // Trigger event to change the state.
        component.onItemEnabledChanged(scenario, event);

        // Validate that the scenario is no longer enabled.
        expect(scenario.enabled).toBeFalsy();
    });

    it('Delete scenario', () => {
        // Create the scenario to test.
        const scenario1 = new OtherScenario();
        const scenario2 = new OtherScenario();
        const scenario3 = new OtherScenario();
        component.scenarios.push(scenario1);
        component.scenarios.push(scenario2);
        component.scenarios.push(scenario3);

        // Make sure that scenario all scenarios have different ids.
        expect(scenario1.id).not.toBe(scenario2.id);
        expect(scenario2.id).not.toBe(scenario3.id);
        expect(scenario3.id).not.toBe(scenario1.id);

        // Delete the second scenario (index of 1).
        component.deleteScenario(1);

        // Validate that the correct one was removed.
        expect(component.scenarios.length).toBe(2);
        expect(component.scenarios[0].id).toBe(scenario1.id);
        expect(component.scenarios[1].id).toBe(scenario3.id);
    });
});
