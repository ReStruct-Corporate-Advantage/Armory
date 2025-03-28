import {ScenarioAdditionalColumnOptionComponent} from './scenario-additional-column-option.component';
import {ScenarioAdditionalColumnOptionModel} from '../../../../models/column-option/scenario-additional-column-option.model';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ColumnOptionTestBed} from '../../../../test-utils';

describe('ScenarioAdditionalColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<ScenarioAdditionalColumnOptionComponent, ScenarioAdditionalColumnOptionModel>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Scenario settings',
            columnOptionConfigType: 'scenarioSettingsColumnOption'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ScenarioAdditionalColumnOptionComponent, ScenarioAdditionalColumnOptionModel>(
            ScenarioAdditionalColumnOptionComponent,
            new ScenarioAdditionalColumnOptionModel(),
            mockedOption,
            [],
            'stress_pnl',
            'PORT'
        );
    });

    it('should create', () => {
        expect(testBed.component).toBeTruthy();
    });

    it('should return the correct config type from getOptionValueConfigType', () => {
        expect(testBed.component.getOptionValueConfigType()).toBe(ScenarioAdditionalColumnOptionModel.CONFIG_TYPE);
    });

    it('should update optionValue.floorPnL when onFloorPnLChanged is called', () => {
        testBed.component.optionValue = new ScenarioAdditionalColumnOptionModel();
        const checkboxEventDetail = {
            detail: {
                value: {checked: true}
            }
        } as CustomEvent<AuxCheckboxChangedDetailInterface>;

        const checkboxEventDetail2 = {
            detail: {
                value: {checked: false}
            }
        } as CustomEvent<AuxCheckboxChangedDetailInterface>;

        testBed.component.onFloorPnLChanged(checkboxEventDetail);
        expect(testBed.component.optionValue.floorPnL).toBe(true);

        expect(testBed.component.optionValue.fullReval).toBeUndefined();

        testBed.component.onFullRevalChanged(checkboxEventDetail);

        expect(testBed.component.optionValue.fullReval).toBe(true);

        testBed.component.onFullRevalChanged(checkboxEventDetail2);

        expect(testBed.component.optionValue.fullReval).toBe(false);
        expect(testBed.component.optionValue.floorPnL).toBe(false);
    });
});
