import {Observable, Subject} from 'rxjs';
import {ConstraintOption} from '../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../models/constraint-option-value-update';
import {Dictionary} from 'lodash';
import {ColumnConfig} from '@blk/explore-ui-core';

/**
 * T type of value
 * C type of parent config object
 */
export interface OptionValueComponent<T, C> {
    /**
     * Display name for accordion header
     */
    headerName?: string;
    /**
     * input property - option attributes
     */
    options: Array<ConstraintOption<T>>;

    /**
     *  full parent config object
     */
    parentConfig?: C;

    /**
     * output property - emits updated value
     */
    updated: Observable<ConstraintOptionValueUpdate<T>>;

    optionValues$?: Subject<Dictionary<any>>;

    /**
     * ColumnConfig for constraints which have configurable columnOptions
     * Also used for saving and loading such columnOptions
     */
    columnConfig?: ColumnConfig;
}
