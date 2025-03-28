import {AbstractColumnOption} from '@blk/explore-ui-core';
import {ColumnOptionUtils} from '../../utils';
import {BaseColumnOptionComponent} from './base-column-option.component';
import {Directive} from '@angular/core';

/**
 * Class for column options that can modify the column title
 */
@Directive()
export abstract class BaseColumnTitleModifiableColumnOptionComponent<T extends AbstractColumnOption> extends BaseColumnOptionComponent<T> {

    /**
     * Functions modifies the column title for some column options.
     */
    updateColumnTitle(): void {
        ColumnOptionUtils.updateColumnTitle(this.column, this.optionValue, this.widgetType);
        this.columnOptionUpdated$.next({column: this.column, isSaveUpdate: false});
    }
}
