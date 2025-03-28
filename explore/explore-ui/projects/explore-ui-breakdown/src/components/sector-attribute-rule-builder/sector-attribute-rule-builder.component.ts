import {AfterViewInit, Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {AuxColumnSelectorSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {isEmpty, isNil} from 'lodash';
import {Subject} from 'rxjs';
import {ColumnConstants, ColumnDefinition, CoreColumnUtils, CoreCommonConstants, AlertConstants, NOTIFICATION_SERVICE_TOKEN, NotificationServiceInterface, ExploreDialogParam} from '@blk/explore-ui-core';
import {ColumnSelectorOption} from '@blk/explore-ui-column-option';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {SectorConstants} from '../../constants/sector.constants';

/**
 * Component to create/edit Attribute Column Sector Rule
 *
 * @example
 *  <aux-tab-content slot="content" class="aux-g16--cw-8 tab-content-container" uid="0">
 *      <explore-sector-attribute-rule-builder (rulePreviewUpdate)="updateRulePreview($event)"
 *                                              [sectorRuleBuilderConfig]="sectorRuleBuilderConfig"
 *                                              [columnSectorRule]="columnSectorRule">
 *      </explore-sector-attribute-rule-builder>
 *  </aux-tab-content>
 *
 *  <div class="aux-g16--cw-8 tab-content-container" *ngIf="sectorRuleBuilderConfig && !sectorRuleBuilderConfig.showFundSectoringTabs">
 *      <explore-sector-attribute-rule-builder (rulePreviewUpdate)="updateRulePreview($event)"
 *                                              [sectorRuleBuilderConfig]="sectorRuleBuilderConfig"
 *                                              [columnSectorRule]="columnSectorRule">
 *      </explore-sector-attribute-rule-builder>
 *  </div>
 */
@Component({
    selector: 'explore-sector-attribute-rule-builder',
    templateUrl: './sector-attribute-rule-builder.component.html',
    styleUrls: ['./sector-attribute-rule-builder.component.scss']
})
export class SectorAttributeRuleBuilderComponent implements OnChanges, AfterViewInit {
    @Input() sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    @Input() columnSectorRule: ColumnSectorRule;

    initialColumnValue: Array<string | number> = [];

    isNumericColumn: boolean;

    isTimeSpanColumn: boolean;

    isStaticValueColumn: boolean;

    isDateColumn: boolean;

    isOperatorDoesNotEqual: boolean;

    selectedColumn: ColumnDefinition;

    columnValue: string[] | number[];

    operatorSelected: string;

    defaultOperatorSelected: string;

    columnSelectionOption: ColumnSelectorOption;

    sourceDataUpdated$ = new Subject<ColumnSelectorOption[]>();

    includeNullValues = false;

    /**
     * constructor
     */
    constructor(@Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) private notificationService: NotificationServiceInterface) {
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit(): void {
        this.sourceDataUpdated$.next(this.sectorRuleBuilderConfig.columns || []);
    }

    /**
     * ngOnChanges
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.columnSectorRule) {
            if (this.columnSectorRule && this.columnSectorRule.columnTag &&
                this.columnSectorRule.comparisonValues && this.columnSectorRule.comparisonType) {
                this.setValuesFromColumnSectorRule();
            } else {
                if (this.columnSelectionOption) {
                    this.columnSelectionOption.isSelected = false;
                    this.columnSelectionOption = null;
                }
                this.unSelectAnySelectionsSelected(this.sectorRuleBuilderConfig.columns);
                this.columnSelected(null);
            }
        }
    }

    /**
     * This method will be called every time column in Column Tree is selected
     */
    onColumnSelection(event: CustomEvent<AuxColumnSelectorSelectionChangedDetailInterface>) {
        if (event && event.detail && event.detail.value[0] && event.detail.value[0].eventData && event.detail.value[0] !== this.columnSelectionOption) {
            this.columnSelectionOption = event.detail.value[0];
            const newColumnSelected = this.columnSelectionOption.eventData as ColumnDefinition;
            if ((this.selectedColumn && this.selectedColumn.dataType !== newColumnSelected.dataType) ||
                newColumnSelected.isStaticColumn || (this.selectedColumn && this.selectedColumn.isStaticColumn)) {
                this.initialColumnValue = [];
            }
            this.columnSelected(event.detail.value[0].eventData as ColumnDefinition);
        }
    }

    /**
     * Initialize Attribute builder component with values in predefined ColumnSectorRule
     * This will be used when existing ColumnSectorRule is updated
     */
    setValuesFromColumnSectorRule(): void {
        this.initialColumnValue = this.columnSectorRule.comparisonValues;
        this.columnSelected(CoreColumnUtils.getColumnDefByTagAndUse(this.columnSectorRule.columnTag, this.columnSectorRule.positionColumnType));
        if (this.sectorRuleBuilderConfig.columns) {
            this.columnSelectionOption = this.findAndSelectColumnSelection(this.selectedColumn, this.sectorRuleBuilderConfig.columns);
        }
        this.includeNullValues = this.columnSectorRule.includeNullValues;
    }

    /**
     * Method to unSelect any pre selected column selection options
     */
    unSelectAnySelectionsSelected(columnSelections: ColumnSelectorOption[]) {
        for (const columnPickListDataInterface of columnSelections) {
            if (columnPickListDataInterface.children) {
                this.unSelectAnySelectionsSelected(columnPickListDataInterface.children as ColumnSelectorOption[]);
            }
            columnPickListDataInterface.isSelected = false;
            columnPickListDataInterface['isExpanded'] = false;
        }
    }

    /**
     * Method to mark column selection as checked and its parents as expanded
     */
    findAndSelectColumnSelection(column: ColumnDefinition, columnSelections: ColumnSelectorOption[]): ColumnSelectorOption {
        let columnSelection: ColumnSelectorOption;
        for (const columnPickListDataInterface of columnSelections) {
            let selectionFound: ColumnSelectorOption;
            columnPickListDataInterface.isSelected = false;
            columnPickListDataInterface['isExpanded'] = false;
            if (columnPickListDataInterface.type === 'group') {
                selectionFound = this.findAndSelectColumnSelection(column, columnPickListDataInterface.children as ColumnSelectorOption[]);
            } else if (columnPickListDataInterface.eventData && (columnPickListDataInterface.eventData as ColumnDefinition).columnTag === column.columnTag) {
                selectionFound = columnPickListDataInterface;
                columnPickListDataInterface.isSelected = true;
            }
            if (selectionFound) {
                columnPickListDataInterface['isExpanded'] = true;
                columnSelection = selectionFound;
            }
        }
        return columnSelection;
    }

    /**
     * Method called to set column value.
     */
    columnSelected(column: ColumnDefinition): void {
        this.selectedColumn = column;
        // Set type of column.
        this.setColumnType();
    }


    /**
     * Method to set column type i.e. isStaticValueColumn, isNumeric or other types
     */
    setColumnType(): void {
        this.isDateColumn = this.isNumericColumn = this.isTimeSpanColumn = this.isStaticValueColumn = false;
        if (!this.selectedColumn) {
            return;
        }
        if (this.selectedColumn.isStaticColumn) {
            this.isStaticValueColumn = true;
            return;
        }
        switch (this.selectedColumn.dataType) {
            case ColumnConstants.COLUMN_DATA_TYPE.DOUBLE:
            case ColumnConstants.COLUMN_DATA_TYPE.INT:
                this.isNumericColumn = true;
                break;
            case ColumnConstants.COLUMN_DATA_TYPE.DATE:
                this.isDateColumn = true;
                break;
            case ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN:
                this.isTimeSpanColumn = true;
                break;
            default:
                this.isDateColumn = this.isNumericColumn = this.isTimeSpanColumn = this.isStaticValueColumn = false;
        }
    }

    /**
     * Method called when operator/comparision type is changed in SectorAttributeRuleOperator component
     */
    onOperatorChange(operatorSelected: {operator: string, isDefault?: boolean}): void {
        this.operatorSelected = operatorSelected ? operatorSelected.operator : null;
        if (operatorSelected && operatorSelected.isDefault) {
            this.defaultOperatorSelected = operatorSelected.operator;
        }
        // if operator is does not equal then we do not want to show the includeNullValues checkbox
        this.isOperatorDoesNotEqual = this.operatorSelected === SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.NOT_EQUAL.displayValue;
        if (this.isOperatorDoesNotEqual) {
            this.includeNullValues = false;
        }
    }


    /**
     * Method is called when column values are updated in column value fields
     */
    onColumnValueUpdate(columnValue: string[] | number[] | string | number): void {
        if (typeof (columnValue) === 'string') {
            this.columnValue = [columnValue];
        } else if (typeof (columnValue) === 'number') {
            this.columnValue = [columnValue];
        } else {
            this.columnValue = columnValue;
        }
    }

    onChangeOfIncludeNullValues(includeNullValues: boolean): void {
        this.includeNullValues = includeNullValues;
    }

    /**
     * Method to validate rule when user is done configuring the rule
     */
    validateRule(): boolean {
        const dialogParam = new ExploreDialogParam(
            AlertConstants.TYPE.ALERT,
            AlertConstants.HEADER.INVALID_ENTRY,
            null,
            AlertConstants.BTN.OK
        );

        if (!this.selectedColumn || !this.selectedColumn.hasOwnProperty('columnTag')) {
            dialogParam.message = AlertConstants.BODY.INVALID_COLUMN;
            this.notificationService?.openDialog(dialogParam);
            return false;
        }

        if (!this.operatorSelected) {
            dialogParam.message = AlertConstants.BODY.INVALID_OPERATION;
            this.notificationService?.openDialog(dialogParam);
            return false;
        }

        if (this.isStaticValueColumn && (!this.columnValue || this.columnValue.length === 0)) {
            dialogParam.message = AlertConstants.BODY.INVALID_SELECT;
            this.notificationService?.openDialog(dialogParam);
            return false;
        }

        if (!this.columnValue || this.columnValue.length === 0) {
            dialogParam.message = AlertConstants.BODY.INVALID_VALUE;
            this.notificationService?.openDialog(dialogParam);
            return false;
        }

        return true;
    }

    /**
     * Get data type of selected column. This data type is used in ColumnSectorRule object.
     */
    getSelectedColumnDataType(): string {
        switch (this.selectedColumn.dataType) {
            case ColumnConstants.COLUMN_DATA_TYPE.DOUBLE:
            case ColumnConstants.COLUMN_DATA_TYPE.INT:
                return ColumnConstants.BREAKDOWN_JSTREE_TYPE.NUMERIC;
            case ColumnConstants.COLUMN_DATA_TYPE.DATE:
                return ColumnConstants.BREAKDOWN_JSTREE_TYPE.DATE;
            case ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN:
                return ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN;
            case ColumnConstants.COLUMN_DATA_TYPE.RATING:
                return ColumnConstants.BREAKDOWN_JSTREE_TYPE.RATING;
            default:
                return ColumnConstants.COLUMN_DATA_TYPE.STRING;
        }
    }

    /**
     * Method to check if user prompt is needed to switch between custom sector types tabs
     */
    shouldDisplayWarningDialogForTabSwitch(): boolean {
        return (!isEmpty(this.columnValue) && this.columnValue[0].toString() !== CoreCommonConstants.EMPTY_STRING) || (!isNil(this.operatorSelected) && this.operatorSelected !== this.defaultOperatorSelected) || !!(this.selectedColumn && this.selectedColumn.columnTag);
    }

    /**
     * Method to update ColumnSectorRule object with values selected and return if ColumnSelectorRule was updated or not
     */
    updateRule(): boolean {
        return ColumnSectorRule.updateRule(this.columnSectorRule, this.selectedColumn, this.operatorSelected,
            this.columnValue, this.getSelectedColumnDataType(), this.includeNullValues);
    }

}
