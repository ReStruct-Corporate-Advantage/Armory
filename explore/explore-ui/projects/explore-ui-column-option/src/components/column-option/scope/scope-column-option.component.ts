import {Component} from '@angular/core';
import {ScopeColumnOption} from '../../../models/column-option/scope-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';


@Component({
    selector: 'explore-scope-column-option',
    templateUrl: './scope-column-option.component.html'
})
export class ScopeColumnOptionComponent extends BaseColumnOptionComponent<ScopeColumnOption> {

    public static OPTION_KEY = 'scopeColumnOptionType';

    toggleApplyBenchmarkSecuritiesChecked(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.optionValue.isApplyBenchmarkSecuritiesChecked = event.detail.value.checked;
    }

    /**
     * Get the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return ScopeColumnOptionComponent.OPTION_KEY;
    }
}
