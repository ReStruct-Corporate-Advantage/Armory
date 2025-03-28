import {Component, ViewChild} from '@angular/core';

import {FormatConstants, OverrideDateConstants} from '@blk/explore-ui-core';
import {NumericColumnFormat} from '@blk/explore-ui-core';
import {
    AuxCheckboxChangedDetailInterface,
    AuxNumericStepper,
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxRadioInterface
} from '@blk/aladdin-angular-components';
import {isNil} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {NumericColumnFormatColumnOption} from '../../../models/column-option/numeric-column-format-column-option.model';
import {UiColumnOptionService} from '../../../services/ui-column-option.service';
import {LibColumnUtils} from '../../../utils';
import {BaseColumnOptionComponent} from '../base-column-option.component';

@Component({
    selector: 'explore-numeric-column-format-column-option',
    templateUrl: './numeric-column-format-column-option.component.html',
    styleUrls: ['./numeric-column-format-column-option.component.scss']
})
export class NumericColumnFormatColumnOptionComponent extends BaseColumnOptionComponent<NumericColumnFormatColumnOption> {

    public static OPTION_KEY = NumericColumnFormatColumnOption.CONFIG_TYPE;
    static  readonly  SCALING_OPTIONS_FOR_PERCENTAGE_COMPARE_TO_CURRENT = new Map<string, number>([
        ['Percent (%)', 0.01],
        ['Basis Point (bp)', 0.0001]
    ]);

    @ViewChild('decimalPlacesNumericStepper', {static: false}) decimalPlacesNumericStepper: AuxNumericStepper;

    decimalPlaces: number;
    // max decimal place value till we can format the quantity
    maxDecimalPlaces: number;
    useThousandsSeparator: boolean;
    scalingFactor: number;
    allScalingOptions: Map<string, number>;
    stackedScalingOptionData: AuxRadioInterface[] = [];
    numericColFormat: NumericColumnFormat;

    constructor(private uiColumnOptionService: UiColumnOptionService) {
        super();
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        // Initialize fields
        this.maxDecimalPlaces = FormatConstants.DECIMAL_PLACES_LIMIT;
        this.initializeOptionsFromColumnDef();
        this.initializeOptionsFromOptionValue();
        this.initializeOptionValue();
        this.getUpdatedScalingOptions();
        this.getStackedScalingData();
    }

    /**
     * Initialize all numeric column options for given a column through column definition
     */
    initializeOptionsFromColumnDef() {
        const columnDef = LibColumnUtils.getColumnDefinition(this.column);
        this.numericColFormat = (columnDef && columnDef.columnFormat) ? (columnDef.columnFormat as NumericColumnFormat) : undefined;

        if (!this.numericColFormat) {
            console.error('No column Format is found of this column');
            return;
        }

        this.decimalPlaces = this.numericColFormat.decimalPlaces;
        this.scalingFactor = this.numericColFormat.scalingFactor;
        this.useThousandsSeparator = this.numericColFormat.isUseThousandsSeparator;
        this.allScalingOptions = this.numericColFormat.scalingOptions;
    }

    /**
     * Update column Options if optionValue contains value otherwise don't update them
     */
    initializeOptionsFromOptionValue() {
        if (isNil(this.optionValue)) {
            return;
        }
        this.decimalPlaces = isNil(this.optionValue.decimalPlaces) ? this.decimalPlaces : this.optionValue.decimalPlaces;
        this.scalingFactor = isNil(this.optionValue.scaling) ? this.scalingFactor : this.optionValue.scaling;
        this.useThousandsSeparator = isNil(this.optionValue.useThousandsSeparator) ? this.useThousandsSeparator : this.optionValue.useThousandsSeparator;
    }

    /**
     * Initialize option value.
     */
    initializeOptionValue() {
        this.optionValue.decimalPlaces = this.decimalPlaces;
        this.optionValue.scaling = this.scalingFactor;
        this.optionValue.useThousandsSeparator = this.useThousandsSeparator;
    }

    /**
     * update scaling options, when overrideOption value gets changed
     */
    getUpdatedScalingOptions() {
        this.uiColumnOptionService.getOverrideDateSelection$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((value: string) => {
                if (value === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT || value === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION) {
                    this.allScalingOptions = NumericColumnFormatColumnOptionComponent.SCALING_OPTIONS_FOR_PERCENTAGE_COMPARE_TO_CURRENT;
                    this.optionValue.scaling = 0.01;
                } else {
                    // if other option is selected than get the scaling value and scaling option from columnDef
                    this.optionValue.scaling = this.numericColFormat.scalingFactor;
                    this.allScalingOptions = this.numericColFormat.scalingOptions;
                }
                this.scalingFactor = this.optionValue.scaling;
                this.stackedScalingOptionData = [];
                this.getStackedScalingData();
            }, error => {
                console.error(error);
            });
    }

    /**
     * Format the data which we feed to aux-radio-button component
     */
    getStackedScalingData() {
        const defaultScalingOptionsOrder = FormatConstants.FORMAT_AND_SCALE_COLUMN_OPTION.SCALING_OPTIONS_ORDER;
        for (const scale of defaultScalingOptionsOrder) {
            const scaleOption = this.allScalingOptions.get(scale);
            if (scaleOption) {
                this.stackedScalingOptionData.push({
                    label: scale,
                    checked: this.scalingFactor === scaleOption,
                    disabled: false
                });
            }
        }
    }

    /**
     * Decimal Place value change handler
     * @param event - event from the web component
     */
    onValueChangedHandler(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        // validating new value entered and if not valid reverting back to previous value
        if (!(event.detail.value?.toString()).match('^([0-' + this.maxDecimalPlaces + '])$')) {
            this.decimalPlaces = this.optionValue.decimalPlaces;
            this.decimalPlacesNumericStepper.setValue(Number(this.optionValue.decimalPlaces).toString());
            return;
        }
        // value what event throws is in String so typecasting into a number
        this.optionValue.decimalPlaces = event.detail.value;
    }

    /**
     * function to toggle the value of Thousand Separator boolean
     * @param event - event from the web component
     */
    onCheckboxChange(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.optionValue.useThousandsSeparator = event.detail.value.checked;
    }

    /**
     * Trigger when radio button selection changes
     * @param event - event from the web component
     */
    onScalingOptionChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        // Get the Label of scaling option which user has selected
        const label = event.detail.value.label;
        this.optionValue.scaling = this.allScalingOptions.get(label);
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return NumericColumnFormatColumnOption.CONFIG_TYPE;
    }
}
