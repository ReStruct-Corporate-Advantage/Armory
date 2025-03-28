import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {cloneDeep, isNil, isUndefined, sortBy} from 'lodash';
import {Breakdown, BreakdownConstants, BreakdownFavoriteConstants, ColumnSector, ColumnSectorUtils} from '@blk/explore-ui-breakdown';
import {AuxSelectOption, AuxSelectOptionGroup, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {BaseBreakdownTypeComponent} from '../base-breakdown-type.component';
import {ColumnDefinition, ExploreSelectOption} from '@blk/explore-ui-core';
import {ColumnFilter, LibColumnUtils} from '@blk/explore-ui-column-option';

/**
 * Component to define single-level/quick breakdown
 */
@Component({
    selector: 'app-single-level-breakdown',
    templateUrl: './single-level-breakdown.component.html',
    styleUrls: ['./single-level-breakdown.component.scss']
})
export class SingleLevelBreakdownComponent extends BaseBreakdownTypeComponent implements OnInit, OnChanges {

    columnOptions: AuxSelectOptionGroup[];

    singleLevelBreakdown: Breakdown;

    constructor() {
        super(BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.label);
    }

    ngOnInit() {
        if (this.breakdown && this.breakdown.isQuickSelectBreakdown() && isUndefined(this.breakdown.id) && !this.breakdown.isConfigured) {
            // If it's a simple single level breakdown, copy the breakdown
            this.singleLevelBreakdown = cloneDeep(this.breakdown);
        } else {
            // Else, get the default breakdown
            this.singleLevelBreakdown = this.getDefaultBreakdown();
        }
        this.singleLevelBreakdown.isConfigured = false;
        this.initializeColumnSelections();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.breakdownBuilderSettings) {
            if (isNil(this.singleLevelBreakdown)) {
                // Set the single level breakdown to the default breakdown
                this.singleLevelBreakdown = this.getDefaultBreakdown();
            }
            // If the breakdownBuilderSettings change, then we need to repopulate the what the dropdown is populated with
            this.initializeColumnSelections();
        }
    }

    /**
     * Initialize the column selector dropdown with list of columns that can be selected to create breakdown
     */
    private initializeColumnSelections() {
        this.columnOptions = [];
        // add default option to use mandate breakdown
        const isEATColumn: boolean = !isUndefined(this.breakdownBuilderSettings.columnFilter) && this.breakdownBuilderSettings.columnFilter.length === 1 && this.breakdownBuilderSettings.columnFilter[0].key === 'isEATBreakdownDefinition';
        // We don't want to add the default breakdown option for EAT columns
        if (!isEATColumn) {
            this.columnOptions.push({values: [new ExploreSelectOption(BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE, {isMandateDefaultBreakdown: true}, this.singleLevelBreakdown.isMandateDefaultBreakdown)]});
        }
        // add all quick select columns
        let columns = LibColumnUtils.getFilteredList(this.getColumnFilters());
        columns = sortBy(columns, (column: ColumnDefinition) => column.title);
        const selectedColumnTag = this.singleLevelBreakdown?.children && this.singleLevelBreakdown.children[0] && (this.singleLevelBreakdown.children[0] as ColumnSector).columnTag;
        for (const column of columns) {
            const isSelected = selectedColumnTag && selectedColumnTag === column[this.breakdownBuilderSettings.fieldToUse];
            this.columnOptions.push({values: [new ExploreSelectOption(column.title, column, isSelected)]});
        }
    }

    /**
     * Returns lists of column filters to filter out columns which are not required to create breakdown
     */
    private getColumnFilters(): ColumnFilter[] {
        // For the single fields we need to restrict the data type that we are allowing to be used to only string or rating.
        // If the quick column filter has been defined then use that, otherwise fallback to the normal column filter.
        const columnFilter: ColumnFilter[] = this.breakdownBuilderSettings.quickColumnFilter ?
            cloneDeep(this.breakdownBuilderSettings.quickColumnFilter) : this.breakdownBuilderSettings.columnFilter ? cloneDeep(this.breakdownBuilderSettings.columnFilter) : [];
        columnFilter.push({
            type: '!=',
            key: 'dataType',
            value: [
                'TIME_SPAN',
                'DATE',
                'INT',
                'DOUBLE'
            ]
        });
        return columnFilter;
    }

    /**
     * Gets the default breakdown for the single level option.
     * NOTE:  That depending on the favorite type we need to create this differently, eg factor widget.
     */
    private getDefaultBreakdown(): Breakdown {
        const isEATColumn: boolean = !isUndefined(this.breakdownBuilderSettings.columnFilter) && this.breakdownBuilderSettings.columnFilter.length === 1 && this.breakdownBuilderSettings.columnFilter[0].key === 'isEATBreakdownDefinition';
        if (isEATColumn) {
            const sector: ColumnSector = new ColumnSector();
            sector.columnTag = 'f_type';
            sector.columnName = BreakdownConstants.EXPOSURE_AGGREGATION_TYPE;
            sector.positionColumnType = 'ALL';

            const breakdown: Breakdown = new Breakdown();
            breakdown.title = BreakdownConstants.EXPOSURE_AGGREGATION_TYPE;
            breakdown.addChild(sector);
            return breakdown;
        } else if (this.breakdownBuilderSettings.favoriteType === BreakdownFavoriteConstants.FACTOR_BREAKDOWN) {
            return Breakdown.getDefaultFactorBreakdown();
        }

        // For all others return the default breakdown.
        return Breakdown.getDefaultBreakdown();
    }

    /**
     * Callback for when the user selects a column sector from the dropdown for the single-level breakdown input option
     */
    onBreakdownOptionChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (event?.detail?.value) {
            const newBreakdown: Breakdown = new Breakdown();
            if ((event.detail.value as AuxSelectOption).value?.isMandateDefaultBreakdown) {
                // default breakdown option selected which will use mandate breakdown
                newBreakdown.title = BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE;
                newBreakdown.isMandateDefaultBreakdown = true;
            } else {
                const colDef = (event.detail.value as AuxSelectOption).value as ColumnDefinition;
                // Create the new single-level column sector and set its attributes
                const sector: ColumnSector = ColumnSectorUtils.createColumnSectorFromColumnDefinition(colDef);
                sector.columnTag = colDef[this.breakdownBuilderSettings.fieldToUse];
                sector.useNoneBuckets = true;

                // Create the new breakdown to represent this sector.
                newBreakdown.addChild(sector);
                // Change the breakdown title to the column name
                newBreakdown.title = sector.columnName;
                newBreakdown.isMandateDefaultBreakdown = false;
            }
            newBreakdown.isConfigured = false;
            this.singleLevelBreakdown.copyFrom(newBreakdown);
            this.onFocusIn();
        }
    }

    /**
     * Method called when select box is in focus
     */
    onFocusIn() {
        this.breakdownChanged.emit(this.singleLevelBreakdown);
    }

}
