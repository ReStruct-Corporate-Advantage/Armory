import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ClimateScenarioAvailableOptions, CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';
import {
    ClimateFiscalYearsColumnOption
} from '../../../models/column-option/climate-fiscal-years-column-option.model';

@Component({
    selector: 'explore-climate-fiscal-years-column-option',
    templateUrl: './climate-fiscal-years-column-option.component.html',
    styleUrls: ['./climate-fiscal-years-column-option.component.scss']
})
export class ClimateFiscalYearsColumnOptionComponent extends BaseColumnOptionComponent<ClimateFiscalYearsColumnOption> {

    public static OPTION_KEY = 'caiFiscalYearsSettings';
    /** selectionMode value for single dropdown year selection */
    public static SIMPLE_SELECT = 'simple';

    fiscalYearsColumnOption: ClimateFiscalYearsColumnOption;
    @Input()
    selectionMode = 'multiple';

    @Output() optionValueUpdated = new EventEmitter<ClimateFiscalYearsColumnOption>();

    /** Climate options Object from the API response */
    scenarioAvailableOptions: ClimateScenarioAvailableOptions;
    /** Array of fiscal year options group */
    public fiscalYearOptions: ExploreSelectOptionGroup[] = [];
    /** Available year values to convert to options */
    availableYears: string[] = [];
    /** Selected year values */
    selectedYears: string[] = [];

    /**
     * Initialize the climate column option.
     * Gets data formatter and valid comparison types based on column type
     */
     protected initializeComponent(): void {
        super.initializeComponent();
        this.setTimeframeOverride();
        this.initFiscalYearOptions();
    }
    /**
     * Get the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return ClimateFiscalYearsColumnOptionComponent.OPTION_KEY;
    }

    setTimeframeOverride(): void {
        this.scenarioAvailableOptions = CoreDefinitionStore.climateScenarioAssumptions;
        let timeframeOverrideKey = this.option?.columnOptionAttributes?.find(attr => attr.key === ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE)?.defaultValue?.value;
        const timeframeOverrideKeyValid = this.scenarioAvailableOptions.isTimeframeOverrideKeyValid(timeframeOverrideKey);
        timeframeOverrideKey = timeframeOverrideKeyValid ? timeframeOverrideKey : 'FISCAL_YEAR_DEFAULT';
        this.availableYears = this.scenarioAvailableOptions.getTimeframeOverrideOptions(timeframeOverrideKey);
        const defaultYear = this.availableYears[0]; // first value as default
        this.fiscalYearsColumnOption = this.optionValue instanceof ClimateFiscalYearsColumnOption ? this.optionValue : new ClimateFiscalYearsColumnOption(this.optionValue);
        if (!this.fiscalYearsColumnOption.isValid()) {
            this.fiscalYearsColumnOption.years = [defaultYear];
        }
    }

    /**
     * Initializes the fiscal year options and selects the years from loaded options.
     */
    initFiscalYearOptions(): void {
        const selectOptionGroup = new ExploreSelectOptionGroup();
        if (!isEmpty(this.availableYears)) {
            for (const year of this.availableYears) {
                selectOptionGroup.values.push(
                    new ExploreSelectOption(
                        this.scenarioAvailableOptions.findDisplayName(year),
                        year,
                        year === this.fiscalYearsColumnOption.years.find(selectedYear => selectedYear === year)
                    )
                );
            }
        }
        this.selectedYears = selectOptionGroup.values.filter(option => option.isSelected).map(option => option.value);
        this.fiscalYearOptions = [selectOptionGroup];
    }

    /**
     * Update the fiscal years when selection is changed
     */
    updateFiscalYears(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (this.selectionMode === ClimateFiscalYearsColumnOptionComponent.SIMPLE_SELECT) {
            this.selectedYears = [(event.detail.value as ExploreSelectOption).value];
        } else {
            this.selectedYears = (event.detail.value as AuxSelectOption[]).map(option => option.value);
        }
        this.fiscalYearsColumnOption.years = this.selectedYears;
        this.optionValueUpdated.emit(this.fiscalYearsColumnOption);
    }


}
