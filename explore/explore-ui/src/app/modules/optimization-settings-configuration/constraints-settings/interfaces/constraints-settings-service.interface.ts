import {ConstraintOptionTypesWithValues} from '../models/constraint-option-type';
import {OptionValueComponent} from './option-value-component.interface';
import {Type} from '@angular/core';
import {Dictionary} from 'lodash';
import {Observable} from 'rxjs';
import {BaseColumnOptionComponent} from '@blk/explore-ui-column-option';

export interface ConstraintsSettingsService<C, D> {

    /**
     * create a constraint based on a definition
     */
    createConstraint$(constraintDefinition: D): Observable<C>;

    /**
     * get the component type used to edit a particular constraint option type
     */
    getConstraintOptionComponent(constraintOptionType: string): Type<OptionValueComponent<any, any> | BaseColumnOptionComponent<any>>;

    /**
     * if the constraint option needs a separate accordion or not
     * @param constraintOptionType
     */
    isUnGroupedConstraintOptionComponent(constraintOptionType: string): boolean;

    /**
     * return whether a constraint option component is visible based on the current option values
     */
    isConstraintOptionVisible(constraintOptionType: string, optionValues: Dictionary<any>): boolean;

    /**
     * get the contrain option types that are valid for a particular constraint along with their current values
     */
    getConstraintOptionTypes<T>(constraint: C): ConstraintOptionTypesWithValues<T>;

    /**
     * update the option values for a constraint
     * @returns updated option values
     */
    updateOptionValues(constraint: C, key: string, value: any): Dictionary<any>;

    /**
     * update the enabled status for a constraint
     */
    updateConstraintEnabled(constraint: C, enabled: boolean): void;

    /**
     * update a constraint field (fields are common to all types and edited through the display table
     * vs option values which are specific to a single type and are edited through the option form)
     */
    updateConstraintField(constraint: C, field: string, value: any): void;

    /**
     * get the display title for a constraint
     */
    getConstraintTitle(constraint: C): string;

    /**
     * are constraint options already loaded for the provided constraint
     */
    requiresConstraintOptionsLoad(constraint: C): boolean;

    /**
     * load constraint options for the provided constraint
     * @return success
     */
    loadConstraintOptions$(constraint: C): Observable<boolean>;
}
