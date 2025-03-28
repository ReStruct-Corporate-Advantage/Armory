import {Observable} from 'rxjs';
import {OptionValueComponent} from '../interfaces/option-value-component.interface';
import {Type} from '@angular/core';
import {ConstraintOption} from './constraint-option';
import {BaseColumnOptionComponent} from '@blk/explore-ui-column-option';
import {ColumnConfig} from '@blk/explore-ui-core';

export interface ConstraintOptionValue<T> {
    component: Type<OptionValueComponent<any, any> | BaseColumnOptionComponent<any>>;
    options: Array<ConstraintOption<T>> | any;
    isVisible$: Observable<boolean>;
    headerName?: string;
    isColumnOption: boolean;
    optionType?: string;
    columnConfig?: ColumnConfig;
}
