import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NumericColumnSector, SectorConstants} from '@blk/explore-ui-breakdown';
import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxRadioInterface,
    AuxSegmentedControlInterface,
    AuxSegmentedControlSelectionChangedDetailInterface,
    AuxSelectOption, AuxSelectSelectionChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface,
    Validator
} from '@blk/aladdin-angular-components';
import {findIndex, isEmpty, isNil} from 'lodash';
import {ExploreSelectOptionGroup, ExploreSelectOption, WidgetConfigType} from '@blk/explore-ui-core';

/**
 * Component to configure bucket definition for Numeric Column Sector
 */
@Component({
    selector: 'app-numeric-sector-options',
    templateUrl: './numeric-sector-options.component.html',
    styleUrls: ['./numeric-sector-options.component.scss']
})
export class NumericSectorOptionsComponent implements OnInit, OnChanges {

    @Input()
    sectorModel: NumericColumnSector;

    @Input()
    hideQuantiles: boolean;

    @Input()
    widgetType: WidgetConfigType;

    sectorModeSelected: string;
    selectedSectorModeIndex: number;
    breakpointValue: string;
    sectorModesSelectorData: AuxSegmentedControlInterface[];
    sectorModes = SectorConstants.NUMERIC_COLUMN_SECTOR_MODES;

    percentileBreakpointsSelected: boolean;
    percentileBreakpoints: string;
    quantileStepperValue = 2;
    quantileSortOptions: AuxRadioInterface[] = [];
    weightOptions: ExploreSelectOptionGroup[];
    createQuantileFromOptions: AuxRadioInterface[] = [];

    validators: Validator[] = [
        greaterOrEqualToValidatorFactory(0)
    ];

