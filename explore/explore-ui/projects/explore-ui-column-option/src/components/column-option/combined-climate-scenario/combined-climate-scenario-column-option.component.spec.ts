import {ColumnOptionTestBed} from '../../../test-utils';
import {CombinedClimateScenarioColumnOptionComponent} from './combined-climate-scenario-column-option.component';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';
import { CombinedClimateScenariosColumnOption } from '../../../models/column-option/combined-climate-scenarios-column-option.model';

describe('CombinedClimateScenarioColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<CombinedClimateScenarioColumnOptionComponent, CombinedClimateScenariosColumnOption>;

    beforeEach(() => {
        const mockedOption = {
            columnOptionTitle: 'ClimateScenario',
            columnOptionConfigType: 'climateScenario',
            columnOptionKey: 'climateScenario',
            columnOptionAttributes: [{
                title: 'Type'
            }]
        };
        // Additional column config

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<CombinedClimateScenarioColumnOptionComponent, CombinedClimateScenariosColumnOption>(
            CombinedClimateScenarioColumnOptionComponent, new CombinedClimateScenariosColumnOption(), mockedOption,
            undefined,
            undefined,
            undefined,
            undefined);
    });

    describe('ngOnInit Tests', () => {
        it('should initialize the component', () => {
            expect(testBed.component).toBeTruthy();
        });

        it('should add a new scenario rule', () => {
            const scenario1 = new ClimateScenario();
            const scenario2 = new ClimateScenario();

            testBed.component.climateScenariosColumnOption.climateScenario = [];
            testBed.component.climateScenariosColumnOption.climateScenario.push(scenario1, scenario2);
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(2);

            testBed.component.addNewScenarioRule();
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(3);

            testBed.component.deleteRule(1);
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(2);
        });
    });
});
