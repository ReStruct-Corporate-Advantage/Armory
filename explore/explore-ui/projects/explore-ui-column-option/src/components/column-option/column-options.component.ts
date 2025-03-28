import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {AuxAccordionTabChangedDetailInterface} from '@blk/aladdin-angular-components';
import {
    ColumnConfig,
    ColumnOptionMetaDataInterface,
    RestrictedOptionInterface,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {clone, findIndex, isEmpty, some} from 'lodash';
import {Subject} from 'rxjs';
import {ColumnOptionConstants, CustomCalculationConstants} from '../../constants';
import {ColumnOptionResponse, ColumnOptionUpdate} from '../../interfaces';
import {ColumnOptionService} from '../../services/column-option.service';
import {ColumnOptionUtils} from '../../utils';

@Component({
    selector: 'explore-column-options',
    templateUrl: './column-options.component.html'
})
export class ColumnOptionsComponent implements OnChanges {
    // NOTE:  A good future enhancement would be to allow multiple columns to be passed in and then show the common attributes.
    //        This would then allow a time period to be set on all columns in 1 go.
    @Input() column: ColumnConfig = null;

    @Input() restrictedColumnOptions: RestrictedOptionInterface;

    @Input() columnOptionsToAdd: ColumnOptionMetaDataInterface[];

    @Input() columnOptionsToModify: Map<string, (columnOption: ColumnOptionMetaDataInterface) => void>;

    @Input() columnOptionUpdated$: Subject<ColumnOptionUpdate>;

    @Input() widgetType: WidgetConfigType;
    // should hide copy column option button for custom calculation settings
    @Input() shouldHideCopyColumnOptionButton: boolean;

    // emit column option title
    @Output() copyButtonClickEvent = new EventEmitter<ColumnOptionMetaDataInterface>();

    readonly COPY_BUTTON_LABEL_PREFIX = 'Copy ';
    copyButtonLabel: string;

    // The set of column options to display.
    columnOptions: ColumnOptionMetaDataInterface[] = [];


    // The set of sections to display for this column.
    sections: ColumnOptionSection[];
    sectionOptions: Map<string, ColumnOptionMetaDataInterface[]>;
    selectedSectionName: string;
    selectedSectionIndex: number;

    /**
     * Construct the object and inject the required services.
     */
    constructor(
        private columnOptionService: ColumnOptionService,
        private changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * The inputs to this control have changes, so we need to regenerate what it is the user is looking at.
     */
    ngOnChanges(changes: SimpleChanges): void {
        // Clear the current sections.
        this.sections = [];

        // If we didn't get a column then get out of here.
        if (!this.column) {
            return;
        }

        // Load the column options.
        // NOTE:  That this call should really only hit the cached version as the column-set control
        //        will have already ensured they are loaded.
        this.columnOptionService
            .fetchColumnOptions$([{colTag: this.column.columnTag, use: this.column.positionColumnType}])
            .subscribe((response: ColumnOptionResponse[]) => {
                this.columnOptions = !isEmpty(response) ? response[0].options : [];
                // update column options
                this.columnOptions = ColumnOptionUtils.updateColumnOptions(this.columnOptions, this.restrictedColumnOptions, this.getUpdatedColumnOptionsToAdd(), this.columnOptionsToModify);

                // Build the sections.
                this.generateSections();
                this.changeDetectorRef.markForCheck();
            });
        this.updateCopyButtonLabel();
    }

    /**
     *
     */
    getUpdatedColumnOptionsToAdd(): ColumnOptionMetaDataInterface[] {
        let columnOptionsToAddCopy: ColumnOptionMetaDataInterface[];
        if (!isEmpty(this.columnOptionsToAdd)) {
            // scope column option only needs to be added if incoming column uses is of type PORT
            const scopeOptionIndex = this.columnOptionsToAdd.findIndex(option => option.columnOptionTitle === 'Scope');
            columnOptionsToAddCopy = clone(this.columnOptionsToAdd);
            if (scopeOptionIndex >= 0 && this.column.positionColumnType !== 'PORT') {
                columnOptionsToAddCopy.splice(scopeOptionIndex, 1);
            }
        }
        return columnOptionsToAddCopy;
    }

    /**
     * Event that is fired when the selected accordion is changed.
     */
    onAccordionChanged(event: CustomEvent<AuxAccordionTabChangedDetailInterface>) {
        // We want to track the name of the selected setting so that we can default to this if the column is changed.
        this.selectedSectionName = undefined;
        if (this.selectedSectionIndex === event.detail.tabIndex) {
            // This happens when accordion is collapsed
            this.sections[event.detail.tabIndex].isExpanded = false;
            this.selectedSectionIndex = -1;
        } else {
            this.selectedSectionName = event.detail.header;
            this.selectedSectionIndex = event.detail.tabIndex;
        }
        this.setExpandedStateOfSections();
        this.updateCopyButtonLabel();
    }

    setExpandedStateOfSections(): void {
        this.sections.forEach((value, index) => {
            value.isExpanded = index === this.selectedSectionIndex;
        });
    }

    private updateCopyButtonLabel() {
        // update copy button label
        // use lower case column option title as copy button label
        this.copyButtonLabel = this.COPY_BUTTON_LABEL_PREFIX + this.selectedSectionName?.toLowerCase();
    }

    /**
     * Checks whether a column option should be expanded or not based on the optionTitle
     */
    getIsExpanded(optionTitle: string): boolean {
        if (this.column.columnTag === CustomCalculationConstants.CUSTOM_CALCULATION) {
            return optionTitle === 'Calculate expression/script';
        }
        return optionTitle === 'Display options';
    }

    /**
     * Generates the list of sections to display for the column options.
     * NOTE:  This has been added because on some columns we have multiple settings in the same section.
     *        An example of this is Spread DVxx that has a shock and the Euro options.
     */
    private generateSections(): void {
        // Get the list of sections to display.
        const list: string[] = [];
        this.columnOptions.forEach((option: ColumnOptionMetaDataInterface) => {
            if (!list.includes(option.columnOptionTitle)) {
                list.push(option.columnOptionTitle);
            }
        });

        // Filter the 'general' columns out of the rest of the display options
        const generalColumns: string[] = list.filter(option => ColumnOptionConstants.COLUMN_OPTIONS_ORDERING.OPTIONS_ORDER.indexOf(option) >= 0);

        // Filter for order so that display options appears first and is followed by highlight and breakdown
        const sections = ColumnOptionConstants.COLUMN_OPTIONS_ORDERING.OPTIONS_ORDER.filter(option => generalColumns.indexOf(option) >= 0);

        this.sections = sections.map((optionTitle: string) => {
            return {
                optionTitle,
                isExpanded: this.getIsExpanded(optionTitle)
            };
        });

        // Insert the rest of the options that haven't already been included.
        list.forEach((option: string) => {
            if (!some(this.sections, (section: ColumnOptionSection) => section.optionTitle === option)) {
                    this.sections.push({
                        optionTitle: option,
                        isExpanded: this.getIsExpanded(option)
                    });
            }
        });

        // Now that we have the ordered sections create the options for each section.
        this.sectionOptions = new Map<string, ColumnOptionMetaDataInterface[]>();
        this.sections.forEach((section: ColumnOptionSection) => {
            this.sectionOptions.set(section.optionTitle, this.getSectionOptions(section.optionTitle));
        });

        // Now that the sections are ordered we can get the index of the last selected section.
        // Default to the first section being selected.
        this.selectedSectionIndex = -1;
        if (this.selectedSectionName) {
            this.selectedSectionIndex = findIndex(this.sections, (section: ColumnOptionSection) => section.optionTitle === this.selectedSectionName);
        }

        // If we didn't get an index then default to the first group being selected.
        if (this.selectedSectionIndex < 0) {
            this.selectedSectionIndex = 0;
            this.selectedSectionName = this.sections[0]?.optionTitle;
        }

        // This is too always expand selection measure option expanded by default for Style columns.
        const styleColumnOptionIndex = findIndex(this.sections, (section: ColumnOptionSection) => section.optionTitle === 'Measure selection');
        if (styleColumnOptionIndex > 0) {
            this.selectedSectionIndex = styleColumnOptionIndex;
            this.selectedSectionName = this.sections[styleColumnOptionIndex]?.optionTitle;
        }
        this.setExpandedStateOfSections();
    }

    /**
     * Gets the list of options for the given section
     */
    private getSectionOptions(optionTitle: string): ColumnOptionMetaDataInterface[] {
        const options: ColumnOptionMetaDataInterface[] = this.columnOptions.filter((option: ColumnOptionMetaDataInterface) => {
            return option.columnOptionTitle === optionTitle;
        });

        // Get the options that we want to force the ordering of.
        const filterOptions = options.filter(option => ColumnOptionConstants.COLUMN_OPTIONS_ORDERING.OPTIONS_GROUPING.indexOf(option.columnOptionConfigType) >= 0);

        // insert the rest of the options that haven't already been included.
        return filterOptions.concat(options.filter(option => !filterOptions.includes(option)));
    }

    /**
     * User clicks copy column option button
     */
    onCopyColumnOptionButton(columnOptionMetaData: ColumnOptionMetaDataInterface): void {
        this.copyButtonClickEvent.emit(columnOptionMetaData);
    }
}

interface ColumnOptionSection {
    optionTitle: string;
    isExpanded: boolean;
}
