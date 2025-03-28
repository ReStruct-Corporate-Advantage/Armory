import { Component, EventEmitter, Input, Output } from '@angular/core';
import {ESGFiscalYearsColumnOption} from '../../../models/column-option/esg-fiscal-years-column-option.model';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';

@Component({
  selector: 'esg-fiscal-year-column-option',
  templateUrl: './esg-fiscal-year-column-option.component.html',
  styleUrls: ['./esg-fiscal-year-column-option.component.scss']
})
export class EsgFiscalYearColumnOptionComponent extends BaseColumnOptionComponent<ESGFiscalYearsColumnOption> {
  public static OPTION_KEY = 'esgFiscalYearsSettings';
    /** selectionMode value for single dropdown year selection */
  public static SIMPLE_SELECT = 'simple';

  /** Selected year values */
  selectedYears: string[] = [];

  /** Array of fiscal year options group */
  public fiscalYearOptions: ExploreSelectOptionGroup[] = [];

  fiscalYearsColumnOption: ESGFiscalYearsColumnOption;

  @Input()
  selectionMode = 'multiple';

  @Output() 
  optionValueUpdated = new EventEmitter<ESGFiscalYearsColumnOption>();
  
  protected getOptionValueConfigType(): string {
    return EsgFiscalYearColumnOptionComponent.OPTION_KEY;
  }

  protected initializeComponent(): void {
    super.initializeComponent();
    this.fiscalYearsColumnOption = this.optionValue instanceof ESGFiscalYearsColumnOption ? this.optionValue : new ESGFiscalYearsColumnOption(this.optionValue);
    this.initFiscalYearOptions();
  }

  onSelectionChange(selectedValues: any) {
    this.fiscalYearsColumnOption.years = selectedValues;
    this.optionValueUpdated.emit(this.fiscalYearsColumnOption);
  }

  updateFiscalYears(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
    if(this.selectionMode === EsgFiscalYearColumnOptionComponent.SIMPLE_SELECT) {
      this.fiscalYearsColumnOption.years = [(event.detail.value as ExploreSelectOption).value];
    } else {
      this.selectedYears = (event.detail.value as AuxSelectOption[]).map(option => option.value);
    }
    this.fiscalYearsColumnOption.years = this.selectedYears;
    this.optionValueUpdated.emit(this.fiscalYearsColumnOption);

  }

  /**
     * Initializes the fiscal year options and selects the years from loaded options.
     */
  initFiscalYearOptions(): void {
    const selectOptionGroup = new ExploreSelectOptionGroup();
    if (!isEmpty(this.fiscalYearsColumnOption.yearOptions)) {
        for (const year of this.fiscalYearsColumnOption.yearOptions) {
            selectOptionGroup.values.push(
                new ExploreSelectOption(
                    year,
                    year,
                    year === this.fiscalYearsColumnOption.years.find(selectedYear => selectedYear === year)
                )
            );
        }
    }
    this.selectedYears = selectOptionGroup.values.filter(option => option.isSelected).map(option => option.value);
    this.fiscalYearOptions = [selectOptionGroup];
}

}
