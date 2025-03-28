import {ClimateDamageFunction, CoreDefinitionStore} from '@blk/explore-ui-core';
import {ColumnOptionTestBed} from '../../../test-utils';
import {TransitionClimateContributorColumnOptionComponent} from './transition-climate-contributor-column-option.component'
import {TransitionClimateContributorsColumnOption} from '../../../models/column-option/transition-climate-contributors-column-option.model';

describe('TransitionClimateContributorColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<TransitionClimateContributorColumnOptionComponent, TransitionClimateContributorsColumnOption>;

    beforeEach(() => {
        const mockedOption = {
            columnOptionTitle: 'Damage function selection',
            columnOptionConfigType: 'tcavContributorsOptions',
            columnOptionKey: 'damageFunction',
            columnOptionAttributes: [{
                title: 'Damage Function'
            }]
        };
        // Additional column config

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<TransitionClimateContributorColumnOptionComponent, TransitionClimateContributorsColumnOption>(
            TransitionClimateContributorColumnOptionComponent, new TransitionClimateContributorsColumnOption(), mockedOption,
            undefined,
            undefined,
            undefined,
            undefined);
    });

    it('should initialize the component', () => {
        const damageFunction = new ClimateDamageFunction({damageFunctionDisplayName: 'Commodity Market Impact on Upstream Oil', damageFunctionField: 'pct_change_upstream_oil_sec'});
        testBed.component.selectedCavContributors.climateDamageFunctionOptions = [
            new ClimateDamageFunction({damageFunctionDisplayName: damageFunction.damageFunctionDisplayName, damageFunctionField: damageFunction.damageFunctionField})
        ];
        CoreDefinitionStore.tCavContributors = [
            {
                assetType: 'Airlines & Generic Corporates',
                cavContributors: [
                    { field: 'pct_change_scope1_sec', name: 'Carbon Pricing to Scope 1 Emissions' },
                    { field: 'pct_change_scope2_sec', name: 'Carbon Pricing to Scope 2 Emissions' },
                ],
            },
            {
                assetType: 'Airline Corporates',
                cavContributors: [
                    { field: 'pct_change_others_sec', name: 'Modal Shifting to Transportation' },
                ],
            },
            {
                assetType: 'Oil & Gas Corporates',
                cavContributors: [
                    { field: 'pct_change_upstream_gas_sec', name: 'Commodity Market Impact on Upstream Gas' },
                    { field: 'pct_change_upstream_oil_sec', name: 'Commodity Market Impact on Upstream Oil' },
                    { field: 'pct_change_downstream_sec', name: 'Commodity Market Impact on Downstream Production' },
                    { field: 'pct_change_transition_sec', name: 'Clean Energy Impacts on Commodities' },
                ],
            },
            {
                assetType: 'Electric Utilities Corporates',
                cavContributors: [
                    { field: 'pct_change_power_wind_sec', name: 'Electricity Powered by Wind' },
                    { field: 'pct_change_power_solar_sec', name: 'Electricity Powered by Solar' },
                    { field: 'pct_change_power_hydro_sec', name: 'Electricity Powered by Hydro' },
                    { field: 'pct_change_power_bio_sec', name: 'Electricity Powered by Biomass' },
                    { field: 'pct_change_power_nuclear_sec', name: 'Electricity Powered by Nuclear' },
                    { field: 'pct_change_power_waste_sec', name: 'Electricity Powered by Waste' },
                    { field: 'pct_change_power_gas_sec', name: 'Electricity Powered by Gas' },
                    { field: 'pct_change_power_oil_sec', name: 'Electricity Powered by Oil' },
                    { field: 'pct_change_power_coal_sec', name: 'Electricity Powered by Coal' },
                    { field: 'pct_change_non_generation_sec', name: 'Impact on Non-Power Generation Related Activity' },
                ],
            }
        ] as any;
        testBed.component.ngOnInit();
        expect(testBed.component).toBeTruthy();
        expect(testBed.component.cavContributorSelectOptions.length).toBe(4);
        expect(testBed.component.cavContributorSelectOptions[2].values.length).toBe(4);
        expect(testBed.component.cavContributorSelectOptions[2].values[1].isSelected).toBe(true);
    });
});