    /**
     * Initialize quantile options
     */
    ngOnInit() {
        this.initWeightOptions();
        this.initCreateQuantileFromOptions();
        this.initQuantileSortOptions();
        this.setQuantileBasedOnOption(false);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.sectorModel) {
            this.onSectorModelChange();
        }
    }

    /**
     * Method called when sector mode is changed in selector mode selector
     */
    onSectorModeChange(event: CustomEvent<AuxSegmentedControlSelectionChangedDetailInterface>) {
        this.sectorModeSelected = event.detail.data.label;
        this.selectedSectorModeIndex = event.detail.index;
        if (this.sectorModeSelected === this.sectorModes.BREAKPOINT_MODE) {
            this.setBreakpointMode();
        } else if (this.sectorModeSelected === this.sectorModes.BUCKET_MODE) {
            this.setBucketMode();
        } else {
            this.setQuantileMode();
        }
    }

    /**
     * Method called when the user selects a radio button for quantiles
     */
    onQuantileRadioChanged(event: CustomEvent<AuxRadioChangedDetailInterface>) {
        this.percentileBreakpointsSelected = event.detail.value.eventData;
        if (this.percentileBreakpointsSelected) {
            this.onBreakpointValueChange(new CustomEvent('build', {detail: {value: this.percentileBreakpoints, host: null, srcEvent: null}}), this.sectorModes.QUANTILE_MODE);
            this.sectorModel.quantileInfo.numberOfQuantiles = undefined;
        } else {
            this.sectorModel.quantileInfo.numberOfQuantiles = this.quantileStepperValue;
            this.sectorModel.quantileInfo.percentileBreakpoints = [];
        }
    }

    /**
     * Method called on breakpoint value change
     */
    onBreakpointValueChange(event: CustomEvent<AuxTextInputValueChangedDetailInterface>, mode: string) {
        const value: string = event.detail.value;
        // Split the string into an array of values.
        const valuesAsString: string[] = value ? value.split(',') : [];
        // Convert valid values to numbers
        const values: number[] = [];
        for (const breakpoint of valuesAsString) {
            if (breakpoint && breakpoint.trim().length !== 0) {
                values.push(Number(breakpoint.trim()));
            }
        }

        // Depending on the mode, set the breakpoints onto the corresponding field in the model
        if (mode === this.sectorModes.BREAKPOINT_MODE) {
            this.breakpointValue = value;
            this.sectorModel.bucketBreakpoints = values;
        } else if (mode === this.sectorModes.QUANTILE_MODE) {
            this.percentileBreakpoints = value;
            this.sectorModel.quantileInfo.percentileBreakpoints = values;
            // Reset the numberOfQuantiles
            this.sectorModel.quantileInfo.numberOfQuantiles = undefined;
            this.percentileBreakpointsSelected = true;
        }
    }

    /**
     * Method called when the numeric stepper of the quantile section is changed
     */
    onQuantileStepperChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        const numberOfQuantiles = event.detail.value;
        // Set it so the value persists
        this.quantileStepperValue = numberOfQuantiles;
        this.sectorModel.quantileInfo.numberOfQuantiles = numberOfQuantiles;
        // Reset the percentile breakpoints to an empty array
        this.sectorModel.quantileInfo.percentileBreakpoints = [];
        this.percentileBreakpointsSelected = false;
    }
    /**
     * Handler for weight selection change for Base Quantile On
     * @param event
     */
    onWeightValueChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event) || isNil(event.detail)) {
            return;
        }
        this.sectorModel.quantileInfo.quantileBasedOn = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * Quantile sort option change handler
     */
    onQuantileSortChange(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        this.sectorModel.quantileInfo.quantileSortOrder = event.detail.value.eventData;
    }

    /**
     * Handler for Create quantile from section
     * @param event
     */
    onCreateQuantileFromChange(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        this.sectorModel.quantileInfo.periodType = event.detail.value.eventData;
    }

    /**
     * Method called when sector model is changed and initializes the component values
     */
    private onSectorModelChange() {
        // NOTE:  This should only happen from the test cases.
        if (!this.sectorModel) {
            return;
        }

        // Init to breakpoint mode.
        this.sectorModeSelected = this.sectorModes.BREAKPOINT_MODE;
        this.breakpointValue = '';

        // If we have bucket breakpoints configured then it is in that mode.
        if (!isEmpty(this.sectorModel.bucketBreakpoints)) {
            // Nothing to do since it is already set above.
        } else if (this.sectorModel.bucketIntervals) {
            // If there is an interval set then use that.
            this.sectorModeSelected = this.sectorModes.BUCKET_MODE;
        } else if (this.sectorModel.quantileInfo.isValid()) {
            // If we have any quantile info setup, then use that mode
            // isValid checks if there is a valid numberOfQuantiles or percentile breakpoints
            // or if there is a valid weight
            this.sectorModeSelected = this.sectorModes.QUANTILE_MODE;
        }

        // Set the correct initial mode.
        if (this.sectorModeSelected === this.sectorModes.BREAKPOINT_MODE) {
            this.setBreakpointMode();
        } else if (this.sectorModeSelected === this.sectorModes.BUCKET_MODE) {
            this.setBucketMode();
        } else {
            this.setQuantileMode();
        }

        this.initSectorModesSelector();
    }

    /**
     * Initialize sector mode selector used to select sector mode i.e. Breakpoint or bucket
     */
    private initSectorModesSelector() {
        this.sectorModesSelectorData = [
            {
                label: this.sectorModes.BREAKPOINT_MODE,
                checked: this.sectorModeSelected === this.sectorModes.BREAKPOINT_MODE,
                disabled: false,
                icon: ''
            },
            {
                label: this.sectorModes.BUCKET_MODE,
                checked: this.sectorModeSelected === this.sectorModes.BUCKET_MODE,
                disabled: false,
                icon: ''
            }
        ];

        if (!this.hideQuantiles) {
            this.sectorModesSelectorData.push({
                label: this.sectorModes.QUANTILE_MODE,
                    checked: this.sectorModeSelected === this.sectorModes.QUANTILE_MODE,
                disabled: false,
                icon: ''
            });
        }
        this.selectedSectorModeIndex = findIndex(this.sectorModesSelectorData, option => option.checked);
    }

    /**
     * Sets the control into the breakpoint mode.
     * Also clears out the settings for the intervals & quantiles.
     */
    private setBreakpointMode(): void {
        this.sectorModeSelected = this.sectorModes.BREAKPOINT_MODE;
        this.sectorModel.bucketIntervals = undefined;
        this.breakpointValue = this.sectorModel.bucketBreakpoints ? this.sectorModel.bucketBreakpoints.join(', ') : '';
        this.resetQuantileSettings();
    }

    /**
     * Sets the control into the bucket mode.
     * Also clears out the settings for the breakpoints.
     */
    private setBucketMode(): void {
        this.sectorModeSelected = this.sectorModes.BUCKET_MODE;
        this.sectorModel.bucketBreakpoints = undefined;
        this.sectorModel.quantileInfo.reset();
        this.resetQuantileSettings();
    }

    /**
     * Sets the control into the quantile mode.
     * Also clears out the settings for the breakpoints & intervals.
     */
    private setQuantileMode(): void {
        this.sectorModeSelected = this.sectorModes.QUANTILE_MODE;
        this.sectorModel.bucketIntervals = undefined;
        this.sectorModel.bucketBreakpoints = undefined;

        this.quantileStepperValue = this.sectorModel.quantileInfo.numberOfQuantiles ? this.sectorModel.quantileInfo.numberOfQuantiles : 2;
        if (!isEmpty(this.sectorModel.quantileInfo.percentileBreakpoints)) {
            this.percentileBreakpointsSelected = true;
            this.percentileBreakpoints = this.sectorModel.quantileInfo.percentileBreakpoints.join(', ');
        } else {
            this.percentileBreakpointsSelected = false;
            this.percentileBreakpoints = '';
            this.sectorModel.quantileInfo.numberOfQuantiles = this.quantileStepperValue;
        }
        // set default QuantileBasedOn option based on widget type
        this.setQuantileBasedOnOption(false);
    }

    /**
     * Reset quantile settings
     */
    private resetQuantileSettings(): void {
        this.sectorModel.quantileInfo.reset();
        this.quantileStepperValue = 2;
        this.percentileBreakpoints = '';
        this.percentileBreakpointsSelected = false;
        this.setQuantileBasedOnOption(true);
        this.initWeightOptions();
    }

    /**
     * default base quantile on to
     * PORTFOLIO for return widget, and
     * NUMBER_OF_SECURITIES for other widgets
     */
    setQuantileBasedOnOption(reset: boolean): void {
        if (this.widgetType === WidgetConfigType.RETURNS) {
            this.sectorModel.quantileInfo.quantileBasedOn = !reset && this.sectorModel.quantileInfo.quantileBasedOn ? this.sectorModel.quantileInfo.quantileBasedOn : SectorConstants.QUANTILE_BASED_ON.PORTFOLIO;
        } else {
            this.sectorModel.quantileInfo.quantileBasedOn = SectorConstants.QUANTILE_BASED_ON.NUMBER_OF_SECURITIES;
        }
    }

    /**
     * Initializes the quantile sort options. Ascending or Descending
     */
    private initQuantileSortOptions(): void {
        this.quantileSortOptions = [
            {
                label: 'Ascending',
                eventData: SectorConstants.QUANTILE_SORT.ASCENDING,
                checked: this.sectorModel.quantileInfo.quantileSortOrder === SectorConstants.QUANTILE_SORT.ASCENDING
            },
            {
                label: 'Descending',
                eventData: SectorConstants.QUANTILE_SORT.DESCENDING,
                checked: this.sectorModel.quantileInfo.quantileSortOrder === SectorConstants.QUANTILE_SORT.DESCENDING
            }
        ];
    }

    /**
     * The method initializes weight options
     * @private
     */
    private initWeightOptions(): void {
        const weightOptions = [new ExploreSelectOption(SectorConstants.QUANTILE_BASED_ON.PORTFOLIO, SectorConstants.QUANTILE_BASED_ON.PORTFOLIO, this.sectorModel.quantileInfo.quantileBasedOn === SectorConstants.QUANTILE_BASED_ON.PORTFOLIO),
                            new ExploreSelectOption(SectorConstants.QUANTILE_BASED_ON.BENCHMARK, SectorConstants.QUANTILE_BASED_ON.BENCHMARK, this.sectorModel.quantileInfo.quantileBasedOn === SectorConstants.QUANTILE_BASED_ON.BENCHMARK)];
        this.weightOptions = [new ExploreSelectOptionGroup(weightOptions)];
    }

    /**
     * The method initializes Create Quantile From options
     * @private
     */
    private initCreateQuantileFromOptions(): void {
        this.createQuantileFromOptions = [
            {
                label: SectorConstants.PERIOD_TYPE.START_LABEL,
                eventData: SectorConstants.PERIOD_TYPE.START,
                checked: this.sectorModel.quantileInfo.periodType === SectorConstants.PERIOD_TYPE.START
            },
            {
                label: SectorConstants.PERIOD_TYPE.END_LABEL,
                eventData: SectorConstants.PERIOD_TYPE.END,
                checked: this.sectorModel.quantileInfo.periodType === SectorConstants.PERIOD_TYPE.END
            }
        ];
    }
}

/**
 * Creates a validator that validates if input is a number >= minimum
 */
const greaterOrEqualToValidatorFactory = (minimum) => ({
    validate: (value) => {
        try {
            let n;
            if (typeof value === 'string') {
                n = Number.parseFloat(value);
            } else {
                n = value;
            }

            return n >= minimum;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
});
