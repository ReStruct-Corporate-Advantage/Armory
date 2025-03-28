import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import {
    AuxSelectInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    ColumnConfig,
    ColumnDefinition,
} from '@blk/explore-ui-core';
import {
    ColumnOptionUtils,
    ColumnSelectorComponent,
    ColumnSelectorOption,
    SelectedColumnSelectorOption
} from '@blk/explore-ui-column-option';

/**
 * Factor Data Column Modal - FactorColumnSelectorComponent
 */
@Component({
    selector: 'explore-extended-column-option-factor-column-selector',
    templateUrl: './factor-column-selector.component.html',
    styleUrls: ['./factor-column-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FactorColumnSelectorComponent extends ColumnSelectorComponent {

    @Input()
    breakdownOptions: [];
    @Output()
    breakdownChanged = new EventEmitter<ColumnDefinition>();

    /**
     * initialize Component
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        this.isDescriptionSearch = true;
        this.selectDropdownProps = {
            onSelectionChanged: (event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) => {
                if (event?.detail?.value) {
                    const colDef = (event.detail.value as AuxSelectOption).value as ColumnDefinition;
                    this.breakdownChanged.emit(colDef);
                }
            },
            data: [{
                values: this.breakdownOptions
            }],
            type: 'simple',
            hasInitialOptionPlaceholder: false
        } as AuxSelectInterface;
    }

    /**
     * Create column selector option
     */
    protected createColumnSelectorOption(column: ColumnConfig): ColumnSelectorOption {
        const label = ColumnOptionUtils.getCustomTitle(column) || column.columnTitle;
        const columnSelectorOption = new ColumnSelectorOption(label);
        columnSelectorOption.eventData = new SelectedColumnSelectorOption(column, []);
        return columnSelectorOption;
    }

    protected updateLabelForColumnToUpdate(targetAreaColumns: ColumnSelectorOption[], columnToUpdate: SelectedColumnSelectorOption[]): void {
        for (const selectedColumnSelectorOption of columnToUpdate) {
            const columnSelectorOption = targetAreaColumns.find((col => (col.eventData as SelectedColumnSelectorOption).column.columnKey === selectedColumnSelectorOption.column.columnKey));
            columnSelectorOption.label = ColumnOptionUtils.getCustomTitle(selectedColumnSelectorOption.column) || selectedColumnSelectorOption.column.columnTitle;
        }
    }
}
