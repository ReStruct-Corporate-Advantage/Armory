import { Component } from '@angular/core';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {isNil} from 'lodash';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {FxFactorOptionsColumnOption} from '../../../models/column-option/fx-factor-options-column-option.model';

@Component({
    selector: 'explore-fx-cross-currency-column-option',
    templateUrl: './fx-factor-options-column-option.component.html',
    styleUrls: ['./fx-factor-options-column-option.component.scss']
})
export class FxFactorOptionsColumnOptionComponent extends BaseColumnOptionComponent<FxFactorOptionsColumnOption> {

    public static readonly OPTION_KEY = 'fxFactorOptionsColumnOption';

    fxCrossCurrencyOptions: ExploreSelectOptionGroup[];

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return FxFactorOptionsColumnOption.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        this.initializeFxCrossCurrencyOptions();
    }

    private initializeFxCrossCurrencyOptions(): void {
        let fxCrossCurrencyData: string[];

        const fxCurrColumnOptionAttribute = this.option['columnOptionAttributes'][0];
        if (fxCurrColumnOptionAttribute?.values) {
            fxCrossCurrencyData = fxCurrColumnOptionAttribute.values.map(columnOptionAttribute => columnOptionAttribute.value);
        }

        this.fxCrossCurrencyOptions = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(fxCrossCurrencyData, null, this.optionValue.fxCrossCurrency);
    }

    onFxCurrencyChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }
        this.optionValue.fxCrossCurrency = (event.detail.value as ExploreSelectOption).value;
        this.optionValue.isFxCrossCurrencyChanged = true;
    }
}
