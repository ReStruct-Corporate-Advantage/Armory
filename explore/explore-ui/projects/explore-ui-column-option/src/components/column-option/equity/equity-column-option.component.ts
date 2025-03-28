import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectSelectionChangedDetailInterface,
    AuxSelectOption
} from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {ExploreSelectOptionGroup, ColumnOptionAttribute} from '@blk/explore-ui-core';
import {CustomCalculationMeasureNodeColumnOption} from '../../../models/column-option/custom-calculation-measure-node-column-option.model';
import {EquityColumnOption} from '../../../models/column-option/equity-column-option.model';
import {ColumnOptionUtils} from '../../../utils';
import {BaseColumnOptionComponent} from '../base-column-option.component';

@Component({
    selector: 'explore-equity-column-option',
    templateUrl: './equity-column-option.component.html',
    styleUrls: ['./equity-column-option.component.scss']
})
/**
 * Column option component for equity column option
 */
export class EquityColumnOptionComponent extends BaseColumnOptionComponent<EquityColumnOption> {

    public static OPTION_KEY = 'equity_column_options';

    // Number of periods attribute with max allowed periods based on frequency selected
    periodsAttribute: { attribute: ColumnOptionAttribute, maximumPeriod: number };

    // Frequency attribute
    frequencyAttribute: ColumnOptionAttribute;
    // display data for frequency attribute select box
    displayDataForFrequencyAttribute: ExploreSelectOptionGroup[];

    // Measure type attribute
    measureTypeAttribute: ColumnOptionAttribute;
    // Display data for measure type select box
    displayDataForMeasureTypeAttribute: ExploreSelectOptionGroup[];

    periodsAttributeLabel: string;
    frequencyAttributeLabel: string;

    /**
     * BaseColumnOptionComponent.initializeComponent()
     */
    protected initializeComponent(): void {
        this.option.columnOptionAttributes.forEach((columnOptionAttribute: ColumnOptionAttribute) => {
            switch (columnOptionAttribute.key) {
                case 'noOfYears':
                    this.periodsAttribute = {attribute: columnOptionAttribute, maximumPeriod: null};
                    this.setMaxPeriodValue();

                    if (this.isCustomCalcMeasure() && columnOptionAttribute.title === 'Last') {
                        this.periodsAttributeLabel = 'Look back';
                    } else if (this.isCustomCalcMeasure() && columnOptionAttribute.title === 'Forward') {
                        this.periodsAttributeLabel = 'Look forward';
                    } else {
                        this.periodsAttributeLabel = columnOptionAttribute.title;
                    }
                    break;
                case 'frequency':
                    this.frequencyAttribute = columnOptionAttribute;
                    this.setupDisplayDataForFrequencyAttribute();
                    this.frequencyAttributeLabel = this.isCustomCalcMeasure() && columnOptionAttribute.title === 'Frequency' ? 'Period type' : columnOptionAttribute.title;
                    break;
                case 'measureType':
                    this.measureTypeAttribute = columnOptionAttribute;
                    this.setupDisplayDataForMeasureTypeAttribute();
                    break;
            }
        });
    }

    /**
     * Check if the component is from customCalcMeasure
     */
    private isCustomCalcMeasure(): boolean {
        return !!this.column.optionValues.find(option => option instanceof CustomCalculationMeasureNodeColumnOption);
    }

    /**
     * Setup display data for frequency attribute select box
     */
    setupDisplayDataForFrequencyAttribute() {
        this.displayDataForFrequencyAttribute = [new ExploreSelectOptionGroup()];
        ColumnOptionUtils.populateFromColumnOptionAttribute(this.displayDataForFrequencyAttribute[0], this.frequencyAttribute, this.optionValue.frequency);
    }

    /**
     * Setup display data for measure type attribute select box
     */
    setupDisplayDataForMeasureTypeAttribute() {
        this.displayDataForMeasureTypeAttribute = [new ExploreSelectOptionGroup()];
        ColumnOptionUtils.populateFromColumnOptionAttribute(this.displayDataForMeasureTypeAttribute[0], this.measureTypeAttribute, this.optionValue.measureType);

    }

    /**
     * set max period based on frequency
     */
    setMaxPeriodValue(): void {
        for (let index = 0; index < this.periodsAttribute.attribute.values.length; index++) {
            const frequency = this.periodsAttribute.attribute.values[index];
            if (frequency.label === this.optionValue.frequency) {
                this.periodsAttribute.maximumPeriod = frequency.value;
                if (frequency.value < this.optionValue.noOfPeriods) {
                    this.optionValue.noOfPeriods = this.periodsAttribute.maximumPeriod;
                }
                break;
            }
        }
    }

    /**
     * Method called on number of periods change
     */
    onNumberOfPeriodsChanged($event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.optionValue.noOfPeriods = Number($event.detail.value);
    }

    /**
     * Sets the frequency attribute value selected by use from the dropdown.
     */
    setFrequencyAttribute($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.optionValue.frequency = ($event.detail.value as AuxSelectOption).value;
        this.setMaxPeriodValue();
    }

    /**
     * Sets the measure type attribute selected from the dropdown.
     */
    setMeasureTypeAttribute($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.optionValue.measureType = ($event.detail.value as AuxSelectOption).value;
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return EquityColumnOption.CONFIG_TYPE;
    }

}
