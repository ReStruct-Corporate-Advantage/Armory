import {CommonUtils} from '../../../core/utils';
import {GenericColumnDefinition} from '../generic-column-definition.model';
import {OverrideDateConstants} from '../../../date/constants';

export class OverrideDate extends GenericColumnDefinition {

    constructor(data?: any) {
        super(data);
    }

    /**
     * Mapping override date model
     */
    static createOverrideDateMapping(overrideDate: any): OverrideDate[] {
        const overrideDateType: OverrideDate[] = [];
        for (const overrideDateParam of overrideDate.overrideDateTypes) {
            overrideDateType.push(new OverrideDate(overrideDateParam));
        }

        return overrideDateType;
    }

    /**
     * Returns the display name for the OverrideDate
     */
    getDisplayName(): string {
        if (this.value === OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CUSTOM) {
            return 'Custom date';
        } else {
            return CommonUtils.toSentenceCase(this.label);
        }
    }
}
