import {GenericColumnDefinition} from '../generic-column-definition.model';

export class CompareToCurrent extends GenericColumnDefinition {
    constructor(data?: any) {
        super(data);
    }

    /**
     * Mapping CompareToCurrent date type into models
     */
    static createCompareToCurrentOverrideDefinition(overrideDate: any): CompareToCurrent[] {
        const compareToCurrentDataType: CompareToCurrent[] = [];
        for (const compareToCurrent of overrideDate.compareToCurrentDateTypes) {
            compareToCurrentDataType.push(new GenericColumnDefinition(compareToCurrent));
        }

        return compareToCurrentDataType;
    }
}
