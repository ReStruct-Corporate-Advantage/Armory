import {AfterViewInit, Component, HostListener, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {isEmpty} from 'lodash';
import {BaseCustomSectorRuleComponent} from '../base-custom-sector-rule.component';
import {ColumnSectorRule} from '../../../models/sector/column-sector/column-sector-rule.model';
import {CustomSectorType} from '../../../enums/custom-sector-type.enum';
import {AuxSelect, AuxSelectFormValue} from '@blk/aladdin-angular-components';
import {ColumnConstants, ColumnDefinition, CoreColumnUtils} from '@blk/explore-ui-core';

@Component({
    selector: 'explore-editable-custom-sector-column-rule',
    templateUrl: './editable-custom-sector-column-rule.component.html',
    styleUrls: ['./editable-custom-sector-column-rule.component.scss']
})
export class EditableCustomSectorColumnRuleComponent extends BaseCustomSectorRuleComponent<ColumnSectorRule> implements OnInit, AfterViewInit{

    @Input()
    ruleCaption: string;

    @Input()
    editableRuleConfig: ColumnDefinition[];

    @ViewChild('auxSelectColumnType', {static: false})
    auxSelectColumnType: AuxSelect;

    columnFilters: {values: {displayValue: string, value: string}[]}[] = [];

    selectedColumn: ColumnDefinition;
    selectedOperator: {operator: string, isDefault?: boolean};
    selectedColumnValues: string[] | number[] | string | number;

    isTextColumn: boolean;
    isStaticValueColumn: boolean;

    initialColumnValue = [];
    initialCol: AuxSelectFormValue;

    /**
     * listener for clicking outside the component
     */
    @HostListener("document:click", ['$event'])
    clickedOut($event) {
        if ($event.target.className != 'aux-select__option-span') {
            this.closeEditing();
        }
    }

    /**
     * if rule is validated then it makes it a single statement
     */
    closeEditing() {
        if (this.validateRule()) {
            this.updateRule();
            this.changeIsEditingRule.emit(false);
        }
    }

    /**
     * @inheritDocs
     */
    onChanges(changes: SimpleChanges) {
        if (changes.ruleCaption) {
            this.updateRuleText();
        }
    }

    ngOnInit() {
        this.columnFilters[0] = {values:[]};

        for (const coldef of this.editableRuleConfig){
            this.columnFilters[0].values.push({displayValue: coldef.title, value: coldef.columnTag});
        }
    }

    ngAfterViewInit() {
        //make initial values either the default or if editing the already set values
        if (this.rule.columnName && this.rule.comparisonValues.length > 0) {
            this.initialCol = {selectedValue: this.rule.columnName}
            this.initialColumnValue = this.rule.comparisonValues;
        } else {
            this.initialCol = {selectedValue: ColumnConstants.PORTFOLIO_NAME_COL_NAME_DEFAULT};
        }
        this.auxSelectColumnType.setValue(this.initialCol);
    }


    /**
     * Updates the display text for this rule.
     */
    public updateRuleText(): void {
        let text: string;

        // Only update the text if there is a rule and it has a column specified.
        if (this.rule?.columnTag && !isEmpty(this.rule.comparisonValues)) {
            text = (this.rule.customSectorType === undefined || this.rule.customSectorType === CustomSectorType.ATTRIBUTES) ? this.rule.getDisplayText() : this.rule.getDisplayTextForFundSectoring();
        }
        else{
            text = this.ruleCaption ? this.ruleCaption : 'Double click to define custom sector';
        }

        this.ruleText = text;
    }

    /**
     * Captures type of filter and updates other filter option
     */
    onColumnTypeChanged(ev?: CustomEvent) {
        this.selectedColumn = ev ? CoreColumnUtils.getColumnDefByTag(ev.detail.value.value): CoreColumnUtils.getColumnDefByTag(ColumnConstants.PORTFOLIO_NAME)
        // Set type of column
        this.setColumnType();
    }

    /**
     * Sets the column type for the column values, making it either a aux select or aux type ahead
     */
    setColumnType(): void {
        this.isTextColumn = this.isStaticValueColumn = false;

        switch (this.selectedColumn.columnTag){
            case ColumnConstants.PORT_NAME_COL_TAG:
            case ColumnConstants.ISSUER_NAME_COL_TAG:
            case ColumnConstants.SEC_DESC_COL_TAG:
            case ColumnConstants.ADL_INFO_COL_TAG:
            case ColumnConstants.PORTFOLIO_NAME:
                this.isTextColumn = true;
                break;
            case ColumnConstants.SEC_GROUP_COL_TAG:
            case ColumnConstants.SEC_TYPE_COL_TAG:
                this.isStaticValueColumn = true;
                break;
        }
    }

    /**
     * Saves operator selected
     */
    onOperatorChanged(operatorSelected: {operator: string}){
        this.selectedOperator = operatorSelected;
    }

    /**
     * Saves column value selected
     */
    onColumnValueChanged(columnValue: string[] | number[] | string | number): void {
        this.selectedColumnValues = columnValue;
    }

    /**
     * Validates rule, returns false if rule is not valid
     */
    validateRule(): boolean {
        if (this.isStaticValueColumn && !this.selectedColumnValues) {
            return false;
        }
        if (!this.selectedOperator) {
            return false;
        }
        return true;
    }

    /**
     * Method to update ColumnSectorRule object with values selected and return if ColumnSelectorRule was updated or not
     */
    updateRule(): boolean {
        return ColumnSectorRule.updateRule(this.rule, this.selectedColumn, this.selectedOperator.operator,
            this.selectedColumnValues, ColumnConstants.COLUMN_DATA_TYPE.STRING);
    }
}
