import {
    ColumnOptionFactory,
    CoreTestUtils,
    OtherScenarioComponent,
    DateValue,
    DateStore,
    NamedScenario,
    OtherScenario,
} from '@blk/explore-ui-core';
import {ColumnOptionTestBed, ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {StressScenarioColumnOptionComponent} from './stress-scenario-column-option.component';
import {StressScenarioComponent} from './stress-scenario/stress-scenario.component';
import {SCENARIO_CREATION_ENABLED_TOKEN} from '../../../tokens';


describe('StressScenarioColumnOptionComponent', () => {

    let component: StressScenarioColumnOptionComponent;

    const defaultLookBackDate = DateValue.newRelativeDate('T-' + 8000);
    defaultLookBackDate.calCode = '';

    /**
     * Performs required initialisation before any test is run
     */
    beforeEach(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(ScenarioColumnOption.ALT_CONFIG_TYPE, ScenarioColumnOption);

        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Scenario Selection',
            columnOptionAttributes: [{
                title: 'Named Scenario',
                key: 'NAMED-SCENARIO',
                dataType: 'S'
            }],
            columnOptionKey: 'scenarioRiskFactorViewColumnSettings'
        };

        const scenarioColumnOption = new ScenarioColumnOption();
        scenarioColumnOption.lookBackDate = defaultLookBackDate;

        DateStore.currentDate$.next(defaultLookBackDate);

        // Create the testbed for testing the component.
        const testBed = new ColumnOptionTestBed<StressScenarioColumnOptionComponent, ScenarioColumnOption>(
            StressScenarioColumnOptionComponent,
            scenarioColumnOption,
            mockedOption,
            [StressScenarioComponent, OtherScenarioComponent],
            undefined,
            undefined,
            undefined,
            [{provide: SCENARIO_CREATION_ENABLED_TOKEN, useValue: true}],
        );
        component = testBed.component;

        component.optionValue.nameScenarios = [
            new NamedScenario({
                scenName: 'ABC',
                scenCode: 'ABC::XYZ',
                scenCategory: 'Aladdin Scenarios',
            }),
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component['isScenarioCreationWorkflowEnabled']).toBeTruthy();
        expect(component.disableCreateScenarioButton).toBeFalsy();
    });


    it('test method handleSingleSelectScenario', () => {
        component.optionValue.nameScenarios.push(...component.optionValue.nameScenarios);
        component.isRestrictedModeEnabled = true;
        expect(component.optionValue.nameScenarios.length).toBe(2);
        component['handleSingleSelectScenario']();
        expect(component.optionValue.nameScenarios.length).toBe(1);
    });

    it('test method handleOtherScenarios', () => {
        component.optionValue.otherScenarios = [
            new OtherScenario({
                data: {
                    name: 'abc',
                    purpose: 'x123'
                },
                enableOtherScenario: true,
            }),
        ];
        expect(component.optionValue.nameScenarios.length).toBe(1);
        component['handleOtherScenarios']();
        expect(component.optionValue.nameScenarios.length).toBe(2);
    });

    it('test method setDisableScenarioCreation', () => {
        // @ts-ignore
        expect(component.isScenarioCreationDisabled).toBeFalsy();

        component.option = { columnOptionAttributes: [{ 'isRestricted': true, 'optimizationFlow': true, }] };
        component['setDisableScenarioCreation']();
        expect(component.isScenarioCreationDisabled).toBeTruthy();
        expect(component.disableCreateScenarioButton).toBeTruthy();
    });
});
