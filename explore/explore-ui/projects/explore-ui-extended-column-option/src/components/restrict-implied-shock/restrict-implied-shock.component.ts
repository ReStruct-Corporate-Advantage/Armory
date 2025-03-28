import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Optional, Output} from '@angular/core';
import {finalize, takeUntil} from 'rxjs';
import {
    AlertConstants,
    ColumnStaticStringValue,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    NotificationServiceInterface,
    NOTIFICATION_SERVICE_TOKEN,
    SubscribableComponent
} from '@blk/explore-ui-core';
import {AuxSelectOption} from '@blk/aladdin-angular-components';
import {ColumnStaticValuesService} from '@blk/explore-ui-column-option';
import {isEmpty} from 'lodash';

@Component({
    selector: 'explore-extended-column-option-restrict-implied-shock',
    templateUrl: './restrict-implied-shock.component.html',
    styleUrls: ['./restrict-implied-shock.component.scss']
})
/**
 * This component shows a select field to select multiple column static values for few factor breakdowns
 *
 */
export class RestrictImpliedShockComponent extends SubscribableComponent implements OnInit {

    readonly OTHER_OPTION_VAl = 'OTHER_VAL';

    @Input()
    globalSetting = false;

    @Input()
    fromCellEditor = false;

    /**
     * Initial value binding
     */
    @Input()
    value: string[];

    /**
     * To notify value change
     */
    @Output()
    valueChange = new EventEmitter<string[]>();

    isLoading = true;
    private breakdownTags: string[];
    selections: ExploreSelectOptionGroup[];

    showOtherTextField = false;
    otherShocksValue: string;
    selectedOptionValues: string[] = [];


    constructor(@Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface, protected columnStaticValuesService: ColumnStaticValuesService, protected changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        if (this.fromCellEditor) {
            this.globalSetting = true;
        }
        this.breakdownTags = [ 'BRS_GOLD_1', 'BRS_GOLD_2', 'BRS_GOLD_3', 'BRS_GOLD_4', 'BRS_GOLD_5'];
        this.fetchStaticValuesForBreakdownTags();
    }

    /**
     * Method to fetch values for static columns from Prism Server
     */
    private fetchStaticValuesForBreakdownTags(): void {
        this.columnStaticValuesService.getColumnStaticValuesForColumns$([ ...this.breakdownTags ])
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();
                })
            )
            .subscribe({
                next: (columnStaticValues: ColumnStaticStringValue[]) => {
                    const columnStaticValuesOptions = [ new ExploreSelectOption('Other', this.OTHER_OPTION_VAl, false) ];
                    if (!isEmpty(columnStaticValues)) {
                        columnStaticValues.forEach( staticValue => columnStaticValuesOptions.push(new ExploreSelectOption(staticValue.displayName, staticValue.value, false)));
                    }
                    this.selections = [new ExploreSelectOptionGroup(columnStaticValuesOptions)];
                    this.initializeSelectedOptions();
                },
                error: () => {
                    this.selections = [new ExploreSelectOptionGroup([])];
                    this.notificationService?.error(AlertConstants.NOTIFICATION.ERROR_RETRIEVING_COLUMN_STATIC_VALUE);
                },
            });
    }

    /**
     * Initialize select box selections for pre selected values in static column
     */
    private initializeSelectedOptions(): void {
        if (this.value && this.value.length > 0 && this.selections && this.selections[0].values) {
            const otherShockValues = [];
            this.selectedOptionValues = [];
            this.value.forEach(selectedStaticValue => {
                const selectedValue = this.selections[0].values.find(staticValue => {
                    return staticValue.value === selectedStaticValue;
                });
                if (selectedValue) {
                    selectedValue.isSelected = true;
                    this.selectedOptionValues.push(selectedStaticValue);
                } else {
                    otherShockValues.push(selectedStaticValue);
                }
            });
            if (otherShockValues.length > 0) {
                // Other option is the first in select list
                this.selections[0].values[0].isSelected = true;
                this.showOtherTextField = true;
                this.otherShocksValue = otherShockValues.toString();
            }
        }
    }

    /**
     * Is called when selections are changed.
     */
    onSelectionsChange(options: AuxSelectOption[]): void {
        this.selectedOptionValues = [];
        let otherShockOptionSelected = false;
        if (options) {
            options.forEach((option: ExploreSelectOption) => {
                if (option.value === this.OTHER_OPTION_VAl) {
                    otherShockOptionSelected = true;
                } else {
                    this.selectedOptionValues.push(option.value);
                }
            });
        }
        let columnValue = [ ...this.selectedOptionValues ];
        if (otherShockOptionSelected) {
            columnValue = [ ...columnValue, ...this.getOtherShockValues() ];
        }
        this.showOtherTextField = otherShockOptionSelected;
        this.valueChange.emit(columnValue);
    }

    /**
     * Is called when text field value is updated.
     */
    onOtherShockValueChanged(value: string): void {
        this.otherShocksValue = value;
        const columnValue = [ ...this.selectedOptionValues, ...this.getOtherShockValues() ];
        this.valueChange.emit(columnValue);
    }

    private getOtherShockValues(): string[] {
        if (isEmpty(this.otherShocksValue)) {
            return [];
        }
        const splitStrings: string[] = this.otherShocksValue.split(',');
        return splitStrings.map(val => val?.trim()).filter(val => !isEmpty(val));
    }

}
