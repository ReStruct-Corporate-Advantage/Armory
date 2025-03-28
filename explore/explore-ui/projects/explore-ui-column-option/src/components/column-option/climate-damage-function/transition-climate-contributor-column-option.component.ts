import {Component} from '@angular/core';
import {TransitionClimateContributorsColumnOption} from '../../../models/column-option/transition-climate-contributors-column-option.model'
import {ClimateDamageFunctionColumnOptionComponent} from './climate-damage-function-column-option.component'
import {CavContributorGroup, CoreDefinitionStore} from '@blk/explore-ui-core';

@Component({
  selector: 'explore-transition-climate-contributors-column-option',
  templateUrl: './climate-damage-function-column-option.component.html',
  styleUrls: ['./climate-damage-function-column-option.component.scss']
})
export class TransitionClimateContributorColumnOptionComponent extends ClimateDamageFunctionColumnOptionComponent {
    /** Option key for this column option component */
    public static OPTION_KEY = TransitionClimateContributorsColumnOption.CONFIG_TYPE;
    /** All supported climate adjusted value contributors */
    allSupportedCavContributors: CavContributorGroup[] = [...CoreDefinitionStore.tCavContributors];

    /**
    * Get the config type that this object is configuring.
    */
    protected getOptionValueConfigType(): string {
        return TransitionClimateContributorsColumnOption.CONFIG_TYPE;
    }

    /**
     * Initialize the climate column option.
     * Gets data formatter and valid comparison types based on column type
     * @protected
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        this.selectedCavContributors = this.optionValue;
        // get all supported tcav contributors options from definitions store
        this.allSupportedCavContributors = [...CoreDefinitionStore.tCavContributors];
        this.generateSelectOptions();
    }
}
