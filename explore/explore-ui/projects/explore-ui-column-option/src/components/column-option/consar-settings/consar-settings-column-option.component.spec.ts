import {ConsarSettingsColumnOption} from '../../../models/column-option/consar-settings-column-option.model';
import {ConsarScenarioType} from '../../../enums/consar-scenario-type.enum';
import {ConsarSettingsColumnOptionComponent} from './consar-settings-column-option.component';
import {ColumnOptionTestBed} from '../../../test-utils';

describe('Consar settings column options component test', () => {
    let testBed: ColumnOptionTestBed<ConsarSettingsColumnOptionComponent, ConsarSettingsColumnOption>;

    beforeEach(() => {
        const option: any = {
            columnOptionAttributes: [{
                title: 'Consar settings',
                key: 'consarSettings',
                dataType: 'S',
                values: [
                    {label: 'SCENARIO_TYPE', value: true},
                    {label: 'CONFIDENCE_LEVEL', value: true},
                    {label: 'HISTORY', value: true}
                ]
            }],
            columnOptionTitle: 'Consar settings',
            columnOptionKey: 'consarSettings',
            columnOptionConfigType: 'consarSettings'
        };

        const consarSettingsColumnOption: ConsarSettingsColumnOption = new ConsarSettingsColumnOption();
        consarSettingsColumnOption.initialize(option);

        testBed = new ColumnOptionTestBed<ConsarSettingsColumnOptionComponent, ConsarSettingsColumnOption>(ConsarSettingsColumnOptionComponent, consarSettingsColumnOption, option);
    });

    it('should have aux-radio-group and aux-numeric-stepper component', () => {
        const compiled: any = testBed.fixture.debugElement.nativeElement;

        const selectCtrl: any = compiled.querySelector('aux-radio-group');
        expect(selectCtrl).not.toBe(null);

        const stepperCtrl: any = compiled.querySelector('aux-numeric-stepper');
        expect(stepperCtrl).not.toBe(null);
    });

    it('should display scenario type', () => {
        const component: ConsarSettingsColumnOptionComponent = testBed.component;
        expect(component.showScenarioType()).toBeTruthy();
    });

    it('should display confidence level', () => {
        const component: ConsarSettingsColumnOptionComponent = testBed.component;
        expect(component.showConfidenceLevel()).toBeTruthy();
    });

    it('should display history', () => {
        const component: ConsarSettingsColumnOptionComponent = testBed.component;
        expect(component.showHistory()).toBeTruthy();
    });

    it('should change option value scenario type on scenario type option changes', () => {
        const component: ConsarSettingsColumnOptionComponent = testBed.component;

        let event: any = {detail: {}};
        component.optionValue.scenarioType = ConsarScenarioType.REGULAR;
        component.onScenarioTypeOptionChanged(event);
        expect(component.optionValue.scenarioType).toBe(ConsarScenarioType.REGULAR);

        event = {detail: {value: {eventData: ConsarScenarioType.STRESS}}};
        component.optionValue.scenarioType = ConsarScenarioType.REGULAR;
        component.onScenarioTypeOptionChanged(event);
        expect(component.optionValue.scenarioType).toBe(ConsarScenarioType.STRESS);
    });

    it('should change option value confidence level on confidence level changes', () => {
        const component: ConsarSettingsColumnOptionComponent = testBed.component;

        const event: any = {detail: {value: 25}};
        component.optionValue.confidenceLevel = 26;
        component.onConfidenceLevelChanged(event);
        expect(component.optionValue.confidenceLevel).toBe(25);
    });

    it('should change option value history on history changes', () => {
        const component: ConsarSettingsColumnOptionComponent = testBed.component;

        const event: any = {detail: {value: 1200}};
        component.optionValue.history = 1000;
        component.onHistoryChanged(event);
        expect(component.optionValue.history).toBe(1200);
    });
});
