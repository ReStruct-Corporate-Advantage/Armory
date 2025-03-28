import {ColumnOptionTestBed} from '../../../test-utils';
import {TempAlignmentScenarioColumnOptionComponent} from './temp-alignment-scenario-column-option.component';
import {ClimateScenarioAvailableOptions, CoreDefinitionStore, ExploreSelectOption} from '@blk/explore-ui-core';
import {TempAlignmentScenariosColumnOption} from '../../../models/column-option/temp-alignment-scenarios-column-option.model';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';

describe('TempAlignmentScenarioColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<TempAlignmentScenarioColumnOptionComponent, TempAlignmentScenariosColumnOption>;

    beforeAll(() => {
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions({
            'assumptions': {
                'RCP 4.5': {
                    'mean': ['2020', '2050']
                },
                'RCP 8.5': {
                    'mean': ['2020', '2050'],
                    '0.83': ['2020', '2050']
                }
            },
            'transitionAssumptions': {
                'NGFS': {
                    'Orderly': ['2020'],
                    'Disorderly': ['2020']
                },
                'Regulatory': {
                    'NYC': ['2020']
                }
            },
            'tempAlignmentOptions': {
                '4 Degree': {
                    'mean': ['2030', '2040', '2050']
                },
                '4 Degree - Targets': {
                    'mean': ['2030', '2040', '2050']
                }
            },
            'decodeMap': {
                'RCP 4.5': 'Expected emissions',
                'RCP 8.5': 'High emissions',
                'mean': 'Average risk',
                '0.83': 'Tail end risk',
                '2020': 'Today',
                'NYC': 'New York City Local Law 97',
                '4 Degree': 'Targets Not Applied',
                '4 Degree - Targets': 'Targets Only'
            },
            'optionsSortOrder': {
                'Physical': {
                    'type': ['RCP 4.5', 'RCP 8.5'],
                    'percentile': ['mean', '0.83']
                },
                'Transition': {
                    'type': ['NGFS', 'Regulatory'],
                    'percentile': ['Orderly', 'Disorderly']
                },
                'TempAlignment': {
                    'type': ['4 Degree Targets', '4 Degree'],
                    'percentile': ['mean']
                },
                '_timeframeOverrides': {
                    'default': ['2030', '2040', '2050'],
                    'TA_STANDARD_2050_DEFAULT': ['2050', '2030', '2040'],
                    'TA_5_YEAR': ['2025', '2030', '2035', '2040', '2045', '2050'],
                }
            }
        });
    });

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
        testBed = new ColumnOptionTestBed<TempAlignmentScenarioColumnOptionComponent, TempAlignmentScenariosColumnOption>(
            TempAlignmentScenarioColumnOptionComponent, new TempAlignmentScenariosColumnOption(), mockedOption,
            undefined,
            undefined,
            undefined,
            undefined);
    });

    describe('ngOnInit Tests', () => {
        it('should initialize the component', () => {
            expect(testBed.component).toBeTruthy();
        });

        it('should initialize target type options', () => {
            testBed.component.selectedTargetTypes = [];
            testBed.component.initTargetTypeOptions();
            expect(testBed.component.targetTypeOptions.length).toBe(1);
            expect(testBed.component.targetTypeOptions[0].values.length).toBe(5);
            expect(testBed.component.targetTypeOptions[0].values[0].isSelected).toBe(true);

            testBed.component.selectedTargetTypes = ['WITH_TARGETS', 'WITHOUT_TARGETS'];
            testBed.component.initTargetTypeOptions();
            expect(testBed.component.targetTypeOptions[0].values[0].isSelected).toBe(false);
            expect(testBed.component.targetTypeOptions[0].values[1].isSelected).toBe(true);
            expect(testBed.component.targetTypeOptions[0].values[2].isSelected).toBe(true);
            expect(testBed.component.targetTypeOptions[0].values[3].isSelected).toBe(false);
            expect(testBed.component.targetTypeOptions[0].values[4].isSelected).toBe(false);
        });

        it('should initialize type options', () => {
            testBed.component.climateScenariosColumnOption.climateScenario = [];
            testBed.component.initScenarioTypeOptions();
            expect(testBed.component.scenarioTypeOptions[0].values.length).toBe(3);
            expect(testBed.component.scenarioTypeOptions[0].values[0].value).toBe('Nationally Determined Contributions');
            expect(testBed.component.scenarioTypeOptions[0].values[0].isSelected).toBe(true);
            expect(testBed.component.scenarioTypeOptions[0].values[1].value).toBe('Current Policies');
            expect(testBed.component.scenarioTypeOptions[0].values[1].isSelected).toBe(false);
            expect(testBed.component.scenarioTypeOptions[0].values[2].value).toBe('Blended Scenario');
            expect(testBed.component.scenarioTypeOptions[0].values[2].isSelected).toBe(false);

            testBed.component.climateScenariosColumnOption.climateScenario = [new ClimateScenario({
                preventSpawnChildColumn: undefined,
                scenarioPercentile: 'mean',
                scenarioPercentileDisplayName: undefined,
                scenarioType: 'Current Policies',
                scenarioTypeDisplayName: 'Hot House World - Current Policies',
                scenarioYear: 'Today',
                scenarioYearDisplayName: 'Today',
            })];
            testBed.component.initScenarioTypeOptions();
            expect(testBed.component.scenarioTypeOptions[0].values[0].isSelected).toBe(false);
            expect(testBed.component.scenarioTypeOptions[0].values[1].isSelected).toBe(true);
            expect(testBed.component.scenarioTypeOptions[0].values[2].isSelected).toBe(false);
        });

        it('should initialize timeframe options', () => {
            testBed.component.initTimeframeOptions();
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(1);
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYear).toBe('2030');
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYearDisplayName).toBe('2030');
            expect(testBed.component.scenarioTimeframeOptions[0].values.length).toBe(3);
            expect(testBed.component.scenarioTimeframeOptions[0].values[0].value).toBe('2030');
            expect(testBed.component.scenarioTimeframeOptions[0].values[0].displayValue).toBe('2030');
        });

        it('should initialize timeframe options based on option attribute', () => {
            testBed.component.option = {
                columnOptionAttributes: [{
                    key: 'timeframeOverride',
                    defaultValue: {
                        label: 'timeframeOverride',
                        value: 'TA_5_YEAR'
                    }
                }]
            } as any;
            testBed.component.optionValue.climateScenario = [];
            testBed.component.ngOnInit();
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(1);
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYear).toBe('2025');
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYearDisplayName).toBe('2025');
            expect(testBed.component.scenarioTimeframeOptions[0].values.length).toBe(6);
            expect(testBed.component.scenarioTimeframeOptions[0].values[0].value).toBe('2025');
            expect(testBed.component.scenarioTimeframeOptions[0].values[0].displayValue).toBe('2025');

            testBed.component.option.columnOptionAttributes[0].defaultValue.value = 'default';
            testBed.component.optionValue.climateScenario = [];
            testBed.component.ngOnInit();
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(1);
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYear).toBe('2030');
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYearDisplayName).toBe('2030');
            expect(testBed.component.scenarioTimeframeOptions[0].values.length).toBe(3);
            expect(testBed.component.scenarioTimeframeOptions[0].values[0].value).toBe('2030');
            expect(testBed.component.scenarioTimeframeOptions[0].values[0].displayValue).toBe('2030');
        });

        it('should update the target type when select box is changed', () => {
            testBed.component.initTargetTypeOptions();
            const typeVal = testBed.component.targetTypeOptions[0].values[1].value;
            const typeDisplayVal = testBed.component.targetTypeOptions[0].values[1].displayValue;
            const typeOption = new ExploreSelectOption(typeDisplayVal, typeVal);
            testBed.component.updateTargetsTypes({detail: {value: [typeOption]}} as CustomEvent);
            expect(testBed.component.climateScenariosColumnOption.targetTypes.length).toBe(1);
            expect(testBed.component.climateScenariosColumnOption.targetTypes[0]).toBe(typeVal);
        });

        it('should update the type when select box is changed', () => {
            testBed.component.climateScenariosColumnOption.climateScenario = [];
            testBed.component.initScenarioTypeOptions();
            const typeVal = testBed.component.scenarioTypeOptions[0].values[0].value;
            const typeDisplayVal = testBed.component.scenarioTypeOptions[0].values[0].displayValue;
            const typeOption = new ExploreSelectOption(typeDisplayVal, typeVal);
            testBed.component.updateScenarioType({detail: {value: [typeOption]}} as CustomEvent);
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(1);
            testBed.component.selectedYears = ['2030', '2040'];
            testBed.component.updateScenarioType({detail: {value: [typeOption]}} as CustomEvent);
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(2);
        });

        it('should update the year when select box is changed', () => {
            testBed.component.climateScenariosColumnOption.climateScenario = [];
            testBed.component.initTimeframeOptions();
            const timeframeVal = testBed.component.scenarioTimeframeOptions[0].values[0].value;
            const timeframeDisplayVal = testBed.component.scenarioTimeframeOptions[0].values[0].displayValue;
            const yearOption = new ExploreSelectOption(timeframeDisplayVal, timeframeVal);
            testBed.component.updateTimeframe({detail: {value: [yearOption]}} as CustomEvent);
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYear).toBe(yearOption.value);
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYearDisplayName).toBe(yearOption.displayValue);

            const timeframeVal2 = testBed.component.scenarioTimeframeOptions[0].values[1].value;
            const timeframeDisplayVal2 = testBed.component.scenarioTimeframeOptions[0].values[1].displayValue;
            const yearOption2 = new ExploreSelectOption(timeframeDisplayVal2, timeframeVal2);
            testBed.component.updateTimeframe({detail: {value: [yearOption, yearOption2]}} as CustomEvent);
            expect(testBed.component.climateScenariosColumnOption.climateScenario.length).toBe(2);
            expect(testBed.component.climateScenariosColumnOption.climateScenario[1].scenarioYear).toBe(yearOption2.value);
            expect(testBed.component.climateScenariosColumnOption.climateScenario[1].scenarioYearDisplayName).toBe(yearOption2.displayValue);
        });

        it('should update the year when select box is changed for simple selection mode', () => {
            testBed.component.initTimeframeOptions();
            testBed.component.selectionMode = 'simple';
            const yearOption = new ExploreSelectOption('2040', '2040');
            jest.spyOn(testBed.component.optionValueUpdated, 'emit');
            testBed.component.updateTimeframe({detail: {value: yearOption}} as CustomEvent);
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYear).toBe('2040');
            expect(testBed.component.climateScenariosColumnOption.climateScenario[0].scenarioYearDisplayName).toBe('2040');
            expect(testBed.component.optionValueUpdated.emit).toHaveBeenCalled();
            const expectedCallParam = new TempAlignmentScenariosColumnOption();
            expectedCallParam.climateScenario = [ new ClimateScenario({
                preventSpawnChildColumn: undefined,
                scenarioPercentile: undefined,
                scenarioPercentileDisplayName: undefined,
                scenarioType: 'Nationally Determined Contributions',
                scenarioTypeDisplayName: 'Hot House World - Nationally Determined Contributions',
                scenarioYear: '2040',
                scenarioYearDisplayName: '2040',
            })];
            expect(testBed.component.optionValueUpdated.emit).toHaveBeenCalledWith(expectedCallParam);
        });

    });
});
