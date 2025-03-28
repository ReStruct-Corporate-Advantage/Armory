import {Component, Output, EventEmitter, Input} from '@angular/core';
import {AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ColumnConstants, CoreColumnUtils} from '@blk/explore-ui-core';
import {CustomTitleColumnOption} from '../../../models/column-option/custom-title-column-option.model';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';
import {isNil, isEmpty} from 'lodash';

@Component({
    selector: 'explore-custom-title-column-option',
    templateUrl: './custom-title-column-option.component.html',
    styleUrls: ['./custom-title-column-option.component.scss']
})
export class CustomTitleColumnOptionComponent extends BaseColumnTitleModifiableColumnOptionComponent<CustomTitleColumnOption> {

    public static OPTION_KEY = 'customColumnTitle';

    placeholder: string;
    value: string;
    label: string;
    // To change the label. example - Constraint title or Column title
    @Input() colType: string;
    @Output() titleUpdated = new EventEmitter<void>();

    /**
     * Performs the required initialization.
     */
    initializeComponent(): void {
        super.initializeComponent();
        this.setColumnTitleLabel();

        // set the placeholder to the original title of selected column
        // set the value to the modified title
        if (this.column.positionColumnType === ColumnConstants.FACTOR_MODEL) {
            this.placeholder = this.column.columnTitle;
            if (!isEmpty(this.optionValue.customTitle)) {
                this.value = this.optionValue.customTitle;
            }
        } else {
            this.placeholder = CoreColumnUtils.getOriginalColumnTitle(this.column.columnTag, this.column.positionColumnType);
            if (this.column.columnTitle !== this.placeholder && this.optionValue.customTitle) {
                this.value = this.optionValue.customTitle;
            }
        }
    }

    private setColumnTitleLabel(): void {
        if (this.column.positionColumnType === ColumnConstants.FACTOR_MODEL) {
            this.label = ColumnConstants.FACTOR_NAME;
        } else {
            const columnName = !isNil(this.colType) ? this.colType : 'Column';
            this.label = columnName.concat(' title');
        }
    }

    /**
     * Column title value change handler
     */
    onColumnTitleValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.optionValue.customTitle = event.detail.value;
        this.value = event.detail.value;
        this.titleUpdated.emit();

        // customTitle should not override columnTitle in column
        if (this.columnOptionUpdated$) {
            this.columnOptionUpdated$.next({column: this.column, isSaveUpdate: false});
        }
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return CustomTitleColumnOption.CONFIG_TYPE;
    }
}
