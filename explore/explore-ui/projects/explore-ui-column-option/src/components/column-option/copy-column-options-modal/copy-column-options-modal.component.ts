import {Component, EventEmitter, Inject, Input, OnInit, Optional, Output} from '@angular/core';
import {
    ColumnConfig,
    ColumnOptionMetaDataInterface,
    ExploreCheckbox,
    SubscribableComponent,
    CoreCommonConstants,
    NotificationServiceInterface,
    NOTIFICATION_SERVICE_TOKEN,
    AbstractColumnOption,
    RestrictedOptionInterface,
    ConfigState
} from '@blk/explore-ui-core';
import {takeUntil} from 'rxjs/operators';
import {ColumnOptionService} from '../../../services/column-option.service';
import {isEmpty, cloneDeep, isEqual, isNil} from 'lodash';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Subject, BehaviorSubject} from 'rxjs';
import {ColumnOptionUtils} from '../../../utils';

/**
 * Copy Column Options Modal Component
 *
 */
@Component({
    selector: 'explore-copy-column-options-modal',
    templateUrl: './copy-column-options-modal.component.html',
    styleUrls: ['./copy-column-options-modal.component.scss']
})

export class CopyColumnOptionsModalComponent extends SubscribableComponent implements OnInit {
    // variables to control modal open/close event
    @Input() isOpen: boolean;
    // selected column
    @Input() column: ColumnConfig;
    // all columns for current column set
    @Input() columns: ColumnConfig[];
    // column set updated
    @Input() columnOptionCopied$?: Subject<{columns: ColumnConfig[], columnOptionValue: AbstractColumnOption}>;
    // source column option meta data for copy
    @Input() sourceColumnOptionMetaData: ColumnOptionMetaDataInterface;
    // restricted column options to be filtered out,
    // note that we only need the restricted column options for the copy feature,
    // and we don't need to add or modify column options
    @Input() restrictedColumnOptions: RestrictedOptionInterface;

    @Output() modalClosed = new EventEmitter<boolean>();

    // map compositeKey(columnTag+positionColumnType) to ColumnOptionMetaDataInterface[]
    compositeKeyToColumnOptionsMap = new Map<string, ColumnOptionMetaDataInterface[]>();
    columnsForCheckbox$: BehaviorSubject<ExploreCheckbox[]> = new BehaviorSubject<[]>(null);
    // key: columnKey; value: columnConfig
    columnKeyToColumnConfigMap = new Map<string, ColumnConfig>();
    // columns that user selected on the copy modal will be updated when user clicks on "Apply" button
    columnsToUpdate = new Set<ColumnConfig>();

    // checkbox group label
    readonly CHECK_BOX_TITLE = 'Select columns to paste the copied options';
    readonly COPY_COLUMNS_SUCCESS = 'Columns copied successfully';
    readonly COPY_MODAL_HEADER_PREFIX = 'Copy ';
    readonly INSTRUCTIONAL_TEXT = 'Only applicable columns shown below';
    // For display options modal only, notify user that (custom) column title will not be copied
    readonly DISPLAY_OPTIONS_NOTE = 'Note: Column title will not be copied';
    copyModalHeader: string;

    readonly APPLY_TEXT = CoreCommonConstants.BUTTON_TEXT.APPLY;
    readonly CANCEL_TEXT = CoreCommonConstants.BUTTON_TEXT.CANCEL;

