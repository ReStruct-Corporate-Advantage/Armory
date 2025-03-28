import {Dictionary} from 'lodash';
import {ConstraintOptionAttribute} from './constraint-option';

export interface ConstraintOptionType<T> {
    type: string;
    optionAttributes: Array<ConstraintOptionAttribute<T>>;
    optionTitle?: string;
}

export interface ConstraintOptionTypesWithValues<T> {
    optionTypes: Array<ConstraintOptionType<T>>;
    optionValues: Dictionary<any>;
}
