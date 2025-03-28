import { AuxSelectSelectionChangedDetailInterface, AuxCheckboxChangedDetailInterface, AuxSelectOption } from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {cloneDeep} from 'lodash';
import {CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {BookColumnOption} from '../../../models/column-option/book-column-option.model';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';

@Component({
    selector: 'explore-book-column-option',
    templateUrl: './book-column-option.component.html',
    styleUrls: ['./book-column-option.component.scss']
})
export class BookColumnOptionComponent extends BaseColumnTitleModifiableColumnOptionComponent<BookColumnOption> {
    public static OPTION_KEY = 'bookColumnOptions';

    // Collection of options that the drop down can have
    selectOptions: ExploreSelectOptionGroup[];

    // Option title that we show for Drop Down column
    displayTitle: string;

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();

        // Get the label out of the option configuration.
        this.displayTitle = this.option.columnOptionAttributes[0].title;

        this.selectOptions = [new ExploreSelectOptionGroup()];
        // Add the options to the select box.
        const accountingConventions = cloneDeep(CoreDefinitionStore.accountingConventions);
        accountingConventions.forEach((accountingConvention: string) => {
            this.selectOptions[0].values.push(new ExploreSelectOption(accountingConvention, accountingConvention, accountingConvention === this.optionValue.accountingConvention));
        });
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return BookColumnOption.CONFIG_TYPE;
    }

    /**
     * check if Book fx Conversion can be shown
     */
    showBookFxConversionOption(): boolean {
        return this.option.columnOptionAttributes.length > 1 && this.option.columnOptionAttributes[1].title === 'Enable BookFX Conversion';
    }

    /**
     * Sets the account convention selected from dropdown.
     */
    public onDropdownSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.optionValue.accountingConvention = (event.detail.value as AuxSelectOption).displayValue;
        this.updateColumnTitle();
    }

    /**
     * Enable Book FX Conversion change handler
     */
    onBookFxConversionChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.optionValue.bookFxConversion = event.detail.value.checked;
    }
}
