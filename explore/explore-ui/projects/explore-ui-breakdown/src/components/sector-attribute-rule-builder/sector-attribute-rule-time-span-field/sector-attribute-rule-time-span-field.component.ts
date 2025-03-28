import {AuxNumericStepperValueChangedDetailInterface, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component, SimpleChanges} from '@angular/core';
import {cloneDeep, get, isNil} from 'lodash';

import {BaseSectorAttributeRuleValueFieldComponent} from '../base-sector-attribute-rule-value-field';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {SectorConstants} from '../../../constants/sector.constants';

/**
 * This component is used to set comparision value of Column Sector Rule of type attribute, when column data type is time span
 */
@Component({
    selector: 'explore-sector-attribute-rule-time-span-field',
    templateUrl: './sector-attribute-rule-time-span-field.component.html',
    styleUrls: ['./sector-attribute-rule-time-span-field.component.scss']
})
export class SectorAttributeRuleTimeSpanFieldComponent extends BaseSectorAttributeRuleValueFieldComponent<string> {

    timeSpanUnits: ExploreSelectOptionGroup[];

    timeSpanUnitValue: number;

    timeSpanSelectedUnit: ExploreSelectOption;

    constructor() {
        super();
        this.initializeTimeSpanFields();
    }

    onChanges(changes: SimpleChanges): void {
        if (changes.value) {
            if (this.value) {
                this.validateAndParseTimeSpanRule(this.value);
            } else {
                this.setDefaultTimeSpan();
            }
        }
    }

    /**
     * Method to initialize time span units selection
     */
    initializeTimeSpanFields(): void {
        this.timeSpanUnits = [new ExploreSelectOptionGroup([
            cloneDeep(SectorConstants.TIME_SPAN_UNITS.D),
            cloneDeep(SectorConstants.TIME_SPAN_UNITS.M),
            cloneDeep(SectorConstants.TIME_SPAN_UNITS.Y)
        ])];
    }

    /**
     * Is called when time span value is changed
     */
    onUnitValueChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.timeSpanUnitValue = Number(event.detail.value);
        this.updateValue();
    }

    /**
     * Is called when time span unit selection is changed i.e. Day, Month or Year
     */
    onUnitChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (get(event, 'detail.value')) {
            this.timeSpanSelectedUnit = event.detail.value as ExploreSelectOption;
        } else {
            this.timeSpanSelectedUnit = null;
        }
        this.updateValue();
    }

    /**
     * Method to update column value when time span is changed.
     */
    updateValue() {
        if (!isNil(this.timeSpanUnitValue) && !isNil(this.timeSpanSelectedUnit)) {
            this.valueChange.emit(this.timeSpanUnitValue + this.timeSpanSelectedUnit.value);
        } else {
            this.valueChange.emit(null);
        }
    }

    /**
     * Validate and parse the time span rule
     * If it's invalid, set a default value i.e. 0D
     */
    private validateAndParseTimeSpanRule(value: string): boolean {
        // Grab the time span value (characters ahead of the unit)
        // Ex. '33D' would be '33' or '4Y' would be '4'
        const timeSpanValue: string = value.slice(0, value.length - 1);
        // Grab the unit (last character of the rule value)
        // Ex. '33D' would be 'D' or '4Y' would be '4'
        const timeSpanUnit: string = value.slice(-1).toUpperCase();
        // Parse the value as a number
        const valueAsNumber: number = Number(timeSpanValue);
        // Validate the value. isFinite will return true for any number (including 0). NaN will return false
        // Check that the unit is either D, M, or Y (days, months, years)
        if (isFinite(valueAsNumber) && /[DMY]/.test(timeSpanUnit)) {
            this.timeSpanUnitValue = valueAsNumber;
            this.setTimeSpanUnit(timeSpanUnit);
            this.updateValue();
            return true;
        } else {
            // If it's invalid, default to 0D
            this.setDefaultTimeSpan();
            return false;
        }
    }

    /**
     * Method to set selected time span unit using unit value i.e. D, M, Y
     */
    setTimeSpanUnit(unit: string) {
        this.timeSpanUnits[0].values.forEach(timeSpanUnit => {
            timeSpanUnit.isSelected = false;
        });
        this.timeSpanSelectedUnit = this.getTimeSpanUnit(unit);
        this.timeSpanSelectedUnit.isSelected = true;
    }


    /**
     * Get time span unit selection object using value i.e. D,M and Y
     */
    getTimeSpanUnit(timeSpanUnit: string): ExploreSelectOption {
        return this.timeSpanUnits[0].values.find(unit => {
            return unit.value === timeSpanUnit;
        });
    }

    /**
     * Set a default time span value of 0D (0 days)
     */
    private setDefaultTimeSpan(): void {
        this.timeSpanUnitValue = 0;
        this.setTimeSpanUnit('D');
        this.updateValue();
    }
}
