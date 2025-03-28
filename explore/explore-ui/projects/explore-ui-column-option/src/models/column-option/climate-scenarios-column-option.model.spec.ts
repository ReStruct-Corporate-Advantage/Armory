import {ClimateScenarioAvailableOptions, CoreDefinitionStore} from '@blk/explore-ui-core';
import {ClimateScenariosColumnOption} from './climate-scenarios-column-option.model';
import {ClimateScenario} from '../climate/climate-scenario.model';

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
};

describe('ClimateScenariosColumnOption', () => {
    let climateScenarioColumnOption: ClimateScenariosColumnOption;

    beforeAll(() => {
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions(mockClimateAssumptions);
    });

    it('should initialize a model with defaults', () => {
        climateScenarioColumnOption = new ClimateScenariosColumnOption();
        climateScenarioColumnOption.initialize(null);
        expect(climateScenarioColumnOption.climateScenario).toBeDefined();
        expect(climateScenarioColumnOption.climateScenario.length).toBe(1);
        expect(climateScenarioColumnOption.climateScenario[0].scenarioYear).toBe('2020');
        const defaultSettings = {
            columnOptionAttributes: [
                {
                    key: ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE,
                    defaultValue: {value: '5YInterval'}
                }
            ]
        };
        climateScenarioColumnOption.initialize(defaultSettings);
        expect(climateScenarioColumnOption.climateScenario).toBeDefined();
        expect(climateScenarioColumnOption.climateScenario.length).toBe(1);
        expect(climateScenarioColumnOption.climateScenario[0].scenarioYear).toBe('2020');
    });

    it('should serialize and deserialize the model', () => {
        // properties required for a climate scenario to be saved
        const climateScenario = new ClimateScenario();
        climateScenario.scenarioType = 'RCP 4.5';
        climateScenario.scenarioTypeDisplayName = 'Expected emissions';
        climateScenario.scenarioPercentile = 'mean';
        climateScenario.scenarioPercentileDisplayName = 'Average risk';
        climateScenario.scenarioYear = '2020';
        climateScenario.scenarioYearDisplayName = 'Today';

        // climate scenario column option to serialize
        climateScenarioColumnOption = new ClimateScenariosColumnOption();
        climateScenarioColumnOption.climateScenario = [climateScenario];

        jest.spyOn(climateScenarioColumnOption, 'doSerialize');
        const serializedData = climateScenarioColumnOption.serialize();
        expect(climateScenarioColumnOption.doSerialize).toHaveBeenCalled();

        // climate scenario column option to deserialize
        const newClimateScenarioColumnOption = new ClimateScenariosColumnOption();
        jest.spyOn(newClimateScenarioColumnOption, 'deserialize');
        newClimateScenarioColumnOption.deserialize(serializedData);
        expect(newClimateScenarioColumnOption.deserialize).toHaveBeenCalled();
        expect(newClimateScenarioColumnOption.equals(climateScenarioColumnOption)).toBe(true);
    });

    it('doAddRequestParams : should add serialized data to request param', () => {
        // properties required for a climate scenario to be saved
        const climateScenario = new ClimateScenario();
        climateScenario.scenarioType = 'RCP 4.5';
        climateScenario.scenarioTypeDisplayName = 'Expected emissions';
        climateScenario.scenarioPercentile = 'mean';
        climateScenario.scenarioPercentileDisplayName = 'Average risk';
        climateScenario.scenarioYear = '2020';
        climateScenario.scenarioYearDisplayName = 'Today';

        // climate scenario column option to serialize
        climateScenarioColumnOption = new ClimateScenariosColumnOption();
        climateScenarioColumnOption.climateScenario = [climateScenario];

        jest.spyOn(climateScenarioColumnOption, 'doSerialize');
        const serializedData = climateScenarioColumnOption.serialize();
        expect(climateScenarioColumnOption.doSerialize).toHaveBeenCalled();

        const requestParams: any = {};
        climateScenarioColumnOption.addRequestParams(requestParams);
        expect(requestParams['scenarioOptions']).toBeDefined();

        // Set climate scenario and check it gets reflected in the request params
        requestParams['scenarioOptions'] = serializedData.climateScenario;
        climateScenarioColumnOption.addRequestParams(requestParams);

        const otherClimateScenario = new ClimateScenario();
        otherClimateScenario.scenarioType = requestParams['scenarioOptions'][0].scenarioType;
        otherClimateScenario.scenarioTypeDisplayName = requestParams['scenarioOptions'][0].scenarioTypeDisplayName;
        otherClimateScenario.scenarioPercentile = requestParams['scenarioOptions'][0].scenarioPercentile;
        otherClimateScenario.scenarioPercentileDisplayName = requestParams['scenarioOptions'][0].scenarioPercentileDisplayName;
        otherClimateScenario.scenarioYear = requestParams['scenarioOptions'][0].scenarioYear;
        otherClimateScenario.scenarioYearDisplayName = requestParams['scenarioOptions'][0].scenarioYearDisplayName;
        expect(otherClimateScenario).toStrictEqual(climateScenario);
    });

    it('equals', function () {
        climateScenarioColumnOption = new ClimateScenariosColumnOption();
        climateScenarioColumnOption.initialize(null);
        const otherClimateScenarioColumnOption = new ClimateScenariosColumnOption();
        otherClimateScenarioColumnOption.initialize(null);

        // Equal
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(true);

        // Not equals undefined
        expect(climateScenarioColumnOption.equals(undefined)).toStrictEqual(false);

        // Not equal
        climateScenarioColumnOption.climateScenario.push(new ClimateScenario());
        expect(climateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(false);
    });

    /**
     * checks is valid
     */
    it('isValid', function () {
        // Valid
        expect(climateScenarioColumnOption.isValid()).toStrictEqual(true);

        // Invalid
        climateScenarioColumnOption.climateScenario = undefined;
        expect(climateScenarioColumnOption.isValid()).toStrictEqual(false);

        climateScenarioColumnOption.climateScenario = ClimateScenario[1];
        expect(climateScenarioColumnOption.isValid()).toStrictEqual(false);
    });
});
