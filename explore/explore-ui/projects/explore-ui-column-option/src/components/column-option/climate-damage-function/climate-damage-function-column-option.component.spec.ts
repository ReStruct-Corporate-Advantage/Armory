import {
    ClimateDamageFunction,
    CoreDefinitionStore,
    ExploreSelectOption
} from '@blk/explore-ui-core';
import {ClimateDamageFunctionsColumnOption} from '../../../models/column-option/climate-damage-functions-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {ClimateDamageFunctionColumnOptionComponent} from './climate-damage-function-column-option.component';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';

describe('ClimateDamageFunctionsOptionComponent', () => {
    let testBed: ColumnOptionTestBed<ClimateDamageFunctionColumnOptionComponent, ClimateDamageFunctionsColumnOption>;

    beforeEach(() => {
        const mockedOption = {
            columnOptionTitle: 'Damage function selection',
            columnOptionConfigType: 'climateDamageFunctionOptions',
            columnOptionKey: 'damageFunction',
            columnOptionAttributes: [{
                title: 'Damage Function'
            }]
        };
        // Additional column config

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ClimateDamageFunctionColumnOptionComponent, ClimateDamageFunctionsColumnOption>(
            ClimateDamageFunctionColumnOptionComponent, new ClimateDamageFunctionsColumnOption(), mockedOption,
            undefined,
            undefined,
            undefined,
            undefined);
    });

    it('should initialize the component', () => {
        const damageFunction = new ClimateDamageFunction({damageFunctionDisplayName: 'Hurricane Cost', damageFunctionField: 'pct_change_damage_hurricane_sec'});
        testBed.component.selectedCavContributors.climateDamageFunctionOptions = [
            new ClimateDamageFunction({damageFunctionDisplayName: damageFunction.damageFunctionDisplayName, damageFunctionField: damageFunction.damageFunctionField})
        ];
        CoreDefinitionStore.pCavContributors = [
            {
                assetType: 'Corporates',
                cavContributors: [
                    { field: 'pct_change_damage_energy_sec', name: 'Energy Expenditure' },
                    { field: 'pct_change_damage_hurricane_sec', name: 'Hurricane Damage' },
                    { field: 'pct_change_damage_labor_sec', name: 'Labor Costs' },
                    { field: 'pct_change_damage_revenue_sec', name: 'Revenue Damage' },
                ],
            },
            {
                assetType: 'Munis',
                cavContributors: [
                    { field: 'pct_change_macro_hurricane_sec', name: 'Macroeconomic Impact from Hurricane Damage' },
                    { field: 'pct_change_macro_temp_sec', name: 'Macroeconomic Impact from Temperature Damage' },
                ],
            }
        ] as any;
        testBed.component.ngOnInit();
        expect(testBed.component).toBeTruthy();
        expect(testBed.component.cavContributorSelectOptions.length).toBe(2);
        expect(testBed.component.cavContributorSelectOptions[0].values.length).toBe(4);
        expect(testBed.component.cavContributorSelectOptions[0].values[1].isSelected).toBe(true);
    });

    it('should change selected damage functions', () => {
        const damageFunction1 = new ExploreSelectOption('Energy Cost', 'pct_change_damage_energy', false);
        const damageFunction2 = new ExploreSelectOption('Hurricane Cost', 'pct_change_damage_hurricane', false);
        const damageFunction3 = new ExploreSelectOption('Crime Cost', 'pct_change_damage_crime', false);
        testBed.component.selectedCavContributors.climateDamageFunctionOptions = [];
        const event: CustomEvent<AuxSelectSelectionChangedDetailInterface> = {detail: {value: []}} as CustomEvent;
        testBed.component.selectCavContributor(event);
        expect(testBed.component.selectedCavContributors.climateDamageFunctionOptions.length).toBe(0);
        event.detail.value = [damageFunction1];
        testBed.component.selectCavContributor(event);
        expect(testBed.component.selectedCavContributors.climateDamageFunctionOptions.length).toBe(1);
        event.detail.value = [damageFunction1, damageFunction2];
        testBed.component.selectCavContributor(event);
        expect(testBed.component.selectedCavContributors.climateDamageFunctionOptions.length).toBe(2);
        event.detail.value = [damageFunction1, damageFunction2, damageFunction3];
        testBed.component.selectCavContributor(event);
        expect(testBed.component.selectedCavContributors.climateDamageFunctionOptions.length).toBe(3);
    });
});
