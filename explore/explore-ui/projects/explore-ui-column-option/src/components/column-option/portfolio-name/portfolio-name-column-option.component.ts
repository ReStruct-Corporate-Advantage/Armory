import {Component} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {PortfolioNameColumnOption} from '../../../models/column-option/portfolio-name-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';

@Component({
    selector: 'explore-portfolio-name-column-option',
    templateUrl: './portfolio-name-column-option.component.html',
    styleUrls: ['./portfolio-name-column-option.component.scss']
})

/**
 * Column option component for Additional Settings column option
 */
export class PortfolioNameColumnOptionComponent extends BaseColumnOptionComponent<PortfolioNameColumnOption> {
    static readonly OPTION_KEY = 'portfolioNameConfigOptions';

    private static readonly SHORT_NAME = 'Short name';
    private static readonly LONG_NAME = 'Long name';

    displayDataForPortGroupNames: AuxRadioInterface[];
    displayDataForPortfolioNames: AuxRadioInterface[];

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return PortfolioNameColumnOption.CONFIG_TYPE;
    }

    /**
     * Initializes the options
     */
    initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }
        this.displayDataForPortGroupNames = this.getDisplayData(this.optionValue.showShortNameForPortGroup);
        this.displayDataForPortfolioNames = this.getDisplayData(this.optionValue.showShortNameForPortfolio);
    }

    /**
     * Setting the display data for radio group
     */
    getDisplayData(checkedOption) {
        return [
            {label: PortfolioNameColumnOptionComponent.SHORT_NAME, checked: checkedOption, disabled: false},
            {label: PortfolioNameColumnOptionComponent.LONG_NAME, checked: !checkedOption, disabled: false}
        ];
    }

    /**
     * Updating the selection for radio group Port group names
     */
    updatePortGroupNames() {
        this.optionValue.showShortNameForPortGroup = this.displayDataForPortGroupNames[0].checked;
    }

    /**
     * Updating the selection for radio group Portfolio names
     */
    updatePortfolioNames() {
        this.optionValue.showShortNameForPortfolio = this.displayDataForPortfolioNames[0].checked;
    }
}
