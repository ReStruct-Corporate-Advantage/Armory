import {Component} from '@angular/core';
import {AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {FormatConstants} from '@blk/explore-ui-core';
import {CoreWidgetConstants, CoreWidgetConfigStore, ColumnOptionAttribute} from '@blk/explore-ui-core';
import {TimeToMaturityColumnOption} from '../../../models/column-option/time-to-maturity-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';

@Component({
    selector: 'explore-time-to-maturity-column-option',
    templateUrl: './time-to-maturity-column-option.component.html',
    styleUrls: ['./time-to-maturity-column-option.component.scss']
})
export class TimeToMaturityColumnOptionComponent extends BaseColumnOptionComponent<TimeToMaturityColumnOption> {

    public static readonly OPTION_KEY = TimeToMaturityColumnOption.CONFIG_TYPE;

    scalingDropDownData: AuxSelectOptionGroup[] = [];

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        // Initialize fields
        const scalingOptionAttribute: ColumnOptionAttribute = this.option.columnOptionAttributes.find(attribute => attribute.key === 'timeUnit');
        this.scalingDropDownData = [new ExploreSelectOptionGroup(scalingOptionAttribute.values.map(data => new ExploreSelectOption(data.value, data.label, data.value === this.optionValue.timeUnit)))];
        if (this.widgetType && CoreWidgetConfigStore.getChartConfigForType(this.widgetType).chartingLib === CoreWidgetConstants.CHARTING_LIB.HIGHCHART) {
            const customOption = this.scalingDropDownData[0].values.find(option => option.displayValue === FormatConstants.CUSTOM);
            if (customOption) {
                customOption.isDisabled = true;
            }
        }
    }

    /**
     * Set scaling value
     * @param value
     */
    setScalingOptions(value: string) {
        this.optionValue.timeUnit = value;
        this.optionValue.customScalingBandsDays = (this.optionValue.timeUnit === FormatConstants.CUSTOM) ? 90 : undefined;
        this.optionValue.customScalingBandsMonths = (this.optionValue.timeUnit === FormatConstants.CUSTOM) ? 24 : undefined;
    }

    /**
     * Trigger when decimal place value gets changed
     * @param decimalNumber
     */
    onDecimalPlaceValueChange(decimalNumber: string) {
        this.optionValue.decimalPlaces = Number(decimalNumber);
    }

    /**
     * Event handler for change in custom days
     * @param customDay
     */
    onCustomDaysValueChange(customDay: string) {
        this.optionValue.customScalingBandsDays = Number(customDay);
    }

    /**
     * Event handler for change in custom months
     * @param customMonth
     */
    onCustomMonthsValueChange(customMonth: string) {
        this.optionValue.customScalingBandsMonths = Number(customMonth);
    }

    protected getOptionValueConfigType(): string {
        return TimeToMaturityColumnOption.CONFIG_TYPE;
    }
}
