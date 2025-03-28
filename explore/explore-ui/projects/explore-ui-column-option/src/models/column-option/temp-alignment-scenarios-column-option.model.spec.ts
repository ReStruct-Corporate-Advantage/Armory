import {ClimateScenarioAvailableOptions, CoreDefinitionStore} from '@blk/explore-ui-core';
import {ClimateScenario} from '../climate/climate-scenario.model';
import {TempAlignmentScenariosColumnOption} from './temp-alignment-scenarios-column-option.model';

const mockClimateAssumptions = {
    transitionClimateOptions: [
        {
            options: [
                {
                    childOptions: [
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                }
                            ],
                            value: 'mean',
                            displayValue: 'Average Risk',
                            metadata: {}
                        }
                    ],
                    value: '2 Degree',
                    displayValue: 'Orderly - Net Zero',
                    metadata: {
                        source: 'NFGS'
                    }
                },
                {
                    childOptions: [
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                }
                            ],
                            value: 'mean',
                            displayValue: 'Average Risk',
                            metadata: {}
                        }
                    ],
                    value: '2 Degree Disorderly',
                    displayValue: 'Disorderly - Delayed Transition',
                    metadata: {
                        source: 'NFGS'
                    }
                }
            ],
            groupName: 'NGFS'
        },
        {
            options: [
                {
                    childOptions: [
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                }
                            ],
                            value: 'mean',
                            displayValue: 'Average Risk',
                            metadata: {}
                        }
                    ],
                    value: 'NYC',
                    displayValue: 'New York City Local Law 97',
                    metadata: {
                        source: 'NFGS'
                    }
                }
            ],
            groupName: 'Regulatory'
        }
    ],
    physicalClimateOptions: [
        {
            options: [
                {
                    childOptions: [
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                }
                            ],
                            value: 'mean',
                            displayValue: 'Average Risk',
                            metadata: {}
                        }
                    ],
                    value: '2 Degree',
                    displayValue: 'Orderly - Net Zero',
                    metadata: {
                        source: 'NFGS'
                    }
                },
                {
                    childOptions: [
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                }
                            ],
                            value: 'mean',
                            displayValue: 'Average Risk',
                            metadata: {}
                        }
                    ],
                    value: '2 Degree Disorderly',
                    displayValue: 'Disorderly - Delayed Transition',
                    metadata: {
                        source: 'NFGS'
                    }
                },
                {
                    childOptions: [
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                }
                            ],
                            value: 'mean',
                            displayValue: 'Average Risk',
                            metadata: {}
                        }
                    ],
                    value: '4 Degree',
                    displayValue: 'Hot House World - Current Policies',
                    metadata: {
                        source: 'NFGS'
                    }
                }
            ],
            groupName: 'NFGS'
        },
        {
            options: [
                {
                    childOptions: [
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                },
                                {
                                    childOptions: [],
                                    value: '2050',
                                    displayValue: '2050',
                                    metadata: {}
                                }
                            ],
                            value: 'mean',
                            displayValue: 'Average Risk',
                            metadata: {}
                        }
                    ],
                    value: 'RCP 4.5',
                    displayValue: 'Expected Emissions (RCP 4.5)',
                    metadata: {
                        source: 'IPCC'
                    }
                },
                {
                    childOptions: [
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                },
                                {
                                    childOptions: [],
                                    value: '2050',
                                    displayValue: '2050',
                                    metadata: {}
                                }
                            ],
                            value: 'mean',
                            displayValue: 'Average Risk',
                            metadata: {}
                        },
                        {
                            childOptions: [
                                {
                                    childOptions: [],
                                    value: '2020',
                                    displayValue: 'Today',
                                    metadata: {}
                                },
                                {
                                    childOptions: [],
                                    value: '2050',
                                    displayValue: '2050',
                                    metadata: {}
                                }
                            ],
                            value: '0.83',
                            displayValue: 'Tail End Risk',
                            metadata: {}
                        }
                    ],
                    value: 'RCP 8.5',
                    displayValue: 'High Emissions (RCP 8.5)',
                    metadata: {
                        source: 'IPCC'
                    }
                }
            ],
            groupName: 'IPCC'
        }
    ],
    optionsSortOrder: {
        _timeframeOverrides: {
            default: ['2030', '2040', '2050'],
            TA_STANDARD_2050_DEFAULT: ['2050', '2030', '2040'],
            TA_5_YEAR: ['2025', '2030', '2035', '2040', '2045', '2050']
        },
    }
};

