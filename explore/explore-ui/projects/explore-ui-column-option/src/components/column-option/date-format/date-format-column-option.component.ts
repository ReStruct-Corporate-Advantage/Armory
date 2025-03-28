import {Component} from '@angular/core';
import {DateColumnFormatColumnOption} from '../../../models/column-option/date-column-format-column-option.model';
import {isNil} from 'lodash';
import {ColumnOptionAttribute} from '@blk/explore-ui-core';
import {BaseColumnOptionComponent} from '../base-column-option.component';

@Component({
  selector: 'explore-date-format-column-option',
  templateUrl: './date-format-column-option.component.html',
  styleUrls: ['./date-format-column-option.component.scss']
})

/**
 * Column option component for date format column options
 */
export class DateFormatColumnOptionComponent extends BaseColumnOptionComponent<DateColumnFormatColumnOption> {

    public static readonly OPTION_KEY = 'dateColumnFormatColumnOption';

    dateFormatListAttribute: ColumnOptionAttribute;
    selectedFormat: string;

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return DateColumnFormatColumnOption.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        this.initializeDateFormat();
    }

    /**
     * Initializes the date format to 'Aladdin date format' or from optionValue
     */
    initializeDateFormat(): void {
        this.dateFormatListAttribute = this.option['columnOptionAttributes'][0];
        if (!isNil(this.optionValue) && !isNil(this.dateFormatListAttribute) && !isNil(this.dateFormatListAttribute.values) && isNil(this.optionValue.label) && isNil(this.optionValue.value )) {
            this.optionValue.label = Number(this.dateFormatListAttribute.values[0].label);
            this.optionValue.value = this.dateFormatListAttribute.values[0].value;
        }
        this.selectedFormat = this.optionValue.value;
    }

    /**
     * Finds the dateFormat for a value.
     */
    findDateFormatItem(type: string): any {
        return this.dateFormatListAttribute.values.find((option: any) => {
            return option.value === type;
        });
    }

    /**
     * Updates the optionValue to the selected value so that it could be saved and loaded back
     */
    updateOptionValue(dateFormat: string): void {
        const updatedDateFormat = this.findDateFormatItem(dateFormat);
        this.optionValue.value = updatedDateFormat.value;
        this.optionValue.label = Number(updatedDateFormat.label);
    }
}
