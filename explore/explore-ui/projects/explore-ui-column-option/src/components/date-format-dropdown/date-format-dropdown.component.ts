import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface,
    AuxSelectOption
} from '@blk/aladdin-angular-components';
import {ExploreSelectOption, ExploreSelectOptionGroup, ColumnOptionAttribute} from '@blk/explore-ui-core';
import {DateColumnFormatColumnOption} from '../../models/column-option/date-column-format-column-option.model';
import {ColumnOptionService} from '../../services/column-option.service';

@Component({
    selector: 'explore-column-option-date-format-dropdown',
    templateUrl: './date-format-dropdown.component.html'
})
/**
 * Component for the Date Format Dropdown
 */
export class DateFormatDropdownComponent implements OnInit {

    @Input() dateFormat: string;
    @Output() updatedDateFormat = new EventEmitter<string>();
    dateOption: ColumnOptionAttribute;
    dateFormatDropdownOptions: DateColumnFormatColumnOption[];
    availableDateFormatDropdownOptions: AuxSelectOptionGroup[];

    /**
     * constructor
     */
    constructor(private columnOptionService: ColumnOptionService, private changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * Init hook
     */
    ngOnInit() {
        this.columnOptionService.fetchColumnOptions$([{colTag: 'announce_date', use: 'ALL'}])
            .subscribe((response) => {
                this.dateOption = response[0].options[2].columnOptionAttributes[0];
                this.initializeDateFormatDropdownOptions();
            });
    }

    /**
     * Initialize available date Formats
     */
    private initializeDateFormatDropdownOptions(): void {
        this.dateFormatDropdownOptions = this.dateOption.values.map(dateFormatOption => new DateColumnFormatColumnOption({
            value: dateFormatOption.value,
            label: dateFormatOption.label
        }));
        this.availableDateFormatDropdownOptions = [new ExploreSelectOptionGroup(this.dateFormatDropdownOptions.map(data => new ExploreSelectOption(data.value, data.label)))];
        this.availableDateFormatDropdownOptions[0].values.filter(dateFormatOption => dateFormatOption.displayValue === this.dateFormat)[0].isSelected = true;
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Callback to update the Date Format with what the user selected
     */
    onDateFormatSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.dateFormat = (event.detail.value as AuxSelectOption).displayValue;
        this.updatedDateFormat.emit(this.dateFormat);
    }
}
