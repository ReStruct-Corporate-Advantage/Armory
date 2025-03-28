import { ClimateScenarioOptionType } from '../../../core/enums';
import {ClimateScenarioAvailableOptions} from './climate-scenario-available-options.model';

const mockClimateAssumptions = {
    args: {},
    output: {
        scenarioAssumptionsMap: {
            transitionClimateOptions: [
                {
                    options: [
                        {
                            childOptions: [
                                {
                                    childOptions: [
                                        {
                                            childOptions: [],
                                            value: 'Today',
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
                                            value: 'Today',
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
                                            value: 'Today',
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
            transitionAssumptions: {
                NGFS: {
                    '2 Degree Disorderly': ['2020'],
                    '2 Degree': ['2020']
                },
                Regulatory: {
                    NYC: ['2020']
                }
            },
            decodeMap: {
                'RCP 4.5': 'Expected Emissions (RCP 4.5)',
                '4 Degree - Targets': 'Targets Applied',
                '2 Degree': 'Orderly - Net Zero 2050',
                '2 Degree Disorderly': 'Disorderly - Delayed Transition',
                'RCP 8.5': 'High Emissions (RCP 8.5)',
                '4 Degree': 'Targets Not Applied',
                mean: 'Average Risk',
                NYC: 'New York City Local Law 97',
                '2020': 'Today',
                'ta-targets-both': 'Show Both',
                '0.83': 'Tail End Risk'
            },
            combinedClimateOptions: [
                {
                    options: [
                        {
                            childOptions: [
                                {
                                    childOptions: [
                                        {
                                            childOptions: [],
                                            value: 'Today',
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
                                            value: 'Today',
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
                                            value: 'Today',
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
            combinedAssumptions: {
                NGFS: {
                    '2 Degree Disorderly': ['2020'],
                    '2 Degree': ['2020']
                },
                Regulatory: {
                    NYC: ['2020']
                }
            },
            tempAlignmentOptions: {
                '4 Degree - Targets': {
                    mean: ['2030', '2040', '2050']
                },
                '4 Degree': {
                    mean: ['2030', '2040', '2050']
                }
            },
            physicalClimateOptions: [
                {
                    options: [
                        {
                            childOptions: [
                                {
                                    childOptions: [
                                        {
                                            childOptions: [],
                                            value: 'Today',
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
                                            value: 'Today',
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
                                            value: 'Today',
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
                                            value: 'Today',
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
                                            value: 'Today',
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
                                            value: 'Today',
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
            assumptions: {
                'RCP 4.5': {
                    mean: ['2020', '2050']
                },
                'RCP 8.5': {
                    mean: ['2020', '2050'],
                    '0.83': ['2020', '2050']
                }
            },
            optionsSortOrder: {
                Transition: {
                    type: ['NGFS', 'Regulatory'],
                    percentile: ['2 Degree', '2 Degree Disorderly']
                },
                TempAlignment: {
                    type: ['4 Degree - Targets', '4 Degree'],
                    percentile: ['mean']
                },
                Physical: {
                    type: ['RCP 4.5', 'RCP 8.5'],
                    percentile: ['mean', '0.83']
                },
                _timeframeOverrides: {
                    TA_REV_INTENS: ['2025', '2026', '2027', '2028', '2029', '2030', '2035', '2040', '2045', '2050'],
                    TA_5_YEAR: ['2025', '2030', '2035', '2040', '2045', '2050']
                }
            }
        },
        requestDuration: 733,
        requestID: 'bfb6848c-a4d7-44ff-82de-7cd0a6470f91',
        isSuccess: true
    },
    transactionContext: {
        detailedID: '3dd47a85-07f3-4dc4-a236-0ee7ef6c6fcb:ACS.null',
        IDWithContextChain: '3dd47a85-07f3-4dc4-a236-0ee7ef6c6fcb:ACS',
        chain: ['ACS'],
        CLASS_TYPE: 'com.bfm.util.TransactionContext',
        transactionId: '3dd47a85-07f3-4dc4-a236-0ee7ef6c6fcb'
    },
    return_val: 'SUCCESS',
    command: 'CLIMATE_METADATA',
    transactionId: '3dd47a85-07f3-4dc4-a236-0ee7ef6c6fcb',
    successCode: null
};

describe('ClimateScenarioAvailableOptions', () => {

    const getValidClimateScenarioAvailableOptions = () => {
        return new ClimateScenarioAvailableOptions(mockClimateAssumptions.output.scenarioAssumptionsMap);
    };

    it('should return physicalClimateOptions', () => {
        const physicalClimateOptions = getValidClimateScenarioAvailableOptions().physicalClimateOptions;
        expect(physicalClimateOptions).toBeTruthy();
    });

    it('should return transitionClimateOptions', () => {
        const transitionClimateOptions = getValidClimateScenarioAvailableOptions().transitionClimateOptions;
        expect(transitionClimateOptions).toBeTruthy();
    });

    it('should return combinedClimateOptions', () => {
        const combinedClimateOptions = getValidClimateScenarioAvailableOptions().combinedClimateOptions;
        expect(combinedClimateOptions).toBeTruthy();
    });

    it('should select correct climate scenario options', () => {
        const climateScenario = {
            scenarioType: 'RCP 4.5', scenarioPercentile: 'mean', scenarioYear: 'Today'
        };
        let physicalClimateOptions = getValidClimateScenarioAvailableOptions().physicalClimateOptions(climateScenario);
        expect(physicalClimateOptions).toBeTruthy();
        expect(physicalClimateOptions[0].values.some(option => option.isSelected === true)).toBe(false);
        expect(physicalClimateOptions[1].values.some(option => option.isSelected === true)).toBe(true);
        let selectedType = physicalClimateOptions[1].values.find(option => option.value === climateScenario.scenarioType);
        expect(selectedType).toBeTruthy();
        let selectedPercentile = selectedType.childOptions.find(option => option.value === climateScenario.scenarioPercentile);
        expect(selectedPercentile).toBeTruthy();
        let selectedYear = selectedPercentile.childOptions.find(option => option.value === climateScenario.scenarioYear);
        expect(selectedYear).toBeTruthy();
        expect(selectedYear.value).toEqual(climateScenario.scenarioYear);

        // change scenario to a value not present in the climate scenario metadata, should default selection to 0th index value
        climateScenario.scenarioPercentile = 'invalid';
        climateScenario.scenarioYear = '2020';
        physicalClimateOptions = getValidClimateScenarioAvailableOptions().physicalClimateOptions(climateScenario);
        expect(physicalClimateOptions).toBeTruthy();
        expect(physicalClimateOptions[0].values.some(option => option.isSelected === true)).toBe(false);
        expect(physicalClimateOptions[1].values.some(option => option.isSelected === true)).toBe(true);
        selectedType = physicalClimateOptions[1].values.find(option => option.value === climateScenario.scenarioType);
        expect(selectedType).toBeTruthy();

        selectedPercentile = selectedType.childOptions.find(option => option.value === climateScenario.scenarioPercentile);
        // expect(selectedPercentile).toBeFalsy();
        // selectedPercentile = selectedType.childOptions.find(option => option.isSelected);
        expect(selectedPercentile).toBeTruthy();
        expect(selectedPercentile.value).toEqual(selectedType.childOptions[0].value);

        selectedYear = selectedPercentile.childOptions.find(option => option.value === climateScenario.scenarioYear);
        // expect(selectedYear).toBeFalsy();
        // selectedYear = selectedPercentile.childOptions.find(option => option.isSelected);
        expect(selectedYear).toBeTruthy();
        expect(selectedYear.value).toEqual(selectedPercentile.childOptions[0].value);

        expect(climateScenario.scenarioPercentile).toEqual(selectedPercentile.value);
        expect(climateScenario.scenarioYear).toEqual(selectedYear.value);
    });

    it('should check timeframe override key validity', () => {
        const climateScenarioOptions = getValidClimateScenarioAvailableOptions();
        expect(climateScenarioOptions.isTimeframeOverrideKeyValid('invalid')).toEqual(false);
        expect(climateScenarioOptions.isTimeframeOverrideKeyValid('TA_5_YEAR')).toEqual(true);
    });

    it('should get timeframe override', () => {
        const climateScenarioOptions = getValidClimateScenarioAvailableOptions();
        const empty = climateScenarioOptions.getTimeframeOverrideOptions('invalid');
        expect(empty).toEqual([]);
        const copy1 = climateScenarioOptions.getTimeframeOverrideOptions('TA_5_YEAR');
        expect(copy1).toEqual(['2025', '2030', '2035', '2040', '2045', '2050']);
    });

    it('should return a copy of timeframe override so consumers cannot modify the original', () => {
        const climateScenarioOptions = getValidClimateScenarioAvailableOptions();
        const copy1 = climateScenarioOptions.getTimeframeOverrideOptions('TA_5_YEAR');
        const copy2 = climateScenarioOptions.getTimeframeOverrideOptions('TA_5_YEAR');
        expect(copy1).toEqual(['2025', '2030', '2035', '2040', '2045', '2050']);
        expect(copy2).toEqual(['2025', '2030', '2035', '2040', '2045', '2050']);
        expect(copy1 === copy2).toEqual(false); // different instances

        copy1.splice(1, 2);
        expect(copy1 === climateScenarioOptions.getTimeframeOverrideOptions('TA_5_YEAR')).toEqual(false);
    });

    it('should get correct scenarios map', () => {
        const modelObj = getValidClimateScenarioAvailableOptions(); 
        const scenarioAssumptionsMap = mockClimateAssumptions.output.scenarioAssumptionsMap;
        expect(modelObj.getOptionsMap(ClimateScenarioOptionType.PHYSICAL)).toEqual(modelObj.objectToMap(scenarioAssumptionsMap.assumptions));
        expect(modelObj.getOptionsMap(ClimateScenarioOptionType.TRANSITION)).toEqual(modelObj.objectToMap(scenarioAssumptionsMap.transitionAssumptions));
        expect(modelObj.getOptionsMap(ClimateScenarioOptionType.TEMP_ALIGNMENT)).toEqual(modelObj.objectToMap(scenarioAssumptionsMap.tempAlignmentOptions));
        expect(modelObj.getOptionsMap(ClimateScenarioOptionType.COMBINED_CLIMATE)).toEqual(modelObj.objectToMap(scenarioAssumptionsMap.combinedAssumptions));
    });

    it('should get correct default scenario', () => {
        const modelObj = getValidClimateScenarioAvailableOptions(); 
        const scenarioAssumptionsMap = mockClimateAssumptions.output.scenarioAssumptionsMap;
        expect(modelObj.getCombinedClimateDefaultOption()).toEqual(scenarioAssumptionsMap.combinedClimateOptions[0].options[0]);
    });

});