const defaultClimateScenario = new ClimateScenario({
    scenarioType: 'RCP 4.5',
    scenarioTypeDisplayName: 'Expected emissions',
    scenarioPercentile: 'mean',
    scenarioPercentileDisplayName: 'Average risk',
    scenarioYear: '2020',
    scenarioYearDisplayName: 'Today'
});

describe('TempAlignmentScenariosColumnOption', () => {
    let climateScenarioColumnOption: TempAlignmentScenariosColumnOption;

    beforeAll(() => {
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions(mockClimateAssumptions);
    });

    it('should initialize a model with defaults', () => {
        climateScenarioColumnOption = new TempAlignmentScenariosColumnOption();
        climateScenarioColumnOption.initialize(null);
        expect(climateScenarioColumnOption.climateScenario).toBeDefined();
        expect(climateScenarioColumnOption.climateScenario.length).toBe(1);
        expect(climateScenarioColumnOption.climateScenario[0].scenarioYear).toBeUndefined();
        let defaultSettings = {
            columnOptionAttributes: [
                {
                    key: ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE,
                    defaultValue: {value: 'TA_5_YEAR'}
                }
            ]
        };
        climateScenarioColumnOption.initialize(defaultSettings);
        expect(climateScenarioColumnOption.climateScenario).toBeDefined();
        expect(climateScenarioColumnOption.climateScenario.length).toBe(1);
        expect(climateScenarioColumnOption.climateScenario[0].scenarioYear).toBe('2025');
        defaultSettings = {
            columnOptionAttributes: [
                {
                    key: ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE,
                    defaultValue: {value: 'TA_STANDARD_2050_DEFAULT'}
                }
            ]
        };
        climateScenarioColumnOption.initialize(defaultSettings);
        expect(climateScenarioColumnOption.climateScenario).toBeDefined();
        expect(climateScenarioColumnOption.climateScenario.length).toBe(1);
        expect(climateScenarioColumnOption.climateScenario[0].scenarioYear).toBe('2050');
    });

    it('should serialize and deserialize the model', () => {
        // properties required for a climate scenario to be saved
        const climateScenario = defaultClimateScenario;

        // climate scenario column option to serialize
        climateScenarioColumnOption = new TempAlignmentScenariosColumnOption();
        climateScenarioColumnOption.climateScenario = [climateScenario];
        climateScenarioColumnOption.targetTypes = ['WITH_TARGETS'];

        jest.spyOn(climateScenarioColumnOption, 'doSerialize');
        const serializedData = climateScenarioColumnOption.serialize();
        expect(climateScenarioColumnOption.doSerialize).toHaveBeenCalled();

        // climate scenario column option to deserialize
        const newClimateScenarioColumnOption = new TempAlignmentScenariosColumnOption();
        jest.spyOn(newClimateScenarioColumnOption, 'deserialize');
        newClimateScenarioColumnOption.deserialize(serializedData);
        expect(newClimateScenarioColumnOption.deserialize).toHaveBeenCalled();
        expect(newClimateScenarioColumnOption.equals(climateScenarioColumnOption)).toBe(true);
    });

    it('doAddRequestParams : should add serialized data to request param', () => {
        // properties required for a climate scenario to be saved
        const climateScenario = defaultClimateScenario;

        // climate scenario column option to serialize
        climateScenarioColumnOption = new TempAlignmentScenariosColumnOption();
        climateScenarioColumnOption.climateScenario = [climateScenario];

        jest.spyOn(climateScenarioColumnOption, 'doSerialize');
        let serializedData = climateScenarioColumnOption.serialize();
        expect(climateScenarioColumnOption.doSerialize).toHaveBeenCalled();

        const requestParams: any = {};
        climateScenarioColumnOption.addRequestParams(requestParams);
        expect(requestParams['scenarioOptions']).toBeUndefined();
        expect(requestParams['targetTypes']).toBeUndefined();

        climateScenarioColumnOption.targetTypes = ['WITH_TARGETS'];
        serializedData = climateScenarioColumnOption.serialize();
        climateScenarioColumnOption.addRequestParams(requestParams);

        // Set climate scenario and target types and check they get reflected in the request params
        expect(requestParams['scenarioOptions']).toBeDefined();
        expect(requestParams['targetTypes']).toBeDefined();
        requestParams['scenarioOptions'] = serializedData.climateScenario;
        requestParams['targetTypes'] = serializedData.targetTypes;
        climateScenarioColumnOption.addRequestParams(requestParams);

        const otherClimateScenario = new ClimateScenario();
        otherClimateScenario.scenarioType = requestParams['scenarioOptions'][0].scenarioType;
        otherClimateScenario.scenarioTypeDisplayName = requestParams['scenarioOptions'][0].scenarioTypeDisplayName;
        otherClimateScenario.scenarioPercentile = requestParams['scenarioOptions'][0].scenarioPercentile;
        otherClimateScenario.scenarioPercentileDisplayName = requestParams['scenarioOptions'][0].scenarioPercentileDisplayName;
        otherClimateScenario.scenarioYear = requestParams['scenarioOptions'][0].scenarioYear;
        otherClimateScenario.scenarioYearDisplayName = requestParams['scenarioOptions'][0].scenarioYearDisplayName;
        expect(otherClimateScenario).toEqual(climateScenario);
    });

    it('equals', function () {
        climateScenarioColumnOption = new TempAlignmentScenariosColumnOption();
        climateScenarioColumnOption.initialize(null);
        const otherClimateScenarioColumnOption = new TempAlignmentScenariosColumnOption();
        otherClimateScenarioColumnOption.initialize(null);

        // Equal
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(true);

        // Not equals undefined
        expect(climateScenarioColumnOption.equals(undefined)).toStrictEqual(false);

        const scenario = new ClimateScenario();

        climateScenarioColumnOption.climateScenario = [scenario];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(false);

        otherClimateScenarioColumnOption.climateScenario = [scenario];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(true);

        climateScenarioColumnOption.climateScenario = [scenario, scenario];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(false);

        otherClimateScenarioColumnOption.climateScenario = [scenario, scenario];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(true);

        climateScenarioColumnOption.targetTypes = ['WITH_TARGETS'];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(false);

        otherClimateScenarioColumnOption.targetTypes = ['WITHOUT_TARGETS'];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(false);

        otherClimateScenarioColumnOption.targetTypes = ['WITH_TARGETS'];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(true);

        climateScenarioColumnOption.targetTypes = ['WITH_TARGETS', 'WITHOUT_TARGETS'];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(false);

        otherClimateScenarioColumnOption.targetTypes = ['WITH_TARGETS', 'WITHOUT_TARGETS'];
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(true);
    });

    /**
     * checks is valid
     */
    it('isValid', function () {
        // Invalid
        climateScenarioColumnOption.climateScenario = undefined;
        climateScenarioColumnOption.targetTypes = undefined;
        expect(climateScenarioColumnOption.isValid()).toStrictEqual(false);

        climateScenarioColumnOption.climateScenario = [defaultClimateScenario];
        expect(climateScenarioColumnOption.isValid()).toStrictEqual(false);

        // Valid
        climateScenarioColumnOption.targetTypes = ['WITH_TARGETS'];
        expect(climateScenarioColumnOption.isValid()).toStrictEqual(true);

        climateScenarioColumnOption.targetTypes = undefined;
        climateScenarioColumnOption.hideTargets = true;
        expect(climateScenarioColumnOption.isValid()).toStrictEqual(true);
    });
});
