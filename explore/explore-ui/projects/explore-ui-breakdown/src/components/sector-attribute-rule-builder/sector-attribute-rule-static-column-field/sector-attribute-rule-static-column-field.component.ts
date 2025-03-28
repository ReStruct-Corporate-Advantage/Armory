import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ChangeDetectorRef, Component, Inject, Input, Optional, SimpleChanges} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {BaseSectorAttributeRuleValueFieldComponent} from '../base-sector-attribute-rule-value-field';
import get from 'lodash/get';
import {ColumnStaticValuesService} from '@blk/explore-ui-column-option';
import {AlertConstants, ColumnDefinition, ColumnStaticStringValue, ExploreSelectOption, ExploreSelectOptionGroup, NotificationServiceInterface, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';

/**
 * This component is used to set comparision value of Column Sector Rule of type attribute, when column is static and multiple values are selected from static values
 */
@Component({
    selector: 'explore-sector-attribute-rule-static-column-field',
    templateUrl: './sector-attribute-rule-static-column-field.component.html'
})
export class SectorAttributeRuleStaticColumnFieldComponent extends BaseSectorAttributeRuleValueFieldComponent<string[] | number[]> {

    @Input()
    columnSelected: ColumnDefinition;

    selections: ExploreSelectOptionGroup[];

    constructor(@Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface, protected columnStaticValuesService: ColumnStaticValuesService, protected changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    onChanges(changes: SimpleChanges): void {
        if (changes.columnSelected) {
            if (this.columnSelected) {
                this.fetchStaticValues();
            } else {
                this.selections = [new ExploreSelectOptionGroup([])];
            }
            if (changes.columnSelected.previousValue && changes.columnSelected.previousValue.isStaticColumn) {
                this.valueChange.emit(null);
            }
        }
        if (changes.value) {
            this.initializeSelectedOptions();
            this.valueChange.emit(this.value);
        }
    }

    /**
     * Method to fetch values for static columns from Prism Server
     */
    private fetchStaticValues(): void {
        // Fetch values from prism server.
        this.columnStaticValuesService.getColumnStaticValues$(this.columnSelected.columnTag).pipe(
            map((staticValues: ColumnStaticStringValue[]) => {
                    const columnStaticValues = [];
                    staticValues.forEach(staticValue => {
                            columnStaticValues.push(new ExploreSelectOption(staticValue.displayName, staticValue.value, false));
                        }
                    );
                    return columnStaticValues;
                }
            ),
            catchError(error => throwError(error))
        ).subscribe(
            (columnStaticValues: ExploreSelectOption[]) => {
                if (!columnStaticValues || columnStaticValues.length === 0) {
                    this.selections = [new ExploreSelectOptionGroup([])];
                } else {
                    this.selections = [new ExploreSelectOptionGroup(columnStaticValues)];
                }
                this.initializeSelectedOptions();
                this.changeDetectorRef.markForCheck();
            },
            error => {
                this.selections = [new ExploreSelectOptionGroup([])];
                console.error(error);
                this.notificationService?.error(AlertConstants.NOTIFICATION.ERROR_RETRIEVING_COLUMN_STATIC_VALUE);
            }
        );
    }

    /**
     * Initialize select box selections for pre selected values in static column
     */
    protected initializeSelectedOptions(): void {
        if (this.value && this.value.length > 0 && this.selections && this.selections[0].values) {
            this.value.forEach(selectedStaticValue => {
                const selectedValue = this.selections[0].values.find(staticValue => {
                    return staticValue.value === selectedStaticValue;
                });
                if (selectedValue) {
                    selectedValue.isSelected = true;
                }
            });
        }
    }

    /**
     * Is called when selections are changed.
     */
    onSelectionsChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        const columnValue = [];
        if (get(event, 'detail.value')) {
            (event.detail.value as AuxSelectOption[]).forEach((option: ExploreSelectOption) => {
                columnValue.push(option.value);
            });
        }
        this.valueChange.emit(columnValue);
    }
}
