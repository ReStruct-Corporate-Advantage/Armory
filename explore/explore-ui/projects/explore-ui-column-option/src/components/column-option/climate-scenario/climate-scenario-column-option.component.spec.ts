import {ColumnOptionTestBed} from '../../../test-utils';
import {ClimateScenarioColumnOptionComponent} from './climate-scenario-column-option.component';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';
import {ClimateScenariosColumnOption} from '../../../models/column-option/climate-scenarios-column-option.model';
import { CommonUtils } from '@blk/explore-ui-core';


describe('ClimateScenarioColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<ClimateScenarioColumnOptionComponent, ClimateScenariosColumnOption>;

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
        testBed = new ColumnOptionTestBed<ClimateScenarioColumnOptionComponent, ClimateScenariosColumnOption>(
            ClimateScenarioColumnOptionComponent, new ClimateScenariosColumnOption(), mockedOption,
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

    it('should launch Aladdin Climate app', () => {
        jest.spyOn(CommonUtils, 'getModeSensitiveApplicationUrl').mockReturnValueOnce('localhost/apps/aladdin-climate/#');
        const windowOpenSpy = jest.spyOn(window, 'open');
        windowOpenSpy.mockImplementation(jest.fn());

        testBed.component.launchClimatePhysicalRiskScenarios();

        expect(windowOpenSpy).toHaveBeenCalledTimes(1);
        expect(windowOpenSpy).toHaveBeenCalledWith('localhost/apps/aladdin-climate/#/home/physical-risk-scenarios');
    });
});
