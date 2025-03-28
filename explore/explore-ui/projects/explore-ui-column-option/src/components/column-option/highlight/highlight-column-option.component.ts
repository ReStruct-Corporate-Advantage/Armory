import {Component, Input} from '@angular/core';
import {ColumnDefinition, CoreColumnUtils} from '@blk/explore-ui-core';
import {ColumnDataType, HighlightComparisonType} from '../../../enums';
import {FormatAndScaleFactory} from '../../../factories';
import {DataFormatter} from '../../../interfaces';
import {HighlightColumnOption} from '../../../models/column-option/highlight-column-option.model';
import {HighlightSettings} from '../../../models/highlight/highlight-settings.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import { AuxCheckboxChangedDetailInterface } from '@blk/aladdin-angular-components';

@Component({
    selector: 'explore-highlight-column-option',
    templateUrl: './highlight-column-option.component.html',
    styleUrls: ['./highlight-column-option.component.scss']
})
export class HighlightColumnOptionComponent extends BaseColumnOptionComponent<HighlightColumnOption> {

    public static OPTION_KEY = 'highlight';

    highlightColumnOption: HighlightColumnOption;

    // Comparison operators that can be applied based on column type
    // column types: string, rating, double, int, date, timespan
    validOperators: HighlightComparisonType[];

    dataType: ColumnDataType;

    dataFormatter: DataFormatter;

    @Input()
    calledFromFactorDataWidget = false;

    readonly onlyLeafLevelLabel = 'Last level of data';

    readonly secondLastLeafLevelLabel = 'Second to last level of data';

    /**
     * Initialize the highlight column option.
     * Gets data formatter and valid comparison types based on column type
     */
    protected initializeComponent(): void {
        super.initializeComponent();

        this.highlightColumnOption = this.optionValue;

        // get the column definition which contains the datatype of the column
        const columnDef: ColumnDefinition = CoreColumnUtils.getColumnDefByTagAndUse(this.column.columnTag, this.column.positionColumnType);
        this.dataType = ColumnDataType[columnDef.dataType];
        this.dataFormatter = FormatAndScaleFactory.getFormatterToUse(columnDef.columnFormat, this.column.optionValues);

        // get valid comparison operators based on data type
        this.validOperators = this.getValidOperators(columnDef);
    }

    /**
     * Get the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return HighlightColumnOptionComponent.OPTION_KEY;
    }

    /**
     * Called when Highlight Only Leaf Level checkbox is changed
     */
    updateHighlightOnlyLeafLevel(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.highlightColumnOption.highlightOnlyLeaf = event.detail.value.checked;
    }

    /**
     * Called when Highlight Only Leaf Level checkbox is changed
     */
    updateHighlightSecondLastLeafLevel(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.highlightColumnOption.highlightSecondLastLeaf = event.detail.value.checked;
    }

    /**
     * Adds new highlight rule
     */
    addNewHighlightRule(): void {
        this.highlightColumnOption.highlightSettings.push(new HighlightSettings());
    }

    /**
     * Deletes existing highlight rule
     * @param index Index of rule to delete
     */
    deleteHighlightRule(index: number): void {
        this.highlightColumnOption.highlightSettings.splice(index, 1);
    }

    /**
     * Moves a highlight rule up or down one in the list
     * @param index Index of rule to move
     * @param moveUp If true, move highlight rule up.  If false, move highlight rule down
     */
    reorderHighlightRule(index: number, moveUp: boolean): void {
        const currentHighlightSetting: HighlightSettings = this.highlightColumnOption.highlightSettings[index];
        const newIndex: number = moveUp ? index - 1 : index + 1;
        this.highlightColumnOption.highlightSettings[index] = this.highlightColumnOption.highlightSettings[newIndex];
        this.highlightColumnOption.highlightSettings[newIndex] = currentHighlightSetting;
    }

    /**
     * Goes through all possible comparison operators and determines if they applicable to the column type selected
     * @returns the valid comparison operators in the form {displayValue, value} needed by the select component
     */
    private getValidOperators(columnDef: ColumnDefinition): HighlightComparisonType[] {
        // get all operators
        const operators: HighlightComparisonType[] = Object.keys(HighlightComparisonType).map(k => HighlightComparisonType[k]).filter(v => typeof v === 'number') as number[];

        const filterAggregatedComparisonTypeOperators = this.calledFromFactorDataWidget;

        // return only the valid operators
        return operators.filter(op => this.isValidOperator(op, ColumnDataType[columnDef.dataType], columnDef.isStaticColumn, filterAggregatedComparisonTypeOperators));
    }

    /**
     * Determines if a comparison operator is valid based on datatype of the column
     * @param operator  Operator to determine if valid
     * @param dataType  Datatype of the column
     * @param isStaticColumn  If a column contains static data
     * @param filterAggregatedComparisonTypeOperators used to filter the aggregated comparison types
     * @returns true if a column is valid
     */
    private isValidOperator(operator: HighlightComparisonType, dataType: ColumnDataType, isStaticColumn: boolean, filterAggregatedComparisonTypeOperators: boolean): boolean {
        switch (operator) {
            case HighlightComparisonType.EQUALS:
            case HighlightComparisonType.DOES_NOT_EQUAL:
                return true;

            case HighlightComparisonType.GREATER_THAN:
            case HighlightComparisonType.LESS_THAN:
            case HighlightComparisonType.LESS_THAN_EQUAL:
            case HighlightComparisonType.GT_THAN_EQUAL:
            case HighlightComparisonType.BETWEEN:
                return (dataType === ColumnDataType.DOUBLE)
                    || (dataType === ColumnDataType.INT)
                    || (dataType === ColumnDataType.DATE)
                    || (dataType === ColumnDataType.TIME_SPAN);

            case HighlightComparisonType.TOP:
            case HighlightComparisonType.BOTTOM:
            case HighlightComparisonType.STD_DEV_IN:
            case HighlightComparisonType.STD_DEV_OUT:
            case HighlightComparisonType.QUANTILE:
                return !filterAggregatedComparisonTypeOperators && ((dataType === ColumnDataType.DOUBLE)
                    || (dataType === ColumnDataType.INT));

            case HighlightComparisonType.CONTAINS:
            case HighlightComparisonType.DOES_NOT_CONTAIN:
            case HighlightComparisonType.STARTS_WITH:
                return (dataType === ColumnDataType.STRING && !isStaticColumn)
                    || (dataType === ColumnDataType.RATING);

            default:
                return true;
        }
    }

    getStyleForRule(idx: number): any {
        if (!this.calledFromFactorDataWidget) {
            return {};
        }
        const obj: any = {
            width: '45%',
            display: 'inline-block',
            'border-bottom': 0,
            'margin-bottom': 0,
        };
        // For Even rules, ex - Rule 2,4,so on, we show them in-line
        if (((idx + 1) % 2) === 0) {
            obj.float = 'right';
        }
        return obj;
    }
}
