/**
 * OverrideDateSettings model
 */
export class OverrideDateSettings {
    /**
     * Chosen overrideDateTypes
     */
    overrideDateTypes: string[] = [];

    /**
     * Chosen custom override date
     */
    customOverrideDate = '';

    /**
     * Constructor to create an instance of OverrideDateSettings
     */
    constructor(overrideDateTypes: string[], customOverrideDate: string) {
        this.overrideDateTypes = overrideDateTypes;
        this.customOverrideDate = customOverrideDate;
    }

    /**
     * Return false if the passed in OverrideDateSettings is not equal to this
     */
    equals(otherOverrideDateSettings: OverrideDateSettings): boolean {
        if (this.overrideDateTypes.length !== otherOverrideDateSettings.overrideDateTypes.length) {
            return false;
        }
        for (let i = 0; i < this.overrideDateTypes.length; i++) {
            if (otherOverrideDateSettings.overrideDateTypes.indexOf(this.overrideDateTypes[i]) === -1) {
                return false;
            }
        }
        return this.customOverrideDate === otherOverrideDateSettings.customOverrideDate;
    }
}
