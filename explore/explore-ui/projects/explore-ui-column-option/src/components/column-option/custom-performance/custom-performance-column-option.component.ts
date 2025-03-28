import {AuxSelectSelectionChangedDetailInterface, AuxSelectOption} from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {
    ColumnDefinition,
    CoreColumnConstants,
    CoreWidgetConfigStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    WidgetInputType
} from '@blk/explore-ui-core';
import {WidgetConfigType, WidgetConfigInput} from '@blk/explore-ui-core';
import {LibColumnUtils} from '../../../utils';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';
import {ColumnConfig} from '@blk/explore-ui-core';
import {CustomPerformanceColumnOption} from '../../../models/column-option/custom-performance-column-option.model';

/**
 * Component for custom Performance column options
 */
@Component({
    selector: 'explore-custom-performance-column-option',
    templateUrl: './custom-performance-column-option.component.html',
    styleUrls: ['./custom-performance-column-option.component.scss']
})
export class CustomPerformanceColumnOptionComponent extends BaseColumnTitleModifiableColumnOptionComponent<CustomPerformanceColumnOption> {
    static readonly OPTION_KEY = 'customPerfSettings';

    // Collection of options that the Port/Bench/Active drop down can have
    positionColumnTypeOptions: ExploreSelectOptionGroup[];
    performanceColumnTypeOptions: ExploreSelectOptionGroup[];
    underlyingColumnsOptions: ExploreSelectOptionGroup[];
    isUnderlyingColumnsUpdated = false;
    widgetConfigType: string;

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        this.widgetConfigType = CoreWidgetConfigStore.getCurrentWidgetConfigType();
        // Add the options to the select box
        this.positionColumnTypeOptions = [new ExploreSelectOptionGroup(this.option.columnOptionAttributes[0].values.map(value => new ExploreSelectOption(value.label, value.label, value.label === this.optionValue.positionColumnType)))];
        this.initializePerformanceColTypeOptions();
        this.initializeUnderlyingColumnsOptions();
        this.updateColumnTitle();
    }

    /**
     * Returns config type of the column option
     */
    protected getOptionValueConfigType(): string {
        return CustomPerformanceColumnOption.CONFIG_TYPE;
    }

    /**
     * Initialize the performance column type options
     */
    private initializePerformanceColTypeOptions(): void {
        this.performanceColumnTypeOptions = [new ExploreSelectOptionGroup()];
        this.option.columnOptionAttributes[1].values.forEach(value => {
            if (!(this.widgetConfigType === WidgetConfigType.RISK_EXPOSURE && value.label === 'Return')) {
                this.performanceColumnTypeOptions[0].values.push(new ExploreSelectOption(value.label, value.label));
            }
        });
        // set default value
        const defaultOption = this.performanceColumnTypeOptions[0].values.find(item => item.value === this.optionValue.performanceColumnType);
        if (defaultOption) {
            defaultOption.isSelected = true;
        } else {
            this.optionValue.performanceColumnType = this.performanceColumnTypeOptions[0].values[0].displayValue;
            this.performanceColumnTypeOptions[0].values[0].isSelected = true;
        }
    }

    /**
     * Initialize the underlying columns options
     */
    private initializeUnderlyingColumnsOptions(): void {
        this.underlyingColumnsOptions = [new ExploreSelectOptionGroup()];
        this.underlyingColumnsOptions[0].values = this.getAvailableColumns().map(colConfig => new ExploreSelectOption(colConfig.columnTitle, colConfig));
        this.optionValue.underlyingColumns.forEach(column => {
            const defaultOption = this.underlyingColumnsOptions[0].values.find(value => value.displayValue === column.columnTitle);
            if (defaultOption) {
                defaultOption.isSelected = true;
            }
        });
        this.isUnderlyingColumnsUpdated = true;
    }

    /**
     * @return available columns
     */
    private getAvailableColumns(): ColumnConfig[] {
        const positionColumnType = this.optionValue.positionColumnType === 'Active' ? CoreColumnConstants.USE_TYPES.ACTIVE : this.optionValue.positionColumnType === 'Benchmark' ? CoreColumnConstants.USE_TYPES.BENCH : CoreColumnConstants.USE_TYPES.PORT;
        const widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetConfigType);
        const widgetConfigInput = widgetConfig.inputCategories.filter(item => item.categoryType === WidgetInputType.COLUMNS)[0].inputs[0];
        // update the group filters.
        this.updateFilters(widgetConfigInput, positionColumnType, this.optionValue.performanceColumnType);
        const result: ColumnDefinition[] = LibColumnUtils.getFilteredList(widgetConfigInput.columnFilters);
        // Sort the columns is some sort of a useful way.
        result.sort(LibColumnUtils.compareColumns);
        return result.map(colDef => ColumnConfig.createColumnFromColumnDefinition(colDef));
    }

    /**
     * updates the filter based on the provided positionColumnType and performanceColumnType.
     */
    private updateFilters(widgetConfigInput: WidgetConfigInput, positionColumnType: string, performanceColumnType: string): void {
        const filterCount: number = widgetConfigInput.columnFilters.length;
        for (let filterIndex = 0; filterIndex < filterCount; filterIndex++) {
            if ('groups' === widgetConfigInput.columnFilters[filterIndex].key) {
                const values: string[] = widgetConfigInput.columnFilters[filterIndex].value;
                values.splice(0, values.length);
                values.push('Performance');
                widgetConfigInput.columnFilters[filterIndex].type = '=';
            }
        }

        // add column Type filter
        widgetConfigInput.columnFilters.push({
            key: 'groups',
            type: '=',
            value: performanceColumnType
        });

        // add positionColumnTypeFilter
        widgetConfigInput.columnFilters.push({
            key: 'uses',
            type: '=',
            value: positionColumnType
        });
    }

    /**
     * Sets the positionColumnType selected from dropdown.
     */
    onPositionColumnTypeChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (this.optionValue.positionColumnType !== (event.detail.value as AuxSelectOption).displayValue) {
            this.optionValue.positionColumnType = (event.detail.value as AuxSelectOption).displayValue;
            this.clearSelection();
            this.updateColumnTitle();
        }
    }

    /**
     * Sets the performanceColumnType selected from dropdown.
     */
    onPerformanceColumnTypeChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (this.optionValue.performanceColumnType !== (event.detail.value as AuxSelectOption).displayValue) {
            this.optionValue.performanceColumnType = (event.detail.value as AuxSelectOption).displayValue;
            this.clearSelection();
            this.updateColumnTitle();
        }
    }

    /**
     * Method called when underlyingColumns is changed
     */
    onUnderlyingColumnsChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.optionValue.underlyingColumns = (event.detail.value as AuxSelectOption[]).map((selectedColumn: ExploreSelectOption) => selectedColumn.value);
    }

    /**
     * update the underlyingColumns based on positionType and Performance Column type
     */
    updateUnderlyingColumns(): void {
        if (!this.isUnderlyingColumnsUpdated) {
            this.underlyingColumnsOptions = [new ExploreSelectOptionGroup()];
            this.underlyingColumnsOptions[0].values = this.getAvailableColumns().map(colConfig => new ExploreSelectOption(colConfig.columnTitle, colConfig));
            this.isUnderlyingColumnsUpdated = true;
        }
    }

    /**
     * clear the underlyingColumnsOptions on changing the port/bench/active type or performance column type.
     */
    private clearSelection(): void {
        this.underlyingColumnsOptions = [];
        this.optionValue.underlyingColumns.splice(0, this.optionValue.underlyingColumns.length);
        this.isUnderlyingColumnsUpdated = false;
    }
}
