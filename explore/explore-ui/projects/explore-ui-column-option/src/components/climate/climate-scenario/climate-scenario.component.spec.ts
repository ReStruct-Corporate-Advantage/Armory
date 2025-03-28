import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ClimateScenarioComponent} from './climate-scenario.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ClimateScenarioAvailableOptions, ClimateScenarioOptionType, CoreDefinitionStore} from '@blk/explore-ui-core';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';

 const mockClimateAssumptionsData = {
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
            metadata: {
                hide: 'false,true,true',
                selectPrompts: 'Scenario,,Timeframe'
            },
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
            metadata: {
                hide: 'false,true,true',
                selectPrompts: 'Scenario,,Timeframe'
            },
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
            metadata: {
                hide: 'false,true,true',
                selectPrompts: 'Scenario,,Timeframe'
            },
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
            metadata: {
                hide: 'false,true,true',
                selectPrompts: 'Scenario,,Timeframe'
            },
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
            metadata: {
                hide: 'false,false,false',
                selectPrompts: 'Scenario,Percentile,Timeframe'
            },
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
            metadata: {
                hide: 'false,false,false',
                selectPrompts: 'Scenario,Percentile,Timeframe'
            },
            groupName: 'IPCC'
        }
    ],
    optionsSortOrder: {
         _timeframeOverrides: {
             TEST: ['2030', '2040', '2050', '2060', '2070', '2080', '2090']
         }
     }
}



const mockClimateScenario = new ClimateScenario({
    scenarioType: 'RCP 8.5',
    scenarioTypeDisplayName: 'High Emissions (RCP 8.5',
    scenarioPercentile: '0.83',
    scenarioPercentileDisplayName: 'Tail End Risk',
    scenarioYear: '2050',
    scenarioYearDisplayName: '2050'
});

const mockEvent = {
    detail: {
        value: {
            displayValue: 'High Emissions (RCP 8.5',
            value: 'RCP 8.5',
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
        }
    }
};

