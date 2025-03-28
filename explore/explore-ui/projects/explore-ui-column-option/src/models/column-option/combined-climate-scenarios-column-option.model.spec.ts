import {ClimateScenarioAvailableOptions, CoreDefinitionStore} from '@blk/explore-ui-core';
import {ClimateScenario} from '../climate/climate-scenario.model';
import {CombinedClimateScenariosColumnOption} from './combined-climate-scenarios-column-option.model';

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
    combinedClimateOptions: [
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
    ]
};

describe('CombinedClimateScenariosColumnOption', () => {

    let combinedClimateScenarioColumnOption: CombinedClimateScenariosColumnOption;

    beforeAll(() => {
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions(mockClimateAssumptions);
    });

    it('should initialize a model with default and timeframe override', () => {
        combinedClimateScenarioColumnOption = new CombinedClimateScenariosColumnOption();
        combinedClimateScenarioColumnOption.initialize(null);
        expect(combinedClimateScenarioColumnOption.climateScenario).toBeDefined();
        expect(combinedClimateScenarioColumnOption.climateScenario.length).toBe(1);
        expect(combinedClimateScenarioColumnOption.climateScenario[0].scenarioYear).toBe('2020');
        const defaultSettings = {
            columnOptionAttributes: [{
                key: ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE,
                defaultValue: {value: '5YInterval'}
            }]
        };
        combinedClimateScenarioColumnOption.initialize(defaultSettings);
        expect(combinedClimateScenarioColumnOption.climateScenario).toBeDefined();
        expect(combinedClimateScenarioColumnOption.climateScenario.length).toBe(1);
        expect(combinedClimateScenarioColumnOption.climateScenario[0].scenarioYear).toBe('2020');
    });

    it('should serialize and deserialize the model', () => {
        // properties required for a climate scenario to be saved
        const climateScenario = new ClimateScenario();
        climateScenario.scenarioType = 'Orderly';
        climateScenario.scenarioTypeDisplayName = 'Orderly';
        climateScenario.scenarioPercentile = null;
        climateScenario.scenarioPercentileDisplayName = null;
        climateScenario.scenarioYear = '2020';
        climateScenario.scenarioYearDisplayName = 'Today';

        // climate scenario column option to serialize
        combinedClimateScenarioColumnOption = new CombinedClimateScenariosColumnOption();
        combinedClimateScenarioColumnOption.climateScenario = [climateScenario];

        jest.spyOn(combinedClimateScenarioColumnOption, 'doSerialize');
        const serializedData = combinedClimateScenarioColumnOption.serialize();
        expect(combinedClimateScenarioColumnOption.doSerialize).toHaveBeenCalled();

        // climate scenario column option to deserialize
        const newClimateScenarioColumnOption = new CombinedClimateScenariosColumnOption();
        jest.spyOn(newClimateScenarioColumnOption, 'deserialize');
        newClimateScenarioColumnOption.deserialize(serializedData);
        expect(newClimateScenarioColumnOption.deserialize).toHaveBeenCalled();
        expect(newClimateScenarioColumnOption.equals(combinedClimateScenarioColumnOption)).toBe(true);
    });

    it('doAddRequestParams : should add serialized data to request param', () => {
        // properties required for a climate scenario to be saved
        const climateScenario = new ClimateScenario();
        climateScenario.scenarioType = 'Orderly';
        climateScenario.scenarioTypeDisplayName = 'Orderly';
        climateScenario.scenarioPercentile = 'mean';
        climateScenario.scenarioPercentileDisplayName = null;
        climateScenario.scenarioYear = '2020';
        climateScenario.scenarioYearDisplayName = 'Today';

        // climate scenario column option to serialize
        combinedClimateScenarioColumnOption = new CombinedClimateScenariosColumnOption();
        combinedClimateScenarioColumnOption.climateScenario = [climateScenario];

        jest.spyOn(combinedClimateScenarioColumnOption, 'doSerialize');
        const serializedData = combinedClimateScenarioColumnOption.serialize();
        expect(combinedClimateScenarioColumnOption.doSerialize).toHaveBeenCalled();

        const requestParams: any = {};
        combinedClimateScenarioColumnOption.addRequestParams(requestParams);
        expect(requestParams['scenarioOptions']).toBeDefined();

        // Set climate scenario and check it gets reflected in the request params
        requestParams['scenarioOptions'] = serializedData.climateScenario;
        combinedClimateScenarioColumnOption.addRequestParams(requestParams);

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
        combinedClimateScenarioColumnOption = new CombinedClimateScenariosColumnOption();
        combinedClimateScenarioColumnOption.initialize(null);
        const otherClimateScenarioColumnOption = new CombinedClimateScenariosColumnOption();
        otherClimateScenarioColumnOption.initialize(null);

        // Equal
        expect(combinedClimateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(true);

        // Not equals undefined
        expect(combinedClimateScenarioColumnOption.equals(undefined)).toStrictEqual(false);

        // Not equal
        combinedClimateScenarioColumnOption.climateScenario.push(new ClimateScenario());
        expect(combinedClimateScenarioColumnOption.equals(otherClimateScenarioColumnOption)).toStrictEqual(false);
    });

    /**
     * checks is valid
     */
    it('isValid', function () {
        // Valid
        expect(combinedClimateScenarioColumnOption.isValid()).toStrictEqual(true);

        // Invalid
        combinedClimateScenarioColumnOption.climateScenario = undefined;
        expect(combinedClimateScenarioColumnOption.isValid()).toStrictEqual(false);

        combinedClimateScenarioColumnOption.climateScenario =  ClimateScenario[1];
        expect(combinedClimateScenarioColumnOption.isValid()).toStrictEqual(false);
    });
});