    constructor(private columnOptionService: ColumnOptionService,
                @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) private notificationService: NotificationServiceInterface) {
        super();
    }

    /**
     * Initialize copy modal header,
     * and filter the columns that are eligible for column option copy
     */
    ngOnInit(): void {
        // set the copy modal header
        this.copyModalHeader = this.COPY_MODAL_HEADER_PREFIX + this.sourceColumnOptionMetaData.columnOptionTitle;
        // figure out the eligible columns for copy that will be stored in columnsForCheckbox
        this.filterColumnsForCheckbox();
    }

    /**
     * Fetch column options and filter the selectable columns to display on the copy modal
     * @private
     */
    private filterColumnsForCheckbox() {
        // setup inputs for fetchColumnOptions$ call
        const inputs: { colTag: string; columnOptionType?: string; use: string }[] = [];
        this.columns.forEach(column => {
            inputs.push({colTag: column.columnTag, use: column.positionColumnType});
            // Map columnKey to columnConfig in order to get the column object when user select column checkbox
            // The column object will be updated when user clicks apply button on the modal.
            this.columnKeyToColumnConfigMap.set(column.columnKey, column);
        });

        // map [columnTag + positionColumnType] to column options
        this.columnOptionService
            .fetchColumnOptions$(inputs)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (colOptionResponses) => {
                    colOptionResponses.forEach((columnOptionResponse) => {
                        let columnOptions = isNil(columnOptionResponse) ? [] : columnOptionResponse.options;
                        // updated column options
                        columnOptions = ColumnOptionUtils.updateColumnOptions(columnOptions, this.restrictedColumnOptions);
                        this.compositeKeyToColumnOptionsMap.set(columnOptionResponse.colTag + '+' + columnOptionResponse.use, columnOptions);
                    });
                    this.filterColumns(this.columns);
                },
                error: () => {
                    throw new Error('Unable to fetch column options with inputs: \n' + JSON.stringify(inputs));
                }
            });
    }

    /**
     * Filter the selectable columns to display on the copy modal
     * @param columns: array of ColumnConfig
     */
    filterColumns(columns: ColumnConfig[]) {
        // exclude the selected column for copy modal column checkbox,
        // and look for exact match of column options for the columns compared
        const checkBoxArray = [];
        columns.forEach(column => {
            // if the column tag of two columns are identical, bypass additional check
            if (column !== this.column && (column.columnTag === this.column.columnTag || this.filterColumn(column.columnTag + '+' + column.positionColumnType))) {
                checkBoxArray.push(new ExploreCheckbox(column.columnTitle, false, false, column.columnKey));
            }
        });
        this.columnsForCheckbox$.next(checkBoxArray);
    }

    /**
     * Filter each column,
     * check for exact match between ColumnOptionMetaDataInterface of the source and the target columns
     * @param compositeKey: string
     */
    filterColumn(compositeKey: string): boolean {
        return this.compositeKeyToColumnOptionsMap.get(compositeKey)
            .some(columnOptionMetaData => isEqual(columnOptionMetaData, this.sourceColumnOptionMetaData));
    }

    /**
     * Close the copy modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }

    /**
     * User select column in the modal
     * @param event: user select/unselect column checkbox event
     */
    onColumnSelection(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }
        const eventValue = event.detail.value;
        // Maintain a target column set when user select/unselect a target column
        // eventValue.uid is columnKey
        if (eventValue.checked) {
            this.columnsToUpdate.add(this.columnKeyToColumnConfigMap.get(eventValue.uid));
        } else {
            this.columnsToUpdate.delete(this.columnKeyToColumnConfigMap.get(eventValue.uid));
        }
    }

    /**
     * Apply source column option to the selected columns' column option
     */
    applyColumnOptionChanges(): void {
        // find the source column option value
        let sourceColumnOptionValue: AbstractColumnOption;
        for (const targetColumnOption of this.column.optionValues) {
            if (ColumnOptionUtils.hasSameConfigType(targetColumnOption, this.sourceColumnOptionMetaData)) {
                sourceColumnOptionValue = targetColumnOption;
                break;
            }
        }
        // For each target column, find the target column option value and assign the source column option value to it
        this.columnsToUpdate.forEach(targetColumn => {
            const clonedColumnOption = cloneDeep(sourceColumnOptionValue);
            // automatically mark the cloned column option as modified since it is being copied to another column
            clonedColumnOption.optionState = ConfigState.MODIFIED;

            // if there is no optionValue for this column, add the sourceColumnOptionValue and get out of here
            if (isEmpty(targetColumn.optionValues)) {
                targetColumn.optionValues.push(clonedColumnOption);
            } else {
                for (let i = 0; i < targetColumn.optionValues.length; i++) {
                    if (ColumnOptionUtils.hasSameConfigType(targetColumn.optionValues[i], this.sourceColumnOptionMetaData)) {
                        targetColumn.optionValues[i] = clonedColumnOption;
                        break;
                    }
                    // Create a new column option for this column
                    // if it reaches the end of the loop but haven't found the column option
                    if (i === targetColumn.optionValues.length - 1) {
                        targetColumn.optionValues.push(clonedColumnOption);
                    }
                }
            }
        });
        // Now that we have updated the column option values in the target columns model,
        // we want to make sure that the column set view (ColumnSelectorOption) is also updated.
        // Otherwise, when we switch to the target column, the target column option will still show the old optionValues
        this.columnOptionCopied$.next(
            {columns: Array.from(this.columnsToUpdate), columnOptionValue: sourceColumnOptionValue});
        // notify user that copy operation is complete
        if (this.notificationService != null) {
            this.notificationService.success(this.COPY_COLUMNS_SUCCESS);
        }
        // close the modal
        this.closeModal();
    }
}