describe('ClimateScenarioComponent', () => {
    let component: ClimateScenarioComponent;
    let fixture: ComponentFixture<ClimateScenarioComponent>;
    let scenarioAvailableOptions: ClimateScenarioAvailableOptions;

    beforeAll(() => {
        scenarioAvailableOptions = new ClimateScenarioAvailableOptions(mockClimateAssumptionsData);
        CoreDefinitionStore.climateScenarioAssumptions = scenarioAvailableOptions;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ClimateScenarioComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ClimateScenarioComponent);
        component = fixture.componentInstance;
        component.climateScenario = new ClimateScenario();
    });

    it('should create component with default physical risk values', () => {
        expect(component).toBeTruthy();
        component.ngOnInit();
        expect(component.climateScenario.scenarioType).toBe('2 Degree');
        expect(component.climateScenario.scenarioPercentile).toBe('mean');
        expect(component.climateScenario.scenarioYear).toBe('2020');
    });

    it('should create component with transition risk options', () => {
        jest.spyOn(scenarioAvailableOptions, 'transitionClimateOptions');
        component.scenarioOptionType = ClimateScenarioOptionType.TRANSITION;
        component.ngOnInit();
        expect(component.isTransitionRisk).toBeTruthy();
        expect(scenarioAvailableOptions.transitionClimateOptions).toHaveBeenCalled();
    });

    it('should create component with combined risk options', () => {
        jest.spyOn(scenarioAvailableOptions, 'combinedClimateOptions');
        component.scenarioOptionType = ClimateScenarioOptionType.COMBINED_CLIMATE;
        component.ngOnInit();
        expect(!component.isTransitionRisk).toBeTruthy();
        expect(scenarioAvailableOptions.combinedClimateOptions).toHaveBeenCalled();
    });

    it('should create component with selected options', () => {
        component.climateScenario = mockClimateScenario;
        component.ngOnInit();
        expect(component.climateScenario.scenarioType).toBe('RCP 8.5');
        expect(component.climateScenario.scenarioPercentile).toBe('0.83');
        expect(component.climateScenario.scenarioYear).toBe('2050');
    });

    it('should update all dropdowns upon new selection', () => {
        jest.spyOn(component, 'updatePercentileType');
        jest.spyOn(component, 'updateTimeFrame');
        component.ngOnInit();
        component.updateScenariosType(mockEvent)
        expect(component.updatePercentileType).toHaveBeenCalled();
        expect(component.updateTimeFrame).toHaveBeenCalled();
    });

    it('should create component with default scenario timeframe - invalid timeframe override key', () => {
        component.scenarioOptionType = ClimateScenarioOptionType.PHYSICAL;
        component.timeframeOverrideKey = 'N/A';
        component.ngOnInit();
        expect(component.climateScenario.scenarioType).toBe('2 Degree');
        expect(component.climateScenario.scenarioPercentile).toBe('mean');
        expect(component.climateScenario.scenarioYear).toBe('2020'); // first value of default options
        expect(component.scenarioTimeframes[0].values.length).toBe(1);
    });

    it('should create component with default scenario timeframe - valid timeframe override key', () => {
        component.scenarioOptionType = ClimateScenarioOptionType.PHYSICAL;
        component.timeframeOverrideKey = 'TEST';
        component.ngOnInit();
        expect(component.climateScenario.scenarioType).toBe('2 Degree');
        expect(component.climateScenario.scenarioPercentile).toBe('mean');
        expect(component.climateScenario.scenarioYear).toBe('2030'); // first value of override options
        expect(component.scenarioTimeframes[0].values.length).toBe(7);
    });

    it('should create component with loaded scenario timeframe - valid timeframe override key and value', () => {
        component.climateScenario = new ClimateScenario({
            scenarioType: 'RCP 8.5',
            scenarioPercentile: 'mean',
            scenarioYear: '2050'
        });
        component.scenarioOptionType = ClimateScenarioOptionType.PHYSICAL;
        component.timeframeOverrideKey = 'TEST';
        component.ngOnInit();
        expect(component.climateScenario.scenarioType).toBe('RCP 8.5');
        expect(component.climateScenario.scenarioPercentile).toBe('mean');
        expect(component.climateScenario.scenarioYear).toBe('2050'); // loaded value
        expect(component.scenarioTimeframes[0].values.length).toBe(7);
    });

    it('should create component with loaded scenario timeframe - valid timeframe override key and invalid value', () => {
        component.climateScenario = new ClimateScenario({
            scenarioType: 'RCP 8.5',
            scenarioPercentile: 'mean',
            scenarioYear: '2100'
        });
        component.scenarioOptionType = ClimateScenarioOptionType.PHYSICAL;
        component.timeframeOverrideKey = 'TEST';
        component.ngOnInit();
        expect(component.climateScenario.scenarioType).toBe('RCP 8.5');
        expect(component.climateScenario.scenarioPercentile).toBe('mean');
        expect(component.climateScenario.scenarioYear).toBe('2030'); // first value of override options
        expect(component.scenarioTimeframes[0].values.length).toBe(7);
    });

    it('should change scenario type with timeframe override key and maintain the override options', () => {
        component.climateScenario = new ClimateScenario({
            scenarioType: 'RCP 4.5',
            scenarioPercentile: 'mean',
            scenarioYear: '2050'
        });
        component.scenarioOptionType = ClimateScenarioOptionType.PHYSICAL;
        component.timeframeOverrideKey = 'TEST';
        component.ngOnInit();
        expect(component.climateScenario.scenarioType).toBe('RCP 4.5');
        expect(component.climateScenario.scenarioPercentile).toBe('mean');
        expect(component.climateScenario.scenarioYear).toBe('2050');
        expect(component.scenarioTimeframes[0].values.length).toBe(7);

        component.updateScenariosType(mockEvent);
        expect(component.climateScenario.scenarioType).toBe(mockEvent.detail.value.value);
        expect(component.climateScenario.scenarioPercentile).toBe(mockEvent.detail.value.childOptions[0].value);
        expect(component.climateScenario.scenarioYear).toBe('2030'); // changes to first option in overrides
        expect(component.scenarioTimeframes[0].values.length).toBe(7);
    });
});
