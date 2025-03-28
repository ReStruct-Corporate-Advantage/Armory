import {Component} from '@angular/core';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';
import {AuxCheckboxChangedDetailInterface, AuxRadioGroupChangedDetailInterface, AuxRadioInterface, AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {orientationOption} from '@enums/bar-chart-orientation-options.enum';
import {WidgetConfigFactory} from '../../../../../factories';
import {ColumnConfig, ColumnConstants, ExploreSelectOption, ExploreSelectOptionGroup, WidgetDisplayInputConfigType, WidgetInputType, WidgetConfigType} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent, ColumnSet} from '@blk/explore-ui-column-option';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';

@Component({
    selector: 'app-bar-chart-settings',
    templateUrl: './bar-chart-settings.component.html',
    styleUrls: ['../chart-settings.component.scss']
})
/**
 * Component for the Bar Chart Settings
 */
export class BarChartSettingsComponent extends BaseWidgetSettingComponent<BarChartSettings> {
    widgetColumns: ColumnSet;
    hideBreakdownInSorting: boolean;
    hideTotal: boolean;
    hideSorting: boolean;
    orientationOptions: AuxRadioInterface[] = [];
    sortingOrder: ExploreSelectOptionGroup[];
    sortByOptions: ExploreSelectOptionGroup[];
    isTotalChecked: boolean;
    isTotalCheckboxDisabled: boolean;
    isSortByDisabled: boolean;
    showBaseline;

    gridLines: GridLines;

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.hideBreakdownInSorting = WidgetConfigFactory.getHideBreakdownInSorting(this.widgetType);
        this.initializeOrientationOptions();
        this.widgetColumns = this.getInput(WidgetInputType.COLUMNS) as ColumnSet;
        this.initializeSortedColumns();
        this.isTotalChecked = (this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).includeTotalValues;
        this.showBaseline = (this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).showBaseline;
        this.isTotalCheckboxDisabled = (!this.getInput('stackedBreakdownTree') || (this.getInput('stackedBreakdownTree') as Breakdown).isEmpty()) && this.widgetType !== WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART;
        this.gridLines = this.inputs.get(WidgetDisplayInputConfigType.SHOW_GRID_LINES) as GridLines;
    }

    /**
     * Initializes sorted-columns of widget input and populates data accordingly in select boxes
     */
    initializeSortedColumns(): void {
        const sortedColumns = this.getInput(SortedColumns.configType) as SortedColumns;
        if (sortedColumns?.sortedColumns?.length) {
            const sortedColumn = sortedColumns.sortedColumns[0];
            const doesSortedColumnExist = this.widgetColumns?.columns?.some(column => column.columnKey === sortedColumn.colId);

            // If the original sortedColumn's corresponding column has been removed, clear sort order
            if (sortedColumn.sort !== ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE && !doesSortedColumnExist) {
                sortedColumns.sortedColumns = [];
            }
        }
        this.initializeSortOrderOptions();
        this.updateSortByOptions();
    }

    /**
     * Initialize the Sort Order options
     */
    initializeSortOrderOptions(): void {
        const sortOrder = (this.getInput(SortedColumns.configType) as SortedColumns)?.sortedColumns[0]?.sort;

        this.sortingOrder = [new ExploreSelectOptionGroup()];
        this.sortingOrder[0].values.push(new ExploreSelectOption(ColumnConstants.SORTING_ORDER.ASC_SORT_ORDER.LABEL, ColumnConstants.SORTING_ORDER.ASC_SORT_ORDER.VALUE, sortOrder === ColumnConstants.SORTING_ORDER.ASC_SORT_ORDER.VALUE));
        this.sortingOrder[0].values.push(new ExploreSelectOption(ColumnConstants.SORTING_ORDER.DESC_SORT_ORDER.LABEL, ColumnConstants.SORTING_ORDER.DESC_SORT_ORDER.VALUE, sortOrder === ColumnConstants.SORTING_ORDER.DESC_SORT_ORDER.VALUE));
        if (!this.hideBreakdownInSorting) {
            this.sortingOrder[0].values.push(new ExploreSelectOption(ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.LABEL, ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE, sortOrder === ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE));
        }
    }

    /**
     * Initializes SortBy Options
     */
    updateSortByOptions(): void {
        const sortedColumn = (this.getInput(SortedColumns.configType) as SortedColumns)?.sortedColumns[0];

        this.sortByOptions = [new ExploreSelectOptionGroup()];
        this.sortByOptions[0].values = (this.widgetColumns?.columns || []).map((col: ColumnConfig) => new ExploreSelectOption(col.columnTitle, col.columnKey, sortedColumn?.colId === col.columnKey));

        this.isSortByDisabled = !sortedColumn || sortedColumn.sort === ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE;
    }

    /**
     * Initialize the orientation options
     */
    initializeOrientationOptions(): void {
        this.orientationOptions = [
            {
                label: 'Horizontal',
                eventData: orientationOption.HORIZONTAL,
                checked: (this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).chartType === 'bar'
            },
            {
                label: 'Vertical',
                eventData: orientationOption.VERTICAL,
                checked: (this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).chartType === 'column'
            }
        ];
    }

    /**
     * Checkbox change handler
     */
    onCheckboxGroupChanged(value: any): void {
        (this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).includeTotalValues = value ? value.checked : false;

        // if the stackedBreak is not applied, then make sure model is false as well
        if ((!this.getInput('stackedBreakdownTree') || (this.getInput('stackedBreakdownTree') as Breakdown).isEmpty()) && this.widgetType !== WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART) {
            if ((this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).includeTotalValues) {
                (this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).includeTotalValues = false;
            }
        }
        this.isTotalChecked = (this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).includeTotalValues;
    }

    /**
     * Sort Order selection change handler
     */
    onSortOrderSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const sortOrder = (event.detail.value as AuxSelectOption)?.value;
        const sortedColumns = this.getInput(SortedColumns.configType) as SortedColumns;

        if (!sortOrder) {
            // clear sort order
            sortedColumns.sortedColumns = [];
            this.updateSortByOptions();
            return;
        }

        if (!sortedColumns.sortedColumns.length) {
            // create new sorted column if does not previously exist
            sortedColumns.sortedColumns.push(new SortedColumn());
        }
        sortedColumns.sortedColumns[0].sort = sortOrder;

        if (sortOrder === ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE) {
            // remove sortBy column if sorting by breakdown
            sortedColumns.sortedColumns[0].colId = undefined;
        } else if (!sortedColumns.sortedColumns[0].colId) {
            // default to sorting by first column if no sortBy column previously selected
            sortedColumns.sortedColumns[0].colId = this.widgetColumns?.columns[0]?.columnKey;
        }

        // update Sort By select box based on Sort Order selection
        this.updateSortByOptions();
    }

    /**
     * Sort By Selection Change Handler
     */
    onSortBySelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        (this.getInput(WidgetDisplayInputConfigType.SORTED_COLUMNS) as SortedColumns).sortedColumns[0].colId = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * Orientation change handler
     */
    onOrientationChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        (this.getInput(WidgetDisplayInputConfigType.CHART) as BarChartSettings).chartType = event.detail.value.eventData;
    }

    /**
     * Show Total Value change handler
     */
     onShowBaselineValueChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.showBaseline = event.detail.value.checked;
        this.showBaseline = this.widgetInput.showBaseline;
    }
}
