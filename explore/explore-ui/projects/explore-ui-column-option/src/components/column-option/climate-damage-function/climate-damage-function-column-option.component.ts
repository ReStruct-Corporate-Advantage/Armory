import {Component} from '@angular/core';
import {
    CavContributorGroup,
    ClimateDamageFunction,
    CoreDefinitionStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup
} from '@blk/explore-ui-core';
import {ClimateDamageFunctionsColumnOption} from '../../../models/column-option/climate-damage-functions-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {isArray} from 'lodash';

@Component({
  selector: 'explore-climate-damage-function-column-option',
  templateUrl: './climate-damage-function-column-option.component.html',
  styleUrls: ['./climate-damage-function-column-option.component.scss']
})
export class ClimateDamageFunctionColumnOptionComponent extends BaseColumnOptionComponent<ClimateDamageFunctionsColumnOption> {

    /** Option key for this column option component */
    public static OPTION_KEY = ClimateDamageFunctionsColumnOption.CONFIG_TYPE;
    /** The option value */
    selectedCavContributors: ClimateDamageFunctionsColumnOption;
    /** All supported climate adjusted value contributors */
    allSupportedCavContributors: CavContributorGroup[] = [...CoreDefinitionStore.pCavContributors];
    /** The ExploreSelectOptionGroup for the CAV contributors */
    cavContributorSelectOptions: ExploreSelectOptionGroup[];

    /**
     * Initialize the climate column option.
     * Gets data formatter and valid comparison types based on column type
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        this.selectedCavContributors = this.optionValue;
        // get all supported damage function options from definitions store
        this.allSupportedCavContributors = [...CoreDefinitionStore.pCavContributors];
        this.generateSelectOptions();
    }

    /**
     * Generates select options from supported CAV contributors retrieved from CoreDefinitionStore.
     * @protected
     */
    protected generateSelectOptions() {
        if (!this.selectedCavContributors.climateDamageFunctionOptions) {
            this.selectedCavContributors.climateDamageFunctionOptions = [];
        }
        this.cavContributorSelectOptions = [];
        this.allSupportedCavContributors.forEach(optionGroup => {
            const selectOptionGroup = new ExploreSelectOptionGroup();
            selectOptionGroup.label = optionGroup.assetType;
            this.cavContributorSelectOptions.push(selectOptionGroup);
            // set selected state of each contributor from this.selectedCavContributors.climateDamageFunctionOptions
            optionGroup.cavContributors.forEach(contributor => {
                const selected = this.selectedCavContributors.climateDamageFunctionOptions.findIndex(damageFunction =>
                    damageFunction.damageFunctionField === contributor.field) !== -1;
                selectOptionGroup.values.push(new ExploreSelectOption(contributor.name, contributor.field, selected))
            });
        })
    }

    /**
     * Get the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return ClimateDamageFunctionsColumnOption.CONFIG_TYPE;
    }

    /**
     * Toggled selection of one or all CAV contributors.
     * @param event CustomEvent<AuxSelectSelectionChangedDetailInterface>
     */
    selectCavContributor(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.selectedCavContributors.climateDamageFunctionOptions = [];
        const items = isArray(event.detail.value) ? event.detail.value : [event.detail.value];
        // convert to ClimateDamageFunction for request parameters
        items.forEach((damageFunction: ExploreSelectOption) => {
            this.selectedCavContributors.climateDamageFunctionOptions.push(
                new ClimateDamageFunction({damageFunctionDisplayName: damageFunction.displayValue, damageFunctionField: damageFunction.value}));
        });
    }
}
