import {Observable} from 'rxjs';

export interface ConstraintOption<T> {
    optionAttribute: ConstraintOptionAttribute<T>;
    value$: Observable<T>;
}

export interface ConstraintOptionAttribute<T> {
    title: string;
    key: string;
    values?: Array<ConstraintOptionAttributeValue<T>>;
    defaultValue?: ConstraintOptionAttributeValue<T>;
}

export interface ConstraintOptionAttributeValue<T> {
    value: T;
    label: string;
}
