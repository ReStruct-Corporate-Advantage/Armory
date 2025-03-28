import {ClimateScenarioAvailableOptions, CoreDefinitionStore} from '@blk/explore-ui-core';
import {ClimateScenario} from './climate-scenario.model';

const climateAssumptionsTestData = {
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

const mockClimateScenarioData = {
    scenarioType: 'RCP 8.5',
    scenarioTypeDisplayName: 'High Emissions (RCP 8.5)',
    scenarioPercentile: '0.83',
    scenarioPercentileDisplayName: 'Tail End Risk',
    scenarioYear: '2050',
    scenarioYearDisplayName: '2050'
};

const mockClimateScenarioDataExPercentile = {
    scenarioType: 'RCP 8.5',
    scenarioTypeDisplayName: 'High Emissions (RCP 8.5)',
    scenarioYear: '2050',
    scenarioYearDisplayName: '2050'
};

describe('ClimateScenario', () => {
    let climateScenario: ClimateScenario;

    beforeAll(() => {
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions(climateAssumptionsTestData);
    });

    it('should initialize a new climate scenario', () => {
        climateScenario = new ClimateScenario();
        jest.spyOn(climateScenario, 'deserialize');
        expect(climateScenario.scenarioType).toBeUndefined();
        expect(climateScenario.scenarioPercentile).toBeUndefined();
        expect(climateScenario.scenarioYear).toBeUndefined();
        expect(climateScenario.deserialize).not.toHaveBeenCalled()
    });

    it('should initialize a new climate scenario - deserialize', () => {
        climateScenario = new ClimateScenario({
            scenarioType: 'RCP 8.5',
            scenarioTypeDisplayName: 'High Emissions (RCP 8.5)',
            scenarioYear: '2050',
            scenarioYearDisplayName: '2050'
        });

        expect(climateScenario.scenarioType).toBeTruthy();
        expect(climateScenario.scenarioYear).toBeTruthy();
        expect(climateScenario.scenarioType).toEqual('RCP 8.5');
        expect(climateScenario.scenarioYear).toEqual('2050');

        climateScenario = new ClimateScenario({
            scenarioType: 'RCP 8.5',
            scenarioTypeDisplayName: 'High Emissions (RCP 8.5)',
            scenarioPercentile: '0.83',
            scenarioPercentileDisplayName: 'Tail End Risk',
            scenarioYear: '2050',
            scenarioYearDisplayName: '2050'
        });
        expect(climateScenario.scenarioType).toBeTruthy();
        expect(climateScenario.scenarioPercentile).toBeTruthy();
        expect(climateScenario.scenarioYear).toBeTruthy();
        expect(climateScenario.scenarioType).toEqual('RCP 8.5');
        expect(climateScenario.scenarioPercentile).toEqual('0.83');
        expect(climateScenario.scenarioYear).toEqual('2050');
    });

    it('should initialize a new climate scenario - serialize', () => {
        climateScenario = new ClimateScenario(mockClimateScenarioData);
        let serializedData = climateScenario.serialize();
        expect(serializedData).toEqual(mockClimateScenarioData)

        climateScenario = new ClimateScenario(mockClimateScenarioDataExPercentile);
        serializedData = climateScenario.serialize();
        expect(serializedData).toEqual({...mockClimateScenarioDataExPercentile, scenarioPercentile: 'mean'})
    });
});
