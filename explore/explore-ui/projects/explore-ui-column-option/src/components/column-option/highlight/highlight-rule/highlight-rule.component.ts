import {
    AuxCheckboxChangedDetailInterface,
    AuxColorPickerIconEnum,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface,
} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {isNil} from 'lodash';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {HighlightComparisonType} from '../../../../enums';
import {HighlightRuleFactory} from '../../../../factories';
import {DataFormatter} from '../../../../interfaces';
import {HighlightSettings} from '../../../../models/highlight/highlight-settings.model';
import {HighlightUtils} from '../../../../utils';

@Component({
    selector: 'explore-column-option-highlight-rule',
    templateUrl: './highlight-rule.component.html',
    styleUrls: ['./highlight-rule.component.scss']
})
export class HighlightRuleComponent implements OnInit {

    @Input()
    highlightSettings: HighlightSettings;

    /** Title of column selected */
    @Input()
    columnTitle: string;

    /** Formatter based on column datatype */
    @Input()
    dataFormatter: DataFormatter;

    /** Comparison operators based on column datatype */
    @Input()
    validOperators: HighlightComparisonType[];

    /** Emits event to parent to delete the rule */
    @Output()
    deleteHighlightRule = new EventEmitter();

    colorPickerIcons = AuxColorPickerIconEnum;

    // highlight comparison types for the select box
    comparisonTypeOptions: ExploreSelectOptionGroup[];

    colorTypeOptions: ExploreSelectOptionGroup[];

    // Flag to determine if two color pickers are needed
    isQuantileComparison = false;
    // Flag to determine if two textbox value fields are needed
    isBetweenComparison = false;

    selectedColorType: string;

    foreGroundColors: string[] = ['rgb(0,0,0)', 'rgb(0,0,0)'];

    backGroundColors: string[] = ['rgb(211,211,211)', 'rgb(211,211,211)'];

    /**
     * Initializes an existing rule
     */
    ngOnInit() {

        // set valid comparison types
        this.setComparisonTypeOptions();

        this.setColorTypeOptions();

        // loading an existing highlight rule
        if (!isNil(this.highlightSettings.comparisonType)) {
            this.isQuantileComparison = this.highlightSettings.isQuantileComparison();
            this.isBetweenComparison = this.highlightSettings.isBetweenComparison();
            this.comparisonTypeOptions[0].values.find(operator => operator.value === this.highlightSettings.comparisonType).isSelected = true;
            if (this.selectedColorType === 'cellOnly') {
                this.foreGroundColors[0] = HighlightUtils.hexToRGB(HighlightUtils.determineTextColor(this.highlightSettings.backGroundColors[0]));
                if (this.isQuantileComparison) {
                    this.foreGroundColors[1] = HighlightUtils.hexToRGB(HighlightUtils.determineTextColor(this.highlightSettings.backGroundColors[1]));
                }
                this.backGroundColors = this.highlightSettings.backGroundColors;
            } else if (this.selectedColorType === 'textOnly') {
                this.foreGroundColors = this.highlightSettings.foreGroundColors;
            } else {
                this.foreGroundColors = this.highlightSettings.foreGroundColors;
                this.backGroundColors = this.highlightSettings.backGroundColors;
            }
        }

        // convert raw comparison value to formatted value to display to user if necessary
        // top%/bottom%/std_dev/quantile/etc don't require formatting since we are using the original provided values so they are always raw value
        // i.e. if top% is 10, it means user wants to see the top 10% rows in the highlighted color
        this.highlightSettings.formatRuleValues(this.dataFormatter);
    }

    /**
     * Creates select options for each of the valid comparison operators for the highlight rule
     */
    private setComparisonTypeOptions(): void {
        const selectOptions = this.validOperators.map(validOp => new ExploreSelectOption(HighlightRuleFactory.getDisplayName(validOp), validOp));
        this.comparisonTypeOptions = [new ExploreSelectOptionGroup(selectOptions)];
    }

    private setColorTypeOptions(): void {
        const selectOptions = [new ExploreSelectOption('cell and text', 'cellAndText', !!this.highlightSettings.backGroundColors && !!this.highlightSettings.foreGroundColors),
                                new ExploreSelectOption('cell only', 'cellOnly', !this.highlightSettings.foreGroundColors),
                                new ExploreSelectOption('text only', 'textOnly', !this.highlightSettings.backGroundColors)];
        this.selectedColorType = selectOptions.find(option => !!option.isSelected).value;
        this.colorTypeOptions = [new ExploreSelectOptionGroup(selectOptions)];
    }

    /**
     * Sends event to parent to delete the rule
     */
    deleteRule(): void {
        this.deleteHighlightRule.emit();
    }

    /**
     * Enable or disable the rule
     */
    updateRuleEnabled(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.highlightSettings.isEnabled = event.detail.value.checked;
    }

    /**
     * Update the comparison type when select box is changed
     */
    updateComparisonType(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.highlightSettings.comparisonType = (event.detail.value as AuxSelectOption).value as HighlightComparisonType;
        this.isQuantileComparison = this.highlightSettings.isQuantileComparison();
        this.isBetweenComparison = this.highlightSettings.isBetweenComparison();
    }

    updateColorType(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.selectedColorType = (event.detail.value as AuxSelectOption).value;
        if (this.selectedColorType === 'cellOnly') {
            this.foreGroundColors = this.highlightSettings.foreGroundColors;
            this.highlightSettings.foreGroundColors = undefined;
            if (!this.highlightSettings.backGroundColors) {
                this.highlightSettings.backGroundColors = this.backGroundColors;
            }
        } else if (this.selectedColorType === 'textOnly') {
            this.backGroundColors = this.highlightSettings.backGroundColors;
            this.highlightSettings.backGroundColors = undefined;
            if (!this.highlightSettings.foreGroundColors) {
                this.highlightSettings.foreGroundColors = this.foreGroundColors;
            }
        } else {
            this.highlightSettings.foreGroundColors = this.foreGroundColors;
            this.highlightSettings.backGroundColors = this.backGroundColors;
        }
    }

    /**
     * Update the comparison value when user types in textbox for comparison value
     * @param index Index of textbox that is changed (0 or 1)
     * @param event Contains new value
     */
    updateCompareValue(index: number, event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.highlightSettings.comparisonValues[index] = event.detail.value;
    }

    /**
     * When user is done typing in value textbox, validate that what they typed matches the column data type and convert it to a raw value
     * @param index Index of textbox that is changed (0 or 1)
     */
    validateComparisonValue(index: number) {
        const rawValue = this.highlightSettings.getRawValue(index, this.dataFormatter);

        if (rawValue != null) {
            // valid input
            this.highlightSettings.comparisonRawValues[index] = rawValue;
        } else {
            // invalid input for comparison type, clear text input
            this.highlightSettings.comparisonRawValues[index] = null;
            this.highlightSettings.comparisonValues[index] = null;
        }
    }
}
