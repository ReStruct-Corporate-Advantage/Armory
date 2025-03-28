import {CommonUtils} from '../../../core/utils';
import {GenericColumnDefinition} from '../generic-column-definition.model';

export class MultiOverrideDate extends GenericColumnDefinition {
    constructor(data?: any) {
        super(data);
    }

    /**
     * Mapping MultiOverrideDate date type into models
     */
    static createMultiOverrideDataDefinition(overrideDate: any): Array<MultiOverrideDate> {
        const multiOverrideDateType: Array<MultiOverrideDate> = [];
        for (const multiOverride of overrideDate.multiOverrideDateTypeFrequencyDefintions) {
            multiOverrideDateType.push(new MultiOverrideDate(multiOverride));
        }

        return multiOverrideDateType;
    }

    /**
     * Returns the display name for the MultiOverrideDate
     */
    getDisplayName(): string {
        return CommonUtils.toSentenceCase(this.label);
    }
}
