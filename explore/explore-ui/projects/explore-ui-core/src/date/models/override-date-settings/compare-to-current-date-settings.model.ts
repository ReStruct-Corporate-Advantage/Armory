/**
 * Compare to current date settings model
 */
export class CompareToCurrentDateSettings {
    /**
     * Chosen compare to current type value
     */
    compareToCurrentValue = '';

    /**
     * Constructor to create an instance of CompareToCurrentDateSettings
     */
    constructor(compareToCurrentValue: string) {
        this.compareToCurrentValue = compareToCurrentValue;
    }

    /**
     * Return false if the passed in CompareToCurrentDateSettings is not equal to this
     */
    equals(otherCompareToCurrentDateSettings: CompareToCurrentDateSettings): boolean {
        return this.compareToCurrentValue === otherCompareToCurrentDateSettings.compareToCurrentValue;
    }
}
