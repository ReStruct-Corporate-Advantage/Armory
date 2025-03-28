/**
 * Model class for numeric stepper group in Explore
 */
export class ExploreNumericStepperGroup {
    stepperValue: number;
    label: string;
    showStepper: boolean;
    disabled: boolean;

    constructor(stepperValue: number, label?: string, showStepper?: boolean, disabled?: boolean) {
        this.stepperValue = stepperValue;
        this.label = label;
        this.showStepper = showStepper;
        this.disabled = disabled;
    }
}
